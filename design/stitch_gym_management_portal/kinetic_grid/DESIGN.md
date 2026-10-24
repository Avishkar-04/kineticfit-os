---
name: Kinetic Grid
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#191c21'
  surface-container: '#1d2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#32353b'
  on-surface: '#e1e2ea'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e1e2ea'
  inverse-on-surface: '#2e3036'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#2b313c'
  tertiary-container: '#dde2f2'
  on-tertiary-container: '#5e6471'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#dde2f2'
  tertiary-fixed-dim: '#c1c6d5'
  on-tertiary-fixed: '#161c26'
  on-tertiary-fixed-variant: '#414753'
  background: '#111319'
  on-background: '#e1e2ea'
  surface-variant: '#32353b'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
  metric-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for elite fitness operations, collegiate strength departments, and boutique conditioning clubs requiring hyper-efficient telemetry, scheduling, and billing management. 

The aesthetic is a high-contrast union of **Technical Minimalism** and **Industrial Athleticism**. It avoids consumer workout clichés (such as neon fire or generic gym textures) in favor of telemetry-grade displays, precision data density, and razor-sharp typographic hierarchy.

Key design principles:
- **Kinetic High-Contrast:** The interface maintains deep ambient darkness broken purposefully by focused, high-lumen neon accents that immediately convey state changes, performance thresholds, and critical operational metrics.
- **Instrument Precision:** Interfaces resemble tactical telemetric consoles rather than lifestyle blogs. Data points, metrics, and tabular rows are tightly calibrated with distinct vertical alignments and subtle structural borders.
- **Engineered Restraint:** Electric lime is strictly reserved for actionable drivers, active states, and top-tier metrics to prevent cognitive burnout during high-velocity gym floor operations.

## Colors

The palette is anchored by deep, noise-free slate values designed to isolate high-output signals.

### Surface Tiers
- **Canvas Base (`#0c0f14`):** Primary system backdrop; creates the infinite depth plane.
- **Layer 1 Surface (`#141820`):** Default card background, structural sidebars, and master navigation shells.
- **Layer 2 Container (`#1c222d`):** Data tables, KPI interior wells, active card hover targets, and nested module trays.
- **Layer 3 Elevated (`#252d3b`):** Popovers, dropdown menus, and flyout utility panels.

### Brand & Functional Accents
- **Electric Lime (`#ccff00`):** Primary action color, system health indicators, positive growth curves, and active tab triggers.
- **Lime Active/Muted (`#b8e600`):** Pressed/hover state for primary elements and tertiary sub-labels.
- **Cyan Signal (`#00f0ff`):** Secondary accent for velocity data, telemetry streams, utilization metrics, and client progress rings.
- **Border / Divider Slate (`#262f3e`):** 1px structural strokes that define module perimeters.
- **Text Hierarchy:** High-contrast text uses pure white (`#ffffff`), secondary copy sits at medium-muted grey (`#94a3b8`), and tertiary metadata drops to low-emphasis steel (`#64748b`).

## Typography

The typographic system utilizes a triple-tiered strategy tailored for high-density SaaS management:

1. **Plus Jakarta Sans (Display & Headlines):** Modern, sharp, and confident. Heavy weights (`700`, `800`) provide an athletic, forward-leaning presence for dashboard overviews and primary metric aggregations.
2. **Inter (Body & Content):** Delivers clean readability across roster configurations, payment histories, and system notifications without drawing unnecessary focus.
3. **JetBrains Mono (Telemetry & Labels):** Applied to badges, table headers, timestamp readouts, and member IDs. The monospaced cadence anchors dynamic numbers into predictable tabular widths, preventing jitter on rapid updates.

Text in metric readouts must always prioritize numerical alignment; currency symbols, percent signs, and unit specifiers should be scaled down by one type tier and aligned to the cap height.

## Layout & Spacing

The layout is built on a high-efficiency fluid grid with strict mathematical cadence derived from a base 4px system.

### Grid & Breakpoints
- **Desktop (1280px+):** 12-column layout with 24px gutters and 32px canvas margins. Supports fixed-width persistent telemetry sidebars (260px) and multi-column KPI grids.
- **Tablet (768px - 1279px):** 8-column layout with 16px gutters and 24px margins. Sub-navigation collapses into an integrated header strip.
- **Mobile (< 768px):** 4-column layout with 16px gutters and 16px canvas margins. Multi-metric cards stack vertically or convert to horizontal swipe carousels.

### Spacing Philosophy
- Use `space-sm` (8px) for tightly coupled metadata pairs (e.g., label over metric value).
- Use `space-md` (16px) for inner card padding and standard list grouping.
- Use `space-lg` (24px) for distinct section separations inside cards and control groups.
- Maintain a zero-gap policy between structural data grid items, using 1px interior borders (`#262f3e`) instead of whitespace to maximize visual real estate for complex athlete rosters.

