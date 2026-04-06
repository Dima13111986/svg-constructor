# Trends

4 templates for showing directional change and momentum.

## Table of Contents
1. Trend Arrow — simple up/down arrow with percentage
2. Trend Sparkline — mini line chart with delta badge (data-driven)
3. Delta — pill badge showing change value
4. Flame — intensity indicator based on percentage

## Common Parameters
- `_pct` — percentage change (can be negative, range -100 to 200)
- `_colorGood` — `#34d399` (positive change)
- `_colorBad` — `#f87171` (negative change)

---

## 1. Trend Arrow

Simple arrow pointing up or down with percentage text.

Size: `width='115' height='50'`

**Up arrow path:**
```xml
<path d='M25 35 L25 12 M16 20 L25 10 L34 20' stroke='#34d399' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
```

**Down arrow path:**
```xml
<path d='M25 10 L25 33 M16 25 L25 35 L34 25' stroke='#f87171' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
```

Text: `<text x='48' y='30' ...>+12%</text>` or `-8%`

**DAX:**
```dax
VAR _isPos = _pct >= 0
VAR _col = IF(_isPos, "#34d399", "#f87171")
VAR _arrowPath = IF(_isPos,
    "M25 35 L25 12 M16 20 L25 10 L34 20",
    "M25 10 L25 33 M16 25 L25 35 L34 25")
VAR _sign = IF(_isPos, "+", "")
```

---

## 2. Trend Sparkline (Data-Driven)

Mini line chart with area fill and a delta badge on the right showing last-period change.

Size: `width='300' height='90'`

Uses the same CONCATENATEX technique as the Charts sparkline, but with these additions:
- Area fill path with low opacity
- Delta badge: small rounded rect on the right with arrow + change value
- Date labels at first, middle, and last positions

**Delta badge:**
```xml
<rect x='256' y='BADGE_Y' width='40' height='20' rx='4' fill='COLOR' opacity='0.12'/>
<text x='276' y='BADGE_Y+14' font-size='10' fill='COLOR' text-anchor='middle' font-weight='600'>▲5</text>
```

**Color:** Based on delta (last value - previous value): green if positive, red if negative.

**DAX pattern:** Same as charts/sparkline but with `_padR = 50` to leave room for badge.

---

## 3. Delta

Pill-shaped badge showing the change amount with directional arrow symbol.

Size: `width='130' height='45'`

```xml
<rect x='3' y='5' width='124' height='35' rx='8' fill='COLOR' opacity='0.1'/>
<text x='15' y='28' font-family='Segoe UI, sans-serif' font-size='15' fill='COLOR' font-weight='700'>▲ 12%</text>
<text x='80' y='28' font-family='Segoe UI, sans-serif' font-size='11' fill='#64748b'>change</text>
```

Arrow symbol: `▲` for positive, `▼` for negative.

---

## 4. Flame

Fire icon with intensity (height + color) based on percentage. Visual metaphor for "hot" metrics.

Size: `width='60' height='70'`

**Flame shape:** Two nested path elements (outer flame + inner core).

Flame height scales with percentage:
```dax
VAR _intensity = MIN(_pct / 100, 1)
VAR _h = 30 + _intensity * 30
```

**Outer flame path:**
```
M30 {65-h} C20 {55-h*0.5} 12 40 15 52 C17 60 22 65 30 65 C38 65 43 60 45 52 C48 40 40 {55-h*0.5} 30 {65-h} Z
```

**Inner flame path (smaller, warmer color):**
```
M30 {65-h*0.5} C25 {60-h*0.3} 22 50 24 56 C26 62 28 65 30 65 C32 65 34 62 36 56 C38 50 35 {60-h*0.3} 30 {65-h*0.5} Z
```

**Color logic:**
- pct >= 80 → outer `#ef4444` (hot red)
- pct >= 50 → outer `#fb923c` (orange, primary)
- else → outer `#64748b` (cool gray)
- Inner always: `#fbbf24` (yellow core)

Both paths: `opacity='0.8'`

Percentage text at bottom: `<text x='30' y='60' ... fill='white'>85%</text>`
