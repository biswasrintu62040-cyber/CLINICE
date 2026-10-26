# Engineering Architecture — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Target Runtime:** React 19 + Vite 8 + TypeScript 7 (Strict) + Tailwind CSS v4 + Express 4 Full-Stack  
**Cross-References:** [`docs/PRD.md`](./PRD.md) · [`docs/RULES.md`](./RULES.md) · [`docs/PHASES.md`](./PHASES.md) · [`docs/FRONTEND.md`](./FRONTEND.md) · [`docs/BACKEND.md`](./BACKEND.md)

---

## 1. Architecture Overview & Guiding Principles

NovaCraft Orbai is architected as a modular, feature-sliced React 19 single-page application served alongside a stateful Express 4 API (`server.ts`) on port `3000`.

### 1.1 Architectural Principles
1. **Single Source of Token Truth:** Every visual token (color, typography, spacing, radius, elevation, motion duration, and easing curve) originates in `src/tokens/*.json`, compiles via **Style Dictionary** into CSS Custom Properties (`src/styles/tokens.css`), and maps into **Tailwind CSS v4** (`@theme inline`) in `src/index.css`.
2. **Strict Animation Ownership Boundary:** **Motion** (`motion/react`) and **GSAP** (`gsap` + `ScrollTrigger`) never animate the same DOM element or property simultaneously. Motion owns interactive state, mount/unmount presence, and shared-layout transitions; GSAP owns scroll-bound timelines, pinned storytelling, and the center-opening intro choreography if timeline sequencing is active.
3. **Progressive Enhancement for 3D & Vector Motion:** **Three.js / React Three Fiber (`@react-three/fiber` + `@react-three/drei`)** and **Lottie Web (`lottie-web`)** are isolated in lazy-loaded boundaries (`React.lazy` + `<Suspense>`), guarded by device capability and `prefers-reduced-motion` checks, and paused via `IntersectionObserver` when off-screen.
4. **Server-Authoritative Booking & Pricing:** The frontend never fabricates booking confirmations, slot locks, or payment verification. All 7 booking steps validate against `/api/v1/*` endpoints documented in [`docs/BACKEND.md`](./BACKEND.md).

---

## 2. Locked Technology Stack & Verified Dependency Matrix

### 2.1 Currently Installed vs. Planned Packages

| Layer | Package Name | Status in `package.json` | Target Version | License | Architectural Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core UI** | `react`, `react-dom` | Installed (`^19.0.1`) | `^19.0.1` | MIT | Concurrent rendering, `Suspense`, and low-overhead hooks for multi-step booking flows. |
| **Bundler** | `vite`, `@vitejs/plugin-react` | Installed (`^8.3.0`, `^6.1.1`) | `^8.3.0` | MIT | Instant ESM dev server and deterministic Rollup/esbuild production chunking. |
| **Language** | `typescript` | Installed (`^7.0.2`) | `^7.0.2` | Apache-2.0 | End-to-end compile-time safety across UI props, CVA variants, and API DTOs (`strict: true`). |
| **Routing** | `react-router` | To install (Phase 0) | `^7.4.0` | MIT | Unified package in v7 providing `createBrowserRouter`, route `lazy()`, loaders, and `<ScrollRestoration />`. |
| **Styling** | `tailwindcss`, `@tailwindcss/vite` | Installed (`^4.3.3`) | `^4.3.3` | MIT | Zero-runtime CSS utility compilation with native `@theme` CSS variable binding. |
| **Token Engine** | `style-dictionary` | To install (`devDependency`, Phase 1) | `^4.3.0` | Apache-2.0 | Compiles canonical JSON design tokens into `:root` / `.dark` CSS variables and TypeScript motion constants. |
| **Variants** | `class-variance-authority`, `clsx`, `tailwind-merge` | To install (Phase 1) | `^0.7.1`, `^2.1.1`, `^3.0.2` | Apache-2.0 / MIT | Type-safe component variant matrices (`VariantProps`) and conflict-free Tailwind class merging (`cn()`). |
| **Primitives** | `@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-label`, `@radix-ui/react-switch` | To install (Phase 2) | Latest `^1.x` / `^2.x` | MIT | WAI-ARIA compliant headless primitives powering the `shadcn/ui` layer (`src/components/ui/`). |
| **Icons** | `lucide-react` | Installed (`^0.546.0`) | `^0.546.0` | ISC | Exclusive vector icon system across all pages; consistent stroke width (`1.75px`). |
| **Component Motion** | `motion` | Installed (`^12.23.24`) | `^12.23.24` | MIT | Declarative layout animations, `AnimatePresence`, hover/tap micro-interactions, and wizard step transitions. |
| **Scroll Motion** | `gsap`, `@gsap/react` | To install (Phase 4) | `^3.12.7`, `^2.1.2` | Standard "No Charge" GreenSock | Deterministic `ScrollTrigger` scrubbing, pinned 3-step booking explainer, and automatic React cleanup via `useGSAP()`. |
| **3D Engine** | `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` | To install (Phase 5) | `^0.174.0`, `^9.1.0`, `^10.0.4` | MIT | React 19 compatible (`@react-three/fiber@^9`) declarative WebGL canvas for the intro/hero architectural glass refraction scene. |
| **Vector Motion** | `lottie-web` | To install (Phase 5) | `^5.12.2` | MIT | Lightweight SVG player for the booking confirmation checkmark, empty search state, and diagnostic scan micro-illustrations. |
| **Backend** | `express`, `dotenv`, `tsx` | Installed (`^4.21.2`, `^17.2.3`, `^4.21.0`) | Installed | MIT | Full-stack Express server mounting `/api/v1/*` routes and `vite.middlewares` on port `3000`. |

