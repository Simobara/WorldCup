const Lineahor = ({ orientation = "horizontal", className = "" }) => {
  const base = "absolute pl-[8rem] w-[80%] h-[2px] ";

  return <div className={`bg-gray-600  -mt-8 ml-8 ${base} ${className}`} />;
};

export default Lineahor;
