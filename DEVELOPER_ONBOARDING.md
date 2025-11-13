# Developer Onboarding Guide
## AI Shadow-Self Coach — Complete Developer Guide

**Welcome to the team!** This guide will help you get up to speed quickly and start contributing to the project.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Architecture Overview](#architecture-overview)
5. [Development Workflow](#development-workflow)
6. [Code Structure](#code-structure)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## 🎯 Project Overview

### What We're Building

**AI Shadow-Self Coach** is a mobile-first AI-powered personal coach that helps users explore, integrate, and transform their "shadow self" through:

- **Compassionate AI Conversations** - Gentle, reflective coaching persona (Ari/Amara)
- **Guided Sessions** - Check-in (3-5 min), Gentle Deep (15-30 min), Micro-Practice (5-10 min)
- **Journaling & Reflection** - Save sessions, highlight insights, tag & export
- **Progress Tracking** - Mood tracking, insights, analytics with charts
- **Safety First** - Real-time risk detection, emergency resources

### Tech Stack

**Backend:**
- Node.js/Express
- PostgreSQL + Sequelize ORM
- OpenAI API (GPT-3.5/4)
- JWT authentication
- WebSocket for real-time streaming
- Vector stores (Pinecone/Weaviate) for session memory

**Mobile:**
- React Native
- Redux Toolkit
- React Navigation
- Axios for API calls

**ML:**
- Python 3.8+
- Transformers (Hugging Face)
- PyTorch
- Scikit-learn

---

## ✅ Prerequisites

### Required

1. **Node.js** (v18.0.0+)
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **PostgreSQL** (v12+)
   ```bash
   psql --version
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

### Optional (for mobile development)

5. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

6. **For iOS (Mac only):**
   - Xcode
   - CocoaPods: `sudo gem install cocoapods`

7. **For Android:**
   - Android Studio
   - Android SDK
   - JDK

### Optional (for ML training)

8. **Python** (v3.8+)
   ```bash
   python --version  # Should be 3.8 or higher
   ```

---

## 🚀 Initial Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ai
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - DB_PASSWORD=1992 (or your password)
# - DB_NAME=ai (or your database name)
# - OPENAI_API_KEY=your_key_here
# - JWT_SECRET=your_secret_here

# Create database
createdb ai  # or your database name

# Run migrations
npm run migrate

# Start development server
npm run dev
```

**✅ Backend should be running on http://localhost:3000**

### Step 3: Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 4: Mobile Setup (Optional)

```bash
cd mobile

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# In another terminal, run on device
npm run ios      # iOS
npm run android  # Android
```

### Step 5: ML Setup (Optional)

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env with OPENAI_API_KEY
```

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────┐
│   Mobile    │  React Native App
│     App     │  (iOS & Android)
└──────┬──────┘
       │ HTTP/WebSocket
       │
┌──────▼──────┐
│   Backend   │  Node.js/Express API
│     API     │  PostgreSQL Database
└──────┬──────┘
       │
┌──────▼──────┐
│   OpenAI    │  GPT-3.5/4 API
│     API     │
└─────────────┘
```

### Backend Architecture

```
backend/
├── src/
│   ├── config/          # Configuration (DB, LLM, CORS)
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   │   ├── conversation.service.js
│   │   ├── safety.service.js
│   │   ├── vectorstore.service.js
│   │   └── websocket.service.js
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   └── utils/           # Utilities
├── tests/               # Test suites
└── migrations/          # Database migrations
```

### Mobile Architecture

```
mobile/
├── src/
│   ├── screens/         # Screen components
│   │   ├── Onboarding/
│   │   ├── Home/
│   │   ├── Session/
│   │   ├── Journal/
│   │   └── Analytics/
│   ├── components/     # Reusable components
│   │   ├── Chat/
│   │   ├── Mood/
│   │   └── Emergency/
│   ├── services/       # API services
│   ├── store/          # Redux store
│   │   └── slices/     # Redux slices
│   ├── navigation/     # Navigation setup
│   ├── theme/          # Design system
│   └── utils/          # Utilities
```

### Data Flow

1. **User sends message** → Mobile app
2. **Mobile app** → Backend API (`POST /session/:id/message`)
3. **Backend** → Safety check (safety.service.js)
4. **Backend** → Retrieve context (vectorstore.service.js)
5. **Backend** → Generate response (conversation.service.js → OpenAI)
6. **Backend** → Filter response (responseFilter.js)
7. **Backend** → Save message (database)
8. **Backend** → Return response → Mobile app
9. **Mobile app** → Display message

---

## 💻 Development Workflow

### 1. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```

### 2. Code Style

**Backend (JavaScript):**
- Use ES6+ features
- Follow async/await pattern
- Use JSDoc comments for functions
- Follow existing code structure

**Mobile (React Native):**
- Use functional components with hooks
- Follow React Native best practices
- Use Redux Toolkit for state management
- Add accessibility props to components

**Naming Conventions:**
- Files: `camelCase.js` (e.g., `conversation.service.js`)
- Components: `PascalCase` (e.g., `ChatBubble.js`)
- Variables: `camelCase` (e.g., `sessionId`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)

### 3. Commit Messages

Follow conventional commits:
```
feat: add export functionality
fix: resolve authentication bug
docs: update API documentation
refactor: improve error handling
test: add unit tests for safety service
```

### 4. Before Committing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Check for console.log statements
# Remove debug code
```

---

## 📁 Code Structure

### Backend Structure

#### Controllers
Handle HTTP requests/responses:

```javascript
// backend/src/controllers/session.controller.js
exports.startSession = async (req, res, next) => {
  try {
    // 1. Validate input
    // 2. Call service
    // 3. Return response
  } catch (error) {
    next(error);
  }
};
```

#### Services
Business logic:

```javascript
// backend/src/services/conversation.service.js
async function generateResponse(userMessage, context) {
  // 1. Check safety
  // 2. Retrieve context
  // 3. Generate response
  // 4. Filter response
  // 5. Return
}
```

#### Models
Database models:

```javascript
// backend/src/models/Session.js
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: { type: DataTypes.UUID, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    // ...
  }, { underscored: true });
  return Session;
};
```

#### Routes
API endpoints:

```javascript
// backend/src/routes/session.routes.js
router.post('/start', 
  authMiddleware,
  validate(schemas.startSession),
  sessionController.startSession
);
```

### Mobile Structure

#### Screens
Full-screen components:

```javascript
// mobile/src/screens/Session/SessionScreen.js
const SessionScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  // ...
  return <View>...</View>;
};
```

#### Components
Reusable UI components:

```javascript
// mobile/src/components/Chat/ChatBubble.js
const ChatBubble = ({ message, onHighlight }) => {
  return <View>...</View>;
};
```

#### Services
API communication:

```javascript
// mobile/src/services/api.js
export const sessionAPI = {
  start: (data) => api.post('/session/start', data),
  sendMessage: (sessionId, message) => 
    api.post(`/session/${sessionId}/message`, { message_text: message }),
};
```

#### Redux Slices
State management:

```javascript
// mobile/src/store/slices/session.slice.js
const sessionSlice = createSlice({
  name: 'session',
  initialState: { activeSession: null },
  reducers: { /* ... */ },
});
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage
```

**Test Structure:**
```javascript
// backend/tests/auth.test.js
describe('POST /auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);
    
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('token');
  });
});
```

### Mobile Tests

```bash
cd mobile

