import { z } from 'zod';
import { INDIAN_STATES_AND_UTS, ALL_INDIA_ALIASES, normalizeStateName } from './states';
import {
  MVP_SUPPORTED_REGIONS,
  MVP_SUPPORTED_CATEGORIES,
  CandidateClassification
} from './types';

export function isSupportedMvpRegion(state: string | null | undefined): boolean {
  if (!state) return false;
  const norm = normalizeStateName(state);
  if (!norm) return false;
  return MVP_SUPPORTED_REGIONS.includes(norm as any);
}

export function isSupportedMvpCategory(categoryOrPersona: string | null | undefined): boolean {
  if (!categoryOrPersona) return false;
  const lower = categoryOrPersona.toLowerCase().trim();
  if (lower === 'student' || lower === 'farmer') return true;
  return MVP_SUPPORTED_CATEGORIES.some(cat => cat.toLowerCase() === lower);
}

export function validateMvpScope(
  state: string | undefined,
  persona: string | undefined
): { isValid: boolean; error?: string } {
  const norm = state ? normalizeStateName(state) : null;
  if (!norm || !MVP_SUPPORTED_REGIONS.includes(norm as any)) {
    return {
      isValid: false,
      error: `Region '${state || 'unspecified'}' is outside the YojanaMitra MVP scope. Supported regions are: ${MVP_SUPPORTED_REGIONS.join(', ')}.`
    };
  }

  const isSupportedPersona = !persona || persona === 'student' || persona === 'farmer';
  if (!isSupportedPersona) {
    return {
      isValid: false,
      error: `Category/persona '${persona}' is outside the supported tracks. Supported tracks are: Student (Education) and Farmer (Agriculture).`
    };
  }

  return { isValid: true };
}

export const SchemeSearchRequestSchema = z.object({
  state: z.string().min(1, 'State is required in MVP scope'),
  persona: z.enum(['student', 'farmer', 'citizen', 'business']).optional().default('student'),
  query: z.string().max(200).optional().default(''),
  age: z.coerce.number().min(1).max(120).optional(),
  gender: z.enum(['Male', 'Female', 'Transgender', 'All']).optional().default('All'),
  annualIncome: z.coerce.number().min(0).max(100_000_000).optional().default(150_000),
  socialCategory: z.enum(['General', 'OBC', 'SC', 'ST', 'Minority', 'EWS']).optional().default('General'),
  educationLevel: z.enum(['School', 'Higher Secondary', 'Undergraduate', 'Postgraduate', 'Any']).optional().default('Any'),
  courseStream: z.string().optional(),
  farmerType: z.enum(['Landless', 'Small/Marginal', 'Large', 'Any']).optional().default('Any'),
  isDifferentlyAbled: z.boolean().optional().default(false),
  hasBplCard: z.boolean().optional().default(false),
  refresh: z.boolean().optional().default(false)
});

export const GroqExtractedSchemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  hindiName: z.string().optional().nullable(),
  category: z.string().default('Education'),
  level: z.enum(['Central', 'State']).default('Central'),
  state: z.string().nullable().optional(),
  description: z.string().min(5),
  benefits: z.string().min(3),
  benefitAmountApprox: z.number().nullable().optional(),
  eligibilityStatus: z.enum(['potentially_eligible', 'not_eligible', 'insufficient_information']).default('potentially_eligible'),
  eligibilityReasons: z.array(z.string()).default([]),
  missingOrCautionCriteria: z.array(z.string()).optional().default([]),
  requiredDocuments: z.array(z.string()).default([]),
  applicationUrl: z.string().nullable().optional(),
  officialUrl: z.string().url(),
  portalName: z.string().default('Official Portal'),
  deadline: z.string().nullable().optional(),
  deadlineStatus: z.enum(['open', 'closed', 'upcoming', 'unknown']).default('unknown'),
  sourceUrls: z.array(z.string()).default([]),
  sourceTitle: z.string().nullable().optional(),
  verificationStatus: z.enum(['officially_verified', 'partially_verified', 'unverified', 'officially_supported']).optional(),
  evidenceSnippets: z.object({
    benefitEvidence: z.string().nullable().optional(),
    eligibilityEvidence: z.string().nullable().optional(),
    nameEvidence: z.string().nullable().optional()
  }).optional()
});

export const GroqExtractionResultSchema = z.object({
  schemes: z.array(GroqExtractedSchemeSchema).default([]),
  advisoryNote: z.string().optional()
});

export const OpenRouterExtractedSchemeSchema = GroqExtractedSchemeSchema;
export const OpenRouterExtractionResultSchema = GroqExtractionResultSchema;

