# Design System Extraction from Codebase

This document contains all design tokens, components, and styles extracted from the emberbeta codebase for syncing to Figma.

## 1. Colors

### CSS Variables (from src/styles.css)
- `--black: #0a0a0a`
- `--white: #f5f5f5`
- `--gray-dark: #1a1a1a`
- `--gray-medium: #666666`
- `--gray-light: #a0a0a0`

### Additional Colors Used
- Background base colors:
  - Landing: `#03050a`
  - Account: `#01020a`
  - Build: `#01020a`
  - Share: `#01030a`
  - People: `#07070b`
  - Talk: `#000`

### RGBA Colors Used
- White variations: `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.95)`
- Border colors: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.28)`
- Background overlays: `rgba(18, 18, 18, 0.55)`, `rgba(0, 0, 0, 0.16)`, etc.

## 2. Typography

### Font Families
- **Headings**: `'Source Serif Pro', serif`
- **Body**: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif`
- **System fallback**: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif`

### Font Sizes (in rem)
- 0.5rem (8px)
- 0.5625rem (9px)
- 0.625rem (10px)
- 0.6875rem (11px)
- 0.75rem (12px)
- 0.8125rem (13px)
- 0.875rem (14px)
- 1rem (16px)
- 1.375rem (22px)
- 2rem (32px)
- 2.75rem (44px) - mobile
- 34px (People title)
- 42px-64px (Person hero name, clamp)

### Font Weights
- 200 (light)
- 300 (regular - primary)
- 350 (medium-light)
- 400 (medium)

### Letter Spacing
- -0.03em (large headings)
- -0.02em (headings)
- -0.01em (body)
- 0.01em (default body)
- 0.02em (small text)
- 0.04em (labels)
- 0.05em (buttons)
- 0.06em (uppercase)
- 0.08em (uppercase)
- 0.1em (uppercase)
- 0.12em (uppercase)
- 0.14em (uppercase)
- 0.18em (uppercase)
- 0.22em (uppercase)

### Line Height
- 1.02 (tight headings)
- 1.12 (headings)
- 1.15 (tight)
- 1.35 (loose)
- 1.4 (body)
- 1.45 (body)
- 1.5 (body)
- 1.55 (body)
- 1.6 (default body)
- 1.8 (loose)

## 3. Gradients

### Landing Page Background
**Base** (src/styles.css lines 349-354):
- `radial-gradient(1100px 760px at 18% 18%, rgba(110, 170, 255, 0.10), rgba(0, 0, 0, 0) 58%)`
- `radial-gradient(980px 680px at 84% 26%, rgba(185, 130, 255, 0.08), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(860px 640px at 62% 88%, rgba(80, 240, 215, 0.06), rgba(0, 0, 0, 0) 60%)`
- `radial-gradient(720px 520px at 42% 58%, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0) 62%)`
- Base color: `#03050a`

**Overlay** (::before, lines 357-368):
- `linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00))`
- `radial-gradient(880px 520px at 18% 14%, rgba(150, 205, 255, 0.07), rgba(0, 0, 0, 0) 64%)`
- `radial-gradient(820px 520px at 86% 34%, rgba(205, 165, 255, 0.06), rgba(0, 0, 0, 0) 62%)`
- Opacity: 0.9, mix-blend-mode: screen

**Texture** (::after, lines 371-384):
- Multiple `radial-gradient(1px 1px...)` patterns
- Opacity: 0.18, mix-blend-mode: overlay

### Account Page Background
**Base** (src/pages/Account.css lines 9-15):
- `radial-gradient(980px 720px at 18% 18%, rgba(140, 90, 255, 0.09), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(920px 680px at 86% 24%, rgba(70, 190, 255, 0.08), rgba(0, 0, 0, 0) 64%)`
- `radial-gradient(860px 620px at 72% 88%, rgba(80, 255, 200, 0.05), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(760px 560px at 30% 86%, rgba(255, 120, 210, 0.045), rgba(0, 0, 0, 0) 66%)`
- `radial-gradient(720px 520px at 50% 52%, rgba(255, 255, 255, 0.016), rgba(0, 0, 0, 0) 62%)`
- Base color: `#01020a`

