---
name: powerbi-svg-visuals
description: >
  Create SVG visuals for Power BI — KPI cards, gauges, progress bars, bar charts, sparklines,
  status indicators, rating visuals, trend arrows, and advanced infographic-style visuals
  (waffle charts, pictograms, funnels, thermometers, radial bars).
  Use this skill whenever the user wants to create SVG graphics for Power BI, write DAX measures
  that render SVG images, build visual indicators using SVG in table/matrix/card visuals, or use
  the HTML Content custom visual with SVG. Also trigger when the user mentions: "SVG measure",
  "DAX SVG", "custom visual with SVG", "KPI card SVG", "progress bar Power BI", "gauge DAX",
  "infographic Power BI", "SVG in matrix", "Image URL measure", "data:image/svg+xml",
  "HTML Content visual", "sparkline DAX", "traffic light Power BI", "star rating DAX",
  "waffle chart", "pictogram", "battery indicator", "trend arrow", "bullet chart DAX",
  or asks for any kind of custom data-driven visual element in Power BI that goes beyond
  standard chart types. Even if the user just says "make me a nice KPI", "custom indicator",
  "I want a gauge", "show percentage visually", or "dashboard icons" in a Power BI context,
  use this skill.
---

# Power BI SVG Visuals Creator

Create production-ready SVG visuals for Power BI — from simple status dots to complex
infographic dashboards. This skill generates DAX measures with embedded SVG, HTML previews,
and integration instructions.

## Available Visual Categories

Read the appropriate reference file based on the user's request:

| User wants | Category | Reference file |
|---|---|---|
| KPI card, value display, comparison card, dual KPI, value with trend | KPI Cards | `references/kpi-cards.md` |
| Circular gauge, semi-circle, speedometer, donut, multi-ring | Gauges | `references/gauges.md` |
| Progress bar, stepped, gradient, segmented, battery | Progress Bars | `references/progress-bars.md` |
| Horizontal bar, vertical bar, bullet chart, waterfall, sparkline | Charts | `references/charts.md` |
| Traffic light, status icon, badge, dot, flag | Status Indicators | `references/status-indicators.md` |
| Stars, hearts, bars, numeric rating, emoji | Rating Visuals | `references/rating-visuals.md` |
| Trend arrow, trend sparkline, delta badge, flame | Trends | `references/trends.md` |
| Thermometer, funnel, waffle, pictogram, radial bar | Advanced | `references/advanced.md` |

If the request spans multiple categories (e.g. "KPI card with a gauge and trend arrow"),
read all relevant reference files and combine the patterns.

## How SVG Works in Power BI

### Approach 1: Image URL (Native — recommended default)

A DAX measure returns `"data:image/svg+xml;utf8,<svg ...>...</svg>"`.
Set the measure's **Data Category** to **Image URL**, then use it in Table, Matrix, Card,
Button Slicer, or Image visuals.

### Approach 2: HTML Content Custom Visual

Install "HTML Content" from AppSource. The measure returns full HTML+SVG markup.
Use for complex layouts, clickable elements, or richer HTML+CSS combinations.

Default to **Image URL** unless the user needs interactivity or very complex layouts.

## Core DAX-SVG Rules

These rules apply to ALL visual types:

### String Construction
- ALWAYS use single quotes (`'`) inside SVG — DAX uses double quotes as string delimiters
- ALWAYS include `xmlns='http://www.w3.org/2000/svg'` on the `<svg>` root
- ALWAYS prefix with `"data:image/svg+xml;utf8,`
- Use `&` to concatenate dynamic values into SVG
- Use `FORMAT()` for number formatting in text elements

### Variable Pattern
```dax
Visual Name =
VAR _value = [Your Measure]
VAR _target = [Your Target]
VAR _pct = DIVIDE(_value, _target, 0) * 100
VAR _color =
    SWITCH(
        TRUE(),
        _pct >= 80, "#34d399",
        _pct >= 50, "#fbbf24",
        "#f87171"
    )
VAR _svg =
    "data:image/svg+xml;utf8," &
    "<svg xmlns='http://www.w3.org/2000/svg' width='...' height='...' viewBox='0 0 ... ...'>" &
    "<!-- elements using single quotes -->" &
    "</svg>"
RETURN _svg
```

### SVG Best Practices
- Use `viewBox` for responsive scaling
- Use `font-family='Segoe UI, sans-serif'` to match Power BI's default
- Use `text-anchor='middle'` for centered text
- Layer elements: background → shapes → text (painter's model)
- Use `opacity` for subtle effects
- Rounded corners: `rx='...'` on `<rect>`
- Circular gauges: `<circle>` with `stroke-dasharray` / `stroke-dashoffset`
- Keep total measure under ~32,000 characters
- For sparklines: use `CONCATENATEX` + `ADDCOLUMNS` to build SVG path from data

### Default Color Palette
```
Primary:  #4f6ef7 (blue)
Good:     #34d399 (green)
Warning:  #fbbf24 (yellow)
Bad:      #f87171 (red)
Track:    #e2e8f0 (light gray, light background)
          #2a2a3e (dark gray, dark background)
Text:     #1e293b (dark) / #e8ecf4 (light on dark)
Muted:    #64748b (dark) / #8892b0 (light on dark)
```

### Conditional Color Logic
For status/threshold-based visuals, use a SWITCH pattern:
```dax
VAR _color =
    SWITCH(
        TRUE(),
        _pct >= 80, "#34d399",  -- Good
        _pct >= 50, "#fbbf24",  -- Warning
        "#f87171"               -- Bad
    )
```

### Dark Background Support
If the user's report has a dark background, swap track/text colors:
- Track: `#2a2a3e` instead of `#e2e8f0`
- Card background: `#1e1e2e` instead of `#ffffff`
- Primary text: `#e8ecf4` instead of `#1e293b`
- Secondary text: `#8892b0` instead of `#64748b`

## Workflow

1. **Understand the request** — visual type, data context, colors, light/dark theme
2. **Read the reference file** for the requested category
3. **Generate DAX measure** following the SVG template from the reference
4. **Create HTML preview** with interactive controls (sliders for value/percentage)
5. **Provide integration instructions**

### Integration Instructions (always include)

**Image URL approach:**
1. New Measure → paste DAX code
2. Measure Tools → Data Category → **Image URL**
3. Add Table/Matrix/Card visual → drag measure to Values
4. Replace `[Your Measure]` and `[Your Target]` with actual measures

**HTML Content approach:**
1. Get "HTML Content" from AppSource
2. Create measure → paste DAX
3. Add HTML Content visual → drag measure to Values
4. Format → Content Formatting → Allow Opening URLs → On (if clickable)

## Troubleshooting (mention when relevant)

- **Blank visual**: Data Category not set to Image URL, or SVG has double quotes inside
- **Raw code showing**: Visual type doesn't support images — use Table/Matrix/Card
- **Truncated**: Measure exceeds ~32K — simplify or split
- **Text cut off**: Increase SVG width/height or use viewBox
- **Performance**: Reduce complexity in large datasets; avoid per-row filters
