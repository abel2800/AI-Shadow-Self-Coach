#!/bin/bash
# Complete ML Training Pipeline
# Expands dialogues, validates, and trains models

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 ML Training Pipeline"
echo "======================"

# Configuration
TARGET_DIALOGUES=500
SEED_FILE="$PROJECT_ROOT/SEED_DIALOGUES.json"
EXPANDED_FILE="$PROJECT_ROOT/data/SEED_DIALOGUES_EXPANDED.json"
DATA_DIR="$PROJECT_ROOT/data"

# Create data directory
mkdir -p "$DATA_DIR"

# Step 1: Expand dialogues
echo ""
echo "📝 Step 1: Expanding dialogues..."
python "$SCRIPT_DIR/tools/expand_seed_dialogues.py" \
  --input "$SEED_FILE" \
  --output "$EXPANDED_FILE" \
  --target "$TARGET_DIALOGUES" \
  --validate

if [ $? -ne 0 ]; then
  echo "❌ Dialogue expansion failed"
  exit 1
fi

# Step 2: Validate
echo ""
echo "✅ Step 2: Validating dialogues..."
python "$SCRIPT_DIR/tools/validate_dialogues.py" \
  --input "$EXPANDED_FILE"

if [ $? -ne 0 ]; then
  echo "❌ Validation failed"
  exit 1
fi

# Step 3: Train safety classifier
echo ""
echo "🛡️  Step 3: Training safety classifier..."
python "$SCRIPT_DIR/train_safety_classifier.py"

if [ $? -ne 0 ]; then
  echo "❌ Safety classifier training failed"
  exit 1
fi

# Step 4: Train intent classifier
echo ""
echo "🎯 Step 4: Training intent classifier..."
python "$SCRIPT_DIR/train_intent_classifier.py"

if [ $? -ne 0 ]; then
  echo "❌ Intent classifier training failed"
  exit 1
fi

# Step 5: Prepare persona model data
echo ""
echo "💬 Step 5: Preparing persona model training data..."
python "$SCRIPT_DIR/train_persona_model.py"

if [ $? -ne 0 ]; then
  echo "❌ Persona model preparation failed"
  exit 1
fi

# Step 6: Analyze results
echo ""
echo "📊 Step 6: Analyzing training results..."
python "$SCRIPT_DIR/analyze_training_results.py"

# Step 7: Test model inference
echo ""
echo "🧪 Step 7: Testing model inference..."
python "$SCRIPT_DIR/test_model_inference.py"

echo ""
echo "✅ Training pipeline complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Review model performance (see analysis above)"
echo "   2. Export to ONNX: python export_to_onnx.py"
echo "   3. Deploy models to backend"
echo "   4. Test in staging environment"

