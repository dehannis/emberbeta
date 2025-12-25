# Figma Update Instructions

This document provides step-by-step instructions for updating Figma wireframes with codebase implementation details.

## Prerequisites

- Access to Figma file: `P9ZetOmtLwAhTriE1h8L8P`
- Design system page: "[WIP] DESIGN SYSTEM"
- Journey pages: 01-08 (numbered pages)

## Part 1: Design System Updates

### 1.1 Colors

**Location**: "[WIP] DESIGN SYSTEM" → Colors section

**Add Color Swatches**:
1. Create new color swatches for CSS variables:
   - `--black: #0a0a0a`
   - `--white: #f5f5f5`
   - `--gray-dark: #1a1a1a`
   - `--gray-medium: #666666`
   - `--gray-light: #a0a0a0`

2. Add background base colors:
   - Landing: `#03050a`
   - Account: `#01020a`
   - Build: `#01020a`
   - Share: `#01030a`
   - People: `#07070b`
   - Talk: `#000`

3. Document RGBA variations:
   - White: `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.95)`
   - Borders: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.28)`

**Annotation**: "From: src/styles.css :root variables"

### 1.2 Typography

**Location**: "[WIP] DESIGN SYSTEM" → Typography section

**Create Text Styles**:

1. **Headings** (Source Serif Pro):
   - H1: 2rem (32px), weight 300, letter-spacing -0.02em
   - H2: 1.75rem (28px), weight 300, letter-spacing -0.02em
   - H3: 1.5rem (24px), weight 300, letter-spacing -0.01em

2. **Body** (System font stack):
   - Large: 1rem (16px), weight 300, line-height 1.6
   - Normal: 0.8125rem (13px), weight 300, line-height 1.6
   - Small: 0.75rem (12px), weight 300, line-height 1.6
   - XSmall: 0.6875rem (11px), weight 300, line-height 1.6

3. **Labels** (Uppercase):
   - Small: 0.6875rem, weight 300, letter-spacing 0.1em
   - XSmall: 0.625rem, weight 300, letter-spacing 0.14em

**Font Families**:
- Headings: `'Source Serif Pro', serif`
- Body: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`

**Annotation**: "From: src/styles.css typography rules"

### 1.3 Gradients

**Location**: "[WIP] DESIGN SYSTEM" → Create new "Gradients" section

**Add Gradient Swatches**:

1. **Landing Page Background**:
   - Base: Multiple radial gradients (see DESIGN_SYSTEM_EXTRACTION.md)
   - Overlay: Linear + radial with screen blend mode
   - Texture: Radial gradients with overlay blend mode

2. **Account Page Background**:
   - Base: 5 radial gradients
   - Overlay: Linear + radial with screen blend mode

3. **Build Page Background**:
   - Base: 5 radial gradients
   - Overlay: Conic gradient + linear with blur

4. **People Page Background**:
   - Base: Conic gradient + radial gradients
   - Overlay: Radial + repeating linear gradient
   - Animation: `peopleLiquidDrift` (14s ease-in-out infinite alternate)

5. **Share Page Background**:
   - Base: 5 radial gradients
   - Overlay: Conic gradient + linear with blur

**Note**: Gradients are complex multi-layer compositions. Create simplified versions for design system, document full CSS in annotations.

**Annotation**: "From: src/styles.css and page-specific CSS files"

### 1.4 Spacing

**Location**: "[WIP] DESIGN SYSTEM" → Spacing section

**Add Spacing Tokens**:
- 0.35rem (5.6px) - Small gap
- 0.5rem (8px) - Medium gap
- 0.75rem (12px) - Default gap
- 1rem (16px) - Large gap
- 1.5rem (24px) - XLarge gap
- 2rem (32px) - Container padding
- 3.5rem (56px) - XXLarge gap

**Container Padding**:
- Desktop: `2rem 2rem 0 2rem`
- Tablet: `1.5rem 0.75rem 0 0.75rem`
- Mobile: `1rem 0.75rem 0 0.75rem`

**Max Widths**:
- Mobile: `600px`
- Touch: `760px`
- Tablet: `980px`

**Annotation**: "From: src/styles.css container and spacing rules"

### 1.5 Components

**Location**: "[WIP] DESIGN SYSTEM" → Create "Components" section

**Add Component Instances**:

1. **Header Component**:
   - Home icon: `○` (circle character)
   - Beta buttons: Border, background, padding, border-radius
   - Phone number display
   - Responsive behavior

2. **Footer Component**:
   - Copyright text
   - Privacy/Terms links
   - Layout and spacing

3. **Option Component**:
   - Number label (uppercase, gray-medium)
   - Title (Source Serif Pro, 2rem)
   - Description (0.8125rem, gray-light)
   - Hover states (padding-left animation)
   - Border animations

4. **Buttons**:
   - Feed beta button: Border, background, padding, border-radius
   - Auth button: Transparent, uppercase
   - Control button: Circle (56px), transparent background
   - Various states (hover, active, disabled)

