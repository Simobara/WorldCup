const Quadrato = ({ label }) => {
  return (
    <div className="relative w-16 h-16 bg-blue-900 border-x-2 border-y-4 border-blue-800 rounded-[16px] shadow-xl flex items-center justify-center">
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-white text-xs font-bold">
        {label}
      </span>
    </div>
  );
};

export default Quadrato;
