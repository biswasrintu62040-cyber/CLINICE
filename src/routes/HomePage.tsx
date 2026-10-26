import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { SpotlightCard } from '@/src/components/motion/aceternity/SpotlightCard';
import { SplitTextReveal } from '@/src/components/motion/react-bits/SplitTextReveal';
import { ScrollStorySection } from '@/src/components/motion/ScrollStorySection';
import { ThreeCanvasGuard } from '@/src/components/three/ThreeCanvasGuard';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import {
  getSeedNextAvailableSlotForDoctor,
  INITIAL_DOCTORS,
  INITIAL_SPECIALTIES,
} from '@/src/data/clinicalCatalogSeed';
import { ConsultationFeeScheduleTable } from '@/src/features/booking/components/ConsultationFeeScheduleTable';
import { DoctorCard } from '@/src/features/doctors/components/DoctorCard';
import { HeroSanctuaryVideo } from '@/src/features/intro/components/HeroSanctuaryVideo';
import { apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR } from '@/src/lib/formatCurrencyINR';
import type { DoctorsListResponse, SpecialtiesListResponse } from '@/src/types/api.types';
import type { Doctor, Specialty } from '@/src/types/domain.types';

const HOME_FAQS = [
  {
    q: 'How are appointments confirmed at NovaCraft Orbai?',
    a: 'Every appointment is confirmed only after our server verifies live slot availability in Indian Standard Time (Asia/Kolkata) and locks the slot atomically. You immediately receive a unique reference pass (NCO-2026-XXXXXX) with campus wing directions or video consultation instructions.',
  },
  {
    q: 'Are consultation fees transparent and displayed in Indian Rupees (₹)?',
    a: 'Yes. Every specialty, doctor profile, and booking step displays the exact consultation fee in Indian Rupees (₹) ranging from ₹299 (Follow-up) to ₹999 (Senior Specialist / Cardiology). Prices shown in this prototype are illustrative and configurable by hospital administration.',
  },
  {
    q: 'Can I choose between Pay at Hospital and Online Payment?',
    a: 'Yes. During Step 6 of the booking flow, you can select Pay at Hospital (settling at the Flagship Outpatient Reception 15 minutes before your slot) or Razorpay online payment when merchant credentials are active.',
  },
  {
    q: 'What documents should I bring for an in-person consultation?',
    a: 'Please bring your NovaCraft Orbai Booking Reference ID, one valid government photo ID for registration verification, and any recent diagnostic reports or current medication lists relevant to your visit.',
  },
  {
    q: 'How do rescheduling and cancellations work?',
    a: 'You can reschedule to another open IST slot or cancel your appointment directly through the Patient Portal (/portal) using your registered mobile number or Booking Reference ID.',
  },
];

