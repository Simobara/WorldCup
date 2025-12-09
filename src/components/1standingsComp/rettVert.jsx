// src/components/1standingsComp/rettVert.jsx

const RettangoloVerticale = ({
  color = "bg-gray-300",
  top = "top-8",
  height = "h-[18rem]",
  label = "",
}) => {
  return (
    <div
      className={`
        absolute
        ${top}
        left-2
        w-12
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
        <span
          className="
            text-sm uppercase text-black
            font-medium
            transform -rotate-90        
            whitespace-nowrap
            tracking-widest
          "
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default RettangoloVerticale;
