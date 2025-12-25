# Figma Wireframe Audit - Build Hover State (State 1)

## Current Status: ⚠️ **PARTIALLY APPLIED**

### Comparison Analysis

**State 0 Desktop - Build Option:**
- Container position: `x: 1668` (absolute)
- Number + Title frame: `x: 1688` (relative: **20px** from container left)
- Title letter-spacing: `-0.64px` (`-0.02em`)

**State 1 Desktop - Build Option:**
- Container position: `x: 4697` (absolute)
- Number + Title frame: `x: 4737` (relative: **40px** from container left)
- Title letter-spacing: `-0.64px` (`-0.02em`)

**Result:** ⚠️ **Partial application detected**
- ✅ Padding shift applied: **20px** (from 20px to 40px)
- ❌ **Incorrect shift amount:** Should be **16px** (1rem), not 20px
- ❌ **Letter-spacing not updated:** Still `-0.64px`, should be `0px`

---

### Expected Values for State 1 (Build Hover)

**Build Option should have:**
- Number + Title frame: `x: 4733` (relative: **36px** from container left = 20px default + 16px hover shift)
- Title letter-spacing: `0px` (instead of `-0.64px`)

**Current State 1 (Build):**
- Number + Title frame: `x: 4737` (relative: **40px** from container left)
- Title letter-spacing: `-0.64px` ❌

---

## Required Fixes

1. **Adjust padding shift:** Change from **20px** to **16px**
   - Current: `x: 4737` (40px from container)
   - Should be: `x: 4733` (36px from container)

2. **Update letter-spacing:** Change from `-0.64px` to `0px`
   - Select the Build option title text
   - Set letter-spacing to `0` (or `0px`)

---

## Codebase Reference

From `src/styles.css`:

```css
.option:hover {
    padding-left: 1rem; /* 16px, not 20px */
}

.option:hover .option-title {
    letter-spacing: 0; /* From -0.02em */
}
```

**Note:** The hover effect applies to whichever option is hovered. Since you've applied it to Build, that's fine - just need to adjust the values to match the codebase exactly.

---

## Mobile Frame Check

**State 1 Mobile - Build Option:**
- Container position: `x: 5719` (absolute)
- Number + Title frame: `x: 5759` (relative: **40px** from container left)
- Title letter-spacing: `-0.64px` ❌

**Same fixes needed for mobile:**
- Change to `x: 5755` (36px from container = 20px + 16px)
- Change letter-spacing to `0px`

---

## Summary

**What's Working:**
- ✅ Hover state concept applied to Build option
- ✅ Visual shift is visible

**What Needs Fixing:**
- ⚠️ Shift amount: **20px** → should be **16px**
- ⚠️ Letter-spacing: **-0.64px** → should be **0px**
- ⚠️ Apply same fixes to mobile frame

