import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { Calendar, Clock, ShieldCheck } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';
import { formatCurrencyINR, formatISTDateLabel } from '@/src/lib/formatCurrencyINR';
import type { Doctor } from '@/src/types/domain.types';

export interface DoctorCardProps {
  doctor: Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } };
}

export function DoctorCard({ doctor }: DoctorCardProps): React.JSX.Element {
  const navigate = useNavigate();

  const consultationModesText = React.useMemo(() => {
    const labels: string[] = [];
    if (doctor.supportedAppointmentTypes.includes('IN_PERSON')) labels.push('In-Person');
    if (doctor.supportedAppointmentTypes.includes('VIDEO')) labels.push('Video');
    if (doctor.supportedAppointmentTypes.includes('FOLLOW_UP')) labels.push('Follow-Up');
    return labels.join(' · ');
  }, [doctor.supportedAppointmentTypes]);

  return (
    <article className="glass-card-interactive flex flex-col justify-between rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-5 hover:border-brand-primary/35">
      <div>
        {/* Portrait Frame (r_outer 16px -> inner rounded-xl) */}
        <Link
          to={`/doctors/${doctor.slug}`}
          className="block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
        >
          <MedicalImageFrame
            slotId={doctor.portraitSlotId}
            doctorName={doctor.fullName}
            doctorSpecialty={doctor.specialtyName}
            aspectRatio="3/4"
            showCaptionOverlay={false}
          />
        </Link>

        {/* Quiet Inline Kicker (Zero-Pill Static Metadata Discipline) */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
          <span className="font-semibold text-brand-primary">{doctor.specialtyName}</span>
          <span aria-hidden="true">·</span>
          {doctor.isVerifiedCredentials ? (
            <span className="inline-flex items-center gap-1 text-semantic-success font-medium">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Verified Registration</span>
            </span>
          ) : (
            <span>Sample Prototype Profile</span>
          )}
        </div>

        {/* Doctor Name & Title */}
        <h3 className="mt-1.5 font-display text-2xl font-semibold text-fg-primary">
          <Link
            to={`/doctors/${doctor.slug}`}
            className="hover:text-brand-primary transition-colors"
          >
            {doctor.fullName}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-fg-secondary line-clamp-2">{doctor.professionalTitle}</p>

        {/* Unboxed Inline Metadata (Qualifications & Languages) */}
        <div className="mt-3 space-y-1 border-t border-border-hairline pt-3 text-xs text-fg-muted">
          <p>{doctor.qualifications.join(' · ')}</p>
          <p>
            Languages: <span className="text-fg-secondary">{doctor.languagesSpoken.join(' · ')}</span>
          </p>
          <p>
            Modes: <span className="text-fg-secondary">{consultationModesText}</span>
          </p>
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="mt-5 border-t border-border-hairline pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-fg-muted">
              Consultation Fee
            </span>
            <span className="font-mono text-xl font-semibold text-fg-primary tabular-nums">
              {formatCurrencyINR(doctor.feesINR.IN_PERSON)}
            </span>
            {doctor.feesINR.VIDEO ? (
              <span className="ml-2 font-mono text-xs text-fg-muted tabular-nums">
                · Video {formatCurrencyINR(doctor.feesINR.VIDEO)}
              </span>
            ) : null}
          </div>

          {doctor.nextAvailableSlot ? (
            <div className="text-right text-xs text-fg-secondary">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-primary">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>Next Slot (IST)</span>
              </span>
              <p className="font-mono text-xs font-medium text-fg-primary tabular-nums">
                {formatISTDateLabel(doctor.nextAvailableSlot.dateIST).split(',')[0]} ·{' '}
                {doctor.nextAvailableSlot.startTimeIST}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button
            intent="secondary"
            size="sm"
            onClick={() => navigate(`/doctors/${doctor.slug}`)}
          >
            View Profile
          </Button>
          <Button
            intent="primary"
            size="sm"
            onClick={() =>
              navigate(
                `/book?specialtyId=${encodeURIComponent(doctor.specialtyId)}&doctorId=${encodeURIComponent(doctor.id)}`
              )
            }
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Book Slot</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
