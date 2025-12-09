import StandingsBlock from "../components/1standingsComp/standingsBlock";

const StandingsPage = () => {
  return (
    <div className="flex-1 h-full bg-white relative">
      <StandingsBlock />

      <div className="h-full flex items-center justify-center">
        <h1 className="text-3xl font-bold text-sky-900">Standings Page</h1>
      </div>
    </div>
  );
};

export default StandingsPage;
