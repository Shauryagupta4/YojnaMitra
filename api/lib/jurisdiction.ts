import {
  JurisdictionType,
  SchemeLevel,
  AdministrativeStructure,
  FundingAndAdminType
} from './types';
import {
  IndianStateOrUT,
  STATE_METADATA_MAP,
  CENTRAL_OFFICIAL_DOMAINS,
  MULTI_STATE_REGIONS,
  normalizeStateName,
  identifyStateFromDomain,
  getAdministrativeStructure
} from './states';

export interface JurisdictionDetectionResult {
  jurisdiction: JurisdictionType;
  administrativeStructure?: AdministrativeStructure;
  administrativeLabel?: string;
  fundingType?: FundingAndAdminType;
  detectedState: string | null;
  applicableStates: string[];
  isApplicableToTarget: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  rejectionReason?: string;
}

export interface CandidateJurisdictionInput {
  name: string;
  description?: string;
  officialUrl: string;
  level?: SchemeLevel;
  state?: string | null;
  department?: string | null;
  sourceTitle?: string;
  evidenceSnippets?: {
    nameEvidence?: string | null;
    benefitEvidence?: string | null;
    eligibilityEvidence?: string | null;
  };
}

/**
 * Recognizes Central All-India flagships by canonical name, acronyms, or central ministries.
 */
