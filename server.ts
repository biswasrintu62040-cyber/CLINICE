import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './src/types/domain.types';

dotenv.config();

const PORT = 3000;
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'ORBAI-ADMIN-2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Helper to get rolling 14-day dates in Asia/Kolkata (IST)
function getUpcomingISTDates(daysCount = 14): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < daysCount; i++) {
    const target = new Date(now.getTime() + i * 86400000);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dates.push(formatter.format(target));
  }
  return dates;
}

// 1. Hospital Settings Seed
let hospitalSettings: HospitalSettings = {
  brandName: 'NovaCraft Orbai',
  campusName: 'NovaCraft Orbai Flagship Sanctuary Campus (Bengaluru, India)',
  timezone: 'Asia/Kolkata',
  currencySymbol: '₹',
  outpatientHoursIST: 'Monday – Saturday · 08:00 AM – 08:00 PM IST',
  emergencyNotice:
    'For life-threatening medical emergencies, call national emergency services (108 / 112) or proceed directly to the nearest emergency trauma unit.',
  addressConfigurableNotice:
    'Flagship Campus Address: Plot 42, Sanctuary Boulevard, Indiranagar–Domlur Corridor, Bengaluru 560038 (Sample Prototype Address — Configurable in Admin)',
  contactPhone: '+91 (80) 4092-8800 (Illustrative Desk Line)',
  contactEmail: 'concierge@novacraft-orbai.example.in',
  cancellationWindowHours: 4,
  arePricesIllustrative: true,
};

// 2. 9-Tier Illustrative INR Consultation Pricing Schedule (Section 10)
const medicalServices: MedicalServiceItem[] = [
  {
    id: 'srv-general-physician',
    slug: 'general-physician-consultation',
    title: 'General Physician Consultation',
    category: 'GENERAL_CONSULTATION',
    description:
      'Comprehensive primary care evaluation, acute symptom assessment, chronic condition management, and personalized preventive guidance.',
    suggestedFeeINR: 499,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-specialist',
    slug: 'specialist-consultation',
    title: 'Specialist Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Dedicated departmental consultation with a board-qualified specialist in Orthopedics, ENT, Ophthalmology, or Gynecology.',
    suggestedFeeINR: 799,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-senior-specialist',
    slug: 'senior-specialist-consultation',
    title: 'Senior Specialist Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Extended 30-minute diagnostic and second-opinion consultation with a Senior Department Director or Principal Consultant.',
    suggestedFeeINR: 999,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-pediatric',
    slug: 'pediatric-consultation',
    title: 'Pediatric Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Child-friendly developmental assessment, immunization counseling, pediatric nutrition, and acute childhood illness care.',
    suggestedFeeINR: 599,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-cardiology',
    slug: 'cardiology-consultation',
    title: 'Cardiology Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Specialized cardiac evaluation, blood pressure & lipid risk stratification, ECG review, and preventive heart care.',
    suggestedFeeINR: 999,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-dermatology',
    slug: 'dermatology-consultation',
    title: 'Dermatology Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Clinical dermatology, optical dermoscopy evaluation, eczema/psoriasis management, and evidence-based skin health protocols.',
    suggestedFeeINR: 699,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-orthopedic',
    slug: 'orthopedic-consultation',
    title: 'Orthopedic Consultation',
    category: 'SPECIALIST_CONSULTATION',
    description:
      'Joint, spine, sports injury, and musculoskeletal evaluation paired with non-surgical rehabilitation planning.',
    suggestedFeeINR: 799,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-follow-up',
    slug: 'follow-up-consultation',
    title: 'Follow-up Consultation',
    category: 'FOLLOW_UP_CARE',
    description:
      'Scheduled post-diagnostic review or treatment progress check within 14 days of an initial consultation.',
    suggestedFeeINR: 299,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-video-consultation',
    slug: 'video-consultation',
    title: 'Video Consultation',
    category: 'TELECONSULTATION',
    description:
      'Encrypted remote teleconsultation with a NovaCraft Orbai physician for routine advice, lab review, and follow-up care.',
    suggestedFeeINR: 399,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-diagnostics',
    slug: 'diagnostic-testing',
    title: 'Diagnostic Testing & Imaging Coordination',
    category: 'DIAGNOSTIC_TESTING',
    description:
      'Physician-referred clinical pathology, echocardiography, ultrasound, and non-invasive biomarker panels.',
    suggestedFeeINR: 799,
    isIllustrativeFee: true,
    isAvailable: true,
  },
  {
    id: 'srv-preventive-checkup',
    slug: 'preventive-health-checkups',
    title: 'Preventive Health Checkup Consultation',
    category: 'PREVENTIVE_CHECKUP',
    description:
      'Comprehensive annual metabolic, cardiovascular, and lifestyle longevity review with an internal medicine physician.',
    suggestedFeeINR: 999,
    isIllustrativeFee: true,
    isAvailable: true,
  },
];

