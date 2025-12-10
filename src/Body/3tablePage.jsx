import BlokQuadRett from "../components/3tableComp/4blokQuadRett";

const TablePage = () => {
  return (
    // 👉 Wrapper come StandingsPage ma con scroll solo orizzontale su mobile
    <div
      className="
        flex-1 h-screen bg-black relative top-0
        overflow-y-hidden overflow-x-auto
        md:overflow-y-auto md:overflow-x-auto
      "
    >
      {/* Contenitore largo orizzontale: le 7 colonne una di fianco all'altra */}
      <div className="flex h-full min-w-[1200px] md:min-w-full max-w-[1800px] md:mx-auto mx-0 md:px-6 px-0">
        {/* ✅ PRIMA COLONNA */}
        <div className="relative flex-1 h-full bg-red flex flex-col items-center pt-12">
          <div className=" md:-mt-8 -mt-4">
            <BlokQuadRett />
          </div>

          <div>
            <div className="md:mt-10 mt-8">
              <BlokQuadRett />
            </div>

            <div className="md:mt-20 mt-16">
              <BlokQuadRett />
            </div>

            <div className="md:mt-10 mt-8">
              <BlokQuadRett />
            </div>

            <div className="md:mt-20 mt-16">
              <BlokQuadRett />
            </div>

            <div className="md:mt-10 mt-8">
              <BlokQuadRett />
            </div>

            <div className="md:mt-20 mt-16">
              <BlokQuadRett />
            </div>

            <div className="md:mt-10 mt-8">
              <BlokQuadRett />
            </div>
          </div>
        </div>

        {/* ✅ SECONDA COLONNA - ARANCIONE (4 BLOCCHI) */}
        <div className="relative flex-1 h-full flex bg-orange flex-col items-center pt-12">
          <div className="md:mt-8 mt-8 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-48 mt-40 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ GIALLA → 2 BLOCCHI PEGATI A SINISTRA */}
        <div className="relative flex-1 h-full bg-yellow flex flex-col items-start pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -ml-8">
            <BlokQuadRett />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -ml-8">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ VERDE → centrale dentro, laterali fuori------------------------------------------------------ */}
        <div className="flex-1 h-full bg-green- relative overflow-visible flex items-center justify-center">
          {/* ✅ BLOCCO CENTRALE (centrato nella colonna) */}
          <div className="relative z-10 md:-top-12 -top-28">
            <BlokQuadRett />
          </div>

          {/* ✅ BLOCCO SINISTRO (esce verso sinistra di 2rem) */}
          <div className="absolute left-1/2 -translate-x-full md:top-[28rem] top-[22rem] md:-ml-16 -ml-10 z-10">
            <BlokQuadRett />
          </div>

          {/* ✅ BLOCCO DESTRO (esce verso destra di 2rem) */}
          <div className="absolute right-1/2 translate-x-full md:top-[28rem] top-[22rem] md:-mr-16 -mr-10 z-10">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ BLU → 2 BLOCCHI (come la GIALLA) */}
        <div className="relative flex-1 h-full bg-yellow flex flex-col items-end pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -mr-8">
            <BlokQuadRett />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -mr-8">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ COLONNA INDIGO → 4 BLOCCHI (come ARANCIONE) */}
        <div className="relative flex-1 h-full bg-indigo flex flex-col items-center pt-12">
          <div className="md:mt-8 mt-8 mr-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-48 mt-40 mr-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ COLONNA VIOLA (come la PRIMA COLONNA) */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center pt-12">
          <div className="md:-mt-8 -mt-4">
            <BlokQuadRett />
          </div>
          <div className="md:mt-10 mt-8">
            <BlokQuadRett />
          </div>
          <div className="md:mt-20 mt-16">
            <BlokQuadRett />
          </div>
          <div className="md:mt-10 mt-8">
            <BlokQuadRett />
          </div>
          <div className="md:mt-20 mt-16">
            <BlokQuadRett />
          </div>
          <div className="md:mt-10 mt-8">
            <BlokQuadRett />
          </div>
          <div className="md:mt-20 mt-16">
            <BlokQuadRett />
          </div>
          <div className="md:mt-10 mt-8">
            <BlokQuadRett />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