## Elevation & Depth

Visual hierarchy does not use diffuse multi-stop shadows or skeuomorphic bevels. Instead, elevation is strictly established through **tonal tiering**, **crisp border framing**, and **targeted luminance glows**.

### Depth Layers
- **Ground Tier (Canvas):** Pure `#0c0f14`. Contains no active actionable targets.
- **Base Components:** Background `#141820` with a 1px uniform perimeter of `#262f3e`.
- **Hover & Interaction Tier:** Background transitions to `#1c222d` with the perimeter shifting to `#3b475b`.
- **Active Focus & Critical Alerts:** Employs an electric lime glow: `box-shadow: 0 0 16px rgba(204, 255, 0, 0.15), inset 0 0 0 1px #ccff00`.
- **Secondary Telemetry Elements:** Cyan accents utilize: `box-shadow: 0 0 12px rgba(0, 240, 255, 0.18)`.
- **Overlays & Modals:** Background `#141820` elevated over an 80% opacity dark canvas scrim with a subtle backdrop blur (`backdrop-filter: blur(8px)`).

## Shapes

The shape vocabulary communicates precision, agility, and modern performance:

- **Soft Form Factor (`roundedness: 1`):** Core interactive primitives (inputs, small buttons, badges, table cells) use a conservative 4px (`0.25rem`) corner radius. This keeps edge profiles sharp and structured, matching the technical nature of data analysis.
- **Cards & Data Panels (`rounded-lg`):** Main module surfaces employ an 8px (`0.5rem`) radius.
- **Progress Trackers & Floating Badges:** Pills (`9999px`) are exclusively permitted for operational status chips (e.g., `CHECKED-IN`, `MEMBERSHIP LAPSED`) and progress track outer boundaries to contrast against rigid grid lines.

## Components

### Buttons
- **Primary:** High-energy electric lime (`#ccff00`) background with solid dark text (`#0c0f14`), bold weight (`600`), 4px border radius. Hover state transitions to `#b8e600` with subtle surface elevation.
- **Secondary:** Transparent fill with a 1px border (`#262f3e`) and white text (`#ffffff`). Hover triggers `#1c222d` fill and border brightness adjustment to `#3b475b`.
- **Ghost/Tertiary:** No border, text color `#94a3b8`, transitioning to `#ffffff` and `#141820` fill on hover.

### High-Density KPI Cards
- Container styled in `#141820` with a 1px stroke (`#262f3e`) and 16px interior padding.
- Top row houses the uppercase category identifier (`label-caps` in `#64748b`) paired with a micro status chip or sparkline.
- Center features the primary aggregate value (`metric-xl` in `#ffffff`).
- Bottom row features directional delta badges: positive metrics use `#ccff00` with a subtle alpha tint container (`rgba(204, 255, 0, 0.1)`), while churn or risk uses muted crimson (`#ef4444`).

### Progress Rings & Visual Telemetry
- Circular progress indicators built on an SVG foundation with `#1c222d` background tracks.
- Active progress sweeps use `#00f0ff` (cyan) for endurance/utilization indicators or `#ccff00` (electric lime) for performance and revenue targets.
- Stroke widths must remain lean (4px to 6px) to avoid visual heaviness. Monospaced values sit centered in `data-mono`.

### Badge Chips
- Pill-shaped (`rounded-full`) wrappers using uppercase `label-caps`.
- Dimensions: 20px total height, 8px horizontal padding.
- States:
  - *Active / Checked In:* Background `rgba(204, 255, 0, 0.12)`, text `#ccff00`, border `1px solid rgba(204, 255, 0, 0.3)`.
  - *Capacity Alert / In-Session:* Background `rgba(0, 240, 255, 0.12)`, text `#00f0ff`, border `1px solid rgba(0, 240, 255, 0.3)`.
  - *Past Due / Flagged:* Background `rgba(239, 68, 68, 0.12)`, text `#ef4444`, border `1px solid rgba(239, 68, 68, 0.3)`.

### Data Tables
- Header rows utilize `#141820` with borders bottom-aligned (`#262f3e`), rendered in `label-caps` (`#64748b`).
- Row heights are compact (44px) to support high density. Hover state highlights the entire row with `#1c222d`.
- Numbers, dates, and member capacities default to right-aligned `data-mono`. Names and status categories align left.

### Inputs & Selection Controls
- **Input Fields:** Base `#0c0f14` surface framed by `#262f3e` with `14px` regular text. Focus triggers an electric lime border (`#ccff00`) and a tight halo glow.
- **Checkboxes & Radios:** 16px square/circle with a 1px stroke. Checked state utilizes a solid `#ccff00` fill with a `#0c0f14` internal checkmark.