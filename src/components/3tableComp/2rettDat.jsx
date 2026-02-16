import { useEffect, useRef, useState } from "react";

// src/components/2rettDat.jsx
const RettDat = ({
  leftLabel,
  rightLabel,
  timeLabel = "",
  color = "bg-pink-700",
  showReset = false, // ✅ NEW
  onReset = null, // ✅ NEW
  disableHover = false, // ✅ NEW
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

  const flashX = () => {
    setXActive(true);
    if (xTimerRef.current) clearTimeout(xTimerRef.current);
    xTimerRef.current = setTimeout(() => setXActive(false), 1000);
  };
  const [xActive, setXActive] = useState(false);
  const xTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (xTimerRef.current) clearTimeout(xTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`group relative z-0
        md:h-20 h-14
        md:w-32 w-32
        md:-mt-2 -mt-1
        ${color} rounded-[16px] shadow-xl overflow-hidden
        ${disableHover ? "" : "transition-all duration-150 hover:brightness-110 hover:ring-2 hover:ring-white/70"}
      `}
    >
      {showReset && typeof onReset === "function" && (
        <button
          type="button"
          onPointerDown={flashX} // ✅ mobile: touch immediato
          onClick={async () => {
            flashX(); // ✅ anche click desktop
            await onReset?.();
          }}
          className={`
  absolute right-0 -top-1 z-50
  rounded-full bg-cyan-300 px-0 py-1
  text-black
  transition-opacity duration-200
  

  opacity-100 md:${xActive ? "opacity-100" : "opacity-35"}

  
  hover:opacity-100
  active:opacity-100
`}
          aria-label="Reset"
        >
          ✕
        </button>
      )}

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
