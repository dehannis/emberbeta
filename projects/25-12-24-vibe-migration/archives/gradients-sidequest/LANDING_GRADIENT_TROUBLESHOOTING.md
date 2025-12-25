# Landing Page Gradient Troubleshooting

## Important: Landing Page Does NOT Have Orbs

The Landing page (home page) does **NOT** have orbs. Orbs appear on:
- **Share page**: 3 orbs (me, mom, dad) in the orb-scene
- **Build page**: Memory orbs along the timeline
- **Talk page**: Single Ember orb

The Landing page only has **gradient backgrounds** - no orbs.

## What the Landing Page Should Have

The Landing page background consists of **3 layers**:

### Layer 1: Base Background
- 4 radial gradients
- Base color: `#03050a`
- Applied directly to `.landing-container`

### Layer 2: Overlay (::before pseudo-element)
- Linear gradient (135deg)
- 2 radial gradients
- **Blend mode: Screen**
- **Opacity: 90%**
- Position: `inset: -18%` (extends beyond container)

### Layer 3: Texture (::after pseudo-element)
- 4 tiny radial gradients (1px × 1px)
- **Blend mode: Overlay**
- **Opacity: 18%**
- Position: `inset: 0` (matches container)

## Common Issues & Solutions

### Issue 1: Missing Overlay Layer
**Symptom**: Gradient looks flat, missing the "glow" effect

**Solution**: 
1. Create a separate frame for the overlay layer
2. Apply the overlay gradient
3. Set blend mode to **Screen**
4. Set opacity to **90%**
5. Position it above the base layer

### Issue 2: Missing Texture Layer
**Symptom**: Gradient looks smooth but missing subtle sparkle/grain

**Solution**:
1. Create a separate frame for the texture layer
2. Apply the 4 tiny radial gradients (may need to combine or approximate)
3. Set blend mode to **Overlay**
4. Set opacity to **18%**
5. Position it above the overlay layer

### Issue 3: Missing Base Color
**Symptom**: Gradient looks too bright or wrong base color

**Solution**:
1. Add a separate fill layer with color `#03050a`
2. Position it as the bottom layer (behind all gradients)

### Issue 4: Wrong Blend Modes
**Symptom**: Colors look wrong or too intense

**Solution**:
- Overlay layer: **Screen** blend mode, **90%** opacity
- Texture layer: **Overlay** blend mode, **18%** opacity
- Base layer: **Normal** blend mode, **100%** opacity

### Issue 5: Overlay Extends Beyond Container
**Symptom**: Missing the extended glow effect

**Solution**:
- The overlay uses `inset: -18%` which extends 18% beyond the container
- In Figma, make the overlay frame **larger** than the base frame
- For 1440×1024 base: overlay should be ~1699×1208 (18% larger)

## Complete Layer Stack (Bottom to Top)

```
1. Base Color Layer
   - Color: #03050a
   - Size: 1440×1024
   - Blend: Normal
   - Opacity: 100%

2. Base Gradient Layer
   - 4 radial gradients (from plugin)
   - Size: 1440×1024
   - Blend: Normal
   - Opacity: 100%

3. Overlay Layer
   - Linear + 2 radial gradients
   - Size: ~1699×1208 (18% larger, centered)
   - Blend: Screen
   - Opacity: 90%

4. Texture Layer
   - 4 tiny radial gradients
   - Size: 1440×1024
   - Blend: Overlay
   - Opacity: 18%

5. Content (Header, Options, Footer)
   - Position: Above all gradient layers
```

## Step-by-Step Fix

1. **Check base color**: Is `#03050a` set as the bottom layer?
2. **Check base gradient**: Are all 4 radial gradients applied?
3. **Check overlay**: Is there a separate overlay layer with Screen blend mode at 90% opacity?
4. **Check overlay size**: Is the overlay 18% larger than the base (extended)?
5. **Check texture**: Is there a texture layer with Overlay blend mode at 18% opacity?
6. **Check layer order**: Base → Overlay → Texture → Content

## Visual Reference

The Landing page should have:
- ✅ Dark base color (#03050a)
- ✅ Subtle blue/purple gradient glows (top-left, top-right, bottom-center)
- ✅ Soft white overlay glow (Screen blend)
- ✅ Subtle sparkle texture (Overlay blend)
- ❌ NO orbs (orbs are on Share/Build/Talk pages)

