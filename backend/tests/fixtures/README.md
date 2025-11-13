# Test Fixtures

Reusable test data and factory functions for creating consistent test scenarios.

## Structure

```
tests/
├── fixtures/              # Test data fixtures
│   ├── users.fixture.js   # User test data
│   ├── sessions.fixture.js # Session test data
│   ├── messages.fixture.js # Message test data
│   ├── moods.fixture.js   # Mood test data
│   └── index.js          # Central export
└── factories/            # Factory functions
    └── test-data.factory.js # Data creation factories
```

## Usage

### Using Fixtures

```javascript
const fixtures = require('./fixtures');

// Create user data
const userData = await fixtures.createUserData('standard', {
  email: 'custom@example.com'
});

// Create session data
const sessionData = fixtures.createSessionData('completedGentleDeep');

// Create message data
const messageData = fixtures.createMessageData('user', 'anxious');
```

### Using Factories

```javascript
const factory = require('./factories/test-data.factory');

// Create user with token
const { user, token } = await factory.createTestUserWithToken('standard');

// Create complete session with messages
const { session, messages } = await factory.createCompleteSession(
  user.id,
  'completedGentleDeep',
  4 // message count
);

// Create multiple sessions
const sessions = await factory.createMultipleSessions(user.id, 5, 0);

// Create mood history
const moods = await factory.createMoodHistory(user.id, 7, 5);

// Create complete test scenario
const scenario = await factory.createCompleteTestScenario({
  userFixture: 'standard',
  sessionCount: 3,
  moodDays: 7,
  messagesPerSession: 4
});

// Clean up
await factory.cleanupTestData([user.id]);
```

## Available Fixtures

### User Fixtures
- `standard` - Standard test user
- `withConsent` - User with research consent
- `minimal` - Minimal user (required fields only)
- `fullPreferences` - User with all preferences

### Session Fixtures
- `activeCheckIn` - Active check-in session
- `completedGentleDeep` - Completed gentle deep session
- `completedMicroPractice` - Completed micro practice
- `highRiskSession` - Session with high risk detection
- `sessionWithMessages` - Session with multiple messages

### Message Fixtures
- User messages: `standard`, `anxious`, `sad`, `grateful`, `confused`
- Risk messages: `highRisk`, `mediumRisk`, `lowRisk`
- Assistant messages: `welcoming`, `reflective`, `supportive`, `exploratory`, `crisisResponse`

### Mood Fixtures
- Score ranges: `veryLow`, `low`, `neutral`, `good`, `veryGood`, `excellent`
- Notes: `anxious`, `grateful`, `tired`, `hopeful`, `overwhelmed`

## Best Practices

1. **Use factories for complex scenarios** - Factories handle relationships and dependencies
2. **Clean up after tests** - Always clean up test data in `afterAll` or `afterEach`
3. **Use unique emails** - Fixtures automatically generate unique emails
4. **Override when needed** - Pass overrides to customize fixture data
5. **Reuse fixtures** - Don't duplicate test data, use fixtures

## Examples

### Simple Test

```javascript
const factory = require('./factories/test-data.factory');

describe('My Test', () => {
  let user, token;

  beforeAll(async () => {
    const result = await factory.createTestUserWithToken();
    user = result.user;
    token = result.token;
  });

  afterAll(async () => {
    await factory.cleanupTestData([user.id]);
  });

  it('should do something', async () => {
    // Test code
  });
});
```

### Complex Test Scenario

```javascript
const factory = require('./factories/test-data.factory');

describe('Complex Test', () => {
  let scenario;

  beforeAll(async () => {
    scenario = await factory.createCompleteTestScenario({
      sessionCount: 5,
      moodDays: 14,
      messagesPerSession: 6
    });
  });

  afterAll(async () => {
    await factory.cleanupTestData([scenario.user.id]);
  });

  it('should test complete workflow', async () => {
    // Test with scenario.user, scenario.sessions, scenario.moods
  });
});
```

