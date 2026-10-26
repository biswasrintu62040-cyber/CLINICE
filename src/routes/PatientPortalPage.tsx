import * as React from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ApiError, apiRequest } from '@/src/lib/apiClient';
import {
  formatCurrencyINR,
  formatISTDateLabel,
  formatISTShortDay,
} from '@/src/lib/formatCurrencyINR';
import type { PortalLookupResponse, SlotsListResponse } from '@/src/types/api.types';
import type { Appointment, AppointmentSlot } from '@/src/types/domain.types';

function getUpcoming7DatesIST(): string[] {
  const list: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    list.push(fmt.format(d));
  }
  return list;
}

export function PatientPortalPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || 'NCO-2026-104892';

  const [mobileOrEmail, setMobileOrEmail] = React.useState<string>('9876543210');
  const [referenceId, setReferenceId] = React.useState<string>(initialRef);
  const [lookupResult, setLookupResult] = React.useState<PortalLookupResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [actionBanner, setActionBanner] = React.useState<string | null>(null);

  // Reschedule Modal State
  const upcomingDates = React.useMemo(() => getUpcoming7DatesIST(), []);
  const [reschedulingApt, setReschedulingApt] = React.useState<Appointment | null>(null);
  const [newDateIST, setNewDateIST] = React.useState<string>(upcomingDates[1] || upcomingDates[0]);
  const [availableSlots, setAvailableSlots] = React.useState<AppointmentSlot[]>([]);
  const [selectedNewSlotId, setSelectedNewSlotId] = React.useState<string>('');
  const [mutating, setMutating] = React.useState<boolean>(false);

  const performLookup = React.useCallback(
    async (phoneVal: string, refVal: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<PortalLookupResponse>('/api/v1/portal/lookup', {
          method: 'POST',
          body: JSON.stringify({
            mobileOrEmail: phoneVal.trim(),
            referenceId: refVal.trim(),
          }),
        });
        setLookupResult(res);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to retrieve appointment records. Please verify your reference ID.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-load seeded demo record on mount so user can immediately interact with the portal
  React.useEffect(() => {
    performLookup('9876543210', initialRef);
  }, [initialRef, performLookup]);

  // Load slots when Reschedule modal opens
  React.useEffect(() => {
    if (!reschedulingApt || !newDateIST) return;
    apiRequest<SlotsListResponse>(
      `/api/v1/slots?doctorId=${encodeURIComponent(
        reschedulingApt.doctorId
      )}&dateIST=${encodeURIComponent(newDateIST)}`
    )
      .then((res) => {
        setAvailableSlots(res.slots);
        const firstOpen = res.slots.find((s) => s.status === 'AVAILABLE');
        setSelectedNewSlotId(firstOpen?.id || '');
      })
      .catch(() => setAvailableSlots([]));
  }, [reschedulingApt, newDateIST]);

  const handleRescheduleConfirm = async (): Promise<void> => {
    if (!reschedulingApt || !selectedNewSlotId) return;
    setMutating(true);
    setActionBanner(null);
    setError(null);
    try {
      const res = await apiRequest<{ appointment: Appointment }>(
        `/api/v1/portal/appointments/${encodeURIComponent(reschedulingApt.referenceId)}/reschedule`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            newDateIST,
            newSlotId: selectedNewSlotId,
          }),
        }
      );
      setLookupResult((prev) =>
        prev
          ? {
              ...prev,
              appointments: prev.appointments.map((a) =>
                a.referenceId === res.appointment.referenceId ? res.appointment : a
              ),
            }
          : null
      );
      setActionBanner(
        `Appointment ${res.appointment.referenceId} has been rescheduled to ${formatISTDateLabel(
          res.appointment.dateIST
        )} at ${res.appointment.startTimeIST} IST.`
      );
      setReschedulingApt(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reschedule failed.');
    } finally {
      setMutating(false);
    }
  };

  const handleCancelAppointment = async (apt: Appointment): Promise<void> => {
    setMutating(true);
    setActionBanner(null);
    setError(null);
    try {
      const res = await apiRequest<{ appointment: Appointment }>(
        `/api/v1/portal/appointments/${encodeURIComponent(apt.referenceId)}/cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason: 'Cancelled via Patient Portal' }),
        }
      );
      setLookupResult((prev) =>
        prev
          ? {
              ...prev,
              appointments: prev.appointments.map((a) =>
                a.referenceId === res.appointment.referenceId ? res.appointment : a
              ),
            }
          : null
      );
      setActionBanner(
        `Appointment ${res.appointment.referenceId} has been cancelled and its IST time slot has been released.`
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancellation failed.');
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8 space-y-10">
      <div className="space-y-2 max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
          Self-Service Patient Access
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-fg-primary">
          Patient Appointment Portal
        </h1>
        <p className="text-base text-fg-secondary">
          Look up your confirmed appointments using your registered mobile number or Booking
          Reference ID (`NCO-2026-XXXXXX`) to view passes, reschedule to a new IST slot, or cancel.
        </p>
      </div>

      {/* Lookup Card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performLookup(mobileOrEmail, referenceId);
        }}
        className="rounded-xl border border-border-hairline bg-elevated p-6 grid grid-cols-1 gap-4 md:grid-cols-12 items-end"
      >
        <div className="md:col-span-5 space-y-1.5">
          <label
            htmlFor="portal-mobile"
            className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
          >
            Registered Mobile Number or Email
          </label>
          <Input
            id="portal-mobile"
            value={mobileOrEmail}
            onChange={(e) => setMobileOrEmail(e.target.value)}
            placeholder="e.g. 9876543210"
          />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label
            htmlFor="portal-ref"
            className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
          >
            Booking Reference ID (Optional)
          </label>
          <Input
            id="portal-ref"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. NCO-2026-104892"
          />
        </div>

        <div className="md:col-span-3">
          <Button
            type="submit"
            intent="primary"
            className="w-full"
            isLoading={loading}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Find Appointments</span>
          </Button>
        </div>
      </form>

      {actionBanner ? (
        <div
          role="status"
          className="rounded-xl border border-semantic-success bg-semantic-success-bg p-4 text-sm text-semantic-success font-medium"
        >
          {actionBanner}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-semantic-danger bg-semantic-danger-bg p-4 text-sm text-semantic-danger"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Appointments List */}
      {lookupResult ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-fg-primary">
                Appointments for {lookupResult.patientSummary.fullName}
              </h2>
              <p className="font-mono text-xs text-fg-muted tabular-nums">
                Mobile: +91 {lookupResult.patientSummary.mobileNumber}
              </p>
            </div>
            <Link
              to="/book"
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              + Book Another Appointment
            </Link>
          </div>

          <div className="space-y-4">
            {lookupResult.appointments.map((apt) => {
              const isCancelled =
                apt.status === 'CANCELLED_BY_PATIENT' ||
                apt.status === 'CANCELLED_BY_HOSPITAL';
              return (
                <article
                  key={apt.referenceId}
                  className="rounded-xl border border-border-hairline bg-elevated p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-semibold text-brand-primary tabular-nums">
                        {apt.referenceId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          isCancelled ? 'text-semantic-danger' : 'text-semantic-success'
                        }`}
                      >
                        {apt.status.replace(/_/g, ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-fg-muted">
                        Payment: {apt.paymentStatus} ({formatCurrencyINR(apt.consultationFeeINR)})
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-fg-primary">
                      {apt.doctorSnapshot.fullName} — {apt.doctorSnapshot.specialtyName}
                    </h3>

                    <p className="font-mono text-sm text-fg-secondary tabular-nums">
                      {formatISTDateLabel(apt.dateIST)} · {apt.startTimeIST} – {apt.endTimeIST} IST
                      ({apt.appointmentType.replace('_', ' ')})
                    </p>

                    <p className="text-xs text-fg-muted">{apt.doctorSnapshot.campusWing}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Link
                      to={`/booking/confirmation/${encodeURIComponent(apt.referenceId)}`}
                      className="inline-flex min-h-10 items-center rounded-lg border border-border-strong px-3.5 py-2 text-xs font-semibold text-fg-primary hover:bg-subtle"
                    >
                      View Confirmation Pass
                    </Link>

                    {!isCancelled ? (
                      <>
                        <Button
                          intent="secondary"
                          size="sm"
                          disabled={mutating}
                          onClick={() => setReschedulingApt(apt)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Reschedule</span>
                        </Button>

                        <Button
                          intent="danger"
                          size="sm"
                          disabled={mutating}
                          onClick={() => handleCancelAppointment(apt)}
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Cancel</span>
                        </Button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Reschedule Modal Dialog */}
      {reschedulingApt ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-elevated p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border-hairline pb-3">
              <div>
                <span className="font-mono text-xs text-brand-primary">
                  RESCHEDULE APPOINTMENT · {reschedulingApt.referenceId}
                </span>
                <h2
                  id="reschedule-modal-title"
                  className="font-display text-2xl font-semibold text-fg-primary"
                >
                  Select New Date &amp; Time (IST)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingApt(null)}
                className="text-xs font-mono text-fg-muted hover:text-fg-primary cursor-pointer"
              >
                Close [Esc]
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {upcomingDates.map((dateStr) => {
                const { weekday, dayNum, monthShort } = formatISTShortDay(dateStr);
                const isSelected = newDateIST === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setNewDateIST(dateStr)}
                    className={`flex min-w-[66px] flex-col items-center rounded-lg border px-2.5 py-2 text-xs cursor-pointer shrink-0 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary text-fg-on-brand font-semibold'
                        : 'border-border-hairline bg-canvas text-fg-secondary'
                    }`}
                  >
                    <span>{weekday}</span>
                    <span className="font-mono text-base font-semibold tabular-nums">
                      {dayNum}
                    </span>
                    <span className="text-[10px]">{monthShort}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const isAvail = slot.status === 'AVAILABLE';
                const isSelected = selectedNewSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvail}
                    onClick={() => setSelectedNewSlotId(slot.id)}
                    className={`flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 py-2 font-mono text-xs tabular-nums ${
                      !isAvail
                        ? 'border-border-hairline bg-subtle/40 text-fg-muted/40 line-through cursor-not-allowed'
                        : isSelected
                          ? 'border-brand-primary bg-brand-soft text-brand-primary font-semibold cursor-pointer'
                          : 'border-border-hairline bg-canvas text-fg-primary hover:border-brand-primary cursor-pointer'
                    }`}
                  >
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{slot.startTimeIST}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 border-t border-border-hairline pt-4">
              <Button intent="ghost" size="sm" onClick={() => setReschedulingApt(null)}>
                Cancel
              </Button>
              <Button
                intent="primary"
                size="sm"
                disabled={!selectedNewSlotId}
                isLoading={mutating}
                onClick={handleRescheduleConfirm}
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>Confirm New Slot</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
