// src/components/2rettDat.jsx
const RettDat = ({
  leftLabel,
  rightLabel,
  timeLabel = "",
  color = "bg-pink-700",
}) => {
  // 🔄 CONVERSIONE "GIU/30" → "30/6"
  const convertDate = (raw) => {
    if (!raw) return "";

    // Esempio: "GIU/30"
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

    const monthNum = map[mon.toUpperCase()] || mon;
    return `${day}/${monthNum}`;
  };

  const dateFixed = convertDate(leftLabel);
  return (
    <div
      className={`relative z-0
        md:h-20 h-14
        md:w-32 w-32
        md:-mt-2 mt-2
        ${color} rounded-[16px] shadow-xl overflow-hidden`}
    >
      {/* DATA + ORA + CITY – stessa linea */}
      <div className="absolute -top-0 left-0 w-full h-[40%] flex items-center justify-between px-1 text-gray-900  gap-1">
        {/* DATA — più grande */}
        <span className="font-extrabold text-[12px] sm:text-[12px] leading-none">
          {dateFixed}
        </span>

        {/* ORARIO — in mezzo, leggermente più piccolo */}
        {timeLabel && (
          <span className="text-gray-700 font-bold text-[11px] sm:text-[10px] leading-none">
            {timeLabel}
          </span>
        )}

        {/* CITY — a destra */}
        <span className="font-semibold text-[10px] sm:text-[12px] leading-none text-right flex-1 truncate">
          {rightLabel}
        </span>
      </div>

      {/* Contenuto principale in basso (rimane vuoto per ora) */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] flex items-center justify-center">
        <p className="text-white font-bold text-[10px] sm:text-xs"></p>
      </div>
    </div>
  );
};

export default RettDat;
