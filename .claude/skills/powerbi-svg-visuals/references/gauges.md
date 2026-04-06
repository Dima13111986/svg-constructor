# Gauges

5 templates for circular and arc-based percentage indicators.

## Table of Contents
1. Circle Gauge — full ring with percentage
2. Semi-circle — half-arc gauge
3. Speedometer — arc with tick marks and needle
4. Donut Gauge — thick ring with remaining %
5. Multi Gauge — concentric rings for multiple values

## Common Technique: stroke-dasharray

All circular gauges use the same core SVG technique:
```xml
<!-- Track (background ring) -->
<circle cx='CX' cy='CY' r='R' stroke='TRACK_COLOR' stroke-width='W' fill='none'/>
<!-- Fill (progress arc) -->
<circle cx='CX' cy='CY' r='R' stroke='FILL_COLOR' stroke-width='W' fill='none'
  stroke-dasharray='FILLED_LENGTH CIRCUMFERENCE'
  stroke-linecap='round'
  transform='rotate(-90 CX CY)'/>
```

Where:
- `CIRCUMFERENCE = 2 * PI * R` (use `2 * 3.14159265 * R` in DAX)
- `FILLED_LENGTH = (pct / 100) * CIRCUMFERENCE`
- `transform='rotate(-90 CX CY)'` starts the arc from the top (12 o'clock)

## Default parameters
- `_pct` — percentage (0–100)
- `_thickness` — stroke width (4–30, default 12)
- `_radius` — circle radius (default 55–65)

---

## 1. Circle Gauge

Full 360° ring showing progress from top.

```
      ╭─────╮
    ╱    72%   ╲
   │  Progress  │
    ╲           ╱
      ╰─────╯
```

Size: `width='180' height='180'`, center at (90, 90)

**SVG Structure:**
```xml
<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'>
  <circle cx='90' cy='90' r='55' stroke='#e2e8f0' stroke-width='12' fill='none'/>
  <circle cx='90' cy='90' r='55' stroke='COLOR' stroke-width='12' fill='none'
    stroke-dasharray='CIRCUMFERENCE' stroke-dashoffset='OFFSET'
    stroke-linecap='round' transform='rotate(-90 90 90)'/>
  <text x='90' y='85' font-family='Segoe UI, sans-serif' font-size='28' fill='#1e293b'
    text-anchor='middle' font-weight='700'>72%</text>
  <text x='90' y='108' font-family='Segoe UI, sans-serif' font-size='11' fill='#64748b'
    text-anchor='middle'>Progress</text>
</svg>
```

**DAX calculation:**
```dax
VAR _r = 55
VAR _circ = 2 * 3.14159265 * _r
VAR _offset = _circ - (_pct / 100) * _circ
```

Use `stroke-dashoffset` approach (offset decreases as pct increases).

---

## 2. Semi-circle

180° arc gauge with min/max labels.

Size: `width='200' height='130'`

**Key:** Uses an SVG `<path>` arc instead of full circle:
```xml
<!-- Track arc -->
<path d='M 30 110 A 65 65 0 0 1 170 110' stroke='#e2e8f0' stroke-width='12' fill='none' stroke-linecap='round'/>
<!-- Fill arc -->
<path d='M 30 110 A 65 65 0 0 1 170 110' stroke='COLOR' stroke-width='12' fill='none' stroke-linecap='round'
  stroke-dasharray='HALF_CIRC' stroke-dashoffset='OFFSET'/>
```

Where `HALF_CIRC = PI * 65` and `OFFSET = HALF_CIRC - (pct / 100) * HALF_CIRC`

Labels: `0` at bottom-left (x='30' y='125'), `100` at bottom-right (x='170' y='125')
Value text centered: x='100' y='100'

---

## 3. Speedometer

Arc with tick marks and rotating needle.

Size: `width='200' height='160'`, center at (100, 100)

**Elements:**
1. **Tick marks** — 11 marks at 27° intervals along a 270° arc (from -135° to +135°)
   ```
   for i in 0..10:
     angle = (-135 + i * 27) * PI / 180
     x1 = 100 + 60 * cos(angle), y1 = 100 + 60 * sin(angle)
     x2 = 100 + 68 * cos(angle), y2 = 100 + 68 * sin(angle)
     <line x1 y1 x2 y2 stroke='#64748b' stroke-width='1.5' stroke-linecap='round'/>
   ```

2. **Background arc** — partial circle (270° of 360°)
   ```
   stroke-dasharray = PI * 55 * 270 / 360
   transform='rotate(135 100 100)'
   ```

3. **Needle** — line from center to calculated endpoint
   ```
   angle = -135 + (pct / 100) * 270  (in degrees)
   nx = 100 + 50 * cos(angle_rad)
   ny = 100 + 50 * sin(angle_rad)
   <line x1='100' y1='100' x2='NX' y2='NY' stroke='COLOR' stroke-width='3' stroke-linecap='round'/>
   ```

4. **Center dot** — `<circle cx='100' cy='100' r='5' fill='COLOR'/>`

5. **Value text** — `<text x='100' y='140' ...>72%</text>`

**DAX angle calculation:**
```dax
VAR _angle = -135 + (_pct / 100) * 270
VAR _rad = _angle * 3.14159265 / 180
VAR _nx = 100 + 50 * COS(_rad)
VAR _ny = 100 + 50 * SIN(_rad)
```

Tick marks in DAX: generate with a CONCATENATEX over a helper table or hardcode 11 tick positions.

---

## 4. Donut Gauge

Thick ring (stroke-width='20') with "X% left" label.

Size: `width='180' height='180'`, r=55, center (90,90)

Same as Circle Gauge but:
- `stroke-width='20'` (thicker)
- Second text line: `REMAINING% left` below the percentage
- Uses `stroke-dasharray='FILLED CIRCUMFERENCE'` (no offset, direct dasharray)

---

## 5. Multi Gauge

3 concentric rings at different radii, each showing a different metric.

Size: `width='180' height='180'`, center (90,90)

**Rings:**
- Ring A: r=55, color=`#4f6ef7`
- Ring B: r=37, color=`#34d399`
- Ring C: r=19, color=`#fbbf24`

Each ring: stroke-width='10', same stroke-dasharray technique.

Center text: shows the primary percentage.

**DAX pattern:**
```dax
VAR _r1 = 55  VAR _r2 = 37  VAR _r3 = 19
VAR _c1 = 2 * 3.14159265 * _r1
VAR _c2 = 2 * 3.14159265 * _r2
VAR _c3 = 2 * 3.14159265 * _r3
VAR _v1 = [Metric A %]  VAR _v2 = [Metric B %]  VAR _v3 = [Metric C %]
```

Each ring follows the same track + fill pattern, just at different radii.