---

## 3. Tool Decision Matrix (When to Use What & Why)

Every tool in the locked stack has a strict, non-overlapping architectural role:

| Architectural Need | Assigned Tool | Specific NovaCraft Orbai Use Cases | Why This Tool (Engineering Justification) |
| :--- | :--- | :--- | :--- |
| **Hover, tap, mount/unmount, layout shifts, shared-element transitions, wizard step transitions** | **Motion** (`motion/react`) | • Center-Opening Intro panel separation (`layout` / `animate` x-axis translation)<br>• 7-Step Booking wizard step enter/exit (`AnimatePresence mode="wait"`)<br>• Doctor Directory filter tab `layoutId` active indicator<br>• Button press feedback (`whileTap={{ scale: 0.985 }}`) | Motion integrates directly with React's render lifecycle (`AnimatePresence`) to animate unmounting DOM nodes and layout shifts (`layoutId`) that CSS or imperative timelines cannot track cleanly. |
| **Scroll-driven sequences, pinned sections, parallax, timeline choreography, text reveals** | **GSAP + ScrollTrigger** (`@gsap/react`) | • Homepage Section D ("How Appointment Booking Works" pinned 3-step scrub timeline)<br>• Architectural Campus Tour image parallax (`yPercent: -8` to `8`)<br>• Section header editorial line reveals triggered at `top 85%` | `ScrollTrigger` calculates exact scroll progress ratios on a single shared `requestAnimationFrame` ticker with deterministic `.revert()` cleanup via `useGSAP()`. |
| **3D hero & intro ambient light refraction, architectural glass sculpture** | **Three.js / R3F + Drei** | • Subtle interactive architectural glass & botanical light-refraction sculpture behind the Hero & Center-Opening Intro (`<OrbaiSanctumScene />`) | Provides physical transmission material (`MeshTransmissionMaterial` / low-cost Fresnel shader) that responds gently to pointer position without heavy video payloads. |
| **Vector illustration animations, confirmation checkmarks, empty states** | **Lottie Web** (`lottie-web`) | • Step 7 Booking Confirmation verified checkmark badge<br>• Doctor Directory empty filter state illustration<br>• Payment verification processing spinner | Renders crisp resolution-independent SVG paths from compact JSON (`< 15 KB`) with programmatic frame control (`play()`, `pause()`, `goToAndStop()`). |
| **Forms, dialogs, dropdowns, accordions, tabs, tables, toasts, accessibility-critical UI** | **shadcn/ui** (`src/components/ui/*`) | • Booking patient form inputs, labels, selects, and error messages<br>• FAQ Accordion (`/faq` & Home)<br>• Reschedule/Cancel confirmation Dialogs (`/portal`)<br>• Admin Dashboard high-density data tables (`/admin`) | Built on Radix UI primitives with complete WAI-ARIA keyboard management, focus trapping, and direct styling via our CSS token variables. |
| **Expressive animated headings, subtle cursor/spotlight interaction, text reveals** | **React Bits** (cherry-picked patterns in `src/components/motion/react-bits/`) | • `<SplitTextReveal />` on primary page hero headings<br>• `<DecryptedReferenceCode />` reveal on the Booking Confirmation reference number (`NCO-2026-XXXXXX`) | Adds tactile typographic polish to headline entrances and reference code reveals without bloated third-party runtime dependencies. |
| **Polished animated UI blocks (marquees, number tickers, subtle beams)** | **Magic UI** (cherry-picked patterns in `src/components/motion/magic-ui/`) | • `<NumberTicker />` for verified INR fee summaries and live available slot counts<br>• `<AnimatedBeam />` connecting the 3 steps in the Booking Architecture diagram | Purpose-built for data-driven micro-visualizations (`tabular-nums` tickers and SVG connection beams). |
| **High-impact hero/section spotlight & 3D perspective card containers** | **Aceternity UI** (cherry-picked patterns in `src/components/motion/aceternity/`) | • `<SpotlightCard />` on Featured Specialty bento cards<br>• `<HeroAuroraSurface />` subtle warm ivory/emerald ambient radial light behind the Center-Opening Intro | Elevates focal hero and specialty cards with GPU-composited radial gradient spotlights that follow pointer coordinates. |
| **Component variant logic (size, intent, surface, state)** | **CVA** (`class-variance-authority`) | • All buttons, badges, doctor cards, slot pills, inputs, and alert banners | Eliminates fragile nested ternary strings in JSX and enforces strict TypeScript union types for every visual variant. |
| **Colors, spacing, radius, shadow, typography, motion tokens** | **Style Dictionary** (`src/tokens/`) | • Single-source JSON definitions compiled into `src/styles/tokens.css` and `src/tokens/generated/motionTokens.ts` | Guarantees that CSS classes, inline canvas shaders (Three.js hex values), and Motion/GSAP durations read from identical mathematical constants. |
| **Icons** | **Lucide React** (`lucide-react`) | • All functional UI affordances (`Calendar`, `Clock`, `Stethoscope`, `ShieldCheck`, `ArrowRight`, `Search`, `Filter`, `CheckCircle2`) | Tree-shakeable SVG React components with uniform `24×24` viewBox and customizable stroke width. |

