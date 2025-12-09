import BlokQuadRett from "../components/4blokQuadRett";

const App = () => {
  return (
    <>
      <div className="h-screen w-screen bg-sky-950 relative">
        {/* Contenitore colonne al 90% dell’altezza */}
        <div className="h-[99%] w-full flex">
          {/* ✅ PRIMA COLONNA */}
          <div className="flex-1 h-full bg-red flex flex-col items-center pt-12">
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
            <div className="mt-12">
              <BlokQuadRett />
            </div>
          </div>

          {/* Altre 6 colonne colorate */}
          <div className="flex-1 h-full bg-orange-500"></div>
          <div className="flex-1 h-full bg-yellow-500"></div>
          <div className="flex-1 h-full bg-green-500"></div>
          <div className="flex-1 h-full bg-blue-500"></div>
          <div className="flex-1 h-full bg-indigo-500"></div>
          <div className="flex-1 h-full bg-purple-500"></div>
        </div>
      </div>
    </>
  );
};

export default App;
