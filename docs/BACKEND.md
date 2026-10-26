# Backend Contract & Data Architecture — NovaCraft Orbai

**Document Version:** 1.0.0  
**Brand Name:** NovaCraft Orbai  
**Server Runtime:** Express 4 (`server.ts`) mounted on port `3000` with Vite middleware in dev & static `dist/` in production  
**API Base Path:** `/api/v1` · **Timezone Standard:** `Asia/Kolkata` (`IST`, UTC+05:30) · **Currency:** `INR` (`₹`)  
**Cross-References:** [`docs/PRD.md`](./PRD.md) · [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docs/RULES.md`](./RULES.md) · [`docs/PHASES.md`](./PHASES.md) · [`docs/FRONTEND.md`](./FRONTEND.md)

---

## 1. Backend Architecture Overview & Operational Integrity

NovaCraft Orbai operates as a full-stack Node.js/TypeScript application where `server.ts` serves `/api/v1/*` REST endpoints alongside the React 19 SPA on port `3000`.

### 1.1 Core Backend Guarantees
1. **Atomic Slot Reservation (Zero Double-Booking):** Every appointment creation (`POST /api/v1/appointments`) and reschedule (`PATCH /api/v1/portal/appointments/:referenceId/reschedule`) executes an atomic slot state check-and-lock (`AVAILABLE → BOOKED`). Concurrent requests for the same `slotId` receive HTTP `409 Conflict` (`SLOT_ALREADY_BOOKED`).
2. **Server-Authoritative Payment Verification:** Online payments via Razorpay are never trusted from client callbacks alone. The server computes `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` before transitioning an appointment from `PAYMENT_PENDING` to `PAID`.
3. **Graceful Unconfigured Integration Handling:** `GET /api/v1/config/capabilities` reports live integration availability (`razorpayConfigured: boolean`, `emailNotificationsConfigured: boolean`, `smsNotificationsConfigured: boolean`). When third-party secrets are not configured in `.env`, the API supports the **Pay at Hospital** (`PAYMENT_PENDING`) workflow and explicitly marks notification records as `SKIPPED_NOT_CONFIGURED` rather than faking delivery.

---

## 2. Domain Data Models & Entities (`src/types/domain.types.ts`)

```ts
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
  id: string;                      // e.g. "spec-cardiology"
  slug: string;                    // e.g. "cardiology"
  name: string;                    // e.g. "Cardiology"
  shortDescription: string;
  clinicalOverview: string;
  imageSlotId: string;             // References 17-slot Medical Image System
  servicesOffered: string[];
  baseConsultationFeeINR: number;  // e.g. 999
  isEnabled: boolean;
  isSampleData: boolean;           // true until hospital admin approves
}

export interface DoctorConsultationFeeMap {
  IN_PERSON: number;               // e.g. 999 (₹999)
  VIDEO?: number;                  // e.g. 399 (₹399)
  FOLLOW_UP?: number;              // e.g. 299 (₹299)
}

export interface Doctor {
  id: string;                      // e.g. "doc-arvind-krishnamurthy"
  slug: string;
  fullName: string;                // e.g. "Dr. Arvind Krishnamurthy"
  professionalTitle: string;       // e.g. "Senior Consultant — Interventional Cardiology"
  specialtyId: string;
  specialtyName: string;
  qualifications: string[];        // e.g. ["MBBS", "MD (Internal Medicine)", "DM (Cardiology)"]
  registrationNumber: string | null; // Null until verified by admin
  isVerifiedCredentials: boolean;  // Explicitly false for sample development data
  yearsOfExperience: number | null;
  languagesSpoken: string[];       // e.g. ["English", "Hindi", "Kannada"]
  biography: string;
  clinicalInterests: string[];
  supportedAppointmentTypes: AppointmentTypeCode[];
  feesINR: DoctorConsultationFeeMap;
  campusWing: string;              // e.g. "NovaCraft Orbai Flagship — Wing B, Level 3"
  portraitSlotId: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface MedicalServiceItem {
  id: string;
  slug: string;
  title: string;                   // e.g. "General Physician Consultation"
  category:
    | 'GENERAL_CONSULTATION'
    | 'SPECIALIST_CONSULTATION'
    | 'DIAGNOSTIC_TESTING'
    | 'PREVENTIVE_CHECKUP'
    | 'VACCINATION'
    | 'FOLLOW_UP_CARE'
    | 'TELECONSULTATION';
  description: string;
  suggestedFeeINR: number;         // Matches the 9-tier INR pricing table (₹299–₹999)
  isIllustrativeFee: boolean;      // true until approved by hospital administration
  isAvailable: boolean;
}

export interface AppointmentSlot {
  id: string;                      // Deterministic ID: `slot_${doctorId}_${dateIST}_${startTime24h}`
  doctorId: string;
  dateIST: string;                 // YYYY-MM-DD in Asia/Kolkata
  startTimeIST: string;            // e.g. "10:30 AM"
  endTimeIST: string;              // e.g. "11:00 AM"
  period: 'MORNING' | 'AFTERNOON' | 'EVENING';
  status: SlotStatus;
  heldUntilISO?: string;
}

export interface PatientDetailsInput {
  fullName: string;
  mobileNumber: string;            // Validated Indian mobile: /^[6-9]\d{9}$/ or +91 prefix
  email?: string;
  ageYears: number;                // 0–120
  reasonForVisit?: string;         // Optional, max 300 chars
}

export interface NotificationRecord {
  id: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  statusReason: string;            // Honest explanation of delivery or unconfigured state
  timestampISO: string;
}

export interface Appointment {
  id: string;
  referenceId: string;             // e.g. "NCO-2026-849201"
  doctorId: string;
  doctorSnapshot: {
    fullName: string;
    professionalTitle: string;
    specialtyName: string;
    campusWing: string;
  };
  specialtyId: string;
  appointmentType: AppointmentTypeCode;
  dateIST: string;                 // YYYY-MM-DD
  startTimeIST: string;            // e.g. "10:30 AM"
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
  cancellationWindowHours: number; // e.g. 4 hours prior to slot
  arePricesIllustrative: boolean;
}

export interface AdminAuditLog {
  id: string;
  actorRole: 'ROLE_ADMIN' | 'ROLE_STAFF';
  action: string;                  // e.g. "UPDATE_DOCTOR_FEE", "CANCEL_APPOINTMENT"
  targetEntityId: string;
  summary: string;
  timestampISO: string;
}
```

---

## 3. REST API Contract (`/api/v1/*`)

### 3.1 Standardized Error Envelope
All non-2xx responses return a consistent JSON structure:
```json
{
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "The selected 10:30 AM IST slot was just reserved by another patient. Please choose another available time.",
    "fieldErrors": {}
  }
}
```

| HTTP Status | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Missing required patient field, invalid 10-digit Indian mobile, or invalid appointment type. |
| `401 Unauthorized` | `AUTH_REQUIRED` | Missing or invalid Patient Portal token or Admin access credentials. |
| `403 Forbidden` | `INSUFFICIENT_ROLE` | Non-admin attempting to mutate `/api/v1/admin/*` resources. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Unknown `doctorSlug`, `specialtySlug`, or `referenceId`. |
| `409 Conflict` | `SLOT_ALREADY_BOOKED` | Target `slotId` is no longer `AVAILABLE` during booking or rescheduling. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Exceeded booking/inquiry submission threshold per IP window. |
| `503 Service Unavailable` | `PAYMENT_GATEWAY_NOT_CONFIGURED` | Client requested Razorpay order creation when `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are absent in server environment. |

---

### 3.2 Endpoint Specifications

#### 1. System Health & Capability Discovery
- **`GET /api/v1/health`** → `{ status: 'ok', brand: 'NovaCraft Orbai', timezone: 'Asia/Kolkata', timestampISO: string }`
- **`GET /api/v1/config/capabilities`**
  - **Response (`200 OK`):**
    ```ts
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
    ```

#### 2. Medical Specialties & Services
- **`GET /api/v1/specialties`** → Returns `{ items: Specialty[], services: MedicalServiceItem[] }`.
- **`GET /api/v1/specialties/:specialtySlug`** → Returns `{ specialty: Specialty, doctors: Doctor[], services: MedicalServiceItem[] }`.

#### 3. Doctors Directory & Individual Profiles
- **`GET /api/v1/doctors`**
  - **Query Params:** `specialty?: string`, `type?: AppointmentTypeCode`, `language?: string`, `search?: string`, `availableDateIST?: string`, `sort?: 'featured' | 'fee_asc' | 'fee_desc'`, `page?: number`, `pageSize?: number`.
  - **Response (`200 OK`):**
    ```ts
    export interface DoctorsListResponse {
      items: Array<Doctor & { nextAvailableSlot?: { dateIST: string; startTimeIST: string } }>;
      totalCount: number;
      page: number;
      pageSize: number;
    }
    ```
- **`GET /api/v1/doctors/:doctorSlug`** → Returns `{ doctor: Doctor, upcomingSlotsByDate: Record<string, AppointmentSlot[]> }`.

#### 4. Real-Time IST Appointment Slots
- **`GET /api/v1/slots`**
  - **Query Params:** `doctorId: string` (required), `dateIST: string` (`YYYY-MM-DD`, required).
  - **Response (`200 OK`):** `{ doctorId: string, dateIST: string, timezone: 'Asia/Kolkata', slots: AppointmentSlot[] }`.

#### 5. 7-Step Appointment Booking Creation & Lookup
- **`POST /api/v1/appointments`**
  - **Request Body (`CreateAppointmentRequest`):**
    ```ts
    export interface CreateAppointmentRequest {
      specialtyId: string;
      doctorId: string;
      appointmentType: AppointmentTypeCode;
      dateIST: string;
      slotId: string;
      patient: PatientDetailsInput;
      paymentMethod: PaymentMethod;
    }
    ```
  - **Server Execution Logic:**
    1. Validate `patient.fullName` (2–80 chars), `patient.mobileNumber` (`/^(?:\+91[\-\s]?)?[6-9]\d{9}$/`), `patient.ageYears` (`0–120`).
    2. Look up `doctorId` and verify `appointmentType` is supported by that doctor.
    3. Look up `slotId` and verify `slot.status === 'AVAILABLE'`. If not available, abort and return `409 Conflict` (`SLOT_ALREADY_BOOKED`).
    4. Atomically transition `slot.status = 'BOOKED'`.
    5. Generate unique `referenceId` (`NCO-2026-XXXXXX`).
    6. Set `paymentStatus: 'PAYMENT_PENDING'`. If `paymentMethod === 'RAZORPAY'` and Razorpay credentials are configured, create a Razorpay Order (`amount = consultationFeeINR * 100` paise, `currency = 'INR'`) and attach `razorpayOrderId`.
    7. Record honest `notifications` array (`SENT` only if provider confirms, otherwise `SKIPPED_NOT_CONFIGURED`).
  - **Response (`201 Created`):** `{ appointment: Appointment, razorpayOrder?: { orderId: string; amountPaise: number; currency: 'INR'; keyId: string } }`.
- **`GET /api/v1/appointments/:referenceId`** → Returns `{ appointment: Appointment }`.

#### 6. Server-Side Razorpay Verification
- **`POST /api/v1/payments/razorpay/verify`**
  - **Request Body:**
    ```ts
    export interface VerifyRazorpayPaymentRequest {
      referenceId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
    ```
  - **Server Execution Logic:** Computes HMAC-SHA256 using Node `crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)`. Only if the digest matches `razorpaySignature` via `crypto.timingSafeEqual` does the server update `appointment.paymentStatus = 'PAID'`.

#### 7. Patient Portal Endpoints (`/api/v1/portal/*`)
- **`POST /api/v1/portal/lookup`**
  - **Request Body:** `{ mobileOrEmail: string; referenceId?: string }` (supports looking up appointments by mobile/email + booking reference or demo verified patient session).
  - **Response (`200 OK`):** `{ sessionToken: string, patientSummary: { fullName: string; mobileNumber: string }, appointments: Appointment[] }`.
- **`PATCH /api/v1/portal/appointments/:referenceId/reschedule`**
  - **Request Body:** `{ newDateIST: string; newSlotId: string }`.
  - **Server Execution Logic:** Verifies `newSlotId` is `AVAILABLE`, locks `newSlotId`, releases the previous `slotId` back to `AVAILABLE`, and updates the appointment record.
- **`PATCH /api/v1/portal/appointments/:referenceId/cancel`**
  - **Request Body:** `{ reason?: string }`.
  - **Server Execution Logic:** Sets `status = 'CANCELLED_BY_PATIENT'`, releases `slotId` back to `AVAILABLE`, and if `paymentStatus === 'PAID'`, transitions `paymentStatus = 'REFUND_PENDING'`.

#### 8. Staff Admin Dashboard Endpoints (`/api/v1/admin/*`)
Protected by `Authorization: Bearer <adminToken>` header:
- **`POST /api/v1/admin/login`** → Verifies `passcode` against `process.env.ADMIN_ACCESS_CODE` (or documented preview admin credential in development mode) and returns `{ token: string, role: 'ROLE_ADMIN' }`.
- **`GET /api/v1/admin/overview`** → Returns real counts derived from the server store (`totalAppointments`, `confirmedTodayCount`, `pendingPaymentsCount`, `activeDoctorsCount`, `auditLogs: AdminAuditLog[]`).
- **`PATCH /api/v1/admin/doctors/:doctorId`** → Updates doctor fees (`feesINR`), biography, active status, or `isVerifiedCredentials` flag and writes an `AdminAuditLog`.
- **`POST /api/v1/admin/doctors`** → Adds a new doctor profile and generates their 14-day IST slot schedule.
- **`PATCH /api/v1/admin/appointments/:referenceId`** → Allows staff to mark `Pay at Hospital` appointments as `PAID`, complete visits (`COMPLETED`), or process refunds (`REFUNDED`).
- **`PATCH /api/v1/admin/settings`** → Updates `HospitalSettings` (working hours, contact phone/email, cancellation window, illustrative pricing flag).

#### 9. Patient Contact Inquiries
- **`POST /api/v1/inquiries`**
  - **Request Body:** `{ fullName: string; mobileNumber: string; email: string; department?: string; message: string }`.
  - **Response (`201 Created`):** `{ inquiryId: string; receivedAtISO: string; message: string }`.

---

## 4. Seed & Persistence Strategy (Zero-External-DB Preview Resilience)

To guarantee that NovaCraft Orbai works immediately in AI Studio preview and local development without requiring external database provisioning while maintaining real server-side state across requests:
1. **Stateful Server Store (`server.ts`):** Initializes an in-memory transactional store backed by optional JSON snapshot persistence (`.data/novacraft-orbai-store.json`) with mutex locking on slot mutations.
2. **Baseline Illustrative INR Pricing Seed:** Seeds the exact 9 consultation service tiers from Section 10 of the specification:
   - General Physician Consultation: `₹499`
   - Specialist Consultation: `₹799`
   - Senior Specialist Consultation: `₹999`
   - Pediatric Consultation: `₹599`
   - Cardiology Consultation: `₹999`
   - Dermatology Consultation: `₹699`
   - Orthopedic Consultation: `₹799`
   - Follow-up Consultation: `₹299`
   - Video Consultation: `₹399`
3. **11 Medical Specialties & 8 Sample Doctor Profiles:** Seeded with `isSampleData: true` and `isVerifiedCredentials: false` so the frontend renders honest prototype badges until updated in `/admin`.
4. **Rolling 14-Day IST Slot Generator:** Automatically generates Morning (`09:00 AM – 12:00 PM IST`), Afternoon (`02:00 PM – 04:30 PM IST`), and Evening (`05:30 PM – 07:30 PM IST`) slots in `Asia/Kolkata` timezone.

---

## 5. Environment Variables, Security, Rate Limiting & Client Integration

### 5.1 Environment Variables (`/.env.example`)
```ini
# AI Studio Runtime Defaults
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"

# NovaCraft Orbai Server Configuration
HOSPITAL_TIMEZONE="Asia/Kolkata"
ADMIN_ACCESS_CODE="ORBAI-ADMIN-2026"

# Optional Razorpay Payment Gateway (Server-Side Verified)
# Leave blank to run in Pay-at-Hospital / Configuration-Notice mode
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

### 5.2 Security, Rate Limiting & Privacy Controls
- **Input Sanitization:** Strip control characters and HTML tags from patient names, visit notes, and contact messages on the server.
- **In-Memory Rate Limiter:** Limit `POST /api/v1/appointments` and `POST /api/v1/inquiries` to `15 requests / 5 minutes` per IP to prevent automated slot exhaustion.
- **Secret Isolation:** `RAZORPAY_KEY_SECRET` and `ADMIN_ACCESS_CODE` are read exclusively inside `server.ts` and are never serialized to client endpoints.

### 5.3 Frontend Data Layer Consumption (`src/lib/apiClient.ts`)
```ts
// src/lib/apiClient.ts
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

export async function apiRequest<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | TResponse
    | { error?: { code?: string; message?: string; fieldErrors?: Record<string, string> } }
    | null;

  if (!response.ok) {
    const errObj = payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined;
    throw new ApiError(
      response.status,
      errObj?.code ?? 'INTERNAL_ERROR',
      errObj?.message ?? `Request failed with status ${response.status}`,
      errObj?.fieldErrors
    );
  }

  return payload as TResponse;
}
```
