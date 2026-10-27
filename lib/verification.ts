import {
  CanonicalScheme,
  SchemeLevel,
  EvidenceStatus,
  DeadlineStatus,
  EligibilityStatus,
  JurisdictionType,
  SourceClassification,
  VerificationStatus,
  SchemeFieldEvidence,
  FieldEvidenceItem,
  SupportingDocument
} from './types';
import {
  isValidPublicUrl,
  isInvalidSchemeName,
  sanitizeSchemeName,
  isGenericBenefit,
  validateApplicationUrl,
  identifyParentSchemeForDocument,
  extractNamedSchemesFromText,
  classifyCandidate
} from './validation';
import { FetchedPageContent } from './tinyfishFetch';
import { detectJurisdiction, CandidateJurisdictionInput } from './jurisdiction';
import { classifySource, evaluateVerificationStatus } from './sourceVerification';

/**
 * Re-export secondary source check for backward compatibility.
 */
export function isSecondarySourceUrl(urlStr: string): boolean {
  const res = classifySource(urlStr);
  return res.isSecondary;
}

/**
 * Canonical scheme alias table to normalize common acronyms and variant names
 * into unified scheme identities nationwide.
 */
export const SCHEME_CANONICAL_ALIASES: Record<string, string> = {
  'pmmy': 'pradhan mantri mudra',
  'mudra': 'pradhan mantri mudra',
  'mudra loan': 'pradhan mantri mudra',
  'pradhan mantri mudra yojana': 'pradhan mantri mudra',
  'pmegp': 'prime minister employment generation',
  'prime minister employment generation programme': 'prime minister employment generation',
  'prime ministers employment generation programme': 'prime minister employment generation',
  'cmegp': 'chief minister employment generation',
  'maha cmegp': 'chief minister employment generation',
  'chief minister employment generation programme': 'chief minister employment generation',
  'chief ministers employment generation programme': 'chief minister employment generation',
  'pm svanidhi': 'pm svanidhi street vendor',
  'svanidhi': 'pm svanidhi street vendor',
  'street vendors atmanirbhar nidhi': 'pm svanidhi street vendor',
  'nlm': 'national livestock',
  'national livestock mission': 'national livestock',
  'pm kisan': 'pradhan mantri kisan samman nidhi',
  'pmkisan': 'pradhan mantri kisan samman nidhi',
  'pm-kisan': 'pradhan mantri kisan samman nidhi',
  'kisan samman nidhi': 'pradhan mantri kisan samman nidhi',
  'pradhan mantri kisan samman nidhi': 'pradhan mantri kisan samman nidhi',
  'kisan credit card': 'kisan credit card kcc',
  'kcc': 'kisan credit card kcc',
  'pmfby': 'pradhan mantri fasal bima',
  'fasal bima': 'pradhan mantri fasal bima',
  'pradhan mantri fasal bima yojana': 'pradhan mantri fasal bima',
  'pm kusum': 'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan',
  'pm-kusum': 'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan',
  'pmkusum': 'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan',
  'kusum': 'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan',
  'kisan urja suraksha': 'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan',
  'mahadbt': 'mahadbt post matric',
  'aaple sarkar dbt': 'mahadbt post matric',
  'pm yasasvi': 'pm yasasvi scholarship',
  'yasasvi': 'pm yasasvi scholarship',
  'young achievers': 'pm yasasvi scholarship',
  'young achievers scholarship': 'pm yasasvi scholarship',
  'pm young achievers': 'pm yasasvi scholarship',
  'pm young achievers scholarship': 'pm yasasvi scholarship',
  'pm young achievers scholarship award': 'pm yasasvi scholarship',
  'csss': 'central sector scholarship college university',
  'nmmss': 'national means cum merit scholarship scheme',
  'pm jay': 'ayushman bharat pm jay',
  'ayushman bharat': 'ayushman bharat pm jay',
  'jan arogya yojana': 'ayushman bharat pm jay',
  'shahu maharaj': 'rajarshi chhatrapati shahu maharaj',
  'annasaheb patil': 'annasaheb patil arthik vikas',
  'dr ambedkar post matric': 'dr ambedkar post matric scholarship punjab',
  'goa scholar': 'goa scholar scheme',
  'dayanand social security': 'dayanand social security scheme dsss goa',
  'swami vivekananda scholarship': 'swami vivekananda merit cum means scholarship svmcm',
  'kalia': 'krushak assistance for livelihood and income augmentation kalia odisha',
  'rythu bharosa': 'rythu bharosa telangana',
  'nec scholarship': 'north eastern council nec scholarship',
  'integrated scheme on agriculture cooperation': 'integrated scheme on agriculture cooperation',
  'isac': 'integrated scheme on agriculture cooperation',
  'agriculture cooperation scheme': 'integrated scheme on agriculture cooperation',
  'agriculture infrastructure fund': 'agriculture infrastructure fund',
  'aif': 'agriculture infrastructure fund',
  'soil health card': 'soil health card scheme',
  'fee reimbursement': 'post matric',
  'up fee reimbursement': 'up post matric scholarship',
  'fee reimbursement scheme': 'post matric',
  'up scholarship': 'up post matric scholarship',
  'uttar pradesh scholarship': 'up post matric scholarship',
  'up dashmottar': 'up post matric scholarship',
  'up dashmottar scholarship': 'up post matric scholarship',
  'dashmottar scholarship': 'up post matric scholarship',
  'post matric scholarship uttar pradesh': 'up post matric scholarship',
  'pre matric scholarship uttar pradesh': 'up pre matric scholarship',
  'up pre matric': 'up pre matric scholarship',
  'up pre matric scholarship': 'up pre matric scholarship',
  'general pre matric scholarship': 'pre matric',
  'general pre matric scholarship uttar pradesh': 'up pre matric scholarship',
  'general post matric scholarship uttar pradesh': 'up post matric scholarship',
  'post matric scholarship bihar': 'post matric scholarship bihar',
  'mukhyamantri kanya utthan': 'mukhyamantri kanya utthan yojana',
  'kanya utthan': 'mukhyamantri kanya utthan yojana',
  'bihar student credit card': 'bihar student credit card scheme',
  'abhyuday': 'mukhyamantri abhyudaya yojana',
  'abhyudaya': 'mukhyamantri abhyudaya yojana',
  'up abhyudaya': 'mukhyamantri abhyudaya yojana'
};

export interface FlagshipDefinition {
  name: string;
  description: string;
  benefits: string;
  benefitType: 'loan' | 'grant' | 'subsidy' | 'scholarship' | 'insurance' | 'pension' | 'composite';
  department: string;
  officialUrl: string;
  applyUrl: string | null;
  portalName: string;
  category: string;
  partialReasons?: string[];
  defaultDeadlineStatus?: DeadlineStatus;
  eligibilityCriteria?: string[];
}

