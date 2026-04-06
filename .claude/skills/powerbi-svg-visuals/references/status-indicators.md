# Status Indicators

5 templates for showing categorical status (good/warning/bad).

## Table of Contents
1. Traffic Light — 3-circle vertical indicator
2. Status Icon — checkmark / exclamation / X in circle
3. Status Badge — pill-shaped label with color
4. Status Dot — simple colored dot
5. Status Flag — flag icon with color

## Common Logic

All status visuals share the same threshold logic:
```dax
VAR _status =
    SWITCH(
        TRUE(),
        _pct >= 70, "good",
        _pct >= 40, "warn",
        "bad"
    )
VAR _col =
    SWITCH(
        _status,
        "good", "#34d399",
        "warn", "#fbbf24",
        "#f87171"
    )
```

These are small visuals designed for table/matrix cells.

---

## 1. Traffic Light

Three circles stacked vertically — one lit, others dimmed.

Size: `width='50' height='120'`

```xml
<svg xmlns='http://www.w3.org/2000/svg' width='50' height='120' viewBox='0 0 50 120'>
  <rect x='5' y='5' width='40' height='110' rx='8' fill='#1e293b'/>
  <circle cx='25' cy='30' r='13' fill='RED_OR_DIM' opacity='OPACITY'/>
  <circle cx='25' cy='60' r='13' fill='YELLOW_OR_DIM' opacity='OPACITY'/>
  <circle cx='25' cy='90' r='13' fill='GREEN_OR_DIM' opacity='OPACITY'/>
</svg>
```

- Active light: full color, `opacity='1'`
- Inactive lights: `fill='#374151'`, `opacity='0.3'`

**DAX:** Use SWITCH to set which circle is active based on status.

---

## 2. Status Icon

Circular background with icon: ✓ (good), ! (warning), ✗ (bad).

Size: `width='50' height='50'`

```xml
<circle cx='25' cy='25' r='22' fill='COLOR' opacity='0.12'/>
<!-- Good: checkmark path -->
<path d='M12 22 L20 30 L38 12' stroke='COLOR' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
<!-- Warn: exclamation text -->
<text x='25' y='32' font-size='28' fill='COLOR' text-anchor='middle' font-weight='700'>!</text>
<!-- Bad: X path -->
<path d='M14 14 L36 36 M36 14 L14 36' stroke='COLOR' stroke-width='4' fill='none' stroke-linecap='round'/>
```

**DAX:** Use SWITCH to select the appropriate SVG path based on status.

---

## 3. Status Badge

Pill-shaped label showing status text with colored background.

Size: `width='120' height='36'`

```xml
<rect x='2' y='2' width='116' height='32' rx='16' fill='COLOR' opacity='0.15'/>
<circle cx='20' cy='18' r='5' fill='COLOR'/>
<text x='32' y='23' font-family='Segoe UI, sans-serif' font-size='13' fill='COLOR' font-weight='600'>STATUS_TEXT</text>
```

Status text: "Good" / "Warning" / "Bad" (or localized versions).

---

## 4. Status Dot

Minimal — just a colored circle with glow effect.

Size: `width='30' height='30'`

```xml
<circle cx='15' cy='15' r='10' fill='COLOR' opacity='0.2'/>
<circle cx='15' cy='15' r='5' fill='COLOR'/>
```

Outer circle = soft glow, inner = solid indicator.

---

## 5. Status Flag

Small flag icon on a pole, colored by status.

Size: `width='40' height='50'`

```xml
<line x1='8' y1='5' x2='8' y2='45' stroke='#64748b' stroke-width='2' stroke-linecap='round'/>
<path d='M8 5 L35 13 L8 25 Z' fill='COLOR'/>
```

Flag is a triangle path: pole at x=8, flag tip at x=35.
