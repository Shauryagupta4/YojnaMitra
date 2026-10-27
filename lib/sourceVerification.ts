import {
  SourceClassification,
  SourceRelationship,
  VerificationStatus
} from './types';
import {
  CENTRAL_OFFICIAL_DOMAINS,
  identifyStateFromDomain,
  STATE_METADATA_MAP,
  IndianStateOrUT
} from './states';
import { JurisdictionDetectionResult } from './jurisdiction';

export interface SourceClassificationResult {
  classification: SourceClassification;
  relationship: SourceRelationship;
  isOfficial: boolean;
  isSecondary: boolean;
  isCommercial: boolean;
  domain: string;
  ownerName: string;
  rationale: string;
  isGenericHomepage: boolean;
}

const STATUTORY_SCHEME_PORTALS: Record<string, string> = {
  'mudra.org.in': 'MUDRA Ltd (Subsidiary of SIDBI / GoI)',
  'cgtmse.in': 'Credit Guarantee Fund Trust for Micro and Small Enterprises (Ministry of MSME / SIDBI)',
  'standupmitra.in': 'Small Industries Development Bank of India (SIDBI)',
  'udyamimitra.in': 'Small Industries Development Bank of India (SIDBI)',
  'jansamarth.in': 'National Portal for Credit Linked Government Schemes (GoI)',
  'maandhan.in': 'Ministry of Labour and Employment (GoI)',
  'vikaspedia.in': 'Ministry of Electronics and IT / C-DAC India Development Gateway',
  'aicte-india.org': 'All India Council for Technical Education (Ministry of Education)',
  'mahaonline.gov.in': 'Maharashtra Information Technology Corporation Ltd',
  'pfrda.org.in': 'Pension Fund Regulatory and Development Authority (GoI)',
  'jeevandayee.gov.in': 'State Health Assurance Society Maharashtra',
  'cmchistn.com': 'Chief Minister Comprehensive Health Insurance Scheme (Government of Tamil Nadu)'
};

const REPUTABLE_SECONDARY_DOMAINS: Record<string, string> = {
  'buddy4study.com': 'Buddy4Study Scholarship Portal',
  'careers360.com': 'Careers360 Educational Directory',
  'scholarships360.com': 'Scholarships360 Directory',
  'jagranjosh.com': 'Jagran Josh Education & Careers',
  'ibef.org': 'India Brand Equity Foundation (Secondary Reference)',
  'krishijagran.com': 'Krishi Jagran Agri Media',
  'indiafilings.com': 'IndiaFilings Reference Guide',
  'thehindu.com': 'The Hindu Newspaper',
  'indianexpress.com': 'The Indian Express',
  'timesofindia.indiatimes.com': 'The Times of India',
  'ndtv.com': 'NDTV News',
  'hindustantimes.com': 'Hindustan Times',
  'livemint.com': 'Mint News'
};

