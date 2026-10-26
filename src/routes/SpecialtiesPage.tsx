import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Calendar } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { SpotlightCard } from '@/src/components/motion/aceternity/SpotlightCard';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ConsultationFeeScheduleTable } from '@/src/features/booking/components/ConsultationFeeScheduleTable';
import {
  INITIAL_MEDICAL_SERVICES,
  INITIAL_SPECIALTIES,
} from '@/src/data/clinicalCatalogSeed';
import { apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR } from '@/src/lib/formatCurrencyINR';
import type { SpecialtiesListResponse } from '@/src/types/api.types';
import type { MedicalServiceItem, Specialty } from '@/src/types/domain.types';

const SERVICE_IMAGE_SLOT_MAP: Record<string, string> = {
  'srv-general-physician': 'img_spec_general_med',
  'srv-specialist': 'img_consultation_env',
  'srv-senior-specialist': 'img_medical_team',
  'srv-pediatric': 'img_spec_pediatrics',
  'srv-cardiology': 'img_spec_cardiology',
  'srv-dermatology': 'img_spec_dermatology',
  'srv-orthopedic': 'img_spec_orthopedics',
  'srv-follow-up': 'img_waiting_lounge',
  'srv-video-consultation': 'img_care_concierge',
  'srv-diagnostics': 'img_spec_diagnostics',
  'srv-preventive-checkup': 'img_service_preventive',
};

export function SpecialtiesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = React.useState<Specialty[]>(() => INITIAL_SPECIALTIES);
  const [services, setServices] = React.useState<MedicalServiceItem[]>(
    () => INITIAL_MEDICAL_SERVICES
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let active = true;
    apiRequest<SpecialtiesListResponse>('/api/v1/specialties')
      .then((res) => {
        if (!active) return;
        setSpecialties(res.items);
        setServices(res.services);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-20">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          Clinical Departments &amp; Outpatient Services
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
          Medical Specialties &amp; Clinical Services
        </h1>
        <p className="text-base sm:text-lg text-fg-secondary">
          Explore our 11 medical departments and dedicated outpatient services. Every specialty
          displays transparent Indian Rupee (₹) consultation fees and live appointment availability.
        </p>
      </section>

      {/* 11 Specialties Grid */}
      <section aria-labelledby="specialties-grid-heading" className="space-y-8">
        <h2 id="specialties-grid-heading" className="sr-only">
          Medical Specialties Directory
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[430px] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialties.map((spec, idx) => (
              <SpotlightCard key={spec.id} className="p-6 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/specialties/${spec.slug}`}
                    className="block overflow-hidden rounded-xl"
                  >
                    <MedicalImageFrame
                      slotId={spec.imageSlotId}
                      aspectRatio="4/3"
                      priority={idx < 6}
                      showCaptionOverlay={false}
                    />
                  </Link>

                  <div className="mt-4 flex items-center justify-between text-xs text-fg-muted font-mono">
                    <span>Starting Consultation Fee</span>
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

                  <p className="mt-2 text-sm text-fg-secondary leading-relaxed">
                    {spec.shortDescription}
                  </p>

                  <ul className="mt-4 space-y-1 border-t border-border-hairline pt-3 text-xs text-fg-muted">
                    {spec.servicesOffered.slice(0, 3).map((srv) => (
                      <li key={srv} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-brand-primary shrink-0" aria-hidden="true" />
                        <span className="truncate">{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-border-hairline pt-4 flex items-center justify-between gap-3">
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => navigate(`/specialties/${spec.slug}`)}
                  >
                    Explore Department
                  </Button>
                  <Button
                    intent="primary"
                    size="sm"
                    onClick={() => navigate(`/book?specialtyId=${encodeURIComponent(spec.id)}`)}
                  >
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Book Slot</span>
                  </Button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>

      {/* Dedicated Medical Services Section */}
      <section aria-labelledby="clinical-services-heading" className="space-y-8 border-t border-border-hairline pt-16">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
            Outpatient Offerings
          </span>
          <h2
            id="clinical-services-heading"
            className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary"
          >
            Dedicated Clinical &amp; Diagnostic Services
          </h2>
          <p className="text-base text-fg-secondary">
            Configured services available across our Flagship Sanctuary and remote teleconsultation
            desk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="glass-card-interactive rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <MedicalImageFrame
                  slotId={SERVICE_IMAGE_SLOT_MAP[srv.id] || 'img_consultation_env'}
                  aspectRatio="16/9"
                  showCaptionOverlay={false}
                />
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-fg-muted pt-1">
                  <span>{srv.category.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold text-fg-primary tabular-nums">
                    {formatCurrencyINR(srv.suggestedFeeINR)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-fg-primary">{srv.title}</h3>
                <p className="text-sm leading-relaxed text-fg-secondary">{srv.description}</p>
              </div>
              <div className="border-t border-border-hairline pt-3 flex items-center justify-between text-xs">
                <span className="text-fg-muted">Illustrative Fee</span>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
                >
                  <span>Schedule Service</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete INR Consultation Fee Schedule */}
      <section className="space-y-6">
        <ConsultationFeeScheduleTable />
      </section>
    </div>
  );
}
