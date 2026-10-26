export type CurrencyCode = 'INR';

export type AppointmentTypeCode = 'IN_PERSON' | 'VIDEO' | 'FOLLOW_UP';

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED_BY_ADMIN';

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED_BY_PATIENT'
  | 'CANCELLED_BY_HOSPITAL';

export type PaymentMethod = 'PAY_AT_HOSPITAL' | 'RAZORPAY';

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export type NotificationDeliveryStatus =
  | 'SENT'
  | 'SKIPPED_NOT_CONFIGURED'
  | 'FAILED';

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  clinicalOverview: string;
  imageSlotId: string;
  servicesOffered: string[];
  conditionsTreated: string[];
  baseConsultationFeeINR: number;
  isEnabled: boolean;
  isSampleData: boolean;
}

export interface DoctorConsultationFeeMap {
  IN_PERSON: number;
  VIDEO?: number;
  FOLLOW_UP?: number;
}

export interface Doctor {
  id: string;
  slug: string;
  fullName: string;
  professionalTitle: string;
  specialtyId: string;
  specialtyName: string;
  qualifications: string[];
  registrationNumber: string | null;
  isVerifiedCredentials: boolean;
  yearsOfExperience: number | null;
  languagesSpoken: string[];
  biography: string;
  clinicalInterests: string[];
  supportedAppointmentTypes: AppointmentTypeCode[];
  feesINR: DoctorConsultationFeeMap;
  campusWing: string;
  portraitSlotId: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface MedicalServiceItem {
  id: string;
  slug: string;
  title: string;
  category:
    | 'GENERAL_CONSULTATION'
    | 'SPECIALIST_CONSULTATION'
    | 'DIAGNOSTIC_TESTING'
    | 'PREVENTIVE_CHECKUP'
    | 'VACCINATION'
    | 'FOLLOW_UP_CARE'
    | 'TELECONSULTATION';
  description: string;
  suggestedFeeINR: number;
  isIllustrativeFee: boolean;
  isAvailable: boolean;
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  dateIST: string;
  startTimeIST: string;
  endTimeIST: string;
  period: 'MORNING' | 'AFTERNOON' | 'EVENING';
  status: SlotStatus;
}

export interface PatientDetailsInput {
  fullName: string;
  mobileNumber: string;
  email?: string;
  ageYears: number;
  reasonForVisit?: string;
}

export interface NotificationRecord {
  id: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  statusReason: string;
  timestampISO: string;
}

export interface Appointment {
  id: string;
  referenceId: string;
  doctorId: string;
  doctorSnapshot: {
    fullName: string;
    professionalTitle: string;
    specialtyName: string;
    campusWing: string;
    slug: string;
  };
  specialtyId: string;
  appointmentType: AppointmentTypeCode;
  dateIST: string;
  startTimeIST: string;
  endTimeIST: string;
  slotId: string;
  patient: PatientDetailsInput;
  consultationFeeINR: number;
  currency: CurrencyCode;
  isIllustrativeFee: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: AppointmentStatus;
  notifications: NotificationRecord[];
  createdAtISO: string;
  updatedAtISO: string;
}

export interface HospitalSettings {
  brandName: 'NovaCraft Orbai';
  campusName: string;
  timezone: 'Asia/Kolkata';
  currencySymbol: '₹';
  outpatientHoursIST: string;
  emergencyNotice: string;
  addressConfigurableNotice: string;
  contactPhone: string | null;
  contactEmail: string | null;
  cancellationWindowHours: number;
  arePricesIllustrative: boolean;
}

export interface AdminAuditLog {
  id: string;
  actorRole: 'ROLE_ADMIN' | 'ROLE_STAFF';
  action: string;
  targetEntityId: string;
  summary: string;
  timestampISO: string;
}

export interface ContactInquiry {
  id: string;
  inquiryReference: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  department: string;
  message: string;
  createdAtISO: string;
}