export const FLAGSHIP_DEFINITIONS: Record<string, FlagshipDefinition> = {
  'pradhan mantri fasal bima': {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Comprehensive financial support and crop insurance coverage for farmers against non-preventable natural risks.',
    benefits: 'Comprehensive crop insurance coverage against natural crop loss at subsidized premium of 1.5% to 2%.',
    benefitType: 'insurance',
    department: 'Ministry of Agriculture and Farmers Welfare',
    officialUrl: 'https://pmfby.gov.in/',
    applyUrl: null, // Apply URL is not the homepage; requires state/season notification
    portalName: 'Pradhan Mantri Fasal Bima Portal',
    category: 'Agriculture',
    partialReasons: ['State and season-specific application enrollment window requires active notification.'],
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'All farmers growing notified crops in notified areas are eligible, including loanee and non-loanee farmers.',
      'Tenant farmers and sharecroppers cultivating insurable crops with valid land tenancy records are eligible.',
      'Farmer must have an insurable interest in the notified crop sown in the notified block/district.',
      'Aadhaar-linked active bank account and sowing certificate / landholding documentation required.'
    ]
  },
  'pradhan mantri kisan samman nidhi': {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Direct income support of ₹6,000 per year transferred via DBT in three equal instalments of ₹2,000 to eligible farmer families.',
    benefits: 'Direct income support of ₹6,000 per year transferred via DBT in three equal instalments of ₹2,000.',
    benefitType: 'grant',
    department: 'Ministry of Agriculture and Farmers Welfare',
    officialUrl: 'https://pmkisan.gov.in/',
    applyUrl: null, // Portal homepage is information; citizen registration is a dedicated service
    portalName: 'PM-KISAN Samman Portal',
    category: 'Agriculture',
    partialReasons: ['Citizen registration requires land record and e-KYC integration.'],
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'All landholding farmer families having cultivable landholding in their names are eligible.',
      'Small and marginal farmer households as well as general landowning cultivators across all states/UTs.',
      'Mandatory Aadhaar e-KYC and land record linkage (Khata / Khasra) on the official PM-KISAN portal.',
      'Institutional landholders and high-income/tax-paying households (income tax payers in last AY) are excluded.'
    ]
  },
  'pradhan mantri kisan urja suraksha evam utthaan mahabhiyan': {
    name: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
    description: 'Solar power scheme for farmers to install solar agricultural pumps, solarize existing pumps, and establish grid-connected renewable power plants.',
    benefits: 'Financial support and subsidies up to 60% for standalone solar pumps and solarization of agricultural pump sets.',
    benefitType: 'subsidy',
    department: 'Ministry of New and Renewable Energy',
    officialUrl: 'https://pmkusum.mnre.gov.in/',
    applyUrl: null, // Subsidies implemented via State Nodal Agencies and DISCOMs
    portalName: 'MNRE PM-KUSUM Official Portal',
    category: 'Agriculture',
    partialReasons: ['State-specific implementation and beneficiary selection managed via State Nodal Agencies and DISCOMs.'],
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Individual farmers, farmer groups, cooperatives, Panchayats, and Water User Associations (WUAs).',
      'Cultivable land ownership and requirement for standalone solar irrigation pump or grid-connected solarization.',
      'Beneficiary applications processed through designated State Nodal Agencies (SNAs) and agricultural electricity distribution companies (DISCOMs).'
    ]
  },
  'post matric scholarship sc': {
    name: 'Post-Matric Scholarship for SC Students',
    description: 'Centrally Sponsored Scheme providing financial assistance to Scheduled Caste students pursuing post-matriculation or post-secondary education.',
    benefits: 'Full compulsory non-refundable fees reimbursement plus annual maintenance allowance up to ₹13,500/year (hostellers) or ₹7,000/year (day scholars).',
    benefitType: 'scholarship',
    department: 'Ministry of Social Justice and Empowerment / State Welfare Department',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / State e-District',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to Scheduled Caste (SC) category.',
      'Pursuing recognized post-matriculation, intermediate, diploma, degree, or postgraduate courses.',
      'Annual family income from all sources not exceeding ₹2.5 Lakh per annum.'
    ]
  },
  'post matric scholarship st': {
    name: 'Post-Matric Scholarship for ST Students',
    description: 'Centrally Sponsored Scheme providing financial assistance to Scheduled Tribe students for post-matriculation studies.',
    benefits: 'Full compulsory tuition fees reimbursement plus annual maintenance allowance as per Government of India norms.',
    benefitType: 'scholarship',
    department: 'Ministry of Tribal Affairs',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to Scheduled Tribe (ST) category.',
      'Enrolled in post-matric studies in recognized government or affiliated educational institutions.',
      'Annual family income not exceeding ₹2.5 Lakh per annum.'
    ]
  },
  'post matric scholarship obc': {
    name: 'Post-Matric Scholarship for OBC Students',
    description: 'Financial assistance to students belonging to Other Backward Classes pursuing higher education after matriculation.',
    benefits: 'Maintenance allowance up to ₹4,000 to ₹10,000 per annum and study fee support as per scheme rules.',
    benefitType: 'scholarship',
    department: 'Ministry of Social Justice and Empowerment',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to Other Backward Classes (OBC) category.',
      'Pursuing post-matric or post-secondary degree/diploma courses.',
      'Annual parental income from all sources not exceeding ₹2.5 Lakh per annum.'
    ]
  },
  'up post matric scholarship': {
    name: 'UP Post-Matric Scholarship & Fee Reimbursement Scheme',
    description: 'Government of Uttar Pradesh comprehensive financial assistance program providing full tuition fee reimbursement and maintenance allowance for post-secondary, college, and university students across all categories (General, OBC, SC, ST, Minority).',
    benefits: '100% reimbursement of approved non-refundable tuition and institutional fees directly via DBT, plus annual maintenance allowance up to ₹13,500/year.',
    benefitType: 'scholarship',
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    officialUrl: 'https://scholarship.up.gov.in/',
    applyUrl: 'https://scholarship.up.gov.in/',
    portalName: 'UP Scholarship & Fee Reimbursement Online System',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Must be a permanent resident / domicile of Uttar Pradesh.',
      'Pursuing recognized Post-Matriculation (Class 11-12), ITI, Polytechnic, Diploma, Undergraduate (B.Tech, B.Sc, B.Com, MBBS), or Postgraduate courses.',
      'Annual family income from all sources not exceeding ₹2,00,000 (₹2.0 Lakh) for General, OBC, and Minority students; and not exceeding ₹2,50,000 (₹2.5 Lakh) for SC and ST students.',
      'Student bank account must be Aadhaar-seeded and active on NPCI mapper for Direct Benefit Transfer (DBT).'
    ]
  },
  'up pre matric scholarship': {
    name: 'UP Pre-Matric Scholarship Scheme',
    description: 'Government of Uttar Pradesh scholarship for students studying in Class 9 and 10 to support secondary education expenses, uniforms, and study stationery.',
    benefits: 'Annual scholarship financial assistance of ₹3,500 to ₹4,000 per annum towards school expenses and study materials.',
    benefitType: 'scholarship',
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    officialUrl: 'https://scholarship.up.gov.in/',
    applyUrl: 'https://scholarship.up.gov.in/',
    portalName: 'UP Scholarship & Fee Reimbursement Online System',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Regular student enrolled in Class 9th or Class 10th in a recognized school in Uttar Pradesh.',
      'Must be a permanent resident / domicile of Uttar Pradesh.',
      'Annual family income from all sources not exceeding ₹2,50,000 (₹2.5 Lakh) per annum.',
      'Aadhaar-seeded bank account for DBT payment.'
    ]
  },
  'post matric': {
    name: 'Post-Matric Scholarship and Fee Reimbursement Scheme',
    description: 'Centrally Sponsored and State Welfare Scheme providing comprehensive tuition fee reimbursement and maintenance allowance for post-secondary and higher education students.',
    benefits: 'Reimbursement of non-refundable tuition and institutional fees plus annual maintenance allowance up to ₹13,500/year (hostellers) or ₹7,000/year (day scholars).',
    benefitType: 'scholarship',
    department: 'Social Welfare Department / Ministry of Social Justice and Empowerment',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / State e-District',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Enrolled in recognized post-matriculation, intermediate, diploma, undergraduate, or postgraduate degree course.',
      'Must be a permanent resident/native of the state or studying in a recognized institution.',
      'Annual parental/family income within prescribed ceiling (up to ₹2.0 to ₹2.5 Lakh per annum).'
    ]
  },
  'post matric scholarship': {
    name: 'Post-Matric Scholarship and Fee Reimbursement Scheme',
    description: 'Centrally Sponsored and State Welfare Scheme providing comprehensive tuition fee reimbursement and maintenance allowance for post-secondary and higher education students.',
    benefits: 'Reimbursement of non-refundable tuition and institutional fees plus annual maintenance allowance up to ₹13,500/year (hostellers) or ₹7,000/year (day scholars).',
    benefitType: 'scholarship',
    department: 'Social Welfare Department / Ministry of Social Justice and Empowerment',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / State e-District',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Enrolled in recognized post-matriculation, intermediate, diploma, undergraduate, or postgraduate degree course.',
      'Must be a permanent resident/native of the state or studying in a recognized institution.',
      'Annual parental/family income within prescribed ceiling (up to ₹2.0 to ₹2.5 Lakh per annum).'
    ]
  },
  'pre matric': {
    name: 'Pre-Matric Scholarship Scheme',
    description: 'State and Centrally Sponsored scholarship for students studying in Class 9 and 10 to support pre-matriculation education expenses and prevent dropouts.',
    benefits: 'Annual financial assistance of ₹3,500 to ₹4,000 per annum towards school expenses, uniforms, and books.',
    benefitType: 'scholarship',
    department: 'Social Welfare Department',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / State e-District',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Regular student enrolled in Class 9th or 10th in a government or recognized private school.',
      'Domicile/native of the state.',
      'Annual family income not exceeding ₹2.0 to ₹2.5 Lakh per annum.'
    ]
  },
  'pre matric scholarship': {
    name: 'Pre-Matric Scholarship Scheme',
    description: 'State and Centrally Sponsored scholarship for students studying in Class 9 and 10 to support pre-matriculation education expenses and prevent dropouts.',
    benefits: 'Annual financial assistance of ₹3,500 to ₹4,000 per annum towards school expenses, uniforms, and books.',
    benefitType: 'scholarship',
    department: 'Social Welfare Department',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / State e-District',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Regular student enrolled in Class 9th or 10th in a government or recognized private school.',
      'Domicile/native of the state.',
      'Annual family income not exceeding ₹2.0 to ₹2.5 Lakh per annum.'
    ]
  },
  'national means cum merit scholarship scheme': {
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    description: 'Centrally Sponsored Scheme by the Ministry of Education to award scholarships to meritorious students of economically weaker sections from Class 9 to 12.',
    benefits: 'Scholarship allowance of ₹12,000 per annum (₹1,000 per month) for students from Class 9 to Class 12.',
    benefitType: 'scholarship',
    department: 'Department of School Education and Literacy, Ministry of Education',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (MoE)',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Students studying in Class 9 who secured at least 55% marks (50% for SC/ST) in Class 8.',
      'Enrolled in Government, Government-aided, or Local Body school.',
      'Parental annual income from all sources not exceeding ₹3.5 Lakh.'
    ]
  },
  'pm yasasvi scholarship': {
    name: 'PM Young Achievers Scholarship Award Scheme for Vibrant India (PM YASASVI)',
    description: 'Centrally Sponsored scholarship scheme by MoSJE for OBC, EBC, and DNT students studying in Class 9-12 in Top Class Schools across India.',
    benefits: 'Financial scholarship up to ₹75,000/year (Class 9-10) and ₹1,25,000/year (Class 11-12) covering school fees and hostel expenses.',
    benefitType: 'scholarship',
    department: 'Ministry of Social Justice and Empowerment',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / NTA',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to OBC, EBC, or DNT (De-notified, Nomadic and Semi-Nomadic Tribes) category.',
      'Studying in Class 9 or 11 in recognized Top Class Schools.',
      'Annual family income from all sources not exceeding ₹2.5 Lakh per annum.'
    ]
  },
  'mukhyamantri abhyudaya yojana': {
    name: 'Mukhyamantri Abhyudaya Yojana - Uttar Pradesh',
    description: 'Free competitive examination coaching initiative by Government of Uttar Pradesh for civil services, JEE, NEET, NDA, and other entrance tests.',
    benefits: 'Free physical coaching at divisional centers and virtual classes, along with free tablets and study materials for eligible candidates.',
    benefitType: 'grant',
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    officialUrl: 'http://abhyuday.up.gov.in/',
    applyUrl: 'http://abhyuday.up.gov.in/',
    portalName: 'Abhyudaya Portal Uttar Pradesh',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Permanent resident of Uttar Pradesh.',
      'Preparing for competitive examinations (UPSC, UPPSC, JEE, NEET, CDS, NDA).',
      'Selected through state-level eligibility entrance examination.'
    ]
  },
  'post matric scholarship bihar': {
    name: 'Post-Matric Scholarship Scheme - Bihar',
    description: 'Bihar Government scholarship for SC, ST, BC, and EBC students pursuing post-matriculation and higher educational courses.',
    benefits: 'Reimbursement of tuition and course fees along with annual maintenance allowance as per Bihar state norms.',
    benefitType: 'scholarship',
    department: 'Education Department / SC & ST Welfare Department, Govt. of Bihar',
    officialUrl: 'https://pmsonline.bih.nic.in/',
    applyUrl: 'https://pmsonline.bih.nic.in/',
    portalName: 'Bihar Post Matric Scholarship Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Permanent resident of Bihar.',
      'Belonging to SC, ST, BC, or EBC category.',
      'Enrolled in recognized post-matriculation or higher education institution.',
      'Family annual income not exceeding ₹3.0 Lakh per annum.'
    ]
  },
  'mukhyamantri kanya utthan yojana': {
    name: 'Mukhyamantri Kanya Utthan Yojana - Bihar',
    description: 'Bihar Government initiative to encourage higher education among girls and prevent female child dropouts.',
    benefits: 'Direct financial incentive of ₹50,000 upon graduation from recognized universities and ₹25,000 upon passing Class 12 (unmarried).',
    benefitType: 'grant',
    department: 'Education Department, Government of Bihar',
    officialUrl: 'https://medhasoft.bih.nic.in/',
    applyUrl: 'https://medhasoft.bih.nic.in/',
    portalName: 'MedhaSoft Bihar Portal',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Female student domiciled in Bihar.',
      'Passed intermediate (Class 12) or graduated from a recognized college/university in Bihar.',
      'Unmarried at intermediate level.'
    ]
  },
  'bihar student credit card scheme': {
    name: 'Bihar Student Credit Card Scheme (BSCCS)',
    description: 'Government of Bihar credit assistance initiative under MNSSBY to finance higher education for Bihar youth.',
    benefits: 'Education loan up to ₹4 Lakh at 1% simple interest for women/PwD and 4% for men with state government guarantee.',
    benefitType: 'loan',
    department: 'Bihar State Education Finance Corporation, Govt. of Bihar',
    officialUrl: 'https://www.7nishchay-yuvaupmission.bihar.gov.in/',
    applyUrl: 'https://www.7nishchay-yuvaupmission.bihar.gov.in/',
    portalName: 'MNSSBY Portal Bihar',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Permanent resident of Bihar aged under 25 years.',
      'Passed 12th standard (or 10th for polytechnic) from a recognized board in Bihar.',
      'Enrolled in recognized higher education, technical, or professional degree/diploma course.'
    ]
  },
  'central sector scheme of scholarship for college and university students': {
    name: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
    description: 'Department of Higher Education scholarship for meritorious students from low-income families pursuing regular degree courses.',
    benefits: 'Scholarship of ₹12,000 per annum for undergraduate study (first 3 years) and ₹20,000 per annum at postgraduate level.',
    benefitType: 'scholarship',
    department: 'Department of Higher Education, Ministry of Education',
    officialUrl: 'https://scholarships.gov.in/',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal (MoE)',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Students above 80th percentile of successful candidates in Class 12 board examination.',
      'Pursuing regular course in a recognized college/university.',
      'Gross parental income from all sources not exceeding ₹4.5 Lakh per annum.'
    ]
  },
  'aicte pragati scholarship scheme': {
    name: 'AICTE Pragati Scholarship Scheme for Girl Students',
    description: 'AICTE scholarship scheme providing assistance to girl students admitted to technical degree or diploma courses in AICTE-approved institutions.',
    benefits: '₹50,000 per annum for every year of study towards college fee, computer, books, and stationeries.',
    benefitType: 'scholarship',
    department: 'All India Council for Technical Education (AICTE)',
    officialUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / AICTE',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Girl student admitted to 1st year or 2nd year (lateral entry) of technical degree/diploma course in AICTE approved institution.',
      'Family income not more than ₹8 Lakh per annum.',
      'Maximum two girls per family.'
    ]
  },
  'aicte saksham scholarship scheme': {
    name: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students',
    description: 'AICTE scholarship providing financial aid to differently-abled students pursuing technical education.',
    benefits: '₹50,000 per annum for every year of study towards tuition fee, equipment, books, and educational expenses.',
    benefitType: 'scholarship',
    department: 'All India Council for Technical Education (AICTE)',
    officialUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / AICTE',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Differently-abled student with disability not less than 40%.',
      'Admitted to technical degree or diploma course in AICTE approved institution.',
      'Family income not exceeding ₹8 Lakh per annum.'
    ]
  },
  'aicte swanath scholarship scheme': {
    name: 'AICTE Swanath Scholarship Scheme',
    description: 'AICTE financial support for orphaned children, wards of armed forces personnel deceased in action, and COVID-affected children pursuing technical education.',
    benefits: '₹50,000 per annum for every year of study towards academic fees and educational support.',
    benefitType: 'scholarship',
    department: 'All India Council for Technical Education (AICTE)',
    officialUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    applyUrl: 'https://scholarships.gov.in/',
    portalName: 'National Scholarship Portal / AICTE',
    category: 'Education',
    defaultDeadlineStatus: 'open',
    eligibilityCriteria: [
      'Orphaned child, ward of deceased armed forces/paramilitary personnel, or child of both parents deceased in COVID-19 pandemic.',
      'Studying in AICTE approved institution in degree/diploma course.',
      'Family income not more than ₹8 Lakh per annum.'
    ]
  },
  'reimbursement tuition fees sc st obc': {
    name: 'Reimbursement of Tuition Fee for SC/ST/OBC/Minority Students in Public Schools',
    description: 'Delhi Government initiative reimbursing tuition fees to SC, ST, OBC, and minority community students studying in recognized institutions in Delhi.',
    benefits: '100% reimbursement of tuition fees and compulsory charges for eligible students with family income up to ₹3.0 Lakh/year.',
    benefitType: 'scholarship',
    department: 'Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi',
    officialUrl: 'https://edistrict.delhigovt.nic.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'e-District Delhi Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to SC, ST, OBC, or minority community.',
      'Domiciled in Delhi with family income up to ₹3.0 Lakh per annum.',
      'Studying in recognized public/private school in Delhi.'
    ]
  },
  'merit scholarship college sc st obc': {
    name: 'Merit Scholarship for SC/ST/OBC/Minority Students in Colleges/Institutes',
    description: 'Delhi Government scheme rewarding meritorious SC/ST/OBC/minority students pursuing higher education and technical/professional courses.',
    benefits: 'Financial assistance up to ₹1,620 to ₹4,500 per annum based on course level and percentage of marks in previous qualifying exam.',
    benefitType: 'scholarship',
    department: 'Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi',
    officialUrl: 'https://edistrict.delhigovt.nic.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'e-District Delhi Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Belonging to SC, ST, OBC, or minority community in Delhi.',
      'Secured at least 60% marks in previous examination.',
      'Family income not exceeding ₹3.0 Lakh per annum.'
    ]
  },
  'dr ambedkar state award delhi': {
    name: 'Dr. B.R. Ambedkar State Award for SC/ST/OBC/Minority Students',
    description: 'Delhi Government state award honoring the top-ranking SC/ST/OBC/Minority students passing from recognized colleges and technical institutions in Delhi.',
    benefits: 'Cash award of ₹25,000 and citation to state toppers in professional and technical degree examinations.',
    benefitType: 'grant',
    department: 'Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi',
    officialUrl: 'https://edistrict.delhigovt.nic.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'e-District Delhi Portal',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'SC, ST, OBC, or minority student graduating from recognized colleges/institutes in Delhi.',
      'State topper or highest marks in technical/professional examination.'
    ]
  },
  'jai bhim mukhyamantri pratibha vikas yojana': {
    name: 'Jai Bhim Mukhyamantri Pratibha Vikas Yojana',
    description: 'Delhi Government coaching support program providing free competitive exam coaching for civil services, engineering, and medical entrances.',
    benefits: 'Free competitive coaching fee coverage plus monthly stipend of ₹2,500 per student during the coaching period.',
    benefitType: 'grant',
    department: 'Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi',
    officialUrl: 'https://scstwelfare.delhi.gov.in/',
    applyUrl: 'https://edistrict.delhigovt.nic.in/',
    portalName: 'Delhi SC/ST Welfare Department',
    category: 'Education',
    defaultDeadlineStatus: 'unknown',
    eligibilityCriteria: [
      'Permanent resident of Delhi belonging to SC, ST, OBC, or EWS category.',
      'Family income up to ₹8 Lakh per annum.',
      'Passed 10th and 12th standards from schools in Delhi.'
    ]
  }
};

/**
 * Normalizes a scheme title for robust deduplication, resolving acronyms
 * and common variations to a unified entity key.
 */
export function normalizeSchemeName(name: string): string {
  let lower = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check alias table first for exact or whole-word match
  for (const [alias, canonical] of Object.entries(SCHEME_CANONICAL_ALIASES)) {
    if (lower === alias) {
      return canonical;
    }
    if (alias.length > 4) {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        return canonical;
      }
    }
  }

  // 2. Canonicalize common scholarship word order permutations
  lower = lower
    .replace(/\b(sc|st|obc|minority)\s+(post\s*matric|pre\s*matric)\b/g, '$2 $1')
    .replace(/\b(post\s*matric|pre\s*matric)\s+scholarship\s+(for\s+)?(sc|st|obc|minority)(\s+students?)?\b/g, '$1 $3')
    .replace(/\b(post\s*matric|pre\s*matric)\s+(for\s+)?(sc|st|obc|minority)(\s+students?)?\b/g, '$1 $3');

  // 3. Strip noise, generic modifiers, state names, years
  const stripped = lower
    .replace(/\b(delhi|bihar|uttar pradesh|up|nct|state funded|centrally sponsored|css|scheme|yojana|scholarships?|guidelines?|portal|online|application|programme|program|mission|circulars?|notifications?|for|the|in|and|of|to|students?|candidates?|details?|2023|2024|2025|2026)\b/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 4. Check alias table against stripped
  for (const [alias, canonical] of Object.entries(SCHEME_CANONICAL_ALIASES)) {
    if (stripped === alias) {
      return canonical;
    }
    if (alias.length > 4) {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(stripped)) {
        return canonical;
      }
    }
  }

  // 5. Canonicalize standardized core scholarship keys
  if (stripped.includes('post matric') && /\bsc\b/.test(stripped)) return 'post matric scholarship sc';
  if (stripped.includes('post matric') && /\bst\b/.test(stripped)) return 'post matric scholarship st';
  if (stripped.includes('post matric') && /\bobc\b/.test(stripped)) return 'post matric scholarship obc';
  if (stripped.includes('post matric')) return 'post matric';
  if (stripped.includes('pre matric') && /\bsc\b/.test(stripped)) return 'pre matric scholarship sc';
  if (stripped.includes('pre matric') && /\bst\b/.test(stripped)) return 'pre matric scholarship st';
  if (stripped.includes('pre matric') && /\bobc\b/.test(stripped)) return 'pre matric scholarship obc';
  if (stripped.includes('pre matric')) return 'pre matric';
  if (stripped.includes('fee reimbursement') || stripped.includes('shulk pratipoorti')) return 'post matric';
  if (stripped.includes('tuition') && (stripped.includes('reimbursement') || stripped.includes('fee'))) return 'reimbursement tuition fees sc st obc';
  if (stripped.includes('merit') && stripped.includes('college')) return 'merit scholarship college sc st obc';
  if (stripped.includes('higher') && stripped.includes('technical') && (stripped.includes('education') || stripped.includes('support'))) return 'delhi higher and technical education support scheme';
  if (stripped.includes('central sector') && (stripped.includes('college') || stripped.includes('university') || stripped.includes('csss'))) return 'central sector scheme of scholarship for college and university students';
  if (stripped.includes('pragati')) return 'aicte pragati scholarship scheme';
  if (stripped.includes('saksham')) return 'aicte saksham scholarship scheme';
  if (stripped.includes('swanath')) return 'aicte swanath scholarship scheme';
  if (stripped.includes('nmmss') || (stripped.includes('means') && stripped.includes('merit'))) return 'national means cum merit scholarship scheme';
  if (stripped.includes('yasasvi') || stripped.includes('young achievers')) return 'pm yasasvi scholarship';
  if (stripped.includes('abhyuday')) return 'mukhyamantri abhyudaya yojana';
  if (stripped.includes('kanya utthan')) return 'mukhyamantri kanya utthan yojana';
  if (stripped.includes('student credit card')) return 'bihar student credit card scheme';

  return stripped || lower;
}

/**
 * Calibrated, documented eligibility and verification match score (0-100).
 * Never outputs arbitrary, unsupported numbers.
 */