# Run tests
npm test
```

### API Testing

Use Swagger UI:
```
http://localhost:3000/api-docs
```

Or use REST Client (VS Code extension):
```http
# backend/test-api.http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 🔧 Common Tasks

### Adding a New API Endpoint

1. **Create route:**
   ```javascript
   // backend/src/routes/new.routes.js
   router.post('/new-endpoint', 
     authMiddleware,
     validate(schemas.newEndpoint),
     newController.handler
   );
   ```

2. **Create controller:**
   ```javascript
   // backend/src/controllers/new.controller.js
   exports.handler = async (req, res, next) => {
     try {
       // Logic here
       res.status(200).json({ data: result });
     } catch (error) {
       next(error);
     }
   };
   ```

3. **Add validation schema:**
   ```javascript
   // backend/src/middleware/validation.middleware.js
   newEndpoint: Joi.object({
     field: Joi.string().required(),
   }),
   ```

4. **Register route in app.js:**
   ```javascript
   app.use('/api/v1/new', newRoutes);
   ```

5. **Add Swagger documentation:**
   ```javascript
   /**
    * @swagger
    * /new/endpoint:
    *   post:
    *     summary: Description
    */
   ```

### Adding a New Mobile Screen

1. **Create screen component:**
   ```javascript
   // mobile/src/screens/New/NewScreen.js
   const NewScreen = ({ navigation }) => {
     return <View>...</View>;
   };
   ```