// 3. 11 Configurable Medical Specialties (Section 7 & 9)
const specialties: Specialty[] = [
  {
    id: 'spec-general-medicine',
    slug: 'general-medicine',
    name: 'General Medicine',
    shortDescription: 'Primary internal medicine, metabolic health, febrile illness, and longitudinal preventive care.',
    clinicalOverview:
      'The Department of General & Internal Medicine serves as the clinical anchor of NovaCraft Orbai. Physicians coordinate multi-system diagnostics, hypertension and diabetes optimization, adult immunizations, and comprehensive preventive checkups.',
    imageSlotId: 'img_spec_general_med',
    servicesOffered: [
      'Comprehensive Adult Physical & Metabolic Evaluation',
      'Diabetes, Thyroid & Hypertension Management',
      'Infectious & Febrile Illness Diagnostics',
      'Preventive Health & Biomarker Interpretation',
    ],
    conditionsTreated: ['Type 2 Diabetes', 'Essential Hypertension', 'Thyroid Disorders', 'Seasonal Viral Syndromes', 'Metabolic Syndrome'],
    baseConsultationFeeINR: 499,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-cardiology',
    slug: 'cardiology',
    name: 'Cardiology',
    shortDescription: 'Preventive cardiology, heart rhythm diagnostics, echocardiography, and vascular risk management.',
    clinicalOverview:
      'Our Cardiology Sanctuary combines calm, unhurried clinical consultations with non-invasive cardiac imaging—including 12-lead digital ECG, 2D Doppler Echocardiography, ambulatory Holter monitoring, and lipidology.',
    imageSlotId: 'img_spec_cardiology',
    servicesOffered: [
      'Preventive Cardiac Risk & Lipid Consultation',
      'Resting ECG & 2D Doppler Echocardiography Review',
      'Hypertension & Heart Failure Outpatient Optimization',
      'Post-Intervention Cardiac Rehabilitation Planning',
    ],
    conditionsTreated: ['Coronary Artery Disease', 'Arrhythmias', 'Hypertensive Heart Disease', 'Dyslipidemia', 'Valvular Heart Conditions'],
    baseConsultationFeeINR: 999,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-orthopedics',
    slug: 'orthopedics',
    name: 'Orthopedics',
    shortDescription: 'Joint preservation, spine care, sports medicine, and evidence-based musculoskeletal rehabilitation.',
    clinicalOverview:
      'The Orthopedics & Motion Science wing focuses on conservative joint preservation, sports trauma recovery, ergonomic spine care, and structured physiotherapy guidance.',
    imageSlotId: 'img_spec_orthopedics',
    servicesOffered: [
      'Knee, Hip & Shoulder Joint Preservation Consultations',
      'Cervical & Lumbar Spine Biomechanical Assessment',
      'Sports Ligament & Tendon Injury Rehabilitation',
      'Bone Mineral Density & Osteoporosis Management',
    ],
    conditionsTreated: ['Osteoarthritis', 'Lumbar Disc Prolapse', 'Rotator Cuff Tendinopathy', 'ACL/Meniscal Sprains', 'Osteopenia'],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-pediatrics',
    slug: 'pediatrics',
    name: 'Pediatrics',
    shortDescription: 'Compassionate newborn, infant, child, and adolescent medical care in a calm environment.',
    clinicalOverview:
      'Designed with natural timber textures and daylight to put children at ease, our Pediatrics department delivers developmental milestone tracking, IAP-aligned vaccination schedules, and acute pediatric care.',
    imageSlotId: 'img_spec_pediatrics',
    servicesOffered: [
      'Well-Baby & Developmental Milestone Assessments',
      'Childhood & Adolescent Immunization Guidance',
      'Pediatric Nutrition, Growth & Allergy Consultations',
      'Acute Respiratory & Childhood Fever Care',
    ],
    conditionsTreated: ['Childhood Asthma & Allergies', 'Nutritional Deficiencies', 'Growth Delays', 'Pediatric Viral Illnesses'],
    baseConsultationFeeINR: 599,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-neurology',
    slug: 'neurology',
    name: 'Neurology',
    shortDescription: 'Specialized care for migraine, peripheral neuropathy, sleep disorders, stroke prevention, and memory.',
    clinicalOverview:
      'The Department of Neurology provides methodical, unhurried diagnostic evaluations for complex headache syndromes, seizure management, movement disorders, and cognitive health.',
    imageSlotId: 'img_spec_neurology',
    servicesOffered: [
      'Chronic Migraine & Headache Clinic',
      'Stroke Risk Stratification & Neuro-Vascular Follow-Up',
      'Peripheral Neuropathy & Nerve Conduction Review',
      'Memory, Sleep & Cognitive Longevity Evaluation',
    ],
    conditionsTreated: ['Migraine & Cluster Headaches', 'Epilepsy', 'Diabetic Neuropathy', 'Vertigo & Balance Disorders', 'Early Cognitive Decline'],
    baseConsultationFeeINR: 999,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-dermatology',
    slug: 'dermatology',
    name: 'Dermatology',
    shortDescription: 'Medical dermatology, optical mole mapping, pediatric skin conditions, and hair/scalp therapeutics.',
    clinicalOverview:
      'Our Dermatology suite prioritizes evidence-based medical skin and hair diagnostics using polarized optical dermoscopy, patch testing, and barrier-repair dermatological protocols.',
    imageSlotId: 'img_spec_dermatology',
    servicesOffered: [
      'Digital Optical Dermoscopy & Mole Evaluation',
      'Acne, Rosacea & Pigmentary Disorder Management',
      'Eczema, Psoriasis & Autoimmune Skin Care',
      'Clinical Trichology & Scalp Health Assessment',
    ],
    conditionsTreated: ['Atopic Dermatitis', 'Chronic Acne Vulgaris', 'Psoriasis', 'Androgenetic & Telogen Alopecia', 'Melasma'],
    baseConsultationFeeINR: 699,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-gynecology',
    slug: 'gynecology',
    name: "Women's Healthcare & Gynecology",
    shortDescription: 'Private, dignified care across reproductive health, prenatal guidance, PCOS, and menopause wellness.',
    clinicalOverview:
      'Built around privacy, dignity, and clinical excellence, the Women’s Healthcare sanctuary offers comprehensive gynecological consultations, PCOS metabolic care, preconception counseling, and midlife hormonal health.',
    imageSlotId: 'img_spec_womens_health',
    servicesOffered: [
      'Well-Woman Preventive Screening & Cervical Health',
      'PCOS, Endometriosis & Menstrual Health Clinic',
      'Preconception & Antenatal Outpatient Counseling',
      'Perimenopause & Bone/Metabolic Longevity Care',
    ],
    conditionsTreated: ['Polycystic Ovary Syndrome (PCOS)', 'Endometriosis', 'Uterine Fibroids', 'Perimenopausal Symptoms'],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-ent',
    slug: 'ent',
    name: 'ENT (Otorhinolaryngology)',
    shortDescription: 'Endoscopic sinus evaluation, audiology, vertigo assessment, and voice/throat care.',
    clinicalOverview:
      'Equipped with high-definition video endoscopy and sound-treated audiometry rooms, our ENT specialists diagnose and treat sinus, ear, balance, and sleep-breathing conditions.',
    imageSlotId: 'img_spec_ent',
    servicesOffered: [
      'Diagnostic Nasal & Sinus Endoscopy Consultation',
      'Hearing Loss, Tinnitus & Vertigo Evaluation',
      'Allergic Rhinitis & Sleep Apnea Airway Assessment',
      'Voice, Swallowing & Pediatric ENT Care',
    ],
    conditionsTreated: ['Chronic Sinusitis', 'Allergic Rhinitis', 'Benign Positional Vertigo (BPPV)', 'Otitis Media', 'Tonsillitis'],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-ophthalmology',
    slug: 'ophthalmology',
    name: 'Ophthalmology',
    shortDescription: 'Precision vision diagnostics, glaucoma screening, diabetic retinopathy evaluation, and dry-eye care.',
    clinicalOverview:
      'Our Ophthalmology suite provides non-mydriatic retinal imaging, intraocular pressure tonometry, cataract counseling, and digital eye-strain management.',
    imageSlotId: 'img_spec_ophthalmology',
    servicesOffered: [
      'Comprehensive Slit-Lamp & Visual Acuity Examination',
      'Diabetic & Hypertensive Retinopathy Screening',
      'Glaucoma Intraocular Pressure Monitoring',
      'Ocular Surface & Computer Vision Syndrome Clinic',
    ],
    conditionsTreated: ['Refractive Errors', 'Dry Eye Syndrome', 'Cataract Evaluation', 'Glaucoma Screening', 'Diabetic Retinopathy'],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-dentistry',
    slug: 'dentistry',
    name: 'Preventive & Restorative Dentistry',
    shortDescription: 'Pain-free digital dental diagnostics, periodontal health, and microscope-assisted restorative care.',
    clinicalOverview:
      'Focused on oral-systemic health, our dental sanctuary offers low-radiation digital imaging, periodontal maintenance, and conservative tooth preservation.',
    imageSlotId: 'img_spec_dentistry',
    servicesOffered: [
      'Digital Intraoral Scan & Periodontal Assessment',
      'Preventive Ultrasonic Prophylaxis & Enamel Care',
      'Conservative Endodontic & Restorative Consultations',
      'TMJ & Bite Alignment Evaluation',
    ],
    conditionsTreated: ['Gingivitis & Periodontitis', 'Dental Caries', 'TMJ Jaw Pain', 'Dentin Hypersensitivity'],
    baseConsultationFeeINR: 699,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-diagnostics',
    slug: 'diagnostic-services',
    name: 'Diagnostic Services & Preventive Lab',
    shortDescription: 'Precision clinical pathology, cardiac imaging, ultrasound, and executive preventive checkups.',
    clinicalOverview:
      'Our calm, natural-daylight diagnostic wing eliminates crowded waiting queues through scheduled phlebotomy, high-definition ultrasound, and physician-guided preventive biomarker panels.',
    imageSlotId: 'img_spec_diagnostics',
    servicesOffered: [
      'Comprehensive Metabolic, Lipid & Endocrine Panels',
      '2D Echocardiography, Treadmill Stress Test & ECG',
      'High-Resolution Diagnostic Ultrasound',
      'Executive Full-Body Preventive Health Checkups',
    ],
    conditionsTreated: ['Preventive Risk Screening', 'Pre-Operative Fitness Evaluation', 'Chronic Disease Biomarker Tracking'],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
];

// 4. 8 Clearly Identified Sample Doctor Profiles (Section 7 & 8)
const doctors: Doctor[] = [
  {
    id: 'doc-arvind-krishnamurthy',
    slug: 'dr-arvind-krishnamurthy',
    fullName: 'Dr. Arvind Krishnamurthy',
    professionalTitle: 'Senior Consultant — Preventive & Non-Invasive Cardiology (Sample Profile)',
    specialtyId: 'spec-cardiology',
    specialtyName: 'Cardiology',
    qualifications: ['MBBS', 'MD (Internal Medicine)', 'DM (Cardiology) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi', 'Kannada', 'Tamil'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Cardiology Department. In production, hospital administrators populate verified medical council registration numbers, training fellowships, and clinical publications via the Admin Dashboard.',
    clinicalInterests: [
      'Preventive Lipidology & Early Coronary Risk',
      '2D Doppler Echocardiography',
      'Resistant Hypertension Protocols',
      'Cardiac Rehabilitation',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 999,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Cardiac Wing B, Level 3, Suite 302',
    portraitSlotId: 'portrait_doc_1',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-meera-deshmukh',
    slug: 'dr-meera-deshmukh',
    fullName: 'Dr. Meera Deshmukh',
    professionalTitle: 'Principal Consultant — Internal Medicine & Metabolic Health (Sample Profile)',
    specialtyId: 'spec-general-medicine',
    specialtyName: 'General Medicine',
    qualifications: ['MBBS', 'MD (General Medicine) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi', 'Marathi'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Internal Medicine. Specializes in unhurried adult primary care, cardiometabolic optimization, thyroid disorders, and structured preventive health checkup reviews.',
    clinicalInterests: [
      'Adult Preventive Medicine & Longevity',
      'Type 2 Diabetes Remission & Glycemic Care',
      'Thyroid & Endocrine Balance',
      'Complex Undifferentiated Symptoms',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 499,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Internal Medicine Pavilion A, Level 1, Suite 104',
    portraitSlotId: 'portrait_doc_2',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-vikramaditya-sen',
    slug: 'dr-vikramaditya-sen',
    fullName: 'Dr. Vikramaditya Sen',
    professionalTitle: 'Senior Consultant — Orthopedics & Joint Preservation (Sample Profile)',
    specialtyId: 'spec-orthopedics',
    specialtyName: 'Orthopedics',
    qualifications: ['MBBS', 'MS (Orthopedics) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi', 'Bengali'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Orthopedics. Focuses on conservative knee and shoulder preservation, sports biomechanics, and non-surgical spine rehabilitation protocols.',
    clinicalInterests: [
      'Knee & Shoulder Joint Preservation',
      'Sports Ligament Recovery',
      'Ergonomic Cervical & Lumbar Spine Care',
      'Metabolic Bone Health',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 799,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Motion & Rehabilitation Wing C, Ground Floor',
    portraitSlotId: 'portrait_doc_3',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-nithya-subramanian',
    slug: 'dr-nithya-subramanian',
    fullName: 'Dr. Nithya Subramanian',
    professionalTitle: 'Consultant — Pediatrics & Adolescent Wellness (Sample Profile)',
    specialtyId: 'spec-pediatrics',
    specialtyName: 'Pediatrics',
    qualifications: ['MBBS', 'MD (Pediatrics) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Tamil', 'Hindi', 'Kannada'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Pediatrics. Dedicated to gentle, evidence-based pediatric consultations, developmental screening, childhood nutrition, and parent-centered immunization planning.',
    clinicalInterests: [
      'Newborn & Infant Developmental Tracking',
      'Childhood Immunization & Preventive Care',
      'Pediatric Asthma & Allergy Management',
      'Adolescent Nutrition & Growth',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 599,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Botanical Pediatric Courtyard, Level 1, Suite 112',
    portraitSlotId: 'portrait_doc_4',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-rohan-kulkarni',
    slug: 'dr-rohan-kulkarni',
    fullName: 'Dr. Rohan Kulkarni',
    professionalTitle: 'Senior Consultant — Clinical Neurology (Sample Profile)',
    specialtyId: 'spec-neurology',
    specialtyName: 'Neurology',
    qualifications: ['MBBS', 'MD', 'DM (Neurology) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi', 'Marathi'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Neurology. Evaluates chronic headache syndromes, peripheral neuropathies, vertigo, sleep architecture disorders, and cerebrovascular risk prevention.',
    clinicalInterests: [
      'Refractory Migraine & Headache Disorders',
      'Stroke Prevention & Neuro-Vascular Care',
      'Vertigo & Vestibular Rehabilitation',
      'Memory & Cognitive Health',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 999,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Neuro-Diagnostics Wing B, Level 3, Suite 310',
    portraitSlotId: 'portrait_doc_5',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-aisha-qureshi',
    slug: 'dr-aisha-qureshi',
    fullName: 'Dr. Aisha Qureshi',
    professionalTitle: 'Consultant — Clinical Dermatology & Dermoscopy (Sample Profile)',
    specialtyId: 'spec-dermatology',
    specialtyName: 'Dermatology',
    qualifications: ['MBBS', 'MD (Dermatology, Venereology & Leprosy) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi', 'Urdu'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Dermatology. Emphasizes diagnostic accuracy via optical dermoscopy, skin barrier restoration, eczema/psoriasis care, and clinical trichology.',
    clinicalInterests: [
      'Optical Dermoscopy & Mole Evaluation',
      'Adult & Adolescent Acne Protocols',
      'Atopic Eczema & Barrier Repair',
      'Clinical Scalp & Hair Disorders',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 699,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Alabaster Dermatology Suite, Level 2, Suite 208',
    portraitSlotId: 'portrait_doc_6',
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'doc-kavita-menon',
    slug: 'dr-kavita-menon',
    fullName: 'Dr. Kavita Menon',
    professionalTitle: "Senior Consultant — Women's Healthcare & Gynecology (Sample Profile)",
    specialtyId: 'spec-gynecology',
    specialtyName: "Women's Healthcare & Gynecology",
    qualifications: ['MBBS', 'MS (Obstetrics & Gynecology) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Malayalam', 'Hindi', 'Kannada'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai Women’s Healthcare. Provides respectful, unhurried consultations across PCOS management, preconception counseling, endometriosis, and menopause transition wellness.',
    clinicalInterests: [
      'Integrated PCOS & Endocrine Care',
      'Preconception & Antenatal Guidance',
      'Preventive Cervical & Breast Health Screening',
      'Perimenopause & Midlife Longevity',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'VIDEO', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 799,
      VIDEO: 399,
      FOLLOW_UP: 299,
    },
    campusWing: "Flagship Sanctuary — Women's Sanctuary Pavilion, Level 2, Suite 201",
    portraitSlotId: 'portrait_doc_7',
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'doc-siddharth-verma',
    slug: 'dr-siddharth-verma',
    fullName: 'Dr. Siddharth Verma',
    professionalTitle: 'Consultant — ENT, Sinus & Vertigo Clinic (Sample Profile)',
    specialtyId: 'spec-ent',
    specialtyName: 'ENT (Otorhinolaryngology)',
    qualifications: ['MBBS', 'MS (ENT) — Sample Credential'],
    registrationNumber: null,
    isVerifiedCredentials: false,
    yearsOfExperience: null,
    languagesSpoken: ['English', 'Hindi'],
    biography:
      'Sample Prototype Profile for NovaCraft Orbai ENT Department. Specializes in endoscopic sinus diagnostics, allergic rhinitis management, audiological evaluation, and sleep-disordered breathing.',
    clinicalInterests: [
      'Allergic Rhinitis & Sinus Care',
      'Vertigo & Balance Diagnostics',
      'Audiology & Tinnitus Evaluation',
      'Sleep Apnea Airway Assessment',
    ],
    supportedAppointmentTypes: ['IN_PERSON', 'FOLLOW_UP'],
    feesINR: {
      IN_PERSON: 799,
      FOLLOW_UP: 299,
    },
    campusWing: 'Flagship Sanctuary — Specialist Pavilion A, Level 1, Suite 118',
    portraitSlotId: 'portrait_doc_8',
    isFeatured: false,
    isActive: true,
  },
];

// 5. Rolling 14-Day IST Slot Registry
const DAILY_SLOT_TEMPLATES: Array<{
  code: string;
  startTimeIST: string;
  endTimeIST: string;
  period: 'MORNING' | 'AFTERNOON' | 'EVENING';
}> = [
  { code: '0900', startTimeIST: '09:00 AM', endTimeIST: '09:30 AM', period: 'MORNING' },
  { code: '1000', startTimeIST: '10:00 AM', endTimeIST: '10:30 AM', period: 'MORNING' },
  { code: '1100', startTimeIST: '11:00 AM', endTimeIST: '11:30 AM', period: 'MORNING' },
  { code: '1400', startTimeIST: '02:00 PM', endTimeIST: '02:30 PM', period: 'AFTERNOON' },
  { code: '1530', startTimeIST: '03:30 PM', endTimeIST: '04:00 PM', period: 'AFTERNOON' },
  { code: '1730', startTimeIST: '05:30 PM', endTimeIST: '06:00 PM', period: 'EVENING' },
  { code: '1830', startTimeIST: '06:30 PM', endTimeIST: '07:00 PM', period: 'EVENING' },
];

const slotStore = new Map<string, AppointmentSlot>();

function ensureSlotsForDoctorAndDate(doctorId: string, dateIST: string): AppointmentSlot[] {
  const result: AppointmentSlot[] = [];
  for (let idx = 0; idx < DAILY_SLOT_TEMPLATES.length; idx++) {
    const tpl = DAILY_SLOT_TEMPLATES[idx];
    const slotId = `slot_${doctorId}_${dateIST}_${tpl.code}`;
    let existing = slotStore.get(slotId);
    if (!existing) {
      // Pre-mark 1 deterministic slot per day as BOOKED so users can see disabled/unavailable slot UX immediately
      const hashSeed = (doctorId.length + dateIST.charCodeAt(dateIST.length - 1) + idx) % 7;
      existing = {
        id: slotId,
        doctorId,
        dateIST,
        startTimeIST: tpl.startTimeIST,
        endTimeIST: tpl.endTimeIST,
        period: tpl.period,
        status: hashSeed === 2 ? 'BOOKED' : 'AVAILABLE',
      };
      slotStore.set(slotId, existing);
    }
    result.push(existing);
  }
  return result;
}

function getNextAvailableSlotForDoctor(doctorId: string): { dateIST: string; startTimeIST: string } | undefined {
  const dates = getUpcomingISTDates(7);
  for (const d of dates) {
    const daySlots = ensureSlotsForDoctorAndDate(doctorId, d);
    const open = daySlots.find((s) => s.status === 'AVAILABLE');
    if (open) {
      return { dateIST: open.dateIST, startTimeIST: open.startTimeIST };
    }
  }
  return undefined;
}

// 6. Appointments, Inquiries & Audit Log Store
const appointmentsStore = new Map<string, Appointment>();
const inquiriesStore: ContactInquiry[] = [];
const auditLogsStore: AdminAuditLog[] = [
  {
    id: 'audit-init-001',
    actorRole: 'ROLE_ADMIN',
    action: 'SYSTEM_SEED_INITIALIZED',
    targetEntityId: 'campus-flagship-01',
    summary:
      'Initialized NovaCraft Orbai Flagship Sanctuary with 11 configurable specialties, 8 sample physician profiles, and 9-tier illustrative INR consultation fee schedule.',
    timestampISO: new Date().toISOString(),
  },
];

// Seed 1 sample appointment so the Patient Portal & Admin Dashboard can be inspected immediately
(() => {
  const dates = getUpcomingISTDates(3);
  const tomorrowIST = dates[1] || dates[0];
  const doc = doctors[0];
  const daySlots = ensureSlotsForDoctorAndDate(doc.id, tomorrowIST);
  const targetSlot = daySlots[1];
  targetSlot.status = 'BOOKED';

  const sampleRef = 'NCO-2026-104892';
  const sampleAppointment: Appointment = {
    id: 'apt-sample-104892',
    referenceId: sampleRef,
    doctorId: doc.id,
    doctorSnapshot: {
      fullName: doc.fullName,
      professionalTitle: doc.professionalTitle,
      specialtyName: doc.specialtyName,
      campusWing: doc.campusWing,
      slug: doc.slug,
    },
    specialtyId: doc.specialtyId,
    appointmentType: 'IN_PERSON',
    dateIST: tomorrowIST,
    startTimeIST: targetSlot.startTimeIST,
    endTimeIST: targetSlot.endTimeIST,
    slotId: targetSlot.id,
    patient: {
      fullName: 'Ananya Mehta (Sample Demo Patient)',
      mobileNumber: '9876543210',
      email: 'ananya.demo@example.in',
      ageYears: 34,
      reasonForVisit: 'Annual preventive cardiac & lipid profile review',
    },
    consultationFeeINR: 999,
    currency: 'INR',
    isIllustrativeFee: true,
    paymentMethod: 'PAY_AT_HOSPITAL',
    paymentStatus: 'PAYMENT_PENDING',
    status: 'CONFIRMED',
    notifications: [
      {
        id: 'notif-sample-1',
        channel: 'EMAIL',
        status: 'SKIPPED_NOT_CONFIGURED',
        statusReason:
          'On-screen confirmation pass active. External SMTP/SMS dispatch is skipped until hospital messaging credentials are configured.',
        timestampISO: new Date().toISOString(),
      },
    ],
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
  };
  appointmentsStore.set(sampleRef, sampleAppointment);
})();

function sanitizeString(value: unknown, maxLength = 250): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // --- API ROUTES (/api/v1/*) ---

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      brand: 'NovaCraft Orbai',
      timezone: 'Asia/Kolkata',
      timestampISO: new Date().toISOString(),
    });
  });

  app.get('/api/v1/config/capabilities', (_req: Request, res: Response) => {
    const razorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
    res.json({
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
  });

  app.get('/api/v1/specialties', (_req: Request, res: Response) => {
    res.json({
      items: specialties.filter((s) => s.isEnabled),
      services: medicalServices.filter((m) => m.isAvailable),
    });
  });

  app.get('/api/v1/specialties/:specialtySlug', (req: Request, res: Response) => {
    const slug = sanitizeString(req.params.specialtySlug, 80);
    const specialty = specialties.find((s) => s.slug === slug || s.id === slug);
    if (!specialty) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Medical department '${slug}' was not found at NovaCraft Orbai.`,
        },
      });
      return;
    }
    const departmentDoctors = doctors
      .filter((d) => d.specialtyId === specialty.id && d.isActive)
      .map((d) => ({
        ...d,
        nextAvailableSlot: getNextAvailableSlotForDoctor(d.id),
      }));

    res.json({
      specialty,
      doctors: departmentDoctors,
      services: medicalServices,
    });
  });

  app.get('/api/v1/doctors', (req: Request, res: Response) => {
    const specialtyFilter = sanitizeString(req.query.specialty, 80).toLowerCase();
    const typeFilter = sanitizeString(req.query.type, 40) as AppointmentTypeCode | '';
    const languageFilter = sanitizeString(req.query.language, 40).toLowerCase();
    const searchQuery = sanitizeString(req.query.search, 100).toLowerCase();
    const sortBy = sanitizeString(req.query.sort, 40);

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
      list = list.filter((d) => d.supportedAppointmentTypes.includes(typeFilter as AppointmentTypeCode));
    }

    if (languageFilter && languageFilter !== 'all') {
      list = list.filter((d) => d.languagesSpoken.some((lang) => lang.toLowerCase() === languageFilter));
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
      nextAvailableSlot: getNextAvailableSlotForDoctor(d.id),
    }));

    res.json({
      items: enriched,
      totalCount: enriched.length,
    });
  });

  app.get('/api/v1/doctors/:doctorSlug', (req: Request, res: Response) => {
    const slug = sanitizeString(req.params.doctorSlug, 100);
    const doctor = doctors.find((d) => d.slug === slug || d.id === slug);
    if (!doctor) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Doctor profile '${slug}' was not found.`,
        },
      });
      return;
    }

    const upcomingDatesIST = getUpcomingISTDates(10);
    const slotsByDate: Record<string, AppointmentSlot[]> = {};
    for (const dateStr of upcomingDatesIST) {
      slotsByDate[dateStr] = ensureSlotsForDoctorAndDate(doctor.id, dateStr);
    }

    res.json({
      doctor,
      upcomingDatesIST,
      slotsByDate,
    });
  });

  app.get('/api/v1/slots', (req: Request, res: Response) => {
    const doctorId = sanitizeString(req.query.doctorId, 100);
    const dateIST = sanitizeString(req.query.dateIST, 20) || getUpcomingISTDates(1)[0];

    const doctor = doctors.find((d) => d.id === doctorId || d.slug === doctorId);
    if (!doctor) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Selected doctor was not found when checking slot availability.',
        },
      });
      return;
    }

    const slots = ensureSlotsForDoctorAndDate(doctor.id, dateIST);
    res.json({
      doctorId: doctor.id,
      dateIST,
      timezone: 'Asia/Kolkata',
      slots,
    });
  });

  // Create Appointment with Atomic Slot Locking & Duplicate Prevention
  app.post('/api/v1/appointments', (req: Request, res: Response) => {
    const body = req.body ?? {};
    const doctorId = sanitizeString(body.doctorId, 100);
    const specialtyId = sanitizeString(body.specialtyId, 100);
    const appointmentType = sanitizeString(body.appointmentType, 30) as AppointmentTypeCode;
    const dateIST = sanitizeString(body.dateIST, 20);
    const slotId = sanitizeString(body.slotId, 140);
    const paymentMethod = sanitizeString(body.paymentMethod, 40) as PaymentMethod;

    const patientRaw = body.patient ?? {};
    const fullName = sanitizeString(patientRaw.fullName, 80);
    const mobileClean = sanitizeString(patientRaw.mobileNumber, 20).replace(/[\s\-]/g, '').replace(/^\+91/, '');
    const email = sanitizeString(patientRaw.email, 100);
    const ageYears = Number(patientRaw.ageYears);
    const reasonForVisit = sanitizeString(patientRaw.reasonForVisit, 300);

    const fieldErrors: Record<string, string> = {};
    if (!fullName || fullName.length < 2) {
      fieldErrors.fullName = 'Please enter the patient’s full name (minimum 2 characters).';
    }
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      fieldErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number starting with 6–9.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Please enter a valid email address or leave it blank.';
    }
    if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 120) {
      fieldErrors.ageYears = 'Please enter a valid patient age between 0 and 120 years.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please review and correct the highlighted patient details.',
          fieldErrors,
        },
      });
      return;
    }

    const doctor = doctors.find((d) => d.id === doctorId && d.isActive);
    if (!doctor) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'The selected doctor is no longer available for booking.',
        },
      });
      return;
    }

    if (!doctor.supportedAppointmentTypes.includes(appointmentType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: `${doctor.fullName} does not currently offer ${appointmentType} consultations.`,
        },
      });
      return;
    }

    // Ensure date slots exist, then atomically check and lock target slot
    ensureSlotsForDoctorAndDate(doctor.id, dateIST);
    const slot = slotStore.get(slotId);

    if (!slot || slot.doctorId !== doctor.id || slot.dateIST !== dateIST) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'The requested appointment time slot does not exist.',
        },
      });
      return;
    }

    if (slot.status !== 'AVAILABLE') {
      res.status(409).json({
        error: {
          code: 'SLOT_ALREADY_BOOKED',
          message: `The ${slot.startTimeIST} IST slot on ${dateIST} has already been booked. Please select another available time slot.`,
        },
      });
      return;
    }

    // Atomic lock
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

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_STAFF',
      action: 'APPOINTMENT_CREATED',
      targetEntityId: referenceId,
      summary: `Booked ${appointmentType} slot (${dateIST} ${slot.startTimeIST} IST) with ${doctor.fullName} for ₹${feeINR}.`,
      timestampISO: nowISO,
    });

    res.status(201).json({
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
    });
  });

  app.get('/api/v1/appointments/:referenceId', (req: Request, res: Response) => {
    const ref = sanitizeString(req.params.referenceId, 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `No appointment found with reference number '${ref}'.`,
        },
      });
      return;
    }
    res.json({ appointment });
  });

  // Server-Side HMAC-SHA256 Razorpay Signature Verification
  app.post('/api/v1/payments/razorpay/verify', (req: Request, res: Response) => {
    const { referenceId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body ?? {};
    const appointment = appointmentsStore.get(sanitizeString(referenceId, 40).toUpperCase());

    if (!appointment) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Appointment record not found for payment verification.',
        },
      });
      return;
    }

    if (!RAZORPAY_KEY_SECRET) {
      res.status(503).json({
        error: {
          code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
          message:
            'Server-side Razorpay secret key is not configured. Payment cannot be marked as PAID without server cryptographic verification.',
        },
      });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      appointment.paymentStatus = 'PAYMENT_FAILED';
      appointment.updatedAtISO = new Date().toISOString();
      res.status(400).json({
        error: {
          code: 'SIGNATURE_VERIFICATION_FAILED',
          message: 'Payment signature verification failed. Appointment remains unpaid.',
        },
      });
      return;
    }

    appointment.paymentStatus = 'PAID';
    appointment.razorpayPaymentId = sanitizeString(razorpayPaymentId, 80);
    appointment.updatedAtISO = new Date().toISOString();

    res.json({ appointment });
  });

  // Patient Portal Lookup, Reschedule & Cancel
  app.post('/api/v1/portal/lookup', (req: Request, res: Response) => {
    const mobileOrEmail = sanitizeString(req.body?.mobileOrEmail, 100).toLowerCase();
    const referenceId = sanitizeString(req.body?.referenceId, 40).toUpperCase();

    const cleanDigits = mobileOrEmail.replace(/[\s\-]/g, '').replace(/^\+91/, '');

    const matches = Array.from(appointmentsStore.values()).filter((apt) => {
      const mobileMatch = cleanDigits && apt.patient.mobileNumber === cleanDigits;
      const emailMatch = mobileOrEmail && apt.patient.email?.toLowerCase() === mobileOrEmail;
      const refMatch = referenceId && apt.referenceId === referenceId;
      return mobileMatch || emailMatch || refMatch;
    });

    if (matches.length === 0) {
      res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message:
            'No appointments matched those credentials. Try mobile 9876543210 or reference NCO-2026-104892 to inspect the seeded demo record, or book a new appointment.',
        },
      });
      return;
    }

    const first = matches[0];
    res.json({
      patientSummary: {
        fullName: first.patient.fullName,
        mobileNumber: first.patient.mobileNumber,
        email: first.patient.email,
      },
      appointments: matches.sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO)),
    });
  });

  app.patch('/api/v1/portal/appointments/:referenceId/reschedule', (req: Request, res: Response) => {
    const ref = sanitizeString(req.params.referenceId, 40).toUpperCase();
    const newDateIST = sanitizeString(req.body?.newDateIST, 20);
    const newSlotId = sanitizeString(req.body?.newSlotId, 140);

    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    ensureSlotsForDoctorAndDate(appointment.doctorId, newDateIST);
    const targetSlot = slotStore.get(newSlotId);
    if (!targetSlot || targetSlot.doctorId !== appointment.doctorId) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Target reschedule time slot not found.' },
      });
      return;
    }

    if (targetSlot.status !== 'AVAILABLE') {
      res.status(409).json({
        error: {
          code: 'SLOT_ALREADY_BOOKED',
          message: 'That replacement time slot is already booked. Please select an open slot.',
        },
      });
      return;
    }

    // Release old slot and lock new slot atomically
    const oldSlot = slotStore.get(appointment.slotId);
    if (oldSlot) {
      oldSlot.status = 'AVAILABLE';
    }
    targetSlot.status = 'BOOKED';

    appointment.dateIST = newDateIST;
    appointment.startTimeIST = targetSlot.startTimeIST;
    appointment.endTimeIST = targetSlot.endTimeIST;
    appointment.slotId = targetSlot.id;
    appointment.status = 'RESCHEDULED';
    appointment.updatedAtISO = new Date().toISOString();

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_STAFF',
      action: 'APPOINTMENT_RESCHEDULED',
      targetEntityId: ref,
      summary: `Rescheduled appointment ${ref} to ${newDateIST} at ${targetSlot.startTimeIST} IST.`,
      timestampISO: appointment.updatedAtISO,
    });

    res.json({ appointment });
  });

  app.patch('/api/v1/portal/appointments/:referenceId/cancel', (req: Request, res: Response) => {
    const ref = sanitizeString(req.params.referenceId, 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    const oldSlot = slotStore.get(appointment.slotId);
    if (oldSlot) {
      oldSlot.status = 'AVAILABLE';
    }

    appointment.status = 'CANCELLED_BY_PATIENT';
    if (appointment.paymentStatus === 'PAID') {
      appointment.paymentStatus = 'REFUND_PENDING';
    }
    appointment.updatedAtISO = new Date().toISOString();

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_STAFF',
      action: 'APPOINTMENT_CANCELLED_BY_PATIENT',
      targetEntityId: ref,
      summary: `Patient cancelled appointment ${ref}; slot ${appointment.startTimeIST} on ${appointment.dateIST} released.`,
      timestampISO: appointment.updatedAtISO,
    });

    res.json({ appointment });
  });

  // Contact Inquiry Submission
  app.post('/api/v1/inquiries', (req: Request, res: Response) => {
    const fullName = sanitizeString(req.body?.fullName, 80);
    const mobileNumber = sanitizeString(req.body?.mobileNumber, 20);
    const email = sanitizeString(req.body?.email, 100);
    const department = sanitizeString(req.body?.department, 80) || 'General Inquiry';
    const message = sanitizeString(req.body?.message, 800);

    if (!fullName || !mobileNumber || !message) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide your name, phone number, and message.',
        },
      });
      return;
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

    res.status(201).json({ inquiry });
  });

  // --- STAFF ADMIN DASHBOARD ENDPOINTS (/api/v1/admin/*) ---
  function requireAdminAuth(req: Request, res: Response): boolean {
    const header = req.headers.authorization || '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    if (token !== ADMIN_ACCESS_CODE) {
      res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Valid Staff Admin authorization token is required.',
        },
      });
      return false;
    }
    return true;
  }

  app.post('/api/v1/admin/login', (req: Request, res: Response) => {
    const passcode = sanitizeString(req.body?.passcode, 80);
    if (passcode !== ADMIN_ACCESS_CODE) {
      res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Invalid Staff Admin passcode. (Use ORBAI-ADMIN-2026 in preview environment).',
        },
      });
      return;
    }
    res.json({
      token: ADMIN_ACCESS_CODE,
      role: 'ROLE_ADMIN',
    });
  });

  app.get('/api/v1/admin/overview', (req: Request, res: Response) => {
    if (!requireAdminAuth(req, res)) return;

    const allAppointments = Array.from(appointmentsStore.values()).sort((a, b) =>
      b.createdAtISO.localeCompare(a.createdAtISO)
    );

    res.json({
      metrics: {
        totalAppointments: allAppointments.length,
        confirmedAppointments: allAppointments.filter(
          (a) => a.status === 'CONFIRMED' || a.status === 'RESCHEDULED'
        ).length,
        pendingPayments: allAppointments.filter((a) => a.paymentStatus === 'PAYMENT_PENDING').length,
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
  });

  app.patch('/api/v1/admin/doctors/:doctorId', (req: Request, res: Response) => {
    if (!requireAdminAuth(req, res)) return;
    const doctorId = sanitizeString(req.params.doctorId, 100);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Doctor not found.' },
      });
      return;
    }

    const body = req.body ?? {};
    if (body.feesINR && typeof body.feesINR.IN_PERSON === 'number') {
      doctor.feesINR = {
        IN_PERSON: Math.max(100, Number(body.feesINR.IN_PERSON)),
        VIDEO: body.feesINR.VIDEO !== undefined ? Number(body.feesINR.VIDEO) : doctor.feesINR.VIDEO,
        FOLLOW_UP:
          body.feesINR.FOLLOW_UP !== undefined ? Number(body.feesINR.FOLLOW_UP) : doctor.feesINR.FOLLOW_UP,
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

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_ADMIN',
      action: 'DOCTOR_PROFILE_UPDATED',
      targetEntityId: doctor.id,
      summary: `Updated ${doctor.fullName} (In-Person Fee: ₹${doctor.feesINR.IN_PERSON}, Verified: ${doctor.isVerifiedCredentials}, Active: ${doctor.isActive}).`,
      timestampISO: new Date().toISOString(),
    });

    res.json({ doctor });
  });

  app.patch('/api/v1/admin/appointments/:referenceId', (req: Request, res: Response) => {
    if (!requireAdminAuth(req, res)) return;
    const ref = sanitizeString(req.params.referenceId, 40).toUpperCase();
    const appointment = appointmentsStore.get(ref);
    if (!appointment) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Appointment not found.' },
      });
      return;
    }

    const body = req.body ?? {};
    if (body.paymentStatus) {
      appointment.paymentStatus = body.paymentStatus as PaymentStatus;
    }
    if (body.status) {
      appointment.status = body.status as Appointment['status'];
      if (
        appointment.status === 'CANCELLED_BY_HOSPITAL' ||
        appointment.status === 'CANCELLED_BY_PATIENT'
      ) {
        const slot = slotStore.get(appointment.slotId);
        if (slot) slot.status = 'AVAILABLE';
      }
    }
    appointment.updatedAtISO = new Date().toISOString();

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_ADMIN',
      action: 'APPOINTMENT_ADMIN_UPDATED',
      targetEntityId: ref,
      summary: `Admin updated ${ref} → Status: ${appointment.status}, Payment: ${appointment.paymentStatus}.`,
      timestampISO: appointment.updatedAtISO,
    });

    res.json({ appointment });
  });

  app.patch('/api/v1/admin/settings', (req: Request, res: Response) => {
    if (!requireAdminAuth(req, res)) return;
    const body = req.body ?? {};
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

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      actorRole: 'ROLE_ADMIN',
      action: 'HOSPITAL_SETTINGS_UPDATED',
      targetEntityId: 'hospital-settings',
      summary: `Updated Hospital Settings (Hours: ${hospitalSettings.outpatientHoursIST}, Illustrative Flag: ${hospitalSettings.arePricesIllustrative}).`,
      timestampISO: new Date().toISOString(),
    });

    res.json({ hospitalSettings });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaCraft Orbai server running on http://localhost:${PORT}`);
  });
}

startServer();
