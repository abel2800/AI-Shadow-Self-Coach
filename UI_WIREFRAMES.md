# UI Wireframes & Screen Descriptions
## AI Shadow-Self Coach Mobile App

**Version:** 1.0  
**Platform:** iOS & Android (React Native)  
**Design System:** Mobile-first, accessible, calming

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Screen Flows](#screen-flows)
5. [Detailed Screen Descriptions](#detailed-screen-descriptions)
6. [Component Library](#component-library)
7. [Accessibility](#accessibility)

---

## Design Principles

**Core Principles:**
1. **Calming & Safe**: Soft colors, generous spacing, gentle animations
2. **Accessible**: Large text (minimum 16pt), high contrast, VoiceOver/TalkBack support
3. **Privacy-First**: Clear consent flows, transparent data usage
4. **Non-Judgmental**: Warm, welcoming, inclusive design
5. **Mobile-Optimized**: Touch-friendly, thumb-zone navigation, offline-capable

**Visual Style:**
- Minimal, clean interface
- Rounded corners, soft shadows
- Gentle gradients and subtle animations
- Breathing room (generous padding)

---

## Color Palette

### Primary Colors

**Calming Blues:**
- Primary: `#6B9BD2` (Soft Blue)
- Primary Dark: `#4A7BA8`
- Primary Light: `#9BC4E8`

**Gentle Greens:**
- Secondary: `#7FB3A3` (Sage Green)
- Secondary Dark: `#5F8F7F`
- Secondary Light: `#A8D4C4`

**Soft Purples:**
- Accent: `#B8A9D9` (Lavender)
- Accent Dark: `#9B8AB8`
- Accent Light: `#D4C8E8`

### Neutral Colors

- Background: `#F8F9FA` (Off-White)
- Surface: `#FFFFFF` (White)
- Text Primary: `#2C3E50` (Dark Gray)
- Text Secondary: `#7F8C8D` (Medium Gray)
- Border: `#E5E7EB` (Light Gray)

### Semantic Colors

- Success: `#7FB3A3` (Sage Green)
- Warning: `#F4A261` (Warm Orange)
- Error: `#E76F51` (Soft Red)
- Info: `#6B9BD2` (Soft Blue)

### Safety/Emergency

- Emergency Background: `#FFF5F5` (Very Light Red)
- Emergency Text: `#C53030` (Dark Red)
- Crisis Button: `#E76F51` (Soft Red)

---

## Typography

### Font Family

**Primary:** System font (San Francisco on iOS, Roboto on Android)  
**Alternative:** Inter (if custom font desired)

### Font Sizes

- **H1 (Title)**: 28pt, Bold
- **H2 (Section)**: 24pt, Semi-Bold
- **H3 (Subsection)**: 20pt, Semi-Bold
- **Body Large**: 18pt, Regular
- **Body**: 16pt, Regular (minimum for accessibility)
- **Body Small**: 14pt, Regular
- **Caption**: 12pt, Regular

### Line Height

- **Titles**: 1.2
- **Body**: 1.5
- **Captions**: 1.4

---

## Screen Flows

### Onboarding Flow

```
Splash Screen
    ↓
Welcome Screen
    ↓
Privacy & Consent
    ↓
Mood Baseline
    ↓
Session Preferences
    ↓
Demo Session (Optional)
    ↓
Home Screen
```

### Main App Flow

```
Home Screen
    ├─→ Start Session
    │       ├─→ Check-in Session
    │       ├─→ Gentle Deep Session
    │       └─→ Micro-Practice Session
    ├─→ View Journal
    ├─→ View Analytics
    └─→ Resources & Help
```

### Session Flow

```
Session Start
    ↓
Chat Interface
    ├─→ Pause Session
    ├─→ Highlight Insight
    └─→ End Session
    ↓
Session Summary
    ├─→ Rate Session
    ├─→ Save to Journal
    └─→ Return Home
```

---

## Detailed Screen Descriptions

### 1. Splash Screen

**Purpose:** Initial app launch, brand introduction

**Layout:**
```
┌─────────────────────────┐
│                         │
│                         │
│      [App Logo]         │
│                         │
│   "Gentle & Deep"       │
│                         │
│                         │
│   [Loading Indicator]   │
│                         │
│                         │
└─────────────────────────┘
```

**Elements:**
- App logo (centered, large)
- Tagline: "Gentle & Deep" (below logo)
- Subtle loading indicator (spinner or progress bar)
- Background: Soft gradient (blue to purple)

**Behavior:**
- Display for 2-3 seconds
- Auto-navigate to Welcome or Home (if returning user)

**Accessibility:**
- VoiceOver: "Shadow-Self Coach, loading"

---

### 2. Welcome Screen

**Purpose:** Introduce app value proposition

**Layout:**
```
┌─────────────────────────┐
│                         │
│    [Illustration]       │
│                         │
│  Welcome to Ari        │
│                         │
│  Your compassionate     │
│  inner-work coach       │
│                         │
│  Explore your shadow    │
│  self with gentle,      │
│  evidence-based         │
│  guidance               │
│                         │
│  [Get Started Button]   │
│                         │
│  Already have an        │
│  account? [Log In]      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Illustration (calming, abstract)
- Title: "Welcome to Ari"
- Value proposition (2-3 sentences)
- Primary CTA: "Get Started" (full-width button)
- Secondary CTA: "Log In" (text link)

**Accessibility:**
- VoiceOver: "Welcome to Ari, your compassionate inner-work coach"

---

### 3. Privacy & Consent Screen

**Purpose:** Explain data usage and obtain consent

**Layout:**
```
┌─────────────────────────┐
│  Privacy & Consent      │
│                         │
│  Your privacy matters   │
│                         │
│  • Sessions encrypted   │
│  • Minimal data stored  │
│  • You control your data│
│  • Opt-in research      │
│                         │
│  [Read Full Policy]     │
│                         │
│  ☐ I understand and     │
│    agree to the privacy │
│    policy               │
│                         │
│  ☐ I consent to         │
│    anonymized research  │
│    participation        │
│    (optional)           │
│                         │
│  [Continue Button]      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Privacy & Consent"
- Brief explanation (bullet points)
- Link to full privacy policy
- Checkboxes for consent
- Continue button (disabled until required consent given)

**Accessibility:**
- VoiceOver: "Privacy and Consent, checkbox, I understand and agree"

---

### 4. Mood Baseline Screen

**Purpose:** Capture initial mood state

**Layout:**
```
┌─────────────────────────┐
│  How are you feeling?   │
│                         │
│  [Mood Slider]          │
│                         │
│  1 ────────●──────── 10 │
│                         │
│  😢  Okay  😊          │
│                         │
│  [Optional Text Input]  │
│  What's on your mind?   │
│  ┌───────────────────┐  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  [Continue Button]      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "How are you feeling?"
- Mood slider (1-10 scale)
- Emoji indicators (sad to happy)
- Optional text input
- Continue button

**Accessibility:**
- VoiceOver: "Mood slider, current value 5, adjust with swipe"

---

### 5. Session Preferences Screen

**Purpose:** Set user preferences

**Layout:**
```
┌─────────────────────────┐
│  Session Preferences     │
│                         │
│  Preferred session       │
│  length:                │
│  ○ Short (5-10 min)     │
│  ● Medium (15-20 min)   │
│  ○ Long (25-30 min)     │
│                         │
│  Notifications:         │
│  [Toggle: ON]           │
│                         │
│  Safety contact         │
│  (optional):            │
│  ┌───────────────────┐  │
│  │ Name              │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Phone             │  │
│  └───────────────────┘  │
│                         │
│  [Continue Button]      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Session Preferences"
- Radio buttons for session length
- Toggle for notifications
- Optional safety contact fields
- Continue button

**Accessibility:**
- VoiceOver: "Session preferences, radio button, Medium selected"

---

### 6. Demo Session Screen

**Purpose:** Show users how sessions work

**Layout:**
```
┌─────────────────────────┐
│  [Back]  Demo Session   │
│                         │
│  ┌───────────────────┐  │
│  │ Ari: Hi, I'm Ari. │  │
│  │ I'm here to help  │  │
│  │ you explore your  │  │
│  │ inner world with  │  │
│  │ compassion.       │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ You: I've been     │  │
│  │ feeling anxious   │  │
│  │ about an exam.    │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Ari: That sounds  │  │
│  │ stressful — it's  │  │
│  │ okay to feel that │  │
│  │ way. Would you    │  │
│  │ like to explore   │  │
│  │ what's underneath │  │
│  │ that anxiety?     │  │
│  └───────────────────┘  │
│                         │
│  [Try Real Session]     │
│                         │
└─────────────────────────┘
```

**Elements:**
- Chat interface (read-only)
- Sample conversation
- CTA: "Try Real Session"

**Accessibility:**
- VoiceOver: "Demo session, Ari says..."

---

### 7. Home Screen

**Purpose:** Main navigation hub

**Layout:**
```
┌─────────────────────────┐
│  [☰]  Hello, [Name]     │
│                         │
│  ┌───────────────────┐  │
│  │ Daily Check-in     │  │
│  │                   │  │
│  │ How are you        │  │
│  │ feeling today?     │  │
│  │ [Mood Slider]      │  │
│  │                   │  │
│  │ [Start Check-in]   │  │
│  └───────────────────┘  │
│                         │
│  Recent Insights         │
│  ┌───────────────────┐  │
│  │ "That feeling must │  │
│  │  be heavy..."      │  │
│  │  [View Session]    │  │
│  └───────────────────┘  │
│                         │
│  Quick Actions           │
│  ┌──────┐  ┌──────┐    │
│  │ Deep │  │ Micro│    │
│  │Session│ │Practice│   │
│  └──────┘  └──────┘    │
│                         │
│  [Journal] [Analytics]   │
│                         │
└─────────────────────────┘
```

**Elements:**
- Greeting with user name
- Daily check-in card (mood slider + CTA)
- Recent insights card
- Quick action buttons (Deep Session, Micro-Practice)
- Bottom navigation (Home, Journal, Analytics, Resources)

**Accessibility:**
- VoiceOver: "Home screen, daily check-in, mood slider"

---

### 8. Session Screen (Chat Interface)

**Purpose:** Main conversation interface

**Layout:**
```
┌─────────────────────────┐
│  [←]  Gentle Deep       │
│  [⏸]  [⏹]              │
│                         │
│  ┌───────────────────┐  │
│  │ Ari: That sounds  │  │
│  │ heavy — it's okay │  │
│  │ to feel that way. │  │
│  │ Would you like to │  │
│  │ explore it        │  │
│  │ together?         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ You: I keep        │  │
│  │ thinking I'm a     │  │
│  │ failure.          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Ari: That feeling │  │
│  │ must be heavy —   │  │
│  │ I'm sorry you're  │  │
│  │ carrying that.    │  │
│  │ Would you like to │  │
│  │ tell me about the │  │
│  │ last time that    │  │
│  │ thought showed up?│  │
│  │                   │  │
│  │ [⭐ Highlight]     │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Type a message... │  │
│  └───────────────────┘  │
│  [Send]                  │
│                         │
└─────────────────────────┘
```

**Elements:**
- Header: Session type, pause/stop buttons
- Chat bubbles (user right, assistant left)
- Highlight button on assistant messages
- Text input (bottom)
- Send button
- Progress indicator (for structured sessions)

**Accessibility:**
- VoiceOver: "Ari says, That sounds heavy..."

**Interactions:**
- Tap message to highlight
- Long-press to copy
- Swipe to pause
- Pull down to end session

---

### 9. Session Summary Screen

**Purpose:** Review session and save insights

**Layout:**
```
┌─────────────────────────┐
│  Session Complete       │
│                         │
│  ┌───────────────────┐  │
│  │ Summary           │  │
│  │                   │  │
│  │ You explored      │  │
│  │ feelings of       │  │
│  │ self-worth and    │  │
│  │ anxiety. We       │  │
│  │ identified a      │  │
│  │ pattern of        │  │
│  │ negative self-talk│  │
│  │ and practiced     │  │
│  │ self-compassion.  │  │
│  │                   │  │
│  │ Experiment: Try   │  │
│  │ writing one thing │  │
│  │ you did well each │  │
│  │ day this week.    │  │
│  └───────────────────┘  │
│                         │
│  Highlights              │
│  ┌───────────────────┐  │
│  │ "That feeling must│  │
│  │  be heavy..."     │  │
│  └───────────────────┘  │
│                         │
│  How was this session?   │
│  ⭐⭐⭐⭐⭐          │
│                         │
│  [Save to Journal]       │
│  [Return Home]           │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Session Complete"
- Summary text
- Highlights list
- Star rating (1-5)
- Save to journal button
- Return home button

**Accessibility:**
- VoiceOver: "Session complete, summary, star rating"

---

### 10. Journal Screen

**Purpose:** View saved sessions and insights

**Layout:**
```
┌─────────────────────────┐
│  Journal                 │
│  [Search] [Filter]       │
│                         │
│  ┌───────────────────┐  │
│  │ Jan 15, 2024      │  │
│  │ Gentle Deep       │  │
│  │                   │  │
│  │ "You explored     │  │
│  │ feelings of..."   │  │
│  │                   │  │
│  │ Tags: self-worth, │  │
│  │ anxiety           │  │
│  │                   │  │
│  │ [View] [Export]   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Jan 14, 2024      │  │
│  │ Check-in          │  │
│  │                   │  │
│  │ "Quick reflection │  │
│  │ on work stress..."│  │
│  │                   │  │
│  │ Tags: work, stress│  │
│  │                   │  │
│  │ [View] [Export]   │  │
│  └───────────────────┘  │
│                         │
│  [Export All]            │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Journal"
- Search bar
- Filter button (by tags, date, type)
- Session cards (date, type, preview, tags)
- View/Export buttons per card
- Export all button

**Accessibility:**
- VoiceOver: "Journal, January 15, 2024, Gentle Deep session"

---

### 11. Journal Entry Detail Screen

**Purpose:** View full session details

**Layout:**
```
┌─────────────────────────┐
│  [←]  Jan 15, 2024       │
│  [⋮]                     │
│                         │
│  Gentle Deep Session    │
│  15 minutes             │
│                         │
│  Summary                │
│  ┌───────────────────┐  │
│  │ You explored      │  │
│  │ feelings of...    │  │
│  └───────────────────┘  │
│                         │
│  Highlights              │
│  ┌───────────────────┐  │
│  │ "That feeling must│  │
│  │  be heavy..."     │  │
│  └───────────────────┘  │
│                         │
│  Full Transcript         │
│  [Expand]                │
│                         │
│  Tags                    │
│  [self-worth] [anxiety]  │
│                         │
│  [Edit Tags]             │
│  [Export] [Delete]       │
│                         │
└─────────────────────────┘
```

**Elements:**
- Back button
- Menu button (more options)
- Session metadata (date, type, duration)
- Summary section
- Highlights section
- Expandable transcript
- Tags (editable)
- Action buttons (Edit, Export, Delete)

**Accessibility:**
- VoiceOver: "Journal entry, January 15, 2024, Gentle Deep session"

---

### 12. Analytics Screen

**Purpose:** View progress and trends

**Layout:**
```
┌─────────────────────────┐
│  Analytics               │
│  [7 days] [30 days]      │
│                         │
│  Mood Trend              │
│  ┌───────────────────┐  │
│  │    📈             │  │
│  │    Line Chart     │  │
│  │    (7-day)        │  │
│  └───────────────────┘  │
│                         │
│  Session Types           │
│  ┌───────────────────┐  │
│  │    📊             │  │
│  │    Pie Chart      │  │
│  │    (This week)    │  │
│  └───────────────────┘  │
│                         │
│  Insights                │
│  ┌───────────────────┐  │
│  │ 25 insights this  │  │
│  │ month             │  │
│  └───────────────────┘  │
│                         │
│  Tags                    │
│  ┌───────────────────┐  │
│  │ [anxiety] [work]  │  │
│  │ [self-worth]      │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Analytics"
- Time period selector (7 days, 30 days, 90 days)
- Mood trend chart (line chart)
- Session type distribution (pie chart)
- Insights count
- Tag cloud or frequency chart

**Accessibility:**
- VoiceOver: "Analytics, mood trend chart, 7 days"

---

### 13. Resources & Help Screen

**Purpose:** Access crisis resources and support

**Layout:**
```
┌─────────────────────────┐
│  Resources & Help       │
│                         │
│  ┌───────────────────┐  │
│  │ 🆘 Crisis Support │  │
│  │                   │  │
│  │ National Suicide  │  │
│  │ Prevention: 988   │  │
│  │ [Call] [Text]     │  │
│  │                   │  │
│  │ Crisis Text Line: │  │
│  │ Text HOME to 741741│ │
│  │ [Text]            │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 💬 Therapist       │  │
│  │    Referral        │  │
│  │                   │  │
│  │ Find a licensed   │  │
│  │ therapist near you│  │
│  │ [Find Therapist]   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ ❓ FAQs            │  │
│  │                   │  │
│  │ Common questions  │  │
│  │ about Ari and     │  │
│  │ shadow work       │  │
│  │ [View FAQs]       │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 📧 Contact Support │  │
│  │                   │  │
│  │ support@shadowcoach│ │
│  │ .app              │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

**Elements:**
- Title: "Resources & Help"
- Crisis support card (with direct call/text buttons)
- Therapist referral card
- FAQs card
- Contact support card

**Accessibility:**
- VoiceOver: "Resources and Help, Crisis Support, National Suicide Prevention, 988"

---

### 14. Emergency Screen

**Purpose:** Display when high-risk content detected

**Layout:**
```
┌─────────────────────────┐
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  🆘 Your Safety   │  │
│  │     Matters       │  │
│  │                   │  │
│  │  I'm concerned    │  │
│  │  about what you've│  │
│  │  shared. Are you  │  │
│  │  safe right now?  │  │
│  │                   │  │
│  │  [I'm Safe]       │  │
│  │  [I Need Help]    │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Crisis Resources        │
│  ┌───────────────────┐  │
│  │ National Suicide  │  │
│  │ Prevention: 988   │  │
│  │ [Call Now]        │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Crisis Text Line: │  │
│  │ Text HOME to 741741│ │
│  │ [Text Now]        │  │
│  └───────────────────┘  │
│                         │
│  [Return to Session]     │
│                         │
└─────────────────────────┘
```

**Elements:**
- Full-screen modal (cannot be dismissed easily)
- Safety check message
- "I'm Safe" button (with follow-up)
- "I Need Help" button (shows more resources)
- Crisis resource buttons (direct call/text)
- Return to session button (after safety confirmed)

**Accessibility:**
- VoiceOver: "Emergency screen, Your safety matters, Are you safe right now?"

**Behavior:**
- Auto-display when high-risk detected
- Requires explicit confirmation to dismiss
- 24-hour follow-up check-in scheduled

---

## Component Library

### Buttons

**Primary Button:**
- Background: Primary Blue (`#6B9BD2`)
- Text: White, 16pt, Semi-Bold
- Padding: 16px vertical, 24px horizontal
- Border radius: 12px
- Height: 48px (minimum touch target)

**Secondary Button:**
- Background: Transparent
- Border: 2px, Primary Blue
- Text: Primary Blue, 16pt, Semi-Bold
- Padding: 16px vertical, 24px horizontal
- Border radius: 12px

**Text Button:**
- Background: Transparent
- Text: Primary Blue, 16pt, Regular
- Underline on press

### Input Fields

**Text Input:**
- Background: White
- Border: 1px, Light Gray (`#E5E7EB`)
- Border radius: 8px
- Padding: 12px
- Font: 16pt, Regular
- Placeholder: Medium Gray (`#7F8C8D`)

**Mood Slider:**
- Track: Light Gray
- Thumb: Primary Blue, 24px circle
- Labels: Emoji indicators
- Value display: Large, bold

### Cards

**Session Card:**
- Background: White
- Border radius: 12px
- Shadow: Subtle (2px blur, 0.1 opacity)
- Padding: 16px
- Margin: 8px vertical

**Insight Card:**
- Background: Accent Light (`#D4C8E8`)
- Border radius: 8px
- Padding: 12px
- Quote marks: Large, decorative

### Chat Bubbles

**User Bubble:**
- Background: Primary Blue (`#6B9BD2`)
- Text: White
- Alignment: Right
- Border radius: 16px (top-right, bottom-right, top-left small)
- Padding: 12px

**Assistant Bubble:**
- Background: Light Gray (`#F5F5F5`)
- Text: Dark Gray (`#2C3E50`)
- Alignment: Left
- Border radius: 16px (top-left, bottom-left, top-right small)
- Padding: 12px

---

## Accessibility

### VoiceOver/TalkBack Support

**All Interactive Elements:**
- Descriptive labels
- State announcements (selected, disabled)
- Value announcements (slider values, ratings)

**Navigation:**
- Clear heading hierarchy
- Landmark regions (main, navigation, footer)
- Skip links for repetitive content

**Forms:**
- Label associations
- Error announcements
- Required field indicators

### Color Contrast

- Text on background: WCAG AA minimum (4.5:1)
- Large text: WCAG AA minimum (3:1)
- Interactive elements: WCAG AA minimum (3:1)

### Touch Targets

- Minimum size: 44x44pt (iOS) or 48x48dp (Android)
- Spacing: 8pt minimum between targets

### Motion

- Respect "Reduce Motion" preference
- Disable animations if user prefers
- Subtle, gentle animations only

---

## Responsive Design

### Breakpoints

**Mobile (Primary):**
- Width: 320px - 480px
- Single column layout
- Stacked elements

**Tablet (Future):**
- Width: 481px - 768px
- Two-column layout where appropriate
- Larger touch targets

### Orientation

- Portrait: Primary design
- Landscape: Adjusted spacing, larger text if needed

---

## Animation Guidelines

**Principles:**
- Gentle, calming animations
- Duration: 200-300ms (quick), 400-500ms (smooth)
- Easing: Ease-in-out (smooth transitions)

**Animations:**
- Page transitions: Fade or slide (gentle)
- Button press: Scale down (0.95)
- Loading: Subtle pulse or spinner
- Success: Gentle checkmark animation

---

**End of UI Wireframes Document**

