// OpenRouter chat-completions client for the model fan-out.
// https://openrouter.ai/docs

const MODEL_TIMEOUT_MS = 45_000;
// Cost control: a window winner gets real answers, not essays. Applied
// per model, so a 7-model run costs at most ~7x this.
const MAX_OUTPUT_TOKENS = 1024;

export interface ModelResult {
  model: string;
  output: string | null;
  error: string | null;
  latency_ms: number;
}

// Never throws: every failure mode becomes an error string on the
// result so it can be stored and shown alongside successful responses.
export async function askModel(
  slug: string,
  prompt: string
): Promise<ModelResult> {
  const started = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      model: slug,
      output: null,
      error: "OPENROUTER_API_KEY not configured",
      latency_ms: 0,
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // App attribution, shown on openrouter.ai rankings.
    "X-Title": "promptfun",
  };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) headers["HTTP-Referer"] = siteUrl;

  let output: string | null = null;
  let error: string | null = null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: slug,
        messages: [{ role: "user", content: prompt }],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    if (!res.ok) {
      error = `OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`;
    } else {
      const json = await res.json();
      // OpenRouter can also surface upstream provider failures as an
      // error object on a 200 response.
      if (json.error) {
        error = `${json.error.code ?? ""} ${json.error.message ?? "provider error"}`.trim();
      } else {
        output = json.choices?.[0]?.message?.content ?? null;
        if (!output) error = "empty completion";
      }
    }
  } catch (err) {
    error =
      err instanceof Error && err.name === "TimeoutError"
        ? `timed out after ${MODEL_TIMEOUT_MS / 1000}s`
        : err instanceof Error
          ? err.message
          : "request failed";
  }

  return { model: slug, output, error, latency_ms: Date.now() - started };
}
