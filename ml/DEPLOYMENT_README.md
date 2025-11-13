# Model Deployment Pipeline
## ML Model Deployment and Management

This guide explains how to deploy trained ML models to production.

---

## 🎯 Overview

The deployment pipeline supports:
- **Model Versioning** - Track model versions and metadata
- **Model Registry** - Centralized model management
- **Deployment Scripts** - Automated deployment process
- **Node.js Integration** - Load models in backend services
- **Health Checks** - Verify model availability
- **Rollback** - Revert to previous model versions

---

## 📦 Model Types

1. **Safety Classifier** - BERT-based risk detection
2. **Intent Classifier** - Therapeutic intent classification
3. **Persona Model** - Fine-tuned conversation model

---

## 🚀 Deployment Process

### Step 1: Train Model

```bash
# Train safety classifier
python train_safety_classifier.py

# Train intent classifier
python train_intent_classifier.py

# Fine-tune persona model
python train_persona_model.py
```

### Step 2: Deploy Model

```bash
# Deploy safety classifier
python deploy_model.py \
  --type safety_classifier \
  --model-path models/safety_classifier_v1.pt \
  --version v1.0.0 \
  --export onnx \
  --package

# Deploy intent classifier
python deploy_model.py \
  --type intent_classifier \
  --model-path models/intent_classifier_v1.pt \
  --version v1.0.0 \
  --export onnx \
  --package
```

### Step 3: Register Model

```python
from utils.model_registry import ModelRegistry

registry = ModelRegistry()
registry.register_model(
    'safety_classifier',
    'v1.0.0',
    {
        'accuracy': 0.98,
        'recall': 0.99,
        'precision': 0.95,
        'training_data_size': 1000,
        'training_date': '2024-01-01'
    }
)
```

### Step 4: Deploy to Environment

```python
# Deploy to production
registry.deploy_model('safety_classifier', 'v1.0.0', 'production')

# Deploy to staging
registry.deploy_model('safety_classifier', 'v1.0.0', 'staging')
```

---

## 📁 Model Directory Structure

```
ml/
├── models/
│   ├── safety_classifier/
│   │   ├── latest -> v1.0.0
│   │   ├── v1.0.0/
│   │   │   ├── model.pt
│   │   │   ├── model.onnx
│   │   │   └── metadata.json
│   │   └── v1.1.0/
│   │       └── ...
│   ├── intent_classifier/
│   │   └── ...
│   └── registry.json
└── model_packages/
    ├── safety_classifier_v1.0.0.tar.gz
    └── ...
```

---

## 🔧 Backend Integration

### Load Model in Service

```javascript
const mlModelService = require('./services/ml-model.service');

// Load safety classifier
const safetyModel = await mlModelService.loadModel(
  mlModelService.MODEL_TYPES.SAFETY_CLASSIFIER,
  'v1.0.0'
);

// Use model for inference
const prediction = await safetyModel.predict(userMessage);
```

### Check Model Availability

```javascript
const isAvailable = await mlModelService.isModelAvailable(
  'safety_classifier',
  'v1.0.0'
);
```

### List Available Models

```javascript
const models = await mlModelService.listAvailableModels();
// Returns: { safety_classifier: ['v1.0.0', 'v1.1.0'], ... }
```

---

## 📊 Model Registry

The registry tracks:
- Model versions
- Deployment status
- Model metadata
- Performance metrics

### Registry Structure

```json
{
  "models": {
    "safety_classifier": {
      "v1.0.0": {
        "version": "v1.0.0",
        "registered_at": "2024-01-01T00:00:00",
        "status": "deployed_production",
        "accuracy": 0.98,
        "recall": 0.99
      }
    }
  },
  "deployments": {
    "safety_classifier": {
      "production": {
        "version": "v1.0.0",
        "deployed_at": "2024-01-01T00:00:00",
        "status": "active"
      }
    }
  }
}
```

---

## 🔄 Version Management

### Get Latest Version

```python
registry = ModelRegistry()
latest = registry.get_latest_version('safety_classifier')
```

### Get Deployed Version

```python
deployed = registry.get_deployed_version('safety_classifier', 'production')
```

### List All Versions

```python
versions = registry.list_versions('safety_classifier')
```

---

## 🧪 Model Health Checks

### API Endpoint

```bash
GET /api/v1/ml-models/safety_classifier/health
```

Response:
```json
{
  "model_type": "safety_classifier",
  "version": "v1.0.0",
  "status": "healthy",
  "available": true,
  "loadable": true,
  "metadata": {
    "version": "v1.0.0",
    "deployed_at": "2024-01-01T00:00:00"
  }
}
```

---

## 📦 Model Packages

Create deployment packages:

```bash
python deploy_model.py \
  --type safety_classifier \
  --model-path models/safety_classifier_v1.pt \
  --version v1.0.0 \
  --package
```

Package includes:
- Model files
- Metadata
- Manifest
- Compressed archive

---

## 🔄 Rollback

### Rollback to Previous Version

```python
# Get previous version
previous_version = 'v0.9.0'

# Deploy previous version
registry.deploy_model('safety_classifier', previous_version, 'production')
```

### Automatic Rollback

Set up monitoring to automatically rollback if:
- Model health check fails
- Error rate increases
- Performance degrades

---

## 🐳 Docker Integration

### Model Volume

```yaml
# docker-compose.yml
services:
  api:
    volumes:
      - ./ml/models:/app/models:ro
    environment:
      - MODELS_DIR=/app/models
```

### Model Loading in Container

Models are loaded from mounted volume at startup.

---

## 📈 Monitoring

### Model Metrics

Track:
- Model load time
- Inference latency
- Error rate
- Prediction distribution

### Logging

All model operations are logged:
- Model loads
- Inference calls
- Errors
- Performance metrics

---

## 🔒 Security

### Model Access

- Models stored in secure location
- Access controlled via authentication
- Models encrypted at rest (optional)

### Model Validation

- Verify model integrity
- Check model signatures
- Validate model format

---

## ✅ Deployment Checklist

- [ ] Model trained and evaluated
- [ ] Model exported to deployment format
- [ ] Model metadata documented
- [ ] Model registered in registry
- [ ] Model deployed to staging
- [ ] Staging tests passed
- [ ] Model deployed to production
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## 🐛 Troubleshooting

### Model Not Loading

**Check:**
- Model file exists
- Model format is correct
- Dependencies installed
- Permissions correct

### Model Performance Issues

**Check:**
- Model version matches training
- Input format correct
- Model cache cleared
- Resource availability

---

## 📚 Resources

- [ONNX Runtime](https://onnxruntime.ai/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Model Versioning Best Practices](https://mlflow.org/docs/latest/models.html)

---

**Deployment pipeline is ready!** 🎯

For questions, see deployment scripts in `ml/` or check the model registry.

