import crypto from 'crypto';
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
} from '../../src/data/clinicalCatalogSeed';
import type {
  AdminAuditLog,
  Appointment,
  AppointmentSlot,
  AppointmentTypeCode,
  ContactInquiry,
  Doctor,
  HospitalSettings,
  MedicalServiceItem,
  PaymentMethod,
  PaymentStatus,
  Specialty,
} from '../../src/types/domain.types';

const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'ORBAI-ADMIN-2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let hospitalSettings: HospitalSettings = { ...INITIAL_HOSPITAL_SETTINGS };
const medicalServices: MedicalServiceItem[] = INITIAL_MEDICAL_SERVICES.map((s) => ({ ...s }));
const specialties: Specialty[] = INITIAL_SPECIALTIES.map((s) => ({
  ...s,
  servicesOffered: [...s.servicesOffered],
  conditionsTreated: [...s.conditionsTreated],
}));
const doctors: Doctor[] = INITIAL_DOCTORS.map((d) => ({
  ...d,
  qualifications: [...d.qualifications],
  languagesSpoken: [...d.languagesSpoken],
  clinicalInterests: [...d.clinicalInterests],
  supportedAppointmentTypes: [...d.supportedAppointmentTypes],
  feesINR: { ...d.feesINR },
}));

const slotStore = new Map<string, AppointmentSlot>();
const appointmentsStore = new Map<string, Appointment>();
const inquiriesStore: ContactInquiry[] = [];
const auditLogsStore: AdminAuditLog[] = [...INITIAL_AUDIT_LOGS];

// Seed default sample appointment
const sampleApt = createSeedSampleAppointment();
appointmentsStore.set(sampleApt.referenceId, sampleApt);

function ensureSlotsForDoctorAndDate(doctorId: string, dateIST: string): AppointmentSlot[] {
  const bookedIds = new Set<string>();
  for (const apt of appointmentsStore.values()) {
    if (
      apt.doctorId === doctorId &&
      apt.dateIST === dateIST &&
      apt.status !== 'CANCELLED_BY_PATIENT' &&
      apt.status !== 'CANCELLED_BY_HOSPITAL'
    ) {
      bookedIds.add(apt.slotId);
    }
  }
  const generated = buildDeterministicSlotsForDoctorAndDate(doctorId, dateIST, bookedIds);
  return generated.map((slot) => {
    const existing = slotStore.get(slot.id);
    if (existing) {
      return existing;
    }
    slotStore.set(slot.id, slot);
    return slot;
  });
}

