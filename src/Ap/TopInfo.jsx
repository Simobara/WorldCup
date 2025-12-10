import { useNavigate } from "react-router-dom";

const TopInfo = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        absolute top-0 left-1/2 -translate-x-1/2
        w-[100%] max-w-[420px]
        bg-white rounded-xl shadow-lg
        px-6 md:py-2 py-0
        flex items-center justify-between gap-2 z-[999]
      "
    >
      {/* ✅ STANDINGS */}
      <div
        onClick={() => navigate("/standingsPage")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-700 transition cursor-pointer"
      >
        StandingsPage
      </div>

      {/* ✅ GROUP STAGE */}
      <div
        onClick={() => navigate("/groupStagePage")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-700 transition cursor-pointer"
      >
        GroupStagePage
      </div>

      {/* ✅ TABLE */}
      <div
        onClick={() => navigate("/tablePage")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-700 transition cursor-pointer"
      >
        TablePage
      </div>
    </div>
  );
};

export default TopInfo;
