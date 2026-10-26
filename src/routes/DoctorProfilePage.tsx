import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR, formatISTShortDay } from '@/src/lib/formatCurrencyINR';
import type { DoctorDetailResponse } from '@/src/types/api.types';

export function DoctorProfilePage(): React.JSX.Element {
  const { doctorSlug } = useParams<{ doctorSlug: string }>();
  const navigate = useNavigate();

  const [data, setData] = React.useState<DoctorDetailResponse | null>(null);
  const [selectedDateIST, setSelectedDateIST] = React.useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!doctorSlug) return;
    let active = true;
    setLoading(true);
    setError(null);

    apiRequest<DoctorDetailResponse>(`/api/v1/doctors/${encodeURIComponent(doctorSlug)}`)
      .then((res) => {
        if (!active) return;
        setData(res);
        const firstDate = res.upcomingDatesIST[0] || '';
        setSelectedDateIST(firstDate);
        const firstOpen = (res.slotsByDate[firstDate] || []).find((s) => s.status === 'AVAILABLE');
        setSelectedSlotId(firstOpen?.id || '');
      })
      .catch((err: Error) => {
        if (active) setError(err.message || 'Unable to load doctor profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-[520px] lg:col-span-8" />
          <Skeleton className="h-[520px] lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-fg-primary">
          Specialist Profile Not Found
        </h1>
        <p className="text-sm text-fg-secondary">{error}</p>
        <Button intent="secondary" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return to Doctor Directory</span>
        </Button>
      </div>
    );
  }

  const { doctor, upcomingDatesIST, slotsByDate } = data;
  const activeDaySlots = slotsByDate[selectedDateIST] || [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-fg-muted">
        <Link to="/doctors" className="hover:text-fg-primary transition-colors">
          Our Doctors
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/doctors?specialty=${encodeURIComponent(doctor.specialtyId)}`}
          className="hover:text-fg-primary transition-colors"
        >
          {doctor.specialtyName}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-fg-primary font-medium">{doctor.fullName}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        {/* Left 8 Columns: Biography, Qualifications, Clinical Interests, Fee Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6">
            <div className="sm:col-span-4">
              <MedicalImageFrame
                slotId={doctor.portraitSlotId}
                doctorName={doctor.fullName}
                doctorSpecialty={doctor.specialtyName}
                aspectRatio="3/4"
                showCaptionOverlay={false}
              />
            </div>

            <div className="sm:col-span-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <span className="font-semibold text-brand-primary">{doctor.specialtyName}</span>
                  <span aria-hidden="true">·</span>
                  {doctor.isVerifiedCredentials ? (
                    <span className="inline-flex items-center gap-1 text-semantic-success font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Verified Registration ({doctor.registrationNumber})</span>
                    </span>
                  ) : (
                    <span>Sample Prototype Profile — Configurable in Admin</span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary">
                  {doctor.fullName}
                </h1>
                <p className="text-base text-fg-secondary">{doctor.professionalTitle}</p>

                <div className="pt-2 space-y-1.5 text-sm text-fg-secondary">
                  <p>
                    <strong className="font-semibold text-fg-primary">Qualifications:</strong>{' '}
                    {doctor.qualifications.join(' · ')}
                  </p>
                  <p>
                    <strong className="font-semibold text-fg-primary">Languages Spoken:</strong>{' '}
                    {doctor.languagesSpoken.join(' · ')}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-xs text-fg-muted pt-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                    <span>{doctor.campusWing}</span>
                  </p>
                </div>
              </div>

              {/* Consultation Fee Breakdown inside Profile */}
              <div className="grid grid-cols-3 gap-3 border-t border-border-hairline pt-4">
                <div className="rounded-xl bg-subtle/80 border border-white/60 dark:border-white/10 p-3">
                  <span className="block text-[11px] uppercase tracking-wider text-fg-muted">
                    In-Person Visit
                  </span>
                  <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums">
                    {formatCurrencyINR(doctor.feesINR.IN_PERSON)}
                  </span>
                </div>
                {doctor.feesINR.VIDEO ? (
                  <div className="rounded-xl bg-subtle/80 border border-white/60 dark:border-white/10 p-3">
                    <span className="block text-[11px] uppercase tracking-wider text-fg-muted">
                      Video Consult
                    </span>
                    <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums">
                      {formatCurrencyINR(doctor.feesINR.VIDEO)}
                    </span>
                  </div>
                ) : null}
                {doctor.feesINR.FOLLOW_UP ? (
                  <div className="rounded-xl bg-subtle/80 border border-white/60 dark:border-white/10 p-3">
                    <span className="block text-[11px] uppercase tracking-wider text-fg-muted">
                      Follow-Up
                    </span>
                    <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums">
                      {formatCurrencyINR(doctor.feesINR.FOLLOW_UP)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Clinical Biography & Interests */}
          <div className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-fg-primary">
                Professional Biography
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-fg-secondary">
                {doctor.biography}
              </p>
            </div>

            <div className="border-t border-border-hairline pt-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-fg-primary">
                Clinical Interests &amp; Focus Areas
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-fg-secondary">
                {doctor.clinicalInterests.map((interest) => (
                  <li key={interest} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" aria-hidden="true" />
                    <span>{interest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Interactive Live IST Slot Selector Widget */}
        <aside className="lg:col-span-4 rounded-2xl border border-white/80 dark:border-white/15 bg-elevated p-6 space-y-5 sticky top-24">
          <div className="border-b border-border-hairline pb-4">
            <div className="flex items-center justify-between text-xs font-mono text-brand-primary">
              <span>LIVE IST AVAILABILITY</span>
              <span>ASIA/KOLKATA</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-fg-primary">
              Select Date &amp; Time Slot
            </h2>
            <p className="text-xs text-fg-muted mt-0.5">
              Choose an open slot below to continue directly to patient details.
            </p>
          </div>

          {/* Date Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {upcomingDatesIST.slice(0, 6).map((dateStr) => {
              const { weekday, dayNum, monthShort } = formatISTShortDay(dateStr);
              const isSelected = selectedDateIST === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDateIST(dateStr);
                    const firstAvail = (slotsByDate[dateStr] || []).find(
                      (s) => s.status === 'AVAILABLE'
                    );
                    setSelectedSlotId(firstAvail?.id || '');
                  }}
                  className={`flex min-w-[68px] flex-col items-center rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary text-fg-on-brand font-semibold'
                      : 'border-border-hairline bg-subtle text-fg-secondary hover:border-border-strong'
                  }`}
                >
                  <span>{weekday}</span>
                  <span className="font-mono text-base font-semibold tabular-nums">{dayNum}</span>
                  <span className="text-[11px] opacity-80">{monthShort}</span>
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-fg-secondary">
              Available Slots ({selectedDateIST})
            </span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Time slots">
              {activeDaySlots.map((slot) => {
                const isAvailable = slot.status === 'AVAILABLE';
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs tabular-nums transition-colors ${
                      !isAvailable
                        ? 'border-border-hairline bg-subtle/40 text-fg-muted/45 line-through cursor-not-allowed'
                        : isSelected
                          ? 'border-brand-primary bg-brand-soft text-brand-primary font-semibold ring-1 ring-brand-primary cursor-pointer'
                          : 'border-border-hairline bg-elevated text-fg-primary hover:border-brand-primary cursor-pointer'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{slot.startTimeIST}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            intent="primary"
            size="lg"
            className="w-full"
            onClick={() =>
              navigate(
                `/book?specialtyId=${encodeURIComponent(doctor.specialtyId)}&doctorId=${encodeURIComponent(
                  doctor.id
                )}&dateIST=${encodeURIComponent(selectedDateIST)}&slotId=${encodeURIComponent(
                  selectedSlotId
                )}`
              )
            }
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Continue to Book Appointment</span>
          </Button>
        </aside>
      </div>
    </div>
  );
}
