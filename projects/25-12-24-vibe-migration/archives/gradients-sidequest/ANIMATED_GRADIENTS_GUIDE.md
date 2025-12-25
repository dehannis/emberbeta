# Animated Gradients: Hard-Coded vs Videos

## Your Codebase Already Has Animated Gradients!

The codebase uses **CSS animations** to move gradients, not videos:

### Example 1: People Page (CSS Animation)
```css
.peopleStage::before {
  animation: peopleLiquidDrift 14s ease-in-out infinite alternate;
}

@keyframes peopleLiquidDrift {
  0% { transform: translate3d(-10px, -6px, 0) rotate(-0.6deg) scale(1.02); }
  100% { transform: translate3d(12px, 8px, 0) rotate(0.7deg) scale(1.04); }
}
```

### Example 2: Feed Page (JavaScript-Driven Transform)
```css
.feed-collage {
  transform: translateZ(0) 
            translate(var(--bg-drift-x, 0px), var(--bg-drift-y, 0px)) 
            rotate(var(--bg-rot, 0deg));
}
```

**Key insight**: Gradients are animated using **CSS transforms** (translate, rotate, scale), not by changing gradient colors or positions.

---

## Recommendation: Use Hard-Coded Gradients + Animation Documentation

### Why Hard-Coded is Better for Animated Gradients

1. **Matches Your Codebase**
   - Your code uses CSS animations, not videos
   - Hard-coded gradients can be exported to CSS
   - Animation parameters can be documented

2. **Infinite Resolution**
   - Videos are fixed resolution (pixelated when scaled)
   - CSS gradients scale perfectly at any size

3. **Lightweight**
   - Videos: ~2-10MB per gradient (depending on length/quality)
   - Hard-coded: ~few KB (just parameters)

4. **Editable**
   - Can adjust gradient colors/stops
   - Can modify animation timing/easing
   - Videos require re-exporting entire file

5. **Design System Compatible**
   - Can create reusable gradient + animation tokens
   - Videos can't be tokenized

6. **Performance**
   - CSS animations are GPU-accelerated
   - Videos require decoding/playback overhead

---

## Figma Implementation Strategy

### Option 1: Static Representation + Documentation (Recommended)

**For Design System:**
1. Create hard-coded gradient in **resting state** (0% keyframe)
2. Create optional **drifted state** frame (100% keyframe) for reference
3. Document animation in annotations:
   ```
   Animation: peopleLiquidDrift
   Duration: 14s
   Easing: ease-in-out
   Loop: infinite alternate
   Transform: translate3d(-10px, -6px, 0) rotate(-0.6deg) scale(1.02)
            → translate3d(12px, 8px, 0) rotate(0.7deg) scale(1.04)
   ```

**Structure:**
```
Design System / Gradients / People
├── Base Gradient (Resting State)
├── Base Gradient (Drifted State) [optional reference]
└── Annotation: Animation specs
```

**Pros:**
- ✅ Lightweight
- ✅ Editable
- ✅ Shows both states
- ✅ Documents animation parameters

**Cons:**
- ❌ Doesn't show actual motion (static frames)

### Option 2: Video Reference (Supplemental Only)

**Use videos as:**
- **Temporary reference** while building
- **Documentation supplement** (show motion in presentations)
- **Developer handoff** (visual reference for animation feel)

**Structure:**
```
Design System / Gradients / People
├── Base Gradient (Hard-Coded) [primary]
├── Animation Video (Reference) [supplemental]
└── Annotation: CSS animation code
```

**Video Specs:**
- Format: MP4 (H.264)
- Resolution: 1440×1024 (or match your frame size)
- Duration: 1-2 loops (14s × 2 = 28s)
- Frame rate: 30fps (smooth enough, smaller file)
- Quality: Medium (balance between quality and file size)
- File size: ~2-5MB per video

**Pros:**
- ✅ Shows actual motion
- ✅ Good for presentations
- ✅ Visual reference for developers

**Cons:**
- ❌ Large file sizes
- ❌ Not editable
- ❌ Resolution dependent
- ❌ Can't export to code

---

## Hybrid Approach (Best Practice)

### Primary: Hard-Coded Gradients
- Create in Figma using plugin
- Document animation in annotations
- Create both resting and drifted states (optional)

### Supplemental: Video References
- Record 1-2 loops from browser
- Embed as reference only
- Mark as "Reference - See CSS for implementation"

### Structure:
```
Design System / Gradients
├── Landing (Hard-Coded)
├── Account (Hard-Coded)
├── Build (Hard-Coded)
├── Share (Hard-Coded)
├── People (Hard-Coded + Animation Docs)
│   ├── Resting State
│   ├── Drifted State [optional]
│   └── Animation Video [reference only]
└── Feed (Hard-Coded + JS Transform Docs)
```

---

## How to Animate Gradients in Code

### Method 1: CSS Keyframe Animation (People Page)
```css
.gradient-container {
  animation: gradientDrift 14s ease-in-out infinite alternate;
}

@keyframes gradientDrift {
  0% { 
    transform: translate3d(-10px, -6px, 0) 
               rotate(-0.6deg) 
               scale(1.02); 
  }
  100% { 
    transform: translate3d(12px, 8px, 0) 
               rotate(0.7deg) 
               scale(1.04); 
  }
}
```

