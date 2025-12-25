# All MVP User Journeys

Status: Ideation
Created by: Daegwon Chae

## **EMBER FRONT-END IMPLEMENTATION BRIEF**

## **STRUCTURED USER JOURNEY + ERROR HANDLING**

# **00. GLOBAL ASSUMPTIONS**

- Single unified product experience for elders and producers
- Primary entry point is a custom SMS link
- First meaningful action is always a conversation
- Differences between elders and producers emerge through behavior, not gated access
- Mobile-first, browser-based experience

---

# 01. FIRST TIME AUTH

**PURPOSE**

Get a user from SMS link to a live recording with the fewest possible steps.

## **COMPONENTS**

- SMS Link Handler
- Invite Validator
- Authentication Gate
- Phone Input
- OTP Input

## **PRIMARY FLOW**

1. User taps custom SMS link.
2. Ember opens in mobile browser.
3. Client sends invite token to backend for validation.
4. If user is already authenticated, proceed directly to recording.
5. If user is not authenticated, begin phone verification.
6. User enters phone number (prefilled or partially masked if known).
7. User requests one-time code.
8. User enters one-time code.
9. On success, persist authentication session.
10. Immediately proceed to recording.

## **OPEN QUESTIONS (ENGINEERING / PRODUCT)**

- Supported auth methods:
- Phone only (default assumption)
- Phone + email (future)
- Phone + Google / Kakao (future)
- Whether minimal onboarding info (name, language) is required before or after first recording.

## **ERROR / EXCEPTION HANDLING**

Invite validation fails:

• Show blocking message: “This link has expired.”

• Provide guidance to request a new link.

• No further navigation.

Network unavailable during validation:

• Show retry option.

• Do not proceed without validation.

Phone number invalid:

• Inline validation error.

• Prevent OTP request.

OTP send failure:

• Show retry option.

• Escalate copy after multiple failures.

OTP incorrect:

• Inline error: “That code didn’t work.”

• Allow retry.

• Lock out only if backend enforces rate limits.

Auth success but session persistence fails:

• Retry session write.

• Do not force re-verification unless required.

## **ENGINEERING CHECKLIST**

- [ ]  SMS deep link opens reliably

[ ] Invite token validated server-side

[ ] Auth persists across reloads

[ ] Successful auth always continues to recording

[ ] No dashboard or landing page before first recording

---

# 02. TALK JOURNEY (1st time)

**PURPOSE**

Enable immediate, voice-first recording with minimal UI and maximum clarity.

## **COMPONENTS**

- Voice Visualization
- Status Text
- Mute Button
- End Call Button
- Microphone Permission Gate
- Reconnection Indicator
- Microphone audio UI (visually cues user that microphone is working)

## **PRIMARY FLOW**

1. Page loads.
2. Microphone permission is checked.
3. If permission granted, recording starts automatically.
4. Ember initiates conversation (topic-loaded if scheduled).
5. User speaks freely.
6. User may mute or end call at any time.

## **UI REQUIREMENTS**

- Central animated voice graphic that reflects listening, speaking, and waiting
- Short status text describing current behavior
- Mute button that disables microphone capture
- End call button that terminates session immediately

## **ERROR / EXCEPTION HANDLING**

Microphone permission not granted:

• Block recording.

• Show explanation screen.

• Provide retry.

• Provide clear system instructions if permission denied.

Microphone hardware unavailable:

• Show blocking error.

• Suggest reload or device change.

Network interruption during call:

• Show reconnecting indicator.

• Attempt automatic recovery.

• If recovery fails, allow user to end call manually.

Audio capture failure mid-call:

• Surface error immediately.

• Do not silently continue.

## **ENGINEERING CHECKLIST**

- [ ]  Recording starts automatically

[ ] Mute fully disables mic input

[ ] Muted state clearly visible

[ ] End call works instantly

[ ] Reconnection attempts are visible

---

# 03. POST SESSION JOURNEY

PURPOSE

Transition from conversation to product without overwhelming the user.

## **COMPONENTS**

- Save Progress Indicator
- Save Confirmation
- Primary Continue Button
- Exit Option

## **PRIMARY FLOW**

1. Call ends.
2. Recording is saved automatically.
3. User sees save confirmation.
4. User chooses to continue or exit.

## **ERROR / EXCEPTION HANDLING**

Save delayed:

