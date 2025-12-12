// src/components/1standingsComp/rettVert.jsx

const RettangoloVerticale = ({
  color = "bg-gray-200",
  top = "top-8",
  height = "h-[18rem]",
  label = "",
  labelMobile = "",
}) => {
  // 🔹 Testo usato su mobile: se non passi labelMobile,
  // togliamo automaticamente la parola "REGION" dal label completo
  const mobileText = (labelMobile || label.replace(/ *REGION/i, "")).trim();

  return (
    <div
      className={`
        absolute
        ${top}
        left-2
        md:w-12 w-6
        ${height}
        ${color}
        border-2 border-black
        shadow-lg
        rounded-tl-3xl
        rounded-bl-3xl
        flex items-center justify-center   
      `}
    >
      {label && (
        <>
          {/* ✅ MOBILE: testo corto SENZA "REGION" */}
          <span
            className="
              block md:hidden
              text-[10px] uppercase text-black
              font-medium
              transform -rotate-90        
              whitespace-nowrap
              tracking-widest
            "
          >
            {mobileText}
          </span>

          {/* ✅ DESKTOP: testo completo (con REGION) */}
          <span
            className="
              hidden md:block
              text-sm uppercase text-black
              font-medium
              transform -rotate-90        
              whitespace-nowrap
              tracking-widest
            "
          >
            {label}
          </span>
        </>
      )}
    </div>
  );
};

export default RettangoloVerticale;
