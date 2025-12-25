# Gradient Best Practices: Hard-Coded vs Image Exports

## Question 1: What's Missing from Your Landing Gradient?

Based on the codebase, the Landing page has **3 layers** that must be stacked:

### Missing Elements (Most Likely)

1. **Overlay Layer** (::before)
   - Linear gradient + 2 radial gradients
   - **Blend mode: Screen** (critical!)
   - **Opacity: 90%**
   - **Size: 18% larger** than base (extends beyond container)

2. **Texture Layer** (::after)
   - 4 tiny radial gradients (1px × 1px)
   - **Blend mode: Overlay** (critical!)
   - **Opacity: 18%**

3. **Base Color Layer**
   - Color: `#03050a`
   - Should be a separate fill layer at the bottom

4. **Blend Modes Not Applied**
   - Overlay layer needs **Screen** blend mode
   - Texture layer needs **Overlay** blend mode

### Quick Fix Checklist

- [ ] Base color `#03050a` as bottom layer
- [ ] Base gradient (4 radial gradients) applied
- [ ] Overlay layer created (18% larger than base)
- [ ] Overlay blend mode set to **Screen**
- [ ] Overlay opacity set to **90%**
- [ ] Texture layer created
- [ ] Texture blend mode set to **Overlay**
- [ ] Texture opacity set to **18%**

**See `LANDING_GRADIENT_TROUBLESHOOTING.md` for detailed step-by-step fix.**

---

## Question 2: Hard-Coded Gradients vs Image Exports

### Hard-Coded Gradients (Figma Native) ✅ Recommended

**What it means:**
- Gradients are created using Figma's native gradient tools
- Stored as vector/parametric data
- Can be edited, adjusted, and reused

**Pros:**
- ✅ **Infinite resolution** - Scales to any size without quality loss
- ✅ **Editable** - Can adjust colors, stops, positions in real-time
- ✅ **Lightweight** - Small file size (just parameters)
- ✅ **Reusable** - Can create gradient styles/variables
- ✅ **Responsive** - Works at any scale
- ✅ **Accessible** - Can be exported to code easily
- ✅ **Version control friendly** - Changes are trackable
- ✅ **Design system compatible** - Can create gradient tokens

**Cons:**
- ❌ **Complex gradients** - Multi-layer gradients require multiple frames
- ❌ **Plugin limitations** - CSS Gradient plugin may not support all CSS features
- ❌ **Time-consuming** - Setting up multi-layer gradients takes time
- ❌ **Blend modes** - Must be applied manually per layer

**Best for:**
- Design system documentation
- Reusable gradient styles
- When gradients need to be editable
- When exporting to code
- Simple to moderately complex gradients

### Image Exports (Rasterized) ⚠️ Use Sparingly

**What it means:**
- Export gradient as PNG/JPG from browser or design tool
- Import as image fill in Figma

**Pros:**
- ✅ **Fast setup** - One image, done
- ✅ **Perfect match** - Exactly matches what you see in browser
- ✅ **Complex gradients** - Captures multi-layer effects automatically
- ✅ **Blend modes included** - All effects baked into image

**Cons:**
- ❌ **Resolution dependent** - Pixelated when scaled up
- ❌ **File size** - Large images (especially at high resolution)
- ❌ **Not editable** - Can't adjust colors/stops without re-exporting
- ❌ **Not reusable** - Each size needs separate export
- ❌ **Version control** - Binary files, harder to track changes
- ❌ **Design system** - Can't create reusable tokens
- ❌ **Export to code** - Can't extract gradient parameters

**Best for:**
- One-off backgrounds
- Very complex gradients that are hard to recreate
- When you need pixel-perfect match immediately
- Temporary references

---

## Industry Best Practices

### Design Systems (Recommended: Hard-Coded)

**Use hard-coded gradients** because:
1. **Scalability**: Design systems need to work at any size
2. **Maintainability**: Colors/stops can be updated globally
3. **Consistency**: Gradient styles ensure uniformity
4. **Code generation**: Can export gradient parameters to CSS/design tokens

