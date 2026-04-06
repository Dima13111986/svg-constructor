# Progress Bars

5 templates for linear and segmented progress indicators.

## Table of Contents
1. Linear Progress — simple horizontal bar
2. Stepped Progress — 5 discrete steps
3. Gradient Progress — bar with red→yellow→green gradient
4. Segmented — 10 discrete blocks
5. Battery — battery icon with fill level

## Common Parameters
- `_pct` — percentage (0–100)
- `_thickness` — bar height (6–40, default 12)
- `_color1` — primary fill color
- `_color2` — track/background color

Recommended size: `width='300' height='60'` for linear types, `width='120' height='60'` for battery.

---

## 1. Linear Progress

Simple horizontal bar with label and percentage.

```
Progress                     65%
████████████████░░░░░░░░░░░░░
```

**SVG Structure:**
```xml
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='60' viewBox='0 0 300 60'>
  <text x='20' y='20' font-family='Segoe UI, sans-serif' font-size='12' fill='#64748b' font-weight='500'>Progress</text>
  <text x='280' y='20' font-family='Segoe UI, sans-serif' font-size='13' fill='#1e293b' text-anchor='end' font-weight='600'>65%</text>
  <!-- Track -->
  <rect x='20' y='32' width='260' height='12' rx='6' fill='#e2e8f0'/>
  <!-- Fill: width = (pct / 100) * 260 -->
  <rect x='20' y='32' width='FILL_W' height='12' rx='6' fill='COLOR'/>
</svg>
```

**Color logic:**
- pct >= 80 → `#34d399`
- pct >= 50 → `#4f6ef7` (primary)
- else → `#f87171`

---

## 2. Stepped Progress

5 discrete bars — filled bars are highlighted, unfilled are muted.

```
Step 3/5                     60%
████  ████  ████  ░░░░  ░░░░
```

**Key:** 5 rectangles, each width='48', gap='6', starting at x=20.
```
x_i = 20 + i * 54   (for i = 0..4)
```

Filled count = `CEILING((pct / 100) * 5, 1)`

Each rect:
- Active: `fill='COLOR'`
- Inactive: `fill='#e2e8f0'`

---

## 3. Gradient Progress

Bar with a linearGradient from red → yellow → green, clipped to progress.

**SVG elements:**
```xml
<defs>
  <linearGradient id='pg' x1='0%' y1='0%' x2='100%' y2='0%'>
    <stop offset='0%' stop-color='#f87171'/>
    <stop offset='50%' stop-color='#fbbf24'/>
    <stop offset='100%' stop-color='#34d399'/>
  </linearGradient>
  <clipPath id='pgc'>
    <rect x='20' y='32' width='CLIP_W' height='THICKNESS' rx='HALF_THICKNESS'/>
  </clipPath>
</defs>
<!-- Track -->
<rect x='20' y='32' width='260' height='THICKNESS' rx='HALF_THICKNESS' fill='#e2e8f0'/>
<!-- Gradient bar clipped to progress -->
<rect x='20' y='32' width='260' height='THICKNESS' rx='HALF_THICKNESS' fill='url(#pg)' clip-path='url(#pgc)'/>
```

**DAX note:** When using `<defs>`, gradient IDs must be unique per row if used in a table.
Use `SELECTEDVALUE()` or row context to generate unique IDs:
```dax
VAR _id = "pg" & SELECTEDVALUE('Table'[ID])
```

---

## 4. Segmented

10 discrete small blocks showing granular progress.

```
73%
███ ███ ███ ███ ███ ███ ███ ░░░ ░░░ ░░░
```

**Key:** 10 rectangles, each width='22', gap='4', x_i = 20 + i * 26
Filled count = `ROUND(pct, 0)` (out of 100 → /10 for 10 segments)

Each rect: `rx='3'`
- Active: `fill='COLOR' opacity='1'`
- Inactive: `fill='#e2e8f0' opacity='0.4'`

Size: `width='300' height='60'`

---

## 5. Battery

Battery icon shape with fill proportional to percentage.

```
┌──────────┐╮
│ ██████   ││
│ ██████   ││
│ 65%      ││
└──────────┘╯
```

Size: `width='120' height='60'`

**SVG Structure:**
```xml
<!-- Battery outline -->
<rect x='10' y='12' width='90' height='36' rx='5' stroke='#64748b' stroke-width='2' fill='none'/>
<!-- Battery terminal (right nub) -->
<rect x='100' y='22' width='6' height='16' rx='2' fill='#64748b'/>
<!-- Fill level -->
<rect x='15' y='17' width='FILL_W' height='26' rx='3' fill='COLOR'/>
<!-- Percentage text -->
<text x='55' y='36' font-family='Segoe UI, sans-serif' font-size='14' fill='TEXT_COL' text-anchor='middle' font-weight='600'>65%</text>
```

Fill width = `(pct / 100) * 80`

**Color logic:**
- pct >= 60 → `#34d399`
- pct >= 25 → `#fbbf24`
- else → `#f87171`

Text color: white if pct > 50, else primary text color.
