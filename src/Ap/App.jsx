import BlokQuadRett from "../components/4blokQuadRett";
import Lineahor from "../components/5lineahor";
import Lineaver32l from "../components/Lineaver32l";

const App = () => {
  return (
    <>
      <div className="h-screen w-screen bg-sky-950 relative">
        {/* Contenitore colonne al 90% dell’altezza */}
        <div className="h-[100%] w-full flex">
          {/* ✅ PRIMA COLONNA */}
          <div className="flex-1 h-full bg-red flex flex-col items-center pt-12">
            <div className="relative -mt-8">
              <BlokQuadRett />
              <Lineahor />
              <Lineaver32l />
            </div>

            <div>
              <div className="relative mt-12">
                <BlokQuadRett />
                <Lineahor />
              </div>

              <div className="relative mt-20">
                <BlokQuadRett />
                <Lineahor />
                <Lineaver32l />
              </div>
              <div className="relative mt-12">
                <BlokQuadRett />
                <Lineahor />
              </div>
              <div className="relative mt-20">
                <BlokQuadRett />
                <Lineahor />
                <Lineaver32l />
              </div>
              <div className="relative mt-12">
                <BlokQuadRett />
                <Lineahor />
              </div>
              <div className="relative mt-20">
                <BlokQuadRett />
                <Lineahor />
                <Lineaver32l />
              </div>
              <div className="relative mt-12">
                <BlokQuadRett />
                <Lineahor />
              </div>
            </div>
          </div>

          {/* Altre 6 colonne colorate */}
          {/* ✅ SECONDA COLONNA - ARANCIONE (4 BLOCCHI) */}
          <div className="flex-1 h-full flex bg-orange flex-col items-center pt-12">
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

          {/* ✅ GIALLA → 2 BLOCCHI PEGATI A SINISTRA */}
          <div className="flex-1 h-full bg-yellow flex flex-col items-start pt-12">
            <div className="mt-[10rem]">
              <BlokQuadRett />
            </div>

            <div className="mt-[28rem]">
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
    </>
  );
};

export default App;
