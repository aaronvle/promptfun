import { ImageResponse } from "next/og";
import { OG_SIZE, OG_COLORS as C, ogFonts } from "@/lib/og";

// Site-wide share card (homepage + fallback for routes without one).
export const alt =
  "promptfun — one prompt, every model, once every ~12 hours";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
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
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            background: C.panel,
            border: `4px solid ${C.border}`,
            borderRadius: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Bebas Neue",
              fontSize: 160,
              letterSpacing: 6,
              color: C.text,
              lineHeight: 0.9,
            }}
          >
            PROMPT<span style={{ color: C.red }}>FUN</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 30,
              letterSpacing: 10,
              color: C.muted,
            }}
          >
            ONE PROMPT · EVERY MODEL · EVERY ~12H
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 26,
              padding: "14px 28px",
              background: C.bg,
              border: `2px solid ${C.border}`,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#e0492f",
                boxShadow: "0 0 16px #e0492f",
              }}
            />
            <div
              style={{
                display: "flex",
                fontFamily: "Space Mono",
                fontWeight: 700,
                fontSize: 26,
                color: C.text,
              }}
            >
              WINDOW: CLOSED · next ??:??:??
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 20,
              color: C.faint,
              marginTop: 10,
            }}
          >
            a living log of how models handle normal prompts — not benchmarks
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() }
  );
}
