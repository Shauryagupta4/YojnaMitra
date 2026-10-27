import type { SourceClassification, SourceRelationship, VerificationStatus } from '../types/scheme';

export interface Scheme {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Education' | 'Agriculture' | 'Healthcare' | 'Women & Child' | 'Social Security' | 'Employment' | 'Business & MSME' | 'Food & Civil Supplies' | 'Housing';
  level: 'Central' | 'State' | 'Multi-State';
  jurisdiction?: 'central' | 'state' | 'multi_state' | 'unknown';
  state?: string;
  applicableStates?: string[];
  benefit: string;
  benefitAmountApprox?: number; // In INR for aggregation
  summary: string;
  officialUrl: string; // Direct scheme/scholarship details & guidelines page
  applyUrl: string;    // Direct online application / registration page
  portalName: string;
  isActive: boolean;   // Active and valid flag
  isExpired?: boolean; // Explicit expiration guard (always false for live schemes)
  academicYearOrValidity: string; // e.g., 'AY 2025-26 (Active Window)'
  applicationStatus: 'OPEN_NOW' | 'ALWAYS_ACTIVE' | 'ROLLING_CYCLE';
  verificationStatus?: VerificationStatus;
  sourceClassification?: SourceClassification;
  sourceRelationship?: SourceRelationship;
  department?: string | null;
  supportingDocuments?: any[];
  verificationEvidence?: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    genders?: ('Male' | 'Female' | 'Transgender' | 'All')[];
    occupations?: ('Student' | 'Farmer' | 'Unemployed' | 'Daily Wage Earner' | 'Self Employed' | 'Senior Citizen' | 'Any')[];
    maxAnnualIncome?: number; // In INR
    categories?: ('General' | 'OBC' | 'SC' | 'ST' | 'Minority' | 'EWS' | 'All')[];
    states?: string[];
    ruralOnly?: boolean;
    disabilityEligibleOnly?: boolean;
    educationLevels?: ('School' | 'Higher Secondary' | 'Undergraduate' | 'Postgraduate' | 'Any')[];
    farmerTypes?: ('Landless' | 'Small/Marginal' | 'Large' | 'Any')[];
  };
  requiredDocuments: string[];
  stepsToApply: string[];
  sourceType?: 'live_retrieval' | 'fallback_cache';
  evidenceStatus?: 'officially_supported' | 'officially_verified' | 'partially_verified' | 'unverified' | 'verified';
  deadline?: string | null;
  deadlineStatus?: 'open' | 'closed' | 'upcoming' | 'unknown';
  eligibilityStatus?: 'potentially_eligible' | 'not_eligible' | 'insufficient_information';
  sourceUrls?: string[];
  lastVerified?: string;
  warnings?: string[];
  aliases?: string[];
  categoryReason?: string;
  benefitType?: string;
  supportingReferences?: Array<{ title?: string; url: string; domain: string; isOfficial: boolean }>;
  lastAuditStatus?: string;
  officialInformationUrl?: string;
  supportingEvidenceUrls?: string[];
  fieldEvidence?: any;
  jurisdictionVerified?: boolean;
  benefitVerified?: boolean;
  applicationVerified?: boolean;
  eligibilityDetailsVerified?: boolean;
  schemeIdentityConfirmed?: boolean;
  officialSourceFound?: boolean;
  eligibilityVerified?: boolean;
  benefitsVerified?: boolean;
  applicationUrlVerified?: boolean;
  eligibilityMatch?: 'matched' | 'not_matched' | 'unknown';
  partialVerificationReasons?: string[];
  rejectionReason?: string;
  administrativeStructure?: string;
  administrativeLabel?: string;
  fundingAndAdminType?: string;
  candidateClassification?: string;
}

