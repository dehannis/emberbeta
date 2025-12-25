# Route to Journey Page Mapping

This document maps codebase routes to Figma journey pages and extracts all UI states for wireframe template updates.

## Route Structure (from src/App.tsx)

1. `/` → Landing
2. `/video-landing` → VideoLanding (First Time Auth)
3. `/talk` → Talk
4. `/feed` → Feed (Remember Journey)
5. `/build` → Build (Remember Journey - Timeline view)
6. `/share` → Share
7. `/account` → Account
8. `/people` → PeopleLayout
   - `/people` → PeopleHome
   - `/people/:personId` → PersonDetail
   - `/people/:personId/snippets` → PersonSnippets
   - `/people/:personId/schedule` → PersonSchedule
   - `/people/:personId/topics` → PersonTopics

---

## 01. First Time Auth ← `/video-landing`

**Component**: `src/pages/VideoLanding.tsx`

### States

#### 1. Initial Video State
- Full-screen video background
- Video autoplays
- Video ends → transitions to phone input

#### 2. Phone Input Form State
- Overlay: `rgba(0, 0, 0, 0.7)` with `blur(4px)`
- Centered form container (max-width: 400px)
- Label: "Enter your phone number"
- Description: "We'll send you a verification code"
- Input: Phone number field (formatted as user types)
- Button: "Continue" (disabled until valid phone)
- Animation: `contentSlideUp` (0.6s cubic-bezier)

#### 3. OTP Verification Form State
- Same overlay styling
- Label: "Enter verification code"
- Description: "We sent a code to [phone number]"
- Input: 6-digit code input
- Button: "Verify" (disabled until 6 digits)
- Error state: "That code didn't work" (inline)

#### 4. Post-Verification Video State
- Video plays automatically after verification
- Video ends → fade overlay appears
- Fade overlay: `#000` background, `fadeIn` animation (0.5s)

#### 5. Connecting Screen State
- Full-screen black background
- Centered text: "CONNECTING TO EMBER..."
- Typewriter effect (45-80ms per character, pauses on spaces/dots)
- Blinking cursor animation
- After completion → navigates to `/talk`

### Components Used
- Video player (HTML5 video)
- Auth overlay (backdrop blur)
- Form inputs (phone, OTP)
- Buttons (transparent, uppercase text)
- Connecting text with cursor

### Error States
- Invalid phone number: Inline validation error
- OTP send failure: Retry option
- OTP incorrect: "That code didn't work" inline error
- Network error: Retry option

---

## 02. Talk Journey (1st time) ← `/talk` (first visit)

**Component**: `src/pages/Talk.tsx`

### States

#### 1. Entering Animation State
- Container: `talk-container.active`
- Circle orb: Fades in and scales up (1.5s cubic-bezier)
- Initial opacity: 0, transform: scale(0.9)
- Final: opacity: 1, transform: scale(1)

#### 2. Connecting State
- Orb class: `ember-orb connecting`
- Ring animation: `emberBreath` (1.8s ease-in-out infinite)
- Speaking dots: 3 dots with staggered `emberDot` animation
- Listening bars: 5 bars with staggered `emberBar` animation
- State text: "CONNECTING" (below orb)

#### 3. Live (Listening) State
- Orb class: `ember-orb live`
- Mic ring: Reacts to mic volume (CSS variables)
- Listening bars: Real-time frequency visualization
- State text: "LISTENING"
- Controls: Mute button, End call button (visible)

#### 4. Live (Speaking) State
- Orb class: `ember-orb speaking live`
- Ember ring: Reacts to playback volume
- Speaking dots: Real-time audio visualization
- State text: "SPEAKING"
- Controls: Mute button, End call button

#### 5. Muted State
- Orb class: `ember-orb muted`
- Circle opacity: 0.4
- Reduced glow
- State text: "MUTED"
- Controls: Unmute button highlighted

#### 6. Error State
- Error message displayed
- Retry option
- State text: "ERROR" or error message

