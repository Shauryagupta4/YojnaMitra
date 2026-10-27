import {
  SchemeSearchRequestSchema,
  sanitizeSchemeName,
  isInvalidSchemeName,
  isGenericBenefit,
  validateApplicationUrl,
  validateMvpScope,
  classifyCandidate
} from '../lib/validation';
import { normalizeStateName } from '../lib/states';
import { runTinyFishSchemeDiscovery, classifySourceUrl } from '../lib/tinyfishSearch';
import { fetchPagesWithFirecrawl } from '../lib/firecrawlFetch';
import { fetchPagesWithTinyFish } from '../lib/tinyfishFetch'; // kept as fallback
import { extractSchemesWithOpenRouter } from '../lib/openRouterProcessor';
import { verifyAndDeduplicateSchemes } from '../lib/verification';
import { generateCacheKey, getCachedSearch, setCachedSearch } from '../lib/cache';
import { checkRateLimit } from '../lib/rateLimiter';
import {
  SchemeSearchResponse,
  CanonicalScheme,
  DiscoveryDiagnostics,
  MVP_SUPPORTED_REGIONS,
  MVP_SUPPORTED_CATEGORIES
} from '../lib/types';

export const config = {
  maxDuration: 60
};

/**
 * Intelligent benefit and financial support extractor that extracts grounded benefits
 * from search snippets and source titles, strictly preserving Indian currency units,
 * multipliers (Lakh, Crore), and distinguishing loans, subsidies, and scholarships.
 */
