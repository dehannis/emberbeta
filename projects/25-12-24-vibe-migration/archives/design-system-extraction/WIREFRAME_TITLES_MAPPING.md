# Wireframe Title Mapping - PRIMARY FLOW Items

This document maps the numbered PRIMARY FLOW items from "All MVP User Journeys.md" to wireframe state titles.

## 01. FIRST TIME AUTH

**Current States → PRIMARY FLOW Mapping:**

- **State 1 (FLOW STATE elder 0)**: 
  - Current: "State 1: Initial Video - Full screen video autoplays, transitions to phone input when ended"
  - **Should be**: "Step 2-3: Ember opens in mobile browser → Client sends invite token for validation"

- **State 2 (FLOW STATE elder 1)**:
  - Current: "State 2: Phone Input Form - Overlay with centered form, phone input field, Continue button"
  - **Should be**: "Step 6: User enters phone number (prefilled or partially masked if known)"

- **State 3 (FLOW STATE elder 2)**:
  - Current: "State 3: OTP Verification - Overlay with 6-digit code input, Verify button"
  - **Should be**: "Step 8: User enters one-time code"

- **State 4 (FLOW STATE elder 3)**:
  - Current: "State 4: Post-Verification Video - Video plays automatically, fade overlay appears when video ends"
  - **Should be**: "Step 9: On success, persist authentication session"

- **State 5 (FLOW STATE elder 4)**:
  - Current: "State 5: Connecting Screen - Full-screen black, centered "CONNECTING TO EMBER..." text with typewriter effect, navigates to /talk"
  - **Should be**: "Step 10: Immediately proceed to recording"

---

## 02. TALK JOURNEY (1st time)

**PRIMARY FLOW:**
1. Page loads.
2. Microphone permission is checked.
3. If permission granted, recording starts automatically.
4. Ember initiates conversation (topic-loaded if scheduled).
5. User speaks freely.
6. User may mute or end call at any time.

**Wireframe States Needed:**
- Step 1-2: Page loads → Microphone permission is checked
- Step 3: If permission granted, recording starts automatically
- Step 4: Ember initiates conversation (topic-loaded if scheduled)
- Step 5: User speaks freely
- Step 6: User may mute or end call at any time

---

## 03. POST SESSION JOURNEY

**PRIMARY FLOW:**
1. Call ends.
2. Recording is saved automatically.
3. User sees save confirmation.
4. User chooses to continue or exit.

**Wireframe States Needed:**
- Step 1: Call ends
- Step 2: Recording is saved automatically
- Step 3: User sees save confirmation
- Step 4: User chooses to continue or exit

---

## 04. HOME PAGE

**PRIMARY FLOW:**
1. User arrives from post-call.
2. User chooses next action.
3. No forced path.

**Wireframe States Needed:**
- Step 1: User arrives from post-call
- Step 2: User chooses next action (Talk, Build, Share buttons visible)
- Step 3: No forced path (all options accessible)

---

## 05. TALK JOURNEY (not 1st time)

**PRIMARY FLOW:**
1. User taps Talk.
2. Recording begins automatically.
3. Ember starts open-ended conversation.
4. End call returns to post-call handoff.

**Wireframe States Needed:**
- Step 1: User taps Talk
- Step 2: Recording begins automatically
- Step 3: Ember starts open-ended conversation
- Step 4: End call returns to post-call handoff

---

## 06. REMEMBER JOURNEY

**PRIMARY FLOW:**
(No explicit numbered flow, but components suggest these states)

**Wireframe States Needed:**
- List View: Sessions displayed chronologically
- Reels View: Vertical swipe between sessions, horizontal swipe between clips
- Audio Player: Full playback with basic controls
- Reactions: Emoji reactions (like, laugh, sad, comment)
- Follow-Up Request: Request follow-up controls
- End-of-content: Requested stories, completion message, upcoming topics

---

## 07. SHARE JOURNEY

**PRIMARY ACTIONS:**
- Add person.
- Send invitation via SMS.
- Schedule or reschedule calls.
- Adjust call cadence.
- Request or manage admin access.

**Wireframe States Needed:**
- People List: Display all people with their details
- Add Person Form: Form to add new person
- Invite Sender: Send invitation via SMS
- Scheduling Editor: Schedule or reschedule calls
- Admin Access Controls: Request or manage admin access

---

## 08. ACCOUNT SETTINGS

**PRIMARY FLOW:**
(No explicit numbered flow, but components listed)

**Wireframe States Needed:**
- Phone number display (read-only)
- Personal details form
- Next call info display/editing
- Sign out button
- Privacy and consent links

---

## Implementation Notes

1. **Text Colors**: All text should be white/light gray (`#f5f5f5` or `rgba(255, 255, 255, 0.9)`) for readability on dark backgrounds
2. **Backgrounds**: Use design system base colors:
   - Landing: `#03050a`
   - Account/Build/Share: `#01020a` or `#01030a`
   - People: `#07070b`
   - Talk: `#000` (pure black)
3. **Gradients**: Add annotations explaining the multi-layer gradient compositions (cannot be rendered directly via API)
4. **Overlays**: Use semi-transparent overlays (`rgba(0, 0, 0, 0.7)`) with blur effects