// Patterns representing invalid scheme names (PDFs, page titles, policy articles, generic directories, commercial posts, committee reports)
const INVALID_SCHEME_NAME_PATTERNS = [
  /\.(pdf|docx?|xlsx?|pptx?|html?|txt|csv|json)$/i,
  /^untitled\s*$/i,
  /^(home|index|dashboard|login|sign ?in|register|registration|welcome|contact|privacy policy|terms|disclaimer|faq|downloads?|forms?)$/i,
  /^(schemes? on nsp|all scholarships?|list of schemes?|central schemes?|state schemes?|national scholarship portal:? ?nsp|schemes dashboard|myscheme portal|scholarships?|schemes?|scholarship schemes?|state funded scholarship schemes?(?:\s*[-–:]?\s*[a-z\s]*)?)$/i,
  /^(overview|about us|press release|circular|notification|acts? and rules?|minutes|gazette notification)$/i,
  /\b(reforms in india|annual report|economic survey|budget highlights|statistical report|policy brief|study report|working paper)\b/i,
  /^(government welfare scheme|welfare scheme|central government scheme|state government scheme|scheme details|public welfare program)$/i,
  // Generic welfare / yojana directory titles and blog aggregator names
  /\b(government yojana and schemes|yojana and schemes in india|government schemes in india|schemes in india|yojana catalogue)\b/i,
  // Commercial marketplace and yellow pages listing titles (e.g. Justdial product catalogues)
  /\b(catalogue\s*[-–:]|view range of products|get best price|contact number|products and services offered by|yojana in [a-z\s]+ delhi|pump yojana in [a-z\s]+)\b/i,
  // Operational guidelines, circulars, and implementation manuals (these are supporting documents, NOT schemes)
  /^(operational|revised|implementation|administrative|draft|final)\s+guidelines?\b/i,
  /guidelines?\s*(?:for|of|\d{4}|\(\d{4}\))/i,
  /^guidelines?\s*[-–:]/i,
  /^(rules?\s+for\s+(?:the\s+)?award\s*(?:for|of)?|rules?\s+and\s+regulations?\s+for|scheme\s+rules?\s+for)\b/i,
  /^(guidelines?|circulars?|notifications?|resolutions?|orders?)\s*[-–:]/i,
  // Parliamentary, legislative, and standing committee reports
  /\b(standing committee|lok sabha|rajya sabha|sansad|parliamentary committee|committee on)\b/i,
  // Evaluation, audit, performance, and impact assessment reports
  /\b(performance evaluation|evaluation of|impact assessment|impact of|evaluation study|compendium|audit report|status report|working group report|progress report|review report)\b/i,
  // Generic multi-scheme press releases, compendia, and parliamentary overviews (Section 2 & 7)
  /^(schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|central sector schemes for|flagship schemes for|agricultural schemes in|government initiatives for|important schemes for)\b/i,
  /\b(schemes for welfare of farmers|welfare of farmers|schemes for farmers)\b/i,
  /^(pib\s*[-–:]\s*schemes|press information bureau\s*[-–:]\s*schemes)\b/i,
  /^(brief note on schemes|compendium of schemes|summary of schemes|schemes at a glance|overview of schemes)\b/i,
  /^list\s+of\s+[a-z\s]+\s*(schemes?|scholarships?|initiatives?|programmes?)\b/i,
  /\b(annual report on|annual report \d{4})\b/i,
  // Beneficiary, applicant, and student lists / registers
  /^(list\s+of\s+(students?|beneficiaries|candidates|applicants|recipients|colleges?|institutions?|schools?)\b)/i,
  /\b(beneficiary\s+list|list\s+of\s+eligible|selection\s+list|merit\s+list|approved\s+list)\b/i,
  // Search form placeholders and UI prompts
  /^(enter\s+scheme\s+name|search\s+schemes?|type\s+here\s+to\s+search|search\s+by\s+scheme|find\s+schemes?|search\s+portal)\b/i,
  // How-to guides, blog posts, commercial articles, listicles
  /^how to\b/i,
  /^top \d+\b/i,
  /^\d+\s+(important|top|best|key|major)\s+government\b/i,
  /^(get government subsidy|guide to|everything you need to know|complete guide|step[- ]by[- ]step guide)\b/i,
  // Mobile app store and APK listings
  /\b(apps? on google play|play store|app store|download apk|mobile app)\b/i,
  // Generic portals and helpdesks
  /^(helpdesk|grievance|dashboard|portal login|citizen corner|services portal)\b/i,
  // Pure department landing pages without a scheme name
  /^(social welfare|backward classes welfare|tribal welfare|minority welfare|agriculture|animal husbandry|rural development|higher education|school education)\s+department\b/i,
  /^(department\s+of|directorate\s+of|ministry\s+of)\s+[^–-]+$/i,
  /^(state\s*[-–]\s*government\s+of|government\s+of\s+[a-z\s]+)\s*(\([^\)]+\))?$/i,
  // Academic textbook chapters, course units, and study material modules (e.g. IGNOU, eGyanKosh)
  /^(unit\s+\d+|chapter\s+\d+|lesson\s+\d+|module\s+\d+|block\s+\d+)\b/i,
  // Academic research papers, thesis titles, and journal articles
  /\b(potential role of|empirical study|a study on|determinants of|analysis of\s*:?|journal of|research paper|conference paper|critical review of|a review of|review of [a-z\s]+ schemes?)\b/i,
  // Budget documents, grants analysis, and financial bills
  /\b(demand for grants|demands for grants|budget analysis|grant analysis|outcome budget|appropriation bill)\b/i,
  // Generic scheme directories, indexes, and search portal views
  /^(dbt schemes?|all schemes?|schemes directory|portal schemes?|list of central schemes?|schemes on dbt)\b/i,
  /^(schemes?\s*[-|]\s*my government|national portal of india|india\.gov\.in)\b/i,
  // Commercial credit card and retail banking products
  /\b(credit card|debit card|cashback|rupay credit card|fixed deposit|savings account)\b/i,
  // Commercial brand names in titles
  /\b(eicher|mahindra|netafim|iifl|stashfin|paisabazaar|bankbazaar|tractor junction)\b/i,
  // Multi-scholarship directory, category, or agency umbrellas (not individual schemes)
  /\b(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarship[s]?\s*[\/&]\s*fellowship[s]?)\b/i,
  /^(aicte|ugc|dst|dbt|csir|mhrd|moe)\s+(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarships|fellowships)$/i,
  // College notice board listings, portal submission announcements, and generic plural roundups
  /\b(scholarships?\s+available\s+on|scholarships?\s+offered\s+by|scholarship\s+scheme\s+portal\s+is\s+open|portal\s+is\s+open\s+for\s+submission|student\s+corner|notice\s*board|academic\s+updates?)\b/i,
  /\b(scholarship\s+schemes\s*[-–]\s*launched\s+by|schemes\s+launched\s+by)\b/i,
  /^\([a-z0-9]\)\s+centrally sponsored\b/i,
  // Budget tables, planning statements, and institutional fee concessions
  /^statement\s*:\s*[ivx0-9]+\b/i,
  /\b(scheme\s*\/programme\s*\/projects?\s+wise|projects?\s+wise|programmes?\s+wise)\b/i,
  /\b(fee concession\s*[-–]\s*[a-z\s]+college|[a-z\s]+college\s*[-–]\s*scholarships?)\b/i,
  // Payment status updates, installment releases, and application news
  /\b(update\s*:|updates?\s*[-–:]|installment\s+released|installment\s+status|payment\s+status|second\s+installment|first\s+installment|check\s+payment|payment\s+update|status\s+released)\b/i,
  // Multi-scholarship global/college listings and portals
  /\b(live scholarships?|global scholarships?|all scholarships?|private scholarships?)\b/i,
  // User manuals, FAQs, author archives, login endpoints, and utility links
  /\b(author at|scholarship alerts|user manual for students|application login|digitalseva connect|scholarship eligibility check|forgot application id|can we complete nsp|without face authentication|buddy4study articles|portal - last date|scheme rules revised|how to apply|application open & how|archives - scholarship)\b/i
];

