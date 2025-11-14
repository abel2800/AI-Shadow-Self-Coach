#!/bin/bash
# Run complete dialogue expansion workflow

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Starting Dialogue Expansion Workflow"
echo "========================================"

# Configuration
TARGET_COUNT=500
SEED_FILE="$PROJECT_ROOT/SEED_DIALOGUES.json"
EXPANDED_FILE="$PROJECT_ROOT/data/SEED_DIALOGUES_EXPANDED.json"
VALIDATED_FILE="$PROJECT_ROOT/data/SEED_DIALOGUES_VALIDATED.json"

# Create data directory
mkdir -p "$PROJECT_ROOT/data"

# Step 1: Expand dialogues
echo ""
echo "📝 Step 1: Expanding dialogues to $TARGET_COUNT..."
python "$SCRIPT_DIR/expand_seed_dialogues.py" \
  --input "$SEED_FILE" \
  --output "$EXPANDED_FILE" \
  --target "$TARGET_COUNT" \
  --validate

# Step 2: Validate expanded dialogues
echo ""
echo "✅ Step 2: Validating expanded dialogues..."
python "$SCRIPT_DIR/validate_dialogues.py" \
  --input "$EXPANDED_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Expansion complete!"
  echo "   Output: $EXPANDED_FILE"
  echo ""
  echo "📋 Next Steps:"
  echo "   1. Review expanded dialogues"
  echo "   2. Run clinician review"
  echo "   3. Use for model training"
else
  echo ""
  echo "❌ Validation failed. Please review errors above."
  exit 1
fi

