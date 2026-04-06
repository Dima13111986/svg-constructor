// Node.js test runner for SVG visual interactions
'use strict';

const fs = require('fs');
const path = require('path');

// ── Load generateSVG from index.html ──────────────────────
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if (!match) { console.error('No <script> block found'); process.exit(1); }

const wrapper = `
const document = { getElementById: () => ({ innerHTML:'', textContent:'', value:'', classList:{ toggle:()=>{}, add:()=>{}, remove:()=>{} } }) };
const navigator = { clipboard: { writeText: ()=>Promise.resolve() } };
function renderSidebar(){}
function renderAll(){}
function renderControls(){}
function renderPreview(){}
function generateDAX(){}
function closeSidebar(){}
${match[1]}
module.exports = {
  generateSVG,
  setDarkBg: v => { darkBg = v; },
  setLang:   v => { currentLang = v; }
};
`;
fs.writeFileSync(path.join(__dirname, '_runner_temp.js'), wrapper);
const mod = require('./_runner_temp');
const generateSVG = mod.generateSVG;

// ── Runner ───────────────────────────────────────────────
const suites = [];
let cur = null;
function suite(name) { cur = { name, tests: [] }; suites.push(cur); }
function test(name, fn) {
  try { fn(); cur.tests.push({ name, ok: true }); }
  catch (e) { cur.tests.push({ name, ok: false, err: e.message }); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }
function has(svg, str, msg) { if (!svg.includes(str)) throw new Error(msg || `SVG missing: "${str}"`); }
function hasNot(svg, str, msg) { if (svg.includes(str)) throw new Error(msg || `SVG should NOT contain: "${str}"`); }

// ── Helpers ───────────────────────────────────────────────
function c(o) {
  return Object.assign({
    value:750000, target:1000000, pct:72, label:'Test',
    color1:'#4f6ef7', color2:'#e2e8f0',
    colorGood:'#34d399', colorWarn:'#fbbf24', colorBad:'#f87171',
    textColor:'#1e293b', min:0, max:100,
    thickness:12, radius:60, count:5, rating:3.5
  }, o);
}
function svg(vId, o)     { mod.setDarkBg(false); mod.setLang('en'); return generateSVG(vId, c(o)); }
function svgDark(vId, o) { mod.setDarkBg(true);  mod.setLang('en'); const s = generateSVG(vId, c(o)); mod.setDarkBg(false); return s; }

// ══════════════════════════════════════════════════════════
//  KPI CARDS
// ══════════════════════════════════════════════════════════
suite('kpi_basic');
test('formats 750000 as 750K', () => has(svg('kpi_basic'), '750K'));
test('formats 2000000 as 2.0M', () => has(svg('kpi_basic', {value:2000000}), '2.0M'));
test('formats target 1000000 as 1.0M', () => has(svg('kpi_basic', {target:1000000}), '1.0M'));
test('colorGood when achievement >= 100%', () => has(svg('kpi_basic', {value:1000000, target:1000000, colorGood:'#aabbcc'}), '#aabbcc'));
test('yellow (#fbbf24) at 70-99%', () => has(svg('kpi_basic', {value:800000, target:1000000}), '#fbbf24'));
test('colorBad below 70%', () => has(svg('kpi_basic', {value:500000, target:1000000, colorBad:'#ff0011'}), '#ff0011'));
test('progress bar wider at 75% vs 25%', () => {
  // Use values that produce clearly different fill widths (both below track width 240)
  const w = s => Math.min(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 240 && v > 10));
  assert(w(svg('kpi_basic', {value:750000, target:1000000})) > w(svg('kpi_basic', {value:250000, target:1000000})), 'bar width');
});
test('dark bg uses #1e1e2e', () => has(svgDark('kpi_basic'), '#1e1e2e'));
test('light bg uses #ffffff', () => has(svg('kpi_basic'), '#ffffff'));

suite('kpi_comparison');
test('formats 750K', () => has(svg('kpi_comparison'), '750K'));
test('positive pct shows ▲', () => has(svg('kpi_comparison', {pct:12}), '▲'));
test('negative pct shows ▼', () => has(svg('kpi_comparison', {pct:-10}), '▼'));
test('colorGood for positive', () => has(svg('kpi_comparison', {pct:10, colorGood:'#00ff77'}), '#00ff77'));
test('colorBad for negative', () => has(svg('kpi_comparison', {pct:-5, colorBad:'#cc0011'}), '#cc0011'));
test('dark bg uses #1e1e2e', () => has(svgDark('kpi_comparison'), '#1e1e2e'));

