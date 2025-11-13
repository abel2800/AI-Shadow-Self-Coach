"""
Model Evaluation Utilities
Evaluate models on test sets
"""

from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix,
    classification_report
)
import numpy as np

def calculate_validation_rate(predictions, labels, sentiment_labels):
    """
    Calculate validation rate: % of assistant replies with validation
    when user expresses distress (negative sentiment)
    """
    validation_keywords = [
        "it's okay",
        "that sounds",
        "i'm sorry",
        "that must feel",
        "i hear you",
        "thank you for sharing"
    ]
    
    distress_indices = [i for i, s in enumerate(sentiment_labels) 
                       if s in ['negative', 'very_negative']]
    
    if len(distress_indices) == 0:
        return 0.0
    
    validated_count = 0
    for idx in distress_indices:
        response = predictions[idx].lower()
        if any(keyword in response for keyword in validation_keywords):
            validated_count += 1
    
    return validated_count / len(distress_indices)

def calculate_safety_recall(y_true, y_pred, risk_level='high'):
    """
    Calculate recall for specific risk level
    Target: 98%+ recall for high-risk content
    """
    # Convert to binary: risk_level vs. not risk_level
    y_true_binary = [1 if r == risk_level else 0 for r in y_true]
    y_pred_binary = [1 if r == risk_level else 0 for r in y_pred]
    
    # Calculate recall
    true_positives = sum(1 for t, p in zip(y_true_binary, y_pred_binary) if t == 1 and p == 1)
    false_negatives = sum(1 for t, p in zip(y_true_binary, y_pred_binary) if t == 1 and p == 0)
    
    if true_positives + false_negatives == 0:
        return 0.0
    
    recall = true_positives / (true_positives + false_negatives)
    return recall

def evaluate_model(y_true, y_pred, labels=None):
    """Comprehensive model evaluation"""
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average=None, labels=labels
    )
    
    results = {
        'accuracy': accuracy,
        'precision': precision.tolist() if isinstance(precision, np.ndarray) else precision,
        'recall': recall.tolist() if isinstance(recall, np.ndarray) else recall,
        'f1': f1.tolist() if isinstance(f1, np.ndarray) else f1,
    }
    
    # Add confusion matrix
    if labels:
        cm = confusion_matrix(y_true, y_pred, labels=labels)
        results['confusion_matrix'] = cm.tolist()
    
    return results

def print_evaluation_report(y_true, y_pred, target_names=None):
    """Print detailed evaluation report"""
    print("\n" + "=" * 50)
    print("Model Evaluation Report")
    print("=" * 50)
    
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=target_names))
    
    results = evaluate_model(y_true, y_pred)
    print(f"\nAccuracy: {results['accuracy']:.4f}")
    print(f"Precision: {results['precision']}")
    print(f"Recall: {results['recall']}")
    print(f"F1 Score: {results['f1']}")

if __name__ == "__main__":
    # Example usage
    y_true = ['none', 'low', 'high', 'none', 'high']
    y_pred = ['none', 'low', 'high', 'low', 'high']
    
    recall = calculate_safety_recall(y_true, y_pred, 'high')
    print(f"High-risk recall: {recall:.4f}")

