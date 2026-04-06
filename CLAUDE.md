# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Power BI SVG Creator** — a single-file, no-build-step web app (`index.html`) that lets users design SVG visuals for Power BI and instantly get the corresponding DAX measure code to embed the SVG as an Image URL in Power BI reports.

## Architecture

The entire application lives in one file: `index.html`. It has three logical sections:

1. **CSS** (lines ~8–530) — all styling inlined in `<style>`. Uses CSS custom properties defined in `:root`. Dark-themed UI with a fixed topbar, sidebar, and a 2×2 grid main layout (preview + controls on top, DAX output spanning the bottom).

2. **HTML structure** (lines ~530–570) — minimal markup. The sidebar, preview panel, controls panel, and DAX panel are rendered dynamically via JS.

3. **JavaScript** (lines ~570–end) — all logic in one `<script>` block:
   - **i18n** (`i18n` object, `t()`, `setLang()`) — Ukrainian/English string lookup
   - **Visual registry** (`categories` array + `getDefaults()`) — defines the 8 categories and 39 visual types, plus default control values per visual
   - **Sidebar** (`renderSidebar()`, `selectVisual()`) — dynamically builds the category/visual nav
   - **Controls** (`renderControls()`) — generates sliders and color pickers per visual type; calls `updateControl()` → `renderPreview()` + `generateDAX()` on every input
   - **SVG generator** (`generateSVG(vId, controls)`) — one large `switch` statement; each case returns a self-contained SVG string using the current control values and `darkBg` flag
   - **DAX generator** (`generateDAX()`) — produces Power BI DAX measure code; sparkline visuals get special date-table DAX; all others embed the static SVG string directly as `data:image/svg+xml;utf8,...`
   - **Render orchestration** (`renderAll()`, `renderPreview()`) — called on visual select and control change

## Key Conventions

- **SVG output**: all SVGs use `font-family='Segoe UI, sans-serif'` (Power BI default font). The `darkBg` toggle switches fill colors between `#ffffff`/`#1e1e2e` backgrounds.
- **Color logic**: `colorGood`/`colorWarn`/`colorBad` are used for conditional coloring thresholds (80%/50% by default for gauges/progress; 70%/40% for status/rating).
- **Control IDs**: slider and color inputs use string IDs matching `controls` object keys (`value`, `target`, `pct`, `color1`, `color2`, `colorGood`, `colorWarn`, `colorBad`, `textColor`, `min`, `max`, `thickness`, `radius`, `count`, `rating`). `updateControl(id, val)` writes directly to the `controls` object.
- **Adding a new visual**: (1) add its id to a category in `categories`, (2) add display name strings to both `i18n.uk.visuals` and `i18n.en.visuals`, (3) add a `case` in `generateSVG()`, (4) add relevant controls in `renderControls()` under the visual's id check.

## Development

No build step — open `index.html` directly in a browser. There are no dependencies, package managers, or test suites.