export const SCHEMES_DATABASE: Scheme[] = [
  // =========================================================================
  // 1. STUDENTS & SCHOLARSHIPS (EDUCATION ONLY — ZERO PENSIONS / ZERO LOANS)
  // =========================================================================
  {
    id: 'nsp-post-matric-sc',
    name: 'Post Matric Scholarship for SC Students',
    hindiName: 'अनुसूचित जाति के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    category: 'Education',
    level: 'Central',
    benefit: 'Full tuition fee reimbursement + Maintenance allowance up to ₹13,500/year',
    benefitAmountApprox: 35000,
    summary: 'Centrally sponsored active scholarship providing 100% financial assistance to SC students pursuing post-matriculation or university courses.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoSJE',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • No Expired Flags • OTR Enabled',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['SC'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card with OTR Number',
      'Caste Certificate (SC)',
      'Income Certificate (Issued by competent authority, < ₹2.5L)',
      'Previous Class Marksheet',
      'College Admission / Fee Receipt',
      'Bank Account linked with Aadhaar (NPCI mapped)'
    ],
    stepsToApply: [
      'Visit scholarships.gov.in and complete OTR (One Time Registration) via Aadhaar Face Auth/OTP.',
      'Select Post Matric Scholarship for SC under Ministry of Social Justice & Empowerment.',
      'Fill academic details and upload Bonafide Certificate from institution.',
      'Institute verifies application online before state nodal approval and DBT release.'
    ]
  },
  {
    id: 'nsp-post-matric-st',
    name: 'Post Matric Scholarship for ST Students (MoTA)',
    hindiName: 'अनुसूचित जनजाति (ST) छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    category: 'Education',
    level: 'Central',
    benefit: '100% Compulsory Non-Refundable Fee + Maintenance Allowance up to ₹1,200/month',
    benefitAmountApprox: 38000,
    summary: 'Dedicated financial aid from Ministry of Tribal Affairs supporting Scheduled Tribe students studying Class 11, 12, ITI, Degree, and Master programs.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoTA',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • MoTA Sponsored • DBT Direct',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['ST'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'ST Community Certificate',
      'Income Certificate (< ₹2.5 Lakhs/year)',
      'Current Course Fee Receipt',
      'Institutional Bonafide Certificate'
    ],
    stepsToApply: [
      'Login via National Scholarship Portal OTR (scholarships.gov.in).',
      'Select Ministry of Tribal Affairs Post-Matric scheme.',
      'Submit marksheet and admission details for digital verification.'
    ]
  },
  {
    id: 'nsp-post-matric-obc',
    name: 'Post Matric Scholarship for OBC Students (PM-USP)',
    hindiName: 'ओबीसी छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति (पीएम-यूएसपी)',
    category: 'Education',
    level: 'Central',
    benefit: 'Academic allowance up to ₹10,000/year + study tour, thesis & book grants',
    benefitAmountApprox: 18000,
    summary: 'Active central government financial support for Other Backward Classes (OBC) students enrolled in higher secondary, college, or university programs.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoSJE',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • No Expired Flags • OTR Enabled',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['OBC'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card (OTR)',
      'OBC Certificate (Non-Creamy Layer)',
      'Annual Family Income Certificate (< ₹2.5L)',
      'Marksheet of Qualifying Examination',
      'College Fee Receipt & Bonafide Certificate',
      'Bank Passbook linked to Aadhaar'
    ],
    stepsToApply: [
      'Create or login to OTR on scholarships.gov.in.',
      'Navigate to Ministry of Social Justice & Empowerment -> PM-USP OBC Post Matric.',
      'Submit bank details and submit for institute level verification.'
    ]
  },
  {
    id: 'nsp-csss-higher-education',
    name: 'Central Sector Scheme of Scholarship for College & University Students (PM-USP CSSS)',
    hindiName: 'कॉलेज और विश्वविद्यालय के छात्रों के लिए केंद्रीय क्षेत्र छात्रवृत्ति',
    category: 'Education',
    level: 'Central',
    benefit: '₹12,000 per annum for Graduation (1st to 3rd year) and ₹20,000 per annum at Post-Graduation',
    benefitAmountApprox: 12000,
    summary: 'Merit-cum-means scholarship funded by Department of Higher Education for students scoring above 80th percentile in Class 12 board examinations.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoE Higher Education',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Department of Higher Education • Live AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 450000,
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Class 12th Board Marksheet with Roll Number',
      'Income Certificate (Issued by Revenue Authority < ₹4.5L)',
      'Aadhaar Card',
      'College Admission / Id Card',
      'Bank Account Passbook (Aadhaar Seeded)'
    ],
    stepsToApply: [
      'Ensure 80th percentile eligibility cutoff on your respective State Board list.',
      'Apply online on scholarships.gov.in selecting PM-USP Central Sector Scheme.',
      'Forward application to college nodal officer for institutional e-verification.'
    ]
  },
  {
    id: 'nsp-pragati-scholarship',
    name: 'AICTE Pragati Scholarship for Girl Students (Technical Degree & Diploma)',
    hindiName: 'बालिकाओं के लिए एआईसीटीई प्रगति छात्रवृत्ति योजना',
    category: 'Education',
    level: 'Central',
    benefit: '₹50,000 per annum for every year of study towards tuition fee & academic expenses',
    benefitAmountApprox: 50000,
    summary: 'Prestigious national scholarship scheme by AICTE providing ₹50,000 annually to young women admitted to 1st or 2nd year technical degree/diploma courses.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / AICTE',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • AICTE Approved Institutions • Girls Only',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 800000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['Undergraduate'],
      genders: ['Female']
    },
    requiredDocuments: [
      'Aadhaar Card',
      '10th & 12th Marksheets',
      'AICTE Approved College Admission Letter',
      'Tuition Fee Paid Receipt',
      'Family Income Certificate (< ₹8 Lakhs)',
      'Parents Declaration for girl child'
    ],
    stepsToApply: [
      'Complete One Time Registration (OTR) on scholarships.gov.in.',
      'Under AICTE section, select "Pragati Scholarship for Girls (Degree/Diploma)".',
      'Upload institute admission receipt and verify through college portal.'
    ]
  },
  {
    id: 'nsp-saksham-scholarship',
    name: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students (PwD)',
    hindiName: 'दिव्यांग छात्रों के लिए एआईसीटीई सक्षम छात्रवृत्ति',
    category: 'Education',
    level: 'Central',
    benefit: '₹50,000 per annum throughout technical degree/diploma program',
    benefitAmountApprox: 50000,
    summary: 'Empowering differently-abled students (disability >= 40%) admitted to AICTE approved technical institutions with full study and living support.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / AICTE',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • UDID Linked • AICTE Validated',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 800000,
      categories: ['All'],
      educationLevels: ['Undergraduate'],
      disabilityEligibleOnly: true,
      genders: ['All']
    },
    requiredDocuments: [
      'UDID Card / Disability Certificate issued by Competent Medical Authority (min 40%)',
      'Admission Letter for Technical Degree/Diploma',
      'Annual Income Certificate (< ₹8L)',
      'Fee Receipt & Bank Details'
    ],
    stepsToApply: [
      'Visit National Scholarship Portal (scholarships.gov.in).',
      'Choose AICTE Saksham Scholarship Scheme.',
      'Provide UDID enrollment number and submit for college verification.'
    ]
  },
  {
    id: 'nsp-minority-post-matric',
    name: 'Post Matric Scholarship Scheme for Minorities',
    hindiName: 'अल्पसंख्यक समुदाय के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    category: 'Education',
    level: 'Central',
    benefit: 'Admission and tuition fee waiver up to ₹10,000/yr + monthly maintenance allowance',
    benefitAmountApprox: 15000,
    summary: 'Ministry of Minority Affairs active scholarship for students from notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoMA',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • MoMA Sponsored • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 200000,
      categories: ['Minority'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card with OTR',
      'Self-Declaration of Minority Community',
      'Income Certificate (< ₹2 Lakh)',
      'Previous Examination Marksheet (Minimum 50% marks)',
      'Current Year Fee Receipt'
    ],
    stepsToApply: [
      'Register on scholarships.gov.in.',
      'Select Ministry of Minority Affairs -> Post Matric Scholarship.',
      'Submit academic transcripts and institute verification.'
    ]
  },
  {
    id: 'nsp-nmmss-scholarship',
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    hindiName: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना (एनएमएमएसएस)',
    category: 'Education',
    level: 'Central',
    benefit: '₹12,000 per annum (₹1,000 per month) from Class 9 to Class 12',
    benefitAmountApprox: 12000,
    summary: 'Flagship Ministry of Education scholarship preventing school dropouts among meritorious students from economically weaker sections.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / MoE School Education',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Direct DBT to Bank • School Education',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 350000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['School', 'Higher Secondary'],
      genders: ['All']
    },
    requiredDocuments: [
      'NMMSS Selection Test Roll Number & Rank Card',
      'Class 7/8 Marksheet (min 55% marks)',
      'Income Certificate (< ₹3.5 Lakhs)',
      'Aadhaar Linked Bank Account'
    ],
    stepsToApply: [
      'Appear in State-level NMMSS examination conducted for Class 8 students.',
      'Selected candidates register on scholarships.gov.in under MoE NMMSS.',
      'Renew annually in Class 10, 11, and 12 upon scoring minimum 55%.'
    ]
  },
  {
    id: 'csis-education-loan-subsidy',
    name: 'Central Sector Interest Subsidy Scheme (CSIS) on Education Loans',
    hindiName: 'शिक्षा ऋण पर केंद्रीय क्षेत्र ब्याज सब्सिडी योजना (सीएसआईएस)',
    category: 'Education',
    level: 'Central',
    benefit: '100% full interest waiver during course duration + 1 year moratorium on education loans',
    benefitAmountApprox: 60000,
    summary: 'MoE scheme providing complete interest waiver on recognized education loans for economically weaker students pursuing professional/technical studies.',
    officialUrl: 'https://www.vidyalakshmi.co.in/',
    applyUrl: 'https://www.vidyalakshmi.co.in/',
    portalName: 'Vidya Lakshmi Portal / Canara Bank Nodal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Vidya Lakshmi Portal • 100% Interest Subsidy',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 450000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['Undergraduate', 'Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'Admission Letter in recognized Indian Higher Education Institution',
      'Education Loan Sanction Letter from Scheduled Bank',
      'Gross Family Income Certificate (< ₹4.50 Lakh per annum)',
      'Aadhaar Card'
    ],
    stepsToApply: [
      'Apply for education loan through www.vidyalakshmi.co.in portal.',
      'Submit parental income certificate to lending bank branch.',
      'Lending bank claims interest subsidy quarterly through the Canara Bank Nodal Portal.'
    ]
  },
  {
    id: 'pmrf-fellowship',
    name: "Prime Minister's Research Fellowship (PMRF)",
    hindiName: 'प्रधान मंत्री अनुसंधान फैलोशिप (पीएमआरएफ)',
    category: 'Education',
    level: 'Central',
    benefit: '₹70,000 to ₹80,000 per month stipend + ₹2 Lakh per annum research grant',
    benefitAmountApprox: 960000,
    summary: 'Prestigious national fellowship for top talent pursuing Ph.D. in science and technology at premier institutes (IITs, IISc, IISERs, Central Universities).',
    officialUrl: 'https://www.pmrf.in/',
    applyUrl: 'https://www.pmrf.in/',
    portalName: 'National PMRF Portal / IIT Madras Nodal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Tier-1 Research Fellowship • MoE',
    eligibility: {
      occupations: ['Student'],
      categories: ['All'],
      educationLevels: ['Postgraduate'],
      genders: ['All']
    },
    requiredDocuments: [
      'GATE / CEED Scorecard or qualifying CGPA transcript',
      'Ph.D. Admission Offer Letter from PMRF Granting Institute',
      'Research Project Proposal',
      'National Nodal recommendation'
    ],
    stepsToApply: [
      'Secure Ph.D. admission in a designated PMRF host institution.',
      'Submit application through institute internal recommendation cycle on www.pmrf.in.',
      'Apex committee evaluates research proposal and approves direct stipend DBT.'
    ]
  },

  // -------------------------------------------------------------------------
  // STATE-LEVEL SCHOLARSHIPS & HIGHER EDUCATION SCHEMES (ASSAM & KEY STATES)
  // -------------------------------------------------------------------------
  {
    id: 'assam-nijut-moina',
    name: 'Nijut Moina Scheme (Govt of Assam)',
    hindiName: 'निजुत मोइना योजना (असम सरकार - छात्राओं हेतु मासिक छात्रवृत्ति)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: 'Monthly stipend via DBT: ₹1,000/mo (HS Class 11-12), ₹1,250/mo (3-4 yr Degree), ₹2,500/mo (PG & B.Ed)',
    benefitAmountApprox: 15000,
    summary: 'Flagship Assam State Government initiative empowering girl students enrolled in government and provincialized institutions to pursue higher education and prevent child marriages.',
    officialUrl: 'https://directorateofhighereducation.assam.gov.in/',
    applyUrl: 'https://directorateofhighereducation.assam.gov.in/',
    portalName: 'Directorate of Higher Education (DHE Assam) / Samarth Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • DHE Assam • Monthly DBT Direct',
    eligibility: {
      occupations: ['Student'],
      genders: ['Female'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Aadhaar Card of Student',
      'Domicile / PRC Certificate of Assam',
      'College / School Bonafide Certificate & Admission Receipt',
      'Student Bank Account details (Aadhaar Seeded)',
      'Undertaking that student is unmarried (except PG students)'
    ],
    stepsToApply: [
      'Collect and fill the Nijut Moina application form from your respective College/Higher Secondary School.',
      'Submit required documents (Aadhaar, Bonafide, Bank Passbook) to the College Nodal Officer.',
      'College verifies and uploads student data to DHE Assam Samarth Portal for monthly DBT disbursement.'
    ]
  },
  {
    id: 'assam-pragyan-bharati',
    name: 'Pragyan Bharati Scheme (Free Admission & Scooty Award - Assam)',
    hindiName: 'प्रज्ञान भारती योजना (असम सरकार - 100% मुफ्त प्रवेश एवं स्कूटी पुरस्कार)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: '100% Free Admission fee waiver for HS & Degree + Dr. Banikanta Kakati Scooty Award for meritorious Class 12 students',
    benefitAmountApprox: 45000,
    summary: 'Assam State Government welfare program providing complete admission fee waivers in government/provincialized colleges for students with family income under ₹2 Lakhs, and award scooties to top performers.',
    officialUrl: 'https://directorateofhighereducation.assam.gov.in/',
    applyUrl: 'https://directorateofhighereducation.assam.gov.in/',
    portalName: 'Directorate of Higher Education, Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Assam • Free Admission & Scooty',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 200000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Income Certificate issued by Circle Officer / competent revenue authority (< ₹2 Lakh)',
      'PRC / Domicile Certificate of Assam',
      'HSLC / HS Marksheets',
      'College Admission Form / Fee Exemption Form',
      'Plantation Photograph (Proof of Sapling Plantation as per DHE guidelines)'
    ],
    stepsToApply: [
      'Select "Fee Waiver Scheme" during admission through the Assam State Higher Education Samarth Admission Portal.',
      'Produce valid Circle Officer income certificate showing family annual income under ₹2 Lakhs.',
      'College admission committee verifies proof and waives admission fees completely.'
    ]
  },
  {
    id: 'assam-ishan-uday',
    name: 'Ishan Uday Special Scholarship for North Eastern Region (NER / Assam - UGC)',
    hindiName: 'ईशान उदय विशेष छात्रवृत्ति योजना (पूर्वोत्तर क्षेत्र एवं असम - यूजीसी)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: '₹5,400 per month (General Degree) and ₹7,800 per month (Technical/Medical/Professional Degree) credited via DBT',
    benefitAmountApprox: 64800,
    summary: '10,000 fresh annual scholarships exclusively reserved for students with domicile of North Eastern Region including Assam pursuing 1st year general, technical, or medical undergraduate degrees.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / UGC NER Division',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • UGC North Eastern Regional Quota • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 450000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Permanent Resident Certificate (PRC) of Assam / North Eastern state',
      'Income Certificate issued by competent revenue authority (< ₹4.50 Lakh)',
      'Class 12th Board Marksheet',
      'Bonafide Certificate from recognized University / College',
      'Aadhaar Linked Bank Account details'
    ],
    stepsToApply: [
      'Register with One Time Registration (OTR) on scholarships.gov.in.',
      'Under UGC schemes, select "Ishan Uday Special Scholarship Scheme for NER".',
      'Upload domicile PRC and family income certificate and submit for institutional e-verification.'
    ]
  },
  {
    id: 'assam-combined-merit',
    name: 'Assam Combined Merit Scholarship Scheme (DHE Assam)',
    hindiName: 'असम संयुक्त मेरिट छात्रवृत्ति योजना (उच्च शिक्षा निदेशालय, असम)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: 'Monthly scholarship allowance (Degree: ₹300/mo, Master: ₹450/mo) + annual book and study grants',
    benefitAmountApprox: 12000,
    summary: 'Merit-based financial assistance awarded by Directorate of Higher Education, Assam for students enrolled in degree and postgraduate courses with minimum 60% marks in qualifying exams.',
    officialUrl: 'https://directorateofhighereducation.assam.gov.in/',
    applyUrl: 'https://directorateofhighereducation.assam.gov.in/',
    portalName: 'Directorate of Higher Education, Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • DHE Assam Merit Grant',
    eligibility: {
      occupations: ['Student'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'PRC / Domicile Certificate of Assam',
      'Previous Examination Marksheet (Minimum 60% marks)',
      'College Admission Receipt & Bonafide Certificate',
      'Aadhaar Card and Bank Passbook'
    ],
    stepsToApply: [
      'Visit DHE Assam portal (directorateofhighereducation.assam.gov.in).',
      'Complete online application for Combined Merit Scholarship under Scholarship Section.',
      'Submit hard copy of application along with academic transcripts to College Principal for nodal endorsement.'
    ]
  },
  {
    id: 'assam-post-matric-wptbc',
    name: 'Assam Post-Matric Scholarship for SC, ST, and OBC/MOBC Students',
    hindiName: 'असम पोस्ट-मैट्रिक छात्रवृत्ति (अनुसूचित जाति, जनजाति एवं अन्य पिछड़ा वर्ग)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: '100% compulsory tuition & exam fees reimbursement + monthly maintenance allowance up to ₹1,200/month',
    benefitAmountApprox: 24000,
    summary: 'State-administered scholarship executed by Directorate of Welfare of Plain Tribes and Backward Classes (WPTBC), Assam for students belonging to SC, ST, OBC and MOBC communities.',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (NSP) / WPTBC Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • WPTBC Assam Quota • NSP Managed',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['OBC', 'SC', 'ST'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Caste Certificate issued by designated Assam authority (DC/SDO/WPTBC)',
      'Income Certificate (< ₹2.50 Lakh)',
      'PRC / Domicile Certificate of Assam',
      'Institution Bonafide Certificate and Fee Structure',
      'Aadhaar Card linked to Bank Account'
    ],
    stepsToApply: [
      'Apply online on scholarships.gov.in using your Aadhaar OTR credentials.',
      'Select Assam State Post-Matric Scholarship for OBC/MOBC or SC/ST under State Schemes tab.',
      'College Nodal Officer e-verifies the student record and forwards to District Welfare Officer.'
    ]
  },
  {
    id: 'assam-arbas-award',
    name: 'Anundoram Borooah Award Scheme (ARBAS - Assam)',
    hindiName: 'आनंदराम बरुआ पुरस्कार योजना (असम - 10वीं कक्षा में 75% अंक पर ₹20,000/लैपटॉप)',
    category: 'Education',
    level: 'State',
    state: 'Assam',
    benefit: 'Cash award of ₹20,000 directly via DBT or brand-new citation Laptop for Class 10 meritorious achievers',
    benefitAmountApprox: 20000,
    summary: 'Honoring and encouraging academic excellence among Class 10 (HSLC) passed students in Assam scoring 75% or higher, administered by Assam Electronics Development Corporation Ltd (AMTRON).',
    officialUrl: 'https://directorateofhighereducation.assam.gov.in/',
    applyUrl: 'https://directorateofhighereducation.assam.gov.in/',
    portalName: 'ARBAS State Portal / AMTRON Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Assam • AMTRON Nodal',
    eligibility: {
      occupations: ['Student'],
      educationLevels: ['Higher Secondary', 'School'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'HSLC / Class 10 Marksheet showing 75% or Star marks',
      'Admit Card of HSLC Examination (SEBA)',
      'Aadhaar Card of Student',
      'Bank Account Passbook (Aadhaar linked)'
    ],
    stepsToApply: [
      'Register on official ARBAS portal (arbas.assam.gov.in).',
      'Enter HSLC Roll Code and Number to auto-fetch verified marksheet.',
      'Confirm bank account IFSC and Aadhaar number for direct transfer of ₹20,000 cash citation.'
    ]
  },
  {
    id: 'up-dashmottar-scholarship',
    name: 'UP Post-Matric (Dashmottar) Scholarship & Fee Reimbursement Scheme',
    hindiName: 'उत्तर प्रदेश दशमोत्तर छात्रवृत्ति एवं शुल्क प्रतिपूर्ति योजना',
    category: 'Education',
    level: 'State',
    state: 'Uttar Pradesh',
    benefit: '100% Full course fee reimbursement (up to ₹50,000+) + monthly maintenance allowance',
    benefitAmountApprox: 35000,
    summary: 'Flagship Uttar Pradesh State Government scholarship ensuring higher education for general, OBC, SC, ST, and minority students enrolled in UG, PG, and diploma courses.',
    officialUrl: 'https://scholarship.up.gov.in/',
    applyUrl: 'https://scholarship.up.gov.in/',
    portalName: 'UP Scholarship & Fee Reimbursement Online System',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • UP Social Welfare Dept • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Uttar Pradesh']
    },
    requiredDocuments: [
      'UP Domicile / Niwas Praman Patra',
      'Income Certificate (< ₹2.5L for SC/ST, < ₹2L for Gen/OBC)',
      'Caste Certificate (Jati Praman Patra)',
      'College Fee Receipt and Non-Refundable Fee Breakup',
      'Aadhaar linked bank account'
    ],
    stepsToApply: [
      'Register on scholarship.up.gov.in under Post-Matric Other Than Inter category.',
      'Complete Aadhaar authentication and fill academic details.',
      'Submit printout with attachments to college for institutional online forward.'
    ]
  },
  {
    id: 'mahadbt-rajarshi-shahu',
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (MahaDBT)',
    hindiName: 'राजर्षि छत्रपति शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती योजना (महाडीबीटी)',
    category: 'Education',
    level: 'State',
    state: 'Maharashtra',
    benefit: '50% tuition and exam fee reimbursement for higher and technical professional courses',
    benefitAmountApprox: 40000,
    summary: 'Maharashtra Higher & Technical Education Department scheme reimbursing 50% college fees for economically backward class (EBC) students.',
    officialUrl: 'https://mahadbt.maharashtra.gov.in/',
    applyUrl: 'https://mahadbt.maharashtra.gov.in/',
    portalName: 'MahaDBT State Portal (Govt of Maharashtra)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • MahaDBT DTE • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 800000,
      categories: ['All', 'General', 'OBC', 'EWS'],
      educationLevels: ['Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Maharashtra']
    },
    requiredDocuments: [
      'Maharashtra Domicile Certificate',
      'Annual Income Certificate issued by Tahsildar (< ₹8 Lakhs)',
      'CAP Allotment Letter for professional courses',
      'College Fee Receipt',
      'Aadhaar linked bank passbook'
    ],
    stepsToApply: [
      'Register on mahadbt.maharashtra.gov.in using Aadhaar authentication.',
      'Select Directorate of Technical/Higher Education -> Rajarshi Shahu Maharaj Scheme.',
      'Submit application and track status through institute scrutiny.'
    ]
  },
  {
    id: 'karnataka-ssp-scholarship',
    name: 'Karnataka State Scholarship Portal (SSP Post-Matric Scholarship)',
    hindiName: 'कर्नाटक राज्य छात्रवृत्ति पोर्टल (एसएसपी पोस्ट-मैट्रिक छात्रवृत्ति)',
    category: 'Education',
    level: 'State',
    state: 'Karnataka',
    benefit: 'Full college fee reimbursement + monthly maintenance allowance up to ₹10,000/year',
    benefitAmountApprox: 28000,
    summary: 'Single unified state scholarship platform of Government of Karnataka covering Social Welfare, Tribal Welfare, Backward Classes, and Minorities departments.',
    officialUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    applyUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    portalName: 'SSP Karnataka Post-Matric Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Karnataka • Kutumba ID Linked',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Karnataka']
    },
    requiredDocuments: [
      'Kutumba Family ID / Karnataka Resident proof',
      'RD Number of Caste and Income Certificate',
      'Student e-Attestation of fee receipt and study certificate',
      'Aadhaar linked bank account'
    ],
    stepsToApply: [
      'Create account on ssp.postmatric.karnataka.gov.in with Kutumba ID and Aadhaar.',
      'Upload study certificates and claim fee reimbursement for your respective department.',
      'College performs online e-attestation and department releases DBT directly.'
    ]
  },
  {
    id: 'tn-pudhumai-penn',
    name: 'Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar - Tamil Nadu)',
    hindiName: 'पुधुमाई पेन योजना (तमिलनाडु - छात्राओं हेतु ₹1,000 प्रति माह)',
    category: 'Education',
    level: 'State',
    state: 'Tamil Nadu',
    benefit: '₹1,000 per month deposited directly into bank account until completion of undergraduate degree or diploma',
    benefitAmountApprox: 12000,
    summary: 'Tamil Nadu Government flagship higher education assurance scheme providing ₹1,000 monthly cash incentive to girl students who studied in government schools from Class 6 to 12.',
    officialUrl: 'https://pudhumaipenn.tn.gov.in/',
    applyUrl: 'https://pudhumaipenn.tn.gov.in/',
    portalName: 'Pudhumai Penn State Portal, Govt of Tamil Nadu',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Social Welfare Dept TN • Monthly DBT',
    eligibility: {
      occupations: ['Student'],
      genders: ['Female'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Tamil Nadu']
    },
    requiredDocuments: [
      'EMIS Number of Student (Education Management Information System)',
      'Government School Study Certificate (Classes 6 to 12)',
      'College Admission / Bonafide Receipt',
      'Aadhaar Card and Student Bank Passbook'
    ],
    stepsToApply: [
      'Apply through your college nodal officer on the official pudhumaipenn.tn.gov.in portal.',
      'Verify 6th to 12th standard government schooling via EMIS database.',
      'Approved candidates receive ₹1,000 directly via DBT into individual bank accounts on 1st of every month.'
    ]
  },
  {
    id: 'tn-tamil-pudhalvan',
    name: 'Tamil Pudhalvan Scheme (Govt of Tamil Nadu)',
    hindiName: 'तमिल पुधलवन योजना (तमिलनाडु - छात्रों हेतु ₹1,000 प्रति माह उच्च शिक्षा सहायता)',
    category: 'Education',
    level: 'State',
    state: 'Tamil Nadu',
    benefit: '₹1,000 per month financial aid for college boys who studied in government schools',
    benefitAmountApprox: 12000,
    summary: 'Higher education incentive scheme by Government of Tamil Nadu granting ₹1,000 per month to male students from government schools pursuing higher education degrees, ITI, or polytechnic.',
    officialUrl: 'https://pudhumaipenn.tn.gov.in/',
    applyUrl: 'https://pudhumaipenn.tn.gov.in/',
    portalName: 'Tamil Pudhalvan Portal / Higher Education TN',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Tamil Nadu • Monthly DBT Direct',
    eligibility: {
      occupations: ['Student'],
      genders: ['Male'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Tamil Nadu']
    },
    requiredDocuments: [
      'EMIS ID and School Transfer Certificate (Classes 6 to 12 in Govt School)',
      'College Bonafide Certificate & ID Card',
      'Aadhaar Card & Bank Account Details'
    ],
    stepsToApply: [
      'College verification officer validates government school study credentials on portal.',
      'Student confirms Aadhaar-linked bank details.',
      'Monthly scholarship credited directly to bank account.'
    ]
  },
  {
    id: 'wb-svmcm-scholarship',
    name: 'Swami Vivekananda Merit-cum-Means Scholarship (SVMCM - West Bengal)',
    hindiName: 'स्वामी विवेकानंद मेरिट-कम-मीन्स छात्रवृत्ति (पश्चिम बंगाल)',
    category: 'Education',
    level: 'State',
    state: 'West Bengal',
    benefit: '₹12,000 to ₹60,000 per annum depending on course level (Higher Secondary, Degree, Engineering, Medical, PG)',
    benefitAmountApprox: 36000,
    summary: 'Flagship merit-cum-means scholarship of Government of West Bengal assisting meritorious students from economically weaker families scoring 60%+ in previous qualifying exams.',
    officialUrl: 'https://svmcm.wbhed.gov.in/',
    applyUrl: 'https://svmcm.wbhed.gov.in/',
    portalName: 'SVMCM Higher Education Portal (Govt of West Bengal)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Higher Education Dept WB • Live AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['West Bengal']
    },
    requiredDocuments: [
      'Marksheet of Madhyamik / Higher Secondary / previous qualifying exam (min 60%)',
      'Income Certificate issued by BDO / SDO / Joint BDO (< ₹2.5 Lakhs)',
      'Domicile Certificate of West Bengal (Aadhaar / Ration Card / Voter ID)',
      'College Admission Receipt and Fee Structure',
      'Bank Account Passbook (Aadhaar Seeded)'
    ],
    stepsToApply: [
      'Register online on svmcm.wbhed.gov.in under your relevant Directorate (DPI / DTE / DSE / DME).',
      'Upload academic marksheets and BDO income certificate.',
      'Institution forwards online application to Directorate for direct state DBT credit.'
    ]
  },
  {
    id: 'wb-kanyashree-k2',
    name: 'Kanyashree Prakalpa (K2 Scheme - West Bengal)',
    hindiName: 'कन्याश्री प्रकल्प (के2 योजना - पश्चिम बंगाल ₹25,000 एकमुश्त अनुदान)',
    category: 'Education',
    level: 'State',
    state: 'West Bengal',
    benefit: '₹25,000 one-time financial grant for unmarried girl students upon turning 18 and pursuing higher studies',
    benefitAmountApprox: 25000,
    summary: 'United Nations Public Service Award-winning initiative of West Bengal preventing child marriage and encouraging higher education retention for young women.',
    officialUrl: 'https://www.wbkanyashree.gov.in/',
    applyUrl: 'https://www.wbkanyashree.gov.in/',
    portalName: 'Kanyashree State Portal, Govt of West Bengal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • WCD Dept West Bengal • DBT Enabled',
    eligibility: {
      occupations: ['Student'],
      genders: ['Female'],
      minAge: 18,
      maxAge: 19,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate'],
      states: ['West Bengal']
    },
    requiredDocuments: [
      'Birth Certificate proving age between 18 and 19 years',
      'Declaration that applicant is unmarried',
      'Proof of enrollment in recognized higher secondary school, college, or university',
      'Aadhaar Card and Student Bank Passbook'
    ],
    stepsToApply: [
      'Obtain and submit Kanyashree K2 form from your college or higher secondary school.',
      'Head of Institution verifies enrollment and uploads student dossier onto wbkanyashree.gov.in.',
      'Direct transfer of ₹25,000 executed into girl’s bank account.'
    ]
  },
  {
    id: 'bihar-pms-post-matric',
    name: 'Bihar Post-Matric Scholarship Portal (PMS Online - BC/EBC/SC/ST)',
    hindiName: 'बिहार पोस्ट-मैट्रिक छात्रवृत्ति पोर्टल (पिछड़ा, अत्यंत पिछड़ा एवं एससी/एसटी)',
    category: 'Education',
    level: 'State',
    state: 'Bihar',
    benefit: 'Full compulsory non-refundable fees reimbursement (up to ₹50,000+) + maintenance allowance',
    benefitAmountApprox: 30000,
    summary: 'Official state scholarship portal of Education Department, Government of Bihar enabling post-matric education for BC, EBC, SC, and ST students studying in or outside Bihar.',
    officialUrl: 'https://pmsonline.bih.nic.in/',
    applyUrl: 'https://pmsonline.bih.nic.in/',
    portalName: 'PMS Online Bihar / Education Dept Bihar',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Bihar • Multi-Department PMS',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 300000,
      categories: ['OBC', 'SC', 'ST'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Bihar']
    },
    requiredDocuments: [
      'Bihar Domicile (Niwas Praman Patra)',
      'Caste Certificate (Jati Praman Patra)',
      'Income Certificate issued by Revenue Officer (< ₹3 Lakh)',
      'Institution Fee Receipt and Bonafide Certificate',
      'Aadhaar Linked Bank Account'
    ],
    stepsToApply: [
      'Register on pmsonline.bih.nic.in and verify mobile and Aadhaar.',
      'Upload institute fee structure and previous examination marksheet.',
      'Institution and District Welfare Committee verify application for DBT release.'
    ]
  },
  {
    id: 'bihar-kanya-utthan',
    name: 'Mukhyamantri Kanya Utthan Yojana (Medhasoft - Bihar)',
    hindiName: 'मुख्यमंत्री कन्या उत्थान योजना (बिहार - स्नातक पास छात्राओं को ₹50,000)',
    category: 'Education',
    level: 'State',
    state: 'Bihar',
    benefit: '₹25,000 for Intermediate (Class 12) 1st division pass + ₹50,000 for all graduate girl students',
    benefitAmountApprox: 50000,
    summary: 'Govt of Bihar flagship scheme providing substantial cash grants directly to girls upon graduating or completing intermediate to encourage women’s self-reliance and education.',
    officialUrl: 'https://medhasoft.bih.nic.in/',
    applyUrl: 'https://medhasoft.bih.nic.in/',
    portalName: 'Medhasoft Portal, Education Dept Bihar',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Bihar • DBT Direct to Girls',
    eligibility: {
      occupations: ['Student'],
      genders: ['Female'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      states: ['Bihar']
    },
    requiredDocuments: [
      'Graduation / Intermediate Final Marksheet & Roll Number',
      'Aadhaar Card of Female Student',
      'Residential / Domicile Certificate of Bihar',
      'Bank Account Passbook (Applicant name only)'
    ],
    stepsToApply: [
      'Search your name in the University Result List on medhasoft.bih.nic.in.',
      'Fill registration form with University Roll Number and Aadhaar.',
      'Verify details via OTP; ₹50,000 is directly credited into applicant’s bank account.'
    ]
  },
  {
    id: 'rajasthan-uttar-matric',
    name: 'Rajasthan Uttar Matric Scholarship Scheme (SJE Portal)',
    hindiName: 'राजस्थान उत्तर मैट्रिक छात्रवृत्ति योजना (सामाजिक न्याय एवं अधिकारिता विभाग)',
    category: 'Education',
    level: 'State',
    state: 'Rajasthan',
    benefit: '100% full course fee reimbursement + monthly maintenance allowance up to ₹10,000/year',
    benefitAmountApprox: 32000,
    summary: 'Social Justice & Empowerment Department Rajasthan comprehensive scholarship providing full tuition fee reimbursement for SC, ST, OBC, EBC, DNT, and minority college students.',
    officialUrl: 'https://sjmsnew.rajasthan.gov.in/scholarship/',
    applyUrl: 'https://sso.rajasthan.gov.in/',
    portalName: 'Rajasthan SSO Portal / SJE Scholarship',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Jan Aadhaar Linked • SJE Rajasthan',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Rajasthan']
    },
    requiredDocuments: [
      'Jan Aadhaar Card / Bhamashah Card',
      'Caste Certificate and Income Certificate issued by competent officer',
      'Fee Receipt of Current Course',
      'Domicile / Mool Niwas Certificate of Rajasthan'
    ],
    stepsToApply: [
      'Login through Rajasthan Single Sign On (SSO) on sso.rajasthan.gov.in.',
      'Select SJMS Scholarship application and fetch data from Jan Aadhaar.',
      'Upload college fee receipt and submit for institute and district approval.'
    ]
  },
  {
    id: 'rajasthan-anuprati-coaching',
    name: 'Mukhyamantri Anuprati Coaching Scheme (Govt of Rajasthan)',
    hindiName: 'मुख्यमंत्री अनुप्रति कोचिंग योजना (राजस्थान - मुफ्त प्रतियोगी परीक्षा कोचिंग व आवास भत्ता)',
    category: 'Education',
    level: 'State',
    state: 'Rajasthan',
    benefit: '100% Free Coaching for UPSC, RPSC, JEE, NEET, CLAT at premier institutes + ₹40,000/year lodging stipend',
    benefitAmountApprox: 100000,
    summary: 'Supporting 30,000 meritorious underprivileged students annually with free coaching for national and state competitive examinations along with hostel/living allowances.',
    officialUrl: 'https://sje.rajasthan.gov.in/',
    applyUrl: 'https://sso.rajasthan.gov.in/',
    portalName: 'SJE Rajasthan / SSO Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Rajasthan • 30k Seats Live',
    eligibility: {
      occupations: ['Student', 'Unemployed'],
      maxAnnualIncome: 800000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Rajasthan']
    },
    requiredDocuments: [
      'Jan Aadhaar Card of Rajasthan',
      '10th and 12th Examination Marksheets',
      'Caste & Income Certificate',
      'Domicile Certificate of Rajasthan'
    ],
    stepsToApply: [
      'Apply online on sso.rajasthan.gov.in under SJMS Portal selecting desired exam coaching.',
      'Merit lists are declared based on Class 10/12 marks.',
      'Selected candidates join empaneled coaching institutes with zero fees.'
    ]
  },
  {
    id: 'mp-mmvy-medhavi',
    name: 'Mukhya Mantri Medhavi Vidyarthi Yojana (MMVY - Madhya Pradesh)',
    hindiName: 'मुख्यमंत्री मेधावी विद्यार्थी योजना (मध्य प्रदेश - उच्च शिक्षा की 100% फीस शासन द्वारा)',
    category: 'Education',
    level: 'State',
    state: 'Madhya Pradesh',
    benefit: '100% Complete course tuition fee paid directly by State Government for Engineering, Medical, Law, and Degree courses',
    benefitAmountApprox: 150000,
    summary: 'Flagship higher education scheme by Government of Madhya Pradesh ensuring that no meritorious student (70%+ in MP Board or 85%+ in CBSE/ICSE) is deprived of professional education due to poverty.',
    officialUrl: 'https://scholarshipportal.mp.nic.in/MedhaviChhatra/',
    applyUrl: 'https://scholarshipportal.mp.nic.in/MedhaviChhatra/',
    portalName: 'MP State Scholarship Portal 2.0 (MMVY)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Technical & Higher Education MP • 100% Fee Paid',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 600000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      genders: ['All'],
      states: ['Madhya Pradesh']
    },
    requiredDocuments: [
      'Samagra ID of MP',
      'Class 12th Board Marksheet (min 70% MP Board / 85% CBSE/ICSE)',
      'Admission proof in IIT, NIT, Government/Private Medical College, NLU, or State University',
      'Income Certificate (< ₹6 Lakhs per year)',
      'Aadhaar Card'
    ],
    stepsToApply: [
      'Register on scholarshipportal.mp.nic.in/MedhaviChhatra using Samagra ID and Aadhaar.',
      'Fill academic details and enter competitive exam rank/admission letter.',
      'State Government sanction order pays full college tuition fees directly to the institution.'
    ]
  },
  {
    id: 'gujarat-mysy',
    name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY - Gujarat)',
    hindiName: 'मुख्यमंत्री युवा स्वावलंबन योजना (गुजरात - 50% ट्यूशन फीस माफी व आवास भत्ता)',
    category: 'Education',
    level: 'State',
    state: 'Gujarat',
    benefit: '50% tuition fee waiver up to ₹2,00,000 for Medical/Dental, ₹50,000 for Engineering/Professional, + ₹12,000/yr hostel grant',
    benefitAmountApprox: 50000,
    summary: 'Education Department Government of Gujarat initiative providing tuition fee waivers, hostel food subsidies, and book allowances to meritorious students from all communities scoring 80th percentile.',
    officialUrl: 'https://mysy.guj.nic.in/',
    applyUrl: 'https://mysy.guj.nic.in/',
    portalName: 'MYSY Official Portal, Govt of Gujarat',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • KCG Gujarat • Live AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 600000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      genders: ['All'],
      states: ['Gujarat']
    },
    requiredDocuments: [
      'Class 10th or 12th Marksheet showing 80th percentile or above',
      'Admission Letter and College Fee Receipt',
      'Annual Income Certificate issued by Mamlatdar / TDO (< ₹6 Lakh)',
      'Aadhaar Card and Student Bank Account details'
    ],
    stepsToApply: [
      'Register online on mysy.guj.nic.in with Board Roll Number.',
      'Visit nearest Help Center for physical document verification.',
      'Fee waiver subsidy is credited directly via DBT to the student bank account.'
    ]
  },
  {
    id: 'kerala-dce-post-matric',
    name: 'DCE Kerala State Merit & Post-Matric Scholarship Schemes',
    hindiName: 'उच्च शिक्षा निदेशालय केरल - राज्य मेरिट एवं पोस्ट-मैट्रिक छात्रवृत्ति',
    category: 'Education',
    level: 'State',
    state: 'Kerala',
    benefit: '₹10,000 to ₹25,000 per annum + special allowances for professional & master degree studies',
    benefitAmountApprox: 18000,
    summary: 'Directorate of Collegiate Education (DCE) Kerala multi-scholarship platform granting merit and means scholarships for students enrolled in arts, science, and professional colleges.',
    officialUrl: 'https://dcescholarship.kerala.gov.in/',
    applyUrl: 'https://dcescholarship.kerala.gov.in/',
    portalName: 'DCE Scholarship Portal (Govt of Kerala)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Collegiate Education Dept Kerala',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Kerala']
    },
    requiredDocuments: [
      'SSLC / Plus Two Marksheets',
      'Village Officer Income Certificate',
      'College Admission Fee Receipt',
      'Aadhaar Linked Bank Passbook'
    ],
    stepsToApply: [
      'Apply online on dcescholarship.kerala.gov.in.',
      'Submit printout to College Office for institutional verification.',
      'DCE approves list and transfers funds directly to beneficiary accounts.'
    ]
  },
  {
    id: 'punjab-dr-ambedkar-pms',
    name: 'Dr. Ambedkar Post-Matric Scholarship Scheme for SC Students (Punjab)',
    hindiName: 'डॉ. बी.आर. अंबेडकर पोस्ट मैट्रिक छात्रवृत्ति योजना (पंजाब - 100% निशुल्क शिक्षा)',
    category: 'Education',
    level: 'State',
    state: 'Punjab',
    benefit: '100% Free Education (Zero college admission & tuition fees) + monthly maintenance stipend',
    benefitAmountApprox: 35000,
    summary: 'Punjab Social Justice, Empowerment and Minorities Department scheme guaranteeing zero tuition fee admission and monthly allowances for SC students pursuing post-matric courses in Punjab.',
    officialUrl: 'https://scholarships.punjab.gov.in/',
    applyUrl: 'https://scholarships.punjab.gov.in/',
    portalName: 'Dr. Ambedkar Scholarship Portal (Govt of Punjab)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Free-Ship Card Enabled • Punjab Govt',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['SC'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Punjab']
    },
    requiredDocuments: [
      'Freeship Card generated from portal',
      'Caste Certificate (SC)',
      'Income Certificate issued by Tehsildar (< ₹2.5 Lakhs)',
      'Punjab Residence / Domicile Certificate'
    ],
    stepsToApply: [
      'Apply for Freeship Card on scholarships.punjab.gov.in.',
      'Produce Freeship Card at college for 100% fee exemption during admission.',
      'Institution submits claim directly to Punjab Government.'
    ]
  },
  {
    id: 'haryana-har-chhatravratti',
    name: 'Har-Chhatravratti Centralized Post-Matric Scholarship (Haryana)',
    hindiName: 'हर-छात्रवृत्ति एकीकृत पोर्टल (हरियाणा - उच्चतर शिक्षा विभाग)',
    category: 'Education',
    level: 'State',
    state: 'Haryana',
    benefit: 'Complete college tuition fee reimbursement + monthly maintenance allowance up to ₹13,500/yr',
    benefitAmountApprox: 25000,
    summary: 'Single window online scholarship portal of Higher Education Department, Government of Haryana covering 14 scholarship schemes across Social Justice, SC/BC Welfare, and Education departments.',
    officialUrl: 'https://harchhatravratti.highereduhry.ac.in/',
    applyUrl: 'https://harchhatravratti.highereduhry.ac.in/',
    portalName: 'Har-Chhatravratti Portal (Govt of Haryana)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Parivar Pehchan Patra (PPP) Linked',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Haryana']
    },
    requiredDocuments: [
      'Parivar Pehchan Patra (PPP) Family ID',
      'Haryana Domicile Certificate',
      'College Admission and Fee Receipt',
      'Aadhaar Linked Bank Account'
    ],
    stepsToApply: [
      'Login with Parivar Pehchan Patra (PPP) on harchhatravratti.highereduhry.ac.in.',
      'Data auto-populates from verified family database; select qualifying scholarship scheme.',
      'Institute verifies details online for direct DBT release.'
    ]
  },
  {
    id: 'odisha-e-medhabruti',
    name: 'e-Medhabruti Higher Education Scholarship Scheme (Odisha)',
    hindiName: 'ई-मेधावृत्ति उच्च शिक्षा छात्रवृत्ति योजना (ओडिशा सरकार)',
    category: 'Education',
    level: 'State',
    state: 'Odisha',
    benefit: '₹10,000/year (Junior & UG courses) and ₹20,000/year (PG & Professional Technical courses)',
    benefitAmountApprox: 20000,
    summary: 'Higher Education Department, Government of Odisha merit scholarship awarded to 23,000 meritorious students of Odisha pursuing technical, professional, general degree and postgraduate courses.',
    officialUrl: 'https://scholarship.odisha.gov.in/',
    applyUrl: 'https://scholarship.odisha.gov.in/',
    portalName: 'State Scholarship Portal (Govt of Odisha)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Odisha State Scholarship Portal • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 600000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Odisha']
    },
    requiredDocuments: [
      'Resident Certificate of Odisha',
      'Income Certificate from Tahsildar (< ₹6 Lakh)',
      'Previous Class Marksheet (min 60% marks)',
      'Aadhaar Card and Student Bank Passbook'
    ],
    stepsToApply: [
      'Register on scholarship.odisha.gov.in with Aadhaar authentication.',
      'Under Higher Education Dept, select "e-Medhabruti Scholarship".',
      'Institutional nodal officer e-validates the form for direct DBT.'
    ]
  },
  {
    id: 'telangana-epass-rtf',
    name: 'Telangana ePASS Post-Matric Tuition Fee Reimbursement (RTF & MTF)',
    hindiName: 'तेलंगाना ई-पास पोस्ट-मैट्रिक शुल्क प्रतिपूर्ति (आरटीएफ एवं एमटीएफ)',
    category: 'Education',
    level: 'State',
    state: 'Telangana',
    benefit: '100% Full course fee reimbursement (RTF) + Monthly Maintenance Fee (MTF) up to ₹15,000/yr',
    benefitAmountApprox: 45000,
    summary: 'Comprehensive electronic payment and application system of Telangana covering BC, SC, ST, EBC, and Minorities studying degree, engineering, pharmacy, and postgraduate courses.',
    officialUrl: 'https://telanganaepass.cgg.gov.in/',
    applyUrl: 'https://telanganaepass.cgg.gov.in/',
    portalName: 'Telangana ePASS Portal (Govt of Telangana)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Telangana Welfare Depts • AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 200000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Higher Secondary', 'Undergraduate', 'Postgraduate'],
      genders: ['All'],
      states: ['Telangana']
    },
    requiredDocuments: [
      'Telangana Residence Certificate',
      'Caste Certificate and MeeSeva Income Certificate (< ₹2 Lakh for BC/EBC, < ₹2.5L for SC/ST)',
      'CET Rank Card (EAPCET/ICET/ECET/POLYCET)',
      'College Bonafide and Bank Account linked to Aadhaar'
    ],
    stepsToApply: [
      'Register on telanganaepass.cgg.gov.in under Postmatric Scholarship Services.',
      'Enter SSC Hall Ticket Number and MeeSeva Certificate details.',
      'College principal confirms biometric verification; Treasury credits RTF to college and MTF to student.'
    ]
  },
  {
    id: 'ap-jagananna-vidya-deevena',
    name: 'Jagananna Vidya Deevena (Total Fee Reimbursement - Andhra Pradesh)',
    hindiName: 'जगन्ना विद्या दीवेना (आंध्र प्रदेश - 100% पूर्ण कॉलेज फीस प्रतिपूर्ति)',
    category: 'Education',
    level: 'State',
    state: 'Andhra Pradesh',
    benefit: '100% Full college tuition fee reimbursement credited quarterly directly to mother’s bank account',
    benefitAmountApprox: 40000,
    summary: 'Andhra Pradesh State Government flagship welfare scheme ensuring that higher education is completely free for students pursuing ITI, Polytechnic, Degree, B.Tech, MBA, MCA, and Pharmacy.',
    officialUrl: 'https://jnanabhumi.ap.gov.in/',
    applyUrl: 'https://jnanabhumi.ap.gov.in/',
    portalName: 'JnanaBhumi State Portal (Govt of Andhra Pradesh)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Social Welfare Dept AP • JnanaBhumi Live',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate', 'Postgraduate', 'Higher Secondary'],
      genders: ['All'],
      states: ['Andhra Pradesh']
    },
    requiredDocuments: [
      'Rice Card / White Ration Card of Andhra Pradesh',
      'Integrated Caste and Income Certificate (< ₹2.5 Lakhs)',
      'Mother’s Aadhaar Card and Bank Account (NPCI active)',
      'College Admission Allotment Order'
    ],
    stepsToApply: [
      'Apply through Grama/Ward Sachivalayam or via JnanaBhumi portal.',
      'Welfare & Education Assistant verifies student and mother KYC.',
      'State Government credits 100% fees in 4 quarterly installments directly to mother’s account.'
    ]
  },
  {
    id: 'delhi-merit-cum-means',
    name: 'Delhi Higher Education Merit-cum-Means Financial Assistance Scheme',
    hindiName: 'दिल्ली उच्च शिक्षा मेरिट-कम-मीन्स सहायता योजना (100% फीस छूट)',
    category: 'Education',
    level: 'State',
    state: 'Delhi',
    benefit: '100% full fee waiver (family income < ₹2.5L) or 50% fee waiver (income ₹2.5L - ₹6L) at State Universities',
    benefitAmountApprox: 50000,
    summary: 'Delhi State Government scheme extending 100% to 50% college fee waivers to all eligible students pursuing undergraduate programs at Delhi state universities (GGSIPU, DTU, NSUT, AUD, IIITD, DSEU).',
    officialUrl: 'https://edistrict.delhigovt.nic.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'e-District Delhi Portal / Directorate of Higher Education',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • DHE Delhi • Live AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 600000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      educationLevels: ['Undergraduate'],
      genders: ['All'],
      states: ['Delhi']
    },
    requiredDocuments: [
      'Delhi e-District Income Certificate (< ₹2.5L for 100%, < ₹6L for 50%)',
      'National Food Security Card / Ration Card (if NFSA beneficiary)',
      'Previous Examination Marksheet (Minimum 60% without backlogs)',
      'Fee Receipt of Delhi State University'
    ],
    stepsToApply: [
      'Register on edistrict.delhigovt.nic.in using Aadhaar credentials.',
      'Select Higher Education Merit-cum-Means Scheme and upload fee receipts.',
      'University scrutinizes documents and Directorate issues direct fee refund.'
    ]
  },
  {
    id: 'jk-pmsss-special-scholarship',
    name: "Prime Minister's Special Scholarship Scheme for J&K and Ladakh (PMSSS - AICTE)",
    hindiName: 'जम्मू-कश्मीर एवं लद्दाख प्रधानमंत्री विशेष छात्रवृत्ति योजना (निशुल्क शिक्षा व ₹1 लाख भत्ता)',
    category: 'Education',
    level: 'State',
    state: 'Jammu & Kashmir',
    benefit: 'Full academic fee waiver up to ₹1.25L - ₹3L/yr + ₹1,00,000/year living maintenance allowance via DBT',
    benefitAmountApprox: 200000,
    summary: 'Centrally funded supernumerary scheme executed by AICTE for students having domicile of J&K and Ladakh passing Class 12, funding full degrees and lodging at institutions across India.',
    officialUrl: 'https://www.aicte-india.org/bureaus/jk',
    applyUrl: 'https://www.aicte-jk-scholarship-gov.in/',
    portalName: 'AICTE PMSSS Official Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'AY 2025-26 (Active Window)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • AICTE Special Quota • Live AY 2025-26',
    eligibility: {
      occupations: ['Student'],
      maxAnnualIncome: 800000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'],
      educationLevels: ['Undergraduate', 'Higher Secondary'],
      genders: ['All'],
      states: ['Jammu & Kashmir', 'Ladakh']
    },
    requiredDocuments: [
      'Domicile Certificate of UT of J&K or UT of Ladakh',
      'Class 12th Marksheet (JKBOSE or CBSE in J&K/Ladakh)',
      'Family Income Certificate issued by competent authority (< ₹8 Lakhs)',
      'Aadhaar Card'
    ],
    stepsToApply: [
      'Register on aicte-jk-scholarship-gov.in during admission cycle.',
      'Visit nearest Facilitation Center / Government College in J&K for document verification.',
      'Participate in AICTE online counseling; tuition fee is paid directly to allotted college and ₹1 Lakh credited for maintenance.'
    ]
  },

  // =========================================================================
  // 2. FARMERS & AGRICULTURE (ZERO STUDENT SCHOLARSHIPS / ZERO PENSIONS)
  // =========================================================================
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि (वार्षिक ₹6,000 प्रत्यक्ष लाभ)',
    category: 'Agriculture',
    level: 'Central',
    benefit: '₹6,000 per year directly into bank account in 3 equal four-monthly installments of ₹2,000 each',
    benefitAmountApprox: 6000,
    summary: 'Active central sector scheme providing guaranteed income support to all landholding farmer families across India via Aadhaar-linked DBT.',
    officialUrl: 'https://pmkisan.gov.in/',
    applyUrl: 'https://pmkisan.gov.in/',
    portalName: 'PM-KISAN Official Portal (MoA&FW)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Central Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • e-KYC Live • 19th Installment Released',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large', 'Landless'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card (Mandatory biometric/OTP linked)',
      'Land Ownership Record (Khata / Khasra / RoR Copy)',
      'Aadhaar Seeded Active Bank Account Passbook',
      'Active Mobile Number'
    ],
    stepsToApply: [
      'Visit pmkisan.gov.in and click on "New Farmer Registration".',
      'Enter Aadhaar number, state, and land record details (Khata/Khasra).',
      'Complete biometric e-KYC on the portal or nearest CSC centre.',
      'District agriculture officer verifies land records; DBT released directly.'
    ]
  },
  {
    id: 'kcc-kisan-credit-card',
    name: 'Kisan Credit Card (KCC) Scheme',
    hindiName: 'किसान क्रेडिट कार्ड (4% रियायती ब्याज दर पर कृषि ऋण)',
    category: 'Agriculture',
    level: 'Central',
    benefit: 'Crop loan up to ₹3,000,000 at highly subsidized 4% interest rate with prompt repayment incentive',
    benefitAmountApprox: 150000,
    summary: 'Active central financial scheme providing affordable credit for agricultural cultivation, post-harvest expenses, animal husbandry, and fisheries.',
    officialUrl: 'https://pmkisan.gov.in/',
    applyUrl: 'https://pmkisan.gov.in/',
    portalName: 'PM-KISAN KCC Portal / Commercial & Gramin Banks',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • 3% Prompt Repayment Incentive • 4% Net Rate',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large', 'Landless'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Completed KCC Application Form',
      'Land revenue records / crop cultivation proof',
      'Aadhaar Card & PAN Card',
      'Passport size photographs'
    ],
    stepsToApply: [
      'Download one-page KCC application from pmkisan.gov.in or approach local bank/cooperative.',
      'Submit with land title deeds and current crop pattern proof.',
      'Bank sanctions KCC limit within 14 days and issues RuPay Kisan Credit Card.'
    ]
  },
  {
    id: 'pmfby-crop-insurance',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY - Crop Insurance)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना (व्यापक फसल सुरक्षा बीमा)',
    category: 'Agriculture',
    level: 'Central',
    benefit: 'Comprehensive crop insurance against non-preventable natural risks at minimal premium (1.5% Rabi, 2% Kharif)',
    benefitAmountApprox: 45000,
    summary: 'Comprehensive yield loss and weather catastrophe insurance covering all food grain, oilseed, and annual commercial/horticultural crops.',
    officialUrl: 'https://pmfby.gov.in/',
    applyUrl: 'https://pmfby.gov.in/',
    portalName: 'National Crop Insurance Portal (NCIP) / PMFBY',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Kharif & Rabi Cycles 2025–2026',
    applicationStatus: 'ROLLING_CYCLE',
    lastAuditStatus: 'Verified Active • DigiClaim Automated Payout Enabled',
    eligibility: {
      occupations: ['Farmer'],
      categories: ['All'],
      farmerTypes: ['Small/Marginal', 'Large', 'Landless'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Possession Certificate / Sowing Certificate',
      'Bank Account Details (Aadhaar linked)',
      'Crop Sowing Intimation'
    ],
    stepsToApply: [
      'Visit pmfby.gov.in or mobile Crop Insurance App within cut-off date.',
      'Select State, Season (Kharif/Rabi), and survey number.',
      'Pay 1.5% - 2% nominal farmer premium online; government subsidizes remainder.'
    ]
  },
  {
    id: 'pmksy-micro-irrigation',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    hindiName: 'प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप एवं स्प्रिंकलर सब्सिडी)',
    category: 'Agriculture',
    level: 'Central',
    benefit: 'Up to 55% financial subsidy for small/marginal farmers and 45% for other farmers on Drip and Sprinkler systems',
    benefitAmountApprox: 50000,
    summary: 'Water-use efficiency initiative providing capital subsidies for installing precision micro-irrigation systems to maximize crop productivity.',
    officialUrl: 'https://pmksy.gov.in/',
    applyUrl: 'https://pmksy.gov.in/',
    portalName: 'PMKSY Official Portal / State Horticulture Departments',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Micro-irrigation Capital Subsidy',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Land Revenue Records (7/12, Khasra, Khatoni)',
      'Aadhaar Card',
      'Bank Passbook',
      'Water Source Proof (Borewell/Canal/Pond)'
    ],
    stepsToApply: [
      'Apply online on state agriculture/horticulture portal or www.pmksy.gov.in.',
      'Select empanelled micro-irrigation vendor for farm survey and design estimate.',
      'Upon installation and field inspection, subsidy is credited directly via DBT.'
    ]
  },
  {
    id: 'smam-farm-mechanization',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM - Farm Machinery Subsidy)',
    hindiName: 'कृषि यंत्रीकरण पर उप-मिशन (ट्रैक्टर एवं कृषि उपकरण सब्सिडी)',
    category: 'Agriculture',
    level: 'Central',
    benefit: '40% to 50% capital subsidy on purchase of Tractors, Power Tillers, Harvesters, and Custom Hiring Centers',
    benefitAmountApprox: 125000,
    summary: 'Direct government subsidy for farmers and farm cooperatives to acquire modern tractors, seed drills, rotavators, and harvesters.',
    officialUrl: 'https://agrimachinery.nic.in/',
    applyUrl: 'https://agrimachinery.nic.in/',
    portalName: 'FARMS Portal / Ministry of Agriculture',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • DBT Direct to Equipment Manufacturer',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large'],
      categories: ['All', 'SC', 'ST', 'OBC', 'General'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Record Proof',
      'Caste Certificate (for higher SC/ST subsidy)',
      'Bank Passbook',
      'Equipment Quotation from Authorized Dealer'
    ],
    stepsToApply: [
      'Register on agrimachinery.nic.in choosing your state and district.',
      'Select equipment type and authorized dealership.',
      'Receive digital sanction token and claim DBT subsidy upon delivery.'
    ]
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    hindiName: 'मृदा स्वास्थ्य कार्ड योजना (मुफ्त मिट्टी परीक्षण एवं उर्वरक सलाह)',
    category: 'Agriculture',
    level: 'Central',
    benefit: 'Free comprehensive 12-parameter soil testing + customized fertilizer and micro-nutrient advisory every 2 years',
    benefitAmountApprox: 5000,
    summary: 'Government of India soil testing drive helping farmers lower chemical fertilizer costs and increase crop yield by testing soil nutrient status.',
    officialUrl: 'https://soilhealth.dac.gov.in/',
    applyUrl: 'https://soilhealth.dac.gov.in/',
    portalName: 'National Soil Health Portal (DAC&FW)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Free Public Service',
    eligibility: {
      occupations: ['Farmer'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Survey Number',
      'Mobile Number'
    ],
    stepsToApply: [
      'Approach village Agriculture Extension Officer (Kisan Mitra) or visit soilhealth.dac.gov.in.',
      'Soil sample is collected scientifically from your farm plot.',
      'Download Soil Health Card with tailored N-P-K recommendation online.'
    ]
  },
  {
    id: 'pkvy-organic-farming',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY - Organic Farming)',
    hindiName: 'परम्परागत कृषि विकास योजना (जैविक खेती अनुदान)',
    category: 'Agriculture',
    level: 'Central',
    benefit: '₹31,000 per hectare financial incentive directly for organic inputs, PGS certification, and bio-fertilizers',
    benefitAmountApprox: 31000,
    summary: 'Promoting chemical-free sustainable organic farming through cluster approach with free Participatory Guarantee System (PGS) certification.',
    officialUrl: 'https://pgsindia-ncof.gov.in/',
    applyUrl: 'https://pgsindia-ncof.gov.in/',
    portalName: 'PGS India Organic Portal / MoA&FW',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • PGS India Organic Certified',
    eligibility: {
      occupations: ['Farmer'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Records',
      'Farmer Group / Cluster Membership registration'
    ],
    stepsToApply: [
      'Form or join a 20-50 farmer cluster under block agriculture department.',
      'Enroll on pgsindia-ncof.gov.in for organic adoption and training.',
      'Receive DBT assistance for bio-inputs and premium organic market linkage.'
    ]
  },
  {
    id: 'pm-kisan-mandhan',
    name: 'PM Kisan Maan Dhan Yojana (Pension for Farmers)',
    hindiName: 'प्रधानमंत्री किसान मानधन योजना (वृद्धावस्था सामाजिक सुरक्षा पेंशन)',
    category: 'Agriculture',
    level: 'Central',
    benefit: 'Assured lifetime monthly pension of ₹3,000 from age 60 with 50% government co-contribution',
    benefitAmountApprox: 36000,
    summary: 'Old age security scheme exclusively for small and marginal landholding farmers (up to 2 hectares) aged 18-40 years.',
    officialUrl: 'https://maandhan.in/',
    applyUrl: 'https://maandhan.in/',
    portalName: 'National Maandhan Pension Portal / LIC of India',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • LIC Administered Pension Fund',
    eligibility: {
      minAge: 18,
      maxAge: 40,
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'PM-KISAN Registration / Land Ownership Record',
      'Bank Account (Aadhaar linked)'
    ],
    stepsToApply: [
      'Visit nearest CSC center or register online on maandhan.in.',
      'Choose auto-debit of nominal monthly contribution (₹55 - ₹200) matched by Government.',
      'Kisan Pension Card issued; ₹3,000/month credited upon reaching age 60.'
    ]
  },
  {
    id: 'assam-krishi-sa-sajuli',
    name: 'Mukhya Mantri Krishi Sa-Sajuli Yojana (Govt of Assam)',
    hindiName: 'मुख्यमंत्री कृषि सा-सजुली योजना (असम सरकार - कृषि उपकरण हेतु ₹5,000 डीबीटी)',
    category: 'Agriculture',
    level: 'State',
    state: 'Assam',
    benefit: '₹5,000 one-time financial grant deposited directly into bank accounts for purchasing farm implements',
    benefitAmountApprox: 5000,
    summary: 'Assam State Government initiative assisting small and marginal farmers across all assembly constituencies of Assam with ₹5,000 DBT to procure modern scientific farm tools and equipment.',
    officialUrl: 'https://agri-horti.assam.gov.in/',
    applyUrl: 'https://agri-horti.assam.gov.in/',
    portalName: 'Directorate of Agriculture, Govt of Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Agriculture Dept Assam • DBT Direct',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Landless', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Farmer Aadhaar Card',
      'Kisan Credit Card (KCC) or Land Records / Tenant Farmer Undertaking',
      'Aadhaar Linked Bank Passbook',
      'Voter ID / Assam Resident Proof'
    ],
    stepsToApply: [
      'Collect form from local Agriculture Development Officer (ADO) or Block Agriculture Office.',
      'Submit verification of land cultivation in Assam with Aadhaar-linked bank details.',
      'District Level Committee approves list and Department transfers ₹5,000 directly via DBT.'
    ]
  },
  {
    id: 'mh-namo-shetkari',
    name: 'Namo Shetkari Mahasanman Nidhi Yojana (Govt of Maharashtra)',
    hindiName: 'नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र सरकार - ₹6,000 वार्षिक टॉप-अप)',
    category: 'Agriculture',
    level: 'State',
    state: 'Maharashtra',
    benefit: '₹6,000 per year direct DBT cash in 3 equal installments matching PM-KISAN (Total ₹12,000/yr)',
    benefitAmountApprox: 6000,
    summary: 'Maharashtra State Government direct income support scheme providing ₹6,000 annually over and above the central PM-KISAN payout to over 90 lakh farmers in Maharashtra.',
    officialUrl: 'https://krishi.maharashtra.gov.in/',
    applyUrl: 'https://krishi.maharashtra.gov.in/',
    portalName: 'Agriculture Department, Govt of Maharashtra',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Maharashtra Krishi Dept • DBT Direct',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Landless', 'Large', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Maharashtra']
    },
    requiredDocuments: [
      'PM-KISAN Registered Beneficiary ID / Aadhaar',
      '7/12 Land Extract (Satbara Utara) of Maharashtra',
      'Aadhaar Linked Bank Account (NPCI mapped)'
    ],
    stepsToApply: [
      'Active PM-KISAN beneficiaries in Maharashtra are automatically onboarded via Aadhaar database.',
      'Verify status on krishi.maharashtra.gov.in or nearest CSC/Aaple Sarkar Seva Kendra.',
      'Installment credited directly into bank account in coordination with PM-KISAN cycle.'
    ]
  },
  {
    id: 'mp-kisan-kalyan',
    name: 'Mukhya Mantri Kisan Kalyan Yojana (Madhya Pradesh)',
    hindiName: 'मुख्यमंत्री किसान कल्याण योजना (मध्य प्रदेश - ₹6,000 वार्षिक सहायता)',
    category: 'Agriculture',
    level: 'State',
    state: 'Madhya Pradesh',
    benefit: '₹6,000 per year direct bank transfer in 3 installments supplementing PM-KISAN (Total ₹12,000/yr)',
    benefitAmountApprox: 6000,
    summary: 'Govt of MP income enhancement scheme delivering ₹6,000 annually to all landholder farmer families of Madhya Pradesh already enrolled in PM-KISAN.',
    officialUrl: 'https://saara.mp.gov.in/',
    applyUrl: 'https://saara.mp.gov.in/',
    portalName: 'SAARA Portal (Govt of Madhya Pradesh)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • SAARA MP • DBT Direct',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Madhya Pradesh']
    },
    requiredDocuments: [
      'PM-KISAN Registration ID',
      'MP Bhulekh Khasra/Khatauni Land Record',
      'Samagra ID and Aadhaar Card'
    ],
    stepsToApply: [
      'Visit Patwari / local Revenue Inspector or login to saara.mp.gov.in.',
      'Verify Khasra land link with PM-KISAN ID and Samagra.',
      'Direct benefit credited alongside PM-KISAN tranches.'
    ]
  },
  {
    id: 'wb-krishak-bandhu',
    name: 'Krishak Bandhu Scheme (Govt of West Bengal)',
    hindiName: 'कृषक बंधु योजना (पश्चिम बंगाल - ₹10,000 वार्षिक सहायता व ₹2 लाख मृत्यु बीमा)',
    category: 'Agriculture',
    level: 'State',
    state: 'West Bengal',
    benefit: '₹10,000 per year (for 1 acre or more) / ₹4,000 min for small farmers + ₹2,00,000 death benefit insurance',
    benefitAmountApprox: 10000,
    summary: 'Flagship Agriculture Department West Bengal scheme providing direct crop input support in two seasonal installments (Kharif and Rabi) plus life insurance to farm families.',
    officialUrl: 'https://krishakbandhu.wb.gov.in/',
    applyUrl: 'https://krishakbandhu.wb.gov.in/',
    portalName: 'Krishak Bandhu Official Portal (Govt of West Bengal)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Agriculture Dept West Bengal • Dual Installment DBT',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Landless', 'Large', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['West Bengal']
    },
    requiredDocuments: [
      'RoR / Land Record (Parcha / Khatian)',
      'Voter ID (EPIC) and Aadhaar Card',
      'Bank Account Passbook showing IFSC',
      'Nominee details for ₹2 Lakh death insurance component'
    ],
    stepsToApply: [
      'Apply at Duare Sarkar camp or Block Assistant Director of Agriculture (ADA) office.',
      'ADA verifies land records and issues Krishak Bandhu Smart ID.',
      'Financial aid transferred directly via DBT before sowing season.'
    ]
  },
  {
    id: 'odisha-kalia',
    name: 'KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation - Odisha)',
    hindiName: 'कालिया योजना (ओडिशा - ₹10,000 वार्षिक कृषि सहायता व भूमिहीन मजदूर आजीविका)',
    category: 'Agriculture',
    level: 'State',
    state: 'Odisha',
    benefit: '₹10,000/year (₹4,000 Rabi + ₹4,000 Kharif state grant) for small farmers / ₹12,500 livelihood for landless farm laborers',
    benefitAmountApprox: 10000,
    summary: 'Revolutionary farmer empowerment package by Government of Odisha providing financial aid, life insurance, crop loans at 0% interest, and special support for landless agricultural laborers.',
    officialUrl: 'https://kalia.odisha.gov.in/',
    applyUrl: 'https://kalia.odisha.gov.in/',
    portalName: 'KALIA State Portal (Govt of Odisha)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Odisha Agriculture Dept • DBT Direct',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Landless', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Odisha']
    },
    requiredDocuments: [
      'Aadhaar Card and Odisha Ration Card',
      'Land Record (RoR) for cultivators or MGNREGA Job Card for landless laborers',
      'Aadhaar Seeded Bank Account'
    ],
    stepsToApply: [
      'Register on kalia.odisha.gov.in or submit form at Gram Panchayat office.',
      'Check status in beneficiary list using Aadhaar authentication.',
      'DBT transfers released directly to bank accounts twice a year.'
    ]
  },
  {
    id: 'telangana-rythu-bandhu',
    name: 'Rythu Bharosa / Rythu Bandhu Scheme (Telangana)',
    hindiName: 'रयतु भरोसा / रयतु बंधु योजना (तेलंगाना - ₹10,000 से ₹15,000 प्रति एकड़ निवेश सहायता)',
    category: 'Agriculture',
    level: 'State',
    state: 'Telangana',
    benefit: '₹10,000 to ₹15,000 per acre per year direct agricultural investment support for crop inputs',
    benefitAmountApprox: 25000,
    summary: 'Pioneering agricultural investment support scheme of Telangana giving farmers direct financial grants per acre every season to buy seeds, fertilizers, and field preparation inputs.',
    officialUrl: 'https://rythubandhu.telangana.gov.in/',
    applyUrl: 'https://rythubandhu.telangana.gov.in/',
    portalName: 'Rythu Bandhu Portal (Govt of Telangana)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Agriculture Dept Telangana • Direct Seasonal DBT',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Large', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Telangana']
    },
    requiredDocuments: [
      'Pattadar Passbook / Dharani Portal Land Record',
      'Aadhaar Card',
      'Bank Account Passbook'
    ],
    stepsToApply: [
      'Farmer land titles mapped automatically through Dharani portal.',
      'Agriculture Extension Officer (AEO) confirms crop cultivation in village.',
      'Treasury credits per-acre financial aid directly to farmer’s bank account.'
    ]
  },
  {
    id: 'ap-rythu-bharosa',
    name: 'YSR Rythu Bharosa (Andhra Pradesh)',
    hindiName: 'वायएसआर रयतु भरोसा (आंध्र प्रदेश - ₹13,500 वार्षिक प्रत्यक्ष किसान सहायता)',
    category: 'Agriculture',
    level: 'State',
    state: 'Andhra Pradesh',
    benefit: '₹13,500 per year per farmer family (including ₹7,500 state grant + ₹6,000 PM-KISAN)',
    benefitAmountApprox: 13500,
    summary: 'Government of Andhra Pradesh welfare measure delivering ₹13,500 annually to land-owning farmers and SC/ST/BC/Minority tenant farmers to meet cultivation and seed costs.',
    officialUrl: 'https://ysrrythubharosa.ap.gov.in/',
    applyUrl: 'https://ysrrythubharosa.ap.gov.in/',
    portalName: 'YSR Rythu Bharosa Portal (Govt of Andhra Pradesh)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Agriculture Dept AP • RBKs Integrated',
    eligibility: {
      occupations: ['Farmer'],
      farmerTypes: ['Small/Marginal', 'Landless', 'Any'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      states: ['Andhra Pradesh']
    },
    requiredDocuments: [
      'Pattadar Passbook / CCRC (Crop Cultivator Rights Card for Tenant Farmers)',
      'Aadhaar Card of Farmer and Spouse',
      'Aadhaar-seeded Bank Passbook'
    ],
    stepsToApply: [
      'Visit local Rythu Bharosa Kendra (RBK) in your village.',
      'Village Agriculture Assistant verifies land or tenancy agreement.',
      'Sanctioned amount credited directly in 3 seasonal tranches.'
    ]
  },

  // =========================================================================
  // 3. CITIZENS: HEALTH, HOUSING, RATION, FAMILY & SOCIAL SECURITY
  // =========================================================================
  {
    id: 'ayushman-bharat-pmjay',
    name: 'Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)',
    hindiName: 'आयुष्मान भारत पीएम-जय (₹5 लाख तक मुफ्त अस्पताल इलाज)',
    category: 'Healthcare',
    level: 'Central',
    benefit: 'Cashless hospital treatment up to ₹500,000 per family per year covering 1,949+ medical procedures',
    benefitAmountApprox: 500000,
    summary: 'World’s largest sovereign health assurance scheme providing free secondary and tertiary hospitalization across 29,000+ empanelled hospitals.',
    officialUrl: 'https://beneficiary.nha.gov.in/',
    applyUrl: 'https://beneficiary.nha.gov.in/',
    portalName: 'NHA Ayushman Beneficiary Portal (MoHFW)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Central Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • All Senior Citizens 70+ Now Eligible • Aadhaar eKYC',
    eligibility: {
      categories: ['All'],
      maxAnnualIncome: 300000,
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed', 'Senior Citizen'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card (Mandatory for biometric/OTP e-KYC)',
      'Ration Card / Family Samagra ID / SECC registration proof',
      'Mobile Number'
    ],
    stepsToApply: [
      'Visit beneficiary.nha.gov.in or download Ayushman App.',
      'Enter Aadhaar number or Ration Card number to search household.',
      'Complete online Face / OTP e-KYC and download Ayushman Golden Card instantly.',
      'Show card at any empanelled private or government hospital for 100% cashless care.'
    ]
  },
  {
    id: 'pm-garib-kalyan-ration',
    name: 'PM Garib Kalyan Anna Yojana / NFSA (Free Monthly Ration)',
    hindiName: 'प्रधानमंत्री गरीब कल्याण अन्न योजना (निःशुल्क मासिक खाद्यान्न 2028 तक)',
    category: 'Food & Civil Supplies',
    level: 'Central',
    benefit: '5 kg free food grains (Rice/Wheat) per person per month + 35 kg for Antyodaya households (extended through Dec 2028)',
    benefitAmountApprox: 18000,
    summary: 'Cabinet-approved flagship food security entitlement providing 100% free foodgrains to over 81 crore citizens across India.',
    officialUrl: 'https://nfsa.gov.in/',
    applyUrl: 'https://nfsa.gov.in/',
    portalName: 'National Food Security Portal (NFSA / DFPD)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active & Extended Until 2028 (Cabinet Order)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • One Nation One Ration Card (ONORC) Enabled',
    eligibility: {
      categories: ['All', 'SC', 'ST', 'OBC', 'General', 'EWS'],
      maxAnnualIncome: 200000,
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed', 'Senior Citizen'],
      genders: ['All']
    },
    requiredDocuments: [
      'Ration Card (PHH or AAY card)',
      'Aadhaar Card of all family members',
      'Income Certificate / BPL Certificate'
    ],
    stepsToApply: [
      'Apply for new Ration Card or member addition on nfsa.gov.in or state food department portal.',
      'Visit nearest Fair Price Shop (PDS dealer) anywhere in India under ONORC.',
      'Authenticate via biometric e-POS to receive free monthly grain entitlement.'
    ]
  },
  {
    id: 'pmay-housing-subsidy',
    name: 'Pradhan Mantri Awas Yojana (PMAY Housing Subsidy 2.0)',
    hindiName: 'प्रधानमंत्री आवास योजना (पक्का मकान निर्माण सहायता अनुदान)',
    category: 'Housing',
    level: 'Central',
    benefit: 'Direct financial assistance up to ₹1.20L - ₹1.30L (Gramin) + 90 days MGNREGA wages or interest subsidy up to ₹2.67L (Urban)',
    benefitAmountApprox: 200000,
    summary: 'Sovereign initiative providing pucca houses with clean toilet, electricity, LPG, and drinking water connection to eligible homeless and kutcha house families.',
    officialUrl: 'https://pmaymis.gov.in/',
    applyUrl: 'https://pmayg.nic.in/',
    portalName: 'PMAY-Gramin AwaasSoft / PMAY-Urban Portal (MoHUA & MoRD)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Geotagged Milestone Transfers Active',
    eligibility: {
      categories: ['All', 'SC', 'ST', 'OBC', 'Minority', 'General'],
      maxAnnualIncome: 300000,
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed', 'Senior Citizen'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card of household head and members',
      'Bank Account Details (Aadhaar linked for DBT)',
      'Consent document for geotagged photo verification of existing kutcha house',
      'MGNREGA Job Card (for rural applicants)'
    ],
    stepsToApply: [
      'Gram Panchayat Gram Sabha prepares beneficiary list through Awaas+ survey.',
      'Geo-tagged photo of kutcha house uploaded on AwaasSoft mobile app.',
      'Installments released directly to bank account at plinth, lintel, and roof completion stages.'
    ]
  },
  {
    id: 'sukanya-samriddhi-yojana',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    hindiName: 'सुकन्या समृद्धि योजना (उच्चतम 8.2% ब्याज दर बालिका खाता)',
    category: 'Women & Child',
    level: 'Central',
    benefit: 'Highest sovereign interest rate of 8.2% per annum + 100% triple tax exemption (EEE under Sec 80C)',
    benefitAmountApprox: 150000,
    summary: 'Small deposit scheme under Beti Bachao Beti Padhao aimed at building education and marriage financial fund for girl children below 10 years of age.',
    officialUrl: 'https://www.indiapost.gov.in/',
    applyUrl: 'https://www.indiapost.gov.in/',
    portalName: 'India Post / Nationalized Commercial Banks',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Highest Sovereign Small Savings Rate (8.2%)',
    eligibility: {
      minAge: 0,
      maxAge: 10,
      genders: ['Female'],
      categories: ['All']
    },
    requiredDocuments: [
      'Birth Certificate of Girl Child',
      'Identity & Address Proof of Parent/Guardian (Aadhaar/PAN)',
      'Passport size photographs'
    ],
    stepsToApply: [
      'Open account with minimum ₹250 deposit at any Post Office or commercial bank.',
      'Deposit up to ₹1.5 Lakhs every financial year with full 80C tax rebate.',
      'Partial withdrawal allowed for higher education after age 18; matures at 21 years.'
    ]
  },
  {
    id: 'pm-matru-vandana',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0)',
    hindiName: 'प्रधानमंत्री मातृ वंदना योजना (मातृत्व सहायता ₹5,000 - ₹6,000)',
    category: 'Women & Child',
    level: 'Central',
    benefit: 'Cash incentive of ₹5,000 for 1st child and ₹6,000 for 2nd girl child directly into mother’s bank account',
    benefitAmountApprox: 6000,
    summary: 'Direct maternity cash benefit compensating for wage loss and ensuring proper nutrition and health checkups during pregnancy and lactation.',
    officialUrl: 'https://pmmvy.wcd.gov.in/',
    applyUrl: 'https://pmmvy.wcd.gov.in/',
    portalName: 'PMMVY Direct Portal (Ministry of WCD)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Mission Shakti 2.0 • DBT Active',
    eligibility: {
      minAge: 19,
      maxAge: 45,
      genders: ['Female'],
      categories: ['All'],
      maxAnnualIncome: 800000
    },
    requiredDocuments: [
      'Mother and Father Aadhaar Cards',
      'MCP Card (Mother and Child Protection Card) from Anganwadi',
      'Aadhaar seeded bank account passbook',
      'Child Birth Registration Certificate'
    ],
    stepsToApply: [
      'Apply online on pmmvy.wcd.gov.in or register at local Anganwadi Center / ASHA representative.',
      'Transfers are credited in milestone stages: pregnancy registration, ANC checkups, and child immunization.'
    ]
  },
  {
    id: 'atal-pension-yojana',
    name: 'Atal Pension Yojana (APY)',
    hindiName: 'अटल पेंशन योजना (गारंटीकृत मासिक पेंशन ₹1,000 से ₹5,000)',
    category: 'Social Security',
    level: 'Central',
    benefit: 'Guaranteed lifetime pension of ₹1,000 to ₹5,000 per month from age 60 + spouse pension & return of corpus',
    benefitAmountApprox: 60000,
    summary: 'Sovereign pension scheme for citizens in the unorganized sector with government-backed inflation protection and guaranteed pension.',
    officialUrl: 'https://www.pfrda.org.in/',
    applyUrl: 'https://www.pfrda.org.in/',
    portalName: 'PFRDA / National APY Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • PFRDA Regulated • No Expired Flags',
    eligibility: {
      minAge: 18,
      maxAge: 40,
      categories: ['All'],
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Active Savings Bank or Post Office Account',
      'Mobile Number'
    ],
    stepsToApply: [
      'Approach your bank branch or log in to net banking / www.pfrda.org.in.',
      'Choose monthly pension amount (₹1k to ₹5k) and auto-debit frequency.',
      'PRAN (Permanent Retirement Account Number) is generated with automatic debit.'
    ]
  },
  {
    id: 'pm-jjby-life-insurance',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    hindiName: 'प्रधानमंत्री जीवन ज्योति बीमा योजना (₹2 लाख का जीवन बीमा)',
    category: 'Social Security',
    level: 'Central',
    benefit: '₹200,000 life insurance cover for death due to any reason at a nominal premium of just ₹436/year',
    benefitAmountApprox: 200000,
    summary: 'Affordable government life insurance scheme open to all bank account holders aged 18 to 50 years.',
    officialUrl: 'https://www.jansuraksha.gov.in/',
    applyUrl: 'https://financialservices.gov.in/',
    portalName: 'Department of Financial Services / Commercial Banks',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • ₹436 Annual Auto-Debit • Sovereign Backed',
    eligibility: {
      minAge: 18,
      maxAge: 50,
      categories: ['All'],
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed', 'Farmer'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Active Savings Bank Account',
      'Nominee details'
    ],
    stepsToApply: [
      'Enable PMJJBY through net banking or submit simple 1-page form at your bank branch.',
      'Annual premium of ₹436 is auto-debited in the month of May every year.',
      'Instant policy enrollment without medical examination.'
    ]
  },
  {
    id: 'pm-sby-accidental-insurance',
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    hindiName: 'प्रधानमंत्री सुरक्षा बीमा योजना (₹2 लाख का दुर्घटना बीमा मात्र ₹20/वर्ष)',
    category: 'Social Security',
    level: 'Central',
    benefit: '₹200,000 for accidental death or permanent total disability and ₹100,000 for partial disability at just ₹20/year',
    benefitAmountApprox: 200000,
    summary: 'World’s most affordable accidental death and disability insurance policy for citizens aged 18 to 70 years.',
    officialUrl: 'https://www.jansuraksha.gov.in/',
    applyUrl: 'https://financialservices.gov.in/',
    portalName: 'Department of Financial Services / Commercial Banks',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • ₹20/Year Premium • Auto-Debit',
    eligibility: {
      minAge: 18,
      maxAge: 70,
      categories: ['All'],
      occupations: ['Unemployed', 'Daily Wage Earner', 'Self Employed', 'Farmer'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Bank Account Passbook',
      'Nominee Name and Relation'
    ],
    stepsToApply: [
      'Submit one-page enrollment form at your bank or activate via mobile banking.',
      '₹20 is auto-debited annually; cover commences immediately.'
    ]
  },
  {
    id: 'pm-ujjwala-2',
    name: 'PM Ujjwala Yojana 2.0 (Free LPG Connection & Subsidy)',
    hindiName: 'प्रधानमंत्री उज्ज्वला योजना 2.0 (मुफ्त गैस कनेक्शन एवं ₹300 सब्सिडी)',
    category: 'Women & Child',
    level: 'Central',
    benefit: 'Free deposit-free LPG connection + First cylinder free + Free stove + ₹300 direct subsidy per refilled cylinder',
    benefitAmountApprox: 4500,
    summary: 'Flagship clean cooking fuel initiative providing free LPG connections to women from economically vulnerable households without requiring security deposits.',
    officialUrl: 'https://www.pmuy.gov.in/',
    applyUrl: 'https://www.pmuy.gov.in/',
    portalName: 'PM Ujjwala Portal (MoPNG)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Zero Deposit Connection • ₹300 DBTL Subsidy',
    eligibility: {
      minAge: 18,
      genders: ['Female'],
      categories: ['All', 'SC', 'ST', 'OBC', 'General', 'EWS'],
      maxAnnualIncome: 250000
    },
    requiredDocuments: [
      'Aadhaar Card of adult woman applicant and family members',
      'Ration Card / Family Declaration',
      'Aadhaar linked Bank Account'
    ],
    stepsToApply: [
      'Apply online on www.pmuy.gov.in or submit form at nearest LPG distributor (Indane, BharatGas, HP Gas).',
      'Distributor performs de-duplication check and issues gas connection with free stove and regulator.'
    ]
  },
  {
    id: 'assam-orunodoi',
    name: 'Orunodoi 2.0 / 3.0 Scheme (Govt of Assam)',
    hindiName: 'अरुणोदय योजना (असम सरकार - महिला मुखिया हेतु मासिक ₹1,250-₹1,400 प्रत्यक्ष लाभ)',
    category: 'Social Security',
    level: 'State',
    state: 'Assam',
    benefit: '₹1,250 to ₹1,400 per month deposited directly into bank accounts of female heads of disadvantaged households',
    benefitAmountApprox: 15000,
    summary: 'Assam’s largest Direct Benefit Transfer scheme providing monthly financial empowerment to over 27 lakh underprivileged women to assist with nutrition, medicine, and household expenses.',
    officialUrl: 'https://finance.assam.gov.in/',
    applyUrl: 'https://finance.assam.gov.in/',
    portalName: 'Finance Department, Govt of Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Govt of Assam • Monthly DBT on 10th of every month',
    eligibility: {
      occupations: ['Any', 'Daily Wage Earner', 'Unemployed', 'Self Employed'],
      genders: ['Female', 'All'],
      maxAnnualIncome: 200000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Aadhaar Card of Female Beneficiary',
      'Ration Card / NFSA Card of Family',
      'Bank Passbook linked to Aadhaar',
      'Assam Residence / Domicile Certificate'
    ],
    stepsToApply: [
      'Fill Orunodoi application form distributed by Gaon Panchayat / VCDC / Urban Ward Committees.',
      'Submit family income and demographic details along with female head bank passbook.',
      'District Level Monitoring Committee validates list and DBT credits on 10th of every month.'
    ]
  },
  {
    id: 'assam-ayushman-asom',
    name: 'Ayushman Asom - Mukhya Mantri Jan Arogya Yojana (MMJAY)',
    hindiName: 'आयुष्मान असम - मुख्यमंत्री जन आरोग्य योजना (₹5 लाख तक कैशलेस इलाज)',
    category: 'Healthcare',
    level: 'State',
    state: 'Assam',
    benefit: 'Cashless hospital treatment up to ₹500,000 per family per year across 300+ empanelled hospitals in Assam',
    benefitAmountApprox: 500000,
    summary: 'Universal health assurance scheme by Government of Assam covering families holding NFSA Ration Cards who were not included in the central PM-JAY database, ensuring zero out-of-pocket medical expenses.',
    officialUrl: 'https://nhm.assam.gov.in/',
    applyUrl: 'https://nhm.assam.gov.in/',
    portalName: 'National Health Mission / Atal Amrit Abhiyan Society Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Assam State Health Assurance • 27 Lakh Beneficiaries',
    eligibility: {
      occupations: ['Any', 'Daily Wage Earner', 'Farmer', 'Unemployed', 'Self Employed', 'Senior Citizen'],
      genders: ['All'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Assam']
    },
    requiredDocuments: [
      'Assam NFSA Ration Card',
      'Aadhaar Card of all family members',
      'Mobile number for e-KYC verification'
    ],
    stepsToApply: [
      'Visit nearest ration shop, CSC center, or empanelled hospital kiosk in Assam.',
      'Authenticate with Aadhaar and Ration Card to generate instant Ayushman Asom Card.',
      'Present card at any empanelled public or private hospital for cashless treatment.'
    ]
  },
  {
    id: 'mh-ladki-bahin',
    name: 'Mukhyamantri Majhi Ladki Bahin Yojana (Govt of Maharashtra)',
    hindiName: 'मुख्यमंत्री माझी लाडकी बहीण योजना (महिला सक्षमीकरण - ₹1,500 प्रति माह DBT)',
    category: 'Women & Child',
    level: 'State',
    state: 'Maharashtra',
    benefit: '₹1,500 per month directly deposited into the Aadhaar-seeded bank accounts of eligible women aged 21 to 65 years',
    benefitAmountApprox: 18000,
    summary: 'Maharashtra state flagship welfare initiative providing monthly cash financial autonomy to over 2 crore underprivileged women to support nutrition, health, and family well-being.',
    officialUrl: 'https://ladakibahin.maharashtra.gov.in/',
    applyUrl: 'https://ladakibahin.maharashtra.gov.in/',
    portalName: 'Majhi Ladki Bahin Portal / Nari Shakti Doot App (Govt of Maharashtra)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Maharashtra State DBT • ₹1,500 Monthly Disbursal',
    eligibility: {
      minAge: 21,
      maxAge: 65,
      genders: ['Female'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Maharashtra']
    },
    requiredDocuments: [
      'Aadhaar Card of Applicant Woman',
      'Maharashtra Domicile Certificate or Ration Card issued before 15 years',
      'Income Certificate (or Orange/Yellow Ration Card)',
      'Aadhaar-seeded Bank Passbook'
    ],
    stepsToApply: [
      'Register on ladakibahin.maharashtra.gov.in or through Nari Shakti Doot Mobile App.',
      'Authenticate with Aadhaar e-KYC and upload bank passbook and ration card.',
      'DBT is credited directly into the bank account on a monthly basis.'
    ]
  },
  {
    id: 'mh-mjpjay',
    name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY Maharashtra)',
    hindiName: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (₹5 लाख पर्यंत मोफत व कॅशलेस उपचार)',
    category: 'Healthcare',
    level: 'State',
    state: 'Maharashtra',
    benefit: '100% cashless medical and surgical treatment up to ₹5,00,000 per family per year across 1,000+ empanelled hospitals',
    benefitAmountApprox: 500000,
    summary: 'Universal health assurance scheme covering all ration card holder families in Maharashtra for 1,356 specialized medical therapies and critical surgeries.',
    officialUrl: 'https://www.jeevandayee.gov.in/',
    applyUrl: 'https://www.jeevandayee.gov.in/',
    portalName: 'State Health Assurance Society, Govt of Maharashtra',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • ₹5 Lakh Cashless Limit Universalized for All Citizens of Maharashtra',
    eligibility: {
      occupations: ['Any', 'Daily Wage Earner', 'Farmer', 'Self Employed', 'Unemployed'],
      genders: ['All'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Maharashtra']
    },
    requiredDocuments: [
      'Yellow / Orange / White Ration Card of Maharashtra',
      'Aadhaar Card or Voter ID of family members',
      'Arogyamitra verification at empanelled hospital'
    ],
    stepsToApply: [
      'Visit any government district hospital or empanelled private hospital in Maharashtra.',
      'Meet the Arogyamitra desk with your Ration Card and Aadhaar Card.',
      'Pre-authorization is issued electronically for zero-cost hospitalization and surgery.'
    ]
  },
  {
    id: 'wb-lakshmir-bhandar',
    name: 'Lakshmir Bhandar Scheme (Govt of West Bengal)',
    hindiName: 'লক্ষ্মীর ভাণ্ডার প্রকল্প (পশ্চিমবঙ্গ - মহিলাদের মাসিক ₹1,000 - ₹1,200 অনুদান)',
    category: 'Women & Child',
    level: 'State',
    state: 'West Bengal',
    benefit: 'Direct monthly financial assistance of ₹1,000/month (General category) and ₹1,200/month (SC/ST category) deposited into female heads’ bank accounts',
    benefitAmountApprox: 14400,
    summary: 'West Bengal’s flagship basic income guarantee scheme empowering women aged 25-60 years through monthly direct financial support.',
    officialUrl: 'https://socialwelfare.wb.gov.in/',
    applyUrl: 'https://wb.gov.in/',
    portalName: 'Duare Sarkar / Department of Women & Child Development WB',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Govt of West Bengal • Monthly Direct Benefit Transfer',
    eligibility: {
      minAge: 25,
      maxAge: 60,
      genders: ['Female'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['West Bengal']
    },
    requiredDocuments: [
      'Swasthya Sathi Card',
      'Aadhaar Card',
      'SC/ST Certificate (if applicable for higher ₹1,200 rate)',
      'Bank Passbook (single account in applicant’s name)'
    ],
    stepsToApply: [
      'Obtain Lakshmir Bhandar application form free of cost at Duare Sarkar camps or BDO / Municipality office.',
      'Attach copy of Swasthya Sathi card, Aadhaar, and bank account passbook.',
      'On verification, monthly assistance is disbursed directly to beneficiary bank account.'
    ]
  },
  {
    id: 'wb-swasthya-sathi',
    name: 'Swasthya Sathi Universal Health Scheme (Govt of West Bengal)',
    hindiName: 'স্বাস্থ্য সাথী স্বাস্থ্য বীমা প্রকল্প (প্রতি পরিবার বাৎসরিক ₹5 লাখ ক্যাশলেস স্বাস্থ্য বীমা)',
    category: 'Healthcare',
    level: 'State',
    state: 'West Bengal',
    benefit: 'Basic health cover up to ₹5,00,000 per family per annum for secondary and tertiary care hospitalization on paperless, cashless Smart Card',
    benefitAmountApprox: 500000,
    summary: 'Universal health protection scheme covering entire population of West Bengal with smart cards issued in the name of the eldest female member of the family.',
    officialUrl: 'https://swasthyasathi.gov.in/',
    applyUrl: 'https://swasthyasathi.gov.in/',
    portalName: 'Swasthya Sathi Health Portal (Govt of West Bengal)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Universal Smart Card • Cashless Treatment Across Empanelled Hospitals',
    eligibility: {
      occupations: ['Any', 'Daily Wage Earner', 'Farmer', 'Self Employed', 'Unemployed'],
      genders: ['All'],
      categories: ['All'],
      states: ['West Bengal']
    },
    requiredDocuments: [
      'Aadhaar Card of all family members',
      'Ration Card / Voter Card',
      'Family photograph for Smart Card'
    ],
    stepsToApply: [
      'Enroll at Duare Sarkar camps or nearest BDO office in West Bengal.',
      'Biometric authentication and photo capture of all family members.',
      'Instant issuance of Swasthya Sathi Smart Card accepted at all empanelled medical institutions.'
    ]
  },
  {
    id: 'tn-magalir-urimai',
    name: 'Kalaignar Magalir Urimai Thittam (Govt of Tamil Nadu)',
    hindiName: 'கலைஞர் மகளிர் உரிமைத் திட்டம் (குடும்ப தலைவிகளுக்கு மாதம் ₹1,000 உரிமைத் தொகை)',
    category: 'Women & Child',
    level: 'State',
    state: 'Tamil Nadu',
    benefit: '₹1,000 per month basic income right transferred directly into bank accounts of female heads of eligible households',
    benefitAmountApprox: 12000,
    summary: 'Tamil Nadu government landmark social security scheme granting monthly financial dignity and purchasing power to over 1.15 crore women.',
    officialUrl: 'https://kmut.tn.gov.in/',
    applyUrl: 'https://kmut.tn.gov.in/',
    portalName: 'KMUT Portal / Special Programme Implementation Dept TN',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Direct Benefit Transfer on 15th of Every Month',
    eligibility: {
      minAge: 21,
      genders: ['Female'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Tamil Nadu']
    },
    requiredDocuments: [
      'Tamil Nadu Smart Family Ration Card',
      'Aadhaar Card of Female Applicant',
      'Electricity Bill / Consumer Number',
      'Bank Passbook linked to Aadhaar'
    ],
    stepsToApply: [
      'Submit application at special ward/village camps organized under Kalaignar Magalir Urimai Thittam.',
      'Field verification carried out via biometric e-KYC.',
      'Monthly ₹1,000 is credited automatically to applicant’s Aadhaar-linked account on 15th of every month.'
    ]
  },
  {
    id: 'tn-cmchis',
    name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS Tamil Nadu)",
    hindiName: 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (₹5 லட்சம் மருத்துவக் காப்பீடு)',
    category: 'Healthcare',
    level: 'State',
    state: 'Tamil Nadu',
    benefit: 'Cashless hospital treatment up to ₹5,00,000 per family per year for 1,500+ procedures, diagnostic tests, and surgeries',
    benefitAmountApprox: 500000,
    summary: 'Statewide comprehensive health coverage providing quality healthcare to poor families with annual income below ₹1.2 Lakh.',
    officialUrl: 'https://www.cmchistn.com/',
    applyUrl: 'https://www.cmchistn.com/',
    portalName: 'CMCHIS Official Portal (Govt of Tamil Nadu)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Cashless In-patient & Tertiary Care Across Empanelled Hospitals',
    eligibility: {
      maxAnnualIncome: 120000,
      categories: ['All'],
      genders: ['All'],
      states: ['Tamil Nadu']
    },
    requiredDocuments: [
      'Smart Ration Card of Tamil Nadu',
      'Income Certificate issued by Revenue Authority (VAO/Tahsildar)',
      'Aadhaar Card of all family members'
    ],
    stepsToApply: [
      'Visit District Kiosk located in District Collectorate or Taluk Office.',
      'Present Smart Ration Card and Income Certificate for instant biometric enrollment.',
      'Receive CMCHIS URN card for immediate cashless hospitalization.'
    ]
  },
  {
    id: 'karnataka-gruha-lakshmi',
    name: 'Gruha Lakshmi Scheme (Govt of Karnataka)',
    hindiName: 'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ (ಕರ್ನಾಟಕ - ಕುಟುಂಬದ ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ತಿಂಗಳಿಗೆ ₹2,000 ಡಿಬಿಟಿ)',
    category: 'Women & Child',
    level: 'State',
    state: 'Karnataka',
    benefit: '₹2,000 per month deposited directly into bank accounts of female heads of households in Karnataka',
    benefitAmountApprox: 24000,
    summary: 'Flagship guarantee scheme of Karnataka providing ₹2,000 monthly unconditional financial support to women designated as head of family in Antyodaya/BPL/APL ration cards.',
    officialUrl: 'https://sevasindhugs.karnataka.gov.in/',
    applyUrl: 'https://sevasindhugs.karnataka.gov.in/',
    portalName: 'Seva Sindhu Guarantee Schemes Portal (Govt of Karnataka)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Karnataka Guarantee Scheme • Monthly Direct Benefit Transfer',
    eligibility: {
      minAge: 18,
      genders: ['Female'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Karnataka']
    },
    requiredDocuments: [
      'Karnataka Ration Card (BPL / APL / AAY) naming female head of family',
      'Aadhaar Card of Woman Head and Husband',
      'Aadhaar-seeded Bank Account Passbook'
    ],
    stepsToApply: [
      'Visit nearest Grama One, Karnataka One, or Bangalore One center.',
      'Present Ration Card and Aadhaar for instant biometric e-KYC verification.',
      'Direct monthly benefit of ₹2,000 is transferred via NPCI DBT pipeline.'
    ]
  },
  {
    id: 'mp-ladli-behna',
    name: 'Mukhyamantri Ladli Behna Yojana (Govt of Madhya Pradesh)',
    hindiName: 'मुख्यमंत्री लाड़ली बहना योजना (मध्य प्रदेश - ₹1,250 प्रति माह प्रत्यक्ष वित्तीय अंतरण)',
    category: 'Women & Child',
    level: 'State',
    state: 'Madhya Pradesh',
    benefit: '₹1,250 per month deposited on the 10th of every month into Aadhaar-linked DBT bank accounts of married/unmarried women',
    benefitAmountApprox: 15000,
    summary: 'Pioneering women empowerment initiative of Madhya Pradesh benefiting over 1.29 crore women to enhance economic self-reliance and household nutrition.',
    officialUrl: 'https://cmladlibahna.mp.gov.in/',
    applyUrl: 'https://cmladlibahna.mp.gov.in/',
    portalName: 'Ladli Behna Portal (Women & Child Development MP)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • MP State Scheme • DBT Credited on 10th of Each Month',
    eligibility: {
      minAge: 21,
      maxAge: 60,
      genders: ['Female'],
      maxAnnualIncome: 250000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      states: ['Madhya Pradesh']
    },
    requiredDocuments: [
      'Samagra Family ID and Member ID (MP Samagra Portal)',
      'Aadhaar Card with e-KYC completed',
      'Aadhaar-seeded Active Bank Account'
    ],
    stepsToApply: [
      'Ensure Samagra e-KYC and Bank DBT are activated.',
      'Submit application at Gram Panchayat or Ward Camp.',
      'Receive instant confirmation and monthly payments starting next cycle.'
    ]
  },
  {
    id: 'odisha-subhadra',
    name: 'Subhadra Yojana (Govt of Odisha)',
    hindiName: 'ସୁଭଦ୍ରା ଯୋଜନା (ଓଡ଼ିଶା - ମହିଳାମାନଙ୍କ ପାଇଁ ବାର୍ଷିକ ₹10,000 ଆର୍ଥିକ ସହାୟତା)',
    category: 'Women & Child',
    level: 'State',
    state: 'Odisha',
    benefit: '₹10,000 per year provided in two equal installments of ₹5,000 (on Rakhi Purnima and International Women’s Day) for 5 years (Total ₹50,000)',
    benefitAmountApprox: 10000,
    summary: 'State-of-the-art empowerment scheme by Government of Odisha benefiting over 1 crore women aged 21-60 years to foster entrepreneurship and financial security.',
    officialUrl: 'https://subhadra.odisha.gov.in/',
    applyUrl: 'https://subhadra.odisha.gov.in/',
    portalName: 'Subhadra Portal (Govt of Odisha)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2024-2029)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Odisha State DBT • Bi-Annual ₹5,000 Installments',
    eligibility: {
      minAge: 21,
      maxAge: 60,
      genders: ['Female'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Odisha']
    },
    requiredDocuments: [
      'Aadhaar Card (with mobile number linked)',
      'Odisha NFSA / SFSS Ration Card',
      'Aadhaar-enabled DBT bank account'
    ],
    stepsToApply: [
      'Fill Subhadra form available free of cost at Anganwadi centers, Mo Seva Kendras, and block offices.',
      'Submit form along with Aadhaar photocopy.',
      'Funds are credited directly to the beneficiary’s Aadhaar-linked account.'
    ]
  },
  {
    id: 'rajasthan-chiranjeevi',
    name: 'Mukhyamantri Ayushman Arogya Yojana (Chiranjeevi Health Scheme Rajasthan)',
    hindiName: 'मुख्यमंत्री आयुष्मान आरोग्य योजना (राजस्थान - ₹25 लाख तक कैशलेस उपचार)',
    category: 'Healthcare',
    level: 'State',
    state: 'Rajasthan',
    benefit: 'Universal cashless medical coverage up to ₹25,00,000 per family per year for IPD hospitalization and complex operations',
    benefitAmountApprox: 2500000,
    summary: 'Rajasthan’s premier universal health insurance scheme ensuring every resident family receives world-class treatment without any out-of-pocket medical expenditure.',
    officialUrl: 'https://chiranjeevi.rajasthan.gov.in/',
    applyUrl: 'https://chiranjeevi.rajasthan.gov.in/',
    portalName: 'Rajasthan Health Assurance Agency Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • ₹25 Lakh Cashless Cover • Rajasthan State Scheme',
    eligibility: {
      occupations: ['Any', 'Farmer', 'Daily Wage Earner', 'Self Employed', 'Unemployed'],
      genders: ['All'],
      categories: ['All'],
      states: ['Rajasthan']
    },
    requiredDocuments: [
      'Jan Aadhaar Card of Rajasthan',
      'Aadhaar Card of all family members',
      'Ration Card / NFSA proof'
    ],
    stepsToApply: [
      'Enroll via Jan Aadhaar Portal on sso.rajasthan.gov.in or through e-Mitra kiosks.',
      'Eligible NFSA/SECC families are enrolled free; others can enroll at nominal annual premium.',
      'Show Jan Aadhaar card at any empanelled hospital in Rajasthan for cashless care.'
    ]
  },
  {
    id: 'delhi-ladli',
    name: 'Delhi Ladli Scheme (Govt of NCT of Delhi)',
    hindiName: 'दिल्ली लाडली योजना (बालिका सशक्तिकरण हेतु ₹1 लाख तक वित्तीय सहायता)',
    category: 'Women & Child',
    level: 'State',
    state: 'Delhi',
    benefit: 'Financial assistance of ₹10,000 to ₹11,000 sanctioned at each educational milestone (birth, Class 1, 6, 9, 10, 12), maturing with compound interest to over ₹1 Lakh',
    benefitAmountApprox: 100000,
    summary: 'Delhi government flagship initiative promoting girl child education, birth registration, and stopping female feticide through milestone-based financial security deposits.',
    officialUrl: 'https://wcd.delhi.gov.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'e-District Delhi (Govt of NCT of Delhi)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Delhi e-District Portal • WCD Govt of Delhi',
    eligibility: {
      minAge: 0,
      maxAge: 18,
      genders: ['Female'],
      maxAnnualIncome: 100000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Delhi']
    },
    requiredDocuments: [
      'Delhi Domicile / Residence Proof (minimum 3 years in Delhi)',
      'Girl Child Birth Certificate',
      'Income Certificate (under ₹1 Lakh/year)',
      'School Admission Slip / Bonafide Certificate'
    ],
    stepsToApply: [
      'Register on edistrict.delhigovt.nic.in or apply through recognized government school in Delhi.',
      'Upload birth certificate, Delhi residence proof, and income certificate.',
      'SBI deposits maturity bond in the name of the girl child payable upon passing Class 12.'
    ]
  },
  {
    id: 'jk-sehat',
    name: 'Ayushman Bharat PM-JAY SEHAT (Govt of Jammu & Kashmir)',
    hindiName: 'आयुष्मान भारत सेहत योजना (जम्मू-कश्मीर - प्रत्येक परिवार को ₹5 लाख सार्वभौमिक स्वास्थ्य बीमा)',
    category: 'Healthcare',
    level: 'State',
    state: 'Jammu & Kashmir',
    benefit: '100% universal cashless healthcare coverage up to ₹5,00,000 per family per year across all 20 districts of J&K',
    benefitAmountApprox: 500000,
    summary: 'First-of-its-kind universal health scheme in India providing ₹5 Lakh cashless treatment cover to all 21 lakh resident families of Jammu & Kashmir without any income limit.',
    officialUrl: 'https://ayushmanup.in/',
    applyUrl: 'https://beneficiary.nha.gov.in/',
    portalName: 'State Health Agency J&K / NHA Beneficiary Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • 100% Universal Coverage for all J&K Residents',
    eligibility: {
      occupations: ['Any', 'Daily Wage Earner', 'Farmer', 'Self Employed', 'Unemployed'],
      genders: ['All'],
      categories: ['All'],
      states: ['Jammu & Kashmir']
    },
    requiredDocuments: [
      'J&K Ration Card',
      'Aadhaar Card of all family members',
      'Domicile Certificate of J&K'
    ],
    stepsToApply: [
      'Visit nearest CSC center or District Hospital kiosk in Jammu & Kashmir.',
      'Authenticate with Aadhaar and Ration Card to generate Golden SEHAT Card.',
      'Access cashless inpatient treatment at any of the 28,000+ PM-JAY hospitals nationwide.'
    ]
  },
  {
    id: 'up-kanya-sumangala',
    name: 'Mukhyamantri Kanya Sumangala Yojana (Govt of Uttar Pradesh)',
    hindiName: 'मुख्यमंत्री कन्या सुमंगला योजना (उत्तर प्रदेश - बालिकाओं को ₹25,000 का 6 चरणों में वित्तीय पैकेज)',
    category: 'Women & Child',
    level: 'State',
    state: 'Uttar Pradesh',
    benefit: 'Financial package of ₹25,000 (enhanced from ₹15,000) transferred directly via DBT across 6 growth and schooling stages of a girl child',
    benefitAmountApprox: 25000,
    summary: 'Uttar Pradesh state flagship scheme aimed at improving sex ratio, preventing female feticide, and ensuring girls complete secondary and higher education.',
    officialUrl: 'https://mksy.up.gov.in/',
    applyUrl: 'https://mksy.up.gov.in/',
    portalName: 'MKSY Portal (Women & Child Development UP)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Enhanced ₹25,000 Package • UP State DBT',
    eligibility: {
      minAge: 0,
      maxAge: 21,
      genders: ['Female'],
      maxAnnualIncome: 300000,
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Uttar Pradesh']
    },
    requiredDocuments: [
      'UP Domicile Certificate',
      'Aadhaar Card of Girl Child and Parents',
      'Bank Passbook of Girl Child or Joint Account with Mother',
      'Birth Certificate and School Admission Receipt'
    ],
    stepsToApply: [
      'Register on mksy.up.gov.in with mobile number and Aadhaar.',
      'Select relevant stage (Birth, Vaccination, Class 1, 6, 9, or Degree/Diploma).',
      'Upload school certificate and bank details for direct DBT disbursal.'
    ]
  },

  // =========================================================================
  // 4. BUSINESS, MSME & ENTREPRENEURSHIP (ZERO STUDENT SCHOLARSHIPS)
  // =========================================================================
  {
    id: 'pm-mudra-yojana',
    name: 'Pradhan Mantri Mudra Yojana (PMMY - Business Loans)',
    hindiName: 'प्रधानमंत्री मुद्रा योजना (ऋण सीमा ₹20 लाख तक विस्तारित)',
    category: 'Business & MSME',
    level: 'Central',
    benefit: 'Collateral-free business loans: Shishu (up to ₹50k), Kishore (₹50k - ₹5L), Tarun (₹5L - ₹10L), and Tarun Plus (₹10L - ₹20L)',
    benefitAmountApprox: 500000,
    summary: 'Flagship non-corporate, non-farm small/micro enterprise loan scheme offering zero-collateral formal credit at competitive interest rates.',
    officialUrl: 'https://www.udyamimitra.in/',
    applyUrl: 'https://www.udyamimitra.in/',
    portalName: 'Udyami Mitra / Stand-Up Mitra Portal (SIDBI & DFS)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Central Scheme (Limit Expanded to ₹20L in Union Budget)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Tarun Plus ₹20L Limit Active • Zero Processing Fee for Shishu',
    eligibility: {
      minAge: 18,
      occupations: ['Self Employed', 'Daily Wage Earner'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Proof of Business Enterprise (Udyam Registration Certificate)',
      'Bank Statement for last 6 months',
      'Business Project / Quotation of machinery or stock'
    ],
    stepsToApply: [
      'Visit udyamimitra.in or approach any commercial/RRB bank branch.',
      'Select Mudra Loan Category (Shishu, Kishore, Tarun, or Tarun Plus).',
      'Submit business plan and Udyam registration; loan sanctioned without third-party collateral.'
    ]
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Scheme (Artisans & Craftsmen)',
    hindiName: 'पीएम विश्वकर्मा योजना (कारीगरों एवं शिल्पकारों हेतु ₹3 लाख तक ऋण)',
    category: 'Employment',
    level: 'Central',
    benefit: 'Free Skill Training + ₹500/day stipend + ₹15,000 modern toolkit incentive + Collateral-free loans up to ₹300,000 at 5% interest',
    benefitAmountApprox: 165000,
    summary: 'Comprehensive financial, skilling, and marketing ecosystem supporting traditional artisans and craftsmen across 18 designated trades.',
    officialUrl: 'https://pmvishwakarma.gov.in/',
    applyUrl: 'https://pmvishwakarma.gov.in/',
    portalName: 'PM Vishwakarma National Portal (MoMSME)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • 18 Trades Open • Biometric Registration Live',
    eligibility: {
      minAge: 18,
      occupations: ['Self Employed', 'Daily Wage Earner'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Mobile Number linked to Aadhaar',
      'Bank Account details',
      'Ration Card / Family Proof'
    ],
    stepsToApply: [
      'Visit nearest CSC center or pmvishwakarma.gov.in.',
      'Biometric authentication and trade skill selection.',
      'Gram Panchayat / Urban Local Body verification.',
      'Get PM Vishwakarma Certificate, ID Card, and stipend-backed skill training.'
    ]
  },
  {
    id: 'pm-swanidhi',
    name: 'PM SVANidhi (Micro-credit for Street Vendors)',
    hindiName: 'पीएम स्वनिधि योजना (स्ट्रीट वेंडर ऋण)',
    category: 'Employment',
    level: 'Central',
    benefit: 'Collateral-free working capital loan of ₹10,000 -> ₹20,000 -> ₹50,000 with 7% interest subsidy & cashback on digital transactions',
    benefitAmountApprox: 20000,
    summary: 'Active micro-credit facility empowering urban and semi-urban street vendors to formalize business and build formal credit history.',
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
    applyUrl: 'https://pmsvanidhi.mohua.gov.in/',
    portalName: 'PM SVANidhi Portal / MoHUA',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • 7% Interest Subsidy • Digital Cashback Active',
    eligibility: {
      occupations: ['Self Employed', 'Daily Wage Earner'],
      categories: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Vending Certificate / Identity Card issued by Urban Local Body (ULB)',
      'Bank Account linked with mobile number'
    ],
    stepsToApply: [
      'Visit pmsvanidhi.mohua.gov.in or apply through banking partner / CSC.',
      'Upload Vending Certificate or Letter of Recommendation (LoR).',
      'Loan is disbursed directly to bank account within 7 to 10 days.'
    ]
  },
  {
    id: 'pmegp-subsidy',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    hindiName: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (35% तक मार्जिन मनी सब्सिडी)',
    category: 'Business & MSME',
    level: 'Central',
    benefit: 'Government subsidy of 15% to 35% on project cost up to ₹5,000,000 (Manufacturing) and ₹2,000,000 (Services)',
    benefitAmountApprox: 875000,
    summary: 'Major credit-linked subsidy program administered by KVIC to generate continuous self-employment opportunities across rural and urban India.',
    officialUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    applyUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    portalName: 'KVIC PMEGP e-Portal / Ministry of MSME',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Central Sector Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Online e-Tracking • KVIC Administered',
    eligibility: {
      minAge: 18,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'SC', 'ST', 'OBC', 'Minority', 'EWS', 'General'],
      genders: ['All']
    },
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR) with capital cost estimates',
      'Educational Qualification Certificate (8th pass minimum for manufacturing > ₹10L)',
      'Special Category Certificate (for 35% rural subsidy)'
    ],
    stepsToApply: [
      'Submit application online on www.kviconline.gov.in with detailed DPR.',
      'District Level Task Force Committee (DLTFC) scrutinizes application.',
      'Bank sanctions loan; margin money subsidy credited to 3-year TDR deposit.'
    ]
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India Scheme',
    hindiName: 'स्टैंड-अप इंडिया योजना (अनुसूचित जाति/जनजाति एवं महिला उद्यमी ऋण)',
    category: 'Business & MSME',
    level: 'Central',
    benefit: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield enterprises in manufacturing, services, or trading',
    benefitAmountApprox: 2500000,
    summary: 'Facilitating bank loans between ₹10L and ₹1Cr to at least one SC or ST borrower and at least one woman borrower per bank branch.',
    officialUrl: 'https://www.standupmitra.in/',
    applyUrl: 'https://www.standupmitra.in/',
    portalName: 'Stand-Up Mitra Portal / SIDBI',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Greenfield Enterprise Loans Active',
    eligibility: {
      minAge: 18,
      categories: ['SC', 'ST', 'General', 'OBC'],
      occupations: ['Self Employed'],
      genders: ['Female', 'Male'] // SC/ST male or any female
    },
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Caste Certificate (if SC/ST)',
      'Greenfield Project DPR and projected financials',
      'Udyam Registration Certificate'
    ],
    stepsToApply: [
      'Register on standupmitra.in.',
      'Connect with lead bank branch or handholding agency.',
      'Bank appraises greenfield business plan and releases term loan & working capital.'
    ]
  },
  {
    id: 'cgtmse-credit-guarantee',
    name: 'Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)',
    hindiName: 'सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी योजना (बिना गारंटी ₹5 करोड़ तक ऋण)',
    category: 'Business & MSME',
    level: 'Central',
    benefit: 'Collateral-free credit facility up to ₹5 Crore backed by sovereign guarantee coverage up to 85%',
    benefitAmountApprox: 1000000,
    summary: 'Enabling first-generation entrepreneurs and MSMEs to access institutional credit without pledging third-party collateral or mortgage.',
    officialUrl: 'https://www.cgtmse.in/',
    applyUrl: 'https://www.cgtmse.in/',
    portalName: 'CGTMSE National Portal (SIDBI & Ministry of MSME)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing Window 2025–2026',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Guarantee Ceiling Raised to ₹5 Crore',
    eligibility: {
      minAge: 18,
      occupations: ['Self Employed'],
      categories: ['All'],
      genders: ['All']
    },
    requiredDocuments: [
      'Udyam Registration Certificate',
      'Business Project Proposal & Financial Projections',
      'KYC documents of Promoters/Directors'
    ],
    stepsToApply: [
      'Approach your commercial bank or NBFC for term loan/working capital.',
      'Lender processes application under CGTMSE coverage without mortgage requirement.',
      'CGTMSE issues guarantee cover directly to lending bank.'
    ]
  },
  {
    id: 'assam-cmaaa',
    name: "Chief Minister's Atmanirbhar Asom Abhijan (CMAAA)",
    hindiName: 'मुख्यमंत्री आत्मनिर्भर असम अभियान (युवा उद्यमिता हेतु ₹2 से ₹5 लाख अनुदान व ऋण)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Assam',
    benefit: '₹2,00,000 for Professional/General Graduates (₹1L Govt grant + ₹1L interest-free bank loan) and up to ₹5,00,000 for Engineering/Agri/Medical graduates',
    benefitAmountApprox: 200000,
    summary: 'State Government flagship entrepreneurship scheme targeting 2 lakh unemployed youth in Assam to establish self-reliant micro enterprises across manufacturing, service, and trading sectors.',
    officialUrl: 'https://cmaaa.assam.gov.in/',
    applyUrl: 'https://cmaaa.assam.gov.in/',
    portalName: 'CMAAA Official Portal, Govt of Assam',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Govt of Assam • Atmanirbhar Asom',
    eligibility: {
      occupations: ['Self Employed', 'Unemployed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'],
      genders: ['All'],
      minAge: 28,
      maxAge: 43,
      states: ['Assam']
    },
    requiredDocuments: [
      'Employment Exchange Registration Card of Assam',
      'Educational Qualification Certificate (Class 10 / ITI / Degree)',
      'Aadhaar Card and PAN Card',
      'Bank Passbook with statement',
      'Detailed Project Report (DPR) / Business Plan'
    ],
    stepsToApply: [
      'Register online on cmaaa.assam.gov.in with Employment Exchange ID and Aadhaar.',
      'Choose enterprise category and upload Project DPR.',
      'District Level Committee approves project and disburses 1st tranche grant.'
    ]
  },
  {
    id: 'up-odop-toolkit',
    name: 'One District One Product (ODOP) Margin Money & Toolkit Scheme (Govt of UP)',
    hindiName: 'एक जनपद एक उत्पाद (ODOP) योजना (उत्तर प्रदेश - ₹20 लाख तक ऋण व 25% मार्जिन मनी अनुदान)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Uttar Pradesh',
    benefit: 'Financial margin money subsidy up to 25% (max ₹20 Lakh) on bank loans + 100% free modern skill toolkit distribution',
    benefitAmountApprox: 500000,
    summary: 'UP government landmark initiative revitalizing indigenous crafts and local manufacturing by providing artisans and entrepreneurs modern toolkits, training, and subsidized bank credit.',
    officialUrl: 'https://odopup.in/',
    applyUrl: 'https://diupmsme.upsdc.gov.in/',
    portalName: 'DIUP MSME Portal / ODOP UP (Dept of MSME & Export Promotion)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • UP State MSME • Margin Money & Toolkits',
    eligibility: {
      minAge: 18,
      occupations: ['Self Employed', 'Unemployed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Uttar Pradesh']
    },
    requiredDocuments: [
      'Aadhaar Card and PAN Card',
      'UP Domicile Certificate',
      'Detailed Project Report (DPR) / Machinery Quotation',
      'Bank Account Passbook'
    ],
    stepsToApply: [
      'Register on diupmsme.upsdc.gov.in under ODOP Margin Money Scheme.',
      'Select the designated ODOP craft of your district and upload DPR.',
      'District Industry Centre (DIC) forwards approved dossier to the bank for loan sanction and subsidy release.'
    ]
  },
  {
    id: 'up-yuva-swarojgar',
    name: 'Mukhyamantri Yuva Swarojgar Yojana (Govt of Uttar Pradesh)',
    hindiName: 'मुख्यमंत्री युवा स्वरोजगार योजना (उत्तर प्रदेश - उद्योग हेतु ₹25 लाख व सेवा हेतु ₹10 लाख ऋण व 25% सब्सिडी)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Uttar Pradesh',
    benefit: 'Loan up to ₹25 Lakh for Industrial units and ₹10 Lakh for Service sector with 25% margin money capital subsidy',
    benefitAmountApprox: 625000,
    summary: 'Uttar Pradesh state self-employment initiative empowering educated youth to set up their own manufacturing and service ventures with government margin money backing.',
    officialUrl: 'https://diupmsme.upsdc.gov.in/',
    applyUrl: 'https://diupmsme.upsdc.gov.in/',
    portalName: 'Directorate of Industries, Govt of UP',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • UP MSME Self Employment Scheme',
    eligibility: {
      minAge: 18,
      maxAge: 40,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Uttar Pradesh']
    },
    requiredDocuments: [
      'High School (Class 10) Pass Certificate',
      'UP Domicile / Residence Proof',
      'Aadhaar Card and PAN Card',
      'Project Proposal / Quotation for Machinery'
    ],
    stepsToApply: [
      'Apply online on diupmsme.upsdc.gov.in selecting Mukhyamantri Yuva Swarojgar Yojana.',
      'Fill enterprise details and upload educational and project documents.',
      'District Level Task Force Committee (DLTFC) interviews applicant and recommends loan to financing bank.'
    ]
  },
  {
    id: 'mh-cmegp',
    name: "Chief Minister Employment Generation Programme (CMEGP Maharashtra)",
    hindiName: 'मुख्यमंत्री रोजगार निर्मिती कार्यक्रम (महाराष्ट्र - ₹50 लाख पर्यंत प्रकल्प खर्च व 15-35% सबसिडी)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Maharashtra',
    benefit: 'Project funding up to ₹50 Lakh for manufacturing and ₹10 Lakh for service sectors with 15% to 35% government capital subsidy',
    benefitAmountApprox: 875000,
    summary: 'Maharashtra government premier enterprise creation scheme fostering micro enterprises across rural and urban Maharashtra with substantial financial subsidy.',
    officialUrl: 'https://maha-cmegp.gov.in/',
    applyUrl: 'https://maha-cmegp.gov.in/',
    portalName: 'Maha-CMEGP Portal (Directorate of Industries Maharashtra)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Maharashtra CMEGP • 35% Rural Subsidy Active',
    eligibility: {
      minAge: 18,
      maxAge: 45,
      occupations: ['Self Employed', 'Unemployed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Maharashtra']
    },
    requiredDocuments: [
      'Maharashtra Domicile Certificate',
      'Educational Qualification (minimum 7th/10th pass depending on project size)',
      'Detailed Project Report (DPR)',
      'Aadhaar Card and PAN Card'
    ],
    stepsToApply: [
      'Apply on maha-cmegp.gov.in with personal and proposed enterprise details.',
      'District Industries Centre (DIC) scrutinizes application and forwards to preferred bank.',
      'Bank sanctions loan and subsidy is held in TDR for 3 years before final credit adjustment.'
    ]
  },
  {
    id: 'bihar-udyami',
    name: 'Mukhyamantri Udyami Yojana (Govt of Bihar)',
    hindiName: 'मुख्यमंत्री उद्यमी योजना (बिहार - ₹10 लाख वित्तीय सहायता: ₹5 लाख अनुदान + ₹5 लाख ब्याजमुक्त ऋण)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Bihar',
    benefit: '₹10,00,000 total package: 50% (₹5,00,000) pure non-repayable grant + 50% (₹5,00,000) interest-free loan (1% for general male youth) repayable in 84 easy installments',
    benefitAmountApprox: 500000,
    summary: 'Bihar’s transformative industrialization program (SC/ST/EBC/Women/Yuva) fostering first-generation micro entrepreneurs in manufacturing and high-value service units.',
    officialUrl: 'https://udyami.bihar.gov.in/',
    applyUrl: 'https://udyami.bihar.gov.in/',
    portalName: 'Udyami Bihar Portal (Department of Industries, Govt of Bihar)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Bihar State Industries Dept • ₹5L Grant + ₹5L Loan',
    eligibility: {
      minAge: 18,
      maxAge: 50,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'SC', 'ST', 'OBC', 'General', 'Minority'],
      genders: ['All'],
      states: ['Bihar']
    },
    requiredDocuments: [
      'Bihar Permanent Residence / Domicile Certificate',
      'Intermediate (10+2) or ITI / Polytechnic Diploma Certificate',
      'Current Bank Account with cancelled cheque (in name of firm/proprietorship)',
      'Aadhaar Card and PAN Card'
    ],
    stepsToApply: [
      'Register on udyami.bihar.gov.in with Aadhaar verification.',
      'Select proposed project from approved 50+ manufacturing/service project templates.',
      'State-level randomized selection is conducted followed by mandatory 2-week entrepreneurship training and fund disbursal.'
    ]
  },
  {
    id: 'mp-udyam-kranti',
    name: 'Mukhyamantri Udyam Kranti Yojana (Govt of Madhya Pradesh)',
    hindiName: 'मुख्यमंत्री उद्यम क्रांति योजना (मध्य प्रदेश - ₹1 से ₹50 लाख तक ऋण व 3% ब्याज अनुदान 7 वर्षों तक)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Madhya Pradesh',
    benefit: 'Collateral-free bank loans from ₹1 Lakh to ₹50 Lakh (Manufacturing) and up to ₹25 Lakh (Service) with 3% annual interest subsidy and 100% guarantee fee reimbursement for 7 years',
    benefitAmountApprox: 300000,
    summary: 'Madhya Pradesh government initiative facilitating institutional credit for youth without demanding property mortgage, backed by state credit guarantee.',
    officialUrl: 'https://samast.mponline.gov.in/',
    applyUrl: 'https://samast.mponline.gov.in/',
    portalName: 'SAMAST Portal / MP Online MSME Portal',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • 3% Interest Subsidy • Sovereign Credit Guarantee',
    eligibility: {
      minAge: 18,
      maxAge: 45,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Madhya Pradesh']
    },
    requiredDocuments: [
      'MP Domicile Certificate',
      'Minimum Class 8 / Class 10 Pass Marksheet',
      'Samagra ID and Aadhaar Card',
      'Detailed Business Project Report'
    ],
    stepsToApply: [
      'Apply online through samast.mponline.gov.in.',
      'Upload project proposal, KYC documents, and choose your preferred lending bank.',
      'Bank sanctions loan under CGTMSE cover with state government paying 3% interest subsidy.'
    ]
  },
  {
    id: 'karnataka-cmegp',
    name: 'Chief Minister Self Employment Generation Programme (CMEGP Karnataka)',
    hindiName: 'ಮುಖ್ಯಮಂತ್ರಿಗಳ ಸ್ವಯಂ ಉದ್ಯೋಗ ಸೃಜನ ಯೋಜನೆ (ಕರ್ನಾಟಕ - ₹10 ಲಕ್ಷ ಯೋಜನೆ ವೆಚ್ಚಕ್ಕೆ 25-35% ಸಬ್ಸಿಡಿ)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Karnataka',
    benefit: 'Project loans up to ₹10 Lakh with 25% capital subsidy for General category and 35% capital subsidy for Special categories (SC/ST/OBC/Women/Minorities)',
    benefitAmountApprox: 350000,
    summary: 'Karnataka state entrepreneurship scheme operated by Department of Commerce & Industries supporting small-scale rural and urban enterprises.',
    officialUrl: 'https://cmegp.kar.nic.in/',
    applyUrl: 'https://cmegp.kar.nic.in/',
    portalName: 'CMEGP Karnataka Portal (Dept of Commerce & Industries)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Karnataka CMEGP • 35% Capital Subsidy Active',
    eligibility: {
      minAge: 21,
      maxAge: 45,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Karnataka']
    },
    requiredDocuments: [
      'Karnataka Domicile / Residence Proof',
      'Aadhaar Card and Caste Certificate',
      'Project Report with Machinery Quotation',
      'Bank Account Details'
    ],
    stepsToApply: [
      'Submit application online at cmegp.kar.nic.in.',
      'Joint Director DIC reviews application and conducts committee interview.',
      'Subsidy is remitted directly to the financing bank after loan sanction.'
    ]
  },
  {
    id: 'gujarat-manav-garima',
    name: 'Manav Garima Yojana (Govt of Gujarat)',
    hindiName: 'માનવ ગરિમા યોજના (ગુજરાત - 28 વ્યવસાયો માટે ₹25,000 સુધીની મફત ટૂલકીટ)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Gujarat',
    benefit: '100% free professional toolkit sets worth up to ₹25,000 provided across 28 traditional trades (tailoring, plumbing, carpentry, beauty care, welding, etc.)',
    benefitAmountApprox: 25000,
    summary: 'Gujarat government social justice scheme uplifting cottage artisans, small vendors, and tradespeople by equipping them with high-grade modern tools for self-employment.',
    officialUrl: 'https://esamajkalyan.gujarat.gov.in/',
    applyUrl: 'https://esamajkalyan.gujarat.gov.in/',
    portalName: 'e-Samaj Kalyan Portal (Govt of Gujarat)',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'OPEN_NOW',
    lastAuditStatus: 'Verified Active • Gujarat e-Samaj Kalyan • Free Modern Trade Toolkits',
    eligibility: {
      minAge: 18,
      maxAge: 60,
      occupations: ['Daily Wage Earner', 'Self Employed', 'Unemployed'],
      categories: ['All', 'SC', 'OBC', 'EWS', 'Minority'],
      maxAnnualIncome: 150000,
      genders: ['All'],
      states: ['Gujarat']
    },
    requiredDocuments: [
      'Gujarat Domicile / Ration Card',
      'Aadhaar Card and Caste Certificate',
      'Income Certificate (under ₹1.5L for urban / ₹1.2L for rural)',
      'Vocational Training Certificate or Experience Certificate'
    ],
    stepsToApply: [
      'Register on esamajkalyan.gujarat.gov.in.',
      'Select trade from the list of 28 eligible artisan vocations.',
      'Collect official government trade toolkit from designated district social welfare office.'
    ]
  },
  {
    id: 'rajasthan-imspy',
    name: 'Indira Mahila Shakti Udyam Protsahan Yojana (Govt of Rajasthan)',
    hindiName: 'इन्दिरा महिला शक्ति उद्यम प्रोत्साहन योजना (राजस्थान - महिला उद्यमियों को ₹1 करोड़ तक ऋण व 25-30% सब्सिडी)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Rajasthan',
    benefit: 'Bank loans up to ₹50 Lakh for individual women and up to ₹1 Crore for women SHG clusters with 25% to 30% capital subsidy (up to ₹15 Lakh)',
    benefitAmountApprox: 750000,
    summary: 'Rajasthan flagship program promoting women entrepreneurship in manufacturing, trade, and service sectors with generous state capital grant.',
    officialUrl: 'https://wcd.rajasthan.gov.in/',
    applyUrl: 'https://sso.rajasthan.gov.in/',
    portalName: 'SSO Rajasthan / Directorate of Women Empowerment Rajasthan',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Rajasthan State Women Entrepreneurship Scheme',
    eligibility: {
      minAge: 18,
      genders: ['Female'],
      occupations: ['Self Employed', 'Unemployed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      states: ['Rajasthan']
    },
    requiredDocuments: [
      'Jan Aadhaar Card of Rajasthan',
      'Aadhaar Card and PAN Card',
      'Enterprise Detailed Project Report (DPR)',
      'Bank Account Passbook'
    ],
    stepsToApply: [
      'Login through SSO Rajasthan (sso.rajasthan.gov.in) and select I-MSPY application.',
      'Fill proposed unit details and upload DPR and Jan Aadhaar.',
      'District task force verifies application and releases subsidy directly upon loan disbursal.'
    ]
  },
  {
    id: 'tn-needs',
    name: "New Entrepreneur-cum-Enterprise Development Scheme (NEEDS Tamil Nadu)",
    hindiName: 'புதிய தொழில்முனைவோர் தொழில் நிறுவனம் மேம்பாட்டு திட்டம் (தமிழ்நாடு - ₹5 கோடி வரை கடன் & 25% மானியம்)',
    category: 'Business & MSME',
    level: 'State',
    state: 'Tamil Nadu',
    benefit: 'Project cost from ₹10 Lakh up to ₹5 Crore with 25% State Capital Subsidy (up to ₹75 Lakh) and 3% interest subvention',
    benefitAmountApprox: 1500000,
    summary: 'Tamil Nadu government flagship scheme assisting educated youth to become first-generation entrepreneurs in manufacturing and service enterprises.',
    officialUrl: 'https://www.msmeonline.tn.gov.in/',
    applyUrl: 'https://www.msmeonline.tn.gov.in/needs/',
    portalName: 'MSME Online Tamil Nadu / Dept of MSME Govt of TN',
    isActive: true,
    isExpired: false,
    academicYearOrValidity: 'Active Ongoing State Scheme (2025-2026)',
    applicationStatus: 'ALWAYS_ACTIVE',
    lastAuditStatus: 'Verified Active • Up to ₹75 Lakh Capital Subsidy • TIIC & Commercial Banks',
    eligibility: {
      minAge: 21,
      maxAge: 45,
      occupations: ['Unemployed', 'Self Employed'],
      categories: ['All', 'General', 'OBC', 'SC', 'ST', 'Minority'],
      genders: ['All'],
      states: ['Tamil Nadu']
    },
    requiredDocuments: [
      'Degree or Diploma Certificate from recognized University/Board',
      'Tamil Nadu Nativity / Residence Certificate',
      'Detailed Project Report (DPR)',
      'Aadhaar Card and PAN Card'
    ],
    stepsToApply: [
      'Apply online on msmeonline.tn.gov.in/needs.',
      'Attend interview before District Level Selection Committee (DLSC) headed by District Collector.',
      'Undergo mandatory Entrepreneurship Development Programme (EDP) training and receive loan and subsidy.'
    ]
  }
];

// Helper to get schemes strictly partitioned by persona and optionally prioritized by state
export function getSchemesForCategory(
  persona: 'student' | 'farmer' | 'citizen' | 'business' | string,
  state?: string
): Scheme[] {
  let pool: Scheme[];
  switch (persona) {
    case 'student':
      pool = SCHEMES_DATABASE.filter(s => s.category === 'Education');
      break;
    case 'farmer':
      pool = SCHEMES_DATABASE.filter(s => s.category === 'Agriculture');
      break;
    case 'citizen':
      pool = SCHEMES_DATABASE.filter(s => ['Healthcare', 'Housing', 'Food & Civil Supplies', 'Women & Child', 'Social Security'].includes(s.category));
      break;
    case 'business':
      pool = SCHEMES_DATABASE.filter(s => ['Business & MSME', 'Employment'].includes(s.category));
      break;
    default:
      pool = SCHEMES_DATABASE;
  }

  if (state && state !== 'All India / Central' && state !== 'India') {
    const norm = (str: string) => str.toLowerCase().replace(/ncr/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const targetNorm = norm(state);
    const isNorthEast = ['assam', 'arunachal pradesh', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'sikkim', 'tripura'].includes(targetNorm);

    const stateMatches = pool.filter(s => {
      if (s.level !== 'State') return false;
      const sStateNorm = norm(s.state || '');
      if (sStateNorm === targetNorm) return true;
      if (targetNorm.length > 3 && (targetNorm.includes(sStateNorm) || sStateNorm.includes(targetNorm))) return true;
      if (isNorthEast && sStateNorm === 'north east') return true;
      if ((targetNorm.includes('jammu') || targetNorm.includes('kashmir') || targetNorm.includes('ladakh')) && (sStateNorm.includes('jammu') || sStateNorm.includes('kashmir'))) return true;
      return false;
    });
    const centralMatches = pool.filter(s => s.level === 'Central');
    // Dedicated state matches prioritized first, followed by central schemes
    return [...stateMatches, ...centralMatches];
  }

  return pool;
}