/**
 * Validates whether a scheme title represents a distinct welfare scheme rather than
 * a generic report, portal placeholder, guideline document, or committee paper.
 */
/**
 * Classifies a candidate into individual scheme vs portal vs document vs listing vs news.
 */
export function classifyCandidate(
  name: string | null | undefined,
  urlStr: string | null | undefined,
  snippet: string = ''
): CandidateClassification {
  const rawName = (name || '').trim();
  const lowerName = rawName.toLowerCase();
  const lowerUrl = (urlStr || '').toLowerCase();
  const lowerSnippet = snippet.toLowerCase();

  const hasSpecificScheme =
    /\b(scholarship|fellowship|stipend|tuition|post[- ]?matric|pre[- ]?matric|reimbursement|financial assistance|pragati|saksham|swanath|yojana|scheme|aid to students?|merit scholarship|top class|education support|samman|bima|suraksha|awas|pension)\b/i.test(lowerName) &&
    !/^(delhi e-district services|e-district services|services list|scholarship application|all scholarships|portal login|citizen login|live scholarships.*)$/i.test(lowerName);

  // 1. Guidelines / Documents (PDFs, circulars, gazettes, rules, orders)
  const isDocTitle =
    /^(guidelines?|operational guidelines?|circulars?|notifications?|gazette|minutes|sop|standard operating procedure|annual report|compendium)\b/i.test(lowerName) ||
    /\b(scheme guidelines?|implementation manual|draft guidelines?|order no|circular regarding)\b/i.test(lowerName) ||
    /\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(rawName);

  const isDocUrl =
    /\.(pdf|docx?|xlsx?|pptx?|zip)$/i.test(lowerUrl) ||
    /\/downloads?\/|\/pdf\/|\/circulars?\/|\/guidelines?\/|\/schemeguidelines\/|\/orders?\/|\/notifications?\/|\/acts?\/|\/rules?\/|\/tenders?\//i.test(lowerUrl);

  const isExplicitGuidelineDoc =
    /\/schemeguidelines\/|guidelines?\.pdf$|_guidelines|_manual|_sop/i.test(lowerUrl) ||
    /^(guidelines?|operational guidelines?|revised guidelines?)\b/i.test(lowerName) ||
    /^\([a-z0-9]\)\s+centrally sponsored/i.test(lowerName);

  if (isExplicitGuidelineDoc || isDocTitle || (isDocUrl && !hasSpecificScheme)) {
    return 'guidelines_or_document';
  }

  // 2. News / Media / Articles / Academic Papers / Third-party Explainers
  // Dedicated scholarship directory profiles (e.g. buddy4study.com/scholarship/...)
  // that have a specific scheme title are individual scheme candidates, NOT generic news articles!
  const isDedicatedScholarshipProfile = /buddy4study\.com\/scholarship\b/i.test(lowerUrl) && hasSpecificScheme;
  const isNewsOrMediaHeadline = /\b(press release|cabinet approves|news update|latest news|application dates announced|how to apply|eligibility criteria revealed|check eligibility|last date to apply|registration begins|students to get|government announces|know how to apply|direct link to apply|installment released|second installment|first installment|payment status|check payment status|critical review of|a review of|review of [a-z\s]+ schemes?|a study on|empirical study|research paper|journal of)\b/i.test(lowerName);

  if (!isDedicatedScholarshipProfile) {
    if (
      /pib\.gov\.in|\/press-release|\/news\/|\/article\/|\/pressrelease|\/post\/|\/blog\//i.test(lowerUrl) ||
      (!hasSpecificScheme && /buddy4study|careers360|jagranjosh|timesofindia|hindustantimes|thehindu|indianexpress|vikaspedia|ndtv|theprint|amarujala|dainikbhaskar|collegedunia|shiksha|news18|livehindustan|abplive|indiatoday|zeenews|worldolympiads|indiascholarships|findmycollege|collegemarker|workassist|govtschemes|sarkariyojana|sarkariyojnaa|sarkariresult|vajiramandravi|sagepub|researchgate|jstor|sciencedirect|springer|quora|edunexttechnologies|justdial|indiamart|tradeindia|sulekha|quikr|howdoiindia|cscportal|\.in\.net/i.test(lowerUrl)) ||
      isNewsOrMediaHeadline
    ) {
      return 'news_or_article';
    }
  }

  // Parse URL components
  let host = '';
  let path = '';
  try {
    const parsed = new URL(urlStr || '');
    host = parsed.hostname.toLowerCase();
    path = parsed.pathname.toLowerCase();
  } catch {}

  const isBareRoot = path === '' || path === '/' || path === '/index.html' || path === '/index.aspx' || path === '/home' || path === '/default.aspx';
  const isKnownPortalDomain =
    host === 'scholarships.gov.in' ||
    host === 'edistrict.delhigovt.nic.in' ||
    host === 'scholarship.up.gov.in' ||
    host === 'pmsonline.bih.nic.in' ||
    host === 'medhasoft.bih.nic.in' ||
    host === 'myscheme.gov.in';

  const hasSpecificSchemeTitle =
    /\b(scholarship|fellowship|stipend|tuition|post[- ]?matric|pre[- ]?matric|reimbursement|financial assistance|pragati|saksham|swanath|yojana|aid to students?|merit scholarship|top class|education support)\b/i.test(lowerName) &&
    !/\b(delhi e-district services|e-district services|services list|scholarship application|all scholarships?|portal login|citizen login|live scholarships?)\b/i.test(lowerName);

  const isGenericPortalTitle =
    /^(national scholarship portal|nsp|e-district delhi|delhi e-district|up scholarship portal|bihar pms portal|medhasoft portal|myscheme portal)$/i.test(lowerName) ||
    /^(portal login|citizen login|student login|applicant registration|apply online portal|candidate login|services|public services|delhi e-district services.*)$/i.test(lowerName) ||
    (isKnownPortalDomain && isBareRoot && !hasSpecificSchemeTitle && !/\b(scheme|yojana|grant|scholarship|subsidy|aid)\b/i.test(lowerName));

  // 3. Application Portal (Interactive portal roots, generic logins, registration forms)
  if (
    isGenericPortalTitle ||
    (!hasSpecificSchemeTitle && !/\b(scheme|yojana|grant|scholarship|subsidy|aid)\b/i.test(lowerName) && /\/login|\/signin|\/registration|\/citizenlogin|\/officerlogin|\/studentlogin|\/student-corner|\/institutes|\/applyonline|\/services\b|\/public\/services/i.test(path))
  ) {
    return 'application_portal';
  }

  // 4. Official Scheme Directory / College Notice Board / Generic Department Pages (NOT individual schemes)
  const isDepartmentPage =
    /^(department of|ministry of|directorate of|commissioner of|social welfare department|welfare department|sc\/?st\/?obc welfare|sc\/st welfare|delhi government portal|government of nct of delhi|government of uttar pradesh|government of bihar|national portal of india)\b/i.test(lowerName) ||
    /\b(department for the welfare of sc|directorate of higher education|ministry of social justice|ministry of tribal affairs)\b/i.test(lowerName) ||
    (host === 'scstwelfare.delhi.gov.in' && (isBareRoot || path.startsWith('/about') || path.startsWith('/home') || path.startsWith('/contact'))) ||
    (host === 'dhe.delhi.gov.in' && (isBareRoot || path.startsWith('/about') || path.startsWith('/home')));

  const isDirectoryOrListing =
    /^\/(all-schemes|schemes-list|services|department-services|search|view-all)/i.test(path) ||
    /\b(all scholarships?|list of schemes?|schemes directory|services list|schemes on nsp|schemes dashboard|scholarship schemes of delhi|list of scholarship schemes)\b/i.test(lowerName);

  const isDirectoryOrGroupingTitle =
    /\b(fellowship[s]?\s*[\/&]\s*scholarship[s]?|scholarship[s]?\s*[\/&]\s*fellowship[s]?|fellowships?\s+(and|&)\s+scholarships?|scholarships?\s+(and|&)\s+fellowships?)\b/i.test(lowerName) ||
    /^(aicte|ugc|dst|dbt|csir|mhrd|moe|aiims|icmr|icar)\s+(fellowships?|scholarships?|schemes?|initiatives?)(\s*[\/&]\s*(fellowships?|scholarships?|schemes?))?$/i.test(lowerName) ||
    /^(fellowship[s]?[\/&]scholarship[s]?|scholarship[s]?[\/&]fellowship[s]?)$/i.test(lowerName);

  const isCollegeNoticeOrListing =
    /\b(scholarships?\s+available\s+on|scholarships?\s+offered\s+by|scholarship\s+scheme\s+portal\s+is\s+open|portal\s+is\s+open\s+for\s+submission|student\s+corner|notice\s*board|student\s+services|academic\s+updates?)\b/i.test(lowerName) ||
    /\b(scholarship\s+schemes\s*[-–]\s*launched\s+by|schemes\s+launched\s+by|live scholarships?|global scholarships?|all scholarships?|private scholarships?)\b/i.test(lowerName) ||
    /^(scholarships? offered by|state scholarships|central scholarships|scholarships on nsp|all scholarships?|live scholarships?)\b/i.test(lowerName) ||
    /\/noticeboard|\/notice-board|\/studentcorner|\/student-corner|\/students\/scholarships\b|\/academic-updates|\/livescholarships|\/9383-2/i.test(lowerUrl) ||
    /\b(nludelhi\.ac\.in|adgips\.ac\.in)\b/i.test(lowerUrl);

  if (isDepartmentPage || isDirectoryOrGroupingTitle || isCollegeNoticeOrListing || (!hasSpecificSchemeTitle && isDirectoryOrListing)) {
    return 'official_scheme_directory';
  }

  // 5. Unrelated or Insufficient Evidence
  if (
    /^(home|index|about us|contact us|feedback|tenders?|recruitment|vacanc(y|ies)|site map|privacy policy|disclaimer|terms and conditions)$/i.test(lowerName) ||
    lowerName.length < 4 ||
    /^(national scholarship schemes?|central sector schemes?|state scholarship schemes?|welfare schemes?|flagship schemes?)$/i.test(lowerName)
  ) {
    return 'unrelated_or_insufficient';
  }

  // 6. Individual Scheme: Identifiable welfare, scholarship, or government scheme names
  const isSchemeLikeTitle =
    hasSpecificSchemeTitle ||
    /\b(scheme|yojana|pratibha|vikas|protsahan|sahayata|suraksha|kisan|fasal|bima|samman|credit|subsidy|grant|pension|awas|arogya|swasthya|aid|assistance|dbt|fellowship|scholarship)\b/i.test(lowerName) ||
    lowerName.length > 8;

  if (isSchemeLikeTitle && !isDepartmentPage && !isDirectoryOrGroupingTitle) {
    return 'individual_scheme';
  }

  // Default fallback if insufficient scheme markers
  return 'unrelated_or_insufficient';
}

