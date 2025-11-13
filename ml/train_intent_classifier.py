"""
Intent Classifier Training Script
Trains BERT-based model to classify therapeutic intents
"""

import os
import json
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import pandas as pd
from datasets import Dataset

# Configuration
MODEL_NAME = "bert-base-uncased"
OUTPUT_DIR = "./models/intent_classifier"
BATCH_SIZE = 16
LEARNING_RATE = 2e-5
NUM_EPOCHS = 5

INTENT_LABELS = [
    'validate',
    'probe_story',
    'probe_root',
    'reframe',
    'suggest_experiment',
    'offer_mindfulness',
    'safety_check',
    'emergency',
    'close',
    'other'
]

def load_training_data():
    """Load and prepare training data"""
    with open('../SEED_DIALOGUES.json', 'r') as f:
        seed_data = json.load(f)
    
    examples = []
    for dialogue in seed_data.get('dialogues', []):
        for message in dialogue.get('messages', []):
            if message.get('role') == 'assistant':
                examples.append({
                    'text': message['text'],
                    'intent': message.get('intent', 'other'),
                })
    
    return examples

def prepare_dataset(examples):
    """Prepare dataset for training"""
    df = pd.DataFrame(examples)
    
    # Map intents to numeric labels
    label_map = {label: idx for idx, label in enumerate(INTENT_LABELS)}
    df['label'] = df['intent'].map(label_map)
    
    # Split train/test
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)
    
    # Tokenize
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            truncation=True,
            padding='max_length',
            max_length=128
        )
    
    train_dataset = Dataset.from_pandas(train_df)
    test_dataset = Dataset.from_pandas(test_df)
    
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    test_dataset = test_dataset.map(tokenize_function, batched=True)
    
    return train_dataset, test_dataset, label_map

def compute_metrics(eval_pred):
    """Compute evaluation metrics"""
    predictions, labels = eval_pred
    predictions = predictions.argmax(axis=1)
    
    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='weighted'
    )
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
    }

def train():
    """Train intent classifier"""
    print("🔄 Loading training data...")
    examples = load_training_data()
    print(f"✅ Loaded {len(examples)} examples")
    
    print("🔄 Preparing dataset...")
    train_dataset, test_dataset, label_map = prepare_dataset(examples)
    
    print("🔄 Loading model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(INTENT_LABELS)
    )
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    print("🔄 Setting up training...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        weight_decay=0.01,
        logging_steps=50,
        eval_steps=100,
        save_steps=500,
        evaluation_strategy="steps",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
    )
    
    print("🚀 Starting training...")
    trainer.train()
    
    print("📊 Evaluating...")
    results = trainer.evaluate()
    print(f"Results: {results}")
    
    print("💾 Saving model...")
    trainer.save_model()
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    # Save label map
    with open(f"{OUTPUT_DIR}/label_map.json", 'w') as f:
        json.dump(label_map, f, indent=2)
    
    print("✅ Training complete!")

if __name__ == "__main__":
    train()