---

## 4. Complete `src/` Directory Structure (Feature-Based Layout)

```text
/
├── docs/                                   # Complete 6-file architecture & product specification
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── PHASES.md
│   ├── FRONTEND.md
│   └── BACKEND.md
├── public/
│   └── assets/
│       └── lottie/                         # Static Lottie JSON files (lazy-fetched)
│           ├── booking-confirmed.json
│           ├── empty-search.json
│           └── verifying-payment.json
├── scripts/
│   └── build-tokens.mjs                    # Style Dictionary build runner
├── server.ts                               # Express 4 full-stack server + API routes + Vite middleware
├── src/
│   ├── app/                                # Application shell, providers, global error boundaries
│   │   ├── AppProviders.tsx                # ThemeProvider, BookingDraftProvider, AuthProvider, ToastProvider
│   │   ├── AppRouter.tsx                   # RouterProvider mounting createBrowserRouter
│   │   ├── GlobalErrorBoundary.tsx         # Root fallback UI with diagnostic recovery
│   │   └── layouts/
│   │       ├── PublicLayout.tsx            # CenterOpeningIntro + TopNavbar + <Outlet /> + Footer + ScrollRestoration
│   │       ├── BookingLayout.tsx           # Focused distraction-free header + progress rail for /book
│   │       ├── PortalLayout.tsx            # Authenticated Patient Portal shell (/portal)
│   │       └── AdminLayout.tsx             # Role-protected Staff Admin sidebar layout (/admin)
│   ├── routes/                             # Lazy-loaded route entry modules & route table config
│   │   ├── routeConfig.tsx                 # Route definitions, path constants, lazy imports
│   │   ├── HomePage.tsx                    # PG-01: /
│   │   ├── AboutPage.tsx                   # PG-02: /about
│   │   ├── DoctorsDirectoryPage.tsx        # PG-03: /doctors
│   │   ├── DoctorProfilePage.tsx           # PG-04: /doctors/:doctorSlug
│   │   ├── SpecialtiesPage.tsx             # PG-05: /specialties
│   │   ├── SpecialtyDetailPage.tsx         # PG-06: /specialties/:specialtySlug
│   │   ├── BookingWizardPage.tsx           # PG-07: /book
│   │   ├── BookingConfirmationPage.tsx     # PG-08: /booking/confirmation/:referenceId
│   │   ├── ContactPage.tsx                 # PG-09: /contact
│   │   ├── FaqPage.tsx                     # PG-10: /faq
│   │   ├── PatientPortalPage.tsx           # PG-11: /portal
│   │   ├── PrivacyPolicyPage.tsx           # PG-12: /privacy-policy
│   │   ├── TermsOfServicePage.tsx          # PG-13: /terms-of-service
│   │   ├── CancellationPolicyPage.tsx      # PG-14: /cancellation-refund-policy
│   │   ├── AdminDashboardPage.tsx          # PG-15: /admin
│   │   └── NotFoundPage.tsx                # PG-16: *
│   ├── features/                           # Domain-specific feature slices
│   │   ├── intro/                          # Signature Two-Panel Center-Opening Intro
│   │   │   ├── components/
│   │   │   │   ├── CenterOpeningIntro.tsx
│   │   │   │   └── OrbaiSanctumEmblem.tsx
│   │   │   └── hooks/
│   │   │       └── useIntroSessionState.ts
│   │   ├── doctors/                        # Doctor Directory, Filters, Cards & Profile sections
│   │   │   ├── components/
│   │   │   │   ├── DoctorCard.tsx
│   │   │   │   ├── DoctorFilterBar.tsx
│   │   │   │   └── DoctorSlotPreviewWidget.tsx
│   │   │   ├── api/
│   │   │   │   └── doctorsApi.ts
│   │   │   └── types/
│   │   │       └── doctor.types.ts
│   │   ├── specialties/                    # Medical Specialties & Clinical Services
│   │   │   ├── components/
│   │   │   │   ├── SpecialtyBentoGrid.tsx
│   │   │   │   ├── SpecialtyCard.tsx
│   │   │   │   └── ClinicalServicesMatrix.tsx
│   │   │   └── api/
│   │   │       └── specialtiesApi.ts
│   │   ├── booking/                        # 7-Step Appointment Booking Engine
│   │   │   ├── components/
│   │   │   │   ├── Step1SpecialtySelect.tsx
│   │   │   │   ├── Step2DoctorSelect.tsx
│   │   │   │   ├── Step3AppointmentType.tsx
│   │   │   │   ├── Step4DateTimeSlotPicker.tsx
│   │   │   │   ├── Step5PatientDetailsForm.tsx
│   │   │   │   ├── Step6ReviewAndPayment.tsx
│   │   │   │   ├── BookingSummarySidebar.tsx
│   │   │   │   └── ConsultationFeeScheduleTable.tsx
│   │   │   ├── context/
│   │   │   │   └── BookingWizardContext.tsx
│   │   │   ├── api/
│   │   │   │   └── bookingApi.ts
│   │   │   └── utils/
│   │   │       └── istDateUtils.ts         # Asia/Kolkata timezone formatting & slot validation
│   │   ├── portal/                         # Authenticated Patient Portal
│   │   │   ├── components/
│   │   │   │   ├── PatientLoginCard.tsx
│   │   │   │   ├── AppointmentPassCard.tsx
│   │   │   │   └── RescheduleModal.tsx
│   │   │   └── api/
│   │   │       └── portalApi.ts
│   │   └── admin/                          # Staff Admin Dashboard
│   │       ├── components/
│   │       │   ├── AdminAppointmentsTable.tsx
│   │       │   ├── AdminDoctorEditorModal.tsx
│   │       │   ├── AdminFeeConfigPanel.tsx
│   │       │   ├── AdminSlotGenerator.tsx
│   │       │   └── AdminAuditLogTable.tsx
│   │       └── api/
│   │           └── adminApi.ts
│   ├── components/                         # Shared Design System & Technical Primitives
│   │   ├── ui/                             # shadcn/ui + CVA primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/                         # Shared structural organisms
│   │   │   ├── TopNavbar.tsx               # Strict 3-zone Top Bar Contract
│   │   │   ├── MobileNavDrawer.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SectionContainer.tsx
│   │   │   └── MedicalImageFrame.tsx       # Resilient image wrapper with zero-broken-image fallback
│   │   ├── motion/                         # Cherry-picked animated primitives
│   │   │   ├── react-bits/
│   │   │   │   ├── SplitTextReveal.tsx
│   │   │   │   └── DecryptedReferenceCode.tsx
│   │   │   ├── magic-ui/
│   │   │   │   ├── NumberTicker.tsx
│   │   │   │   └── AnimatedBeam.tsx
│   │   │   ├── aceternity/
│   │   │   │   ├── SpotlightCard.tsx
│   │   │   │   └── HeroAuroraSurface.tsx
│   │   │   └── ScrollStorySection.tsx      # GSAP ScrollTrigger wrapper
│   │   ├── three/                          # Lazy-loaded Three.js / R3F components
│   │   │   ├── ThreeCanvasGuard.tsx        # Capability + reduced-motion + IntersectionObserver guard
│   │   │   ├── OrbaiSanctumScene.tsx       # R3F glass refraction & botanical light sculpture
│   │   │   └── ThreeStaticFallback.tsx     # High-craft SVG/CSS architectural fallback
│   │   └── lottie/                         # Lazy-loaded Lottie vector animation wrapper
│   │       └── LottieViewportPlayer.tsx
│   ├── hooks/                              # Shared custom React hooks
│   │   ├── useReducedMotionPreference.ts
│   │   ├── useInViewport.ts
│   │   ├── useWebGLCapability.ts
│   │   └── useQueryParamsState.ts
│   ├── lib/                                # Core utilities & API client
│   │   ├── cn.ts                           # clsx + tailwind-merge helper
│   │   ├── apiClient.ts                    # Typed fetch wrapper with error normalization
│   │   ├── formatCurrencyINR.ts            # Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
│   │   └── env.ts                          # Validated client environment configuration
│   ├── tokens/                             # Style Dictionary source files & generated TS exports
│   │   ├── color.json
│   │   ├── typography.json
│   │   ├── spacing-radius.json
│   │   ├── motion.json
│   │   └── generated/
│   │       └── tokens.ts
│   ├── styles/
│   │   └── tokens.css                      # Generated by Style Dictionary (:root & .dark variables)
│   ├── assets/
│   │   └── images/                         # Generated photorealistic medical imagery (17 slots)
│   ├── types/                              # Shared domain & API contract TypeScript definitions
│   │   ├── api.types.ts
│   │   ├── booking.types.ts
│   │   └── domain.types.ts
│   ├── App.tsx                             # Root component mounting AppProviders + AppRouter
│   ├── main.tsx                            # React 19 createRoot entry point
│   └── index.css                           # @import "tailwindcss"; @import "./styles/tokens.css"; @theme inline
```

