// src/components/1standingsComp/rettGroup.jsx (o rettangolo.jsx, come l'hai chiamato)

const RettGroup = ({
  color = "bg-sky-900",
  colsSpan = 1, // quante colonne copre
  noVertical = false, // se true: niente bordi verticali
}) => {
  const borderClass = noVertical
    ? "border-t-2 border-b-2 border-black" // solo sopra/sotto
    : "border-2 border-black"; // tutti i lati

  return (
    <div
      className={`
        h-12
        ${color}
        ${borderClass}
        shadow-lg
      `}
      style={{ width: `${32 * colsSpan}px` }} // 32px per colonna
    ></div>
  );
};

export default RettGroup;
