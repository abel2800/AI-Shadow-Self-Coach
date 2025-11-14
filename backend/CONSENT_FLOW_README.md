# Consent Flow for Research Data Collection
## User Consent Management System

This guide explains the consent flow for research data collection in the AI Shadow-Self Coach application.

---

## 🎯 Overview

The consent system allows users to:
- Grant or revoke consent for research data collection
- View their consent history
- Understand what data is collected
- Renew consent when policies change

---

## 📋 Consent Types

1. **Research** - Use anonymized data for ML model training
2. **Data Processing** - Process data for service improvement
3. **Analytics** - Use data for analytics and insights
4. **Third Party** - Share data with third parties (if applicable)

---

## 🔄 Consent Flow

### 1. Initial Consent (Onboarding)

During registration, users can opt-in to research:

```javascript
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "consent_for_research": true  // Optional, defaults to false
}
```

### 2. Update Consent

Users can update their consent at any time:

```javascript
POST /api/v1/consent
{
  "consent_type": "research",
  "granted": true,
  "version": "1.0"
}
```

### 3. Check Consent Status

```javascript
GET /api/v1/consent?type=research
```

Response:
```json
{
  "has_consent": true,
  "granted": true,
  "last_updated": "2024-01-15T10:30:00Z",
  "version": "1.0",
  "needs_renewal": false
}
```

### 4. View Consent History

```javascript
GET /api/v1/consent/history?type=research
```

### 5. Revoke Consent

```javascript
POST /api/v1/consent/revoke?type=research
```

---

## 🔒 Privacy & Compliance

### GDPR Compliance

- **Right to Access** - Users can view their consent history
- **Right to Withdraw** - Users can revoke consent at any time
- **Data Minimization** - Only collect data with explicit consent
- **Transparency** - Clear consent text explaining data use

### Data Collection Rules

1. **With Consent:**
   - Anonymized session data can be used for training
   - Analytics data can be collected
   - Data can be used for model improvement

2. **Without Consent:**
   - No data used for research
   - No anonymized data collection
   - Only essential service data collected

---

## 📊 Consent Statistics

Admin endpoint for consent statistics:

```javascript
GET /api/v1/consent/statistics?type=research
```

Response:
```json
{
  "total_users": 1000,
  "users_with_consent": 350,
  "consent_rate": 35.0,
  "recent_trends": [...]
}
```

---

## 🔄 Consent Renewal

Consent may need renewal when:
- Policy version changes
- Consent is older than 1 year (optional)
- New data collection purposes are added

Check if renewal is needed:

```javascript
GET /api/v1/consent
// Returns needs_renewal: true if renewal required
```

---

## 📝 Consent Text Template

Example consent text:

```
Research Data Collection Consent

By granting consent, you agree to allow us to use anonymized data from your 
sessions for:

1. Training and improving our AI models
2. Research on therapeutic conversation patterns
3. Developing better mental health support tools

Your data will be:
- Anonymized (no personal identifiers)
- Encrypted and stored securely
- Used only for research purposes
- Never shared with third parties without additional consent

You can revoke this consent at any time. Revoking consent will not affect 
your ability to use the app.

Consent Version: 1.0
Last Updated: 2024-01-01
```

---

## 🛠️ Implementation

### Database Schema

**consents table:**
- `id` - UUID
- `user_id` - UUID (foreign key to users)
- `consent_type` - ENUM
- `granted` - BOOLEAN
- `consent_text` - TEXT (what was shown to user)
- `version` - STRING (policy version)
- `ip_address` - STRING (for audit)
- `user_agent` - STRING (for audit)
- `metadata` - JSONB
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Service Methods

```javascript
// Check consent
const hasConsent = await consentService.hasActiveConsent(userId, 'research');

// Update consent
await consentService.updateConsent(userId, {
  consent_type: 'research',
  granted: true,
  version: '1.0'
}, requestInfo);

// Get consent status
const status = await consentService.getConsentStatus(userId, 'research');
```

---

## 🔍 Data Collection Integration

### Respect Consent in Services

```javascript
// In conversation service
async function generateResponse(userMessage, context) {
  // Check consent before collecting data
  const hasConsent = await consentService.hasActiveConsent(
    context.user_id, 
    'research'
  );
  
  if (hasConsent) {
    // Log anonymized data for research
    await logResearchData(context.user_id, anonymizedData);
  }
  
  // Continue with response generation
  // ...
}
```

---

## 📱 Mobile Integration

### Onboarding Screen

```javascript
// Show consent checkbox
<Checkbox
  value={consentForResearch}
  onValueChange={setConsentForResearch}
  label="I consent to anonymized data being used for research"
/>

// Include consent text
<Text>{CONSENT_TEXT}</Text>
```

### Settings Screen

```javascript
// Allow users to update consent
<Toggle
  value={consentStatus.granted}
  onValueChange={handleConsentUpdate}
  label="Research Data Collection"
/>
```

---

## ✅ Best Practices

1. **Default to No Consent** - Always default to `false`
2. **Clear Communication** - Explain what consent means
3. **Easy Revocation** - Make it easy to revoke consent
4. **Audit Trail** - Track all consent changes
5. **Regular Renewal** - Check for policy updates
6. **Respect Choices** - Never collect data without consent

---

## 🐛 Troubleshooting

### Consent Not Saving

**Check:**
- User is authenticated
- Request includes `granted` boolean
- Database connection is working

### Consent History Missing

**Check:**
- User ID is correct
- Consent records exist in database
- Query parameters are correct

---

## 📚 Related Documentation

- Privacy Policy (to be created)
- Terms of Service (to be created)
- GDPR Compliance Guide (to be created)

---

**Consent flow is ready!** 🎯

Users can now manage their consent for research data collection.

