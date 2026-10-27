export interface HeadlineItem {
  id: string;
  tag: string;
  tagColor: string;
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
    detail: 'Online registration, institutional verification, and fee reimbursement active on scholarship.up.gov.in.',
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

function isStrictStudentOrFarmer(hl: any): boolean {
  const text = `${hl.tag || ''} ${hl.title || ''} ${hl.detail || ''}`.toLowerCase();
  if (/ayushman|pm-jay|ration|garib kalyan|anna yojana|mudra|housing|pmay|awas/i.test(text)) {
    return false;
  }
  return /scholarship|matric|student|study|pragati|csss|nmmss|kisan|farmer|krishi|fasal|pmfby|kusum|bima|kcc/i.test(text);
}

async function callOpenRouterChat(options: {
  messages: { role: string; content: string }[];
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  const timeoutMs = options.timeoutMs || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
        'HTTP-Referer': 'https://yojnamitra2026.vercel.app',
        'X-Title': 'YojanaMitra'
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.15,
        max_tokens: options.maxTokens ?? 2000,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return { text: content, modelUsed: data?.model || model };
  } finally {
    clearTimeout(timer);
  }
}

let cachedHeadlines: { data: HeadlineItem[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check cache
  if (cachedHeadlines && Date.now() < cachedHeadlines.expiresAt) {
    return res.status(200).json({
      headlines: cachedHeadlines.data,
      source: 'cache',
      keyUsed: 'Cached Server Feed'
    });
  }

  const key = (process.env.OPENROUTER_API_KEY || '').trim();

  if (!key) {
    return res.status(200).json({
      headlines: BASELINE_HEADLINES,
      source: 'baseline',
      keyUsed: 'Verified Student & Farmer Baseline'
    });
  }

  const prompt = `You are a Senior Public Information Officer for Government of India Citizen Schemes.
Write 8 to 10 verified, authentic, currently active updates EXCLUSIVELY for Student Scholarships and Farmer / Agricultural Welfare Schemes for the ticker.
DO NOT include health, business/MSME loans, food ration, or housing.
Focus ONLY on:
1. Student Scholarships: National Scholarship Portal (NSP), UP Post-Matric & Pre-Matric Scholarship, AICTE Pragati Scholarship for Girls, Central Sector Scholarship (CSSS), National Means-cum-Merit Scholarship (NMMSS).
2. Farmer & Agriculture: PM-KISAN Samman Nidhi, Pradhan Mantri Fasal Bima Yojana (PMFBY), PM-KUSUM Solar Pumps, Kisan Credit Card (KCC), UP Krishi Yantra Subsidy, Bihar Rajya Fasal Sahayata (BRFSY).

Format strictly as JSON:
{
  "headlines": [
    {
      "id": "hl-1",
      "tag": "UTTAR PRADESH",
      "tagColor": "#FF9933",
      "title": "UP Post-Matric Scholarship",
      "detail": "Online registration and Aadhaar-linked verification currently open for students on scholarship.up.gov.in.",
      "portal": "scholarship.up.gov.in",
      "url": "https://scholarship.up.gov.in/",
      "category": "Student"
    }
  ]
}`;

  try {
    const { text, modelUsed } = await callOpenRouterChat({
      messages: [
        { role: 'system', content: 'Output strictly valid JSON matching schema.' },
        { role: 'user', content: prompt }
      ],
      apiKey: key,
      temperature: 0.15,
      maxTokens: 2000,
      timeoutMs: 20000
    });

    let cleanJson = text.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleanJson);
    const list: any[] = Array.isArray(parsed) ? parsed : (parsed.headlines || []);

    if (list && list.length >= 4) {
      const formatted: HeadlineItem[] = list
        .map((item, i) => {
          const isFarmer = /farmer|kisan|krishi|fasal|bima|kusum|agriculture|crop/i.test(`${item.tag} ${item.title} ${item.detail}`);
          const defaultUrl = isFarmer
            ? (/kusum/i.test(item.title) ? 'https://pmkusum.mnre.gov.in/' : /bima|pmfby/i.test(item.title) ? 'https://pmfby.gov.in/' : 'https://pmkisan.gov.in/')
            : (/up/i.test(item.tag) ? 'https://scholarship.up.gov.in/' : 'https://scholarships.gov.in/');
          return {
            id: item.id || `hl-live-${i}-${Date.now()}`,
            tag: item.tag || (isFarmer ? 'AGRICULTURE' : 'SCHOLARSHIP'),
            tagColor: item.tagColor || (isFarmer ? '#10B981' : '#38BDF8'),
            title: item.title || 'Government Scheme',
            detail: item.detail || 'Active national welfare scheme.',
            portal: item.portal || (isFarmer ? 'pmkisan.gov.in' : 'scholarships.gov.in'),
            url: item.url || (item.portal ? (item.portal.startsWith('http') ? item.portal : `https://${item.portal}`) : defaultUrl),
            category: (isFarmer ? 'Farmer' : 'Student') as 'Student' | 'Farmer'
          };
        })
        .filter(isStrictStudentOrFarmer);

      const outputList = formatted.length >= 4 ? formatted : BASELINE_HEADLINES;

      cachedHeadlines = {
        data: outputList,
        expiresAt: Date.now() + CACHE_TTL_MS
      };

      return res.status(200).json({
        headlines: outputList,
        source: 'ai-live',
        keyUsed: `OpenRouter (${modelUsed})`
      });
    }
  } catch (err) {
    console.warn('OpenRouter headline generation failed; using verified student & farmer baseline:', err);
  }

  return res.status(200).json({
    headlines: BASELINE_HEADLINES,
    source: 'baseline',
    keyUsed: 'Verified Student & Farmer Baseline'
  });
}
