import Link from "next/link";
import LastRun from "@/components/LastRun";
import WindowStatus from "@/components/WindowStatus";

// Refresh the prerendered homepage every minute so the latest run
// shows up shortly after a window is won.
export const revalidate = 60;

const MODELS = [
  "Claude",
  "GPT",
  "Gemini",
  "Llama",
  "DeepSeek",
  "Grok",
  "Mistral",
];

const STEPS = [
  {
    title: "The window opens",
    body: "Once every ~12 hours, at a random time nobody knows in advance, the site unlocks for prompting.",
  },
  {
    title: "First come, first served",
    body: "Anyone on the site can write a prompt and hit send. The first submission claims the run — then it locks again.",
  },
  {
    title: "Every model answers",
    body: "The prompt fans out to a handful of flagship models at once via OpenRouter. Same prompt, same moment.",
  },
  {
    title: "The results live forever",
    body: "Responses are archived and tweeted as a thread — with credit to the prompter, if they want it.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-16 px-6 py-24 sm:py-32">
        <section className="flex flex-col items-center gap-5 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black dark:text-zinc-50">
            promptfun
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            One prompt. Every model. Once every 12 hours, at a random time —
            and only one person on the internet gets to write it.
          </p>
        </section>

        <WindowStatus />

        <LastRun />

        <section className="flex w-full flex-col gap-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-center">
            How it works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-5 flex flex-col gap-2"
              >
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-center gap-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            One prompt, answered by
          </h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {MODELS.map((model) => (
              <li
                key={model}
                className="rounded-full border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 px-4 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
              >
                {model}
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ...and friends, via a single OpenRouter call.
          </p>
        </section>

        <Link
          href="/gallery"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:underline"
        >
          Browse the gallery →
        </Link>
      </main>

      <footer className="w-full border-t border-black/[.08] dark:border-white/[.145] py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            A living log of how models handle normal prompts — not benchmarks.
          </p>
          <a
            href="https://github.com/aaronvle/promptfun"
            className="font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            github.com/aaronvle/promptfun
          </a>
        </div>
      </footer>
    </div>
  );
}
