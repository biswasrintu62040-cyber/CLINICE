# Product Requirements Document (PRD) — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Project Type:** Ultra-Premium Medical & Hospital Appointment Booking Platform  
**Locale & Timezone Baseline:** `en-IN` (Indian English) · `Asia/Kolkata` (IST, UTC+05:30) · Currency: `INR` (`₹`)  
**Cross-References:** [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docs/RULES.md`](./RULES.md) · [`docs/PHASES.md`](./PHASES.md) · [`docs/FRONTEND.md`](./FRONTEND.md) · [`docs/BACKEND.md`](./BACKEND.md)

---

## 1. Repository Baseline & Evidence Audit (Source of Truth)

Before defining target product requirements, the existing repository was audited to separate **confirmed repository facts** from **planned target features**:

| Category | Confirmed Repository State (Current) | Target State (Specified Across Phases 0–7) |
| :--- | :--- | :--- |
| **Framework & Build** | `react@^19.0.1`, `react-dom@^19.0.1`, `vite@^8.3.0`, `@vitejs/plugin-react@^6.1.1`, `typescript@^7.0.2` | Maintained; TypeScript `strict: true` enforced in `tsconfig.json` (currently `strict` is not enabled). |
| **Styling** | `tailwindcss@^4.3.3`, `@tailwindcss/vite@^4.3.3`, `autoprefixer@^10.4.21`; `/src/index.css` contains `@import "tailwindcss";` | Extended with Style Dictionary token pipeline (`tokens/` → CSS Custom Properties + Tailwind v4 `@theme` mapping). |
| **Motion & Icons** | `motion@^12.23.24`, `lucide-react@^0.546.0` | Retained + augmented with `gsap`, `@gsap/react`, `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lottie-web`, `class-variance-authority`, `clsx`, `tailwind-merge`. |
| **Routing** | Not yet installed (`src/App.tsx` renders an empty `<div></div>`) | `react-router@^7.x` (`createBrowserRouter` data router with lazy-loaded route modules). |
| **Backend Runtime** | `express@^4.21.2`, `dotenv@^17.2.3`, `tsx@^4.21.0` installed in `package.json`; no `server.ts` exists yet | Express 4 API server (`server.ts`) with atomic slot locking, Razorpay order/signature verification, and Pay-at-Hospital support. |
| **Environment Vars** | `/.env.example` defines `GEMINI_API_KEY` and `APP_URL` | Extended with public/server configuration variables documented in [`docs/BACKEND.md`](./BACKEND.md). |

---

## 2. Executive Overview, Problem Statement, Goals & Non-Goals

### 2.1 Executive Overview
**NovaCraft Orbai** is an ultra-premium private hospital and multi-specialty medical appointment-booking platform engineered for the Indian healthcare market. It combines architectural digital craftsmanship—highlighted by a signature 1.0–1.5 second symmetrical center-opening entrance—with clinical clarity, transparent Indian Rupee (`₹`) consultation pricing, a friction-free 7-step appointment booking engine, an authenticated Patient Portal, and a role-protected Staff Admin Dashboard.

### 2.2 Problem Statement
Patients seeking private specialist care in India frequently encounter two broken extremes:
1. **Fragmented, low-trust hospital portals:** Cluttered blue templates with hidden consultation fees, unverified doctor listings, confusing department jargon, and form submissions that act as passive callback requests rather than real-time slot reservations.
2. **Visually over-engineered brochure sites:** Heavy marketing pages that lag on mid-range mobile devices, obscure critical clinical information behind decorative animations, and fail to prevent double-booking or verify payment states on the server.

### 2.3 Product Goals
- **G-01 (Signature First Impression without Friction):** Deliver a signature symmetrical two-panel center-opening intro animation (`1.0s–1.5s` total duration) that reveals the pre-rendered NovaCraft Orbai homepage immediately behind it, respecting `prefers-reduced-motion` and session persistence.
- **G-02 (Transparent INR Pricing & Clinical Honesty):** Present clear, configurable Indian Rupee (`₹`) consultation fees (`₹299` to `₹999`) across specialties, doctor profiles, and booking summaries without fabricated doctor credentials, invented ratings, or hidden charges.
- **G-03 (Zero-Ambiguity 7-Step Booking Journey):** Guide patients from specialty selection to server-confirmed appointment creation in under 90 seconds, supporting both verified Razorpay checkout and a clearly labeled Pay-at-Hospital workflow.
- **G-04 (Full-Lifecycle Patient & Admin Governance):** Provide authenticated patients with self-service appointment viewing, rescheduling, and cancellation, and provide authorized hospital staff with a dedicated Admin Dashboard to manage doctors, specialties, slots, fees, and booking states.
- **G-05 (Production Performance & Accessibility):** Meet strict Core Web Vitals budgets (`LCP < 2.5s`, `CLS < 0.1`, `INP < 200ms`) and `WCAG 2.2 AA` accessibility compliance across desktop (`1440px`) and mobile (`360px+`) viewports.

### 2.4 Non-Goals
- **NG-01:** NovaCraft Orbai does **not** provide automated clinical diagnosis, symptom triage chatbots, or AI medical advice.
- **NG-02:** The platform does **not** store raw credit/debit card numbers, CVVs, or UPI PINs on its own servers; all online payment instrument capture is delegated to Razorpay's PCI-DSS compliant checkout flow with server-side HMAC-SHA256 verification.
- **NG-03:** The platform does **not** fabricate medical registration numbers (NMC/SMC), hospital accreditations (NABH/JCI), patient counts, or patient testimonials. Unverified fields are explicitly labeled as illustrative sample data until populated by authorized hospital administrators.
- **NG-04:** Inpatient Electronic Medical Record (EMR/EHR) lab waveform streaming and pharmacy inventory ERP are out of scope for this release.

---

## 3. Target Users & Personas

### Persona 1: Ananya Mehta — Time-Conscious Urban Professional & Caregiver
- **Demographics:** 34, Senior Product Manager in Bengaluru/Mumbai, manages healthcare for herself and her 66-year-old parents.
- **Devices & Network:** iPhone 15 Pro on 5G during commute; MacBook Air (`1440px`) at home.
- **Needs & Goals:** Needs to compare Cardiology and Orthopedics specialists quickly, verify exact consultation fees in `₹` (`₹799` / `₹999`), check real-time evening or weekend slot availability in IST (`Asia/Kolkata`), and receive an instant reference number with calendar/location details.
- **Frustrations:** Sites that hide consultation fees until the final step, slow-loading carousels, and "Book Now" buttons that only submit a generic lead form.

### Persona 2: Rajeshwar Rao — Senior Patient Seeking Clarity & Reassurance
- **Demographics:** 68, Retired Civil Engineer, moderate digital literacy, mild presbyopia.
- **Devices & Network:** Android smartphone (`360px–412px` viewport width) on home Wi-Fi; uses system font scaling (`115%`).
- **Needs & Goals:** Wants large, high-contrast typography, plain-language specialty descriptions, clear doctor language spoken tags (e.g., `English · Hindi · Kannada`), a straightforward step-by-step booking wizard without confusing popups, and the option to **Pay at Hospital** (`₹499` General Medicine / `₹299` Follow-up).
- **Frustrations:** Low-contrast gray text, tiny calendar buttons (`< 44px`), and sudden layout jumps.

### Persona 3: Meera Nair — NovaCraft Orbai Outpatient Operations Coordinator (Admin)
- **Demographics:** 29, Hospital Front-Desk & Outpatient Scheduling Lead at the NovaCraft Orbai Flagship Campus.
- **Devices & Network:** Desktop workstation (`1920×1080` / `1440×900`) on hospital wired LAN.
- **Needs & Goals:** Needs a clean, high-density Admin Dashboard (`/admin`) to update doctor availability windows, adjust illustrative consultation fees once approved by hospital leadership, review `PAYMENT_PENDING` vs. `PAID` appointments, and process patient rescheduling or refund status updates with full audit trails.
- **Frustrations:** Public website templates with hardcoded JSON doctor arrays that require developer deployments to change a doctor's leave schedule or consultation fee.

---

## 4. Brand Identity Specification: NovaCraft Orbai

### 4.1 Brand Name & Usage Mandate
- **Official Brand Name:** **NovaCraft Orbai** (exact casing and spelling across all headings, metadata, intro panels, navigation, transactional confirmations, Patient Portal, and Admin Dashboard).
- **Prohibition:** Never abbreviate to "NCO" in primary public headings or substitute with placeholder hospital names.

### 4.2 Custom Typographic Wordmark & Minimalist Medical Emblem
- **Wordmark Construction:**
  - Set in our display serif face (`Cormorant Garamond` SemiBold `600`, tracking `-0.02em`) paired with architectural precision: `NovaCraft` in primary foreground (`var(--color-fg-primary)`) followed by `Orbai` with subtle optical spacing (`0.04em`).
  - In the Top Navigation Bar, per the strict **Top Bar Contract** ([`docs/FRONTEND.md`](./FRONTEND.md)), the Brand Zone renders as a single-line link element (`whitespace-nowrap shrink-0`) combining the SVG emblem and the exact text `NovaCraft Orbai`—with zero subtitle badges, city pills, or status dots attached.
- **Minimalist Medical Emblem ("The Orbai Sanctum Mark"):**
  - A precision geometric SVG (`24×24px` in navbar, `56×56px` in the center-opening intro) composed of two interlocking golden-ratio arcs forming an architectural orbital ring (`Orbai`) bisected by a fine clinical cross axis (`1.5px` stroke in `var(--color-brand-primary)` `#0D4A3E` Deep Medical Emerald, with a subtle inner botanical gold-ivory node `#C5A059`).
  - During the **Signature Opening Animation**, the left half of the emblem resides on the left panel border and the right half on the right panel border, meeting at the exact viewport center (`50vw`) before separating smoothly.

### 4.3 Tone of Voice & Editorial Principles
- **Tone Attributes:** Calm, authoritative, transparent, warm, and clinically precise.
- **Copy Rules:**
  - Use concrete, verifiable language: *"Transparent consultation fees in ₹"*, *"Server-verified appointment slots in IST"*, *"Illustrative prototype schedule — configurable by hospital administration"*.
  - **Banned Copy:** Never use exaggerated medical claims (*"#1 Hospital in India"*, *"100% Cure Guarantee"*, *"Miracle Treatment"*), generic SaaS buzzwords (*"Supercharge your wellness"*, *"Unlock next-gen health"*), or mechanical code prefixes (`// 01 SPECIALTIES`).

---

## 5. Complete Sitemap & Page-by-Page Requirements (16 Routes Total)

The platform comprises **14 public-facing pages**, **1 authenticated Patient Portal area**, and **1 role-protected Staff Admin Dashboard**.

| Route ID | Path | Page Title | Access Level | Primary CTA |
| :--- | :--- | :--- | :--- | :--- |
| **PG-01** | `/` | Homepage (`NovaCraft Orbai — Exceptional Care, Designed Around You`) | Public | `Book an Appointment` (`/book`) |
| **PG-02** | `/about` | About NovaCraft Orbai | Public | `Explore Our Doctors` (`/doctors`) |
| **PG-03** | `/doctors` | Doctor Directory | Public | `Book Appointment` (`/book?doctorId=:id`) |
| **PG-04** | `/doctors/:doctorSlug` | Individual Doctor Profile | Public | `Book with Dr. [Name]` (`/book?doctorId=:id`) |
| **PG-05** | `/specialties` | Medical Specialties & Services | Public | `Book Consultation` (`/book?specialtyId=:id`) |
| **PG-06** | `/specialties/:specialtySlug` | Individual Specialty Page | Public | `Select Specialist` (`/book?specialtyId=:id`) |
| **PG-07** | `/book` | 7-Step Appointment Booking | Public / Optional Auth | `Confirm Appointment` |
| **PG-08** | `/booking/confirmation/:referenceId` | Booking Confirmation | Public (Signed Token / Session) | `Download Appointment Pass` / `Manage in Portal` |
| **PG-09** | `/contact` | Contact & Flagship Campus | Public | `Send Inquiry` / `Book an Appointment` |
| **PG-10** | `/faq` | Frequently Asked Questions & Fee Guide | Public | `Book an Appointment` (`/book`) |
| **PG-11** | `/portal` (and `/portal/login`) | Patient Login & Patient Portal | Public Login → Auth Patient | `Sign In with OTP / Credentials` · `Reschedule` |
| **PG-12** | `/privacy-policy` | Privacy Policy | Public | `Contact Data Protection Officer` |
| **PG-13** | `/terms-of-service` | Terms of Service | Public | `Return to Booking` |
| **PG-14** | `/cancellation-refund-policy` | Cancellation & Refund Policy | Public | `View My Appointments` (`/portal`) |
| **PG-15** | `/admin` (sub-views: Doctors, Specialties, Slots, Appointments, Settings) | Staff Admin Dashboard | Auth (`ROLE_ADMIN` / `ROLE_STAFF`) | `Save Configuration` / `Update Slot Status` |
| **PG-16** | `*` | 404 Not Found | Public | `Return to NovaCraft Orbai Home` (`/`) |

### Page-by-Page Section Order, Content Needs & Success Criteria

#### PG-01: Homepage (`/`)
- **Purpose:** Establish immediate brand trust via the signature center-opening reveal and convert visitors into doctor discovery or appointment booking.
- **Sections in Order:**
  1. **Signature Center-Opening Intro Overlay:** Full-viewport two-panel symmetrical entrance (`"Your Health. Our Priority."` / `"Exceptional care, designed around you."`). Splits smoothly from `50vw` outward over `1.2s` after a `1.0s` hold on initial visit.
  2. **Top Navigation Bar:** 3-zone header (`NovaCraft Orbai` wordmark | `About`, `Doctors`, `Specialties`, `Services`, `FAQ` | `Book Appointment` CTA).
  3. **Main Hero Section (`"Keep Your Health Fit. Live Your Best Life."`):** 2-column split (`1440px` container) with editorial headline, supporting copy, primary CTA (`Book an Appointment`), secondary CTA (`Explore Our Doctors`), trust statement, and architectural hospital/consultation photography with subtle R3F ambient glass refraction canvas.
  4. **Section A — Trust & Credibility Strip:** Full-width architectural ledger row displaying only substantiated operational parameters (Flagship Campus operating hours `08:00–20:00 IST`, transparent INR consultation fee range `₹299–₹999`, instant server-verified slot locking, and explicit prototype sample data disclosure).
  5. **Section B — Medical Specialties Grid:** Asymmetric bento/editorial showcase of core departments (General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, Women's Healthcare / Gynecology, Diagnostic Services) with `₹` starting consultation fee and direct link.
  6. **Section C — Featured Doctors:** Curated grid of 4–6 specialists showing portrait, qualifications, languages spoken, verified/sample badge, exact `₹` fee, next available IST slot, `View Profile`, and `Book Appointment`.
  7. **Section D — How Appointment Booking Works:** 3-step editorial sequence (`01. Choose Your Doctor`, `02. Select Your Preferred Time`, `03. Confirm Your Appointment`) with GSAP ScrollTrigger scrub progression.
  8. **Section E — Hospital Architecture & Facilities:** Large-format visual showcase of NovaCraft Orbai consultation suites, diagnostic imaging wing, and serene patient waiting lounges.
  9. **Section F — Why Choose NovaCraft Orbai:** Practical, verifiable patient benefits (upfront INR pricing, zero double-booking guarantee, digital confirmation pass, flexible Pay-at-Hospital or Razorpay checkout).
  10. **Section G — Patient Care Commitment & Support Services:** Replaces fabricated patient testimonials until authorized hospital reviews are uploaded via the Admin Dashboard; highlights Patient Concierge, Language Assistance, and Preventive Checkup coordination.
  11. **Section H — Frequently Asked Questions & INR Fee Transparency Table:** Interactive shadcn/ui Accordion covering booking, rescheduling, arrival times, required ID, and the 9-tier illustrative INR consultation fee schedule.
  12. **Section I — Final Appointment Call to Action:** Spacious editorial block with `"Your Health Deserves Thoughtful Care."` and primary `Book an Appointment` CTA.
  13. **Section J — Quiet Architectural Footer:** NovaCraft Orbai identity, configurable flagship address & hours, specialty links, patient resources, legal links (`/privacy-policy`, `/terms-of-service`, `/cancellation-refund-policy`), and Portal/Admin entry links.
- **Success Criteria:** Intro completes within `1.0–1.5s` without layout shift (`CLS = 0`); underlying hero is fully painted before panels part; all CTAs navigate with pre-selected query parameters where applicable.

#### PG-02: About NovaCraft Orbai (`/about`)
- **Purpose:** Communicate the clinical philosophy, architectural design of the flagship campus, governance standards, and medical leadership structure.
- **Sections in Order:** Editorial Hero → Clinical Philosophy & Patient Charter → Architectural Campus Tour (Interior, Waiting Lounge, Consultation Suites, Diagnostics Wing) → Clinical Governance & Data Privacy Standards → Medical Services Overview → CTA Banner.
- **Success Criteria:** Zero invented awards or fake statistics; clear presentation of hospital facilities and operational standards.

#### PG-03: Doctor Directory (`/doctors`)
- **Purpose:** Enable fast, accurate filtering and comparison of medical professionals across specialties, languages, consultation types, and dates.
- **Sections in Order:** Directory Header & Search Bar → Sticky Filter & Sort Toolbar (Specialty filter, Consultation Type: `In-Person` / `Video`, Availability: `Available Today` / `Next 3 Days`, Language filter, Sort by `Fee: Low to High` / `Department`) → Results Count & Sample Data Disclosure Banner → Doctor Cards Grid → Empty State (with `Reset Filters` button if no match).
- **Success Criteria:** Filter state syncs bidirectionally with URL search params (`?specialty=cardiology&type=video&sort=fee_asc`); updates render in `< 100ms`.

#### PG-04: Individual Doctor Profile (`/doctors/:doctorSlug`)
- **Purpose:** Provide comprehensive, transparent doctor credentials, clinical interests, fee breakdown by appointment type, and direct slot preview.
- **Sections in Order:** Breadcrumb (`Doctors / [Specialty] / [Doctor Name]`) → Profile Hero (Portrait, Name, Title, Specialty, Qualifications, Registration Status Badge, Languages Spoken, Flagship Campus Wing) → Two-Column Body: Left Column (Professional Biography, Clinical Interests, Consultation Types & INR Fees Table, Education & Training) + Right Sticky Column (Live Interactive Slot Picker Widget for next 7 days in `Asia/Kolkata` + `Continue to Book` CTA).
- **Success Criteria:** Selecting a slot in the profile widget deep-links directly to Step 5 (Patient Details) of `/book` with Specialty, Doctor, Type, and Date/Time pre-populated.

#### PG-05: Medical Specialties & Services (`/specialties`)
- **Purpose:** Present all 11 configurable medical departments and 7 core clinical service categories with transparent INR pricing.
- **Sections in Order:** Specialties Hero → 11-Department Interactive Grid (General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, Gynecology / Women's Healthcare, ENT, Ophthalmology, Dentistry [configurable flag], Diagnostic Services) → Dedicated Clinical Services Matrix (General Consultations, Specialist Consultations, Diagnostic Testing, Preventive Health Checkups, Vaccination Services, Follow-Up Care, Teleconsultation) → Transparent INR Consultation Fee Schedule → Booking CTA.
- **Success Criteria:** Every specialty card links both to `/specialties/:specialtySlug` and `/book?specialty=:slug`.

#### PG-06: Individual Specialty Page (`/specialties/:specialtySlug`)
- **Purpose:** Deep-dive into a specific medical department, its clinical services, diagnostic capabilities, consultation pricing, and assigned specialists.
- **Sections in Order:** Department Hero with bespoke medical imagery → Overview & Conditions Managed → Key Procedures & Diagnostic Services Offered → Consultation Fee Tiers in `₹` (`In-Person`, `Video`, `Follow-up`) → Department Doctors Grid → Department-Specific FAQ → Book Department Appointment CTA.
- **Success Criteria:** Dynamically renders only doctors and services mapped to that specialty from the API/store.

#### PG-07: 7-Step Appointment Booking (`/book`)
- **Purpose:** Execute the core business transaction—guiding the patient through a 7-step validated wizard backed by real server slot checks.
- **Sections in Order:**
  - Booking Progress Header (Steps 1–6 indicator + persistent Selection Summary Sidebar on desktop / collapsible bottom sheet on mobile).
  - **Step 1:** Select Medical Specialty.
  - **Step 2:** Select Doctor (filtered by specialty, showing `₹` fee and availability).
  - **Step 3:** Select Appointment Type (`In-Person Consultation`, `Video Consultation`, `Follow-Up Consultation`) with exact `₹` fee and preparation instructions.
  - **Step 4:** Select Date & Time (`Asia/Kolkata` IST calendar + Morning/Afternoon/Evening slot grid; unavailable/locked slots disabled).
  - **Step 5:** Patient Details Form (Full Name, 10-digit Indian Mobile Number, Email Address, Age/DOB, optional Reason for Visit, privacy notice).
  - **Step 6:** Review, Payment Mode Selection (`Pay at Hospital` vs. `Pay Online via Razorpay`), & Confirm.
  - **Step 7:** Redirect/Transition upon server confirmation to `/booking/confirmation/:referenceId`.
- **Success Criteria:** Supports deep-linking (e.g., arriving with `doctorId` skips or pre-fills Steps 1–2 while allowing edits); prevents progression with invalid inputs; handles `409 Conflict` if a slot is taken concurrently.

#### PG-08: Booking Confirmation (`/booking/confirmation/:referenceId`)
- **Purpose:** Display verifiable server-confirmed appointment details, payment status, and preparation instructions.
- **Sections in Order:** Animated Lottie Checkmark & Confirmation Header → Appointment Reference Card (`NCO-2026-XXXXXX`) → Doctor, Specialty & IST Date/Time Summary → Campus Wing Directions or Video Consultation Link Instructions → Itemized INR Fee & Server-Verified Payment Status (`PAYMENT_PENDING — Pay at Hospital`, `PAID`, or `PAYMENT_FAILED` with retry action) → Notification Delivery Status (honest status of Email/SMS/WhatsApp integration) → Actions (`Print / Save Pass`, `View in Patient Portal`, `Reschedule / Cancel`).
- **Success Criteria:** Never renders a fake confirmation from client state alone; fetches and verifies the appointment record from `GET /api/v1/appointments/:referenceId`.

#### PG-09: Contact Us & Flagship Campus (`/contact`)
- **Purpose:** Provide hospital contact channels, emergency disclaimer, flagship campus visiting hours, and a validated patient inquiry form.
- **Sections in Order:** Contact Hero & Emergency Notice (explicit instruction to call emergency services `108` / `112` for life-threatening emergencies) → Campus Information Cards (Reception Desk, Outpatient Wing, Working Hours `Mon–Sat 08:00–20:00 IST`, Configurable Address notice) → Interactive Validated Inquiry Form (Name, Phone, Email, Department, Message) → Campus Architectural Map / Directions Visual.
- **Success Criteria:** Inquiry form submits to `POST /api/v1/inquiries` with server validation and displays a reference ticket ID.

#### PG-10: Frequently Asked Questions (`/faq`)
- **Purpose:** Address patient questions regarding booking, fees, documents to bring, video consultations, cancellations, and refunds.
- **Sections in Order:** Searchable FAQ Header → Category Filter Tabs (`Booking & Slots`, `Consultation Fees & Payment`, `Campus Visit & Documents`, `Video Consultations`, `Cancellations & Refunds`) → Accordion List → Transparent INR Pricing Schedule Table → Still Need Help CTA (`/contact`).
- **Success Criteria:** Real-time keyword filtering across questions and configurable policy parameters.

#### PG-11: Patient Login & Patient Portal (`/portal`)
- **Purpose:** Allow patients to securely view upcoming and past appointments, download confirmation passes, reschedule to a new available slot, or cancel an appointment.
- **Sections in Order:**
  - **Unauthenticated State:** Clean authentication card supporting Demo/Development Verified Patient Session or Mobile/Email + Booking Reference verification.
  - **Authenticated State:** Patient Header → Upcoming Appointments List (with `Reschedule`, `Cancel Appointment`, and `Complete Payment` actions) → Past/Cancelled Appointments History → Profile Contact Preferences.
- **Success Criteria:** Cancelling or rescheduling an appointment updates the server database atomically and immediately releases the previous time slot for other patients.

#### PG-12, PG-13, PG-14: Legal & Policy Pages (`/privacy-policy`, `/terms-of-service`, `/cancellation-refund-policy`)
- **Purpose:** Provide clear, readable, print-friendly governance documentation covering minimal data collection, patient record confidentiality, medical disclaimer, and cancellation/refund rules.
- **Sections in Order:** Document Header & Effective Date → Table of Contents Anchor Rail → Numbered Policy Clauses → Configurable Hospital Policy Summary Table → Contact Data Officer Footer.
- **Success Criteria:** High-legibility `65ch–72ch` prose width; accurate cross-referencing with the booking flow's cancellation window rules.

#### PG-15: Staff Admin Dashboard (`/admin`)
- **Purpose:** Empower authorized hospital administrators to manage doctors, specialties, consultation fees, slot availability, appointments, and hospital settings without code changes.
- **Sections in Order:** Admin Auth Guard → Sidebar Navigation (`Overview`, `Appointments`, `Doctors & Fees`, `Specialties & Services`, `Slot Generator`, `Hospital Settings & Audit Log`) → High-Density Data Tables (shadcn/ui Table + filter bars) → Slide-over Edit Drawers/Dialogs for creating/updating doctors, toggling slot availability, updating payment/refund states, and approving website settings.
- **Success Criteria:** Protected by role-based server authorization; every mutation writes an entry to the server audit log and immediately reflects on the public website.

---

## 6. Step-by-Step User Flows

### Flow 1: First-Time Visitor → Signature Intro → 7-Step Appointment Booking
1. **Entry (`/`):** User visits NovaCraft Orbai for the first time in the browser session.
2. **Signature Intro Hold (`0.0s–1.0s`):** Full-viewport left and right panels meet at `50vw` displaying the Orbai Sanctum emblem and `"Your Health. Our Priority."` Meanwhile, the homepage Hero DOM and assets finish rendering underneath.
3. **Center Split Reveal (`1.0s–2.2s`):** Left panel translates to `-100%` and right panel translates to `+100%` using compositor-only `transform: translate3d()`. `sessionStorage.setItem('nco_intro_seen', '1')` is recorded so internal route navigation never replays the intro.
4. **Hero CTA Click:** User clicks `Book an Appointment` → navigates to `/book`.
5. **Step 1 (Specialty):** Selects `Cardiology` (displays starting fee `₹999`).
6. **Step 2 (Doctor):** Reviews filtered Cardiology specialists (e.g., *Dr. Arvind Krishnamurthy — Sample Profile*), checks languages (`English · Hindi`) and fee (`₹999`), clicks `Select Doctor`.
7. **Step 3 (Appointment Type):** Chooses between `In-Person Consultation (₹999)`, `Video Consultation (₹399)`, or `Follow-up Consultation (₹299)`.
8. **Step 4 (Date & IST Slot):** Selects date in `Asia/Kolkata` timezone; client fetches `GET /api/v1/slots?doctorId=...&date=...`; user picks `10:30 AM IST`.
9. **Step 5 (Patient Details):** Enters Full Name, 10-digit mobile (`+91`), Email, Age (`42`), and optional visit note (`Routine cardiac evaluation`).
10. **Step 6 (Review & Payment):** Reviews summary (`₹999` total, illustrative fee disclaimer). Selects either:
    - **Path 10A (Pay at Hospital):** Submits `POST /api/v1/appointments` with `paymentMethod: 'PAY_AT_HOSPITAL'`. Server atomically locks the slot and creates the appointment with `paymentStatus: 'PAYMENT_PENDING'`.
    - **Path 10B (Razorpay Online):** Submits `POST /api/v1/appointments` with `paymentMethod: 'RAZORPAY'`. Server locks slot (`10 min` hold) and returns Razorpay `order_id` (or explicit `PAYMENT_GATEWAY_NOT_CONFIGURED` banner if keys are absent, allowing graceful fallback to Pay-at-Hospital). On payment completion, `POST /api/v1/payments/razorpay/verify` validates the HMAC signature before marking `paymentStatus: 'PAID'`.
11. **Step 7 (Confirmation):** Redirects to `/booking/confirmation/NCO-2026-XXXXXX` displaying the verified pass.

### Flow 2: Patient Rescheduling or Cancellation (`/portal`)
1. Patient signs into `/portal` using their mobile/email + booking reference or authenticated session.
2. Selects an upcoming `CONFIRMED` appointment and clicks `Reschedule`.
3. Chooses a new available IST slot from the modal calendar and confirms.
4. Server executes an atomic transaction: marks the old slot `AVAILABLE`, locks the new slot as `BOOKED`, updates the appointment timestamp, and appends an audit record.

### Flow 3: Admin Fee & Doctor Management (`/admin`)
1. Authorized staff member signs into `/admin`.
2. Opens `Doctors & Fees`, edits a doctor's `In-Person Consultation Fee` from `₹799` to `₹850` or toggles `isVerifiedProfile`, and clicks `Save Changes`.
3. `PATCH /api/v1/admin/doctors/:id` validates the payload, updates the store, records an audit log entry, and immediately updates all public pricing tables and booking steps.

---

## 7. Functional Requirements (FR-01 to FR-26)

| ID | Category | Requirement Specification | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Intro Animation** | Render a full-viewport 2-panel symmetrical intro on initial session visit featuring the NovaCraft Orbai mark, `"Your Health. Our Priority."`, and `"Exceptional care, designed around you."` Panels must split from the exact center (`50vw`) outward after `~1.0s` and complete within `1.0–1.5s`. | P0 |
| **FR-02** | **Intro Persistence & A11y** | Store intro completion in `sessionStorage` so internal navigation does not replay it; provide a subtle `Skip Intro` keyboard/click control and bypass the split motion immediately when `prefers-reduced-motion: reduce` is active. | P0 |
| **FR-03** | **Intro Asset Modularity** | Architect `<CenterOpeningIntro />` to accept configurable props (`leftPanelMedia`, `rightPanelMedia`, `brandLogo`, `headline`, `subheadline`) so future custom videos, images, or 3D assets can replace default visuals without touching page layout code. | P0 |
| **FR-04** | **Hero Section** | Display `"Keep Your Health Fit. Live Your Best Life."` with supporting copy, primary CTA (`Book an Appointment`), secondary CTA (`Explore Our Doctors`), trust statement, and high-resolution medical photography paired with a capability-guarded R3F ambient scene. | P0 |
| **FR-05** | **17-Slot Medical Image System** | Provide dedicated, high-resolution medical visuals with resilient CSS/SVG fallbacks for all 17 mandated slots (Hero, Exterior, Interior, Staff, Doctor Portraits, General Medicine, Cardiology, Orthopedics, Pediatrics, Neurology, Dermatology, Women's Healthcare, Diagnostics, Preventive Checkups, Consultation Room, Waiting Area, Care Team). | P0 |
| **FR-06** | **Navigation System** | Implement a responsive 3-zone header (Brand Wordmark, Navigation Links, `Book Appointment` CTA) that transitions to a compact sticky surface on scroll and provides an accessible mobile drawer (`≤ 15%` sticky viewport height on mobile). | P0 |
| **FR-07** | **Step 1: Specialty Selection** | Allow patients to select from configurable departments (General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, Gynecology, ENT, Ophthalmology, Dentistry, Diagnostic Services). | P0 |
| **FR-08** | **Step 2: Doctor Selection** | Display filtered doctors with portrait, name, specialty, qualifications, languages spoken, `₹` fee, available consultation modes, explicit sample/verified badge, `View Profile`, and `Select Doctor`. | P0 |
| **FR-09** | **Step 3: Appointment Type** | Allow selection among `In-Person Consultation`, `Video Consultation`, and `Follow-Up Consultation` (when supported by the selected doctor), showing exact `₹` pricing and instructions. | P0 |
| **FR-10** | **Step 4: IST Date & Slot Selection** | Display a 14-day calendar and time slot grid locked to `Asia/Kolkata` (`IST`). Render booked or past slots as disabled (`aria-disabled="true"`). Never fabricate slot availability if the API is unreachable. | P0 |
| **FR-11** | **Step 5: Minimal Patient Details** | Collect only Full Name, Mobile Number (`+91` 10-digit validation), Email (optional/configurable), Age or Date of Birth, and optional Reason for Visit. Never request government ID numbers, passwords, or raw card numbers in the form. | P0 |
| **FR-12** | **Step 6: Review & Edit** | Display a complete booking summary (Doctor, Specialty, IST Date/Time, Type, `₹` Consultation Fee, applicable taxes if configured, Patient Details) with inline `Edit` jump links back to prior steps. | P0 |
| **FR-13** | **Step 7: Server-Verified Confirmation** | Create the booking on the server (`POST /api/v1/appointments`) with atomic duplicate-booking prevention (`409 Conflict` on race condition) and display a unique reference number (`NCO-YYYY-XXXXXX`) only after server `201 Created`. | P0 |
| **FR-14** | **INR Pricing Schedule** | Consistently display Indian Rupee (`₹`) pricing across all views using the 9 baseline illustrative tiers (`₹299` to `₹999`) with an explicit disclaimer that prices are illustrative until approved by hospital administration. | P0 |
| **FR-15** | **Payment States & Verification** | Support `PAYMENT_PENDING`, `PAYMENT_SUCCESSFUL` (`PAID`), `PAYMENT_FAILED`, `REFUND_PENDING`, and `REFUNDED`. Verify Razorpay payments exclusively on the server via HMAC-SHA256 signature check; provide a clean `Pay at Hospital` option when online payment is not selected or not configured. | P0 |
| **FR-16** | **Honest Notification Status** | Log and report notification status (`SENT`, `SKIPPED_NOT_CONFIGURED`, `FAILED`) for Email/SMS/WhatsApp. Never claim an SMS or WhatsApp message was delivered unless the provider webhook/response confirms delivery. | P0 |
| **FR-17** | **Doctor Directory & Filters** | Provide search by doctor name/keyword, filtering by specialty, consultation mode, language, and availability, plus sorting by consultation fee. | P0 |
| **FR-18** | **Individual Doctor Profiles** | Render dedicated profile pages (`/doctors/:doctorSlug`) with biography, qualifications, consultation fees, languages, campus wing, and embedded slot selector. | P0 |
| **FR-19** | **Specialties & Services Pages** | Render `/specialties` overview and `/specialties/:specialtySlug` detail pages covering the 11 departments and 7 core service categories. | P0 |
| **FR-20** | **Patient Portal** | Provide `/portal` allowing authenticated patients to view their appointments, reschedule to an open slot, or cancel an appointment according to hospital policy. | P1 |
| **FR-21** | **Staff Admin Dashboard** | Provide `/admin` protected by server-side RBAC allowing staff to CRUD doctors, specialties, consultation fees, slot schedules, appointment statuses, and hospital contact settings. | P1 |
| **FR-22** | **Audit Logging** | Record immutable server-side audit entries whenever an admin modifies consultation fees, doctor credentials, appointment statuses, or payment states. | P1 |
| **FR-23** | **Contact & Emergency Guidance** | Provide a validated contact inquiry form (`/contact`) and prominent emergency triage guidance (`108` / `112`). | P1 |
| **FR-24** | **Searchable FAQ & Policy Pages** | Provide interactive `/faq`, `/privacy-policy`, `/terms-of-service`, and `/cancellation-refund-policy` views with configurable hospital policy parameters. | P1 |
| **FR-25** | **Clinical Honesty Guardrails** | Label all development doctor profiles, fees, and operational metrics clearly as `Sample Prototype Data — Pending Hospital Verification` until flipped to `Verified` by an administrator. | P0 |
| **FR-26** | **i18n & Multi-Campus Readiness** | Externalize locale formatting (`Intl.NumberFormat('en-IN')`, `Asia/Kolkata` date formatting) and scope data records with `campusId` (`campus-flagship-01`) so Hindi (`hi-IN`) and additional campuses can be added without schema changes. | P2 |

---

## 8. Non-Functional Requirements (NFRs) & Performance Budgets

### 8.1 Core Web Vitals & Bundle Size Budgets

| Metric / Budget | Target Threshold | Measurement Condition & Enforcement |
| :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | `< 2.5s` (`< 1.8s` desktop) | Pre-render hero typography and critical WebP hero image with `fetchpriority="high"`; intro panels use zero-blocking CSS/Motion transforms. |
| **Cumulative Layout Shift (CLS)** | `< 0.1` (target `< 0.02`) | Explicit `width`/`height` or `aspect-ratio` on all 17 medical image slots; fixed dimensions on slot grids and skeleton loaders. |
| **Interaction to Next Paint (INP)** | `< 200ms` (target `< 100ms`) | Routine UI feedback settles in `≤ 200ms`; heavy 3D canvases run on demand (`frameloop="demand"`) and pause when off-screen. |
| **Initial JS Bundle (Gzipped)** | `< 160 KB` entry chunk | Route-level code splitting via `React.lazy()` + lazy-loaded `<ThreeHeroCanvas />` and `<LottiePlayer />` chunks. |
| **3D Scene Asset Budget** | `< 350 KB` total | Procedural/parametric R3F glass/light geometry by default; any future `.glb` assets must use Draco + KTX2 compression. |

### 8.2 Accessibility (`WCAG 2.2 Level AA`)
- **Contrast Ratios:** Minimum `4.5:1` for normal body text (`15px–16px`), `3.0:1` for large display headings (`≥ 24px`) and UI boundary strokes across both Light (`#FAF8F5`) and Dark (`#071412`) modes.
- **Keyboard & Focus Navigation:** Full keyboard operability (`Tab`, `Shift+Tab`, `Arrow` keys inside radio/slot grids, `Enter`/`Space` to select, `Escape` to close modals). Focus rings must use `2px solid var(--color-brand-primary)` with `2px` offset (`focus-visible:ring-2`).
- **Touch Targets:** Minimum `44×44px` interactive hit area on all mobile buttons, calendar dates, time slots, and filter tabs.
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is enabled, the center-opening intro resolves via a `200ms` gentle opacity fade instead of a full-screen lateral slide, GSAP scrub timelines convert to static layouts, and R3F continuous rotation is disabled.

### 8.3 Browser, Device & Viewport Support
- **Viewports Tested:** `360px` (compact Android), `390px` (iPhone), `768px` (Tablet portrait), `1024px` (Tablet landscape / small laptop), `1440px` (Desktop baseline), `1920px` (Large monitor).
- **Browsers:** Chrome/Edge (last 2 major versions), Safari 17+ / iOS Safari 17+, Firefox (last 2 major versions).

### 8.4 SEO & Structured Data
- Unique `<title>`, `<meta name="description">`, `og:title`, `og:description`, and canonical tags per route.
- Schema.org JSON-LD (`MedicalOrganization`, `Physician`, `MedicalClinic`, `FAQPage`) injected on relevant public pages (containing only substantiated or explicitly flagged prototype data).

---

## 9. Content & Visual Asset Requirements (17-Slot Medical Image System)

Every visual slot below must be populated with photorealistic, warm-daylight architectural/clinical imagery (generated via `generate_image` during implementation Phase 2/3 or sourced from verified local assets) paired with a resilient SVG/CSS fallback container:

| Slot # | Asset ID | Target Page / Section | Aspect Ratio | Visual Specification & Lighting Direction |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `img_hero_sanctuary` | Homepage Hero (`/`) | `16:9` / `4:3` | Sunlit luxury private hospital atrium and consultation lounge, travertine stone, warm oak, indoor botanical courtyard, natural morning light. |
| **02** | `img_campus_exterior` | About (`/about`) & Home | `16:9` | Contemporary architectural hospital facade with warm limestone fins, cantilevered glass canopy, lush landscaped arrival court at golden hour. |
| **03** | `img_campus_interior` | Home Facilities & About | `16:9` | Serene private hospital corridor and reception gallery with warm indirect architectural cove lighting and acoustic timber panels. |
| **04** | `img_medical_team` | About & Home Trust | `16:9` | Editorial group portrait of diverse senior Indian physicians in tailored clinical attire inside a sunlit glass atrium. |
| **05** | `img_doctor_portraits` (Set of 8) | Doctor Cards & Profiles | `3:4` | Consistent studio-lit editorial portraits of individual Indian male and female specialists against a warm stone-ivory backdrop. |
| **06** | `img_spec_general_med` | General Medicine | `4:3` | Calm executive consultation room with brass-accented desk, digital diagnostic tablet, and warm daylight window. |
| **07** | `img_spec_cardiology` | Cardiology | `4:3` | Advanced non-invasive cardiac diagnostics suite with high-resolution echocardiography display and serene lighting. |
| **08** | `img_spec_orthopedics` | Orthopedics | `4:3` | Modern musculoskeletal rehabilitation and motion-analysis studio with clean architectural finishes. |
| **09** | `img_spec_pediatrics` | Pediatrics | `4:3` | Warm, comforting pediatric consultation suite with natural wood textures, soft daylight, and calming botanical tones. |
| **10** | `img_spec_neurology` | Neurology | `4:3` | High-precision neuro-diagnostics consultation environment with high-contrast digital imaging workstation. |
| **11** | `img_spec_dermatology` | Dermatology | `4:3` | Clinical dermatology & aesthetic suite with diffused daylight, precision optical dermoscopy equipment, and alabaster surfaces. |
| **12** | `img_spec_womens_health` | Gynecology / Women's Health | `4:3` | Private, sanctuary-grade maternal and women's wellness consultation suite with warm residential-grade comfort. |
| **13** | `img_spec_diagnostics` | Diagnostic Services | `4:3` | Next-generation wide-bore ambient-lit MRI/CT imaging suite designed to reduce patient claustrophobia. |
| **14** | `img_service_preventive` | Preventive Health Checkups | `4:3` | Executive preventive health lounge where patients relax between comprehensive biomarker screenings. |
| **15** | `img_consultation_env` | How Booking Works / About | `4:3` | Physician and patient having an unhurried, eye-level conversation across a warm wooden consultation table. |
| **16** | `img_waiting_lounge` | Facilities Section | `16:9` | Quiet, museum-grade hospital waiting lounge with spaced armchair seating, natural indoor trees, and daylight skylights. |
| **17** | `img_care_concierge` | Patient Support & Care Team | `4:3` | Dedicated NovaCraft Orbai patient care coordinator assisting a visitor at a minimalist stone concierge desk. |

---

## 10. Acceptance Criteria Per Core Feature

### AC-01: Signature Center-Opening Intro
- [ ] First page load displays two symmetrical panels meeting seamlessly at `50vw` with the Orbai Sanctum emblem and `"Your Health. Our Priority."`
- [ ] After `1000ms`, panels separate symmetrically (`translate3d(-100%, 0, 0)` and `translate3d(100%, 0, 0)`) over `1200ms` using `cubic-bezier(0.22, 1, 0.36, 1)`.
- [ ] The Hero section underneath is already mounted and visible at frame 1 of the separation (no white flash or unstyled flash).
- [ ] Subsequent route navigations (`/doctors`, `/book`, `/`) within the same session do not replay the intro; a footer button `Replay Opening Intro` allows manual testing at any time.
- [ ] With `prefers-reduced-motion: reduce`, lateral panel motion is skipped in favor of a `200ms` opacity dissolve.

### AC-02: 7-Step Appointment Booking & Atomic Slot Locking
- [ ] User can progress through Specialty → Doctor → Type → Date/Time (`IST`) → Patient Details → Review → Confirmation.
- [ ] Attempting to book a slot that was just booked by another request returns HTTP `409 Conflict` from the backend, highlights the slot as unavailable, and prompts the user to pick another time without losing their entered patient details.
- [ ] No booking confirmation screen is ever shown unless `POST /api/v1/appointments` returns HTTP `201 Created` with a server-generated `referenceId`.

### AC-03: INR Pricing & Payment Integrity
- [ ] All 9 baseline consultation fee tiers render with the `₹` symbol (`tabular-nums`) and an illustrative fee disclosure badge.
- [ ] Choosing `Pay at Hospital` records `paymentStatus: 'PAYMENT_PENDING'` and clearly instructs the patient to settle at the Flagship Outpatient Desk 15 minutes before the slot.
- [ ] Choosing `Pay Online (Razorpay)` either launches a real Razorpay order flow verified by server HMAC signature (`paymentStatus: 'PAID'`) or, if `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are not configured in `.env`, displays a transparent configuration notice and offers one-click fallback to `Pay at Hospital`.

### AC-04: Doctor Directory, Patient Portal & Admin Dashboard
- [ ] Filtering doctors by Specialty, Language, or Consultation Type updates the grid and URL query parameters accurately.
- [ ] Every doctor profile displays an explicit `Sample Prototype Profile — Configurable in Admin` badge unless marked verified by an administrator.
- [ ] Cancelling an appointment in `/portal` or `/admin` transitions status to `CANCELLED` and immediately restores the time slot's availability in `/book`.

---

## 11. Risks, Mitigations & Open Questions

| ID | Risk / Open Question | Impact | Mitigation Strategy Locked in Documentation |
| :--- | :--- | :--- | :--- |
| **R-01** | **Tailwind CSS v4 vs. Legacy shadcn/ui CLI Config:** The repo uses `@tailwindcss/vite@^4.3.3` (CSS-first `@theme`), whereas legacy shadcn/ui generators look for `tailwind.config.js`. | High | Documented in [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md): Use CSS-first `@theme inline` token mapping in `/src/index.css` generated by Style Dictionary, and add shadcn/ui primitives as clean TypeScript components in `/src/components/ui/` wired directly to CSS variables. |
| **R-02** | **GSAP & Motion Animation Conflicts:** Running both GSAP ScrollTrigger and Motion on the same DOM node causes transform matrix jitter. | High | Enforced in [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) and [`docs/RULES.md`](./RULES.md): Strict ownership rule—GSAP owns scroll-driven section wrappers; Motion owns component-level hover/tap/mount/layout transitions on inner child nodes. |
| **R-03** | **WebGL / Three.js Performance on Low-End Android Devices:** Continuous 3D shader rendering can degrade INP and battery on budget smartphones. | Medium | `<ThreeHeroCanvas />` checks hardware concurrency, WebGL context support, and `prefers-reduced-motion`, runs with `dpr={[1, 1.5]}`, pauses via `IntersectionObserver` when scrolled out of view, and falls back to an architectural SVG/CSS lighting layer. |
| **R-04** | **Unconfigured Third-Party Credentials (Razorpay / SMTP / Twilio):** In preview environments without user secrets, live payment or SMS dispatch cannot execute. | Medium | Backend returns explicit capability flags (`GET /api/v1/config/capabilities`) so the UI never fakes payment capture or SMS delivery and transparently routes to `Pay at Hospital` + on-screen downloadable appointment pass. |