---

## 5. Routing Architecture (`react-router` Data Router)

### 5.1 Route Table, Layouts, Lazy Loading & Error Boundaries
All routes are configured via `createBrowserRouter` in `src/routes/routeConfig.tsx`. Every route module (except the primary `PublicLayout` shell and `HomePage` critical path) uses dynamic `lazy()` loading so the initial entry bundle stays `< 160 KB` gzipped.

```tsx
// src/routes/routeConfig.tsx
import { createBrowserRouter, ScrollRestoration } from 'react-router';
import { PublicLayout } from '@/src/app/layouts/PublicLayout';
import { BookingLayout } from '@/src/app/layouts/BookingLayout';
import { PortalLayout } from '@/src/app/layouts/PortalLayout';
import { AdminLayout } from '@/src/app/layouts/AdminLayout';
import { GlobalErrorBoundary } from '@/src/app/GlobalErrorBoundary';
import { HomePage } from '@/src/routes/HomePage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'about',
        lazy: async () => {
          const { AboutPage } = await import('@/src/routes/AboutPage');
          return { Component: AboutPage };
        },
      },
      {
        path: 'doctors',
        lazy: async () => {
          const { DoctorsDirectoryPage } = await import('@/src/routes/DoctorsDirectoryPage');
          return { Component: DoctorsDirectoryPage };
        },
      },
      {
        path: 'doctors/:doctorSlug',
        lazy: async () => {
          const { DoctorProfilePage } = await import('@/src/routes/DoctorProfilePage');
          return { Component: DoctorProfilePage };
        },
      },
      {
        path: 'specialties',
        lazy: async () => {
          const { SpecialtiesPage } = await import('@/src/routes/SpecialtiesPage');
          return { Component: SpecialtiesPage };
        },
      },
      {
        path: 'specialties/:specialtySlug',
        lazy: async () => {
          const { SpecialtyDetailPage } = await import('@/src/routes/SpecialtyDetailPage');
          return { Component: SpecialtyDetailPage };
        },
      },
      {
        path: 'booking/confirmation/:referenceId',
        lazy: async () => {
          const { BookingConfirmationPage } = await import('@/src/routes/BookingConfirmationPage');
          return { Component: BookingConfirmationPage };
        },
      },
      {
        path: 'contact',
        lazy: async () => {
          const { ContactPage } = await import('@/src/routes/ContactPage');
          return { Component: ContactPage };
        },
      },
      {
        path: 'faq',
        lazy: async () => {
          const { FaqPage } = await import('@/src/routes/FaqPage');
          return { Component: FaqPage };
        },
      },
      {
        path: 'privacy-policy',
        lazy: async () => {
          const { PrivacyPolicyPage } = await import('@/src/routes/PrivacyPolicyPage');
          return { Component: PrivacyPolicyPage };
        },
      },
      {
        path: 'terms-of-service',
        lazy: async () => {
          const { TermsOfServicePage } = await import('@/src/routes/TermsOfServicePage');
          return { Component: TermsOfServicePage };
        },
      },
      {
        path: 'cancellation-refund-policy',
        lazy: async () => {
          const { CancellationPolicyPage } = await import('@/src/routes/CancellationPolicyPage');
          return { Component: CancellationPolicyPage };
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/src/routes/NotFoundPage');
          return { Component: NotFoundPage };
        },
      },
    ],
  },
  {
    path: '/book',
    element: <BookingLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { BookingWizardPage } = await import('@/src/routes/BookingWizardPage');
          return { Component: BookingWizardPage };
        },
      },
    ],
  },
  {
    path: '/portal',
    element: <PortalLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { PatientPortalPage } = await import('@/src/routes/PatientPortalPage');
          return { Component: PatientPortalPage };
        },
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { AdminDashboardPage } = await import('@/src/routes/AdminDashboardPage');
          return { Component: AdminDashboardPage };
        },
      },
    ],
  },
]);
```

