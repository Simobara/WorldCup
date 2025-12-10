import { useLocation, useNavigate } from "react-router-dom";

const TopInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div
      className="
    absolute top-[40%] right-2 -translate-y-1/2
    md:top-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:translate-y-0
    w-auto md:w-[100%] md:max-w-[420px]
    bg-rose-950 shadow-lg
    px-0 md:px-6 md:py-2 py-2
    flex flex-col md:flex-row items-center justify-center gap-4 
    z-[999] rounded-xl
  "
    >
      {/* ✅ STANDINGS */}
      <div
        onClick={() => navigate("/standingsPage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/standingsPage") ? "bg-gray-300 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        🗓️
      </div>
      {/* ✅ GROUP STAGE */}
      <div
        onClick={() => navigate("/groupStagePage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/groupStagePage") ? "bg-gray-300 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        🧩
      </div>
      {/* ✅ TABLE */}
      <div
        onClick={() => navigate("/tablePage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/tablePage") ? "bg-gray-300 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        📊
      </div>
    </div>
  );
};

export default TopInfo;
