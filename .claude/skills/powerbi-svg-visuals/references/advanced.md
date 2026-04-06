# Advanced Visuals

5 templates for complex infographic-style indicators.

## Table of Contents
1. Thermometer — vertical temperature gauge with scale
2. Funnel — stacked decreasing bars
3. Waffle Chart — 10×10 grid of filled/empty squares
4. Pictogram — people icons filled proportionally
5. Radial Bar — concentric quarter arcs with legend

---

## 1. Thermometer

Vertical thermometer with bulb at bottom, fill level, and scale marks.

Size: `width='90' height='160'`

**Structure:**
- Tube: `<rect x='20' y='10' width='20' height='110' rx='10' fill='#e2e8f0'/>`
- Bulb: `<circle cx='30' cy='135' r='16' fill='#e2e8f0'/>`
- Fill tube: `<rect x='22' y='{120-h}' width='16' height='{h}' rx='8' fill='COLOR'/>`
  where `h = (pct / 100) * 100`
- Bulb fill: `<circle cx='30' cy='135' r='12' fill='COLOR'/>`
- Temperature text in bulb: `font-size='9' fill='white'`

**Scale marks** at 0, 25, 50, 75, 100:
```
for each value v:
  y = 120 - v
  <line x1='42' y1='{y}' x2='48' y2='{y}' stroke='#64748b' stroke-width='1'/>
  <text x='52' y='{y+3}' font-size='9' fill='#64748b'>{v}</text>
```

**Color logic:**
- pct >= 80 → `#f87171` (hot/bad)
- pct >= 50 → `#fbbf24` (warm/warning)
- else → `#34d399` (cool/good)

---

## 2. Funnel

5 stacked horizontal bars decreasing in width — classic sales funnel.

Size: `width='240' height='160'`

**Default stages:** [100, 75, 55, 35, 20] (percentages)
**Colors:** cycle through palette — `[#4f6ef7, #34d399, #fbbf24, #4f6ef7, #f87171]`

**Layout:**
```
for each stage i (0..4):
  bar_width = stages[i] * 2
  x = (220 - bar_width) / 2 + 10   (centered)
  y = 10 + i * 28
  height = 22, rx = 3
```

**Text:** Percentage centered in each bar, white, font-weight='600'

**For dynamic data:** Use CONCATENATEX over a stages table to build rects.
Define a table with stage names and values, build SVG elements per row.

---

## 3. Waffle Chart

10×10 grid (100 cells) where filled cells represent the percentage.

Size: `width='170' height='185'`

**Grid layout:**
```
for row 0..9:
  for col 0..9:
    idx = row * 10 + col
    active = idx < round(pct)
    x = 5 + col * 16
    y = 5 + row * 16
    width = 13, height = 13, rx = 2
    fill = active ? '#4f6ef7' : '#e2e8f0'
    opacity = active ? 0.9 : 0.3
```

**Percentage text below grid:**
```xml
<text x='85' y='178' font-family='Segoe UI, sans-serif' font-size='13' fill='#1e293b' text-anchor='middle' font-weight='600'>73%</text>
```

**DAX pattern for grid:**
Because building 100 rects in DAX string concatenation is verbose, use a helper approach:

```dax
VAR _filled = ROUND([PCT], 0)
VAR _cells = CONCATENATEX(
    GENERATESERIES(0, 99, 1),
    VAR _idx = [Value]
    VAR _row = INT(_idx / 10)
    VAR _col = MOD(_idx, 10)
    VAR _x = 5 + _col * 16
    VAR _y = 5 + _row * 16
    VAR _active = _idx < _filled
    VAR _fill = IF(_active, "#4f6ef7", "#e2e8f0")
    VAR _op = IF(_active, "0.9", "0.3")
    RETURN
    "<rect x='" & _x & "' y='" & _y & "' width='13' height='13' rx='2' fill='" & _fill & "' opacity='" & _op & "'/>",
    "",
    [Value], ASC
)
```

---

## 4. Pictogram

10 person icons (2 rows × 5) — filled proportionally to percentage.

Size: `width='200' height='110'`

**Person icon (at position x, y):**
```xml
<!-- Head -->
<circle cx='{x+10}' cy='{y+8}' r='7' fill='COLOR'/>
<!-- Body -->
<path d='M{x} {y+38} C{x} {y+22} {x+20} {y+22} {x+20} {y+38}' fill='COLOR'/>
```

**Layout:**
```
for i in 0..9:
  x = 10 + (i % 5) * 36
  y = i < 5 ? 10 : 55
  filled = i < round((pct / 100) * 10)
  color = filled ? '#34d399' : '#e2e8f0'
```

**Percentage text** on the right: `x='190' y='60' text-anchor='end' font-size='16' font-weight='700'`

**DAX:** Similar CONCATENATEX approach as waffle, but generating circle + path per person.

---

## 5. Radial Bar

4 concentric arcs (like Apple Watch rings) with a legend.

Size: `width='260' height='180'`, center at (90, 90)

**Rings:**
```
Ring 0: r=65, color=#4f6ef7, label=Q1, value=pct
Ring 1: r=51, color=#34d399, label=Q2, value=pct-15
Ring 2: r=37, color=#fbbf24, label=Q3, value=pct-30
Ring 3: r=23, color=#f87171, label=Q4, value=pct-45
```

Each ring uses stroke-dasharray technique:
```xml
<!-- Track -->
<circle cx='90' cy='90' r='R' stroke='#e2e8f0' stroke-width='8' fill='none'/>
<!-- Fill -->
<circle cx='90' cy='90' r='R' stroke='COLOR' stroke-width='8' fill='none'
  stroke-dasharray='{(val/100)*circ} {circ}' stroke-linecap='round'
  transform='rotate(-90 90 90)'/>
```

**Legend** on the right side:
```
for each ring i:
  <circle cx='195' cy='{35 + i * 20}' r='4' fill='COLOR'/>
  <text x='205' y='{39 + i * 20}' font-size='11' fill='#64748b'>LABEL VAL%</text>
```

**DAX:**
```dax
VAR _r1 = 65  VAR _r2 = 51  VAR _r3 = 37  VAR _r4 = 23
VAR _c1 = 2 * 3.14159265 * _r1
-- ... repeat for each ring
VAR _v1 = [Q1 %]  VAR _v2 = [Q2 %]  -- etc.
```

Build each ring's track + fill as separate SVG circle elements concatenated together.