2. **Add to navigation:**
   ```javascript
   // mobile/src/navigation/AppNavigator.js
   <Stack.Screen name="New" component={NewScreen} />
   ```

3. **Add accessibility props:**
   ```javascript
   <TouchableOpacity
     accessibilityLabel="Button label"
     accessibilityRole="button"
   >
   ```

### Creating a Database Migration

```bash
cd backend

# Create migration
npx sequelize-cli migration:generate --name add-new-column

# Edit migration file
# backend/src/migrations/XXXXXX-add-new-column.js

# Run migration
npm run migrate
```

### Adding a New Redux Slice

```javascript
// mobile/src/store/slices/new.slice.js
const newSlice = createSlice({
  name: 'new',
  initialState: { data: null },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = newSlice.actions;
export default newSlice.reducer;
```

---

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep ai

# Check .env configuration
cat backend/.env | grep DB_
```

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

**Migration errors:**
```bash
# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:undo

# Reset all migrations (⚠️ deletes data)
npm run migrate:undo:all
```

### Mobile Issues

**Metro bundler won't start:**
```bash
# Clear cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

**iOS build fails:**
```bash
# Clean build
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
npm run ios
```

**Android build fails:**
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

### Common Errors

**"Module not found":**
- Check file path is correct
- Run `npm install` again
- Clear node_modules and reinstall

**"JWT token invalid":**
- Check JWT_SECRET in .env
- Verify token hasn't expired
- Check token format in request headers

**"OpenAI API error":**
- Verify OPENAI_API_KEY in .env
- Check API key is valid
- Verify account has credits

---

## 📚 Resources

### Documentation

- **Project Spec:** `SPECIFICATION.md`
- **API Contracts:** `API_CONTRACTS.md`
- **API Docs (Swagger):** http://localhost:3000/api-docs
- **Training Guide:** `TRAINING_RECIPE.md`
- **UI Wireframes:** `UI_WIREFRAMES.md`

### Component READMEs

- `backend/README.md` - Backend documentation
- `mobile/README.md` - Mobile documentation
- `ml/README.md` - ML documentation
- `backend/SWAGGER_README.md` - API documentation guide
- `mobile/ACCESSIBILITY_GUIDE.md` - Accessibility guide

### External Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [OpenAI API](https://platform.openai.com/docs)

### Getting Help

1. **Check existing documentation**
2. **Search codebase** for similar implementations
3. **Check Swagger docs** for API endpoints
4. **Ask team** in Slack/Discord
5. **Create issue** if it's a bug

---

## ✅ Onboarding Checklist

- [ ] Prerequisites installed (Node.js, PostgreSQL, Git)
- [ ] Repository cloned
- [ ] Backend set up and running
- [ ] Database created and migrations run
- [ ] Backend tests passing
- [ ] API documentation accessible (Swagger)
- [ ] Mobile app set up (if working on mobile)
- [ ] ML environment set up (if working on ML)
- [ ] Read project specification
- [ ] Understand architecture
- [ ] Know where to find documentation
- [ ] Can run tests successfully
- [ ] Can make a simple change and test it

---

## 🎯 Next Steps

1. **Explore the codebase:**
   - Read through key files
   - Understand data flow
   - Review existing patterns

2. **Make your first contribution:**
   - Pick a small task
   - Create a feature branch
   - Make changes
   - Write tests
   - Submit PR

3. **Join team discussions:**
   - Attend standups
   - Participate in code reviews
   - Share ideas and feedback

---

## 🎉 Welcome!

You're now ready to start contributing! If you have any questions, don't hesitate to ask the team.

**Happy coding!** 🚀

---

**Last Updated:** Latest Session  
**Version:** 1.0

