#!/usr/bin/env python3
"""
Analyze Training Results
Analyzes and reports on model training results and performance
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

def analyze_safety_classifier():
    """Analyze safety classifier training results"""
    print("\n" + "=" * 60)
    print("Safety Classifier Analysis")
    print("=" * 60)
    
    model_dir = Path(__file__).parent / 'models' / 'safety_classifier' / 'latest'
    metadata_file = model_dir / 'metadata.json'
    
    if not metadata_file.exists():
        print("❌ Model metadata not found. Train the model first.")
        return False
    
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    print(f"\n📊 Model Information:")
    print(f"   Version: {metadata.get('version', 'unknown')}")
    print(f"   Architecture: {metadata.get('architecture', 'unknown')}")
    print(f"   Training Date: {metadata.get('training_date', 'unknown')}")
    
    metrics = metadata.get('metrics', {})
    print(f"\n📈 Performance Metrics:")
    
    high_risk_recall = metrics.get('high_risk_recall', 0)
    accuracy = metrics.get('accuracy', 0)
    f1_score = metrics.get('f1_score', 0)
    
    print(f"   High-Risk Recall: {high_risk_recall:.4f} {'✅' if high_risk_recall >= 0.98 else '⚠️'}")
    print(f"   Overall Accuracy: {accuracy:.4f} {'✅' if accuracy >= 0.90 else '⚠️'}")
    print(f"   F1 Score: {f1_score:.4f} {'✅' if f1_score >= 0.85 else '⚠️'}")
    
    # Check thresholds
    print(f"\n🎯 Target Thresholds:")
    print(f"   High-Risk Recall ≥ 0.98: {'✅ PASS' if high_risk_recall >= 0.98 else '❌ FAIL'}")
    print(f"   Accuracy ≥ 0.90: {'✅ PASS' if accuracy >= 0.90 else '❌ FAIL'}")
    print(f"   F1 Score ≥ 0.85: {'✅ PASS' if f1_score >= 0.85 else '❌ FAIL'}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    if high_risk_recall < 0.98:
        print("   - High-risk recall below target. Consider:")
        print("     * Adding more high-risk training examples")
        print("     * Adjusting class weights")
        print("     * Training for more epochs")
    
    if accuracy < 0.90:
        print("   - Accuracy below target. Consider:")
        print("     * Increasing training data")
        print("     * Hyperparameter tuning")
        print("     * Data augmentation")
    
    return high_risk_recall >= 0.98 and accuracy >= 0.90

def analyze_intent_classifier():
    """Analyze intent classifier training results"""
    print("\n" + "=" * 60)
    print("Intent Classifier Analysis")
    print("=" * 60)
    
    model_dir = Path(__file__).parent / 'models' / 'intent_classifier' / 'latest'
    metadata_file = model_dir / 'metadata.json'
    
    if not metadata_file.exists():
        print("❌ Model metadata not found. Train the model first.")
        return False
    
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    print(f"\n📊 Model Information:")
    print(f"   Version: {metadata.get('version', 'unknown')}")
    print(f"   Architecture: {metadata.get('architecture', 'unknown')}")
    print(f"   Training Date: {metadata.get('training_date', 'unknown')}")
    
    metrics = metadata.get('metrics', {})
    print(f"\n📈 Performance Metrics:")
    
    accuracy = metrics.get('accuracy', 0)
    precision = metrics.get('precision', 0)
    recall = metrics.get('recall', 0)
    f1 = metrics.get('f1', 0)
    
    print(f"   Accuracy: {accuracy:.4f} {'✅' if accuracy >= 0.80 else '⚠️'}")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall: {recall:.4f}")
    print(f"   F1 Score: {f1:.4f} {'✅' if f1 >= 0.75 else '⚠️'}")
    
    # Check thresholds
    print(f"\n🎯 Target Thresholds:")
    print(f"   Accuracy ≥ 0.80: {'✅ PASS' if accuracy >= 0.80 else '❌ FAIL'}")
    print(f"   F1 Score ≥ 0.75: {'✅ PASS' if f1 >= 0.75 else '❌ FAIL'}")
    
    # Label distribution
    label_map_file = model_dir / 'label_map.json'
    if label_map_file.exists():
        with open(label_map_file, 'r') as f:
            label_map = json.load(f)
        print(f"\n📋 Labels: {len(label_map)} classes")
        print(f"   {', '.join(list(label_map.keys())[:5])}...")
    
    return accuracy >= 0.80

def generate_report():
    """Generate comprehensive training report"""
    print("\n" + "=" * 60)
    print("Training Results Report")
    print("=" * 60)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    safety_ok = analyze_safety_classifier()
    intent_ok = analyze_intent_classifier()
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    if safety_ok and intent_ok:
        print("✅ All models meet quality thresholds!")
        print("\n📋 Next Steps:")
        print("   1. Export models to ONNX: python export_to_onnx.py")
        print("   2. Deploy to backend")
        print("   3. Test integration")
        return 0
    else:
        print("⚠️  Some models need improvement")
        if not safety_ok:
            print("   - Safety classifier needs retraining")
        if not intent_ok:
            print("   - Intent classifier needs retraining")
        return 1

if __name__ == "__main__":
    sys.exit(generate_report())

