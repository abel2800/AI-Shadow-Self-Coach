# Backend Tests

This directory contains test files for the backend API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up test environment variables in `.env.test`:
```
NODE_ENV=test
DATABASE_URL=postgresql://user:password@localhost:5432/shadow_coach_test
JWT_SECRET=test-secret-key
```

3. Create test database:
```bash
createdb shadow_coach_test
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run specific test file:
```bash
npm test -- auth.test.js
```

Run with coverage:
```bash
npm test -- --coverage
```

## Test Structure

- `setup.js` - Test configuration and setup/teardown
- `helpers.js` - Utility functions for tests
- `auth.test.js` - Authentication endpoint tests
- `session.test.js` - Session endpoint tests
- `analytics.test.js` - Analytics endpoint tests
- `health.test.js` - Health check tests

## Writing Tests

### Example Test

```javascript
describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/v1/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Using Helpers

```javascript
const { createTestUser, generateAuthToken } = require('./helpers');

const user = await createTestUser('test@example.com');
const token = generateAuthToken(user);
```

## Test Coverage

Aim for:
- 80%+ code coverage
- All critical paths tested
- Error cases covered
- Edge cases considered

