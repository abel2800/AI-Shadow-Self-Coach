"""
Model Evaluation Script
Evaluate all models on test sets
"""

import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from utils.evaluation import (
    calculate_validation_rate,
    calculate_safety_recall,
    evaluate_model,
    print_evaluation_report
)

# Model paths
SAFETY_CLASSIFIER_PATH = "./models/safety_classifier"
INTENT_CLASSIFIER_PATH = "./models/intent_classifier"

def load_test_data():
    """Load test data"""
    # TODO: Load from test_sets directory
    # For now, use seed dialogues as example
    with open('../SEED_DIALOGUES.json', 'r') as f:
        data = json.load(f)
    return data.get('dialogues', [])

def evaluate_safety_classifier():
    """Evaluate safety classifier"""
    print("\n" + "=" * 50)
    print("Safety Classifier Evaluation")
    print("=" * 50)
    
    if not os.path.exists(SAFETY_CLASSIFIER_PATH):
        print("❌ Safety classifier model not found")
        return
    
    # Load model
    tokenizer = AutoTokenizer.from_pretrained(SAFETY_CLASSIFIER_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(SAFETY_CLASSIFIER_PATH)
    
    # Load test data
    test_data = load_test_data()
    
    # Evaluate
    y_true = []
    y_pred = []
    
    for dialogue in test_data:
        for message in dialogue.get('messages', []):
            if message.get('role') == 'user':
                true_risk = message.get('risk_level', 'none')
                y_true.append(true_risk)
                
                # Predict
                inputs = tokenizer(message['text'], return_tensors='pt', truncation=True, max_length=128)
                with torch.no_grad():
                    outputs = model(**inputs)
                    predicted_label = torch.argmax(outputs.logits, dim=1).item()
                    risk_levels = ['none', 'low', 'medium', 'high']
                    y_pred.append(risk_levels[predicted_label])
    
    # Calculate metrics
    high_risk_recall = calculate_safety_recall(y_true, y_pred, 'high')
    print(f"\nHigh-risk recall: {high_risk_recall:.4f}")
    
    if high_risk_recall >= 0.98:
        print("✅ Target recall met (>= 0.98)")
    else:
        print(f"⚠️  Target recall not met (need >= 0.98, got {high_risk_recall:.4f})")
    
    return high_risk_recall

def evaluate_intent_classifier():
    """Evaluate intent classifier"""
    print("\n" + "=" * 50)
    print("Intent Classifier Evaluation")
    print("=" * 50)
    
    if not os.path.exists(INTENT_CLASSIFIER_PATH):
        print("❌ Intent classifier model not found")
        return
    
    # Load model and label map
    tokenizer = AutoTokenizer.from_pretrained(INTENT_CLASSIFIER_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(INTENT_CLASSIFIER_PATH)
    
    with open(f"{INTENT_CLASSIFIER_PATH}/label_map.json", 'r') as f:
        label_map = json.load(f)
    reverse_label_map = {v: k for k, v in label_map.items()}
    
    # Load test data
    test_data = load_test_data()
    
    # Evaluate
    y_true = []
    y_pred = []
    
    for dialogue in test_data:
        for message in dialogue.get('messages', []):
            if message.get('role') == 'assistant':
                true_intent = message.get('intent', 'other')
                y_true.append(true_intent)
                
                # Predict
                inputs = tokenizer(message['text'], return_tensors='pt', truncation=True, max_length=128)
                with torch.no_grad():
                    outputs = model(**inputs)
                    predicted_label = torch.argmax(outputs.logits, dim=1).item()
                    y_pred.append(reverse_label_map[predicted_label])
    
    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    print(f"\nAccuracy: {accuracy:.4f}")
    
    if accuracy >= 0.85:
        print("✅ Target accuracy met (>= 0.85)")
    else:
        print(f"⚠️  Target accuracy not met (need >= 0.85, got {accuracy:.4f})")
    
    print_evaluation_report(y_true, y_pred)
    
    return accuracy

def evaluate_validation_rate():
    """Evaluate validation rate"""
    print("\n" + "=" * 50)
    print("Validation Rate Evaluation")
    print("=" * 50)
    
    test_data = load_test_data()
    
    predictions = []
    sentiments = []
    
    for dialogue in test_data:
        for message in dialogue.get('messages', []):
            if message.get('role') == 'assistant':
                predictions.append(message['text'])
            elif message.get('role') == 'user':
                sentiments.append(message.get('sentiment', 'neutral'))
    
    validation_rate = calculate_validation_rate(predictions, None, sentiments)
    print(f"\nValidation rate: {validation_rate:.4f}")
    
    if validation_rate >= 0.90:
        print("✅ Target validation rate met (>= 0.90)")
    else:
        print(f"⚠️  Target validation rate not met (need >= 0.90, got {validation_rate:.4f})")
    
    return validation_rate

def main():
    """Run all evaluations"""
    print("=" * 50)
    print("Model Evaluation")
    print("=" * 50)
    
    results = {}
    
    # Evaluate safety classifier
    results['safety_recall'] = evaluate_safety_classifier()
    
    # Evaluate intent classifier
    results['intent_accuracy'] = evaluate_intent_classifier()
    
    # Evaluate validation rate
    results['validation_rate'] = evaluate_validation_rate()
    
    # Summary
    print("\n" + "=" * 50)
    print("Evaluation Summary")
    print("=" * 50)
    print(f"Safety Recall: {results.get('safety_recall', 0):.4f} (target: >= 0.98)")
    print(f"Intent Accuracy: {results.get('intent_accuracy', 0):.4f} (target: >= 0.85)")
    print(f"Validation Rate: {results.get('validation_rate', 0):.4f} (target: >= 0.90)")
    
    # Save results
    with open('evaluation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n✅ Evaluation complete! Results saved to evaluation_results.json")

if __name__ == "__main__":
    main()

