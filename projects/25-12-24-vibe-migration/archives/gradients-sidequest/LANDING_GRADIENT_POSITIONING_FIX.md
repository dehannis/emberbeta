# Landing Gradient Positioning Issue

## The Problem

You're seeing **one symmetric concentric centered circle** in Figma, but localhost:5173/ shows **3 separate circular shapes** in blue, green, and purple.

## Root Cause

The 4 radial gradients in the base layer should be positioned at **different locations**, not centered:

### Codebase Gradient Positions:

1. **Gradient 1** (Blue): `at 18% 18%` - **Top-left area**
2. **Gradient 2** (Purple): `at 84% 26%` - **Top-right area**  
3. **Gradient 3** (Cyan/Green): `at 62% 88%` - **Bottom-center area**
4. **Gradient 4** (White): `at 42% 58%` - **Center area**

## Why You're Seeing One Centered Circle

The CSS Gradient to Figma plugin may be:
1. **Centering all gradients** instead of positioning them separately
2. **Combining gradients** into one fill instead of multiple fills
3. **Not applying the `at X% Y%` positioning** correctly

## Solution: Position Gradients Manually

Since the plugin may not handle multiple positioned gradients correctly, you need to:

### Option 1: Create Separate Frames for Each Gradient (Recommended)

Create 4 separate frames, each with one gradient positioned correctly:

**Frame 1: Blue Gradient (Top-Left)**
- Size: 1440×1024
- Gradient: Radial gradient
- Position: `at 18% 18%` (top-left area)
- Color: `rgba(110, 170, 255, 0.10)` → transparent at 58%
- Blend: Normal
- Opacity: 100%

**Frame 2: Purple Gradient (Top-Right)**
- Size: 1440×1024
- Gradient: Radial gradient
- Position: `at 84% 26%` (top-right area)
- Color: `rgba(185, 130, 255, 0.08)` → transparent at 62%
- Blend: Normal
- Opacity: 100%

**Frame 3: Cyan Gradient (Bottom-Center)**
- Size: 1440×1024
- Gradient: Radial gradient
- Position: `at 62% 88%` (bottom-center area)
- Color: `rgba(80, 240, 215, 0.06)` → transparent at 60%
- Blend: Normal
- Opacity: 100%

**Frame 4: White Gradient (Center)**
- Size: 1440×1024
- Gradient: Radial gradient
- Position: `at 42% 58%` (center area)
- Color: `rgba(255, 255, 255, 0.025)` → transparent at 62%
- Blend: Normal
- Opacity: 100%

Then stack all 4 frames on top of the base color layer.

### Option 2: Adjust Gradient Position in Figma

If using the plugin created one gradient fill:

1. Select the "Base Layer" frame
2. In the Fill section, you should see the gradient
3. Click on the gradient fill to edit it
4. In Figma's gradient editor, you can adjust the **position** of the gradient center
5. However, Figma may only support one gradient position per fill

**This is why Option 1 (separate frames) is recommended** - Figma's gradient editor may not support multiple positioned gradients in one fill.

## Visual Reference

The 3 circular shapes you should see:
- **Top-left**: Blue glow (`rgba(110, 170, 255, 0.10)`)
- **Top-right**: Purple glow (`rgba(185, 130, 255, 0.08)`)
- **Bottom-center**: Cyan/Green glow (`rgba(80, 240, 215, 0.06)`)

Plus a subtle white glow in the center.

## Verification

After fixing, you should see:
- ✅ 3 distinct circular glows (not one centered circle)
- ✅ Blue glow in top-left area
- ✅ Purple glow in top-right area
- ✅ Cyan/Green glow in bottom-center area
- ✅ Matches localhost:5173/ appearance

