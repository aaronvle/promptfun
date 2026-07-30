import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase";
import { MODELS } from "@/lib/models";
import { OG_SIZE, OG_COLORS as C, ogFonts, clipText } from "@/lib/og";

// Per-run share card: the prompt in the noir chassis. This is what
// unfurls under the bot's thread links and anywhere a run is shared.
export const alt = "a promptfun run — one prompt, answered by every model";
export const size = OG_SIZE;
export const contentType = "image/png";

interface RunMeta {
  prompt: string;
  created_at: string;
  responseCount: number;
}

async function getRun(id: string): Promise<RunMeta | null> {
  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("runs")
      .select("prompt, created_at, responses(count)")
      .eq("id", id)
      .single();
    if (!data) return null;
    return {
      prompt: data.prompt,
      created_at: data.created_at,
      responseCount: data.responses?.[0]?.count ?? MODELS.length,
    };
  } catch {
    return null;
  }
}

export default async function OgImage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const run = await getRun(id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: C.bg,
          padding: 48,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: C.panel,
            border: `4px solid ${C.border}`,
            borderRadius: 28,
            padding: "44px 56px",
          }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Bebas Neue",
                fontSize: 56,
                letterSpacing: 3,
                color: C.text,
                lineHeight: 1,
              }}
            >
              PROMPT<span style={{ color: C.red }}>FUN</span>
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontSize: 20,
                letterSpacing: 4,
                color: C.muted,
              }}
            >
              {run
                ? new Date(run.created_at)
                    .toUTCString()
                    .slice(0, 16)
                    .toUpperCase()
                : "THE RUN"}
            </div>
          </div>

          {/* prompt terminal */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 22,
              background: C.bg,
              border: `3px solid ${C.borderStrong}`,
              borderRadius: 18,
              padding: "36px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontWeight: 700,
                fontSize: 44,
                color: C.red,
                lineHeight: 1.35,
              }}
            >
              &gt;
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontSize: 44,
                color: C.text,
                lineHeight: 1.35,
              }}
            >
              {run ? `“${clipText(run.prompt, 140)}”` : "one prompt, every model"}
            </div>
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 3,
                color: C.red,
              }}
            >
              {run ? `${run.responseCount} MODELS ANSWERED` : "EVERY ~12H"}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontSize: 20,
                color: C.faint,
              }}
            >
              same prompt · same moment
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() }
  );
}
