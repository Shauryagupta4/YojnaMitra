export interface HeadlineItem {
  id: string;
  tag: string;
  tagColor: string;
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
  }
];

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
      keyUsed: 'Verified National Baseline'
    });
  }

  const prompt = `You are a Senior Editor at India's National Public Information Bureau.
Write 8 to 10 verified, authentic, currently active Central and State scheme/scholarship updates for a live public information ticker.
Write in clear, professional, human editorial language — absolutely no robotic jargon like "ACTIVE // NO EXPIRY", "telemetry", or repetitive acronym dumps.
Focus on real current programs: UP Scholarship, National Scholarship Portal (NSP), Ayushman Bharat, PM-KISAN, AICTE Pragati, PM Mudra Yojana, NFSA, PMAY.

Format strictly as JSON:
{
  "headlines": [
    {
      "id": "hl-1",
      "tag": "UTTAR PRADESH",
      "tagColor": "#FF9933",
      "title": "UP Post-Matric Scholarship",
      "detail": "Online registration and Aadhaar-linked verification currently open for students on scholarship.up.gov.in.",
      "portal": "scholarship.up.gov.in"
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
      const formatted: HeadlineItem[] = list.map((item, i) => ({
        id: item.id || `hl-live-${i}-${Date.now()}`,
        tag: item.tag || 'ACTIVE 2025–2026',
        tagColor: item.tagColor || (i % 2 === 0 ? '#00F5D4' : '#FFE600'),
        title: item.title || 'Central Welfare Initiative',
        detail: item.detail || 'Active national welfare and financial assistance program.',
        portal: item.portal || 'myscheme.gov.in'
      }));

      cachedHeadlines = {
        data: formatted,
        expiresAt: Date.now() + CACHE_TTL_MS
      };

      return res.status(200).json({
        headlines: formatted,
        source: 'ai-live',
        keyUsed: 'Live Server Telemetry'
      });
    }
  } catch (err: any) {
    // Fallback to baseline
  }

  return res.status(200).json({
    headlines: BASELINE_HEADLINES,
    source: 'baseline',
    keyUsed: 'Verified National Baseline'
  });
}