#### 7. Mic Permission Denied State
- Permission request UI
- Instructions to enable microphone
- Retry button

### Components Used
- Ember orb (180px circle, 140px mobile)
- Voice orb with 8 color schemes:
  1. Blue (default): primary `140, 200, 255`, secondary `100, 180, 255`
  2. Orange: primary `255, 180, 120`, secondary `255, 150, 100`
  3. Green: primary `150, 220, 150`, secondary `120, 200, 120`
  4. Red: primary `255, 140, 140`, secondary `255, 120, 120`
  5. Yellow: primary `255, 220, 140`, secondary `255, 200, 120`
  6. Purple: primary `220, 180, 255`, secondary `200, 160, 255`
  7. White: primary `255, 255, 255`, secondary `240, 240, 240`
  8. Klein: primary `0, 47, 167`, secondary `0, 35, 150`
- Status text (below orb)
- Mute button (56px circle, 52px mobile)
- End call button (56px circle, 52px mobile)
- Exit overlay (full-screen with blur)
- Exit buttons (Save, Delete, Cancel)

### Interactive States
- Hover: Button color changes to `rgba(255, 255, 255, 0.9)`
- Active (mute): Color `rgba(255, 140, 140, 0.9)`
- End button hover: Color `rgba(255, 140, 140, 0.9)`

---

## 03. Post Session Journey ← Post-call state (handled in Talk component)

**Component**: `src/pages/Talk.tsx` (exit overlay)

### States

#### 1. Save Progress State
- Exit overlay appears
- Centered content (positioned from orb center)
- Button: "SAVE PROGRESS"
- Button: "DELETE SESSION" (below, smaller)
- Animation: `contentFadeIn` (0.35s ease-out)

#### 2. Save Confirmation State
- Confirmation message
- "Continue" or "Exit" options
- Note: Currently transitions directly to home

#### 3. Continue/Exit Options
- Continue button
- Exit button
- Currently transitions to `/` (home)

### Components Used
- Exit overlay (full-screen, `rgba(0, 0, 0, 0.85)`, `blur(8px)`)
- Exit buttons (transparent, uppercase)
- Save button (no border, larger text)
- Delete button (positioned below, smaller text)

---

## 04. Home Page ← `/`

**Component**: `src/pages/Landing.tsx`

### States

#### 1. Default State
- Header: Home icon (○), beta buttons, phone number
- Main content: Three options (Talk, Build, Share)
- Footer: Copyright, Privacy/Terms links
- Background: Landing gradient (futuristic glass)

#### 2. Hover States
- Option hover: `padding-left: 1rem`, letter-spacing changes
- Beta button hover: Border/background brighten
- Phone number hover: Color changes to white

### Components Used
- Header component
  - Home icon: `○` (circle character)
  - Beta buttons: "Listen (Beta)", "People (Beta)"
  - Phone number: "+1-781-915-9663"
- Options component
  - Option 01: "Talk" - "Share your thoughts and memories through conversation"
  - Option 02: "Build" - "Create your shared story by preserving what matters"
  - Option 03: "Share" - "Connect and exchange memories with others"
- Footer component
  - Copyright: "Copyright 2025 Ember Studios, Inc."
  - Links: Privacy, Terms

### Layout
- Container padding: `2rem 2rem 0 2rem` (desktop)
- Main content padding-top: `8vh`
- Max-width: `600px` (mobile), `760px` (touch), `980px` (tablet)
- Options: Vertical list with borders between

---

## 05. Talk Journey (not 1st time) ← `/talk` (returning user)

**Component**: `src/pages/Talk.tsx`

### States
Same as Journey 02, but:
- No initial entering animation (orbs already visible)
- Faster connection (user already authenticated)
- States: Live, Muted, Error (same as first time)

### Differences from First Time
- Skips connecting animation (if session exists)
- May remember previous color scheme
- Faster state transitions

---

## 06. Remember Journey ← `/feed` and `/build`

