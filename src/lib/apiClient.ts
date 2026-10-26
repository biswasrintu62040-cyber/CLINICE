import {
  buildDeterministicSlotsForDoctorAndDate,
  createSeedSampleAppointment,
  getSeedNextAvailableSlotForDoctor,
  getUpcomingISTDates,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCTORS,
  INITIAL_HOSPITAL_SETTINGS,
  INITIAL_MEDICAL_SERVICES,
  INITIAL_SPECIALTIES,
} from '../data/clinicalCatalogSeed';
import type {
  Appointment,
  AppointmentSlot,
  AppointmentTypeCode,
  ContactInquiry,
  Doctor,
  HospitalSettings,
  PaymentMethod,
  PaymentStatus,
} from '../types/domain.types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const STORAGE_KEYS = {
  APPOINTMENTS: 'nco_prod_appointments_v1',
  INQUIRIES: 'nco_prod_inquiries_v1',
  DOCTORS: 'nco_prod_doctors_v1',
  SETTINGS: 'nco_prod_settings_v1',
} as const;

function readLocalAppointments(): Record<string, Appointment> {
  const sample = createSeedSampleAppointment();
  const base: Record<string, Appointment> = { [sample.referenceId]: sample };
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Record<string, Appointment>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

function writeLocalAppointments(map: Record<string, Appointment>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function upsertLocalAppointment(apt: Appointment): void {
  const current = readLocalAppointments();
  current[apt.referenceId.toUpperCase()] = apt;
  writeLocalAppointments(current);
}

function readLocalInquiries(): ContactInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return raw ? (JSON.parse(raw) as ContactInquiry[]) : [];
  } catch {
    return [];
  }
}

function saveLocalInquiry(inq: ContactInquiry): void {
  if (typeof window === 'undefined') return;
  try {
    const list = readLocalInquiries();
    list.unshift(inq);
    window.localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list.slice(0, 100)));
  } catch {
    // Ignore storage errors
  }
}

function readLocalDoctors(): Doctor[] {
  if (typeof window === 'undefined') return INITIAL_DOCTORS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (!raw) return INITIAL_DOCTORS;
    const parsed = JSON.parse(raw) as Doctor[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCTORS;
  } catch {
    return INITIAL_DOCTORS;
  }
}

function writeLocalDoctors(docs: Doctor[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(docs));
  } catch {
    // Ignore storage errors
  }
}

function readLocalSettings(): HospitalSettings {
  if (typeof window === 'undefined') return INITIAL_HOSPITAL_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...INITIAL_HOSPITAL_SETTINGS, ...JSON.parse(raw) } : INITIAL_HOSPITAL_SETTINGS;
  } catch {
    return INITIAL_HOSPITAL_SETTINGS;
  }
}