const COMMERCIAL_OR_BANK_DOMAINS: Record<string, string> = {
  // Commercial Machinery, Tractor & Agritech Manufacturers
  'eichertractors.in': 'Eicher Tractors (Commercial Tractor Manufacturer)',
  'eicher.in': 'Eicher Motors Ltd (Commercial Entity)',
  'mahindratractor.com': 'Mahindra Tractors (Commercial Manufacturer)',
  'mahindra.com': 'Mahindra & Mahindra Ltd',
  'tractorjunction.com': 'Tractor Junction (Commercial Marketplace)',
  'tractorforeveryone.com': 'Tractor Commercial Portal',
  'netafimindia.com': 'Netafim India (Commercial Irrigation Equipment Vendor)',
  'netafim.com': 'Netafim Ltd',
  'johndeere.co.in': 'John Deere India (Commercial Machinery)',
  'sonalika.com': 'Sonalika Tractors (Commercial Manufacturer)',
  'tafe.com': 'TAFE Tractors (Commercial Manufacturer)',
  'escortsgroup.com': 'Escorts Kubota Ltd (Commercial Manufacturer)',
  'kubota.co.in': 'Kubota Agricultural Machinery India',
  // Commercial Banks
  'sbi.co.in': 'State Bank of India (Commercial Bank)',
  'sbi.bank.in': 'State Bank of India (Commercial Bank)',
  'hdfcbank.com': 'HDFC Bank (Commercial Bank)',
  'hdfc.bank.in': 'HDFC Bank (Commercial Bank)',
  'icicibank.com': 'ICICI Bank (Commercial Bank)',
  'axisbank.com': 'Axis Bank (Commercial Bank)',
  'bankofbaroda.in': 'Bank of Baroda (Commercial Bank)',
  'bankofmaharashtra.bank.in': 'Bank of Maharashtra (Commercial Bank)',
  'canarabank.com': 'Canara Bank (Commercial Bank)',
  'pnbindia.in': 'Punjab National Bank (Commercial Bank)',
  // Commercial Directories, Yellow Pages & Classifieds
  'justdial.com': 'Justdial (Commercial Business Directory / Yellow Pages)',
  'indiamart.com': 'IndiaMART (Commercial B2B Directory)',
  'tradeindia.com': 'TradeIndia (Commercial Directory)',
  'sulekha.com': 'Sulekha (Commercial Local Directory)',
  'quikr.com': 'Quikr (Commercial Classifieds)',
  'olx.in': 'OLX India (Commercial Classifieds)',
  // Aggregators, FinTech, Commercial Blogs & Private NBFCs
  'iifl.com': 'IIFL Finance (Commercial NBFC / Financial Services)',
  'iiflfinance.com': 'IIFL Finance (Commercial NBFC)',
  'paisabazaar.com': 'Paisabazaar Marketing & Aggregation',
  'bankbazaar.com': 'BankBazaar Financial Aggregator',
  'stashfin.com': 'Stashfin Private Lending Platform',
  'cred.club': 'CRED Fintech Service',
  'bajajfinserv.in': 'Bajaj Finserv Private Financial Services',
  'cleartax.in': 'ClearTax Financial & Filing Software',
  'mittigoldorganic.com': 'MittiGold Organic (Commercial Agri Venture)',
  'impriindia.com': 'IMPRI Policy Research (Private Think Tank)',
  'govtschemesindia.com': 'GovtSchemesIndia (Private Blog / Ad Platform)',
  'jharkhandstatenews.com': 'JharkhandStateNews (Private News Blog)',
  'howdoiindia.com': 'HowDoIIndia (Private Ad / Blog Platform)',
  'cscportal.in': 'CSC Portal Blog (Unofficial Private Site - Not csc.gov.in)',
  'pmfby.in.net': 'PMFBY In Net (Unofficial Private Domain - Imposter Site)',
  'pmkisan.in.net': 'PM-KISAN In Net (Unofficial Private Domain - Imposter Site)',
  'sarkariyojana.com': 'Sarkari Yojana Blog (Private Ad Platform)',
  'sarkariyojnaa.com': 'Sarkari Yojnaa Blog (Private Ad Platform)',
  'sarkariresult.com': 'Sarkari Result (Private Job/Exam Portal)',
  // App Stores & APK Downloads
  'play.google.com': 'Google Play Store (Mobile App Marketplace)',
  'apps.apple.com': 'Apple App Store (Mobile App Marketplace)',
  'apkpure.com': 'APKPure (Third-Party APK Host)',
  // Social Media & Generic Content Platforms
  'facebook.com': 'Social Media Platform',
  'twitter.com': 'Social Media Platform',
  'x.com': 'Social Media Platform',
  'instagram.com': 'Social Media Platform',
  'youtube.com': 'Social Video Platform',
  'linkedin.com': 'Professional Networking Platform',
  'scribd.com': 'Document Sharing Platform',
  'pinterest.com': 'Image Bookmarking Platform',
  // Political Party Websites
  'bjp.org': 'Political Party Website',
  'inc.in': 'Political Party Website',
  'aamaadmiparty.org': 'Political Party Website'
};

/**
 * Classify the source relationship across the 5 strictly defined types:
 * - official_scheme_page: official page specifically describing the scheme
 * - official_application_portal: official application or service endpoint
 * - official_supporting_document: official circular, guideline, notification, or report
 * - reputable_secondary_source: independent explanatory source
 * - commercial_or_unverified_source: other sources not established as official
 */
