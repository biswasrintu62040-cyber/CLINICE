import * as React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';

export function AboutPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-20">
      {/* Page Hero */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
            About NovaCraft Orbai
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
            Architectural Calm Meets Rigorous Clinical Medicine
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-fg-secondary">
            NovaCraft Orbai was founded on a straightforward premise: medical care is most
            effective when patients feel unhurried, informed, and respected. From transparent
            Indian Rupee (₹) consultation fees to eye-level consultation chambers bathed in natural
            daylight, every detail of our flagship sanctuary reduces clinical anxiety.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button intent="primary" onClick={() => navigate('/book')}>
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Book an Appointment</span>
            </Button>
            <Button intent="secondary" onClick={() => navigate('/doctors')}>
              <span>Meet Our Specialists</span>
            </Button>
          </div>
        </div>
        <div className="lg:col-span-6">
          <MedicalImageFrame slotId="img_campus_exterior" aspectRatio="16/9" priority={true} />
        </div>
      </section>

      {/* Core Pillars */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-3">
          <Clock className="h-6 w-6 text-brand-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            01. Unhurried Consultations
          </h2>
          <p className="text-sm leading-relaxed text-fg-secondary">
            Scheduled 30-minute appointment blocks in Asia/Kolkata (IST) ensure physicians have the
            time to listen thoroughly to your symptoms, review prior diagnostics, and explain every
            treatment option in plain language.
          </p>
        </div>

        <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-3">
          <ShieldCheck className="h-6 w-6 text-brand-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            02. Complete Fee &amp; Data Honesty
          </h2>
          <p className="text-sm leading-relaxed text-fg-secondary">
            We publish our consultation fees clearly in Indian Rupees (₹299 to ₹999) and never
            fabricate physician credentials, ratings, or hospital statistics. All prototype sample
            records are explicitly labeled until verified by administration.
          </p>
        </div>

        <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-3">
          <Users className="h-6 w-6 text-brand-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            03. Integrated Multi-Specialty Care
          </h2>
          <p className="text-sm leading-relaxed text-fg-secondary">
            Internal Medicine, Cardiology, Orthopedics, Pediatrics, Neurology, Dermatology,
            Women&apos;s Healthcare, ENT, Ophthalmology, Dentistry, and Diagnostics collaborate
            seamlessly under a single outpatient record.
          </p>
        </div>
      </section>

      {/* Architectural Campus Gallery */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
            Flagship Campus Environments
          </span>
          <h2 className="font-display text-3xl font-semibold text-fg-primary">
            Designed Around Natural Light &amp; Acoustic Privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MedicalImageFrame slotId="img_campus_interior" aspectRatio="4/3" />
          <MedicalImageFrame slotId="img_consultation_env" aspectRatio="4/3" />
          <MedicalImageFrame slotId="img_waiting_lounge" aspectRatio="4/3" />
          <MedicalImageFrame slotId="img_spec_diagnostics" aspectRatio="4/3" />
          <MedicalImageFrame slotId="img_service_preventive" aspectRatio="4/3" />
          <MedicalImageFrame slotId="img_medical_team" aspectRatio="4/3" />
        </div>
      </section>

      {/* Governance & Patient Charter */}
      <section className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-primary">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            <span>PATIENT PRIVACY &amp; CLINICAL GOVERNANCE</span>
          </div>
          <h2 className="font-display text-3xl font-semibold text-fg-primary">
            Minimal Data Collection &amp; Respectful Patient Care
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-fg-secondary">
            When you book an appointment at NovaCraft Orbai, we request only the essential
            information needed to reserve your slot and prepare your physician. We never ask for
            unnecessary identity documents or raw payment card numbers.
          </p>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end">
          <Button intent="primary" size="lg" onClick={() => navigate('/book')}>
            <Calendar className="h-5 w-5" aria-hidden="true" />
            <span>Schedule Your Visit</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
