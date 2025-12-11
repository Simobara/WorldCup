// src/components/1standingsComp/rettGroup.jsx

const RettGroup = ({
  color = "bg-sky-900",
  colsSpan = 1, // quante colonne copre
  label = "", // ✅ testo opzionale
}) => {
  const isDarkBg =
    color.includes("gray-800") ||
    color.includes("gray-900") ||
    color.includes("black") ||
    color.includes("sky-900");

  const textColorClass = isDarkBg ? "text-white" : "text-black";

  return (
    <div
      className={`
        h-8
        ${color}
        border-2 border-black
        rounded-tr-3xl
        shadow-lg
        flex items-center justify-center
      `}
      style={{ width: `${32 * colsSpan}px` }}
    >
      {label && (
        <span className={`text-xs font-bold tracking-tight ${textColorClass}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default RettGroup;
