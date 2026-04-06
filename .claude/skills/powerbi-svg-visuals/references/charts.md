# Charts

5 templates for in-cell chart visuals.

## Table of Contents
1. Horizontal Bar — single bar with value label
2. Vertical Bar — 5-bar column chart
3. Bullet Chart — actual vs target with ranges
4. Waterfall — cumulative gain/loss bars
5. Sparkline — line chart with area fill (data-driven)

---

## 1. Horizontal Bar

Single horizontal bar showing value relative to target.

Size: `width='300' height='50'`

```xml
<rect x='10' y='12' width='200' height='26' rx='4' fill='#e2e8f0'/>
<rect x='10' y='12' width='FILL_W' height='26' rx='4' fill='#4f6ef7'/>
<text x='LABEL_X' y='30' font-family='Segoe UI, sans-serif' font-size='12' fill='#1e293b' font-weight='600'>$750K</text>
```

Fill width = `(pct / 100) * 200`, label positioned just after fill.

---

## 2. Vertical Bar

5 columns — one highlighted, others muted. Great for comparing a value in context.

Size: `width='290' height='140'`

**Layout:** 5 bars, width='30' each, x_i = 20 + i * 50
Bar height proportional to value, growing upward from baseline y=120.

```
height_i = (val_i / maxVal) * 100
y_i = 120 - height_i
```

Highlighted bar (index 2 by default): `fill='#4f6ef7'`
Other bars: `fill='#e2e8f0'`

Baseline: `<line x1='15' y1='120' x2='275' y2='120' stroke='#e2e8f0' stroke-width='1'/>`

Value labels above each bar: `font-size='10'`, `text-anchor='middle'`

**For dynamic data:** Use CONCATENATEX to build bar elements from a table.

---

## 3. Bullet Chart

Shows actual progress against a target marker with range backgrounds.

Size: `width='300' height='60'`

**Layers (bottom to top):**
1. Full range background: `width='240' height='24' rx='3' fill='#e2e8f0'`
2. 75% range: same rect but narrower, `fill='#d1d5db'`
3. Actual bar: `height='16'` (narrower), centered vertically, `fill='#4f6ef7'`
4. Target marker: vertical line at target position, `stroke='#1e293b' stroke-width='2'`

```xml
<rect x='20' y='18' width='240' height='24' rx='3' fill='#e2e8f0'/>
<rect x='20' y='18' width='180' height='24' rx='3' fill='#d1d5db'/>
<rect x='20' y='22' width='ACTUAL_W' height='16' rx='2' fill='#4f6ef7'/>
<line x1='TARGET_X' y1='14' x2='TARGET_X' y2='46' stroke='#1e293b' stroke-width='2'/>
```

Value label below: `font-size='11'`, shows "$VALUE / $TARGET"

---

## 4. Waterfall

Cumulative bars showing additions and subtractions.

Size: `width='290' height='130'`

**Data:** Array of positive/negative values, e.g. [100, -20, 35, -10, 15]

**Calculation for each bar:**
```
cumulative starts at 0
for each value:
  prev_cumulative = cumulative
  cumulative += value
  if value >= 0:
    y = 100 - cumulative * 0.6
    height = value * 0.6
  else:
    y = 100 - prev_cumulative * 0.6
    height = abs(value) * 0.6
```

Colors: positive → `#34d399`, negative → `#f87171`
Labels above bars: `+35` or `-20`
Baseline: dashed line at y=100

**For dynamic data:** Use CONCATENATEX with running total calculations.

---

## 5. Sparkline (Data-Driven)

Line chart built from actual data using CONCATENATEX. This is the most complex template
because it queries real data.

Size: `width='300' height='120'`

**This template uses a completely different DAX pattern:**

```dax
Sparkline =
VAR _dates = SELECTCOLUMNS(
    TOPN(10, 'Calendar', 'Calendar'[Date], DESC),
    "D", 'Calendar'[Date],
    "V", CALCULATE([Your Measure])
)
VAR _maxV = MAXX(_dates, [V])
VAR _minV = MINX(_dates, [V])
VAR _range = _maxV - _minV
VAR _W = 300  VAR _H = 120
VAR _padL = 10  VAR _padR = 30
VAR _padT = 12  VAR _padB = 22
VAR _gW = _W - _padL - _padR
VAR _gH = _H - _padT - _padB
VAR _n = COUNTROWS(_dates) - 1
VAR _points = CONCATENATEX(
    ADDCOLUMNS(
        _dates,
        "idx", RANKX(_dates, [D], , ASC) - 1,
        "px", _padL + (RANKX(_dates, [D], , ASC) - 1) / _n * _gW,
        "py", _padT + _gH - DIVIDE([V] - _minV, _range, 0) * _gH
    ),
    IF([idx] = 0, "M", "L") & FORMAT([px], "0.0") & "," & FORMAT([py], "0.0"),
    " ",
    [D], ASC
)
VAR _lastV = MAXX(TOPN(1, _dates, [D], DESC), [V])
VAR _color = "#4f6ef7"
VAR _svg =
    "data:image/svg+xml;utf8," &
    "<svg xmlns='http://www.w3.org/2000/svg' width='" & _W & "' height='" & _H & "'>" &
    "<path d='" & _points & "' stroke='" & _color & "' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>" &
    "</svg>"
RETURN _svg
```

**Integration steps:**
1. Create 'Calendar' table with [Date] column (or use existing date table)
2. Replace `[Your Measure]` with actual measure
3. Adjust `TOPN(10, ...)` to change number of data points
4. Set Data Category → Image URL

**Optional enhancements (add to SVG string):**
- Area fill: build area path by appending `L{lastX},{bottomY} L{firstX},{bottomY} Z` and fill with `opacity='0.08'`
- Grid lines: horizontal lines at 0%, 50%, 100% of value range
- Endpoint dot: `<circle cx='LAST_X' cy='LAST_Y' r='4' fill='COLOR'/>`
- Date labels: text elements at first, middle, and last x positions
