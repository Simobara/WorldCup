// src/components/3tableComp/6rettDatSemif.jsx
const RettDatSemif = ({
  leftLabel, // es: "GIU/30" (data)
  rightLabel, // es: "Lima" (città)
  timeLabel = "", // es: "20:00"
  color = "bg-pink-700",

  // ✅ NEW
  showReset = false,
  onReset = null,
}) => {
  const convertDate = (raw) => {
    if (!raw) return "";
    const [mon, day] = raw.split("/");

    const map = {
      GEN: 1,
      FEB: 2,
      MAR: 3,
      APR: 4,
      MAG: 5,
      GIU: 6,
      LUG: 7,
      AGO: 8,
      SET: 9,
      OTT: 10,
      NOV: 11,
      DIC: 12,
    };

    const monthNum = map[mon?.toUpperCase?.()] || mon;
    return `${day}/${monthNum}`;
  };

  const dateFixed = convertDate(leftLabel);

  return (
    <div
      className={`
      group relative 
      ${color}
      md:-top-[6.4rem] -top-[6.5rem]
      md:w-32 w-32
      md:h-40 h-40
      rounded-[16px]
      shadow-xl
      overflow-hidden
      flex
      items-start
      px-2
      py-2
    `}
    >
      {/* ✅ RESET X */}

      {showReset && typeof onReset === "function" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset?.();
          }}
          className="
      absolute -right-1 top-0 z-50
      w-5 h-6
      bg-cyan-400 text-black
      font-extrabold text-[14px]
      flex items-center justify-center
      opacity-100
      hover:scale-105
    "
          aria-label="Reset"
        >
          ✕
        </button>
      )}

      {/* ✅ DATA + ORARIO + CITTÀ — UNA SOLA RIGA */}
      <div className="w-full flex items-center gap-1 whitespace-nowrap overflow-hidden">
        {/* DATA */}
        <span className="font-extrabold text-[12px] leading-none text-gray-900 shrink-0">
          {dateFixed}
        </span>

        {/* ORARIO */}
        {timeLabel && (
          <span className="font-bold text-[11px] leading-none text-gray-700 shrink-0">
            {timeLabel}
          </span>
        )}

        {/* CITTÀ */}
        <span className="font-semibold text-[11px] leading-none text-gray-900 truncate">
          {rightLabel}
        </span>
      </div>
    </div>
  );
};

export default RettDatSemif;
