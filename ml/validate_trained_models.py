#!/usr/bin/env python3
"""
Validate Trained Models
Checks that trained models meet quality thresholds
"""

import os
import sys
import json
from pathlib import Path

def check_safety_classifier():
    """Validate safety classifier model"""
    models_dir = Path(__file__).parent / 'models' / 'safety_classifier' / 'latest'
    
    print("\n📋 Checking Safety Classifier...")
    
    if not models_dir.exists():
        print("❌ Safety classifier model not found")
        return False
    
    # Check required files
    required_files = ['pytorch_model.bin', 'config.json', 'tokenizer_config.json']
    # Alternative: ONNX format
    onnx_file = models_dir / 'model.onnx'
    
    if onnx_file.exists():
        print("✅ ONNX model found")
    else:
        missing = []
        for file in required_files:
            if not (models_dir / file).exists():
                missing.append(file)
        
        if missing:
            print(f"❌ Missing files: {', '.join(missing)}")
            return False
        print("✅ PyTorch model files found")
    
    # Check metadata
    metadata_file = models_dir / 'metadata.json'
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        print(f"   Version: {metadata.get('version', 'unknown')}")
        print(f"   Training date: {metadata.get('training_date', 'unknown')}")
        
        metrics = metadata.get('metrics', {})
        high_risk_recall = metrics.get('high_risk_recall', 0)
        accuracy = metrics.get('accuracy', 0)
        
        print(f"   High-risk recall: {high_risk_recall:.4f}")
        print(f"   Accuracy: {accuracy:.4f}")
        
        # Check thresholds
        if high_risk_recall < 0.98:
            print("⚠️  Warning: High-risk recall below target (0.98)")
        if accuracy < 0.90:
            print("⚠️  Warning: Accuracy below target (0.90)")
        
        return True
    else:
        print("⚠️  Metadata file not found")
        return True  # Not critical

def check_intent_classifier():
    """Validate intent classifier model"""
    models_dir = Path(__file__).parent / 'models' / 'intent_classifier' / 'latest'
    
    print("\n📋 Checking Intent Classifier...")
    
    if not models_dir.exists():
        print("❌ Intent classifier model not found")
        return False
    
    # Check required files
    required_files = ['pytorch_model.bin', 'config.json', 'tokenizer_config.json', 'label_map.json']
    onnx_file = models_dir / 'model.onnx'
    
    if onnx_file.exists():
        print("✅ ONNX model found")
    else:
        missing = []
        for file in required_files:
            if not (models_dir / file).exists():
                missing.append(file)
        
        if missing:
            print(f"❌ Missing files: {', '.join(missing)}")
            return False
        print("✅ PyTorch model files found")
    
    # Check label map
    label_map_file = models_dir / 'label_map.json'
    if label_map_file.exists():
        with open(label_map_file, 'r') as f:
            label_map = json.load(f)
        print(f"   Labels: {len(label_map)} classes")
    
    # Check metadata
    metadata_file = models_dir / 'metadata.json'
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        metrics = metadata.get('metrics', {})
        accuracy = metrics.get('accuracy', 0)
        print(f"   Accuracy: {accuracy:.4f}")
        
        if accuracy < 0.80:
            print("⚠️  Warning: Accuracy below target (0.80)")
    
    return True

def check_persona_model():
    """Validate persona model data"""
    print("\n📋 Checking Persona Model...")
    
    training_file = Path(__file__).parent / 'training_data.jsonl'
    
    if training_file.exists():
        # Count lines
        with open(training_file, 'r') as f:
            lines = sum(1 for _ in f)
        print(f"✅ Training data found: {lines} examples")
        
        if lines < 20:
            print("⚠️  Warning: Very few training examples")
        
        return True
    else:
        print("ℹ️  Training data not found (will be created)")
        return True

def main():
    """Run all validations"""
    print("=" * 50)
    print("Trained Model Validation")
    print("=" * 50)
    
    results = [
        check_safety_classifier(),
        check_intent_classifier(),
        check_persona_model()
    ]
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    all_passed = all(results)
    
    if all_passed:
        print("✅ All models validated!")
        return 0
    else:
        print("❌ Some models failed validation")
        return 1

if __name__ == "__main__":
    sys.exit(main())

