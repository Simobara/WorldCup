// src/components/1standingsComp/rettangolo.jsx

const ContainerCitta = ({ color = "bg-sky-900" }) => {
  return (
    <div
      className={`
        w-52 h-12
        ${color}
        
        border-2 border-black
        shadow-lg
      `}
    ></div>
  );
};

export default ContainerCitta;
