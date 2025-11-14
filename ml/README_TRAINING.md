# ML Model Training Guide

Complete guide for training ML models for AI Shadow-Self Coach.

## Prerequisites

### 1. Python Environment

```bash
# Python 3.8+ required
python --version

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Check Readiness

```bash
# Verify all dependencies and data are ready
python check_training_ready.py
```

This will check:
- ✅ Python version
- ✅ Required packages
- ✅ Data files
- ✅ Models directory
- ✅ Environment variables

## Training Workflow

### Step 1: Expand Seed Dialogues

Expand from 20 to 500+ dialogues:

```bash
python tools/expand_seed_dialogues.py \
  --input ../SEED_DIALOGUES.json \
  --output ../data/SEED_DIALOGUES_EXPANDED.json \
  --target 500 \
  --validate
```

**Options:**
- `--input`: Path to seed dialogues file
- `--output`: Path to save expanded dialogues
- `--target`: Target number of dialogues (default: 500)
- `--validate`: Validate expanded dialogues

**Output:**
- Expanded dialogues JSON file
- Statistics report
- Validation results

### Step 2: Train Safety Classifier

Train BERT-based safety classifier:

```bash
python train_safety_classifier.py
```

**Configuration** (in script):
- Model: `bert-base-uncased`
- Batch size: 16
- Learning rate: 2e-5
- Epochs: 5
- Target recall: 0.98 (for high-risk)

**Output:**
- Model saved to `models/safety_classifier/latest/`
- Training metrics
- Evaluation results

**Expected Metrics:**
- High-risk recall: ≥ 0.98
- Overall accuracy: ≥ 0.90
- F1 score: ≥ 0.85

### Step 3: Train Intent Classifier

Train BERT-based intent classifier:

```bash
python train_intent_classifier.py
```

**Configuration:**
- Model: `bert-base-uncased`
- Batch size: 16
- Learning rate: 2e-5
- Epochs: 5

**Output:**
- Model saved to `models/intent_classifier/latest/`
- Label map JSON
- Training metrics

**Expected Metrics:**
- Accuracy: ≥ 0.80
- Weighted F1: ≥ 0.75

### Step 4: Prepare Persona Model

Prepare training data for OpenAI fine-tuning:

```bash
python train_persona_model.py
```

**Requirements:**
- `OPENAI_API_KEY` environment variable

**Output:**
- `training_data.jsonl` file
- Uploaded to OpenAI (if API key set)
- Fine-tuning job created

**Note:** Fine-tuning happens on OpenAI's servers and may take several hours.

## Complete Pipeline

Run the complete training pipeline:

```bash
# Bash
./run_training_pipeline.sh

# PowerShell (Windows)
.\run_training_pipeline.ps1
```

This will:
1. Expand dialogues
2. Validate expanded data
3. Train safety classifier
4. Train intent classifier
5. Prepare persona model data

## Validation

After training, validate models:

```bash
python validate_trained_models.py
```

This checks:
- ✅ Model files exist
- ✅ Metadata is present
- ✅ Metrics meet thresholds
- ✅ Required files are present

## Model Export

### Export to ONNX (Recommended for Node.js)

Add to training scripts:

```python
import torch.onnx
from transformers import AutoTokenizer

# After training
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
dummy_input = tokenizer(
    "test message",
    return_tensors="pt",
    padding=True,
    truncation=True,
    max_length=128
)

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
    },
    opset_version=11
)
```

## Troubleshooting

### Out of Memory

- Reduce batch size: `BATCH_SIZE = 8`
- Use gradient accumulation
- Train on CPU (slower but uses less memory)

### Low Performance

- Increase training data
- Train for more epochs
- Adjust learning rate
- Try different model architecture

### Model Not Saving

- Check write permissions on `models/` directory
- Ensure sufficient disk space
- Check for errors in training logs

### Validation Fails

- Review training metrics
- Check data quality
- Retrain with different hyperparameters
- Increase training data

## Next Steps

After training:

1. **Validate models**: `python validate_trained_models.py`
2. **Export to ONNX**: Add export code to training scripts
3. **Deploy to backend**: Follow `docs/ML_MODEL_INTEGRATION.md`
4. **Test integration**: Verify models work in production
5. **Monitor performance**: Track model accuracy in production

## Resources

- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [ONNX Export Guide](https://pytorch.org/tutorials/advanced/super_resolution_with_onnxruntime.html)
- [Model Integration Guide](../docs/ML_MODEL_INTEGRATION.md)

## Support

For issues or questions:
- Check training logs
- Review error messages
- Consult documentation
- Open GitHub issue

---

**Happy Training!** 🚀

