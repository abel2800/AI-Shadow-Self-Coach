#!/usr/bin/env python3
"""
Compare Model Versions
Compares different versions of trained models
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

def load_model_metadata(model_type, version):
    """Load model metadata"""
    model_dir = Path(__file__).parent / 'models' / model_type / version
    metadata_file = model_dir / 'metadata.json'
    
    if not metadata_file.exists():
        return None
    
    with open(metadata_file, 'r') as f:
        return json.load(f)

def compare_safety_classifiers():
    """Compare different versions of safety classifier"""
    print("\n" + "=" * 60)
    print("Safety Classifier Comparison")
    print("=" * 60)
    
    models_dir = Path(__file__).parent / 'models' / 'safety_classifier'
    
    if not models_dir.exists():
        print("❌ No models found")
        return
    
    # Find all versions
    versions = [d.name for d in models_dir.iterdir() if d.is_dir()]
    
    if len(versions) < 2:
        print(f"ℹ️  Only {len(versions)} version(s) found. Need at least 2 for comparison.")
        return
    
    print(f"\n📊 Found {len(versions)} versions: {', '.join(versions)}\n")
    
    # Load metadata for each version
    models_data = []
    for version in versions:
        metadata = load_model_metadata('safety_classifier', version)
        if metadata:
            models_data.append({
                'version': version,
                'metadata': metadata
            })
    
    # Compare metrics
    print("Comparison Table:")
    print("-" * 60)
    print(f"{'Version':<15} {'High-Risk Recall':<18} {'Accuracy':<12} {'F1 Score':<12}")
    print("-" * 60)
    
    for model in models_data:
        metrics = model['metadata'].get('metrics', {})
        version = model['version']
        recall = metrics.get('high_risk_recall', 0)
        accuracy = metrics.get('accuracy', 0)
        f1 = metrics.get('f1_score', 0)
        
        print(f"{version:<15} {recall:<18.4f} {accuracy:<12.4f} {f1:<12.4f}")
    
    print("-" * 60)
    
    # Find best model
    best_model = max(models_data, key=lambda m: (
        m['metadata'].get('metrics', {}).get('high_risk_recall', 0),
        m['metadata'].get('metrics', {}).get('accuracy', 0)
    ))
    
    print(f"\n🏆 Best Model: {best_model['version']}")
    metrics = best_model['metadata'].get('metrics', {})
    print(f"   High-Risk Recall: {metrics.get('high_risk_recall', 0):.4f}")
    print(f"   Accuracy: {metrics.get('accuracy', 0):.4f}")

def main():
    """Run comparisons"""
    print("=" * 60)
    print("Model Comparison Tool")
    print("=" * 60)
    
    compare_safety_classifiers()
    
    print("\n✅ Comparison complete!")

if __name__ == "__main__":
    main()

