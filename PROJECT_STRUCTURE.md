# Project Structure
## AI Shadow-Self Coach Mobile App

```
shadow-coach-app/
├── docs/                          # Documentation
│   ├── SPECIFICATION.md
│   ├── API_CONTRACTS.md
│   ├── TRAINING_RECIPE.md
│   ├── UI_WIREFRAMES.md
│   └── SEED_DIALOGUES.json
│
├── backend/                       # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   │   ├── database.js
│   │   │   ├── encryption.js
│   │   │   └── llm.js
│   │   ├── controllers/          # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── session.controller.js
│   │   │   ├── conversation.controller.js
│   │   │   ├── journal.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── safety.controller.js
│   │   ├── services/             # Business logic
│   │   │   ├── conversation.service.js
│   │   │   ├── safety.service.js
│   │   │   ├── memory.service.js
│   │   │   ├── journal.service.js
│   │   │   └── llm.service.js
│   │   ├── models/               # Database models
│   │   │   ├── User.js
│   │   │   ├── Session.js
│   │   │   ├── Message.js
│   │   │   ├── Journal.js
│   │   │   └── Mood.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   ├── routes/               # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── session.routes.js
│   │   │   ├── conversation.routes.js
│   │   │   ├── journal.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── safety.routes.js
│   │   ├── utils/                # Utility functions
│   │   │   ├── responseFilter.js
│   │   │   ├── encryption.js
│   │   │   └── validators.js
│   │   └── app.js                # Express app setup
│   ├── tests/                    # Backend tests
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Entry point
│
├── mobile/                       # Mobile App (React Native)
│   ├── src/
│   │   ├── screens/              # Screen components
│   │   │   ├── Onboarding/
│   │   │   │   ├── WelcomeScreen.js
│   │   │   │   ├── PrivacyScreen.js
│   │   │   │   ├── MoodBaselineScreen.js
│   │   │   │   └── PreferencesScreen.js
│   │   │   ├── Home/
│   │   │   │   └── HomeScreen.js
│   │   │   ├── Session/
│   │   │   │   ├── SessionScreen.js
│   │   │   │   └── SessionSummaryScreen.js
│   │   │   ├── Journal/
│   │   │   │   ├── JournalScreen.js
│   │   │   │   └── JournalEntryScreen.js
│   │   │   ├── Analytics/
│   │   │   │   └── AnalyticsScreen.js
│   │   │   └── Resources/
│   │   │       └── ResourcesScreen.js
│   │   ├── components/          # Reusable components
│   │   │   ├── Chat/
│   │   │   │   ├── ChatBubble.js
│   │   │   │   └── ChatInput.js
│   │   │   ├── Mood/
│   │   │   │   └── MoodSlider.js
│   │   │   ├── Session/
│   │   │   │   └── SessionCard.js
│   │   │   └── Emergency/
│   │   │       └── EmergencyModal.js
│   │   ├── services/             # API services
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── session.service.js
│   │   │   └── journal.service.js
│   │   ├── store/                # State management (Redux/Zustand)
│   │   │   ├── slices/
│   │   │   │   ├── auth.slice.js
│   │   │   │   ├── session.slice.js
│   │   │   │   └── journal.slice.js
│   │   │   └── store.js
│   │   ├── utils/                # Utility functions
│   │   │   ├── encryption.js
│   │   │   ├── storage.js
│   │   │   └── validators.js
│   │   ├── navigation/           # Navigation setup
│   │   │   └── AppNavigator.js
│   │   ├── theme/                # Design system
│   │   │   ├── colors.js
│   │   │   ├── typography.js
│   │   │   └── spacing.js
│   │   └── App.js                # Root component
│   ├── assets/                   # Images, fonts, etc.
│   ├── android/                   # Android native code
│   ├── ios/                       # iOS native code
│   ├── .env.example
│   ├── package.json
│   └── app.json
│
├── ml/                           # ML Training & Models
│   ├── training/
│   │   ├── train_persona_model.py
│   │   ├── train_safety_classifier.py
│   │   ├── train_intent_classifier.py
│   │   └── evaluate_models.py
│   ├── models/                   # Trained models
│   │   ├── safety_classifier/
│   │   └── intent_classifier/
│   ├── data/                     # Training data
│   │   ├── seed_dialogues.json
│   │   ├── labeled_data/
│   │   └── test_sets/
│   ├── utils/                    # ML utilities
│   │   ├── data_preprocessing.py
│   │   ├── response_filter.py
│   │   └── evaluation.py
│   ├── requirements.txt
│   └── README.md
│
├── shared/                       # Shared code/types
│   ├── types/                    # TypeScript types (if using TS)
│   │   ├── session.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   └── constants/               # Shared constants
│       ├── intents.js
│       ├── risk_levels.js
│       └── session_types.js
│
├── scripts/                      # Utility scripts
│   ├── setup.sh                  # Initial setup script
│   ├── seed_db.js                # Database seeding
│   └── deploy.sh                 # Deployment script
│
├── .gitignore
├── .env.example                  # Example environment variables
├── docker-compose.yml            # Docker setup (optional)
├── README.md
└── package.json                  # Root package.json (if monorepo)
```

