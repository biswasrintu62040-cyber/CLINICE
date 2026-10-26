import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { DoctorCard } from '@/src/features/doctors/components/DoctorCard';
import { apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR } from '@/src/lib/formatCurrencyINR';
import type { SpecialtyDetailResponse } from '@/src/types/api.types';

export function SpecialtyDetailPage(): React.JSX.Element {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const navigate = useNavigate();

  const [data, setData] = React.useState<SpecialtyDetailResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!specialtySlug) return;
    let active = true;
    setLoading(true);
    setError(null);

    apiRequest<SpecialtyDetailResponse>(
      `/api/v1/specialties/${encodeURIComponent(specialtySlug)}`
    )
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err: Error) => {
        if (active) setError(err.message || 'Specialty not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [specialtySlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-fg-primary">
          Medical Specialty Not Found
        </h1>
        <p className="text-sm text-fg-secondary">{error}</p>
        <Button intent="secondary" onClick={() => navigate('/specialties')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to All Specialties</span>
        </Button>
      </div>
    );
  }

  const { specialty, doctors } = data;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 space-y-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-fg-muted">
        <Link to="/specialties" className="hover:text-fg-primary transition-colors">
          Specialties
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-fg-primary font-medium">{specialty.name}</span>
      </nav>

      {/* Department Hero */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono text-brand-primary">
            <span>DEPARTMENT OF {specialty.name.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Starting {formatCurrencyINR(specialty.baseConsultationFeeINR)}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
            {specialty.name}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-fg-secondary">
            {specialty.clinicalOverview}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              intent="primary"
              size="lg"
              onClick={() => navigate(`/book?specialtyId=${encodeURIComponent(specialty.id)}`)}
            >
              <Calendar className="h-5 w-5" aria-hidden="true" />
              <span>Book {specialty.name} Consultation</span>
            </Button>
            <Button intent="secondary" size="lg" onClick={() => navigate('/doctors')}>
              <span>All Hospital Specialists</span>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <MedicalImageFrame slotId={specialty.imageSlotId} aspectRatio="4/3" priority={true} />
        </div>
      </section>

      {/* Services Offered & Conditions Managed */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            Clinical Services &amp; Procedures Offered
          </h2>
          <ul className="space-y-3 text-sm text-fg-secondary">
            {specialty.servicesOffered.map((service) => (
              <li key={service} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="h-4 w-4 text-brand-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            Conditions Evaluated &amp; Managed
          </h2>
          <ul className="space-y-3 text-sm text-fg-secondary">
            {specialty.conditionsTreated.map((cond) => (
              <li key={cond} className="flex items-start gap-2.5">
                <span
                  className="h-2 w-2 rounded-full bg-brand-primary shrink-0 mt-1.5"
                  aria-hidden="true"
                />
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Department Specialists */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-fg-primary">
              {specialty.name} Specialists
            </h2>
            <p className="text-sm text-fg-secondary">
              Select a specialist below to view live IST slots or book your consultation.
            </p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-8 text-center space-y-3">
            <p className="text-sm text-fg-secondary">
              Specialist schedules for {specialty.name} are coordinated via our central booking
              wizard.
            </p>
            <Button
              intent="primary"
              onClick={() => navigate(`/book?specialtyId=${encodeURIComponent(specialty.id)}`)}
            >
              Proceed to Central Booking
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
