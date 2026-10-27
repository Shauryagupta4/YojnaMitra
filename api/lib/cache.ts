import { SchemeSearchResponse } from './types';

interface CacheEntry {
  data: SchemeSearchResponse;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateCacheKey(params: {
  state?: string;
  persona?: string;
  query?: string;
  category?: string;
  educationLevel?: string;
}): string {
  const st = (params.state || 'all').toLowerCase().trim();
  const per = (params.persona || 'student').toLowerCase().trim();
  const q = (params.query || '').toLowerCase().trim();
  const cat = (params.category || 'all').toLowerCase().trim();
  const edu = (params.educationLevel || 'any').toLowerCase().trim();
  return `${st}:${per}:${cat}:${edu}:${q}`;
}

export function getCachedSearch(key: string): SchemeSearchResponse | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return {
    ...entry.data,
    telemetry: {
      ...entry.data.telemetry,
      cached: true
    }
  };
}

export function setCachedSearch(
  key: string,
  data: SchemeSearchResponse,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  // Limit map size to prevent memory leaks in serverless warm instances
  if (memoryCache.size > 200) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

export function clearSearchCache(): void {
  memoryCache.clear();
}
