// src/components/1standingsComp/grid.jsx

const Grid = ({
  rows = 16,
  cols = 38,
  cellHeightClass = "h-12",
  forceColor = null,
  patternOverride = null,
  columnLabels = [],
  highlightedCells = {},
}) => {
  const defaultPattern = [
    [17, "bg-gray-400", false, false],
    [6, "bg-gray-700", false, false],
    [4, "bg-gray-600", false, false],
    [1, "bg-gray-900", true, false],
    [3, "bg-gray-500", false, false],
    [2, "bg-gray-900", true, true],
    [2, "bg-gray-400", false, false],
    [2, "bg-gray-900", true, true],
    [2, "bg-gray-300", false, false],
  ];

  const pattern = patternOverride || defaultPattern;
  const labelClassName = "";
  const columnConfig = pattern.flatMap(([count, color, noH, noV]) =>
    Array.from({ length: count }).map(() => ({
      color,
      noHorizontal: noH,
      noVertical: noV,
    }))
  );

  return (
    <div
      className="grid gap-[0px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);

        const config = columnConfig[colIndex] || {
          color: "bg-gray-200",
          noHorizontal: false,
          noVertical: false,
        };

        const isHeaderRow = rowIndex === 0 && columnLabels.length > 0;

        const borderClass = (() => {
          if (isHeaderRow) {
            return "border-t-[0.5px] border-b-[0.5px] border-gray-600/20";
          }

          if (config.noHorizontal && config.noVertical) return "";
          if (config.noHorizontal)
            return "border-l-[0.5px] border-r-[0.5px] border-gray-600/20";

          return "border-[0.5px] border-gray-600/20";
        })();

        const label = rowIndex === 0 ? columnLabels[colIndex] : null;
        const hasLabel = !!label;

        // weekend SOLO sulla prima riga (date)
        const isWeekendCell = isHeaderRow && hasLabel && label.isWeekend;

        // chiave cella
        const cellKey = `${rowIndex}-${colIndex}`;
        const rawHighlight = highlightedCells[cellKey];

        let highlightColor = null;
        let highlightLabel = null;
        let highlightTeams = null;
        let highlightGoto = null;
        let highlightTime = null;
        let highlightTeam1 = null;
        let highlightTeam2 = null;

        if (typeof rawHighlight === "string") {
          highlightColor = rawHighlight;
        } else if (rawHighlight && typeof rawHighlight === "object") {
          highlightColor = rawHighlight.color || null;
          highlightLabel = rawHighlight.label || null;

          // POSIZIONI (stringa tipo "2A 2B")
          highlightTeams =
            typeof rawHighlight.teams === "string" &&
            rawHighlight.teams.trim() !== ""
              ? rawHighlight.teams.trim()
              : null;
          // TEAM (tipo "BRA", "ITA")
          highlightTeam1 =
            typeof rawHighlight.team1 === "string" &&
            rawHighlight.team1.trim() !== ""
              ? rawHighlight.team1.trim()
              : null;

          highlightTeam2 =
            typeof rawHighlight.team2 === "string" &&
            rawHighlight.team2.trim() !== ""
              ? rawHighlight.team2.trim()
              : null;

          highlightGoto = rawHighlight.goto || null;
          highlightTime = rawHighlight.time || null;
        }

        // ordine di priorità: highlight > forceColor > pattern base
        const finalColor = highlightColor || forceColor || config.color;

        // ✅ weekend: forza bg slate-900 solo nella riga header
        const weekendBg = isWeekendCell ? "bg-slate-900" : null;

        const cellBg = weekendBg || finalColor;

        // DIVISORI VERTICALI (6 e 12) – muro sky-700
        const isDividerAfterSix =
          colIndex === 7 || // primo blocco (dopo 6 caselle, es. giorno 17)
          colIndex === 13; // secondo blocco (6 caselle dopo, es. giorno 22)

        const dividerClass = isHeaderRow
          ? ""
          : isDividerAfterSix
            ? "border-l-8 border-l-gray-700"
            : "";

        // 🔹 DIVISORI ORIZZONTALI – muri stile verticali
        const isHorizontalDivider =
          rowIndex === 4 || // primo muro
          rowIndex === 10; // secondo muro (3 righe dopo)

        const horizontalDividerClass = isHorizontalDivider
          ? rowIndex === 4
            ? "border-t-4 border-t-green-500"
            : "border-t-4 border-t-pink-500"
          : "";

        return (
          <div
            key={i}
            className={`relative overflow-hidden ${cellHeightClass} ${cellBg} ${borderClass} ${dividerClass} ${horizontalDividerClass}`}
            style={{ width: "32px" }}
          >
            {/* OVERLAY WEEKEND SOLO SOPRA, SOLO PRIMA RIGA, se non c'è highlight/force */}
            {/* {isWeekendCell && !highlightColor && !forceColor && (
              <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-10 bg-slate-800/50" />
            )} */}

            {/* LABEL DATA (prima riga) */}
            {hasLabel && typeof label === "object" ? (
              <div
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center translate-y-2 leading-none ${
                  isWeekendCell ? "text-sky-800" : ""
                }`}
              >
                <span className="text-sm font-bold">{label.top}</span>
                <span className="text-lg font-extrabold">{label.bottom}</span>
              </div>
            ) : null}

            {/* LETTERA GRUPPO IN ALTO (solo righe delle città) */}
            {highlightLabel && (
              <div className="absolute -top-[1px] left-0 w-full flex justify-center z-30">
                <span className="text-[10px] font-extrabold leading-none translate-y-[-1px]">
                  {highlightLabel}
                </span>
              </div>
            )}

            {/* POSIZIONI (pos1 / pos2) */}
            {/* OVERLAY MATCH: KO = pos a sinistra (alto/basso) + team centrali assoluti */}
            {(highlightTeams || highlightTeam1 || highlightTeam2) &&
              (() => {
                const [pos1, pos2] = String(highlightTeams || "").split(" ");

                const getPosStyle = (p) => {
                  if (!p) return "text-white text-[12px] font-xs";

                  const singleMatch = p.match(/^([1-3])([A-Z])$/i);
                  if (singleMatch) {
                    const num = singleMatch[1];
                    if (num === "1")
                      return "text-red-700 text-[12px] font-bold";
                    if (num === "2")
                      return "text-green-400 text-[12px] font-bold";
                    if (num === "3")
                      return "text-gray-200 text-[6px] font-bold tracking-tight";
                  }

                  const multiThreeMatch = p.match(/^3[A-Z](\/[A-Z])+$/i);
                  if (multiThreeMatch) {
                    return "text-gray-200 text-[6px] font-bold tracking-tight";
                  }

                  return "text-white text-[12px] font-xs";
                };

                const teamStyle =
                  "bg-transparent text-white text-[10px] md:text-[9px] font-normal tracking-wide";

                const hasPos = !!(pos1 && pos2);
                const hasTeams = !!(highlightTeam1 && highlightTeam2);

                // ✅ KO: pos a sinistra (alto/basso) + team centrali assoluti
                if (hasPos && hasTeams) {
                  return (
                    <>
                      {/* POS SINISTRA */}
                      <div className="absolute inset-0 z-30 leading-[1.30] pointer-events-none">
                        {/* pos1 alto */}
                        <div className="absolute top-[0px] ">
                          <span className={getPosStyle(pos1)}>{pos1}</span>
                        </div>

                        {/* pos2 basso */}
                        <div className="absolute bottom-[4px] ">
                          <span className={getPosStyle(pos2)}>{pos2}</span>
                        </div>
                      </div>

                      {/* TEAM CENTRO ASSOLUTO */}
                      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center leading-[0.80] left-3 pointer-events-none">
                        <span className={teamStyle}>{highlightTeam1}</span>
                        <span className={teamStyle}>{highlightTeam2}</span>
                      </div>
                    </>
                  );
                }

                // ✅ Gironi: solo team centrali
                if (highlightTeam1 || highlightTeam2) {
                  return (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center leading-[0.95] pointer-events-none">
                      {highlightTeam1 && (
                        <span className={teamStyle}>{highlightTeam1}</span>
                      )}
                      {highlightTeam2 && (
                        <span className={teamStyle}>{highlightTeam2}</span>
                      )}
                    </div>
                  );
                }

                // ✅ fallback: solo pos → centrali assoluti
                return (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center leading-[0.95] pointer-events-none">
                    {pos1 && <span className={getPosStyle(pos1)}>{pos1}</span>}
                    {pos2 && <span className={getPosStyle(pos2)}>{pos2}</span>}
                  </div>
                );
              })()}

            {/* TEAM (team1 / team2) - sotto alle posizioni
            {highlightTeam1 && highlightTeam2 && (
              <div className="absolute bottom-[2px] left-0 w-full z-40 flex flex-col items-center leading-none">
                <span className="text-[9px] font-extrabold text-black/80">
                  {highlightTeam1}
                </span>
                <span className="text-[9px] font-extrabold text-black/80">
                  {highlightTeam2}
                </span>
              </div>
            )} */}

            {/* ORARIO PARTITA (solo righe città, se presente) */}
            {highlightTime && (
              <div className="absolute md:top-[38px] top-[32px] right-0 z-50 flex items-center justify-center">
                <span className="text-[10px] md:text-[9px] font-semibold text-black leading-none">
                  {highlightTime}
                </span>
              </div>
            )}

            {/* NUMERO GOTO IN BASSO (solo se esiste, es. knockout) */}
            {highlightGoto && (
              <div className="absolute bottom-[1px] left-2 w-full flex justify-center items-center z-40">
                <span className="text-yellow-400 text-[9px] font-extrabold leading-none md:pb-9 pb-7 pl-1">
                  {highlightGoto}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
