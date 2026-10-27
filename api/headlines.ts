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
