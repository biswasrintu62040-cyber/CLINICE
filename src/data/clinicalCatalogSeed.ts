import type {
  AdminAuditLog,
  Appointment,
  AppointmentSlot,
  Doctor,
  HospitalSettings,
  MedicalServiceItem,
  Specialty,
} from '../types/domain.types';

export function getUpcomingISTDates(daysCount = 14): string[] {
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

export const INITIAL_HOSPITAL_SETTINGS: HospitalSettings = {
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

export const INITIAL_MEDICAL_SERVICES: MedicalServiceItem[] = [
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

export const INITIAL_SPECIALTIES: Specialty[] = [
  {
    id: 'spec-general-medicine',
    slug: 'general-medicine',
    name: 'General Medicine',
    shortDescription:
      'Primary internal medicine, metabolic health, febrile illness, and longitudinal preventive care.',
    clinicalOverview:
      'The Department of General & Internal Medicine serves as the clinical anchor of NovaCraft Orbai. Physicians coordinate multi-system diagnostics, hypertension and diabetes optimization, adult immunizations, and comprehensive preventive checkups.',
    imageSlotId: 'img_spec_general_med',
    servicesOffered: [
      'Comprehensive Adult Physical & Metabolic Evaluation',
      'Diabetes, Thyroid & Hypertension Management',
      'Infectious & Febrile Illness Diagnostics',
      'Preventive Health & Biomarker Interpretation',
    ],
    conditionsTreated: [
      'Type 2 Diabetes',
      'Essential Hypertension',
      'Thyroid Disorders',
      'Seasonal Viral Syndromes',
      'Metabolic Syndrome',
    ],
    baseConsultationFeeINR: 499,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-cardiology',
    slug: 'cardiology',
    name: 'Cardiology',
    shortDescription:
      'Preventive cardiology, heart rhythm diagnostics, echocardiography, and vascular risk management.',
    clinicalOverview:
      'Our Cardiology Sanctuary combines calm, unhurried clinical consultations with non-invasive cardiac imaging—including 12-lead digital ECG, 2D Doppler Echocardiography, ambulatory Holter monitoring, and lipidology.',
    imageSlotId: 'img_spec_cardiology',
    servicesOffered: [
      'Preventive Cardiac Risk & Lipid Consultation',
      'Resting ECG & 2D Doppler Echocardiography Review',
      'Hypertension & Heart Failure Outpatient Optimization',
      'Post-Intervention Cardiac Rehabilitation Planning',
    ],
    conditionsTreated: [
      'Coronary Artery Disease',
      'Arrhythmias',
      'Hypertensive Heart Disease',
      'Dyslipidemia',
      'Valvular Heart Conditions',
    ],
    baseConsultationFeeINR: 999,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-orthopedics',
    slug: 'orthopedics',
    name: 'Orthopedics',
    shortDescription:
      'Joint preservation, spine care, sports medicine, and evidence-based musculoskeletal rehabilitation.',
    clinicalOverview:
      'The Orthopedics & Motion Science wing focuses on conservative joint preservation, sports trauma recovery, ergonomic spine care, and structured physiotherapy guidance.',
    imageSlotId: 'img_spec_orthopedics',
    servicesOffered: [
      'Knee, Hip & Shoulder Joint Preservation Consultations',
      'Cervical & Lumbar Spine Biomechanical Assessment',
      'Sports Ligament & Tendon Injury Rehabilitation',
      'Bone Mineral Density & Osteoporosis Management',
    ],
    conditionsTreated: [
      'Osteoarthritis',
      'Lumbar Disc Prolapse',
      'Rotator Cuff Tendinopathy',
      'ACL/Meniscal Sprains',
      'Osteopenia',
    ],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-pediatrics',
    slug: 'pediatrics',
    name: 'Pediatrics',
    shortDescription:
      'Compassionate newborn, infant, child, and adolescent medical care in a calm environment.',
    clinicalOverview:
      'Designed with natural timber textures and daylight to put children at ease, our Pediatrics department delivers developmental milestone tracking, IAP-aligned vaccination schedules, and acute pediatric care.',
    imageSlotId: 'img_spec_pediatrics',
    servicesOffered: [
      'Well-Baby & Developmental Milestone Assessments',
      'Childhood & Adolescent Immunization Guidance',
      'Pediatric Nutrition, Growth & Allergy Consultations',
      'Acute Respiratory & Childhood Fever Care',
    ],
    conditionsTreated: [
      'Childhood Asthma & Allergies',
      'Nutritional Deficiencies',
      'Growth Delays',
      'Pediatric Viral Illnesses',
    ],
    baseConsultationFeeINR: 599,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-neurology',
    slug: 'neurology',
    name: 'Neurology',
    shortDescription:
      'Specialized care for migraine, peripheral neuropathy, sleep disorders, stroke prevention, and memory.',
    clinicalOverview:
      'The Department of Neurology provides methodical, unhurried diagnostic evaluations for complex headache syndromes, seizure management, movement disorders, and cognitive health.',
    imageSlotId: 'img_spec_neurology',
    servicesOffered: [
      'Chronic Migraine & Headache Clinic',
      'Stroke Risk Stratification & Neuro-Vascular Follow-Up',
      'Peripheral Neuropathy & Nerve Conduction Review',
      'Memory, Sleep & Cognitive Longevity Evaluation',
    ],
    conditionsTreated: [
      'Migraine & Cluster Headaches',
      'Epilepsy',
      'Diabetic Neuropathy',
      'Vertigo & Balance Disorders',
      'Early Cognitive Decline',
    ],
    baseConsultationFeeINR: 999,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-dermatology',
    slug: 'dermatology',
    name: 'Dermatology',
    shortDescription:
      'Medical dermatology, optical mole mapping, pediatric skin conditions, and hair/scalp therapeutics.',
    clinicalOverview:
      'Our Dermatology suite prioritizes evidence-based medical skin and hair diagnostics using polarized optical dermoscopy, patch testing, and barrier-repair dermatological protocols.',
    imageSlotId: 'img_spec_dermatology',
    servicesOffered: [
      'Digital Optical Dermoscopy & Mole Evaluation',
      'Acne, Rosacea & Pigmentary Disorder Management',
      'Eczema, Psoriasis & Autoimmune Skin Care',
      'Clinical Trichology & Scalp Health Assessment',
    ],
    conditionsTreated: [
      'Atopic Dermatitis',
      'Chronic Acne Vulgaris',
      'Psoriasis',
      'Androgenetic & Telogen Alopecia',
      'Melasma',
    ],
    baseConsultationFeeINR: 699,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-gynecology',
    slug: 'gynecology',
    name: "Women's Healthcare & Gynecology",
    shortDescription:
      'Private, dignified care across reproductive health, prenatal guidance, PCOS, and menopause wellness.',
    clinicalOverview:
      'Built around privacy, dignity, and clinical excellence, the Women’s Healthcare sanctuary offers comprehensive gynecological consultations, PCOS metabolic care, preconception counseling, and midlife hormonal health.',
    imageSlotId: 'img_spec_womens_health',
    servicesOffered: [
      'Well-Woman Preventive Screening & Cervical Health',
      'PCOS, Endometriosis & Menstrual Health Clinic',
      'Preconception & Antenatal Outpatient Counseling',
      'Perimenopause & Bone/Metabolic Longevity Care',
    ],
    conditionsTreated: [
      'Polycystic Ovary Syndrome (PCOS)',
      'Endometriosis',
      'Uterine Fibroids',
      'Perimenopausal Symptoms',
    ],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-ent',
    slug: 'ent',
    name: 'ENT (Otorhinolaryngology)',
    shortDescription:
      'Endoscopic sinus evaluation, audiology, vertigo assessment, and voice/throat care.',
    clinicalOverview:
      'Equipped with high-definition video endoscopy and sound-treated audiometry rooms, our ENT specialists diagnose and treat sinus, ear, balance, and sleep-breathing conditions.',
    imageSlotId: 'img_spec_ent',
    servicesOffered: [
      'Diagnostic Nasal & Sinus Endoscopy Consultation',
      'Hearing Loss, Tinnitus & Vertigo Evaluation',
      'Allergic Rhinitis & Sleep Apnea Airway Assessment',
      'Voice, Swallowing & Pediatric ENT Care',
    ],
    conditionsTreated: [
      'Chronic Sinusitis',
      'Allergic Rhinitis',
      'Benign Positional Vertigo (BPPV)',
      'Otitis Media',
      'Tonsillitis',
    ],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-ophthalmology',
    slug: 'ophthalmology',
    name: 'Ophthalmology',
    shortDescription:
      'Precision vision diagnostics, glaucoma screening, diabetic retinopathy evaluation, and dry-eye care.',
    clinicalOverview:
      'Our Ophthalmology suite provides non-mydriatic retinal imaging, intraocular pressure tonometry, cataract counseling, and digital eye-strain management.',
    imageSlotId: 'img_spec_ophthalmology',
    servicesOffered: [
      'Comprehensive Slit-Lamp & Visual Acuity Examination',
      'Diabetic & Hypertensive Retinopathy Screening',
      'Glaucoma Intraocular Pressure Monitoring',
      'Ocular Surface & Computer Vision Syndrome Clinic',
    ],
    conditionsTreated: [
      'Refractive Errors',
      'Dry Eye Syndrome',
      'Cataract Evaluation',
      'Glaucoma Screening',
      'Diabetic Retinopathy',
    ],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-dentistry',
    slug: 'dentistry',
    name: 'Preventive & Restorative Dentistry',
    shortDescription:
      'Pain-free digital dental diagnostics, periodontal health, and microscope-assisted restorative care.',
    clinicalOverview:
      'Focused on oral-systemic health, our dental sanctuary offers low-radiation digital imaging, periodontal maintenance, and conservative tooth preservation.',
    imageSlotId: 'img_spec_dentistry',
    servicesOffered: [
      'Digital Intraoral Scan & Periodontal Assessment',
      'Preventive Ultrasonic Prophylaxis & Enamel Care',
      'Conservative Endodontic & Restorative Consultations',
      'TMJ & Bite Alignment Evaluation',
    ],
    conditionsTreated: [
      'Gingivitis & Periodontitis',
      'Dental Caries',
      'TMJ Jaw Pain',
      'Dentin Hypersensitivity',
    ],
    baseConsultationFeeINR: 699,
    isEnabled: true,
    isSampleData: true,
  },
  {
    id: 'spec-diagnostics',
    slug: 'diagnostic-services',
    name: 'Diagnostic Services & Preventive Lab',
    shortDescription:
      'Precision clinical pathology, cardiac imaging, ultrasound, and executive preventive checkups.',
    clinicalOverview:
      'Our calm, natural-daylight diagnostic wing eliminates crowded waiting queues through scheduled phlebotomy, high-definition ultrasound, and physician-guided preventive biomarker panels.',
    imageSlotId: 'img_spec_diagnostics',
    servicesOffered: [
      'Comprehensive Metabolic, Lipid & Endocrine Panels',
      '2D Echocardiography, Treadmill Stress Test & ECG',
      'High-Resolution Diagnostic Ultrasound',
      'Executive Full-Body Preventive Health Checkups',
    ],
    conditionsTreated: [
      'Preventive Risk Screening',
      'Pre-Operative Fitness Evaluation',
      'Chronic Disease Biomarker Tracking',
    ],
    baseConsultationFeeINR: 799,
    isEnabled: true,
    isSampleData: true,
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
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

export const DAILY_SLOT_TEMPLATES: Array<{
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

export function buildDeterministicSlotsForDoctorAndDate(
  doctorId: string,
  dateIST: string,
  bookedSlotIds: Set<string> = new Set()
): AppointmentSlot[] {
  const dates = getUpcomingISTDates(3);
  const tomorrowIST = dates[1] || dates[0];
  const sampleBookedSlotId = `slot_${INITIAL_DOCTORS[0].id}_${tomorrowIST}_1000`;

  return DAILY_SLOT_TEMPLATES.map((tpl, idx) => {
    const slotId = `slot_${doctorId}_${dateIST}_${tpl.code}`;
    const hashSeed = (doctorId.length + dateIST.charCodeAt(dateIST.length - 1) + idx) % 7;
    const isBooked =
      bookedSlotIds.has(slotId) || slotId === sampleBookedSlotId || hashSeed === 2;
    return {
      id: slotId,
      doctorId,
      dateIST,
      startTimeIST: tpl.startTimeIST,
      endTimeIST: tpl.endTimeIST,
      period: tpl.period,
      status: isBooked ? 'BOOKED' : 'AVAILABLE',
    };
  });
}

export function getSeedNextAvailableSlotForDoctor(
  doctorId: string,
  bookedSlotIds: Set<string> = new Set()
): { dateIST: string; startTimeIST: string } | undefined {
  const dates = getUpcomingISTDates(7);
  for (const d of dates) {
    const daySlots = buildDeterministicSlotsForDoctorAndDate(doctorId, d, bookedSlotIds);
    const open = daySlots.find((s) => s.status === 'AVAILABLE');
    if (open) {
      return { dateIST: open.dateIST, startTimeIST: open.startTimeIST };
    }
  }
  return undefined;
}

export function createSeedSampleAppointment(): Appointment {
  const dates = getUpcomingISTDates(3);
  const tomorrowIST = dates[1] || dates[0];
  const doc = INITIAL_DOCTORS[0];
  const slotId = `slot_${doc.id}_${tomorrowIST}_1000`;
  const nowISO = new Date().toISOString();

  return {
    id: 'apt-sample-104892',
    referenceId: 'NCO-2026-104892',
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
    startTimeIST: '10:00 AM',
    endTimeIST: '10:30 AM',
    slotId,
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
        timestampISO: nowISO,
      },
    ],
    createdAtISO: nowISO,
    updatedAtISO: nowISO,
  };
}

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
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