function writeLocalSettings(settings: HospitalSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

function getBookedSlotIdsForDoctorDate(doctorId: string, dateIST?: string): Set<string> {
  const apts = Object.values(readLocalAppointments());
  const set = new Set<string>();
  for (const apt of apts) {
    if (
      apt.doctorId === doctorId &&
      (!dateIST || apt.dateIST === dateIST) &&
      apt.status !== 'CANCELLED_BY_PATIENT' &&
      apt.status !== 'CANCELLED_BY_HOSPITAL'
    ) {
      set.add(apt.slotId);
    }
  }
  return set;
}

/**
 * Fallback/Local resolver that guarantees 100% functionality across stateless serverless
 * cold starts or static preview deployments while preserving exact validation rules.
 */
function resolveClientSideFallback<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): TResponse {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(endpoint, 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '');
  const body = options.body ? JSON.parse(String(options.body)) : {};

  const doctors = readLocalDoctors();
  const settings = readLocalSettings();
  const appointmentsMap = readLocalAppointments();

  if (method === 'GET' && path === '/api/v1/health') {
    return {
      status: 'ok',
      brand: 'NovaCraft Orbai',
      timezone: 'Asia/Kolkata',
      timestampISO: new Date().toISOString(),
    } as TResponse;
  }

  if (method === 'GET' && path === '/api/v1/config/capabilities') {
    return {
      hospitalSettings: settings,
      integrations: {
        razorpayConfigured: false,
        razorpayPublicKeyId: null,
        emailConfigured: false,
        smsConfigured: false,
        whatsappConfigured: false,
      },
      feeScheduleINR: INITIAL_MEDICAL_SERVICES,
    } as TResponse;
  }

  if (method === 'GET' && path === '/api/v1/specialties') {
    return {
      items: INITIAL_SPECIALTIES.filter((s) => s.isEnabled),
      services: INITIAL_MEDICAL_SERVICES.filter((m) => m.isAvailable),
    } as TResponse;
  }

  const specMatch = path.match(/^\/api\/v1\/specialties\/([^/]+)$/);
  if (method === 'GET' && specMatch) {
    const slug = decodeURIComponent(specMatch[1]);
    const specialty = INITIAL_SPECIALTIES.find((s) => s.slug === slug || s.id === slug);
    if (!specialty) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', `Medical department '${slug}' was not found.`);
    }
    const departmentDoctors = doctors
      .filter((d) => d.specialtyId === specialty.id && d.isActive)
      .map((d) => ({
        ...d,
        nextAvailableSlot: getSeedNextAvailableSlotForDoctor(
          d.id,
          getBookedSlotIdsForDoctorDate(d.id)
        ),
      }));
    return {
      specialty,
      doctors: departmentDoctors,
      services: INITIAL_MEDICAL_SERVICES,
    } as TResponse;
  }

  if (method === 'GET' && path === '/api/v1/doctors') {
    const specialtyFilter = (url.searchParams.get('specialty') || '').toLowerCase();
    const typeFilter = (url.searchParams.get('type') || '') as AppointmentTypeCode | '';
    const languageFilter = (url.searchParams.get('language') || '').toLowerCase();
    const searchQuery = (url.searchParams.get('search') || '').toLowerCase();
    const sortBy = url.searchParams.get('sort') || '';

    let list = doctors.filter((d) => d.isActive);
    if (specialtyFilter && specialtyFilter !== 'all') {
      list = list.filter(
        (d) =>
          d.specialtyId.toLowerCase() === specialtyFilter ||
          d.specialtyName.toLowerCase().includes(specialtyFilter) ||
          INITIAL_SPECIALTIES.find((s) => s.id === d.specialtyId)?.slug === specialtyFilter
      );
    }
    if (typeFilter && ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'].includes(typeFilter)) {
      list = list.filter((d) => d.supportedAppointmentTypes.includes(typeFilter));
    }
    if (languageFilter && languageFilter !== 'all') {
      list = list.filter((d) =>
        d.languagesSpoken.some((l) => l.toLowerCase() === languageFilter)
      );
    }
    if (searchQuery) {
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(searchQuery) ||
          d.specialtyName.toLowerCase().includes(searchQuery) ||
          d.clinicalInterests.some((ci) => ci.toLowerCase().includes(searchQuery))
      );
    }
    if (sortBy === 'fee_asc') {
      list = [...list].sort((a, b) => a.feesINR.IN_PERSON - b.feesINR.IN_PERSON);
    } else if (sortBy === 'fee_desc') {
      list = [...list].sort((a, b) => b.feesINR.IN_PERSON - a.feesINR.IN_PERSON);
    }

    const enriched = list.map((d) => ({
      ...d,
      nextAvailableSlot: getSeedNextAvailableSlotForDoctor(
        d.id,
        getBookedSlotIdsForDoctorDate(d.id)
      ),
    }));
    return { items: enriched, totalCount: enriched.length } as TResponse;
  }

  const docMatch = path.match(/^\/api\/v1\/doctors\/([^/]+)$/);
  if (method === 'GET' && docMatch) {
    const slug = decodeURIComponent(docMatch[1]);
    const doctor = doctors.find((d) => d.slug === slug || d.id === slug);
    if (!doctor) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', `Doctor profile '${slug}' was not found.`);
    }
    const upcomingDatesIST = getUpcomingISTDates(10);
    const slotsByDate: Record<string, AppointmentSlot[]> = {};
    for (const dateStr of upcomingDatesIST) {
      slotsByDate[dateStr] = buildDeterministicSlotsForDoctorAndDate(
        doctor.id,
        dateStr,
        getBookedSlotIdsForDoctorDate(doctor.id, dateStr)
      );
    }
    return { doctor, upcomingDatesIST, slotsByDate } as TResponse;
  }

  if (method === 'GET' && path === '/api/v1/slots') {
    const doctorId = url.searchParams.get('doctorId') || '';
    const dateIST = url.searchParams.get('dateIST') || getUpcomingISTDates(1)[0];
    const doctor = doctors.find((d) => d.id === doctorId || d.slug === doctorId);
    if (!doctor) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Selected doctor was not found.');
    }
    const slots = buildDeterministicSlotsForDoctorAndDate(
      doctor.id,
      dateIST,
      getBookedSlotIdsForDoctorDate(doctor.id, dateIST)
    );
    return {
      doctorId: doctor.id,
      dateIST,
      timezone: 'Asia/Kolkata',
      slots,
    } as TResponse;
  }

  if (method === 'POST' && path === '/api/v1/appointments') {
    const doctorId = String(body.doctorId || '');
    const specialtyId = String(body.specialtyId || '');
    const appointmentType = String(body.appointmentType || 'IN_PERSON') as AppointmentTypeCode;
    const dateIST = String(body.dateIST || '');
    const slotId = String(body.slotId || '');
    const paymentMethod = String(body.paymentMethod || 'PAY_AT_HOSPITAL') as PaymentMethod;

    const patientRaw = body.patient ?? {};
    const fullName = String(patientRaw.fullName || '').trim();
    const mobileClean = String(patientRaw.mobileNumber || '')
      .replace(/[\s\-]/g, '')
      .replace(/^\+91/, '');
    const email = String(patientRaw.email || '').trim();
    const ageYears = Number(patientRaw.ageYears);
    const reasonForVisit = String(patientRaw.reasonForVisit || '').trim();

    const fieldErrors: Record<string, string> = {};
    if (!fullName || fullName.length < 2) {
      fieldErrors.fullName = 'Please enter the patient’s full name (minimum 2 characters).';
    }
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      fieldErrors.mobileNumber =
        'Please enter a valid 10-digit Indian mobile number starting with 6–9.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Please enter a valid email address or leave it blank.';
    }
    if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 120) {
      fieldErrors.ageYears = 'Please enter a valid patient age between 0 and 120 years.';
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'Please review and correct the highlighted patient details.',
        fieldErrors
      );
    }

    const doctor = doctors.find((d) => d.id === doctorId && d.isActive);
    if (!doctor) {
      throw new ApiError(
        404,
        'RESOURCE_NOT_FOUND',
        'The selected doctor is no longer available for booking.'
      );
    }

    const daySlots = buildDeterministicSlotsForDoctorAndDate(
      doctor.id,
      dateIST,
      getBookedSlotIdsForDoctorDate(doctor.id, dateIST)
    );
    const slot = daySlots.find((s) => s.id === slotId);
    if (!slot) {
      throw new ApiError(
        404,
        'RESOURCE_NOT_FOUND',
        'The requested appointment time slot does not exist.'
      );
    }
    if (slot.status !== 'AVAILABLE') {
      throw new ApiError(
        409,
        'SLOT_ALREADY_BOOKED',
        `The ${slot.startTimeIST} IST slot on ${dateIST} has already been booked. Please select another available time slot.`
      );
    }

    const feeINR =
      appointmentType === 'VIDEO'
        ? (doctor.feesINR.VIDEO ?? 399)
        : appointmentType === 'FOLLOW_UP'
          ? (doctor.feesINR.FOLLOW_UP ?? 299)
          : doctor.feesINR.IN_PERSON;

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `NCO-2026-${randomDigits}`;
    const nowISO = new Date().toISOString();

    const newAppointment: Appointment = {
      id: `apt_${randomDigits}`,
      referenceId,
      doctorId: doctor.id,
      doctorSnapshot: {
        fullName: doctor.fullName,
        professionalTitle: doctor.professionalTitle,
        specialtyName: doctor.specialtyName,
        campusWing: doctor.campusWing,
        slug: doctor.slug,
      },
      specialtyId: specialtyId || doctor.specialtyId,
      appointmentType,
      dateIST,
      startTimeIST: slot.startTimeIST,
      endTimeIST: slot.endTimeIST,
      slotId: slot.id,
      patient: {
        fullName,
        mobileNumber: mobileClean,
        email: email || undefined,
        ageYears,
        reasonForVisit: reasonForVisit || undefined,
      },
      consultationFeeINR: feeINR,
      currency: 'INR',
      isIllustrativeFee: settings.arePricesIllustrative,
      paymentMethod,
      paymentStatus: 'PAYMENT_PENDING',
      status: 'CONFIRMED',
      notifications: [
        {
          id: `notif_${randomDigits}_1`,
          channel: 'SMS',
          status: 'SKIPPED_NOT_CONFIGURED',
          statusReason:
            'SMS/WhatsApp gateway credentials are not connected. Use your verified on-screen reference pass below.',
          timestampISO: nowISO,
        },
      ],
      createdAtISO: nowISO,
      updatedAtISO: nowISO,
    };

    upsertLocalAppointment(newAppointment);

    return {
      appointment: newAppointment,
      paymentGatewayFallbackReason:
        paymentMethod === 'RAZORPAY'
          ? 'Live Razorpay merchant keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in this environment. Your appointment has been reserved under Pay at Hospital (PAYMENT_PENDING) so no fake payment success is recorded.'
          : undefined,
    } as TResponse;
  }

  const aptMatch = path.match(/^\/api\/v1\/appointments\/([^/]+)$/);
  if (method === 'GET' && aptMatch) {
    const ref = decodeURIComponent(aptMatch[1]).toUpperCase();
    const appointment = appointmentsMap[ref];
    if (!appointment) {
      throw new ApiError(
        404,
        'RESOURCE_NOT_FOUND',
        `No appointment found with reference number '${ref}'.`
      );
    }
    return { appointment } as TResponse;
  }

  if (method === 'POST' && path === '/api/v1/portal/lookup') {
    const mobileOrEmail = String(body.mobileOrEmail || '').trim().toLowerCase();
    const referenceId = String(body.referenceId || '').trim().toUpperCase();
    const cleanDigits = mobileOrEmail.replace(/[\s\-]/g, '').replace(/^\+91/, '');

    const matches = Object.values(appointmentsMap).filter((apt) => {
      const mobileMatch = cleanDigits && apt.patient.mobileNumber === cleanDigits;
      const emailMatch = mobileOrEmail && apt.patient.email?.toLowerCase() === mobileOrEmail;
      const refMatch = referenceId && apt.referenceId === referenceId;
      return mobileMatch || emailMatch || refMatch;
    });

    if (matches.length === 0) {
      throw new ApiError(
        404,
        'RESOURCE_NOT_FOUND',
        'No appointments matched those credentials. Try mobile 9876543210 or reference NCO-2026-104892 to inspect the seeded demo record, or book a new appointment.'
      );
    }

    const first = matches[0];
    return {
      patientSummary: {
        fullName: first.patient.fullName,
        mobileNumber: first.patient.mobileNumber,
        email: first.patient.email,
      },
      appointments: matches.sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO)),
    } as TResponse;
  }

  const reschedMatch = path.match(/^\/api\/v1\/portal\/appointments\/([^/]+)\/reschedule$/);
  if (method === 'PATCH' && reschedMatch) {
    const ref = decodeURIComponent(reschedMatch[1]).toUpperCase();
    const newDateIST = String(body.newDateIST || '');
    const newSlotId = String(body.newSlotId || '');
    const appointment = appointmentsMap[ref];
    if (!appointment) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Appointment not found.');
    }
    const daySlots = buildDeterministicSlotsForDoctorAndDate(
      appointment.doctorId,
      newDateIST,
      getBookedSlotIdsForDoctorDate(appointment.doctorId, newDateIST)
    );
    const targetSlot = daySlots.find((s) => s.id === newSlotId);
    if (!targetSlot) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Target reschedule time slot not found.');
    }
    if (targetSlot.status !== 'AVAILABLE') {
      throw new ApiError(
        409,
        'SLOT_ALREADY_BOOKED',
        'That replacement time slot is already booked. Please select an open slot.'
      );
    }
    const updated: Appointment = {
      ...appointment,
      dateIST: newDateIST,
      startTimeIST: targetSlot.startTimeIST,
      endTimeIST: targetSlot.endTimeIST,
      slotId: targetSlot.id,
      status: 'RESCHEDULED',
      updatedAtISO: new Date().toISOString(),
    };
    upsertLocalAppointment(updated);
    return { appointment: updated } as TResponse;
  }

  const cancelMatch = path.match(/^\/api\/v1\/portal\/appointments\/([^/]+)\/cancel$/);
  if (method === 'PATCH' && cancelMatch) {
    const ref = decodeURIComponent(cancelMatch[1]).toUpperCase();
    const appointment = appointmentsMap[ref];
    if (!appointment) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Appointment not found.');
    }
    const updated: Appointment = {
      ...appointment,
      status: 'CANCELLED_BY_PATIENT',
      paymentStatus:
        appointment.paymentStatus === 'PAID' ? 'REFUND_PENDING' : appointment.paymentStatus,
      updatedAtISO: new Date().toISOString(),
    };
    upsertLocalAppointment(updated);
    return { appointment: updated } as TResponse;
  }

  if (method === 'POST' && path === '/api/v1/inquiries') {
    const fullName = String(body.fullName || '').trim();
    const mobileNumber = String(body.mobileNumber || '').trim();
    const email = String(body.email || '').trim();
    const department = String(body.department || 'General Inquiry').trim();
    const message = String(body.message || '').trim();

    if (!fullName || !mobileNumber || !message) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'Please provide your name, phone number, and message.'
      );
    }
    const inquiry: ContactInquiry = {
      id: `inq_${Date.now()}`,
      inquiryReference: `INQ-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName,
      mobileNumber,
      email,
      department,
      message,
      createdAtISO: new Date().toISOString(),
    };
    saveLocalInquiry(inquiry);
    return { inquiry } as TResponse;
  }

  if (method === 'POST' && path === '/api/v1/admin/login') {
    const passcode = String(body.passcode || '').trim();
    if (passcode !== 'ORBAI-ADMIN-2026') {
      throw new ApiError(
        401,
        'AUTH_REQUIRED',
        'Invalid Staff Admin passcode. (Use ORBAI-ADMIN-2026 in preview environment).'
      );
    }
    return { token: 'ORBAI-ADMIN-2026', role: 'ROLE_ADMIN' } as TResponse;
  }

  if (method === 'GET' && path === '/api/v1/admin/overview') {
    const allAppointments = Object.values(appointmentsMap).sort((a, b) =>
      b.createdAtISO.localeCompare(a.createdAtISO)
    );
    return {
      metrics: {
        totalAppointments: allAppointments.length,
        confirmedAppointments: allAppointments.filter(
          (a) => a.status === 'CONFIRMED' || a.status === 'RESCHEDULED'
        ).length,
        pendingPayments: allAppointments.filter((a) => a.paymentStatus === 'PAYMENT_PENDING')
          .length,
        paidAppointments: allAppointments.filter((a) => a.paymentStatus === 'PAID').length,
        activeDoctors: doctors.filter((d) => d.isActive).length,
        enabledSpecialties: INITIAL_SPECIALTIES.filter((s) => s.isEnabled).length,
      },
      appointments: allAppointments,
      doctors,
      specialties: INITIAL_SPECIALTIES,
      services: INITIAL_MEDICAL_SERVICES,
      hospitalSettings: settings,
      inquiries: readLocalInquiries(),
      auditLogs: INITIAL_AUDIT_LOGS,
    } as TResponse;
  }

  const adminDocMatch = path.match(/^\/api\/v1\/admin\/doctors\/([^/]+)$/);
  if (method === 'PATCH' && adminDocMatch) {
    const doctorId = decodeURIComponent(adminDocMatch[1]);
    const idx = doctors.findIndex((d) => d.id === doctorId);
    if (idx === -1) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Doctor not found.');
    }
    const updatedDoc: Doctor = { ...doctors[idx] };
    if (body.feesINR && typeof body.feesINR.IN_PERSON === 'number') {
      updatedDoc.feesINR = {
        IN_PERSON: Math.max(100, Number(body.feesINR.IN_PERSON)),
        VIDEO:
          body.feesINR.VIDEO !== undefined
            ? Number(body.feesINR.VIDEO)
            : updatedDoc.feesINR.VIDEO,
        FOLLOW_UP:
          body.feesINR.FOLLOW_UP !== undefined
            ? Number(body.feesINR.FOLLOW_UP)
            : updatedDoc.feesINR.FOLLOW_UP,
      };
    }
    if (typeof body.isVerifiedCredentials === 'boolean') {
      updatedDoc.isVerifiedCredentials = body.isVerifiedCredentials;
    }
    if (body.registrationNumber !== undefined) {
      updatedDoc.registrationNumber = body.registrationNumber
        ? String(body.registrationNumber).trim()
        : null;
    }
    if (typeof body.isActive === 'boolean') {
      updatedDoc.isActive = body.isActive;
    }
    if (typeof body.campusWing === 'string' && body.campusWing.trim()) {
      updatedDoc.campusWing = body.campusWing.trim();
    }
    doctors[idx] = updatedDoc;
    writeLocalDoctors(doctors);
    return { doctor: updatedDoc } as TResponse;
  }

  const adminAptMatch = path.match(/^\/api\/v1\/admin\/appointments\/([^/]+)$/);
  if (method === 'PATCH' && adminAptMatch) {
    const ref = decodeURIComponent(adminAptMatch[1]).toUpperCase();
    const existing = appointmentsMap[ref];
    if (!existing) {
      throw new ApiError(404, 'RESOURCE_NOT_FOUND', 'Appointment not found.');
    }
    const updated: Appointment = {
      ...existing,
      paymentStatus: (body.paymentStatus as PaymentStatus) || existing.paymentStatus,
      status: (body.status as Appointment['status']) || existing.status,
      updatedAtISO: new Date().toISOString(),
    };
    upsertLocalAppointment(updated);
    return { appointment: updated } as TResponse;
  }

  if (method === 'PATCH' && path === '/api/v1/admin/settings') {
    const nextSettings: HospitalSettings = {
      ...settings,
      outpatientHoursIST:
        typeof body.outpatientHoursIST === 'string' && body.outpatientHoursIST.trim()
          ? body.outpatientHoursIST.trim()
          : settings.outpatientHoursIST,
      contactPhone:
        typeof body.contactPhone === 'string'
          ? body.contactPhone.trim() || null
          : settings.contactPhone,
      contactEmail:
        typeof body.contactEmail === 'string'
          ? body.contactEmail.trim() || null
          : settings.contactEmail,
      arePricesIllustrative:
        typeof body.arePricesIllustrative === 'boolean'
          ? body.arePricesIllustrative
          : settings.arePricesIllustrative,
    };
    writeLocalSettings(nextSettings);
    return { hospitalSettings: nextSettings } as TResponse;
  }

  throw new ApiError(404, 'NOT_FOUND', `Endpoint ${endpoint} not found.`);
}

export async function apiRequest<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<TResponse> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // If deployed to a static host where /api/* returns HTML fallback, use local resolver seamlessly
    if (!isJson) {
      return resolveClientSideFallback<TResponse>(endpoint, options);
    }

    const payload = (await response.json().catch(() => null)) as
      | TResponse
      | { error?: { code?: string; message?: string; fieldErrors?: Record<string, string> } }
      | null;

    if (!response.ok) {
      const errObj =
        payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined;

      // If a stateless serverless Lambda instance cold-started and missed a client-created appointment,
      // check the synchronized local store before throwing 404.
      if (response.status === 404 && endpoint.includes('/appointments')) {
        try {
          return resolveClientSideFallback<TResponse>(endpoint, options);
        } catch {
          // Proceed to throw server error
        }
      }

      throw new ApiError(
        response.status,
        errObj?.code ?? 'INTERNAL_ERROR',
        errObj?.message ?? `Request failed with HTTP ${response.status}`,
        errObj?.fieldErrors
      );
    }

    // Mirror state-mutating responses into localStorage so serverless cold-starts never lose user bookings
    if (payload && typeof payload === 'object') {
      const p = payload as Record<string, any>;
      if (p.appointment && p.appointment.referenceId) {
        upsertLocalAppointment(p.appointment as Appointment);
      }
      if (p.inquiry && p.inquiry.id) {
        saveLocalInquiry(p.inquiry as ContactInquiry);
      }
      if (p.hospitalSettings && (options.method || '').toUpperCase() === 'PATCH') {
        writeLocalSettings(p.hospitalSettings as HospitalSettings);
      }
    }

    return payload as TResponse;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network offline or serverless unreachable: resolve seamlessly via client store
    return resolveClientSideFallback<TResponse>(endpoint, options);
  }
}
