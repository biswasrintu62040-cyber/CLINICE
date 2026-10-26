import type {
  AdminAuditLog,
  Appointment,
  AppointmentSlot,
  AppointmentTypeCode,
  ContactInquiry,
  Doctor,
  HospitalSettings,
  MedicalServiceItem,
  PatientDetailsInput,
  PaymentMethod,
  PaymentStatus,
  Specialty,
} from './domain.types';

export interface SystemCapabilitiesResponse {
  hospitalSettings: HospitalSettings;
  integrations: {
    razorpayConfigured: boolean;
    razorpayPublicKeyId: string | null;
    emailConfigured: boolean;
    smsConfigured: boolean;
    whatsappConfigured: boolean;
  };
  feeScheduleINR: MedicalServiceItem[];
}

export interface SpecialtiesListResponse {
  items: Specialty[];
  services: MedicalServiceItem[];
}

export interface SpecialtyDetailResponse {
  specialty: Specialty;
  doctors: Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>;
  services: MedicalServiceItem[];
}

export interface DoctorsListResponse {
  items: Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>;
  totalCount: number;
}

export interface DoctorDetailResponse {
  doctor: Doctor;
  upcomingDatesIST: string[];
  slotsByDate: Record<string, AppointmentSlot[]>;
}

export interface SlotsListResponse {
  doctorId: string;
  dateIST: string;
  timezone: 'Asia/Kolkata';
  slots: AppointmentSlot[];
}

export interface CreateAppointmentRequest {
  specialtyId: string;
  doctorId: string;
  appointmentType: AppointmentTypeCode;
  dateIST: string;
  slotId: string;
  patient: PatientDetailsInput;
  paymentMethod: PaymentMethod;
}

export interface CreateAppointmentResponse {
  appointment: Appointment;
  razorpayOrder?: {
    orderId: string;
    amountPaise: number;
    currency: 'INR';
    keyId: string;
  };
  paymentGatewayFallbackReason?: string;
}

export interface VerifyRazorpayPaymentRequest {
  referenceId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PortalLookupRequest {
  mobileOrEmail: string;
  referenceId?: string;
}

export interface PortalLookupResponse {
  patientSummary: {
    fullName: string;
    mobileNumber: string;
    email?: string;
  };
  appointments: Appointment[];
}

export interface RescheduleAppointmentRequest {
  newDateIST: string;
  newSlotId: string;
}

export interface AdminOverviewResponse {
  metrics: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingPayments: number;
    paidAppointments: number;
    activeDoctors: number;
    enabledSpecialties: number;
  };
  appointments: Appointment[];
  doctors: Doctor[];
  specialties: Specialty[];
  services: MedicalServiceItem[];
  hospitalSettings: HospitalSettings;
  inquiries: ContactInquiry[];
  auditLogs: AdminAuditLog[];
}

export interface UpdateDoctorAdminRequest {
  feesINR?: {
    IN_PERSON: number;
    VIDEO?: number;
    FOLLOW_UP?: number;
  };
  isVerifiedCredentials?: boolean;
  registrationNumber?: string | null;
  isActive?: boolean;
  campusWing?: string;
}

export interface UpdateAppointmentAdminRequest {
  paymentStatus?: PaymentStatus;
  status?: Appointment['status'];
}
