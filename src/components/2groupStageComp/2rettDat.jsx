// src/components/2rettDat.jsx

const RettDat = ({ leftLabel, rightLabel }) => {
  return (
    <div
      className="relative 
                    w-24 h-16 
                    sm:w-28 sm:h-16 
                    md:w-32 md:h-20
                    bg-pink-900 rounded-[16px] shadow-xl overflow-hidden"
    >
      {/* ✅ Area risultati in ALTO */}
      <div className="absolute top-0 left-0 w-full h-[20%] text-[10px] sm:text-xs text-white">
        <div className="grid grid-cols-3 h-full items-center px-2">
          {/* testo sinistra, più interno */}
          <div className="flex justify-start">
            <span className="font-bold">{leftLabel}</span>
          </div>

          {/* bottone al centro */}
          {/* <button className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-sm mx-auto cursor-pointer"></button> */}

          {/* testo destra, più interno */}
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
