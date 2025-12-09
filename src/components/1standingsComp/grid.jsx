// src/components/1standingsComp/grid.jsx

const Grid = ({
  rows = 16,
  cols = 38,
  cellHeightClass = "h-12",
  forceColor = null,
  patternOverride = null,
  columnLabels = [], // ✅ etichette per colonna (solo prima riga)
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

        // ✅ PRIMA: etichetta (solo sulla prima riga)
        const label = rowIndex === 0 ? columnLabels[colIndex] : null;
        const hasLabel = !!label;

        // ✅ POI: weekend (solo se c'è una label e ha il flag)
        const isWeekendCell = hasLabel && label.isWeekend;

        // ✅ POI: colore finale
        const finalColor =
          forceColor || (isWeekendCell ? "bg-sky-400" : config.color);

        return (
          <div
            key={i}
            className={`${cellHeightClass} ${finalColor} ${borderClass}`}
            style={{ width: "32px" }}
          >
            {hasLabel && typeof label === "object" ? (
              <div className="flex flex-col justify-between items-center h-full py-1">
                {/* giorno della settimana in alto (S, M, T, ecc.) */}
                <span className="text-sm leading-none font-bold">
                  {label.top}
                </span>
                {/* numero del giorno in basso */}
                <span className="text-lg leading-none font-extrabold">
                  {label.bottom}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