function extractGroundedFinancialBenefit(
  snippet: string,
  title: string,
  category: string,
  persona: string
): {
  benefitText: string;
  benefitType: 'loan' | 'grant' | 'subsidy' | 'scholarship' | 'insurance' | 'pension' | 'composite';
  approxAmount?: number;
} {
  const titleLower = title.toLowerCase();

  // 1. Canonical Flagship Program Signatures (Grounded strictly on Scheme Title, NOT random snippet mentions)
  if (/\b(pm-?kisan|kisan samman nidhi)\b/i.test(titleLower)) {
    return {
      benefitText: 'Direct income support of ₹6,000 per year transferred via DBT in three equal instalments of ₹2,000.',
      benefitType: 'grant',
      approxAmount: 6000
    };
  }

  if (/\b(mudra|pmmy)\b/i.test(titleLower)) {
    return {
      benefitText: 'Collateral-free business loan up to ₹20 Lakh (Shishu: up to ₹50,000, Kishore: up to ₹5 Lakh, Tarun: up to ₹20 Lakh) with interest subvention.',
      benefitType: 'loan',
      approxAmount: 2000000
    };
  }

  if (/\b(pmegp|prime minister.*employment generation)\b/i.test(titleLower)) {
    return {
      benefitText: 'Bank-financed credit with 15% to 35% margin money subsidy on project cost up to ₹50 Lakh (Manufacturing) and ₹20 Lakh (Service).',
      benefitType: 'subsidy',
      approxAmount: 5000000
    };
  }

  if (/\b(svanidhi|street vendor)\b/i.test(titleLower)) {
    return {
      benefitText: 'Collateral-free working capital micro-credit loan up to ₹50,000 with 7% interest subsidy for urban street vendors.',
      benefitType: 'loan',
      approxAmount: 50000
    };
  }

  if (/\b(pmfby|fasal bima)\b/i.test(titleLower)) {
    return {
      benefitText: 'Comprehensive crop insurance coverage against natural crop loss at subsidized premium of 1.5% to 2%.',
      benefitType: 'insurance',
      approxAmount: 100000
    };
  }

  if (/\b(ayushman|pm-?jay|jan arogya)\b/i.test(titleLower)) {
    return {
      benefitText: 'Cashless health insurance coverage up to ₹5 Lakh per family per year for secondary and tertiary hospitalization.',
      benefitType: 'insurance',
      approxAmount: 500000
    };
  }

  // Core Scholarship Signatures (MVP Domain: Education)
  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bsc\b/i.test(titleLower)) {
    return {
      benefitText: 'Full compulsory fees reimbursement plus annual maintenance allowance up to ₹13,500/year (hostellers) or ₹7,000/year (day scholars).',
      benefitType: 'scholarship',
      approxAmount: 13500
    };
  }

  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bst\b/i.test(titleLower)) {
    return {
      benefitText: 'Full compulsory tuition fees reimbursement plus annual maintenance allowance as per Government of India norms.',
      benefitType: 'scholarship',
      approxAmount: 13500
    };
  }

  if (/\bpost[- ]?matric\b/i.test(titleLower) && /\bobc\b/i.test(titleLower)) {
    return {
      benefitText: 'Maintenance allowance up to ₹4,000 to ₹10,000 per annum and study fee support as per scheme rules.',
      benefitType: 'scholarship',
      approxAmount: 10000
    };
  }

  if (/\b(central sector scheme|csss)\b/i.test(titleLower)) {
    return {
      benefitText: 'Scholarship of ₹12,000 per annum for undergraduate study (first 3 years) and ₹20,000 per annum at postgraduate level.',
      benefitType: 'scholarship',
      approxAmount: 12000
    };
  }

  if (/\bpragati\b/i.test(titleLower)) {
    return {
      benefitText: '₹50,000 per annum for every year of study towards college fee, computer, books, and stationeries.',
      benefitType: 'scholarship',
      approxAmount: 50000
    };
  }

  if (/\bsaksham\b/i.test(titleLower)) {
    return {
      benefitText: '₹50,000 per annum for every year of study towards tuition fee, equipment, books, and educational expenses.',
      benefitType: 'scholarship',
      approxAmount: 50000
    };
  }

  if (/\bswanath\b/i.test(titleLower)) {
    return {
      benefitText: '₹50,000 per annum for every year of study towards academic fees and educational support.',
      benefitType: 'scholarship',
      approxAmount: 50000
    };
  }

  if (/\b(fee reimbursement|shulk pratipoorti)\b/i.test(titleLower)) {
    return {
      benefitText: '100% reimbursement of approved non-refundable tuition and institutional fees directly via DBT.',
      benefitType: 'scholarship',
      approxAmount: 48000
    };
  }

  if (/\bpost[- ]?matric\b/i.test(titleLower)) {
    return {
      benefitText: 'Full compulsory fees reimbursement plus annual maintenance allowance up to ₹13,500/year (hostellers) or ₹7,000/year (day scholars).',
      benefitType: 'scholarship',
      approxAmount: 13500
    };
  }

  if (/\bpre[- ]?matric\b/i.test(titleLower)) {
    return {
      benefitText: 'Annual financial assistance of ₹3,500 to ₹4,000 per annum towards school expenses, uniforms, and books.',
      benefitType: 'scholarship',
      approxAmount: 3500
    };
  }

  if (/\b(national means[- ]?cum[- ]?merit|nmmss)\b/i.test(titleLower)) {
    return {
      benefitText: 'Scholarship allowance of ₹12,000 per annum (₹1,000 per month) for students from Class 9 to Class 12.',
      benefitType: 'scholarship',
      approxAmount: 12000
    };
  }

  if (/\b(pm[- ]?yasasvi|yasasvi)\b/i.test(titleLower)) {
    return {
      benefitText: 'Financial scholarship up to ₹75,000/year (Class 9-10) and ₹1,25,000/year (Class 11-12) for OBC/EBC/DNT students.',
      benefitType: 'scholarship',
      approxAmount: 75000
    };
  }

  if (/\bkanya utthan\b/i.test(titleLower)) {
    return {
      benefitText: 'Direct financial incentive of ₹50,000 upon graduation and ₹25,000 upon passing Class 12 (unmarried girls).',
      benefitType: 'grant',
      approxAmount: 50000
    };
  }

  if (/\babhyuday\b/i.test(titleLower)) {
    return {
      benefitText: 'Free comprehensive competitive coaching (UPSC, UPPSC, JEE, NEET) along with free tablets and study materials.',
      benefitType: 'grant',
      approxAmount: 50000
    };
  }

  if (/\bstudent credit card\b/i.test(titleLower)) {
    return {
      benefitText: 'Education loan up to ₹4 Lakh at concessional interest rate (1% for girls/PwD, 4% for boys) with state guarantee.',
      benefitType: 'loan',
      approxAmount: 400000
    };
  }

  if (/\b(reimbursement of tuition|tuition fee reimbursement)\b/i.test(titleLower)) {
    return {
      benefitText: '100% reimbursement of tuition fees and other compulsory fees for eligible students with family income up to ₹3.0 Lakh/year.',
      benefitType: 'scholarship',
      approxAmount: 48000
    };
  }

  if (/\bmerit scholarship\b/i.test(titleLower)) {
    return {
      benefitText: 'Financial assistance up to ₹1,620 to ₹4,500 per annum based on course level and percentage of marks in previous qualifying exam.',
      benefitType: 'scholarship',
      approxAmount: 4500
    };
  }

  if (/\b(dr\.?\s*b\.?r\.?\s*ambedkar state award|ambedkar state award)\b/i.test(titleLower)) {
    return {
      benefitText: 'Cash award of ₹25,000 and citation to state toppers in professional and technical degree examinations.',
      benefitType: 'grant',
      approxAmount: 25000
    };
  }

  if (/\bjai bhim\b/i.test(titleLower)) {
    return {
      benefitText: 'Free competitive examination coaching fee coverage plus monthly stipend of ₹2,500 during coaching period.',
      benefitType: 'grant',
      approxAmount: 25000
    };
  }

  // 2. Pattern Extraction with Preserved Multipliers and Units
  const amountRegex = /(?:up to|maximum|limit of|loan of|subsidy of|allowance of|worth|amount of)?\s*(?:₹|rs\.?|inr)\s*(\d+(?:[.,]\d+)?)\s*(lakhs?|crores?|thousands?|k)?(?:\s*(?:per\s*(?:year|annum|month)|pm|pa|\/-\s*per|\/year))?/i;
  const match = snippet.match(amountRegex);

  if (match) {
    const rawNumStr = match[1].replace(/,/g, '');
    const num = parseFloat(rawNumStr);
    const unit = (match[2] || '').toLowerCase();
    let approxAmount: number | undefined;

    if (!isNaN(num)) {
      if (unit.startsWith('crore')) {
        approxAmount = num * 10000000;
      } else if (unit.startsWith('lakh')) {
        approxAmount = num * 100000;
      } else if (unit.startsWith('thousand') || unit === 'k') {
        approxAmount = num * 1000;
      } else if (num >= 500) {
        approxAmount = num;
      }
    }

    const matchedUnit = unit ? ` ${unit}` : '';
    const combined = `${title} ${snippet}`.toLowerCase();
    const isLoan = /loan|credit|borrow|advance/i.test(combined);
    const isSubsidy = /subsidy|margin money|concession/i.test(combined);
    const isScholarship = /scholarship|stipend|tuition|fellowship|study/i.test(combined);
    const isInsurance = /insurance|bima|coverage|mediclaim/i.test(combined);

    let benefitType: 'loan' | 'grant' | 'subsidy' | 'scholarship' | 'insurance' | 'pension' | 'composite' = 'grant';
    let benefitPrefix = 'Financial assistance';

    if (isLoan) {
      benefitType = 'loan';
      benefitPrefix = 'Business loan credit facility';
    } else if (isSubsidy) {
      benefitType = 'subsidy';
      benefitPrefix = 'Government capital subsidy';
    } else if (isScholarship) {
      benefitType = 'scholarship';
      benefitPrefix = 'Academic study scholarship';
    } else if (isInsurance) {
      benefitType = 'insurance';
      benefitPrefix = 'Welfare insurance coverage';
    }

    return {
      benefitText: `${benefitPrefix} up to ₹${match[1]}${matchedUnit} as per scheme norms.`,
      benefitType,
      approxAmount
    };
  }

  // 3. Fallback when benefit details cannot be verified from snippet (Zero Fabrication)
  return {
    benefitText: 'Benefit details not verified from primary source.',
    benefitType: 'composite'
  };
}

