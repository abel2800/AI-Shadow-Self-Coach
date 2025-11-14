# ML Model Integration Guide

## Overview

The AI Shadow-Self Coach backend is designed to integrate trained ML models for improved safety detection and intent classification. This guide explains how to integrate trained models into the backend.

## Model Types

### 1. Safety Classifier

**Purpose**: Detect high-risk content in user messages (suicidal ideation, self-harm)

**Model Format**: BERT-based classifier (PyTorch/ONNX)

**Output**: Risk level (none, low, medium, high) with confidence score

**Integration Point**: `backend/src/services/safety.service.js`

### 2. Intent Classifier

**Purpose**: Classify therapeutic intents in AI responses

**Model Format**: BERT-based classifier (PyTorch/ONNX)

**Output**: Intent label (validate, probe_story, probe_root, reframe, etc.)

**Integration Point**: `backend/src/services/conversation.service.js`

### 3. Persona Model

**Purpose**: Fine-tuned LLM for Ari persona responses

**Model Format**: OpenAI fine-tuned model or custom LLM

**Integration Point**: `backend/src/services/conversation.service.js`

## Model Directory Structure

```
ml/models/
├── safety_classifier/
│   └── latest/
│       ├── model.onnx (or model.pt)
│       ├── tokenizer.json
│       └── metadata.json
├── intent_classifier/
│   └── latest/
│       ├── model.onnx (or model.pt)
│       ├── tokenizer.json
│       ├── label_map.json
│       └── metadata.json
└── registry.json
```

## Model Metadata Format

### safety_classifier/metadata.json

```json
{
  "version": "1.0.0",
  "model_type": "safety_classifier",
  "architecture": "bert-base-uncased",
  "training_date": "2024-11-12",
  "metrics": {
    "high_risk_recall": 0.98,
    "accuracy": 0.95,
    "f1_score": 0.93
  },
  "risk_levels": ["none", "low", "medium", "high"],
  "input_max_length": 128
}
```

### intent_classifier/metadata.json

```json
{
  "version": "1.0.0",
  "model_type": "intent_classifier",
  "architecture": "bert-base-uncased",
  "training_date": "2024-11-12",
  "metrics": {
    "accuracy": 0.87,
    "f1_score": 0.85
  },
  "labels": [
    "validate",
    "probe_story",
    "probe_root",
    "reframe",
    "suggest_experiment",
    "offer_mindfulness",
    "safety_check",
    "emergency",
    "close",
    "other"
  ],
  "input_max_length": 128
}
```

## Integration Steps

### Step 1: Train Models

```bash
cd ml

# Expand dialogues
python tools/expand_seed_dialogues.py \
  --input ../SEED_DIALOGUES.json \
  --output ../data/SEED_DIALOGUES_EXPANDED.json \
  --target 500

# Train safety classifier
python train_safety_classifier.py

# Train intent classifier
python train_intent_classifier.py

# Prepare persona model data
python train_persona_model.py
```

### Step 2: Export Models

For ONNX export (recommended for Node.js):

```python
# Add to train_safety_classifier.py
import torch.onnx

# After training
dummy_input = tokenizer("test", return_tensors="pt", padding=True, truncation=True, max_length=128)
torch.onnx.export(
    model,
    (dummy_input['input_ids'], dummy_input['attention_mask']),
    "models/safety_classifier/latest/model.onnx",
    input_names=['input_ids', 'attention_mask'],
    output_names=['logits'],
    dynamic_axes={
        'input_ids': {0: 'batch'},
        'attention_mask': {0: 'batch'},
        'logits': {0: 'batch'}
    }
)
```

### Step 3: Install Runtime Dependencies

For ONNX Runtime (Node.js):

```bash
cd backend
npm install onnxruntime-node
```

For TensorFlow.js:

```bash
npm install @tensorflow/tfjs-node
```

### Step 4: Update Model Service

Update `backend/src/services/ml-model.service.js` to load actual models:

```javascript
const ort = require('onnxruntime-node');
const { AutoTokenizer } = require('@xenova/transformers');

async function loadSafetyClassifier(modelPath) {
  const session = await ort.InferenceSession.create(
    path.join(modelPath, 'model.onnx')
  );
  
  const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
  const metadata = await loadModelMetadata(MODEL_TYPES.SAFETY_CLASSIFIER);
  
  return {
    type: MODEL_TYPES.SAFETY_CLASSIFIER,
    path: modelPath,
    metadata,
    predict: async (text) => {
      // Tokenize
      const inputs = await tokenizer(text, {
        padding: true,
        truncation: true,
        max_length: 128,
        return_tensors: 'np'
      });
      
      // Run inference
      const results = await session.run({
        input_ids: new ort.Tensor('int64', inputs.input_ids.data, inputs.input_ids.dims),
        attention_mask: new ort.Tensor('int64', inputs.attention_mask.data, inputs.attention_mask.dims)
      });
      
      // Get predictions
      const logits = results.logits.data;
      const predictedClass = logits.indexOf(Math.max(...logits));
      const confidence = Math.max(...logits) / logits.reduce((a, b) => a + b, 0);
      
      return {
        risk_level: RISK_LEVEL_MAP[predictedClass],
        confidence: confidence,
        category: getCategoryFromRiskLevel(RISK_LEVEL_MAP[predictedClass])
      };
    }
  };
}
```

### Step 5: Enable ML Models

Set environment variable:

```bash
USE_ML_SAFETY_CLASSIFIER=true
USE_ML_INTENT_CLASSIFIER=true
```

### Step 6: Test Integration

```bash
# Test safety classifier
curl -X POST http://localhost:3000/api/v1/conversation/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "<session_id>",
    "message": "I want to kill myself"
  }'

# Should return high risk_level
```

## Fallback Behavior

The system automatically falls back to rule-based detection if:

1. ML model is not available
2. Model loading fails
3. Inference fails
4. `USE_ML_SAFETY_CLASSIFIER=false`

This ensures the system always has safety detection, even without ML models.

## Monitoring

Monitor ML model usage:

```javascript
// Check if ML model is being used
const isMLAvailable = await safetyService.isMLModelAvailable();
logger.info('ML Safety Model Status', { available: isMLAvailable });
```

## Performance Considerations

- **Model Loading**: Models are cached after first load
- **Inference Time**: ONNX models typically < 50ms per inference
- **Memory**: BERT models require ~500MB RAM
- **Batch Processing**: Consider batching for high-throughput scenarios

## A/B Testing

Models can be A/B tested using the existing A/B testing infrastructure:

```javascript
// Assign user to model version
await abTestService.assignUserToTest(userId, 'safety_classifier_v2');
```

## Troubleshooting

### Model Not Loading

1. Check model path: `MODELS_DIR` environment variable
2. Verify model files exist
3. Check file permissions
4. Review logs for specific errors

### Low Performance

1. Verify model format (ONNX recommended)
2. Check input preprocessing
3. Monitor inference time
4. Consider model quantization

### Fallback Issues

1. Ensure rule-based fallback is working
2. Check error handling in model service
3. Verify environment variables

## Next Steps

1. Train models with expanded dataset
2. Export to ONNX format
3. Integrate ONNX Runtime
4. Test with real conversations
5. Monitor performance and accuracy
6. Iterate based on feedback

---

For questions or issues, see the main [README](../README.md) or open an issue on GitHub.

