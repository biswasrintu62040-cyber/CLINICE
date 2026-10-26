# Execution Phases Plan — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Execution Model:** Sequential, deterministic 8-phase build plan (Phase 0 → Phase 7)  
**Cross-References:** [`docs/PRD.md`](./PRD.md) · [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docs/RULES.md`](./RULES.md) · [`docs/FRONTEND.md`](./FRONTEND.md) · [`docs/BACKEND.md`](./BACKEND.md)

---

## Execution Overview Matrix

| Phase | Title | Primary Focus | Key Dependencies Added | Verification Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Foundation, Strict TS, Routing & Express Backend Core | `tsconfig.json` strictness, `react-router`, `server.ts` API + atomic slot engine | `react-router`, `class-variance-authority`, `clsx`, `tailwind-merge` | `npm run lint` + `GET /api/v1/health` returns `200 OK` |
| **Phase 1** | Style Dictionary Tokens, Theme Engine & 17-Slot Medical Imagery | Token JSONs → `tokens.css` → Tailwind v4 `@theme`; batch `generate_image` for medical visuals | `style-dictionary` (dev) | `node scripts/build-tokens.mjs` + `npm run lint` |
| **Phase 2** | Base UI Primitives (`shadcn/ui` + CVA) & Shared Layout Shell | Radix/shadcn primitives, 3-Zone `TopNavbar`, `Footer`, `<MedicalImageFrame />` | `@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-label`, `@radix-ui/react-switch` | All primitives render 5 states (`default`, `hover`, `focus-visible`, `active`, `disabled`) |
| **Phase 3** | All 14 Public Pages, 7-Step Booking Engine, Patient Portal & Admin | Complete route implementation wired to `/api/v1/*`, INR (`₹`) fee tables, Razorpay/Pay-at-Hospital | None (uses Phase 0–2 stack) | Full 7-step booking creates verified `NCO-2026-XXXXXX` record; `409 Conflict` prevents double-booking |
| **Phase 4** | Signature Center-Opening Intro, Motion Micro-Interactions & GSAP Scroll | `<CenterOpeningIntro />` (`1.0s` hold + `1.2s` split), React Bits/Magic UI/Aceternity blocks, GSAP `ScrollTrigger` | `gsap`, `@gsap/react` | Intro parts smoothly at `50vw` over pre-rendered Hero; respects `prefers-reduced-motion` |
| **Phase 5** | Selective 3D (`R3F + Drei`) & Lottie Vector Animations | Lazy-loaded `<OrbaiSanctumScene />` with WebGL guard & off-screen pause; `<LottieViewportPlayer />` | `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lottie-web` | 3D canvas pauses when off-screen; fallback renders on WebGL disable |
| **Phase 6** | Accessibility (`WCAG 2.2 AA`), Dark Mode & Performance Tuning | Contrast audit, keyboard-only booking test, code-splitting budget check (`< 160 KB` entry) | None | `npm run build` chunk audit + keyboard & reduced-motion verification |
| **Phase 7** | Comprehensive QA, Security Audit & Launch Sign-Off | Full 20-point QA verification across all 16 routes, API edge cases, and mobile viewports (`360px+`) | None | `npm run lint && npm run build` pass with `0` errors |

---

## Phase 0 — Foundation, Strict TypeScript, Data Router & Express Backend Core

### Goal
Establish strict TypeScript compilation, configure metadata and typography links for **NovaCraft Orbai**, install core routing/variant dependencies, and build the authoritative Express 4 backend (`server.ts`) implementing atomic slot locking, INR pricing tiers, Razorpay verification, Patient Portal endpoints, and Staff Admin endpoints.

### Exact Tasks
- [ ] Update `/metadata.json` and `/index.html` with the official **NovaCraft Orbai** title, meta description, OpenGraph tags, and Google Fonts preconnects (`Cormorant Garamond`, `Plus Jakarta Sans`, `IBM Plex Mono`).
- [ ] Enable `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, and `"noUncheckedIndexedAccess": true` in `/tsconfig.json`.
- [ ] Install Phase 0 packages (`react-router`, `class-variance-authority`, `clsx`, `tailwind-merge`).
- [ ] Create shared domain and API TypeScript contracts (`src/types/domain.types.ts`, `src/types/booking.types.ts`, `src/types/api.types.ts`) matching [`docs/BACKEND.md`](./BACKEND.md).
- [ ] Implement `/server.ts` mounting Express 4 JSON routes (`/api/v1/health`, `/api/v1/config/capabilities`, `/api/v1/specialties`, `/api/v1/doctors`, `/api/v1/slots`, `/api/v1/appointments`, `/api/v1/payments/razorpay/*`, `/api/v1/portal/*`, `/api/v1/admin/*`, `/api/v1/inquiries`) alongside `vite.middlewares` on port `3000`.
- [ ] Update `package.json` `"dev"` script to `"tsx server.ts"` and `"start"` script to `"node server.ts"` (or `"tsx server.ts"`).
- [ ] Update `/.env.example` with documented configuration variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_ACCESS_CODE`, `HOSPITAL_TIMEZONE="Asia/Kolkata"`).

### Files Touched
- `/metadata.json`
- `/index.html`
- `/tsconfig.json`
- `/package.json`
- `/.env.example`
- `/server.ts`
- `/src/types/domain.types.ts`
- `/src/types/booking.types.ts`
- `/src/types/api.types.ts`
- `/src/lib/cn.ts`
- `/src/lib/apiClient.ts`
- `/src/lib/formatCurrencyINR.ts`

### Dependencies
- Existing: `express@^4.21.2`, `dotenv@^17.2.3`, `tsx@^4.21.0`, `vite@^8.3.0`
- New: `react-router`, `class-variance-authority`, `clsx`, `tailwind-merge`

### Deliverables
- Running full-stack Express + Vite server on port `3000`.
- Complete `/api/v1/*` REST API with seeded prototype specialties, doctors (explicitly labeled as sample profiles), 14-day rolling IST time slots, and atomic slot-reservation locking.

### Exit Criteria & Verification Check
- Command: `npm run lint` → exits `0` with strict mode active.
- Check: `GET /api/v1/specialties` and `GET /api/v1/doctors` return structured JSON with INR (`₹`) consultation fees (`499` to `999`).

---

## Phase 1 — Design System Tokens (Style Dictionary) & 17-Slot Medical Imagery

### Goal
Build the single-source **Style Dictionary** token pipeline (`src/tokens/*.json` → `src/styles/tokens.css` + `src/tokens/generated/tokens.ts`), map tokens into Tailwind CSS v4 (`src/index.css`), and generate/wire the 17 photorealistic medical visual assets with zero-broken-image fallbacks.

### Exact Tasks
- [ ] Install `style-dictionary` as a devDependency.
- [ ] Author canonical token JSON files in `src/tokens/`:
  - `src/tokens/color.json` (Deep Medical Emerald `#0D4A3E` 50–950 scale, Warm Ivory `#FAF8F5`, Night Ward Dark `#071412`, Botanical Gold `#C5A059`, semantic status tokens).
  - `src/tokens/typography.json` (`Cormorant Garamond`, `Plus Jakarta Sans`, `IBM Plex Mono`, fluid `clamp()` scales).
  - `src/tokens/spacing-radius.json` (4/8px rhythm, `1440px` desktop container, radius math tokens).
  - `src/tokens/motion.json` (durations `150ms`, `300ms`, `1000ms`, `1200ms`; easings `--ease-orbai-out`, `--ease-orbai-split`).
- [ ] Create `scripts/build-tokens.mjs` and execute it to generate `src/styles/tokens.css` and `src/tokens/generated/tokens.ts`.
- [ ] Configure `src/index.css` with `@import "tailwindcss";`, `@import "./styles/tokens.css";`, and `@theme inline` variable bindings for both Light (`:root`) and Dark (`.dark`) themes.
- [ ] Generate high-resolution medical photography for the 17 visual slots defined in [`docs/PRD.md`](./PRD.md) Section 9 (`img_hero_sanctuary`, `img_campus_exterior`, `img_campus_interior`, `img_medical_team`, `img_doctor_portraits`, specialty visuals, consultation rooms, waiting lounge) in a single parallel batch turn, and wire their paths into `src/assets/medicalAssetRegistry.ts`.

### Files Touched
- `/scripts/build-tokens.mjs`
- `/src/tokens/color.json`
- `/src/tokens/typography.json`
- `/src/tokens/spacing-radius.json`
- `/src/tokens/motion.json`
- `/src/tokens/generated/tokens.ts`
- `/src/styles/tokens.css`
- `/src/index.css`
- `/src/assets/medicalAssetRegistry.ts`

### Dependencies
- Phase 0 complete; `style-dictionary` installed.

### Deliverables
- Compiled `src/styles/tokens.css` and `src/tokens/generated/tokens.ts`.
- Complete `medicalAssetRegistry.ts` mapping all 17 required medical visual slots to verified local image paths + curated architectural fallback metadata.

### Exit Criteria & Verification Check
- Command: `node scripts/build-tokens.mjs && npm run lint` → exits `0`.
- Check: Every color pair meets WCAG 2.2 AA contrast ratios documented in [`docs/FRONTEND.md`](./FRONTEND.md).

---

## Phase 2 — Base UI Primitives (`shadcn/ui` + CVA) & Shared Layout Shell

### Goal
Implement the accessible `shadcn/ui` component foundation using Radix UI + CVA, build the `<MedicalImageFrame />` zero-broken-image component, and construct the shared layout shells (`PublicLayout`, `BookingLayout`, `PortalLayout`, `AdminLayout`, 3-zone `TopNavbar`, `MobileNavDrawer`, and `Footer`).

### Exact Tasks
- [ ] Install Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-label`, `@radix-ui/react-switch`).
- [ ] Build CVA-typed UI primitives in `src/components/ui/`: `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `dialog.tsx`, `accordion.tsx`, `tabs.tsx`, `table.tsx`, `badge.tsx`, `skeleton.tsx`, `toast.tsx`.
- [ ] Build `src/components/layout/MedicalImageFrame.tsx` enforcing explicit aspect ratios, `referrerPolicy="no-referrer"`, lazy loading below the fold, and an automatic architectural SVG/CSS fallback on error.
- [ ] Build `src/components/layout/TopNavbar.tsx` strictly adhering to the 3-zone Top Bar Contract (`NovaCraft Orbai` single-line wordmark + emblem | 5 single-line nav links | `Book Appointment` CTA) and `<MobileNavDrawer />` (`≤ 15%` viewport sticky height).
- [ ] Build `src/components/layout/Footer.tsx` with hospital working hours (`Asia/Kolkata`), configurable campus address notice, specialty links, policy links, and `Replay Intro` trigger.
- [ ] Build `src/app/AppProviders.tsx` (`ThemeProvider`, `AuthProvider`, `BookingWizardProvider`) and `src/routes/routeConfig.tsx`.

### Files Touched
- `/src/components/ui/*.tsx` (11 files)
- `/src/components/layout/MedicalImageFrame.tsx`
- `/src/components/layout/TopNavbar.tsx`
- `/src/components/layout/MobileNavDrawer.tsx`
- `/src/components/layout/Footer.tsx`
- `/src/components/layout/SectionContainer.tsx`
- `/src/app/AppProviders.tsx`
- `/src/app/GlobalErrorBoundary.tsx`
- `/src/app/layouts/PublicLayout.tsx`
- `/src/app/layouts/BookingLayout.tsx`
- `/src/app/layouts/PortalLayout.tsx`
- `/src/app/layouts/AdminLayout.tsx`
- `/src/routes/routeConfig.tsx`

### Dependencies
- Phase 1 complete; Radix UI packages installed.

### Deliverables
- Complete design system component library and responsive navigation/layout shells.

### Exit Criteria & Verification Check
- Command: `npm run lint` → exits `0`.
- Check: Every navigation item in `TopNavbar` and `Footer` resolves to a registered route in `routeConfig.tsx`.

---

## Phase 3 — Core Pages, 7-Step Appointment Booking Engine, Patient Portal & Admin

### Goal
Build all 14 public pages, the complete 7-step appointment booking flow (`/book` + `/booking/confirmation/:referenceId`), the authenticated Patient Portal (`/portal`), and the role-protected Staff Admin Dashboard (`/admin`), wired end-to-end to the Express `/api/v1/*` backend.

### Exact Tasks
- [ ] Implement domain composites in `src/features/doctors/` (`DoctorCard.tsx` with zero-pill inline metadata, `DoctorFilterBar.tsx`, `DoctorSlotPreviewWidget.tsx`) and `src/features/specialties/` (`SpecialtyBentoGrid.tsx`, `SpecialtyCard.tsx`, `ClinicalServicesMatrix.tsx`).
- [ ] Implement the 7-Step Booking Wizard (`src/features/booking/`):
  - `Step1SpecialtySelect.tsx` (11 configurable departments).
  - `Step2DoctorSelect.tsx` (filtered specialists with `₹` fees and verified/sample disclosure).
  - `Step3AppointmentType.tsx` (`In-Person`, `Video`, `Follow-Up` with exact `₹` fees and instructions).
  - `Step4DateTimeSlotPicker.tsx` (`Asia/Kolkata` IST date strip + Morning/Afternoon/Evening slot buttons; disabled state for booked slots).
  - `Step5PatientDetailsForm.tsx` (minimal validated fields: Full Name, 10-digit Indian mobile, Email, Age/DOB, optional visit reason).
  - `Step6ReviewAndPayment.tsx` (complete summary, inline `Edit` step jump buttons, `Pay at Hospital` vs. `Razorpay Online` selector, server submission handler).
  - `BookingConfirmationPage.tsx` (Step 7: server-verified `NCO-YYYY-XXXXXX` pass, payment status badge, honest notification status, print/download pass).
- [ ] Implement all 14 Public Pages (`HomePage`, `AboutPage`, `DoctorsDirectoryPage`, `DoctorProfilePage`, `SpecialtiesPage`, `SpecialtyDetailPage`, `BookingWizardPage`, `BookingConfirmationPage`, `ContactPage`, `FaqPage`, `PrivacyPolicyPage`, `TermsOfServicePage`, `CancellationPolicyPage`, `NotFoundPage`).
- [ ] Implement `PatientPortalPage.tsx` (`/portal`) with session sign-in, appointment list, live rescheduling modal, and cancellation action.
- [ ] Implement `AdminDashboardPage.tsx` (`/admin`) with staff authentication guard, doctor CRUD & INR fee editor, specialty/service manager, slot availability generator, appointment status manager, and audit log viewer.

### Files Touched
- `/src/features/doctors/**/*`
- `/src/features/specialties/**/*`
- `/src/features/booking/**/*`
- `/src/features/portal/**/*`
- `/src/features/admin/**/*`
- `/src/routes/*Page.tsx` (16 route page files)

### Dependencies
- Phase 2 complete.

### Deliverables
- All 16 routes fully functional and backed by live Express API persistence.

### Exit Criteria & Verification Check
- Command: `npm run lint && npm run build` → exits `0`.
- Functional Check: Submitting Step 6 creates an appointment via `POST /api/v1/appointments`, locks the slot (`GET /api/v1/slots` shows the slot as `BOOKED`), and renders the confirmation page. Attempting a second booking on the same slot returns HTTP `409 Conflict`.

---

## Phase 4 — Signature Center-Opening Intro, Motion Micro-Interactions & GSAP Scroll

### Goal
Implement the signature **Two-Panel Center-Opening Intro** (`<CenterOpeningIntro />`), cherry-picked **React Bits**, **Magic UI**, and **Aceternity UI** animated components, and **GSAP + ScrollTrigger** scroll storytelling sequences while strictly enforcing animation ownership and `prefers-reduced-motion`.

### Exact Tasks
- [ ] Install `gsap` and `@gsap/react`.
- [ ] Implement `src/features/intro/components/OrbaiSanctumEmblem.tsx` and `src/features/intro/components/CenterOpeningIntro.tsx`:
  - Symmetrical left/right panels meeting at `50vw` with split emblem seam.
  - Displays `"Your Health. Our Priority."` and `"Exceptional care, designed around you."`
  - Holds for `1.0s`, then translates left panel `-100%` and right panel `+100%` over `1.2s` (`cubic-bezier(0.22, 1, 0.36, 1)`) revealing the already-mounted Homepage Hero underneath.
  - Persists completion in `sessionStorage` (`nco_intro_seen`), exposes a `Skip Intro` button (`Escape`), and supports configurable custom media props (`leftPanelAssetUrl`, `rightPanelAssetUrl`) for future asset drop-in.
- [ ] Implement cherry-picked motion primitives:
  - `src/components/motion/react-bits/SplitTextReveal.tsx` & `DecryptedReferenceCode.tsx`.
  - `src/components/motion/magic-ui/NumberTicker.tsx` & `AnimatedBeam.tsx`.
  - `src/components/motion/aceternity/SpotlightCard.tsx` & `HeroAuroraSurface.tsx`.
- [ ] Implement GSAP `ScrollTrigger` choreography (`src/components/motion/ScrollStorySection.tsx`) on the Homepage 3-step Booking Explainer and Campus Architecture showcase using `useGSAP()` cleanup.

### Files Touched
- `/src/features/intro/components/CenterOpeningIntro.tsx`
- `/src/features/intro/components/OrbaiSanctumEmblem.tsx`
- `/src/features/intro/hooks/useIntroSessionState.ts`
- `/src/components/motion/react-bits/*.tsx`
- `/src/components/motion/magic-ui/*.tsx`
- `/src/components/motion/aceternity/*.tsx`
- `/src/components/motion/ScrollStorySection.tsx`
- `/src/hooks/useReducedMotionPreference.ts`

### Dependencies
- Phase 3 complete; `gsap` and `@gsap/react` installed.

### Deliverables
- Signature 2-panel center-opening intro and full Motion + GSAP choreography with zero ownership overlap.

### Exit Criteria & Verification Check
- Command: `npm run lint` → exits `0`.
- Check: Verify zero DOM nodes have both `motion.*` transforms and `gsap` tweens attached simultaneously; verify `prefers-reduced-motion: reduce` disables panel slide and scroll scrubbing.

---

## Phase 5 — Selective 3D (`Three.js / R3F + Drei`) & Lottie Vector Animations

### Goal
Integrate the lazy-loaded **React Three Fiber + Drei** architectural light/glass scene (`<OrbaiSanctumScene />`) in the Intro/Hero and **Lottie Web** vector animations (`<LottieViewportPlayer />`) for booking confirmation and empty states.

### Exact Tasks
- [ ] Install `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, and `lottie-web`.
- [ ] Implement `src/hooks/useWebGLCapability.ts` and `src/hooks/useInViewport.ts`.
- [ ] Implement `src/components/three/ThreeStaticFallback.tsx`, `src/components/three/OrbaiSanctumScene.tsx`, and `src/components/three/ThreeCanvasGuard.tsx` (lazy-loaded with `<Suspense>`, `dpr={[1, 1.5]}`, pauses render loop when scrolled off-screen).
- [ ] Create compact Lottie JSON vector assets in `/public/assets/lottie/` (`booking-confirmed.json`, `empty-search.json`, `verifying-payment.json`) and implement `src/components/lottie/LottieViewportPlayer.tsx`.
- [ ] Wire `<LottieViewportPlayer />` into `BookingConfirmationPage.tsx` (verified checkmark) and `DoctorsDirectoryPage.tsx` (empty filter state).

### Files Touched
- `/src/hooks/useWebGLCapability.ts`
- `/src/hooks/useInViewport.ts`
- `/src/components/three/ThreeStaticFallback.tsx`
- `/src/components/three/OrbaiSanctumScene.tsx`
- `/src/components/three/ThreeCanvasGuard.tsx`
- `/src/components/lottie/LottieViewportPlayer.tsx`
- `/public/assets/lottie/booking-confirmed.json`
- `/public/assets/lottie/empty-search.json`
- `/public/assets/lottie/verifying-payment.json`

### Dependencies
- Phase 4 complete; `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lottie-web` installed.

### Deliverables
- Capability-guarded 3D hero/intro refraction canvas and visibility-aware Lottie players.

### Exit Criteria & Verification Check
- Command: `npm run lint && npm run build` → exits `0`.
- Check: Confirm `three` and `lottie-web` are emitted as separate async chunks in `dist/assets/` rather than bloating the synchronous entry bundle.

---

## Phase 6 — Polish, Accessibility (`WCAG 2.2 AA`), Dark Mode & Performance

### Goal
Audit and refine every route across Light (`#FAF8F5`) and Dark (`#071412`) themes, keyboard navigation, screen-reader landmarks, mobile touch targets (`≥ 44px`), and SEO/Schema.org metadata.

### Exact Tasks
- [ ] Add dynamic route-level document title, meta description, and Schema.org JSON-LD (`MedicalOrganization`, `Physician`, `FAQPage`) helper (`src/lib/seoHead.ts`).
- [ ] Audit every page in Dark Mode (`.dark`) to verify optical text compensation, surface border contrast, and scrim legibility over medical photography.
- [ ] Verify `44×44px` minimum touch targets on mobile navigation, filter pills, calendar dates, and time slot buttons at `360px` viewport width.
- [ ] Verify focus management on step transitions in `/book` (focus moves smoothly to the new step heading when advancing from Step 1 → Step 6).

### Files Touched
- `/src/lib/seoHead.ts`
- `/src/routes/*Page.tsx`
- `/src/features/booking/components/*.tsx`

### Dependencies
- Phase 5 complete.

### Deliverables
- WCAG 2.2 AA compliant, dual-theme, SEO-instrumented frontend.

### Exit Criteria & Verification Check
- Command: `npm run lint && npm run build` → exits `0`.

---

## Phase 7 — Comprehensive Quality Assurance & Launch Sign-Off

### Goal
Execute the 20-point quality assurance checklist from the specification across frontend, backend, booking edge cases, payment states, admin workflows, and responsive viewports.

### Exact Tasks
- [ ] Verify all 16 routes render without console errors or unhandled promise rejections.
- [ ] Test Doctor Directory search, specialty filter, consultation mode filter, language filter, and fee sorting.
- [ ] Test full 7-step booking validation (empty required fields, invalid Indian phone number, disabled time slots).
- [ ] Test concurrent duplicate-booking prevention (`POST /api/v1/appointments` with an already-booked `slotId` returns `409 Conflict`).
- [ ] Test both `Pay at Hospital` (`PAYMENT_PENDING`) and Razorpay payment verification (`PAID` / `PAYMENT_FAILED` / unconfigured fallback).
- [ ] Test Patient Portal (`/portal`) rescheduling and cancellation (confirming slot release).
- [ ] Test Staff Admin Dashboard (`/admin`) doctor fee updates, slot generation, and audit logging.
- [ ] Run final `npm run lint` and `npm run build` verification.

### Files Touched
- Bug fixes only across `src/` and `server.ts` if uncovered during verification.

### Dependencies
- Phases 0–6 complete.

### Deliverables
- Production-verified **NovaCraft Orbai** application ready for deployment.

### Exit Criteria & Verification Check
- Command: `npm run lint && npm run build` → `0` TypeScript errors, clean Vite production build, all 20 QA checks verified.
