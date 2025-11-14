# Synthetic Data Generation
## Generate and Review Synthetic Training Examples

This guide explains how to generate synthetic training data and have it reviewed by clinicians.

---

## 🎯 Overview

The synthetic data generation workflow:
1. **Generate** - Create synthetic dialogues using templates or LLM
2. **Review** - Clinicians review and approve/reject
3. **Apply** - Filter approved dialogues for training
4. **Merge** - Combine with seed dialogues

---

## 🚀 Quick Start

### 1. Generate Synthetic Data

```bash
# Generate 50 dialogues using templates
python generate_synthetic_data.py --count 50 --output synthetic_dialogues.json

# Generate with OpenAI (requires API key)
python generate_synthetic_data.py --count 50 --output synthetic_dialogues.json --use-openai

# Generate specific concerns
python generate_synthetic_data.py --count 20 --concerns anxiety self-worth --output synthetic.json
```

### 2. Clinician Review

```bash
python clinician_review.py --input synthetic_dialogues.json --output reviews.json
```

### 3. Apply Reviews

```bash
python apply_reviews.py --data synthetic_dialogues.json --reviews reviews.json --output approved_dialogues.json
```

---

## 📋 Tools

### 1. Generate Synthetic Data (`generate_synthetic_data.py`)

Generates synthetic training dialogues.

**Features:**
- Template-based generation (no API required)
- OpenAI-based generation (higher quality)
- Configurable concerns and session types
- Automatic labeling

**Usage:**
```bash
python generate_synthetic_data.py \
  --count 100 \
  --output synthetic.json \
  --seed ../SEED_DIALOGUES.json \
  --concerns anxiety self-worth relationships \
  --session-types gentle_deep check-in
```

**Options:**
- `--count, -n`: Number of dialogues to generate
- `--output, -o`: Output file path
- `--seed, -s`: Seed dialogues file for patterns
- `--concerns, -c`: Specific concerns to generate
- `--session-types, -t`: Session types to generate
- `--use-openai`: Use OpenAI API (requires API key)

---

### 2. Clinician Review (`clinician_review.py`)

Interactive tool for clinicians to review synthetic data.

**Features:**
- Review each dialogue
- Approve, reject, or mark for revision
- Add notes and feedback
- Track review progress

**Usage:**
```bash
python clinician_review.py \
  --input synthetic_dialogues.json \
  --output reviews.json
```

**Review Options:**
1. **Approve** - Ready for training
2. **Needs Revision** - Requires changes
3. **Reject** - Not suitable
4. **Skip** - Review later
5. **Add Notes** - Add feedback

---

### 3. Apply Reviews (`apply_reviews.py`)

Filters training data based on clinician reviews.

**Features:**
- Filter approved dialogues
- Optionally include "needs revision"
- Generate summary statistics
- Mark reviewed dialogues

**Usage:**
```bash
python apply_reviews.py \
  --data synthetic_dialogues.json \
  --reviews reviews.json \
  --output approved_dialogues.json
```

**Options:**
- `--include-revision`: Include dialogues marked for revision

---

## 🔄 Complete Workflow

### Step 1: Generate Synthetic Data

```bash
# Generate 200 dialogues
python generate_synthetic_data.py \
  --count 200 \
  --output data/synthetic_batch1.json \
  --seed ../SEED_DIALOGUES.json
```

### Step 2: Clinician Review

```bash
# Review generated dialogues
python clinician_review.py \
  --input data/synthetic_batch1.json \
  --output data/reviews_batch1.json
```

### Step 3: Apply Reviews

```bash
# Filter approved dialogues
python apply_reviews.py \
  --data data/synthetic_batch1.json \
  --reviews data/reviews_batch1.json \
  --output data/approved_batch1.json
```

### Step 4: Merge with Seed Dialogues

```bash
# Use merge_labels.py or custom script to combine
python merge_labels.py \
  --files ../SEED_DIALOGUES.json data/approved_batch1.json \
  --output data/combined_training_data.json
```

---

## 📊 Quality Guidelines

### For Clinicians Reviewing

**Approve if:**
- ✅ Dialogue is realistic and natural
- ✅ Assistant responses are appropriate
- ✅ Therapeutic techniques are correctly applied
- ✅ Safety protocols are followed
- ✅ Labels are accurate

**Reject if:**
- ❌ Dialogue is unrealistic or artificial
- ❌ Assistant responses are inappropriate
- ❌ Safety concerns not addressed
- ❌ Labels are incorrect
- ❌ Contains harmful content

**Needs Revision if:**
- ⚠️ Minor issues that can be fixed
- ⚠️ Labels need adjustment
- ⚠️ Response tone needs refinement

---

## 🎨 Generation Methods

### Template-Based Generation

- **Pros:** Fast, no API costs, reproducible
- **Cons:** Less variety, may feel formulaic
- **Use when:** Need large volume quickly

### OpenAI-Based Generation

- **Pros:** Higher quality, more natural, diverse
- **Cons:** API costs, requires API key
- **Use when:** Need high-quality examples

### Hybrid Approach

- Use templates for 70% of data
- Use OpenAI for 30% of data
- Best balance of quality and cost

---

## 📈 Statistics

### Target Distribution

- **Session Types:**
  - Check-in: 30%
  - Gentle Deep: 50%
  - Micro Practice: 20%

- **Concerns:**
  - Self-worth: 20%
  - Anxiety: 25%
  - Relationships: 15%
  - Stress: 15%
  - Grief: 10%
  - Other: 15%

- **Risk Levels:**
  - None: 85%
  - Low: 10%
  - Medium: 4%
  - High: 1%

---

## ✅ Best Practices

1. **Generate in batches** - Review 50-100 at a time
2. **Diverse concerns** - Cover all concern types
3. **Quality over quantity** - Better to have fewer, high-quality examples
4. **Regular review** - Review frequently, don't let backlog grow
5. **Track statistics** - Monitor distribution and quality
6. **Iterate** - Use feedback to improve generation

---

## 🐛 Troubleshooting

### Generation Issues

**Problem:** OpenAI generation fails
**Solution:** Check API key, fall back to templates

**Problem:** Generated dialogues are too similar
**Solution:** Increase temperature, use more diverse templates

### Review Issues

**Problem:** Review tool crashes
**Solution:** Check file format, ensure valid JSON

**Problem:** Can't navigate reviews
**Solution:** Use 'prev' and 'next' commands

---

## 📚 Related Tools

- **Labeling Tool** - Add/verify labels
- **Label Validator** - Validate label quality
- **Merge Labels** - Combine multiple datasets

---

**Synthetic data generation is ready!** 🎯

Start generating with: `python generate_synthetic_data.py --count 50 --output synthetic.json`