**Overlay** (::before, lines 18-34):
- `linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00))`
- `radial-gradient(900px 540px at 16% 16%, rgba(185, 140, 255, 0.06), rgba(0, 0, 0, 0) 66%)`
- `radial-gradient(860px 540px at 86% 22%, rgba(120, 215, 255, 0.05), rgba(0, 0, 0, 0) 64%)`
- Opacity: 0.95, mix-blend-mode: screen

### Build Page Background
**Base** (src/pages/Build.css lines 6-12):
- `radial-gradient(1100px 780px at 14% 18%, rgba(90, 140, 255, 0.13), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(980px 720px at 86% 20%, rgba(255, 90, 210, 0.10), rgba(0, 0, 0, 0) 64%)`
- `radial-gradient(920px 700px at 72% 88%, rgba(80, 255, 220, 0.07), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(860px 660px at 26% 86%, rgba(255, 190, 90, 0.06), rgba(0, 0, 0, 0) 66%)`
- `radial-gradient(760px 520px at 50% 54%, rgba(255, 255, 255, 0.016), rgba(0, 0, 0, 0) 62%)`
- Base color: `#01020a`

**Overlay** (::before, lines 27-50):
- `conic-gradient(from 210deg at 50% 42%, rgba(90, 160, 255, 0.10), rgba(255, 110, 220, 0.08), rgba(120, 255, 220, 0.06), rgba(255, 200, 110, 0.06), rgba(90, 160, 255, 0.10))`
- `linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.00) 46%, rgba(255, 255, 255, 0.02) 84%, rgba(255, 255, 255, 0.00))`
- Opacity: 0.50, filter: blur(22px), mix-blend-mode: screen

### People Page Background
**Base** (src/people/people.css lines 17-29):
- `conic-gradient(from 210deg at 48% 42%, rgba(0, 255, 220, 0.10), rgba(255, 90, 220, 0.09), rgba(180, 255, 90, 0.08), rgba(255, 220, 160, 0.07), rgba(90, 140, 255, 0.10), rgba(0, 255, 220, 0.10))`
- `radial-gradient(820px 620px at 22% 18%, rgba(255, 255, 255, 0.035), rgba(0,0,0,0) 62%)`
- `radial-gradient(820px 620px at 78% 22%, rgba(255, 255, 255, 0.028), rgba(0,0,0,0) 64%)`
- `radial-gradient(860px 680px at 70% 86%, rgba(255, 255, 255, 0.022), rgba(0,0,0,0) 66%)`
- Base color: `#07070b`
- Filter: blur(22px) saturate(1.15) contrast(1.08)
- Animation: `peopleLiquidDrift` (14s ease-in-out infinite alternate)

**Overlay** (::after, lines 36-49):
- `radial-gradient(500px 420px at 18% 32%, rgba(255, 255, 255, 0.05), rgba(0,0,0,0) 70%)`
- `radial-gradient(560px 460px at 82% 68%, rgba(255, 255, 255, 0.04), rgba(0,0,0,0) 72%)`
- `repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)`
- Opacity: 0.22, mix-blend-mode: overlay

### Share Page Background
**Base** (src/pages/Share.css lines 9-15):
- `radial-gradient(1100px 760px at 14% 18%, rgba(40, 210, 255, 0.12), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(980px 720px at 86% 22%, rgba(255, 120, 80, 0.08), rgba(0, 0, 0, 0) 64%)`
- `radial-gradient(920px 700px at 72% 86%, rgba(255, 80, 210, 0.09), rgba(0, 0, 0, 0) 62%)`
- `radial-gradient(860px 660px at 28% 88%, rgba(120, 255, 160, 0.06), rgba(0, 0, 0, 0) 64%)`
- `radial-gradient(760px 520px at 52% 52%, rgba(255, 255, 255, 0.018), rgba(0, 0, 0, 0) 60%)`
- Base color: `#01030a`

**Overlay** (::before, lines 18-40):
- `conic-gradient(from 220deg at 50% 40%, rgba(80, 230, 255, 0.09), rgba(255, 120, 90, 0.06), rgba(255, 90, 220, 0.08), rgba(120, 255, 170, 0.05), rgba(80, 230, 255, 0.09))`
- `linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.00) 44%, rgba(255, 255, 255, 0.02) 82%, rgba(255, 255, 255, 0.00))`
- Opacity: 0.55, filter: blur(22px), mix-blend-mode: screen

