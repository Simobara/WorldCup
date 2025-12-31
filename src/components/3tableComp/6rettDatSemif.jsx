// src/components/2rettDat.jsx
const RettDatSemif = ({
  leftLabel, // es: "GIU/30" (data)
  rightLabel, // es: "Lima" (città)
  timeLabel = "", // es: "20:00"
  color = "bg-pink-700",
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
    relative
    ${color}
    md:-top-[6.4rem] -top-[8rem]
    md:w-32 w-32
    md:h-40 h-32
    rounded-[16px]
    shadow-xl
    overflow-hidden
    flex
    items-start
    px-2
    py-2
  `}
    >
      {/* ✅ DATA + ORARIO + CITTÀ — UNA SOLA RIGA */}
      <div className="w-full flex items-center gap-2 whitespace-nowrap overflow-hidden">
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
