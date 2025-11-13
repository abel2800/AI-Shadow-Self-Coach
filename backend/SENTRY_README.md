# Sentry Monitoring Setup
## Error Tracking & Performance Monitoring

This guide explains how to set up and use Sentry for error tracking and performance monitoring.

---

## 🎯 Overview

Sentry provides:
- **Error Tracking** - Automatic error capture and reporting
- **Performance Monitoring** - Request performance tracking
- **Release Tracking** - Track errors by version
- **User Context** - Associate errors with users
- **Breadcrumbs** - Track user actions leading to errors

---

## ⚙️ Configuration

### Environment Variables

Add to `backend/.env`:

```env
# Sentry Configuration
ENABLE_SENTRY=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
APP_VERSION=1.0.0  # Optional: for release tracking
```

### Getting Sentry DSN

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up or log in
   - Create a new project (Node.js)

2. **Get DSN**
   - Project Settings → Client Keys (DSN)
   - Copy the DSN URL
   - Add to `.env` file

3. **Enable Sentry**
   - Set `ENABLE_SENTRY=true` in `.env`

---

## 🔧 Features

### Automatic Error Tracking

Errors are automatically captured:
- Unhandled exceptions
- Unhandled promise rejections
- Server errors (500+)
- API errors

### Performance Monitoring

- Request duration tracking
- Slow request detection (>1s)
- Transaction tracing
- Performance profiling

### User Context

User information is automatically attached:
- User ID
- Email (if available)
- Request context

### Data Sanitization

Sensitive data is automatically filtered:
- Passwords
- API keys
- Tokens
- Authorization headers

---

## 📊 Usage

### Manual Error Capture

```javascript
const { captureException, captureMessage } = require('./config/sentry');

// Capture exception
try {
  // risky code
} catch (error) {
  captureException(error, {
    component: 'service-name',
    userId: user.id,
  });
}

// Capture message
captureMessage('Something went wrong', 'error', {
  component: 'service-name',
  context: 'additional info',
});
```

### Set User Context

```javascript
const { setUser } = require('./config/sentry');

// Set user for error tracking
setUser({
  id: user.id,
  email: user.email,
});
```

### Add Breadcrumbs

```javascript
const { addBreadcrumb } = require('./config/sentry');

addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
  data: { userId: user.id },
});
```

### Performance Monitoring

```javascript
const { startTransaction } = require('./config/sentry');

const transaction = startTransaction({
  name: 'Database Query',
  op: 'db.query',
});

// ... perform operation ...

transaction.finish();
```

---

## 🔒 Security

### Data Sanitization

Sentry automatically filters:
- Passwords in request bodies
- API keys
- Tokens
- Authorization headers

### Privacy

- User emails are included (can be disabled)
- IP addresses are captured (can be filtered)
- Request bodies are captured (sanitized)

### Configuration

Edit `backend/src/config/sentry.js` to:
- Adjust sanitization rules
- Change sample rates
- Filter sensitive data
- Ignore specific errors

---

## 📈 Monitoring

### Sentry Dashboard

Access your Sentry dashboard:
1. Go to https://sentry.io
2. Select your project
3. View:
   - Error trends
   - Performance metrics
   - User impact
   - Release health

### Alerts

Set up alerts in Sentry:
- Email notifications
- Slack integration
- PagerDuty integration
- Custom webhooks

### Metrics

Track:
- Error rate
- Response times
- User impact
- Release health

---

## 🧪 Testing

### Test Error Capture

```javascript
// In a route handler
app.get('/test-error', (req, res) => {
  throw new Error('Test error for Sentry');
});
```

### Verify Setup

1. Enable Sentry in `.env`
2. Trigger an error
3. Check Sentry dashboard
4. Verify error appears

---

## 🐛 Troubleshooting

### Sentry Not Capturing Errors

**Check:**
- `ENABLE_SENTRY=true` in `.env`
- `SENTRY_DSN` is set correctly
- DSN is valid
- Network connectivity

**Debug:**
```javascript
// Check if Sentry is initialized
console.log('Sentry enabled:', process.env.ENABLE_SENTRY === 'true');
console.log('Sentry DSN:', process.env.SENTRY_DSN ? 'Set' : 'Not set');
```

### Too Many Events

**Adjust sample rate:**
```javascript
// In sentry.js
tracesSampleRate: 0.1, // 10% of requests
```

### Missing Context

**Add more context:**
```javascript
captureException(error, {
  tags: { component: 'service' },
  extra: { userId: user.id },
  user: { id: user.id },
});
```

---

## 📝 Best Practices

### Error Context

Always include context:
```javascript
captureException(error, {
  component: 'conversation-service',
  userId: user.id,
  sessionId: session.id,
  requestId: req.id,
});
```

### User Identification

Set user early:
```javascript
// In auth middleware
if (req.user) {
  setUser(req.user);
}
```

### Breadcrumbs

Add breadcrumbs for debugging:
```javascript
addBreadcrumb({
  category: 'api',
  message: 'Processing request',
  level: 'info',
});
```

### Release Tracking

Tag releases:
```env
APP_VERSION=1.0.0
```

---

## 🔧 Configuration Options

### Sample Rates

```javascript
// Performance monitoring
tracesSampleRate: 0.1, // 10% in production

// Profiling
profilesSampleRate: 0.1, // 10% in production
```

### Ignore Errors

```javascript
ignoreErrors: [
  'ValidationError',
  'UnauthorizedError',
];
```

### Environment

```javascript
environment: process.env.NODE_ENV,
```

---

## ✅ Checklist

- [ ] Sentry account created
- [ ] Project created (Node.js)
- [ ] DSN obtained
- [ ] `SENTRY_DSN` added to `.env`
- [ ] `ENABLE_SENTRY=true` set
- [ ] Test error triggered
- [ ] Error appears in Sentry dashboard
- [ ] Alerts configured
- [ ] Team members added

---

## 📚 Resources

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/node/
- **Node.js Guide:** https://docs.sentry.io/platforms/javascript/guides/node/
- **Performance:** https://docs.sentry.io/product/performance/

---

**Sentry is now integrated!** 🎯

For questions, see Sentry documentation or check `backend/src/config/sentry.js`.

