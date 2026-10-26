import * as React from 'react';
import {
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ApiError, apiRequest } from '@/src/lib/apiClient';
import { formatCurrencyINR, formatISTDateLabel } from '@/src/lib/formatCurrencyINR';
import type { AdminOverviewResponse } from '@/src/types/api.types';
import type { Appointment, Doctor, PaymentStatus } from '@/src/types/domain.types';

const ADMIN_TOKEN_STORAGE_KEY = 'nco_admin_bearer_token';

export function AdminDashboardPage(): React.JSX.Element {
  const [passcode, setPasscode] = React.useState<string>('ORBAI-ADMIN-2026');
  const [token, setToken] = React.useState<string>(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [overview, setOverview] = React.useState<AdminOverviewResponse | null>(null);
  const [activeTab, setActiveTab] = React.useState<'appointments' | 'doctors' | 'audit'>(
    'appointments'
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Doctor Fee Editor state
  const [editingDoctorId, setEditingDoctorId] = React.useState<string | null>(null);
  const [editFeeInPerson, setEditFeeInPerson] = React.useState<string>('');
  const [editVerified, setEditVerified] = React.useState<boolean>(false);

  const fetchOverview = React.useCallback(async (authToken: string) => {
    if (!authToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<AdminOverviewResponse>('/api/v1/admin/overview', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setOverview(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load admin overview.');
      setToken('');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (token) {
      fetchOverview(token);
    }
  }, [token, fetchOverview]);

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ token: string }>('/api/v1/admin/login', {
        method: 'POST',
        body: JSON.stringify({ passcode }),
      });
      try {
        window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, res.token);
      } catch {
        // Ignore
      }
      setToken(res.token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (
    referenceId: string,
    updates: { paymentStatus?: PaymentStatus; status?: Appointment['status'] }
  ): Promise<void> => {
    setStatusMessage(null);
    try {
      await apiRequest(`/api/v1/admin/appointments/${encodeURIComponent(referenceId)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      setStatusMessage(`Updated appointment ${referenceId} and logged audit entry.`);
      await fetchOverview(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update appointment.');
    }
  };

  const handleSaveDoctor = async (doc: Doctor): Promise<void> => {
    setStatusMessage(null);
    try {
      await apiRequest(`/api/v1/admin/doctors/${encodeURIComponent(doc.id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          feesINR: {
            ...doc.feesINR,
            IN_PERSON: Number(editFeeInPerson) || doc.feesINR.IN_PERSON,
          },
          isVerifiedCredentials: editVerified,
        }),
      });
      setEditingDoctorId(null);
      setStatusMessage(`Saved consultation fee and verification state for ${doc.fullName}.`);
      await fetchOverview(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update doctor.');
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-border-strong bg-elevated p-8 space-y-5 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-brand-primary">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>STAFF GOVERNANCE CONSOLE</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-fg-primary">
            NovaCraft Orbai Admin Sign-In
          </h1>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Authorized staff can manage physician profiles, approve Indian Rupee (₹) consultation
            fees, update payment statuses, and review the audit trail. (Preview passcode
            pre-filled: <code className="font-mono text-brand-primary">ORBAI-ADMIN-2026</code>)
          </p>

          {error ? (
            <p role="alert" className="text-xs text-semantic-danger font-medium">
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="admin-passcode"
              className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
            >
              Staff Access Passcode
            </label>
            <Input
              id="admin-passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
          </div>

          <Button type="submit" intent="primary" className="w-full" isLoading={loading}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>Authenticate to Admin Console</span>
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-hairline pb-5">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
            ROLE_ADMIN · PROTECTED OPERATIONS CONSOLE
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-fg-primary">
            NovaCraft Orbai Administrative Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            intent="secondary"
            size="sm"
            isLoading={loading}
            onClick={() => fetchOverview(token)}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Refresh Data</span>
          </Button>
          <Button
            intent="ghost"
            size="sm"
            onClick={() => {
              window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
              setToken('');
              setOverview(null);
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {statusMessage ? (
        <div
          role="status"
          className="rounded-xl border border-semantic-success bg-semantic-success-bg p-4 text-xs font-medium text-semantic-success flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      {overview ? (
        <>
          {/* Metrics Strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Total Bookings
              </span>
              <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
                {overview.metrics.totalAppointments}
              </span>
            </div>
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Active Confirmed
              </span>
              <span className="font-mono text-2xl font-semibold text-semantic-success tabular-nums">
                {overview.metrics.confirmedAppointments}
              </span>
            </div>
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Payment Pending
              </span>
              <span className="font-mono text-2xl font-semibold text-semantic-warning tabular-nums">
                {overview.metrics.pendingPayments}
              </span>
            </div>
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Paid Settled
              </span>
              <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
                {overview.metrics.paidAppointments}
              </span>
            </div>
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Active Doctors
              </span>
              <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
                {overview.metrics.activeDoctors}
              </span>
            </div>
            <div className="rounded-xl border border-border-hairline bg-elevated p-4">
              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                Departments
              </span>
              <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
                {overview.metrics.enabledSpecialties}
              </span>
            </div>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-2 rounded-lg bg-subtle p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-elevated text-fg-primary shadow-xs'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Appointments &amp; Payments ({overview.appointments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctors')}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-elevated text-fg-primary shadow-xs'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Doctors &amp; ₹ Fee Configuration ({overview.doctors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-elevated text-fg-primary shadow-xs'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Server Audit Log ({overview.auditLogs.length})
            </button>
          </div>

          {/* Tab 1: Appointments Table */}
          {activeTab === 'appointments' ? (
            <div className="overflow-x-auto rounded-xl border border-border-hairline bg-elevated">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-hairline bg-subtle/50 text-xs font-mono uppercase text-fg-muted">
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Specialist &amp; Slot (IST)</th>
                    <th className="py-3.5 px-4">Fee (₹)</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Visit Status</th>
                    <th className="py-3.5 px-4 text-right">Staff Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {overview.appointments.map((apt) => (
                    <tr key={apt.referenceId} className="hover:bg-subtle/35">
                      <td className="py-3.5 px-4 font-mono font-semibold text-brand-primary tabular-nums">
                        {apt.referenceId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-fg-primary">{apt.patient.fullName}</p>
                        <p className="font-mono text-xs text-fg-muted tabular-nums">
                          +91 {apt.patient.mobileNumber}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-fg-primary">
                          {apt.doctorSnapshot.fullName}
                        </p>
                        <p className="font-mono text-xs text-fg-secondary tabular-nums">
                          {formatISTDateLabel(apt.dateIST)} · {apt.startTimeIST}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold tabular-nums">
                        {formatCurrencyINR(apt.consultationFeeINR)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {apt.paymentStatus}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {apt.status}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {apt.paymentStatus !== 'PAID' ? (
                          <Button
                            intent="secondary"
                            size="sm"
                            onClick={() =>
                              handleUpdateAppointment(apt.referenceId, {
                                paymentStatus: 'PAID',
                              })
                            }
                          >
                            Mark Paid at Desk
                          </Button>
                        ) : null}
                        {apt.status === 'CONFIRMED' ? (
                          <Button
                            intent="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateAppointment(apt.referenceId, {
                                status: 'COMPLETED',
                              })
                            }
                          >
                            Complete Visit
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Tab 2: Doctors & Fee Configuration */}
          {activeTab === 'doctors' ? (
            <div className="overflow-x-auto rounded-xl border border-border-hairline bg-elevated">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-hairline bg-subtle/50 text-xs font-mono uppercase text-fg-muted">
                    <th className="py-3.5 px-4">Physician</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">In-Person Fee (₹)</th>
                    <th className="py-3.5 px-4">Credential State</th>
                    <th className="py-3.5 px-4 text-right">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {overview.doctors.map((doc) => {
                    const isEditing = editingDoctorId === doc.id;
                    return (
                      <tr key={doc.id}>
                        <td className="py-3.5 px-4 font-medium text-fg-primary">
                          {doc.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-fg-secondary">{doc.specialtyName}</td>
                        <td className="py-3.5 px-4 font-mono tabular-nums">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editFeeInPerson}
                              onChange={(e) => setEditFeeInPerson(e.target.value)}
                              className="w-28 min-h-9 py-1"
                            />
                          ) : (
                            formatCurrencyINR(doc.feesINR.IN_PERSON)
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {isEditing ? (
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editVerified}
                                onChange={(e) => setEditVerified(e.target.checked)}
                              />
                              <span>Mark Verified Credentials</span>
                            </label>
                          ) : doc.isVerifiedCredentials ? (
                            <span className="text-semantic-success font-semibold">
                              Verified Profile
                            </span>
                          ) : (
                            <span className="text-fg-muted">Sample Prototype Data</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="inline-flex gap-2">
                              <Button
                                intent="primary"
                                size="sm"
                                onClick={() => handleSaveDoctor(doc)}
                              >
                                Save
                              </Button>
                              <Button
                                intent="ghost"
                                size="sm"
                                onClick={() => setEditingDoctorId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              intent="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingDoctorId(doc.id);
                                setEditFeeInPerson(String(doc.feesINR.IN_PERSON));
                                setEditVerified(doc.isVerifiedCredentials);
                              }}
                            >
                              Edit Fee / Status
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Tab 3: Server Audit Log */}
          {activeTab === 'audit' ? (
            <div className="rounded-xl border border-border-hairline bg-elevated divide-y divide-border-hairline">
              {overview.auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-brand-primary">
                      [{log.action}]
                    </span>{' '}
                    <span className="text-fg-primary">{log.summary}</span>
                  </div>
                  <span className="font-mono text-fg-muted tabular-nums shrink-0">
                    {log.timestampISO}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
