# Figma Design System Variables & Styles Setup Guide

## Overview

To properly codify fonts, colors, and other design tokens in Figma, you should create **Figma Variables** and **Text Styles**. This allows for:
- Consistent reuse across all wireframes
- Easy updates (change once, update everywhere)
- Better alignment with codebase CSS variables

## Current Status

✅ **Design tokens extracted** from codebase
❌ **Figma Variables** - Not yet created
❌ **Text Styles** - Not yet created
❌ **Color Styles** - Not yet created

## Step 1: Create Color Variables

### In Figma Desktop:
1. Open the "[WIP] DESIGN SYSTEM" page
2. Go to **Variables** panel (right sidebar, or View → Variables)
3. Create a new **Variable Collection** named "Ember Design Tokens"

### Core Color Variables to Create:

#### Base Colors (from CSS variables)
- `--black`: `#0a0a0a`
- `--white`: `#f5f5f5`
- `--gray-dark`: `#1a1a1a`
- `--gray-medium`: `#666666`
- `--gray-light`: `#a0a0a0`

#### Background Base Colors
- `bg-landing`: `#03050a`
- `bg-account`: `#01020a`
- `bg-build`: `#01020a`
- `bg-share`: `#01030a`
- `bg-people`: `#07070b`
- `bg-talk`: `#000000`

#### Text Colors
- `text-primary`: `#f5f5f5` (white - for headings, primary text)
- `text-secondary`: `#a0a0a0` (gray-light - for descriptions)
- `text-tertiary`: `#666666` (gray-medium - for muted text)
- `text-placeholder`: `rgba(245, 245, 245, 0.9)` (white at 90% opacity)

#### Border Colors
- `border-light`: `rgba(255, 255, 255, 0.14)`
- `border-medium`: `rgba(255, 255, 255, 0.22)`
- `border-dark`: `rgba(255, 255, 255, 0.08)`

#### Talk Page Color Schemes (RGBA format)
- `talk-blue-primary`: `rgba(140, 200, 255, 1)`
- `talk-orange-primary`: `rgba(255, 180, 120, 1)`
- `talk-green-primary`: `rgba(150, 220, 150, 1)`
- `talk-red-primary`: `rgba(255, 140, 140, 1)`
- `talk-yellow-primary`: `rgba(255, 220, 140, 1)`
- `talk-purple-primary`: `rgba(220, 180, 255, 1)`
- `talk-white-primary`: `rgba(255, 255, 255, 1)`
- `talk-klein-primary`: `rgba(0, 47, 167, 1)`

## Step 2: Create Text Styles

### In Figma Desktop:
1. Select a text element
2. In the Text panel, click the **Style** dropdown (next to font name)
3. Click the **+** icon to create a new style

### CSS to Figma Unit Conversion Reference

#### Letter Spacing Conversion
| CSS Value | Font Size | Calculation | Figma Value (Pixels) | Figma Value (Percentage) |
|-----------|-----------|-------------|----------------------|-------------------------|
| `-0.02em` | 32px | -0.02 × 32 = -0.64px | `-1px` | `-2%` |
| `-0.02em` | 28px | -0.02 × 28 = -0.56px | `-1px` | `-2%` |
| `-0.01em` | 13px | -0.01 × 13 = -0.13px | `0px` | `-1%` |
| `0.01em` | 13px | 0.01 × 13 = 0.13px | `0px` | `1%` |
| `0.02em` | 11px | 0.02 × 11 = 0.22px | `0px` | `2%` |
| `0.1em` | 13px | 0.1 × 13 = 1.3px | `1px` | `10%` |
| `0.14em` | 11px | 0.14 × 11 = 1.54px | `2px` | `14%` |

**Note**: Figma allows both pixels and percentage. Use percentage for better scaling, or pixels for exact control.

#### Line Height Conversion
| CSS Value | Font Size | Calculation | Figma Value (Pixels) | Figma Value (Percentage) |
|-----------|-----------|-------------|----------------------|-------------------------|
| `1.12` | 32px | 1.12 × 32 = 35.84px | `36px` | `112%` |
| `1.12` | 28px | 1.12 × 28 = 31.36px | `31px` | `112%` |
| `1.4` | 13px | 1.4 × 13 = 18.2px | `18px` | `140%` |
| `1.4` | 11px | 1.4 × 11 = 15.4px | `15px` | `140%` |
| `1.5` | 11px | 1.5 × 11 = 16.5px | `17px` | `150%` |
| `1.6` | 13px | 1.6 × 13 = 20.8px | `21px` | `160%` |

