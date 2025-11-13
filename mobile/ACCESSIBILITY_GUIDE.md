# Accessibility Guide

## Overview

The Shadow Coach mobile app is designed with accessibility in mind, supporting VoiceOver (iOS) and TalkBack (Android) screen readers.

## Implementation Status

✅ **Completed:**
- Chat components (ChatBubble, ChatInput)
- Journal screen and components
- Mood slider component
- Emergency modal
- Button components
- Input fields

## Accessibility Features

### 1. **Screen Reader Support**

All interactive elements include:
- `accessibilityLabel` - Descriptive text for screen readers
- `accessibilityRole` - Semantic role (button, textbox, etc.)
- `accessibilityHint` - Additional context for actions
- `accessibilityState` - Current state (disabled, selected, etc.)

### 2. **Component Examples**

#### Chat Bubble
```javascript
<View
  accessibilityRole="text"
  accessibilityLabel={isUser ? `You: ${message.text}` : `Ari: ${message.text}`}
>
```

#### Chat Input
```javascript
<TextInput
  accessibilityLabel="Message input"
  accessibilityRole="textbox"
  accessibilityHint="Type your message to Ari"
  accessibilityState={{ disabled }}
/>
```

#### Buttons
```javascript
<TouchableOpacity
  accessibilityLabel="Export journal entry"
  accessibilityRole="button"
  accessibilityHint="Exports this journal entry as a file"
  accessibilityState={{ disabled: exporting }}
/>
```

#### Slider
```javascript
<Slider
  accessibilityLabel="Mood slider"
  accessibilityRole="adjustable"
  accessibilityValue={{
    min: 1,
    max: 10,
    now: value,
    text: `${getMoodLabel(value)} (${value} out of 10)`,
  }}
  accessibilityHint="Adjust your mood score from 1 to 10"
/>
```

### 3. **Best Practices**

#### Labels
- Use clear, concise labels
- Include context (e.g., "You: message" vs "Ari: message")
- Avoid redundant information

#### Hints
- Provide additional context for complex actions
- Explain what will happen when activated
- Keep hints brief and actionable

#### States
- Always indicate disabled state
- Update state when component changes
- Use `accessibilityState` for dynamic states

#### Roles
- Use appropriate roles (button, textbox, adjustable, etc.)
- Don't override default roles unnecessarily
- Use semantic roles for better screen reader support

### 4. **Testing**

#### iOS (VoiceOver)
1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Navigate with swipe gestures
3. Test all interactive elements
4. Verify labels and hints are clear

#### Android (TalkBack)
1. Enable TalkBack: Settings > Accessibility > TalkBack
2. Navigate with swipe gestures
3. Test all interactive elements
4. Verify labels and hints are clear

### 5. **Common Patterns**

#### Navigation Buttons
```javascript
<TouchableOpacity
  accessibilityLabel="Go to journal"
  accessibilityRole="button"
  accessibilityHint="Opens your journal entries"
/>
```

#### Form Inputs
```javascript
<TextInput
  accessibilityLabel="Email address"
  accessibilityRole="textbox"
  accessibilityHint="Enter your email address"
  accessibilityState={{ required: true }}
/>
```

#### Toggle Switches
```javascript
<Switch
  accessibilityLabel="Enable notifications"
  accessibilityRole="switch"
  accessibilityState={{ checked: enabled }}
  accessibilityHint="Turns notifications on or off"
/>
```

#### Lists
```javascript
<FlatList
  accessibilityLabel="Journal entries list"
  accessibilityRole="list"
  data={entries}
  renderItem={({ item }) => (
    <TouchableOpacity
      accessibilityLabel={`Entry from ${item.date}`}
      accessibilityRole="listitem"
    />
  )}
/>
```

### 6. **Color and Contrast**

- ✅ All text meets WCAG AA contrast ratios
- ✅ Interactive elements have clear visual indicators
- ✅ Color is not the only indicator of state

### 7. **Touch Targets**

- ✅ All interactive elements are at least 44x44 points
- ✅ Adequate spacing between touch targets
- ✅ No overlapping interactive elements

### 8. **Dynamic Content**

When content changes dynamically:
- Announce important changes to screen readers
- Update `accessibilityState` when state changes
- Provide feedback for user actions

### 9. **Error Messages**

```javascript
<Text
  accessibilityRole="alert"
  accessibilityLiveRegion="polite"
>
  {errorMessage}
</Text>
```

### 10. **Loading States**

```javascript
{loading ? (
  <ActivityIndicator
    accessibilityLabel="Loading"
    accessibilityRole="progressbar"
  />
) : (
  <Content />
)}
```

## Checklist for New Components

When creating new components, ensure:

- [ ] All interactive elements have `accessibilityLabel`
- [ ] Appropriate `accessibilityRole` is set
- [ ] `accessibilityHint` provided for complex actions
- [ ] `accessibilityState` reflects current state
- [ ] Touch targets are at least 44x44 points
- [ ] Text contrast meets WCAG AA standards
- [ ] Tested with VoiceOver (iOS) and TalkBack (Android)

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)

---

**Accessibility is an ongoing commitment. All new features should include accessibility support from the start.**

