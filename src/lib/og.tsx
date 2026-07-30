// Shared bits for the opengraph-image routes (noir share cards).

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  bg: "#0a0a0b",
  panel: "#141416",
  border: "#26262a",
  borderStrong: "#35353a",
  text: "#ececec",
  muted: "#6a6a70",
  faint: "#55555c",
  red: "#c22f2f",
};

// Satori (ImageResponse) needs raw TTF/OTF data. Google Fonts serves
// TTF urls when the request has no browser user-agent. Fail-soft: a
// missing font must never break the card (system fonts render instead).
async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`
      )
    ).text();
    const match = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
    );
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function ogFonts() {
  const [bebas, mono, monoBold] = await Promise.all([
    loadGoogleFont("Bebas Neue", 400),
    loadGoogleFont("Space Mono", 400),
    loadGoogleFont("Space Mono", 700),
  ]);
  const fonts = [];
  if (bebas) fonts.push({ name: "Bebas Neue", data: bebas, weight: 400 as const });
  if (mono) fonts.push({ name: "Space Mono", data: mono, weight: 400 as const });
  if (monoBold)
    fonts.push({ name: "Space Mono", data: monoBold, weight: 700 as const });
  return fonts;
}

export function clipText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}