suite('kpi_trend_arrow');
test('shows 75% achievement', () => has(svg('kpi_trend_arrow', {value:750000, target:1000000}), '75%'));
test('up arrow at >= 100%', () => has(svg('kpi_trend_arrow', {value:1000000, target:1000000}), 'M220 70 L235 50 L250 70'));
test('flat arrow at 70-99%', () => has(svg('kpi_trend_arrow', {value:800000, target:1000000}), 'M220 60 L250 60'));
test('down arrow below 70%', () => has(svg('kpi_trend_arrow', {value:500000, target:1000000}), 'M220 50 L235 70 L250 50'));
test('colorGood at >= 100%', () => has(svg('kpi_trend_arrow', {value:1000000, target:1000000, colorGood:'#00ee99'}), '#00ee99'));
test('colorBad below 70%', () => has(svg('kpi_trend_arrow', {value:500000, target:1000000, colorBad:'#ee0022'}), '#ee0022'));

suite('kpi_mini_chart');
test('formats 750K', () => has(svg('kpi_mini_chart'), '750K'));
test('colorGood at pct >= 70', () => has(svg('kpi_mini_chart', {pct:70, colorGood:'#00cc88'}), '#00cc88'));
test('colorBad at pct < 40', () => has(svg('kpi_mini_chart', {pct:30, colorBad:'#ee0000'}), '#ee0000'));
test('yellow (#fbbf24) at 40-69', () => has(svg('kpi_mini_chart', {pct:55}), '#fbbf24'));
test('progress bar wider at pct=70 vs pct=30', () => {
  // Filter out the full track width (240) — compare only fill rects
  const w = s => Math.min(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 240 && v > 5));
  assert(w(svg('kpi_mini_chart', {pct:70})) > w(svg('kpi_mini_chart', {pct:30})), 'bar width');
});

suite('kpi_dual');
test('formats value 750K', () => has(svg('kpi_dual'), '750K'));
test('shows 75% achievement', () => has(svg('kpi_dual', {value:750000, target:1000000}), '75%'));
test('dark bg uses #252545', () => has(svgDark('kpi_dual'), '#252545'));

// ══════════════════════════════════════════════════════════
//  GAUGES
// ══════════════════════════════════════════════════════════
suite('gauge_circle');
test('shows pct in text', () => has(svg('gauge_circle', {pct:68}), '68%'));
test('colorGood at >= 80', () => has(svg('gauge_circle', {pct:80, colorGood:'#aaccbb'}), '#aaccbb'));
test('colorWarn at 50-79', () => has(svg('gauge_circle', {pct:65, colorWarn:'#ffaa00'}), '#ffaa00'));
test('colorBad below 50', () => has(svg('gauge_circle', {pct:30, colorBad:'#ff4444'}), '#ff4444'));
test('dashoffset smaller at pct=80 vs pct=20', () => {
  const off = s => parseFloat(s.match(/stroke-dashoffset='([\d.]+)'/)?.[1] || '0');
  assert(off(svg('gauge_circle', {pct:80, radius:60})) < off(svg('gauge_circle', {pct:20, radius:60})), 'dashoffset');
});
test('radius slider changes circle r', () => has(svg('gauge_circle', {radius:40}), "r='40'"));
test('thickness slider changes stroke-width', () => has(svg('gauge_circle', {thickness:20}), "stroke-width='20'"));
test('dark track #2a2a3e', () => has(svgDark('gauge_circle'), '#2a2a3e'));

suite('gauge_semi');
test('shows pct', () => has(svg('gauge_semi', {pct:55}), '55%'));
test('colorGood at >= 80', () => has(svg('gauge_semi', {pct:80, colorGood:'#00eeff'}), '#00eeff'));
test('colorWarn at 50-79', () => has(svg('gauge_semi', {pct:65, colorWarn:'#ee9900'}), '#ee9900'));
test('colorBad below 50', () => has(svg('gauge_semi', {pct:20, colorBad:'#ff2200'}), '#ff2200'));
test('dashoffset smaller at pct=80 vs pct=20', () => {
  const off = s => parseFloat(s.match(/stroke-dashoffset='([\d.]+)'/)?.[1] || '0');
  assert(off(svg('gauge_semi', {pct:80})) < off(svg('gauge_semi', {pct:20})), 'dashoffset');
});
test('thickness changes stroke-width', () => has(svg('gauge_semi', {thickness:18}), "stroke-width='18'"));

