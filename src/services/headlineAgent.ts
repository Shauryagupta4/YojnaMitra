export interface HeadlineItem {
  id: string;
  tag: string;
  tagColor: string; // '#00F5D4' | '#FFE600' | '#38BDF8'
  title: string;
  detail: string;
  portal: string;
}

export const BASELINE_HEADLINES: HeadlineItem[] = [
  {
    id: 'base-1',
    tag: 'UTTAR PRADESH',
    tagColor: '#FF9933',
    title: 'UP Post-Matric & Pre-Matric Scholarship',
    detail: 'Online registration and verification currently active for eligible students on scholarship.up.gov.in.',
    portal: 'scholarship.up.gov.in'
  },
  {
    id: 'base-2',
    tag: 'CENTRAL SCHOLARSHIPS',
    tagColor: '#38BDF8',
    title: 'National Scholarship Portal (NSP)',
    detail: 'One-Time Registration (OTR) is open for academic session 2025–26 across central ministry schemes.',
    portal: 'scholarships.gov.in'
  },
  {
    id: 'base-3',
    tag: 'HEALTHCARE',
    tagColor: '#10B981',
    title: 'Ayushman Bharat (PM-JAY)',
    detail: 'Free treatment cover up to ₹5 Lakh/year per family; e-KYC and golden card downloads active on beneficiary.nha.gov.in.',
    portal: 'beneficiary.nha.gov.in'
  },
  {
    id: 'base-4',
    tag: 'AGRICULTURE',
    tagColor: '#F59E0B',
    title: 'PM-KISAN Samman Nidhi',
    detail: '₹6,000 annual direct income support released in three installments for verified landholding farmers.',
    portal: 'pmkisan.gov.in'
  },
  {
    id: 'base-5',
    tag: 'HIGHER EDUCATION',
    tagColor: '#A855F7',
    title: 'AICTE Pragati Scholarship for Girls',
    detail: '₹50,000 annual assistance for female students pursuing recognized technical degree and diploma courses.',
    portal: 'scholarships.gov.in'
  },
  {
    id: 'base-6',
    tag: 'FOOD & RATION',
    tagColor: '#10B981',
    title: 'PM Garib Kalyan Anna Yojana',
    detail: 'Free monthly foodgrain entitlement continuing nationwide under the National Food Security Act.',
    portal: 'nfsa.gov.in'
  },
  {
    id: 'base-7',
    tag: 'MSME & BUSINESS',
    tagColor: '#38BDF8',
    title: 'PM Mudra Yojana (Tarun Plus)',
    detail: 'Collateral-free business credit limit increased to ₹20 Lakh for growing micro-enterprises and small shops.',
    portal: 'udyamimitra.in'
  },
  {
    id: 'base-8',
    tag: 'HOUSING',
    tagColor: '#FF9933',
    title: 'PM Awas Yojana (PMAY 2.0)',
    detail: 'Financial subsidies and interest relief available for constructing permanent pucca homes in urban and rural areas.',
    portal: 'pmaymis.gov.in'
  },
  {
    id: 'base-9',
    tag: 'FARM INSURANCE',
    tagColor: '#F59E0B',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    detail: 'Crop loss protection available at nominal premium rates (1.5% to 2%) directly through pmfby.gov.in.',
    portal: 'pmfby.gov.in'
  }
];

const CACHE_KEY = 'ai_exhibition_headlines_cache_v3';
const CACHE_TIMESTAMP_KEY = 'ai_exhibition_headlines_timestamp_v2';
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

export async function fetchLiveNationalHeadlines(): Promise<{
  headlines: HeadlineItem[];
  source: 'ai-live' | 'cache' | 'baseline';
  keyUsed: string;
}> {
  // Check memory / local storage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (cached && cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return {
            headlines: parsed,
            source: 'cache',
            keyUsed: 'Cached Live Feed'
          };
        }
      }
    }
  } catch {}

  // Call server-side API endpoint (No client-side secrets)
  try {
    const res = await fetch('/api/headlines', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.headlines) && data.headlines.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.headlines));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch {}

        return {
          headlines: data.headlines,
          source: data.source || 'ai-live',
          keyUsed: data.keyUsed || 'Server Telemetry'
        };
      }
    }
  } catch (err) {
    console.warn('Headline fetch fallback to verified baseline:', err);
  }

  return {
    headlines: BASELINE_HEADLINES,
    source: 'baseline',
    keyUsed: 'Verified National Baseline'
  };
}
