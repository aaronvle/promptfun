"use client";

const KNOB_FACE =
  "relative h-[74px] w-[74px] rounded-full border-2 border-noir-border-strong bg-noir-knob shadow-[0_5px_0_#000]";
const INDICATOR =
  "absolute left-1/2 top-[6px] h-[22px] w-[5px] -translate-x-1/2 rounded-[3px]";
const LABEL = "font-bebas text-base tracking-[2px]";
const WOBBLE = "motion-safe:hover:animate-[pf-wobble_.5s_ease]";
const SPRING =
  "block cursor-pointer transition-transform duration-[.35s] ease-[cubic-bezier(.34,1.56,.64,1)]";

// Indicator bars rotate around the knob's center (top 6px + 22px bar
// centered in a 74px circle -> origin 31px below the bar's top).
const spin = (deg: number) =>
  ({
    transform: `translateX(-50%) rotate(${deg}deg)`,
    transformOrigin: "center 31px",
  }) as React.CSSProperties;

export default function KnobRail({
  howOpen,
  onToggleHow,
  galleryOpen,
  onToggleGallery,
}: {
  howOpen: boolean;
  onToggleHow: () => void;
  galleryOpen: boolean;
  onToggleGallery: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-11 gap-y-5 pb-1 pt-2">
      <div className="flex flex-col items-center gap-[9px]">
        {/* Wobble on the wrapper so it doesn't fight the spring rotation */}
        <div className={WOBBLE}>
          <button
            type="button"
            onClick={onToggleHow}
            aria-expanded={howOpen}
            className={`${KNOB_FACE} ${SPRING}`}
            style={{ transform: `rotate(${howOpen ? 95 : 0}deg)` }}
          >
            <div className={`${INDICATOR} bg-noir-red`} />
          </button>
        </div>
        <span className={`${LABEL} text-noir-text`}>
          {howOpen ? "CLOSE PANEL" : "HOW IT WORKS"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-[9px]">
        <div className={WOBBLE}>
          <button
            type="button"
            onClick={onToggleGallery}
            aria-expanded={galleryOpen}
            className={`${KNOB_FACE} ${SPRING}`}
            style={{ transform: `rotate(${galleryOpen ? 50 : -45}deg)` }}
          >
            <div className={`${INDICATOR} bg-noir-text`} />
          </button>
        </div>
        <span className={`${LABEL} text-noir-text`}>
          {galleryOpen ? "CLOSE PANEL" : "GALLERY"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-[9px]">
        <a
          href="https://github.com/aaronvle/promptfun"
          className={`${KNOB_FACE} ${WOBBLE} block`}
        >
          <div className={`${INDICATOR} bg-noir-text`} style={spin(90)} />
        </a>
        <span className={`${LABEL} text-noir-text`}>GITHUB</span>
      </div>

      <div className="flex flex-col items-center gap-[9px] opacity-55">
        <div className={KNOB_FACE}>
          <div className={`${INDICATOR} bg-noir-text2`} style={spin(-135)} />
        </div>
        <span className={`${LABEL} text-noir-text2`}>X BOT · SOON</span>
      </div>
    </div>
  );
}
