# Gradient Responsive Behavior: Codebase to Figma Mapping

## Key Finding: Gradients Are NOT Responsive

**Critical Insight**: The codebase uses the **same gradient definitions** across all breakpoints (mobile, tablet, desktop). There are **NO media queries** that change gradient definitions.

## How Gradients Scale Across Breakpoints

### 1. Percentage-Based Positioning

Gradients use **percentage-based positioning** (`at 18% 18%`), which means they scale proportionally with the viewport:

```css
/* Landing Page - Same gradient for ALL screen sizes */
.landing-container {
  background:
    radial-gradient(1100px 760px at 18% 18%, ...),
    radial-gradient(980px 680px at 84% 26%, ...),
    /* ... */
}
```

**What this means:**
- The gradient ellipse sizes (`1100px 760px`) are **fixed pixel values**
- But the **positions** (`at 18% 18%`) are **percentages**
- The container fills the **entire viewport** (`100vh/100vw` or `inset: 0`)
- Result: Gradients scale proportionally and look the same at any viewport size

### 2. Full Viewport Coverage

All gradient backgrounds fill the entire viewport:

```css
/* Examples from codebase */
.landing-container {
  position: relative;
  overflow: hidden;
  /* Fills entire viewport */
}

.build-page {
  min-height: 100vh;
  height: 100vh;
  position: fixed;
  inset: 0; /* Fills entire viewport */
}

.peopleStage::before {
  position: fixed;
  inset: -22%; /* Extends beyond viewport for blur effect */
}
```

### 3. No Breakpoint-Specific Gradient Changes

**Search Results**: No media queries modify gradient definitions.

**What IS responsive** (but NOT gradients):
- ✅ Container padding (`2rem` → `1.5rem` → `1rem`)
- ✅ Content layout (grid columns, flex direction)
- ✅ Font sizes (`2rem` → `1.75rem` → `1.5rem`)
- ✅ Spacing and gaps
- ✅ Component positioning (e.g., orb positions in Share page)
- ✅ Max widths (`980px` → `760px` → `600px`)

**What is NOT responsive**:
- ❌ Gradient definitions (same for all breakpoints)
- ❌ Gradient colors
- ❌ Gradient positions (percentages scale automatically)
- ❌ Gradient ellipse sizes (fixed pixels, but scale with viewport)

## Breakpoint Reference

From the codebase:

```css
/* Breakpoints */
Mobile:     max-width: 480px
Tablet:     max-width: 768px
Desktop:    min-width: 769px
Tablet:     769px - 1024px
Touch:      pointer: coarse
```

## Figma Mapping Strategy

### Option 1: Single Gradient Per Page (Recommended)

Since gradients are the same across all breakpoints, create **ONE gradient per page** at a standard desktop size:

**Recommended Approach:**
1. Create gradient at **1440×1024** (standard desktop)
2. The gradient will look proportionally correct at any scale
3. Use the same gradient for mobile/tablet wireframes (just resize the frame)

**Structure:**
```
Design System / Gradients
├── Landing Page Background (1440×1024)
│   ├── Base Layer
│   ├── Overlay Layer
│   └── Texture Layer
├── Account Page Background (1440×1024)
│   ├── Base Layer
│   ├── Overlay Layer
│   └── Texture Layer
└── ... (other pages)
```

### Option 2: Create Variants for Documentation (Optional)

If you want to show how gradients look at different sizes for documentation:

**Structure:**
```
Design System / Gradients
├── Landing Page Background
│   ├── Desktop (1440×1024)
│   ├── Tablet (768×1024)
│   └── Mobile (375×812)
```

**Note**: These are the **same gradient**, just shown at different sizes for reference.

### Option 3: Responsive Wireframe Approach

In your journey wireframes, use the same gradient but resize the container:

**Desktop Wireframe:**
- Frame: 1440×1024
- Apply: Landing Page Background gradient

**Mobile Wireframe:**
- Frame: 375×812
- Apply: **Same** Landing Page Background gradient
- The gradient scales proportionally

## Example: Landing Page Gradient

### Codebase Definition (Same for ALL breakpoints)
```css
.landing-container {
  background:
    radial-gradient(1100px 760px at 18% 18%, rgba(110, 170, 255, 0.10), rgba(0, 0, 0, 0) 58%),
    radial-gradient(980px 680px at 84% 26%, rgba(185, 130, 255, 0.08), rgba(0, 0, 0, 0) 62%),
    radial-gradient(860px 640px at 62% 88%, rgba(80, 240, 215, 0.06), rgba(0, 0, 0, 0) 60%),
    radial-gradient(720px 520px at 42% 58%, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0) 62%),
    #03050a;
}
```

### Figma Implementation

**Design System:**
- Frame: "Landing - Base Gradient" (1440×1024)
- Apply gradient from plugin
- Add base color (#03050a) as separate fill layer

**Wireframes:**
- Desktop frame (1440×1024): Use the gradient
- Mobile frame (375×812): Use the **same** gradient
- The gradient will look proportionally correct at both sizes

## Special Cases

### 1. Feed Page (Dynamic Gradients)

The Feed page uses **CSS variables** for dynamic gradient colors:

```css
.feed-collage {
  background:
    radial-gradient(1000px 760px at 16% 18%, 
      hsl(var(--bg-hue-a, 190deg) 92% 66% / 0.16), 
      rgba(0,0,0,0) 62%),
    /* ... */
}
```

**Figma Mapping:**
- Create the **default** gradient (using `190deg` hue)
- Document that colors are dynamic in code
- Optionally create variants for different accent colors

### 2. People Page (Animated Gradient)

The People page has an **animated** gradient:

```css
.peopleStage::before {
  animation: peopleLiquidDrift 14s ease-in-out infinite alternate;
}
```

**Figma Mapping:**
- Create the gradient in its **default/resting state**
- Document the animation in annotations
- Consider creating a second frame showing the "drifted" state for reference

### 3. Overlay Layers with Blur

Some overlays use `filter: blur(22px)`:

```css
.build-page::before {
  filter: blur(22px);
  mix-blend-mode: screen;
  opacity: 0.50;
}
```

**Figma Mapping:**
- Apply the gradient first
- Then apply blur effect manually in Figma
- Set blend mode to "Screen"
- Set opacity to 50%

## Recommended Workflow

### Step 1: Create Design System Gradients
1. Create Frame: 1440×1024 (or 600×400 for swatches)
2. Name: "Landing - Base Gradient"
3. Apply gradient using plugin
4. Add base color as separate fill layer
5. Document in annotations: "Same gradient used for all breakpoints"

### Step 2: Use in Wireframes
1. Desktop wireframe (1440×1024): Apply gradient
2. Mobile wireframe (375×812): Apply **same** gradient
3. The gradient scales proportionally

### Step 3: Document Special Cases
- Animated gradients: Note animation in annotations
- Dynamic colors: Document CSS variable usage
- Blur effects: Apply manually and document

## Summary

✅ **One gradient per page** - Same definition for all breakpoints  
✅ **Create at desktop size** (1440×1024) - Scales proportionally  
✅ **Use in all wireframes** - Same gradient, different frame sizes  
✅ **Document special cases** - Animations, dynamic colors, blur effects  

❌ **Don't create separate mobile/tablet/desktop gradients** - They're the same  
❌ **Don't modify gradient definitions** - They're not responsive  

The gradients are **viewport-relative** and **scale automatically** because they use percentage-based positioning and fill the entire viewport.