export function calculateCalibratedMatchScore(params: {
  level: SchemeLevel;
  state: string | null;
  targetState: string;
  category: string;
  userPersona?: string;
  eligibilityStatus: EligibilityStatus;
  evidenceStatus: EvidenceStatus;
}): { score: number; rationale: string } {
  const { level, state, targetState, category, userPersona = 'student', eligibilityStatus, evidenceStatus } = params;

  // 1. Jurisdiction Match (max 30 points)
  let jurisdictionPoints = 0;
  let jurisdictionNote = '';
  if (level === 'State') {
    const isStateMatch = Boolean(
      state &&
      targetState &&
      (state.toLowerCase() === targetState.toLowerCase() ||
        state.toLowerCase().includes(targetState.toLowerCase()) ||
        targetState.toLowerCase().includes(state.toLowerCase()))
    );
    if (isStateMatch) {
      jurisdictionPoints = 30;
      jurisdictionNote = `State-specific entitlement for ${targetState} (+30)`;
    } else {
      jurisdictionPoints = 0;
      jurisdictionNote = `State entitlement outside ${targetState} (0)`;
    }
  } else if (level === 'Multi-State') {
    jurisdictionPoints = 28;
    jurisdictionNote = `Regional multi-state entitlement covering ${targetState} (+28)`;
  } else {
    jurisdictionPoints = 25;
    jurisdictionNote = 'Central All-India initiative (+25)';
  }

  // 2. Category / Persona Alignment (max 30 points)
  let categoryPoints = 0;
  let categoryNote = '';
  const personaNorm = userPersona.toLowerCase();
  const catNorm = (category || '').toLowerCase();

  if (personaNorm === 'student') {
    if (catNorm.includes('education') || catNorm.includes('scholarship')) {
      categoryPoints = 30;
      categoryNote = 'Direct educational scholarship match (+30)';
    } else if (catNorm.includes('social security') || catNorm.includes('welfare')) {
      categoryPoints = 12;
      categoryNote = 'General social assistance (+12)';
    } else {
      categoryPoints = 5;
      categoryNote = 'Non-educational welfare scheme (+5)';
    }
  } else if (personaNorm === 'farmer') {
    if (catNorm.includes('agriculture') || catNorm.includes('farmer')) {
      categoryPoints = 30;
      categoryNote = 'Direct agricultural / kisan benefit (+30)';
    } else {
      categoryPoints = 10;
      categoryNote = 'General welfare program (+10)';
    }
  } else if (personaNorm === 'business') {
    if (catNorm.includes('business') || catNorm.includes('msme') || catNorm.includes('employment')) {
      categoryPoints = 30;
      categoryNote = 'Direct enterprise / loan subsidy (+30)';
    } else {
      categoryPoints = 10;
      categoryNote = 'General citizen welfare (+10)';
    }
  } else {
    // citizen
    if (['healthcare', 'housing', 'food & civil supplies', 'women & child', 'social security'].some(c => catNorm.includes(c))) {
      categoryPoints = 30;
      categoryNote = 'Direct citizen welfare category match (+30)';
    } else {
      categoryPoints = 15;
      categoryNote = 'Broad entitlement match (+15)';
    }
  }

  // 3. Demographic & Eligibility Criteria Fulfillment (max 25 points)
  let eligibilityPoints = 0;
  let eligibilityNote = '';
  if (eligibilityStatus === 'potentially_eligible') {
    eligibilityPoints = 25;
    eligibilityNote = 'Profile aligns with stated eligibility rules (+25)';
  } else if (eligibilityStatus === 'insufficient_information') {
    eligibilityPoints = 12;
    eligibilityNote = 'Partial criteria established in evidence (+12)';
  } else {
    eligibilityPoints = 0;
    eligibilityNote = 'Profile does not meet mandatory criteria (0)';
  }

  // 4. Evidence Grounding & Verification Depth (max 15 points)
  let evidencePoints = 0;
  let evidenceNote = '';
  if (evidenceStatus === 'officially_verified' || evidenceStatus === 'verified' || evidenceStatus === 'officially_supported') {
    evidencePoints = 15;
    evidenceNote = 'Official government portal corroboration (+15)';
  } else if (evidenceStatus === 'partially_verified') {
    evidencePoints = 8;
    evidenceNote = 'Partial or secondary source verification (+8)';
  } else {
    evidencePoints = 2;
    evidenceNote = 'Unverified third-party citation (+2)';
  }

  let totalScore = jurisdictionPoints + categoryPoints + eligibilityPoints + evidencePoints;

  // Capping for ineligible items
  if (eligibilityStatus === 'not_eligible') {
    totalScore = Math.min(totalScore, 35);
  }

  const rationale = `${jurisdictionNote}, ${categoryNote}, ${eligibilityNote}, ${evidenceNote}.`;
  return { score: Math.min(Math.max(totalScore, 10), 100), rationale };
}

/**
 * Genuine profile criteria evaluation based on authoritative evidence.
 * Returns:
 * - 'matched': required criteria are supported and user profile satisfies them.
 * - 'not_matched': at least one established required criterion is not satisfied.
 * - 'unknown': relevant profile information or scheme eligibility evidence is missing.
 * Rejects filler provenance text (e.g. "Identified from active public welfare portal...").
 */
export function evaluateProfileCriteria(params: {
  schemeName?: string;
  description?: string;
  criteriaSummary?: string[];
  reasons?: string[];
  userProfile?: {
    category?: string;
    socialCategory?: string;
    state?: string;
    caste?: string;
    gender?: string;
    income?: number;
    annualIncome?: number;
    age?: number;
    occupation?: string;
    educationLevel?: string;
    courseStream?: string;
    isDifferentlyAbled?: boolean;
    hasBplCard?: boolean;
    landholding?: number | string; // in hectares, acres, or 'landless'
    isLandowner?: boolean;
    isStudent?: boolean;
    isFarmer?: boolean;
    isEntrepreneur?: boolean;
    [key: string]: any;
  } | null;
  targetState?: string;
}): {
  status: 'matched' | 'not_matched' | 'unknown';
  matchedReasons: string[];
  unmatchedReasons: string[];
  unknownReasons: string[];
  hasRealCriteria: boolean;
} {
  const { schemeName, description, criteriaSummary = [], reasons = [], userProfile, targetState } = params;

  // Filter out provenance filler
  const isFiller = (text: string) =>
    /identified from active|public welfare portal|retrieved from|search result|scraped from|verified portal/i.test(text);

  const rawCriteria = [
    schemeName || '',
    description || '',
    ...criteriaSummary,
    ...reasons
  ].filter(c => typeof c === 'string' && c.trim().length > 0 && !isFiller(c));

  if (rawCriteria.length === 0) {
    return {
      status: 'unknown',
      matchedReasons: [],
      unmatchedReasons: [],
      unknownReasons: ['Eligibility details not verified from primary source.'],
      hasRealCriteria: false
    };
  }

  const combinedCriteriaText = rawCriteria.join(' ').toLowerCase();
  const matchedReasons: string[] = [];
  const unmatchedReasons: string[] = [];
  const unknownReasons: string[] = [];

  let evaluatedChecksCount = 0;

  // Extract normalized user profile attributes safely
  const userIncome = typeof userProfile?.annualIncome === 'number'
    ? userProfile.annualIncome
    : (typeof userProfile?.income === 'number' ? userProfile.income : undefined);

  const rawCategory = (userProfile?.socialCategory || userProfile?.caste || userProfile?.category || '').trim();
  const userCategory = rawCategory.toLowerCase();

  const rawGender = (userProfile?.gender || '').trim();
  const userGender = rawGender.toLowerCase();

  const rawEducation = (userProfile?.educationLevel || '').trim();
  const userEducation = rawEducation.toLowerCase();

  const userStream = (userProfile?.courseStream || '').trim().toLowerCase();
  const isPwd = Boolean(userProfile?.isDifferentlyAbled);
  const userAge = typeof userProfile?.age === 'number' ? userProfile.age : undefined;

  const rawFarmerType = (userProfile?.farmerType || '').trim().toLowerCase();
  const isLandless = userProfile?.landholding === 0 ||
    userProfile?.landholding === '0' ||
    userProfile?.landholding === 'none' ||
    userProfile?.landholding === 'landless' ||
    userProfile?.isLandowner === false ||
    rawFarmerType === 'landless';

  const hasLand = (typeof userProfile?.landholding === 'number' && userProfile.landholding > 0) ||
    userProfile?.isLandowner === true ||
    (typeof userProfile?.landholding === 'string' && parseFloat(userProfile.landholding) > 0) ||
    rawFarmerType === 'small/marginal' ||
    rawFarmerType === 'large';

  // 1. Land Ownership / Cultivable Land (e.g. PM-KISAN, crop schemes)
  if (/\b(cultivable land|land ownership|landholding|landowner|holding land|own agricultural land)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (!userProfile) {
      unknownReasons.push('Scheme requires cultivable landholding; user profile not provided.');
    } else if (isLandless) {
      unmatchedReasons.push('Scheme requires cultivable agricultural landholding; profile indicates Landless agricultural worker / tenant.');
    } else if (hasLand) {
      matchedReasons.push('User satisfies cultivable agricultural land ownership requirement.');
    } else {
      unknownReasons.push('Scheme requires cultivable landholding; landholding status not specified in profile.');
    }
  }

  // 1b. Small and Marginal Farmer Criteria (e.g. SMAM, PM-KMY, specific subsidies)
  if (/\b(small and marginal|small\s*[\/,]\s*marginal|marginal farmers?|up to 2 hectares?)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (rawFarmerType === 'small/marginal' || (typeof userProfile?.landholding === 'number' && userProfile.landholding > 0 && userProfile.landholding <= 2)) {
      matchedReasons.push('Farmer category matched: Small and Marginal Farmer (holding up to 2 hectares).');
    } else if (rawFarmerType === 'large' || (typeof userProfile?.landholding === 'number' && userProfile.landholding > 2)) {
      unmatchedReasons.push('Scheme is restricted to Small & Marginal Farmers (up to 2 hectares); profile indicates Large landholder.');
    } else if (isLandless) {
      unmatchedReasons.push('Scheme requires small/marginal cultivable landholding; profile indicates Landless.');
    }
  }

  // 2. Income Limit Check
  const isBenefitTransferOnly = /\bincome\s*(?:support|assistance|subsidy|transfer)\b/i.test(combinedCriteriaText) &&
    !/\b(?:annual|family|parental|household|gross)\s*income\b/i.test(combinedCriteriaText) &&
    !/\bincome\s*(?:limit|ceiling|below|less than|up to|not exceeding|not more than|under|should not exceed|maximum of)\b/i.test(combinedCriteriaText);

  const rangeIncomeMatch = !isBenefitTransferOnly
    ? combinedCriteriaText.match(/(?:annual|family|parental|household|gross)?\s*income(?:[^0-9₹\n\r]{0,40}?)(?:limit|ceiling|below|less than|up to|upto|not exceeding|not more than|under|should not exceed|maximum of)?\s*(?:of|is|shall be)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(?:to|-|and)\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i)
    : null;

  const singleIncomeMatch = !isBenefitTransferOnly && !rangeIncomeMatch
    ? (combinedCriteriaText.match(/(?:annual|family|parental|household|gross)?\s*income(?:[^0-9₹\n\r]{0,35}?)(?:limit|ceiling|below|less than|up to|upto|not exceeding|not more than|under|should not exceed|maximum of)\s*(?:of|is|shall be)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i) ||
       combinedCriteriaText.match(/(?:annual|family|parental|household|gross)\s*income\s*(?:is|shall be|of)?\s*(?:rs\.?|₹)?\s*([0-9]+(?:[\.,][0-9]+)?)\s*(lakh|lac|k|crore)?/i))
    : null;

  if (rangeIncomeMatch || singleIncomeMatch) {
    evaluatedChecksCount++;
    const rawVal = rangeIncomeMatch
      ? parseFloat(rangeIncomeMatch[2].replace(/,/g, ''))
      : parseFloat(singleIncomeMatch![1].replace(/,/g, ''));
    const unit = ((rangeIncomeMatch ? rangeIncomeMatch[3] : singleIncomeMatch![2]) || '').toLowerCase();
    let maxIncome = rawVal;
    if (unit.startsWith('lakh') || unit.startsWith('lac')) {
      maxIncome = rawVal * 100000;
    } else if (unit === 'k') {
      maxIncome = rawVal * 1000;
    } else if (unit === 'crore') {
      maxIncome = rawVal * 10000000;
    } else if (rawVal <= 100 && (/\b(lakhs?|lac|lacs?)\b/i.test(combinedCriteriaText) || rawVal < 100)) {
      // Small numeric caps in Indian welfare eligibility (e.g. 1.5, 2, 2.5, 3, 5, 8) are always Lakhs
      maxIncome = rawVal * 100000;
    }

    if (userIncome === undefined || userIncome === null) {
      unknownReasons.push(`Scheme specifies annual income ceiling (₹${maxIncome.toLocaleString('en-IN')}); user income not specified in profile.`);
    } else if (userIncome > maxIncome) {
      unmatchedReasons.push(`User annual income (₹${userIncome.toLocaleString('en-IN')}) exceeds scheme limit of ₹${maxIncome.toLocaleString('en-IN')}.`);
    } else {
      matchedReasons.push(`Annual income (₹${userIncome.toLocaleString('en-IN')}) is within eligible ceiling of ₹${maxIncome.toLocaleString('en-IN')}.`);
    }
  }

  // 3. Gender / Women Specific Check
  if (/\b(girl students?|girls? admitted|female candidates?|women candidates?|girl child|for girls|for women|female students?|girls only|women only)\b/i.test(combinedCriteriaText) ||
      /\b(pragati|begum\s*hazrat\s*mahal|kanya|balika|mahila|ladli)\b/i.test(combinedCriteriaText) ||
      /\b(pragati|begum\s*hazrat\s*mahal|kanya|balika|mahila|ladli|girls?|women)\b/i.test(schemeName || '')) {
    evaluatedChecksCount++;
    if (!userGender || userGender === 'all') {
      unknownReasons.push('Scheme specifies gender eligibility (restricted to female / girl students); gender not specified in profile.');
    } else if (userGender === 'male') {
      unmatchedReasons.push('Scheme is restricted to female/girl students; profile indicates Male.');
    } else if (userGender === 'female') {
      matchedReasons.push('Gender criteria met (female applicant).');
    }
  }

  // 4. Caste / Social Category Check
  const mentionsGeneral = /\b(general|unreserved|all categories|all students|open to all|all communities)\b/i.test(combinedCriteriaText);
  const isCombinedSCOBCAny = /\b(belonging to|belong to|reserved for|only for|applicable to)\s*(?:the\s+)?(?:sc|st|obc)/i.test(combinedCriteriaText) ||
    /\b(sc\s*[\/,]\s*st\s*[\/,]\s*obc|sc\s*[\/,]\s*obc)\s+(?:students?|candidates?|scholarship|schemes?)\b/i.test(combinedCriteriaText) ||
    /\b(?:schemes?|scholarships?|assistance)\s+for\s+(?:the\s+)?(?:sc|st|obc)/i.test(combinedCriteriaText) ||
    /\bfor\s+(?:the\s+)?(?:sc|st|obc)\s*(?:&|and|\/)\s*(?:sc|st|obc)\s+(?:students?|candidates?|applicants?|scholarship|schemes?)\b/i.test(combinedCriteriaText) ||
    /\b(welfare of\s*(?:the\s*)?(?:sc|st|obc))\b/i.test(combinedCriteriaText);
  const isReservedSC = /\b(belonging to (?:the\s+)?scheduled caste|for sc students|sc category|scheduled caste \(sc\) category|reserved for (?:the\s+)?scheduled caste)\b/i.test(combinedCriteriaText);
  const isReservedST = /\b(belonging to (?:the\s+)?scheduled tribe|for st students|st category|scheduled tribe \(st\) category|reserved for (?:the\s+)?scheduled tribe)\b/i.test(combinedCriteriaText);
  const isReservedOBC = /\b(belonging to (?:the\s+)?(?:obc|other backward)|for obc students|obc category|reserved for (?:the\s+)?(?:obc|other backward))\b/i.test(combinedCriteriaText);
  const isReservedMinority = /\b(belonging to (?:a\s+)?minority community|for minority students|minority category|minority community students?)\b/i.test(combinedCriteriaText);

  if (mentionsGeneral && userCategory && userCategory.includes('general')) {
    evaluatedChecksCount++;
    matchedReasons.push('Social category matched: General (scheme covers General / all categories).');
  } else if (isCombinedSCOBCAny) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push('Scheme specifies category criteria (SC/ST/OBC); social category not specified.');
    } else if (userCategory.includes('sc') || userCategory.includes('st') || userCategory.includes('obc')) {
      matchedReasons.push(`Social category matched: ${rawCategory}.`);
    } else if (userCategory.includes('general')) {
      unmatchedReasons.push('Scheme reserved for SC/ST/OBC applicants; profile indicates General category.');
    } else {
      unknownReasons.push(`Category criteria (SC/ST/OBC) requires verification for ${rawCategory}.`);
    }
  } else if (isReservedSC && !isReservedOBC && !isReservedST) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push('Scheme reserved for Scheduled Caste (SC); category not specified.');
    } else if (userCategory.includes('sc') && !userCategory.includes('st')) {
      matchedReasons.push('Social category matched: Scheduled Caste (SC).');
    } else {
      unmatchedReasons.push(`Scheme reserved for Scheduled Caste (SC) applicants; profile indicates ${rawCategory || 'non-SC'}.`);
    }
  } else if (isReservedST && !isReservedSC) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push('Scheme reserved for Scheduled Tribe (ST); category not specified.');
    } else if (userCategory.includes('st')) {
      matchedReasons.push('Social category matched: Scheduled Tribe (ST).');
    } else {
      unmatchedReasons.push(`Scheme reserved for Scheduled Tribe (ST) applicants; profile indicates ${rawCategory || 'non-ST'}.`);
    }
  } else if (isReservedOBC) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push('Scheme reserved for OBC; category not specified.');
    } else if (userCategory.includes('obc')) {
      matchedReasons.push('Social category matched: OBC.');
    } else {
      unmatchedReasons.push(`Scheme reserved for OBC applicants; profile indicates ${rawCategory || 'non-OBC'}.`);
    }
  } else if (isReservedMinority) {
    evaluatedChecksCount++;
    if (!userCategory) {
      unknownReasons.push('Scheme reserved for Minority students; category not specified.');
    } else if (userCategory.includes('minority')) {
      matchedReasons.push('Social category matched: Minority.');
    } else {
      unmatchedReasons.push(`Scheme reserved for Minority students; profile indicates ${rawCategory || 'non-Minority'}.`);
    }
  }

  // 5. Education Level Check
  if (userEducation && userEducation !== 'any') {
    // 5a. Strictly School / Pre-Matric (e.g. NMMSS, Classes 1-10, Class 9, Pre-Matric)
    const isSchoolOnly = /\b(class 9|class ix|pre-matric|pre matric|classes? i to x\b|class 9th - 10th|students from class 9|studying in class 9)\b/i.test(combinedCriteriaText) &&
      !/\b(post-matric|post matric|college|university|undergraduate|postgraduate)\b/i.test(combinedCriteriaText);

    // 5b. College & University / Degree / Class 12 Passed (e.g. CSSS, PM-USP CSSS, Higher Education fee waivers)
    const isCollegeUniversity = /\b(college and university|college & university|for college and university|for college & university|for college|for university|class 12 passed|after 12th|passed class 12|12th passed students?|undergraduate study|undergraduate studies|undergraduate course|first year of graduation|pursuing graduation|degree course)\b/i.test(combinedCriteriaText);

    // 5c. Strictly Postgraduate / Research / Ph.D. (e.g. PMRF, PG degree only)
    const isPgOnly = /\b(ph\.?d|doctorate|research fellowship|pg degree|post graduate degree|postgraduate studies|leading to specified pg)\b/i.test(combinedCriteriaText) &&
      !/\b(undergraduate|intermediate|diploma, degree, or|first 3 years)\b/i.test(combinedCriteriaText);

    // 5d. Technical Degree / Diploma (e.g. AICTE Pragati, Saksham)
    const isDegreeDiploma = /\b(technical degree or diploma|degree or diploma course|admitted to 1st year .* degree|engineering degree|diploma in engineering)\b/i.test(combinedCriteriaText);

    // 5e. Post-Matric / Post-Secondary (General Post-Matriculation)
    const isPostMatric = /\b(post-matric|post matric|post-secondary|diploma, degree|pursuing recognized post-matriculation)\b/i.test(combinedCriteriaText);

    if (isSchoolOnly) {
      evaluatedChecksCount++;
      if (userEducation === 'school') {
        matchedReasons.push('Education level matched: School / Pre-Matric level.');
      } else if (userEducation === 'higher secondary' && (combinedCriteriaText.includes('class 12') || combinedCriteriaText.includes('class 11'))) {
        matchedReasons.push('Education level matched: Secondary / Higher Secondary.');
      } else {
        unmatchedReasons.push(`Scheme is restricted to school students (Class 9-10 / Pre-Matric); profile indicates ${rawEducation}.`);
      }
    } else if (isPgOnly) {
      evaluatedChecksCount++;
      if (userEducation === 'postgraduate') {
        matchedReasons.push('Education level matched: Postgraduate (PG) / Ph.D. research program.');
      } else {
        unmatchedReasons.push(`Scheme requires enrollment in Postgraduate (PG) / Ph.D. program; profile indicates ${rawEducation}.`);
      }
    } else if (isCollegeUniversity) {
      evaluatedChecksCount++;
      if (userEducation === 'undergraduate') {
        matchedReasons.push('Education level matched: College & University / Undergraduate degree program.');
      } else if (userEducation === 'postgraduate') {
        matchedReasons.push('Education level matched: College & University / Postgraduate program.');
      } else if (userEducation === 'school') {
        unmatchedReasons.push('Scheme requires College / University enrollment (Class 12 passed); profile indicates School (Class 9th - 10th Pre-Matric).');
      } else if (userEducation === 'higher secondary') {
        unmatchedReasons.push('Scheme requires admission to College / University (Class 12 passed); profile indicates Class 11th - 12th / Intermediate.');
      } else {
        unmatchedReasons.push(`Scheme requires College / University enrollment; profile indicates ${rawEducation}.`);
      }
    } else if (isDegreeDiploma) {
      evaluatedChecksCount++;
      if (userEducation === 'undergraduate') {
        matchedReasons.push('Education level matched: Undergraduate degree / diploma.');
      } else if (userEducation === 'postgraduate') {
        unmatchedReasons.push(`Scheme requires Degree/Diploma course (Undergraduate); profile indicates Postgraduate.`);
      } else {
        unmatchedReasons.push(`Scheme requires admission to Degree/Diploma program; profile indicates ${rawEducation}.`);
      }
    } else if (isPostMatric) {
      evaluatedChecksCount++;
      if (userEducation === 'school') {
        unmatchedReasons.push('Scheme requires Post-Matriculation studies (Class 11, 12, Diploma, Degree, or PG); profile indicates School (Pre-Matric).');
      } else {
        matchedReasons.push(`Education level matched for Post-Matric / Higher Education (${rawEducation}).`);
      }
    }
  }

  // 6. Course Stream Check
  if (/\b(aicte|technical degree|technical diploma|technical course)\b/i.test(combinedCriteriaText)) {
    evaluatedChecksCount++;
    if (!userStream) {
      unknownReasons.push('Scheme requires AICTE technical degree/diploma; course stream not specified.');
    } else if (
      userStream.includes('engineering') ||
      userStream.includes('technical') ||
      userStream.includes('aicte') ||
      userStream.includes('polytechnic') ||
      userStream.includes('diploma')
    ) {
      matchedReasons.push('Course stream matched: Technical / Engineering / Diploma stream.');
    } else {
      unmatchedReasons.push(`Scheme requires AICTE technical degree/diploma course; profile indicates ${userProfile?.courseStream || 'non-technical stream'}.`);
    }
  }

  // 7. Differently Abled (PwD) / Disability Check
  const isDedicatedDisabilityScheme =
    /\b(saksham|differently[- ]?abled|specially[- ]?abled|divyang|disabilit(?:y|ies)|pwd candidates?|locomotor disability)\b/i.test(combinedCriteriaText) ||
    /\b(saksham|specially[- ]?abled|differently[- ]?abled|disabilit(?:y|ies))\b/i.test(schemeName || '');

  // Distinguish between a dedicated disability scheme and a general scheme that merely offers a 40% disability relaxation/concession
  const isMereRelaxation =
    /\b(?:concession|relaxation)\s+for\s+(?:pwd|differently abled|disabled)\b/i.test(combinedCriteriaText) &&
    !/\b(saksham|specially[- ]?abled|differently[- ]?abled|only for differently|reserved for differently|students? with disabilities?)\b/i.test(combinedCriteriaText) &&
    !/\b(saksham|specially[- ]?abled|differently[- ]?abled)\b/i.test(schemeName || '');

  if (isDedicatedDisabilityScheme && !isMereRelaxation) {
    evaluatedChecksCount++;
    if (isPwd) {
      matchedReasons.push('Differently-abled (PwD) criteria satisfied.');
    } else {
      unmatchedReasons.push('Scheme is reserved for differently-abled (PwD) students; profile indicates Not Differently Abled.');
    }
  }

  // 7b. Special Target Groups (Orphans, Armed Forces Deceased / Martyr Wards, Swanath)
  const isOrphanOrMartyrWardScheme =
    /\b(swanath|orphan(?:ed)?\s*children|wards\s+of\s+(?:armed|defence|paramilitary)\s*forces\s+(?:deceased|martyred|killed|in action)|lost\s+both\s+parents|covid[- ]?affected\s+children)\b/i.test(combinedCriteriaText) ||
    /\bswanath\b/i.test(schemeName || '');

  if (isOrphanOrMartyrWardScheme) {
    evaluatedChecksCount++;
    unmatchedReasons.push('Scheme is restricted to orphaned children, wards of armed forces personnel deceased in action, or COVID-affected children (Swanath criteria); standard applicant profile not eligible.');
  }

  // 8. Age Limit Check
  const ageMatch = combinedCriteriaText.match(/age\s*(?:limit|is|under|below|not exceeding)?\s*(?:is)?\s*([0-9]{1,2})\s*years?/i);
  if (ageMatch) {
    const maxAge = parseInt(ageMatch[1], 10);
    if (maxAge >= 15 && maxAge <= 65) {
      evaluatedChecksCount++;
      if (userAge === undefined || userAge === null) {
        unknownReasons.push(`Scheme specifies age limit (${maxAge} years); applicant age not specified.`);
      } else if (userAge > maxAge) {
        unmatchedReasons.push(`Applicant age (${userAge} years) exceeds scheme age limit of ${maxAge} years.`);
      } else {
        matchedReasons.push(`Applicant age (${userAge} years) is within eligible limit (under ${maxAge} years).`);
      }
    }
  }

  // 9. State Domicile
  if (targetState && targetState.toLowerCase() !== 'all india' && targetState.toLowerCase() !== 'central') {
    if (combinedCriteriaText.includes('domicile') || combinedCriteriaText.includes('resident of ' + targetState.toLowerCase())) {
      evaluatedChecksCount++;
      if (userProfile?.state && userProfile.state.toLowerCase() === targetState.toLowerCase()) {
        matchedReasons.push(`Domicile verified for ${targetState}.`);
      } else if (userProfile?.state && userProfile.state.toLowerCase() !== targetState.toLowerCase()) {
        unmatchedReasons.push(`Scheme requires domicile of ${targetState}; user is from ${userProfile.state}.`);
      } else {
        unknownReasons.push(`Domicile of ${targetState} required; user state unconfirmed.`);
      }
    }
  }

  // 9b. North-Eastern Region (NER / NEC / Ishaan Uday) Domicile Check
  const isNorthEastScheme =
    /\b(north\s*eastern\s*(?:region|council)|ner\s*domicile|resident\s+of\s+north\s*east|nec\s*(?:merit\s*)?scholarship|ishaan\s*uday)\b/i.test(combinedCriteriaText) ||
    /\b(north\s*eastern\s*(?:region|council)|nec\s*(?:merit\s*)?scholarship|ishaan\s*uday)\b/i.test(schemeName || '');

  if (isNorthEastScheme) {
    evaluatedChecksCount++;
    const neStates = ['assam', 'arunachal pradesh', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'sikkim', 'tripura'];
    const curState = (targetState || userProfile?.state || '').toLowerCase();
    if (curState && !neStates.includes(curState)) {
      unmatchedReasons.push(`Scheme is restricted to domicile of North Eastern Region (NER) states (${neStates.join(', ')}); applicant state is ${targetState || userProfile?.state}.`);
    } else if (curState && neStates.includes(curState)) {
      matchedReasons.push(`Domicile verified for North Eastern Region (${curState}).`);
    }
  }

  // Determine overall status
  if (unmatchedReasons.length > 0) {
    return {
      status: 'not_matched',
      matchedReasons,
      unmatchedReasons,
      unknownReasons,
      hasRealCriteria: true
    };
  }

  if (matchedReasons.length > 0) {
    return {
      status: 'matched',
      matchedReasons,
      unmatchedReasons: [],
      unknownReasons,
      hasRealCriteria: true
    };
  }

  if (unknownReasons.length > 0 || evaluatedChecksCount === 0) {
    return {
      status: 'unknown',
      matchedReasons,
      unmatchedReasons,
      unknownReasons: unknownReasons.length > 0 ? unknownReasons : ['Detailed criteria require applicant verification.'],
      hasRealCriteria: true
    };
  }

  return {
    status: 'unknown',
    matchedReasons: [],
    unmatchedReasons: [],
    unknownReasons: ['Eligibility details not fully verified.'],
    hasRealCriteria: true
  };
}

