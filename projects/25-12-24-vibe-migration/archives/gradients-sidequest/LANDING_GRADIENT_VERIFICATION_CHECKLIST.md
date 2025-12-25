# Landing Page Gradient Verification Checklist

Use this checklist to verify your 4 nested frames match the codebase implementation.

## Expected Structure: 4 Frames

Based on the codebase, you should have:

1. **Base Color Layer** (Frame 1)
2. **Base Gradient Layer** (Frame 2) 
3. **Overlay Layer** (Frame 3)
4. **Texture Layer** (Frame 4)

---

## Frame 1: Base Color Layer

### Codebase Reference:
```css
.landing-container {
  background: /* gradients */, #03050a;
}
```

### Checklist:
- [ ] **Frame name**: Contains "Base" or "Color" 
- [ ] **Fill**: Solid color `#03050a` (dark blue-black)
- [ ] **Blend mode**: Normal (default)
- [ ] **Opacity**: 100%
- [ ] **Size**: 1440×1024 (or matches your base size)
- [ ] **Position**: Bottom layer (behind all other frames)
- [ ] **No gradients**: Just solid color fill

### Common Issues:
- ❌ Wrong color (should be `#03050a`, not `#000000` or `#0a0a0a`)
- ❌ Has gradients (should be solid color only)
- ❌ Wrong position (should be bottom layer)

---

## Frame 2: Base Gradient Layer

### Codebase Reference:
```css
.landing-container {
  background:
    radial-gradient(1100px 760px at 18% 18%, rgba(110, 170, 255, 0.10), rgba(0, 0, 0, 0) 58%),
    radial-gradient(980px 680px at 84% 26%, rgba(185, 130, 255, 0.08), rgba(0, 0, 0, 0) 62%),
    radial-gradient(860px 640px at 62% 88%, rgba(80, 240, 215, 0.06), rgba(0, 0, 0, 0) 60%),
    radial-gradient(720px 520px at 42% 58%, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0) 62%);
}
```

### Checklist:
- [ ] **Frame name**: Contains "Base" and "Gradient"
- [ ] **Fills**: 4 radial gradients (as separate fills or combined)
- [ ] **Gradient 1**: 
  - [ ] Radial gradient
  - [ ] Position: `at 18% 18%` (top-left area)
  - [ ] Color: `rgba(110, 170, 255, 0.10)` (light blue, 10% opacity)
  - [ ] Fades to transparent at 58%
- [ ] **Gradient 2**:
  - [ ] Radial gradient
  - [ ] Position: `at 84% 26%` (top-right area)
  - [ ] Color: `rgba(185, 130, 255, 0.08)` (purple, 8% opacity)
  - [ ] Fades to transparent at 62%
- [ ] **Gradient 3**:
  - [ ] Radial gradient
  - [ ] Position: `at 62% 88%` (bottom-center area)
  - [ ] Color: `rgba(80, 240, 215, 0.06)` (cyan, 6% opacity)
  - [ ] Fades to transparent at 60%
- [ ] **Gradient 4**:
  - [ ] Radial gradient
  - [ ] Position: `at 42% 58%` (center area)
  - [ ] Color: `rgba(255, 255, 255, 0.025)` (white, 2.5% opacity)
  - [ ] Fades to transparent at 62%
- [ ] **Blend mode**: Normal (default)
- [ ] **Opacity**: 100%
- [ ] **Size**: 1440×1024 (same as base color)
- [ ] **Position**: Above base color layer, below overlay

### Common Issues:
- ❌ Missing one or more gradients (need all 4)
- ❌ Wrong gradient positions (check percentages)
- ❌ Wrong colors or opacity values
- ❌ Gradients too intense (opacity values too high)

---

## Frame 3: Overlay Layer

### Codebase Reference:
```css
.landing-container::before {
  inset: -18%;  /* 18% larger than container */
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00)),
    radial-gradient(880px 520px at 18% 14%, rgba(150, 205, 255, 0.07), rgba(0, 0, 0, 0) 64%),
    radial-gradient(820px 520px at 86% 34%, rgba(205, 165, 255, 0.06), rgba(0, 0, 0, 0) 62%);
  opacity: 0.9;
  mix-blend-mode: screen;
}
```

### Checklist:
- [ ] **Frame name**: Contains "Overlay"
- [ ] **Size**: ~1699×1208 (18% larger than 1440×1024 base)
  - Calculation: 1440 × 1.18 = 1699, 1024 × 1.18 = 1208
- [ ] **Position**: Centered over base layer (extends beyond edges)
- [ ] **Fills**: 3 gradients (1 linear + 2 radial)
- [ ] **Fill 1 - Linear gradient**:
  - [ ] Direction: 135deg (diagonal)
  - [ ] Color stops:
    - [ ] Start: `rgba(255, 255, 255, 0.045)` (white, 4.5% opacity)
    - [ ] 46%: `rgba(255, 255, 255, 0.00)` (transparent)
    - [ ] 82%: `rgba(255, 255, 255, 0.02)` (white, 2% opacity)
    - [ ] End: `rgba(255, 255, 255, 0.00)` (transparent)
