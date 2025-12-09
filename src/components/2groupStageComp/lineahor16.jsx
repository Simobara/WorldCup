const Lineahor16 = ({
  width = "w-[220px]",
  mt = "-mt-20",
  ml = "ml-40",
  pl = "pl-[8rem]",
  color = "bg-gray-600",
  className = "",
}) => {
  const base = `absolute ${pl} h-[2px]`;

  return (
    <div className={`${color} ${mt} ${ml} ${width} ${base} ${className}`} />
  );
};

export default Lineahor16;