**Note**: Figma supports "Auto" (default ~120%), pixels, or percentage. Use percentage for relative scaling.

#### Font Weight Mapping
| CSS Numeric | Figma Named Weight | Notes |
|-------------|-------------------|-------|
| `200` | **Thin** or **Light** | Use Light if Thin not available |
| `300` | **Light** or **Regular** | Most common in codebase; use Light if available, else Regular |
| `350` | **Light** or **Regular** | Closest match (between 300-400) |
| `400` | **Regular** or **Normal** | Standard weight |
| `500` | **Medium** | |
| `600` | **Semibold** | |
| `700` | **Bold** | |

**Note**: Not all fonts support all weights. If a weight isn't available, use the closest match.

### Text Styles to Create:

**Important: Figma Unit Conversions**
- **Letter Spacing**: CSS `em` units convert to pixels or percentage
  - `-0.02em` at 32px = `-0.64px` → use `-1px` or `-2%` in Figma
  - `0.01em` at 13px = `0.13px` → use `0px` or `1%` in Figma
  - `0.1em` at 13px = `1.3px` → use `1px` or `10%` in Figma
- **Line Height**: CSS unitless ratios convert to pixels or percentage
  - `1.12` at 32px = `35.84px` → use `36px` or `112%` in Figma
  - `1.6` at 13px = `20.8px` → use `21px` or `160%` in Figma
- **Font Weight**: CSS numeric values map to Figma named weights
  - `200` = "Thin" or "Light" (if available)
  - `300` = "Light" or "Regular" (closest match)
  - `350` = "Light" or "Regular" (closest match)
  - `400` = "Regular" or "Normal"

#### Heading Styles
- **Heading 1 / H1**
  - Font: Source Serif Pro
  - Size: 32px (2rem)
  - Weight: **Regular** (maps from CSS `400`)
  - Letter spacing: **-1px** or **-2%** (converted from CSS `-0.02em`)
  - Line height: **36px** or **112%** (converted from CSS `1.12`)
  - Color: `text-primary` variable

- **Heading 2 / H2**
  - Font: Source Serif Pro
  - Size: 28px (1.75rem)
  - Weight: **Regular** (maps from CSS `400`)
  - Letter spacing: **-1px** or **-2%** (converted from CSS `-0.02em`)
  - Line height: **31px** or **112%** (converted from CSS `1.12` at 28px)
  - Color: `text-primary` variable