- [ ] **Fill 2 - Radial gradient**:
  - [ ] Position: `at 18% 14%` (top-left)
  - [ ] Color: `rgba(150, 205, 255, 0.07)` (light blue, 7% opacity)
  - [ ] Fades to transparent at 64%
- [ ] **Fill 3 - Radial gradient**:
  - [ ] Position: `at 86% 34%` (top-right)
  - [ ] Color: `rgba(205, 165, 255, 0.06)` (purple, 6% opacity)
  - [ ] Fades to transparent at 62%
- [ ] **Blend mode**: **Screen** (critical!)
- [ ] **Opacity**: **90%** (0.9)
- [ ] **Position in stack**: Above base gradient, below texture

### Common Issues:
- ❌ Wrong size (not 18% larger - this is critical for the glow effect)
- [ ] Blend mode not set to **Screen** (will look wrong)
- ❌ Opacity not 90% (should be 0.9, not 100%)
- ❌ Missing linear gradient (need all 3 fills)
- ❌ Wrong gradient positions or colors

---

## Frame 4: Texture Layer

### Codebase Reference:
```css
.landing-container::after {
  inset: 0;  /* Same size as container */
  background:
    radial-gradient(1px 1px at 22% 18%, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0) 60%),
    radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 60%),
    radial-gradient(1px 1px at 84% 62%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 60%),
    radial-gradient(1px 1px at 34% 72%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 60%);
  opacity: 0.18;
  mix-blend-mode: overlay;
}
```

### Checklist:
- [ ] **Frame name**: Contains "Texture"
- [ ] **Size**: 1440×1024 (same as base, not extended)
- [ ] **Fills**: 4 tiny radial gradients (1px × 1px)
- [ ] **Fill 1**:
  - [ ] Position: `at 22% 18%` (top-left)
  - [ ] Color: `rgba(255, 255, 255, 0.10)` (white, 10% opacity)
  - [ ] Fades to transparent at 60%
- [ ] **Fill 2**:
  - [ ] Position: `at 68% 28%` (top-center)
  - [ ] Color: `rgba(255, 255, 255, 0.08)` (white, 8% opacity)
  - [ ] Fades to transparent at 60%
- [ ] **Fill 3**:
  - [ ] Position: `at 84% 62%` (right-center)
  - [ ] Color: `rgba(255, 255, 255, 0.07)` (white, 7% opacity)
  - [ ] Fades to transparent at 60%
- [ ] **Fill 4**:
  - [ ] Position: `at 34% 72%` (left-bottom)
  - [ ] Color: `rgba(255, 255, 255, 0.06)` (white, 6% opacity)
  - [ ] Fades to transparent at 60%
- [ ] **Blend mode**: **Overlay** (critical!)
- [ ] **Opacity**: **18%** (0.18)
- [ ] **Position in stack**: Top layer (above overlay)

### Common Issues:
- ❌ Blend mode not set to **Overlay** (will look wrong)
- ❌ Opacity not 18% (should be 0.18, not 100%)
- ❌ Missing gradients (need all 4 tiny sparkles)
- ❌ Gradients too large (should be 1px × 1px - very tiny)
- ❌ Wrong positions

---

## Layer Stack Order (Bottom to Top)

Verify your frames are in this order:

```
1. Base Color Layer (bottom)
   ↓
2. Base Gradient Layer
   ↓
3. Overlay Layer (18% larger, Screen blend, 90% opacity)
   ↓
4. Texture Layer (Overlay blend, 18% opacity)
   ↓
5. Content (Header, Options, Footer) - if present
```

### How to Check in Figma:
1. Open the Layers panel (left sidebar)
2. Verify frame order from bottom to top
3. Drag frames to reorder if needed

---

## Quick Visual Check

Your gradient should have:
- ✅ **Dark base** (#03050a) - very dark blue-black
- ✅ **Blue glow** (top-left) - subtle light blue
- ✅ **Purple glow** (top-right) - subtle purple
- ✅ **Cyan glow** (bottom-center) - subtle cyan
- ✅ **White overlay glow** (Screen blend) - soft white light
- ✅ **Subtle sparkle** (Overlay blend) - tiny white dots

If it looks:
- **Too dark/flat**: Missing overlay layer or wrong blend mode
- **Too bright/intense**: Missing texture layer or wrong opacity
- **Wrong colors**: Check gradient colors match codebase
- **No glow effect**: Overlay blend mode not set to Screen
- **No sparkle**: Texture blend mode not set to Overlay

---

## Most Common Mistakes

1. **Overlay size**: Not 18% larger (should be ~1699×1208)
2. **Blend modes**: Not set on frames (Screen for overlay, Overlay for texture)
3. **Opacity**: Wrong values (90% for overlay, 18% for texture)
4. **Missing fills**: Not all gradients added to each layer
5. **Layer order**: Frames in wrong order

---

## Next Steps

1. Go through each frame and check off items above
2. Note any discrepancies
3. Fix issues one by one
4. Compare visually to localhost:5173

If you can share what you find in each frame (names, sizes, blend modes, opacities), I can help identify specific issues!

