# KPI Cards

5 templates for displaying key metrics with contextual information.

## Table of Contents
1. Basic KPI — value, target, progress bar
2. KPI Comparison — value with % change vs previous period
3. KPI Trend Arrow — value with directional arrow
4. KPI Mini Chart — value with embedded sparkline
5. Dual KPI — two values side by side

## Common Parameters
All KPI cards accept:
- `_value` — primary metric (e.g. `[Sales Amount]`)
- `_target` — target/goal (e.g. `[Sales Target]`)
- `_pct` — percentage (derived or separate measure)
- `_label` — card title (hardcoded or from column)

Value formatting helper (use in all KPI cards):
```dax
VAR _fv = IF(_value >= 1000000, FORMAT(_value / 1000000, "0.0") & "M",
          IF(_value >= 1000, FORMAT(_value / 1000, "0") & "K",
          FORMAT(_value, "#,0")))
```

Recommended size: `width='280' height='120–140'`

---

## 1. Basic KPI

Shows: label, large value, target text, progress bar with percentage.

```
┌──────────────────────────────┐
│ Sales                        │
│ $750K                   75%  │
│ Target: $1M                  │
│ ████████████░░░░░░           │
└──────────────────────────────┘
```

**SVG Structure:**
```xml
<svg xmlns='http://www.w3.org/2000/svg' width='280' height='140' viewBox='0 0 280 140'>
  <rect width='280' height='140' rx='10' fill='#ffffff' stroke='#e2e8f0' stroke-width='1'/>
  <text x='20' y='32' font-family='Segoe UI, sans-serif' font-size='12' fill='#64748b' font-weight='500'>LABEL</text>
  <text x='20' y='72' font-family='Segoe UI, sans-serif' font-size='34' fill='#1e293b' font-weight='700'>$VALUE</text>
  <text x='20' y='96' font-family='Segoe UI, sans-serif' font-size='13' fill='#64748b'>Target: $TARGET</text>
  <!-- Track -->
  <rect x='20' y='112' width='240' height='8' rx='4' fill='#e2e8f0'/>
  <!-- Fill: width = min(pct, 100) * 2.4 -->
  <rect x='20' y='112' width='FILL_W' height='8' rx='4' fill='COLOR'/>
  <text x='260' y='96' font-family='Segoe UI, sans-serif' font-size='13' fill='COLOR' text-anchor='end' font-weight='600'>PCT%</text>
</svg>
```

**Color logic:**
- pct >= 100 → `#34d399` (green)
- pct >= 70 → `#fbbf24` (yellow)
- else → `#f87171` (red)

**DAX Template:**
```dax
Basic KPI =
VAR _value = [Your Measure]
VAR _target = [Your Target]
VAR _pct = DIVIDE(_value, _target, 0) * 100
VAR _fv = IF(_value >= 1000000, FORMAT(_value / 1000000, "0.0") & "M",
          IF(_value >= 1000, FORMAT(_value / 1000, "0") & "K", FORMAT(_value, "#,0")))
VAR _ft = IF(_target >= 1000000, FORMAT(_target / 1000000, "0.0") & "M",
          IF(_target >= 1000, FORMAT(_target / 1000, "0") & "K", FORMAT(_target, "#,0")))
VAR _col = SWITCH(TRUE(), _pct >= 100, "#34d399", _pct >= 70, "#fbbf24", "#f87171")
VAR _barW = MIN(_pct, 100) * 2.4
VAR _svg =
    "data:image/svg+xml;utf8," &
    "<svg xmlns='http://www.w3.org/2000/svg' width='280' height='140' viewBox='0 0 280 140'>" &
    "<rect width='280' height='140' rx='10' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='1'/>" &
    "<text x='20' y='32' font-family='Segoe UI, sans-serif' font-size='12' fill='%2364748b' font-weight='500'>Sales</text>" &
    "<text x='20' y='72' font-family='Segoe UI, sans-serif' font-size='34' fill='%231e293b' font-weight='700'>$" & _fv & "</text>" &
    "<text x='20' y='96' font-family='Segoe UI, sans-serif' font-size='13' fill='%2364748b'>Target: $" & _ft & "</text>" &
    "<rect x='20' y='112' width='240' height='8' rx='4' fill='%23e2e8f0'/>" &
    "<rect x='20' y='112' width='" & _barW & "' height='8' rx='4' fill='" & _col & "'/>" &
    "<text x='260' y='96' font-family='Segoe UI, sans-serif' font-size='13' fill='" & _col & "' text-anchor='end' font-weight='600'>" & ROUND(_pct, 0) & "%</text>" &
    "</svg>"
RETURN _svg
```

