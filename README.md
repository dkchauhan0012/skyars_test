# Skyars Website (`skyars-website`)

Public marketing website for **Skyars** (`skyars.in`) — a software, connected hardware (IoT), and applied AI engineering studio based in Bhavnagar, Gujarat, India.

## Architecture & Structure

- `src/App.tsx` — Declarative root page layout wrapped in `<MotionConfig reducedMotion="user">` (`Header` → `Hero` → `Services` → `SignalInterlude` → `Process` → `About` → `Careers` → `Contact` → `Footer`).
- `src/components/brand/FlightlineMark.tsx` — Canonical G2-continuous SVG motif (`hero`, `counterweight`, and `slash` variants) derived from the Skyars wing/flame mark, with `parseFlightlineSvgGrammar` validation (`M`, `C`, `Z`), `annotationOnly` overlay support, and collision-free `useId()` gradients.
- `src/components/visual/FlightlineHeroStage.tsx` & `src/components/visual/FlightlineScene.tsx` — Progressive-enhancement Three.js hero sculpture (`three`), dynamically imported in an isolated async chunk. Features satin-titanium and matte-obsidian extruded wing blades, `RoomEnvironment` studio reflections, deterministic `THREE.Box3` safe-stage fitting (preventing callout collision), ref-coalesced zero-rerender pointer tilt, a finite 2.4s entrance light sweep, render-on-demand settling (0 FPS when idle), `ResizeObserver` + `IntersectionObserver` + `visibilitychange` lifecycle management, and automatic fallback to `FlightlineMark` SVG on `<640px` mobile, reduced-motion, or WebGL context loss.
- `src/motion/variants.ts` — Shared Motion for React (`motion/react`) grammar (`revealLine`, `revealGroup`, `revealSection`, `pathDraw`, `activeRailTransition`, `hoverLift`, and `computeClampedTiltRadians`).
- `src/content/site.ts` — Typed content definitions for navigation, services, collaboration steps, and career tracks.
- `src/styles/tokens.css` & `src/index.css` — Design tokens (`#050507` AMOLED void, `#0B0812` carbon-violet field, `#13101C` raised ink, `#8B5CF6` signal violet, `#C4B5FD` iris light) and typographic scale (`Space Grotesk` display + `Plus Jakarta Sans` UI/body).
- `public/favicon.svg` & `public/og-card.svg` — Custom brand assets built from the authentic Skyars wing/S-spine geometry and dark/violet visual language.
- `src/utils/inquiryValidation.ts` — Shared client/server validation and `mailto:info@skyars.in` formatting utilities for project inquiries and career applications.
- `server.ts` — Express + Vite server providing `POST /api/inquiries`, `POST /api/applications`, and `GET /api/health` with 32KB JSON payload limits and IP rate limiting.

## Lead Capture & Email Delivery

Forms are validated both client-side and server-side (`POST /api/inquiries` and `POST /api/applications`):
- **With `CONTACT_WEBHOOK_URL` configured**: The server forwards validated inquiries and applications to the configured webhook endpoint and returns `deliveryMode: "webhook"`. If the webhook fails or is unreachable, the server returns HTTP `502` so the UI never displays a false delivery confirmation.
- **Without `CONTACT_WEBHOOK_URL` configured**: The server validates the payload and returns `deliveryMode: "mailto-required"` along with a pre-formatted `mailto:info@skyars.in` URL, prompting the visitor to complete delivery in their email client.

## Scripts

- `npm run dev` — Start the full-stack Express + Vite development server on port `3000`.
- `npm run lint` — Run strict TypeScript type-checking (`tsc --noEmit`).
- `npm test` — Run deterministic unit and server HTTP tests (`tsx --test`).
- `npm run build` — Build the production client bundle into `dist/`.
- `npm start` — Run the production server (`node server.ts`).
