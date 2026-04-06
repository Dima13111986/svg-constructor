# Rating Visuals

5 templates for displaying ratings and scores.

## Table of Contents
1. Stars — classic star rating with half-star support
2. Hearts — heart icons filled/empty
3. Rating Bars — vertical bars (filled = taller)
4. Numeric Rating — large number in colored box
5. Emoji Rating — emoji face based on score

## Common Parameters
- `_rating` — numeric value (0–5, supports 0.5 steps)
- `_count` — total items to show (3–10, default 5)
- `_color1` — active/filled color (default `#fbbf24` gold for stars)
- `_color2` — inactive color (default `#e2e8f0`)

---

## 1. Stars

Classic 5-pointed star rating. Supports half-stars.

Size: `width = 10 + count * 30`, `height='30'`

**Star path (centered at x_offset):**
```
x = 10 + i * 30
M{x+12} 5 L{x+15} 11 L{x+22} 12 L{x+17} 17 L{x+18} 24 L{x+12} 21 L{x+6} 24 L{x+7} 17 L{x+2} 12 L{x+9} 11 Z
```

**Fill logic:**
- `i < floor(rating)` → filled with `_color1`
- `i == floor(rating)` and rating has decimal → half-fill using clipPath
- else → filled with `_color2`

**Half-star technique:**
```xml
<clipPath id='halfN'>
  <rect x='X_OFFSET' y='0' width='14' height='30'/>
</clipPath>
<path d='STAR_PATH' fill='COLOR1' clip-path='url(#halfN)'/>
```

**DAX for stars:**
```dax
VAR _filled = FLOOR([Rating], 1)
VAR _hasHalf = [Rating] - _filled >= 0.5
```

Build each star conditionally using IF/SWITCH in the SVG string concatenation.

---

## 2. Hearts

Heart icons — filled or empty.

Size: `width = 10 + count * 28`, `height='28'`

**Heart path (at x_offset):**
```
x = 5 + i * 28
M{x+12} 22 C{x+4} 16 {x} 10 {x+4} 6 C{x+7} 3 {x+12} 6 {x+12} 8 C{x+12} 6 {x+17} 3 {x+20} 6 C{x+24} 10 {x+20} 16 {x+12} 22 Z
```

Filled if `i < floor(rating)`, otherwise muted color.

Half-heart support is possible but complex — typically hearts use full-step only.

---

## 3. Rating Bars

Vertical bars — filled bars are taller than empty ones.

Size: `width = 8 + count * 14 + 5`, `height='35'`

```
x_i = 8 + i * 14
Filled:  y=5,  height=25, width=10, rx=3
Empty:   y=12, height=18, width=10, rx=3
```

Filled bars are taller (start higher) = visual "active" signal.

---

## 4. Numeric Rating

Large number displayed inside a colored rounded rectangle.

Size: `width='110' height='50'`

```xml
<rect x='5' y='5' width='100' height='40' rx='8' fill='COLOR' opacity='0.12'/>
<text x='55' y='33' font-family='Segoe UI, sans-serif' font-size='22' fill='COLOR' text-anchor='middle' font-weight='700'>3.5</text>
<text x='82' y='26' font-family='Segoe UI, sans-serif' font-size='10' fill='#64748b'>/5</text>
```

**Color logic based on rating:**
- rating >= 4 → `#34d399`
- rating >= 2.5 → `#fbbf24`
- else → `#f87171`

---

## 5. Emoji Rating

Single emoji face based on rating value.

Size: `width='60' height='60'`

```xml
<text x='30' y='42' font-family='Segoe UI Emoji, sans-serif' font-size='36' text-anchor='middle'>EMOJI</text>
```

**Emoji mapping:**
- rating >= 4 → 😊
- rating >= 3 → 😐
- rating >= 2 → 😟
- else → 😢

**DAX note:** Emojis work in SVG text elements. Use `UNICHAR()` in DAX if direct emoji insertion causes issues:
```dax
VAR _emoji = SWITCH(TRUE(),
    _rating >= 4, UNICHAR(128522),  -- 😊
    _rating >= 3, UNICHAR(128528),  -- 😐
    _rating >= 2, UNICHAR(128543),  -- 😟
    UNICHAR(128546)                 -- 😢
)
```
