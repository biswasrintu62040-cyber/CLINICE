import * as React from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { formatCurrencyINR } from '@/src/lib/formatCurrencyINR';

export interface FeeScheduleRow {
  service: string;
  category: string;
  priceINR: number;
  specialtySlug?: string;
}

export const BASELINE_INR_FEE_SCHEDULE: FeeScheduleRow[] = [
  {
    service: 'General Physician Consultation',
    category: 'Primary & Internal Medicine',
    priceINR: 499,
    specialtySlug: 'spec-general-medicine',
  },
  {
    service: 'Specialist Consultation',
    category: 'Orthopedics · ENT · Ophthalmology · Gynecology',
    priceINR: 799,
    specialtySlug: 'spec-orthopedics',
  },
  {
    service: 'Senior Specialist Consultation',
    category: 'Extended 30-Min Principal Consultant Review',
    priceINR: 999,
    specialtySlug: 'spec-cardiology',
  },
  {
    service: 'Pediatric Consultation',
    category: 'Newborn, Child & Adolescent Care',
    priceINR: 599,
    specialtySlug: 'spec-pediatrics',
  },
  {
    service: 'Cardiology Consultation',
    category: 'Preventive Cardiac & ECG/Echo Review',
    priceINR: 999,
    specialtySlug: 'spec-cardiology',
  },
  {
    service: 'Dermatology Consultation',
    category: 'Clinical Dermatology & Optical Dermoscopy',
    priceINR: 699,
    specialtySlug: 'spec-dermatology',
  },
  {
    service: 'Orthopedic Consultation',
    category: 'Joint Preservation, Spine & Sports Medicine',
    priceINR: 799,
    specialtySlug: 'spec-orthopedics',
  },
  {
    service: 'Follow-up Consultation',
    category: 'Within 14 Days of Initial Consultation',
    priceINR: 299,
  },
  {
    service: 'Video Consultation',
    category: 'Encrypted Remote Teleconsultation (IST)',
    priceINR: 399,
  },
];

export function ConsultationFeeScheduleTable(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/75 dark:border-white/12 bg-elevated">
      <div className="border-b border-border-hairline bg-subtle/50 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-fg-primary">
            Standard Outpatient Consultation Fee Schedule (INR ₹)
          </h3>
          <p className="text-xs text-fg-muted">
            Illustrative prototype fee schedule — configurable by hospital administration in /admin
          </p>
        </div>
        <span className="font-mono text-xs text-brand-primary tabular-nums">
          Currency: INR (₹) · All-Inclusive Outpatient Tariff
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-hairline text-xs uppercase tracking-wider text-fg-muted">
              <th className="py-3.5 pl-6 pr-4 font-medium">Consultation Service</th>
              <th className="py-3.5 px-4 font-medium hidden sm:table-cell">Department / Scope</th>
              <th className="py-3.5 px-4 text-right font-medium">Illustrative Fee (₹)</th>
              <th className="py-3.5 pl-4 pr-6 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline text-sm">
            {BASELINE_INR_FEE_SCHEDULE.map((row) => (
              <tr key={row.service} className="hover:bg-subtle/45 transition-colors">
                <td className="py-3.5 pl-6 pr-4 font-medium text-fg-primary">
                  {row.service}
                  <span className="block text-xs text-fg-muted sm:hidden">{row.category}</span>
                </td>
                <td className="py-3.5 px-4 text-fg-secondary hidden sm:table-cell">
                  {row.category}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-base font-semibold text-fg-primary tabular-nums">
                  {formatCurrencyINR(row.priceINR)}
                </td>
                <td className="py-3.5 pl-4 pr-6 text-right">
                  <Button
                    intent="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(
                        row.specialtySlug
                          ? `/book?specialtyId=${encodeURIComponent(row.specialtySlug)}`
                          : '/book'
                      )
                    }
                    className="text-brand-primary hover:text-brand-hover"
                  >
                    <span>Book</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
