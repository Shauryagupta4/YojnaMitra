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
    tag: 'ACTIVE AY 2025-26',
    tagColor: '#00F5D4',
    title: 'National Scholarship Portal (NSP / PM-USP)',
    detail: 'Central OTR Registration Live on scholarships.gov.in (Full Tuition Fee Reimbursement + Maintenance Allowance for SC/ST/OBC)',
    portal: 'scholarships.gov.in'
  },
  {
    id: 'base-2',
    tag: 'ACTIVE // NO EXPIRY',
    tagColor: '#FFE600',
    title: 'Ayushman Bharat PM-JAY',
    detail: '₹5,00,000/yr Free Cashless Secondary & Tertiary Hospitalization across 29,000+ Empanelled Hospitals (Instant Golden Card eKYC)',
    portal: 'beneficiary.nha.gov.in'
  },
  {
    id: 'base-3',
    tag: 'ACTIVE AY 2025-26',
    tagColor: '#00F5D4',
    title: 'AICTE Pragati & Saksham Schemes',
    detail: '₹50,000/annum Direct Financial Assistance for Girls and Specially-Abled in Technical Degree/Diploma',
    portal: 'scholarships.gov.in'
  },
  {
    id: 'base-4',
    tag: 'ACTIVE 2025–2026',
    tagColor: '#FFE600',
    title: 'PM-KISAN Samman Nidhi',
    detail: 'Guaranteed ₹6,000/yr Direct Benefit Transfer (DBT) in 3 equal tranches for all landholding farmers',
    portal: 'pmkisan.gov.in'
  },
  {
    id: 'base-5',
    tag: 'ACTIVE THROUGH 2028',
    tagColor: '#00F5D4',
    title: 'PM Garib Kalyan Anna Yojana (NFSA)',
    detail: '5kg Free Monthly Foodgrains Extended Nationwide under One Nation One Ration Card',
    portal: 'nfsa.gov.in'
  },
  {
    id: 'base-6',
    tag: 'ACTIVE 2025–2026',
    tagColor: '#FFE600',
    title: 'Pradhan Mantri Mudra Yojana (PMMY)',
    detail: 'Collateral-Free Business Loans with Newly Enhanced ₹20 Lakh Limit under Tarun Plus',
    portal: 'udyamimitra.in'
  },
  {
    id: 'base-7',
    tag: 'ACTIVE AY 2025-26',
    tagColor: '#00F5D4',
    title: 'Central Sector Scheme (CSSS)',
    detail: 'Direct Merit Scholarships (₹12,000 - ₹20,000/yr) for College & University Undergraduates & Postgraduates',
    portal: 'scholarships.gov.in'
  },
  {
    id: 'base-8',
    tag: 'ACTIVE 2025–2026',
    tagColor: '#FFE600',
    title: 'PMAY 2.0 Housing Subsidy',
    detail: 'Direct Financial Assistance of ₹1.2L to ₹2.67L for Construction of 3 Crore New Pucca Houses',
    portal: 'pmaymis.gov.in'
  },
  {
    id: 'base-9',
    tag: 'ACTIVE KHARIF & RABI',
    tagColor: '#00F5D4',
    title: 'PMFBY Crop Insurance & KCC',
    detail: 'Comprehensive Crop Cover at 1.5%-2% Premium + 4% Subsidized Agri Credit on pmfby.gov.in',
    portal: 'pmfby.gov.in'
  }
];

const CACHE_KEY = 'ai_exhibition_headlines_cache_v2';
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
