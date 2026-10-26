# Frontend Design & Implementation Specification — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Aesthetic Archetype:** Architectural Sanctuary Healthcare (Luxury Private Hospital × Apple-Grade Precision)  
**Cross-References:** [`docs/PRD.md`](./PRD.md) · [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docs/RULES.md`](./RULES.md) · [`docs/PHASES.md`](./PHASES.md) · [`docs/BACKEND.md`](./BACKEND.md)

---

## 1. Design Direction Statement & Design Intelligence Disclosure

### 1.1 Design Intelligence Skill Disclosure (Verified Environment Check)
Per the repository validation rules, `/skills/system_skills/` was inspected prior to making design decisions:
- **Disclosure:** A standalone skill named `UI UX Pro Max` is **not installed** in `/skills/system_skills/`.
- **Applied Design Reasoning Engine:** In its place, we executed and cited the installed **`frontend-design` Universal Design Constitution** (`/skills/system_skills/frontend_design/SKILL.md` and `/skills/system_skills/frontend_design/references/2_landing_marketing.md`).
- **Key Findings Applied from `frontend-design`:**
  1. **Order of Resolution:** Function → Legibility & Accessibility (`WCAG AA` 4.5:1, `≥ 44px` mobile touch targets) → Layout Integrity (`1440px` desktop baseline) → Spatial & Typographic Math ($r_{\text{inner}} = r_{\text{outer}} - \text{padding}$) → Aesthetic Direction.
  2. **60-30-10 Color Discipline:** 60% Warm Ivory canvas (`#FAF8F5`), 30% Alabaster/Stone structural surfaces (`#FFFFFF` / `#F2EFE9`), 10% Deep Medical Emerald (`#0D4A3E`) and Botanical Gold (`#C5A059`) accent budget.
  3. **The 2+1 Font Rule & Anti-Defaulting:** Avoided `Inter`, `Roboto`, and `Space Grotesk`; paired editorial serif **`Cormorant Garamond`** (Display) with **`Plus Jakarta Sans`** (Body/UI) and **`IBM Plex Mono`** (`tabular-nums` for `₹` pricing, IST slots, and reference IDs).
  4. **Zero-Pill Static Metadata Discipline:** Doctor qualifications, experience, and languages spoken are rendered as clean inline text separated by middle dots (`·`), never wrapped in static capsule badges.
  5. **Strict 3-Zone Top Bar Contract:** Single-row header (`[NovaCraft Orbai wordmark] — [5 single-line nav links] — [1 primary Book Appointment CTA]`).

### 1.2 Visual Direction Statement
**NovaCraft Orbai** rejects the cold, sterile cyan-blue clichés of hospital templates. Instead, it evokes the calm architectural permanence of a world-class private medical sanctuary—combining sunlit travertine and warm ivory surfaces (`#FAF8F5`), deep botanical emerald authority (`#0D4A3E`), hairline stone borders, and unhurried editorial typography. Every screen prioritizes patient reassurance, pricing transparency in Indian Rupees (`₹`), and effortless step-by-step appointment booking.

---

## 2. Complete Design System & Token Specification

### 2.1 Color System (`50–950` Scales, Semantic Tokens, Light & Dark Modes)

#### Primary Scale: Deep Medical Emerald (`brand.emerald`)
| Step | Token Name | Hex | RGB | Primary Usage |
| :--- | :--- | :--- | :--- | :--- |
| `50` | `--color-emerald-50` | `#EEF6F4` | `rgb(238, 246, 244)` | Subtle selected slot tint & active filter wash (Light) |
| `100` | `--color-emerald-100` | `#D5EAE4` | `rgb(213, 234, 228)` | Focus ring halo & subtle department icon container |
| `200` | `--color-emerald-200` | `#AED5CB` | `rgb(174, 213, 203)` | Selected card border accent |
| `300` | `--color-emerald-300` | `#7EB9AC` | `rgb(126, 185, 172)` | Dark mode interactive text link |
| `400` | `--color-emerald-400` | `#4E9A8B` | `rgb(78, 154, 139)` | Dark mode primary button hover |
| `500` | `--color-emerald-500` | `#277B6C` | `rgb(39, 123, 108)` | Dark mode primary CTA fill |
| `600` | `--color-emerald-600` | `#166154` | `rgb(22, 97, 84)` | Light mode primary button hover state |
| `700` | `--color-emerald-700` | `#0D4A3E` | `rgb(13, 74, 62)` | **Primary Brand Anchor (Light mode CTA & Emblem)** |
| `800` | `--color-emerald-800` | `#0A3A31` | `rgb(10, 58, 49)` | Active press state (`active:bg-emerald-800`) |
| `900` | `--color-emerald-900` | `#072B24` | `rgb(7, 43, 36)` | Deep editorial banner surface & Intro Panel seam |
| `950` | `--color-emerald-950` | `#041915` | `rgb(4, 25, 21)` | Deepest structural dark anchor |

#### Neutral Scale: Warm Architectural Stone (`neutral.stone`)
| Step | Token Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `50` | `--color-stone-50` | `#FAF8F5` | **Light Mode Dominant Canvas (60% budget)** |
| `100` | `--color-stone-100` | `#F2EFE9` | Secondary section alternating surface & subtle card wells |
| `200` | `--color-stone-200` | `#E4DFD5` | Hairline structural border (`--border-hairline` in Light mode) |
| `300` | `--color-stone-300` | `#CFC8BA` | Input border & hover border (`--border-strong`) |
| `400` | `--color-stone-400` | `#9E9689` | Disabled text & placeholder copy |
| `500` | `--color-stone-500` | `#6E675C` | Muted metadata text (`--fg-muted` in Light mode) |
| `600` | `--color-stone-600` | `#4D473F` | Secondary body prose (`--fg-secondary` in Light mode) |
| `700` | `--color-stone-700` | `#36312B` | Subheadings & table labels |
| `800` | `--color-stone-800` | `#23201C` | High-contrast UI labels |
| `900` | `--color-stone-900` | `#141817` | **Primary Foreground Ink (`--fg-primary` in Light mode)** |
| `950` | `--color-stone-950` | `#071412` | **Dark Mode Dominant Canvas ("Night Ward")** |

#### Secondary Accent Scale: Botanical Warm Gold (`brand.gold`)
- `--color-gold-400`: `#D4B475` (Dark mode emblem highlight)
- `--color-gold-500`: `#C5A059` (Orbai Sanctum center node & subtle luxury divider accent)
- `--color-gold-600`: `#8C6B2B` (Light mode accessible text/icon accent on ivory)

#### Semantic Tokens & WCAG 2.2 AA Contrast Verification Table

| Semantic Token | Light Mode Value | Dark Mode (`.dark`) Value | Foreground / Surface Pair Tested | Measured WCAG Contrast | Pass Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--surface-canvas` | `#FAF8F5` | `#071412` | `--fg-primary` on `--surface-canvas` | `15.8 : 1` (Light) / `14.9 : 1` (Dark) | **AAA** (`≥ 7:1`) |
| `--surface-elevated` | `#FFFFFF` | `#0C211D` | `--fg-primary` on `--surface-elevated` | `17.4 : 1` (Light) / `13.6 : 1` (Dark) | **AAA** (`≥ 7:1`) |
| `--fg-primary` | `#141817` | `#F4F1EA` | Body prose on canvas & cards | `15.8 : 1` (Light) / `14.9 : 1` (Dark) | **AAA** |
| `--fg-secondary` | `#4A524F` | `#B8C7C3` | Supporting copy on canvas | `7.3 : 1` (Light) / `8.9 : 1` (Dark) | **AAA** |
| `--fg-muted` | `#5C6662` | `#8CA39D` | Metadata (`·` separated) on canvas | `5.4 : 1` (Light) / `5.6 : 1` (Dark) | **AA** (`≥ 4.5:1`) |
| `--brand-primary` | `#0D4A3E` | `#277B6C` | `#FAF8F5` text on `#0D4A3E` CTA button | `9.6 : 1` (Light) / `4.9 : 1` (Dark) | **AA / AAA** |
| `--border-hairline` | `#E4DFD5` | `#1A3832` | Structural hairline card divider | Subtle (`ΔL = 6%`) | Decorative / Structural |
| `--ring-focus` | `#0D4A3E` | `#4E9A8B` | `2px` focus-visible outline | `9.6 : 1` (Light) / `5.8 : 1` (Dark) | **AA** (`≥ 3:1` UI) |
| `--semantic-success` | `#115E38` (bg `#E8F5EE`) | `#4ADE80` (bg `#0B2E1E`) | `PAID` / `CONFIRMED` status text + icon | `7.4 : 1` (Light) / `8.2 : 1` (Dark) | **AAA** |
| `--semantic-warning` | `#854D0E` (bg `#FEF7E6`) | `#FACC15` (bg `#2D2109`) | `PAYMENT_PENDING` / `SAMPLE_DATA` | `6.8 : 1` (Light) / `9.1 : 1` (Dark) | **AA / AAA** |
| `--semantic-danger` | `#991B1B` (bg `#FEECEC`) | `#F87171` (bg `#331010`) | `PAYMENT_FAILED` / Form validation alert | `7.9 : 1` (Light) / `6.4 : 1` (Dark) | **AA / AAA** |
| `--semantic-info` | `#0E4F6E` (bg `#EBF5FA`) | `#38BDF8` (bg `#0C2A3B`) | `VIDEO_CONSULTATION` instructions | `7.8 : 1` (Light) / `7.5 : 1` (Dark) | **AAA** |

---

### 2.2 Typography System (The 2+1 Font Rule)

| Role | Font Family | Weights Loaded | Reasoning & Character |
| :--- | :--- | :--- | :--- |
| **Display & Editorial Headings (`--font-display`)** | **`Cormorant Garamond`** | `500` (Medium), `600` (SemiBold) | High-contrast classical serif that communicates heritage, clinical authority, and serene luxury on large headlines without feeling sterile. |
| **Body Prose & Functional UI (`--font-sans`)** | **`Plus Jakarta Sans`** | `400` (Regular), `600` (SemiBold) | Exceptionally open apertures and tall x-height; effortless legibility for senior patients reading medical specialty descriptions and form labels at `15px–16px`. |
| **INR Pricing, IST Slots & Reference Codes (`--font-mono`)** | **`IBM Plex Mono`** | `500` (Medium) | Enforces `font-variant-numeric: tabular-nums` so `₹499`, `₹799`, `₹999`, `10:30 AM IST`, and `NCO-2026-849201` align with clinical precision. |

#### Fluid Type Scale & Line-Height Matrix
| Token | Element / Usage | Fluid Size (`clamp()`) | Line Height | Letter Spacing | Max Measure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--text-hero` | Hero `<h1>` (`Keep Your Health Fit...`) | `clamp(2.5rem, 4.2vw + 1rem, 4.25rem)` (`40px–68px`) | `1.08` | `-0.02em` | `18ch` (`text-wrap: balance`) |
| `--text-h1` | Page Header `<h1>` | `clamp(2.125rem, 3.2vw + 0.75rem, 3.25rem)` (`34px–52px`) | `1.12` | `-0.015em` | `22ch` (`text-wrap: balance`) |
| `--text-h2` | Section Heading `<h2>` | `clamp(1.75rem, 2.4vw + 0.5rem, 2.5rem)` (`28px–40px`) | `1.18` | `-0.01em` | `28ch` (`text-wrap: balance`) |
| `--text-h3` | Card / Subsection Heading `<h3>` | `clamp(1.25rem, 1.2vw + 0.5rem, 1.5rem)` (`20px–24px`) | `1.28` | `-0.005em` | `36ch` |
| `--text-body-lg` | Lead paragraph / Hero subcopy | `clamp(1.0625rem, 0.4vw + 0.95rem, 1.25rem)` (`17px–20px`) | `1.6` | `0em` | `62ch` |
| `--text-body` | Standard prose & form inputs | `1rem` (`16px`) | `1.65` | `0em` | `68ch` |
| `--text-sm` | UI controls, buttons, table cells | `0.875rem` (`14px`) | `1.5` | `0.005em` | Single-line / `60ch` |
| `--text-xs` | Quiet metadata & disclaimers | `0.8125rem` (`13px`) | `1.45` | `0.01em` | `65ch` |

---

### 2.3 Spacing, Grid, Container Widths, Breakpoints, Radius & Elevation

- **Base Rhythm:** Strict `4px` / `8px` spatial scale (`4, 8, 12, 16, 24, 32, 48, 64, 96, 128px`).
- **Container Architecture:**
  - Max Desktop Container (`--container-max`): `1440px` (`max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12`).
  - Reading Prose Container (`--container-prose`): `768px` (`max-w-3xl`).
  - Booking Wizard Container (`--container-wizard`): `1180px` (`8-col` active step panel + `4-col` sticky summary sidebar on `lg+`).
- **Responsive Breakpoints:**
  - `xs`: `360px` (Compact Android baseline)
  - `sm`: `640px`
  - `md`: `768px` (Tablet Portrait)
  - `lg`: `1024px` (Tablet Landscape / Split-Column Activation)
  - `xl`: `1280px`
  - `2xl`: `1440px` (Desktop Master Canvas)
- **Border Radius Math:**
  - `--radius-sm`: `6px` (Inline segmented buttons)
  - `--radius-md`: `8px` (Inputs, primary buttons, inner card images)
  - `--radius-lg`: `12px` (Standard cards, slot containers)
  - `--radius-xl`: `16px` (Hero image frame, outer bento containers with `p-2` [`8px`] → inner child uses `--radius-md` [`8px`])
- **Elevation & Borders:**
  - Default cards use a `1px solid var(--border-hairline)` stroke with zero drop shadow.
  - Interactive hover and sticky surfaces use `--shadow-orbai-subtle`: `0 12px 32px -8px rgba(13, 74, 62, 0.06), 0 2px 6px -1px rgba(20, 24, 23, 0.04)`.

---

### 2.4 Motion Tokens & Iconography Rules

#### Motion Tokens (`src/tokens/motion.json`)
| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--duration-instant` | `100ms` | Active button press (`scale(0.985)`) |
| `--duration-fast` | `160ms` | Hover color/border shifts, focus ring transitions |
| `--duration-normal` | `280ms` | Modal/Drawer enter, tab indicator slide, wizard step crossfade |
| `--duration-intro-hold` | `1000ms` | Signature Center-Opening Intro initial symmetrical hold |
| `--duration-intro-split` | `1200ms` | Signature Center-Opening Intro two-panel outward separation |
| `--ease-orbai-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default UI settling curve |
| `--ease-orbai-split` | `cubic-bezier(0.22, 1, 0.36, 1)` | Architectural sliding door curve for Center-Opening Intro |
| `--stagger-cards` | `60ms` | Stagger interval between Doctor/Specialty cards on initial reveal |

#### Iconography Rules (`lucide-react`)
- **Exclusive Library:** `lucide-react` only (zero emojis, zero mixed FontAwesome/Material icons).
- **Stroke Width:** Uniform `strokeWidth={1.75}` across all `20px` and `24px` icons; `strokeWidth={2}` for `16px` inline status icons.
- **Sizes:** `16px` (`w-4 h-4` inline metadata/status), `20px` (`w-5 h-5` buttons/inputs), `24px` (`w-6 h-6` section/department headers).
- **Accessibility:** Always add `aria-hidden="true"` on icons beside visible text labels.

---

## 3. Complete Component Inventory Matrix

| Component Name | File Path | Source Layer | CVA Variants | Interactive States | Animation Engine |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CenterOpeningIntro` | `src/features/intro/components/CenterOpeningIntro.tsx` | Custom + Aceternity (`HeroAuroraSurface`) | `state`: `holding \| splitting \| complete \| skipped` | `Skip Intro` button (`default`, `hover`, `focus-visible`) | **Motion** (`translate3d` split) |
| `OrbaiSanctumEmblem` | `src/features/intro/components/OrbaiSanctumEmblem.tsx` | Custom SVG | `size`: `sm \| md \| lg \| intro`, `half`: `full \| left \| right` | Static / subtle SVG path draw on intro | **Motion** (`pathLength`) |
| `TopNavbar` | `src/components/layout/TopNavbar.tsx` | Custom (3-Zone Contract) | `surface`: `transparent \| scrolled` | Links (`hover` underline, `focus-visible`), CTA | CSS `160ms` transition |
| `Button` | `src/components/ui/button.tsx` | `shadcn/ui` + CVA | `intent`: `primary \| secondary \| outline \| ghost \| danger`; `size`: `sm \| md \| lg \| icon` | `default`, `hover`, `focus-visible`, `active`, `disabled`, `isLoading` | **Motion** (`whileTap`) |
| `SplitTextReveal` | `src/components/motion/react-bits/SplitTextReveal.tsx` | **React Bits** | `as`: `h1 \| h2`, `align`: `left \| center` | Static display | **Motion** (word stagger) |
| `DecryptedReferenceCode` | `src/components/motion/react-bits/DecryptedReferenceCode.tsx` | **React Bits** | `variant`: `confirmation \| compact` | Copy-to-clipboard button state | **Motion** (character settle) |
| `NumberTicker` | `src/components/motion/magic-ui/NumberTicker.tsx` | **Magic UI** | `prefix`: `'₹' \| ''`, `size`: `sm \| md \| lg` | Static `tabular-nums` | **Motion** (`useSpring`) |
| `AnimatedBeam` | `src/components/motion/magic-ui/AnimatedBeam.tsx` | **Magic UI** | `tone`: `emerald \| gold` | Static SVG connector | **Motion** (SVG gradient offset) |
| `SpotlightCard` | `src/components/motion/aceternity/SpotlightCard.tsx` | **Aceternity UI** | `surface`: `elevated \| subtle`, `padding`: `md \| lg` | `default`, `hover` radial spotlight, `focus-within` | CSS radial-gradient mouse tracker |
| `OrbaiSanctumScene` | `src/components/three/OrbaiSanctumScene.tsx` | **Three.js / R3F + Drei** | `mode`: `light \| dark` | Pointer parallax tilt; pauses off-screen | **R3F** (`useFrame` on-demand) |
| `LottieViewportPlayer` | `src/components/lottie/LottieViewportPlayer.tsx` | **Lottie Web** | `size`: `sm \| md \| lg`, `loop`: ` boolean` | Plays in viewport; static final frame on reduced-motion | **Lottie Web** SVG |
| `DoctorCard` | `src/features/doctors/components/DoctorCard.tsx` | Custom Composite | `layout`: `grid \| horizontal \| compact` | Card hover border shift, `View Profile` & `Book` buttons | **Motion** (`y: -2` hover) |
| `SpecialtyCard` | `src/features/specialties/components/SpecialtyCard.tsx` | Custom + `SpotlightCard` | `span`: `default \| wide` | Hover image scale (`1.03`), link arrow shift | CSS / **Motion** |
| `Step4DateTimeSlotPicker` | `src/features/booking/components/Step4DateTimeSlotPicker.tsx` | Custom + `shadcn/ui` | `slotState`: `available \| selected \| booked \| past` | `default`, `hover`, `focus-visible`, `selected`, `disabled` | **Motion** (`layoutId` date pill) |
| `ConsultationFeeScheduleTable` | `src/features/booking/components/ConsultationFeeScheduleTable.tsx` | `shadcn/ui` Table | `density`: `comfortable \| compact` | Row hover highlight, direct `Book` action | None |

---

## 4. Section-by-Section Page Specifications

### 4.1 Signature Opening Animation (`<CenterOpeningIntro />`)
- **Viewport Behavior:** Fixed `100vw × 100dvh` (`z-50`) overlay composed of two `50vw` panels (`leftPanel` and `rightPanel`) meeting at an exact `1px` vertical center seam (`border-brand-accent/30`).
- **Visual Composition:**
  - Background: Deep Sanctuary Emerald (`#072B24`) with subtle radial warm-ivory ambient light (`HeroAuroraSurface`).
  - Center Lockup: The 56px **Orbai Sanctum Emblem** split symmetrically across the seam, above `"Your Health. Our Priority."` (`Cormorant Garamond`, `clamp(2rem, 3.5vw, 3.25rem)`, `#FAF8F5`) and `"Exceptional care, designed around you."` (`Plus Jakarta Sans`, `16px`, `#D5EAE4`).
- **Choreography:**
  - `0.0s – 1.0s`: Emblem and headline settle smoothly in the center while `<HomePage />` renders fully behind the panels.
  - `1.0s – 2.2s` (`1.2s` duration): Left panel slides to `translate3d(-100%, 0, 0)` and Right panel slides to `translate3d(100%, 0, 0)` with `--ease-orbai-split` (`cubic-bezier(0.22, 1, 0.36, 1)`), parting from the exact center to reveal the Hero section.
- **Responsive Adaptation (`360px` Mobile):** Typography scales cleanly (`28px` headline) with `px-6` safe padding so zero characters clip at the center seam.

### 4.2 Homepage (`/` — `HomePage.tsx`)
1. **Main Hero Section (`"Keep Your Health Fit. Live Your Best Life."`):**
   - **Layout:** `1440px` container, 12-column grid (`items-stretch gap-8 lg:gap-12`). Left 6 columns: quiet kicker (`NovaCraft Orbai · Flagship Medical Sanctuary`), `<h1>` via `<SplitTextReveal />`, supporting prose, button group (`Book an Appointment` primary + `Explore Our Doctors` secondary), and subtle trust line (`"Personalized care. Experienced professionals. A better healthcare experience."`). Right 6 columns: `<MedicalImageFrame slot="img_hero_sanctuary" aspectRatio="4/3" />` layered with subtle `<ThreeCanvasGuard><OrbaiSanctumScene /></ThreeCanvasGuard>`.
2. **Section A — Trust & Credibility Strip:**
   - **Layout:** Full-width architectural border-top/bottom ledger with 4 columns: Outpatient Hours (`08:00 – 20:00 IST`), Consultation Fee Transparency (`₹299 – ₹999 Illustrative Schedule`), Appointment Integrity (`Real-Time Server Slot Locking`), and Clinical Governance (`Sample Prototype Environment — Admin Configurable`).
3. **Section B — Medical Specialties Bento Grid:**
   - **Layout:** Asymmetric 12-column grid featuring 8 flagship departments (`General Medicine`, `Cardiology`, `Orthopedics`, `Pediatrics`, `Neurology`, `Dermatology`, `Women's Healthcare`, `Diagnostic Services`) wrapped in `<SpotlightCard />` with bespoke medical photography, plain-English overview, starting `₹` fee (`tabular-nums`), and `Explore Department →` link.
4. **Section C — Featured Doctors:**
   - **Layout:** 3-column desktop (`1-col` mobile, `2-col` tablet) grid of `<DoctorCard />`. Displays 3:4 studio portrait, name, specialty, unboxed `·`-separated qualifications & languages, explicit `Sample Profile` or `Verified` text label, exact `₹` fee, `View Profile`, and `Book Appointment`.
5. **Section D — How Appointment Booking Works:**
   - **Layout:** 3-column numbered architectural sequence (`01. Choose Your Doctor`, `02. Select Your Preferred Time`, `03. Confirm Your Appointment`) connected by `<AnimatedBeam />` and revealed via GSAP `ScrollTrigger` (`ScrollStorySection`).
6. **Section E — Hospital Architecture & Facilities:**
   - **Layout:** Split editorial showcase (`img_campus_exterior`, `img_campus_interior`, `img_waiting_lounge`) with GSAP subtle vertical image parallax.
7. **Section F — Why Choose NovaCraft Orbai & Section G — Patient Care Services:**
   - **Layout:** 2×2 architectural grid highlighting transparent INR pricing, zero double-booking, dedicated care concierge (`img_care_concierge`), and preventive health lounges (`img_service_preventive`). Per Clinical Honesty rules, no fabricated patient reviews are shown unless authorized testimonials exist in the backend store.
8. **Section H — Transparent INR Fee Schedule & FAQ Accordion:**
   - **Layout:** Split 5-column (9-tier INR Consultation Pricing Table in `₹`) + 7-column (`shadcn/ui` `<Accordion />` answering practical patient policies).
9. **Section I — Final Appointment CTA:**
   - **Layout:** Full-width Deep Medical Emerald (`#072B24`) architectural frame with `"Your Health Deserves Thoughtful Care."` and high-contrast Warm Ivory `Book an Appointment` button.

### 4.3 7-Step Appointment Booking Page (`/book` — `BookingWizardPage.tsx`)
- **Desktop Layout (`1024px+`):** 12-column grid. Left 8 columns: Step Progress Bar (`Steps 1 to 6`) + animated step viewport (`<AnimatePresence mode="wait">`). Right 4 columns: Sticky `<BookingSummarySidebar />` displaying live selected Specialty, Doctor portrait, Appointment Type, IST Date/Time, and itemized `₹` fee.
- **Mobile Layout (`360px–1023px`):** Single-column step card + compact sticky bottom summary bar (`height: 56px`, `< 15%` viewport cap) that expands a sheet to review selections.

---

## 5. Scroll Storytelling Plan (GSAP + ScrollTrigger)

| Target Section | Trigger Element | Start / End Threshold | GSAP Animation Specification |
| :--- | :--- | :--- | :--- |
| **Home Section D: 3-Step Booking Explainer** | `.gsap-booking-story` | `start: 'top 80%'`, `end: 'bottom 30%'` | Staggered entrance (`opacity: 0 → 1`, `y: 24 → 0`, `duration: 0.65`, `stagger: 0.15`, `ease: 'power3.out'`) across steps `01`, `02`, `03` and progress line scaleX (`0 → 1`). |
| **Home Section E & About Campus Architecture** | `.gsap-parallax-frame` | `start: 'top bottom'`, `end: 'bottom top'`, `scrub: 0.6` | Inner `<img />` (`scale: 1.08`) translates `yPercent: -6` to `6` inside overflow-hidden `<MedicalImageFrame />`. |
| **Specialty & Doctor Section Headers** | `.gsap-section-header` | `start: 'top 85%'` | Subtle rule divider expansion (`scaleX: 0 → 1`, `transformOrigin: 'left center'`, `duration: 0.7`, `ease: 'expo.out'`). |

---

## 6. 3D Scene Specification (`<OrbaiSanctumScene />`)

- **Engine:** `@react-three/fiber` + `@react-three/drei` + `three`.
- **Camera:** `<PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={38} />`.
- **Lighting:** Warm clinical daylight studio setup—1 directional key light (`#FAF8F5`, intensity `1.8`, position `[3, 4, 4]`), 1 botanical emerald rim light (`#277B6C`, intensity `1.2`, position `[-3, -2, 2]`), and soft ambient fill (`0.6`).
- **Geometry & Shader:** An architectural double-ring orbital sculpture (`TorusGeometry` + centralfaceted `IcosahedronGeometry`) using physical transmission/fresnel material (`roughness: 0.15`, `transmission: 0.92`, `ior: 1.45`, `thickness: 0.6`, subtle emerald-gold tint).
- **Interaction:** Gently interpolates rotation (`THREE.MathUtils.lerp`) toward pointer coordinates (`pointer.x * 0.18`, `pointer.y * 0.18`).
- **Fallback (`<ThreeStaticFallback />`):** When WebGL is unavailable or `prefers-reduced-motion: reduce` is enabled, renders a layered radial SVG architectural geometry diagram with zero JS overhead.

---

## 7. Lottie Asset Inventory & Playback Spec

| Asset Filename | Path | Used In Component | Trigger & Loop Behavior |
| :--- | :--- | :--- | :--- |
| `booking-confirmed.json` | `/public/assets/lottie/booking-confirmed.json` | `BookingConfirmationPage.tsx` (Step 7 header) | Plays once (`loop={false}`) on confirmation mount; settles on verified checkmark frame. |
| `empty-search.json` | `/public/assets/lottie/empty-search.json` | `DoctorsDirectoryPage.tsx` (0 filter matches) | Gentle 2.5s loop (`loop={true}`) while in viewport; pauses off-screen. |
| `verifying-payment.json` | `/public/assets/lottie/verifying-payment.json` | `Step6ReviewAndPayment.tsx` (Razorpay / Slot lock in-flight) | Loops while `isSubmitting === true`. |

---

## 8. Responsive, Dark Mode, States, Accessibility & SEO Specs

### 8.1 Responsive Breakpoint Rules
- **`360px–639px` (Mobile):** Single-column grids (`grid-cols-1`), `16px` container padding, `44×44px` minimum button/slot targets, horizontal scrollable date strip in Step 4, collapsible drawer navigation.
- **`768px–1023px` (Tablet):** 2-column doctor and specialty grids (`md:grid-cols-2`), `32px` container padding.
- **`1024px–1440px+` (Desktop):** Full 12-column asymmetric bento grids, split-column Hero (`items-stretch`), sticky 4-column Booking Summary rail.

### 8.2 Dark Mode Strategy ("Night Ward" Theme)
- Toggled via `ThemeContext` (`class="dark"` on `<html>`, persisted in `localStorage` with system `prefers-color-scheme` fallback).
- In Dark Mode, canvas shifts to `#071412`, cards shift to `#0C211D` with `#1A3832` hairline borders, and typography applies `+0.01em` tracking compensation so light text on dark emerald surfaces remains crisp.

### 8.3 SEO & Structured Data Specification
- **Default Title Template:** `%s | NovaCraft Orbai — Private Medical & Hospital Sanctuary`
- **Homepage Title:** `NovaCraft Orbai | Keep Your Health Fit — Book Specialist Appointments in INR`
- **JSON-LD:** Injects `@type: "MedicalOrganization"` on `/`, `@type: "Physician"` on `/doctors/:doctorSlug`, and `@type: "FAQPage"` on `/faq`.
