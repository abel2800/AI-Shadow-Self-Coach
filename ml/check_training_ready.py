#!/usr/bin/env python3
"""
Check Training Readiness
Validates that all dependencies and data are ready for ML training
"""

import os
import sys
import json
from pathlib import Path

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current:", sys.version)
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def check_dependencies():
    """Check required Python packages"""
    required = [
        'torch',
        'transformers',
        'sklearn',
        'pandas',
        'numpy',
        'datasets'
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} not installed")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    return True

def check_data_files():
    """Check if required data files exist"""
    project_root = Path(__file__).parent.parent
    seed_file = project_root / 'SEED_DIALOGUES.json'
    expanded_file = project_root / 'data' / 'SEED_DIALOGUES_EXPANDED.json'
    
    checks = []
    
    # Check seed file
    if seed_file.exists():
        print(f"✅ Seed dialogues found: {seed_file}")
        try:
            with open(seed_file, 'r') as f:
                data = json.load(f)
                count = len(data.get('dialogues', []))
                print(f"   {count} dialogues in seed file")
                checks.append(True)
        except Exception as e:
            print(f"❌ Error reading seed file: {e}")
            checks.append(False)
    else:
        print(f"❌ Seed dialogues not found: {seed_file}")
        checks.append(False)
    
    # Check expanded file (optional)
    if expanded_file.exists():
        print(f"✅ Expanded dialogues found: {expanded_file}")
        try:
            with open(expanded_file, 'r') as f:
                data = json.load(f)
                count = len(data.get('dialogues', []))
                print(f"   {count} dialogues in expanded file")
        except Exception as e:
            print(f"⚠️  Error reading expanded file: {e}")
    else:
        print(f"ℹ️  Expanded dialogues not found (will be created during training)")
    
    return all(checks)

def check_models_directory():
    """Check if models directory exists and is writable"""
    models_dir = Path(__file__).parent / 'models'
    
    if not models_dir.exists():
        print(f"ℹ️  Creating models directory: {models_dir}")
        models_dir.mkdir(parents=True, exist_ok=True)
    
    # Check write permissions
    test_file = models_dir / '.write_test'
    try:
        test_file.touch()
        test_file.unlink()
        print(f"✅ Models directory is writable: {models_dir}")
        return True
    except Exception as e:
        print(f"❌ Cannot write to models directory: {e}")
        return False

def check_environment():
    """Check environment variables"""
    checks = []
    
    # Check OpenAI API key (optional for persona model)
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        print("✅ OPENAI_API_KEY is set")
        checks.append(True)
    else:
        print("⚠️  OPENAI_API_KEY not set (required for persona model training)")
        checks.append(False)
    
    # Check CUDA availability (optional)
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            print("ℹ️  CUDA not available (will use CPU)")
    except:
        pass
    
    return all(checks) if checks else True

def main():
    """Run all checks"""
    print("=" * 50)
    print("ML Training Readiness Check")
    print("=" * 50)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Data Files", check_data_files),
        ("Models Directory", check_models_directory),
        ("Environment", check_environment)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 Checking {name}...")
        result = check_func()
        results.append((name, result))
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
        if not result:
            all_passed = False
    
    print()
    if all_passed:
        print("✅ All checks passed! Ready for training.")
        return 0
    else:
        print("❌ Some checks failed. Please fix issues before training.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

