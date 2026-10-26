export interface MedicalVisualAssetSpec {
  slotId: string;
  title: string;
  subtitle: string;
  wingCode: string;
  altText: string;
  themePalette:
    | 'sanctuary'
    | 'cardiac'
    | 'ortho'
    | 'peds'
    | 'neuro'
    | 'derm'
    | 'womens'
    | 'diagnostics'
    | 'portrait';
  accentHex: string;
  secondaryHex: string;
  customImageUrl?: string;
  objectPosition?: string;
}

export const MEDICAL_ASSET_REGISTRY: Record<string, MedicalVisualAssetSpec> = {
  img_hero_sanctuary: {
    slotId: 'img_hero_sanctuary',
    title: 'NovaCraft Orbai Flagship Sanctuary Atrium',
    subtitle: 'Natural Daylight · Travertine & White Oak Architecture',
    wingCode: 'ATRIUM · LEVEL 01',
    altText:
      'Sunlit architectural atrium and patient lounge at NovaCraft Orbai Flagship Sanctuary',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=85',
  },
  img_campus_exterior: {
    slotId: 'img_campus_exterior',
    title: 'NovaCraft Orbai Architectural Facade & Arrival Court',
    subtitle: 'Warm Limestone Louvers & Botanical Courtyard',
    wingCode: 'FLAGSHIP CAMPUS · BENGALURU',
    altText:
      'Exterior architectural view of the NovaCraft Orbai hospital campus with glass facade and greenery',
    themePalette: 'sanctuary',
    accentHex: '#166154',
    secondaryHex: '#D4B475',
    customImageUrl:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=85',
  },
  img_campus_interior: {
    slotId: 'img_campus_interior',
    title: 'Outpatient Gallery & Acoustic Timber Corridor',
    subtitle: 'Quiet Sanctuary Acoustics · Indirect Cove Illumination',
    wingCode: 'PAVILION A · LEVEL 02',
    altText:
      'Modern private hospital interior gallery with clean architectural surfaces and natural daylight',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#A3803E',
    customImageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85',
  },
  img_medical_team: {
    slotId: 'img_medical_team',
    title: 'NovaCraft Orbai Senior Clinical Council',
    subtitle: 'Multi-Disciplinary Departmental Leadership',
    wingCode: 'CLINICAL GOVERNANCE BOARD',
    altText:
      'Senior medical specialists and department heads collaborating at NovaCraft Orbai',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_general_med: {
    slotId: 'img_spec_general_med',
    title: 'Internal Medicine & Metabolic Longevity Suite',
    subtitle: 'Unhurried Primary & Preventive Consultations',
    wingCode: 'PAVILION A · SUITE 104',
    altText:
      'Internal medicine physician conducting a calm, thorough patient consultation in a sunlit clinical suite',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_cardiology: {
    slotId: 'img_spec_cardiology',
    title: 'Preventive Cardiology & Non-Invasive Echo Suite',
    subtitle: '2D Doppler Echocardiography & Vascular Diagnostics',
    wingCode: 'CARDIAC WING B · LEVEL 03',
    altText:
      'Advanced non-invasive cardiology consultation and cardiac monitoring suite',
    themePalette: 'cardiac',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_orthopedics: {
    slotId: 'img_spec_orthopedics',
    title: 'Orthopedics, Spine & Biomechanical Motion Studio',
    subtitle: 'Joint Preservation & Sports Recovery',
    wingCode: 'MOTION WING C · GROUND FLOOR',
    altText:
      'Modern orthopedics consultation and musculoskeletal rehabilitation studio',
    themePalette: 'ortho',
    accentHex: '#166154',
    secondaryHex: '#8C6B2B',
    customImageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_pediatrics: {
    slotId: 'img_spec_pediatrics',
    title: 'Botanical Pediatric & Adolescent Wellness Suite',
    subtitle: 'Calm Daylight Architecture for Children & Families',
    wingCode: 'PEDIATRIC COURTYARD · SUITE 112',
    altText:
      'Warm, child-friendly pediatric consultation with a specialist physician examining a young patient',
    themePalette: 'peds',
    accentHex: '#277B6C',
    secondaryHex: '#D4B475',
    customImageUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_neurology: {
    slotId: 'img_spec_neurology',
    title: 'Clinical Neurology & Neuro-Vascular Suite',
    subtitle: 'Migraine, Sleep Architecture & Cognitive Care',
    wingCode: 'NEURO WING B · SUITE 310',
    altText:
      'High-precision neurology consultation and neuroimaging diagnostic workstation',
    themePalette: 'neuro',
    accentHex: '#0A3A31',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_dermatology: {
    slotId: 'img_spec_dermatology',
    title: 'Clinical Dermatology & Optical Dermoscopy Suite',
    subtitle: 'Diffused Daylight Skin & Scalp Diagnostics',
    wingCode: 'ALABASTER SUITE · LEVEL 02',
    altText:
      'Clinical dermatology consultation room with precision optical dermoscopy lighting',
    themePalette: 'derm',
    accentHex: '#166154',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_womens_health: {
    slotId: 'img_spec_womens_health',
    title: "Women's Healthcare & Maternal Sanctuary",
    subtitle: 'Private, Dignified Gynecological & Hormonal Care',
    wingCode: 'SANCTUARY PAVILION · LEVEL 02',
    altText:
      "Private and serene women's healthcare consultation suite with specialist physician",
    themePalette: 'womens',
    accentHex: '#0D4A3E',
    secondaryHex: '#D4B475',
    customImageUrl:
      'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_ent: {
    slotId: 'img_spec_ent',
    title: 'ENT, Sinus Endoscopy & Audiology Suite',
    subtitle: 'High-Definition Otoscopy, Sinus & Balance Care',
    wingCode: 'SPECIALIST PAVILION A · SUITE 118',
    altText:
      'ENT specialist conducting an ear, nose, and throat clinical evaluation in a modern outpatient room',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_ophthalmology: {
    slotId: 'img_spec_ophthalmology',
    title: 'Precision Ophthalmology & Retinal Imaging Suite',
    subtitle: 'Slit-Lamp Biomicroscopy & Glaucoma Screening',
    wingCode: 'VISION WING B · LEVEL 02',
    altText:
      'Ophthalmology suite equipped with modern optical slit-lamp and retinal diagnostic instruments',
    themePalette: 'diagnostics',
    accentHex: '#0D4A3E',
    secondaryHex: '#4E9A8B',
    customImageUrl:
      'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_dentistry: {
    slotId: 'img_spec_dentistry',
    title: 'Preventive & Restorative Dental Sanctuary',
    subtitle: 'Digital Intraoral Diagnostics & Microscope Dentistry',
    wingCode: 'DENTAL SUITE · LEVEL 02',
    altText:
      'Bright, modern dental treatment suite with ergonomic chair and digital dental equipment',
    themePalette: 'sanctuary',
    accentHex: '#166154',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=85',
  },
  img_spec_diagnostics: {
    slotId: 'img_spec_diagnostics',
    title: 'Ambient-Lit Precision Diagnostic & Imaging Wing',
    subtitle: 'Pathology, Ultrasound, Echo & Biomarker Panels',
    wingCode: 'DIAGNOSTICS · LOWER ATRIUM',
    altText:
      'Modern wide-bore ambient-lit diagnostic imaging and clinical pathology laboratory',
    themePalette: 'diagnostics',
    accentHex: '#0D4A3E',
    secondaryHex: '#4E9A8B',
    customImageUrl:
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=85',
  },
  img_service_preventive: {
    slotId: 'img_service_preventive',
    title: 'Executive Preventive Health & Longevity Lounge',
    subtitle: 'Private Suite for Comprehensive Annual Screenings',
    wingCode: 'PREVENTIVE WING · LEVEL 03',
    altText:
      'Physician reviewing comprehensive preventive health screening results with a patient',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=85',
  },
  img_consultation_env: {
    slotId: 'img_consultation_env',
    title: 'Eye-Level Physician Consultation Environment',
    subtitle: 'Designed for Unhurried Clinical Conversation',
    wingCode: 'CONSULTATION CHAMBERS',
    altText:
      'Warm, sunlit doctor consultation chamber inside a NovaCraft Orbai clinical suite',
    themePalette: 'sanctuary',
    accentHex: '#166154',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=85',
  },
  img_waiting_lounge: {
    slotId: 'img_waiting_lounge',
    title: 'Botanical Skylight Waiting Sanctuary',
    subtitle: 'Spaced Acoustic Seating & Zero-Queue Check-In',
    wingCode: 'MAIN SANCTUARY LOUNGE',
    altText:
      'Serene hospital reception and waiting lounge with natural daylight and architectural seating',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#D4B475',
    customImageUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=85',
  },
  img_care_concierge: {
    slotId: 'img_care_concierge',
    title: 'Patient Care Concierge & Language Support Desk',
    subtitle: 'Dedicated Assistance from Arrival to Follow-Up',
    wingCode: 'CONCIERGE DESK · ATRIUM',
    altText:
      'NovaCraft Orbai patient care concierge desk and reception team in the main lobby',
    themePalette: 'sanctuary',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=85',
  },

  /* Doctor Portrait Slots (8 Distinct Specialist Portraits) */
  portrait_doc_1: {
    slotId: 'portrait_doc_1',
    title: 'Dr. Arvind Krishnamurthy',
    subtitle: 'Senior Consultant — Preventive & Non-Invasive Cardiology',
    wingCode: 'CARDIAC WING B',
    altText:
      'Portrait of Dr. Arvind Krishnamurthy, Senior Consultant Cardiologist in clinical white coat with stethoscope',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_2: {
    slotId: 'portrait_doc_2',
    title: 'Dr. Meera Deshmukh',
    subtitle: 'Principal Consultant — Internal Medicine & Metabolic Health',
    wingCode: 'PAVILION A · SUITE 104',
    altText:
      'Portrait of Dr. Meera Deshmukh, Principal Consultant in General & Internal Medicine',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_3: {
    slotId: 'portrait_doc_3',
    title: 'Dr. Vikramaditya Sen',
    subtitle: 'Senior Consultant — Orthopedics & Joint Preservation',
    wingCode: 'MOTION WING C',
    altText:
      'Portrait of Dr. Vikramaditya Sen, Senior Consultant Orthopedic Specialist',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_4: {
    slotId: 'portrait_doc_4',
    title: 'Dr. Nithya Subramanian',
    subtitle: 'Consultant — Pediatrics & Adolescent Wellness',
    wingCode: 'PEDIATRIC COURTYARD',
    altText:
      'Portrait of Dr. Nithya Subramanian, Consultant Pediatrician at NovaCraft Orbai',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_5: {
    slotId: 'portrait_doc_5',
    title: 'Dr. Rohan Kulkarni',
    subtitle: 'Senior Consultant — Clinical Neurology',
    wingCode: 'NEURO WING B',
    altText:
      'Portrait of Dr. Rohan Kulkarni, Senior Consultant Neurologist',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_6: {
    slotId: 'portrait_doc_6',
    title: 'Dr. Aisha Qureshi',
    subtitle: 'Consultant — Clinical Dermatology & Dermoscopy',
    wingCode: 'ALABASTER SUITE',
    altText:
      'Portrait of Dr. Aisha Qureshi, Consultant Dermatologist',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_7: {
    slotId: 'portrait_doc_7',
    title: 'Dr. Kavita Menon',
    subtitle: "Senior Consultant — Women's Healthcare & Gynecology",
    wingCode: 'SANCTUARY PAVILION',
    altText:
      "Portrait of Dr. Kavita Menon, Senior Consultant in Women's Healthcare and Gynecology",
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
  portrait_doc_8: {
    slotId: 'portrait_doc_8',
    title: 'Dr. Siddharth Verma',
    subtitle: 'Consultant — ENT, Sinus & Vertigo Clinic',
    wingCode: 'SPECIALIST PAVILION A',
    altText:
      'Portrait of Dr. Siddharth Verma, Consultant ENT Specialist',
    themePalette: 'portrait',
    accentHex: '#0D4A3E',
    secondaryHex: '#C5A059',
    customImageUrl:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=85',
    objectPosition: 'center top',
  },
};
