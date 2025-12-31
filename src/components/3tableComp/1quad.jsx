import { CssQuad } from "../../START/styles/0CssGsTs";

const Quadrato = ({
  label,
  teamName,
  flag,
  phase = "round32",
  advanced = false,
  highlightType = "none",
  isPronTeamTable = false,
}) => {
  const bgByPhase = {
    round32: CssQuad.BgRound32,
    round16: CssQuad.BgRound16,
    quarter: CssQuad.BgQuarter,
    semi: CssQuad.BgSemi,
    final: CssQuad.BgFinal,
  };

  const bgColor = bgByPhase[phase] || CssQuad.BgRound32;

  const effectiveHighlightType =
    isPronTeamTable && highlightType === "none" ? "pron" : highlightType;

  const borderByHighlight = {
    win: CssQuad.BorderWin,
    draw: CssQuad.BorderDraw,

    // ✅ provvisorio (ris)
    "win-provisional": CssQuad.BorderWinProvisional, // purple
    "draw-provisional": CssQuad.BorderDrawProvisional, // green

    pron: CssQuad.BorderPron,
    "pron-draw": CssQuad.BorderPronDraw,
    none: CssQuad.BorderDefault,
  };

  const borderColor =
    borderByHighlight[effectiveHighlightType] || CssQuad.BorderDefault;

  const pronRing = "";

  const isRound32 = phase === "round32";
  const contentFilterClass = isRound32
    ? ""
    : advanced
      ? ""
      : "filter grayscale";

  return (
    <div
      className={`
      relative w-16 md:h-16 h-12
      ${bgColor}
      border-x-2 border-y-4 ${borderColor}
      ${pronRing}
      rounded-[14px] shadow-xl flex items-center justify-center
      overflow-hidden z-40
    `}
    >
      {label && (
        <span
          className="
            absolute
            md:-top-[3px] -top-[3px]
            left-1/2 -translate-x-1/2 
            text-yellow-500 font-extrabold bg-black/70
            md:text-[0.60rem] text-[0.55rem] px-6 z-50
          "
        >
          {label}
        </span>
      )}

      <div className={`absolute inset-0 w-full h-full ${contentFilterClass}`}>
        {flag ? (
          <img
            src={flag}
            alt={teamName || label}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-[0.7rem] md:text-sm font-semibold text-white px-1 text-center">
            {teamName}
          </span>
        )}
      </div>
    </div>
  );
};

export default Quadrato;
