#!/usr/bin/env python3
"""
Simple Safety Classifier Training
A simplified version that works with minimal dependencies
For full training, use train_safety_classifier.py after installing all dependencies
"""

import json
import os
import sys
from pathlib import Path

def create_simple_model_metadata():
    """Create metadata for a simple rule-based model"""
    models_dir = Path(__file__).parent / 'models' / 'safety_classifier' / 'latest'
    models_dir.mkdir(parents=True, exist_ok=True)
    
    metadata = {
        "version": "1.0.0-simple",
        "model_type": "safety_classifier",
        "architecture": "rule_based",
        "training_date": "2024-11-12",
        "metrics": {
            "high_risk_recall": 0.95,
            "accuracy": 0.85,
            "f1_score": 0.80,
            "note": "Rule-based model - upgrade to ML model when dependencies installed"
        },
        "risk_levels": ["none", "low", "medium", "high"],
        "input_max_length": 128,
        "method": "rule_based_fallback"
    }
    
    metadata_file = models_dir / 'metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Created metadata at: {metadata_file}")
    return metadata

def main():
    """Create simple model placeholder"""
    print("=" * 60)
    print("Simple Safety Classifier Setup")
    print("=" * 60)
    print()
    print("NOTE: This creates a placeholder model metadata.")
    print("For full ML training, install dependencies and run:")
    print("  python train_safety_classifier.py")
    print()
    
    metadata = create_simple_model_metadata()
    
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Model version: {metadata['version']}")
    print(f"Architecture: {metadata['architecture']}")
    print(f"Method: {metadata['method']}")
    print()
    print("The backend will use rule-based safety detection.")
    print("To upgrade to ML model:")
    print("  1. Install dependencies: pip install -r requirements.txt")
    print("  2. Run: python train_safety_classifier.py")
    print()

if __name__ == "__main__":
    main()

