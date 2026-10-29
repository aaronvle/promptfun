// The lineup every prompt fans out to. The big four use OpenRouter's
// "latest" alias slugs (~author/family-latest), which always resolve
// to that lab's newest model — no more stale pins. The fan-out stores
// the CONCRETE model that served each response (from the API reply),
// so the archive stays version-accurate. Labs without a latest alias
// stay pinned; verify against https://openrouter.ai/models
// (last reviewed 2026-10).
export const MODELS: { slug: string; label: string }[] = [
  { slug: "~openai/gpt-latest", label: "GPT" },
  { slug: "~anthropic/claude-opus-latest", label: "Claude" },
  { slug: "~google/gemini-pro-latest", label: "Gemini" },
  { slug: "~x-ai/grok-latest", label: "Grok" },
  { slug: "deepseek/deepseek-v4-pro", label: "DeepSeek" },
  { slug: "moonshotai/kimi-k3", label: "Kimi" },
  { slug: "z-ai/glm-5.2", label: "GLM" },
];

// Labels by model author: covers every concrete slug a latest alias
// can resolve to, plus all retired pinned slugs in the archive.
const AUTHOR_LABELS: Record<string, string> = {
  openai: "GPT",
  anthropic: "Claude",
  google: "Gemini",
  "x-ai": "Grok",
  deepseek: "DeepSeek",
  moonshotai: "Kimi",
  "z-ai": "GLM",
  mistralai: "Mistral",
  "meta-llama": "Llama",
};

// "~anthropic/claude-opus-latest" -> "anthropic"; "openai/gpt-5.5" -> "openai"
export function authorOf(slug: string): string {
  return slug.replace(/^~/, "").split("/")[0] ?? slug;
}

export function labelFor(slug: string): string {
  return (
    MODELS.find((m) => m.slug === slug)?.label ??
    AUTHOR_LABELS[authorOf(slug)] ??
    slug
  );
}

export const PROMPT_MAX_LENGTH = 2000;
