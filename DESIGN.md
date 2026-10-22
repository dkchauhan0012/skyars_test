# Skyars Design System & Art Direction (`DESIGN.md`)

## 1. Creative Thesis: "Flightline Fidelity / Night Signal"
Skyars (`skyars.in`) is an independent software, mobile, applied AI, and connected hardware (IoT) engineering studio based in Bhavnagar, Gujarat, India (*"We Build Beyond the Bars"*).
The visual system treats the website like a precision-machined aerospace/industrial instrument: deep obsidian-black surfaces, high-contrast porcelain typography, single-pixel structural hairlines, and the signature **Skyars Flightline Wing** motif.

---

## 2. Color & Atmospheric Polarity (Intentional Dark Mode)
- **Void Background (`--color-bg`)**: `#050507`
- **Carbon Violet Alternate Field (`--color-field`)**: `#0B0812`
- **Raised Interactive / Form Surface (`--color-surface`)**: `#13101C`
- **Porcelain Primary Text (`--color-text`)**: `#F5F2FA`
- **Cool Metal Secondary Display (`--color-metal`)**: `#D9D5E3`
- **Ash Lavender Body Copy (`--color-muted`)**: `#B7B0C7`
- **Accessible Placeholder Token**: `#938CA6` (≥ 5.5:1 contrast against `#050507` while visually subordinate to entered text)
- **Structural Hairline Border (`--color-border`)**: `#262035`
- **Internal Row Divider (`--color-divider`)**: `#1B1626`
- **Signal Violet Accent (`--color-accent`)**: `#8B5CF6`
- **Iris Light Highlight & Focus (`--color-accent-hover` / `--color-focus`)**: `#C4B5FD`

---

## 3. Typography & Scannable Hierarchy
- **Display (`--font-display`)**: `'Space Grotesk'`, geometric display face for headlines, numeric indices (`01`–`04`), and uppercase technical kickers.
- **UI & Editorial Body (`--font-sans`)**: `'Plus Jakarta Sans'`, clean humanist sans-serif for body copy, deliverables lists, and form controls.
- **Line-Mask Reveal Discipline**: Section and hero headings use overflow-masked line reveals (`pb-1`) with explicit `aria-label` strings on the parent heading and `aria-hidden="true"` on visual mask spans so screen readers announce a single continuous sentence without clipping descenders.

---

## 4. Canonical Skyars Wing Architecture & 1:1 Three.js Extrusion
- **Official Brand Lockup**: `public/assets/aistudio/logo_c23009d2.png` is used unaltered in the `Header` and `Footer` with explicit intrinsic dimensions.
- **Single Canonical Wing Vector (`FLIGHTLINE_SVG_PATHS`)**: All 6 wing contours (`blade1`, `blade2`, `blade3`, `blade4`, `baseFin`, `sSpine`) and their 6 leading-edge strokes were traced from the wing emblem in `logo_c23009d2.png` via sub-pixel Marching Squares and Schneider cubic Bézier fitting into the `520 × 468` stage viewBox (`x ∈ [63.89, 293.91]`, `y ∈ [35.91, 432.26]`).
- **Synchronized Derived Assets**: `public/assets/aistudio/skyars-wing-mark.svg`, `public/favicon.svg`, `public/og-card.svg`, and the rasterized `public/og-card.png` (`1200 × 630`) all share the exact canonical path coordinates, verified by automated unit tests.
- **1:1 SVG ↔ WebGL Projection & Safe Bounds (`FlightlineScene.tsx`)**:
  - Extrudes the canonical shapes via `THREE.ShapePath.toShapes()` with zero per-blade rotations (`rotY = 0`) and tight Z-layering around `z = 0`.
  - Validates transformed geometry via `validateFlightlineSafeBounds()` against `SAFE_STAGE_MIN_X..SAFE_STAGE_MAX_X` (`44..320`) and `CALLOUT_RAIL_X` (`342`) including worst-case `±2.4°` tilt excursion.
  - Waits for the first `renderer.render(scene, camera)` frame before signaling `onReady()`, then performs a synchronized `300ms` crossfade between the 2D SVG wing and 3D canvas.
  - Scopes pointer tilt strictly to the `FlightlineHeroStage` container and idles at `0 FPS` once the `1.8s` entrance highlight sweep and pointer damping settle.
- **Responsive Mobile Stage (`< 640px`)**: Crops the SVG viewBox tightly around the wing emblem (`44 24 276 424`) so the wing stays large and recognizable on narrow phones while rendering the 3 architectural callouts (`01 / INTERFACES`, `02 / INTELLIGENCE`, `03 / PHYSICAL EDGE`) as crisp HTML typography below the stage.

---

## 5. Bidirectional Scroll Choreography (`src/motion/variants.ts`)
- **Scroll-Triggered Replay (`REPLAY_VIEWPORT`, `REPLAY_VIEWPORT_HERO`, `REPLAY_VIEWPORT_ITEM`)**: Centralizes `once: false` viewport policies across `Hero`, `Services`, `SignalInterlude`, `Process`, `About`, `Careers`, and `Contact` so reveals reset cleanly when leaving the viewport and replay smoothly when scrolling either down or back up.
- **Scroll-Linked Signal Conduit (`SignalInterlude.tsx`)**: Uses `useScroll` + `useTransform` along `CONDUIT_PATH_D` (`M 12 48 ... 387 16 ... 773 48 ... 1108 16`) so the traveling signal pulse reverses naturally on upward scroll.
- **Reduced Motion**: Wrapped in `<MotionConfig reducedMotion="user">`, disabling WebGL 3D sweeps, pointer tilt, and scroll-linked travel when `prefers-reduced-motion: reduce` is active.
