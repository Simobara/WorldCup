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
          color: "bg-gray-600",
          noHorizontal: false,
          noVertical: false,
        };

        const borderClass = (() => {
          if (config.noHorizontal && config.noVertical) return "";
          if (config.noHorizontal) return "border-l border-r border-black";
          return "border border-black";
        })();

        const label = rowIndex === 0 ? columnLabels[colIndex] : null;
        const hasLabel = !!label;

        // weekend SOLO sulla prima riga (date)
        const isWeekendCell = rowIndex === 0 && hasLabel && label.isWeekend;

        // chiave cella
        const cellKey = `${rowIndex}-${colIndex}`;
        const rawHighlight = highlightedCells[cellKey];

        let highlightColor = null;
        let highlightLabel = null;
        let highlightTeams = null;
        let highlightGoto = null;
        let highlightTime = null;

        if (typeof rawHighlight === "string") {
          highlightColor = rawHighlight;
        } else if (rawHighlight && typeof rawHighlight === "object") {
          highlightColor = rawHighlight.color || null;
          highlightLabel = rawHighlight.label || null;
          highlightTeams = rawHighlight.teams || null;
          highlightGoto = rawHighlight.goto || null;
          highlightTime = rawHighlight.time || null;
        }

        // ordine di priorità: highlight > forceColor > pattern base
        const finalColor = highlightColor || forceColor || config.color;

        // DIVISORI VERTICALI (6 e 12) – muro sky-700
        const isDividerAfterSix =
          colIndex === 7 || // primo blocco (dopo 6 caselle, es. giorno 17)
          colIndex === 13; // secondo blocco (6 caselle dopo, es. giorno 22)

        const dividerClass = isDividerAfterSix
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
            className={`relative overflow-hidden ${cellHeightClass} ${finalColor} ${borderClass} ${dividerClass} ${horizontalDividerClass}`}
            style={{ width: "32px" }}
          >
            {/* OVERLAY WEEKEND SOLO SOPRA, SOLO PRIMA RIGA, se non c'è highlight/force */}
            {isWeekendCell && !highlightColor && !forceColor && (
              <div className="absolute top-0 left-0 w-full h-1/2 bg-sky-500/40 pointer-events-none z-10" />
            )}

            {/* LABEL DATA (prima riga) */}
            {hasLabel && typeof label === "object" ? (
              <div className="relative z-20 flex flex-col justify-between items-center h-full py-1">
                <span className="text-sm leading-none font-bold">
                  {label.top}
                </span>
                <span className="text-lg leading-none font-extrabold">
                  {label.bottom}
                </span>
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

            {highlightTeams &&
              (() => {
                // separa pos1 e pos2 (es: "1A 2B")
                const [pos1, pos2] = highlightTeams.split(" ");

                const getStyle = (p) => {
                  if (!p) return "text-white text-[12px] font-xs";

                  // ✅ Caso 1: formato singolo valido → 1A, 2B, 3C
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

                  // ✅ Caso 2: formato multiplo SOLO per 3 → es: 3A/B/C/D/F
                  const multiThreeMatch = p.match(/^3[A-Z](\/[A-Z])+$/i);

                  if (multiThreeMatch) {
                    return "text-gray-200 text-[6px] font-bold tracking-tight";
                  }

                  // ✅ Tutto il resto resta neutro
                  return "text-white text-[12px] font-xs";
                };

                return (
                  <div className="absolute inset-0 flex flex-col justify-center items-center z-30 leading-none">
                    <span className={getStyle(pos1)}>{pos1}</span>

                    <span className={getStyle(pos2)}>{pos2}</span>
                  </div>
                );
              })()}

            {/* ORARIO PARTITA (solo righe città, se presente) */}
            {highlightTime && (
              <div className="absolute top-[20px] right-0 z-50 items-center justify-center">
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