export function classifySourceRelationship(
  urlStr: string,
  isOfficialHost: boolean,
  isSecondaryHost: boolean,
  isCommercialHost: boolean
): SourceRelationship {
  if (isCommercialHost) {
    return 'commercial_or_unverified_source';
  }

  if (isSecondaryHost) {
    return 'reputable_secondary_source';
  }

  if (!isOfficialHost) {
    return 'commercial_or_unverified_source';
  }

  // If host is official government or statutory portal, inspect path and structure
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();

    // 1. Supporting Document (PDFs, guidelines, circulars, notifications, press releases, news announcements, FAQs)
    if (
      /\.(pdf|docx?|xlsx?|txt|csv)$/i.test(path) ||
      /guideline|circular|notification|resolution|act|rules|report|compendium|faq/i.test(path) ||
      /pib\.gov\.in|pressrelease|press-release|\/news\/|\/announcement\/|\/media\//i.test(host + path)
    ) {
      return 'official_supporting_document';
    }

    // 2. Application Portal (dedicated registration, service endpoint, or direct apply page)
    if (
      /apply|registration|register|citizen-service|serviceonline|farmerregistration|online-application|applicationform|new-registration|beneficiary\/register/i.test(path) ||
      /\/(apply|registration|register|forms?)\b/i.test(path)
    ) {
      return 'official_application_portal';
    }

    // 3. Scheme Details Page
    return 'official_scheme_page';
  } catch {
    return 'commercial_or_unverified_source';
  }
}

/**
 * Classify a source URL across official government, statutory scheme portals,
 * reputable secondary sources, commercial platforms, or unknown entities.
 */