### Feed Route (`/feed`)

**Component**: `src/pages/Feed.tsx` → `BuildSwipeExperience`

#### States (from BuildSwipeExperience)

1. **LOADING_FEED**
   - Loading spinner or skeleton
   - "Loading your memories..." text

2. **RECORDING_STACK_ACTIVE**
   - Swipeable card stack
   - Current recording visible
   - Swipe gestures enabled

3. **END_OF_FEED_REQUESTS**
   - No more requests
   - Empty state message
   - CTA to create new request

4. **END_OF_FEED_TOPICS**
   - No more topics
   - Empty state message

5. **END_OF_FEED_REST**
   - No more content
   - Empty state message

6. **END_OF_FEED_ACTIONS**
   - No more actions
   - Empty state message

7. **REQUEST_STORY**
   - Story request form
   - Input fields
   - Submit button

8. **PHOTO_TRIGGER**
   - Photo upload interface
   - Camera/gallery options

#### Inner States

- **SNIPPET_PAGE_ACTIVE**: Snippet detail view
- **FULL_RECORDING_ACTIVE**: Full recording playback

#### Components Used
- Swipe interface (card stack)
- Audio player
- Reaction controls
- Follow-up request controls
- Transcript view
- Photo upload interface

### Build Route (`/build`)

**Component**: `src/pages/Build.tsx`

#### View Modes

1. **Spiral Timeline View** (default)
   - 3D spiral visualization
   - Memory orbs positioned on timeline
   - Chapter bar (horizontal, above player)
   - Person selector (top right)
   - View toggle (top center)
   - Audio player (bottom, fixed)

2. **List View**
   - Card-based list
   - Stories panel (left)
   - Next Call panel (right)
   - Person selector
   - View toggle
   - Audio player (bottom)

#### States

1. **Empty State**
   - "Share a Story" message
   - Empty orb visualization
   - Prompt editor (bottom)

2. **Chapter Active State**
   - Chapter bar visible
   - Active chapter highlighted
   - Timeline filtered to chapter years

3. **Memory Selected State**
   - Centered memory pane
   - Audio player shows memory details
   - Chapter bar shows memory chapter

4. **Prompt Editor State**
   - Prompt input panel (bottom)
   - Mode selector (biography/custom)
   - Photo upload option
   - Preview panel

5. **Chapter Editor Modal**
   - Modal overlay
   - Chapter list editor
   - Year range inputs
   - Save/Cancel buttons

#### Components Used
- Spiral container (3D perspective)
- Memory panes (glass photos)
- Memory orbs (timeline markers)
- Chapter bar (horizontal scroll)
- Person selector (dropdown)
- View toggle (Timeline/List)
- Audio player (fixed bottom)
- Prompt editor (collapsible panel)
- Chapter editor modal

#### Interactive States
- Hover: Orb scales up, pane brightens
- Active: Selected memory highlighted
- Loading: Skeleton states for memories
- Error: Error message display

---

## 07. Share Journey ← `/share` and `/people/*`

### Share Route (`/share`)

**Component**: `src/pages/Share.tsx`

#### States

1. **People List View**
   - Grid of person cards
   - Add person button
   - Search/filter options

2. **Add Person Form**
   - Name input
   - Phone input
   - Relationship dropdown
   - Birth year input
   - Save button

3. **Person Detail/Edit**
   - Person information form
   - Next call settings
   - Topic mode selector
   - Prompt editor
   - Schedule editor

4. **Invite Sending**
   - Sending state
   - Success confirmation
   - Error handling

5. **Scheduling Editor**
   - Date/time picker
   - Timezone selector
   - Frequency selector
   - Save button

#### Components Used
- Person cards (with avatars)
- Form inputs (text, phone, dropdown)
- Buttons (save, cancel, delete)
- Dropdowns (relationship, timezone, language, voice)
- Textarea (prompt editor, auto-resize)
- Orb scene (3-orb visualization)
- Schedule editor (datetime picker)

