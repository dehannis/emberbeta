# Figma Component Update Guide - Quick Reference

## Current Issue
The Figma API is timing out, so I cannot directly update components. Use this guide to update them manually.

## Step-by-Step: Update Button Components

### 1. Button / Feed Beta

**Find the existing component** in "[WIP] DESIGN SYSTEM" page.

**Update it:**
1. Double-click to enter component edit mode
2. Select the frame
3. **Set Auto-Layout:**
   - Direction: Horizontal
   - Padding: Top: 5.6px, Right: 9.6px, Bottom: 5.6px, Left: 9.6px
   - Horizontal alignment: Center
   - Vertical alignment: Center
4. **Update Background Rectangle:**
   - Fill: `rgba(255, 255, 255, 0.04)` or `#0a0a0a` with 4% opacity
   - Stroke: `rgba(255, 255, 255, 0.14)` or `#ffffff` with 14% opacity
   - Stroke width: 1px
   - Corner radius: 999px
5. **Add/Update Text Layer:**
   - Create text layer inside the frame
   - Text: "Listen (Beta)"
   - Font: Inter or SF Pro Text
   - Size: 11px
   - Weight: Light or Regular (300)
   - Letter spacing: 0px or 2%
   - Color: `#a0a0a0` (gray-light)
   - Align: Center (both horizontal and vertical)
6. **Create Hover Variant:**
   - Duplicate component
   - Update border: `rgba(255, 255, 255, 0.28)`
   - Update background: `rgba(255, 255, 255, 0.07)`
   - Update text color: `#f5f5f5` (white)

---

### 2. Button / Auth

**Find or create the component** in "[WIP] DESIGN SYSTEM" page.

**Create/Update it:**
1. Create a Frame (or select existing)
2. **Set Auto-Layout:**
   - Direction: Horizontal
   - Padding: Top: 8px, Right: 0px, Bottom: 8px, Left: 0px
   - Horizontal alignment: Center
   - Vertical alignment: Center
   - Width: 100% (or set to 400px for max-width)
3. **No background rectangle needed** (transparent)
4. **Add Text Layer:**
   - Text: "CONTINUE"
   - Font: Inter or SF Pro Text
   - Size: 13px
   - Weight: Light or Regular (300)
   - Letter spacing: 1px or 10%
   - Text transform: UPPERCASE
   - Color: `rgba(255, 255, 255, 0.7)` or `#ffffff` with 70% opacity
   - Align: Center
5. **Create Variants:**
   - **Hover:** Text color `rgba(255, 255, 255, 0.95)`
   - **Disabled:** Opacity 40%, text color `rgba(255, 255, 255, 0.28)`

---

### 3. Input / Phone

**Create new component** in "[WIP] DESIGN SYSTEM" page.

**Create it:**
1. Create a Frame
2. **Set Auto-Layout:**
   - Direction: Vertical
   - Padding: All sides: 16px
   - Horizontal alignment: Center
   - Vertical alignment: Center
   - Width: 100% (max-width: 400px)
3. **Add Background Rectangle:**
   - Fill: `rgba(255, 255, 255, 0.05)` or `#ffffff` with 5% opacity
   - Stroke: `rgba(255, 255, 255, 0.15)` or `#ffffff` with 15% opacity
   - Stroke width: 1px
   - Corner radius: 8px
   - Make it fill the frame (set constraints: Fill container)
4. **Add Text Layer:**
   - Text: "(555) 123-4567"
   - Font: Inter or SF Pro Text
   - Size: 16px
   - Weight: Light or Regular (300)
   - Letter spacing: 0px or 1%
   - Line height: 24px or 150%
   - Color: `rgba(255, 255, 255, 0.3)` (placeholder color)
   - Align: Center
   - Position: Centered in frame
5. **Create Variants:**
   - **Focus:** Border `rgba(255, 255, 255, 0.3)`, background `rgba(255, 255, 255, 0.08)`
   - **Active/Value:** Text color `rgba(255, 255, 255, 0.9)`

---

### 4. Input / OTP

**Create new component** in "[WIP] DESIGN SYSTEM" page.

**Create it:**
1. Same as Phone Input, but:
   - Width: ~120px (or auto-fit to 6 digits)
   - Text: "123456" (no formatting)
   - Letter spacing: 2px or 12% (slightly wider)

---

### 5. Form Container

**Create new component** in "[WIP] DESIGN SYSTEM" page.

**Create it:**
1. Create a Frame
2. **Set Auto-Layout:**
   - Direction: Vertical
   - Padding: All sides: 32px
   - Gap: 8px (between children)
   - Horizontal alignment: Center
   - Vertical alignment: Top
   - Width: 100% (max-width: 400px)
3. **Add Background Rectangle:**
   - Fill: `rgba(255, 255, 255, 0.05)`
   - Stroke: `rgba(255, 255, 255, 0.15)`
   - Stroke width: 1px
   - Corner radius: 8px
4. **Add child components inside:**
   - Label (text)
   - Input / Phone component
   - Button / Auth component

---

## Quick Color Reference

- **Gray Light:** `#a0a0a0` (text-secondary)
- **White:** `#f5f5f5` (text-primary)
- **Background 4%:** `rgba(255, 255, 255, 0.04)`
- **Background 5%:** `rgba(255, 255, 255, 0.05)`
- **Border 14%:** `rgba(255, 255, 255, 0.14)`
- **Border 15%:** `rgba(255, 255, 255, 0.15)`
- **Placeholder:** `rgba(255, 255, 255, 0.3)`
- **Text 70%:** `rgba(255, 255, 255, 0.7)`
- **Text 90%:** `rgba(255, 255, 255, 0.9)`

## Tips

1. **Use Auto-Layout** for all components - it makes spacing automatic
2. **Set constraints** on background rectangles to "Fill container"
3. **Center text** using auto-layout alignment, not manual positioning
4. **Create variants** for different states (hover, focus, disabled)
5. **Test components** by creating instances and checking spacing

## After Creating Components

1. Make sure all components are in the "[WIP] DESIGN SYSTEM" page
2. Organize them in a "Components" section
3. Add annotations describing their usage
4. Test by creating instances in wireframes