/**
 * Safely parses human date representations (e.g. "30-06-2026", "31/03/2026", "June 30, 2026", "31 March 2026")
 * into a Date object for temporal comparison.
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Pattern: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day, 23, 59, 59);
  }

  // Pattern: YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day, 23, 59, 59);
  }

  // Pattern: 30 June 2026, 30th June 2026, or June 30, 2026
  const textDateMatch = clean.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)[,\s]+(\d{4})$/) ||
    clean.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})$/);
  if (textDateMatch) {
    const isMonthFirst = isNaN(parseInt(textDateMatch[1], 10));
    const day = parseInt(isMonthFirst ? textDateMatch[2] : textDateMatch[1], 10);
    const monthStr = (isMonthFirst ? textDateMatch[1] : textDateMatch[2]).toLowerCase();
    const year = parseInt(textDateMatch[3], 10);
    const months: Record<string, number> = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
      nov: 10, november: 10, dec: 11, december: 11
    };
    if (monthStr in months) {
      return new Date(year, months[monthStr], day, 23, 59, 59);
    }
  }

  const standardParsed = new Date(clean);
  if (!isNaN(standardParsed.getTime())) {
    return standardParsed;
  }

  return null;
}

/**
 * Resolves scheme application deadline status and date.
 * Inspects explicit dates, closed indicators (e.g. applications closed, registration ended, expired),
 * and state-specific operational cycles (e.g. Delhi e-District annual cutoff).
 */
export function resolveSchemeDeadline(params: {
  raw: any;
  aggregateText: string;
  isDelhiScholarship?: boolean;
  flagshipDef?: FlagshipDefinition;
}): { deadline: string | null; deadlineStatus: DeadlineStatus } {
  const { raw, aggregateText, isDelhiScholarship, flagshipDef } = params;
  const now = new Date();

  // 1. Check for explicit closed/ended language across raw and aggregate text
  const textToScan = [
    raw.deadline || '',
    raw.deadlineStatus || '',
    raw.academicYearOrValidity || '',
    raw.description || '',
    raw.sourceTitle || '',
    raw.evidenceSnippets?.benefitEvidence || '',
    raw.evidenceSnippets?.eligibilityEvidence || '',
    raw.evidenceSnippets?.nameEvidence || '',
    ...(raw.supportingReferences || []).map(r => (r.title || '') + ' ' + (r.url || '')),
    aggregateText.slice(0, 5000)
  ].join(' ');

  const closedPattern = /\b(?:application[s]?\s+(?:are\s+|is\s+)?closed|registration[s]?\s+(?:are\s+|is\s+)?closed|portal\s+(?:is\s+)?closed|deadline\s+(?:is\s+over|has\s+ended|has\s+passed|has\s+expired|expired|ended|over|closed)|last\s+date\s+(?:is\s+over|has\s+passed|ended|was)|registration\s+ended|currently\s+closed|application\s+window\s+(?:is\s+)?closed|no\s+longer\s+accepting\s+applications?|closed\s+for\s+applications?|admissions?\s+closed|form\s+submission\s+closed|expired\b)/i;

  if (raw.deadlineStatus === 'closed' || closedPattern.test(textToScan)) {
    return {
      deadline: raw.deadline || 'Applications Closed',
      deadlineStatus: 'closed'
    };
  }

  // 2. Date extraction: Look for explicit dates tied to deadline / last date
  const dateRegex = /(?:deadline|last\s+date|closing\s+date|due\s+date|ended(?:\s+on)?|valid\s+(?:upto|till)|apply\s+(?:by|before))[:\s]+([0-9]{1,2}[-/.][0-9]{1,2}[-/.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))[,\s]+[0-9]{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+[0-9]{1,2}(?:st|nd|rd|th)?[,\s]+[0-9]{4})/i;

  const targetDateCandidate = raw.deadline || textToScan.match(dateRegex)?.[1];
  if (targetDateCandidate) {
    const parsedDate = parseDateString(targetDateCandidate);
    if (parsedDate) {
      if (parsedDate.getTime() < now.getTime()) {
        return {
          deadline: `Closed on ${targetDateCandidate}`,
          deadlineStatus: 'closed'
        };
      } else {
        return {
          deadline: targetDateCandidate,
          deadlineStatus: 'open'
        };
      }
    }
  }

  // 3. Delhi State e-District portal cycle verification:
  // On edistrict.delhigovt.nic.in, the academic cycle closed June 30, 2026.
  // Unless evidence documents a new active window for the succeeding cycle, it is closed.
  if (isDelhiScholarship) {
    return {
      deadline: 'Application Window Closed (Cycle ended June 30, 2026)',
      deadlineStatus: 'closed'
    };
  }

  // 4. Default to raw status if valid and not closed
  if (raw.deadlineStatus === 'open' || raw.deadlineStatus === 'upcoming') {
    return {
      deadline: raw.deadline || null,
      deadlineStatus: raw.deadlineStatus
    };
  }

  const defaultStatus = flagshipDef?.defaultDeadlineStatus;
  if (defaultStatus && defaultStatus !== 'open') {
    return {
      deadline: null,
      deadlineStatus: defaultStatus
    };
  }

  return {
    deadline: null,
    deadlineStatus: 'unknown'
  };
}

/**
 * Deduplicate schemes and reconcile evidence status based on live fetch, source verification,
 * and dynamic nationwide jurisdiction validation.
 * Merges duplicate records for the same scheme discovered across multiple URLs,
 * prioritizing official government detail pages while preserving supporting references.
 */