#### Body Text Styles
- **Body / Regular**
  - Font: System (Inter or SF Pro Text)
  - Size: 13px (0.8125rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **0px** or **1%** (converted from CSS `0.01em`)
  - Line height: **21px** or **160%** (converted from CSS `1.6`)
  - Color: `text-primary` variable

- **Body / Secondary**
  - Font: System (Inter or SF Pro Text)
  - Size: 13px (0.8125rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **0px** or **1%** (converted from CSS `0.01em`)
  - Line height: **21px** or **160%** (converted from CSS `1.6`)
  - Color: `text-secondary` variable

- **Small / Caption**
  - Font: System (Inter or SF Pro Text)
  - Size: 11px (0.6875rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **0px** or **2%** (converted from CSS `0.02em`)
  - Line height: **17px** or **150%** (converted from CSS `1.5`)
  - Color: `text-secondary` variable

#### Button Text Styles
- **Button / Uppercase**
  - Font: System (Inter or SF Pro Text)
  - Size: 13px (0.8125rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **1px** or **10%** (converted from CSS `0.1em`)
  - Line height: **18px** or **140%** (converted from CSS `1.4`)
  - Text transform: UPPERCASE
  - Color: `text-primary` variable

- **Button / Small**
  - Font: System (Inter or SF Pro Text)
  - Size: 11px (0.6875rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **0px** or **2%** (converted from CSS `0.02em`)
  - Line height: **15px** or **140%** (converted from CSS `1.4`)
  - Color: `text-primary` variable

#### Form Input Styles
- **Input / Placeholder**
  - Font: System (Inter or SF Pro Text)
  - Size: 14px (0.875rem) or 16px (1rem)
  - Weight: **Light** or **Regular** (maps from CSS `300`)
  - Letter spacing: **0px** or **1%** (converted from CSS `0.01em`)
  - Line height: **21px** (14px font) or **24px** (16px font), or **150%**
  - Color: `text-placeholder` variable

## Step 3: Apply Variables to Existing Elements

### Update Wireframe Backgrounds:
1. Select background rectangles in wireframes
2. In Fill panel, click the color swatch
3. Click the **Variable** icon (four dots)
4. Select the appropriate variable (e.g., `bg-landing` for First Time Auth)

### Update Wireframe Text:
1. Select text elements
2. In Text panel, click the **Style** dropdown
3. Select the appropriate text style (e.g., "Body / Regular" for form labels)

## Step 4: Create Component Library

### Reusable Components to Create:

#### 1. **Button / Feed Beta**

**Structure:**
- Create a **Frame** (auto-layout: horizontal, padding: 5.6px 9.6px)
- Add a **Rectangle** as background (fill: `rgba(255, 255, 255, 0.04)`, stroke: `rgba(255, 255, 255, 0.14)`, corner radius: 999px)
- Add **Text** layer inside with:
  - Text: "Listen (Beta)" (or "People (Beta)")
  - Text style: "Button / Small"
  - Color: `text-secondary` variable (or `#a0a0a0`)
  - Position: Centered horizontally and vertically within padding

**Exact Specifications:**
- **Frame dimensions**: Auto (hug contents)
- **Padding**: 5.6px (top/bottom) × 9.6px (left/right)
- **Background rectangle**: 
  - Fill: `rgba(255, 255, 255, 0.04)` or use color variable
  - Stroke: `rgba(255, 255, 255, 0.14)` or `border-light` variable
  - Stroke width: 1px
  - Corner radius: 999px (pill shape)
- **Text layer**:
  - Content: "Listen (Beta)"
  - Font: System (Inter or SF Pro Text)
  - Size: 11px (0.6875rem)
  - Weight: Light or Regular
  - Letter spacing: 0px or 2% (from 0.02em)
  - Color: `#a0a0a0` (gray-light) or `text-secondary` variable
  - Position: Centered in frame (use auto-layout center alignment)

**Hover State Variant:**
- Border: `rgba(255, 255, 255, 0.28)`
- Background: `rgba(255, 255, 255, 0.07)`
- Text color: `#f5f5f5` (white) or `text-primary` variable

---

#### 2. **Button / Auth**

**Structure:**
- Create a **Frame** (auto-layout: horizontal, padding: 8px 0px)
- Add **Text** layer (no background rectangle needed):
  - Text: "CONTINUE" (uppercase)
  - Text style: "Button / Uppercase"
  - Color: `rgba(255, 255, 255, 0.7)` or `text-primary` variable at 70% opacity

**Exact Specifications:**
- **Frame dimensions**: Width: 100% (for full-width buttons), Height: Auto
- **Padding**: 8px (top/bottom) × 0px (left/right)
- **Background**: Transparent (no fill)
- **Border**: None
- **Text layer**:
  - Content: "CONTINUE"
  - Font: System (Inter or SF Pro Text)
  - Size: 13px (0.8125rem)
  - Weight: Light or Regular
  - Letter spacing: 1px or 10% (from 0.1em)
  - Text transform: UPPERCASE
  - Color: `rgba(255, 255, 255, 0.7)` or `text-primary` variable
  - Position: Centered horizontally

**Hover State Variant:**
- Text color: `rgba(255, 255, 255, 0.95)` or `text-primary` variable

**Disabled State Variant:**
- Opacity: 40%
- Text color: `rgba(255, 255, 255, 0.28)`

---

#### 3. **Input / Phone**

**Structure:**
- Create a **Frame** (auto-layout: vertical, padding: 16px)
- Add a **Rectangle** as background (fill: `rgba(255, 255, 255, 0.05)`, stroke: `rgba(255, 255, 255, 0.15)`, corner radius: 8px)
- Add **Text** layer inside with:
  - Text: "(555) 123-4567" (placeholder text)
  - Text style: "Input / Placeholder"
  - Color: `rgba(255, 255, 255, 0.3)` (placeholder color)
  - Position: Centered horizontally

**Exact Specifications:**
- **Frame dimensions**: Width: 100% (max-width: 400px), Height: Auto
- **Padding**: 16px (all sides)
- **Background rectangle**:
  - Fill: `rgba(255, 255, 255, 0.05)` or use color variable
  - Stroke: `rgba(255, 255, 255, 0.15)` or `border-light` variable
  - Stroke width: 1px
  - Corner radius: 8px
- **Text layer**:
  - Content: "(555) 123-4567"
  - Font: System (Inter or SF Pro Text)
  - Size: 16px (1rem)
  - Weight: Light or Regular
  - Letter spacing: 0px or 1% (from 0.01em)
  - Line height: 24px or 150% (from 1.5)
  - Color: `rgba(255, 255, 255, 0.3)` (placeholder)
  - Text align: Center
  - Position: Centered horizontally in frame

**Focus State Variant:**
- Border: `rgba(255, 255, 255, 0.3)`
- Background: `rgba(255, 255, 255, 0.08)`

**Active/Value State Variant:**
- Text color: `rgba(255, 255, 255, 0.9)` or `text-primary` variable

---

#### 4. **Input / OTP**

**Structure:**
- Same as Phone Input, but:
  - Text: "123456" (6 digits, no formatting)
  - Max-width: ~120px (to fit 6 digits)
  - Text align: Center

**Exact Specifications:**
- **Frame dimensions**: Width: ~120px (or auto-fit 6 digits), Height: Auto
- **Padding**: 16px (all sides)
- **Background rectangle**: Same as Phone Input
- **Text layer**:
  - Content: "123456"
  - Font: System (Inter or SF Pro Text)
  - Size: 16px (1rem)
  - Weight: Light or Regular
  - Letter spacing: 2px or 12% (slightly wider for readability)
  - Line height: 24px or 150%
  - Color: `rgba(255, 255, 255, 0.3)` (placeholder)
  - Text align: Center

---

#### 5. **Form Container**

**Structure:**
- Create a **Frame** (auto-layout: vertical, padding: 32px, gap: 8px)
- Add a **Rectangle** as background (fill: `rgba(255, 255, 255, 0.05)`, stroke: `rgba(255, 255, 255, 0.15)`, corner radius: 8px)
- Contains: Label, Description (optional), Input, Button

**Exact Specifications:**
- **Frame dimensions**: Width: 100% (max-width: 400px), Height: Auto
- **Padding**: 32px (2rem) all sides
- **Gap**: 8px (0.5rem) between children
- **Background rectangle**:
  - Fill: `rgba(255, 255, 255, 0.05)` or use color variable
  - Stroke: `rgba(255, 255, 255, 0.15)` or `border-light` variable
  - Stroke width: 1px
  - Corner radius: 8px
- **Auto-layout**: Vertical, center alignment

---

### Component Creation Steps in Figma:

1. **For Buttons:**
   - Create Frame → Set auto-layout (horizontal, center alignment)
   - Add padding (convert rem to px: 0.35rem = 5.6px, 0.6rem = 9.6px)
   - Create Rectangle background → Set fill, stroke, corner radius
   - Add Text layer → Apply text style, center align
   - Convert to Component (right-click → "Create Component")
   - Create variants for hover/disabled states

2. **For Inputs:**
   - Create Frame → Set auto-layout (vertical, center alignment)
   - Add padding (1rem = 16px)
   - Create Rectangle background → Set fill, stroke, corner radius
   - Add Text layer → Apply placeholder text style, center align
   - Convert to Component
   - Create variants for focus/active states

3. **For Form Container:**
   - Create Frame → Set auto-layout (vertical, gap: 8px)
   - Add padding (2rem = 32px)
   - Create Rectangle background → Set fill, stroke, corner radius
   - Add child components (Label, Input, Button) inside
   - Convert to Component

## Benefits of This Approach

1. **Consistency**: All wireframes use the same design tokens
2. **Maintainability**: Update colors/fonts in one place
3. **Alignment**: Matches codebase CSS variables structure
4. **Scalability**: Easy to add new colors/styles as needed
5. **Documentation**: Variables serve as living documentation

## Next Steps

1. ✅ Create color variables in Figma
2. ✅ Create text styles in Figma
3. ✅ Apply variables to design system swatches
4. ✅ Apply variables to wireframe backgrounds
5. ✅ Apply text styles to wireframe text elements
6. ✅ Create reusable component library
7. ✅ Update all journey wireframes to use variables/styles

## Manual vs. Automated

**Current Limitation**: The TalkToFigma MCP API doesn't support creating variables or styles directly. These need to be created manually in Figma Desktop.

**Workaround**: Once variables/styles are created, we can reference them in future wireframe updates, but the initial setup requires manual creation in Figma.

