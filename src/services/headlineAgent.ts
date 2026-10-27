export interface HeadlineItem {
  id: string;
  tag: string;
  tagColor: string; // '#FF9933' | '#38BDF8' | '#F59E0B' | '#10B981'
  title: string;
  detail: string;
  portal: string;
  url: string;
  category: 'Student' | 'Farmer';
}

export const BASELINE_HEADLINES: HeadlineItem[] = [
  {
    id: 'base-1',
    tag: 'UTTAR PRADESH',
    tagColor: '#FF9933',
    title: 'UP Post-Matric & Pre-Matric Scholarship',
    detail: 'Online registration, institutional verification, and fee reimbursement active for eligible students.',
    portal: 'scholarship.up.gov.in',
    url: 'https://scholarship.up.gov.in/',
    category: 'Student'
  },
  {
    id: 'base-2',
    tag: 'CENTRAL SCHOLARSHIPS',
    tagColor: '#38BDF8',
    title: 'National Scholarship Portal (NSP)',
    detail: 'One-Time Registration (OTR) open for academic session 2025–26 across central ministry scholarships.',
    portal: 'scholarships.gov.in',
    url: 'https://scholarships.gov.in/',
    category: 'Student'
  },
  {
    id: 'base-3',
    tag: 'AGRICULTURE',
    tagColor: '#F59E0B',
    title: 'PM-KISAN Samman Nidhi',
    detail: '₹6,000 annual direct income support released in three equal installments of ₹2,000 to landholding farmers.',
    portal: 'pmkisan.gov.in',
    url: 'https://pmkisan.gov.in/',
    category: 'Farmer'
  },
  {
    id: 'base-4',
    tag: 'GIRL STUDENTS',
    tagColor: '#A855F7',
    title: 'AICTE Pragati Scholarship for Girls',
    detail: '₹50,000 annual financial grant for female students pursuing AICTE-approved technical degrees and diplomas.',
    portal: 'scholarships.gov.in',
    url: 'https://scholarships.gov.in/',
    category: 'Student'
  },
  {
    id: 'base-5',
    tag: 'CROP INSURANCE',
    tagColor: '#10B981',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    detail: 'Comprehensive crop loss protection against natural risks at subsidized premium rates of 1.5% to 2%.',
    portal: 'pmfby.gov.in',
    url: 'https://pmfby.gov.in/',
    category: 'Farmer'
  },
  {
    id: 'base-6',
    tag: 'SOLAR IRRIGATION',
    tagColor: '#F59E0B',
    title: 'PM-KUSUM Solar Agricultural Pumps',
    detail: 'Up to 60%–70% capital subsidies for standalone solar irrigation pump sets (2 HP to 10 HP).',
    portal: 'pmkusum.mnre.gov.in',
    url: 'https://pmkusum.mnre.gov.in/',
    category: 'Farmer'
  },
  {
    id: 'base-7',
    tag: 'HIGHER EDUCATION',
    tagColor: '#38BDF8',
    title: 'Central Sector Scholarship (CSSS)',
    detail: '₹12,000 to ₹20,000 annual merit aid for top 80th percentile Class 12 passed college/university students.',
    portal: 'scholarships.gov.in',
    url: 'https://scholarships.gov.in/',
    category: 'Student'
  },
  {
    id: 'base-8',
    tag: 'FARM CREDIT',
    tagColor: '#10B981',
    title: 'Kisan Credit Card (KCC) Scheme',
    detail: 'Short-term agricultural and allied credit up to ₹3 Lakh at an effective 4% subsidized interest rate.',
    portal: 'pmkisan.gov.in',
    url: 'https://pmkisan.gov.in/',
    category: 'Farmer'
  },
  {
    id: 'base-9',
    tag: 'SCHOOL STUDENTS',
    tagColor: '#A855F7',
    title: 'National Means-cum-Merit Scholarship (NMMSS)',
    detail: '₹12,000 per annum (₹1,000/month) scholarship for meritorious students from Class 9 to Class 12.',
    portal: 'scholarships.gov.in',
    url: 'https://scholarships.gov.in/',
    category: 'Student'
  },
  {
    id: 'base-10',
    tag: 'UP AGRICULTURE',
    tagColor: '#FF9933',
    title: 'Uttar Pradesh Krishi Yantra Subsidy',
    detail: '40% to 50% capital grant on purchase of modern farm machinery, rotavators, and laser levelers.',
    portal: 'upagriculture.com',
    url: 'http://upagriculture.com/',
    category: 'Farmer'
  },
  {
    id: 'base-11',
    tag: 'BIHAR KRISHI',
    tagColor: '#10B981',
    title: 'Bihar Rajya Fasal Sahayata Yojana (BRFSY)',
    detail: '100% free state crop assistance (₹7,500 to ₹10,000/hectare) with zero insurance premium payable by farmers.',
    portal: 'dbtagriculture.bihar.gov.in',
    url: 'https://dbtagriculture.bihar.gov.in/',
    category: 'Farmer'
  }
];

const CACHE_KEY = 'ai_exhibition_headlines_cache_v4';
const CACHE_TIMESTAMP_KEY = 'ai_exhibition_headlines_timestamp_v3';
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function isStrictStudentOrFarmer(hl: HeadlineItem): boolean {
  const text = `${hl.tag} ${hl.title} ${hl.detail}`.toLowerCase();
  // Exclude non-student and non-farmer programs
  if (/ayushman|pm-jay|ration|garib kalyan|anna yojana|mudra|housing|pmay|awas/i.test(text)) {
    return false;
  }
  // Include if matches student or farmer keywords
  return /scholarship|matric|student|study|pragati|csss|nmmss|kisan|farmer|krishi|fasal|pmfby|kusum|bima|kcc/i.test(text);
}

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
        if (Array.isArray(parsed) && parsed.length >= 4) {
          const validOnly = parsed.filter(isStrictStudentOrFarmer);
          if (validOnly.length >= 4) {
            return {
              headlines: validOnly,
              source: 'cache',
              keyUsed: 'Cached Live Feed'
            };
          }
        }
      }
    }
  } catch {}

  // Call server-side API endpoint
  try {
    const res = await fetch('/api/headlines', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.headlines) && data.headlines.length > 0) {
        const studentFarmerOnly = data.headlines
          .map((item: any) => ({
            ...item,
            url: item.url || (item.portal ? (item.portal.startsWith('http') ? item.portal : `https://${item.portal}`) : 'https://scholarships.gov.in/'),
            category: item.category || (/farmer|kisan|krishi|fasal|bima|kusum/i.test(`${item.tag} ${item.title}`) ? 'Farmer' : 'Student')
          }))
          .filter(isStrictStudentOrFarmer);

        const finalList = studentFarmerOnly.length >= 4 ? studentFarmerOnly : BASELINE_HEADLINES;

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(finalList));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch {}

        return {
          headlines: finalList,
          source: data.source || 'ai-live',
          keyUsed: data.keyUsed || 'Server Telemetry'
        };
      }
    }
  } catch (err) {
    console.warn('Headline fetch fallback to verified student & farmer baseline:', err);
  }

  return {
    headlines: BASELINE_HEADLINES,
    source: 'baseline',
    keyUsed: 'Verified Student & Farmer Baseline'
  };
}
