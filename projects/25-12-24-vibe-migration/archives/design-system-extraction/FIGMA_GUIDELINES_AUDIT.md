# Figma GUIDELINES Audit - Source of Truth

This document extracts ALL design tokens from Figma GUIDELINES section (node-id: 1:677) as the authoritative source of truth.

## Typography (from Figma FONTS section)

### Headings (Source Serif Pro, Regular/400)
- **Heading 0**: 64px, letter-spacing -1.28px, line-height 36px, color #f5f5f5
- **Heading 1**: 32px, letter-spacing -0.64px, line-height 36px, color #f5f5f5
- **Heading 2**: 28px, letter-spacing -0.56px, line-height 31px, color #f5f5f5
- **Heading 3**: 24px, letter-spacing -0.48px, line-height 31px, color #f5f5f5
- **Heading 4**: 20px, letter-spacing -0.4px, line-height 31px, color #f5f5f5

### Body Text (Inter Regular/400)
- **Body Large**: 16px, letter-spacing 0.16px, line-height 21px, color #4d4d4d (text-ghost)
- **Body Regular text-primary**: 13px, letter-spacing 0.13px, line-height 21px, color #f5f5f5
- **Body Regular text-secondary**: 13px, letter-spacing 0.13px, line-height 21px, color #a0a0a0
- **Small / Caption**: 11px, letter-spacing 0.22px, line-height 16.5px, color #a0a0a0

## Colors (from Figma COLORS section)

### Primary Color Palette
- `--black`: #0a0a0a
- `--white`: #f5f5f5
- `--gray-dark`: #1a1a1a
- `--gray-medium`: #666666
- `--gray-light`: #a0a0a0

### Background Colors
- Landing: #03050a
- Account: #01020a
- Build: #01020a
- Share: #01030a
- People: #07070b

### Text Colors (from Typography section)
- `--text-primary`: #f5f5f5 (white - for headings, primary text)
- `--text-secondary`: #a0a0a0 (gray-light - for descriptions, body secondary)
- `--text-ghost`: #4d4d4d (for Body Large placeholder text)
- Footer text: #666666 (gray-medium - from Component - Footer Example)

### Component Colors (from ATOMS/MOLECULES)

#### Button / Text Component
- Default state: background #060606, border #8c8c8c, text #f5f5f5
- Secondary state: background #060606, border #8c8c8c, text #a0a0a0
- Small size: border-radius 9999px (pill shape)

#### Button / Home Component
- Text color: #a0a0a0 (gray-light)
- Font size: 24px
- Line height: 29.045px

#### Form Input Components
- Background: #0d0d0d
- Border: #262626
- Placeholder text: #4d4d4d
- Border radius: 8px (for Phone Number, Text Centered)
- Border radius: 12px (for Select, Select Option, Text Left)

#### Component - Header
- Phone number text: #a0a0a0 (gray-light), 13px, letter-spacing 0.13px, line-height 21px
- Button text (Listen/People Beta): #a0a0a0 (gray-light), 13px, letter-spacing 0.13px, line-height 21px

#### Component - Large Options List
- Option Number: #a0a0a0 (gray-light), 24px (Source Serif Pro), letter-spacing -0.48px, line-height 31px
- Option Title: #f5f5f5 (white), 32px (Source Serif Pro), letter-spacing -0.64px (default) / 0px (hover), line-height 36px
- Option Description: #a0a0a0 (gray-light), 13px (Inter), letter-spacing 0.13px, line-height 21px
- Divider: rgba(140, 140, 140, 0.3) = #8c8c8c at 30% opacity

#### Component - Footer Example
- Copyright text: #666666 (gray-medium), 11px, letter-spacing 0.22px, line-height 16.5px
- Footer links (Terms/Privacy): #666666 (gray-medium), 11px, letter-spacing 0.22px, line-height 16.5px

## Spacing (from Figma MISCELLANEOUS section)
- Small: 0.35rem (5.6px)
- Medium: 0.5rem (8px)
- Default: 0.75rem (12px)
- Large: 1rem (16px)
- Container: 2rem (32px)

## Border Radius (from Figma MISCELLANEOUS section)
- Small: 6px, 8px
- Medium: 10px, 12px, 14px
- Large: 16px, 18px, 22px
- Full: 999px (pill shape)
- Circle: 50%

## Issues Found in styles.css

1. **Typography Issues:**
   - Missing Heading 0 (64px) token
   - Missing Heading 4 (20px) token
   - Letter spacing values are inconsistent (using px instead of em, or wrong values)
   - Line height values missing for headings
   - Missing text-ghost color (#4d4d4d)

2. **Color Issues:**
   - `--text-tertiary` should be verified against actual usage
   - `--text-quaternary` should be verified against actual usage
   - `--text-footer` should be #666666 (gray-medium), not rgba(255, 255, 255, 0.55)
   - Missing component-specific colors (button backgrounds, form inputs, borders)

3. **Spacing Issues:**
   - `--spacing-xs` is 0.5rem (8px) but Figma says Small is 0.35rem (5.6px)
   - Missing 0.35rem spacing token

4. **Border Radius Issues:**
   - `--radius-md` is 13px but should be 12px or 14px per Figma
   - Missing 6px, 10px, 16px, 18px, 22px tokens