export function classifySource(urlStr: string, targetState?: string): SourceClassificationResult {
  try {
    const parsed = new URL(urlStr);
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    const pathname = parsed.pathname.toLowerCase();
    const isGenericHomepage = pathname === '' || pathname === '/' || pathname === '/home' || pathname === '/default.aspx' || pathname === '/index.html' || pathname === '/index.php';

    // 1. Check Commercial / Bank / Social Media first to prevent false official claims
    for (const [commDomain, commOwner] of Object.entries(COMMERCIAL_OR_BANK_DOMAINS)) {
      if (domain === commDomain || domain.endsWith('.' + commDomain)) {
        return {
          classification: 'commercial_source',
          relationship: 'commercial_or_unverified_source',
          isOfficial: false,
          isSecondary: false,
          isCommercial: true,
          domain,
          ownerName: commOwner,
          rationale: `Commercial entity, vendor, fintech aggregator, or social platform (${commOwner}). Never an official government department.`,
          isGenericHomepage
        };
      }
    }

    // 1b. Check all commercial banking domains (.bank.in, .bank)
    if (domain.endsWith('.bank.in') || domain.endsWith('.bank')) {
      return {
        classification: 'commercial_source',
        relationship: 'commercial_or_unverified_source',
        isOfficial: false,
        isSecondary: false,
        isCommercial: true,
        domain,
        ownerName: 'Commercial Banking Institution',
        rationale: 'Commercial banking domain (.bank.in). Regulated commercial banking provider, not a government department.',
        isGenericHomepage
      };
    }

    // Helper to resolve official source classification from relationship
    const resolveOfficialClassification = (rel: SourceRelationship): SourceClassification => {
      if (rel === 'official_application_portal') return 'official_application_portal';
      if (rel === 'official_supporting_document') return 'official_supporting_document';
      return 'official_government_scheme_page';
    };

    // 2. Check Statutory Official Scheme Portals (.org.in, .in, etc. established by GoI or State legislation)
    for (const [statDomain, statOwner] of Object.entries(STATUTORY_SCHEME_PORTALS)) {
      if (domain === statDomain || domain.endsWith('.' + statDomain)) {
        const rel = classifySourceRelationship(urlStr, true, false, false);
        return {
          classification: resolveOfficialClassification(rel),
          relationship: rel,
          isOfficial: true,
          isSecondary: false,
          isCommercial: false,
          domain,
          ownerName: statOwner,
          rationale: `Authorized statutory scheme portal maintained by ${statOwner}.`,
          isGenericHomepage
        };
      }
    }

    // 3. Check Central Government Domains (.gov.in, .nic.in registered to GoI)
    if (CENTRAL_OFFICIAL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: 'Government of India',
        rationale: 'Official Central Government portal verified via National Informatics Centre (NIC) registry.',
        isGenericHomepage
      };
    }

    // 4. Educational .ac.in or .edu (Academic institutions are NOT government welfare departments)
    if (domain.endsWith('.ac.in') || domain.endsWith('.edu')) {
      return {
        classification: 'secondary_source',
        relationship: 'reputable_secondary_source',
        isOfficial: false,
        isSecondary: true,
        isCommercial: false,
        domain,
        ownerName: 'Educational / University Institution',
        rationale: 'Academic institution domain. Serves secondary reference information, not an apex welfare department.',
        isGenericHomepage
      };
    }

    // 5. Check State Government Domains via State Metadata
    const detectedState = identifyStateFromDomain(urlStr);
    if (detectedState) {
      const stateMeta = STATE_METADATA_MAP[detectedState as IndianStateOrUT];
      const owner = `Government of ${detectedState}`;
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: owner,
        rationale: `Official State Government portal for ${detectedState} under ${stateMeta?.domainSuffixes[0] || '.gov.in'}.`,
        isGenericHomepage
      };
    }

    // 6. General .gov.in or .nic.in domains
    if (domain.endsWith('.gov.in') || domain.endsWith('.nic.in')) {
      const rel = classifySourceRelationship(urlStr, true, false, false);
      return {
        classification: resolveOfficialClassification(rel),
        relationship: rel,
        isOfficial: true,
        isSecondary: false,
        isCommercial: false,
        domain,
        ownerName: 'Government of India / State Authority',
        rationale: 'Official Indian Government domain verified by .gov.in/.nic.in registry.',
        isGenericHomepage
      };
    }

    // 7. Reputable Secondary Education & News Directories
    for (const [secDomain, secOwner] of Object.entries(REPUTABLE_SECONDARY_DOMAINS)) {
      if (domain === secDomain || domain.endsWith('.' + secDomain)) {
        return {
          classification: 'secondary_source',
          relationship: 'reputable_secondary_source',
          isOfficial: false,
          isSecondary: true,
          isCommercial: false,
          domain,
          ownerName: secOwner,
          rationale: `Recognized secondary welfare/scholarship directory (${secOwner}).`,
          isGenericHomepage
        };
      }
    }

    // 8. Generic .org or .org.in (Secondary reference)
    if (domain.endsWith('.org') || domain.endsWith('.org.in')) {
      return {
        classification: 'secondary_source',
        relationship: 'reputable_secondary_source',
        isOfficial: false,
        isSecondary: true,
        isCommercial: false,
        domain,
        ownerName: 'Non-profit or Research Organization',
        rationale: 'Non-governmental organizational domain.',
        isGenericHomepage
      };
    }

    // 9. Unknown / Unverified Source
    return {
      classification: 'unknown',
      relationship: 'commercial_or_unverified_source',
      isOfficial: false,
      isSecondary: false,
      isCommercial: false,
      domain,
      ownerName: domain,
      rationale: 'Domain ownership cannot be verified against official registries or trusted secondary indexes.',
      isGenericHomepage
    };
  } catch {
    return {
      classification: 'unknown',
      relationship: 'commercial_or_unverified_source',
      isOfficial: false,
      isSecondary: false,
      isCommercial: false,
      domain: 'unknown',
      ownerName: 'Unknown Source',
      rationale: 'Invalid or malformed URL.',
      isGenericHomepage: true
    };
  }
}

/**
 * Determine the explicit verification status of a scheme based on jurisdiction validation,
 * source classification, name corroboration, benefit corroboration, and fetch success.
 */
