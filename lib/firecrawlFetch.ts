import FirecrawlApp from '@mendable/firecrawl-js';
import { isValidPublicUrl } from './validation';
import { sanitizeRetrievedText, FetchedPageContent } from './tinyfishFetch';
import { classifySource } from './sourceVerification';

import fs from 'fs';
import path from 'path';

let firecrawlClient: FirecrawlApp | null = null;

function getFirecrawlClient(): FirecrawlApp | null {
  let key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^FIRECRAWL_API_KEY\s*=\s*(.+)$/m);
        if (match) {
          key = match[1].trim();
          process.env.FIRECRAWL_API_KEY = key;
        }
      }
    } catch {}
  }
  if (!key) return null;
  if (!firecrawlClient) {
    firecrawlClient = new FirecrawlApp({ apiKey: key });
  }
  return firecrawlClient;
}

/**
 * Fetch a batch of web pages using Firecrawl.
 * Firecrawl renders JS/SPA pages and returns clean LLM-ready markdown,
 * which dramatically improves extraction of eligibility details from
 * Indian government portals that rely on Angular/ASP.NET dynamic rendering.
 *
 * Falls back gracefully to an empty result (not an error crash) if Firecrawl
 * is unavailable, so the rest of the pipeline continues using snippet-only data.
 */
export async function fetchPagesWithFirecrawl(
  urls: string[],
  timeoutMs: number = 12000
): Promise<{
  pages: FetchedPageContent[];
  failedUrls: Array<{ url: string; error: string }>;
}> {
  const client = getFirecrawlClient();
  if (!client) {
    return {
      pages: [],
      failedUrls: urls.map(u => ({ url: u, error: 'FIRECRAWL_API_KEY not configured' }))
    };
  }

  // Only process valid public URLs, cap at 4 top diverse pages (Central, State, Buddy4Study)
  const validUrls = urls.filter(u => isValidPublicUrl(u)).slice(0, 4);
  if (validUrls.length === 0) {
    return { pages: [], failedUrls: [] };
  }

  const pages: FetchedPageContent[] = [];
  const failedUrls: Array<{ url: string; error: string }> = [];

  // Scrape all selected URLs concurrently in parallel for ultra-fast latency (~3-4s total)
  const batchPromises = validUrls.map(async (url) => {
    try {
      const result = await Promise.race([
        client.scrapeUrl(url, {
          formats: ['markdown'],
          onlyMainContent: true,
          timeout: 4500
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firecrawl scrape timeout')), 5200)
        )
      ]) as any;

      if (result && result.markdown) {
        const textClean = sanitizeRetrievedText(result.markdown, 5000);
        const srcClass = classifySource(url);
        pages.push({
          url,
          final_url: result.metadata?.sourceURL || url,
          title: result.metadata?.title || null,
          description: result.metadata?.description || null,
          text: textClean,
          isOfficial: srcClass.isOfficial,
          fetchSuccess: true
        });
      } else {
        failedUrls.push({ url, error: 'Firecrawl returned no markdown content' });
      }
    } catch (err: any) {
      failedUrls.push({ url, error: 'Firecrawl error: ' + (err?.message || 'unknown') });
    }
  });

  await Promise.allSettled(batchPromises);

  return { pages, failedUrls };
}
