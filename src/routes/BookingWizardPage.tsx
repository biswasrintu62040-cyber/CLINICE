import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  ShieldCheck,
  UserCheck,
  Video,
} from 'lucide-react';
import { MedicalImageFrame } from '@/src/components/layout/MedicalImageFrame';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ApiError, apiRequest } from '@/src/lib/apiClient';
import {
  formatCurrencyINR,
  formatISTDateLabel,
  formatISTShortDay,
} from '@/src/lib/formatCurrencyINR';
import type {
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  DoctorsListResponse,
  SlotsListResponse,
  SpecialtiesListResponse,
  SystemCapabilitiesResponse,
} from '@/src/types/api.types';
import type {
  AppointmentSlot,
  AppointmentTypeCode,
  Doctor,
  PaymentMethod,
  Specialty,
} from '@/src/types/domain.types';

const WIZARD_STEPS = [
  { step: 1, label: 'Specialty' },
  { step: 2, label: 'Doctor' },
  { step: 3, label: 'Visit Type' },
  { step: 4, label: 'Date & IST Time' },
  { step: 5, label: 'Patient Details' },
  { step: 6, label: 'Review & Confirm' },
] as const;

function getUpcoming10DatesIST(): string[] {
  const list: string[] = [];
  const now = new Date();
  for (let i = 0; i < 10; i++) {
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

export function BookingWizardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const upcomingDates = React.useMemo(() => getUpcoming10DatesIST(), []);

  // Data state
  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [doctors, setDoctors] = React.useState<
    Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>
  >([]);
  const [capabilities, setCapabilities] = React.useState<SystemCapabilitiesResponse | null>(null);
  const [slots, setSlots] = React.useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState<boolean>(false);

  // Wizard Step & Selections
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = React.useState<string>(
    searchParams.get('specialtyId') || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>(
    searchParams.get('doctorId') || ''
  );
  const [selectedType, setSelectedType] = React.useState<AppointmentTypeCode>('IN_PERSON');
  const [selectedDateIST, setSelectedDateIST] = React.useState<string>(
    searchParams.get('dateIST') || upcomingDates[0] || ''
  );
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>(
    searchParams.get('slotId') || ''
  );

  // Step 5 Patient Form State
  const [fullName, setFullName] = React.useState<string>('');
  const [mobileNumber, setMobileNumber] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [ageYears, setAgeYears] = React.useState<string>('');
  const [reasonForVisit, setReasonForVisit] = React.useState<string>('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('PAY_AT_HOSPITAL');

  // Validation & Submission state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Load initial Specialties, Doctors, and Capabilities
  React.useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<SpecialtiesListResponse>('/api/v1/specialties'),
      apiRequest<DoctorsListResponse>('/api/v1/doctors'),
      apiRequest<SystemCapabilitiesResponse>('/api/v1/config/capabilities'),
    ])
      .then(([specRes, docRes, capRes]) => {
        if (!active) return;
        setSpecialties(specRes.items);
        setDoctors(docRes.items);
        setCapabilities(capRes);

        const paramDocId = searchParams.get('doctorId');
        const paramSpecId = searchParams.get('specialtyId');
        const paramSlotId = searchParams.get('slotId');

        if (paramDocId) {
          const matchedDoc = docRes.items.find(
            (d) => d.id === paramDocId || d.slug === paramDocId
          );
          if (matchedDoc) {
            setSelectedDoctorId(matchedDoc.id);
            setSelectedSpecialtyId(matchedDoc.specialtyId);
            if (paramSlotId) {
              setCurrentStep(5);
            } else {
              setCurrentStep(3);
            }
            return;
          }
        }

        if (paramSpecId) {
          const matchedSpec = specRes.items.find(
            (s) => s.id === paramSpecId || s.slug === paramSpecId
          );
          if (matchedSpec) {
            setSelectedSpecialtyId(matchedSpec.id);
            setCurrentStep(2);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [searchParams]);

  // Fetch live IST slots whenever Doctor or Date changes
  const fetchSlotsForDoctorDate = React.useCallback((docId: string, dateStr: string) => {
    if (!docId || !dateStr) return;
    setLoadingSlots(true);
    apiRequest<SlotsListResponse>(
      `/api/v1/slots?doctorId=${encodeURIComponent(docId)}&dateIST=${encodeURIComponent(dateStr)}`
    )
      .then((res) => {
        setSlots(res.slots);
        setSelectedSlotId((prev) => {
          const stillAvailable = res.slots.find((s) => s.id === prev && s.status === 'AVAILABLE');
          if (stillAvailable) return prev;
          const firstOpen = res.slots.find((s) => s.status === 'AVAILABLE');
          return firstOpen?.id || '';
        });
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, []);

  React.useEffect(() => {
    if (selectedDoctorId && selectedDateIST) {
      fetchSlotsForDoctorDate(selectedDoctorId, selectedDateIST);
    }
  }, [selectedDoctorId, selectedDateIST, fetchSlotsForDoctorDate]);

  const selectedSpecialty = React.useMemo(
    () => specialties.find((s) => s.id === selectedSpecialtyId),
    [specialties, selectedSpecialtyId]
  );

  const filteredDoctors = React.useMemo(() => {
    if (!selectedSpecialtyId) return doctors;
    const bySpec = doctors.filter((d) => d.specialtyId === selectedSpecialtyId);
    return bySpec.length > 0 ? bySpec : doctors;
  }, [doctors, selectedSpecialtyId]);

  const selectedDoctor = React.useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  const selectedSlot = React.useMemo(
    () => slots.find((s) => s.id === selectedSlotId),
    [slots, selectedSlotId]
  );

  const activeConsultationFeeINR = React.useMemo(() => {
    if (!selectedDoctor) return selectedSpecialty?.baseConsultationFeeINR ?? 499;
    if (selectedType === 'VIDEO') return selectedDoctor.feesINR.VIDEO ?? 399;
    if (selectedType === 'FOLLOW_UP') return selectedDoctor.feesINR.FOLLOW_UP ?? 299;
    return selectedDoctor.feesINR.IN_PERSON;
  }, [selectedDoctor, selectedSpecialty, selectedType]);

  const validateStep5 = (): boolean => {
    const errs: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      errs.fullName = 'Please enter the patient’s full name.';
    }
    const cleanPhone = mobileNumber.replace(/[\s\-]/g, '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starting with 6–9).';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address or leave blank.';
    }
    const ageNum = Number(ageYears);
    if (!ageYears.trim() || !Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      errs.ageYears = 'Enter a valid patient age (0–120 years).';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmBooking = async (): Promise<void> => {
    if (!selectedDoctor || !selectedSlot) {
      setSubmitError('Please select a valid specialist and available IST time slot.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateAppointmentRequest = {
        specialtyId: selectedSpecialtyId || selectedDoctor.specialtyId,
        doctorId: selectedDoctor.id,
        appointmentType: selectedType,
        dateIST: selectedDateIST,
        slotId: selectedSlot.id,
        patient: {
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: email.trim() || undefined,
          ageYears: Number(ageYears),
          reasonForVisit: reasonForVisit.trim() || undefined,
        },
        paymentMethod,
      };

      const res = await apiRequest<CreateAppointmentResponse>('/api/v1/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Step 7: Redirect to Server-Confirmed Reference Pass
      navigate(`/booking/confirmation/${encodeURIComponent(res.appointment.referenceId)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
        // If 409 Conflict (slot was just booked concurrently), refresh slots and jump to Step 4
        if (err.status === 409) {
          fetchSlotsForDoctorDate(selectedDoctor.id, selectedDateIST);
          setCurrentStep(4);
        }
      } else {
        setSubmitError('Unable to reach the NovaCraft Orbai booking server. Please retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-8 space-y-8">
      {/* Progress Rail Header */}
      <div className="rounded-xl border border-border-hairline bg-elevated p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              NovaCraft Orbai · Outpatient Reservation
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-fg-primary">
              Step {currentStep} of 6: {WIZARD_STEPS[currentStep - 1]?.label}
            </h1>
          </div>
          <span className="font-mono text-xs text-fg-muted">
            Timezone: Asia/Kolkata (IST) · Currency: INR (₹)
          </span>
        </div>

        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {WIZARD_STEPS.map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <li
                key={item.step}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'border-brand-primary bg-brand-soft text-brand-primary font-semibold'
                    : isCompleted
                      ? 'border-border-strong bg-subtle text-fg-primary'
                      : 'border-border-hairline bg-canvas text-fg-muted'
                }`}
              >
                <span className="font-mono tabular-nums">0{item.step}.</span>
                <span className="truncate">{item.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-semantic-danger bg-semantic-danger-bg p-4 text-sm text-semantic-danger"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Booking Notice</p>
            <p>{submitError}</p>
          </div>
        </div>
      ) : null}

      {/* Main 2-Column Wizard Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left 8 Columns: Active Step Panel */}
        <div className="lg:col-span-8 rounded-xl border border-border-hairline bg-elevated p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Select Medical Specialty */}
            {currentStep === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-semibold text-fg-primary">
                    Select a Medical Specialty
                  </h2>
                  <p className="text-sm text-fg-secondary mt-1">
                    Choose the clinical department that best matches your consultation need.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specialties.map((spec) => {
                    const isSelected = selectedSpecialtyId === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => {
                          setSelectedSpecialtyId(spec.id);
                          const matchingDocs = doctors.filter((d) => d.specialtyId === spec.id);
                          if (matchingDocs[0]) {
                            setSelectedDoctorId(matchingDocs[0].id);
                          }
                          setCurrentStep(2);
                        }}
                        className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                            : 'border-border-hairline bg-canvas hover:border-border-strong'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-xl font-semibold text-fg-primary">
                              {spec.name}
                            </span>
                            <span className="font-mono text-xs font-semibold text-brand-primary tabular-nums">
                              From {formatCurrencyINR(spec.baseConsultationFeeINR)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-fg-secondary line-clamp-2">
                            {spec.shortDescription}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {/* STEP 2: Select Doctor */}
            {currentStep === 2 ? (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-fg-primary">
                      Select Your Specialist Physician
                    </h2>
                    <p className="text-sm text-fg-secondary">
                      Showing specialists for{' '}
                      <strong className="text-fg-primary">
                        {selectedSpecialty?.name || 'All Specialties'}
                      </strong>
                      .
                    </p>
                  </div>
                  <Button intent="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Change Specialty</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`grid grid-cols-1 sm:grid-cols-12 gap-4 rounded-xl border p-4 transition-colors ${
                          isSelected
                            ? 'border-brand-primary bg-brand-soft/60 ring-1 ring-brand-primary'
                            : 'border-border-hairline bg-canvas hover:border-border-strong'
                        }`}
                      >
                        <div className="sm:col-span-3">
                          <MedicalImageFrame
                            slotId={doc.portraitSlotId}
                            doctorName={doc.fullName}
                            doctorSpecialty={doc.specialtyName}
                            aspectRatio="3/4"
                            showCaptionOverlay={false}
                          />
                        </div>
                        <div className="sm:col-span-9 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted">
                              <span className="font-semibold text-brand-primary">
                                {doc.specialtyName}
                              </span>
                              <span>
                                {doc.isVerifiedCredentials
                                  ? 'Verified Profile'
                                  : 'Sample Prototype Profile'}
                              </span>
                            </div>
                            <h3 className="font-display text-2xl font-semibold text-fg-primary">
                              {doc.fullName}
                            </h3>
                            <p className="text-xs text-fg-secondary">{doc.professionalTitle}</p>
                            <p className="mt-2 text-xs text-fg-muted">
                              {doc.qualifications.join(' · ')} · Speaks:{' '}
                              {doc.languagesSpoken.join(', ')}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-hairline pt-3">
                            <div>
                              <span className="text-[11px] uppercase tracking-wider text-fg-muted block">
                                In-Person Fee
                              </span>
                              <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums">
                                {formatCurrencyINR(doc.feesINR.IN_PERSON)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                intent="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoctorId(doc.id);
                                  setSelectedSpecialtyId(doc.specialtyId);
                                  setCurrentStep(3);
                                }}
                              >
                                <span>Select {doc.fullName.split(' ').slice(0, 2).join(' ')}</span>
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {/* STEP 3: Select Appointment Type */}
            {currentStep === 3 && selectedDoctor ? (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-fg-primary">
                      Select Appointment Type
                    </h2>
                    <p className="text-sm text-fg-secondary">
                      Choose your consultation mode with {selectedDoctor.fullName}.
                    </p>
                  </div>
                  <Button intent="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* In-Person Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedType('IN_PERSON')}
                    className={`flex w-full items-start justify-between gap-4 rounded-xl border p-5 text-left transition-all cursor-pointer ${
                      selectedType === 'IN_PERSON'
                        ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                        : 'border-border-hairline bg-canvas hover:border-border-strong'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-fg-primary">
                        <Building2 className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                        <span>In-Person Sanctuary Consultation</span>
                      </div>
                      <p className="text-xs text-fg-secondary">
                        Location: {selectedDoctor.campusWing}. Please arrive 15 minutes prior to
                        your scheduled IST slot.
                      </p>
                    </div>
                    <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums shrink-0">
                      {formatCurrencyINR(selectedDoctor.feesINR.IN_PERSON)}
                    </span>
                  </button>

                  {/* Video Option (only if supported by doctor) */}
                  {selectedDoctor.supportedAppointmentTypes.includes('VIDEO') ? (
                    <button
                      type="button"
                      onClick={() => setSelectedType('VIDEO')}
                      className={`flex w-full items-start justify-between gap-4 rounded-xl border p-5 text-left transition-all cursor-pointer ${
                        selectedType === 'VIDEO'
                          ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                          : 'border-border-hairline bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-fg-primary">
                          <Video className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                          <span>Video Consultation (Teleconsultation)</span>
                        </div>
                        <p className="text-xs text-fg-secondary">
                          Encrypted video session link provided on your confirmation pass. Ideal for
                          lab review and remote specialist advice.
                        </p>
                      </div>
                      <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums shrink-0">
                        {formatCurrencyINR(selectedDoctor.feesINR.VIDEO ?? 399)}
                      </span>
                    </button>
                  ) : null}

                  {/* Follow-Up Option */}
                  {selectedDoctor.supportedAppointmentTypes.includes('FOLLOW_UP') ? (
                    <button
                      type="button"
                      onClick={() => setSelectedType('FOLLOW_UP')}
                      className={`flex w-full items-start justify-between gap-4 rounded-xl border p-5 text-left transition-all cursor-pointer ${
                        selectedType === 'FOLLOW_UP'
                          ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                          : 'border-border-hairline bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-fg-primary">
                          <Clock className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                          <span>Follow-Up Consultation</span>
                        </div>
                        <p className="text-xs text-fg-secondary">
                          For returning patients within 14 days of a primary consultation.
                        </p>
                      </div>
                      <span className="font-mono text-lg font-semibold text-fg-primary tabular-nums shrink-0">
                        {formatCurrencyINR(selectedDoctor.feesINR.FOLLOW_UP ?? 299)}
                      </span>
                    </button>
                  ) : null}
                </div>

                <div className="flex justify-end pt-2">
                  <Button intent="primary" onClick={() => setCurrentStep(4)}>
                    <span>Continue to Date &amp; Time</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* STEP 4: Select Date & IST Time Slot */}
            {currentStep === 4 ? (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-fg-primary">
                      Select Date &amp; Time Slot (IST)
                    </h2>
                    <p className="text-sm text-fg-secondary">
                      All times are displayed in Indian Standard Time (Asia/Kolkata). Booked slots
                      are disabled.
                    </p>
                  </div>
                  <Button intent="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </Button>
                </div>

                {/* Date Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {upcomingDates.map((dateStr) => {
                    const { weekday, dayNum, monthShort } = formatISTShortDay(dateStr);
                    const isSelected = selectedDateIST === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDateIST(dateStr)}
                        className={`flex min-w-[74px] flex-col items-center rounded-xl border px-3 py-2.5 text-xs transition-colors cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary text-fg-on-brand font-semibold'
                            : 'border-border-hairline bg-canvas text-fg-secondary hover:border-border-strong'
                        }`}
                      >
                        <span>{weekday}</span>
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {dayNum}
                        </span>
                        <span className="text-[11px] opacity-85">{monthShort}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Slots grouped by Morning / Afternoon / Evening */}
                {loadingSlots ? (
                  <p className="text-sm text-fg-muted font-mono py-6">
                    Checking live IST slot availability on server...
                  </p>
                ) : (
                  <div className="space-y-5">
                    {(['MORNING', 'AFTERNOON', 'EVENING'] as const).map((period) => {
                      const periodSlots = slots.filter((s) => s.period === period);
                      if (periodSlots.length === 0) return null;
                      return (
                        <div key={period} className="space-y-2">
                          <h3 className="font-mono text-xs uppercase tracking-wider text-fg-muted">
                            {period} SLOTS (IST)
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {periodSlots.map((slot) => {
                              const isAvailable = slot.status === 'AVAILABLE';
                              const isSelected = selectedSlotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={!isAvailable}
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  className={`flex min-h-11 flex-col items-center justify-center rounded-lg border px-3 py-2 font-mono text-xs tabular-nums transition-all ${
                                    !isAvailable
                                      ? 'border-border-hairline bg-subtle/40 text-fg-muted/45 line-through cursor-not-allowed'
                                      : isSelected
                                        ? 'border-brand-primary bg-brand-soft text-brand-primary font-semibold ring-1 ring-brand-primary cursor-pointer'
                                        : 'border-border-hairline bg-canvas text-fg-primary hover:border-brand-primary cursor-pointer'
                                  }`}
                                >
                                  <span>{slot.startTimeIST}</span>
                                  <span className="text-[10px] opacity-75">
                                    {isAvailable ? 'Available' : 'Booked'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    intent="primary"
                    disabled={!selectedSlotId}
                    onClick={() => setCurrentStep(5)}
                  >
                    <span>Continue to Patient Details</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* STEP 5: Patient Details */}
            {currentStep === 5 ? (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-fg-primary">
                      Patient Details
                    </h2>
                    <p className="text-sm text-fg-secondary">
                      We collect only the minimal contact information necessary to reserve your
                      appointment.
                    </p>
                  </div>
                  <Button intent="ghost" size="sm" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      htmlFor="patient-fullname"
                      className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                    >
                      Patient&apos;s Full Name *
                    </label>
                    <Input
                      id="patient-fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ananya Mehta"
                      state={fieldErrors.fullName ? 'error' : 'default'}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                    />
                    {fieldErrors.fullName ? (
                      <p role="alert" className="text-xs text-semantic-danger">
                        {fieldErrors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="patient-mobile"
                      className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                    >
                      10-Digit Mobile Number (+91) *
                    </label>
                    <Input
                      id="patient-mobile"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      state={fieldErrors.mobileNumber ? 'error' : 'default'}
                      aria-invalid={Boolean(fieldErrors.mobileNumber)}
                    />
                    {fieldErrors.mobileNumber ? (
                      <p role="alert" className="text-xs text-semantic-danger">
                        {fieldErrors.mobileNumber}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="patient-age"
                      className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                    >
                      Patient Age (Years) *
                    </label>
                    <Input
                      id="patient-age"
                      type="number"
                      min={0}
                      max={120}
                      value={ageYears}
                      onChange={(e) => setAgeYears(e.target.value)}
                      placeholder="e.g. 34"
                      state={fieldErrors.ageYears ? 'error' : 'default'}
                      aria-invalid={Boolean(fieldErrors.ageYears)}
                    />
                    {fieldErrors.ageYears ? (
                      <p role="alert" className="text-xs text-semantic-danger">
                        {fieldErrors.ageYears}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      htmlFor="patient-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                    >
                      Email Address (Optional)
                    </label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.in"
                      state={fieldErrors.email ? 'error' : 'default'}
                    />
                    {fieldErrors.email ? (
                      <p role="alert" className="text-xs text-semantic-danger">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      htmlFor="patient-reason"
                      className="block text-xs font-semibold uppercase tracking-wider text-fg-secondary"
                    >
                      Reason for Visit / Brief Note (Optional)
                    </label>
                    <textarea
                      id="patient-reason"
                      rows={3}
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="Optional note for your physician (e.g. routine preventive checkup, blood pressure review)..."
                      className="w-full rounded-lg border border-border-strong bg-elevated px-3.5 py-2.5 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-subtle p-3.5 text-xs text-fg-muted flex items-start gap-2.5">
                  <ShieldCheck
                    className="h-4 w-4 text-brand-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Privacy Protection: NovaCraft Orbai never requests government ID numbers,
                    passwords, or detailed medical histories on this booking form.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    intent="primary"
                    onClick={() => {
                      if (validateStep5()) {
                        setCurrentStep(6);
                      }
                    }}
                  >
                    <span>Review Appointment Details</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* STEP 6: Review & Confirm */}
            {currentStep === 6 && selectedDoctor && selectedSlot ? (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-fg-primary">
                      Review &amp; Confirm Your Appointment
                    </h2>
                    <p className="text-sm text-fg-secondary">
                      Verify your consultation summary and choose your preferred payment workflow.
                    </p>
                  </div>
                  <Button intent="ghost" size="sm" onClick={() => setCurrentStep(5)}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    <span>Edit Patient Info</span>
                  </Button>
                </div>

                {/* Summary Card */}
                <div className="rounded-xl border border-border-hairline bg-canvas p-5 space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-fg-muted block">Specialist Physician</span>
                      <p className="font-semibold text-fg-primary">{selectedDoctor.fullName}</p>
                      <p className="text-xs text-fg-secondary">{selectedDoctor.specialtyName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-fg-muted block">Date &amp; Time (IST)</span>
                      <p className="font-mono font-semibold text-fg-primary tabular-nums">
                        {formatISTDateLabel(selectedDateIST)} · {selectedSlot.startTimeIST}
                      </p>
                      <p className="text-xs text-fg-secondary">
                        Type: {selectedType.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-fg-muted block">Patient Details</span>
                      <p className="font-semibold text-fg-primary">
                        {fullName} ({ageYears} yrs)
                      </p>
                      <p className="font-mono text-xs text-fg-secondary tabular-nums">
                        +91 {mobileNumber} {email ? `· ${email}` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-fg-muted block">
                        Consultation Fee (Illustrative)
                      </span>
                      <p className="font-mono text-xl font-semibold text-brand-primary tabular-nums">
                        {formatCurrencyINR(activeConsultationFeeINR)}
                      </p>
                      <p className="text-[11px] text-fg-muted">
                        No hidden booking fees added
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-fg-secondary">
                    Select Payment Option
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAY_AT_HOSPITAL')}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        paymentMethod === 'PAY_AT_HOSPITAL'
                          ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                          : 'border-border-hairline bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-fg-primary">
                          Pay at Hospital Desk
                        </span>
                        <Building2 className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                      </div>
                      <p className="mt-1.5 text-xs text-fg-secondary">
                        Reserve your slot now with status PAYMENT_PENDING and settle ₹
                        {activeConsultationFeeINR} at the Flagship Outpatient Desk upon arrival.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('RAZORPAY')}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        paymentMethod === 'RAZORPAY'
                          ? 'border-brand-primary bg-brand-soft ring-1 ring-brand-primary'
                          : 'border-border-hairline bg-canvas hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-fg-primary">
                          Razorpay Online Payment (INR)
                        </span>
                        <CreditCard className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                      </div>
                      <p className="mt-1.5 text-xs text-fg-secondary">
                        {capabilities?.integrations.razorpayConfigured
                          ? 'Server-verified Razorpay checkout (UPI / Cards / NetBanking).'
                          : 'Merchant keys not configured in .env — will safely reserve slot under Pay-at-Hospital without faking payment.'}
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-hairline pt-4">
                  <p className="text-xs text-fg-muted max-w-md">
                    Clicking Confirm sends a live reservation request to the NovaCraft Orbai server
                    to lock your IST slot.
                  </p>
                  <Button
                    intent="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    onClick={handleConfirmBooking}
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    <span>Confirm Appointment ({formatCurrencyINR(activeConsultationFeeINR)})</span>
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Right 4 Columns: Persistent Booking Summary Sidebar */}
        <aside className="lg:col-span-4 rounded-xl border border-border-hairline bg-elevated p-6 space-y-5 sticky top-24">
          <div className="border-b border-border-hairline pb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-brand-primary">
              Appointment Summary
            </span>
            <h2 className="font-display text-2xl font-semibold text-fg-primary">
              Your Selection
            </h2>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Department</dt>
              <dd className="font-medium text-fg-primary text-right">
                {selectedSpecialty?.name || selectedDoctor?.specialtyName || 'Not selected'}
              </dd>
            </div>

            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Physician</dt>
              <dd className="font-medium text-fg-primary text-right">
                {selectedDoctor?.fullName || 'Not selected'}
              </dd>
            </div>

            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Consultation Type</dt>
              <dd className="font-medium text-fg-primary text-right">
                {selectedType.replace('_', ' ')}
              </dd>
            </div>

            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Date (IST)</dt>
              <dd className="font-mono text-xs font-medium text-fg-primary tabular-nums">
                {selectedDateIST ? formatISTDateLabel(selectedDateIST) : '—'}
              </dd>
            </div>

            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Time Slot (IST)</dt>
              <dd className="font-mono text-xs font-semibold text-brand-primary tabular-nums">
                {selectedSlot?.startTimeIST || 'Select a slot'}
              </dd>
            </div>

            {fullName ? (
              <div className="flex justify-between gap-2 border-t border-border-hairline pt-3">
                <dt className="text-fg-muted flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Patient</span>
                </dt>
                <dd className="font-medium text-fg-primary text-right">{fullName}</dd>
              </div>
            ) : null}
          </dl>

          <div className="border-t border-border-hairline pt-4 flex items-baseline justify-between">
            <div>
              <span className="block text-xs text-fg-muted">Consultation Fee</span>
              <span className="text-[11px] text-fg-muted">Illustrative INR Tariff</span>
            </div>
            <span className="font-mono text-2xl font-semibold text-fg-primary tabular-nums">
              {formatCurrencyINR(activeConsultationFeeINR)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
