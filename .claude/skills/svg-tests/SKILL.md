---
name: svg-tests
description: >
  Run or update interaction tests for SVG visuals in the Power BI SVG Creator app.
  Use this skill when the user wants to test SVG visual controls, check that sliders
  and color pickers work correctly, verify visual output behavior, add tests for a
  new visual, or debug a failing test.
  Trigger when the user mentions: "run tests", "test the visuals", "check SVG output",
  "test interactions", "test sliders", "test controls", "verify visual", "failing test",
  "add test", "test coverage", "тест", "запустити тести", "перевірити візуали".
---

# SVG Visual Interaction Tests

Tests live in `tests/svg-interactions.test.html` — open directly in a browser, no build step.

## How the tests work

The test file loads `index.html` in a hidden `<iframe>` and calls `generateSVG(vId, controls)`
directly from the parent frame via `iframe.contentWindow`. Tests inspect the returned SVG string
for expected attributes, colors, text content, and structural elements.

### Test runner API

```js
suite('visual_id')           // starts a new test group
test('description', fn)      // registers one test; fn throws on failure
assert(bool, msg)            // throws if bool is falsy
has(svg, string, msg)        // throws if svg does not contain string
hasNot(svg, string, msg)     // throws if svg contains string
```

### Helper — `c(overrides)`
Returns a complete `controls` object with sensible defaults, merged with `overrides`:
```js
c({ pct: 80, colorGood: '#00ff88' })
// → { value:750000, target:1000000, pct:80, colorGood:'#00ff88', ... }
```

### Helpers — `svg(vId, overrides)` / `svgDark(vId, overrides)`
Call `generateSVG` with `darkBg = false` or `true` and `currentLang = 'en'`.

---

## What each test covers

Every visual has its own `suite()`. Tests follow this pattern:

| Category | What is tested |
|---|---|
| **Text content** | formatted values (750K, 2.0M), percentages, labels, status words |
| **Color logic** | correct `colorGood` / `colorWarn` / `colorBad` applied at thresholds |
| **Slider → geometry** | width/height/radius/dashoffset/dasharray values change with control input |
| **Dark background** | `#1e1e2e` / `#2a2a3e` fills appear when `darkBg = true` |
| **Structural elements** | expected `<path>`, `<circle>`, `<rect>`, `<line>` counts |
| **Edge cases** | pct=0, pct=100, rating=0, rating=5 produce correct output |

---

## Adding a test for a new visual

1. Add a `suite('new_visual_id')` block in `tests/svg-interactions.test.html`
   after the last suite in the appropriate category section.

2. Follow the existing pattern — one `test()` per behavior:
   ```js
   suite('my_new_visual');
   test('shows pct in text', () =>
     has(svg('my_new_visual', { pct: 65 }), '65%'));
   test('uses colorGood at pct >= 80', () =>
     has(svg('my_new_visual', { pct: 80, colorGood: '#00ff88' }), '#00ff88'));
   test('rect width grows with pct', () => {
     const w = s => parseFloat([...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 260 && v > 1).at(-1) || '0');
     assert(w(svg('my_new_visual', { pct: 80 })) > w(svg('my_new_visual', { pct: 20 })),
       'pct=80 should be wider than pct=20');
   });
   ```

3. Register the visual in `index.html`:
   - Add its id to `categories` array
   - Add name strings to both `i18n.uk.visuals` and `i18n.en.visuals`
   - Add a `case` in `generateSVG()`
   - Add relevant controls in `renderControls()`

---

## Running the tests

Open `tests/svg-interactions.test.html` in a browser.
Results appear immediately: ✓ green pass / ✗ red fail with the error message.
The summary line shows `N / total passed`.

No server required — the `<iframe src="../index.html">` works from the local filesystem
in Chrome/Edge. In Firefox use a local server (`npx serve .` or VS Code Live Server).

---

## Current visual coverage

| Category | Visuals | Suites |
|---|---|---|
| KPI Cards | kpi_basic, kpi_comparison, kpi_trend_arrow, kpi_mini_chart, kpi_dual | 5 |
| Gauges | gauge_circle, gauge_semi, gauge_speedometer, gauge_donut, gauge_multi | 5 |
| Progress | progress_linear, progress_stepped, progress_gradient, progress_segmented, progress_battery | 5 |
| Charts | chart_bar_h, chart_bar_v, chart_bullet, chart_waterfall, chart_sparkline | 5 |
| Status | status_traffic, status_icon, status_badge, status_dot, status_flag | 5 |
| Rating | rating_stars, rating_hearts, rating_bars, rating_numeric, rating_emoji | 5 |
| Trends | trend_arrow, trend_sparkline, trend_delta, trend_flame | 4 |
| Advanced | adv_thermometer, adv_funnel, adv_waffle, adv_pictogram, adv_radial_bar | 5 |
| **Total** | **39 visuals** | **39 suites** |

---

## Threshold reference

Used across status/gauge/progress/rating visuals:

| Visual family | Good | Warn | Bad |
|---|---|---|---|
| gauge_, progress_ | pct >= 80 | pct >= 50 | pct < 50 |
| status_, trend_ | pct >= 70 | pct >= 40 | pct < 40 |
| progress_battery | pct >= 60 | pct >= 25 | pct < 25 |
| rating_numeric | rating >= 4 | rating >= 2.5 | rating < 2.5 |
| trend_flame | pct >= 80 → #ef4444 | pct >= 50 → color1 | pct < 50 → #64748b |
| adv_thermometer | pct >= 80 → colorBad | pct >= 50 → colorWarn | pct < 50 → colorGood |
