// src/components/1standingsComp/containerCitta.jsx

const ContainerCitta = ({ color = "bg-sky-900", label = "", abbr = "" }) => {
  return (
    <div
      className={`
        md:w-52 w-30 md:h-12 h-10
        ${color}
        border-2 border-black
        shadow-lg
        flex md:items-end items-start
        md:justify-end justify-start
        pr-0 md:pr-10                           
      `}
    >
      {label && (
        <>
          {/* ✅ MOBILE: usa l’abbreviazione */}
          <span className="block md:hidden text-[9px] font-black uppercase text-black md:text-right pl-[6px]">
            {abbr}
          </span>

          {/* ✅ DESKTOP: nome completo */}
          <span className="hidden md:block text-lg font-black uppercase text-black md:text-right">
            {label}
          </span>
        </>
      )}
    </div>
  );
};

export default ContainerCitta;
