import { useEffect, useState } from "react";
import BlokQuadRett from "../components/3tableComp/4blokQuadRett";
import BlokQuadRettSemi from "../components/3tableComp/5blokQuadRettSemi";
import { groupFinal } from "../START/app/1GroupFinal";
import { flagsMond } from "../START/app/0main";
import { Rett } from "../START/styles/0CssGsTs";

// 🔹 flatten delle squadre (A, B, C, ... → un solo array)
const tutteLeSquadre = Object.values(flagsMond).flat();

// 🔹 mappa: codice (id) → flag
const flagByTeamCode = Object.fromEntries(tutteLeSquadre.map((t) => [t.id, t.flag]));

// 🔹 helper per ottenere la bandiera da "MEX", "GER", ecc.
const getFlag = (code) => {
  if (!code) return null;
  return flagByTeamCode[code] || null;
};

const TablePage = () => {
  const { round32, round16, quarterFinals, semifinals, final34, final } = groupFinal;

  const STORAGE_KEY = "tablePage_showPron";

  const [showPron, setShowPron] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(showPron));
    } catch {
      // ignore
    }
  }, [showPron]);

  // 🔹 squadre REALI che compaiono in una fase (solo team1/team2)
  const collectRealTeamsFromStage = (stage) =>
    new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          giornata.matches.flatMap((m) => [(m.team1 || "").trim(), (m.team2 || "").trim()])
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
  const didTeamAdvance = (teamCode, phase, isPron = false) => {
    if (!teamCode) return false;

    const r16 = isPron ? pronTeamsInRound16 : realTeamsInRound16;
    const qf = isPron ? pronTeamsInQuarter : realTeamsInQuarter;
    const sf = isPron ? pronTeamsInSemi : realTeamsInSemi;
    const fin = isPron ? pronTeamsInFinalStages : realTeamsInFinalStages;

    switch (phase) {
      case "round32":
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
        return true;
      default:
        return false;
    }
  };

  // helper: aggiunge la data ai match di uno "stage"
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

  // cerca per fg
  const getMatchByFg = (fgCode) => allMatches.find((m) => m.fg === fgCode) || null;

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

  // 🔹 OTTAVI
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
  const mF2 = getMatchByFg("F2"); // se ti serve

  // ✅ team visualizzati (reali, oppure PRON se showPron e reali vuoti)
  const getDisplayTeamsFromMatch = (match) => {
    if (!match) return { code1: "", code2: "", isPron1: false, isPron2: false };

    const logicalTeam1 = (match.team1 || "").trim();
    const logicalTeam2 = (match.team2 || "").trim();

    if (logicalTeam1 || logicalTeam2) {
      return { code1: logicalTeam1, code2: logicalTeam2, isPron1: false, isPron2: false };
    }

    if (showPron) {
      const pron = (match.pron || "").trim();
      if (pron) {
        const [p1, p2] = pron.split("-").map((s) => s.trim());
        return { code1: p1 || "", code2: p2 || "", isPron1: !!p1, isPron2: !!p2 };
      }
    }

    return { code1: "", code2: "", isPron1: false, isPron2: false };
  };

  // 🔹 offset orizzontale semifinale rispetto al centro (speculare)
  const SEMI_OFFSET_DESKTOP = "10rem";
  const SEMI_OFFSET_MOBILE = "8rem";

  const renderMatchBlock = (match, rettColor, phase) => {
    if (!match) return null;

    const { code1: displayCode1, code2: displayCode2, isPron1, isPron2 } =
      getDisplayTeamsFromMatch(match);

    return (
      <BlokQuadRett
        rettColor={rettColor}
        firstSquareLabel={match.pos1 || ""}
        secondSquareLabel={match.pos2 || ""}
        firstTeamName={displayCode1}
        secondTeamName={displayCode2}
        firstIsPron={isPron1}
        secondIsPron={isPron2}
        firstTeamFlag={displayCode1 ? getFlag(displayCode1) : null}
        secondTeamFlag={displayCode2 ? getFlag(displayCode2) : null}
        firstAdvanced={displayCode1 ? didTeamAdvance(displayCode1, phase, isPron1) : false}
        secondAdvanced={displayCode2 ? didTeamAdvance(displayCode2, phase, isPron2) : false}
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
        [background-image:linear-gradient(to_right,theme(colors.slate.400),theme(colors.sky.300),theme(colors.sky.900)),linear-gradient(to_bottom,theme(colors.slate.900),theme(colors.sky.300),theme(colors.sky.900))]
        bg-blend-multiply
      "
    >
      <div
        className="
          flex h-full
          md:w-[1500px] w-[1300px]
          mx-0
          md:-px-2 px-0
        "
      >
        {/* ✅ COLONNA 32 A */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center md:pt-20 pt-12">
          <div className="md:-mt-8 -mt-4">{renderMatchBlock(mA1, Rett.A, "round32")}</div>

          <div>
            <div className="md:mt-10 mt-8">{renderMatchBlock(mA2, Rett.A, "round32")}</div>
            <div className="md:mt-20 mt-16">{renderMatchBlock(mA3, Rett.A, "round32")}</div>
            <div className="md:mt-10 mt-8">{renderMatchBlock(mA4, Rett.A, "round32")}</div>

            <div className="md:mt-20 mt-16">{renderMatchBlock(mB1, Rett.B, "round32")}</div>
            <div className="md:mt-10 mt-8">{renderMatchBlock(mB2, Rett.B, "round32")}</div>
            <div className="md:mt-20 mt-16">{renderMatchBlock(mB3, Rett.B, "round32")}</div>
            <div className="md:mt-10 mt-8">{renderMatchBlock(mB4, Rett.B, "round32")}</div>
          </div>
        </div>

        {/* ✅ COLONNA 16 A */}
        <div className="relative flex-1 h-full flex bg-orange flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 ml-2">{renderMatchBlock(mA5, Rett.A, "round16")}</div>
          <div className="md:mt-44 mt-32 ml-2">{renderMatchBlock(mA6, Rett.A, "round16")}</div>
          <div className="md:mt-48 mt-40 ml-2">{renderMatchBlock(mB5, Rett.B, "round16")}</div>
          <div className="md:mt-44 mt-32 ml-2">{renderMatchBlock(mB6, Rett.B, "round16")}</div>
        </div>

        {/* ✅ COLONNA QUARTI A */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-start md:pt-20 pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -ml-8">
            {renderMatchBlock(mA7, Rett.A, "quarter")}
          </div>
          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -ml-8">
            {renderMatchBlock(mB7, Rett.B, "quarter")}
          </div>
        </div>

        {/* ✅ COLONNA SEMIFINALI + FINALE */}
        <div className="flex-1 h-full bg-green- relative overflow-visible flex items-center justify-center">
          {/* ✅ FINALE F1 */}
          <div className="relative md:-top-12 -top-28 flex items-center justify-center">
            <div className="relative md:-top-12 -top-30 flex items-center justify-center">
              <img
                src="/assts/WCOfficial.png"
                alt="World Cup"
                className="absolute 
                  md:left-18 left-1/2 
                  md:top-36 top-24 
                  md:w-[400px] w-[360px]
                  -translate-x-1/2 -translate-y-1/2
                  max-w-none pointer-events-none"
              />

              <div className="relative z-10">{renderMatchBlock(mF1, Rett.Final, "final")}</div>

              <button
                onClick={() => setShowPron((prev) => !prev)}
                className="
                  absolute left-1/2 
                  md:-top-[1.5rem] -top-6
                  md:translate-x-2 translate-x-4
                  bg-transparent border-0 border-yellow-400
                  text-yellow-500 font-bold
                  text-xs md:text-sm
                  px-0 py-0
                  rounded-full z-50
                "
              >
                {showPron ? "" : ""} ""
              </button>
            </div>
          </div>

          {/* ✅ SEMIFINALE A → AB1 (verticale) */}
          {(() => {
            const { code1, code2, isPron1, isPron2 } = getDisplayTeamsFromMatch(mAB1);

            return (
              <div
                className=" absolute left-1/2 -translate-x-1/2 md:top-[26rem] top-[20rem] z-10 "
                style={{ transform: `translateX(calc(-50% - ${SEMI_OFFSET_DESKTOP}))` }}
              >
                <BlokQuadRettSemi
                  infoSide="left"
                  rettColor={Rett.SemiAB}
                  topSquareLabel={mAB1?.pos1 || ""}
                  bottomSquareLabel={mAB1?.pos2 || ""}
                  topTeamName={code1}
                  bottomTeamName={code2}
                  topTeamFlag={code1 ? getFlag(code1) : null}
                  bottomTeamFlag={code2 ? getFlag(code2) : null}
                  topIsPron={isPron1}
                  bottomIsPron={isPron2}
                  topAdvanced={code1 ? didTeamAdvance(code1, "semi", isPron1) : false}
                  bottomAdvanced={code2 ? didTeamAdvance(code2, "semi", isPron2) : false}
                  phase="semi"
                  rettTopLabel={mAB1?.date || ""}
                  rettBottomLabel={mAB1?.city || ""}
                  rettTimeLabel={mAB1?.time || ""}
                  results={mAB1?.results || null}
                />
              </div>
            );
          })()}

          {/* ✅ SEMIFINALE B → CD1 (verticale) */}
          {(() => {
            const { code1, code2, isPron1, isPron2 } = getDisplayTeamsFromMatch(mCD1);

            return (
              <div
                className=" absolute left-1/2 -translate-x-1/2 md:top-[26rem] top-[20rem] z-10"
                style={{ transform: `translateX(calc(-50% + ${SEMI_OFFSET_DESKTOP}))` }}
              >

                <BlokQuadRettSemi
                  rettColor={Rett.SemiCD}
                  topSquareLabel={mCD1?.pos1 || ""}
                  bottomSquareLabel={mCD1?.pos2 || ""}
                  topTeamName={code1}
                  bottomTeamName={code2}
                  topTeamFlag={code1 ? getFlag(code1) : null}
                  bottomTeamFlag={code2 ? getFlag(code2) : null}
                  topIsPron={isPron1}
                  bottomIsPron={isPron2}
                  topAdvanced={code1 ? didTeamAdvance(code1, "semi", isPron1) : false}
                  bottomAdvanced={code2 ? didTeamAdvance(code2, "semi", isPron2) : false}
                  phase="semi"
                  rettTopLabel={mCD1?.date || ""}
                  rettBottomLabel={mCD1?.city || ""}
                  rettTimeLabel={mCD1?.time || ""}
                  results={mCD1?.results || null}
                />
              </div>
            );
          })()}
        </div>

        {/* ✅ COLONNA QUARTI B */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-end md:pt-20 pt-12">
          <div className="md:mt-[10rem] mt-[8rem] md:ml-0 -mr-8">
            {renderMatchBlock(mC7, Rett.C, "quarter")}
          </div>
          <div className="md:mt-[26rem] mt-[20rem] md:ml-0 -mr-8">
            {renderMatchBlock(mD7, Rett.D, "quarter")}
          </div>
        </div>

        {/* ✅ COLONNA 16 B */}
        <div className="relative flex-1 h-full bg-orange flex flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 mr-2">{renderMatchBlock(mC5, Rett.C, "round16")}</div>
          <div className="md:mt-44 mt-32 mr-2">{renderMatchBlock(mC6, Rett.C, "round16")}</div>
          <div className="md:mt-48 mt-40 mr-2">{renderMatchBlock(mD5, Rett.D, "round16")}</div>
          <div className="md:mt-44 mt-32 mr-2">{renderMatchBlock(mD6, Rett.D, "round16")}</div>
        </div>

        {/* ✅ COLONNA 32 B */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center md:pt-20 pt-12">
          <div className="md:-mt-8 -mt-4">{renderMatchBlock(mC1, Rett.C, "round32")}</div>
          <div className="md:mt-10 mt-8">{renderMatchBlock(mC2, Rett.C, "round32")}</div>
          <div className="md:mt-20 mt-16">{renderMatchBlock(mC3, Rett.C, "round32")}</div>
          <div className="md:mt-10 mt-8">{renderMatchBlock(mC4, Rett.C, "round32")}</div>

          <div className="md:mt-20 mt-16">{renderMatchBlock(mD1, Rett.D, "round32")}</div>
          <div className="md:mt-10 mt-8">{renderMatchBlock(mD2, Rett.D, "round32")}</div>
          <div className="md:mt-20 mt-16">{renderMatchBlock(mD3, Rett.D, "round32")}</div>
          <div className="md:mt-10 mt-8">{renderMatchBlock(mD4, Rett.D, "round32")}</div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
