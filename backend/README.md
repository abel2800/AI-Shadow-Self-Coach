# Shadow Coach Backend API

Backend API for the AI Shadow-Self Coach mobile app.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database:**
   ```bash
   createdb shadow_coach
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key for LLM
- `CRISIS_HOTLINE_US` - Crisis hotline number (default: 988)

## API Endpoints

See `API_CONTRACTS.md` for complete API documentation.

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Sessions
- `POST /api/v1/session/start` - Start new session
- `POST /api/v1/session/:id/message` - Send message
- `POST /api/v1/session/:id/pause` - Pause session
- `POST /api/v1/session/:id/resume` - Resume session
- `POST /api/v1/session/:id/end` - End session
- `GET /api/v1/session/:id/summary` - Get session summary
- `GET /api/v1/session` - List sessions

### Journal
- `GET /api/v1/journal/entries` - List journal entries
- `GET /api/v1/journal/entry/:session_id` - Get entry detail
- `POST /api/v1/journal/export` - Export entries

### Analytics
- `POST /api/v1/analytics/mood` - Submit mood score
- `GET /api/v1/analytics/mood` - Get mood history
- `GET /api/v1/analytics/progress` - Get progress summary

### Safety
- `POST /api/v1/safety/check-in` - Submit safety check-in
- `GET /api/v1/safety/resources` - Get crisis resources

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── utils/           # Utility functions
├── tests/               # Tests
├── .env.example         # Example environment variables
└── package.json
```

## Next Steps

1. Set up database migrations (Sequelize migrations)
2. Implement vector store for session memory
3. Integrate trained safety classifier
4. Add WebSocket support for real-time streaming
5. Implement export functionality (PDF/text)

