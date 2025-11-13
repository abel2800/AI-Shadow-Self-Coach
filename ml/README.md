# ML Training Pipeline
## AI Shadow-Self Coach Model Training

**Status:** Setup Ready

---

## Setup

### 1. Create Virtual Environment

```bash
cd ml
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Training Scripts

### 1. Persona Model Fine-tuning
- `train_persona_model.py` - Fine-tune LLM with Ari persona
- Uses seed dialogues from `../SEED_DIALOGUES.json`

### 2. Safety Classifier Training
- `train_safety_classifier.py` - Train BERT-based safety classifier
- Target: 98%+ recall for high-risk content

### 3. Intent Classifier Training
- `train_intent_classifier.py` - Classify therapeutic intents
- Labels: validate, probe_story, probe_root, reframe, etc.

### 4. Model Evaluation
- `evaluate_models.py` - Evaluate all models on test sets
- Metrics: validation rate, safety recall, appropriateness

---

## Data

- **Seed Dialogues:** `../SEED_DIALOGUES.json` (20 examples)
- **Training Data:** `data/labeled_data/` (to be expanded to 500+)
- **Test Sets:** `data/test_sets/`

---

## Models

- **Persona Model:** Fine-tuned GPT-3.5-turbo or Llama 2/3
- **Safety Classifier:** BERT-base or DistilBERT
- **Intent Classifier:** BERT-base or DistilBERT

---

## Next Steps

1. Expand seed dialogues to 500+ examples
2. Create data preprocessing pipeline
3. Train safety classifier
4. Fine-tune persona model
5. Evaluate models

---

**Ready for training!** 🚀

