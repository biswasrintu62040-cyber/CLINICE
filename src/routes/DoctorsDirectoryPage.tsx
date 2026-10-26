import * as React from 'react';
import { useSearchParams } from 'react-router';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Skeleton } from '@/src/components/ui/skeleton';
import { DoctorCard } from '@/src/features/doctors/components/DoctorCard';
import {
  getSeedNextAvailableSlotForDoctor,
  INITIAL_DOCTORS,
  INITIAL_SPECIALTIES,
} from '@/src/data/clinicalCatalogSeed';
import { apiRequest } from '@/src/lib/apiClient';
import type { DoctorsListResponse, SpecialtiesListResponse } from '@/src/types/api.types';
import type { AppointmentTypeCode, Doctor, Specialty } from '@/src/types/domain.types';

const CONSULTATION_MODES: Array<{ label: string; value: '' | AppointmentTypeCode }> = [
  { label: 'All Modes', value: '' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Video Consultation', value: 'VIDEO' },
  { label: 'Follow-Up', value: 'FOLLOW_UP' },
];

const LANGUAGES_LIST = ['All', 'English', 'Hindi', 'Kannada', 'Tamil', 'Marathi', 'Malayalam', 'Bengali'];

export function DoctorsDirectoryPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const specialtyParam = searchParams.get('specialty') || 'all';
  const modeParam = (searchParams.get('type') || '') as '' | AppointmentTypeCode;
  const langParam = searchParams.get('language') || 'All';
  const sortParam = searchParams.get('sort') || 'featured';
  const queryParam = searchParams.get('search') || '';

  const [specialties, setSpecialties] = React.useState<Specialty[]>(() => INITIAL_SPECIALTIES);
  const [doctors, setDoctors] = React.useState<
    Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>
  >(() =>
    INITIAL_DOCTORS.map((d) => ({
      ...d,
      nextAvailableSlot: getSeedNextAvailableSlotForDoctor(d.id),
    }))
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    apiRequest<SpecialtiesListResponse>('/api/v1/specialties')
      .then((res) => setSpecialties(res.items))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    let active = true;

    const qs = new URLSearchParams();
    if (specialtyParam && specialtyParam !== 'all') qs.set('specialty', specialtyParam);
    if (modeParam) qs.set('type', modeParam);
    if (langParam && langParam !== 'All') qs.set('language', langParam);
    if (sortParam) qs.set('sort', sortParam);
    if (queryParam.trim()) qs.set('search', queryParam.trim());

    apiRequest<DoctorsListResponse>(`/api/v1/doctors?${qs.toString()}`)
      .then((res) => {
        if (active) setDoctors(res.items);
      })
      .catch(() => {
        if (active) setDoctors([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [specialtyParam, modeParam, langParam, sortParam, queryParam]);

  const updateParam = (key: string, value: string): void => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const resetAllFilters = (): void => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          NovaCraft Orbai Specialist Directory
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
          Discover Our Medical Specialists
        </h1>
        <p className="text-base text-fg-secondary">
          Filter physicians by medical department, consultation mode, language spoken, or Indian
          Rupee (₹) consultation fee. All sample profiles are clearly labeled until verified by
          hospital administration.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="doctor-search" className="sr-only">
              Search doctor by name, specialty, or clinical interest
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted z-10"
              aria-hidden="true"
            />
            <Input
              id="doctor-search"
              type="search"
              value={queryParam}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by doctor name, department, or condition..."
              className="pl-10"
            />
          </div>

          {/* Department Select */}
          <div className="md:col-span-3">
            <label htmlFor="specialty-select" className="sr-only">
              Filter by medical specialty
            </label>
            <select
              id="specialty-select"
              value={specialtyParam}
              onChange={(e) => updateParam('specialty', e.target.value)}
              className="flex min-h-11 w-full rounded-xl border border-border-strong/80 bg-white/75 dark:bg-[#0C211D]/75 backdrop-blur-md px-3.5 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
            >
              <option value="all">All Medical Specialties</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Select */}
          <div className="md:col-span-2">
            <label htmlFor="language-select" className="sr-only">
              Filter by language spoken
            </label>
            <select
              id="language-select"
              value={langParam}
              onChange={(e) => updateParam('language', e.target.value)}
              className="flex min-h-11 w-full rounded-xl border border-border-strong/80 bg-white/75 dark:bg-[#0C211D]/75 backdrop-blur-md px-3.5 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'All' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-2">
            <label htmlFor="sort-select" className="sr-only">
              Sort doctors
            </label>
            <select
              id="sort-select"
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="flex min-h-11 w-full rounded-xl border border-border-strong/80 bg-white/75 dark:bg-[#0C211D]/75 backdrop-blur-md px-3.5 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
            >
              <option value="featured">Sort: Featured</option>
              <option value="fee_asc">Fee: Low to High (₹)</option>
              <option value="fee_desc">Fee: High to Low (₹)</option>
            </select>
          </div>
        </div>

        {/* Interactive Mode Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-hairline pt-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-subtle/80 p-1 border border-white/50 dark:border-white/10">
            {CONSULTATION_MODES.map((mode) => {
              const isActive = modeParam === mode.value;
              return (
                <button
                  key={mode.label}
                  type="button"
                  onClick={() => updateParam('type', mode.value)}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-elevated text-fg-primary shadow-xs font-semibold'
                      : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-fg-muted">
            <span className="font-mono tabular-nums">
              Showing {doctors.length} {doctors.length === 1 ? 'specialist' : 'specialists'}
            </span>
            {(specialtyParam !== 'all' || modeParam || langParam !== 'All' || queryParam) ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-[520px] w-full" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-xl border border-border-hairline bg-elevated p-12 text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            No Specialists Matched Your Current Filters
          </h2>
          <p className="text-sm text-fg-secondary max-w-md mx-auto">
            Try clearing your search keyword or switching to &ldquo;All Medical Specialties&rdquo;
            to view available physicians.
          </p>
          <Button intent="secondary" onClick={resetAllFilters}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
