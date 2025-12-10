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

        // ❗ weekend SOLO sulla PRIMA RIGA (date)
        const isWeekendCell = rowIndex === 0 && hasLabel && label.isWeekend;

        // 👇 chiave univoca cella
        const cellKey = `${rowIndex}-${colIndex}`;
        const rawHighlight = highlightedCells[cellKey];

        // 👇 può essere stringa ("bg-...") o oggetto { color, label }
        let highlightColor = null;
        let highlightLabel = null;

        if (typeof rawHighlight === "string") {
          highlightColor = rawHighlight;
        } else if (rawHighlight && typeof rawHighlight === "object") {
          highlightColor = rawHighlight.color || null;
          highlightLabel = rawHighlight.label || null;
        }

        // 👇 ordine di priorità: highlight > forceColor > pattern
        //    il weekend NON cambia il colore di base, aggiunge solo un overlay
        const finalColor = highlightColor || forceColor || config.color;

        return (
          <div
            key={i}
            className={`relative overflow-hidden ${cellHeightClass} ${finalColor} ${borderClass}`}
            style={{ width: "32px" }}
          >
            {/* ✅ OVERLAY WEEKEND SOLO SOPRA, SOLO PRIMA RIGA, solo se non highlight/force */}
            {isWeekendCell && !highlightColor && !forceColor && (
              <div className="absolute top-0 left-0 w-full h-1/2 bg-sky-600 pointer-events-none z-10" />
            )}

            {/* ✅ LABEL SOLO IN PRIMA RIGA (le date) */}
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

            {/* ✅ LETTERA DEL GRUPPO IN ALTO, righe > 0 */}
            {rowIndex > 0 && highlightLabel && (
              <div className="absolute top-0 left-0 w-full flex justify-center z-30">
                <span className="text-[10px] font-extrabold leading-none translate-y-[-1px]">
                  {highlightLabel}
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
