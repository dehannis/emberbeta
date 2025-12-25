# TalkToFigma API Limitations & Manual Fix Guide

## Known API Issues

### Issue: `create_text` with `parentId` - Incorrect Coordinate System

**Problem:**
When creating text nodes using `create_text` with a `parentId` parameter, the API does not correctly interpret relative coordinates. Text nodes are placed at incorrect positions within the parent frame.

**Example:**
- **Intended:** Create text at relative position `x: 19, y: 0` inside frame
- **Actual:** Text is created at relative position `x: 397, y: 25` (or other incorrect values)
- **Workaround:** Manual positioning in Figma UI

**Affected Operations:**
- Creating text nodes inside frames with `parentId`
- Moving text nodes to relative positions within parent frames

**Status:** Bug in TalkToFigma MCP API - needs to be reported to maintainers

---

## Manual Fix Guide: Option Component

### Current State
The Option component has correct:
- ✅ Text content ("01", "Talk", "Share your thoughts...")
- ✅ Font sizes (12px, 32px, 13px)
- ✅ Colors (gray-medium, white, gray-light)
- ✅ Font weights (300)
- ❌ **Positioning** - Number and Title are misaligned
- ❌ **Typography** - Title needs Source Serif Pro font
- ❌ **Letter spacing** - Needs adjustment
- ❌ **Text transform** - Number should be uppercase

### Step-by-Step Fix Instructions

#### 1. Fix Positioning

**Location:** "[WIP] DESIGN SYSTEM" → MOLECULES section → "Component - Option Example"

1. Select the frame "Component - Option Example"
2. Select "Option - Number" text node
3. In the Properties panel, set:
   - **X position:** `19` (same as Description)
   - **Y position:** `0` (top of frame)
4. Select "Option - Title" text node
5. In the Properties panel, set:
   - **X position:** `19` (same as Description and Number)
   - **Y position:** `20` (below Number, accounting for 12px font + spacing)

**Expected Result:**
- All three text elements should be left-aligned at x: 19
- Vertical spacing: Number (y: 0) → Title (y: 20) → Description (y: 60)

---

#### 2. Fix Title Font Family

1. Select "Option - Title" text node
2. In the Text panel, click the font dropdown
3. Change from **"Inter"** to **"Source Serif Pro"**
4. Ensure font style is **"Regular"** (or "Light" if available)

**Expected Result:**
- Title "Talk" should display in serif font (Source Serif Pro)
- Matches codebase: `font-family: 'Source Serif Pro', serif`

---

#### 3. Fix Letter Spacing

**For "Option - Number":**
1. Select "Option - Number" text node
2. In the Text panel, find "Letter spacing"
3. Set to: **`1.2px`** (0.1em × 12px = 1.2px)
   - Or use percentage: **10%** (0.1em = 10% of font size)

**For "Option - Title":**
1. Select "Option - Title" text node
2. In the Text panel, find "Letter spacing"
3. Set to: **`-0.64px`** (-0.02em × 32px = -0.64px)
   - Or use percentage: **-2%** (-0.02em = -2% of font size)

**Expected Result:**
- Number has wider letter spacing (uppercase label style)
- Title has tighter letter spacing (serif heading style)

---

#### 4. Fix Text Transform

**For "Option - Number":**
1. Select "Option - Number" text node
2. In the Text panel, find "Text transform" or "Case"
3. Set to: **"UPPERCASE"**

