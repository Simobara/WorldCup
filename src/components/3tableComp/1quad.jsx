// src/components/3tableComp/1quad.jsx
const Quadrato = ({
  label,
  teamName,
  flag,
  phase = "round32",
  advanced = false,
}) => {
  // 🔹 background per fase
  const bgByPhase = {
    round32: "bg-sky-800",
    round16: "bg-emerald-700",
    quarter: "bg-cyan-900",
    semi: "bg-lime-700",
    final: "bg-yellow-400",
  };

  const bgColor = bgByPhase[phase] || "bg-sky-800";

  // 🔹 colore bordo in base se avanza
  const borderColor = advanced ? "border-sky-400" : "border-sky-400";

  // 🔹 se NON avanza → contenuto in scala di grigi
  const contentFilterClass = advanced ? "" : "filter grayscale";

  return (
    <div
      className={`
        relative w-16 md:h-16 h-12 
        ${bgColor} border-x-2 border-y-4 ${borderColor}
        rounded-[16px] shadow-xl flex items-center justify-center 
        overflow-hidden z-0
      `}
    >
      {/* Etichetta sopra TUTTO */}
      {label && (
        <span
          className="
            absolute z-50
            md:top-0 -top-1
            left-1/2 -translate-x-1/2 
            text-yellow-500 font-extrabold bg-black
            text-[0.55rem] md:text-[0.55rem] px-1
          "
        >
          {label}
        </span>
      )}

      {/* Contenuto (bandiera o nome) con eventuale grayscale */}
      <div className={`absolute inset-0 w-full h-full ${contentFilterClass}`}>
        {flag ? (
          <img
            src={flag}
            alt={teamName || label}
            className="
              w-full h-full 
              object-cover 
            "
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-[0.7rem] md:text-sm font-semibold text-white px-1 text-center">
            {teamName}
          </span>
        )}
      </div>
    </div>
  );
};

export default Quadrato;