### 5.2 Scroll Restoration & GSAP ScrollTrigger Sync
`PublicLayout` renders `<ScrollRestoration getKey={(location) => location.pathname} />` and triggers `ScrollTrigger.refresh()` after route transitions settle so scroll-pinned positions never drift.

---

## 6. State Management Architecture

State is partitioned strictly into four tiers based on lifecycle and shareability:

| State Tier | Storage Mechanism | Owned Data in NovaCraft Orbai | Architectural Reasoning |
| :--- | :--- | :--- | :--- |
| **1. URL Search State** | `useSearchParams` (`react-router`) | • Doctor Directory filters (`?specialty=cardiology&type=video&lang=Hindi&sort=fee_asc`)<br>• Booking wizard entry deep-links (`?specialtyId=cardiology&doctorId=dr-arvind&step=4`)<br>• FAQ active category tab (`?category=pricing`) | Makes filtered doctor views and pre-selected booking links bookmarkable and shareable by patients and care coordinators. |
| **2. Ephemeral UI Component State** | `useState` / `useReducer` | • Mobile menu open/close state<br>• Accordion expansion state<br>• Form field focus/touched validation state | Strictly localized to a single component tree; avoids global re-renders. |
| **3. Cross-Step Session Context** | React Context + `sessionStorage` sync | • `BookingWizardContext`: Holds Steps 1–6 draft selections (`specialtyId`, `doctorId`, `appointmentType`, `dateIST`, `slotId`, `patientDetails`, `paymentMethod`)<br>• `ThemeContext`: Light (`#FAF8F5`) vs. Dark (`#071412`) preference<br>• `AuthContext`: Patient Portal session & Staff Admin RBAC session<br>• `IntroSessionState`: Whether the Center-Opening Intro has played in the current tab session | Prevents loss of patient form progress if the user accidentally refreshes `/book` on Step 5, while keeping sensitive drafts confined to `sessionStorage` (cleared upon tab close or booking completion). |
| **4. Server Resource Cache** | Custom typed fetch hooks (`useApiQuery` / `useApiMutation` backed by `src/lib/apiClient.ts`) | • Live doctor directory & specialty records (`/api/v1/doctors`, `/api/v1/specialties`)<br>• Real-time IST time slots (`/api/v1/slots`)<br>• Server-verified appointment records (`/api/v1/appointments/:referenceId`) | Guarantees that slot availability and payment status are always fetched fresh from the server rather than stale client memory. |