**Note:** If the text already says "01", you may need to manually change it to "01" (uppercase doesn't affect numbers, but ensures consistency with codebase `text-transform: uppercase`)

**Expected Result:**
- Number displays as "01" (already uppercase, but transform property set)

---

### Final Verification Checklist

After completing all fixes, verify:

- [ ] All three text elements are left-aligned at x: 19
- [ ] Vertical spacing: Number (top) → Title (middle) → Description (bottom)
- [ ] Title uses "Source Serif Pro" font
- [ ] Number letter spacing: 1.2px (10%)
- [ ] Title letter spacing: -0.64px (-2%)
- [ ] Number text transform: UPPERCASE
- [ ] Colors match:
  - Number: #666666 (gray-medium)
  - Title: #f5f5f5 (white)
  - Description: #a0a0a0 (gray-light)
- [ ] Font sizes match:
  - Number: 12px
  - Title: 32px
  - Description: 13px

---

### Codebase Reference

**File:** `src/styles.css` (lines 206-234)

```css
.option-number {
    font-size: 0.75rem;        /* 12px */
    font-weight: 300;
    letter-spacing: 0.1em;    /* 1.2px at 12px */
    color: var(--gray-medium); /* #666666 */
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.option-title {
    font-family: 'Source Serif Pro', serif;
    font-size: 2rem;          /* 32px */
    font-weight: 300;
    letter-spacing: -0.02em;  /* -0.64px at 32px */
    color: var(--white);      /* #f5f5f5 */
    margin-bottom: 0.5rem;
}

.option-description {
    font-size: 0.8125rem;     /* 13px */
    font-weight: 300;
    color: var(--gray-light); /* #a0a0a0 */
    max-width: 400px;
}
```

---

## Other API Limitations

### 1. `create_component_instance` with `parentId` - Parenting Not Working
**Problem:**
When creating component instances using `create_component_instance` with a `parentId` parameter, the instance is not properly parented to the specified frame. The instance is created at the page level, not inside the frame.

**Example:**
- **Intended:** Create Header instance inside Desktop Frame at relative position (0, 0)
- **Actual:** Header instance is created at absolute position (0, 0) on the page, not inside the frame
- **Workaround:** Manual parenting in Figma UI (drag instance into frame)

**Affected Operations:**
- Creating component instances inside frames with `parentId`
- All component instances created with `parentId` are not properly nested

**Status:** Bug in TalkToFigma MCP API

---

### 2. `clone_node` - No `parentId` Support
**Problem:**
The `clone_node` API does not support a `parentId` parameter, so cloned nodes are always created at the page level, not inside a target frame.

**Example:**
- **Intended:** Clone Options List frame inside Desktop Frame
- **Actual:** Options List is cloned at absolute position (0, 0) on the page
- **Workaround:** Manual parenting in Figma UI (drag cloned node into frame)

**Affected Operations:**
- Cloning frames/components that need to be nested in other frames
- All cloned nodes must be manually parented

**Status:** Missing feature in TalkToFigma MCP API

---

### 3. `move_node` - Position Updates Not Reflecting
**Problem:**
When moving nodes using `move_node`, the API reports success but the node's `absoluteBoundingBox` does not update to reflect the new position. This may be a refresh issue or the move operation may not be completing.

**Example:**
- **Intended:** Move Options List from (-1366, 6736) to (1348, 1263)
- **API Response:** Reports success
- **Actual:** Node's `absoluteBoundingBox` still shows old position (-1366, 6736)
- **Workaround:** Manual positioning in Figma UI, or verify position after a delay

**Affected Operations:**
- Moving nodes to new positions
- Repositioning cloned nodes

**Status:** Bug in TalkToFigma MCP API

---

### 4. Component Creation
- **Issue:** Cannot convert frames to components via API
- **Workaround:** Manual conversion (right-click → "Create Component")

### 2. Variant Creation
- **Issue:** Cannot create component variants via API
- **Workaround:** Manual creation in Figma UI

### 3. Auto-Layout Settings
- **Issue:** Cannot set auto-layout properties via API
- **Workaround:** Manual configuration in Figma UI

### 4. Text Styles
- **Issue:** Cannot create or apply text styles via API
- **Workaround:** Manual creation and application in Figma UI

### 5. Variables
- **Issue:** Cannot create Figma Variables via API
- **Workaround:** Manual creation in Figma UI

---

## Reporting API Issues

If you encounter other API limitations or bugs:

1. Document the issue with:
   - API function used
   - Expected behavior
   - Actual behavior
   - Steps to reproduce

2. Report to TalkToFigma MCP maintainers (if applicable)

3. Update this document with the new limitation

---

## Quick Reference: Coordinate System

**When using `parentId`:**
- Coordinates should be **relative** to parent frame's top-left corner (0,0)
- **Example:** If parent frame is at absolute (100, 200) and you want text at relative (10, 20), the text should appear at absolute (110, 220)

**Current Bug:**
- API is not correctly calculating relative positions
- Text nodes end up at incorrect absolute positions
- Manual positioning required as workaround

