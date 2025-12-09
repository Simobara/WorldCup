const Lineahor32 = ({
  width = "w-[80%]",
  mt = "-mt-8",
  ml = "ml-8",
  pl = "pl-[8rem]",
  color = "bg-gray-600",
  className = "",
}) => {
  const base = `absolute ${pl} h-[2px]`;

  return (
    <div className={`${color} ${mt} ${ml} ${width} ${base} ${className}`} />
  );
};

export default Lineahor32;
