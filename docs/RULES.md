# Coding, Architecture & Design Rules — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Enforcement Scope:** Mandatory for all human engineers and AI coding agents across Phases 0–7  
**Cross-References:** [`docs/PRD.md`](./PRD.md) · [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docs/PHASES.md`](./PHASES.md) · [`docs/FRONTEND.md`](./FRONTEND.md) · [`docs/BACKEND.md`](./BACKEND.md)

---

## 1. TypeScript Rules (`TS-01` to `TS-08`)

- **TS-01 (`strict: true` Mandatory):** `tsconfig.json` must have `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, and `"noUncheckedIndexedAccess": true` enabled.
- **TS-02 (Zero `any` Policy):** The `any` type is strictly forbidden across `src/` and `server.ts`. Use `unknown` with runtime type guards or explicit discriminated unions for external payloads.
- **TS-03 (Explicit Return Types on Exported Functions):** Every exported function, custom hook, API handler, and React component must declare an explicit return type (e.g., `: React.JSX.Element`, `: Promise<AppointmentResponse>`).
- **TS-04 (Discriminated Unions for Async & Payment States):** Model booking, payment, and slot states using discriminated unions rather than loose boolean flags:
  ```ts
  export type PaymentStatus =
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'PAYMENT_FAILED'
    | 'REFUND_PENDING'
    | 'REFUNDED';
  ```
- **TS-05 (Standard TypeScript Enums or `as const` Unions Only):** Never use experimental non-standard syntax; keep all imports at the top of files.
- **TS-06 (Shared Contract Parity):** Frontend request/response types in `src/types/api.types.ts` must match the server route validators in `server.ts` 1:1.
- **TS-07 (No Non-Null Assertions on External Data):** Never use `!` (e.g., `doctor.slots![0]!`) on API responses or URL parameters. Handle `undefined` gracefully with explicit fallback UI.
- **TS-08 (Image Imports Restricted to Client Modules):** Never import `.jpg`, `.png`, or `.webp` assets inside `server.ts` or any module imported by `server.ts` (`tsx` runtime will fail on binary imports).

---

## 2. Naming Conventions (`NC-01` to `NC-08`)

| Artifact Type | Convention | Valid Example | Invalid Example |
| :--- | :--- | :--- | :--- |
| **NC-01: React Component Files** | `PascalCase.tsx` (1 primary exported component per file) | `src/features/doctors/components/DoctorCard.tsx` | `doctor-card.tsx`, `DoctorComponents.tsx` |
| **NC-02: Custom React Hooks** | `useCamelCase.ts` | `src/hooks/useReducedMotionPreference.ts` | `ReducedMotionHook.ts`, `getReducedMotion.ts` |
| **NC-03: Utility & API Modules** | `camelCase.ts` | `src/lib/formatCurrencyINR.ts`, `src/features/booking/api/bookingApi.ts` | `FormatCurrency.ts`, `booking_api.ts` |
| **NC-04: Type Definition Files** | `camelCase.types.ts` | `src/types/booking.types.ts` | `BookingTypes.d.ts` |
| **NC-05: Design Token JSON Keys** | Hierarchical `kebab-case` under domain namespaces | `color.brand.emerald.700`, `motion.duration.normal` | `BrandEmerald700`, `primary_color` |
| **NC-06: CSS Custom Properties** | `--<category>-<role>-<variant>` | `--surface-canvas`, `--fg-primary`, `--brand-primary`, `--semantic-success` | `--mainBg`, `--green1` |
| **NC-07: Generated Image Assets** | Lowercase `snake_case` with domain prefix | `img_hero_sanctuary`, `img_spec_cardiology` | `HeroImage1.png`, `cardio-pic.jpg` |
| **NC-08: Booking Reference IDs** | `NCO-YYYY-XXXXXX` uppercase alphanumeric | `NCO-2026-849201` | `apt_123`, `BOOK-1` |

---

## 3. Component Architecture Rules (`CP-01` to `CP-08`)

- **CP-01 (Single Component Responsibility):** Export one primary React component per file (closely coupled sub-parts like `DialogHeader`/`DialogContent` in `src/components/ui/dialog.tsx` are the sole exception).
- **CP-02 (CVA Mandatory for Multi-Variant Components):** Every component with more than one visual variant (`size`, `intent`, `surface`, `status`) must use `cva()` from `class-variance-authority` and export its `VariantProps`.
- **CP-03 (Class Merging via `cn()`):** Always pass `className` through `cn(variants({ ... }), className)` so parent layouts can safely apply spacing/grid positioning without Tailwind class collisions.
- **CP-04 (Interactive Completeness — 5 States Mandatory):** Every interactive element (`<Button>`, `<DoctorCard>`, `<SlotButton>`, `<FilterTab>`, `<Input>`) must define explicit visual styles for:
  1. `default`
  2. `hover` (`hover:...`)
  3. `focus-visible` (`focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2`)
  4. `active` (`active:scale-[0.985]` or surface shift)
  5. `disabled` (`disabled:opacity-45 disabled:pointer-events-none`) and `loading` (`aria-busy="true"`).
- **CP-05 (Zero Dead Clicks):** Every button, link, filter tab, or action trigger rendered in the DOM must be wired to a real navigation route, state handler, modal trigger, or API mutation. Unwired decorative buttons are forbidden.
- **CP-06 (No Native Browser Dialogs):** Never call `window.alert()`, `window.confirm()`, or `window.prompt()` (blocked/degraded in iframe sandboxes). Use accessible Radix/shadcn `<Dialog>` or inline status banners.
- **CP-07 (Data State Triad):** Every component that consumes asynchronous server data (`/doctors`, `/specialties`, `/book` slots, `/portal`, `/admin`) must implement:
  - **Loading State:** Dimensionally matched `<Skeleton />` placeholders (`CLS = 0`).
  - **Empty State:** Helpful explanation + one-click recovery CTA (e.g., `Reset All Filters`).
  - **Error State:** Honest error message with `Retry` button—never silently fall back to fake success.
- **CP-08 (Tabular Numerals on All Medical Metrics & INR Fees):** Every component displaying `₹` prices, dates, time slots, reference codes, or ages must apply `font-mono tabular-nums` or `tabular-nums` so columns align vertically.

---

## 4. Styling & Token Rules (`ST-01` to `ST-08`)

- **ST-01 (Token-Only Color Usage):** Never hardcode raw hex/RGB values inside component JSX (e.g., `bg-[#0D4A3E]` is banned in feature components). Always reference semantic Tailwind token classes mapped from `src/styles/tokens.css` (`bg-brand-primary`, `bg-canvas`, `text-fg-primary`, `border-border-hairline`).
- **ST-02 (60-30-10 Color Discipline):**
  - **60% Dominant Canvas:** Warm Ivory (`--surface-canvas`: `#FAF8F5` light / `#071412` dark).
  - **30% Structural Surfaces:** Pure Alabaster cards (`--surface-elevated`: `#FFFFFF` light / `#0C211D` dark), Warm Stone (`--surface-subtle`: `#F2EFE9`), and hairline borders (`--border-hairline`).
  - **10% Accent Budget:** Deep Medical Emerald (`--brand-primary`: `#0D4A3E` light / `#277B6C` dark) and Botanical Warm Gold (`--brand-accent`: `#C5A059`) reserved strictly for primary CTAs, active indicators, and verified emblems.
- **ST-03 (No Separate Component CSS Files or Inline `style` Blocks):** All styling must live in Tailwind CSS utility classes and `src/index.css` / `src/styles/tokens.css`. Inline `style={{ ... }}` is permitted only for dynamic runtime coordinates (e.g., spotlight cursor `x/y` CSS variables).
- **ST-04 (Spatial Math & Single-Elevation Depth):**
  - Container outer padding must be `≥` inner child gap (`min 16px` mobile, `24px–32px` desktop).
  - Maximum **1 level of card elevation** per screen. Never nest bordered rounded cards inside bordered rounded cards; separate inner subsections with whitespace (`py-6`) and `1px solid var(--border-hairline)` dividers.
- **ST-05 (Nested Border Radius Math):** When an image or inner block sits inside a padded card, calculate $r_{\text{inner}} = r_{\text{outer}} - \text{padding}$ (e.g., outer card `rounded-2xl` [`16px`] with `p-2` [`8px`] → inner image `rounded-lg` [`8px`]).
- **ST-06 (No Thick Left Accent Borders):** Never apply `border-l-4` or colored vertical side stripes to cards, alerts, or blockquotes. Use all-around hairline borders (`border border-border-hairline`) and subtle surface contrast.
- **ST-07 (Strict 3-Zone Top Bar Contract):** `TopNavbar.tsx` must render a single row with `gap-8` containing:
  1. **Brand Zone:** Single-line `NovaCraft Orbai` wordmark + emblem (`whitespace-nowrap shrink-0`), with zero city pills or subtitle tags.
  2. **Navigation Zone:** Concise single-line text links (`whitespace-nowrap shrink-0`) with subtle hover underline.
  3. **Action Zone:** Primary `Book Appointment` CTA (plus subtle icon-only theme/portal link).
- **ST-08 (15% Mobile Sticky Cap):** The combined height of the sticky top navigation bar and any mobile booking summary bar must never exceed `15%` of the mobile viewport height (`≤ 64px` top header on `360×800` viewports).

---

## 5. Animation, 3D & Lottie Rules (`AN-01` to `AN-09`)

- **AN-01 (Strict Tool Ownership):** Never bind both **Motion** (`motion/react`) and **GSAP** (`gsap` / `ScrollTrigger`) to the same DOM node or CSS property.
- **AN-02 (Compositor-Only Properties):** Animate only `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Animating `width`, `height`, `top`, `left`, `margin`, or `padding` on scroll or hover is prohibited.
- **AN-03 (Center-Opening Intro Timing & Non-Blocking Rule):**
  - Hold duration: `~1.0s` (`950ms–1050ms`).
  - Panel separation duration: `1.0s–1.5s` (`1200ms` using `--ease-orbai-split`: `cubic-bezier(0.22, 1, 0.36, 1)`).
  - The homepage Hero must already be mounted and painted underneath before `t = 1000ms` so zero blank frames appear as the seam parts.
  - Set `pointer-events: none` on the intro container as soon as separation passes `50%` progress so user clicks are never blocked.
- **AN-04 (Routine Micro-Interaction Latency Budget):** All button hovers, tab switches, and input focus transitions must complete within `100ms–200ms` using `--ease-orbai-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **AN-05 (Mandatory `prefers-reduced-motion` Support):** Every Motion component, GSAP `useGSAP()` hook, Three.js canvas, and Lottie player must subscribe to `useReducedMotionPreference()` and disable lateral/scroll motion when reduced motion is requested.
- **AN-06 (Deterministic GSAP Cleanup):** All GSAP animations and `ScrollTrigger` instances must be created inside `useGSAP(() => { ... }, { scope: containerRef })` from `@gsap/react` so they automatically revert on component unmount.
- **AN-07 (3D Lazy Loading, Capability Guard & Offscreen Pause):**
  - `<OrbaiSanctumScene />` must be lazy-loaded via `React.lazy()` inside `<Suspense fallback={<ThreeStaticFallback />}>`.
  - Must check WebGL support and pause its render loop (`frameloop="never"`) via `IntersectionObserver` whenever scrolled out of the viewport.
- **AN-08 (Lottie Lazy JSON & Visibility Control):** Lottie JSON payloads must be stored in `/public/assets/lottie/` or dynamically imported, paused when offscreen, and destroyed on unmount.
- **AN-09 (Purposeful Motion Only):** Decorative floating blobs, continuous bouncing icons, and infinite pulsing badges are strictly banned. Every animation must communicate spatial hierarchy, state change, or confirmation feedback.

---

## 6. Accessibility Rules (`A11Y-01` to `A11Y-08`)

- **A11Y-01 (WCAG 2.2 AA Contrast Compliance):** All body text must achieve `≥ 4.5:1` contrast against its surface; large display text (`≥ 24px`) and interactive borders must achieve `≥ 3.0:1` in both Light and Dark themes.
- **A11Y-02 (Semantic Landmarks & Heading Hierarchy):** Every page must have exactly one `<h1>`, sequential `<h2>`–`<h3>` nesting (no skipped levels), and proper `<header>`, `<nav>`, `<main id="main-content">`, `<section aria-labelledby="...">`, and `<footer>` landmarks.
- **A11Y-03 (Skip-to-Content & Skip-Intro Affordances):** Provide a keyboard-accessible `Skip to main content` link at the top of the DOM and an immediate `Skip Intro` button (`Escape` key listener) during the 1-second intro hold.
- **A11Y-04 (Touch Target Minimums):** Every interactive control on mobile/tablet (`< 1024px`) must have a minimum clickable box of `44×44px` (`min-h-11 min-w-11`).
- **A11Y-05 (Accessible Forms & Validation):** Every form field in `/book`, `/contact`, `/portal`, and `/admin` must have an explicit `<label htmlFor="...">`, `aria-invalid={!!error}`, and `aria-describedby` pointing to a live error message (`role="alert"`).
- **A11Y-06 (No Hue-Only State Signaling):** Never indicate slot availability, payment status (`PAID` vs `PAYMENT_FAILED`), or form errors by color alone. Always pair color with an explicit text label and Lucide icon.
- **A11Y-07 (Keyboard-Operable Date & Time Slot Grid):** The Step 4 IST Date & Time Slot selector must use proper `role="radiogroup"` / `<button type="button" aria-pressed={isSelected} disabled={isUnavailable}>` semantics so keyboard-only users can complete a booking without a mouse.
- **A11Y-08 (Meaningful Image Alt Text):** All 17 medical photography slots and doctor portraits must provide descriptive `alt` text (e.g., `"Dr. Ananya Sharma, Senior Consultant Cardiologist at NovaCraft Orbai"`), while purely decorative SVG dividers use `aria-hidden="true"`.

---

## 7. Performance Rules (`PF-01` to `PF-06`)

- **PF-01 (Core Web Vitals Enforcement):** Maintain `LCP < 2.5s`, `CLS < 0.1`, and `INP < 200ms`.
- **PF-02 (Explicit Aspect Ratios on All Media):** Every `<MedicalImageFrame />` must reserve layout space prior to image decode using `aspect-video` (`16:9`), `aspect-4/3` (`4:3`), or `aspect-3/4` (`3:4`).
- **PF-03 (Below-the-Fold Lazy Loading):** Only the Hero image uses `loading="eager" fetchPriority="high"`. All specialty, doctor directory, and facility images below the fold must use `loading="lazy" decoding="async"`.
- **PF-04 (Route & Heavy Vendor Code Splitting):** Three.js (`three`, `@react-three/fiber`, `@react-three/drei`), GSAP (`gsap`), and Lottie (`lottie-web`) must be isolated from the critical synchronous entry path where possible, and secondary routes (`/admin`, `/portal`, `/specialties/:slug`) must be lazy-loaded.
- **PF-05 (Zero External Placeholder Image Hosts):** Never use `images.unsplash.com`, `picsum.photos`, or `via.placeholder.com`. All imagery must use local generated assets (`/src/assets/images/*`) backed by resilient SVG/CSS architectural fallback containers.
- **PF-06 (2+1 Font Family Cap):** Load at most 2 primary font families (`Cormorant Garamond` for display headings, `Plus Jakarta Sans` for UI/body) + 1 monospace family (`IBM Plex Mono` for `₹` fees, IST timestamps, and reference IDs) with a maximum of 2 weights per family.

---

## 8. Anti "AI Slop" & Healthcare Integrity Rules (`AS-01` to `AS-10`)

- **AS-01 (No Generic Purple/Blue SaaS Gradients):** Prohibit neon cyan/purple gradients, glowing cyberpunk borders, and generic hospital-blue templates. Strictly adhere to the **NovaCraft Orbai** Warm Ivory (`#FAF8F5`) + Deep Medical Emerald (`#0D4A3E`) + Botanical Gold (`#C5A059`) palette.
- **AS-02 (Zero-Pill Static Metadata Discipline):** Never wrap static metadata (doctor qualifications, languages spoken, department tags, read times) in rounded pill badges. Render static metadata as clean inline typography separated by middle dots (`MD, DM (Cardiology) · 14 Yrs Experience · English, Hindi`). Reserve bordered/segmented pill shapes strictly for interactive filter buttons and selectable time slots.
- **AS-03 (No Mechanical Code-Comment Headers):** Never prefix headings with `// 01_SPECIALTIES`, `/* DOCTORS */`, or `>_ BOOK_NOW`. Use natural human editorial numbering (`01. Choose Your Specialist`, `02. Select Your Preferred Time`).
- **AS-04 (No Decorative Pulsing Green Dots):** Never place `animate-pulse bg-emerald-500 rounded-full` dots next to static headings, brand names, or doctor names.
- **AS-05 (No Ghost Watermark Text):** Never place giant low-opacity background words behind sections.
- **AS-06 (No Fabricated Medical Credentials or Reviews):** Never invent NMC registration numbers, fake hospital awards, invented patient testimonials, or "100% cure" claims. Clearly label prototype profiles and illustrative INR fees (`Sample Prototype Data — Configurable in Admin`).
- **AS-07 (No Fake Booking or Payment Confirmations):** Clicking "Confirm Appointment" must never show a confirmation screen unless the backend API (`POST /api/v1/appointments`) returns a verified `201 Created` record.
- **AS-08 (No Unverified Payment Success):** Never mark an appointment as `PAID` on the client alone; `PAID` status requires server-side Razorpay signature verification (`POST /api/v1/payments/razorpay/verify`) or authorized Admin override.
- **AS-09 (No Unverified Notification Claims):** Never display *"Confirmation SMS & WhatsApp sent!"* unless the notification service confirms delivery; when unconfigured, display *"Appointment Pass generated — download or save your reference code below (SMS/Email gateway not configured in preview)."*
- **AS-10 (Minimal Sensitive Data Collection):** Never ask patients for Aadhaar/PAN numbers, passwords during guest booking, detailed medical histories, or raw card numbers.

---

## 9. Git, Workflow & Definition of Done (`GIT-01` to `GIT-04`)

- **GIT-01 (Branch Naming):** `feat/<phase-number>-<short-slug>`, `fix/<issue-slug>`, `docs/<doc-name>`.
- **GIT-02 (Conventional Commits):** Use `feat(booking): implement 7-step wizard with IST slot locking`, `fix(intro): ensure reduced-motion bypasses panel slide`, `docs(architecture): finalize token pipeline spec`.
- **GIT-03 (Pre-Commit Verification):** Every phase commit must pass `npm run lint` (`tsc --noEmit`) and `npm run build` with zero errors.

### 9.4 Definition of Done (DoD) Checklist for Every Feature
- [ ] TypeScript compiles with `0` errors under `strict: true` (`npm run lint`).
- [ ] Production bundle builds cleanly via `npm run build`.
- [ ] All colors, fonts, spacing, and motion timings use semantic tokens from `src/styles/tokens.css`.
- [ ] Component implements all 5 interactive states (`default`, `hover`, `focus-visible`, `active`, `disabled`/`loading`).
- [ ] Async views implement Loading (`Skeleton`), Empty, and Error states.
- [ ] Tested across `360px`, `768px`, `1024px`, and `1440px` widths in both Light and Dark themes.
- [ ] Tested with `prefers-reduced-motion: reduce` enabled and keyboard-only navigation (`Tab`/`Enter`/`Escape`).
- [ ] Clinical honesty labels and INR (`₹`) formatting (`tabular-nums`) verified.

---

## 10. Explicit "NEVER DO" List

1. **NEVER** replace the official brand name **NovaCraft Orbai** with any other hospital name.
2. **NEVER** run **Motion** and **GSAP** on the same DOM element or property simultaneously.
3. **NEVER** delay rendering the underlying Homepage Hero until after the Center-Opening Intro finishes; the Hero must be painted before the panels separate.
4. **NEVER** replay the full Center-Opening Intro on every internal page click (`/doctors`, `/about`, `/book`).
5. **NEVER** use `Inter`, `Roboto`, `Space Grotesk`, or system-default sans-serif as the primary display heading font.
6. **NEVER** wrap static doctor metadata or categories in candy-colored pill badges.
7. **NEVER** use external stock image URLs (`unsplash.com`, `picsum.photos`) that can break or fail in sandboxed environments.
8. **NEVER** allow duplicate bookings for the same doctor and IST time slot on the backend.
9. **NEVER** expose `RAZORPAY_KEY_SECRET` or admin credentials in client-side `VITE_*` variables.
10. **NEVER** use `window.alert()`, `window.confirm()`, or emojis as UI icons.
