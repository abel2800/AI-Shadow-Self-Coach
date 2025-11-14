# A/B Testing Framework
## Model Versioning and A/B Testing for ML Models

This guide explains how to set up and manage A/B tests for ML models.

---

## 🎯 Overview

The A/B testing framework allows you to:
- Test different model versions simultaneously
- Split traffic between variants
- Track metrics for each variant
- Make data-driven decisions about model deployments

---

## 📊 Features

- **User Assignment** - Consistent variant assignment per user
- **Traffic Splitting** - Configurable split ratios (e.g., 50/50, 80/20)
- **Metrics Tracking** - Request counts, errors, latency
- **Test Management** - Start, pause, complete tests
- **Model Versioning** - Track which model versions are being tested

---

## 🚀 Quick Start

### 1. Create an A/B Test

```bash
POST /api/v1/ab-tests
{
  "name": "Safety Classifier v2 Test",
  "model_type": "safety_classifier",
  "variant_a": "v1.0.0",
  "variant_b": "v2.0.0",
  "traffic_split": {
    "a": 0.5,
    "b": 0.5
  }
}
```

### 2. Start the Test

```bash
POST /api/v1/ab-tests/{test_id}/start
```

### 3. Monitor Results

```bash
GET /api/v1/ab-tests/{test_id}
```

### 4. Complete the Test

```bash
POST /api/v1/ab-tests/{test_id}/complete
{
  "winner": "b"  // or "a", or null
}
```

---

## 📋 API Endpoints

### Create A/B Test

```http
POST /api/v1/ab-tests
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Test Name",
  "model_type": "safety_classifier",
  "variant_a": "v1.0.0",
  "variant_b": "v2.0.0",
  "traffic_split": { "a": 0.5, "b": 0.5 }
}
```

### List Tests

```http
GET /api/v1/ab-tests?model_type=safety_classifier&status=active
```

### Get Test Stats

```http
GET /api/v1/ab-tests/{test_id}
```

### Start Test

```http
POST /api/v1/ab-tests/{test_id}/start
```

### Pause Test

```http
POST /api/v1/ab-tests/{test_id}/pause
```

### Complete Test

```http
POST /api/v1/ab-tests/{test_id}/complete
{
  "winner": "b"
}
```

### Get User Variant

```http
GET /api/v1/ab-tests/user/variant?model_type=safety_classifier
```

---

## 🔧 How It Works

### User Assignment

1. User makes a request
2. System checks for active A/B tests for the model type
3. If test exists, user is assigned to a variant (consistent per user)
4. Model version is selected based on variant
5. Metrics are recorded

### Traffic Splitting

- **50/50 Split**: `{ "a": 0.5, "b": 0.5 }`
- **80/20 Split**: `{ "a": 0.8, "b": 0.2 }`
- **90/10 Split**: `{ "a": 0.9, "b": 0.1 }`

### Metrics Tracking

The system automatically tracks:
- **Requests** - Number of requests per variant
- **Errors** - Number of errors per variant
- **Latency** - Average response time per variant

---

## 📈 Example Workflow

### Step 1: Deploy New Model Version

```bash
# Deploy v2.0.0 of safety classifier
python deploy_model.py \
  --type safety_classifier \
  --model-path models/safety_classifier_v2.pt \
  --version v2.0.0
```

### Step 2: Create A/B Test

```bash
curl -X POST http://localhost:3000/api/v1/ab-tests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Safety Classifier v2 Test",
    "model_type": "safety_classifier",
    "variant_a": "v1.0.0",
    "variant_b": "v2.0.0",
    "traffic_split": { "a": 0.5, "b": 0.5 }
  }'
```

### Step 3: Start Test

```bash
curl -X POST http://localhost:3000/api/v1/ab-tests/{test_id}/start \
  -H "Authorization: Bearer {token}"
```

### Step 4: Monitor

```bash
curl http://localhost:3000/api/v1/ab-tests/{test_id} \
  -H "Authorization: Bearer {token}"
```

Response:
```json
{
  "test_id": "...",
  "name": "Safety Classifier v2 Test",
  "status": "active",
  "metrics": {
    "variant_a": {
      "requests": 1000,
      "errors": 5,
      "avg_latency": 120
    },
    "variant_b": {
      "requests": 1000,
      "errors": 3,
      "avg_latency": 115
    }
  },
  "assignments": {
    "variant_a": 1000,
    "variant_b": 1000,
    "total": 2000
  }
}
```

### Step 5: Complete Test

```bash
curl -X POST http://localhost:3000/api/v1/ab-tests/{test_id}/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"winner": "b"}'
```

---

## 🎛️ Test Statuses

- **draft** - Test created but not started
- **active** - Test is running
- **paused** - Test is temporarily paused
- **completed** - Test has finished

---

## 📊 Metrics

### Request Metrics

- **Total Requests** - Number of requests per variant
- **Error Rate** - Percentage of requests that failed
- **Average Latency** - Mean response time

### Custom Metrics

You can add custom metrics by recording them:

```javascript
await abTestService.recordMetric(testId, variant, 'custom_metric', value);
```

---

## 🔄 Integration

### Conversation Service

The conversation service automatically uses A/B tested models:

```javascript
// In conversation.service.js
const versionInfo = await abTestService.getModelVersionForUser(
  userId,
  'intent_classifier'
);

if (versionInfo) {
  const model = await mlModelService.loadModel(
    'intent_classifier',
    versionInfo.version
  );
  // Use model...
}
```

### Safety Service

Similar integration for safety classifier:

```javascript
const versionInfo = await abTestService.getModelVersionForUser(
  userId,
  'safety_classifier'
);
```

---

## 🎯 Best Practices

1. **Start Small** - Begin with 10/90 split to minimize risk
2. **Monitor Closely** - Watch metrics daily during tests
3. **Set Criteria** - Define success criteria before starting
4. **Run Long Enough** - Ensure statistical significance
5. **Document Results** - Record findings for future reference

---

## 📝 Test Criteria Examples

```json
{
  "criteria": {
    "min_requests": 10000,
    "max_error_rate": 0.01,
    "max_latency_ms": 200,
    "min_improvement": 0.05
  }
}
```

---

## 🐛 Troubleshooting

### Users Not Getting Assigned

- Check test status is "active"
- Verify model versions exist
- Check database for assignment records

### Metrics Not Updating

- Verify metrics are being recorded
- Check database for metric updates
- Review logs for errors

### Test Won't Start

- Verify both model versions exist
- Check traffic split sums to 1.0
- Ensure test is in "draft" status

---

## 📚 Database Schema

### ab_tests

- `id` - UUID
- `name` - String
- `model_type` - Enum
- `variant_a` - String (model version)
- `variant_b` - String (model version)
- `traffic_split` - JSONB
- `status` - Enum
- `metrics` - JSONB
- `start_date` - Date
- `end_date` - Date

### ab_test_assignments

- `id` - UUID
- `user_id` - UUID
- `ab_test_id` - UUID
- `variant` - Enum ('a' or 'b')
- `assigned_at` - Date

---

**A/B testing framework is ready!** 🎯

For questions, see the API documentation or check the service implementation.

