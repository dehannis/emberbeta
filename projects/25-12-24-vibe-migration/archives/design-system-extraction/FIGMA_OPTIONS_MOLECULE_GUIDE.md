# Creating Options List Molecule Component

## Prerequisites

1. **Convert "Button / Large" Atom to Component:**
   - In ATOMS section, select the "Button / Large" frame
   - Right-click → "Create Component" (or `Option + Command + K`)
   - Name it: **"Option / Card"** or **"Atom / Option"**
   - This makes it reusable as instances

## Step-by-Step: Create Options List Molecule

### 1. Create the Molecule Frame

**Location:** MOLECULES section

1. Create a new Frame
2. Name it: **"Component - Options List"** or **"Molecule / Options List"**
3. Set dimensions:
   - **Width:** 600px (matches `.main-content` max-width)
   - **Height:** Auto (will adjust to content)

### 2. Add Option Instances

1. **Create First Option Instance:**
   - Drag an instance of "Option / Card" component into the frame
   - Position at: **x: 0, y: 0**
   - Update text content:
     - Number: **"01"**
     - Title: **"Talk"**
     - Description: **"Share your thoughts and memories through conversation"**

2. **Create Second Option Instance:**
   - Drag another instance of "Option / Card" component
   - Position at: **x: 0, y: 221** (32px padding × 2 = 64px, plus frame height 189px = 253px, but codebase shows 2rem = 32px padding, so: 189 + 32 = 221px)
   - Update text content:
     - Number: **"02"**
     - Title: **"Build"**
     - Description: **"Create your shared story by preserving what matters"**

3. **Create Third Option Instance:**
   - Drag another instance of "Option / Card" component
   - Position at: **x: 0, y: 442** (221 + 221 = 442px)
   - Update text content:
     - Number: **"03"**
     - Title: **"Share"**
     - Description: **"Connect and exchange memories with others"**

### 3. Set Up Auto-Layout (Optional but Recommended)

1. Select the "Component - Options List" frame
2. Enable **Auto-Layout:**
   - **Direction:** Vertical
   - **Padding:** Top: 0, Right: 0, Bottom: 0, Left: 0
   - **Gap:** 0px (matches codebase `gap: 0`)
   - **Horizontal alignment:** Left
   - **Vertical alignment:** Top

3. **Set Individual Option Padding:**
   - Select each Option instance
   - In the instance properties, you may need to override padding
   - Each option should have: **Top: 32px, Bottom: 32px** (2rem = 32px)
   - Second and third options need extra: **Top: 48px** (3rem = 48px for `.option:nth-child(2)` and `.option:nth-child(3)`)

### 4. Add Border Separators

**From codebase:** `.option { border-bottom: 1px solid rgba(102, 102, 102, 0.3); }`

1. For each Option instance (except the last):
   - Add a Rectangle at the bottom
   - **Width:** 100% (stretch to frame width)
   - **Height:** 1px
   - **Fill:** `rgba(102, 102, 102, 0.3)` or `#666666` at 30% opacity
   - **Position:** Bottom of each option frame

**Alternative:** Use Figma's border-bottom on the frame itself if supported

### 5. Convert to Component

1. Select the "Component - Options List" frame
2. Right-click → "Create Component"
3. Name it: **"Molecule / Options List"** or **"Component - Options"**

## Codebase Reference

**File:** `src/components/Options.tsx` and `src/components/Option.tsx`

```tsx
// Options.tsx - renders list
<div className="options">
  {optionsData.map((option) => (
    <Option key={option.id} option={option} onClick={...} />
  ))}
</div>

// Option.tsx - individual option
<div className="option" onClick={onClick}>
  <div className="option-number">{option.number}</div>
  <h2 className="option-title">{option.title}</h2>
  <p className="option-description">{option.description}</p>
</div>
```

**CSS:** `src/styles.css` (lines 163-234)

```css
.options {
    display: flex;
    flex-direction: column;
    gap: 0;  /* No gap between items */
}

.option {
    padding: 2rem 0;  /* 32px vertical padding */
    border-bottom: 1px solid rgba(102, 102, 102, 0.3);
    cursor: pointer;
}

.option:nth-child(2),
.option:nth-child(3) {
    padding-top: 3rem;  /* 48px top padding for 2nd and 3rd */
}
```

## Final Structure

```
Molecule / Options List (Component)
├── Option / Card (Instance 1)
│   ├── Number: "01"
│   ├── Title: "Talk"
│   └── Description: "Share your thoughts..."
├── Option / Card (Instance 2)
│   ├── Number: "02"
│   ├── Title: "Build"
│   └── Description: "Create your shared story..."
└── Option / Card (Instance 3)
    ├── Number: "03"
    ├── Title: "Share"
    └── Description: "Connect and exchange..."
```

## Benefits

1. **Reusability:** Use the Options List molecule anywhere the landing page list is needed
2. **Consistency:** All instances use the same Option atom component
3. **Maintainability:** Update the Option atom once, all instances update
4. **Atomic Design:** Proper molecule structure using atom instances

