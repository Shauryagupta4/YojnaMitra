import { BASELINE_HEADLINES, HeadlineItem } from '../src/services/headlineAgent';
import { callOpenRouterChat } from './lib/openrouter';

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

  const prompt = `You are India's National Welfare Telemetry & Live Scheme Headline Agent.
Generate 8 to 10 verified, currently open, latest central schemes and scholarships across India for the moving headline ticker.
ONLY Central / All-India schemes (e.g. NSP AY 2025-26, AICTE Pragati, PM-KISAN, PMFBY, NFSA, PMAY 2.0, Ayushman Bharat PM-JAY, Mudra Tarun Plus).
STRICTLY CURRENT & ACTIVE for AY 2025-26 / 2026. Absolutely ZERO expired schemes.
Assign tagColor: either "#00F5D4" or "#FFE600".

Output JSON format strictly:
{
  "headlines": [
    {
      "id": "hl-1",
      "tag": "ACTIVE AY 2025-26",
      "tagColor": "#00F5D4",
      "title": "National Scholarship Portal (NSP / PM-USP)",
      "detail": "Central OTR Registration Live on scholarships.gov.in (Full Tuition Fee Reimbursement + Maintenance Allowance for SC/ST/OBC)",
      "portal": "scholarships.gov.in"
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
