import { isValidPublicUrl } from './validation';

export interface FetchedPageContent {
  url: string;
  final_url?: string;
  title?: string | null;
  description?: string | null;
  text: string;
  isOfficial: boolean;
  fetchSuccess: boolean;
  error?: string;
}

export interface TinyFishFetchApiResponse {
  results?: Array<{
    url: string;
    final_url?: string;
    title?: string | null;
    description?: string | null;
    language?: string;
    format?: string;
    text?: string;
  }>;
  errors?: Array<{
    url: string;
    error: string;
  }>;
}

/**
 * Sanitize untrusted retrieved web page content.
 * Strips prompt injection cues, control characters, and caps size.
 */
export function sanitizeRetrievedText(rawText: string, maxChars: number = 4000): string {
  if (!rawText) return '';
  let cleaned = rawText
    // Remove null bytes and non-printable control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    // Normalize newlines
    .replace(/\r\n/g, '\n')
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Neutralize prompt injection phrases in retrieved untrusted text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions/gi, '[CONTENT REMOVED]')
    .replace(/system\s+prompt\s*:/gi, '[BLOCKED TAG]')
    .replace(/you\s+are\s+now\s+in\s+developer\s+mode/gi, '[BLOCKED PHRASE]')
    .trim();

  if (cleaned.length > maxChars) {
    cleaned = cleaned.slice(0, maxChars) + '\n...[content truncated for extraction]';
  }

  return cleaned;
}

/**
 * Fetch a batch of web pages using TinyFish Fetch API with bounded execution and strict timeout.
 */
export async function fetchPagesWithTinyFish(
  urls: string[],
  apiKey?: string,
  timeoutMs: number = 15000
): Promise<{
  pages: FetchedPageContent[];
  failedUrls: Array<{ url: string; error: string }>;
}> {
  const activeKey = apiKey || process.env.TINYFISH_API_KEY || '';
  if (!activeKey) {
    return {
      pages: [],
      failedUrls: urls.map(u => ({ url: u, error: 'TINYFISH_API_KEY is missing' }))
    };
  }

  // Filter valid URLs (max 10 as per TinyFish limits)
  const validUrls = urls.filter(u => isValidPublicUrl(u)).slice(0, 8);
  if (validUrls.length === 0) {
    return { pages: [], failedUrls: [] };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.fetch.tinyfish.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': activeKey
      },
      body: JSON.stringify({
        urls: validUrls,
        format: 'markdown',
        per_url_timeout_ms: Math.min(10000, timeoutMs - 2000)
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        pages: [],
        failedUrls: validUrls.map(u => ({
          url: u,
          error: `TinyFish Fetch HTTP ${res.status}: ${errText.slice(0, 100)}`
        }))
      };
    }

    const data: TinyFishFetchApiResponse = await res.json();
    const pages: FetchedPageContent[] = [];
    const failedUrls: Array<{ url: string; error: string }> = [...(data.errors || [])];

    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        const textClean = sanitizeRetrievedText(item.text || '');
        pages.push({
          url: item.url,
          final_url: item.final_url || item.url,
          title: item.title,
          description: item.description,
          text: textClean,
          isOfficial: true,
          fetchSuccess: true
        });
      }
    }

    return { pages, failedUrls };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      pages: [],
      failedUrls: validUrls.map(u => ({
        url: u,
        error: `TinyFish Fetch error: ${err?.message || 'timeout/network'}`
      }))
    };
  }
}
