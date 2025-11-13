"""
Safety Classifier Training Script
Trains BERT-based model to detect high-risk content
Target: 98%+ recall for suicidal/self-harm content
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
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
import pandas as pd
from datasets import Dataset

# Configuration
MODEL_NAME = "bert-base-uncased"
OUTPUT_DIR = "./models/safety_classifier"
BATCH_SIZE = 16
LEARNING_RATE = 2e-5
NUM_EPOCHS = 5
TARGET_RECALL = 0.98

def load_training_data():
    """Load and prepare training data"""
    # Load seed dialogues
    with open('../SEED_DIALOGUES.json', 'r') as f:
        seed_data = json.load(f)
    
    # Extract messages and labels
    examples = []
    for dialogue in seed_data.get('dialogues', []):
        for message in dialogue.get('messages', []):
            if message.get('role') == 'user':
                examples.append({
                    'text': message['text'],
                    'risk_level': message.get('risk_level', 'none'),
                })
    
    # Add high-risk examples (synthetic or from datasets)
    # TODO: Add more high-risk examples to reach 500+ total
    
    return examples

def prepare_dataset(examples):
    """Prepare dataset for training"""
    # Convert to DataFrame
    df = pd.DataFrame(examples)
    
    # Map risk levels to numeric labels
    label_map = {'none': 0, 'low': 1, 'medium': 2, 'high': 3}
    df['label'] = df['risk_level'].map(label_map)
    
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
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average=None
    )
    accuracy = accuracy_score(labels, predictions)
    
    # Focus on high-risk recall (label 3)
    high_risk_recall = recall[3] if len(recall) > 3 else 0
    
    return {
        'accuracy': accuracy,
        'precision': precision.tolist(),
        'recall': recall.tolist(),
        'f1': f1.tolist(),
        'high_risk_recall': high_risk_recall,
    }

def train():
    """Train safety classifier"""
    print("🔄 Loading training data...")
    examples = load_training_data()
    print(f"✅ Loaded {len(examples)} examples")
    
    print("🔄 Preparing dataset...")
    train_dataset, test_dataset, label_map = prepare_dataset(examples)
    
    print("🔄 Loading model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=4  # none, low, medium, high
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
        metric_for_best_model="high_risk_recall",
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
    
    # Check if target recall is met
    high_risk_recall = results.get('eval_high_risk_recall', 0)
    if high_risk_recall >= TARGET_RECALL:
        print(f"✅ Target recall met: {high_risk_recall:.4f} >= {TARGET_RECALL}")
    else:
        print(f"⚠️  Target recall not met: {high_risk_recall:.4f} < {TARGET_RECALL}")
        print("Consider: more training data, different model, or threshold adjustment")
    
    print("💾 Saving model...")
    trainer.save_model()
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    print("✅ Training complete!")

if __name__ == "__main__":
    train()

