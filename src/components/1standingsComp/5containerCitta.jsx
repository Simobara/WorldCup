// src/components/1standingsComp/containerCitta.jsx

const ContainerCitta = ({ color = "bg-sky-900", label = "" }) => {
  const shortLabel = label.slice(0, 3).toUpperCase(); // solo 3 lettere per mobile

  return (
    <div
      className={`
        md:w-52 w-30 md:h-12 h-10
        ${color}
        border-2 border-black
        shadow-lg
        flex items-center justify-end   
        pr-3 md:pr-10                           
      `}
    >
      {label && (
        <>
          {/* ✅ MOBILE: solo 3 lettere */}
          <span className="block md:hidden text-sm font-black uppercase text-black text-right">
            {shortLabel}
          </span>

          {/* ✅ DESKTOP: nome completo */}
          <span className="hidden md:block text-lg font-black uppercase text-black text-right">
            {label}
          </span>
        </>
      )}
    </div>
  );
};

export default ContainerCitta;
