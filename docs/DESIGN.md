# Design System - Timer & Stopwatch

## Overview
Modern, minimal productivity tool with dark mode aesthetic inspired by iOS Clock app and Forest app. Built for focused work sessions with clean visual hierarchy and calm color palette.

## Brand Identity
**Name**: FocusFlow
**Icon**: Hourglass (Material Symbols)
**Tagline**: Productivity timer for students, professionals, and freelancers

---

## Color Palette

### Primary Colors
- **Primary (Mint/Cyan)**: `#2bd4c0`
  - Used for: Active states, progress indicators, CTA buttons, accents
  - Shadow: `rgba(43, 212, 192, 0.2)` for glows

- **Background Dark**: `#12201e`
  - Main background color
  - Dark, slightly green-tinted for reduced eye strain

- **Background Light**: `#f6f8f8`
  - Light mode background (optional)

### Neutral Colors
- **White**: `#ffffff`
  - Text, icons, overlays
  - Used with opacity: `white/5`, `white/10`, `white/20`

- **Slate 400**: Text-slate-400
  - Secondary text, labels

- **Slate 900**: Text-slate-900
  - Light mode text

---

## Typography

### Font Families
```css
font-display: 'Inter', sans-serif
font-mono: 'JetBrains Mono', monospace
```

### Usage
- **Display Font (Inter)**: UI text, buttons, labels
  - Weights: 400, 500, 600, 700

- **Monospace (JetBrains Mono)**: Timer/stopwatch digits
  - Weight: 500
  - Size: 7xl (desktop), 8xl (large screens)

### Typography Scale
- **Timer Digits**: `text-7xl md:text-8xl` (96-128px)
- **Focus Session Label**: `text-xs` (12px), `tracking-[0.2em]`, uppercase
- **Tab Labels**: `text-sm` (14px), font-bold
- **Button Text**: `text-lg` (18px), font-black (START button)
- **Alarm Settings**: `text-sm` (14px), `text-[10px]` (labels)

---

## Layout Structure

### Grid System
```
┌─────────────────────────────────────┐
│  Header (TopNavBar)                 │ ← 64px height
├─────────────────────────────────────┤
│                                     │
│         Tab Navigation              │ ← Centered
│                                     │
│    ┌─────────────────────┐         │
│    │  Progress Ring      │         │ ← 320-384px size
│    │    00:25:00         │         │
│    └─────────────────────┘         │
│                                     │
│     [Reset] [START] [Pause]        │ ← Control buttons
│                                     │
│    [5min] [15min] [25min]          │ ← Presets
│                                     │
│  ┌───────────────────────────┐     │
│  │ Alarm Settings Panel      │     │ ← Fixed bottom
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

### Spacing
- Header padding: `px-10 py-6`
- Main content: `flex-1 flex-col items-center justify-center`
- Tab margin: `mb-12`
- Control buttons gap: `gap-6`
- Preset buttons gap: `gap-3`
- Bottom panel: `absolute bottom-10`

---

## Components

### 1. TopNavBar
**Elements**:
- Logo (Hourglass icon + "FocusFlow" text)
- Settings button (right)
- Account button (right)

**Styling**:
```css
bg-background-dark/50
backdrop-blur-md
border-b border-white/5
```

### 2. Tab Navigation
**States**:
- Active: `bg-primary text-background-dark shadow-lg shadow-primary/20`
- Inactive: `text-slate-400 hover:text-white`

**Container**:
```css
bg-white/5
rounded-full
border border-white/10
```

### 3. Circular Progress Ring
**Implementation**: SVG-based
- Outer ring: 45 radius, 2px stroke, `white/5`
- Progress ring: 45 radius, 3px stroke, `text-primary`
- Glow effect: `drop-shadow(0 0 8px rgba(43, 212, 192, 0.4))`
- Progress calculation: `stroke-dasharray="282.7"` (2πr)

### 4. Timer Display
**Format**: `00:25:00`
- Hours/Minutes: `text-white`
- Seconds: `text-primary` (highlighted)
- Colons: `text-white/20`, `-translate-y-1`
- Label: "Focus Session" (uppercase, tracked)

### 5. Control Buttons
**Primary (START)**:
```css
bg-primary
text-background-dark
h-16 px-12
rounded-full
shadow-xl shadow-primary/20
hover:brightness-110
active:scale-95
```

**Secondary (Reset, Pause)**:
```css
size-14
rounded-full
border border-white/10
bg-white/5
hover:bg-white/10
```

### 6. Preset Buttons
**Style**: Pill-shaped with outline
```css
px-6 py-2
rounded-full
border border-primary/30
text-primary
hover:bg-primary/10
```

**Active State**: `bg-primary/5`

### 7. Alarm Settings Panel
**Container**:
```css
bg-white/5
border border-white/10
rounded-2xl
backdrop-blur-sm
p-6
```

**Elements**:
- Toggle switch (Tailwind peer-checked pattern)
- Progress bar (75% filled)
- Labels: "Sound: Digital Beep", "Volume: 80%"

---

## Effects & Animations

### Transitions
```css
transition-all duration-300  /* Global */
transition-all duration-1000 /* Progress bars */
```

### Interactive States
- **Hover**: `hover:bg-white/10`, `hover:brightness-110`
- **Active**: `active:scale-95`, `active:scale-90`
- **Focus**: `peer-focus:outline-none`

### Visual Effects
- **Glow**: `drop-shadow(0 0 8px rgba(43, 212, 192, 0.4))`
- **Glassmorphism**: `backdrop-blur-md`, `backdrop-blur-sm`
- **Decorative backgrounds**: Large blurred circles with `blur-[120px]`

### Scrollbar Styling
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb {
  background: #2a3735;
  border-radius: 10px;
}
```

---

## Border Radius System
```css
DEFAULT: 1rem   (16px)
lg:      2rem   (32px)
xl:      3rem   (48px)
full:    9999px (circular)
```

---

## Responsive Design

### Breakpoints
- **Mobile**: Base styles
- **Desktop (md)**: Larger timer (`text-8xl`), progress ring (`size-96`)

### Touch Targets
- Minimum size: `size-10` (40px) for icon buttons
- Primary button: `h-16` (64px) for easy tapping

---

## Accessibility

### Icons
- Material Symbols Outlined
- Semantic labels paired with icons
- Icon-only buttons have clear hover states

### Contrast
- Primary on dark: 4.5:1+ ratio
- White text on dark background: 21:1 ratio
- Secondary text (slate-400): Sufficient for body text

### Keyboard Navigation
- Tab navigation supported
- Focus states visible
- Button roles preserved

---

## Implementation Notes

### Dependencies
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"/>

<!-- Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Dark Mode
```html
<html class="dark">
```

Uses Tailwind's `dark:` variant for all color variations.

---

## Future Enhancements

### Planned Features
- Light mode toggle
- Custom color themes
- Animation preferences
- Sound selection modal
- Timer history visualization
- Statistics dashboard

### Performance Considerations
- Use `requestAnimationFrame` for timer updates
- Lazy-load decorative backgrounds
- Optimize SVG rendering
- Implement virtual scrolling for history