function sanitizeString(value: unknown, maxLength = 250): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function requireAdmin(req: Request): Response | null {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (token !== ADMIN_ACCESS_CODE) {
    return jsonResponse(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Valid Staff Admin authorization token is required.',
        },
      },
      401
    );
  }
  return null;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ ok: true }, 200);
  }

  const url = new URL(req.url);
  // Normalize path whether invoked via /api/v1/* or /.netlify/functions/api/v1/*
  const rawPath = url.pathname
    .replace(/^\/\.netlify\/functions\/api/, '/api')
    .replace(/\/+$/, '');
  const method = req.method.toUpperCase();

  let body: Record<string, any> = {};
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    try {
      body = (await req.json()) as Record<string, any>;
    } catch {
      body = {};
    }
  }

  // 1. GET /api/v1/health
  if (method === 'GET' && rawPath === '/api/v1/health') {
    return jsonResponse({
      status: 'ok',
      brand: 'NovaCraft Orbai',
      timezone: 'Asia/Kolkata',
      timestampISO: new Date().toISOString(),
    });
  }

  // 2. GET /api/v1/config/capabilities
  if (method === 'GET' && rawPath === '/api/v1/config/capabilities') {
    const razorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
    return jsonResponse({
      hospitalSettings,
      integrations: {
        razorpayConfigured,
        razorpayPublicKeyId: razorpayConfigured ? RAZORPAY_KEY_ID : null,
        emailConfigured: false,
        smsConfigured: false,
        whatsappConfigured: false,
      },
      feeScheduleINR: medicalServices,
    });
  }

  // 3. GET /api/v1/specialties
  if (method === 'GET' && rawPath === '/api/v1/specialties') {
    return jsonResponse({
      items: specialties.filter((s) => s.isEnabled),
      services: medicalServices.filter((m) => m.isAvailable),
    });
  }

  // 4. GET /api/v1/specialties/:specialtySlug
  const specMatch = rawPath.match(/^\/api\/v1\/specialties\/([^/]+)$/);
  if (method === 'GET' && specMatch) {
    const slug = sanitizeString(decodeURIComponent(specMatch[1]), 80);
    const specialty = specialties.find((s) => s.slug === slug || s.id === slug);
    if (!specialty) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Medical department '${slug}' was not found at NovaCraft Orbai.`,
          },
        },
        404
      );
    }
    const departmentDoctors = doctors
      .filter((d) => d.specialtyId === specialty.id && d.isActive)
      .map((d) => ({
        ...d,
        nextAvailableSlot: getSeedNextAvailableSlotForDoctor(d.id),
      }));
    return jsonResponse({
      specialty,
      doctors: departmentDoctors,
      services: medicalServices,
    });
  }

  // 5. GET /api/v1/doctors
  if (method === 'GET' && rawPath === '/api/v1/doctors') {
    const specialtyFilter = sanitizeString(url.searchParams.get('specialty'), 80).toLowerCase();
    const typeFilter = sanitizeString(url.searchParams.get('type'), 40) as AppointmentTypeCode | '';
    const languageFilter = sanitizeString(url.searchParams.get('language'), 40).toLowerCase();
    const searchQuery = sanitizeString(url.searchParams.get('search'), 100).toLowerCase();
    const sortBy = sanitizeString(url.searchParams.get('sort'), 40);

    let list = doctors.filter((d) => d.isActive);

    if (specialtyFilter && specialtyFilter !== 'all') {
      list = list.filter(
        (d) =>
          d.specialtyId.toLowerCase() === specialtyFilter ||
          d.specialtyName.toLowerCase().includes(specialtyFilter) ||
          specialties.find((s) => s.id === d.specialtyId)?.slug === specialtyFilter
      );
    }

    if (typeFilter && ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'].includes(typeFilter)) {
      list = list.filter((d) =>
        d.supportedAppointmentTypes.includes(typeFilter as AppointmentTypeCode)
      );
    }

    if (languageFilter && languageFilter !== 'all') {
      list = list.filter((d) =>
        d.languagesSpoken.some((lang) => lang.toLowerCase() === languageFilter)
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
      nextAvailableSlot: getSeedNextAvailableSlotForDoctor(d.id),
    }));

    return jsonResponse({
      items: enriched,
      totalCount: enriched.length,
    });
  }

  // 6. GET /api/v1/doctors/:doctorSlug
  const docMatch = rawPath.match(/^\/api\/v1\/doctors\/([^/]+)$/);
  if (method === 'GET' && docMatch) {
    const slug = sanitizeString(decodeURIComponent(docMatch[1]), 100);
    const doctor = doctors.find((d) => d.slug === slug || d.id === slug);
    if (!doctor) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Doctor profile '${slug}' was not found.`,
          },
        },
        404
      );
    }
    const upcomingDatesIST = getUpcomingISTDates(10);
    const slotsByDate: Record<string, AppointmentSlot[]> = {};
    for (const dateStr of upcomingDatesIST) {
      slotsByDate[dateStr] = ensureSlotsForDoctorAndDate(doctor.id, dateStr);
    }
    return jsonResponse({
      doctor,
      upcomingDatesIST,
      slotsByDate,
    });
  }

  // 7. GET /api/v1/slots
  if (method === 'GET' && rawPath === '/api/v1/slots') {
    const doctorId = sanitizeString(url.searchParams.get('doctorId'), 100);
    const dateIST = sanitizeString(url.searchParams.get('dateIST'), 20) || getUpcomingISTDates(1)[0];
    const doctor = doctors.find((d) => d.id === doctorId || d.slug === doctorId);
    if (!doctor) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Selected doctor was not found when checking slot availability.',
          },
        },
        404
      );
    }
    const slots = ensureSlotsForDoctorAndDate(doctor.id, dateIST);
    return jsonResponse({
      doctorId: doctor.id,
      dateIST,
      timezone: 'Asia/Kolkata',
      slots,
    });
  }

  // 8. POST /api/v1/appointments
  if (method === 'POST' && rawPath === '/api/v1/appointments') {
    const doctorId = sanitizeString(body.doctorId, 100);
    const specialtyId = sanitizeString(body.specialtyId, 100);
    const appointmentType = sanitizeString(body.appointmentType, 30) as AppointmentTypeCode;
    const dateIST = sanitizeString(body.dateIST, 20);
    const slotId = sanitizeString(body.slotId, 140);
    const paymentMethod = sanitizeString(body.paymentMethod, 40) as PaymentMethod;

    const patientRaw = body.patient ?? {};
    const fullName = sanitizeString(patientRaw.fullName, 80);
    const mobileClean = sanitizeString(patientRaw.mobileNumber, 20)
      .replace(/[\s\-]/g, '')
      .replace(/^\+91/, '');
    const email = sanitizeString(patientRaw.email, 100);
    const ageYears = Number(patientRaw.ageYears);
    const reasonForVisit = sanitizeString(patientRaw.reasonForVisit, 300);

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
      return jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please review and correct the highlighted patient details.',
            fieldErrors,
          },
        },
        400
      );
    }

    const doctor = doctors.find((d) => d.id === doctorId && d.isActive);
    if (!doctor) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'The selected doctor is no longer available for booking.',
          },
        },
        404
      );
    }

    ensureSlotsForDoctorAndDate(doctor.id, dateIST);
    const slot = slotStore.get(slotId);
    if (!slot || slot.doctorId !== doctor.id || slot.dateIST !== dateIST) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'The requested appointment time slot does not exist.',
          },
        },
        404
      );
    }

    if (slot.status !== 'AVAILABLE') {
      return jsonResponse(
        {
          error: {
            code: 'SLOT_ALREADY_BOOKED',
            message: `The ${slot.startTimeIST} IST slot on ${dateIST} has already been booked. Please select another available time slot.`,
          },
        },
        409
      );
    }

    slot.status = 'BOOKED';

    const feeINR =
      appointmentType === 'VIDEO'
        ? (doctor.feesINR.VIDEO ?? 399)
        : appointmentType === 'FOLLOW_UP'
          ? (doctor.feesINR.FOLLOW_UP ?? 299)
          : doctor.feesINR.IN_PERSON;

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `NCO-2026-${randomDigits}`;
    const razorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

    let razorpayOrderId: string | undefined;
    let paymentGatewayFallbackReason: string | undefined;

    if (paymentMethod === 'RAZORPAY') {
      if (razorpayConfigured) {
        razorpayOrderId = `order_nco_${randomDigits}`;
      } else {
        paymentGatewayFallbackReason =
          'Live Razorpay merchant keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in this environment. Your appointment has been reserved under Pay at Hospital (PAYMENT_PENDING) so no fake payment success is recorded.';
      }
    }

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
      isIllustrativeFee: hospitalSettings.arePricesIllustrative,
      paymentMethod,
      paymentStatus: 'PAYMENT_PENDING',
      razorpayOrderId,
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

    appointmentsStore.set(referenceId, newAppointment);

    return jsonResponse(
      {
        appointment: newAppointment,
        razorpayOrder:
          razorpayConfigured && razorpayOrderId
            ? {
                orderId: razorpayOrderId,
                amountPaise: feeINR * 100,
                currency: 'INR',
                keyId: RAZORPAY_KEY_ID,
              }
            : undefined,
        paymentGatewayFallbackReason,
      },
      201
    );
  }

  // 9. GET /api/v1/appointments/:referenceId
  const aptMatch = rawPath.match(/^\/api\/v1\/appointments\/([^/]+)$/);
  if (method === 'GET' && aptMatch) {
    const ref = sanitizeString(decodeURIComponent(aptMatch[1]), 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `No appointment found with reference number '${ref}'.`,
          },
        },
        404
      );
    }
    return jsonResponse({ appointment });
  }

  // 10. POST /api/v1/payments/razorpay/verify
  if (method === 'POST' && rawPath === '/api/v1/payments/razorpay/verify') {
    const { referenceId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    const appointment = appointmentsStore.get(sanitizeString(referenceId, 40).toUpperCase());
    if (!appointment) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Appointment record not found for payment verification.',
          },
        },
        404
      );
    }
    if (!RAZORPAY_KEY_SECRET) {
      return jsonResponse(
        {
          error: {
            code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
            message:
              'Server-side Razorpay secret key is not configured. Payment cannot be marked as PAID without server cryptographic verification.',
          },
        },
        503
      );
    }
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      appointment.paymentStatus = 'PAYMENT_FAILED';
      appointment.updatedAtISO = new Date().toISOString();
      return jsonResponse(
        {
          error: {
            code: 'SIGNATURE_VERIFICATION_FAILED',
            message: 'Payment signature verification failed. Appointment remains unpaid.',
          },
        },
        400
      );
    }
    appointment.paymentStatus = 'PAID';
    appointment.razorpayPaymentId = sanitizeString(razorpayPaymentId, 80);
    appointment.updatedAtISO = new Date().toISOString();
    return jsonResponse({ appointment });
  }

  // 11. POST /api/v1/portal/lookup
  if (method === 'POST' && rawPath === '/api/v1/portal/lookup') {
    const mobileOrEmail = sanitizeString(body.mobileOrEmail, 100).toLowerCase();
    const referenceId = sanitizeString(body.referenceId, 40).toUpperCase();
    const cleanDigits = mobileOrEmail.replace(/[\s\-]/g, '').replace(/^\+91/, '');

    const matches = Array.from(appointmentsStore.values()).filter((apt) => {
      const mobileMatch = cleanDigits && apt.patient.mobileNumber === cleanDigits;
      const emailMatch = mobileOrEmail && apt.patient.email?.toLowerCase() === mobileOrEmail;
      const refMatch = referenceId && apt.referenceId === referenceId;
      return mobileMatch || emailMatch || refMatch;
    });

    if (matches.length === 0) {
      return jsonResponse(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message:
              'No appointments matched those credentials. Try mobile 9876543210 or reference NCO-2026-104892 to inspect the seeded demo record, or book a new appointment.',
          },
        },
        404
      );
    }

    const first = matches[0];
    return jsonResponse({
      patientSummary: {
        fullName: first.patient.fullName,
        mobileNumber: first.patient.mobileNumber,
        email: first.patient.email,
      },
      appointments: matches.sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO)),
    });
  }

  // 12. PATCH /api/v1/portal/appointments/:referenceId/reschedule
  const reschedMatch = rawPath.match(
    /^\/api\/v1\/portal\/appointments\/([^/]+)\/reschedule$/
  );
  if (method === 'PATCH' && reschedMatch) {
    const ref = sanitizeString(decodeURIComponent(reschedMatch[1]), 40).toUpperCase();
    const newDateIST = sanitizeString(body.newDateIST, 20);
    const newSlotId = sanitizeString(body.newSlotId, 140);
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      return jsonResponse(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' } },
        404
      );
    }
    ensureSlotsForDoctorAndDate(appointment.doctorId, newDateIST);
    const targetSlot = slotStore.get(newSlotId);
    if (!targetSlot || targetSlot.doctorId !== appointment.doctorId) {
      return jsonResponse(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Target reschedule time slot not found.' } },
        404
      );
    }
    if (targetSlot.status !== 'AVAILABLE') {
      return jsonResponse(
        {
          error: {
            code: 'SLOT_ALREADY_BOOKED',
            message: 'That replacement time slot is already booked. Please select an open slot.',
          },
        },
        409
      );
    }
    const oldSlot = slotStore.get(appointment.slotId);
    if (oldSlot) oldSlot.status = 'AVAILABLE';
    targetSlot.status = 'BOOKED';

    appointment.dateIST = newDateIST;
    appointment.startTimeIST = targetSlot.startTimeIST;
    appointment.endTimeIST = targetSlot.endTimeIST;
    appointment.slotId = targetSlot.id;
    appointment.status = 'RESCHEDULED';
    appointment.updatedAtISO = new Date().toISOString();

    return jsonResponse({ appointment });
  }

  // 13. PATCH /api/v1/portal/appointments/:referenceId/cancel
  const cancelMatch = rawPath.match(/^\/api\/v1\/portal\/appointments\/([^/]+)\/cancel$/);
  if (method === 'PATCH' && cancelMatch) {
    const ref = sanitizeString(decodeURIComponent(cancelMatch[1]), 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      return jsonResponse(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' } },
        404
      );
    }
    const oldSlot = slotStore.get(appointment.slotId);
    if (oldSlot) oldSlot.status = 'AVAILABLE';
    appointment.status = 'CANCELLED_BY_PATIENT';
    if (appointment.paymentStatus === 'PAID') {
      appointment.paymentStatus = 'REFUND_PENDING';
    }
    appointment.updatedAtISO = new Date().toISOString();
    return jsonResponse({ appointment });
  }

  // 14. POST /api/v1/inquiries
  if (method === 'POST' && rawPath === '/api/v1/inquiries') {
    const fullName = sanitizeString(body.fullName, 80);
    const mobileNumber = sanitizeString(body.mobileNumber, 20);
    const email = sanitizeString(body.email, 100);
    const department = sanitizeString(body.department, 80) || 'General Inquiry';
    const message = sanitizeString(body.message, 800);

    if (!fullName || !mobileNumber || !message) {
      return jsonResponse(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide your name, phone number, and message.',
          },
        },
        400
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
    inquiriesStore.unshift(inquiry);
    return jsonResponse({ inquiry }, 201);
  }

  // 15. POST /api/v1/admin/login
  if (method === 'POST' && rawPath === '/api/v1/admin/login') {
    const passcode = sanitizeString(body.passcode, 80);
    if (passcode !== ADMIN_ACCESS_CODE) {
      return jsonResponse(
        {
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Invalid Staff Admin passcode. (Use ORBAI-ADMIN-2026 in preview environment).',
          },
        },
        401
      );
    }
    return jsonResponse({
      token: ADMIN_ACCESS_CODE,
      role: 'ROLE_ADMIN',
    });
  }

  // 16. GET /api/v1/admin/overview
  if (method === 'GET' && rawPath === '/api/v1/admin/overview') {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const allAppointments = Array.from(appointmentsStore.values()).sort((a, b) =>
      b.createdAtISO.localeCompare(a.createdAtISO)
    );
    return jsonResponse({
      metrics: {
        totalAppointments: allAppointments.length,
        confirmedAppointments: allAppointments.filter(
          (a) => a.status === 'CONFIRMED' || a.status === 'RESCHEDULED'
        ).length,
        pendingPayments: allAppointments.filter((a) => a.paymentStatus === 'PAYMENT_PENDING')
          .length,
        paidAppointments: allAppointments.filter((a) => a.paymentStatus === 'PAID').length,
        activeDoctors: doctors.filter((d) => d.isActive).length,
        enabledSpecialties: specialties.filter((s) => s.isEnabled).length,
      },
      appointments: allAppointments,
      doctors,
      specialties,
      services: medicalServices,
      hospitalSettings,
      inquiries: inquiriesStore,
      auditLogs: auditLogsStore.slice(0, 50),
    });
  }

  // 17. PATCH /api/v1/admin/doctors/:doctorId
  const adminDocMatch = rawPath.match(/^\/api\/v1\/admin\/doctors\/([^/]+)$/);
  if (method === 'PATCH' && adminDocMatch) {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const doctorId = sanitizeString(decodeURIComponent(adminDocMatch[1]), 100);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) {
      return jsonResponse(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Doctor not found.' } },
        404
      );
    }

    if (body.feesINR && typeof body.feesINR.IN_PERSON === 'number') {
      doctor.feesINR = {
        IN_PERSON: Math.max(100, Number(body.feesINR.IN_PERSON)),
        VIDEO: body.feesINR.VIDEO !== undefined ? Number(body.feesINR.VIDEO) : doctor.feesINR.VIDEO,
        FOLLOW_UP:
          body.feesINR.FOLLOW_UP !== undefined
            ? Number(body.feesINR.FOLLOW_UP)
            : doctor.feesINR.FOLLOW_UP,
      };
    }
    if (typeof body.isVerifiedCredentials === 'boolean') {
      doctor.isVerifiedCredentials = body.isVerifiedCredentials;
    }
    if (body.registrationNumber !== undefined) {
      doctor.registrationNumber = body.registrationNumber
        ? sanitizeString(body.registrationNumber, 60)
        : null;
    }
    if (typeof body.isActive === 'boolean') {
      doctor.isActive = body.isActive;
    }
    if (typeof body.campusWing === 'string' && body.campusWing.trim()) {
      doctor.campusWing = sanitizeString(body.campusWing, 140);
    }
    return jsonResponse({ doctor });
  }

  // 18. PATCH /api/v1/admin/appointments/:referenceId
  const adminAptMatch = rawPath.match(/^\/api\/v1\/admin\/appointments\/([^/]+)$/);
  if (method === 'PATCH' && adminAptMatch) {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    const ref = sanitizeString(decodeURIComponent(adminAptMatch[1]), 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      return jsonResponse(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' } },
        404
      );
    }
    if (body.paymentStatus) {
      appointment.paymentStatus = body.paymentStatus as PaymentStatus;
    }
    if (body.status) {
      appointment.status = body.status as Appointment['status'];
    }
    appointment.updatedAtISO = new Date().toISOString();
    return jsonResponse({ appointment });
  }

  // 19. PATCH /api/v1/admin/settings
  if (method === 'PATCH' && rawPath === '/api/v1/admin/settings') {
    const authErr = requireAdmin(req);
    if (authErr) return authErr;

    if (typeof body.outpatientHoursIST === 'string' && body.outpatientHoursIST.trim()) {
      hospitalSettings.outpatientHoursIST = sanitizeString(body.outpatientHoursIST, 120);
    }
    if (typeof body.contactPhone === 'string') {
      hospitalSettings.contactPhone = sanitizeString(body.contactPhone, 60) || null;
    }
    if (typeof body.contactEmail === 'string') {
      hospitalSettings.contactEmail = sanitizeString(body.contactEmail, 80) || null;
    }
    if (typeof body.arePricesIllustrative === 'boolean') {
      hospitalSettings.arePricesIllustrative = body.arePricesIllustrative;
    }
    return jsonResponse({ hospitalSettings });
  }

  return jsonResponse(
    {
      error: {
        code: 'NOT_FOUND',
        message: `API endpoint '${method} ${rawPath}' not found.`,
      },
    },
    404
  );
}

export const config = {
  path: '/api/*',
};
