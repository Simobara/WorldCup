// src/components/1standingsComp/containerCitta.jsx

const ContainerCitta = ({ color = "bg-sky-900", label = "", abbr = "" }) => {
  return (
    <div
      className={`
        md:w-52 w-14 md:h-12 h-10
        ${color}
        border-2 border-black
        shadow-lg
        flex md:items-end items-center
        md:justify-end justify-start
        pr-0 md:pr-10
      `}
    >
      {label && (
        <>
          {/* ✅ MOBILE: abbreviazione PIÙ PICCOLA */}
          <span
            className="
              block md:hidden
              text-[7px]
              leading-none
              font-extrabold
              uppercase
              text-black
              pl-[6px]
            "
          >
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
