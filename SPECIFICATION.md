# AI Shadow-Self Coach — "Gentle & Deep" Mobile App
## Complete Developer-Ready Specification

**Version:** 1.0  
**Date:** 2024  
**Project:** AI Shadow-Self Coach Mobile Application

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Target Users & Personas](#target-users--personas)
4. [Core Product Pillars](#core-product-pillars)
5. [AI Persona & Voice Guidelines](#ai-persona--voice-guidelines)
6. [Conversation Design & Flows](#conversation-design--flows)
7. [Safety & Ethical Constraints](#safety--ethical-constraints)
8. [Data & Dataset Specifications](#data--dataset-specifications)
9. [Model Architecture & Training](#model-architecture--training)
10. [API Contracts](#api-contracts)
11. [Mobile App Screens & Flows](#mobile-app-screens--flows)
12. [Evaluation Metrics](#evaluation-metrics)
13. [MVP Timeline & Milestones](#mvp-timeline--milestones)
14. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

**High-level Summary:** Build a mobile-first AI-powered personal coach that helps users explore, integrate, and transform their "shadow self" through compassionate, evidence-based conversational therapy techniques, micro-interventions, reflective exercises, and personalized progress tracking.

**Goal:** Produce a complete, developer-ready plan enabling engineers, designers, and ML practitioners to build the MVP immediately.

**Key Differentiators:**
- Privacy-first architecture with on-device encryption
- Evidence-based therapeutic techniques (Socratic questioning, Cognitive Reframing, Compassion-Focused Therapy)
- Multi-layered safety system with real-time risk detection
- Structured session types (Check-in, Gentle Deep, Micro-Practice)
- Exportable journaling with insights tracking

---

## Architecture Overview

### System Architecture (Text Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native/iOS/Android)     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Onboard  │  │  Home    │  │  Session   │  │  Journal │  │
│  │  Flow    │  │  Screen  │  │   Screen   │  │  Screen  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS/TLS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (REST + WebSocket)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Session Mgmt │  │ Analytics    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Conversation Service                                  │  │
│  │  ├─ LLM Integration (Fine-tuned Model)                │  │
│  │  ├─ Safety Classifier (Real-time Risk Detection)     │  │
│  │  ├─ Intent Classifier                                  │  │
│  │  └─ Response Filter (Hard Constraints)                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Memory Service                                        │  │
│  │  ├─ Vector Store (Session Memory)                     │  │
│  │  ├─ User Preferences                                  │  │
│  │  └─ Prior Session Summaries                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Journaling Service                                    │  │
│  │  ├─ Session Storage (Encrypted)                       │  │
│  │  ├─ Tag Management                                    │  │
│  │  └─ Export Engine (PDF/Text)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Vector DB    │  │ Encrypted    │      │
│  │ (Metadata)   │  │ (Embeddings) │  │ File Store   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Crisis       │  │ Therapist    │  │ Analytics    │      │
│  │ Hotline API  │  │ Referral     │  │ Platform     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Recommendations

**Mobile:**
- React Native (cross-platform) or native iOS/Android
- State management: Redux or Zustand
- Local storage: Encrypted SQLite or Realm

**Backend:**
- API: Node.js/Express or Python/FastAPI
- LLM: OpenAI API (MVP) or self-hosted Llama/Mistral (post-MVP)
- Vector DB: Pinecone, Weaviate, or Qdrant
- Database: PostgreSQL with encryption at rest
- Real-time: WebSocket for session streaming

**ML/Data:**
- Fine-tuning: Hugging Face Transformers or OpenAI Fine-tuning API
- Safety classifier: Scikit-learn or small BERT model
- Embeddings: OpenAI embeddings or sentence-transformers

---

## Target Users & Personas

### Primary Persona: Ahmed (Student, 22)

**Demographics:**
- Age: 22
- Occupation: University student
- Location: Urban
- Tech comfort: High

**Psychographic Profile:**
- Feels anxious about social identity
- Has recurring negative self-narratives ("I'm not enough", "People don't like me")
- Wants compassionate guided reflection, not therapy replacement
- Prefers short daily sessions (5-10 minutes)
- Values gentle, non-judgmental tone

**Goals:**
- Daily emotional check-ins
- Quick reframing of negative thoughts
- Build self-compassion habits

**Pain Points:**
- Limited time for long sessions
- Fear of judgment
- Needs immediate validation

**App Usage Pattern:**
- Daily check-in sessions (3-5 min)
- 1-2 gentle deep sessions per week (15 min)
- Prefers mobile notifications for reminders

---

### Secondary Persona: Meselech (Working Adult, 34)

**Demographics:**
- Age: 34
- Occupation: Marketing professional
- Location: Urban
- Tech comfort: Medium-High

**Psychographic Profile:**
- Curious about shadow work and personal growth
- Interested in weekly deep sessions
- Values journaling and reflection
- Wants progress visuals and analytics
- Prefers structured, evidence-based approaches

**Goals:**
- Weekly deep shadow work sessions (20-30 min)
- Track emotional patterns over time
- Export journal entries for personal records
- Understand progress through data

**Pain Points:**
- Limited time during workday
- Needs flexibility to pause/resume sessions
- Wants to see long-term trends

**App Usage Pattern:**
- Weekly gentle deep sessions (20-30 min)
- Daily mood tracking
- Monthly journal review and export

---

### Edge Persona: Yonas (Therapist, 42)

**Demographics:**
- Age: 42
- Occupation: Licensed therapist
- Location: Urban
- Tech comfort: Medium

**Psychographic Profile:**
- May use app as a supplementary tool for clients
- Requires transparency about AI limitations
- Needs exportable session summaries
- Values clear safety/escalation pathways
- Professional accountability mindset

**Goals:**
- Understand app's therapeutic approach
- Review client session summaries (with consent)
- Ensure safety protocols are followed
- Integrate app insights into therapy sessions

**Pain Points:**
- Concerns about AI replacing human therapy
- Needs clear boundaries and disclaimers
- Requires HIPAA-compliant data handling (if applicable)

**App Usage Pattern:**
- Occasional use to understand client experience
- Review of safety and escalation features
- Assessment of therapeutic alignment

---

## Core Product Pillars

### 1. Conversational AI Coach

**Description:** A chat interface with an AI persona that is gentle, reflective, curious, and psychologically informed.

**Key Features:**
- Real-time conversational interface
- Context-aware responses using session memory
- Multi-turn dialogue support
- Pause/resume functionality
- Typing indicators and response streaming

**Technical Requirements:**
- Response latency < 2 seconds
- Context window: last 20 messages + session summary
- Support for emoji and formatting (bold, italics)
- Voice-to-text input option (post-MVP)

---

### 2. Guided Sessions

**Description:** Structured 10-30 minute deep sessions using evidence-based therapeutic techniques.

**Session Types:**

**A. Check-in (3-5 min)**
- Mood assessment (slider: 1-10)
- Quick reflection prompt
- Micro-practice suggestion
- Optional: Set intention for the day

**B. Gentle Deep (15-30 min)**
- Structured flow: Validate → Elicit → Probe → Reframe → Practice → Integrate
- Techniques: Socratic questioning, Cognitive Reframing, Compassion-Focused prompts
- One practical experiment per session
- Safety check at close

**C. Micro-Practice (5-10 min)**
- Breathing exercises
- Grounding techniques
- Self-compassion meditations
- Body scan exercises

**Technical Requirements:**
- Session state persistence
- Ability to pause and resume
- Progress indicators (steps 1/7, 2/7, etc.)
- Time estimates per step

---

### 3. Journaling & Reflection

**Description:** Save session outputs, highlight insights, allow tagging & export (PDF/text).

**Key Features:**
- Automatic session saving
- Manual highlight/insight capture during sessions
- Tag system (e.g., "anxiety", "self-worth", "relationships")
- Search functionality
- Export options: PDF, plain text, JSON
- Delete history option

**Technical Requirements:**
- Encrypted local storage
- Cloud sync (opt-in, encrypted)
- Export generation < 5 seconds
- Support for rich text formatting in exports

---

### 4. Progress Tracking

**Description:** Mood tracking, insight frequency, short analytics (charts) showing trends.

**Metrics Tracked:**
- Daily mood scores (1-10)
- Session frequency and type
- Insight frequency (user-highlighted moments)
- Tag distribution over time
- Session completion rates
- Response to micro-practices

**Visualizations**
- Mood trend line (7-day, 30-day, 90-day)
- Session type distribution (pie chart)
- Insight timeline
- Tag cloud or frequency chart

**Technical Requirements:**
- Data aggregation queries < 1 second
- Chart rendering with smooth animations
- Export analytics as image or PDF

---

### 5. Safety & Escalation

**Description:** Suicide/self-harm detection, emergency resource prompts, opt-in human therapist referral flow.

**Safety Layers:**

**Layer 1: Real-time Detection**
- Safety classifier scans every user message
- Risk levels: none, low, medium, high
- Immediate UI intervention for high risk

**Layer 2: Emergency UI**
- Full-screen modal with crisis resources
- Local crisis hotline numbers (geolocation-based)
- Option to call/text crisis line directly
- "I'm safe now" button to dismiss (with follow-up)

**Layer 3: Human Escalation**
- Opt-in human moderator review
- Secure logging of flagged sessions
- Optional therapist referral (with user consent)

**Technical Requirements:**
- Safety classifier latency < 100ms
- Emergency UI display < 500ms after detection
- Secure logging with encryption
- Compliance with local mental health regulations

---

### 6. Privacy-First Architecture

**Description:** On-device privacy first; minimize PII sent to servers; encryption and clear consent flow.

**Privacy Principles:**
- Minimal PII collection (email optional, no real name required)
- End-to-end encryption for session data
- Local-first storage with optional cloud sync
- Clear consent flows for data sharing
- Opt-in research participation
- Right to delete all data

**Technical Implementation:**
- AES-256 encryption for stored data
- TLS 1.3 for data in transit
- Token-based authentication (no passwords stored)
- Anonymized analytics (no PII in logs)
- GDPR/CCPA compliance considerations

---

## AI Persona & Voice Guidelines

### Persona: Ari/Amara

**Name:** Ari (gender-neutral, can be customized)

**Core Characteristics:**
- Compassionate and non-judgmental
- Gentle curiosity
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validates feelings first

**Tone Guidelines:**

**1. Validation (Always First)**
- "That sounds heavy — it's okay to feel that way."
- "I'm sorry you're carrying that. Would you like to explore it together?"
- "Thank you for sharing that with me."

**2. Gentle Probing**
- "When you say 'I'm not enough', can you tell me the first memory that comes to mind?"
- "What part of that experience feels most connected to the bigger belief?"
- "I'm curious — what would it feel like if that thought weren't true?"

**3. Reframing**
- "One small way to test this thought is... would you like a suggestion?"
- "What evidence supports this? What evidence contradicts it?"
- "Let's try a different lens: what would you tell a friend in this situation?"

**4. Consent & Boundaries**
- "Are you ready to gently look at this now?"
- "You can stop any time — just say 'pause' or 'stop'."
- "Would you like to try a different approach?"

**5. Closing & Integration**
- "What's one small experiment you could try this week?"
- "How does it feel to have explored this together?"
- "Before we close, how are you feeling right now?"

**Response Length:**
- Default: 2-4 sentences
- Can expand if user asks for longer reflection
- Use line breaks for readability

**Prohibited Language:**
- Medical diagnoses ("You have depression")
- Legal advice
- Encouragement of risky behavior
- Dismissive phrases ("Just get over it", "It's not that bad")
- Overly clinical jargon (unless user requests it)

---

## Conversation Design & Flows

### 1. Onboarding Flow

**Step 1: Welcome Screen**
- App name and tagline
- Brief value proposition
- "Get Started" button

**Step 2: Privacy & Consent**
- Clear explanation of data usage
- Encryption details
- Research participation opt-in (default: off)
- "I understand and agree" checkbox

**Step 3: Mood Baseline**
- "How are you feeling today?" (slider 1-10)
- Optional: "What's on your mind?" (free text)

**Step 4: Session Preferences**
- Preferred session length: Short (5-10 min) / Medium (15-20 min) / Long (25-30 min)
- Notification preferences
- Safety contact info (optional, for emergency escalation)

**Step 5: Demo Session**
- 2-minute guided demo with Ari
- Sample: "I've been feeling anxious about an upcoming exam"
- Shows validation, gentle probing, reframing
- "Ready to start your first real session?" button

**Step 6: Home Screen**
- First session prompt
- Quick access to resources

---

### 2. Session Types

#### A. Check-in Session (3-5 min)

**Flow:**
1. **Mood Assessment** (30 sec)
   - "How are you feeling right now?" (slider)
   - Optional: "What's contributing to this feeling?"

2. **Quick Reflection** (2-3 min)
   - One reflective question based on mood
   - Example: "What's one thing that went well today?"

3. **Micro-Practice Suggestion** (1 min)
   - Brief breathing exercise or self-compassion prompt
   - "Would you like to try a 2-minute breathing exercise?"

4. **Close** (30 sec)
   - Validation
   - "See you tomorrow" or "Come back anytime"

---

#### B. Gentle Deep Session (15-30 min)

**Structured Flow:**

**Step 1: Validate + Invite Consent** (2-3 min)
- User shares a recurring negative belief or pattern
- Ari validates: "That must feel heavy. Thank you for trusting me with this."
- Ask consent: "Are you ready to gently look at this together? You can stop any time."

**Step 2: Story Elicitation** (3-5 min)
- "Tell me about the most recent time this showed up."
- Follow-up: "What happened? How did it feel?"

**Step 3: Root Cause Probing** (5-7 min)
- "What did that time remind you of?"
- "When did you first remember feeling this way?"
- "What patterns do you notice?"

**Step 4: Reframe Thoughts** (5-7 min)
- "Let's test this thought together."
- "What evidence supports it? What evidence contradicts it?"
- "What would you tell a friend in this situation?"

**Step 5: Compassion Exercise** (3-5 min)
- Guided self-compassion practice
- "Let's try a brief exercise. Can you place a hand on your heart and say..."

**Step 6: Integration & Experiment** (3-5 min)
- Summarize insights
- "What's one small experiment you could try this week?"
- User commits to experiment (optional)

**Step 7: Close with Validation & Safety Check** (1-2 min)
- "How are you feeling now?"
- "Before we close, are you safe? Do you have support if you need it?"
- "You did brave work today. Come back anytime."

---

#### C. Micro-Practice Session (5-10 min)

**Types:**

**1. Breathing Exercise**
- Guided 4-7-8 breathing
- Visual timer/circle
- "Breathe in for 4... hold for 7... out for 8..."

**2. Grounding Technique (5-4-3-2-1)**
- "Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste"

**3. Self-Compassion Meditation**
- "Place a hand on your heart. Repeat after me: 'May I be kind to myself'"

**4. Body Scan**
- Brief guided body awareness exercise

**Flow:**
1. Introduction (30 sec)
2. Guided practice (3-7 min)
3. Reflection (1 min): "How do you feel now?"
4. Close (30 sec)

---

### 3. Safety Escalation Flow

**Trigger:** Safety classifier detects high-risk language

**Immediate Actions:**
1. Interrupt session (save state)
2. Display emergency UI (full-screen modal)
3. Show crisis resources:
   - National Suicide Prevention Lifeline: 988 (US)
   - Crisis Text Line: Text HOME to 741741
   - Local crisis numbers (geolocation-based)
4. Direct call/text buttons
5. "I'm safe now" button (with follow-up check-in)

**Follow-up:**
- 24-hour automated check-in message
- Option to connect with human moderator (opt-in)
- Optional therapist referral

---

## Safety & Ethical Constraints

### Must-Enforce Rules

**1. Risk Detection & Escalation**
- **Rule:** Model MUST detect explicit self-harm/suicide ideation
- **Action:** Immediately show high-urgency UI with emergency resources
- **Implementation:** Safety classifier with 98%+ recall for high-risk content
- **Logging:** Secure event logging with encryption, surfaced to human moderator only with explicit consent or legal obligation

**2. Therapy Boundary**
- **Rule:** Clear disclaimer that app is not a replacement for professional mental health care
- **Copy:** "Ari is a supportive companion for self-reflection, not a replacement for professional therapy. If you're experiencing a mental health crisis, please contact a licensed therapist or crisis hotline."
- **Placement:** Onboarding, session start, resources page
- **Referral:** Provide therapist referral options if user requests

**3. No Reckless Advice**
- **Rule:** Forbid model from offering:
  - Medical/diagnostic instructions
  - Legal advice
  - Encouragement of risky behavior
- **Implementation:** Hard-constraint filter in post-processing layer
- **Training:** Fine-tune model to refuse such requests explicitly

**4. Privacy Defaults**
- **Rule:** Sessions encrypted; minimal PII storage; opt-in for research sharing
- **Implementation:**
  - AES-256 encryption for stored data
  - No PII in analytics logs
  - Explicit consent for research participation (default: off)
  - Right to delete all data

**5. Human in the Loop**
- **Rule:** For flagged conversations (safety or severe distress), offer optional human follow-up
- **Implementation:**
  - Consent required before human review
  - Secure, encrypted communication channel
  - Clear explanation of what human review entails

---

## Data & Dataset Specifications

### Data Types

**1. Conversational Logs**
- **Format:** JSON with anonymized transcripts
- **Fields:**
  - `session_id`: UUID
  - `user_id`: Hashed/anonymized ID
  - `timestamp`: ISO 8601
  - `messages`: Array of {role: "user"|"assistant", text: string, metadata: object}
  - `session_type`: "check-in"|"gentle_deep"|"micro_practice"
  - `labels`: Intent, sentiment, risk_level (see Label Schema)

**2. Labeled Therapeutic Intents**
- **Purpose:** Supervised learning for intent classification
- **Labels:** See Label Schema below
- **Source:** Clinician-authored seed dialogues + user consent data

**3. User Metadata**
- **Fields:**
  - `user_id`: Hashed ID
  - `mood_scores`: Array of {timestamp, score: 1-10}
  - `session_types`: Frequency counts
  - `preferences`: Session length, notification settings
  - `consent_for_research`: Boolean

**4. Example Dialogues**
- **Purpose:** High-quality seed dialogues for behavior shaping
- **Format:** JSON with full conversation + labels
- **Source:** Clinical consultants + synthetic generation

---

### Label Schema

**Intent Labels:**
```json
{
  "intent": "validate" | "probe_story" | "probe_root" | "reframe" | 
            "suggest_experiment" | "offer_mindfulness" | "safety_check" | 
            "emergency" | "close" | "other"
}
```

**Sentiment Labels:**
```json
{
  "sentiment": "very_negative" | "negative" | "neutral" | "positive"
}
```

**Risk Level Labels:**
```json
{
  "risk_level": "none" | "low" | "medium" | "high"
}
```

**Consent Labels:**
```json
{
  "consent_for_research": true | false
}
```

**Full Label Example:**
```json
{
  "message_id": "msg_123",
  "text": "I've been thinking about ending it all.",
  "intent": "emergency",
  "sentiment": "very_negative",
  "risk_level": "high",
  "consent_for_research": false
}
```

---

### Data Sourcing

**1. Public Datasets (License-Permitted)**
- Anonymized counseling transcripts (with consent)
- Mental health conversation datasets (e.g., Mental Health Reddit datasets, with proper attribution)

**2. Clinician-Authored Seed Dialogues**
- Work with licensed therapists to create 50-100 seed dialogues
- Cover various scenarios: anxiety, self-worth, relationships, grief
- Ensure diversity in user expressions and responses

**3. Synthetic Generation**
- Use LLM to generate additional training examples
- Review by clinicians before inclusion
- Augment with variations (paraphrasing, different phrasings)

**4. User Consent Data (Post-Launch)**
- Opt-in research participation
- Anonymize before use in training
- Regular consent re-confirmation

---

## Model Architecture & Training

### MVP Approach

**Base Model:**
- **Option 1 (Recommended for MVP):** OpenAI GPT-4 or GPT-3.5-turbo via API
  - Pros: Fast to implement, high quality, built-in safety
  - Cons: API costs, data privacy considerations
- **Option 2 (Post-MVP):** Self-hosted Llama 2/3 or Mistral 7B
  - Pros: Full data privacy, no API costs
  - Cons: Requires infrastructure, quantization for mobile

**Architecture Components:**

**1. Main Conversation Model**
- Fine-tuned LLM with persona prompt
- Retrieval augmentation for session memory
- Context: Last 20 messages + session summary + user preferences

**2. Safety Classifier**
- Separate small model (BERT-base or similar)
- Real-time risk detection (< 100ms latency)
- Binary classification: safe vs. high-risk
- Multi-class: none, low, medium, high

**3. Intent Classifier**
- Lightweight model for therapeutic intent detection
- Used for response routing and analytics

**4. Response Filter (Hard Constraints)**
- Rule-based post-processing
- Removes unsafe suggestions
- Guarantees safety prompts when needed

---

### Training Pipeline

**Phase 1: Persona Fine-Tuning**

**Dataset:**
- 500-1000 clinician-approved seed dialogues
- Format: User message → Ari response (with labels)

**Fine-Tuning Process:**
1. Prepare dataset in format required by base model
2. Add system prompt: "You are Ari, a compassionate inner-work coach..."
3. Fine-tune with learning rate 1e-5, 3-5 epochs
4. Evaluate on held-out test set (validation rate, safety)

**Phase 2: Safety Classifier Training**

**Dataset:**
- Labeled examples of high-risk vs. safe content
- Include edge cases (ambiguous language, false positives)

**Training Process:**
1. Fine-tune BERT-base on risk classification task
2. Optimize for recall (target: 98%+ for high-risk)
3. Test on diverse phrasings of self-harm ideation

**Phase 3: RLHF (Post-MVP)**

**Process:**
1. Collect human feedback on model responses
2. Train reward model on feedback
3. Fine-tune main model with PPO or similar
4. Iterate on compassion, safety, helpfulness

---

### Model Behavior Specification

**System Prompt (Seed Prompt):**

```
You are "Ari", a compassionate, non-judgmental inner-work coach. Your job is to help users gently explore recurring negative beliefs and emotional patterns.

Core Principles:
1. Always begin with validation before probing deeper
2. Ask for consent before deeper exploration ("Are you ready to look at this together?")
3. Keep responses brief (2-4 sentences) unless user asks for longer reflection
4. Use reflective questions rather than direct advice
5. Offer one practical experiment at the end of a deep session
6. Avoid medical or legal advice

Safety Protocol:
- If user mentions self-harm or suicide, immediately:
  1. Acknowledge with compassion
  2. Ask about immediate safety
  3. Provide crisis resources
  4. Follow emergency escalation flow

Tone Guidelines:
- Compassionate and gentle
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validate feelings first

Example Response Style:
User: "I keep thinking I'm a failure."
Ari: "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time."
```

---

## API Contracts

See `API_CONTRACTS.md` for detailed JSON schemas and endpoint specifications.

**Key Endpoints:**
- `POST /session/start` - Start new session
- `POST /session/:id/message` - Send message, get response
- `GET /session/:id/summary` - Get session summary
- `POST /analytics/mood` - Submit mood score
- `GET /journal/entries` - List journal entries
- `POST /journal/export` - Export session as PDF/text

**Response Metadata:**
```json
{
  "text": "Assistant response text",
  "intent": "validate",
  "risk_level": "none",
  "suggested_followup": "Would you like to explore this deeper?",
  "memory_delta": "Updated session context"
}
```

---

## Mobile App Screens & Flows

See `UI_WIREFRAMES.md` for detailed screen descriptions and wireframes.

**Key Screens:**
1. **Splash & Onboarding** - Privacy, consent, mood baseline, demo
2. **Home** - Daily check-in, recent insights, quick actions
3. **Session Screen** - Chat UI, pause/stop, highlight insights
4. **Journal** - Timeline, tags, search, export
5. **Resources & Help** - Crisis numbers, FAQs, therapist referral

**UX Principles:**
- Calming colors (soft blues, greens, purples)
- Large, readable text (minimum 16pt)
- Generous spacing and padding
- Explicit pause/stop buttons
- Export/delete functionality
- Accessibility: VoiceOver/TalkBack support

---

## Evaluation Metrics

### Model Behavior Metrics

**1. Validation Rate**
- **Definition:** % of assistant replies that contain explicit validation when user expresses distress
- **Target:** >90%
- **Measurement:** Manual review of 100 sessions with negative sentiment

**2. Safety Recall**
- **Definition:** Recall for suicidal/self-harm content detection
- **Target:** >=0.98
- **Measurement:** Test set of 200 high-risk examples (clinician-verified)

**3. User Satisfaction**
- **Definition:** Post-session ratings (1-5 scale)
- **Target:** >4/5 for first 100 testers
- **Measurement:** In-app rating prompt after each session

**4. Response Quality**
- **Definition:** Clinician review of response appropriateness
- **Target:** >85% rated as "appropriate" or "excellent"
- **Measurement:** Monthly review of 50 random sessions

---

### Product Metrics

**1. Daily Active Users (DAU)**
- **Target:** 20%+ 7-day retention for early testers
- **Measurement:** Analytics dashboard

**2. Conversion to Weekly Deep Session**
- **Target:** 30% of users complete at least one gentle deep session per week
- **Measurement:** Session type tracking

**3. Session Completion Rate**
- **Target:** >70% of started sessions are completed
- **Measurement:** Session state tracking

**4. Safety Escalation Rate**
- **Target:** <5% false positive rate for high-risk detection
- **Measurement:** Review of escalated sessions

---

## MVP Timeline & Milestones

### Phase 1: Foundation (Weeks 0-2)

**Deliverables:**
- Requirements document (this spec)
- Privacy & safety architecture design
- Clinician review of conversation flows
- Data consent flow design

**Key Activities:**
- Stakeholder alignment
- Legal review of privacy policy
- Clinician advisory board formation
- Technical architecture finalization

---

### Phase 2: Core Development (Weeks 3-6)

**Deliverables:**
- Backend API skeleton
- Chat UI (basic)
- LLM integration with prompt templates
- Onboarding flow
- Authentication system

**Key Activities:**
- Set up development environment
- Implement API endpoints
- Build mobile app shell
- Integrate OpenAI API (or chosen LLM)
- Create basic prompt templates

---

### Phase 3: Intelligence & Safety (Weeks 7-10)

**Deliverables:**
- Data labeling pipeline
- Safety classifier integration
- Journaling & export functionality
- Session memory system
- Analytics dashboard (basic)

**Key Activities:**
- Label 500+ seed dialogues
- Train safety classifier
- Implement vector store for memory
- Build journaling UI
- Create export engine (PDF/text)

---

### Phase 4: Beta Testing (Weeks 11-14)

**Deliverables:**
- Closed beta with 50 users
- Iterated conversation tone
- Safety metrics report
- User feedback analysis

**Key Activities:**
- Recruit beta testers
- Monitor safety metrics daily
- Iterate on prompt engineering
- Collect user feedback
- Fix critical bugs

---

### Post-MVP Enhancements

**Phase 5 (Weeks 15-18):**
- RLHF implementation
- Advanced analytics
- Voice input/output
- Therapist referral integration

**Phase 6 (Weeks 19-22):**
- Self-hosted model option
- Advanced journaling features
- Community features (opt-in)
- Multi-language support

---

## Implementation Checklist

### Pre-Development

- [ ] Draft clinical advisory agreement
- [ ] Legal review of privacy policy and terms of service
- [ ] Set up development infrastructure (Git, CI/CD, staging environment)
- [ ] Choose LLM provider and set up API access
- [ ] Design database schema
- [ ] Create project management board (Jira, Linear, etc.)

### Data & Training

- [ ] Create data consent flow UI
- [ ] Set up data labeling pipeline
- [ ] Generate 50+ clinician-approved seed dialogues
- [ ] Prepare training dataset (500+ examples)
- [ ] Fine-tune base model with persona
- [ ] Train safety classifier
- [ ] Evaluate models on test set

### Backend Development

- [ ] Implement authentication service
- [ ] Build session management API
- [ ] Create conversation service with LLM integration
- [ ] Implement safety classifier integration
- [ ] Build memory service (vector store)
- [ ] Create journaling service
- [ ] Implement analytics endpoints
- [ ] Set up encryption for data at rest
- [ ] Configure TLS for data in transit

### Mobile App Development

- [ ] Build splash and onboarding screens
- [ ] Create home screen with daily check-in
- [ ] Implement session screen (chat UI)
- [ ] Add pause/stop functionality
- [ ] Build journal screen with timeline
- [ ] Implement export functionality (PDF/text)
- [ ] Create resources & help screen
- [ ] Add mood tracking UI
- [ ] Implement analytics visualizations
- [ ] Add emergency UI for safety escalations

### Safety & Privacy

- [ ] Implement hard-constraint response filters
- [ ] Create emergency escalation flow
- [ ] Build secure logging system
- [ ] Set up human moderator review interface (if applicable)
- [ ] Implement data deletion functionality
- [ ] Add privacy settings UI
- [ ] Create consent management system

### Testing & Quality Assurance

- [ ] Unit tests for critical functions
- [ ] Integration tests for API endpoints
- [ ] Safety classifier evaluation (98%+ recall)
- [ ] User acceptance testing with 10+ testers
- [ ] Accessibility testing (VoiceOver/TalkBack)
- [ ] Performance testing (response latency, app load time)
- [ ] Security audit

### Launch Preparation

- [ ] Beta testing with 50 users
- [ ] Collect and analyze feedback
- [ ] Iterate on conversation tone
- [ ] Finalize app store listings (iOS/Android)
- [ ] Prepare marketing materials
- [ ] Set up analytics and monitoring
- [ ] Create user documentation/help center
- [ ] Plan launch communication

---

## Appendix: Example Seed Dialogue

See `SEED_DIALOGUES.json` for 20 high-quality labeled examples.

**Sample:**
```
User: "I keep thinking I'm a failure."
Ari: "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time."
Labels: {intent: "validate", sentiment: "negative", risk_level: "none"}
```

---

**End of Specification Document**

