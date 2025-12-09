// src/components/Lineaver.jsx
const Lineaver32l = ({ orientation = "vertical", className = "" }) => {
  const base = "absolute top-16 h-[7rem] w-[2px]";

  return (
    <div
      className={`bg-gray-600         
        left-[calc(2rem+100%)] 
        -mt-8
        ${base} 
        ${className}`}
    />
  );
};

export default Lineaver32l;