const CENTRAL_FLAGSHIP_PATTERNS = [
  /\bpradhan\s*mantri\b/i,
  /\bpm[- ]?(kisan|mudra|egp|svanidhi|fby|jay|yasasvi|vishwakarma|ay|mvy)\b/i,
  /\bmudra\s*(loan|yojana)?\b/i,
  /\bstand[- ]?up\s*india\b/i,
  /\bcgtmse\b/i,
  /\bnational\s*scholarship\s*portal\b/i,
  /\b(aicte|ugc|nsp)\s*(pragati|saksham|csss|swanath|ishaan\s*uday)?\b/i,
  /\bcentral\s*sector\s*scholarship\b/i,
  /\batal\s*pension\s*yojana\b/i,
  /\bsukanya\s*samriddhi\b/i,
  /\bprime\s*minister['’]?s\s*employment\s*generation\b/i,
  /\b(nmmss|national\s*means[- ]?cum[- ]?merit)\b/i,
  /\bpost[- ]?matric\s*scholarship\b/i,
  /\bpre[- ]?matric\s*scholarship\b/i
];

/**
 * Multi-state regional initiatives with restricted state memberships.
 */
const MULTI_STATE_PROGRAM_PATTERNS = [
  {
    regex: /\b(north\s*eastern\s*council|nec\s*scholarship|doner|pm[- ]?devine)\b/i,
    region: 'North East',
    name: 'North Eastern Regional Initiative'
  },
  {
    regex: /\b(national\s*capital\s*region|ncr\s*planning)\b/i,
    region: 'NCR',
    name: 'National Capital Region Initiative'
  },
  {
    regex: /\b(pmsss|jammu\s*(&|and)\s*kashmir\s*and\s*ladakh|j&k\s*and\s*ladakh)\b/i,
    region: 'JK_Ladakh',
    name: 'Prime Minister Special Scholarship Scheme for J&K and Ladakh (PMSSS)'
  }
];

/**
 * Dynamically establish jurisdiction, applicability, and cross-state exclusivity
 * for any scheme candidate across all 28 states and 8 union territories.
 */
export function detectJurisdiction(
  candidate: CandidateJurisdictionInput,
  targetState: string
): JurisdictionDetectionResult {
  const normTarget = normalizeStateName(targetState);
  const isAllIndiaTarget = !normTarget || normTarget === 'All India / Central';

  const rawName = candidate.name || '';
  const url = candidate.officialUrl || '';
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {}

  const combinedText = [
    rawName,
    candidate.sourceTitle || '',
    candidate.department || '',
    candidate.description || '',
    candidate.evidenceSnippets?.nameEvidence || ''
  ].join(' ').toLowerCase();

  // -------------------------------------------------------------
  // STEP 1: Multi-State Regional Programs (e.g. North East / NEC)
  // -------------------------------------------------------------
  for (const prog of MULTI_STATE_PROGRAM_PATTERNS) {
    if (prog.regex.test(rawName) || prog.regex.test(combinedText) || host.includes('necouncil') || host.includes('doner')) {
      const regionMembers = MULTI_STATE_REGIONS[prog.region] || [];
      const appliesToTarget = isAllIndiaTarget || (normTarget ? regionMembers.includes(normTarget as IndianStateOrUT) : false);

      if (appliesToTarget) {
        return {
          jurisdiction: 'multi_state',
          detectedState: null,
          applicableStates: regionMembers,
          isApplicableToTarget: true,
          confidence: 'high',
          reason: `Multi-state program (${prog.name}) explicitly applicable across ${prog.region} states including ${normTarget || 'All India'}.`
        };
      } else {
        return {
          jurisdiction: 'multi_state',
          detectedState: null,
          applicableStates: regionMembers,
          isApplicableToTarget: false,
          confidence: 'high',
          reason: `Multi-state program (${prog.name}) restricted to ${prog.region} states (${regionMembers.join(', ')}).`,
          rejectionReason: `Jurisdiction mismatch: Multi-state scheme applies exclusively to ${prog.region} states, not ${normTarget}.`
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 2: Domain-Level State Identification (Unambiguous)
  // -------------------------------------------------------------
  const domainState = identifyStateFromDomain(url);

  // -------------------------------------------------------------
  // STEP 3: Text / Name-Level State Identification
  // -------------------------------------------------------------
  let textDetectedState: IndianStateOrUT | null = null;
  let textConfidence: 'high' | 'medium' | 'low' = 'low';

  // Check state names and aliases in scheme name or department
  for (const [stName, meta] of Object.entries(STATE_METADATA_MAP)) {
    // Check scheme title first (highest weight)
    const nameLower = rawName.toLowerCase();
    const isStateInName = meta.aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(nameLower);
    });

    if (isStateInName) {
      textDetectedState = stName as IndianStateOrUT;
      textConfidence = 'high';
      break;
    }

    // Check department / source title
    const deptLower = (candidate.department || '').toLowerCase();
    const isStateInDept = meta.aliases.some(alias => {
      const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(deptLower);
    });

    if (isStateInDept) {
      textDetectedState = stName as IndianStateOrUT;
      textConfidence = 'medium';
      break;
    }
  }

  // Also check candidate.state if provided
  if (!textDetectedState && candidate.state) {
    const fromCandidate = normalizeStateName(candidate.state);
    if (fromCandidate && fromCandidate !== 'All India / Central') {
      textDetectedState = fromCandidate as IndianStateOrUT;
      textConfidence = 'medium';
    }
  }

  const isGovOrNicDomain = host.endsWith('.gov.in') || host.endsWith('.nic.in');
  const isMyScheme = host.includes('myscheme.gov.in');
  const isCentralTitle = CENTRAL_FLAGSHIP_PATTERNS.some(p => p.test(rawName));
  const isCentralDomain =
    (!isMyScheme && CENTRAL_OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d))) ||
    (isGovOrNicDomain && !domainState && (!isMyScheme || isCentralTitle));
  const isCentralClaimed = candidate.level === 'Central' ||
    /\b(central scheme|centrally sponsored|government of india|ministry of|all india|pan india|national scheme)\b/i.test(combinedText);

  // Helper to detect funding type
  const detectFundingType = (isCentral: boolean, stateName: string | null): FundingAndAdminType => {
    if (/\b(centrally\s*sponsored|css|sharing\s*ratio|60:40|90:10)\b/i.test(combinedText)) {
      return 'centrally_sponsored';
    }
    if (isCentral || /\b(central\s*sector)\b/i.test(combinedText) || isCentralTitle) {
      return 'central_sector';
    }
    if (stateName) {
      const struct = getAdministrativeStructure(stateName);
      if (struct.type === 'union_territory_with_legislature' || struct.type === 'union_territory_without_legislature') {
        return 'ut_funded';
      }
      return 'state_funded';
    }
    return 'unknown';
  };

  // -------------------------------------------------------------
  // STEP 4: State-Specific Scheme Resolution & Cross-State Exclusion
  // Prioritize state resolution if domain or explicit state text exists
  const resolvedState = domainState || textDetectedState;
  const isStateImplementedCss = Boolean(resolvedState && /\b(post[- ]?matric|pre[- ]?matric|fee reimbursement)\b/i.test(rawName));

  if (resolvedState && (!isCentralTitle || Boolean(domainState) || isStateImplementedCss)) {
    const isStateMatch = isAllIndiaTarget || (normTarget === resolvedState);
    const struct = getAdministrativeStructure(resolvedState);
    const adminLabel = struct.label;

    if (isStateMatch) {
      return {
        jurisdiction: 'state',
        administrativeStructure: struct.type,
        administrativeLabel: adminLabel,
        fundingType: detectFundingType(false, resolvedState),
        detectedState: resolvedState,
        applicableStates: [resolvedState],
        isApplicableToTarget: true,
        confidence: domainState ? 'high' : textConfidence,
        reason: `Verified regional scheme for ${resolvedState} (${adminLabel}) corroborated via ${domainState ? `official domain ${host}` : 'scheme metadata'}.`
      };
    } else {
      // Definite Cross-State Exclusion!
      return {
        jurisdiction: 'state',
        administrativeStructure: struct.type,
        administrativeLabel: adminLabel,
        fundingType: detectFundingType(false, resolvedState),
        detectedState: resolvedState,
        applicableStates: [resolvedState],
        isApplicableToTarget: false,
        confidence: 'high',
        reason: `Scheme belongs to ${resolvedState} via ${domainState ? `domain ${host}` : 'state department'}. Inapplicable to ${normTarget}.`,
        rejectionReason: `Jurisdiction mismatch: Scheme belongs exclusively to ${resolvedState}, not ${normTarget}.`
      };
    }
  }

  // -------------------------------------------------------------
  // STEP 5: Central All-India Schemes (Applicable across all states/UTs)
  // -------------------------------------------------------------
  if ((isCentralDomain || isCentralTitle || isCentralClaimed) && !domainState) {
    const isHighConf = isCentralDomain || isCentralTitle;
    return {
      jurisdiction: 'central',
      administrativeStructure: 'central',
      administrativeLabel: 'Government of India (Central Administration)',
      fundingType: detectFundingType(true, null),
      detectedState: null,
      applicableStates: ['All India'],
      isApplicableToTarget: true,
      confidence: isHighConf ? 'high' : 'low',
      reason: isHighConf
        ? `Government of India Central initiative verified via ${isCentralDomain ? host : 'official scheme title'}.`
        : `Central scheme candidate applicable nationwide (verification pending official source).`
    };
  }

  // -------------------------------------------------------------
  // STEP 6: Unknown Jurisdiction Fallback
  // -------------------------------------------------------------
  if (isAllIndiaTarget) {
    return {
      jurisdiction: 'unknown',
      administrativeStructure: 'unknown',
      administrativeLabel: 'Jurisdiction Unspecified',
      fundingType: 'unknown',
      detectedState: null,
      applicableStates: [],
      isApplicableToTarget: true,
      confidence: 'low',
      reason: 'Jurisdiction could not be established conclusively from source evidence.'
    };
  }

  // If a specific state was targeted, but jurisdiction cannot be established,
  // we cannot assume it belongs to the target state without evidence
  return {
    jurisdiction: 'unknown',
    administrativeStructure: 'unknown',
    administrativeLabel: 'Jurisdiction Unverified',
    fundingType: 'unknown',
    detectedState: null,
    applicableStates: [],
    isApplicableToTarget: false,
    confidence: 'low',
    reason: `Jurisdiction cannot be verified for ${normTarget}. No state domain or authority found.`,
    rejectionReason: `Jurisdiction unverified: Insufficient evidence establishing applicability to ${normTarget}.`
  };
}
