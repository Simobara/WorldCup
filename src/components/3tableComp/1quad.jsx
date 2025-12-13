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
    round32: "bg-sky-800",
    round16: "bg-teal-700",
    quarter: "bg-emerald-400",
    semi: "bg-lime-500",
    final: "bg-yellow-500",
  };

  const bgColor = bgByPhase[phase] || "bg-sky-800";

  // 🟣 FORZA HIGHLIGHT PRON SE È UN PRONOSTICO
  const effectiveHighlightType =
    isPronTeamTable && highlightType === "none" ? "pron" : highlightType;

  // 🎨 COLORE BORDO CORRETTO
  const borderColor =
    effectiveHighlightType === "win"
      ? "border-sky-700"
      : effectiveHighlightType === "draw"
        ? "border-green-500"
        : effectiveHighlightType === "pron-draw"
          ? "border-lime-500"
          : effectiveHighlightType === "pron"
            ? "border-purple-500"
            : "border-white";

  // 🟣 bordo / ring extra per PRON (indipendente dal risultato)
  const pronRing = isPronTeamTable
    ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-black/60"
    : "";

  // 🟡 Regola grayscale
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
