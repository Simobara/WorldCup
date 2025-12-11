import BlokQuadRett from "../components/3tableComp/4blokQuadRett";
import { groupFinal } from "../START/app/1GroupFinal";

const TablePage = () => {
  const { round32, round16, quarterFinals, semifinals, final34, final } =
    groupFinal;

  // helper: aggiunge la data ai match di uno "stage" (round32, round16, ecc.)
  const collectMatchesWithDate = (stage) =>
    Object.values(stage).flatMap((giornata) =>
      giornata.matches.map((match) => ({
        ...match,
        date: giornata.dates[0] || "",
      }))
    );

  // 👇 tutte le partite di tutte le fasi
  const allMatches = [
    ...collectMatchesWithDate(round32),
    ...collectMatchesWithDate(round16),
    ...collectMatchesWithDate(quarterFinals),
    ...collectMatchesWithDate(semifinals),
    ...collectMatchesWithDate(final34),
    ...collectMatchesWithDate(final),
  ];

  // cerca per fg: A1..A7, B1..B7, C5, C7, AB1, F1, ecc.
  const getMatchByFg = (fgCode) =>
    allMatches.find((m) => m.fg === fgCode) || null;

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

  // 🔹 OTTAVI (round16)
  const mA5 = getMatchByFg("A5");
  const mA6 = getMatchByFg("A6");
  const mB5 = getMatchByFg("B5");
  const mB6 = getMatchByFg("B6");

  const mC5 = getMatchByFg("C5");
  const mC6 = getMatchByFg("C6");
  const mD5 = getMatchByFg("D5");
  const mD6 = getMatchByFg("D6");

  // 🔹 QUARTI
  const mA7 = getMatchByFg("A7");
  const mB7 = getMatchByFg("B7");
  const mC7 = getMatchByFg("C7");
  const mD7 = getMatchByFg("D7");

  // 🔹 SEMIFINALI
  const mAB1 = getMatchByFg("AB1");
  const mCD1 = getMatchByFg("CD1");

  // 🔹 FINALI
  const mF1 = getMatchByFg("F1");
  const mF2 = getMatchByFg("F2"); // (la 3°/4° se ti serve)

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
            {/* A5 */}
            <BlokQuadRett
              rettColor="bg-green-600"
              firstSquareLabel={mA5?.pos1 || ""}
              secondSquareLabel={mA5?.pos2 || ""}
              rettLeftLabel={mA5?.date || ""}
              rettRightLabel={mA5?.city || ""}
              results={mA5?.results || null}
            />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            {/* A6 */}
            <BlokQuadRett
              rettColor="bg-green-600"
              firstSquareLabel={mA6?.pos1 || ""}
              secondSquareLabel={mA6?.pos2 || ""}
              rettLeftLabel={mA6?.date || ""}
              rettRightLabel={mA6?.city || ""}
              results={mA6?.results || null}
            />
          </div>
          <div className="md:mt-48 mt-40 ml-2">
            {/* B5 */}
            <BlokQuadRett
              rettColor="bg-pink-600"
              firstSquareLabel={mB5?.pos1 || ""}
              secondSquareLabel={mB5?.pos2 || ""}
              rettLeftLabel={mB5?.date || ""}
              rettRightLabel={mB5?.city || ""}
              results={mB5?.results || null}
            />
          </div>
          <div className="md:mt-44 mt-32 ml-2">
            {/* B6 */}
            <BlokQuadRett
              rettColor="bg-pink-600"
              firstSquareLabel={mB6?.pos1 || ""}
              secondSquareLabel={mB6?.pos2 || ""}
              rettLeftLabel={mB6?.date || ""}
              rettRightLabel={mB6?.city || ""}
              results={mB6?.results || null}
            />
          </div>
        </div>

        {/* ✅ COLONNA QUARTI A */}
        {/* ✅ COLONNA QUARTI A */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-start pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -ml-8">
            {/* A7 */}
            <BlokQuadRett
              rettColor="bg-green-600"
              firstSquareLabel={mA7?.pos1 || ""}
              secondSquareLabel={mA7?.pos2 || ""}
              rettLeftLabel={mA7?.date || ""}
              rettRightLabel={mA7?.city || ""}
              results={mA7?.results || null}
            />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -ml-8">
            {/* B7 */}
            <BlokQuadRett
              rettColor="bg-pink-600"
              firstSquareLabel={mB7?.pos1 || ""}
              secondSquareLabel={mB7?.pos2 || ""}
              rettLeftLabel={mB7?.date || ""}
              rettRightLabel={mB7?.city || ""}
              results={mB7?.results || null}
            />
          </div>
        </div>

        {/* ✅ COLONNA SEMIFINALI FINALE ------------------------------------------------------------------------ */}
        <div className="flex-1 h-full bg-green- relative overflow-visible flex items-center justify-center">
          {/* ✅ FINALE F1 */}
          <div className="relative z-10 md:-top-12 -top-28">
            <BlokQuadRett
              rettColor="bg-yellow-500"
              firstSquareLabel={mF1?.pos1 || ""}
              secondSquareLabel={mF1?.pos2 || ""}
              rettLeftLabel={mF1?.date || ""}
              rettRightLabel={mF1?.city || ""}
              results={mF1?.results || null}
            />
          </div>

          {/* ✅ SEMIFINALE A → AB1 */}
          <div className="absolute left-1/2 -translate-x-full md:top-[28rem] top-[22rem] md:-ml-16 -ml-12 z-10">
            <BlokQuadRett
              rettColor="bg-gradient-to-l from-green-600 to-pink-600"
              firstSquareLabel={mAB1?.pos1 || ""}
              secondSquareLabel={mAB1?.pos2 || ""}
              rettLeftLabel={mAB1?.date || ""}
              rettRightLabel={mAB1?.city || ""}
              results={mAB1?.results || null}
            />
          </div>

          {/* ✅ SEMIFINALE B → CD1 */}
          <div className="absolute right-1/2 translate-x-full md:top-[28rem] top-[22rem] md:-mr-16 -mr-12 z-10">
            <BlokQuadRett
              rettColor="bg-gradient-to-r from-orange-500 to-fuchsia-600"
              firstSquareLabel={mCD1?.pos1 || ""}
              secondSquareLabel={mCD1?.pos2 || ""}
              rettLeftLabel={mCD1?.date || ""}
              rettRightLabel={mCD1?.city || ""}
              results={mCD1?.results || null}
            />
          </div>
        </div>

        {/* ✅ COLONNA SEMIFINALI FINALE ------------------------------------------------------------------------ */}
        {/* ✅ COLONNA QUARTI B */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-end pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -mr-8">
            {/* C7 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC7?.pos1 || ""}
              secondSquareLabel={mC7?.pos2 || ""}
              rettLeftLabel={mC7?.date || ""}
              rettRightLabel={mC7?.city || ""}
              results={mC7?.results || null}
            />
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -mr-8">
            {/* D7 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD7?.pos1 || ""}
              secondSquareLabel={mD7?.pos2 || ""}
              rettLeftLabel={mD7?.date || ""}
              rettRightLabel={mD7?.city || ""}
              results={mD7?.results || null}
            />
          </div>
        </div>

        {/* ✅ COLONNA 16 B */}
        <div className="relative flex-1 h-full bg-orange flex flex-col items-center pt-12">
          <div className="md:mt-8 mt-8 mr-2">
            {/* C5 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC5?.pos1 || ""}
              secondSquareLabel={mC5?.pos2 || ""}
              rettLeftLabel={mC5?.date || ""}
              rettRightLabel={mC5?.city || ""}
              results={mC5?.results || null}
            />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            {/* C6 */}
            <BlokQuadRett
              rettColor="bg-orange-500"
              firstSquareLabel={mC6?.pos1 || ""}
              secondSquareLabel={mC6?.pos2 || ""}
              rettLeftLabel={mC6?.date || ""}
              rettRightLabel={mC6?.city || ""}
              results={mC6?.results || null}
            />
          </div>
          <div className="md:mt-48 mt-40 mr-2">
            {/* D5 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD5?.pos1 || ""}
              secondSquareLabel={mD5?.pos2 || ""}
              rettLeftLabel={mD5?.date || ""}
              rettRightLabel={mD5?.city || ""}
              results={mD5?.results || null}
            />
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            {/* D6 */}
            <BlokQuadRett
              rettColor="bg-fuchsia-600"
              firstSquareLabel={mD6?.pos1 || ""}
              secondSquareLabel={mD6?.pos2 || ""}
              rettLeftLabel={mD6?.date || ""}
              rettRightLabel={mD6?.city || ""}
              results={mD6?.results || null}
            />
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
