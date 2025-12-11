// src/components/3tableComp/1quad.jsx
const Quadrato = ({ label, teamName, flag }) => {
  return (
    <div
      className="
        relative w-16 md:h-16 h-12 
        bg-sky-800 border-x-2 border-y-4 border-gray-800 
        rounded-[16px] shadow-xl flex items-center justify-center 
        overflow-hidden z-0
      "
    >
      {/* Etichetta sopra TUTTO */}
      {label && (
        <span
          className="
            absolute z-50
            md:-top-1 -top-1
            left-1/2 -translate-x-1/2 
            text-orange-500 font-extrabold 
            text-[0.6rem] md:text-xs
          "
        >
          {label}
        </span>
      )}

      {/* Bandiera FULL COVER sotto la label */}
      {flag ? (
        <img
          src={flag}
          alt={teamName || label}
          className="
            absolute inset-0 
            w-full h-full 
            object-cover 
            z-10
          "
        />
      ) : (
        <span className="z-10 text-[0.7rem] md:text-sm font-semibold text-white px-1 text-center">
          {teamName}
        </span>
      )}
    </div>
  );
};

export default Quadrato;
