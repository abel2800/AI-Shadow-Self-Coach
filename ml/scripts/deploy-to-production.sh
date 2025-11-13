#!/bin/bash
# Production Model Deployment Script

set -e

MODEL_TYPE=$1
MODEL_VERSION=$2
ENVIRONMENT=${3:-production}

if [ -z "$MODEL_TYPE" ] || [ -z "$MODEL_VERSION" ]; then
  echo "Usage: ./scripts/deploy-to-production.sh <model_type> <version> [environment]"
  echo "Example: ./scripts/deploy-to-production.sh safety_classifier v1.0.0 production"
  exit 1
fi

echo "🚀 Deploying model to $ENVIRONMENT..."
echo "   Type: $MODEL_TYPE"
echo "   Version: $MODEL_VERSION"
echo ""

# Validate model exists
MODEL_PATH="models/$MODEL_TYPE/$MODEL_VERSION"
if [ ! -d "$MODEL_PATH" ]; then
  echo "❌ Model not found: $MODEL_PATH"
  exit 1
fi

# Run health checks
echo "🔍 Running health checks..."
python -c "
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
info = registry.get_model_info('$MODEL_TYPE', '$MODEL_VERSION')
if not info:
    print('❌ Model not registered')
    exit(1)
print('✅ Model registered')
"

# Deploy model
echo "📦 Deploying model..."
python -c "
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
registry.deploy_model('$MODEL_TYPE', '$MODEL_VERSION', '$ENVIRONMENT')
print('✅ Model deployed to $ENVIRONMENT')
"

# Verify deployment
echo "✅ Verifying deployment..."
DEPLOYED_VERSION=$(python -c "
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
print(registry.get_deployed_version('$MODEL_TYPE', '$ENVIRONMENT'))
")

if [ "$DEPLOYED_VERSION" != "$MODEL_VERSION" ]; then
  echo "❌ Deployment verification failed"
  exit 1
fi

echo ""
echo "✅ Model deployed successfully!"
echo "   Type: $MODEL_TYPE"
echo "   Version: $MODEL_VERSION"
echo "   Environment: $ENVIRONMENT"

