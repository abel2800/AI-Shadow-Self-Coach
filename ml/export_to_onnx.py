#!/usr/bin/env python3
"""
Export Trained Models to ONNX Format
Converts PyTorch models to ONNX for Node.js integration
"""

import os
import sys
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

def export_safety_classifier():
    """Export safety classifier to ONNX"""
    print("🔄 Exporting Safety Classifier to ONNX...")
    
    model_dir = Path(__file__).parent / 'models' / 'safety_classifier' / 'latest'
    
    if not model_dir.exists():
        print("❌ Model directory not found. Train the model first.")
        return False
    
    try:
        # Load model and tokenizer
        print("   Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(str(model_dir))
        tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
        
        # Set to evaluation mode
        model.eval()
        
        # Create dummy input
        print("   Creating dummy input...")
        dummy_text = "This is a test message for ONNX export"
        dummy_input = tokenizer(
            dummy_text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        )
        
        # Export to ONNX
        onnx_path = model_dir / 'model.onnx'
        print(f"   Exporting to {onnx_path}...")
        
        torch.onnx.export(
            model,
            (dummy_input['input_ids'], dummy_input['attention_mask']),
            str(onnx_path),
            input_names=['input_ids', 'attention_mask'],
            output_names=['logits'],
            dynamic_axes={
                'input_ids': {0: 'batch'},
                'attention_mask': {0: 'batch'},
                'logits': {0: 'batch'}
            },
            opset_version=11,
            do_constant_folding=True
        )
        
        print(f"✅ Safety classifier exported to {onnx_path}")
        return True
        
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False

def export_intent_classifier():
    """Export intent classifier to ONNX"""
    print("\n🔄 Exporting Intent Classifier to ONNX...")
    
    model_dir = Path(__file__).parent / 'models' / 'intent_classifier' / 'latest'
    
    if not model_dir.exists():
        print("❌ Model directory not found. Train the model first.")
        return False
    
    try:
        # Load model and tokenizer
        print("   Loading model...")
        model = AutoModelForSequenceClassification.from_pretrained(str(model_dir))
        tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
        
        # Set to evaluation mode
        model.eval()
        
        # Create dummy input
        print("   Creating dummy input...")
        dummy_text = "This is a test message for ONNX export"
        dummy_input = tokenizer(
            dummy_text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128
        )
        
        # Export to ONNX
        onnx_path = model_dir / 'model.onnx'
        print(f"   Exporting to {onnx_path}...")
        
        torch.onnx.export(
            model,
            (dummy_input['input_ids'], dummy_input['attention_mask']),
            str(onnx_path),
            input_names=['input_ids', 'attention_mask'],
            output_names=['logits'],
            dynamic_axes={
                'input_ids': {0: 'batch'},
                'attention_mask': {0: 'batch'},
                'logits': {0: 'batch'}
            },
            opset_version=11,
            do_constant_folding=True
        )
        
        print(f"✅ Intent classifier exported to {onnx_path}")
        return True
        
    except Exception as e:
        print(f"❌ Export failed: {e}")
        return False

def main():
    """Export all models"""
    print("=" * 50)
    print("ONNX Model Export")
    print("=" * 50)
    
    results = [
        export_safety_classifier(),
        export_intent_classifier()
    ]
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    if all(results):
        print("✅ All models exported successfully!")
        print("\n📋 Next Steps:")
        print("   1. Install onnxruntime-node in backend: npm install onnxruntime-node")
        print("   2. Update ml-model.service.js with ONNX inference code")
        print("   3. Set USE_ML_SAFETY_CLASSIFIER=true in backend .env")
        print("   4. Test integration")
        return 0
    else:
        print("❌ Some exports failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())