/**
 * Extracts factual, grounded eligibility criteria directly from retrieved search snippets.
 * Avoids fallback cop-outs when snippets contain concrete eligibility terms.
 */
export function extractGroundedEligibilityFromSnippet(snippet: string, schemeName: string, state: string | null): string[] {
  if (!snippet || snippet.length < 15) return [];

  const criteria: string[] = [];
  // Normalize "Rs." to avoid period split in "Rs. 2 Lakh"
  const normalized = snippet.replace(/\brs\.\s*/gi, '₹');
  // Split on bullets (·, •, |, ;, \n) or sentence boundaries
  const segments = normalized
    .split(/[·•|;\n]|\.\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(s => s.length > 8);

  const sanitizeCandidate = (rawText: string): string | null => {
    const clean = rawText
      .replace(/^\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[-–—:]\s*/i, '')
      .replace(/^(?:eligibility\s*[:·•-]?\s*)/i, '')
      .replace(/^(?:degree|diploma)?\s*[:\-\.]?\s*\d+\)?\s*/i, '')
      .replace(/^[·•\-\s]+/, '')
      .replace(/\s*read\s*more\s*$/i, '')
      .replace(/\s*\.\.\.?\s*$/, '')
      .trim();
    if (clean.length < 15 || /\b(be pursuing post|pursuing post|degree level)$/i.test(clean) || /\b(for|of|in|to|and|or|be)\s*$/i.test(clean)) {
      return null;
    }
    return clean;
  };

  for (const seg of segments) {
    const lower = seg.toLowerCase();
    // Exclude noise, navigation, and generic search blurbs
    if (/^read more|click here|check payment|application status|last date|overview|introduction|how to apply|eligibility\s*$/i.test(lower)) continue;
    // Exclude table headers, metadata key-values, and title repeats
    if (/^(scheme name|state\s*[,:]|launched by|department\s*[,:]|official website|category\s*[,:])/i.test(lower) || lower.includes('scheme name,')) continue;

    // Income criteria
    if (/\b(income|lakh|per annum|annual income|family income|p\.a\.)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    }
    // Domicile / Native / State criteria
    else if (/\b(domicile|native|resident|studying in|under study in|permanent resident)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    }
    // Education / Course level
    else if (/\b(class\s+[0-9]+|matric|undergraduate|postgraduate|degree|diploma|iti|polytechnic|technical|engineering|pursuing|enrolled|10th|12th)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    }
    // Social / Category / PwD criteria
    else if (/\b(sc\b|st\b|obc\b|general category|minority|girl|differently-abled|pwd|disabilit|marks|percentage|merit)\b/i.test(lower)) {
      const clean = sanitizeCandidate(seg);
      if (clean && !criteria.includes(clean)) criteria.push(clean);
    }
  }

  return criteria.slice(0, 4);
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown-client';
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: `Too Many Requests. Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetInMs / 1000)} seconds.`,
      schemes: []
    });
  }

  // Parse parameters from GET query or POST body
  const rawParams = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const parseResult = SchemeSearchRequestSchema.safeParse(rawParams);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters',
      details: parseResult.error.issues
    });
  }

  const profile = parseResult.data;

  // Validate state & enforce MVP Scope (Delhi, Uttar Pradesh, Bihar -> Education)
  const rawState = profile.state;
  const normalizedState = normalizeStateName(rawState);
  if (!normalizedState) {
    return res.status(400).json({
      success: false,
      error: `Invalid Indian State or Union Territory: "${rawState}". Please select a recognized region.`,
      schemes: []
    });
  }

  profile.state = normalizedState;

  const scopeValidation = validateMvpScope(profile.state, profile.persona);
  if (!scopeValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: scopeValidation.error,
      schemes: [],
      diagnostics: {
        searchResultsExamined: 0,
        uniqueCandidateSchemes: 0,
        verifiedSchemes: 0,
        partiallyVerifiedSchemes: 0,
        unverifiedCandidates: 0,
        rejectedCandidates: 0,
        duplicateCandidatesMerged: 0,
        sourcesVerifiedAsOfficial: 0,
        secondarySourcesUtilized: 0,
        officialInformationPortalsCount: 0,
        officialApplicationPortalsCount: 0
      }
    });
  }

  // Check Cache
  const cacheKey = generateCacheKey({
    state: profile.state,
    persona: profile.persona,
    query: profile.query,
    educationLevel: profile.educationLevel
  });

  if (!profile.refresh) {
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const rejectedItems: Array<{ title: string; url: string; reason: string }> = [];
  let isPartial = false;
  let advisoryNote = '';

  // 1. Run TinyFish Search across Central and State portals with configurable budget and pagination
  const maxQueriesBudget = 6;
  const maxFetchPagesBudget = 8;

  const discoveryResult = await runTinyFishSchemeDiscovery({
    state: profile.state,
    persona: profile.persona,
    customQuery: profile.query,
    budget: {
      maxQueries: maxQueriesBudget,
      maxFetchPages: maxFetchPagesBudget,
      timeoutMs: 11000,
      enablePagination: true
    }
  });

  if (discoveryResult.errors.length > 0) {
    errors.push(...discoveryResult.errors);
    isPartial = true;
  }

  const rawSearchItems = discoveryResult.items;

  // Filter out social media, spam directories, login pages, and commercial aggregators
  const searchItems = rawSearchItems.filter(item => {
    const u = item.url.toLowerCase();
    if (u.includes('facebook.com') || u.includes('twitter.com') || u.includes('x.com') || u.includes('instagram.com') || u.includes('scribd.com') || u.includes('youtube.com') || u.includes('pinterest.com')) {
      rejectedItems.push({ title: item.title, url: item.url, reason: 'Social media / document sharing platform' });
      return false;
    }
    if (/login|signin|dashboard|contact-us|privacy-policy/i.test(u)) {
      rejectedItems.push({ title: item.title, url: item.url, reason: 'Generic login, dashboard, or contact page' });
      return false;
    }
    return true;
  });

  // 2. Select promising URLs for fetching (up to 8 pages)
  // CRITICAL: Filter out raw binary PDFs from HTML fetch as they consume fetch budget and fail markdown extraction
  const eligibleForFetch = searchItems.filter(item => {
    const u = item.url.toLowerCase();
    return !/\.(pdf|docx?|xlsx?|zip)$/i.test(u);
  });

  // Prioritize scheme-detail pages with rich guidelines / scheme content over bare homepages
  const sortedForFetch = [...eligibleForFetch].sort((a, b) => {
    const aDetail = /scheme|scholarship|guideline|department-initiative|post|welfare|detail/i.test(a.url) && !/\.gov\.in\/?$/.test(a.url);
    const bDetail = /scheme|scholarship|guideline|department-initiative|post|welfare|detail/i.test(b.url) && !/\.gov\.in\/?$/.test(b.url);
    if (aDetail !== bDetail) return aDetail ? -1 : 1;
    return (a.isOfficial === b.isOfficial) ? 0 : a.isOfficial ? -1 : 1;
  });

  const candidateUrls = sortedForFetch.slice(0, maxFetchPagesBudget).map(item => item.url);

  // If no HTML URLs found, take top search results
  if (candidateUrls.length === 0 && searchItems.length > 0) {
    candidateUrls.push(...searchItems.slice(0, 4).map(i => i.url));
  }

  // 3. Firecrawl Fetch (renders JS/SPA portals → clean markdown for better LLM extraction)
  // Falls back to TinyFish if Firecrawl key is missing or all scrapes fail.
  let fetchedPages: any[] = [];
  let fetchFailures: Array<{ url: string; error: string }> = [];
  if (candidateUrls.length > 0) {
    const firecrawlResult = await fetchPagesWithFirecrawl(candidateUrls, 12000);
    fetchedPages = firecrawlResult.pages;
    fetchFailures = firecrawlResult.failedUrls;

    // If Firecrawl is not configured, fall back to TinyFish
    if (fetchedPages.length === 0 && candidateUrls.length > 0 && !process.env.FIRECRAWL_API_KEY) {
      warnings.push('Firecrawl key not configured; falling back to TinyFish.');
      const tfResult = await fetchPagesWithTinyFish(candidateUrls, undefined, 14000);
      fetchedPages = tfResult.pages;
      fetchFailures = tfResult.failedUrls;
    }

    if (fetchFailures.length > 0) {
      warnings.push(`Could not fetch ${fetchFailures.length} source pages: ${fetchFailures.map(f => f.url).join(', ')}`);
    }
  }

  // 4. OpenRouter Free Model Fact Extraction & Eligibility Processing
  let extractedSchemes: any[] = [];
  let openRouterUsed = false;
  let modelUsed: string | undefined;

  if (searchItems.length > 0 || fetchedPages.length > 0) {
    const openRouterResult = await extractSchemesWithOpenRouter(profile, searchItems, fetchedPages);
    if (openRouterResult.error) {
      warnings.push(`OpenRouter extraction note: ${openRouterResult.error}. Using structured search evidence.`);
      isPartial = true;
    } else {
      openRouterUsed = true;
      modelUsed = openRouterResult.modelUsed;
      extractedSchemes = openRouterResult.extractedSchemes;
      if (openRouterResult.advisoryNote) {
        advisoryNote = openRouterResult.advisoryNote;
      }
    }
  }

  // Helper to clean search query junk and SEO artifacts from scheme titles
  const cleanTitle = (rawTitle: string): string => {
    return sanitizeSchemeName(rawTitle) || '';
  };

  // 5. Fallback Extraction from Search Snippets (Ground Truth with Numeric Integrity)
  // Used when OpenRouter free model fails, returns 0 items, or misses high-value search snippets
  if (extractedSchemes.length === 0 && searchItems.length > 0) {
    extractedSchemes = searchItems
      .filter(item => {
        const cleaned = sanitizeSchemeName(item.title);
        if (!cleaned || isInvalidSchemeName(cleaned)) {
          rejectedItems.push({ title: item.title, url: item.url, reason: 'Invalid or generic title / document filename' });
          return false;
        }
        // Exclude portals, guidelines, documents, and directory listings from becoming scheme cards
        const candidateType = classifyCandidate(cleaned, item.url, item.snippet);
        if (candidateType !== 'individual_scheme') {
          rejectedItems.push({ title: item.title, url: item.url, reason: `Excluded ${candidateType} from becoming individual scheme card` });
          return false;
        }
        return /scheme|scholarship|yojana|grant|fellowship|subsidy|welfare|loan|credit|cmegp|pmegp|mudra/i.test(cleaned);
      })
      .map((item, idx) => {
        const cleanedName = sanitizeSchemeName(item.title)!;
        const candidateType = classifyCandidate(cleanedName, item.url, item.snippet);
        const { benefitText, benefitType, approxAmount } = extractGroundedFinancialBenefit(
          item.snippet,
          cleanedName,
          profile.persona === 'student' ? 'Education' : profile.persona === 'farmer' ? 'Agriculture' : profile.persona === 'business' ? 'Business & MSME' : 'Social Security',
          profile.persona
        );

        return {
          id: `tf-search-${idx}-${Date.now()}`,
          name: cleanedName,
          candidateClassification: candidateType,
          level: 'Central',
          state: null,
          category: profile.persona === 'student' ? 'Education' : profile.persona === 'farmer' ? 'Agriculture' : profile.persona === 'business' ? 'Business & MSME' : 'Social Security',
          categoryReason: `Classified as ${profile.persona === 'student' ? 'Education' : profile.persona === 'farmer' ? 'Agriculture' : profile.persona === 'business' ? 'Business & MSME' : 'Social Security'} based on beneficiary category.`,
          description: item.snippet && item.snippet.length > 20 ? item.snippet : 'Scheme description not verified.',
          benefits: benefitText,
          benefitType,
          benefitAmountApprox: approxAmount,
          eligibilityStatus: (() => {
            const grounded = extractGroundedEligibilityFromSnippet(item.snippet, cleanedName, profile.state);
            return grounded.length > 0 ? 'potentially_eligible' : 'insufficient_information';
          })(),
          eligibilityReasons: (() => {
            const grounded = extractGroundedEligibilityFromSnippet(item.snippet, cleanedName, profile.state);
            return grounded.length > 0 ? grounded : ['Eligibility details not verified from primary source.'];
          })(),
          requiredDocuments: ['Aadhaar Card', 'Identity Proof', 'Bank Account details'],
          officialUrl: item.url,
          applicationUrl: null, // Search result pages are not confirmed interactive application endpoints
          portalName: item.site_name || 'Official Portal',
          deadline: null,
          deadlineStatus: 'unknown',
          sourceUrls: [item.url],
          sourceTitle: item.title
        };
      });
  }

  // 6. Verification, Alias Resolution, and Multi-Source Deduplication
  const verificationResult = verifyAndDeduplicateSchemes({
    rawSchemes: extractedSchemes,
    fetchedPages,
    targetState: profile.state,
    userPersona: profile.persona,
    userProfile: profile
  });

  let finalSchemes = verificationResult.schemes;
  let sourceType: 'live_retrieval' | 'fallback_cache' = 'live_retrieval';

  // 7. Handle 0 items honesty (Never silently return static fallback records as live results)
  if (finalSchemes.length === 0) {
    isPartial = true;
    warnings.push('Live search did not discover any verified individual schemes meeting authenticity standards for this query.');
  }

  const centralCount = finalSchemes.filter(s => s.level === 'Central').length;
  const stateCount = finalSchemes.filter(s => s.level === 'State').length;

  const verifiedSchemes = finalSchemes.filter(s => s.verificationStatus === 'verified').length;
  const partiallyVerifiedSchemes = finalSchemes.filter(s => s.verificationStatus === 'partially_verified').length;
  const unverifiedCandidates = (verificationResult.unverifiedCandidates || []).length;
  const rejectedCandidates = (verificationResult.rejectedCandidates || []).length + rejectedItems.length;
  const duplicateCandidatesMerged = verificationResult.deduplicatedCount;
  const officialInformationPortalsCount = verificationResult.officialInformationPortalsCount ?? 0;
  const officialApplicationPortalsCount = verificationResult.officialApplicationPortalsCount ?? 0;
  const secondarySourcesCount = verificationResult.secondarySourcesCount ?? 0;
  const sourcesVerifiedAsOfficial = officialInformationPortalsCount;

  // Assemble Discovery Diagnostics Report with truthful, separated metrics (Problem 6)
  const diagnostics: DiscoveryDiagnostics = {
    searchResultsExamined: rawSearchItems.length,
    uniqueCandidateSchemes: verificationResult.uniqueCandidatesCount || extractedSchemes.length,
    canonicalSchemesAfterDeduplication: verificationResult.canonicalSchemesCount || finalSchemes.length,
    verifiedSchemes,
    partiallyVerifiedSchemes,
    unverifiedCandidates,
    rejectedCandidates,
    duplicateCandidatesMerged,
    sourcesVerifiedAsOfficial,
    officialInformationPortalsCount,
    officialApplicationPortalsCount,
    secondarySourcesCount,
    failedFetches: fetchFailures.length,
    extractionErrors: errors.length,

    queriesAttempted: discoveryResult.queriesAttempted,
    queriesRun: discoveryResult.queriesRun,
    uniqueUrlsDiscovered: discoveryResult.uniqueUrlsCount,
    pagesSuccessfullyFetched: fetchedPages.length,
    fetchFailures,
    schemesExtracted: extractedSchemes.length,
    duplicatesMerged: verificationResult.deduplicatedCount,
    mergedRecords: verificationResult.mergedDetails,
    resultsRejected: [...rejectedItems, ...(verificationResult.rejectedCandidates || [])],
    jurisdictionFailures: verificationResult.jurisdictionFailures,
    verificationBreakdown: verificationResult.verificationBreakdown,
    sourceBreakdown: verificationResult.sourceBreakdown,
    domainsBreakdown: {
      officialCount: discoveryResult.officialCount,
      secondaryCount: discoveryResult.secondaryCount,
      commercialCount: discoveryResult.commercialCount,
      uniqueDomains: discoveryResult.uniqueDomains
    },
    searchBudget: {
      maxQueries: maxQueriesBudget,
      maxFetchPages: maxFetchPagesBudget,
      budgetLimitReached: discoveryResult.budgetLimitReached
    }
  };

  const accurateAdvisoryNote = advisoryNote || (
    sourceType === 'live_retrieval'
      ? (finalSchemes.length > 0
          ? (verifiedSchemes > 0
              ? `Discovered ${verifiedSchemes} verified and ${partiallyVerifiedSchemes} partially verified Central and State welfare programs for ${profile.state}. Verify application guidelines on the official portal links.`
              : `Discovered ${partiallyVerifiedSchemes} candidate programs for ${profile.state}. Primary official confirmation in progress.`)
          : `No active welfare schemes or scholarships directly matched the entered parameters for ${profile.state}.`)
      : `Displaying ${finalSchemes.length} schemes from the curated reference archive for ${profile.state}. Live web search did not return fresh records.`
  );

  const responsePayload: SchemeSearchResponse = {
    success: finalSchemes.length > 0 || (verificationResult.unverifiedCandidates && verificationResult.unverifiedCandidates.length > 0),
    schemes: finalSchemes,
    unverifiedCandidates: verificationResult.unverifiedCandidates || [],
    source: sourceType,
    totalFound: finalSchemes.length,
    verifiedCount: verifiedSchemes,
    partiallyVerifiedCount: partiallyVerifiedSchemes,
    unverifiedCount: unverifiedCandidates,
    centralCount,
    stateCount,
    stateSearched: profile.state,
    isPartial,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    lastVerified: new Date().toISOString(),
    advisoryNote: accurateAdvisoryNote,
    diagnostics,
    telemetry: {
      searchesRun: discoveryResult.queriesRun,
      pagesFetched: fetchedPages.length,
      domainsAudited: verificationResult.auditedDomains,
      openRouterUsed,
      modelUsed,
      aiProvider: openRouterUsed ? 'OpenRouter (Free Tier)' : undefined,
      groqUsed: openRouterUsed,
      cached: false
    }
  };

  // Cache response if at least 1 scheme found
  if (responsePayload.success && !profile.refresh) {
    setCachedSearch(cacheKey, responsePayload);
  }

  return res.status(200).json(responsePayload);
}