**Example approach:**
```
Design System / Gradients
├── Landing - Base (Gradient Style)
├── Landing - Overlay (Gradient Style)
└── Landing - Texture (Gradient Style)
```

### Production Code (Recommended: Hard-Coded CSS)

**Use CSS gradients** (not images) because:
1. **Performance**: No image downloads
2. **Responsive**: Scales automatically
3. **Accessibility**: Can be adjusted for color contrast
4. **Maintainability**: Easy to update

### Figma Wireframes (Hybrid Approach)

**Recommended approach:**
1. **Design System**: Use hard-coded gradients (for documentation)
2. **Wireframes**: Use hard-coded gradients (for consistency)
3. **Complex references**: Use image exports as **temporary references** only

---

## Resolution Considerations

### Hard-Coded Gradients
- ✅ **Infinite resolution** - No quality loss at any scale
- ✅ **Vector-based** - Smooth at any zoom level
- ✅ **Export quality** - Perfect at any export resolution

### Image Exports
- ⚠️ **Resolution dependent** - Must export at target resolution
- ⚠️ **Scaling issues** - Pixelated when scaled up
- ⚠️ **Multiple exports** - Need separate exports for different sizes

**Resolution guidelines for images:**
- Desktop: 1920×1080 or 1440×1024 (2x for retina: 2880×2160)
- Tablet: 1536×2048 (2x for retina: 3072×4096)
- Mobile: 750×1624 (2x for retina: 1500×3248)

**File sizes:**
- PNG (lossless): ~500KB - 2MB per image
- JPG (compressed): ~100KB - 500KB per image
- Multiple breakpoints: 3-6 images per gradient

---

## Recommended Workflow

### For Your Design System

1. **Create hard-coded gradients** in Figma using the plugin
2. **Set up as gradient styles** (if Figma supports it) or components
3. **Document in design system** with CSS code
4. **Use in wireframes** by applying the same gradients

### For Complex Multi-Layer Gradients

1. **Create base layer** (hard-coded)
2. **Create overlay layer** (hard-coded, Screen blend mode)
3. **Create texture layer** (hard-coded, Overlay blend mode)
4. **Stack layers** in correct order
5. **Export as reference** (optional, for comparison only)

### For Temporary References

1. **Screenshot from browser** (Cmd+Shift+4 on Mac)
2. **Import as image** in Figma
3. **Use as reference** while building hard-coded version
4. **Delete image** once hard-coded version is complete

---

## Specific Recommendation for Your Project

### Use Hard-Coded Gradients Because:

1. **Design System**: You're building a design system - gradients should be reusable
2. **Multiple Breakpoints**: Same gradient works at all sizes (no multiple exports needed)
3. **Code Sync**: Gradients in Figma should match codebase (hard-coded enables this)
4. **Maintainability**: When colors change, update once, not multiple image files
5. **File Size**: Design files stay lightweight

### When to Use Images:

- **Temporary reference** while building the hard-coded version
- **Complex effects** that are impossible to recreate (very rare)
- **Final export** for presentations (but still maintain hard-coded version)

### Your Current Issue:

The Landing gradient looks wrong because:
1. **Missing overlay layer** (adds the glow effect)
2. **Missing texture layer** (adds subtle sparkle)
3. **Blend modes not applied** (Screen and Overlay are critical)
4. **Overlay size** (should be 18% larger than base)

**Fix**: Follow the troubleshooting guide to add all 3 layers with correct blend modes.

---

## Summary

| Aspect | Hard-Coded Gradients | Image Exports |
|--------|---------------------|---------------|
| **Resolution** | ✅ Infinite | ❌ Fixed |
| **File Size** | ✅ Small | ❌ Large |
| **Editable** | ✅ Yes | ❌ No |
| **Scalable** | ✅ Yes | ❌ No |
| **Design System** | ✅ Perfect | ❌ Poor |
| **Setup Time** | ⚠️ Longer | ✅ Faster |
| **Maintenance** | ✅ Easy | ❌ Hard |

**Verdict**: Use **hard-coded gradients** for your design system. Use images only as temporary references.

