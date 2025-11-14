# Data Labeling Tools
## Tools for Labeling and Managing Training Data

This directory contains tools for labeling training data, validating labels, and managing multi-annotator workflows.

---

## 🛠️ Tools

### 1. Labeling Tool (`labeling_tool.py`)

Interactive CLI tool for labeling dialogues and messages.

**Usage:**
```bash
python labeling_tool.py --input data.json --output labels.json
```

**Features:**
- Interactive labeling interface
- Support for intent, sentiment, and risk level labels
- Auto-save every 10 items
- Navigation commands (prev, next, skip)
- Progress tracking

**Commands:**
- Press Enter: Label current item
- `skip`: Skip current item
- `prev`: Go to previous item
- `next`: Go to next item
- `save`: Save and exit
- `quit`: Exit without saving

---

### 2. Label Validator (`label_validator.py`)

Validates labeled data and checks for errors and inconsistencies.

**Usage:**
```bash
python label_validator.py --input labels.json
```

**With export:**
```bash
python label_validator.py --input labels.json --export training_data.json
```

**Features:**
- Validates label format and values
- Checks for inconsistencies
- Calculates label distribution statistics
- Exports to training format

---

### 3. Inter-Annotator Agreement (`inter_annotator_agreement.py`)

Calculates agreement between multiple annotators.

**Usage:**
```bash
python inter_annotator_agreement.py --files labels1.json labels2.json labels3.json
```

**Features:**
- Calculates exact agreement
- Calculates Cohen's Kappa
- Pairwise comparisons
- Agreement interpretation

---

### 4. Merge Labels (`merge_labels.py`)

Merges labels from multiple annotators.

**Usage:**
```bash
python merge_labels.py --files labels1.json labels2.json --output merged.json --strategy majority
```

**Strategies:**
- `majority`: Use majority vote
- `consensus`: Only include items with full agreement

---

## 📋 Label Schema

### Intent Labels
- `validate` - Validating user's feelings
- `probe_story` - Probing for more details
- `probe_root` - Probing for root causes
- `reframe` - Cognitive reframing
- `suggest_experiment` - Suggesting behavioral experiment
- `offer_mindfulness` - Offering mindfulness practice
- `safety_check` - Safety check
- `emergency` - Emergency response
- `close` - Closing session
- `other` - Other intent

### Sentiment Labels
- `very_negative`
- `negative`
- `neutral`
- `positive`

### Risk Level Labels
- `none` - No risk
- `low` - Low risk
- `medium` - Medium risk
- `high` - High risk (requires emergency response)

---

## 🔄 Workflow

### Single Annotator

1. **Label data:**
   ```bash
   python labeling_tool.py --input data.json --output labels.json
   ```

2. **Validate labels:**
   ```bash
   python label_validator.py --input labels.json
   ```

3. **Export for training:**
   ```bash
   python label_validator.py --input labels.json --export training_data.json
   ```

### Multiple Annotators

1. **Each annotator labels independently:**
   ```bash
   python labeling_tool.py --input data.json --output annotator1_labels.json
   python labeling_tool.py --input data.json --output annotator2_labels.json
   ```

2. **Calculate agreement:**
   ```bash
   python inter_annotator_agreement.py --files annotator1_labels.json annotator2_labels.json
   ```

3. **Merge labels:**
   ```bash
   python merge_labels.py --files annotator1_labels.json annotator2_labels.json --output merged_labels.json
   ```

4. **Validate merged labels:**
   ```bash
   python label_validator.py --input merged_labels.json --export training_data.json
   ```

---

## 📊 Quality Metrics

### Inter-Annotator Agreement

- **Kappa < 0.00**: Poor agreement
- **0.00 ≤ Kappa < 0.20**: Slight agreement
- **0.20 ≤ Kappa < 0.40**: Fair agreement
- **0.40 ≤ Kappa < 0.60**: Moderate agreement
- **0.60 ≤ Kappa < 0.80**: Substantial agreement
- **0.80 ≤ Kappa ≤ 1.00**: Almost perfect agreement

**Target:** Kappa ≥ 0.60 (Substantial agreement)

---

## 📁 File Formats

### Input Data Format

```json
{
  "dialogues": [
    {
      "dialogue_id": "seed_001",
      "session_type": "gentle_deep",
      "messages": [
        {
          "role": "user",
          "text": "I feel stressed"
        },
        {
          "role": "assistant",
          "text": "That sounds difficult"
        }
      ]
    }
  ]
}
```

### Labels Format

```json
{
  "version": "1.0",
  "labels": [
    {
      "item_id": "seed_001",
      "intent": "validate",
      "sentiment": "negative",
      "risk_level": "none",
      "labeled_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Training Data Format

```json
[
  {
    "text": "That sounds difficult",
    "intent": "validate",
    "sentiment": "negative",
    "risk_level": "none"
  }
]
```

---

## ✅ Best Practices

1. **Label consistently** - Use the same criteria throughout
2. **Review guidelines** - Refer to labeling guidelines regularly
3. **Take breaks** - Label in sessions to maintain quality
4. **Validate frequently** - Check labels for errors
5. **Calculate agreement** - For multiple annotators, ensure good agreement
6. **Document edge cases** - Use notes field for ambiguous cases

---

## 🐛 Troubleshooting

### Labeling Tool Issues

**Problem:** Tool crashes or freezes
**Solution:** Check input file format, ensure valid JSON

**Problem:** Can't navigate between items
**Solution:** Use 'prev' and 'next' commands

### Validation Issues

**Problem:** Many validation errors
**Solution:** Review label schema, check for typos

**Problem:** Inconsistent labels
**Solution:** Review labeling guidelines, recalculate agreement

---

## 📚 Resources

- Labeling Guidelines: See `SPECIFICATION.md`
- Seed Dialogues: See `SEED_DIALOGUES.json`
- Training Recipe: See `TRAINING_RECIPE.md`

---

**Labeling tools are ready!** 🎯

Start labeling with: `python labeling_tool.py --input data.json --output labels.json`