export function isValidSchemeName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 3) return false;
  return !INVALID_SCHEME_NAME_PATTERNS.some(p => p.test(trimmed));
}

/**
 * Recognizes if a candidate string/source is actually a supporting document, guideline,
 * FAQ, committee report, or mobile app for a known flagship/state scheme.
 * Returns the canonical parent scheme name and document classification if matched.
 */
export function identifyParentSchemeForDocument(rawName: string, url: string = '', textSnippet: string = ''): {
  parentSchemeName: string;
  documentType: 'official_supporting_document' | 'official_scheme_page' | 'commercial_or_unverified_source' | 'rejected_report';
  documentTitle: string;
} | null {
  const combined = `${rawName} ${url} ${textSnippet}`.toLowerCase();

  // 1. Commercial entities masquerading as schemes
  if (/eicher|iifl|netafim|mahindratractor|tractorjunction|stashfin|mittigold/i.test(combined)) {
    return {
      parentSchemeName: '',
      documentType: 'commercial_or_unverified_source',
      documentTitle: rawName
    };
  }

  // 2. Parliamentary / Standing Committee reports (Reject from being cards)
  if (/standing committee|sansad\.in|lok sabha|rajya sabha/i.test(combined)) {
    return {
      parentSchemeName: '',
      documentType: 'rejected_report',
      documentTitle: rawName
    };
  }

  // 2b. Generic multi-scheme press release, report, or compendium (Reject standalone card)
  if (
    /^(schemes? for (the )?welfare of|schemes? for farmers|welfare schemes for|major schemes for|central sector schemes for|flagship schemes for|agricultural schemes in|government initiatives for|important schemes for)\b/i.test(rawName) ||
    /\b(schemes for welfare of farmers|welfare of farmers|schemes for farmers)\b/i.test(rawName) ||
    /^(pib\s*[-–:]\s*schemes|press information bureau\s*[-–:]\s*schemes)\b/i.test(rawName)
  ) {
    return {
      parentSchemeName: '',
      documentType: 'rejected_report',
      documentTitle: rawName
    };
  }

  // Only classify as supporting document if the record actually indicates a document, guideline, FAQ, circular, report, app, news release, or PDF
  const isDocumentLike =
    /\b(guidelines?|operational guidelines?|faqs?|frequently asked questions?|circulars?|notifications?|rules?|manual|handbook|brief note|evaluation|report|apps? on google play|play store|application form|sop|cabinet approves?|cabinet decision|continuation of|press release|news update)\b/i.test(rawName) ||
    /\.(pdf|docx?|xlsx?)$/i.test(url) ||
    /\/storage\/pdf|\/downloads?\/|\/circulars?\/|\/news_updates\/|\/pressrelease\/|\/press-release\/|\/pib\.gov\.in/i.test(url);

  if (!isDocumentLike) {
    return null;
  }

  // 3. PMFBY (Pradhan Mantri Fasal Bima Yojana) Documents / Guidelines
  if (/pmfby|fasal bima|amnex\.co\.in|crop insurance guidelines/i.test(combined)) {
    return {
      parentSchemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 4. PM-KISAN (Kisan Samman Nidhi) Documents / Apps / Guidelines / News Announcements
  if (/pmkisan|pm-kisan|kisan samman nidhi/i.test(combined)) {
    return {
      parentSchemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 5. Kisan Credit Card (KCC)
  if (/\bkcc\b|kisan credit card/i.test(combined)) {
    return {
      parentSchemeName: 'Kisan Credit Card (KCC)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 6. PM-KUSUM
  if (/pm-?kusum|kisan urja suraksha/i.test(combined)) {
    return {
      parentSchemeName: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 7. PMMY / Mudra
  if (/pmmy|mudra/i.test(combined)) {
    return {
      parentSchemeName: 'Pradhan Mantri Mudra Yojana (PMMY)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 8. PMEGP
  if (/pmegp|prime minister.*employment generation/i.test(combined)) {
    return {
      parentSchemeName: "Prime Minister's Employment Generation Programme (PMEGP)",
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 9. PM-JAY / Ayushman Bharat
  if (/ayushman|pm-?jay|jan arogya/i.test(combined)) {
    return {
      parentSchemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 10. PM SVANidhi
  if (/svanidhi|street vendor/i.test(combined)) {
    return {
      parentSchemeName: "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)",
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  // 11. National Livestock Mission
  if (/\bnlm\b|national livestock mission/i.test(combined)) {
    return {
      parentSchemeName: 'National Livestock Mission (NLM)',
      documentType: 'official_supporting_document',
      documentTitle: rawName
    };
  }

  return null;
}

/**
 * Determine whether a string is a page title, document name, PDF, or invalid scheme name.
 */
export function isInvalidSchemeName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return true;
  const trimmed = name.trim();
  if (trimmed.length < 5) return true;

  // Reject raw URLs
  if (/^https?:\/\//i.test(trimmed)) return true;

  // Reject generic portal names and bare state government titles
  if (/^(up|uttar pradesh|bihar|delhi|odisha|karnataka|punjab|haryana|rajasthan|assam|gujarat)\s*[-–:]\s*[a-z\s]*government$/i.test(trimmed)) return true;
  if (/^(national\s*:\s*nsp|national scholarship portal\s*:\s*nsp|nsp\s*:\s*national)$/i.test(trimmed)) return true;

  // Reject pure file extensions or filenames
  if (/\.(pdf|docx?|xlsx?|html?|txt|csv)$/i.test(trimmed)) return true;

  // Reject pure state or country names
  const normalizedState = normalizeStateName(trimmed);
  if (normalizedState && normalizedState.toLowerCase() === trimmed.toLowerCase()) return true;
  if (/^(india|central government|state government|government of india)$/i.test(trimmed)) return true;

  // Check against invalid patterns
  for (const pattern of INVALID_SCHEME_NAME_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Reject generic "Untitled" document titles
  if (/^untitled\b/i.test(trimmed) && !/yojana|scheme|scholarship|protsahan|mission/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Clean SEO artifacts, document prefixes (e.g. "Untitled - "), and portal suffixes from a scheme name.
 * Returns null if the resulting name is invalid.
 */
export function sanitizeSchemeName(rawName: string | null | undefined): string | null {
  if (!rawName || typeof rawName !== 'string') return null;

  let cleaned = rawName
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/^\[(pdf|doc|docx|file|presentation)\]\s*/i, '') // Strip "[PDF]" prefix
    .replace(/^untitled\s*[-|–:]\s*/i, '') // Strip "Untitled - "
    .replace(/\s*\|\s*.*$/g, '') // Strip pipe suffixes like "| NFS", "| Portal"
    .replace(/\s*[-–]\s*(NFS|NITI|NITI for States|National Scholarship Portal|NSP|MyScheme|Govt of India|Government of India|India\.gov\.in|AICTE|UGC|UMANG).*$/i, '')
    .replace(/\b(2024|2025|2026|2027)(?:-\d{2,4})?\b/g, '')
    .replace(/\b(mizor\s*scheme|scholarship\s*portal|online\s*portal|application\s*portal)\b/gi, '')
    .replace(/\s*[-|–:.]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (isInvalidSchemeName(cleaned)) {
    return null;
  }

  return cleaned;
}

const GENERIC_BENEFIT_REGEX = [
  /financial assistance,?\s*educational support,?\s*or maintenance allowance as per official guidelines/i,
  /government financial assistance and welfare subsidy under official guidelines/i,
  /financial assistance and welfare benefits as per scheme guidelines/i,
  /financial aid and welfare benefits/i,
  /generic (welfare|financial|benefit|assistance|support)/i,
  /refer to official (site|portal|notification|guidelines)/i,
  /information not available/i,
  /as per (official |scheme |department |government )?guidelines/i,
  /as per (official |scheme |department |government )?norms/i,
  /financial assistance provided as per/i,
  /^benefits? as per/i,
  /^welfare benefits? as per/i,
  /direct (welfare|financial) assistance and benefit support as per/i,
  /credit linkage, margin money subsidy, and enterprise facilitation/i,
  /direct benefit transfer \(dbt\) scholarship covering tuition/i,
  /benefit details not verified/i,
  /not verified from primary source/i
];

/**
 * Checks whether a benefit string is an unsubstantiated generic placeholder or cop-out.
 */
export function isGenericBenefit(benefit: string | null | undefined): boolean {
  if (!benefit || typeof benefit !== 'string') return true;
  const trimmed = benefit.trim();
  if (trimmed.length < 10) return true;

  for (const pattern of GENERIC_BENEFIT_REGEX) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

/**
 * Distinguish direct online application URLs from homepages, search pages, static documents,
 * news announcements, and informational scheme directory pages.
 * Returns null if the URL is not an established direct application endpoint.
 */
export function validateApplicationUrl(urlStr: string | null | undefined): string | null {
  if (!urlStr || typeof urlStr !== 'string') return null;
  if (!isValidPublicUrl(urlStr)) return null;

  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();

    // 1. Reject static documents / PDFs / office files
    if (/\.(pdf|docx?|xlsx?|txt|zip)$/i.test(path)) {
      return null;
    }

    // 2. Reject news announcements, press releases, media releases (e.g. PIB)
    if (/pib\.gov\.in|pressrelease|press-release|\/news\/|\/announcement\/|\/media\//i.test(host + path)) {
      return null;
    }

    // 3. Reject MyScheme pages as direct application links (they are informational directory overviews)
    if (host.includes('myscheme.gov.in')) {
      return null;
    }

    // 4. Reject third-party explainers and secondary sources
    if (/buddy4study|careers360|jagranjosh|thehindu|indianexpress|timesofindia|vikaspedia|india\.gov\.in/i.test(host)) {
      return null;
    }

    // Apex scholarship and welfare application portals where the root domain is the official application gateway
    const isApexScholarshipPortal =
      host === 'scholarships.gov.in' ||
      host === 'scholarship.up.gov.in' ||
      host === 'pmsonline.bih.nic.in' ||
      host === 'medhasoft.bih.nic.in' ||
      host === 'edistrict.delhigovt.nic.in';
    if (isApexScholarshipPortal) {
      return urlStr;
    }

    // 5. Reject search / contact / about / faq / login / directory pages
    if (/^\/(search|contact|about|faq|faqs|downloads?|index\.html?|index\.php)?\/?$/.test(path) || /\/faq(\.aspx|\/|$)/i.test(path)) {
      return null;
    }

    // 6. Bare root domain is a portal homepage, not an established direct application link for a specific scheme
    if (path === '' || path === '/') {
      return null;
    }

    // 7. General department informational subpaths are NOT application portals
    // e.g. /info-2/..., /schemes/..., /guidelines/..., /overview/..., /about-us/...
    if (/^\/(info|info-\d+|schemes?|guidelines?|department|public\/\d+|about|overview|notifications?)\//i.test(path)) {
      return null;
    }

    // 8. Direct application endpoint must have clear application / registration / service indicators
    const isAppEndpoint =
      /apply|registration|register|citizen[-_]service|serviceonline|farmerregistration|online[-_]?application|application[-_]?form|new[-_]?registration|beneficiary\/register/i.test(path) ||
      /\/(apply|registration|register|applications?|forms?)\b/i.test(path);

    if (!isAppEndpoint) {
      return null;
    }

    return urlStr;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is an established direct application endpoint.
 */
export function isConfirmedApplicationEndpoint(urlStr: string | null | undefined): boolean {
  return validateApplicationUrl(urlStr) !== null;
}

/**
 * Extract distinct named schemes from multi-scheme press releases or compendia (e.g. "Schemes for Welfare of Farmers").
 */
export function extractNamedSchemesFromText(text: string): string[] {
  const recognizedSchemes = [
    { pattern: /\b(pm-?kisan|kisan samman nidhi)\b/i, name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)' },
    { pattern: /\b(pmfby|fasal bima)\b/i, name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)' },
    { pattern: /\b(kisan credit card|kcc)\b/i, name: 'Kisan Credit Card (KCC)' },
    { pattern: /\b(soil health card)\b/i, name: 'Soil Health Card Scheme' },
    { pattern: /\b(pradhan mantri krishi sinchayee|pmksy)\b/i, name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)' },
    { pattern: /\b(integrated scheme on agriculture cooperation|isac)\b/i, name: 'Integrated Scheme on Agriculture Cooperation' },
    { pattern: /\b(agriculture infrastructure fund|aif)\b/i, name: 'Agriculture Infrastructure Fund (AIF)' },
    { pattern: /\b(sub-?mission on agricultural mechanization|smam)\b/i, name: 'Sub-Mission on Agricultural Mechanization (SMAM)' },
    { pattern: /\b(paramparagat krishi vikas yojana|pkvy)\b/i, name: 'Paramparagat Krishi Vikas Yojana (PKVY)' },
    // Education & Scholarship Schemes (MVP Scope)
    { pattern: /\b(central sector scheme of scholarship|csss)\b/i, name: 'Central Sector Scheme of Scholarship for College and University Students' },
    { pattern: /\b(national means[- ]cum[- ]merit|nmmss)\b/i, name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)' },
    { pattern: /\b(pm[- ]?yasasvi|yasasvi)\b/i, name: 'PM YASASVI Scholarship for OBC, EBC and DNT' },
    { pattern: /\b(pragati scholarship|aicte pragati)\b/i, name: 'AICTE Pragati Scholarship Scheme for Girl Students' },
    { pattern: /\b(saksham scholarship|aicte saksham)\b/i, name: 'AICTE Saksham Scholarship Scheme for Specially-Abled Students' },
    { pattern: /\b(ishaan uday)\b/i, name: 'Ishaan Uday Special Scholarship Scheme for NER' },
    { pattern: /\b(reimbursement of tuition fee.*(?:sc|st|obc|minority)|tuition fee reimbursement.*public school)\b/i, name: 'Reimbursement of Tuition Fee for SC/ST/OBC/Minority Students in Public Schools' },
    { pattern: /\b(merit scholarship.*(?:sc|st|obc|minority)|delhi merit scholarship)\b/i, name: 'Merit Scholarship for SC/ST/OBC/Minority Students (Delhi)' },
    { pattern: /\b(dr\.?\s*b\.?r\.?\s*ambedkar state award)\b/i, name: 'Dr. B.R. Ambedkar State Award for SC/ST/OBC/Minorities (Delhi)' },
    { pattern: /\b(up scholarship|uttar pradesh scholarship|dashmottar|shulk pratipoorti|post[- ]?matric.*(?:up|uttar pradesh)|up post[- ]?matric)\b/i, name: 'UP Post-Matric Scholarship and Fee Reimbursement Scheme' },
    { pattern: /\b(up pre[- ]?matric|pre[- ]?matric.*(?:up|uttar pradesh))\b/i, name: 'UP Pre-Matric Scholarship Scheme' },
    { pattern: /\b(abhyuday|mukhyamantri abhyudaya)\b/i, name: 'Mukhyamantri Abhyudaya Yojana (UP)' },
    { pattern: /\b(jai bhim mukhyamantri pratibha vikas)\b/i, name: 'Jai Bhim Mukhyamantri Pratibha Vikas Yojana' },
    { pattern: /\b(financial assistance for purchase of books and stationery)\b/i, name: 'Financial Assistance for Purchase of Books and Stationery (Delhi)' },
    { pattern: /\b(up dashmottar|dashmottar scholarship|post[- ]matric scholarship.*uttar pradesh)\b/i, name: 'Uttar Pradesh Dashmottar (Post-Matric) Scholarship and Fee Reimbursement' },
    { pattern: /\b(up pre[- ]matric scholarship|pre[- ]matric scholarship.*uttar pradesh)\b/i, name: 'Uttar Pradesh Pre-Matric Scholarship' },
    { pattern: /\b(bihar post[- ]matric scholarship|post[- ]matric scholarship.*bihar|bihar pms)\b/i, name: 'Bihar Post-Matric Scholarship (PMS)' },
    { pattern: /\b(mukhyamantri kanya utthan yojana|kanya utthan.*bihar)\b/i, name: 'Mukhyamantri Kanya Utthan Yojana' },
    { pattern: /\b(mukhyamantri balak.*balika protsahan|bihar 10th pass scholarship)\b/i, name: 'Mukhyamantri Balak / Balika Protsahan Yojana' },
    { pattern: /\bpost[- ]matric scholarship for sc students\b/i, name: 'Post-Matric Scholarship for SC Students' },
    { pattern: /\bpre[- ]matric scholarship for sc students\b/i, name: 'Pre-Matric Scholarship for SC Students' },
    { pattern: /\bpost[- ]matric scholarship for st students\b/i, name: 'Post-Matric Scholarship for ST Students' },
    { pattern: /\bpre[- ]matric scholarship for st students\b/i, name: 'Pre-Matric Scholarship for ST Students' },
    { pattern: /\bpost[- ]matric scholarship for obc students\b/i, name: 'Post-Matric Scholarship for OBC Students' },
    { pattern: /\bpre[- ]matric scholarship for obc students\b/i, name: 'Pre-Matric Scholarship for OBC Students' }
  ];

  const matched: string[] = [];
  for (const item of recognizedSchemes) {
    if (item.pattern.test(text) && !matched.includes(item.name)) {
      matched.push(item.name);
    }
  }
  return matched;
}

const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal'
];

/**
 * Strict URL validator to prevent SSRF and unsafe redirects.
 */
export function isValidPublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(host)) {
      return false;
    }
    // Block private IP ranges
    if (
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.30.') ||
      host.startsWith('172.31.') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