### Talk Page Color Schemes
From src/pages/Talk.tsx lines 5-14:
1. **Blue** (default): primary `140, 200, 255`, secondary `100, 180, 255`
2. **Orange**: primary `255, 180, 120`, secondary `255, 150, 100`
3. **Green**: primary `150, 220, 150`, secondary `120, 200, 120`
4. **Red**: primary `255, 140, 140`, secondary `255, 120, 120`
5. **Yellow**: primary `255, 220, 140`, secondary `255, 200, 120`
6. **Purple**: primary `220, 180, 255`, secondary `200, 160, 255`
7. **White**: primary `255, 255, 255`, secondary `240, 240, 240`
8. **Klein**: primary `0, 47, 167`, secondary `0, 35, 150`

## 4. Spacing & Layout

### Container Padding
- Desktop: `2rem 2rem 0 2rem` (32px)
- Tablet (≤768px): `1.5rem 0.75rem 0 0.75rem` (24px 12px)
- Mobile (≤480px): `1rem 0.75rem 0 0.75rem` (16px 12px)
- Touch devices: `calc(1.25rem + env(safe-area-inset-left))` per side

### Main Content Padding
- Desktop: `padding-top: 8vh`
- Tablet: `padding-top: 6vh`
- Mobile: `padding-top: 4vh`

### Max Widths
- Mobile: `600px`
- Touch: `760px`
- Tablet (769-1024px): `980px`

### Gaps
- Small: `0.35rem` (5.6px)
- Medium: `0.5rem` (8px)
- Default: `0.75rem` (12px)
- Large: `1rem` (16px)
- XLarge: `1.5rem` (24px)
- XXLarge: `3.5rem` (56px)

### Border Radius
- Small: `6px`, `8px`
- Medium: `10px`, `12px`, `14px`
- Large: `16px`, `18px`, `22px`
- Full: `999px` (pill shape)

## 5. Components

### Header Component
- Home icon: `○` (circle character)
- Font size: `0.6875rem`
- Color: `var(--gray-light)` → `var(--white)` on hover
- Beta buttons: `.feed-beta-btn`
  - Border: `1px solid rgba(255, 255, 255, 0.14)`
  - Background: `rgba(255, 255, 255, 0.04)`
  - Padding: `0.35rem 0.6rem`
  - Border radius: `999px`
  - Font size: `0.6875rem`
  - Letter spacing: `0.02em`

### Footer Component
- Copyright: `0.6875rem`, `var(--gray-medium)`
- Links: `0.6875rem`, gap `1.5rem`
- Margin top: `8rem` (desktop), `6rem` (mobile)

### Option Component (Landing page)
- Padding: `2rem 0` (desktop), `1.5rem 0` (mobile)
- Border bottom: `1px solid rgba(102, 102, 102, 0.3)`
- Hover: `padding-left: 1rem`
- Number label: `0.75rem`, uppercase, `var(--gray-medium)`, letter-spacing `0.1em`
- Title: `2rem` (desktop), `1.75rem` (tablet), `1.5rem` (mobile), Source Serif Pro, `-0.02em` letter-spacing
- Description: `0.8125rem`, `var(--gray-light)`, max-width `400px`

### Buttons

#### Feed Beta Button
- Border: `1px solid rgba(255, 255, 255, 0.14)`
- Background: `rgba(255, 255, 255, 0.04)`
- Padding: `0.35rem 0.6rem`
- Border radius: `999px`
- Font size: `0.6875rem`
- Font weight: `300`
- Letter spacing: `0.02em`
- Hover: border `rgba(255, 255, 255, 0.28)`, background `rgba(255, 255, 255, 0.07)`

#### Auth Button (VideoLanding)
- Background: `transparent`
- Border: `none`
- Padding: `0.5rem 0`
- Font size: `0.8125rem`
- Font weight: `300`
- Letter spacing: `0.1em`
- Text transform: `uppercase`
- Color: `rgba(255, 255, 255, 0.7)`
- Hover: `rgba(255, 255, 255, 0.95)`
- Disabled: `opacity: 0.4`

#### Control Button (Talk)
- Size: `56px × 56px` (desktop), `52px × 52px` (mobile)
- Border radius: `50%`
- Background: `transparent`
- Color: `rgba(255, 255, 255, 0.5)`
- Hover: `rgba(255, 255, 255, 0.9)`
- Active (mute): `rgba(255, 140, 140, 0.9)`

### Form Inputs

