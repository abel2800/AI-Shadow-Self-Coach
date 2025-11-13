# Training Recipe — AI Shadow-Self Coach
## Model Training & Safety Classifier Specifications

**Version:** 1.0  
**Last Updated:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Model Architecture](#model-architecture)
3. [Persona Fine-Tuning](#persona-fine-tuning)
4. [Safety Classifier Training](#safety-classifier-training)
5. [Intent Classifier Training](#intent-classifier-training)
6. [Response Filter (Hard Constraints)](#response-filter-hard-constraints)
7. [Evaluation & Testing](#evaluation--testing)
8. [Deployment Pipeline](#deployment-pipeline)
9. [Post-MVP: RLHF](#post-mvp-rlhf)

---

## Overview

This document provides detailed instructions for training the AI Shadow-Self Coach models, including:

1. **Main Conversation Model**: Fine-tuned LLM with persona prompt
2. **Safety Classifier**: Real-time risk detection model
3. **Intent Classifier**: Therapeutic intent detection
4. **Response Filter**: Hard-constraint post-processing layer

**Training Goals:**
- Validation rate >90% when user expresses distress
- Safety recall >=0.98 for high-risk content
- Response appropriateness >85% (clinician review)
- Response latency <2 seconds

---

## Model Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│              User Message Input                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Safety Classifier (Real-time)                    │
│         - BERT-base or similar                           │
│         - Binary: safe vs. high-risk                     │
│         - Latency: <100ms                                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    [safe]                  [high-risk]
         │                       │
         ▼                       ▼
┌─────────────────┐   ┌──────────────────────┐
│  Intent         │   │  Emergency Flow      │
│  Classifier     │   │  - Show resources    │
│  (Optional)     │   │  - Escalate          │
└────────┬────────┘   └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         Main Conversation Model                          │
│         - Fine-tuned LLM (GPT-3.5/4 or Llama)           │
│         - Retrieval augmentation (session memory)       │
│         - Persona prompt + context                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Response Filter (Hard Constraints)              │
│         - Remove unsafe suggestions                     │
│         - Guarantee safety prompts when needed          │
│         - Rule-based post-processing                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Assistant Response Output                   │
└─────────────────────────────────────────────────────────┘
```

---

## Persona Fine-Tuning

### Base Model Selection

**MVP Option (Recommended):**
- **Model**: OpenAI GPT-3.5-turbo or GPT-4
- **Method**: Fine-tuning API or prompt engineering
- **Pros**: Fast to implement, high quality, built-in safety
- **Cons**: API costs, data privacy considerations

**Post-MVP Option:**
- **Model**: Llama 2/3 7B or Mistral 7B
- **Method**: Full fine-tuning with LoRA/QLoRA
- **Pros**: Full data privacy, no API costs
- **Cons**: Requires infrastructure, quantization for mobile

### Dataset Preparation

**1. Seed Dialogues (500-1000 examples)**

**Format:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are Ari, a compassionate inner-work coach..."
    },
    {
      "role": "user",
      "content": "I keep thinking I'm a failure."
    },
    {
      "role": "assistant",
      "content": "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time."
    }
  ]
}
```

**Sources:**
- 20 clinician-approved seed dialogues (see `SEED_DIALOGUES.json`)
- Synthetic generation: Use GPT-4 to generate variations
- Clinician review: All dialogues reviewed by licensed therapists

**Quality Criteria:**
- Always starts with validation
- Asks for consent before deeper probing
- Uses reflective questions
- Keeps responses brief (2-4 sentences)
- Includes safety checks when appropriate

**2. Data Augmentation**

**Techniques:**
- Paraphrasing: Generate 3-5 variations of each user message
- Context variation: Vary session types, moods, concerns
- Edge cases: Include ambiguous language, boundary cases

**Example:**
```
Original: "I keep thinking I'm a failure."
Variations:
- "I always feel like I'm not good enough."
- "I can't stop thinking that I'm a failure."
- "I have this recurring thought that I'm a failure."
```

### Fine-Tuning Process

**For OpenAI API (GPT-3.5-turbo):**

**Step 1: Prepare Dataset**
```python
import json

# Convert seed dialogues to OpenAI format
training_data = []
for dialogue in seed_dialogues:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": dialogue["user_message"]},
        {"role": "assistant", "content": dialogue["assistant_message"]}
    ]
    training_data.append({"messages": messages})

# Save as JSONL
with open("training_data.jsonl", "w") as f:
    for item in training_data:
        f.write(json.dumps(item) + "\n")
```

**Step 2: Upload to OpenAI**
```bash
openai api fine_tunes.create \
  -t training_data.jsonl \
  -m gpt-3.5-turbo \
  --n_epochs 3 \
  --learning_rate_multiplier 0.1
```

**Step 3: Monitor Training**
- Track loss curves
- Evaluate on held-out test set (100 examples)
- Measure validation rate, safety, appropriateness

**For Self-Hosted Model (Llama/Mistral):**

**Step 1: Prepare Dataset**
```python
from datasets import Dataset

# Convert to Hugging Face format
dataset = Dataset.from_list(training_data)

# Tokenize
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
tokenizer.pad_token = tokenizer.eos_token

def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=512,
        padding="max_length"
    )

tokenized_dataset = dataset.map(tokenize_function, batched=True)
```

**Step 2: Fine-Tune with LoRA**
```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

# Load model
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-chat-hf",
    load_in_8bit=True  # For memory efficiency
)

# LoRA configuration
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj"]
)

model = get_peft_model(model, lora_config)

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_steps=500
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset
)

# Train
trainer.train()
```

**Step 3: Evaluate**
```python
# Evaluate on test set
test_results = trainer.evaluate(eval_dataset=test_dataset)
print(f"Validation loss: {test_results['eval_loss']}")
```

### System Prompt

**Core System Prompt:**
```
You are "Ari", a compassionate, non-judgmental inner-work coach. Your job is to help users gently explore recurring negative beliefs and emotional patterns.

Core Principles:
1. Always begin with validation before probing deeper
2. Ask for consent before deeper exploration ("Are you ready to look at this together?")
3. Keep responses brief (2-4 sentences) unless user asks for longer reflection
4. Use reflective questions rather than direct advice
5. Offer one practical experiment at the end of a deep session
6. Avoid medical or legal advice

Safety Protocol:
- If user mentions self-harm or suicide, immediately:
  1. Acknowledge with compassion
  2. Ask about immediate safety
  3. Provide crisis resources
  4. Follow emergency escalation flow

Tone Guidelines:
- Compassionate and gentle
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validate feelings first

Example Response Style:
User: "I keep thinking I'm a failure."
Ari: "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time."
```

**Context Injection:**
- Session type (check-in, gentle_deep, micro_practice)
- User preferences (session length, tone)
- Prior session summary (if applicable)
- Current step in structured flow (for gentle_deep sessions)

---

## Safety Classifier Training

### Model Selection

**Recommended:**
- **Model**: BERT-base-uncased or DistilBERT
- **Size**: ~110M parameters (BERT) or ~66M (DistilBERT)
- **Latency Target**: <100ms per inference
- **Deployment**: On-device (quantized) or server-side

### Dataset Preparation

**1. High-Risk Examples (500+ examples)**

**Sources:**
- Public datasets: Mental health Reddit posts (with proper attribution)
- Clinician-authored examples
- Synthetic generation (reviewed by clinicians)

**Label Schema:**
```json
{
  "text": "I want to kill myself.",
  "risk_level": "high",
  "category": "suicidal_ideation",
  "urgency": "immediate"
}
```

**Categories:**
- `suicidal_ideation`: Explicit or implicit suicide thoughts
- `self_harm`: Self-injury intentions
- `harm_to_others`: Threats to others
- `crisis`: Mental health crisis requiring immediate support

**2. Safe Examples (2000+ examples)**

**Sources:**
- Normal user messages from seed dialogues
- General conversation examples
- Edge cases (ambiguous language that should be safe)

**3. Balanced Dataset**

**Distribution:**
- High-risk: 20% (500 examples)
- Medium-risk: 10% (250 examples)
- Low-risk: 20% (500 examples)
- None: 50% (1250 examples)

**Total: 2500 examples**

### Training Process

**Step 1: Prepare Dataset**
```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from datasets import Dataset

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Prepare data
def prepare_data(examples):
    texts = examples["text"]
    labels = examples["risk_level"]  # "none", "low", "medium", "high"
    
    # Convert to numeric labels
    label_map = {"none": 0, "low": 1, "medium": 2, "high": 3}
    numeric_labels = [label_map[l] for l in labels]
    
    # Tokenize
    encoded = tokenizer(
        texts,
        truncation=True,
        padding="max_length",
        max_length=128
    )
    
    encoded["labels"] = numeric_labels
    return encoded

dataset = Dataset.from_list(training_data)
tokenized_dataset = dataset.map(prepare_data, batched=True)
```

**Step 2: Train Model**
```python
from transformers import TrainingArguments, Trainer

# Load model
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=4  # none, low, medium, high
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./safety_classifier",
    num_train_epochs=5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01,
    logging_steps=50,
    eval_steps=100,
    save_steps=500
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"]
)

# Train
trainer.train()
```

**Step 3: Optimize for Recall**

**Goal: Recall >=0.98 for high-risk content**

```python
from sklearn.metrics import precision_recall_fscore_support

# Evaluate on test set
predictions = trainer.predict(test_dataset)
y_true = predictions.label_ids
y_pred = predictions.predictions.argmax(axis=1)

# Calculate metrics
precision, recall, f1, _ = precision_recall_fscore_support(
    y_true, y_pred, average=None
)

# Focus on high-risk recall
high_risk_recall = recall[3]  # Index 3 = "high"
print(f"High-risk recall: {high_risk_recall}")

# If recall < 0.98, adjust threshold or retrain
```

**Step 4: Quantization (for mobile deployment)**

```python
from transformers import AutoModelForSequenceClassification
import torch

# Load trained model
model = AutoModelForSequenceClassification.from_pretrained(
    "./safety_classifier"
)

# Quantize
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# Save
torch.save(quantized_model.state_dict(), "./safety_classifier_quantized.pt")
```

---

## Intent Classifier Training

### Purpose

Classify therapeutic intents in assistant responses for:
- Analytics and insights
- Response routing
- Quality monitoring

### Intent Labels

```python
INTENTS = [
    "validate",
    "probe_story",
    "probe_root",
    "reframe",
    "suggest_experiment",
    "offer_mindfulness",
    "safety_check",
    "emergency",
    "close",
    "other"
]
```

### Training Process

**Similar to Safety Classifier:**
1. Prepare labeled dataset (1000+ examples)
2. Fine-tune BERT-base or DistilBERT
3. Evaluate on test set (target: >85% accuracy)
4. Deploy for real-time classification

**Note:** Intent classification can be done post-generation (on assistant responses) rather than pre-generation, reducing latency.

---

## Response Filter (Hard Constraints)

### Purpose

Post-process LLM outputs to:
- Remove unsafe suggestions
- Guarantee safety prompts when needed
- Enforce persona consistency

### Implementation

**Rule-Based Filter:**

```python
class ResponseFilter:
    def __init__(self):
        self.unsafe_patterns = [
            r"you should (kill|hurt|harm)",
            r"you need to (die|end it)",
            r"medical advice:",
            r"legal advice:",
            r"you have (depression|anxiety|bipolar)",
        ]
        
        self.required_phrases = {
            "high_risk": [
                "I'm concerned about your safety",
                "Are you safe right now?",
                "crisis resources"
            ]
        }
    
    def filter(self, response_text, risk_level, intent):
        # Remove unsafe patterns
        for pattern in self.unsafe_patterns:
            if re.search(pattern, response_text, re.IGNORECASE):
                return self._replace_unsafe(response_text)
        
        # Add required phrases for high-risk
        if risk_level == "high":
            if not any(phrase in response_text for phrase in self.required_phrases["high_risk"]):
                return self._add_safety_prompt(response_text)
        
        # Enforce persona consistency
        if not self._has_validation(response_text, intent):
            response_text = self._add_validation(response_text)
        
        return response_text
    
    def _replace_unsafe(self, text):
        return "I can't provide advice on that. Would you like to explore what's underneath that feeling instead?"
    
    def _add_safety_prompt(self, text):
        safety_prompt = "\n\nI'm concerned about your safety. Are you safe right now? If you're in crisis, please contact 988 or text HOME to 741741."
        return text + safety_prompt
    
    def _has_validation(self, text, intent):
        if intent in ["validate", "probe_story", "probe_root"]:
            validation_phrases = [
                "it's okay",
                "that sounds",
                "I'm sorry",
                "that must feel"
            ]
            return any(phrase in text.lower() for phrase in validation_phrases)
        return True
    
    def _add_validation(self, text):
        return "That sounds difficult — it's okay to feel that way. " + text
```

**Integration:**

```python
# In conversation service
def generate_response(user_message, session_context):
    # 1. Check safety
    risk_level = safety_classifier.predict(user_message)
    
    if risk_level == "high":
        return emergency_response()
    
    # 2. Generate response
    assistant_message = conversation_model.generate(
        user_message,
        context=session_context
    )
    
    # 3. Classify intent
    intent = intent_classifier.predict(assistant_message)
    
    # 4. Filter response
    filtered_message = response_filter.filter(
        assistant_message,
        risk_level,
        intent
    )
    
    return {
        "text": filtered_message,
        "intent": intent,
        "risk_level": risk_level
    }
```

---

## Evaluation & Testing

### Evaluation Metrics

**1. Validation Rate**
- **Definition**: % of assistant replies that contain explicit validation when user expresses distress
- **Target**: >90%
- **Measurement**: Manual review of 100 sessions with negative sentiment

```python
def calculate_validation_rate(sessions):
    validation_count = 0
    total_distress_responses = 0
    
    for session in sessions:
        for msg in session.messages:
            if msg.role == "user" and msg.sentiment == "negative":
                total_distress_responses += 1
                next_assistant = get_next_assistant_message(msg)
                if has_validation(next_assistant):
                    validation_count += 1
    
    return validation_count / total_distress_responses
```

**2. Safety Recall**
- **Definition**: Recall for suicidal/self-harm content detection
- **Target**: >=0.98
- **Measurement**: Test set of 200 high-risk examples (clinician-verified)

```python
from sklearn.metrics import recall_score

def evaluate_safety_recall(test_set):
    y_true = [example["risk_level"] for example in test_set]
    y_pred = [safety_classifier.predict(example["text"]) for example in test_set]
    
    # Binary: high-risk vs. not high-risk
    y_true_binary = [1 if r == "high" else 0 for r in y_true]
    y_pred_binary = [1 if r == "high" else 0 for r in y_pred]
    
    recall = recall_score(y_true_binary, y_pred_binary)
    return recall
```

**3. Response Appropriateness**
- **Definition**: Clinician review of response appropriateness
- **Target**: >85% rated as "appropriate" or "excellent"
- **Measurement**: Monthly review of 50 random sessions

**4. Response Latency**
- **Definition**: Time from user message to assistant response
- **Target**: <2 seconds (p95)
- **Measurement**: API monitoring

### Test Sets

**1. Safety Test Set (200 examples)**
- 100 high-risk examples (suicidal ideation, self-harm)
- 50 medium-risk examples
- 50 edge cases (ambiguous language)

**2. Persona Test Set (100 examples)**
- Various user concerns (anxiety, self-worth, relationships, etc.)
- Check validation rate, tone consistency, appropriateness

**3. Edge Case Test Set (50 examples)**
- Boundary cases (medical questions, legal advice requests)
- Off-topic conversations
- Very short/long messages

---

## Deployment Pipeline

### Pre-Deployment Checklist

- [ ] All models evaluated on test sets
- [ ] Safety recall >=0.98
- [ ] Validation rate >90%
- [ ] Response latency <2s (p95)
- [ ] Response filter tested on edge cases
- [ ] Clinician review of 50 sample sessions
- [ ] A/B testing framework set up

### Deployment Steps

**1. Staging Deployment**
- Deploy models to staging environment
- Run smoke tests
- Monitor metrics for 24 hours

**2. Canary Release**
- Deploy to 5% of users
- Monitor safety metrics closely
- Collect user feedback

**3. Gradual Rollout**
- Increase to 25%, 50%, 100%
- Monitor at each stage
- Rollback if metrics degrade

### Monitoring

**Key Metrics:**
- Safety escalation rate
- False positive rate (high-risk detection)
- User satisfaction scores
- Response latency (p50, p95, p99)
- Model inference errors

**Alerts:**
- Safety recall drops below 0.95
- Response latency >3s (p95)
- Model errors >1%

---

## Post-MVP: RLHF

### Reinforcement Learning from Human Feedback

**Purpose:** Refine model responses based on human preferences

**Process:**

**1. Collect Human Feedback**
- Post-session ratings (1-5 stars)
- Clinician reviews
- User feedback on specific responses

**2. Train Reward Model**
```python
# Reward model predicts human preference
reward_model = train_reward_model(
    responses=labeled_responses,
    preferences=human_preferences
)
```

**3. Fine-Tune with PPO**
```python
from trl import PPOTrainer

ppo_trainer = PPOTrainer(
    model=conversation_model,
    ref_model=reference_model,
    tokenizer=tokenizer,
    reward_model=reward_model
)

# Train
ppo_trainer.train()
```

**4. Evaluate**
- Compare RLHF model vs. baseline
- Measure improvement in user satisfaction
- Ensure safety metrics don't degrade

---

## Appendix: Training Scripts

### Complete Training Pipeline

See `scripts/train_persona_model.py`, `scripts/train_safety_classifier.py`, and `scripts/evaluate_models.py` for complete implementation examples.

---

**End of Training Recipe Document**