### Method 2: JavaScript-Driven Transform (Feed Page)
```javascript
// Update CSS variables via JavaScript
element.style.setProperty('--bg-drift-x', `${x}px`);
element.style.setProperty('--bg-drift-y', `${y}px`);
element.style.setProperty('--bg-rot', `${rotation}deg`);
```

```css
.gradient-container {
  transform: translate(
    var(--bg-drift-x, 0px), 
    var(--bg-drift-y, 0px)
  ) rotate(var(--bg-rot, 0deg));
}
```

**Note**: The gradient itself doesn't change - only the **container** is transformed (moved, rotated, scaled).

---

## Figma Limitations & Workarounds

### Figma Doesn't Support:
- ❌ CSS animations (static only)
- ❌ JavaScript-driven transforms
- ❌ Video playback in design files (can embed, but doesn't auto-play)

### Workarounds:

1. **Create Multiple States**
   - Resting state (0%)
   - Mid-point state (50%)
   - Drifted state (100%)
   - Shows animation range

2. **Use Prototyping**
   - Create prototype with state transitions
   - Shows animation flow (but not continuous loop)

3. **Document in Annotations**
   - CSS animation code
   - Timing/easing specs
   - Transform values

4. **Video Reference**
   - Embed video as reference
   - Mark clearly as "Reference Only"

---

## File Size Comparison

### Hard-Coded Gradient
- **Figma file**: ~5-10KB (gradient parameters)
- **CSS export**: ~200 bytes (animation code)
- **Total**: ~10KB

### Video Reference
- **MP4 (30s, 1440×1024, 30fps, medium quality)**: ~3-5MB
- **MP4 (30s, 1440×1024, 60fps, high quality)**: ~8-12MB
- **Multiple breakpoints**: 3-6 videos = 9-72MB

**Impact:**
- Hard-coded: Negligible file size impact
- Videos: Can bloat Figma files significantly (especially with multiple gradients/breakpoints)

---

## Recommended Workflow

### Step 1: Create Hard-Coded Gradient
1. Use CSS Gradient plugin
2. Create gradient in resting state
3. Apply to frame

### Step 2: Document Animation
1. Add annotation with CSS animation code
2. Specify timing, easing, loop behavior
3. List transform values (start → end)

### Step 3: Create Reference States (Optional)
1. Duplicate gradient frame
2. Apply transform manually (translate, rotate, scale)
3. Label as "Drifted State"
4. Shows animation range

### Step 4: Add Video Reference (Optional)
1. Record from browser (1-2 loops)
2. Export as MP4
3. Embed in Figma as reference
4. Mark clearly: "Reference - See CSS for implementation"

### Step 5: Export to Code
1. Gradient parameters → CSS
2. Animation specs → CSS keyframes
3. Developer implements from specs

---

## Specific Recommendation for Your Project

### Use Hard-Coded Gradients Because:

1. **Matches Your Codebase**
   - Your code uses CSS animations, not videos
   - Hard-coded enables code export

2. **Design System**
   - Reusable gradient + animation tokens
   - Maintainable and scalable

3. **File Size**
   - Videos would bloat your Figma files
   - Hard-coded stays lightweight

4. **Maintainability**
   - Update animation timing without re-recording
   - Adjust gradient colors independently

### Add Videos Only If:

- You need to show motion in presentations
- Developers need visual reference for animation feel
- As temporary reference while building

**But always maintain hard-coded version as primary source of truth.**

---

## Example: People Page Implementation

### In Figma:

```
Design System / Gradients / People
├── Frame: "People - Base (Resting)"
│   ├── Gradient (hard-coded)
│   └── Annotation: "Resting state (0% keyframe)"
│
├── Frame: "People - Base (Drifted)" [optional]
│   ├── Same gradient
│   ├── Transform: translate(12px, 8px) rotate(0.7deg) scale(1.04)
│   └── Annotation: "Drifted state (100% keyframe)"
│
└── Annotation: 
    Animation: peopleLiquidDrift
    Duration: 14s
    Easing: ease-in-out
    Loop: infinite alternate
    CSS:
    @keyframes peopleLiquidDrift {
      0% { transform: translate3d(-10px, -6px, 0) 
                 rotate(-0.6deg) scale(1.02); }
      100% { transform: translate3d(12px, 8px, 0) 
                   rotate(0.7deg) scale(1.04); }
    }
```

### Optional Video Reference:
- Embed MP4 showing 2-3 loops
- Mark as "Reference - See CSS for implementation"
- File size: ~3-5MB

---

## Summary

| Aspect | Hard-Coded + Docs | Videos |
|--------|------------------|--------|
| **File Size** | ✅ ~10KB | ❌ ~3-5MB each |
| **Editable** | ✅ Yes | ❌ No |
| **Resolution** | ✅ Infinite | ❌ Fixed |
| **Code Export** | ✅ Yes | ❌ No |
| **Shows Motion** | ❌ Static | ✅ Yes |
| **Design System** | ✅ Perfect | ❌ Poor |
| **Maintenance** | ✅ Easy | ❌ Hard |

**Verdict**: Use **hard-coded gradients + animation documentation** as primary. Use videos only as **supplemental reference** if needed for presentations or developer handoff.

**Your codebase already uses CSS animations** - hard-coded gradients match this approach perfectly.

