const RettDat = ({ leftLabel, rightLabel }) => {
  return (
    <div
      className="relative z-0
              w-32 h-16 
              sm:w-32 sm:h-16 
              md:w-32 md:h-20
              bg-sky-800 rounded-[16px] shadow-xl overflow-hidden"
    >
      {/* ✅ Area risultati in ALTO */}
      <div className="absolute top-0 left-0 w-full h-[20%] text-[10px] sm:text-xs text-white">
        <div className="grid grid-cols-3 h-full items-center px-2">
          <div className="flex justify-start">
            <span className="font-bold">{leftLabel}</span>
          </div>
          <div className="flex justify-end">
            <span className="font-bold">{rightLabel}</span>
          </div>
        </div>
      </div>

      {/* ✅ Contenuto principale in BASSO */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] flex items-center justify-center">
        <p className="text-white font-bold text-[10px] sm:text-xs"></p>
      </div>
    </div>
  );
};

export default RettDat;
