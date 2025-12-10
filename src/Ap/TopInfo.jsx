import { useLocation, useNavigate } from "react-router-dom";

const TopInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div
      className="
        absolute top-0 left-1/2 -translate-x-1/2
        w-[100%] max-w-[420px]
        bg-cyan-700  shadow-lg
        px-6 md:py-2 py-0
        flex items-center justify-center gap-2 z-[999]
      "
    >
      {/* ✅ STANDINGS */}
      <div
        onClick={() => navigate("/standingsPage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/standingsPage") ? "bg-rose-700 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        🗓️
      </div>
      {/* ✅ GROUP STAGE */}
      <div
        onClick={() => navigate("/groupStagePage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/groupStagePage") ? "bg-rose-700 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        🧩
      </div>
      {/* ✅ TABLE */}
      <div
        onClick={() => navigate("/tablePage")}
        className={`
          text-black font-normal rounded-lg text-md px-2 py-1 cursor-pointer transition
          ${isActive("/tablePage") ? "bg-rose-700 text-white" : "hover:bg-sky-700 hover:text-white"}
        `}
      >
        📊
      </div>
    </div>
  );
};

export default TopInfo;