• Show progress indicator.

• Allow navigation if backend supports async save.

Save failure:

• Show error message.

• Provide retry.

• Allow user to continue if backend retries later.

## **ENGINEERING CHECKLIST**

- [ ]  Save starts automatically

[ ] User never confirms saving manually

[ ] Continue always leads to Home

[ ] Exit closes experience cleanly

---

# 04. HOME PAGE

PURPOSE

Provide a simple, durable hub for ongoing engagement.

## **COMPONENTS**

- Talk Button
- Build Button
- Share Button
- Account Button

## **PRIMARY FLOW**

1. User arrives from post-call.
2. User chooses next action.
3. No forced path.

## **BEHAVIORAL NOTES**

- Elders typically return to Talk or exit.

• Producers typically enter Build or Share.

• Visual emphasis may favor Talk, but all options remain accessible.

## **ERROR / EXCEPTION HANDLING**

Backend unavailable:

• Disable actions.

• Show retry message.

## **ENGINEERING CHECKLIST**

- [ ]  Home loads reliably

[ ] No role-based gating

[ ] Account always accessible

---

# 05. TALK JOURNEY (not 1st time)

PURPOSE

Support spontaneous, open-ended conversations.

## **PRIMARY FLOW**

1. User taps Talk.
2. Recording begins automatically.
3. Ember starts open-ended conversation.
4. End call returns to post-call handoff.

## **NOTES**

- No preloaded topic when initiated from Home.
- Same Talk interface as first recording.

---

# 06. REMEMBER JOURNEY

PURPOSE

Turn recordings into meaningful, engaging artifacts.

## **COMPONENTS**

- View Toggle (List / Reels)
- Session Title (AI generated post-call)
- Session List
- Audio Player
- Reels Feed (expounded on below)
- Reaction Controls (Emojis - like, laugh, sad, or comment)
- Follow-Up Request Controls (Request follow-up)

## **LIST VIEW FUNCTIONALITY**

- Display sessions chronologically.
- Each session shows:
- Person
- Date
- Summary
- Duration
- Show processing indicator when highlights not ready.
- Full playback with basic controls.
- Allow follow-up requests.
- Expecting ~20 minutes per session

## **REELS VIEW FUNCTIONALITY**

- Vertical swipe moves between sessions.
- Horizontal swipe moves between clips within a session.
- Clips auto-play.
- After final clip, show full-session playback.
- Reactions register immediately.
- End-of-content screens include:
- Requested stories
- Ability to request stories
- Completion message
- Upcoming topics with add option

## **ERROR / EXCEPTION HANDLING**

Audio fails to load:

• Retry.

• Skip to next clip if needed.

No content available:

• Show empty state.

• Direct user to Share.

---

# 07. SHARE JOURNEY

PURPOSE

Manage people, invitations, scheduling, and admin access.

## **COMPONENTS**

- People List

• Person Card

• Add Person Form

• Invite Sender

• Scheduling Editor

• Admin Access Controls

## **PEOPLE LIST DATA**

- First Name, Last Name

• Relationship (mother, father, grandmother, grandfather, brother, sister, cousin, friend, other)

• Birth year

• Contact info

• Verification status

• Next call and topic

• Past topics, calls, themes

## **PRIMARY ACTIONS**

- Add person.

• Send invitation via SMS.

• Schedule or reschedule calls.

• Adjust call cadence.

• Request or manage admin access.

## **ADMIN ACCESS RULES**

- Admin access grants full edit control.

• Requests trigger SMS approval.

• Approval required before access is granted.

• Access can be revoked at any time.

## **ERROR / EXCEPTION HANDLING**

Invite fails:

• Show error.

• Allow resend.

Verification pending:

• Clearly labeled.

• No broken flows.

Scheduling conflict:

• Inline explanation.

• Allow retry or override.

---

# 08. ACCOUNT SETTINGS

PURPOSE

Provide lightweight account transparency.

## **COMPONENTS**

- Phone number (read-only)

• Personal details

• Next call info

• Sign out

• Privacy and consent links

## **ENGINEERING CHECKLIST**

- [ ]  Sign out clears session

[ ] No destructive actions without confirmation

---



# CORE GUARANTEES

- Conversation always comes first

• No setup before first recording

• Voice is the primary interface

• Producers get depth without complexity

• Elders can disengage safely at any point