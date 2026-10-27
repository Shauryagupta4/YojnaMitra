/**
 * Security & Input Sanitizer
 * 
 * Provides defense-in-depth protections against:
 * - Secret credential leakage
 * - Prompt injection & jailbreak delimiters
 * - Phishing & Open Redirection via AI-generated URLs
 * - JavaScript / XSS pseudo-protocols (javascript:, data:)
 * - Business logic manipulation (negative income, impossible age)
 */

const SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // OpenRouter API keys
  { regex: /sk-or-v1-[a-zA-Z0-9_-]{16,}/gi, replacement: '[REDACTED_OPENROUTER_KEY]' },
  // Groq API keys
  { regex: /gsk_[a-zA-Z0-9_-]{8,}/gi, replacement: '[REDACTED_GROQ_KEY]' },
  // OpenAI, TinyFish, Anthropic, or generic secret keys (sk-...)
  { regex: /sk-[a-zA-Z0-9_-]{8,}/gi, replacement: '[REDACTED_SECRET_KEY]' },
  // Bearer Authorization headers / tokens
  { regex: /Bearer\s+[a-zA-Z0-9_\-./+=]{10,}/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  // Database connection strings (MongoDB, PostgreSQL, MySQL, Redis) with passwords
  { regex: /(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:]+):([^@]+)@([^\s/]+)/gi, replacement: '$1://$2:[REDACTED_PASSWORD]@$4' },
  // Supabase service / personal tokens
  { regex: /sbp_[a-zA-Z0-9_-]{8,}/gi, replacement: '[REDACTED_SUPABASE_KEY]' },
  // JWT tokens (Header.Payload.Signature)
  { regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, replacement: '[REDACTED_JWT]' },
  // Stripe secret or publishable keys
  { regex: /sk_live_[a-zA-Z0-9]{20,}/gi, replacement: '[REDACTED_STRIPE_SECRET]' },
  { regex: /rk_live_[a-zA-Z0-9]{20,}/gi, replacement: '[REDACTED_STRIPE_RESTRICTED]' },
  // AWS access key ID and secret patterns
  { regex: /AKIA[0-9A-Z]{16}/g, replacement: '[REDACTED_AWS_KEY_ID]' },
  // Basic auth in URLs
  { regex: /:\/\/[^:]+:[^@]+@/g, replacement: '://[REDACTED_AUTH]@' }
];

/**
 * List of recognized, verified official government domains and trusted statutory public authorities.
 */
const TRUSTED_DOMAINS_SUFFIXES = [
  '.gov.in',
  '.nic.in',
  '.ac.in',
  '.edu.in',
  '.res.in',
  'maandhan.in',
  'udyamimitra.in',
  'pfrda.org.in',
  'aicte-india.org',
  'indiapost.gov.in',
  'myscheme.gov.in',
  'scholarships.gov.in',
  'dbtbharat.gov.in',
  'pmrf.in',
  'standupmitra.in',
  'cgtmse.in'
];

/**
 * Scrubs any sensitive secrets or token patterns from a string or unknown error object.
 */
export function scrubSecrets(input: unknown): string {
  if (input === null || input === undefined) return '';
  let str = typeof input === 'string' ? input : (input instanceof Error ? input.message : String(input));

  for (const { regex, replacement } of SECRET_PATTERNS) {
    str = str.replace(regex, replacement);
  }

  return str;
}

/**
 * Returns a safe, masked label for an agent or engine without revealing raw secret key characters.
 */
export function getSafeAgentLabel(agentName: string, hasKey: boolean, fallbackLabel?: string): string {
  if (!hasKey) {
    return fallbackLabel || `${agentName} (Verified Offline Engine)`;
  }
  return `${agentName} (Secure Engine)`;
}

/**
 * Sanitizes user input before passing into LLM prompts or UI state.
 * Defends against Prompt Injection, Token Exhaustion (DDoS), and XSS vectors.
 */
export function sanitizePromptInput(input: string, maxLength: number = 300): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Trim and enforce length limit to prevent token flood attacks
    .slice(0, maxLength)
    // Remove control characters (except common punctuation and whitespace)
    // oxlint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Neutralize prompt jailbreak delimiters & role-impersonation tokens
    .replace(/<\|im_start\|>|<\|im_end\|>/gi, '')
    .replace(/(?:^|\n)\s*(?:system|user|assistant|instruction|directive)\s*:/gi, ' ')
    // Strip markdown code fences to prevent JSON breakout
    .replace(/```/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Strip javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    .trim();

  return sanitized;
}

/**
 * Validates and sanitizes a URL before rendering in clickable links.
 * Defends against:
 * 1. JavaScript execution (javascript:alert(1))
 * 2. Data URI phishing (data:text/html,...)
 * 3. Open Redirection to arbitrary external malicious phishing portals
 */
export function validateAndSanitizeUrl(rawUrl?: string, fallbackQuery?: string): string {
  const safeFallback = `https://www.myscheme.gov.in/search?q=${encodeURIComponent(fallbackQuery || 'Central Schemes')}`;
  if (!rawUrl || typeof rawUrl !== 'string') return safeFallback;

  const trimmed = rawUrl.trim();

  // Block dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('file:')
  ) {
    console.warn('[Security] Blocked dangerous protocol:', lower.slice(0, 20));
    return safeFallback;
  }

  try {
    const parsed = new URL(trimmed);

    // Require HTTPS for all production external portals
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return safeFallback;
    }

    const host = parsed.hostname.toLowerCase();

    // Check if hostname matches our verified official government domain whitelist
    const isTrusted = TRUSTED_DOMAINS_SUFFIXES.some(suffix => host === suffix || host.endsWith(suffix));

    if (isTrusted) {
      // Force HTTPS on trusted portals
      parsed.protocol = 'https:';
      return parsed.toString();
    }

    // If an AI or user provided an unrecognized external host, safely route through official MyScheme search
    console.warn('[Security] Untrusted host redirected to official portal search:', host);
    return `https://www.myscheme.gov.in/search?q=${encodeURIComponent(fallbackQuery || host)}`;
  } catch {
    // Malformed URL
    return safeFallback;
  }
}

/**
 * Validates demographic inputs to prevent business logic manipulation
 * (e.g. negative income, impossible age limits, invalid numbers).
 */
export function sanitizeDemographics(input: {
  age?: number;
  annualIncome?: number;
}): { age: number; annualIncome: number } {
  let age = typeof input.age === 'number' && !isNaN(input.age) ? Math.round(input.age) : 21;
  let annualIncome = typeof input.annualIncome === 'number' && !isNaN(input.annualIncome) ? Math.round(input.annualIncome) : 180000;

  // Enforce logical human bounds
  if (age < 1) age = 1;
  if (age > 120) age = 120;

  // Enforce logical income bounds (cannot be negative)
  if (annualIncome < 0) annualIncome = 0;
  if (annualIncome > 100000000) annualIncome = 100000000; // Cap at ₹10 Crore

  return { age, annualIncome };
}