#### Auth Input (VideoLanding)
- Padding: `1rem`
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Border radius: `8px`
- Font size: `1rem`
- Font weight: `300`
- Color: `rgba(255, 255, 255, 0.9)`
- Focus: border `rgba(255, 255, 255, 0.3)`, background `rgba(255, 255, 255, 0.08)`

#### Account Form Input
- Background: `rgba(0, 0, 0, 0.16)`
- Border: `1px solid rgba(255, 255, 255, 0.09)`
- Border radius: `12px`
- Padding: `0.56rem 0.75rem`
- Font size: `0.8125rem`
- Focus: border `rgba(255, 255, 255, 0.22)`

### Scrollbar
- Width: `10px`
- Track: `rgba(255, 255, 255, 0.03)`, border-radius `999px`
- Thumb: `rgba(255, 255, 255, 0.14)`, border `3px solid rgba(0, 0, 0, 0)`
- Thumb hover: `rgba(255, 255, 255, 0.22)`

## 6. Animations

### fadeIn
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```
- Duration: `1s`
- Easing: `ease-out`

### fadeInUp
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
- Duration: `1s`
- Easing: `ease-out`
- Delays: `0.2s`, `0.4s`, `0.6s` for staggered items

### peopleLiquidDrift
```css
@keyframes peopleLiquidDrift {
    0% { transform: translate3d(-10px, -6px, 0) rotate(-0.6deg) scale(1.02); }
    100% { transform: translate3d(12px, 8px, 0) rotate(0.7deg) scale(1.04); }
}
```
- Duration: `14s`
- Easing: `ease-in-out`
- Iteration: `infinite alternate`

### emberBreath (Talk)
```css
@keyframes emberBreath {
    0% { transform: scale(0.98); opacity: 0.22; }
    50% { transform: scale(1.03); opacity: 0.40; }
    100% { transform: scale(0.98); opacity: 0.24; }
}
```
- Duration: `1.8s`
- Easing: `ease-in-out`
- Iteration: `infinite`

### emberDot (Talk)
```css
@keyframes emberDot {
    0%, 100% { transform: translateY(0); opacity: 0.18; }
    50% { transform: translateY(-4px); opacity: 0.55; }
}
```
- Duration: `1.05s`
- Easing: `ease-in-out`
- Iteration: `infinite`
- Delays: `120ms`, `240ms` for staggered dots

### emberBar (Talk)
```css
@keyframes emberBar {
    0%, 100% { transform: scaleY(0.55); opacity: 0.20; }
    50% { transform: scaleY(1.25); opacity: 0.55; }
}
```
- Duration: `680ms`
- Easing: `ease-in-out`
- Iteration: `infinite`
- Delays: `80ms`, `160ms`, `240ms`, `320ms` for staggered bars

### overlayFadeIn
```css
@keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```
- Duration: `0.4s` to `0.6s`
- Easing: `ease-out`

### contentSlideUp
```css
@keyframes contentSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
- Duration: `0.6s`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### cursorBlink
```css
@keyframes cursorBlink {
    0%, 100% { opacity: 0; }
    40%, 60% { opacity: 1; }
}
```
- Duration: `0.8s`
- Easing: `ease-in-out`
- Iteration: `infinite`

## 7. Shadows & Effects

### Box Shadows
- Card: `0 14px 44px rgba(0, 0, 0, 0.38)`
- Button hover: `0 14px 38px rgba(0, 0, 0, 0.45)`
- Orb glow: `0 0 60px rgba(var(--color-primary), 0.3), 0 0 120px rgba(var(--color-secondary), 0.15)`

### Backdrop Filters
- Blur: `blur(10px)` to `blur(18px)`
- Used on: cards, modals, overlays, headers

### Text Shadows
- Person tile name: `0 2px 40px rgba(0, 0, 0, 0.55)`
- Person hero name: `0 2px 52px rgba(0, 0, 0, 0.70)`
- Glowing text: `0 0 10px rgba(255, 255, 255, 0.18), 0 0 22px rgba(255, 255, 255, 0.10), 0 0 34px rgba(120, 200, 255, 0.10)`

## 8. Breakpoints

- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`
- Desktop: `min-width: 769px`
- Tablet range: `769px - 1024px`
- Touch devices: `pointer: coarse`

## 9. Z-Index Layers

- Background: `0`
- Content: `1`
- Header: `100`
- Home icon: `101`
- Overlays: `1000`, `1200`
- Modals: `1000+`
- Fixed elements: `500+`

