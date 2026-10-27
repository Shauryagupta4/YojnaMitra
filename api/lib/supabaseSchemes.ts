import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CanonicalScheme, SchemeLevel, SchemeSearchResponse } from './types';
import { classifyCandidate } from './validation';

let cachedClient: SupabaseClient | null = null;

function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  // Use service role key if available for administrative write access, else anon key
  const key = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase Schemes] Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Generate a deterministic ID for a scheme to prevent duplicates
 */
function generateSchemeId(name: string, state: string | null): string {
  const cleanName = (name || 'scheme')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  const cleanState = (state || 'central').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanState}_${cleanName}`;
}

/**
 * Parse a deadline date string or return null
 */
export function extractSchemeDeadline(deadlineStr?: string | null): string | null {
  if (!deadlineStr || typeof deadlineStr !== 'string') return null;

  const trimmed = deadlineStr.trim();
  if (/no expiry|ongoing|open all year|round the year|always open/i.test(trimmed)) {
    return null;
  }

  // Check ISO format YYYY-MM-DD
  const isoMatch = trimmed.match(/\b(202\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return new Date(isoMatch[0]).toISOString();
  }

  // Check DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = trimmed.match(/\b(0?[1-9]|[12]\d|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](202\d)\b/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const d = new Date(Date.UTC(year, month, day, 23, 59, 59));
    return d.toISOString();
  }

  // Try standard parse
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  return null;
}

export interface SupabaseFetchParams {
  state: string;
  persona?: string;
  query?: string;
  category?: string;
}

/**
 * Fetch currently active, non-expired schemes from Supabase
 */
export async function fetchActiveSchemesFromSupabase(
  params: SupabaseFetchParams
): Promise<CanonicalScheme[] | null> {
  const sb = getSupabaseServerClient();
  if (!sb) return null;

  try {
    const normState = params.state.trim();
    const nowIso = new Date().toISOString();

    // Query schemes for the requested state or Central/India (STRICTLY VERIFIED ONLY)
    let query = sb
      .from('live_schemes')
      .select('*')
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .or(`deadline.is.null,deadline.gte.${nowIso}`);

    // If state is not All India, match either the specific state or India/Central
    if (normState && normState.toLowerCase() !== 'india' && normState.toLowerCase() !== 'all india') {
      query = query.or(`state.ilike.%${normState}%,state.ilike.%India%,state.ilike.%Central%`);
    }

    if (params.persona && params.persona !== 'unselected') {
      query = query.or(`persona.eq.${params.persona},persona.eq.all,persona.is.null`);
    }

    const { data, error } = await query.order('last_verified_at', { ascending: false }).limit(25);

    if (error) {
      console.warn('[Supabase Schemes] Query warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Filter out rows that are not genuine schemes (strictly exclude articles, news, portals, guidelines)
    const validRows = data.filter((row: any) => {
      const name = row.title || row.raw_data?.name || '';
      const url = row.official_portal || row.source_url || row.raw_data?.officialUrl || '';
      const desc = row.description || row.raw_data?.description || '';
      return classifyCandidate(name, url, desc) === 'individual_scheme';
    });

    if (validRows.length === 0) {
      return null;
    }

    // Map records to CanonicalScheme objects
    const schemes: CanonicalScheme[] = validRows.map((row: any) => {
      if (row.raw_data && row.raw_data.name) {
        return {
          ...row.raw_data,
          lastVerified: row.last_verified_at || row.updated_at || new Date().toISOString()
        };
      }

      const schemeLevel: SchemeLevel = (row.state && row.state.toLowerCase() !== 'india' && row.state.toLowerCase() !== 'central')
        ? 'State'
        : 'Central';

      return {
        id: row.id,
        name: row.title,
        description: row.description || '',
        benefits: row.benefit_text || 'Financial assistance as per official guidelines.',
        benefitAmountApprox: row.approx_amount ? Number(row.approx_amount) : undefined,
        category: row.category || 'Education',
        state: row.state,
        level: schemeLevel,
        eligibility: {
          status: 'potentially_eligible',
          criteriaSummary: row.eligibility_criteria || [],
          reasons: []
        },
        requiredDocuments: ['Aadhaar Card', 'Domicile Certificate', 'Income Certificate'],
        officialUrl: row.official_portal || row.source_url || 'https://www.myscheme.gov.in',
        applicationUrl: row.application_url || row.source_url || null,
        portalName: row.official_portal ? new URL(row.official_portal).hostname : 'Official Portal',
        sourceUrls: [row.source_url || row.application_url].filter(Boolean),
        deadline: row.deadline || null,
        deadlineStatus: row.deadline ? 'open' : 'open',
        evidenceStatus: 'officially_verified',
        verificationStatus: (row.verification_status as any) || 'verified',
        sourceType: 'live_retrieval',
        lastVerified: row.last_verified_at || row.updated_at || new Date().toISOString(),
        matchScore: 95
      };
    });

    // Optional query text filter
    if (params.query && params.query.trim().length > 2) {
      const q = params.query.toLowerCase().trim();
      const filtered = schemes.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        (s.officialUrl && s.officialUrl.toLowerCase().includes(q))
      );
      if (filtered.length > 0) return filtered;
    }

    return schemes;
  } catch (err: any) {
    console.warn('[Supabase Schemes] Fetch error:', err?.message || err);
    return null;
  }
}

/**
 * Upsert discovered schemes from TinyFish/Firecrawl into Supabase.
 * STRICT GUARD: Only officially verified schemes are EVER persisted.
 * Unverified candidates, rejected blogs, or partial matches are excluded.
 */
export async function saveDiscoveredSchemesToSupabase(
  schemes: CanonicalScheme[],
  state: string,
  persona: string
): Promise<{ inserted: number; errors: number }> {
  const sb = getSupabaseServerClient();
  if (!sb || !schemes || schemes.length === 0) {
    return { inserted: 0, errors: 0 };
  }

  // Filter out any unverified candidate, partially verified records, or non-scheme candidates
  const verifiedOnly = schemes.filter(
    s => s.verificationStatus === 'verified' && classifyCandidate(s.name, s.officialUrl, s.description) === 'individual_scheme'
  );
  if (verifiedOnly.length === 0) {
    return { inserted: 0, errors: 0 };
  }

  try {
    const rows = verifiedOnly.map(s => {
      const id = generateSchemeId(s.name, s.state || state);
      const deadline = extractSchemeDeadline(s.deadline);

      return {
        id,
        title: s.name,
        state: s.state || state || 'India',
        persona: persona || 'all',
        category: s.category || 'Education',
        description: s.description || '',
        benefit_text: s.benefits || '',
        benefit_type: s.benefitType || 'grant',
        approx_amount: s.benefitAmountApprox || null,
        eligibility_criteria: s.eligibility?.criteriaSummary || [],
        application_url: s.applicationUrl || null,
        official_portal: s.officialUrl || null,
        source_url: s.sourceUrls?.[0] || s.officialUrl || '',
        deadline: deadline || null,
        is_active: true,
        verification_status: s.verificationStatus || 'verified',
        raw_data: s,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    const { data, error } = await sb
      .from('live_schemes')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.warn('[Supabase Schemes] Upsert error:', error.message);
      return { inserted: 0, errors: rows.length };
    }

    return { inserted: data ? data.length : rows.length, errors: 0 };
  } catch (err: any) {
    console.warn('[Supabase Schemes] Upsert exception:', err?.message || err);
    return { inserted: 0, errors: 1 };
  }
}
