# Expand Seed Dialogues
## Tools for Expanding Training Data

This guide explains how to expand seed dialogues from 20 to 500+ examples.

---

## 🎯 Overview

The expansion workflow:
1. **Generate** - Create new dialogues using templates
2. **Validate** - Check structure and quality
3. **Merge** - Combine with existing dialogues
4. **Review** - Clinician review for quality
5. **Label** - Add/verify labels

---

## 🚀 Quick Start

### Expand Dialogues

```bash
# Expand to 500 dialogues
python expand_seed_dialogues.py \
  --input ../SEED_DIALOGUES.json \
  --output ../SEED_DIALOGUES_EXPANDED.json \
  --target 500 \
  --validate
```

### Validate Dialogues

```bash
python validate_dialogues.py --input ../SEED_DIALOGUES_EXPANDED.json
```

### Merge Multiple Files

```bash
python merge_dialogues.py \
  --files file1.json file2.json file3.json \
  --output merged.json \
  --deduplicate
```

---

## 📋 Tools

### 1. Expand Seed Dialogues (`expand_seed_dialogues.py`)

Generates new dialogues to reach target count.

**Features:**
- Uses existing dialogues as templates
- Maintains dialogue structure
- Configurable distribution
- Multi-turn conversations
- Automatic labeling

**Usage:**
```bash
python expand_seed_dialogues.py \
  --input SEED_DIALOGUES.json \
  --output SEED_DIALOGUES_EXPANDED.json \
  --target 500 \
  --validate
```

**Options:**
- `--input, -i`: Input seed dialogues file
- `--output, -o`: Output file
- `--target, -t`: Target number of dialogues (default: 500)
- `--validate`: Validate output before saving

---

### 2. Validate Dialogues (`validate_dialogues.py`)

Validates dialogue structure and quality.

**Features:**
- Structure validation
- Label validation
- Distribution checks
- Statistics calculation

**Usage:**
```bash
python validate_dialogues.py --input SEED_DIALOGUES.json
```

---

### 3. Merge Dialogues (`merge_dialogues.py`)

Merges multiple dialogue files.

**Features:**
- Combine multiple files
- Deduplication
- Statistics calculation

**Usage:**
```bash
python merge_dialogues.py \
  --files file1.json file2.json \
  --output merged.json \
  --deduplicate
```

---

## 🔄 Complete Workflow

### Step 1: Generate Synthetic Dialogues

```bash
# Generate 200 synthetic dialogues
python generate_synthetic_data.py \
  --count 200 \
  --output data/synthetic_batch1.json
```

### Step 2: Expand Seed Dialogues

```bash
# Expand existing seed dialogues
python expand_seed_dialogues.py \
  --input SEED_DIALOGUES.json \
  --output data/expanded_seed.json \
  --target 300 \
  --validate
```

### Step 3: Merge All Dialogues

```bash
# Merge seed + expanded + synthetic
python merge_dialogues.py \
  --files SEED_DIALOGUES.json data/expanded_seed.json data/synthetic_batch1.json \
  --output data/combined_dialogues.json \
  --deduplicate
```

### Step 4: Validate Combined Data

```bash
python validate_dialogues.py --input data/combined_dialogues.json
```

### Step 5: Clinician Review

```bash
python clinician_review.py \
  --input data/combined_dialogues.json \
  --output data/reviews.json
```

### Step 6: Apply Reviews

```bash
python apply_reviews.py \
  --data data/combined_dialogues.json \
  --reviews data/reviews.json \
  --output data/final_training_data.json
```

---

## 📊 Target Distribution

### Session Types
- **Gentle Deep**: 50% (250 dialogues)
- **Check-in**: 30% (150 dialogues)
- **Micro Practice**: 20% (100 dialogues)

### Concerns
- Self-worth: 15%
- Anxiety: 20%
- Relationships: 12%
- Stress: 12%
- Grief: 10%
- Depression: 10%
- Other: 21%

### Risk Levels
- None: 85%
- Low: 10%
- Medium: 4%
- High: 1%

---

## ✅ Quality Checklist

- [ ] All dialogues have valid structure
- [ ] Labels are accurate
- [ ] Distribution is balanced
- [ ] No duplicate dialogues
- [ ] Clinician reviewed
- [ ] Statistics calculated
- [ ] Ready for training

---

## 📈 Progress Tracking

### Current Status
- **Seed Dialogues**: 20
- **Target**: 500+
- **Generated**: 0
- **Reviewed**: 0
- **Approved**: 0

### Milestones
- [ ] 100 dialogues
- [ ] 250 dialogues
- [ ] 500 dialogues
- [ ] 1000 dialogues (stretch goal)

---

## 🐛 Troubleshooting

### Generation Issues

**Problem:** Generated dialogues are too similar
**Solution:** Increase template variety, use OpenAI generation

**Problem:** Distribution is unbalanced
**Solution:** Adjust distribution weights in expand script

### Validation Issues

**Problem:** Many validation errors
**Solution:** Review dialogue structure, fix templates

**Problem:** Missing labels
**Solution:** Use labeling tool to add labels

---

## 📚 Related Tools

- **Synthetic Generator** - Generate synthetic dialogues
- **Labeling Tool** - Add/verify labels
- **Clinician Review** - Quality control
- **Label Validator** - Validate labels

---

**Expansion tools are ready!** 🎯

Start expanding with: `python expand_seed_dialogues.py --target 500 --validate`