5. **Form Inputs**:
   - Phone input: Background, border, padding, border-radius
   - OTP input: Same styling
   - Textarea: Auto-resize behavior
   - Input states (error, success, warning)

6. **Scrollbar**:
   - Thin scrollbar (10px width)
   - Custom colors (rgba white variations)
   - WebKit and Firefox variants

**Annotation**: "From: src/components/* and src/pages/* components"

---

## Part 2: Journey Page Updates

### 2.1 Page 01: First Time Auth

**Location**: "01. First Time Auth" page

**Update Wireframes**:

1. **Initial Video State**:
   - Full-screen video background
   - Video player element
   - Annotation: "Video autoplays, ends → phone input"

2. **Phone Input Form**:
   - Overlay: `rgba(0, 0, 0, 0.7)` with `blur(4px)`
   - Centered form (max-width: 400px)
   - Label: "Enter your phone number"
   - Description: "We'll send you a verification code"
   - Input field (phone format)
   - Button: "Continue"
   - Annotation: "From: src/pages/VideoLanding.tsx"

3. **OTP Verification Form**:
   - Same overlay styling
   - Label: "Enter verification code"
   - Description: "We sent a code to [phone]"
   - 6-digit input
   - Button: "Verify"
   - Error state variant: "That code didn't work"

4. **Post-Verification Video**:
   - Video plays automatically
   - Fade overlay on end

5. **Connecting Screen**:
   - Full-screen black
   - Centered text: "CONNECTING TO EMBER..."
   - Typewriter effect visualization
   - Blinking cursor
   - Annotation: "Navigates to /talk after completion"

**Add State Transitions**:
- Video → Phone Input → OTP → Post-Video → Connecting → Talk

### 2.2 Page 02: Talk Journey (1st time)

**Location**: "02. Talk Journey (1st time)" page

**Update Wireframes**:

1. **Entering Animation**:
   - Circle orb (180px, 140px mobile)
   - Fade in + scale animation
   - Annotation: "1.5s cubic-bezier transition"

2. **Connecting State**:
   - Orb with breathing ring animation
   - Speaking dots (3 dots, staggered)
   - Listening bars (5 bars, staggered)
   - State text: "CONNECTING"
   - Annotation: "From: src/pages/Talk.tsx connecting state"

3. **Live (Listening)**:
   - Orb with mic ring (reacts to volume)
   - Listening bars (real-time visualization)
   - State text: "LISTENING"
   - Controls: Mute, End call buttons

4. **Live (Speaking)**:
   - Orb with ember ring (reacts to playback)
   - Speaking dots (real-time visualization)
   - State text: "SPEAKING"
   - Controls: Mute, End call buttons

5. **Muted State**:
   - Orb opacity: 0.4
   - Reduced glow
   - State text: "MUTED"
   - Unmute button highlighted

6. **Error State**:
   - Error message display
   - Retry option

7. **Color Schemes**:
   - Show 8 color scheme variants:
     - Blue (default), Orange, Green, Red, Yellow, Purple, White, Klein
   - Annotation: "From: src/pages/Talk.tsx colorSchemes array"

**Add Components**:
- Ember orb (with glow effects)
- Status text (below orb)
- Control buttons (mute, end call)
- Exit overlay (full-screen)

### 2.3 Page 03: Post Session Journey

**Location**: "03. Post Session Journey" page

**Update Wireframes**:

1. **Save Progress State**:
   - Exit overlay (full-screen, blur)
   - Centered content (positioned from orb)
   - Button: "SAVE PROGRESS"
   - Button: "DELETE SESSION" (below, smaller)
   - Annotation: "From: src/pages/Talk.tsx exit overlay"

2. **Save Confirmation**:
   - Confirmation message
   - Continue/Exit options
   - Note: "Currently transitions to home"

**Add State Flow**:
- Talk → Exit Overlay → Save/Delete → Home

### 2.4 Page 04: Home Page

**Location**: "04. Home Page" page

**Update Wireframes**:

1. **Default State**:
   - Header: Home icon, beta buttons, phone number
   - Main: Three options (Talk, Build, Share)
   - Footer: Copyright, links
   - Background: Landing gradient

2. **Option Hover States**:
   - Padding-left: 1rem
   - Letter-spacing changes
   - Border animation

**Components to Add**:
- Header component instance
- Three Option components
- Footer component instance
- Background gradient visualization

**Annotation**: "From: src/pages/Landing.tsx"

### 2.5 Page 05: Talk Journey (not 1st time)

**Location**: "05. Talk Journey (not 1st time)" page

**Update Wireframes**:
- Same as Page 02, but note:
  - No initial entering animation
  - Faster connection
  - May remember color scheme

**Annotation**: "Same as Journey 02, but returning user flow"

### 2.6 Page 06: Remember Journey