---

## 7. Design Token Pipeline (Style Dictionary → CSS Variables + Tailwind v4)

### 7.1 Source Token Schema (`src/tokens/color.json` & `src/tokens/motion.json`)
```json
{
  "color": {
    "brand": {
      "emerald": {
        "50":  { "value": "#EEF6F4" },
        "100": { "value": "#D5EAE4" },
        "200": { "value": "#AED5CB" },
        "300": { "value": "#7EB9AC" },
        "400": { "value": "#4E9A8B" },
        "500": { "value": "#277B6C" },
        "600": { "value": "#166154" },
        "700": { "value": "#0D4A3E" },
        "800": { "value": "#0A3A31" },
        "900": { "value": "#072B24" },
        "950": { "value": "#041915" }
      },
      "gold": {
        "400": { "value": "#D4B475" },
        "500": { "value": "#C5A059" },
        "600": { "value": "#A3803E" }
      }
    },
    "surface": {
      "light": {
        "canvas":   { "value": "#FAF8F5" },
        "elevated": { "value": "#FFFFFF" },
        "subtle":   { "value": "#F2EFE9" },
        "glass":    { "value": "rgba(250, 248, 245, 0.84)" }
      },
      "dark": {
        "canvas":   { "value": "#071412" },
        "elevated": { "value": "#0C211D" },
        "subtle":   { "value": "#112C27" },
        "glass":    { "value": "rgba(12, 33, 29, 0.84)" }
      }
    }
  }
}
```

### 7.2 Style Dictionary Build Configuration (`scripts/build-tokens.mjs`)
```javascript
// scripts/build-tokens.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['src/tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'src/tokens/generated/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

### 7.3 Tailwind CSS v4 `@theme inline` Integration (`src/index.css`)
Because the project uses `@tailwindcss/vite@^4.3.3`, design tokens map directly into Tailwind's utility engine via `@theme inline`:

```css
/* src/index.css */
@import "tailwindcss";
@import "./styles/tokens.css";

