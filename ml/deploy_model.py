#!/usr/bin/env python3
"""
Model Deployment Script
Packages and deploys trained models for production use
"""

import os
import json
import shutil
import argparse
from datetime import datetime
from pathlib import Path

def deploy_model(model_type, model_path, version=None, metadata=None):
    """
    Deploy a trained model to the models directory
    
    Args:
        model_type: Type of model ('safety_classifier', 'intent_classifier', 'persona_model')
        model_path: Path to the trained model file
        version: Model version (defaults to timestamp)
        metadata: Additional metadata about the model
    """
    # Create models directory structure
    models_dir = Path('models')
    models_dir.mkdir(exist_ok=True)
    
    type_dir = models_dir / model_type
    type_dir.mkdir(exist_ok=True)
    
    # Generate version if not provided
    if not version:
        version = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    version_dir = type_dir / version
    version_dir.mkdir(exist_ok=True)
    
    # Copy model files
    model_path = Path(model_path)
    if model_path.is_file():
        shutil.copy2(model_path, version_dir / model_path.name)
    elif model_path.is_dir():
        shutil.copytree(model_path, version_dir / model_path.name, dirs_exist_ok=True)
    else:
        raise ValueError(f"Model path does not exist: {model_path}")
    
    # Create metadata file
    metadata_file = version_dir / 'metadata.json'
    model_metadata = {
        'model_type': model_type,
        'version': version,
        'deployed_at': datetime.now().isoformat(),
        'model_path': str(model_path),
        'files': [f.name for f in version_dir.iterdir() if f.is_file()],
        **(metadata or {})
    }
    
    with open(metadata_file, 'w') as f:
        json.dump(model_metadata, f, indent=2)
    
    # Update latest symlink
    latest_link = type_dir / 'latest'
    if latest_link.exists():
        latest_link.unlink()
    latest_link.symlink_to(version)
    
    print(f"✅ Model deployed successfully!")
    print(f"   Type: {model_type}")
    print(f"   Version: {version}")
    print(f"   Location: {version_dir}")
    
    return version_dir

def export_model_for_nodejs(model_path, output_path, format='onnx'):
    """
    Export model for Node.js backend (ONNX or TensorFlow.js format)
    
    Args:
        model_path: Path to Python model
        output_path: Output path for exported model
        format: Export format ('onnx' or 'tfjs')
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    if format == 'onnx':
        # Export to ONNX format
        try:
            import torch
            from torch.onnx import export
            
            # Load model
            model = torch.load(model_path, map_location='cpu')
            model.eval()
            
            # Create dummy input
            dummy_input = torch.randn(1, 512)  # Adjust based on model input
            
            # Export to ONNX
            export(
                model,
                dummy_input,
                str(output_path),
                input_names=['input'],
                output_names=['output'],
                dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
            )
            
            print(f"✅ Model exported to ONNX: {output_path}")
        except ImportError:
            print("⚠️  PyTorch not available. Skipping ONNX export.")
    
    elif format == 'tfjs':
        # Export to TensorFlow.js format
        try:
            import tensorflow as tf
            import tensorflowjs as tfjs
            
            # Load model
            model = tf.keras.models.load_model(model_path)
            
            # Export to TensorFlow.js
            tfjs.converters.save_keras_model(model, str(output_path))
            
            print(f"✅ Model exported to TensorFlow.js: {output_path}")
        except ImportError:
            print("⚠️  TensorFlow.js not available. Skipping TF.js export.")
    
    return output_path

def create_model_package(model_type, version, output_dir='model_packages'):
    """
    Create a deployment package for a model
    
    Args:
        model_type: Type of model
        version: Model version
        output_dir: Output directory for packages
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    models_dir = Path('models') / model_type / version
    
    if not models_dir.exists():
        raise ValueError(f"Model not found: {models_dir}")
    
    # Create package directory
    package_name = f"{model_type}_v{version}"
    package_dir = output_dir / package_name
    package_dir.mkdir(exist_ok=True)
    
    # Copy model files
    for file in models_dir.iterdir():
        if file.is_file():
            shutil.copy2(file, package_dir / file.name)
    
    # Create package manifest
    manifest = {
        'model_type': model_type,
        'version': version,
        'package_name': package_name,
        'created_at': datetime.now().isoformat(),
        'files': [f.name for f in package_dir.iterdir() if f.is_file()]
    }
    
    manifest_file = package_dir / 'manifest.json'
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Create archive
    archive_path = output_dir / f"{package_name}.tar.gz"
    shutil.make_archive(
        str(output_dir / package_name),
        'gztar',
        package_dir
    )
    
    print(f"✅ Model package created: {archive_path}")
    return archive_path

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Deploy ML models')
    parser.add_argument('--type', required=True, choices=['safety_classifier', 'intent_classifier', 'persona_model'],
                       help='Type of model to deploy')
    parser.add_argument('--model-path', required=True, help='Path to trained model')
    parser.add_argument('--version', help='Model version (defaults to timestamp)')
    parser.add_argument('--export', choices=['onnx', 'tfjs'], help='Export format for Node.js')
    parser.add_argument('--package', action='store_true', help='Create deployment package')
    parser.add_argument('--metadata', help='Path to metadata JSON file')
    
    args = parser.parse_args()
    
    # Load metadata if provided
    metadata = None
    if args.metadata:
        with open(args.metadata, 'r') as f:
            metadata = json.load(f)
    
    # Deploy model
    version_dir = deploy_model(
        args.type,
        args.model_path,
        version=args.version,
        metadata=metadata
    )
    
    # Export for Node.js if requested
    if args.export:
        export_path = version_dir / f"model.{args.export}"
        export_model_for_nodejs(args.model_path, export_path, format=args.export)
    
    # Create package if requested
    if args.package:
        create_model_package(args.type, args.version or datetime.now().strftime('%Y%m%d_%H%M%S'))

