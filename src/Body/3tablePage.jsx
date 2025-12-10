import BlokQuadRett from "../components/2tableComp/4blokQuadRett";

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
      <div className="flex h-full w-max">
        {/* ✅ PRIMA COLONNA */}
        <div className="flex-1 h-full bg-red flex flex-col items-center pt-12">
          <div className="relative md:-mt-8 -mt-6">
            <BlokQuadRett />
          </div>

          <div>
            <div className="relative md:mt-12 mt-8">
              <BlokQuadRett />
            </div>

            <div className="relative mt-20">
              <BlokQuadRett />
            </div>

            <div className="relative md:mt-12 mt-8">
              <BlokQuadRett />
            </div>

            <div className="relative mt-20">
              <BlokQuadRett />
            </div>

            <div className="relative md:mt-12 mt-8">
              <BlokQuadRett />
            </div>

            <div className="relative mt-20">
              <BlokQuadRett />
            </div>

            <div className="relative md:mt-12 mt-8">
              <BlokQuadRett />
            </div>
          </div>
        </div>

        {/* ✅ SECONDA COLONNA - ARANCIONE (4 BLOCCHI) */}
        <div className="flex-1 h-full flex bg-orange flex-col items-center pt-12">
          <div className="relative md:mt-8 mt-4 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-48 mt-44 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-48 mt-44 ml-2">
            <BlokQuadRett />
          </div>
          <div className="md:mt-48 mt-44 ml-2">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ GIALLA → 2 BLOCCHI PEGATI A SINISTRA */}
        <div className="flex-1 h-full bg-yellow flex flex-col items-start pt-12">
          <div className="md:mt-[10rem] mt-[8.5rem]">
            <BlokQuadRett />
          </div>

          <div className="md:mt-[28rem] mt-[26rem]">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ VERDE → centrale dentro, laterali fuori */}
        <div className="flex-1 h-full bg-green relative overflow-visible flex items-center justify-center">
          {/* ✅ BLOCCO CENTRALE (centrato nella colonna) */}
          <div className="relative z-10">
            <BlokQuadRett />
          </div>

          {/* ✅ BLOCCO SINISTRO (esce verso sinistra di 2rem) */}
          <div className="absolute left-1/2 -translate-x-full -ml-28 z-0">
            <BlokQuadRett />
          </div>

          {/* ✅ BLOCCO DESTRO (esce verso destra di 2rem) */}
          <div className="absolute left-1/2 ml-28 z-0">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ BLU → 2 BLOCCHI (come la GIALLA) */}
        <div className="flex-1 h-full bg-yellow flex flex-col items-end pt-12">
          <div className="mt-[10rem]">
            <BlokQuadRett />
          </div>

          <div className="mt-[28rem]">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ COLONNA INDIGO → 4 BLOCCHI (come ARANCIONE) */}
        <div className="flex-1 h-full bg-indigo flex flex-col items-center pt-12">
          <div className="mt-8">
            <BlokQuadRett />
          </div>
          <div className="mt-48">
            <BlokQuadRett />
          </div>
          <div className="mt-48">
            <BlokQuadRett />
          </div>
          <div className="mt-48">
            <BlokQuadRett />
          </div>
        </div>

        {/* ✅ COLONNA VIOLA (come la PRIMA COLONNA) */}
        <div className="flex-1 h-full bg-purple flex flex-col items-center pt-12">
          <div className="-mt-8">
            <BlokQuadRett />
          </div>
          <div className="mt-12">
            <BlokQuadRett />
          </div>
          <div className="mt-20">
            <BlokQuadRett />
          </div>
          <div className="mt-12">
            <BlokQuadRett />
          </div>
          <div className="mt-20">
            <BlokQuadRett />
          </div>
          <div className="mt-12">
            <BlokQuadRett />
          </div>
          <div className="mt-20">
            <BlokQuadRett />
          </div>
          <div className="mt-12">
            <BlokQuadRett />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
