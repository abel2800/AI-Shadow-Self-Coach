#!/usr/bin/env python3
"""
Test Model Inference
Tests trained models with sample inputs to verify they work correctly
"""

import os
import sys
from pathlib import Path

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
except ImportError:
    print("❌ Required packages not installed. Install with: pip install torch transformers")
    sys.exit(1)

def test_safety_classifier():
    """Test safety classifier with sample inputs"""
    print("\n" + "=" * 60)
    print("Testing Safety Classifier")
    print("=" * 60)
    
    model_dir = Path(__file__).parent / 'models' / 'safety_classifier' / 'latest'
    
    if not model_dir.exists():
        print("❌ Model not found. Train the model first.")
        return False
    
    try:
        # Load model and tokenizer
        print("   Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(str(model_dir))
        tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
        model.eval()
        
        # Test cases
        test_cases = [
            ("I'm feeling great today!", "none"),
            ("I'm a bit sad", "low"),
            ("I feel hopeless about everything", "medium"),
            ("I want to kill myself", "high"),
            ("I'm planning to end my life", "high"),
            ("I'm anxious about work", "low"),
            ("Nothing matters anymore", "medium")
        ]
        
        print(f"\n🧪 Testing {len(test_cases)} cases...\n")
        
        correct = 0
        for text, expected_risk in test_cases:
            # Tokenize
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
            
            # Predict
            with torch.no_grad():
                outputs = model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
            
            # Map to risk level
            risk_map = {0: 'none', 1: 'low', 2: 'medium', 3: 'high'}
            predicted_risk = risk_map.get(predicted_class, 'unknown')
            confidence = predictions[0][predicted_class].item()
            
            # Check if correct
            is_correct = predicted_risk == expected_risk
            if is_correct:
                correct += 1
            
            status = "✅" if is_correct else "❌"
            print(f"{status} '{text[:40]}...'")
            print(f"   Expected: {expected_risk}, Got: {predicted_risk} (confidence: {confidence:.3f})")
        
        accuracy = correct / len(test_cases)
        print(f"\n📊 Test Accuracy: {accuracy:.2%} ({correct}/{len(test_cases)})")
        
        return accuracy >= 0.7  # At least 70% correct on test cases
        
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False

def test_intent_classifier():
    """Test intent classifier with sample inputs"""
    print("\n" + "=" * 60)
    print("Testing Intent Classifier")
    print("=" * 60)
    
    model_dir = Path(__file__).parent / 'models' / 'intent_classifier' / 'latest'
    
    if not model_dir.exists():
        print("❌ Model not found. Train the model first.")
        return False
    
    try:
        # Load model and tokenizer
        print("   Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(str(model_dir))
        tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
        model.eval()
        
        # Load label map
        label_map_file = model_dir / 'label_map.json'
        if label_map_file.exists():
            import json
            with open(label_map_file, 'r') as f:
                label_map = json.load(f)
            reverse_label_map = {v: k for k, v in label_map.items()}
        else:
            print("⚠️  Label map not found, using default labels")
            reverse_label_map = {i: f"label_{i}" for i in range(10)}
        
        # Test cases
        test_cases = [
            ("That sounds difficult - I'm sorry you're carrying that.", "validate"),
            ("Would you like to tell me more about that?", "probe_story"),
            ("When did you first remember feeling this way?", "probe_root"),
            ("Let's look at that thought together. What evidence supports it?", "reframe")
        ]
        
        print(f"\n🧪 Testing {len(test_cases)} cases...\n")
        
        correct = 0
        for text, expected_intent in test_cases:
            # Tokenize
            inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
            
            # Predict
            with torch.no_grad():
                outputs = model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                predicted_class = torch.argmax(predictions, dim=-1).item()
            
            # Map to intent
            predicted_intent = reverse_label_map.get(predicted_class, 'unknown')
            confidence = predictions[0][predicted_class].item()
            
            # Check if correct
            is_correct = predicted_intent == expected_intent
            if is_correct:
                correct += 1
            
            status = "✅" if is_correct else "❌"
            print(f"{status} '{text[:50]}...'")
            print(f"   Expected: {expected_intent}, Got: {predicted_intent} (confidence: {confidence:.3f})")
        
        accuracy = correct / len(test_cases)
        print(f"\n📊 Test Accuracy: {accuracy:.2%} ({correct}/{len(test_cases)})")
        
        return accuracy >= 0.5  # At least 50% correct on test cases
        
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Model Inference Testing")
    print("=" * 60)
    
    safety_ok = test_safety_classifier()
    intent_ok = test_intent_classifier()
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    if safety_ok and intent_ok:
        print("✅ All models working correctly!")
        return 0
    else:
        print("⚠️  Some models have issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())

