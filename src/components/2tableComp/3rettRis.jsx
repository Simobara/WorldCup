const RettRis = () => {
  return (
    <div className="relative w-32 h-20 bg-transparent md:bg-cyan-800 rounded-[16px] overflow-hidden">
      {/* Contenuto principale (parte alta) */}
      <div className="absolute top-0 left-0 w-full h-[40%] flex items-center justify-center">
        <p className="text-white font-bold text-xs"></p>
      </div>

      {/* ✅ Area risultati: UNA SOLA RIGA */}
      <div className="absolute bottom-6 md:bottom-0 left-0 w-full h-[20%] text-black flex items-center justify-center">
        <div className="flex items-center justify-between w-full px-2">
          {/* BLOCCO SINISTRO → 1 2 */}
          <div className="flex items-center gap-1 text-black">
            <span className="text-xl font-bold text-black">1</span>
            <span className="text-sm font-bold text-gray-700">2</span>
          </div>

          {/* BLOCCO CENTRALE → 3 - 3 */}
          <div className="flex items-center gap-1 ">
            <span className="text-sm font-bold text-gray-500">3</span>
            <span className="text-sm font-bold">-</span>
            <span className="text-sm font-bold text-gray-500">3</span>
          </div>

          {/* BLOCCO DESTRO → 2 1 */}
          <div className="flex items-center gap-1 ">
            <span className="text-sm font-bold text-gray-700">2</span>
            <span className="text-xl font-bold text-black">1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RettRis;
