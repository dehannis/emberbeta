# Landing Gradient Fixes - Based on Figma Inspection

## Issues Found

### ✅ What's Correct:
- **Base Layer**: All 4 radial gradients present and correct
- **Overlay Layer**: Blend mode (Screen), opacity (90%), all 3 gradients present
- **Texture Layer**: Blend mode (Overlay), opacity (18%), all 4 gradients present
- **Layer order**: Correct (Fill → Base → Overlay → Texture)

### ❌ Issues to Fix:

---

## Issue 1: Fill Layer Color (CRITICAL)

**Current:**
- Color: `rgba(3,5,10,0.35)` (35% opacity)

**Should be:**
- Color: `#03050a` (solid, 100% opacity)

**Why this matters:**
- The base color should be solid, not semi-transparent
- `rgba(3,5,10,0.35)` makes the background too light/transparent
- This affects the overall darkness of the gradient

**Fix:**
1. Select "Fill Layer" frame (38:237)
2. In the Fill section, change color from `rgba(3,5,10,0.35)` to `#03050a`
3. Ensure opacity is 100% (not 35%)

---

## Issue 2: Overlay Layer Size (CRITICAL)

**Current:**
- Size: 1440×1024

**Should be:**
- Size: ~1699×1208 (18% larger)
- Calculation: 1440 × 1.18 = 1699.2, 1024 × 1.18 = 1208.32

**Why this matters:**
- The CSS uses `inset: -18%` which extends the overlay beyond the container
- This creates the extended glow effect
- Without the larger size, the glow is clipped and looks wrong

**Fix:**
1. Select "Overlay Layer" frame (38:238)
2. Resize to 1699×1208 (or round to 1700×1210)
3. Center it over the base layer (align center both horizontally and vertically)
4. The overlay should extend beyond the base layer edges

---

## Detailed Comparison

### Fill Layer (38:237)
| Property | Current | Should Be | Status |
|----------|---------|-----------|--------|
| Color | `rgba(3,5,10,0.35)` | `#03050a` | ❌ Wrong |
| Opacity | 35% | 100% | ❌ Wrong |
| Size | 1440×1024 | 1440×1024 | ✅ Correct |
| Blend Mode | Normal | Normal | ✅ Correct |

### Base Layer (38:241)
| Property | Current | Should Be | Status |
|----------|---------|-----------|--------|
| Gradients | 4 radial | 4 radial | ✅ Correct |
| Gradient 1 | `rgba(110,170,255,0.1)` | `rgba(110,170,255,0.10)` | ✅ Correct |
| Gradient 2 | `rgba(185,130,255,0.08)` | `rgba(185,130,255,0.08)` | ✅ Correct |
| Gradient 3 | `rgba(80,240,215,0.06)` | `rgba(80,240,215,0.06)` | ✅ Correct |
| Gradient 4 | `rgba(255,255,255,0.025)` | `rgba(255,255,255,0.025)` | ✅ Correct |
| Size | 1440×1024 | 1440×1024 | ✅ Correct |
| Blend Mode | Normal | Normal | ✅ Correct |
| Opacity | 100% | 100% | ✅ Correct |

### Overlay Layer (38:238)
| Property | Current | Should Be | Status |
|----------|---------|-----------|--------|
| Gradients | 1 linear + 2 radial | 1 linear + 2 radial | ✅ Correct |
| Linear Gradient | 144.583deg | 135deg | ⚠️ Close (acceptable) |
| Radial 1 | `rgba(150,205,255,0.07)` | `rgba(150,205,255,0.07)` | ✅ Correct |
| Radial 2 | `rgba(205,165,255,0.06)` | `rgba(205,165,255,0.06)` | ✅ Correct |
| Blend Mode | Screen | Screen | ✅ Correct |
| Opacity | 90% | 90% | ✅ Correct |
| **Size** | **1440×1024** | **~1699×1208** | ❌ **Wrong** |

### Texture Layer (38:239)
| Property | Current | Should Be | Status |
|----------|---------|-----------|--------|
| Gradients | 4 radial | 4 radial | ✅ Correct |
| Gradient 1 | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.10)` | ✅ Correct |
| Gradient 2 | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` | ✅ Correct |
| Gradient 3 | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.07)` | ✅ Correct |
| Gradient 4 | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` | ✅ Correct |
| Blend Mode | Overlay | Overlay | ✅ Correct |
| Opacity | 18% | 18% | ✅ Correct |
| Size | 1440×1024 | 1440×1024 | ✅ Correct |

---

## Step-by-Step Fix Instructions

### Fix 1: Fill Layer Color

1. Select the "Fill Layer" frame (node ID: 38:237)
2. In the right sidebar, find the "Fill" section
3. Click on the color swatch
4. Change from `rgba(3,5,10,0.35)` to `#03050a`
5. Ensure opacity slider is at 100% (not 35%)

### Fix 2: Overlay Layer Size

1. Select the "Overlay Layer" frame (node ID: 38:238)
2. In the right sidebar, find the width/height fields
3. Change width from `1440` to `1700` (or `1699` for exact)
4. Change height from `1024` to `1210` (or `1208` for exact)
5. Center the overlay over the base layer:
   - Select both "Base Layer" and "Overlay Layer"
   - Use "Align horizontal centers" (or press `Alt + H`)
   - Use "Align vertical centers" (or press `Alt + V`)
6. The overlay should now extend beyond the base layer edges

---

## Expected Result After Fixes

After applying both fixes, your gradient should:
- ✅ Have the correct dark base color (#03050a)
- ✅ Show the extended glow effect from the overlay (extends beyond edges)
- ✅ Match the visual appearance of localhost:5173

---

## Visual Check

Compare to localhost:5173:
- **Base darkness**: Should be very dark blue-black (#03050a)
- **Glow effect**: Overlay should create a soft glow that extends beyond the frame edges
- **Color balance**: Blue/purple glows should be subtle, not overpowering
- **Sparkle**: Texture layer should add subtle white sparkles (very faint)

If it still looks off after these fixes, the gradient positions or colors within each layer may need adjustment, but the structure and blend modes are correct!