@theme inline {
  --color-canvas: var(--surface-canvas);
  --color-elevated: var(--surface-elevated);
  --color-subtle: var(--surface-subtle);
  --color-fg-primary: var(--fg-primary);
  --color-fg-secondary: var(--fg-secondary);
  --color-fg-muted: var(--fg-muted);
  --color-brand-primary: var(--brand-primary);
  --color-brand-hover: var(--brand-hover);
  --color-brand-accent: var(--brand-accent);
  --color-border-hairline: var(--border-hairline);
  --color-border-strong: var(--border-strong);
  --color-semantic-success: var(--semantic-success);
  --color-semantic-warning: var(--semantic-warning);
  --color-semantic-danger: var(--semantic-danger);
  --color-semantic-info: var(--semantic-info);

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  --ease-orbai-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-orbai-split: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 8. Component Architecture & CVA Pattern

Components follow a strict 4-layer hierarchy:
1. **Primitives (`src/components/ui/`):** Single-purpose accessible building blocks (`Button`, `Input`, `Select`, `Dialog`, `Accordion`, `Badge`, `Table`).
2. **Composites (`src/features/*/components/`):** Domain molecules (`DoctorCard`, `SpecialtyCard`, `Step4DateTimeSlotPicker`, `AppointmentPassCard`).
3. **Sections (`src/routes/sections/` or feature sections):** Full-width viewport compositions (`HeroSection`, `CenterOpeningIntro`, `TrustLedgerStrip`).
4. **Pages (`src/routes/*Page.tsx`):** Route-level orchestrators that bind URL/query state and data loaders to sections.

### Canonical CVA Implementation Example (`src/components/ui/button.tsx`)
```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg font-sans text-sm font-semibold transition-all duration-150 ease-orbai-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 cursor-pointer',
  {
    variants: {
      intent: {
        primary:
          'bg-brand-primary text-[#FAF8F5] hover:bg-brand-hover active:scale-[0.985] shadow-xs',
        secondary:
          'bg-subtle text-fg-primary border border-border-hairline hover:border-border-strong',
        outline:
          'bg-transparent text-brand-primary border border-brand-primary hover:bg-brand-primary/8',
        ghost:
          'bg-transparent text-fg-secondary hover:bg-subtle hover:text-fg-primary',
        danger:
          'bg-semantic-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3.5 py-1.5 text-xs',
        md: 'h-11 px-5 py-2.5 text-sm',
        lg: 'h-12 px-7 py-3 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ intent, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
```

---

## 9. Animation Architecture & Ownership Boundaries

### 9.1 Motion vs. GSAP Ownership Rule
- **Rule:** Never attach both a `<motion.*>` transform prop and a `gsap.to()` / `ScrollTrigger` tween to the same DOM node.
- **Structural Separation:** If a section is animated on scroll via GSAP and contains interactive cards animated via Motion, GSAP animates the **outer `.gsap-scroll-item` wrapper**, while Motion animates the **inner `<motion.article>` child**.

### 9.2 Signature Two-Panel Center-Opening Intro Architecture (`<CenterOpeningIntro />`)
- **Pre-Rendered Underlying DOM:** `PublicLayout` mounts `<TopNavbar />` and `<Outlet />` (including `<HomePage />`) immediately at `t = 0ms`. `<CenterOpeningIntro />` sits as a `fixed inset-0 z-50 pointer-events-auto` overlay above the already-rendered homepage.
- **Symmetrical Panel Geometry:**
  - Left Panel (`w-1/2 h-full left-0`): Houses the left half of the clipped Orbai Sanctum SVG crest along its right border (`border-r border-brand-primary/20`).
  - Right Panel (`w-1/2 h-full right-0`): Houses the right half of the clipped Orbai Sanctum SVG crest along its left border.
  - Center Typography Overlay: Displays `"Your Health. Our Priority."` and `"Exceptional care, designed around you."` centered across the seam.
- **Timing Choreography (`1.0s` Hold → `1.2s` Split):**
  - `0ms – 950ms`: Center emblem and typography gently settle (`opacity: 0 → 1`, `scale: 0.98 → 1`).
  - `950ms – 2150ms` (`1.2s` duration): Center text fades (`250ms`), and both panels translate symmetrically (`translate3d(-100%, 0, 0)` and `translate3d(100%, 0, 0)`) using `cubic-bezier(0.22, 1, 0.36, 1)`.
  - At `1100ms`, `pointer-events-none` is applied so the user can interact with the revealed Hero immediately without waiting for the final tail of the easing curve.
- **Future Asset Plug-In Contract:**
  ```ts
  export interface CenterOpeningIntroProps {
    brandName?: string; // Default: "NovaCraft Orbai"
    headline?: string; // Default: "Your Health. Our Priority."
    subheadline?: string; // Default: "Exceptional care, designed around you."
    leftPanelAssetUrl?: string; // Optional custom video/image/WebGL texture
    rightPanelAssetUrl?: string; // Optional custom video/image/WebGL texture
    forceReplay?: boolean;
    onComplete?: () => void;
  }
  ```

### 9.3 GSAP + React Cleanup Pattern (`useGSAP`)
```tsx
// src/components/motion/ScrollStorySection.tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotionPreference } from '@/src/hooks/useReducedMotionPreference';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScrollStorySection({ children }: { children: React.ReactNode }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotionPreference();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      const steps = gsap.utils.toArray<HTMLElement>('.gsap-booking-step');
      gsap.fromTo(
        steps,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return <div ref={containerRef}>{children}</div>;
}
```

---

## 10. 3D Architecture (Three.js / React Three Fiber + Drei)

1. **Selective Placement:** R3F is used strictly in `<OrbaiSanctumScene />` (subtle architectural glass & warm daylight refraction torus/orb behind the Hero and Intro). It is never loaded on `/book`, `/portal`, or `/admin`.
2. **Lazy Loading & Suspense:** Loaded via `const OrbaiSanctumScene = React.lazy(() => import('@/src/components/three/OrbaiSanctumScene'))` wrapped in `<Suspense fallback={<ThreeStaticFallback />}>`.
3. **Performance Guard (`<ThreeCanvasGuard />`):**
   - Checks WebGL2 availability, `navigator.hardwareConcurrency >= 4`, and `!prefersReducedMotion`.
   - Uses `IntersectionObserver` to set R3F `frameloop={isInView ? 'always' : 'never'}` so GPU usage drops to `0%` as soon as the user scrolls past the hero.
   - Caps pixel ratio at `dpr={[1, 1.5]}` and disables expensive post-processing blooms.
4. **Asset Pipeline:** Uses procedural Three.js geometry (`IcosahedronGeometry` / `TorusGeometry` with physical transmission/fresnel material) requiring `0 KB` external model downloads by default, while supporting optional Draco/KTX2 `.glb` replacement via Drei's `useGLTF.preload()`.

---

## 11. Lottie Architecture (`<LottieViewportPlayer />`)

1. **Lazy Library & JSON Import:** Both `lottie-web/build/player/lottie_light` (the lightweight SVG-only build) and the target animation `.json` payload are fetched dynamically only when the wrapper mounts.
2. **Visibility Play/Pause:** Uses `useInViewport` (`IntersectionObserver`) to call `animationInstance.pause()` when off-screen and `animationInstance.destroy()` on unmount.
3. **Reduced Motion Compliance:** If `prefers-reduced-motion: reduce` is active, calls `animationInstance.goToAndStop(totalFrames - 1, true)` to display the completed final illustration frame statically.

---

## 12. Performance, Accessibility, Error Handling & Tooling

### 12.1 Performance Strategy
- **Image Optimization:** All 17 medical image slots use `<MedicalImageFrame />` with explicit `aspectRatio`, `loading="lazy"` below the fold (`loading="eager"` + `fetchPriority="high"` on the Hero image), and an automatic CSS/SVG architectural fallback if an asset fails to load.
- **Font Loading:** Google Fonts (`Cormorant Garamond`, `Plus Jakarta Sans`, `IBM Plex Mono`) loaded with `display=swap` and preconnected in `index.html`.
- **Memoization:** Only memoize (`useMemo` / `React.memo`) computationally expensive filter/sort operations on the Doctor Directory and Slot Grid; avoid premature memoization of trivial primitives.

### 12.2 Error Handling & Environment Management
- **API Error Normalization:** `src/lib/apiClient.ts` parses structured JSON errors (`{ error: { code, message, fieldErrors } }`) from Express routes so UI components can distinguish `SLOT_ALREADY_BOOKED` (`409`), `VALIDATION_ERROR` (`400`), and `PAYMENT_GATEWAY_NOT_CONFIGURED` (`503`).
- **Environment Variables:** Client variables use `import.meta.env.VITE_*`; server secrets (`RAZORPAY_KEY_SECRET`, `ADMIN_PASSCODE`, `SESSION_SECRET`) remain strictly inside `server.ts` (`process.env.*`).

### 12.3 Tooling & Verification Pipeline
- **TypeScript (`tsconfig.json`):** Enforce `"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`, and path alias `"@/*": ["./*"]`.
- **Lint & Typecheck:** `npm run lint` (`tsc --noEmit`).
- **Production Build Check:** `npm run build` (`vite build`).
