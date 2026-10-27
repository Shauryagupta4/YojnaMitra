export type SchemeLevel = 'Central' | 'State' | 'Multi-State';

export type JurisdictionType = 'central' | 'state' | 'multi_state' | 'unknown';

export type SourceClassification =
  | 'official_government_scheme_page'
  | 'official_application_portal'
  | 'official_supporting_document'
  | 'secondary_source'
  | 'commercial_source'
  | 'unknown'
  // Legacy aliases tolerated for backward compatibility
  | 'official_government'
  | 'official_scheme_portal'
  | 'reputable_secondary'
  | 'commercial';

export type SourceRelationship =
  | 'official_scheme_page'
  | 'official_application_portal'
  | 'official_supporting_document'
  | 'reputable_secondary_source'
  | 'commercial_or_unverified_source';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'unverified_candidate'
  | 'unverified'
  | 'rejected';

export type EligibilityStatus = 'potentially_eligible' | 'not_eligible' | 'insufficient_information';

export type DeadlineStatus = 'open' | 'closed' | 'upcoming' | 'unknown';

export type EvidenceStatus =
  | 'verified'
  | 'officially_verified'
  | 'partially_verified'
  | 'unverified'
  | 'officially_supported'
  | 'rejected';

export type DiscoverySource = 'live_retrieval' | 'fallback_cache';

export interface SupportingDocument {
  title: string;
  url: string;
  domain: string;
  relationship?: SourceRelationship;
  isOfficial: boolean;
  documentType?: string;
  verifiedDate?: string;
}

export interface FieldEvidenceItem {
  sourceUrl: string;
  passageSnippet: string;
  isVerified: boolean;
  verifiedAt?: string;
  reason?: string;
  conflictNotes?: string;
}

export interface SchemeFieldEvidence {
  schemeName?: FieldEvidenceItem;
  schemeIdentity?: FieldEvidenceItem;
  jurisdiction?: FieldEvidenceItem;
  department?: FieldEvidenceItem;
  description?: FieldEvidenceItem;
  benefit?: FieldEvidenceItem;
  eligibility?: FieldEvidenceItem;
  applicationAvailability?: FieldEvidenceItem;
  officialInformationUrl?: FieldEvidenceItem;
  applicationUrl?: FieldEvidenceItem;
}

export interface CanonicalScheme {
  id: string;
  name: string;
  aliases?: string[];
  hindiName?: string;
  category: string;
  categoryReason?: string;
  department?: string | null;
  benefitType?: 'loan' | 'grant' | 'subsidy' | 'scholarship' | 'insurance' | 'pension' | 'composite';
  level: SchemeLevel;
  jurisdiction?: JurisdictionType;
  state: string | null;
  applicableStates?: string[];
  description: string;
  benefits: string;
  benefitAmountApprox?: number;
  sourceClassification?: SourceClassification;
  sourceRelationship?: SourceRelationship;
  verificationStatus?: VerificationStatus;
  verificationEvidence?: string;
  partialVerificationReasons?: string[];
  rejectionReason?: string;
  jurisdictionVerified?: boolean;
  benefitVerified?: boolean;
  applicationVerified?: boolean;
  eligibilityDetailsVerified?: boolean;
  eligibilityMatch?: 'matched' | 'not_matched' | 'unknown';
  eligibility: {
    status: EligibilityStatus;
    matchState?: 'matched' | 'not_matched' | 'unknown';
    criteriaSummary: string[];
    reasons: string[];
    missingOrCautionCriteria?: string[];
  };
  requiredDocuments: string[];
  officialInformationUrl?: string;
  officialUrl: string;
  applicationUrl: string | null;
  portalName: string;
  sourceUrls: string[];
  supportingEvidenceUrls?: string[];
  supportingDocuments?: SupportingDocument[];
  supportingReferences?: Array<{ title?: string; url: string; domain: string; isOfficial: boolean }>;
  deadline: string | null;
  deadlineStatus: DeadlineStatus;
  evidenceStatus: EvidenceStatus;
  lastVerified: string;
  sourceType: DiscoverySource;
  academicYearOrValidity?: string;
  matchScore: number;
  matchScoreRationale?: string;
  sourceTitle?: string;
  fieldEvidence?: SchemeFieldEvidence;
  evidenceSnippets?: {
    benefitEvidence?: string | null;
    eligibilityEvidence?: string | null;
    nameEvidence?: string | null;
  };
}

export interface DiscoveryDiagnostics {
  // Required separate metrics per section 9 and Problem 6
  searchResultsExamined: number;
  uniqueCandidateSchemes: number;
  canonicalSchemesAfterDeduplication: number;
  verifiedSchemes: number;
  partiallyVerifiedSchemes: number;
  unverifiedCandidates: number;
  rejectedCandidates: number;
  duplicateCandidatesMerged: number;
  sourcesVerifiedAsOfficial: number;
  officialInformationPortalsCount?: number;
  officialApplicationPortalsCount?: number;
  secondarySourcesCount?: number;
  failedFetches: number;
  extractionErrors: number;

  queriesAttempted: string[];
  queriesRun: number;
  uniqueUrlsDiscovered: number;
  pagesSuccessfullyFetched: number;
  fetchFailures: Array<{ url: string; error: string }>;
  schemesExtracted: number;
  duplicatesMerged: number;
  mergedRecords?: Array<{ schemeName: string; sourcesMergedCount: number }>;
  resultsRejected: Array<{ title: string; url: string; reason: string }>;
  domainsBreakdown: {
    officialCount: number;
    secondaryCount: number;
    commercialCount: number;
    uniqueDomains: string[];
  };
  jurisdictionFailures?: Array<{
    schemeName: string;
    detectedJurisdiction: string;
    detectedState?: string | null;
    targetState: string;
    reason: string;
    url: string;
  }>;
  verificationBreakdown?: {
    verifiedCount: number;
    partiallyVerifiedCount: number;
    unverifiedCount: number;
    rejectedCount: number;
  };
  sourceBreakdown?: {
    officialGovernment: number;
    officialPortal: number;
    reputableSecondary: number;
    commercial: number;
    unknown: number;
  };
  searchBudget: {
    maxQueries: number;
    maxFetchPages: number;
    budgetLimitReached: boolean;
  };
}
