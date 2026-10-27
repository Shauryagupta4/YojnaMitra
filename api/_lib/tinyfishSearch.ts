import { isValidPublicUrl } from './validation';
import {
  CENTRAL_OFFICIAL_DOMAINS,
  STATE_OFFICIAL_DOMAINS,
  STATE_METADATA_MAP,
  normalizeStateName,
  IndianStateOrUT
} from './states';
import { classifySource } from './sourceVerification';

export interface TinyFishSearchResultItem {
  position: number;
  site_name: string;
  title: string;
  snippet: string;
  url: string;
  isOfficial: boolean;
  isSecondary?: boolean;
  isCommercial?: boolean;
  searchScope: 'central' | 'state';
  stateName?: string;
  sourceDomain?: string;
}

export interface TinyFishSearchResponse {
  query: string;
  results?: Array<{
    position: number;
    site_name: string;
    title: string;
    snippet: string;
    url: string;
  }>;
  total_results?: number;
  page?: number;
  error?: string;
}

export interface SearchBudgetConfig {
  maxQueries?: number;
  maxFetchPages?: number;
  timeoutMs?: number;
  enablePagination?: boolean;
}

export interface TinyFishSearchDiscoveryResult {
  items: TinyFishSearchResultItem[];
  centralItemsCount: number;
  stateItemsCount: number;
  errors: string[];
  queriesAttempted: string[];
  queriesRun: number;
  uniqueUrlsCount: number;
  uniqueDomains: string[];
  officialCount: number;
  secondaryCount: number;
  commercialCount: number;
  budgetLimitReached: boolean;
}

/**
 * Determine whether a URL belongs to an official government or statutory authority.
 * Powered by shared nationwide classification engine.
 */
export function isOfficialGovernmentUrl(urlStr: string, stateName?: string): boolean {
  const res = classifySource(urlStr, stateName);
  return res.isOfficial;
}

/**
 * Classify a domain into official_government, reputable_secondary, or commercial_or_bank.
 */
export function classifySourceUrl(urlStr: string, stateName?: string): {
  isOfficial: boolean;
  isSecondary: boolean;
  isCommercial: boolean;
  domain: string;
} {
  const res = classifySource(urlStr, stateName);
  return {
    isOfficial: res.isOfficial,
    isSecondary: res.isSecondary,
    isCommercial: res.isCommercial,
    domain: res.domain
  };
}

/**
 * Build tailored central & state search queries based on state, persona, and optional user query.
 * Generates distinct queries covering central flagships, state departments, directories,
 * application portals, notifications, and common scheme abbreviations/aliases.
 * Fully shared nationwide architecture — applies dynamically to all 28 states and 8 UTs.
 */
