import * as React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ConsultationFeeScheduleTable } from '@/src/features/booking/components/ConsultationFeeScheduleTable';

const ALL_FAQS = [
  {
    category: 'Booking & Slots',
    q: 'How does real-time IST slot locking work during booking?',
    a: 'When you complete Step 6 of our booking wizard, the NovaCraft Orbai server atomically verifies that your chosen slot in Asia/Kolkata (IST) is still open and transitions its status to BOOKED. If another patient reserved the same slot moments earlier, our server returns a 409 Conflict and prompts you to select another open time without losing your entered details.',
  },
  {
    category: 'Consultation Fees & Payment',
    q: 'What are the consultation fees in Indian Rupees (₹)?',
    a: 'Our prototype fee schedule ranges from ₹299 for a Follow-up Consultation and ₹399 for a Video Consultation up to ₹499 (General Physician), ₹599 (Pediatrics), ₹699 (Dermatology), ₹799 (Specialist / Orthopedics), and ₹999 (Senior Specialist / Cardiology). All fees are clearly labeled as illustrative until approved by hospital administration.',
  },
  {
    category: 'Consultation Fees & Payment',
    q: 'Can I reserve an appointment without paying online immediately?',
    a: 'Yes. Select "Pay at Hospital Desk" in Step 6 to confirm your slot immediately with status PAYMENT_PENDING. You can settle the consultation fee in ₹ at our Flagship Outpatient Desk 15 minutes before your appointment.',
  },
  {
    category: 'Campus Visit & Documents',
    q: 'How early should I arrive for an in-person consultation?',
    a: 'Please arrive 15 minutes prior to your scheduled IST slot and present your Booking Reference ID (NCO-2026-XXXXXX) at the Sanctuary Concierge Desk along with a valid photo ID.',
  },
  {
    category: 'Video Consultations',
    q: 'How do I join a scheduled Video Consultation?',
    a: 'Video Consultations (₹399) can be accessed through the Patient Portal (/portal) using your Reference ID and registered mobile number 10 minutes before your scheduled IST slot.',
  },
  {
    category: 'Cancellations & Refunds',
    q: 'How can I reschedule or cancel my appointment?',
    a: 'Visit the Patient Portal (/portal), look up your booking, and click Reschedule or Cancel. Cancelling immediately releases your time slot back to the public availability pool and transitions paid bookings to REFUND_PENDING.',
  },
];

export function FaqPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const filteredFaqs = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_FAQS;
    return ALL_FAQS.filter(
      (item) =>
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8 space-y-16">
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          Patient Guidance &amp; Transparent Tariff
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
          Frequently Asked Questions &amp; INR Fee Guide
        </h1>
        <p className="text-base text-fg-secondary">
          Everything you need to know about scheduling, Indian Rupee (₹) consultation pricing,
          arrival preparation, and cancellations at NovaCraft Orbai.
        </p>

        <div className="relative max-w-md pt-2">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. fee, video, cancel, IST)..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredFaqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.q}
              className="rounded-xl border border-border-hairline bg-elevated overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-subtle/40 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-brand-primary block">
                    {item.category}
                  </span>
                  <span className="font-sans text-base font-semibold text-fg-primary">
                    {item.q}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-fg-muted transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div className="border-t border-border-hairline px-6 py-4 text-sm leading-relaxed text-fg-secondary">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <ConsultationFeeScheduleTable />

      <div className="rounded-xl border border-border-hairline bg-subtle/60 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-fg-primary">
            Ready to Schedule Your Consultation?
          </h2>
          <p className="text-sm text-fg-secondary">
            Proceed to our 7-step booking wizard or contact our Patient Concierge Desk.
          </p>
        </div>
        <div className="flex gap-3">
          <Button intent="secondary" onClick={() => navigate('/contact')}>
            Contact Concierge
          </Button>
          <Button intent="primary" onClick={() => navigate('/book')}>
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
