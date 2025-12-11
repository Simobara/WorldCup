import { useState } from "react";
import BlokQuadRett from "../components/3tableComp/4blokQuadRett";
import { groupFinal } from "../START/app/1GroupFinal";
import { squadreMond } from "../START/app/main";

// 🔹 flatten delle squadre (A, B, C, ... → un solo array)
const tutteLeSquadre = Object.values(squadreMond).flat();

// 🔹 mappa: codice (id) → flag
// es: { MEX: FlagMessico, GER: FlagGermania, ... }
const flagByTeamCode = Object.fromEntries(
  tutteLeSquadre.map((t) => [t.id, t.flag])
);

// 🔹 helper per ottenere la bandiera da "MEX", "GER", ecc.
const getFlag = (code) => {
  if (!code) return null;
  return flagByTeamCode[code] || null;
};

const TablePage = () => {
  const { round32, round16, quarterFinals, semifinals, final34, final } =
    groupFinal;

  const [showPron, setShowPron] = useState(false);

  // 🔹 squadre REALI che compaiono in una fase (solo team1/team2)
  const collectRealTeamsFromStage = (stage) =>
    new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          giornata.matches.flatMap((m) => [
            (m.team1 || "").trim(),
            (m.team2 || "").trim(),
          ])
        )
        .filter(Boolean)
    );

  // 🔹 squadre da PRON che compaiono in una fase (solo pron "AAA-BBB")
  const collectPronTeamsFromStage = (stage) =>
    new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          giornata.matches.flatMap((m) => {
            const pron = (m.pron || "").trim();
            if (!pron) return [];
            const [p1, p2] = pron.split("-").map((s) => s.trim());
            return [p1 || "", p2 || ""];
          })
        )
        .filter(Boolean)
    );

  // 🔹 REALI
  const realTeamsInRound16 = collectRealTeamsFromStage(round16);
  const realTeamsInQuarter = collectRealTeamsFromStage(quarterFinals);
  const realTeamsInSemi = collectRealTeamsFromStage(semifinals);
  const realTeamsInFinalStages = new Set([...collectRealTeamsFromStage(final)]);

  // 🔹 PRON
  const pronTeamsInRound16 = collectPronTeamsFromStage(round16);
  const pronTeamsInQuarter = collectPronTeamsFromStage(quarterFinals);
  const pronTeamsInSemi = collectPronTeamsFromStage(semifinals);
  const pronTeamsInFinalStages = new Set([...collectPronTeamsFromStage(final)]);

  // helper: la squadra avanza alla fase successiva?
  // isPron = true → usiamo i set dei PRON
  // isPron = false → usiamo i set REALI (team1/team2)
  const didTeamAdvance = (teamCode, phase, isPron = false) => {
    if (!teamCode) return false;

    const r16 = isPron ? pronTeamsInRound16 : realTeamsInRound16;
    const qf = isPron ? pronTeamsInQuarter : realTeamsInQuarter;
    const sf = isPron ? pronTeamsInSemi : realTeamsInSemi;
    const fin = isPron ? pronTeamsInFinalStages : realTeamsInFinalStages;

    switch (phase) {
      case "round32":
        // se gli ottavi (mondo reale o pron) sono VUOTI → non sappiamo chi passa ⇒ tutti colorati
        if (r16.size === 0) return true;
        return r16.has(teamCode);

      case "round16":
        if (qf.size === 0) return true;
        return qf.has(teamCode);

      case "quarter":
        if (sf.size === 0) return true;
        return sf.has(teamCode);

      case "semi":
        if (fin.size === 0) return true;
        return fin.has(teamCode);

      case "final":
        // finale sempre top → mai grayscale
        return true;

      default:
        return false;
    }
  };

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

  // 🔹 prende i codici squadra da team1/team2--------------------------------|
  // altrimenti li estrae da pron: "ITA-URU"
  const getDisplayTeamCodes = (match) => {
    const t1 = (match.team1 || "").trim();
    const t2 = (match.team2 || "").trim();

    // se team1/team2 sono valorizzati → hanno la precedenza
    if (t1 || t2) {
      return { code1: t1, code2: t2 };
    }

    // altrimenti prova a leggere da pron: "ITA-URU"
    const pron = (match.pron || "").trim();
    if (!pron) {
      return { code1: "", code2: "" };
    }

    const [p1, p2] = pron.split("-").map((s) => s.trim());
    return { code1: p1 || "", code2: p2 || "" };
  };

  const renderMatchBlock = (match, rettColor, phase) => {
    if (!match) return null;

    const logicalTeam1 = (match.team1 || "").trim();
    const logicalTeam2 = (match.team2 || "").trim();
    const hasExplicitTeams = !!(logicalTeam1 || logicalTeam2);

    let displayCode1 = "";
    let displayCode2 = "";
    let isPron1 = false;
    let isPron2 = false;

    if (hasExplicitTeams) {
      // ✅ TEAM REALI hanno la precedenza
      displayCode1 = logicalTeam1;
      displayCode2 = logicalTeam2;
      isPron1 = false;
      isPron2 = false;
    } else if (showPron) {
      // ✅ Nessun team reale, ma vogliamo vedere i PRON
      const pron = (match.pron || "").trim(); // es. "KOR-ITA"
      if (pron) {
        const parts = pron.split("-").map((s) => s.trim());
        displayCode1 = parts[0] || "";
        displayCode2 = parts[1] || "";
        isPron1 = !!displayCode1;
        isPron2 = !!displayCode2;
      }
    }

    // codici usati per la logica
    const advanceCode1 = displayCode1;
    const advanceCode2 = displayCode2;

    return (
      <BlokQuadRett
        rettColor={rettColor}
        firstSquareLabel={match.pos1 || ""}
        secondSquareLabel={match.pos2 || ""}
        firstTeamName={displayCode1}
        secondTeamName={displayCode2}
        firstTeamFlag={displayCode1 ? getFlag(displayCode1) : null}
        secondTeamFlag={displayCode2 ? getFlag(displayCode2) : null}
        firstAdvanced={
          advanceCode1 ? didTeamAdvance(advanceCode1, phase, isPron1) : false
        }
        secondAdvanced={
          advanceCode2 ? didTeamAdvance(advanceCode2, phase, isPron2) : false
        }
        phase={phase}
        rettLeftLabel={match.date || ""}
        rettRightLabel={match.city || ""}
        rettTimeLabel={match.time || ""}
        results={match.results || null}
      />
    );
  };

  return (
    <div
      className="
      w-full h-screen
      relative
      overflow-x-auto overflow-y-hidden
      md:overflow-x-auto md:overflow-y-hidden
      [background-image:linear-gradient(to_right,theme(colors.sky.950),theme(colors.sky.300),theme(colors.sky.950)),linear-gradient(to_bottom,theme(colors.sky.950),theme(colors.sky.300),theme(colors.sky.950))]
      bg-blend-multiply
    "
    >
      {/* Contenitore largo orizzontale: le 7 colonne una di fianco all'altra */}
      <div
        className="
        flex h-full
        w-[2000px]      
        md:w-[1700px]
        mx-0
        md:-px-2 px-0
      "
      >
        {/* ✅ COLONNA 32 A */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center md:pt-20 pt-12">
          <div className="md:-mt-8 -mt-4">
            {/* A1 */}
            {renderMatchBlock(mA1, "bg-green-600", "round32")}
          </div>

          <div>
            <div className="md:mt-10 mt-8">
              {/* A2 */}
              {renderMatchBlock(mA2, "bg-green-600", "round32")}
            </div>

            <div className="md:mt-20 mt-16">
              {/* A3 */}
              {renderMatchBlock(mA3, "bg-green-600", "round32")}
            </div>

            <div className="md:mt-10 mt-8">
              {/* A4 */}
              {renderMatchBlock(mA4, "bg-green-600", "round32")}
            </div>

            <div className="md:mt-20 mt-16">
              {/* B1 */}
              {renderMatchBlock(mB1, "bg-pink-600", "round32")}
            </div>

            <div className="md:mt-10 mt-8">
              {/* B2 */}
              {renderMatchBlock(mB2, "bg-pink-600", "round32")}
            </div>

            <div className="md:mt-20 mt-16">
              {/* B3 */}
              {renderMatchBlock(mB3, "bg-pink-600", "round32")}
            </div>

            <div className="md:mt-10 mt-8">
              {/* B4 */}
              {renderMatchBlock(mB4, "bg-pink-600", "round32")}
            </div>
          </div>
        </div>

        {/* ✅ COLONNA 16 A */}
        <div className="relative flex-1 h-full flex bg-orange flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 ml-2">
            {/* A5 */}
            {renderMatchBlock(mA5, "bg-green-600", "round16")}
          </div>

          <div className="md:mt-44 mt-32 ml-2">
            {/* A6 */}
            {renderMatchBlock(mA6, "bg-green-600", "round16")}
          </div>

          <div className="md:mt-48 mt-40 ml-2">
            {/* B5 */}
            {renderMatchBlock(mB5, "bg-pink-600", "round16")}
          </div>

          <div className="md:mt-44 mt-32 ml-2">
            {/* B6 */}
            {renderMatchBlock(mB6, "bg-pink-600", "round16")}
          </div>
        </div>

        {/* ✅ COLONNA QUARTI A */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-start md:pt-20 pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -ml-8">
            {/* A7 */}
            {renderMatchBlock(mA7, "bg-green-600", "quarter")}
          </div>

          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -ml-8">
            {/* B7 */}
            {renderMatchBlock(mB7, "bg-pink-600", "quarter")}
          </div>
        </div>
        {/* ✅ COLONNA SEMIFINALI FINALE */}
        <div className="flex-1 h-full bg-green- relative overflow-visible flex items-center justify-center">
          {/* ✅ FINALE F1 */}
          <div className="relative z-10 md:-top-12 -top-28">
            {renderMatchBlock(mF1, "bg-yellow-500", "final")}
            {/* 🔘 BOTTONE ALTO CENTRO */}
            <button
              onClick={() => setShowPron((prev) => !prev)}
              className="
        absolute
        left-1/2 
        md:-top-4 top-0
        md:translate-x-2 -translate-x-0
        bg-transparent
        border-0 border-yellow-400
        text-black font-bold
        text-xs md:text-sm
        px-0 py-0
        rounded-full z-50       
      "
            >
              {showPron ? "" : ""}
              ""
            </button>
          </div>
          {/* ✅ SEMIFINALE A → AB1 */}
          <div className="absolute left-1/2 -translate-x-full md:top-[28rem] top-[22rem] md:-ml-16 -ml-12 z-10">
            {renderMatchBlock(
              mAB1,
              "bg-gradient-to-l from-green-600 to-pink-600",
              "semi"
            )}
          </div>
          {/* ✅ SEMIFINALE B → CD1 */}
          <div className="absolute right-1/2 translate-x-full md:top-[28rem] top-[22rem] md:-mr-16 -mr-12 z-10">
            {renderMatchBlock(
              mCD1,
              "bg-gradient-to-r from-orange-500 to-fuchsia-600",
              "semi"
            )}
          </div>
        </div>
        {/* ✅ COLONNA SEMIFINALI FINALE ------------------------------------------------------------------------ */}
        {/* ✅ COLONNA QUARTI B */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-end md:pt-20 pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -mr-8">
            {/* C7 */}
            {renderMatchBlock(mC7, "bg-orange-500", "quarter")}
          </div>
          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -mr-8">
            {/* D7 */}
            {renderMatchBlock(mD7, "bg-fuchsia-600", "quarter")}
          </div>
        </div>

        {/* ✅ COLONNA 16 B */}
        <div className="relative flex-1 h-full bg-orange flex flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 mr-2">
            {/* C5 */}
            {renderMatchBlock(mC5, "bg-orange-500", "round16")}
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            {/* C6 */}
            {renderMatchBlock(mC6, "bg-orange-500", "round16")}
          </div>
          <div className="md:mt-48 mt-40 mr-2">
            {/* D5 */}
            {renderMatchBlock(mD5, "bg-fuchsia-600", "round16")}
          </div>
          <div className="md:mt-44 mt-32 mr-2">
            {/* D6 */}
            {renderMatchBlock(mD6, "bg-fuchsia-600", "round16")}
          </div>
        </div>

        {/* ✅ COLONNA 32 B */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center md:pt-20 pt-12">
          <div className="md:-mt-8 -mt-4">
            {/* C1 */}
            {renderMatchBlock(mC1, "bg-orange-500", "round32")}
          </div>

          <div className="md:mt-10 mt-8">
            {/* C2 */}
            {renderMatchBlock(mC2, "bg-orange-500", "round32")}
          </div>

          <div className="md:mt-20 mt-16">
            {/* C3 */}
            {renderMatchBlock(mC3, "bg-orange-500", "round32")}
          </div>

          <div className="md:mt-10 mt-8">
            {/* C4 */}
            {renderMatchBlock(mC4, "bg-orange-500", "round32")}
          </div>

          <div className="md:mt-20 mt-16">
            {/* D1 */}
            {renderMatchBlock(mD1, "bg-fuchsia-600", "round32")}
          </div>

          <div className="md:mt-10 mt-8">
            {/* D2 */}
            {renderMatchBlock(mD2, "bg-fuchsia-600", "round32")}
          </div>

          <div className="md:mt-20 mt-16">
            {/* D3 */}
            {renderMatchBlock(mD3, "bg-fuchsia-600", "round32")}
          </div>

          <div className="md:mt-10 mt-8">
            {/* D4 */}
            {renderMatchBlock(mD4, "bg-fuchsia-600", "round32")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
