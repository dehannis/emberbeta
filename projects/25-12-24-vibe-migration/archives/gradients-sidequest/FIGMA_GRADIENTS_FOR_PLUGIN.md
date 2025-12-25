# CSS Gradients for Figma Plugin

This document contains all CSS gradients from the codebase, formatted for use with the **CSS Gradient to Figma** plugin (https://github.com/yagudaev/css-gradient-to-figma).

## How to Use

1. Install the plugin: https://www.figma.com/community/plugin/1157089605295322526/CSS-Gradient-to-Figma
2. Select a frame/rectangle in Figma
3. Run the plugin
4. Paste the gradient CSS from the sections below
5. The plugin will convert it to a Figma gradient fill

## Frame vs Rectangle: Which Should You Use?

### Use **Frame** (Recommended for Design System)
✅ **Use Frames when:**
- Creating gradient swatches in your design system
- You want to add labels, annotations, or metadata
- You need to organize gradients in a grid/auto-layout
- You want to group related gradients together
- You might need to export or reference these later

**Benefits:**
- Can contain text labels (gradient name, page, etc.)
- Better for auto-layout organization
- Can be nested and organized hierarchically
- More flexible for design system documentation

### Use **Rectangle** (For Simple Backgrounds)
✅ **Use Rectangles when:**
- Creating a simple background reference
- You don't need labels or organization
- You're applying gradients directly to components
- You want a minimal, lightweight approach

**Benefits:**
- Simpler, lighter weight
- Faster to create
- Good for one-off backgrounds

### Recommendation
**Use Frames** for your design system gradients. They're more flexible and allow you to:
- Add labels like "Landing - Base Layer" or "Account - Overlay"
- Organize them in auto-layout grids
- Group related gradients (base + overlay + texture)
- Add notes or metadata as text layers

---

## Recommended Dimensions

### Option 1: Standard Viewport Sizes (Recommended)
Match the actual viewport sizes your app uses:

**Desktop:**
- **1440×1024** (standard desktop)
- **1920×1080** (full HD)

**Tablet:**
- **768×1024** (iPad portrait)
- **1024×768** (iPad landscape)

**Mobile:**
- **375×812** (iPhone 13/14)
- **390×844** (iPhone 14 Pro)

**Recommendation:** Use **1440×1024** for desktop gradients and **375×812** for mobile gradients.

### Option 2: Consistent Swatch Size (For Design System)
Use a consistent size for all gradient swatches to make comparison easier:

- **600×400** (good for side-by-side comparison)
- **800×600** (more detail visible)
- **400×300** (compact, good for grids)

**Recommendation:** Use **600×400** for design system swatches. It's large enough to see the gradient detail but compact enough to organize in grids.

### Option 3: Match Gradient Size
Some gradients reference specific sizes (e.g., `1100px 760px`). However, these are the **gradient ellipse sizes**, not container sizes. The actual containers are full viewport.

**Not recommended** - The gradient sizes are relative to the container, not absolute dimensions.

---

## Best Practices

### For Design System Organization

1. **Create a Frame** (e.g., 600×400)
2. **Name it clearly**: `Gradient - Landing - Base` or `Landing / Base Layer`
3. **Apply the gradient** using the plugin
4. **Add a text label** inside the frame (optional but helpful):
   - Gradient name
   - Page/component it belongs to
   - Layer type (Base, Overlay, Texture)
5. **Organize in auto-layout grids** by page:
   ```
   ┌─────────────────────────────────┐
   │ Landing Page Gradients          │
   ├──────────┬──────────┬──────────┤
   │ Base     │ Overlay  │ Texture  │
   │ 600×400  │ 600×400  │ 600×400 │
   └──────────┴──────────┴──────────┘
   ```

### For Multi-Layer Gradients

Since many backgrounds use multiple layers:

1. **Create a parent Frame** (e.g., 1440×1024) for the full background
2. **Create child Frames** for each layer:
   - Base layer (with base color fill)
   - Overlay layer (with gradient + blend mode)
   - Texture layer (with gradient + blend mode)
3. **Stack them** in order (base → overlay → texture)
4. **Apply blend modes** manually:
   - Overlay layer: `Screen` blend mode, opacity 0.9
   - Texture layer: `Overlay` blend mode, opacity 0.18

### Example Structure

```
Frame: "Landing Page Background" (1440×1024)
├── Frame: "Base Layer" (1440×1024)
│   ├── Rectangle: Base color (#03050a)
│   └── Rectangle: Gradient (from plugin)
├── Frame: "Overlay Layer" (1440×1024)
│   └── Rectangle: Gradient (Screen blend, 90% opacity)
└── Frame: "Texture Layer" (1440×1024)
    └── Rectangle: Gradient (Overlay blend, 18% opacity)
```

---

## Quick Reference: Recommended Setup

### For Design System Swatches
- **Type:** Frame
- **Size:** 600×400
- **Organization:** Auto-layout grid, grouped by page
- **Labels:** Text layer inside each frame

### For Full-Page Backgrounds
- **Type:** Frame
- **Size:** 1440×1024 (desktop) or 375×812 (mobile)
- **Layers:** Separate frames for base/overlay/texture
- **Blend modes:** Applied manually in Figma

## Important: Gradients Are NOT Responsive

**Key Finding**: The codebase uses the **same gradient definitions** across all breakpoints (mobile, tablet, desktop). There are NO media queries that change gradients.

**What this means for Figma:**
- ✅ Create **ONE gradient per page** (not separate mobile/tablet/desktop versions)
- ✅ Create at **desktop size** (1440×1024) - it will scale proportionally
- ✅ Use the **same gradient** in mobile/tablet wireframes (just resize the frame)
- ✅ Gradients use percentage-based positioning (`at 18% 18%`), so they scale automatically

**See `GRADIENT_RESPONSIVE_MAPPING.md` for detailed explanation.**

## Important Notes

- **Multi-layer gradients**: Some backgrounds use multiple gradients layered together. The plugin may only support single gradients. For complex multi-layer backgrounds, you may need to:
  - Create separate layers in Figma
  - Use blend modes (Screen, Overlay, etc.)
  - Apply opacity settings manually
- **Base colors**: Many gradients end with a base color (e.g., `#03050a`). You may need to set this as a separate fill layer.
- **Conic gradients**: The plugin may not support `conic-gradient`. You may need to recreate these manually or use radial gradients as approximations.

---

## 1. Landing Page (Home) Background

### Base Layer (Main Background)
```css
radial-gradient(1100px 760px at 18% 18%, rgba(110, 170, 255, 0.10), rgba(0, 0, 0, 0) 58%),
radial-gradient(980px 680px at 84% 26%, rgba(185, 130, 255, 0.08), rgba(0, 0, 0, 0) 62%),
radial-gradient(860px 640px at 62% 88%, rgba(80, 240, 215, 0.06), rgba(0, 0, 0, 0) 60%),
radial-gradient(720px 520px at 42% 58%, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0) 62%),
#03050a
```

**Note**: Base color `#03050a` should be set as a separate fill layer.

### Overlay Layer (::before - Screen blend mode, opacity 0.9)
```css
linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00)),
radial-gradient(880px 520px at 18% 14%, rgba(150, 205, 255, 0.07), rgba(0, 0, 0, 0) 64%),
radial-gradient(820px 520px at 86% 34%, rgba(205, 165, 255, 0.06), rgba(0, 0, 0, 0) 62%)
```

### Texture Layer (::after - Overlay blend mode, opacity 0.18)
```css
radial-gradient(1px 1px at 22% 18%, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 84% 62%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 34% 72%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 60%)
```

---

## 2. Account Page Background

### Base Layer (Main Background)
```css
radial-gradient(980px 720px at 18% 18%, rgba(140, 90, 255, 0.09), rgba(0, 0, 0, 0) 62%),
radial-gradient(920px 680px at 86% 24%, rgba(70, 190, 255, 0.08), rgba(0, 0, 0, 0) 64%),
radial-gradient(860px 620px at 72% 88%, rgba(80, 255, 200, 0.05), rgba(0, 0, 0, 0) 62%),
radial-gradient(760px 560px at 30% 86%, rgba(255, 120, 210, 0.045), rgba(0, 0, 0, 0) 66%),
radial-gradient(720px 520px at 50% 52%, rgba(255, 255, 255, 0.016), rgba(0, 0, 0, 0) 62%),
#01020a
```

**Note**: Base color `#01020a` should be set as a separate fill layer.

### Overlay Layer (::before - Screen blend mode, opacity 0.95)
```css
linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00)),
radial-gradient(900px 540px at 16% 16%, rgba(185, 140, 255, 0.06), rgba(0, 0, 0, 0) 66%),
radial-gradient(860px 540px at 86% 22%, rgba(120, 215, 255, 0.05), rgba(0, 0, 0, 0) 64%)
```

### Texture Layer (::after - Overlay blend mode, opacity 0.10)
```css
radial-gradient(1px 1px at 18% 22%, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 62% 18%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 84% 58%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 28% 74%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 60%)
```

---

## 3. Build Page Background

### Base Layer (Main Background)
```css
radial-gradient(1100px 780px at 14% 18%, rgba(90, 140, 255, 0.13), rgba(0, 0, 0, 0) 62%),
radial-gradient(980px 720px at 86% 20%, rgba(255, 90, 210, 0.10), rgba(0, 0, 0, 0) 64%),
radial-gradient(920px 700px at 72% 88%, rgba(80, 255, 220, 0.07), rgba(0, 0, 0, 0) 62%),
radial-gradient(860px 660px at 26% 86%, rgba(255, 190, 90, 0.06), rgba(0, 0, 0, 0) 66%),
radial-gradient(760px 520px at 50% 54%, rgba(255, 255, 255, 0.016), rgba(0, 0, 0, 0) 62%),
#01020a
```

**Note**: Base color `#01020a` should be set as a separate fill layer.

### Overlay Layer (::before - Screen blend mode, opacity 0.50, blur 22px)
```css
conic-gradient(from 210deg at 50% 42%, rgba(90, 160, 255, 0.10), rgba(255, 110, 220, 0.08), rgba(120, 255, 220, 0.06), rgba(255, 200, 110, 0.06), rgba(90, 160, 255, 0.10)),
linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 84%, rgba(255, 255, 255, 0.00))
```

**Note**: `conic-gradient` may not be supported by the plugin. You may need to recreate this manually in Figma or use a radial gradient approximation.

### Texture Layer (::after - Overlay blend mode, opacity 0.12)
```css
radial-gradient(260px 260px at 18% 26%, rgba(255, 255, 255, 0.035), rgba(0, 0, 0, 0) 72%),
radial-gradient(280px 280px at 82% 22%, rgba(255, 255, 255, 0.028), rgba(0, 0, 0, 0) 74%),
radial-gradient(260px 260px at 76% 80%, rgba(255, 255, 255, 0.024), rgba(0, 0, 0, 0) 76%),
radial-gradient(280px 280px at 26% 84%, rgba(255, 255, 255, 0.020), rgba(0, 0, 0, 0) 78%),
radial-gradient(1px 1px at 22% 18%, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 84% 62%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 34% 72%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 60%)
```

---

## 4. Share Page Background

### Base Layer (Main Background)
```css
radial-gradient(1100px 760px at 14% 18%, rgba(40, 210, 255, 0.12), rgba(0, 0, 0, 0) 62%),
radial-gradient(980px 720px at 86% 22%, rgba(255, 120, 80, 0.08), rgba(0, 0, 0, 0) 64%),
radial-gradient(920px 700px at 72% 86%, rgba(255, 80, 210, 0.09), rgba(0, 0, 0, 0) 62%),
radial-gradient(860px 660px at 28% 88%, rgba(120, 255, 160, 0.06), rgba(0, 0, 0, 0) 64%),
radial-gradient(760px 520px at 52% 52%, rgba(255, 255, 255, 0.018), rgba(0, 0, 0, 0) 60%),
#01030a
```

**Note**: Base color `#01030a` should be set as a separate fill layer.

### Overlay Layer (::before - Screen blend mode, opacity 0.55, blur 22px)
```css
conic-gradient(from 220deg at 50% 40%, rgba(80, 230, 255, 0.09), rgba(255, 120, 90, 0.06), rgba(255, 90, 220, 0.08), rgba(120, 255, 170, 0.05), rgba(80, 230, 255, 0.09)),
linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.00) 44%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00))
```

**Note**: `conic-gradient` may not be supported by the plugin.

### Texture Layer (::after - Overlay blend mode, opacity 0.14)
```css
radial-gradient(220px 220px at 18% 26%, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0) 70%),
radial-gradient(260px 260px at 82% 22%, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0) 72%),
radial-gradient(240px 240px at 76% 78%, rgba(255, 255, 255, 0.028), rgba(0, 0, 0, 0) 72%),
radial-gradient(260px 260px at 26% 84%, rgba(255, 255, 255, 0.022), rgba(0, 0, 0, 0) 74%),
radial-gradient(1px 1px at 22% 18%, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 68% 28%, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 84% 62%, rgba(255, 255, 255, 0.07), rgba(0, 0, 0, 0) 60%),
radial-gradient(1px 1px at 34% 72%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 60%)
```

### Orb Scene Background (::before - Screen blend mode, opacity 0.75)
```css
radial-gradient(2px 2px at 18% 26%, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 72% 18%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 84% 56%, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 34% 72%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.00) 60%)
```

### Orb Background
```css
radial-gradient(140px 140px at 32% 24%, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.00) 60%), rgba(18, 18, 18, 0.40)
```

**Note**: Base color `rgba(18, 18, 18, 0.40)` should be set as a separate fill layer.

### Family Tree Background
```css
radial-gradient(900px 420px at 50% 10%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(700px 360px at 15% 40%, rgba(180, 210, 255, 0.06), rgba(0, 0, 0, 0.00) 60%),
radial-gradient(700px 360px at 85% 45%, rgba(255, 210, 180, 0.05), rgba(0, 0, 0, 0.00) 62%),
rgba(10, 10, 10, 0.35)
```

**Note**: Base color `rgba(10, 10, 10, 0.35)` should be set as a separate fill layer.

### Family Tree Texture (::before - Screen blend mode, opacity 0.7)
```css
radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 70% 20%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 85% 60%, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.00) 60%),
radial-gradient(2px 2px at 35% 70%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.00) 60%)
```

### Tree Node Background
```css
radial-gradient(280px 120px at 30% 20%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.00) 70%),
rgba(18, 18, 18, 0.34)
```

**Note**: Base color `rgba(18, 18, 18, 0.34)` should be set as a separate fill layer.

### Tree Node Empty Background
```css
radial-gradient(240px 120px at 30% 20%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.00) 70%),
rgba(18, 18, 18, 0.22)
```

**Note**: Base color `rgba(18, 18, 18, 0.22)` should be set as a separate fill layer.

### Tree Connector Gradients
```css
linear-gradient(to bottom, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.00))
```

```css
linear-gradient(to top, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.00))
```

---

## 5. People Page Background

### Base Layer (::before - Fixed, opacity 0.72, blur 22px, saturate 1.15, contrast 1.08)
```css
conic-gradient(from 210deg at 48% 42%, rgba(0, 255, 220, 0.10), rgba(255, 90, 220, 0.09), rgba(180, 255, 90, 0.08), rgba(255, 220, 160, 0.07), rgba(90, 140, 255, 0.10), rgba(0, 255, 220, 0.10)),
radial-gradient(820px 620px at 22% 18%, rgba(255, 255, 255, 0.035), rgba(0,0,0,0) 62%),
radial-gradient(820px 620px at 78% 22%, rgba(255, 255, 255, 0.028), rgba(0,0,0,0) 64%),
radial-gradient(860px 680px at 70% 86%, rgba(255, 255, 255, 0.022), rgba(0,0,0,0) 66%),
#07070b
```

**Note**: Base color `#07070b` should be set as a separate fill layer. `conic-gradient` may not be supported.

### Overlay Layer (::after - Overlay blend mode, opacity 0.22)
```css
radial-gradient(500px 420px at 18% 32%, rgba(255, 255, 255, 0.05), rgba(0,0,0,0) 70%),
radial-gradient(560px 460px at 82% 68%, rgba(255, 255, 255, 0.04), rgba(0,0,0,0) 72%),
repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)
```

**Note**: `repeating-linear-gradient` may not be supported by the plugin.

### Person Tile Background (Hover State)
```css
radial-gradient(700px 520px at 18% 18%, rgba(90, 140, 255, 0.14), rgba(0,0,0,0) 62%),
radial-gradient(620px 460px at 86% 24%, rgba(255, 90, 210, 0.10), rgba(0,0,0,0) 64%),
radial-gradient(680px 520px at 72% 84%, rgba(80, 255, 220, 0.08), rgba(0,0,0,0) 62%)
```

### Person Detail Background
```css
radial-gradient(860px 640px at 18% 18%, rgba(90, 140, 255, 0.14), rgba(0,0,0,0) 62%),
radial-gradient(820px 620px at 86% 26%, rgba(255, 90, 210, 0.10), rgba(0,0,0,0) 64%),
radial-gradient(820px 620px at 72% 84%, rgba(80, 255, 220, 0.08), rgba(0,0,0,0) 62%)
```

### Person Snippets Background
```css
radial-gradient(780px 560px at 16% 16%, rgba(255, 255, 255, 0.08), rgba(0,0,0,0) 62%),
radial-gradient(720px 520px at 86% 76%, rgba(255, 255, 255, 0.05), rgba(0,0,0,0) 64%)
```

### People Search Tape Background (::before)
```css
linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))
```

---

## 6. Feed Page Background

### Base Layer (Collage Background)
```css
radial-gradient(1000px 760px at 16% 18%, hsl(190deg 92% 66% / 0.16), rgba(0,0,0,0) 62%),
radial-gradient(900px 700px at 82% 24%, hsl(320deg 92% 66% / 0.12), rgba(0,0,0,0) 64%),
radial-gradient(980px 760px at 72% 84%, hsl(96deg 92% 66% / 0.10), rgba(0,0,0,0) 62%),
radial-gradient(820px 640px at 26% 86%, rgba(255, 255, 255, 0.018), rgba(0,0,0,0) 66%),
#06060a
```

**Note**: Base color `#06060a` should be set as a separate fill layer. HSL colors may need conversion to RGB.

### Overlay Layer (::before - Screen blend mode, opacity 0.55)
```css
linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 84%, rgba(255, 255, 255, 0.00)),
radial-gradient(520px 420px at 62% 48%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0) 68%),
radial-gradient(320px 260px at 18% 76%, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0) 72%)
```

### Texture Layer (::after - Soft Light blend mode, opacity 0.10)
```css
repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)
```

**Note**: `repeating-linear-gradient` may not be supported by the plugin.

---

## 7. Talk Page Gradients

### Ember Orb Ring (Speak State)
```css
radial-gradient(circle, rgba(140, 200, 255, 0.06) 0%, rgba(140, 200, 255, 0.03) 35%, rgba(100, 180, 255, 0.00) 70%)
```

**Note**: Uses CSS variables `--color-primary` and `--color-secondary`. Default values shown.

### Ember Orb Circle (Base)
```css
radial-gradient(circle at 35% 35%, rgba(140, 200, 255, 0.9) 0%, rgba(140, 200, 255, 0.8) 40%, rgba(100, 180, 255, 0.7) 100%)
```

**Note**: Uses CSS variables. Default values shown.

---

## 8. Build Page Component Gradients

### Timeline Card Background (Active State)
```css
radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 34%, rgba(0, 0, 0, 0.20) 100%)
```

### Player Background Gradient
```css
linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0.06), rgba(0,0,0,0.00))
```

### Orb Gradients (Various States)
```css
radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(0, 0, 0, 0.00) 100%)
```

```css
radial-gradient(circle at 45% 55%, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(0, 0, 0, 0.00) 100%)
```

```css
radial-gradient(circle at 55% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0.00) 100%)
```

---

## Simplified Single-Layer Versions (For Plugin Compatibility)

If the plugin doesn't support multi-layer gradients, here are simplified single-layer versions that approximate the effect:

### Landing Page (Simplified)
```css
radial-gradient(1100px 760px at 18% 18%, rgba(110, 170, 255, 0.10), rgba(0, 0, 0, 0) 58%),
radial-gradient(980px 680px at 84% 26%, rgba(185, 130, 255, 0.08), rgba(0, 0, 0, 0) 62%),
radial-gradient(860px 640px at 62% 88%, rgba(80, 240, 215, 0.06), rgba(0, 0, 0, 0) 60%),
#03050a
```

### Account Page (Simplified)
```css
radial-gradient(980px 720px at 18% 18%, rgba(140, 90, 255, 0.09), rgba(0, 0, 0, 0) 62%),
radial-gradient(920px 680px at 86% 24%, rgba(70, 190, 255, 0.08), rgba(0, 0, 0, 0) 64%),
radial-gradient(860px 620px at 72% 88%, rgba(80, 255, 200, 0.05), rgba(0, 0, 0, 0) 62%),
#01020a
```

### Build Page (Simplified)
```css
radial-gradient(1100px 780px at 14% 18%, rgba(90, 140, 255, 0.13), rgba(0, 0, 0, 0) 62%),
radial-gradient(980px 720px at 86% 20%, rgba(255, 90, 210, 0.10), rgba(0, 0, 0, 0) 64%),
radial-gradient(920px 700px at 72% 88%, rgba(80, 255, 220, 0.07), rgba(0, 0, 0, 0) 62%),
#01020a
```

### Share Page (Simplified)
```css
radial-gradient(1100px 760px at 14% 18%, rgba(40, 210, 255, 0.12), rgba(0, 0, 0, 0) 62%),
radial-gradient(980px 720px at 86% 22%, rgba(255, 120, 80, 0.08), rgba(0, 0, 0, 0) 64%),
radial-gradient(920px 700px at 72% 86%, rgba(255, 80, 210, 0.09), rgba(0, 0, 0, 0) 62%),
#01030a
```

### People Page (Simplified)
```css
radial-gradient(820px 620px at 22% 18%, rgba(255, 255, 255, 0.035), rgba(0,0,0,0) 62%),
radial-gradient(820px 620px at 78% 22%, rgba(255, 255, 255, 0.028), rgba(0,0,0,0) 64%),
radial-gradient(860px 680px at 70% 86%, rgba(255, 255, 255, 0.022), rgba(0,0,0,0) 66%),
#07070b
```

### Feed Page (Simplified)
```css
radial-gradient(1000px 760px at 16% 18%, rgba(100, 200, 255, 0.16), rgba(0,0,0,0) 62%),
radial-gradient(900px 700px at 82% 24%, rgba(255, 100, 200, 0.12), rgba(0,0,0,0) 64%),
radial-gradient(980px 760px at 72% 84%, rgba(100, 255, 150, 0.10), rgba(0,0,0,0) 62%),
#06060a
```

**Note**: HSL colors converted to approximate RGB values.

---

## Tips for Using the Plugin

1. **Start with simplified versions**: Test with the simplified single-layer gradients first
2. **Layer manually**: For complex multi-layer effects, create separate layers in Figma and apply blend modes
3. **Base colors**: Always set base colors (`#03050a`, `#01020a`, etc.) as a separate fill layer
4. **Opacity and blend modes**: Apply these manually in Figma after the gradient is created
5. **Conic gradients**: If the plugin doesn't support `conic-gradient`, recreate manually using radial gradients or use Figma's native gradient tools
6. **Repeating gradients**: For `repeating-linear-gradient`, you may need to create a pattern manually or use a different approach

---

## File References

- Landing: `src/styles.css` (lines 345-404)
- Account: `src/pages/Account.css` (lines 1-490)
- Build: `src/pages/Build.css` (lines 1-1400+)
- Share: `src/pages/Share.css` (lines 1-1493)
- People: `src/people/people.css` (lines 1-647)
- Feed: `src/pages/feed/feed.css` (lines 1-972)
- Talk: `src/pages/Talk.css` (lines 1-473)

