"use client";

import { useCallback, useEffect, useState } from "react";
import { PROMPT_MAX_LENGTH } from "@/lib/models";

const POLL_MS = 5000;

type Phase = "closed" | "open" | "submitting" | "won" | "beaten";

function ScrambledClock() {
  const [digits, setDigits] = useState("??:??:??");

  useEffect(() => {
    const chars = "0123456789";
    const interval = setInterval(() => {
      const d = () => chars[Math.floor(Math.random() * chars.length)];
      setDigits(`${d()}${d()}:${d()}${d()}:${d()}${d()}`);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono tabular-nums text-zinc-400 dark:text-zinc-500 select-none">
      {digits}
    </span>
  );
}

export default function WindowStatus() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [prompt, setPrompt] = useState("");
  const [handle, setHandle] = useState("");
  const [wantsCredit, setWantsCredit] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/window", { cache: "no-store" });
      const { open } = await res.json();
      // Only flip between closed/open — never clobber an in-flight
      // submission or a result screen.
      setPhase((prev) =>
        prev === "closed" || prev === "open" ? (open ? "open" : "closed") : prev
      );
    } catch {
      // Network blip: keep current state and try again next tick.
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(poll, 0);
    const interval = setInterval(poll, POLL_MS);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [poll]);

  async function submit() {
    if (!prompt.trim() || phase !== "open") return;
    setPhase("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, handle, wantsCredit }),
      });
      const json = await res.json();
      if (res.ok) {
        setRunId(json.runId);
        setPhase("won");
      } else if (json.error === "beaten" || json.error === "closed") {
        setPhase("beaten");
      } else {
        setPhase("open"); // validation/server error: let them retry
      }
    } catch {
      setPhase("open");
    }
  }

  const open = phase === "open" || phase === "submitting";

  if (phase === "won") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-3 text-center shadow-sm">
        <span className="text-2xl">🏆</span>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          You got it. Your prompt is running against the whole lineup.
        </p>
        <a
          href={`/runs/${runId}`}
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline"
        >
          Watch the responses come in →
        </a>
      </div>
    );
  }

  if (phase === "beaten") {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-3 text-center shadow-sm">
        <span className="text-2xl">😤</span>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Someone beat you to it. The window is gone.
        </p>
        <button
          onClick={() => setPhase("closed")}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400 underline-offset-4 hover:underline"
        >
          Wait for the next one
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-2xl rounded-2xl border bg-white dark:bg-zinc-950 p-6 sm:p-8 flex flex-col gap-5 shadow-sm transition-colors ${
        open
          ? "border-emerald-500/60 shadow-emerald-500/10"
          : "border-black/[.08] dark:border-white/[.145]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                open ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                open ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {open ? "The window is OPEN" : "The window is closed"}
          </span>
        </div>
        {!open && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="hidden sm:inline">next opening</span>
            <ScrambledClock />
          </div>
        )}
      </div>

      <textarea
        disabled={!open || phase === "submitting"}
        rows={3}
        maxLength={PROMPT_MAX_LENGTH}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          open
            ? "Go. First prompt sent wins the run."
            : "When the window opens, whoever types here first gets the run..."
        }
        className="w-full resize-none rounded-xl border border-black/[.08] dark:border-white/[.145] bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 disabled:cursor-not-allowed"
      />

      {open && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourhandle (optional)"
            className="rounded-lg border border-black/[.08] dark:border-white/[.145] bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={wantsCredit}
              onChange={(e) => setWantsCredit(e.target.checked)}
            />
            tag me in the tweet
          </label>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {open
            ? "It's live right now. One person gets this."
            : "Opens at a random moment, once every ~12 hours. No schedule. No warning."}
        </p>
        <button
          disabled={!open || phase === "submitting" || !prompt.trim()}
          onClick={submit}
          className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            open && prompt.trim()
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
          }`}
        >
          {phase === "submitting" ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