export function buildSearchQueries(
  state: string,
  persona: 'student' | 'farmer' | 'citizen' | 'business',
  customQuery?: string
): Array<{ query: string; scope: 'central' | 'state'; description?: string }> {
  const normState = normalizeStateName(state);
  const isAllIndia = !normState || normState === 'All India / Central';
  const queries: Array<{ query: string; scope: 'central' | 'state'; description?: string }> = [];

  const stateMeta = (!isAllIndia && normState) ? STATE_METADATA_MAP[normState as IndianStateOrUT] : null;

  // ==========================================
  // 1. BUSINESS & MSME
  // ==========================================
  if (persona === 'business') {
    queries.push({
      query: `site:myscheme.gov.in OR site:udyamimitra.in central MSME loan subsidy scheme 2025 2026`,
      scope: 'central',
      description: 'Central MSME scheme directory'
    });
    queries.push({
      query: `Pradhan Mantri Mudra Yojana PMMY PMEGP Stand-Up India CGTMSE MSME business credit loan 2025 2026`,
      scope: 'central',
      description: 'Central flagship MSME credit schemes and aliases'
    });
    queries.push({
      query: `PM Vishwakarma PM SVANidhi micro enterprise credit subsidy portal .gov.in`,
      scope: 'central',
      description: 'Central artisan and vendor micro-enterprise loans'
    });

    if (!isAllIndia && normState) {
      // Dynamic state queries based on verified state metadata
      const apexPortal = stateMeta?.knownApexDomains?.[0] || `${normState.toLowerCase().replace(/\s+/g, '')}.gov.in`;
      const deptDesc = stateMeta?.departments?.msme || `${normState} Directorate of Industries`;

      queries.push({
        query: `site:${apexPortal} Chief Minister employment generation MSME subsidy scheme`,
        scope: 'state',
        description: `${normState} official MSME portal`
      });
      queries.push({
        query: `"${normState}" ${deptDesc} self employment loan subsidy scheme guidelines .gov.in`,
        scope: 'state',
        description: `${normState} Industries Department guidelines`
      });
      queries.push({
        query: `"${normState}" MSME business loan application portal registration circular 2025 2026`,
        scope: 'state',
        description: `${normState} active scheme notifications`
      });
    }
  }

  // ==========================================
  // 2. STUDENT & SCHOLARSHIPS
  // ==========================================
  else if (persona === 'student') {
    queries.push({
      query: `site:scholarships.gov.in post matric scholarship 2025 2026 OTR`,
      scope: 'central',
      description: 'National Scholarship Portal official portal'
    });
    queries.push({
      query: `site:buddy4study.com "National Scholarship Portal" NSP Central Sector Scheme AICTE Pragati`,
      scope: 'central',
      description: 'Buddy4Study verified National Scholarship Portal directory'
    });
    queries.push({
      query: `site:buddy4study.com national scholarship 2025 2026 college student eligibility`,
      scope: 'central',
      description: 'Buddy4Study active national & CSR scholarships'
    });

    if (!isAllIndia && normState) {
      const apexPortal = stateMeta?.knownApexDomains?.[0] || `${normState.toLowerCase().replace(/\s+/g, '')}.gov.in`;

      if (normState === 'Uttar Pradesh') {
        queries.push({
          query: `UP Scholarship 2025 2026 scholarship.up.gov.in online registration`,
          scope: 'state',
          description: `Uttar Pradesh official scholarship application portal`
        });
        queries.push({
          query: `site:buddy4study.com "UP Scholarship" 2025 2026 post matric eligibility last date`,
          scope: 'state',
          description: `Buddy4Study UP scholarship verified directory`
        });
        queries.push({
          query: `UP post matric scholarship fee reimbursement 2025 2026 scholarship.up.gov.in`,
          scope: 'state',
          description: `UP Post-Matric scholarship & fee reimbursement`
        });
      } else {
        queries.push({
          query: `"${normState}" post matric scholarship online application 2025 2026 ${apexPortal}`,
          scope: 'state',
          description: `${normState} official scholarship portal`
        });
        queries.push({
          query: `site:buddy4study.com "${normState}" scholarship 2025 2026 eligibility application`,
          scope: 'state',
          description: `Buddy4Study ${normState} active scholarships`
        });
        queries.push({
          query: `"${normState}" scholarship scheme tuition fee reimbursement students 2025 2026`,
          scope: 'state',
          description: `${normState} department scholarship schemes`
        });
      }
    }
  }

  // ==========================================
  // 3. FARMER & AGRICULTURE
  // ==========================================
  else if (persona === 'farmer') {
    queries.push({
      query: `site:pmkisan.gov.in OR site:pmfby.gov.in central farmer welfare schemes DBT subsidy`,
      scope: 'central',
      description: 'Central farmer DBT portals'
    });
    queries.push({
      query: `Pradhan Mantri Kisan Samman Nidhi PM-KISAN PMFBY Kisan Credit Card KCC subsidy 2025 2026`,
      scope: 'central',
      description: 'Central agriculture flagships and credit'
    });

    if (!isAllIndia && normState) {
      const deptDesc = stateMeta?.departments?.agriculture || `${normState} Agriculture Department`;

      queries.push({
        query: `"${normState}" ${deptDesc} farmer welfare financial assistance subsidy scheme .gov.in`,
        scope: 'state',
        description: `${normState} agriculture department schemes`
      });
      queries.push({
        query: `"${normState}" kisan direct benefit transfer krishi scheme crop insurance guidelines 2025 2026`,
        scope: 'state',
        description: `${normState} krishi DBT & insurance`
      });
      queries.push({
        query: `"${normState}" farmer subsidy equipment micro irrigation solar pump application portal`,
        scope: 'state',
        description: `${normState} farmer equipment & irrigation subsidy`
      });
    }
  }

  // ==========================================
  // 4. CITIZEN & GENERAL WELFARE
  // ==========================================
  else {
    queries.push({
      query: `site:beneficiary.nha.gov.in OR site:nfsa.gov.in OR site:pmaymis.gov.in central welfare schemes`,
      scope: 'central',
      description: 'Central health, food, and housing portals'
    });
    queries.push({
      query: `Ayushman Bharat PM-JAY PMAY PM Garib Kalyan Anna Yojana citizen subsidy DBT 2025 2026`,
      scope: 'central',
      description: 'Central social security flagships'
    });

    if (!isAllIndia && normState) {
      const deptDesc = stateMeta?.departments?.socialWelfare || `${normState} Social Welfare Department`;

      queries.push({
        query: `"${normState}" ${deptDesc} citizen pension health insurance ration scheme .gov.in`,
        scope: 'state',
        description: `${normState} social welfare department`
      });
      queries.push({
        query: `"${normState}" women child development family financial assistance scheme guidelines .gov.in`,
        scope: 'state',
        description: `${normState} women & child welfare`
      });
      queries.push({
        query: `"${normState}" citizen welfare DBT application portal registration 2025 2026`,
        scope: 'state',
        description: `${normState} citizen welfare application portal`
      });
    }
  }

  // ==========================================
  // 5. USER FOCUS QUERY (if provided)
  // ==========================================
  if (customQuery && customQuery.trim().length > 1) {
    const qClean = customQuery.trim().slice(0, 80);
    queries.unshift({
      query: `${qClean} 2025 2026 online portal registration`,
      scope: isAllIndia ? 'central' : 'state',
      description: 'User-specified focus query'
    });
  }

  return queries;
}