export function evaluateVerificationStatus(params: {
  jurisdictionResult: JurisdictionDetectionResult;
  sourceClassification: SourceClassificationResult;
  hasCorroboratedName: boolean;
  hasCorroboratedBenefit: boolean;
  pageFetchedSuccessfully: boolean;
  hasConfirmedApplicationUrl?: boolean;
  hasCorroboratedEligibility?: boolean;
}): {
  status: VerificationStatus;
  evidenceNote: string;
  partialReasons?: string[];
  rejectionReason?: string;
} {
  const {
    jurisdictionResult,
    sourceClassification,
    hasCorroboratedName,
    hasCorroboratedBenefit,
    pageFetchedSuccessfully,
    hasConfirmedApplicationUrl = false,
    hasCorroboratedEligibility = false
  } = params;

  // 1. REJECT if jurisdiction is incompatible
  if (!jurisdictionResult.isApplicableToTarget) {
    return {
      status: 'rejected',
      evidenceNote: jurisdictionResult.rejectionReason || 'Incompatible jurisdiction.',
      rejectionReason: jurisdictionResult.rejectionReason || 'Incompatible jurisdiction.'
    };
  }

  // 2. Official Sources (Government departments or authorized scheme portals)
  if (sourceClassification.isOfficial) {
    if (hasCorroboratedName) {
      const partialReasons: string[] = [];
      if (!hasCorroboratedBenefit) {
        partialReasons.push('Financial benefit details not verified from primary source.');
      }
      if (!hasConfirmedApplicationUrl) {
        partialReasons.push('Direct online application link not verified on official portal.');
      }
      if (!hasCorroboratedEligibility) {
        partialReasons.push('Specific eligibility criteria require further verification on portal.');
      }
      if (!pageFetchedSuccessfully) {
        partialReasons.push('Primary source page content could not be fetched for in-depth corroboration.');
      }

      // If benefit and jurisdiction are corroborated with high confidence and application URL is verified
      if (hasCorroboratedBenefit && jurisdictionResult.confidence === 'high' && hasConfirmedApplicationUrl) {
        return {
          status: 'verified',
          evidenceNote: `Verified official record: Jurisdiction (${jurisdictionResult.jurisdiction}), official authority (${sourceClassification.ownerName}), scheme identity, benefit terms, and application portal corroborated from primary source.`
        };
      }

      // If benefit is corroborated and jurisdiction is high confidence, but application URL is unconfirmed:
      if (hasCorroboratedBenefit && jurisdictionResult.confidence === 'high') {
        return {
          status: 'verified',
          evidenceNote: `Verified official record: Jurisdiction (${jurisdictionResult.jurisdiction}), authority (${sourceClassification.ownerName}), and benefit terms corroborated from primary source. Application link status: ${hasConfirmedApplicationUrl ? 'Verified' : 'Unverified'}.`,
          partialReasons: partialReasons.length > 0 ? partialReasons : undefined
        };
      }

      // Otherwise partially verified with explicit reasons
      return {
        status: 'partially_verified',
        evidenceNote: `Partially verified: Official government source (${sourceClassification.ownerName}) and scheme identity established, but one or more fields remain unconfirmed.`,
        partialReasons: partialReasons.length > 0 ? partialReasons : ['One or more scheme claims require primary source verification.']
      };
    }

    return {
      status: 'unverified_candidate',
      evidenceNote: `Unverified candidate: Official domain (${sourceClassification.domain}) cited, but source page lacks corroboration for scheme identity.`,
      partialReasons: ['Scheme identity not corroborated in source text.']
    };
  }

  // 3. Reputable Secondary Sources (e.g. IBEF, Buddy4Study, news articles)
  if (
    sourceClassification.classification === 'secondary_source' ||
    sourceClassification.classification === 'reputable_secondary' ||
    sourceClassification.isSecondary
  ) {
    if (hasCorroboratedName) {
      return {
        status: 'partially_verified',
        evidenceNote: `Partially verified: Scheme identity corroborated from reputable secondary directory (${sourceClassification.ownerName}). Official government portal confirmation pending.`,
        partialReasons: [
          'Secondary source citation; official government portal confirmation pending.',
          'Application portal link not verified on government domain.'
        ]
      };
    }
    return {
      status: 'unverified_candidate',
      evidenceNote: `Unverified candidate from secondary source citation (${sourceClassification.domain}).`,
      partialReasons: ['Secondary source citation; scheme identity uncorroborated.']
    };
  }

  // 4. Commercial, Bank, or Unknown
  return {
    status: 'unverified_candidate',
    evidenceNote: `Unverified candidate: Source (${sourceClassification.domain}) is a ${sourceClassification.classification} platform without official government standing.`,
    partialReasons: ['Source is not an official government department.']
  };
}
