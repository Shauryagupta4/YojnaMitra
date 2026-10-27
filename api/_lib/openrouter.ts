/**
 * Reusable OpenRouter Client for Server-Side AI Inference.
 * Strictly uses free-tier models on OpenRouter to ensure zero cost.
 */

export const OPENROUTER_DEFAULT_FREE_MODEL = 'openrouter/free';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionOptions {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  responseFormat?: { type: 'json_object' };
  isJson?: boolean;
  apiKey?: string;
}

export interface OpenRouterCompletionResult {
  text: string;
  modelUsed: string;
  rawJson?: any;
}

/**
 * Validates whether a model ID is explicitly free on OpenRouter.
 * OpenRouter designates free models with the ':free' suffix or through 'openrouter/free'.
 * This prevents accidental routing to paid models or unexpected credit usage.
 */
export function isExplicitlyFreeModel(modelId: string): boolean {
  if (!modelId || typeof modelId !== 'string') return false;
  const trimmed = modelId.trim().toLowerCase();
  return trimmed === 'openrouter/free' || trimmed.endsWith(':free');
}

/**
 * Get configured free OpenRouter model.
 * Defaults to 'openrouter/free' (OpenRouter's official dynamic free router),
 * or the value of process.env.OPENROUTER_MODEL if explicitly free.
 */
export function getConfiguredFreeModel(overrideModel?: string): string {
  const candidate = (overrideModel || process.env.OPENROUTER_MODEL || 'openrouter/free').trim();

  if (!isExplicitlyFreeModel(candidate)) {
    throw new Error(
      `Cost Safety Violation: Model "${candidate}" is not an explicitly free model on OpenRouter. Only models ending with ':free' or 'openrouter/free' are permitted.`
    );
  }

  return candidate;
}

/**
 * Call OpenRouter chat completions API using an explicitly free model.
 * Never silently switches to a paid model.
 */
export async function callOpenRouterChat(
  options: OpenRouterCompletionOptions
): Promise<OpenRouterCompletionResult> {
  const apiKey = (options.apiKey || process.env.OPENROUTER_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured on the server.');
  }

  const model = getConfiguredFreeModel(options.model);
  const timeoutMs = options.timeoutMs || 10000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const bodyPayload: Record<string, any> = {
    model,
    messages: options.messages,
    temperature: typeof options.temperature === 'number' ? options.temperature : 0.1,
    max_tokens: Math.min(options.maxTokens || 1800, 2200)
  };

  if (options.responseFormat || options.isJson) {
    bodyPayload.response_format = options.responseFormat || { type: 'json_object' };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://yojanamitra.app',
        'X-Title': 'YojanaMitra'
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errBody);
      } catch {
        // text only
      }

      const errMsg = parsedErr?.error?.message || errBody.slice(0, 200) || `HTTP ${res.status}`;

      if (res.status === 429) {
        throw new Error(`OpenRouter Free Tier Rate Limit (429): ${errMsg}`);
      } else if (res.status === 401) {
        throw new Error(`OpenRouter Authentication Failed (401): Invalid or expired API key.`);
      } else if (res.status === 402) {
        throw new Error(`OpenRouter Payment Required (402): Upstream requested payment. Only free models are permitted.`);
      }

      throw new Error(`OpenRouter Error (${model}) HTTP ${res.status}: ${errMsg}`);
    }

    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    const content = msg?.content || (msg?.reasoning && msg.reasoning.includes('{') ? msg.reasoning : '') || '';
    const actualModel = data?.model || model;

    return {
      text: content,
      modelUsed: actualModel,
      rawJson: data
    };
  } catch (err: any) {
    if (err.name === 'AbortError' || controller.signal.aborted) {
      throw new Error(`OpenRouter Request Timed Out after ${timeoutMs}ms on free model ${model}.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