suite('gauge_speedometer');
test('shows pct', () => has(svg('gauge_speedometer', {pct:65}), '65%'));
test('colorGood at >= 80', () => has(svg('gauge_speedometer', {pct:80, colorGood:'#aaffbb'}), '#aaffbb'));
test('colorWarn at 50-79', () => has(svg('gauge_speedometer', {pct:60, colorWarn:'#ffcc00'}), '#ffcc00'));
test('colorBad below 50', () => has(svg('gauge_speedometer', {pct:30, colorBad:'#ff3333'}), '#ff3333'));
test('needle y position changes with pct', () => {
  // Match the needle line: stroke-width='3' (ticks use 1.5)
  const ny = s => s.match(/x2='[\d.\-]+' y2='([\d.\-]+)' stroke='[^']+' stroke-width='3'/)?.[1];
  assert(ny(svg('gauge_speedometer', {pct:10})) !== ny(svg('gauge_speedometer', {pct:90})), 'needle y');
});
test('tick marks rendered', () => has(svg('gauge_speedometer'), '<line'));

suite('gauge_donut');
test('shows pct', () => has(svg('gauge_donut', {pct:70}), '70%'));
test('shows remaining (30%)', () => has(svg('gauge_donut', {pct:70}), '30%'));
test('colorGood at >= 80', () => has(svg('gauge_donut', {pct:80, colorGood:'#33ddaa'}), '#33ddaa'));
test('colorBad below 50', () => has(svg('gauge_donut', {pct:30, colorBad:'#ff2255'}), '#ff2255'));
test('arc length grows with pct', () => {
  const arc = s => parseFloat(s.match(/stroke-dasharray='([\d.]+)/)?.[1] || '0');
  assert(arc(svg('gauge_donut', {pct:80})) > arc(svg('gauge_donut', {pct:20})), 'arc length');
});

suite('gauge_multi');
test('shows pct in center text', () => has(svg('gauge_multi', {pct:65}), '65%'));
test('color1 on outer ring', () => has(svg('gauge_multi', {pct:65, color1:'#aabbff'}), '#aabbff'));
test('renders >= 3 colored arcs', () => {
  const n = (svg('gauge_multi', {pct:60}).match(/stroke-dasharray/g) || []).length;
  assert(n >= 3, `arcs: ${n}`);
});
test('inner arcs have smaller dasharray than outer', () => {
  const arcs = s => [...s.matchAll(/stroke-dasharray='([\d.]+)/g)].map(m => +m[1]);
  const a = arcs(svg('gauge_multi', {pct:60}));
  assert(a.length >= 3 && a[0] !== a[1], 'arc lengths should differ');
});

// ══════════════════════════════════════════════════════════
//  PROGRESS BARS
// ══════════════════════════════════════════════════════════
suite('progress_linear');
test('shows pct', () => has(svg('progress_linear', {pct:65}), '65%'));
test('colorGood at >= 80', () => has(svg('progress_linear', {pct:80, colorGood:'#33cc99'}), '#33cc99'));
test('color1 at 50-79', () => has(svg('progress_linear', {pct:65, color1:'#aa22ff'}), '#aa22ff'));
test('colorBad below 50', () => has(svg('progress_linear', {pct:20, colorBad:'#ff5555'}), '#ff5555'));
test('fill wider at pct=80 vs pct=20', () => {
  const w = s => Math.max(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 260 && v > 1));
  assert(w(svg('progress_linear', {pct:80})) > w(svg('progress_linear', {pct:20})), 'fill width');
});
test('thickness changes bar height', () => has(svg('progress_linear', {thickness:20}), "height='20'"));
test('dark track #2a2a3e', () => has(svgDark('progress_linear'), '#2a2a3e'));

suite('progress_stepped');
test('shows 4/5 at pct=65', () => has(svg('progress_stepped', {pct:65}), '4/5'));
test('shows 0/5 at pct=0', () => has(svg('progress_stepped', {pct:0}), '0/5'));
test('shows 5/5 at pct=100', () => has(svg('progress_stepped', {pct:100}), '5/5'));
test('colorGood for active bars at pct >= 80', () => has(svg('progress_stepped', {pct:80, colorGood:'#00ff88'}), '#00ff88'));
test('color1 for active bars at pct < 80', () => has(svg('progress_stepped', {pct:65, color1:'#ff00ff'}), '#ff00ff'));
test('dark inactive bars use #2a2a3e', () => has(svgDark('progress_stepped'), '#2a2a3e'));

suite('progress_gradient');
test('shows pct', () => has(svg('progress_gradient', {pct:75}), '75%'));
test('colorBad in gradient stops', () => has(svg('progress_gradient', {colorBad:'#ff1100'}), '#ff1100'));
test('colorWarn in gradient stops', () => has(svg('progress_gradient', {colorWarn:'#ffee00'}), '#ffee00'));
test('colorGood in gradient stops', () => has(svg('progress_gradient', {colorGood:'#00ff77'}), '#00ff77'));
test('clip rect wider at pct=80 vs pct=20', () => {
  const clip = s => parseFloat((s.match(/<clipPath[^>]*>.*?width='([\d.]+)'/s) || [])[1] || '0');
  assert(clip(svg('progress_gradient', {pct:80})) > clip(svg('progress_gradient', {pct:20})), 'clip width');
});

suite('progress_segmented');
test('shows pct', () => has(svg('progress_segmented', {pct:60}), '60%'));
test('color1 in active segments', () => has(svg('progress_segmented', {pct:60, color1:'#8800ff'}), '#8800ff'));
test('no color1 at pct=0', () => hasNot(svg('progress_segmented', {pct:0, color1:'#8800ff'}), '#8800ff'));
test('all 10 segments filled at pct=100', () => {
  const s = svg('progress_segmented', {pct:100, color1:'#8800ff'});
  const n = (s.match(/#8800ff/g) || []).length;
  assert(n >= 10, `segments: ${n}`);
});
test('thickness changes segment height', () => has(svg('progress_segmented', {thickness:24}), "height='24'"));

suite('progress_battery');
test('shows pct', () => has(svg('progress_battery', {pct:75}), '75%'));
test('colorGood at >= 60', () => has(svg('progress_battery', {pct:60, colorGood:'#00ff88'}), '#00ff88'));
test('colorWarn at 25-59', () => has(svg('progress_battery', {pct:40, colorWarn:'#ffcc00'}), '#ffcc00'));
test('colorBad below 25', () => has(svg('progress_battery', {pct:10, colorBad:'#ff3333'}), '#ff3333'));
test('fill rect wider at pct=80 vs pct=10', () => {
  const w = s => Math.max(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 80 && v > 0));
  assert(w(svg('progress_battery', {pct:80})) > w(svg('progress_battery', {pct:10})), 'fill width');
});

// ══════════════════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════════════════
suite('chart_bar_h');
test('shows $750K', () => has(svg('chart_bar_h'), '$750K'));
test('color1 fills the bar', () => has(svg('chart_bar_h', {color1:'#00aaff'}), '#00aaff'));
test('fill bar wider at higher ratio', () => {
  const w = s => Math.max(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v < 200 && v > 0));
  assert(w(svg('chart_bar_h', {value:800000, target:1000000})) > w(svg('chart_bar_h', {value:200000, target:1000000})), 'bar');
});
test('dark track #2a2a3e', () => has(svgDark('chart_bar_h'), '#2a2a3e'));

suite('chart_bar_v');
test('color1 on active center bar', () => has(svg('chart_bar_v', {color1:'#ffaa00'}), '#ffaa00'));
test('renders >= 5 bar rects', () => {
  const n = (svg('chart_bar_v').match(/<rect/g) || []).length;
  assert(n >= 5, `rects: ${n}`);
});
test('different pct changes SVG', () => assert(svg('chart_bar_v', {pct:10}) !== svg('chart_bar_v', {pct:90}), 'differs'));

suite('chart_bullet');
test('shows $750K value', () => has(svg('chart_bullet'), '$750K'));
test('color1 fills actual bar', () => has(svg('chart_bullet', {color1:'#4422ff'}), '#4422ff'));
test('actual bar wider at higher value', () => {
  const w = s => Math.max(...[...s.matchAll(/width='([\d.]+)'/g)].map(m => +m[1]).filter(v => v > 10 && v < 240));
  assert(w(svg('chart_bullet', {value:900000, target:1000000})) > w(svg('chart_bullet', {value:200000, target:1000000})), 'width');
});

suite('chart_waterfall');
test('colorGood for positive bars', () => has(svg('chart_waterfall', {colorGood:'#00ccff'}), '#00ccff'));
test('colorBad for negative bars', () => has(svg('chart_waterfall', {colorBad:'#ff2233'}), '#ff2233'));
test('>= 5 rects rendered', () => assert((svg('chart_waterfall').match(/<rect/g) || []).length >= 5, 'rects'));
test('has + and - labels', () => { has(svg('chart_waterfall'), '+'); has(svg('chart_waterfall'), '-'); });

suite('chart_sparkline');
test('color1 for line stroke', () => has(svg('chart_sparkline', {color1:'#ff00aa'}), '#ff00aa'));
test('has path element', () => has(svg('chart_sparkline'), "<path d='"));
test('has endpoint circle', () => has(svg('chart_sparkline'), '<circle'));
test('endpoint Y changes with pct', () => {
  const cy = s => s.match(/cy='([\d.]+)' r='4'/)?.[1];
  assert(cy(svg('chart_sparkline', {pct:10})) !== cy(svg('chart_sparkline', {pct:90})), 'cy');
});
test('shows month labels', () => has(svg('chart_sparkline'), 'Mar'));

// ══════════════════════════════════════════════════════════
//  STATUS INDICATORS
// ══════════════════════════════════════════════════════════
suite('status_traffic');
test('colorGood lit at pct >= 70', () => has(svg('status_traffic', {pct:70, colorGood:'#00ff00'}), '#00ff00'));
test('colorWarn lit at 40-69', () => has(svg('status_traffic', {pct:50, colorWarn:'#ffff00'}), '#ffff00'));
test('colorBad lit below 40', () => has(svg('status_traffic', {pct:20, colorBad:'#ff0000'}), '#ff0000'));
test('renders >= 3 circles', () => assert((svg('status_traffic').match(/<circle/g) || []).length >= 3, 'circles'));
test('active light has opacity=1', () => has(svg('status_traffic', {pct:70, colorGood:'#00ff00'}), "fill='#00ff00' opacity='1'"));

suite('status_icon');
test('colorGood at pct >= 70', () => has(svg('status_icon', {pct:70, colorGood:'#22dd88'}), '#22dd88'));
test('colorWarn at 40-69', () => has(svg('status_icon', {pct:50, colorWarn:'#ddaa00'}), '#ddaa00'));
test('colorBad below 40', () => has(svg('status_icon', {pct:20, colorBad:'#dd2222'}), '#dd2222'));
test('warn state shows !', () => has(svg('status_icon', {pct:50}), '!'));
test('good state shows checkmark (M12 22)', () => has(svg('status_icon', {pct:70}), 'M12 22'));
test('bad state shows X (M14 14 L36 36)', () => has(svg('status_icon', {pct:20}), 'M14 14 L36 36'));

suite('status_badge');
test('shows "Good" at pct >= 70', () => has(svg('status_badge', {pct:70}), 'Good'));
test('shows "Warning" at 40-69', () => has(svg('status_badge', {pct:50}), 'Warning'));
test('shows "Bad" below 40', () => has(svg('status_badge', {pct:20}), 'Bad'));
test('uses colorGood at >= 70', () => has(svg('status_badge', {pct:70, colorGood:'#33cc88'}), '#33cc88'));
test('uses colorBad below 40', () => has(svg('status_badge', {pct:20, colorBad:'#cc2200'}), '#cc2200'));

suite('status_dot');
test('colorGood at pct >= 70', () => has(svg('status_dot', {pct:75, colorGood:'#00ffbb'}), '#00ffbb'));
test('colorWarn at 40-69', () => has(svg('status_dot', {pct:50, colorWarn:'#ffdd00'}), '#ffdd00'));
test('colorBad below 40', () => has(svg('status_dot', {pct:15, colorBad:'#ff4400'}), '#ff4400'));
test('renders 2 circles', () => assert((svg('status_dot').match(/<circle/g) || []).length >= 2, 'circles'));

suite('status_flag');
test('colorGood at pct >= 70', () => has(svg('status_flag', {pct:70, colorGood:'#00ee99'}), '#00ee99'));
test('colorWarn at 40-69', () => has(svg('status_flag', {pct:50, colorWarn:'#eebb00'}), '#eebb00'));
test('colorBad below 40', () => has(svg('status_flag', {pct:20, colorBad:'#ee2200'}), '#ee2200'));
test('flag polygon path present', () => has(svg('status_flag'), "M8 5 L35 13 L8 25 Z"));

// ══════════════════════════════════════════════════════════
//  RATING VISUALS
// ══════════════════════════════════════════════════════════
suite('rating_stars');
test('filled stars use color1', () => has(svg('rating_stars', {rating:3, color1:'#ffcc00', color2:'#888888'}), '#ffcc00'));
test('empty stars use color2', () => has(svg('rating_stars', {rating:3, color1:'#ffcc00', color2:'#888888'}), '#888888'));
test('more stars = wider SVG width', () => {
  const w = s => parseInt(s.match(/width='(\d+)'/)?.[1] || '0');
  assert(w(svg('rating_stars', {count:3})) < w(svg('rating_stars', {count:7})), 'width');
});
test('rating=5 count=5 → no empty star color', () => hasNot(svg('rating_stars', {rating:5, count:5, color1:'#ffcc00', color2:'#111111'}), '#111111'));
test('rating=0 count=5 → no filled star color', () => hasNot(svg('rating_stars', {rating:0, count:5, color1:'#ffcc00', color2:'#111111'}), '#ffcc00'));

suite('rating_hearts');
test('filled hearts use color1', () => has(svg('rating_hearts', {rating:3, color1:'#ff6688', color2:'#cccccc'}), '#ff6688'));
test('empty hearts use color2', () => has(svg('rating_hearts', {rating:3, color1:'#ff6688', color2:'#cccccc'}), '#cccccc'));
test('rating=0 → no filled heart color', () => hasNot(svg('rating_hearts', {rating:0, color1:'#ff6688', color2:'#cccccc'}), '#ff6688'));
test('count changes path count', () => {
  const p = s => (s.match(/<path/g) || []).length;
  assert(p(svg('rating_hearts', {count:3})) < p(svg('rating_hearts', {count:7})), 'paths');
});

suite('rating_bars');
test('filled bars use color1', () => has(svg('rating_bars', {rating:3, color1:'#aa00ff', color2:'#cccccc'}), '#aa00ff'));
test('empty bars use color2', () => has(svg('rating_bars', {rating:3, color1:'#aa00ff', color2:'#cccccc'}), '#cccccc'));
test('rating=0 → no filled bar color', () => hasNot(svg('rating_bars', {rating:0, color1:'#aa00ff', color2:'#cccccc'}), '#aa00ff'));
test('filled bar has height=25', () => has(svg('rating_bars', {rating:3}), "height='25'"));
test('empty bar has height=18', () => has(svg('rating_bars', {rating:3}), "height='18'"));

suite('rating_numeric');
test('shows rating value 4.5', () => has(svg('rating_numeric', {rating:4.5}), '4.5'));
test('shows /count', () => has(svg('rating_numeric', {rating:3, count:5}), '/5'));
test('colorGood at rating >= 4', () => has(svg('rating_numeric', {rating:4, colorGood:'#9900ff'}), '#9900ff'));
test('colorWarn at 2.5-3.9', () => has(svg('rating_numeric', {rating:3, colorWarn:'#cc9900'}), '#cc9900'));
test('colorBad below 2.5', () => has(svg('rating_numeric', {rating:2, colorBad:'#cc2200'}), '#cc2200'));

suite('rating_emoji');
test('😊 at rating >= 4', () => has(svg('rating_emoji', {rating:4}), '😊'));
test('😐 at rating 3-3.9', () => has(svg('rating_emoji', {rating:3}), '😐'));
test('😟 at rating 2-2.9', () => has(svg('rating_emoji', {rating:2}), '😟'));
test('😢 below rating 2', () => has(svg('rating_emoji', {rating:1}), '😢'));

// ══════════════════════════════════════════════════════════
//  TRENDS
// ══════════════════════════════════════════════════════════
suite('trend_arrow');
test('shows +10%', () => has(svg('trend_arrow', {pct:10}), '+10%'));
test('shows -10%', () => has(svg('trend_arrow', {pct:-10}), '-10%'));
test('colorGood for positive pct', () => has(svg('trend_arrow', {pct:10, colorGood:'#00ee77'}), '#00ee77'));
test('colorBad for negative pct', () => has(svg('trend_arrow', {pct:-10, colorBad:'#ee2222'}), '#ee2222'));
test('up arrow path for positive', () => has(svg('trend_arrow', {pct:5}), 'M25 35 L25 12'));
test('down arrow path for negative', () => has(svg('trend_arrow', {pct:-5}), 'M25 10 L25 33'));

suite('trend_sparkline');
test('color1 used for line stroke', () => has(svg('trend_sparkline', {color1:'#ff00cc'}), '#ff00cc'));
test('color1 used for area fill', () => {
  const s = svg('trend_sparkline', {color1:'#ff00cc'});
  // area path fill uses color1
  assert((s.match(/#ff00cc/g) || []).length >= 2, 'color1 should appear multiple times (line + area + dot)');
});
test('has path element', () => has(svg('trend_sparkline'), "<path d='"));
test('▲ badge when pct(90) > prev point(55)', () => has(svg('trend_sparkline', {pct:90}), '▲'));
test('▼ badge when pct(10) < prev point(55)', () => has(svg('trend_sparkline', {pct:10}), '▼'));
test('colorGood in badge when going up', () => has(svg('trend_sparkline', {pct:90, colorGood:'#00ee77'}), '#00ee77'));
test('colorBad in badge when going down', () => has(svg('trend_sparkline', {pct:10, colorBad:'#ee2222'}), '#ee2222'));
test('endpoint cy changes with pct', () => {
  const cy = s => s.match(/cy='([\d.]+)' r='3\.5'/)?.[1];
  assert(cy(svg('trend_sparkline', {pct:10})) !== cy(svg('trend_sparkline', {pct:90})), 'cy');
});

suite('trend_delta');
test('shows ▲ for positive pct', () => has(svg('trend_delta', {pct:25}), '▲'));
test('shows ▼ for negative pct', () => has(svg('trend_delta', {pct:-10}), '▼'));
test('shows absolute value of pct', () => has(svg('trend_delta', {pct:-15}), '15%'));
test('colorGood for positive', () => has(svg('trend_delta', {pct:10, colorGood:'#00ff88'}), '#00ff88'));
test('colorBad for negative', () => has(svg('trend_delta', {pct:-5, colorBad:'#ff4444'}), '#ff4444'));

suite('trend_flame');
test('shows pct in text', () => has(svg('trend_flame', {pct:85}), '85%'));
test('#ef4444 (hot red) at pct >= 80', () => has(svg('trend_flame', {pct:80}), '#ef4444'));
test('color1 at 50-79', () => has(svg('trend_flame', {pct:60, color1:'#ff8800'}), '#ff8800'));
test('#64748b (gray) below 50', () => has(svg('trend_flame', {pct:30}), '#64748b'));
test('flame shape changes with pct', () => assert(svg('trend_flame', {pct:10}) !== svg('trend_flame', {pct:90}), 'differs'));

// ══════════════════════════════════════════════════════════
//  ADVANCED
// ══════════════════════════════════════════════════════════
suite('adv_thermometer');
test('shows pct as degrees (°)', () => has(svg('adv_thermometer', {pct:60}), '60°'));
test('colorBad (hot) at pct >= 80', () => has(svg('adv_thermometer', {pct:80, colorBad:'#ff1100'}), '#ff1100'));
test('colorWarn at 50-79', () => has(svg('adv_thermometer', {pct:60, colorWarn:'#ffdd00'}), '#ffdd00'));
test('colorGood (cool) below 50', () => has(svg('adv_thermometer', {pct:30, colorGood:'#00ffbb'}), '#00ffbb'));
test('fill height changes with pct', () => assert(svg('adv_thermometer', {pct:80}) !== svg('adv_thermometer', {pct:20}), 'differs'));
test('tick marks rendered', () => has(svg('adv_thermometer'), '<line'));

suite('adv_funnel');
test('shows 100%, 55%, 20% stages', () => { has(svg('adv_funnel'), '100%'); has(svg('adv_funnel'), '55%'); has(svg('adv_funnel'), '20%'); });
test('color1 on stage 1', () => has(svg('adv_funnel', {color1:'#8833ff'}), '#8833ff'));
test('colorGood on stage 2', () => has(svg('adv_funnel', {colorGood:'#00ffaa'}), '#00ffaa'));
test('colorWarn on stage 3', () => has(svg('adv_funnel', {colorWarn:'#ffcc00'}), '#ffcc00'));
test('colorBad on stage 5', () => has(svg('adv_funnel', {colorBad:'#ff2211'}), '#ff2211'));
test('>= 5 stage rects', () => assert((svg('adv_funnel').match(/<rect/g) || []).length >= 5, 'rects'));

suite('adv_waffle');
test('shows pct in text', () => has(svg('adv_waffle', {pct:73}), '73%'));
test('color1 for filled cells', () => has(svg('adv_waffle', {pct:50, color1:'#2288ff'}), '#2288ff'));
test('color2 for empty cells', () => has(svg('adv_waffle', {pct:50, color2:'#eeeeee'}), '#eeeeee'));
test('no color1 at pct=0', () => hasNot(svg('adv_waffle', {pct:0, color1:'#2288ff'}), '#2288ff'));
test('no color2 at pct=100', () => hasNot(svg('adv_waffle', {pct:100, color1:'#2288ff', color2:'#eeeeee'}), '#eeeeee'));
test('dark bg uses #2a2a3e for empty cells', () => has(svgDark('adv_waffle', {pct:50}), '#2a2a3e'));

suite('adv_pictogram');
test('shows pct in text', () => has(svg('adv_pictogram', {pct:60}), '60%'));
test('colorGood for filled figures', () => has(svg('adv_pictogram', {pct:50, colorGood:'#aa22ff'}), '#aa22ff'));
test('color2 for empty figures', () => has(svg('adv_pictogram', {pct:50, color2:'#cccccc'}), '#cccccc'));
test('no colorGood at pct=0', () => hasNot(svg('adv_pictogram', {pct:0, colorGood:'#aa22ff'}), '#aa22ff'));
test('no color2 at pct=100', () => hasNot(svg('adv_pictogram', {pct:100, colorGood:'#aa22ff', color2:'#cccccc'}), '#cccccc'));
test('different pct produces different SVG', () => assert(svg('adv_pictogram', {pct:10}) !== svg('adv_pictogram', {pct:90}), 'differs'));

suite('adv_radial_bar');
test('shows pct in legend', () => has(svg('adv_radial_bar', {pct:70}), '70%'));
test('color1 on outer arc stroke', () => has(svg('adv_radial_bar', {color1:'#ff88aa'}), '#ff88aa'));
test('colorGood on Q2 arc', () => has(svg('adv_radial_bar', {colorGood:'#00ffcc'}), '#00ffcc'));
test('renders >= 4 colored arcs', () => assert((svg('adv_radial_bar').match(/stroke-dasharray/g) || []).length >= 4, 'arcs'));
test('outer arc dasharray grows with pct', () => {
  const arc = s => parseFloat(s.match(/stroke-dasharray='([\d.]+)/)?.[1] || '0');
  assert(arc(svg('adv_radial_bar', {pct:80})) > arc(svg('adv_radial_bar', {pct:20})), 'arc');
});

// ── Print results ─────────────────────────────────────────
let total = 0, passed = 0;
const failures = [];
suites.forEach(s => s.tests.forEach(t => {
  total++;
  if (t.ok) passed++;
  else failures.push({ suite: s.name, test: t.name, err: t.err });
}));

const PASS = '\x1b[32m';
const FAIL = '\x1b[31m';
const DIM  = '\x1b[2m';
const BOLD = '\x1b[1m';
const RST  = '\x1b[0m';

console.log('');
suites.forEach(s => {
  const p = s.tests.filter(t => t.ok).length;
  const allPass = p === s.tests.length;
  console.log(`${allPass ? PASS : FAIL}${BOLD}${s.name}${RST}${DIM} (${p}/${s.tests.length})${RST}`);
  s.tests.forEach(t => {
    if (!t.ok) console.log(`  ${FAIL}✗ ${t.name}${RST}\n    ${DIM}${t.err}${RST}`);
  });
});

console.log('');
const line = '═'.repeat(46);
console.log(`${BOLD}${line}${RST}`);
const color = failures.length ? FAIL : PASS;
console.log(`${color}${BOLD}  ${passed}/${total} passed${failures.length ? `   (${failures.length} failed)` : '  — all pass ✓'}${RST}`);
console.log(`${BOLD}${line}${RST}`);

process.exit(failures.length ? 1 : 0);