export function HomePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = React.useState<Specialty[]>(() =>
    INITIAL_SPECIALTIES.slice(0, 8)
  );
  const [featuredDoctors, setFeaturedDoctors] = React.useState<
    Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>
  >(() =>
    INITIAL_DOCTORS.filter((d) => d.isFeatured)
      .slice(0, 6)
      .map((d) => ({
        ...d,
        nextAvailableSlot: getSeedNextAvailableSlotForDoctor(d.id),
      }))
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<SpecialtiesListResponse>('/api/v1/specialties'),
      apiRequest<DoctorsListResponse>('/api/v1/doctors'),
    ])
      .then(([specRes, docRes]) => {
        if (!active) return;
        setSpecialties(specRes.items.slice(0, 8));
        setFeaturedDoctors(docRes.items.filter((d) => d.isFeatured).slice(0, 6));
      })
      .catch(() => {
        // Initial catalog state remains active
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. MAIN HERO SECTION — Full-Bleed Animated Video Background with Transparent Foreground */}
      <section className="relative -mt-16 pt-16 min-h-[88vh] lg:min-h-[94vh] w-full flex items-center overflow-hidden border-b border-border-hairline bg-transparent">
        {/* Layer 1: Full-Hero Animated Video Background (Visible Across 100% of Hero on Desktop, Tablet & Mobile) */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-transparent">
          <HeroSanctuaryVideo ariaLabel="NovaCraft Orbai hospital sanctuary and specialist physician" />
        </div>

        {/* Layer 2: Genuinely Transparent Foreground Content Containers */}
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24 bg-transparent">
          <div className="grid grid-cols-1 items-center gap-6 lg:gap-10 lg:grid-cols-12 bg-transparent">
            {/* Left Editorial Column — Floating Directly Over the Video */}
            <div className="flex flex-col justify-between lg:col-span-7 xl:col-span-6 space-y-5 sm:space-y-6 lg:space-y-8 bg-transparent">
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 bg-transparent">
                <div className="inline-flex flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-[#083A30] [text-shadow:0_1px_10px_rgba(255,255,255,0.75)]">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  <span>NOVACRAFT ORBAI</span>
                  <span aria-hidden="true">·</span>
                  <span>PRIVATE MEDICAL SANCTUARY</span>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">ASIA/KOLKATA (IST)</span>
                </div>

                <SplitTextReveal
                  text="Keep Your Health Fit. Live Your Best Life."
                  className="font-display text-[34px] sm:text-5xl lg:text-[64px] xl:text-[68px] font-semibold leading-[1.05] lg:leading-[1.04] tracking-tight text-[#0F1715] max-w-[14ch] [text-shadow:0_2px_18px_rgba(255,255,255,0.72)]"
                />

                <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 pt-1 lg:pt-3 bg-transparent">
                  <Button
                    intent="primary"
                    size="lg"
                    onClick={() => navigate('/book')}
                    className="w-auto min-h-9 px-3.5 py-2 text-xs rounded-lg gap-1.5 sm:min-h-12 sm:px-7 sm:py-3 sm:text-base sm:rounded-xl sm:gap-2"
                  >
                    <Calendar className="h-3.5 w-3.5 sm:h-5 sm:w-5" aria-hidden="true" />
                    <span>Book an Appointment</span>
                  </Button>
                  <Button
                    intent="secondary"
                    size="lg"
                    onClick={() => navigate('/doctors')}
                    className="w-auto min-h-9 px-3.5 py-2 text-xs rounded-lg gap-1.5 sm:min-h-12 sm:px-7 sm:py-3 sm:text-base sm:rounded-xl sm:gap-2 bg-white/32 hover:bg-white/50 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-white/55 text-[#0F1715] dark:text-[#0F1715]"
                  >
                    <span>Explore Our Doctors</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Subtle Trust & Live Outpatient Desk Statement — Transparent Container */}
              <div className="border-t border-[#141817]/15 pt-4 sm:pt-6 max-w-xl space-y-2.5 sm:space-y-3 bg-transparent">
                <p className="font-display text-base sm:text-xl italic text-[#14201D] [text-shadow:0_1px_10px_rgba(255,255,255,0.75)]">
                  &ldquo;Personalized care. Experienced professionals. A better healthcare
                  experience.&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#1C2825] font-medium [text-shadow:0_1px_8px_rgba(255,255,255,0.75)]">
                  <span className="font-semibold text-[#0F1715]">
                    Outpatient Desk: Mon–Sat · 08:00 AM – 08:00 PM IST
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Transparent ₹299 – ₹999 Tariff</span>
                  <span aria-hidden="true">·</span>
                  <Link
                    to="/book"
                    className="inline-flex items-center gap-1 font-semibold text-[#083A30] hover:underline"
                  >
                    <span>Check Live IST Slots</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: Trust & Credibility Strip (Substantiated Operational Facts Only) */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 -mt-8 lg:-mt-12 relative z-20">
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-white/80 dark:border-white/12 bg-elevated p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              01. Consultation Tariff
            </span>
            <p className="font-display text-2xl font-semibold text-fg-primary tabular-nums">
              ₹299 – ₹999 INR
            </p>
            <p className="text-xs text-fg-muted">
              Upfront illustrative fee schedule across General, Specialist &amp; Follow-up care.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              02. Clinical Departments
            </span>
            <p className="font-display text-2xl font-semibold text-fg-primary tabular-nums">
              11 Specialties
            </p>
            <p className="text-xs text-fg-muted">
              Cardiology, Internal Medicine, Orthopedics, Pediatrics, Neurology &amp; Diagnostics.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              03. Booking Integrity
            </span>
            <p className="font-display text-2xl font-semibold text-fg-primary">
              Atomic IST Slot Lock
            </p>
            <p className="text-xs text-fg-muted">
              Server-side duplicate-booking prevention in Asia/Kolkata timezone.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              04. Payment Flexibility
            </span>
            <p className="font-display text-2xl font-semibold text-fg-primary">
              Pay at Hospital / Online
            </p>
            <p className="text-xs text-fg-muted">
              Reserve immediately with Pay-at-Hospital or verified Razorpay checkout.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION B: Medical Specialties */}
      <section aria-labelledby="home-specialties-heading" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Departments &amp; Clinical Centres
            </span>
            <h2
              id="home-specialties-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
            >
              Specialized Medical Care Under One Sanctuary Roof
            </h2>
            <p className="text-base text-fg-secondary">
              Each department pairs quiet, daylight-filled consultation chambers with transparent
              Indian Rupee (₹) consultation fees and direct specialist scheduling.
            </p>
          </div>
          <Button
            intent="outline"
            onClick={() => navigate('/specialties')}
          >
            <span>Explore All 11 Specialties</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="h-96 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {specialties.map((spec, idx) => (
              <SpotlightCard key={spec.id} className="p-5 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/specialties/${spec.slug}`}
                    className="block overflow-hidden rounded-lg"
                  >
                    <MedicalImageFrame
                      slotId={spec.imageSlotId}
                      aspectRatio="4/3"
                      priority={idx < 4}
                      showCaptionOverlay={false}
                    />
                  </Link>
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-fg-muted font-mono">
                    <span>Starting Consultation</span>
                    <span className="font-semibold text-fg-primary tabular-nums">
                      {formatCurrencyINR(spec.baseConsultationFeeINR)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold text-fg-primary">
                    <Link
                      to={`/specialties/${spec.slug}`}
                      className="hover:text-brand-primary transition-colors"
                    >
                      {spec.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-fg-secondary line-clamp-3">
                    {spec.shortDescription}
                  </p>
                </div>

                <div className="mt-5 border-t border-border-hairline pt-4 flex items-center justify-between gap-2">
                  <Link
                    to={`/specialties/${spec.slug}`}
                    className="text-xs font-semibold text-fg-secondary hover:text-fg-primary transition-colors"
                  >
                    Department Details
                  </Link>
                  <Link
                    to={`/book?specialtyId=${encodeURIComponent(spec.id)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                  >
                    <span>Book Slot</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>

      {/* SECTION C: Featured Doctors */}
      <section aria-labelledby="home-doctors-heading" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Medical Specialists
            </span>
            <h2
              id="home-doctors-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
            >
              Consult With Experienced Physicians
            </h2>
            <p className="text-base text-fg-secondary">
              Review qualifications, languages spoken, consultation modes, and upfront ₹ fees before
              selecting your preferred appointment time.
            </p>
          </div>
          <Button
            intent="secondary"
            onClick={() => navigate('/doctors')}
          >
            <span>View Full Doctor Directory</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[520px] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION D: How Appointment Booking Works (3-Step Visual Explanation with GSAP ScrollTrigger) */}
      <section
        aria-labelledby="how-booking-works-heading"
        className="border-y border-white/65 dark:border-white/10 bg-subtle/50 py-20"
      >
        <ScrollStorySection className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-2 mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Effortless Patient Scheduling
            </span>
            <h2
              id="how-booking-works-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
            >
              How Appointment Booking Works
            </h2>
            <p className="text-base text-fg-secondary">
              Designed for clarity and reassurance—complete your reservation in three structured
              steps with instant server confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="gsap-story-item glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-4">
              <MedicalImageFrame
                slotId="img_spec_general_med"
                aspectRatio="16/9"
                showCaptionOverlay={false}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-semibold text-brand-primary">
                  01. Choose Your Doctor
                </span>
                <Stethoscope className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-fg-primary">
                Select Specialty, Physician &amp; Consultation Mode
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                Browse by medical department or language spoken. Choose between In-Person campus
                consultations, encrypted Video Consultations (₹399), or Follow-up visits (₹299).
              </p>
            </div>

            <div className="gsap-story-item glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-4">
              <MedicalImageFrame
                slotId="img_consultation_env"
                aspectRatio="16/9"
                showCaptionOverlay={false}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-semibold text-brand-primary">
                  02. Select Your Preferred Time
                </span>
                <Clock className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-fg-primary">
                Pick a Live IST Slot &amp; Enter Minimal Patient Details
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                View real-time Morning, Afternoon, and Evening slots in Asia/Kolkata timezone. We
                collect only essential contact details required to prepare your visit.
              </p>
            </div>

            <div className="gsap-story-item glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-4">
              <MedicalImageFrame
                slotId="img_care_concierge"
                aspectRatio="16/9"
                showCaptionOverlay={false}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-semibold text-brand-primary">
                  03. Confirm Your Appointment
                </span>
                <CheckCircle2 className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-fg-primary">
                Receive Your Verified Reference Pass Immediately
              </h3>
              <p className="text-sm leading-relaxed text-fg-secondary">
                Choose Pay at Hospital or verified Razorpay online payment. Our server locks your
                slot atomically and issues your printable appointment pass (NCO-2026-XXXXXX).
              </p>
            </div>
          </div>
        </ScrollStorySection>
      </section>

      {/* SECTION E & F: Hospital Architecture, Facilities & Why Choose NovaCraft Orbai */}
      <section aria-labelledby="facilities-heading" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Architectural Medical Environment
            </span>
            <h2
              id="facilities-heading"
              className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
            >
              Calm Clinical Spaces Engineered for Patient Dignity
            </h2>
            <p className="text-base leading-relaxed text-fg-secondary">
              NovaCraft Orbai replaces noisy hospital corridors with acoustic oak galleries,
              natural daylight waiting sanctuaries, and eye-level consultation chambers where
              physicians listen without rushing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-5 space-y-1.5">
                <ShieldCheck className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                <h3 className="font-sans text-sm font-semibold text-fg-primary">
                  Transparent ₹ Fee Governance
                </h3>
                <p className="text-xs leading-relaxed text-fg-secondary">
                  Every consultation fee is shown upfront before you enter a single form field.
                </p>
              </div>
              <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-5 space-y-1.5">
                <HeartHandshake className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                <h3 className="font-sans text-sm font-semibold text-fg-primary">
                  Dedicated Patient Concierge
                </h3>
                <p className="text-xs leading-relaxed text-fg-secondary">
                  Coordinated arrival, multi-language support, and seamless diagnostic scheduling.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button intent="secondary" onClick={() => navigate('/about')}>
                <span>Tour Our Campus &amp; Clinical Philosophy</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MedicalImageFrame
              slotId="img_campus_exterior"
              aspectRatio="4/3"
              className="sm:col-span-2"
            />
            <MedicalImageFrame slotId="img_waiting_lounge" aspectRatio="4/3" />
            <MedicalImageFrame slotId="img_care_concierge" aspectRatio="4/3" />
          </div>
        </div>
      </section>

      {/* SECTION H: Transparent INR Consultation Fee Schedule & Frequently Asked Questions */}
      <section aria-labelledby="pricing-faq-heading" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 space-y-12">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
            Transparent Indian Rupee (₹) Pricing &amp; Patient Policies
          </span>
          <h2
            id="pricing-faq-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
          >
            Consultation Fees &amp; Frequently Asked Questions
          </h2>
          <p className="text-base text-fg-secondary">
            Clear fee structures and practical guidance for your outpatient visit or video
            consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <ConsultationFeeScheduleTable />
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-display text-2xl font-semibold text-fg-primary mb-4">
              Common Patient Questions
            </h3>
            {HOME_FAQS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-fg-primary hover:bg-subtle/50 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-border-hairline px-5 py-4 text-sm leading-relaxed text-fg-secondary">
                      {item.a}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="pt-2">
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
              >
                <span>View Complete FAQ &amp; Policy Guide</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION I: Final Appointment Call to Action */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl bg-[#072B24] px-6 py-16 sm:px-12 sm:py-20 text-center text-[#FAF8F5] border border-[#C5A059]/30">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(197,160,89,0.18),transparent_65%)]"
          />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D4B475]">
              NOVACRAFT ORBAI · OUTPATIENT SANCTUARY
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#FAF8F5]">
              Your Health Deserves Thoughtful Care.
            </h2>
            <p className="text-base sm:text-lg text-[#D5EAE4]/90">
              Select your specialist, choose a convenient Indian Standard Time slot, and receive
              your confirmed appointment pass in moments.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                intent="ivory"
                size="lg"
                onClick={() => navigate('/book')}
              >
                <Calendar className="h-5 w-5" aria-hidden="true" />
                <span>Book an Appointment</span>
              </Button>
              <Button
                intent="outline"
                size="lg"
                onClick={() => navigate('/doctors')}
                className="border-[#FAF8F5]/30 text-[#FAF8F5] hover:bg-[#FAF8F5]/10"
              >
                <span>Browse Doctors Directory</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
