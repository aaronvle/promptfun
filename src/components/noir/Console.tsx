"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MODELS, PROMPT_MAX_LENGTH, labelFor } from "@/lib/models";
import type { LatestRun } from "@/lib/runs";
import ScrambledClock from "./ScrambledClock";
import Terminal from "./Terminal";
import ResponseCard, { type CardResponse } from "./ResponseCard";
import SendButton from "./SendButton";
import KnobRail from "./KnobRail";
import HowPanel from "./HowPanel";
import MeterStrip, { type MeterState } from "./MeterStrip";
import LastRunPanel from "./LastRunPanel";

const WINDOW_POLL_MS = 5000;
const RUN_POLL_MS = 1500;

type Phase = "closed" | "open" | "running" | "done";

export default function Console({
  initialLastRun,
}: {
  initialLastRun: LatestRun | null;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  // The run currently streaming in the terminal (ours or the winner's).
  const [run, setRun] = useState<LatestRun | null>(null);
  const [lastRun, setLastRun] = useState(initialLastRun);
  // Runs at or before this id are history, not the live run.
  const baselineRunId = useRef(initialLastRun?.id ?? null);

  const pollWindow = useCallback(async () => {
    try {
      const res = await fetch("/api/window", { cache: "no-store" });
      const { open } = await res.json();
      setPhase((prev) =>
        prev === "closed" || prev === "open" ? (open ? "open" : "closed") : prev
      );
    } catch {
      // Network blip: try again next tick.
    }
  }, []);

  useEffect(() => {
    if (phase !== "closed" && phase !== "open") return;
    const initial = setTimeout(pollWindow, 0);
    const interval = setInterval(pollWindow, WINDOW_POLL_MS);
    const onFocus = () => pollWindow();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [phase, pollWindow]);

  // While a run is live, poll for its responses landing one by one.
  useEffect(() => {
    if (phase !== "running") return;
    const tick = async () => {
      try {
        const res = await fetch("/api/runs/latest", { cache: "no-store" });
        const { run: latest, total } = await res.json();
        if (!latest || latest.id === baselineRunId.current) return;
        setRun(latest);
        setLastRun(latest);
        if (latest.responses.length >= total) setPhase("done");
      } catch {
        // Keep polling.
      }
    };
    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, RUN_POLL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [phase]);

  async function submit() {
    if (phase !== "open" || !prompt.trim()) return;
    setNotice(null);
    setPhase("running");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) return; // run polling has been streaming it in
      const { error } = await res.json();
      if (error === "beaten") {
        // Someone else claimed it first — watch their run instead.
        setNotice("someone beat you to it · watching their run");
      } else if (error === "closed") {
        setPhase("closed");
        setNotice("the window slammed shut. wait for the next one.");
      } else {
        setPhase("open");
        setNotice(`transmission failed (${error ?? "unknown"}) · try again`);
      }
    } catch {
      setPhase("open");
      setNotice("transmission failed · try again");
    }
  }

  function reset() {
    baselineRunId.current = run?.id ?? baselineRunId.current;
    setRun(null);
    setPrompt("");
    setNotice(null);
    setPhase("closed");
  }

  const isRun = phase === "running" || phase === "done";
  const ledColor = phase === "open" ? "#39d97a" : "#e0492f";
  const lcdStatus =
    phase === "open" ? "OPEN — GO" : isRun ? "CLAIMED" : "CLOSED";

  const displayResponses: CardResponse[] = (run?.responses ?? [])
    .slice()
    .sort((a, b) => (a.latency_ms ?? Infinity) - (b.latency_ms ?? Infinity))
    .map((r) => ({
      label: labelFor(r.model),
      slug: r.model,
      latencySec:
        r.latency_ms != null ? (r.latency_ms / 1000).toFixed(1) : null,
      text: r.output ?? r.error ?? "no output",
      isError: !r.output,
      tokens: r.completion_tokens,
      cost: r.cost,
    }));

  const answered = new Set((run?.responses ?? []).map((r) => r.model));
  const meters = MODELS.map(({ slug, label }) => ({
    label,
    state: (isRun
      ? answered.has(slug)
        ? "done"
        : phase === "running"
          ? "typing"
          : "done"
      : "idle") as MeterState,
  }));

  // Avoid showing the same run twice while it's live in the terminal.
  const showLastRun = lastRun && (!isRun || lastRun.id !== run?.id);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border-2 border-noir-border bg-noir-panel px-[30px] py-7">
      {/* header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-px">
          <span className="font-bebas text-[44px] leading-[.9] tracking-[2px] text-noir-text">
            PROMPT<span className="text-noir-red">FUN</span>
          </span>
          <span className="font-mono-space text-[9px] tracking-[3px] text-noir-muted">
            ONE PROMPT · EVERY MODEL · EVERY ~12H
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[10px] rounded-lg border border-noir-border bg-noir-bg px-[14px] py-2 motion-safe:animate-[pf-flicker_7s_infinite]">
          <span
            className="h-2 w-2 rounded-full motion-safe:animate-[pf-blink_1.2s_steps(1)_infinite]"
            style={{ background: ledColor, boxShadow: `0 0 8px ${ledColor}` }}
          />
          <span className="font-mono-space text-xs font-bold text-noir-text">
            WINDOW: {lcdStatus}
          </span>
          <span className="whitespace-nowrap font-mono-space text-[11px] text-noir-muted">
            · next <ScrambledClock />
          </span>
        </div>
      </div>

      {/* hero: terminal + send */}
      <div className="flex flex-col items-stretch gap-[22px] md:flex-row">
        <Terminal
          phase={phase}
          prompt={prompt}
          onPromptChange={(v) => setPrompt(v.slice(0, PROMPT_MAX_LENGTH))}
          onSubmit={submit}
          runPrompt={run?.prompt ?? prompt}
          pending={MODELS.length - (run?.responses.length ?? 0)}
          notice={notice}
          onReset={reset}
        />
        <div className="flex items-center justify-center">
          <SendButton
            disabled={phase !== "open" || !prompt.trim()}
            onClick={submit}
          />
        </div>
      </div>

      {/* live run responses: one readable card per model */}
      {isRun && displayResponses.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          {displayResponses.map((r) => (
            <ResponseCard key={r.label} r={r} />
          ))}
        </div>
      )}

      <KnobRail howOpen={howOpen} onToggleHow={() => setHowOpen((v) => !v)} />

      {howOpen && <HowPanel />}

      <MeterStrip meters={meters} />

      {showLastRun && <LastRunPanel run={lastRun} />}

      <div className="flex justify-center font-mono-space text-[10px] text-noir-faint">
        <span>
          a living log of how models handle normal prompts — not benchmarks
        </span>
      </div>
    </div>
  );
}
