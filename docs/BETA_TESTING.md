# Beta Testing Guide

## Overview

The beta testing program allows us to gather feedback from early users to improve the AI Shadow-Self Coach app before public release.

## Enrollment

### For Users

1. **Sign up** for an account in the app
2. **Navigate** to Settings > Beta Testing
3. **Enroll** in the beta program
4. **Consent** to provide feedback (optional but recommended)

### For Administrators

Enroll users programmatically via API or database:

```sql
INSERT INTO beta_testers (user_id, cohort, status, feedback_consent)
VALUES ('<user_id>', 'early_access', 'active', true);
```

## Cohorts

- **early_access**: First 100 users, get new features first
- **general**: Standard beta testers
- **control**: Control group for A/B testing

## Feedback Types

### 1. Bug Reports

Report issues you encounter:

- **Category**: UI, AI Response, Performance, Safety, Other
- **Severity**: Low, Medium, High, Critical
- **Steps to reproduce**: What you did before the issue
- **Expected vs Actual**: What should happen vs what happened

### 2. Feature Requests

Suggest new features or improvements:

- **Category**: Feature area
- **Description**: What you'd like to see
- **Use case**: Why this would be helpful

### 3. Session Feedback

Provide feedback on specific coaching sessions:

- **Session ID**: Link to the session
- **Rating**: 1-5 stars
- **What worked well**: Positive aspects
- **What could improve**: Areas for improvement

### 4. Surveys

Periodic surveys about your experience:

- Sent via in-app notifications
- Usually 5-10 questions
- Takes 2-3 minutes

### 5. General Feedback

Any other thoughts or suggestions.

## Submitting Feedback

### Via Mobile App

1. Go to Settings > Beta Testing > Submit Feedback
2. Select feedback type
3. Fill out the form
4. Submit

### Via API

```bash
POST /api/v1/beta/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback_type": "bug_report",
  "category": "ui",
  "title": "Button not clickable",
  "content": "The submit button on the session screen doesn't respond to taps",
  "metadata": {
    "app_version": "1.0.0",
    "device_info": "iPhone 13, iOS 17.0",
    "severity": "high"
  }
}
```

## Feedback Management

### Status Workflow

1. **new**: Just submitted, awaiting review
2. **reviewed**: Team has seen it
3. **in_progress**: Being worked on
4. **resolved**: Fixed/implemented
5. **closed**: Won't fix or duplicate

### Priority Levels

- **critical**: Blocks core functionality, fix immediately
- **high**: Significant issue, fix soon
- **medium**: Moderate issue, fix in next release
- **low**: Minor issue, nice to have

## Beta Tester Benefits

- **Early access** to new features
- **Direct communication** with the development team
- **Influence** on product direction
- **Recognition** in release notes (optional)

## Responsibilities

### Beta Testers

- Use the app regularly
- Report bugs and issues
- Provide honest feedback
- Respect privacy and confidentiality
- Follow community guidelines

### Development Team

- Respond to feedback promptly
- Keep testers informed of fixes
- Provide support for issues
- Respect tester privacy
- Incorporate feedback into development

## Withdrawing from Beta

You can withdraw from the beta program at any time:

1. Go to Settings > Beta Testing
2. Tap "Withdraw from Beta"
3. Confirm withdrawal

Your account will remain active, but you'll no longer receive beta features or feedback requests.

## Privacy

- All feedback is confidential
- Personal information is protected
- Feedback may be anonymized for analysis
- See [Privacy Policy](../docs/PRIVACY_POLICY.md) for details

## Support

For questions about beta testing:

- **Email**: beta@shadowcoach.ai
- **In-app**: Settings > Help & Support
- **Slack**: #beta-testers channel (if applicable)

## FAQ

### Q: Do I need to provide feedback?

A: No, but it's highly encouraged! Your feedback helps us improve the app.

### Q: Will I lose access if I don't provide feedback?

A: No, but active feedback providers may get priority for new features.

### Q: How long is the beta program?

A: The beta program will continue until public release, and may continue afterward for new features.

### Q: Can I share the app with others?

A: Please don't share beta access codes. We want to control the beta user base.

### Q: What if I find a critical bug?

A: Report it immediately via the app or email beta@shadowcoach.ai with "CRITICAL" in the subject.

---

**Thank you for being a beta tester!** Your feedback is invaluable in making AI Shadow-Self Coach the best it can be.