### People Routes (`/people/*`)

#### PeopleHome (`/people`)

**Component**: `src/people/pages/PeopleHome.tsx`

##### States
1. **Gallery View**
   - Grid of person tiles (2 columns)
   - Search bar
   - Sort dropdown
   - Person tiles with photos

2. **Empty State**
   - No people message
   - Add person CTA

#### PersonDetail (`/people/:personId`)

**Component**: `src/people/pages/PersonDetail.tsx`

##### States
1. **Hero View**
   - Large photo background
   - Person name (large, Source Serif Pro)
   - Meta tags (relationship, etc.)
   - Action buttons

2. **Detail Sections**
   - Topics section
   - Snippets preview
   - Schedule info
   - Contact info

#### PersonSnippets (`/people/:personId/snippets`)

**Component**: `src/people/pages/PersonSnippets.tsx`

##### States
1. **Snippet List**
   - Filter chips
   - Snippet cards
   - Play controls

2. **Snippet Detail**
   - Audio player
   - Transcript
   - Tags
   - Actions

#### PersonSchedule (`/people/:personId/schedule`)

**Component**: `src/people/pages/PersonSchedule.tsx`

##### States
1. **Schedule View**
   - Next call info
   - Frequency settings
   - Time preferences
   - Edit button

#### PersonTopics (`/people/:personId/topics`)

**Component**: `src/people/pages/PersonTopics.tsx`

##### States
1. **Topics List**
   - Topic cards
   - Add topic button
   - Edit/delete actions

---

## 08. Account Settings ← `/account`

**Component**: `src/pages/Account.tsx`

### States

#### 1. Form View (Default)
- Name input
- Birth year input
- Language dropdown
- Voice dropdown
- Next call settings section
- Contacts list section
- Save button (disabled if no changes)

#### 2. Editing States
- Input focus: Border color changes
- Form validation: Inline errors
- Saving state: Button disabled, "Saving..." text

#### 3. Saved State
- Success indicator
- "Saved" confirmation
- Form returns to default state

### Components Used
- Form inputs (text, number, select)
- Dropdowns (language, voice, timezone)
- Textarea (next call prompt, auto-resize)
- Buttons (save, sign out)
- Section boxes (glass cards with borders)
- Contact list items
- Privacy toggle buttons

### Layout
- Account title (Source Serif Pro, 2rem)
- Section boxes (spaced vertically)
- Form groups (label + input)
- Next call grid (complex layout with days/time/tz)
- Contacts list (vertical, bordered items)

---

## State Extraction Summary

### Loading States
- Spinners: Used in Feed, Build (memory loading)
- Skeletons: Used in Build (memory panes)
- Loading text: "Loading...", "CONNECTING TO EMBER..."

### Error States
- Inline errors: Form validation (VideoLanding, Account, Share)
- Error messages: Network errors, permission denied
- Retry options: OTP send failure, network errors

### Empty States
- Feed: "No more content"
- Build: "Share a Story" with empty orb
- People: "No people yet"
- Share: Empty contact list

### Interactive States
- Hover: Buttons, options, cards (border/background changes)
- Active: Selected items, active tabs
- Focus: Form inputs (border highlight)
- Disabled: Buttons (opacity 0.35-0.4)

### Success States
- Confirmations: "Saved", "Invite sent"
- Visual indicators: Checkmarks, success colors

---

## Notes for Wireframe Updates

1. **Preserve existing wireframe structure** where possible
2. **Add annotations** indicating source (e.g., "From: src/pages/Talk.tsx")
3. **Group related states** together (e.g., all Talk states in one section)
4. **Document discrepancies** between code and wireframes
5. **Include responsive breakpoints** (mobile, tablet, desktop)
6. **Show state transitions** with arrows/annotations
7. **Include actual spacing values** from codebase
8. **Use actual colors** from CSS variables
9. **Show typography** with actual font families and sizes

