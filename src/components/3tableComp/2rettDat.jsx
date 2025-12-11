// src/components/2rettDat.jsx
const RettDat = ({ leftLabel, rightLabel, color = "bg-pink-700" }) => {
  return (
    <div
      className={`relative z-0
        md:h-16 sm:h-16 h-12
        md:w-32 sm:w-32 w-32
        md:-mt-2 mt-4
        ${color} rounded-[16px] shadow-xl overflow-hidden`}
    >
      {/* ✅ DATA + CITY – stessa linea */}
      <div className="absolute top-0 left-0 w-full h-[40%] flex items-center justify-between px-3 text-white">
        {/* DATA — più grande */}
        <span className="font-extrabold text-[13px] sm:text-[15px] leading-none">
          {leftLabel}
        </span>

        {/* CITY — a destra, più piccola */}
        <span className="font-semibold text-[10px] sm:text-[12px] leading-none text-right">
          {rightLabel}
        </span>
      </div>

      {/* ✅ Contenuto principale in BASSO */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] flex items-center justify-center">
        <p className="text-white font-bold text-[10px] sm:text-xs"></p>
      </div>
    </div>
  );
};

export default RettDat;
