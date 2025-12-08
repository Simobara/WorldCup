const RettRis = () => {
  return (
    <div className="relative w-32 h-20 bg-cyan-900 border-x-2 border-y-4 border-white rounded-[16px] shadow-xl overflow-hidden">
      {/* Contenuto principale (parte alta) */}
      <div className="absolute top-0 left-0 w-full h-[40%] flex items-center justify-center">
        <p className="text-white font-bold text-xs"></p>
      </div>

      {/* ✅ Area risultati: 2 numeri + 1 quadrato cliccabile per riga */}
      <div className="absolute bottom-0 left-0 w-full h-[60%] text-[10px] text-white">
        {/* ✅ RIGA 1 */}
        <div className="grid grid-cols-3 h-1/3 items-center">
          <div className="flex justify-center">1</div>

          <button className="w-3 h-3 bg-white rounded-sm mx-auto cursor-pointer"></button>

          <div className="flex justify-center">1</div>
        </div>

        {/* ✅ RIGA 2 */}
        <div className="grid grid-cols-3 h-1/3 items-center">
          <div className="flex justify-center">1</div>

          <button className="w-3 h-3 bg-white rounded-sm mx-auto cursor-pointer"></button>

          <div className="flex justify-center">1</div>
        </div>

        {/* ✅ RIGA 3 */}
        <div className="grid grid-cols-3 h-1/3 items-center">
          <div className="flex justify-center">5</div>

          <button className="w-3 h-3 bg-white rounded-sm mx-auto cursor-pointer"></button>

          <div className="flex justify-center">4</div>
        </div>
      </div>
    </div>
  );
};

export default RettRis;
