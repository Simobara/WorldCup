// src/components/1standingsComp/rettangolo.jsx

const ContainerCitta = ({ color = "bg-sky-900", label = "" }) => {
  return (
    <div
      className={`
        w-52 md:h-12 h-11
        ${color}
        border-2 border-black
        shadow-lg
        flex items-center justify-end   
        pr-10                           
      `}
    >
      {label && (
        <span className="text-lg font-black uppercase text-black text-right">
          {label}
        </span>
      )}
    </div>
  );
};

export default ContainerCitta;
