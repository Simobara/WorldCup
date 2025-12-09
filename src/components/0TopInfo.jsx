import { useNavigate } from "react-router-dom";

const TopInfo = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        absolute top-0 left-1/2 -translate-x-1/2 z-50
        w-[100%] max-w-[420px]
        bg-white rounded-xl shadow-lg
        px-6 py-3
        flex items-center justify-between gap-2
      "
    >
      {/* ✅ STANDINGS */}
      <div
        onClick={() => navigate("/StandingsPage")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-200 transition cursor-pointer"
      >
        StandingsPage
      </div>

      {/* ✅ GROUP STAGE */}
      <div
        onClick={() => navigate("/")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-200 transition cursor-pointer"
      >
        GroupStagePage
      </div>

      {/* ✅ TABELLONE (home) */}
      <div
        onClick={() => navigate("/TablePage")}
        className="text-black font-normal rounded-lg text-md px-2 py-1 hover:bg-sky-200 transition cursor-pointer"
      >
        TablePage
      </div>
    </div>
  );
};

export default TopInfo;