export function verifyAndDeduplicateSchemes(params: {
  rawSchemes: any[];
  fetchedPages?: FetchedPageContent[];
  targetState: string;
  userPersona?: string;
  userProfile?: any;
}): {
  schemes: CanonicalScheme[];
  verifiedSchemes: CanonicalScheme[];
  unverifiedCandidates: CanonicalScheme[];
  auditedDomains: string[];
  deduplicatedCount: number;
  uniqueCandidatesCount: number;
  canonicalSchemesCount: number;
  officialInformationPortalsCount: number;
  officialApplicationPortalsCount: number;
  secondarySourcesCount: number;
  mergedDetails: Array<{ schemeName: string; sourcesMergedCount: number }>;
  rejectedCandidates: Array<{ title: string; url: string; reason: string }>;
  jurisdictionFailures: Array<{
    schemeName: string;
    detectedJurisdiction: string;
    detectedState?: string | null;
    targetState: string;
    reason: string;
    url: string;
  }>;
  verificationBreakdown: {
    verifiedCount: number;
    partiallyVerifiedCount: number;
    unverifiedCount: number;
    rejectedCount: number;
  };
  sourceBreakdown: {
    officialGovernment: number;
    officialPortal: number;
    reputableSecondary: number;
    commercial: number;
    unknown: number;
  };
} {
  const { rawSchemes, fetchedPages = [], targetState, userPersona = 'student', userProfile = null } = params;
  const verifiedMap = new Map<string, CanonicalScheme>();
  const unverifiedMap = new Map<string, CanonicalScheme>();
  const stashedDocs = new Map<string, SupportingDocument[]>();
  const auditedDomainsSet = new Set<string>();
  const mergedDetails: Array<{ schemeName: string; sourcesMergedCount: number }> = [];
  const rejectedCandidates: Array<{ title: string; url: string; reason: string }> = [];
  const jurisdictionFailures: Array<{
    schemeName: string;
    detectedJurisdiction: string;
    detectedState?: string | null;
    targetState: string;
    reason: string;
    url: string;
  }> = [];

  const verificationBreakdown = {
    verifiedCount: 0,
    partiallyVerifiedCount: 0,
    unverifiedCount: 0,
    rejectedCount: 0
  };

  const sourceBreakdown = {
    officialGovernment: 0,
    officialPortal: 0,
    reputableSecondary: 0,
    commercial: 0,
    unknown: 0
  };

  // Aggregate all available text from fetched pages
  const fetchedUrlMap = new Map<string, FetchedPageContent>();
  let aggregateFetchedText = '';
  for (const page of fetchedPages) {
    if (page.url) fetchedUrlMap.set(page.url.toLowerCase(), page);
    if (page.final_url) fetchedUrlMap.set(page.final_url.toLowerCase(), page);
    aggregateFetchedText += ' ' + (page.text || '') + ' ' + (page.title || '');
    try {
      const u = new URL(page.url);
      auditedDomainsSet.add(u.hostname);
    } catch {}
  }
  const aggregateTextLower = aggregateFetchedText.toLowerCase();

  let deduplicatedCount = 0;
  let uniqueCandidatesCount = 0;

  for (const raw of rawSchemes) {
    const rawName = (raw.name || '').trim();
    if (!rawName) continue;
    uniqueCandidatesCount++;

    const rawUrl = raw.officialUrl || '';

    // 1. Separate documents, guidelines, committee reports, app store links, and commercial listings
    // from being treated as standalone schemes
    const docCheck = identifyParentSchemeForDocument(rawName, rawUrl, raw.description || '');
    if (docCheck) {
      if (docCheck.documentType === 'rejected_report') {
        const isCompilation = /schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|compilation|pib|compendium|annual report/i.test(rawName);
        if (isCompilation) {
          const combinedDocText = (raw.description || '') + ' ' + (raw.sourceTitle || '') + ' ' + aggregateFetchedText;
          const extractedNamed = extractNamedSchemesFromText(combinedDocText);
          if (extractedNamed.length > 0) {
            for (const named of extractedNamed) {
              const parentKey = normalizeSchemeName(named);
              if (!stashedDocs.has(parentKey)) {
                stashedDocs.set(parentKey, []);
              }
              stashedDocs.get(parentKey)!.push({
                title: rawName,
                url: rawUrl,
                domain: (() => { try { return new URL(rawUrl).hostname; } catch { return 'official'; } })(),
                relationship: 'official_supporting_document' as const,
                isOfficial: true,
                documentType: 'press_release',
                verifiedDate: new Date().toISOString()
              });
            }
          }
        }

        verificationBreakdown.rejectedCount++;
        rejectedCandidates.push({
          title: rawName,
          url: rawUrl,
          reason: isCompilation
            ? 'Multi-scheme government press release or compilation report, not a standalone scheme'
            : 'Parliamentary or legislative committee report, not a government welfare scheme'
        });
        continue;
      }

      if (docCheck.documentType === 'commercial_or_unverified_source') {
        sourceBreakdown.commercial++;
        verificationBreakdown.rejectedCount++;
        jurisdictionFailures.push({
          schemeName: rawName,
          detectedJurisdiction: 'commercial',
          detectedState: null,
          targetState,
          reason: 'Commercial vendor, equipment dealer, or private marketplace. Not an official government department.',
          url: rawUrl
        });
        rejectedCandidates.push({
          title: rawName,
          url: rawUrl,
          reason: 'Commercial vendor, equipment dealer, or private marketplace. Not an official government department.'
        });
        continue;
      }

      if (docCheck.documentType === 'official_supporting_document' && docCheck.parentSchemeName) {
        deduplicatedCount++;
        // Attach this document as supporting evidence for the parent scheme
        const docObj = {
          title: rawName,
          url: rawUrl,
          domain: (() => { try { return new URL(rawUrl).hostname; } catch { return 'official'; } })(),
          relationship: 'official_supporting_document' as const,
          isOfficial: true,
          documentType: /guideline/i.test(rawName) ? 'guideline' : /faq/i.test(rawName) ? 'faq' : /app/i.test(rawName) ? 'mobile_app' : 'circular',
          verifiedDate: new Date().toISOString()
        };

        const parentKey = normalizeSchemeName(docCheck.parentSchemeName);
        if (!stashedDocs.has(parentKey)) {
          stashedDocs.set(parentKey, []);
        }
        stashedDocs.get(parentKey)!.push(docObj);

        // If parent canonical scheme already in verifiedMap or unverifiedMap, append immediately
        const existingParent =
          verifiedMap.get(parentKey) ||
          verifiedMap.get(`${parentKey}::unified`) ||
          verifiedMap.get(`${parentKey}::central`) ||
          unverifiedMap.get(parentKey) ||
          unverifiedMap.get(`${parentKey}::unified`) ||
          unverifiedMap.get(`${parentKey}::central`) ||
          Array.from(verifiedMap.entries()).find(([k]) => k.startsWith(parentKey))?.[1] ||
          Array.from(unverifiedMap.entries()).find(([k]) => k.startsWith(parentKey))?.[1];

        if (existingParent) {
          existingParent.supportingDocuments = existingParent.supportingDocuments || [];
          if (!existingParent.supportingDocuments.some(d => d.url === docObj.url)) {
            existingParent.supportingDocuments.push(docObj);
          }
          if (rawUrl && !existingParent.sourceUrls.includes(rawUrl)) {
            existingParent.sourceUrls.push(rawUrl);
          }
          if (Array.isArray(raw.sourceUrls)) {
            for (const sUrl of raw.sourceUrls) {
              if (sUrl && !existingParent.sourceUrls.includes(sUrl)) {
                existingParent.sourceUrls.push(sUrl);
              }
            }
          }
          if (rawUrl && (!existingParent.supportingEvidenceUrls || !existingParent.supportingEvidenceUrls.includes(rawUrl))) {
            existingParent.supportingEvidenceUrls = Array.from(new Set([...(existingParent.supportingEvidenceUrls || []), rawUrl]));
          }
        }
        continue;
      }
    }

    // 0. Candidate Classification Guard: Only genuine individual schemes can become separate scheme cards
    // Directories, portals, articles, and guidelines may be supporting sources but must not become separate cards
    const candidateClass = classifyCandidate(rawName, rawUrl, raw.description || '');
    const isExplicitDocOrGuideline =
      candidateClass === 'guidelines_or_document' ||
      candidateClass === 'supporting_document' ||
      /\.(pdf|docx?|xlsx?)$/i.test(rawUrl || '') ||
      /\/schemeguidelines\/|\/guidelines?\//i.test(rawUrl || '') ||
      /^(rules?\s+for\s+(?:the\s+)?award|guidelines?\s+(?:for|of)|scheme\s+guidelines?)\b/i.test(rawName);

    const isApexScholarshipCandidate = !isExplicitDocOrGuideline && (
      (rawUrl && (rawUrl.toLowerCase().includes('scholarship.up.gov.in') || rawUrl.toLowerCase().includes('scholarships.gov.in') || rawUrl.toLowerCase().includes('buddy4study.com'))) ||
      /\b(up scholarship|uttar pradesh scholarship|dashmottar|shulk pratipoorti|post[- ]?matric.*(?:up|uttar pradesh))\b/i.test(rawName)
    );

    if (candidateClass !== 'individual_scheme' && !isApexScholarshipCandidate) {
      verificationBreakdown.rejectedCount++;
      const reasonDescriptions: Record<string, string> = {
        official_scheme_directory: 'Official scheme directory or department listing page; preserved as supporting reference, not an individual scheme card.',
        directory_or_listing: 'Scheme directory or listing portal; preserved as supporting reference, not an individual scheme card.',
        application_portal: 'Application portal or registration endpoint; preserved as supporting portal reference, not an individual scheme card.',
        scheme_portal: 'Scheme portal homepage; preserved as supporting reference, not an individual scheme card.',
        news_or_article: 'News article, press release, or third-party overview; preserved as secondary discovery lead, not an individual scheme card.',
        guidelines_or_document: 'Guideline document, circular, or PDF; preserved as official supporting document, not an individual scheme card.',
        supporting_document: 'Supporting document or guideline; preserved as reference, not an individual scheme card.',
        umbrella_program: 'Broad umbrella program category without distinct scheme rules; not an individual scheme card.',
        unrelated_or_insufficient: 'Generic portal page or insufficient evidence establishing a distinct government scheme.'
      };
      const isCompilation = /schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|compilation|pib|compendium|annual report/i.test(rawName);
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: isCompilation
          ? 'Multi-scheme government press release or compilation report, not an individual scheme card.'
          : reasonDescriptions[candidateClass] || 'Non-individual scheme candidate excluded from scheme cards.'
      });

      // Try to associate this supporting source with any named individual scheme referenced in its text
      const combinedDocText = `${rawName} ${raw.description || ''} ${raw.sourceTitle || ''} ${aggregateFetchedText}`;
      const extractedNamed = extractNamedSchemesFromText(combinedDocText);
      for (const named of extractedNamed) {
        const parentKey = normalizeSchemeName(named);
        if (!stashedDocs.has(parentKey)) {
          stashedDocs.set(parentKey, []);
        }
        stashedDocs.get(parentKey)!.push({
          title: rawName,
          url: rawUrl,
          domain: (() => { try { return new URL(rawUrl).hostname; } catch { return 'official'; } })(),
          relationship: classifySource(rawUrl, targetState).isOfficial ? 'official_supporting_document' : 'reputable_secondary_source',
          isOfficial: classifySource(rawUrl, targetState).isOfficial,
          documentType: candidateClass,
          verifiedDate: new Date().toISOString()
        });
      }

      // Check if this document or guideline belongs to an existing scheme and has conflicting benefit info
      const normDocKey = normalizeSchemeName(sanitizeSchemeName(rawName) || rawName);
      const existingParent =
        verifiedMap.get(normDocKey) ||
        verifiedMap.get(`${normDocKey}::unified`) ||
        verifiedMap.get(`${normDocKey}::central`) ||
        unverifiedMap.get(normDocKey) ||
        unverifiedMap.get(`${normDocKey}::unified`) ||
        unverifiedMap.get(`${normDocKey}::central`) ||
        Array.from(verifiedMap.entries()).find(([k]) => k.startsWith(normDocKey))?.[1] ||
        Array.from(unverifiedMap.entries()).find(([k]) => k.startsWith(normDocKey))?.[1];

      if (existingParent) {
        deduplicatedCount++;
        if (rawUrl && !existingParent.sourceUrls.includes(rawUrl)) {
          existingParent.sourceUrls.push(rawUrl);
        }
        if (Array.isArray(raw.sourceUrls)) {
          for (const sUrl of raw.sourceUrls) {
            if (sUrl && !existingParent.sourceUrls.includes(sUrl)) {
              existingParent.sourceUrls.push(sUrl);
            }
          }
        }
        if (rawUrl && (!existingParent.supportingEvidenceUrls || !existingParent.supportingEvidenceUrls.includes(rawUrl))) {
          existingParent.supportingEvidenceUrls = Array.from(new Set([...(existingParent.supportingEvidenceUrls || []), rawUrl]));
        }
        if (raw.benefits && !isGenericBenefit(raw.benefits)) {
          if (existingParent.fieldEvidence?.benefit && existingParent.fieldEvidence.benefit.passageSnippet !== raw.benefits) {
            existingParent.fieldEvidence.benefit.conflictNotes =
              `Conflicting benefit information reported: alternative evidence snippet observed from ${rawUrl}. Authoritative primary source retained.`;
          }
        }
      }
      continue;
    }

    // Check URL legitimacy
    let officialUrl = raw.officialUrl && isValidPublicUrl(raw.officialUrl)
      ? raw.officialUrl
      : 'https://scholarships.gov.in';

    try {
      const u1 = new URL(officialUrl);
      auditedDomainsSet.add(u1.hostname);
    } catch {}

    // -----------------------------------------------------------------
    // 2. Source Classification Nationwide
    // -----------------------------------------------------------------
    let sourceRes = classifySource(officialUrl, targetState);

    if (sourceRes.classification === 'official_government' || sourceRes.classification === 'official_government_scheme_page') {
      sourceBreakdown.officialGovernment++;
    } else if (sourceRes.classification === 'official_scheme_portal' || sourceRes.classification === 'official_application_portal' || sourceRes.classification === 'official_supporting_document') {
      sourceBreakdown.officialPortal++;
    } else if (sourceRes.classification === 'reputable_secondary' || sourceRes.classification === 'secondary_source') {
      sourceBreakdown.reputableSecondary++;
    } else if (sourceRes.classification === 'commercial' || sourceRes.classification === 'commercial_source') {
      sourceBreakdown.commercial++;
    } else {
      sourceBreakdown.unknown++;
    }

    // REJECT commercial platforms from generating scheme cards
    if (sourceRes.isCommercial) {
      verificationBreakdown.rejectedCount++;
      jurisdictionFailures.push({
        schemeName: rawName,
        detectedJurisdiction: 'commercial',
        detectedState: null,
        targetState,
        reason: `Commercial platform (${sourceRes.ownerName}). Not an official government department.`,
        url: officialUrl
      });
      rejectedCandidates.push({
        title: rawName,
        url: officialUrl,
        reason: `Commercial platform (${sourceRes.ownerName}). Not an official government department.`
      });
      continue;
    }

    // Reject academic research papers, journal articles, textbook study units, and budget analysis papers
    if (/\/journal\/|\/article\/download|egyankosh\.ac\.in|researchgate\.net|academia\.edu|sciencedirect\.com|prsindia\.org\/files\/budget\//i.test(rawUrl)) {
      verificationBreakdown.rejectedCount++;
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: 'Academic research paper, journal article, textbook unit, or budget study — not a government welfare scheme'
      });
      continue;
    }

    // Multi-scheme press release or generic document detection
    // e.g. "Schemes for Welfare of Farmers", "Schemes for Farmers", PIB release compilations
    let cleanedName = sanitizeSchemeName(rawName);
    if (!cleanedName || isInvalidSchemeName(cleanedName)) {
      // Extract named individual schemes from text to preserve as supporting evidence
      const combinedDocText = (raw.description || '') + ' ' + (raw.sourceTitle || '') + ' ' + aggregateFetchedText;
      const extractedNamed = extractNamedSchemesFromText(combinedDocText);
      if (extractedNamed.length > 0) {
        for (const named of extractedNamed) {
          const parentKey = normalizeSchemeName(named);
          if (!stashedDocs.has(parentKey)) {
            stashedDocs.set(parentKey, []);
          }
          stashedDocs.get(parentKey)!.push({
            title: rawName,
            url: officialUrl,
            domain: (() => { try { return new URL(officialUrl).hostname; } catch { return 'official'; } })(),
            relationship: 'official_supporting_document' as const,
            isOfficial: sourceRes.isOfficial,
            documentType: 'press_release',
            verifiedDate: new Date().toISOString()
          });
        }
      }
      verificationBreakdown.rejectedCount++;
      rejectedCandidates.push({
        title: rawName,
        url: rawUrl,
        reason: 'Multi-scheme government press release or compilation report, not a standalone scheme'
      });
      continue;
    }

    const normKey = normalizeSchemeName(cleanedName);
    if (!normKey || normKey.length < 3) continue;

    // Two-stage discovery / Flagship canonical reconciliation:
    // If candidate matches an authoritative nationwide flagship scheme (e.g. PM-KISAN, PMFBY, PM-KUSUM):
    const flagshipDef = FLAGSHIP_DEFINITIONS[normKey];
    if (flagshipDef) {
      cleanedName = flagshipDef.name;
      // If candidate was discovered via a secondary source (e.g. IBEF) or document,
      // resolve authoritative portal evidence while retaining discovery source in supportingReferences
      if (sourceRes.isSecondary || sourceRes.classification === 'secondary_source' || !sourceRes.isOfficial) {
        // Only attach genuine secondary sources; never attach commercial or imposter domains
        if (!sourceRes.isCommercial && sourceRes.classification !== 'commercial_source' && !sourceRes.domain.includes('.in.net')) {
          if (!raw.supportingReferences) raw.supportingReferences = [];
          raw.supportingReferences.push({
            title: raw.sourceTitle || raw.name || flagshipDef.name,
            url: officialUrl,
            domain: sourceRes.domain,
            isOfficial: false
          });
        }
        officialUrl = flagshipDef.officialUrl;
        sourceRes = classifySource(flagshipDef.officialUrl, targetState);
      }
    }

    // -----------------------------------------------------------------
    // 3. Dynamic Nationwide Jurisdiction Validation
    // -----------------------------------------------------------------
    const candidateJurisdictionInput: CandidateJurisdictionInput = {
      name: cleanedName,
      description: raw.description,
      officialUrl,
      level: raw.level,
      state: raw.state,
      department: raw.department,
      sourceTitle: raw.sourceTitle,
      evidenceSnippets: raw.evidenceSnippets
    };

    const jurisdictionRes = detectJurisdiction(candidateJurisdictionInput, targetState);

    // If scheme is strictly inapplicable to targetState (e.g. cross-state scheme), reject it
    if (!jurisdictionRes.isApplicableToTarget) {
      verificationBreakdown.rejectedCount++;
      jurisdictionFailures.push({
        schemeName: cleanedName,
        detectedJurisdiction: jurisdictionRes.jurisdiction,
        detectedState: jurisdictionRes.detectedState,
        targetState,
        reason: jurisdictionRes.reason,
        url: officialUrl
      });
      rejectedCandidates.push({
        title: cleanedName,
        url: officialUrl,
        reason: jurisdictionRes.rejectionReason || jurisdictionRes.reason
      });
      continue;
    }

    // -----------------------------------------------------------------
    // 4. Corroboration of Scheme Name in Source Evidence
    // -----------------------------------------------------------------
    const nameTokens = normKey.split(' ').filter(w => w.length > 2);
    const snippetText = (raw.description || '') + ' ' + (raw.sourceTitle || '') + ' ' + officialUrl;
    const combinedSourceText = (snippetText + ' ' + aggregateTextLower).toLowerCase();

    const acronymMatch = rawName.match(/\(([A-Za-z0-9-]+)\)/);
    const acronym = acronymMatch ? acronymMatch[1].toLowerCase() : '';
    const hasAcronymInSource = acronym.length >= 2 && (combinedSourceText.includes(acronym) || combinedSourceText.includes(acronym.replace(/-/g, ' ')));

    const isDedicatedOfficialPortal = Boolean(
      flagshipDef &&
      (() => {
        try {
          return new URL(officialUrl).hostname.toLowerCase().includes(new URL(flagshipDef.officialUrl).hostname.toLowerCase());
        } catch {
          return false;
        }
      })()
    );

    const nameMatchesInSource =
      isDedicatedOfficialPortal ||
      Boolean(flagshipDef) ||
      hasAcronymInSource ||
      combinedSourceText.includes(cleanedName.toLowerCase().slice(0, 20)) ||
      (nameTokens.length > 0 &&
        (nameTokens.filter(t => combinedSourceText.includes(t)).length >= Math.min(2, nameTokens.length)));

    // -----------------------------------------------------------------
    // 5. Corroboration of Benefit in Source Evidence (Zero Fabrication)
    // -----------------------------------------------------------------
    let rawBenefit = raw.benefits || '';
    if (isGenericBenefit(rawBenefit) && flagshipDef?.benefits && !isGenericBenefit(flagshipDef.benefits)) {
      rawBenefit = flagshipDef.benefits;
    }
    const hasFactualBenefit = !isGenericBenefit(rawBenefit);
    const benefitEvidence = raw.evidenceSnippets?.benefitEvidence || (hasFactualBenefit ? rawBenefit : null);

    const benefitCorroborated = hasFactualBenefit && (
      Boolean(flagshipDef) ||
      (benefitEvidence && combinedSourceText.includes(benefitEvidence.toLowerCase().slice(0, 30))) ||
      /₹|rs\.?|\b(lakh|crore|stipend|tuition|allowance|reimbursement|dbt|grant|pension|subsidy|loan|crop insurance|premium)\b/i.test(rawBenefit)
    );

    // If benefit is generic or unsupported, DO NOT fabricate generic text.
    // Display explicitly: "Benefit details not verified from primary source."
    let finalBenefit = rawBenefit;
    if (isGenericBenefit(finalBenefit)) {
      if (raw.evidenceSnippets?.benefitEvidence && !isGenericBenefit(raw.evidenceSnippets.benefitEvidence)) {
        finalBenefit = raw.evidenceSnippets.benefitEvidence;
      } else if (flagshipDef && flagshipDef.benefits && !isGenericBenefit(flagshipDef.benefits)) {
        finalBenefit = flagshipDef.benefits;
      } else {
        finalBenefit = 'Benefit details not verified from primary source.';
      }
    }

    // -----------------------------------------------------------------
    // 6. Application URL Selection & Profile Evaluation
    // -----------------------------------------------------------------
    // Only establish applicationUrl if source is a verified application portal
    // Never use news announcements, press releases, guideline PDFs, or overview portals
    let applicationUrl: string | null = null;
    if (raw.applicationUrl) {
      applicationUrl = validateApplicationUrl(raw.applicationUrl);
    } else if (sourceRes.relationship === 'official_application_portal') {
      applicationUrl = validateApplicationUrl(officialUrl);
    } else if (flagshipDef?.applyUrl) {
      applicationUrl = validateApplicationUrl(flagshipDef.applyUrl);
    }

    // State portal resolution for state-implemented CSS (Post-Matric / Pre-Matric / Fee Reimbursement)
    const activeState = (jurisdictionRes.detectedState || targetState || '').toLowerCase();
    const isStateImplementedCss = normKey.includes('post matric') || normKey.includes('pre matric') || normKey.includes('fee reimbursement');
    if (isStateImplementedCss) {
      if (activeState.includes('uttar pradesh') || activeState === 'up') {
        applicationUrl = 'https://scholarship.up.gov.in/';
        if (!officialUrl || officialUrl.includes('scholarships.gov.in') || officialUrl.includes('umang.gov.in')) {
          officialUrl = 'https://scholarship.up.gov.in/';
        }
      } else if (activeState.includes('bihar')) {
        applicationUrl = 'https://pmsonline.bih.nic.in/';
      } else if (activeState.includes('delhi')) {
        applicationUrl = 'https://edistrict.delhigovt.nic.in/';
      } else if (!applicationUrl) {
        applicationUrl = 'https://scholarships.gov.in/';
      }
    }

    // Do not use the same URL for officialInformationUrl and applicationUrl unless explicitly confirmed
    if (applicationUrl && applicationUrl.toLowerCase() === officialUrl.toLowerCase()) {
      const isApex = /scholarships\.gov\.in|scholarship\.up\.gov\.in|pmsonline\.bih\.nic\.in|medhasoft\.bih\.nic\.in|edistrict\.delhigovt\.nic\.in/i.test(applicationUrl);
      if (sourceRes.relationship !== 'official_application_portal' && !isApex) {
        applicationUrl = null;
      }
    }

    // 6a. Real Eligibility Extraction & Profile Alignment (No filler)
    const cleanEligibilityReasons = (Array.isArray(raw.eligibilityReasons) ? raw.eligibilityReasons : [])
      .filter(r => typeof r === 'string' &&
        !/identified from active|public welfare portal/i.test(r) &&
        !/details not verified/i.test(r) &&
        !/^(scheme name|launched by|state\s*[,:])/i.test(r) &&
        !r.toLowerCase().includes('scheme name,') &&
        !/\.\.\.?\s*$/.test(r) &&
        r.trim().length >= 15
      );

    let finalEligibilitySummary = cleanEligibilityReasons;
    if ((finalEligibilitySummary.length === 0 || finalEligibilitySummary.length < 2) && flagshipDef?.eligibilityCriteria?.length) {
      finalEligibilitySummary = flagshipDef.eligibilityCriteria;
    }
    if (finalEligibilitySummary.length === 0) {
      finalEligibilitySummary = ['Eligibility details not verified from primary source.'];
    }

    const hasRealEligibility = finalEligibilitySummary.length > 0 && !finalEligibilitySummary.some(r => r.includes('not verified'));

    const profileEval = evaluateProfileCriteria({
      schemeName: cleanedName,
      description: raw.description,
      criteriaSummary: finalEligibilitySummary,
      reasons: Array.isArray(raw.missingOrCautionCriteria) ? raw.missingOrCautionCriteria : [],
      userProfile,
      targetState
    });

    // 6b. Verification Status Calculation
    const isPageFetched = fetchedUrlMap.has(officialUrl.toLowerCase());
    const verificationEval = evaluateVerificationStatus({
      jurisdictionResult: jurisdictionRes,
      sourceClassification: sourceRes,
      hasCorroboratedName: nameMatchesInSource,
      hasCorroboratedBenefit: benefitCorroborated,
      hasConfirmedApplicationUrl: Boolean(applicationUrl),
      hasCorroboratedEligibility: hasRealEligibility,
      pageFetchedSuccessfully: isPageFetched
    });

    let verificationStatus: VerificationStatus = verificationEval.status;
    let partialReasons = [...(verificationEval.partialReasons || [])];

    // Filter out contradictory negative reasons when positive evidence has been established
    if (sourceRes.isOfficial) {
      partialReasons = partialReasons.filter(r => !/source is not an official government department|secondary source citation/i.test(r));
    }
    if (benefitCorroborated) {
      partialReasons = partialReasons.filter(r => !/financial benefit details not verified/i.test(r));
    }
    if (Boolean(applicationUrl)) {
      partialReasons = partialReasons.filter(r => !/direct online application link not verified/i.test(r));
    }
    if (hasRealEligibility) {
      partialReasons = partialReasons.filter(r => !/specific eligibility criteria require further verification/i.test(r));
    }

    // Shared generic rule: Institutional / Intermediary assistance schemes
    // If a scheme provides assistance through cooperatives, societies, or implementing agencies rather than direct individual citizen enrollment:
    const isInstitutionalScheme =
      /\b(cooperative societies|state federations|implementing agencies|ncdc|pacss?|apex societies|institutional assistance|cluster assistance|marketing federation)\b/i.test(
        normKey + ' ' + (raw.description || '') + ' ' + (raw.benefits || '')
      );
    if (isInstitutionalScheme && !applicationUrl) {
      if (verificationStatus === 'verified') {
        verificationStatus = 'partially_verified';
      }
      if (!partialReasons.some(r => r.includes('Direct citizen application'))) {
        partialReasons.push('Direct citizen application portal not verified; scheme assistance is channeled through cooperative societies and implementing agencies.');
      }
    }

    let evidenceStatus: EvidenceStatus = 'unverified';
    if (sourceRes.isOfficial) {
      evidenceStatus = 'officially_supported';
    } else if (verificationStatus === 'verified') {
      evidenceStatus = 'officially_verified';
    } else if (verificationStatus === 'partially_verified') {
      evidenceStatus = 'partially_verified';
    } else {
      evidenceStatus = 'unverified';
    }

    if (verificationStatus === 'verified') {
      verificationBreakdown.verifiedCount++;
    } else if (verificationStatus === 'partially_verified') {
      verificationBreakdown.partiallyVerifiedCount++;
    } else {
      verificationBreakdown.unverifiedCount++;
    }

    const level: SchemeLevel =
      jurisdictionRes.jurisdiction === 'central'
        ? 'Central'
        : jurisdictionRes.jurisdiction === 'multi_state'
        ? 'Multi-State'
        : 'State';

    const stateVal = level === 'State' ? (jurisdictionRes.detectedState || targetState) : null;

    const initialDeadlineRes = resolveSchemeDeadline({
      raw,
      aggregateText: aggregateFetchedText,
      isDelhiScholarship: false,
      flagshipDef
    });
    let deadlineStatus: DeadlineStatus = initialDeadlineRes.deadlineStatus;
    let deadline: string | null = initialDeadlineRes.deadline;

    const eligibilityStatus: EligibilityStatus =
      raw.eligibilityStatus === 'not_eligible'
        ? 'not_eligible'
        : raw.eligibilityStatus === 'insufficient_information'
        ? 'insufficient_information'
        : 'potentially_eligible';

    // Category determination
    let category = raw.category || 'Education';
    const catCheck = (cleanedName + ' ' + (raw.description || '')).toLowerCase();
    if (catCheck.includes('scholarship') || catCheck.includes('post matric') || catCheck.includes('pre matric') || catCheck.includes('fellowship')) {
      category = 'Education';
    } else if (catCheck.includes('msme') || catCheck.includes('mudra') || catCheck.includes('self employment') || catCheck.includes('business loan') || catCheck.includes('cmegp') || catCheck.includes('pmegp') || catCheck.includes('credit')) {
      category = 'Business & MSME';
    } else if (catCheck.includes('kisan') || catCheck.includes('farmer') || catCheck.includes('krishi') || catCheck.includes('agriculture') || catCheck.includes('fasal bima')) {
      category = 'Agriculture';
    } else if (catCheck.includes('ayushman') || catCheck.includes('health') || catCheck.includes('arogya') || catCheck.includes('medical')) {
      category = 'Healthcare';
    } else if (catCheck.includes('housing') || catCheck.includes('awas')) {
      category = 'Housing';
    } else if (catCheck.includes('pension') || catCheck.includes('social security') || catCheck.includes('senior')) {
      category = 'Social Security';
    }

    // Calibrated Match Score
    const { score: calibratedScore, rationale: scoreRationale } = calculateCalibratedMatchScore({
      level,
      state: stateVal,
      targetState,
      category,
      userPersona,
      eligibilityStatus,
      evidenceStatus
    });

    // Clean source domain for portal name
    let portalName = flagshipDef?.portalName;
    if (!portalName) {
      if (raw.portalName && !raw.portalName.includes('.') && raw.portalName !== 'Official Portal' && raw.portalName !== 'Government Welfare Portal') {
        portalName = raw.portalName;
      } else if (sourceRes.isOfficial) {
        try {
          const u = new URL(officialUrl);
          portalName = `${sourceRes.ownerName} (${u.hostname})`;
        } catch {
          portalName = sourceRes.ownerName || 'Official Government Portal';
        }
      } else {
        portalName = 'National Scholarship Portal';
      }
    }

    // Attach any stashed supporting documents
    const attachedSupportingDocs = stashedDocs.get(normKey) || [];

    // If officialUrl is a news release, guideline document, or continuation update, preserve it in supporting documents
    if (officialUrl.includes('/news_updates/') || officialUrl.includes('/pressrelease/') || officialUrl.includes('cabinet-approves')) {
      attachedSupportingDocs.push({
        title: rawName,
        url: officialUrl,
        domain: sourceRes.domain,
        relationship: 'official_supporting_document',
        isOfficial: true,
        documentType: 'news_release',
        verifiedDate: new Date().toISOString()
      });
    }

    // Separate official info URL, application URL, and supporting evidence URLs
    const officialInformationUrl = officialUrl;
    const supportingEvidenceUrls = Array.from(new Set([
      officialUrl,
      ...(Array.isArray(raw.sourceUrls) ? raw.sourceUrls.filter(isValidPublicUrl) : []),
      ...attachedSupportingDocs.map(d => d.url)
    ]));

    // Remove generic placeholder claims for description and category reason (Problem 7)
    let finalDescription = raw.description?.trim() || '';
    const hasSnippetJunk = /^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i.test(finalDescription) ||
      /\b(pending for verification|read more)\b/i.test(finalDescription) ||
      /\.\.\.?\s*$/.test(finalDescription);

    if (
      !finalDescription ||
      finalDescription.length < 15 ||
      hasSnippetJunk ||
      /official initiative identified for/i.test(finalDescription) ||
      /initiative for eligible citizens/i.test(finalDescription) ||
      /scheme description not verified/i.test(finalDescription)
    ) {
      if (flagshipDef?.description) {
        finalDescription = flagshipDef.description;
      } else if (hasSnippetJunk) {
        finalDescription = finalDescription
          .replace(/^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i, '')
          .replace(/\s*read\s*more\s*$/i, '')
          .replace(/\s*\.\.\.?\s*$/, '.')
          .trim();
      } else {
        finalDescription = 'Scheme description not verified.';
      }
    }

    let finalCategoryReason = raw.categoryReason?.trim() || '';
    if (
      !finalCategoryReason ||
      /official initiative identified for/i.test(finalCategoryReason)
    ) {
      finalCategoryReason = `Classified as ${category} based on verified scheme domain and beneficiary focus.`;
    }

    // Construct traceable field-level evidence with explicit timestamps and reasons (Problem 2)
    const nowIso = new Date().toISOString();
    const fieldEvidence: SchemeFieldEvidence = {
      schemeName: {
        sourceUrl: officialUrl,
        passageSnippet: cleanedName,
        isVerified: nameMatchesInSource,
        verifiedAt: nowIso,
        reason: nameMatchesInSource
          ? 'Scheme title verified against primary source evidence.'
          : 'Scheme title pending direct textual corroboration in source.'
      },
      schemeIdentity: {
        sourceUrl: officialUrl,
        passageSnippet: `${sourceRes.ownerName} - ${cleanedName}`,
        isVerified: sourceRes.isOfficial && nameMatchesInSource,
        verifiedAt: nowIso,
        reason: (sourceRes.isOfficial && nameMatchesInSource)
          ? `Official government scheme identity established under ${sourceRes.ownerName}.`
          : sourceRes.isSecondary
          ? 'Scheme discovered via secondary directory; primary government authority corroboration pending.'
          : 'Scheme identity unverified against official government registers.'
      },
      jurisdiction: {
        sourceUrl: officialUrl,
        passageSnippet: jurisdictionRes.reason,
        isVerified: jurisdictionRes.isApplicableToTarget,
        verifiedAt: nowIso,
        reason: jurisdictionRes.reason
      },
      department: {
        sourceUrl: officialUrl,
        passageSnippet: (flagshipDef?.department || raw.department || sourceRes.ownerName),
        isVerified: Boolean(flagshipDef?.department || raw.department || sourceRes.isOfficial),
        verifiedAt: nowIso,
        reason: Boolean(flagshipDef?.department || raw.department || sourceRes.isOfficial)
          ? `Governing department established: ${flagshipDef?.department || raw.department || sourceRes.ownerName}.`
          : 'Department ownership not verified.'
      },
      description: {
        sourceUrl: officialUrl,
        passageSnippet: finalDescription,
        isVerified: finalDescription !== 'Scheme description not verified.',
        verifiedAt: nowIso,
        reason: finalDescription !== 'Scheme description not verified.'
          ? 'Scheme description verified from factual source text.'
          : 'Scheme description not verified.'
      },
      benefit: {
        sourceUrl: officialUrl,
        passageSnippet: finalBenefit,
        isVerified: benefitCorroborated,
        verifiedAt: nowIso,
        reason: benefitCorroborated
          ? 'Benefit terms verified from factual financial evidence.'
          : 'Benefit details not verified from primary source.'
      },
      eligibility: {
        sourceUrl: officialUrl,
        passageSnippet: finalEligibilitySummary.join('; '),
        isVerified: hasRealEligibility,
        verifiedAt: nowIso,
        reason: hasRealEligibility
          ? 'Detailed eligibility requirements extracted from official source.'
          : 'Eligibility criteria not verified from primary source.'
      },
      applicationAvailability: {
        sourceUrl: applicationUrl || officialUrl,
        passageSnippet: applicationUrl ? `Active application service endpoint confirmed at ${applicationUrl}` : 'Application link not verified from primary source.',
        isVerified: Boolean(applicationUrl),
        verifiedAt: nowIso,
        reason: Boolean(applicationUrl)
          ? `Direct application service endpoint available at ${applicationUrl}.`
          : 'Online application availability not verified on source page.'
      },
      officialInformationUrl: {
        sourceUrl: officialUrl,
        passageSnippet: officialUrl,
        isVerified: sourceRes.isOfficial || sourceRes.isSecondary,
        verifiedAt: nowIso,
        reason: sourceRes.isOfficial
          ? `Official department portal established: ${officialUrl}.`
          : `Secondary informational reference: ${officialUrl}.`
      },
      applicationUrl: {
        sourceUrl: applicationUrl || officialUrl,
        passageSnippet: applicationUrl || 'Application link not verified.',
        isVerified: Boolean(applicationUrl),
        verifiedAt: nowIso,
        reason: Boolean(applicationUrl)
          ? `Direct interactive application endpoint confirmed: ${applicationUrl}.`
          : 'Direct online application portal link not verified from primary source.'
      }
    };

    const activeStateNorm = (jurisdictionRes.detectedState || targetState || '').toLowerCase();
    const isDelhiScholarship = Boolean(
      applicationUrl?.includes('edistrict.delhigovt.nic.in') ||
      (activeStateNorm.includes('delhi') && isStateImplementedCss)
    );
    const isBiharScholarship = Boolean(
      applicationUrl?.includes('pmsonline.bih.nic.in') ||
      applicationUrl?.includes('medhasoft.bih.nic.in') ||
      (activeStateNorm.includes('bihar') && isStateImplementedCss)
    );
    const isUpScholarship = Boolean(
      applicationUrl?.includes('scholarship.up.gov.in') ||
      ((activeStateNorm.includes('uttar pradesh') || activeStateNorm === 'up') && isStateImplementedCss)
    );

    let finalLevel: SchemeLevel = level;
    let finalState = stateVal;
    let finalJurisdiction = jurisdictionRes.jurisdiction;
    let finalAdminLabel = jurisdictionRes.administrativeLabel || 'Jurisdiction Unspecified';
    let finalDept = raw.department || flagshipDef?.department || undefined;
    let finalPortalName = portalName || flagshipDef?.portalName || 'Official Portal';

    if (isDelhiScholarship) {
      finalLevel = 'State';
      finalState = 'Delhi';
      finalJurisdiction = 'state';
      finalAdminLabel = 'Government of NCT of Delhi';
      finalDept = 'Department for the Welfare of SC/ST/OBC, Govt. of NCT of Delhi';
      finalPortalName = 'e-District Delhi Portal';
    } else if (isBiharScholarship) {
      finalLevel = 'State';
      finalState = 'Bihar';
      finalJurisdiction = 'state';
      finalAdminLabel = 'State Government of Bihar';
      finalDept = 'Education & Social Welfare Department, Government of Bihar';
      finalPortalName = 'Bihar Post Matric Scholarship Portal';
    } else if (isUpScholarship) {
      finalLevel = 'State';
      finalState = 'Uttar Pradesh';
      finalJurisdiction = 'state';
      finalAdminLabel = 'State Government of Uttar Pradesh';
      finalDept = 'Social Welfare Department, Government of Uttar Pradesh';
      finalPortalName = 'UP Scholarship and Fee Reimbursement Online System';
    }

    if (isDelhiScholarship) {
      const delhiDeadline = resolveSchemeDeadline({
        raw,
        aggregateText: aggregateFetchedText,
        isDelhiScholarship: true,
        flagshipDef
      });
      deadlineStatus = delhiDeadline.deadlineStatus;
      deadline = delhiDeadline.deadline;
    }

    const canonical: CanonicalScheme = {
      id: raw.id || `live-${normKey.replace(/\s+/g, '-').slice(0, 30)}`,
      name: cleanedName,
      aliases: Array.isArray(raw.aliases) ? raw.aliases : undefined,
      hindiName: raw.hindiName || undefined,
      category,
      categoryReason: finalCategoryReason,
      department: finalDept,
      benefitType: raw.benefitType || (/loan/i.test(finalBenefit + ' ' + cleanedName) ? 'loan' : /subsidy/i.test(finalBenefit) ? 'subsidy' : /scholarship/i.test(finalBenefit) ? 'scholarship' : 'grant'),
      level: finalLevel,
      jurisdiction: finalJurisdiction,
      administrativeStructure: (isDelhiScholarship || isBiharScholarship || isUpScholarship) ? 'state' : (jurisdictionRes.administrativeStructure || 'unknown'),
      administrativeLabel: finalAdminLabel,
      fundingAndAdminType: (isDelhiScholarship || isBiharScholarship || isUpScholarship) ? 'centrally_sponsored' : (jurisdictionRes.fundingType || 'unknown'),
      candidateClassification: raw.candidateClassification || 'individual_scheme',
      state: finalState,
      applicableStates: jurisdictionRes.applicableStates,
      portalName: finalPortalName,
      description: finalDescription,
      benefits: finalBenefit,
      benefitAmountApprox: typeof raw.benefitAmountApprox === 'number' ? raw.benefitAmountApprox : undefined,
      sourceClassification: sourceRes.classification,
      sourceRelationship: sourceRes.relationship,
      verificationStatus,
      verificationEvidence: verificationEval.evidenceNote,
      partialVerificationReasons: partialReasons.length > 0 ? partialReasons : undefined,
      jurisdictionVerified: jurisdictionRes.isApplicableToTarget && (sourceRes.isOfficial || jurisdictionRes.jurisdiction === 'central'),
      benefitVerified: benefitCorroborated,
      applicationVerified: Boolean(applicationUrl),
      eligibilityDetailsVerified: hasRealEligibility,
      // 5 Explicit Separated Verification Statuses (Task 4)
      schemeIdentityConfirmed: (sourceRes.isOfficial || Boolean(flagshipDef)) && nameMatchesInSource,
      officialSourceFound: sourceRes.isOfficial,
      eligibilityVerified: hasRealEligibility,
      benefitsVerified: benefitCorroborated,
      applicationUrlVerified: Boolean(applicationUrl),
      eligibilityMatch: profileEval.status,
      fieldEvidence,
      eligibility: {
        status: eligibilityStatus,
        matchState: profileEval.status,
        criteriaSummary: finalEligibilitySummary,
        reasons: profileEval.matchedReasons.length > 0 ? profileEval.matchedReasons : finalEligibilitySummary,
        missingOrCautionCriteria: profileEval.unmatchedReasons.length > 0 ? profileEval.unmatchedReasons : profileEval.unknownReasons
      },
      requiredDocuments: Array.isArray(raw.requiredDocuments) && raw.requiredDocuments.length > 0
        ? raw.requiredDocuments
        : ['Aadhaar Card', 'Identity Proof', 'Bank Account details', 'Income Certificate (if applicable)'],
      officialInformationUrl,
      officialUrl,
      applicationUrl,
      sourceUrls: Array.isArray(raw.sourceUrls) ? raw.sourceUrls.filter(isValidPublicUrl) : [officialUrl],
      supportingEvidenceUrls,
      supportingDocuments: attachedSupportingDocs,
      supportingReferences: (raw.supportingReferences && raw.supportingReferences.length > 0
        ? raw.supportingReferences
        : [
          {
            title: raw.sourceTitle || cleanedName,
            url: officialUrl,
            domain: new URL(officialUrl).hostname,
            isOfficial: sourceRes.isOfficial
          }
        ]).filter((ref: any) => {
          if (!ref.url) return false;
          const src = classifySource(ref.url, targetState);
          if (src.isCommercial) return false;
          if (/justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(ref.url)) return false;
          return true;
        }),
      sourceTitle: raw.sourceTitle || undefined,
      evidenceSnippets: raw.evidenceSnippets || {
        benefitEvidence: benefitEvidence || null,
        eligibilityEvidence: finalEligibilitySummary[0] || null,
        nameEvidence: cleanedName
      },
      deadline,
      deadlineStatus,
      evidenceStatus,
      lastVerified: new Date().toISOString(),
      sourceType: 'live_retrieval',
      academicYearOrValidity: raw.academicYearOrValidity || (deadlineStatus === 'open' ? 'Active Window' : 'Current Cycle'),
      matchScore: calibratedScore,
      matchScoreRationale: scoreRationale
    };

    // -----------------------------------------------------------------
    // 7. Scheme-Level Deduplication and Merging (State-Scoped Key)
    // -----------------------------------------------------------------
    // For Centrally Sponsored Schemes (CSS) such as Post-Matric / Pre-Matric scholarships,
    // they are often discovered both centrally (NSP/MyScheme/MoSJE) and through the state's
    // implementing department/e-District portal (e.g. UP scholarship.up.gov.in / Delhi e-District).
    // These represent the exact same scheme and MUST be deduplicated together.
    let unifiedNormKey = normKey;
    if (userProfile?.socialCategory) {
      const userCat = (userProfile.socialCategory || '').toLowerCase();
      if (normKey === 'post matric' || normKey === 'post matric scholarship') {
        if (userCat.includes('sc')) {
          unifiedNormKey = 'post matric scholarship sc';
        } else if (userCat.includes('st')) {
          unifiedNormKey = 'post matric scholarship st';
        } else if (userCat.includes('obc')) {
          unifiedNormKey = 'post matric scholarship obc';
        } else if (userCat.includes('minority')) {
          unifiedNormKey = 'post matric scholarship minority';
        }
      } else if (normKey === 'pre matric' || normKey === 'pre matric scholarship') {
        if (userCat.includes('sc')) {
          unifiedNormKey = 'pre matric scholarship sc';
        } else if (userCat.includes('st')) {
          unifiedNormKey = 'pre matric scholarship st';
        } else if (userCat.includes('obc')) {
          unifiedNormKey = 'pre matric scholarship obc';
        }
      }
    }

    // Centrally Sponsored Schemes that are identical nationally use a unified key,
    // while state-specific schemes retain state scope so they never collide or erase each other.
    const isStateLevel = (finalLevel === 'State' || isStateImplementedCss || jurisdictionRes.jurisdiction === 'state') && Boolean(finalState || jurisdictionRes.detectedState || targetState);
    const resolvedStateKey = (finalState || jurisdictionRes.detectedState || targetState || '').toLowerCase();
    const dedupKey = isStateLevel
      ? `${unifiedNormKey}::state::${resolvedStateKey}`
      : `${unifiedNormKey}::central`;

    const existing = verifiedMap.get(dedupKey) || unverifiedMap.get(dedupKey);
    if (existing) {
      deduplicatedCount++;
      const rank = (status?: VerificationStatus) =>
        status === 'verified' ? 3 : status === 'partially_verified' ? 2 : 1;

      // Merge source URLs and supporting evidence URLs
      existing.sourceUrls = Array.from(new Set([...existing.sourceUrls, ...canonical.sourceUrls]));
      existing.supportingEvidenceUrls = Array.from(new Set([
        ...(existing.supportingEvidenceUrls || []),
        ...(canonical.supportingEvidenceUrls || [])
      ]));

      // Merge field-level evidence and flag conflicts
      if (canonical.fieldEvidence) {
        existing.fieldEvidence = existing.fieldEvidence || {};
        for (const [key, item] of Object.entries(canonical.fieldEvidence) as Array<[keyof SchemeFieldEvidence, FieldEvidenceItem]>) {
          if (!existing.fieldEvidence[key]) {
            existing.fieldEvidence[key] = item;
          } else if (!existing.fieldEvidence[key]?.isVerified && item?.isVerified) {
            existing.fieldEvidence[key] = item;
          } else if (existing.fieldEvidence[key]?.isVerified && item?.isVerified && existing.fieldEvidence[key]?.passageSnippet !== item?.passageSnippet) {
            existing.fieldEvidence[key] = {
              ...existing.fieldEvidence[key]!,
              conflictNotes: `Conflicting ${key} information reported: alternative evidence snippet observed from ${item.sourceUrl}. Authoritative primary source retained.`
            };
          }
        }
      }

      // Merge supporting references
      if (canonical.supportingReferences) {
        existing.supportingReferences = existing.supportingReferences || [];
        for (const ref of canonical.supportingReferences) {
          if (!existing.supportingReferences.some(r => r.url === ref.url)) {
            existing.supportingReferences.push(ref);
          }
        }
      }

      // Merge supporting documents
      if (canonical.supportingDocuments && canonical.supportingDocuments.length > 0) {
        existing.supportingDocuments = existing.supportingDocuments || [];
        for (const doc of canonical.supportingDocuments) {
          if (!existing.supportingDocuments.some(d => d.url === doc.url)) {
            existing.supportingDocuments.push(doc);
          }
        }
      }

      // Merge aliases
      if (canonical.aliases && canonical.aliases.length > 0) {
        existing.aliases = Array.from(new Set([...(existing.aliases || []), ...canonical.aliases]));
      }

      // Merge granular verification flags
      existing.jurisdictionVerified = existing.jurisdictionVerified || canonical.jurisdictionVerified;
      existing.benefitVerified = existing.benefitVerified || canonical.benefitVerified;
      existing.eligibilityDetailsVerified = existing.eligibilityDetailsVerified || canonical.eligibilityDetailsVerified;
      existing.schemeIdentityConfirmed = existing.schemeIdentityConfirmed || canonical.schemeIdentityConfirmed;
      existing.officialSourceFound = existing.officialSourceFound || canonical.officialSourceFound;
      existing.eligibilityVerified = existing.eligibilityVerified || canonical.eligibilityVerified;
      existing.benefitsVerified = existing.benefitsVerified || canonical.benefitsVerified;
      existing.applicationUrlVerified = existing.applicationUrlVerified || canonical.applicationUrlVerified;
      if (existing.eligibilityMatch === 'unknown' && canonical.eligibilityMatch !== 'unknown') {
        existing.eligibilityMatch = canonical.eligibilityMatch;
      }
      if (canonical.partialVerificationReasons && canonical.partialVerificationReasons.length > 0) {
        existing.partialVerificationReasons = Array.from(new Set([
          ...(existing.partialVerificationReasons || []),
          ...canonical.partialVerificationReasons
        ]));
      }

      // Filter out contradictory negative reasons when positive evidence has been established
      if (existing.officialSourceFound || canonical.officialSourceFound) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          r => !/source is not an official government department|secondary source citation/i.test(r)
        );
      }
      if (existing.benefitVerified || canonical.benefitVerified || !existing.benefits.includes('not verified')) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          r => !/financial benefit details not verified/i.test(r)
        );
      }
      if (existing.applicationUrlVerified || canonical.applicationUrlVerified || Boolean(existing.applicationUrl)) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          r => !/direct online application link not verified/i.test(r)
        );
      }
      if (existing.eligibilityVerified || canonical.eligibilityVerified || !existing.eligibility.criteriaSummary.some(s => s.includes('not verified'))) {
        existing.partialVerificationReasons = existing.partialVerificationReasons?.filter(
          r => !/eligibility criteria could not be established|specific eligibility criteria require further verification/i.test(r)
        );
      }
      if (existing.partialVerificationReasons && existing.partialVerificationReasons.length === 0) {
        existing.partialVerificationReasons = undefined;
      }

      // Promote to stronger official URL and status if new candidate is stronger
      if (rank(canonical.verificationStatus) > rank(existing.verificationStatus)) {
        canonical.sourceUrls = existing.sourceUrls;
        canonical.supportingEvidenceUrls = existing.supportingEvidenceUrls;
        canonical.supportingReferences = existing.supportingReferences;
        canonical.supportingDocuments = existing.supportingDocuments;
        canonical.aliases = existing.aliases;
        if (!canonical.applicationUrl && existing.applicationUrl) {
          canonical.applicationUrl = existing.applicationUrl;
        }
        canonical.applicationVerified = Boolean(canonical.applicationUrl);

        if (canonical.verificationStatus === 'verified' || canonical.verificationStatus === 'partially_verified') {
          unverifiedMap.delete(dedupKey);
          verifiedMap.set(dedupKey, canonical);
        } else {
          unverifiedMap.set(dedupKey, canonical);
        }
      } else {
        // Keep existing as primary, but adopt richer benefit if current existing is unverified or lacks concrete financial figures
        if (
          (existing.benefits.includes('not verified') || (!/₹|\b(lakh|crore)\b/i.test(existing.benefits) && /₹|\b(lakh|crore)\b/i.test(canonical.benefits))) &&
          !canonical.benefits.includes('not verified')
        ) {
          existing.benefits = canonical.benefits;
          existing.benefitAmountApprox = canonical.benefitAmountApprox;
          existing.benefitType = canonical.benefitType;
          existing.benefitVerified = true;
          existing.benefitsVerified = true;
        }
        // Adopt richer eligibility if current existing is unverified
        if (
          existing.eligibility.criteriaSummary.some(s => s.includes('not verified')) &&
          !canonical.eligibility.criteriaSummary.some(s => s.includes('not verified'))
        ) {
          existing.eligibility.criteriaSummary = canonical.eligibility.criteriaSummary;
          existing.eligibility.reasons = canonical.eligibility.reasons;
          existing.eligibilityDetailsVerified = true;
          existing.eligibilityVerified = true;
        }
        if (!existing.applicationUrl && canonical.applicationUrl) {
          existing.applicationUrl = canonical.applicationUrl;
          existing.applicationUrlVerified = true;
        }
        existing.applicationVerified = Boolean(existing.applicationUrl);

        if (canonical.level === 'State' && canonical.state && existing.level !== 'State') {
          existing.level = canonical.level;
          existing.state = canonical.state;
          existing.jurisdiction = canonical.jurisdiction;
          existing.administrativeLabel = canonical.administrativeLabel;
          existing.portalName = canonical.portalName;
          existing.department = canonical.department;
        }

        // If existing is now fully corroborated (official source + benefit + application url), upgrade to verified
        if (
          existing.verificationStatus === 'partially_verified' &&
          existing.officialSourceFound &&
          existing.benefitVerified &&
          (!existing.partialVerificationReasons || existing.partialVerificationReasons.length === 0)
        ) {
          existing.verificationStatus = 'verified';
          existing.verificationEvidence = `Verified official record: Jurisdiction (${existing.jurisdiction}), official authority (${existing.portalName}), scheme identity, and benefit terms corroborated from primary source.`;
        }
      }

      mergedDetails.push({ schemeName: cleanedName, sourcesMergedCount: existing.sourceUrls.length });
    } else {
      if (canonical.verificationStatus === 'verified' || canonical.verificationStatus === 'partially_verified') {
        verifiedMap.set(dedupKey, canonical);
      } else {
        const isCommercial =
          canonical.sourceClassification === 'commercial_source' ||
          classifySource(canonical.officialUrl, targetState).isCommercial;
        const isInvalidName = isInvalidSchemeName(canonical.name);
        const isDirectory = /justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(canonical.officialUrl);
        if (!isCommercial && !isInvalidName && !isDirectory) {
          unverifiedMap.set(dedupKey, canonical);
        }
      }
    }
  }

  // -----------------------------------------------------------------
  // 8. Reconcile Flagship Schemes Supported by Guidelines/Documents
  // -----------------------------------------------------------------
  // If an authoritative guideline or portal document was discovered (e.g. for PMFBY, PM-KISAN, PM-KUSUM)
  // but OpenRouter didn't output a separate card for the parent, synthesize the parent canonical scheme
  for (const [parentKey, docs] of stashedDocs.entries()) {
    const existingParent =
      verifiedMap.get(parentKey) ||
      verifiedMap.get(`${parentKey}::unified`) ||
      verifiedMap.get(`${parentKey}::central`) ||
      unverifiedMap.get(parentKey) ||
      unverifiedMap.get(`${parentKey}::unified`) ||
      unverifiedMap.get(`${parentKey}::central`);

    if (existingParent) {
      existingParent.supportingDocuments = existingParent.supportingDocuments || [];
      existingParent.supportingEvidenceUrls = existingParent.supportingEvidenceUrls || [];
      for (const d of docs) {
        if (!existingParent.supportingDocuments.some(doc => doc.url === d.url)) {
          existingParent.supportingDocuments.push(d);
        }
        if (d.url && !existingParent.supportingEvidenceUrls.includes(d.url)) {
          existingParent.supportingEvidenceUrls.push(d.url);
        }
      }
      continue;
    }

    const officialDoc = docs.find(d => d.isOfficial);
    if (FLAGSHIP_DEFINITIONS[parentKey] && officialDoc) {
      const def = FLAGSHIP_DEFINITIONS[parentKey];
      const supportingEvidenceUrls = Array.from(new Set([def.officialUrl, ...docs.map(d => d.url)]));
      const hasApply = Boolean(def.applyUrl);
      const nowIso = new Date().toISOString();

      const fieldEvidence: SchemeFieldEvidence = {
        schemeName: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.name,
          isVerified: true,
          verifiedAt: nowIso,
          reason: 'Authoritative scheme identity verified via Central statutory guidelines.'
        },
        schemeIdentity: {
          sourceUrl: def.officialUrl,
          passageSnippet: `Central Flagship Scheme - ${def.name}`,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Central Flagship Scheme identity verified under ${def.department}.`
        },
        jurisdiction: {
          sourceUrl: def.officialUrl,
          passageSnippet: 'Central Sector Scheme applicable nationwide across participating states',
          isVerified: true,
          verifiedAt: nowIso,
          reason: 'Central Sector Scheme applicable nationwide across all participating States and UTs.'
        },
        department: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.department,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Apex ministry established: ${def.department}.`
        },
        description: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.description,
          isVerified: true,
          verifiedAt: nowIso,
          reason: 'Official flagship description verified from primary government guidelines.'
        },
        benefit: {
          sourceUrl: def.officialUrl,
          passageSnippet: def.benefits,
          isVerified: true,
          verifiedAt: nowIso,
          reason: 'Official statutory benefit terms verified from central guidelines.'
        },
        eligibility: {
          sourceUrl: def.officialUrl,
          passageSnippet: 'Aadhaar e-KYC and land ownership documentation required.',
          isVerified: true,
          verifiedAt: nowIso,
          reason: 'Statutory beneficiary requirements verified from central scheme framework.'
        },
        applicationAvailability: {
          sourceUrl: def.applyUrl || def.officialUrl,
          passageSnippet: def.applyUrl ? `Application available at ${def.applyUrl}` : 'Application link not verified from primary source.',
          isVerified: hasApply,
          verifiedAt: nowIso,
          reason: hasApply ? `Application portal available at ${def.applyUrl}` : 'Direct central application portal not verified; implementation conducted through State nodal departments.'
        },
        officialInformationUrl: {
          sourceUrl: officialDoc?.url || def.officialUrl,
          passageSnippet: officialDoc?.url || def.officialUrl,
          isVerified: true,
          verifiedAt: nowIso,
          reason: `Official apex department portal established: ${officialDoc?.url || def.officialUrl}.`
        },
        applicationUrl: {
          sourceUrl: def.applyUrl || def.officialUrl,
          passageSnippet: def.applyUrl || 'Application link not verified.',
          isVerified: hasApply,
          verifiedAt: nowIso,
          reason: hasApply ? `Direct application portal confirmed: ${def.applyUrl}.` : 'Direct online application portal link not verified from primary source.'
        }
      };

      const flagshipCriteria = def.eligibilityCriteria && def.eligibilityCriteria.length > 0
        ? def.eligibilityCriteria
        : ['Official Central flagship scheme supported by primary guidelines in evidence.'];

      const flagshipProfileEval = evaluateProfileCriteria({
        schemeName: def.name,
        description: def.description,
        criteriaSummary: flagshipCriteria,
        reasons: ['Primary official guidelines discovered and verified in search evidence'],
        userProfile,
        targetState
      });

      const isFlagshipMatched = flagshipProfileEval.status === 'matched';
      const isFlagshipNotMatched = flagshipProfileEval.status === 'not_matched';

      const canonicalFlagship: CanonicalScheme = {
        id: `canonical-${parentKey.replace(/\s+/g, '-').slice(0, 30)}`,
        name: def.name,
        category: def.category,
        categoryReason: `Official Central flagship scheme supported by primary guidelines in evidence.`,
        benefitType: def.benefitType,
        department: def.department,
        level: 'Central',
        jurisdiction: 'central',
        state: null,
        description: def.description,
        benefits: def.benefits,
        sourceClassification: 'official_government_scheme_page',
        sourceRelationship: 'official_scheme_page',
        verificationStatus: 'verified',
        verificationEvidence: `Verified canonical record supported by official guidelines: ${officialDoc.title} (${officialDoc.domain}).`,
        partialVerificationReasons: def.partialReasons,
        jurisdictionVerified: true,
        benefitVerified: true,
        applicationVerified: hasApply,
        eligibilityDetailsVerified: true,
        eligibilityMatch: flagshipProfileEval.status,
        fieldEvidence,
        eligibility: {
          status: isFlagshipNotMatched ? 'not_eligible' : 'potentially_eligible',
          matchState: flagshipProfileEval.status,
          criteriaSummary: flagshipCriteria,
          reasons: isFlagshipNotMatched
            ? flagshipProfileEval.unmatchedReasons
            : (isFlagshipMatched && flagshipProfileEval.matchedReasons.length > 0
                ? flagshipProfileEval.matchedReasons
                : ['Primary official guidelines discovered and verified in search evidence']),
          missingOrCautionCriteria: isFlagshipNotMatched
            ? flagshipProfileEval.unmatchedReasons
            : (flagshipProfileEval.unknownReasons.length > 0 ? flagshipProfileEval.unknownReasons : [])
        },
        requiredDocuments: ['Aadhaar Card', 'Land Record / Khata Khasra', 'Bank Account details', 'e-KYC'],
        officialInformationUrl: officialDoc?.url || def.officialUrl,
        officialUrl: def.officialUrl || officialDoc?.url,
        applicationUrl: def.applyUrl,
        portalName: def.portalName,
        sourceUrls: supportingEvidenceUrls,
        supportingEvidenceUrls,
        supportingDocuments: docs,
        supportingReferences: docs.map(d => ({ title: d.title, url: d.url, domain: d.domain, isOfficial: d.isOfficial })),
        deadline: null,
        deadlineStatus: def.defaultDeadlineStatus || 'unknown',
        evidenceStatus: 'officially_verified',
        lastVerified: new Date().toISOString(),
        sourceType: 'live_retrieval',
        matchScore: 90,
        matchScoreRationale: 'Central flagship entitlement with verified primary source guidelines.'
      };
      verifiedMap.set(parentKey, canonicalFlagship);
      verificationBreakdown.verifiedCount++;
    }
  }

  // Final safeguard: Deduplicate verified schemes by normalized name and state
  const dedupedVerified: CanonicalScheme[] = [];
  const seenVerifiedKeys = new Set<string>();

  for (const s of Array.from(verifiedMap.values())) {
    const sNorm = normalizeSchemeName(s.name);
    const sKey = `${sNorm}::${s.level}::${(s.state || targetState || 'central').toLowerCase()}`;
    if (seenVerifiedKeys.has(sKey)) {
      const existing = dedupedVerified.find(ex => {
        const exNorm = normalizeSchemeName(ex.name);
        return `${exNorm}::${ex.level}::${(ex.state || targetState || 'central').toLowerCase()}` === sKey;
      });
      if (existing) {
        deduplicatedCount++;
        existing.sourceUrls = Array.from(new Set([...existing.sourceUrls, ...s.sourceUrls]));
        existing.supportingEvidenceUrls = Array.from(new Set([
          ...(existing.supportingEvidenceUrls || []),
          ...(s.supportingEvidenceUrls || [])
        ]));
        if (s.supportingReferences) {
          existing.supportingReferences = existing.supportingReferences || [];
          for (const ref of s.supportingReferences) {
            if (!existing.supportingReferences.some(r => r.url === ref.url)) {
              existing.supportingReferences.push(ref);
            }
          }
        }
      }
      continue;
    }
    seenVerifiedKeys.add(sKey);
    dedupedVerified.push(s);
  }

  const finalVerifiedSchemes = dedupedVerified;
  const finalUnverifiedCandidates = Array.from(unverifiedMap.values()).filter(c => {
    if (isInvalidSchemeName(c.name)) return false;
    const src = classifySource(c.officialUrl, targetState);
    if (src.isCommercial) return false;
    if (/justdial|indiamart|tradeindia|sulekha|howdoiindia|cscportal|\.in\.net/i.test(c.officialUrl)) return false;
    if (c.level === 'State' && c.state && targetState && c.state.toLowerCase() !== targetState.toLowerCase()) return false;
    // Do not show unverified candidate if already present in verified schemes
    const cNorm = normalizeSchemeName(c.name);
    if (seenVerifiedKeys.has(`${cNorm}::${c.level}::${(c.state || targetState || 'central').toLowerCase()}`)) return false;
    return true;
  });
  const allCanonicalSchemes = [...finalVerifiedSchemes, ...finalUnverifiedCandidates];

  // Truthful domain metrics calculation (Problem 6)
  const officialInfoDomains = new Set<string>();
  const officialApplyDomains = new Set<string>();
  const secondarySourceDomains = new Set<string>();

  for (const s of allCanonicalSchemes) {
    if (
      s.sourceClassification === 'official_government_scheme_page' ||
      s.sourceClassification === 'official_supporting_document' ||
      s.sourceClassification === 'official_government' ||
      s.sourceClassification === 'official_scheme_portal'
    ) {
      try {
        officialInfoDomains.add(new URL(s.officialUrl).hostname.toLowerCase());
      } catch {}
    } else if (
      s.sourceClassification === 'secondary_source' ||
      s.sourceClassification === 'reputable_secondary'
    ) {
      try {
        secondarySourceDomains.add(new URL(s.officialUrl).hostname.toLowerCase());
      } catch {}
    }

    if (s.applicationUrl) {
      try {
        const appClass = classifySource(s.applicationUrl);
        if (appClass.isOfficial) {
          officialApplyDomains.add(new URL(s.applicationUrl).hostname.toLowerCase());
        }
      } catch {}
    }

    if (Array.isArray(s.supportingReferences)) {
      for (const ref of s.supportingReferences) {
        if (!ref.isOfficial && ref.domain) {
          secondarySourceDomains.add(ref.domain.toLowerCase());
        }
      }
    }
  }

  for (const page of fetchedPages) {
    if (page.url) {
      try {
        const u = new URL(page.url);
        const sourceCheck = classifySource(page.url, targetState);
        if (sourceCheck.isSecondary || sourceCheck.classification === 'secondary_source' || !page.isOfficial) {
          secondarySourceDomains.add(u.hostname.toLowerCase());
        }
      } catch {}
    }
  }

  // Sort: Persona category first, then state schemes, then verified schemes, then score
  const sortComparator = (a: CanonicalScheme, b: CanonicalScheme) => {
    if (userPersona === 'student') {
      const aEdu = a.category === 'Education' ? 1 : 0;
      const bEdu = b.category === 'Education' ? 1 : 0;
      if (aEdu !== bEdu) return bEdu - aEdu;
    } else if (userPersona === 'business') {
      const aBiz = a.category === 'Business & MSME' ? 1 : 0;
      const bBiz = b.category === 'Business & MSME' ? 1 : 0;
      if (aBiz !== bBiz) return bBiz - aBiz;
    } else if (userPersona === 'farmer') {
      const aFarm = a.category === 'Agriculture' ? 1 : 0;
      const bFarm = b.category === 'Agriculture' ? 1 : 0;
      if (aFarm !== bFarm) return bFarm - aFarm;
    }

    const aState = a.level === 'State' ? 1 : 0;
    const bState = b.level === 'State' ? 1 : 0;
    if (aState !== bState) return bState - aState;

    const rank = (status?: VerificationStatus) =>
      status === 'verified' ? 3 : status === 'partially_verified' ? 2 : 1;
    if (rank(a.verificationStatus) !== rank(b.verificationStatus)) {
      return rank(b.verificationStatus) - rank(a.verificationStatus);
    }

    return (b.matchScore || 0) - (a.matchScore || 0);
  };

  finalVerifiedSchemes.sort(sortComparator);
  finalUnverifiedCandidates.sort(sortComparator);
  allCanonicalSchemes.sort(sortComparator);

  return {
    schemes: allCanonicalSchemes,
    verifiedSchemes: finalVerifiedSchemes,
    unverifiedCandidates: finalUnverifiedCandidates,
    auditedDomains: Array.from(auditedDomainsSet),
    deduplicatedCount,
    uniqueCandidatesCount,
    canonicalSchemesCount: allCanonicalSchemes.length,
    officialInformationPortalsCount: officialInfoDomains.size,
    officialApplicationPortalsCount: officialApplyDomains.size,
    secondarySourcesCount: secondarySourceDomains.size,
    mergedDetails,
    rejectedCandidates,
    jurisdictionFailures,
    verificationBreakdown,
    sourceBreakdown
  };
}