/**
 * Execute a single TinyFish search query with timeout and pagination support.
 */
export async function executeTinyFishSearch(
  query: string,
  apiKey: string,
  page: number = 1,
  timeoutMs: number = 10000
): Promise<TinyFishSearchResponse> {
  const pageParam = page > 1 ? `&page=${page}` : '';
  const url = `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&location=IN${pageParam}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        query,
        page,
        error: `TinyFish Search HTTP ${res.status}: ${errText.slice(0, 150)}`
      };
    }

    const data: TinyFishSearchResponse = await res.json();
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    return {
      query,
      page,
      error: `TinyFish Search failed: ${err?.message || 'timeout/network error'}`
    };
  }
}

/**
 * Run discovery across Central and State portals with configurable budget, pagination,
 * and robust error isolation.
 */
export async function runTinyFishSchemeDiscovery(params: {
  state: string;
  persona: 'student' | 'farmer' | 'citizen' | 'business';
  customQuery?: string;
  apiKey?: string;
  budget?: SearchBudgetConfig;
}): Promise<TinyFishSearchDiscoveryResult> {
  const apiKey = typeof params.apiKey === 'string' ? params.apiKey : (process.env.TINYFISH_API_KEY || '');
  if (!apiKey) {
    return {
      items: [],
      centralItemsCount: 0,
      stateItemsCount: 0,
      errors: ['TINYFISH_API_KEY is not configured on the server.'],
      queriesAttempted: [],
      queriesRun: 0,
      uniqueUrlsCount: 0,
      uniqueDomains: [],
      officialCount: 0,
      secondaryCount: 0,
      commercialCount: 0,
      budgetLimitReached: false
    };
  }

  const budgetConfig: Required<SearchBudgetConfig> = {
    maxQueries: params.budget?.maxQueries ?? 6,
    maxFetchPages: params.budget?.maxFetchPages ?? 8,
    timeoutMs: params.budget?.timeoutMs ?? 11000,
    enablePagination: params.budget?.enablePagination ?? true
  };

  const allQueries = buildSearchQueries(params.state, params.persona, params.customQuery);
  const plannedQueries = allQueries.slice(0, budgetConfig.maxQueries);
  const budgetLimitReached = allQueries.length > budgetConfig.maxQueries;

  const errors: string[] = [];
  const queriesAttempted: string[] = [];
  let queriesRunCount = 0;
  const rawResults: Array<{ scope: 'central' | 'state'; data: TinyFishSearchResponse }> = [];

  // Execute all planned queries concurrently in parallel for ultra-fast latency (1-2s total)
  const settled = await Promise.allSettled(
    plannedQueries.map(async q => {
      queriesAttempted.push(q.query);
      queriesRunCount++;
      const res = await executeTinyFishSearch(q.query, apiKey, 1, Math.min(6000, budgetConfig.timeoutMs));
      return { scope: q.scope, data: res, originalQuery: q.query };
    })
  );

  for (const s of settled) {
    if (s.status === 'fulfilled') {
      if (s.value.data.error) {
        errors.push(s.value.data.error);
      }
      rawResults.push({ scope: s.value.scope, data: s.value.data });
    } else {
      errors.push(`Search query failure: ${s.reason}`);
    }
  }

  // Deduplicate URLs and classify source domains
  const seenUrls = new Set<string>();
  const items: TinyFishSearchResultItem[] = [];
  const domainSet = new Set<string>();
  let officialCount = 0;
  let secondaryCount = 0;
  let commercialCount = 0;

  for (const { scope, data } of rawResults) {
    if (!data.results || !Array.isArray(data.results)) continue;
    for (const item of data.results) {
      if (!item.url || !isValidPublicUrl(item.url)) continue;
      const normalizedUrl = item.url.split('#')[0].replace(/\/$/, '');
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);

      const classification = classifySourceUrl(item.url, params.state);
      domainSet.add(classification.domain);

      if (classification.isOfficial) officialCount++;
      else if (classification.isSecondary) secondaryCount++;
      else if (classification.isCommercial) commercialCount++;

      items.push({
        position: item.position || items.length + 1,
        site_name: item.site_name || '',
        title: item.title || '',
        snippet: item.snippet || '',
        url: item.url,
        isOfficial: classification.isOfficial,
        isSecondary: classification.isSecondary,
        isCommercial: classification.isCommercial,
        searchScope: scope,
        stateName: scope === 'state' ? params.state : undefined,
        sourceDomain: classification.domain
      });
    }
  }

  // Sort: Official domains first, then secondary, commercial last, and by position
  items.sort((a, b) => {
    const scoreA = a.isOfficial ? 3 : a.isSecondary ? 2 : a.isCommercial ? 0 : 1;
    const scoreB = b.isOfficial ? 3 : b.isSecondary ? 2 : b.isCommercial ? 0 : 1;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return a.position - b.position;
  });

  const centralItemsCount = items.filter(i => i.searchScope === 'central').length;
  const stateItemsCount = items.filter(i => i.searchScope === 'state').length;

  return {
    items,
    centralItemsCount,
    stateItemsCount,
    errors,
    queriesAttempted,
    queriesRun: queriesRunCount,
    uniqueUrlsCount: seenUrls.size,
    uniqueDomains: Array.from(domainSet),
    officialCount,
    secondaryCount,
    commercialCount,
    budgetLimitReached
  };
}
