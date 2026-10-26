import * as React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export function PrivacyPolicyPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 space-y-8">
      <div className="space-y-2 border-b border-border-hairline pb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          NovaCraft Orbai · Patient Data Protection
        </span>
        <h1 className="font-display text-4xl font-semibold text-fg-primary">Privacy Policy</h1>
        <p className="text-xs font-mono text-fg-muted">
          Effective Date: October 2026 · Applicable to NovaCraft Orbai Digital Outpatient Platform
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-fg-secondary">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            01. Minimal Personal Data Collection
          </h2>
          <p>
            NovaCraft Orbai collects only the minimal personal information necessary to schedule
            and confirm your outpatient consultation: your full name, 10-digit Indian mobile
            number, optional email address, age, selected appointment type, and an optional brief
            reason for visit. We never request government identity numbers (such as Aadhaar or
            PAN), account passwords during guest booking, or raw credit/debit card details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            02. Purpose of Processing &amp; Slot Reservation
          </h2>
          <p>
            Information submitted in the 7-step booking wizard is processed exclusively to reserve
            your chosen Indian Standard Time (Asia/Kolkata) appointment slot, generate your unique
            Booking Reference ID (`NCO-2026-XXXXXX`), and enable self-service lookup, rescheduling,
            or cancellation within the Patient Portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            03. Payment Security &amp; Third-Party Gateways
          </h2>
          <p>
            When online payment via Razorpay is enabled, payment instruments are processed directly
            by Razorpay’s PCI-DSS compliant checkout infrastructure. Our server stores only the
            cryptographic order/payment reference IDs and verification status (`PAYMENT_PENDING`,
            `PAID`, `PAYMENT_FAILED`, `REFUND_PENDING`, `REFUNDED`).
          </p>
        </section>
      </div>

      <div className="border-t border-border-hairline pt-6 flex items-center justify-between">
        <Button intent="secondary" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return Home</span>
        </Button>
        <Button intent="primary" size="sm" onClick={() => navigate('/book')}>
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Book Appointment</span>
        </Button>
      </div>
    </div>
  );
}

export function TermsOfServicePage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 space-y-8">
      <div className="space-y-2 border-b border-border-hairline pb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          NovaCraft Orbai · Clinical &amp; Digital Terms
        </span>
        <h1 className="font-display text-4xl font-semibold text-fg-primary">Terms of Service</h1>
        <p className="text-xs font-mono text-fg-muted">
          Effective Date: October 2026 · Jurisdiction: India (Asia/Kolkata Timezone)
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-fg-secondary">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            01. Outpatient Scheduling &amp; Emergency Disclaimer
          </h2>
          <p>
            NovaCraft Orbai provides online scheduling for non-emergency outpatient consultations
            and teleconsultations. This platform does not provide emergency triage. In the event of
            a medical emergency, dial 108 or 112 immediately or proceed to the nearest emergency
            department.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            02. Illustrative Prototype Pricing &amp; Sample Profiles
          </h2>
          <p>
            Consultation fees displayed in Indian Rupees (₹299 to ₹999) and sample specialist
            profiles in this environment are clearly labeled as illustrative prototype records
            until verified and approved by authorized hospital administration in the Staff Admin
            Dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            03. Server-Verified Appointment Confirmation
          </h2>
          <p>
            An appointment is confirmed only when the NovaCraft Orbai server locks the requested
            IST slot and issues a valid `NCO-2026-XXXXXX` reference code.
          </p>
        </section>
      </div>

      <div className="border-t border-border-hairline pt-6 flex items-center justify-between">
        <Button intent="secondary" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return Home</span>
        </Button>
        <Button intent="primary" size="sm" onClick={() => navigate('/book')}>
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Book Appointment</span>
        </Button>
      </div>
    </div>
  );
}

export function CancellationPolicyPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 space-y-8">
      <div className="space-y-2 border-b border-border-hairline pb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          NovaCraft Orbai · Patient Scheduling Flexibility
        </span>
        <h1 className="font-display text-4xl font-semibold text-fg-primary">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="text-xs font-mono text-fg-muted">
          Transparent Rescheduling, Slot Release &amp; INR Refund Governance
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-fg-secondary">
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            01. Self-Service Rescheduling
          </h2>
          <p>
            Patients may reschedule a confirmed appointment at any time prior to the consultation
            window via the Patient Portal (`/portal`). Rescheduling atomically locks the new IST
            slot and releases the original time slot for other patients.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            02. Cancellations &amp; Refund Status Transitions
          </h2>
          <p>
            Appointments reserved under <strong>Pay at Hospital</strong> (`PAYMENT_PENDING`) can be
            cancelled without penalty. Appointments paid online (`PAID`) that are cancelled
            transition automatically to `REFUND_PENDING` for administrative review and settlement
            back to the original payment source.
          </p>
        </section>
      </div>

      <div className="rounded-xl border border-border-hairline bg-subtle p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-fg-secondary">
          <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
          <span>Need to modify an existing booking? Access the Patient Portal directly.</span>
        </div>
        <Button intent="primary" size="sm" onClick={() => navigate('/portal')}>
          Manage My Appointment
        </Button>
      </div>
    </div>
  );
}

export function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-5">
      <span className="font-mono text-xs uppercase tracking-widest text-brand-primary">
        404 · PAGE NOT FOUND
      </span>
      <h1 className="font-display text-4xl font-semibold text-fg-primary">
        This Sanctuary Wing Could Not Be Located
      </h1>
      <p className="text-sm text-fg-secondary">
        The link you followed may be outdated or mistyped. Use the actions below to return to the
        NovaCraft Orbai homepage or schedule an appointment.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Button intent="secondary" onClick={() => navigate('/')}>
          Return to Homepage
        </Button>
        <Button intent="primary" onClick={() => navigate('/book')}>
          Book an Appointment
        </Button>
      </div>
    </div>
  );
}
