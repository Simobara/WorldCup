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
    [6, "bg-gray-600", false, false],
    [4, "bg-gray-400", false, false],
    [1, "bg-gray-800", true, false],
    [3, "bg-gray-400", false, false],
    [2, "bg-gray-800", true, true],
    [2, "bg-gray-400", false, false],
    [2, "bg-gray-800", true, true],
    [2, "bg-gray-400", false, false],
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

        if (typeof rawHighlight === "string") {
          highlightColor = rawHighlight;
        } else if (rawHighlight && typeof rawHighlight === "object") {
          highlightColor = rawHighlight.color || null;
          highlightLabel = rawHighlight.label || null;
          highlightTeams = rawHighlight.teams || null;
          highlightGoto = rawHighlight.goto || null; // ⭐ nuovo
        }

        // ordine di priorità: highlight > forceColor > pattern base
        const finalColor = highlightColor || forceColor || config.color;

        // DIVISORI VERTICALI (6 e 12) – muro sky-700
        const isDividerAfterSix =
          colIndex === 6 || // primo blocco (dopo 6 caselle, es. giorno 17)
          colIndex === 12; // secondo blocco (6 caselle dopo, es. giorno 22)

        const dividerClass = isDividerAfterSix
          ? "border-l-8 border-l-sky-700"
          : "";

        return (
          <div
            key={i}
            className={`relative overflow-hidden ${cellHeightClass} ${finalColor} ${borderClass} ${dividerClass}`}
            style={{ width: "32px" }}
          >
            {/* OVERLAY WEEKEND SOLO SOPRA, SOLO PRIMA RIGA, se non c'è highlight/force */}
            {isWeekendCell && !highlightColor && !forceColor && (
              <div className="absolute top-0 left-0 w-full h-1/2 bg-sky-600 pointer-events-none z-10" />
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
            {highlightLabel && rowIndex > 0 && (
              <div className="absolute top-0 left-0 w-full flex justify-center z-30">
                <span className="text-[10px] font-extrabold leading-none translate-y-[-1px]">
                  {highlightLabel}
                </span>
              </div>
            )}

            {/* SIGLA SQUADRE CENTRATA NEL QUADRATO (prime 3 lettere team1-team2) */}
            {highlightTeams && (
              <div className="absolute inset-0 flex justify-center items-center z-30">
                <span className="text-white text-[12px] font-extrabold leading-none tracking-wide">
                  {highlightTeams}
                </span>
              </div>
            )}
            {/* NUMERO GOTO IN BASSO (solo se esiste, es. knockout) */}
            {highlightGoto && rowIndex > 0 && (
              <div className="absolute bottom-[1px] left-2 w-full flex justify-center items-center z-40">
                <span className="text-yellow-200 text-[9px] font-extrabold leading-none">
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
