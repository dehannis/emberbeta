# Setting Up Hover Animation in Figma - State 1

## Overview

State 1 represents the hover state when a user hovers over the first option (Talk). In the codebase, this is achieved through CSS transitions, but in Figma, we need to manually represent this state.

## Hover Effect Specifications

From `src/styles.css`:

**Default State (State 0):**
- Option container: `padding-left: 0`
- Option title: `letter-spacing: -0.02em`

**Hover State (State 1 - Talk option):**
- Option container: `padding-left: 1rem` (16px)
- Option title: `letter-spacing: 0`
- Transition: `0.4s ease`

---

## Method 1: Component Variant (Recommended)

This is the cleanest approach and maintains design system consistency.

### Step 1: Create Hover Variant in Design System

1. Go to **"00. DESIGN SYSTEM"** page
2. Navigate to **ATOMS** → **Button / Large** component
3. Select the component
4. In the right panel, click **"Create Variant"** or use the variant dropdown
5. Create a new variant property called **"state"** with values:
   - `Default` (existing)
   - `Hover` (new)

### Step 2: Configure Hover Variant

1. Select the **"Hover"** variant of `Button / Large`
2. Adjust the container frame:
   - **Padding Left:** `16px` (instead of `0`)
3. Adjust the title text:
   - **Letter Spacing:** `0` (instead of `-0.64px` or `-2%`)

**Note:** The description and number should remain unchanged.

### Step 3: Apply Variant to State 1 Wireframes

1. Go to **"04. HOME PAGE"** → **State 1 Desktop** frame
2. Select the first option instance (`Button / Talk`)
3. In the right panel, find the **"state"** property
4. Change from **"Default"** to **"Hover"**
5. Repeat for **State 1 Mobile** frame

---

## Method 2: Manual Override (Quick Fix)

If you don't want to create variants, you can manually adjust the instances.

### For State 1 Desktop:

1. Select **State 1 Desktop** frame (`1:3682`)
2. Navigate to: `Component - Large Options List` → `Large Options Container` → `Button / Talk`
3. Select the `Button / Talk` instance
4. In the right panel, click **"Detach Instance"** (⚠️ This breaks the component link)
5. Adjust the container:
   - Select the root frame of the detached option
   - Set **Padding Left:** `16px`
6. Adjust the title:
   - Select the `Option - Title` text layer
   - Set **Letter Spacing:** `0`

### For State 1 Mobile:

Repeat the same steps for the mobile frame (`1:3683`).

**⚠️ Warning:** Detaching instances breaks the component link, so future updates to the design system won't propagate. Use Method 1 if possible.

---

## Method 3: Override Properties (Best Practice)

If Figma supports property overrides on component instances:

1. Select the `Button / Talk` instance in State 1
2. In the right panel, look for **"Override"** or **"Instance"** properties
3. Override:
   - Container padding-left: `16px`
   - Title letter-spacing: `0`

**Note:** This method depends on whether the `Button / Large` component has these properties exposed as overridable.

---

## Verification Checklist

After applying the hover state, verify:

**State 1 Desktop:**
- [ ] First option (Talk) is shifted 16px to the right
- [ ] First option title has normal letter-spacing (not tight)
- [ ] Other options (Build, Share) remain in default state
- [ ] Visual matches `localhost:5173/` when hovering over Talk

**State 1 Mobile:**
- [ ] Same checks as desktop
- [ ] Responsive sizing maintained

---

## Animation Documentation

Since Figma doesn't support CSS transitions, document the animation properties:

**Animation Properties:**
- **Property:** `padding-left` and `letter-spacing`
- **Duration:** `0.4s`
- **Easing:** `ease`
- **Trigger:** `:hover` (mouse over)

**Visual Effect:**
- Option smoothly slides 16px to the right
- Title letter-spacing smoothly expands from tight to normal
- Creates a subtle "indentation" effect indicating interactivity

---

## Codebase Reference

**File:** `src/styles.css` (lines 198-228)

```css
.option:hover {
    padding-left: 1rem; /* 16px */
}

.option:hover .option-title {
    letter-spacing: 0; /* From -0.02em */
}
```

**Transition:** `0.4s ease` on both properties

---

## Recommended Approach

**Use Method 1 (Component Variant)** because:
- ✅ Maintains design system consistency
- ✅ Easy to update across all instances
- ✅ Properly represents the hover state as a variant
- ✅ Can be reused for other hover states (Build, Share) if needed

If variants aren't available or you need a quick fix, use **Method 2 (Manual Override)** but be aware it breaks component links.

