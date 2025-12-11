import BlokQuadRett from "../components/3tableComp/4blokQuadRett";
import { groupFinal } from "../START/app/1GroupFinal";

const TablePage = () => {
  const round32 = groupFinal.round32;

  // prendo tutti i match delle giornate in un unico array
  const allRound32Matches = Object.values(round32).flatMap((giornata) =>
    giornata.matches.map((match) => ({
      ...match,
      date: giornata.dates[0] || "",
    }))
  );

  const getMatchByFg = (fgCode) =>
    allRound32Matches.find((m) => m.fg === fgCode) || null;

  // 🔹 A
  const mA1 = getMatchByFg("A1");
  const mA2 = getMatchByFg("A2");
  const mA3 = getMatchByFg("A3");
  const mA4 = getMatchByFg("A4");

  // 🔹 B
  const mB1 = getMatchByFg("B1");
  const mB2 = getMatchByFg("B2");
  const mB3 = getMatchByFg("B3");
  const mB4 = getMatchByFg("B4");

  // 🔹 C
  const mC1 = getMatchByFg("C1");
  const mC2 = getMatchByFg("C2");
  const mC3 = getMatchByFg("C3");
  const mC4 = getMatchByFg("C4");

  // 🔹 D
  const mD1 = getMatchByFg("D1");
  const mD2 = getMatchByFg("D2");
  const mD3 = getMatchByFg("D3");
  const mD4 = getMatchByFg("D4");

  return (
    <div
      className="
        flex-1 h-screen bg-black relative top-0
        overflow-y-hidden overflow-x-auto
        md:overflow-y-auto md:overflow-x-auto
      "
    >
      {/* Contenitore largo orizzontale: le 7 colonne una di fianco all'altra */}
      <div className="flex h-full min-w-[1200px] md:min-w-full max-w-[1800px] md:mx-auto mx-0 md:px-6 px-0">
        {/* ✅ COLONNA 32 A */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center pt-12">
          <div className=" md:-mt-8 -mt-4">
            {/* A1 */}
            <BlokQuadRett
              rettColor="bg-green-600"
              firstSquareLabel={mA1?.pos1 || ""}
              secondSquareLabel={mA1?.pos2 || ""}
              rettLeftLabel={mA1?.date || ""}
              rettRightLabel={mA1?.city || ""}
              results={mA1?.results || null}
            />
          </div>

          <div>
            <div className="md:mt-10 mt-8">
              {/* A2 */}
              <BlokQuadRett
                rettColor="bg-green-600"
                firstSquareLabel={mA2?.pos1 || ""}
                secondSquareLabel={mA2?.pos2 || ""}
                rettLeftLabel={mA2?.date || ""}
                rettRightLabel={mA2?.city || ""}
                results={mA2?.results || null}
              />
            </div>

            <div className="md:mt-20 mt-16">
              {/* A3 */}
              <BlokQuadRett
                rettColor="bg-green-600"
                firstSquareLabel={mA3?.pos1 || ""}
                secondSquareLabel={mA3?.pos2 || ""}
                rettLeftLabel={mA3?.date || ""}
                rettRightLabel={mA3?.city || ""}
                results={mA3?.results || null}
              />
            </div>

            <div className="md:mt-10 mt-8">
              {/* A4 */}
              <BlokQuadRett
                rettColor="bg-green-600"
                firstSquareLabel={mA4?.pos1 || ""}
                secondSquareLabel={mA4?.pos2 || ""}
                rettLeftLabel={mA4?.date || ""}
                rettRightLabel={mA4?.city || ""}
                results={mA4?.results || null}
              />
            </div>

            <div className="md:mt-20 mt-16">
              {/* B1 */}
              <BlokQuadRett
                rettColor="bg-pink-600"
                firstSquareLabel={mB1?.pos1 || ""}
                secondSquareLabel={mB1?.pos2 || ""}
                rettLeftLabel={mB1?.date || ""}
                rettRightLabel={mB1?.city || ""}
                results={mB1?.results || null}
              />
            </div>

            <div className="md:mt-10 mt-8">
              {/* B2 */}
              <BlokQuadRett
                rettColor="bg-pink-600"
                firstSquareLabel={mB2?.pos1 || ""}
                secondSquareLabel={mB2?.pos2 || ""}
                rettLeftLabel={mB2?.date || ""}
                rettRightLabel={mB2?.city || ""}
                results={mB2?.results || null}
              />
            </div>

            <div className="md:mt-20 mt-16">
              {/* B3 */}
              <BlokQuadRett
                rettColor="bg-pink-600"
                firstSquareLabel={mB3?.pos1 || ""}
                secondSquareLabel={mB3?.pos2 || ""}
                rettLeftLabel={mB3?.date || ""}
                rettRightLabel={mB3?.city || ""}
                results={mB3?.results || null}
              />
            </div>

            <div className="md:mt-10 mt-8">
              {/* B4 */}
              <BlokQuadRett
                rettColor="bg-pink-600"
                firstSquareLabel={mB4?.pos1 || ""}
                secondSquareLabel={mB4?.pos2 || ""}
                rettLeftLabel={mB4?.date || ""}
                rettRightLabel={mB4?.city || ""}
                results={mB4?.results || null}
              />
            </div>
          </div>
        </div>

        {/* ✅ COLONNA 16 A */}
        <div className="relative flex-1 h-full flex bg-orange flex-col items-center pt-12">
          <div className="md:mt-8 mt-8 ml-2">
            <BlokQuadRett rettColor="bg-green-600" />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            <BlokQuadRett rettColor="bg-green-600" />
          </div>
          <div className="md:mt-48 mt-40 ml-2">
            <BlokQuadRett rettColor="bg-pink-600" />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            <BlokQuadRett rettColor="bg-pink-600" />
          </div>
        </div>

        {/* ✅ COLONNA QUARTI A */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-start pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -ml-8">
            <BlokQuadRett rettColor="bg-green-600" />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -ml-8">
            <BlokQuadRett rettColor="bg-pink-600" />
          </div>
        </div>

        {/* ✅ COLONNA SEMIFINALI FINALE ------------------------------------------------------------------------ */}
        <div className="flex-1 h-full bg-green- relative overflow-visible flex items-center justify-center">
          {/* ✅ FINALE */}
          <div className="relative z-10 md:-top-12 -top-28">
            <BlokQuadRett rettColor="bg-yellow-500" />
          </div>

          {/* ✅ SEMIFINALE A  */}
          <div className="absolute left-1/2 -translate-x-full md:top-[28rem] top-[22rem] md:-ml-16 -ml-12 z-10">
            <BlokQuadRett rettColor="bg-gradient-to-l from-green-600 to-pink-600" />
          </div>

          {/* ✅ SEMIFINALE B */}
          <div className="absolute right-1/2 translate-x-full md:top-[28rem] top-[22rem] md:-mr-16 -mr-12 z-10">
            <BlokQuadRett rettColor="bg-gradient-to-r from-orange-500 to-fuchsia-600" />
          </div>
        </div>
        {/* ✅ COLONNA SEMIFINALI FINALE ------------------------------------------------------------------------ */}
        {/* ✅ COLONNA QUARTI B */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-end pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -mr-8">
            <BlokQuadRett rettColor="bg-orange-500" />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -mr-8">
            <BlokQuadRett rettColor="bg-fuchsia-600" />
          </div>
        </div>

        {/* ✅ COLONNA 16 B */}
        <div className="relative flex-1 h-full bg-orange flex flex-col items-center pt-12">
          <div className="md:mt-8 mt-8 mr-2">
            <BlokQuadRett rettColor="bg-orange-500" />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            <BlokQuadRett rettColor="bg-orange-500" />
          </div>
          <div className="md:mt-48 mt-40 mr-2">
            <BlokQuadRett rettColor="bg-fuchsia-600" />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            <BlokQuadRett rettColor="bg-fuchsia-600" />
          </div>
        </div>

        {/* ✅ COLONNA 32 B */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center pt-12">
          <div className="md:-mt-8 -mt-4">
            {/* C1 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC1?.pos1 || ""}
              secondSquareLabel={mC1?.pos2 || ""}
              rettLeftLabel={mC1?.date || ""}
              rettRightLabel={mC1?.city || ""}
              results={mC1?.results || null}
            />
          </div>
          <div className="md:mt-10 mt-8">
            {/* C2 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC2?.pos1 || ""}
              secondSquareLabel={mC2?.pos2 || ""}
              rettLeftLabel={mC2?.date || ""}
              rettRightLabel={mC2?.city || ""}
              results={mC2?.results || null}
            />
          </div>
          <div className="md:mt-20 mt-16">
            {/* C3 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC3?.pos1 || ""}
              secondSquareLabel={mC3?.pos2 || ""}
              rettLeftLabel={mC3?.date || ""}
              rettRightLabel={mC3?.city || ""}
              results={mC3?.results || null}
            />
          </div>
          <div className="md:mt-10 mt-8">
            {/* C4 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC4?.pos1 || ""}
              secondSquareLabel={mC4?.pos2 || ""}
              rettLeftLabel={mC4?.date || ""}
              rettRightLabel={mC4?.city || ""}
              results={mC4?.results || null}
            />
          </div>
          <div className="md:mt-20 mt-16">
            {/* D1 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD1?.pos1 || ""}
              secondSquareLabel={mD1?.pos2 || ""}
              rettLeftLabel={mD1?.date || ""}
              rettRightLabel={mD1?.city || ""}
              results={mD1?.results || null}
            />
          </div>
          <div className="md:mt-10 mt-8">
            {/* D2 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD2?.pos1 || ""}
              secondSquareLabel={mD2?.pos2 || ""}
              rettLeftLabel={mD2?.date || ""}
              rettRightLabel={mD2?.city || ""}
              results={mD2?.results || null}
            />
          </div>
          <div className="md:mt-20 mt-16">
            {/* D3 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD3?.pos1 || ""}
              secondSquareLabel={mD3?.pos2 || ""}
              rettLeftLabel={mD3?.date || ""}
              rettRightLabel={mD3?.city || ""}
              results={mD3?.results || null}
            />
          </div>
          <div className="md:mt-10 mt-8">
            {/* D4 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD4?.pos1 || ""}
              secondSquareLabel={mD4?.pos2 || ""}
              rettLeftLabel={mD4?.date || ""}
              rettRightLabel={mD4?.city || ""}
              results={mD4?.results || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