**Location**: "06. Remember Journey" page

**Update Wireframes**:

#### Feed Route States:

1. **Loading Feed**:
   - Loading spinner
   - "Loading your memories..." text

2. **Recording Stack Active**:
   - Swipeable card stack
   - Current recording visible
   - Swipe gestures indicated

3. **End of Feed States**:
   - Empty state messages
   - CTAs for each type

4. **Snippet Page**:
   - Snippet detail view
   - Audio player
   - Transcript

5. **Full Recording**:
   - Full recording playback
   - Controls

#### Build Route States:

1. **Spiral Timeline View**:
   - 3D spiral visualization
   - Memory orbs on timeline
   - Chapter bar (horizontal)
   - Person selector (top right)
   - Audio player (bottom)

2. **List View**:
   - Card-based list
   - Stories panel (left)
   - Next Call panel (right)
   - Person selector
   - Audio player

3. **Empty State**:
   - "Share a Story" message
   - Empty orb
   - Prompt editor

4. **Chapter Active**:
   - Chapter bar visible
   - Active chapter highlighted
   - Filtered timeline

5. **Memory Selected**:
   - Centered memory pane
   - Audio player details
   - Chapter info

**Components to Add**:
- Swipe interface
- Audio player
- Memory orbs
- Chapter bar
- Person selector
- Prompt editor
- Memory panes (glass photos)

**Annotation**: "From: src/pages/Feed.tsx and src/pages/Build.tsx"

### 2.7 Page 07: Share Journey

**Location**: "07. Share Journey" page

**Update Wireframes**:

#### Share Route States:

1. **People List View**:
   - Grid of person cards
   - Add person button
   - Search/filter

2. **Add Person Form**:
   - Name, phone, relationship inputs
   - Birth year input
   - Save button

3. **Person Detail/Edit**:
   - Person info form
   - Next call settings
   - Topic mode selector
   - Prompt editor
   - Schedule editor

4. **Invite Sending**:
   - Sending state
   - Success/error states

#### People Routes States:

1. **PeopleHome**:
   - Gallery view (2-column grid)
   - Search bar
   - Sort dropdown
   - Person tiles

2. **PersonDetail**:
   - Hero view (large photo)
   - Person name (Source Serif Pro)
   - Meta tags
   - Action buttons
   - Detail sections

3. **PersonSnippets**:
   - Snippet list
   - Filter chips
   - Snippet cards
   - Play controls

4. **PersonSchedule**:
   - Schedule view
   - Next call info
   - Frequency settings

5. **PersonTopics**:
   - Topics list
   - Topic cards
   - Add topic button

**Components to Add**:
- Person cards
- Form inputs
- Dropdowns
- Orb scene (3-orb visualization)
- Schedule editor

**Annotation**: "From: src/pages/Share.tsx and src/people/pages/*"

### 2.8 Page 08: Account Settings

**Location**: "08. Account Settings" page

**Update Wireframes**:

1. **Form View**:
   - Name input
   - Birth year input
   - Language dropdown
   - Voice dropdown
   - Next call settings section
   - Contacts list section
   - Save button

2. **Editing States**:
   - Input focus states
   - Form validation errors
   - Saving state

3. **Saved State**:
   - Success indicator
   - "Saved" confirmation

**Components to Add**:
- Form inputs
- Dropdowns
- Textarea (auto-resize)
- Section boxes (glass cards)
- Contact list items
- Privacy toggle buttons

**Layout Details**:
- Account title: Source Serif Pro, 2rem
- Section boxes: Spaced vertically, glass effect
- Form groups: Label + input
- Next call grid: Complex layout

**Annotation**: "From: src/pages/Account.tsx"

---

## General Guidelines

1. **Preserve Structure**: Keep existing wireframe template structure where possible
2. **Add Annotations**: Label each element with source file (e.g., "From: src/pages/Talk.tsx")
3. **Group States**: Group related states together (e.g., all Talk states in one section)
4. **Document Discrepancies**: Note any differences between code and wireframes
5. **Show Transitions**: Use arrows/annotations to show state transitions
6. **Include Values**: Use actual spacing, colors, and typography from codebase
7. **Responsive**: Show mobile/tablet/desktop variants where applicable
8. **Interactive States**: Include hover, active, focus, disabled states

## Completion Checklist

- [ ] Design system colors added
- [ ] Design system typography added
- [ ] Design system gradients documented
- [ ] Design system spacing tokens added
- [ ] Design system components added
- [ ] Journey 01 wireframes updated
- [ ] Journey 02 wireframes updated
- [ ] Journey 03 wireframes updated
- [ ] Journey 04 wireframes updated
- [ ] Journey 05 wireframes updated
- [ ] Journey 06 wireframes updated
- [ ] Journey 07 wireframes updated
- [ ] Journey 08 wireframes updated
- [ ] All states documented
- [ ] All annotations added
- [ ] Source references included

