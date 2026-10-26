import * as React from 'react';
import { CheckCircle2, Clock, MapPin, PhoneCall, Send } from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ApiError, apiRequest } from '@/src/lib/apiClient';
import type { ContactInquiry } from '@/src/types/domain.types';

export function ContactPage(): React.JSX.Element {
  const [fullName, setFullName] = React.useState<string>('');
  const [mobileNumber, setMobileNumber] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [department, setDepartment] = React.useState<string>('General Inquiry');
  const [message, setMessage] = React.useState<string>('');

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = React.useState<ContactInquiry | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest<{ inquiry: ContactInquiry }>('/api/v1/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          mobileNumber,
          email,
          department,
          message,
        }),
      });
      setSubmittedInquiry(res.inquiry);
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 space-y-16">
      {/* Emergency Notice Banner */}
      <div className="rounded-xl border border-semantic-warning bg-semantic-warning-bg p-4 flex items-start gap-3 text-xs sm:text-sm text-semantic-warning">
        <PhoneCall className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="font-semibold">Emergency Medical Triage Notice:</strong> This website
          and inquiry form are designed for scheduled outpatient consultations. For acute or
          life-threatening medical emergencies, dial national emergency services (
          <strong className="font-mono">108 / 112</strong>) immediately.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left 5 Columns: Campus Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Patient Concierge &amp; Campus Desk
            </span>
            <h1 className="font-display text-4xl font-semibold text-fg-primary">
              Contact NovaCraft Orbai
            </h1>
            <p className="text-base text-fg-secondary">
              Reach out to our outpatient coordination desk for appointment assistance, diagnostic
              preparation questions, or corporate preventive checkup inquiries.
            </p>
          </div>

          <div className="rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-fg-primary">Flagship Sanctuary Campus</h2>
                <p className="text-xs text-fg-secondary mt-0.5">
                  Plot 42, Sanctuary Boulevard, Indiranagar–Domlur Corridor, Bengaluru 560038
                  (Sample Prototype Address — Configurable in Admin)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-border-hairline pt-4">
              <Clock className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-fg-primary">Outpatient Working Hours</h2>
                <p className="font-mono text-xs text-fg-secondary mt-0.5">
                  Monday – Saturday · 08:00 AM – 08:00 PM IST (Asia/Kolkata)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MedicalImageFrame slotId="img_care_concierge" aspectRatio="4/3" />
            <MedicalImageFrame slotId="img_campus_exterior" aspectRatio="4/3" />
          </div>
        </div>

        {/* Right 7 Columns: Validated Contact Form */}
        <div className="lg:col-span-7 rounded-2xl border border-white/75 dark:border-white/12 bg-elevated p-6 sm:p-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-fg-primary mb-2">
            Send a Patient Concierge Inquiry
          </h2>
          <p className="text-sm text-fg-secondary mb-6">
            Please do not include sensitive diagnostic histories in this general contact form.
          </p>

          {submittedInquiry ? (
            <div className="rounded-xl border border-semantic-success bg-semantic-success-bg p-6 space-y-3">
              <div className="flex items-center gap-2 text-semantic-success font-semibold">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>Inquiry Received ({submittedInquiry.inquiryReference})</span>
              </div>
              <p className="text-sm text-fg-primary">
                Thank you, <strong>{submittedInquiry.fullName}</strong>. Your inquiry has been
                logged with our Outpatient Concierge Desk under reference{' '}
                <strong className="font-mono">{submittedInquiry.inquiryReference}</strong>.
              </p>
              <Button
                intent="secondary"
                size="sm"
                onClick={() => setSubmittedInquiry(null)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <p role="alert" className="text-xs font-medium text-semantic-danger">
                  {error}
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                  >
                    Full Name *
                  </label>
                  <Input
                    id="contact-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                  >
                    Mobile Number (+91) *
                  </label>
                  <Input
                    id="contact-phone"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                  >
                    Email Address
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.in"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-dept"
                    className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                  >
                    Department / Topic
                  </label>
                  <select
                    id="contact-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="flex min-h-11 w-full rounded-lg border border-border-strong bg-elevated px-3.5 py-2 text-sm text-fg-primary"
                  >
                    <option value="General Inquiry">General Outpatient Inquiry</option>
                    <option value="Appointment Assistance">Appointment Assistance</option>
                    <option value="Cardiology">Cardiology Department</option>
                    <option value="Preventive Checkups">Executive Preventive Checkups</option>
                    <option value="Billing & Fees">Consultation Fees &amp; Billing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-msg"
                  className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                >
                  How Can We Assist You? *
                </label>
                <textarea
                  id="contact-msg"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your question regarding scheduling, campus facilities, or consultation services..."
                  className="w-full rounded-lg border border-border-strong bg-elevated px-3.5 py-2.5 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
                />
              </div>

              <Button type="submit" intent="primary" isLoading={submitting}>
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>Submit Inquiry</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
