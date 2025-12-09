import BlokQuadRett from "../components/2groupStageComp/4blokQuadRett";
// Se in futuro riattivi le linee, puoi importarle qui:
// import Lineahor32 from "./Lineahor32";
// import Lineahor16 from "./Lineahor16";
// import Lineaver32 from "./Lineaver32";

const TablePage = () => {
  return (
    <>
      {/* ✅ PRIMA COLONNA */}
      <div className="flex-1 h-full bg-red flex flex-col items-center pt-12">
        <div className="relative -mt-8">
          <BlokQuadRett />
          {/* <Lineahor32
                width="w-[80vw] sm:w-[75vw] md:w-[80%]"
                mt="-mt-8"
                ml="ml-[4vw]"
                pl="pl-[4rem]"
              />
              <Lineaver32 /> */}
        </div>

        <div>
          <div className="relative mt-12">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[75vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                />
                <Lineahor16
                  width="w-[30vw] sm:w-[35vw] md:w-[13vw]"
                  mt="-mt-20"
                  ml="ml-40"
                  pl="pl-[4rem]"
                /> */}
          </div>

          <div className="relative mt-20">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                /> */}
            {/* <Lineaver32 /> */}
          </div>
          <div className="relative mt-12">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                /> */}
            {/* <Lineahor16
                  width="w-[30vw] sm:w-[35vw] md:w-[13vw]"
                  mt="-mt-20"
                  ml="ml-40"
                  pl="pl-[4rem]"
                /> */}
          </div>
          <div className="relative mt-20">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                /> */}
            {/* <Lineaver32 /> */}
          </div>
          <div className="relative mt-12">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                />
                <Lineahor16
                  width="w-[30vw] sm:w-[35vw] md:w-[13vw]"
                  mt="-mt-20"
                  ml="ml-40"
                  pl="pl-[4rem]"
                /> */}
          </div>
          <div className="relative mt-20">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                />
                <Lineaver32 /> */}
          </div>
          <div className="relative mt-12">
            <BlokQuadRett />
            {/* <Lineahor32
                  width="w-[80vw] sm:w-[70vw] md:w-[80%]"
                  mt="-mt-8"
                  ml="ml-[4vw]"
                  pl="pl-[4rem]"
                />
                <Lineahor16
                  width="w-[30vw] sm:w-[35vw] md:w-[13vw]"
                  mt="-mt-20"
                  ml="ml-40"
                  pl="pl-[4rem]"
                /> */}
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
    </>
  );
};

export default TablePage;
