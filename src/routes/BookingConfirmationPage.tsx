import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  Calendar,
  Check,
  Copy,
  MapPin,
  Printer,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { LottieViewportPlayer } from '@/src/components/lottie/LottieViewportPlayer';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR, formatISTDateLabel } from '@/src/lib/formatCurrencyINR';
import type { Appointment } from '@/src/types/domain.types';

export function BookingConfirmationPage(): React.JSX.Element {
  const { referenceId } = useParams<{ referenceId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = React.useState<Appointment | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!referenceId) return;
    let active = true;
    setLoading(true);
    apiRequest<{ appointment: Appointment }>(
      `/api/v1/appointments/${encodeURIComponent(referenceId)}`
    )
      .then((res) => {
        if (active) setAppointment(res.appointment);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || 'Appointment confirmation record not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [referenceId]);

  const handleCopyRef = (): void => {
    if (!appointment) return;
    navigator.clipboard?.writeText(appointment.referenceId).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-fg-primary">
          Appointment Record Not Found
        </h1>
        <p className="text-sm text-fg-secondary">{error}</p>
        <Button intent="primary" onClick={() => navigate('/book')}>
          Book a New Appointment
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 space-y-8">
      {/* Step 7 Verified Confirmation Pass Card */}
      <div className="overflow-hidden rounded-2xl border border-border-strong bg-elevated shadow-sm">
        {/* Top Sanctuary Emerald Header */}
        <div className="bg-[#072B24] px-6 py-8 sm:px-10 text-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <LottieViewportPlayer loop={false} />
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#D4B475]">
                SERVER-VERIFIED APPOINTMENT PASS
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAF8F5]">
                Appointment Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-[#D5EAE4]/90 mt-0.5">
                Your time slot has been locked in Indian Standard Time (Asia/Kolkata).
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#C5A059]/40 bg-[#0A3A31] px-4 py-3 text-left sm:text-right shrink-0">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[#D4B475]">
              Reference Number
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-[#FAF8F5] tabular-nums">
                {appointment.referenceId}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                aria-label="Copy booking reference number"
                className="rounded p-1 text-[#D4B475] hover:bg-[#FAF8F5]/10 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Details Body */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-b border-border-hairline pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-fg-muted">
                Specialist Physician
              </span>
              <p className="font-display text-2xl font-semibold text-fg-primary">
                {appointment.doctorSnapshot.fullName}
              </p>
              <p className="text-xs text-fg-secondary">
                {appointment.doctorSnapshot.professionalTitle}
              </p>
              <p className="text-xs font-medium text-brand-primary">
                Department of {appointment.doctorSnapshot.specialtyName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-fg-muted">
                Scheduled Date &amp; Time (IST)
              </span>
              <p className="font-mono text-lg font-semibold text-fg-primary tabular-nums">
                {formatISTDateLabel(appointment.dateIST)}
              </p>
              <p className="font-mono text-base font-semibold text-brand-primary tabular-nums">
                {appointment.startTimeIST} – {appointment.endTimeIST} IST
              </p>
              <p className="text-xs text-fg-muted">
                Consultation Mode: {appointment.appointmentType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Location or Video Instructions */}
          <div className="rounded-xl border border-border-hairline bg-subtle/60 p-5 space-y-2">
            {appointment.appointmentType === 'VIDEO' ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-fg-primary">
                  <Video className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <span>Video Consultation Instructions</span>
                </div>
                <p className="text-xs leading-relaxed text-fg-secondary">
                  Sign into the{' '}
                  <Link to="/portal" className="font-semibold text-brand-primary underline">
                    NovaCraft Orbai Patient Portal
                  </Link>{' '}
                  using your reference code <strong>{appointment.referenceId}</strong> or mobile
                  number <strong>+91 {appointment.patient.mobileNumber}</strong> 10 minutes before{' '}
                  {appointment.startTimeIST} IST to join the encrypted teleconsultation room.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-fg-primary">
                  <MapPin className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <span>Campus Location &amp; Arrival Instructions</span>
                </div>
                <p className="text-xs leading-relaxed text-fg-secondary">
                  <strong>{appointment.doctorSnapshot.campusWing}</strong>. Please arrive 15
                  minutes prior to your scheduled time and present Reference ID{' '}
                  <strong className="font-mono">{appointment.referenceId}</strong> at the Sanctuary
                  Concierge Desk.
                </p>
              </>
            )}
          </div>

          {/* Patient & Payment Status Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-b border-border-hairline pb-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-fg-muted">
                Registered Patient
              </span>
              <p className="font-semibold text-fg-primary">
                {appointment.patient.fullName} ({appointment.patient.ageYears} yrs)
              </p>
              <p className="font-mono text-xs text-fg-secondary tabular-nums">
                Mobile: +91 {appointment.patient.mobileNumber}
              </p>
              {appointment.patient.reasonForVisit ? (
                <p className="text-xs text-fg-muted pt-1">
                  Visit Note: {appointment.patient.reasonForVisit}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-fg-muted">
                Consultation Fee &amp; Payment Status
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
                  {formatCurrencyINR(appointment.consultationFeeINR)}
                </span>
                <span
                  className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded ${
                    appointment.paymentStatus === 'PAID'
                      ? 'bg-semantic-success-bg text-semantic-success'
                      : 'bg-semantic-warning-bg text-semantic-warning'
                  }`}
                >
                  {appointment.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-fg-muted">
                Method: {appointment.paymentMethod.replace(/_/g, ' ')} (Illustrative Prototype Fee)
              </p>
            </div>
          </div>

          {/* Honest Notification Dispatch Status */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-fg-muted">
              Notification Dispatch Log
            </span>
            {appointment.notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2.5 rounded-lg border border-border-hairline bg-canvas p-3 text-xs text-fg-secondary"
              >
                <ShieldCheck
                  className="h-4 w-4 text-brand-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-mono font-semibold text-fg-primary">
                    [{n.channel}: {n.status}]
                  </span>{' '}
                  <span>{n.statusReason}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-3">
              <Button intent="secondary" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span>Print / Save Pass</span>
              </Button>
              <Button
                intent="outline"
                size="sm"
                onClick={() =>
                  navigate(`/portal?ref=${encodeURIComponent(appointment.referenceId)}`)
                }
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>Reschedule or Cancel in Portal</span>
              </Button>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              Return to NovaCraft Orbai Home →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