---

## 2. KPI Comparison

Shows: label, large value, pill-shaped badge with % change and arrow.

```
┌────────────────────────────┐
│ Revenue                    │
│ $750K                      │
│  ┌─────────────────┐       │
│  │ ▲ 12% vs prev.  │       │
│  └─────────────────┘       │
└────────────────────────────┘
```

**Key elements:**
- Rounded pill badge: `<rect rx='12' fill='COLOR' opacity='0.15'/>`
- Arrow symbol: `▲` for positive, `▼` for negative
- Color: green for positive, red for negative

**DAX Template:**
```dax
KPI Comparison =
VAR _value = [Your Measure]
VAR _change = [Your Change %]
VAR _fv = IF(_value >= 1000000, FORMAT(_value / 1000000, "0.0") & "M",
          IF(_value >= 1000, FORMAT(_value / 1000, "0") & "K", FORMAT(_value, "#,0")))
VAR _isPos = _change >= 0
VAR _col = IF(_isPos, "#34d399", "#f87171")
VAR _arrow = IF(_isPos, "▲", "▼")
VAR _badgeW = 60 + ABS(_change) * 0.5
VAR _svg =
    "data:image/svg+xml;utf8," &
    "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='120' viewBox='0 0 260 120'>" &
    "<rect width='260' height='120' rx='10' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='1'/>" &
    "<text x='20' y='30' font-family='Segoe UI, sans-serif' font-size='12' fill='%2364748b' font-weight='500'>Revenue</text>" &
    "<text x='20' y='68' font-family='Segoe UI, sans-serif' font-size='32' fill='%231e293b' font-weight='700'>$" & _fv & "</text>" &
    "<rect x='20' y='82' width='" & _badgeW & "' height='24' rx='12' fill='" & _col & "' opacity='0.15'/>" &
    "<text x='32' y='99' font-family='Segoe UI, sans-serif' font-size='13' fill='" & _col & "' font-weight='600'>" & _arrow & " " & FORMAT(ABS(_change), "0") & "% vs prev.</text>" &
    "</svg>"
RETURN _svg
```

---

## 3. KPI Trend Arrow

Shows: label, value, achievement %, and a directional arrow indicator on the right.

**Arrow paths based on achievement:**
- pct >= 100 → up arrow: `M220 70 L235 50 L250 70`
- pct >= 70 → flat line: `M220 60 L250 60`
- else → down arrow: `M220 50 L235 70 L250 50`

Arrow style: `stroke='COLOR' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'`

Size: `width='280' height='110'`

---

## 4. KPI Mini Chart

Shows: label, value, embedded sparkline, and thin progress bar at bottom.

**Sparkline:** Built from a hardcoded array of 10 points for static, or `CONCATENATEX` for dynamic.
For static template, use: `[40, 55, 45, 65, 58, 72, 68, 80, 75, PCT]`

Path construction:
```
M{x0},{y0} L{x1},{y1} L{x2},{y2} ...
where xi = 20 + i * 24, yi = 95 - (point / maxPoint) * 40
```

Endpoint dot: `<circle cx='LAST_X' cy='LAST_Y' r='3' fill='COLOR'/>`

Size: `width='280' height='140'`

---

## 5. Dual KPI

Shows: two side-by-side panels — Actual and Target — each with value and percentage.

**Layout:**
- Card background: `width='300' height='130'`
- Left panel: `<rect x='20' y='15' width='120' height='100' rx='8'/>`
- Right panel: `<rect x='160' y='15' width='120' height='100' rx='8'/>`
- Each panel: subtitle at top, large value in center, colored % below

Panel fill: `#f8fafc` (light) or `#252545` (dark)
