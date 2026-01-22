import { useEffect, useState } from "react";
import { useQualifiedTeams } from "../../Ap/Global/global";
import { supabase } from "../../Services/supabase/supabaseClient";
import { flagsMond } from "../../START/app/0main";
import { groupFinal } from "../../START/app/2GroupFinal";
import { Rett } from "../../START/styles/0CssGsTs";
import BlokQuadRett from "./4blokQuadRett";
import BlokQuadRettSemi from "./5blokQuadRettSemi";

// 👉 Adesso è esattamente così:

// Admin

// vede pronsq dal DB (che parte dal seed, ma poi puoi cambiarlo).

// Non loggato

// senza bottone → niente.

// con bottone showPron → vede sempre i pronsq dal file hardcoded, indipendenti da cosa hai cambiato nel DB.

// Loggato non admin

// continua a usare wc_final_user_pron + squadre reali del DB.

function normalizeResults({ ris, TS, R }) {
  const isDraw = (v) => {
    if (!v) return false;
    const parts = v.split("-");
    if (parts.length !== 2) return false;
    const [a, b] = parts.map((n) => parseInt(n, 10));
    return a === b;
  };

  // Caso 1: RIS è pareggio → TS = null, R = null
  if (isDraw(ris)) {
    return { ris, TS: null, R: null };
  }

  // Caso 2: RIS è un risultato NON pareggio → niente TS, niente R
  if (ris && !isDraw(ris)) {
    return { ris, TS: "", R: "" };
  }

  // Caso 3: TS valorizzato NON pareggio → niente rigori
  if (TS && !isDraw(TS)) {
    return { ris, TS, R: "" };
  }

  // Caso 4: TS è pareggio → deve andare ai rigori
  if (TS && isDraw(TS)) {
    return { ris, TS, R: null };
  }

  // Caso base: nessun valore → tutto vuoto
  return {
    ris: ris ?? "",
    TS: TS ?? "",
    R: R ?? "",
  };
}

// 🔹 Costruisco una mappa fg -> pronsq **DAL FILE HARDCODED**
const buildSeedPronByFg = () => {
  const map = {};

  const collectFromStage = (stage) => {
    Object.values(stage).forEach((giornata) => {
      giornata.matches.forEach((m) => {
        const fg = (m.fg || "").trim();
        const pronsq = (m.pronsq || "").trim();
        if (fg && pronsq) {
          map[fg] = pronsq;
        }
      });
    });
  };

  collectFromStage(groupFinal.round32);
  collectFromStage(groupFinal.round16);
  collectFromStage(groupFinal.quarterFinals);
  collectFromStage(groupFinal.semifinals);
  collectFromStage(groupFinal.final34);
  collectFromStage(groupFinal.final);

  return map;
};

// 👇 mappa globale, sempre uguale: viene SOLO dal file hardcoded
const seedPronByFg = buildSeedPronByFg();

// 🔹 flatten delle squadre (A, B, C, ... → un solo array)
const tutteLeSquadre = Object.values(flagsMond).flat();

// 🔹 mappa: codice (id) → flag
const flagByTeamCode = Object.fromEntries(
  tutteLeSquadre.map((t) => [t.id, t.flag]),
);

// 🔹 helper per ottenere la bandiera da "MEX", "GER", ecc.
const getFlag = (code) => {
  if (!code) return null;
  return flagByTeamCode[code] || null;
};

const TableBlock = ({ isLogged }) => {
  // 🔹 stato locale per la fase finale: parte dall'hardcoded,
  // poi viene sovrascritto con i dati di Supabase
  const [finalData, setFinalData] = useState(() => structuredClone(groupFinal));

  // destrutturo dal LO STATO, non più dal file statico
  const { round32, round16, quarterFinals, semifinals, final34, final } =
    finalData;

  // 🔹 stato pron / utente (come prima)
  const [showPron, setShowPron] = useState(false);
  const [userPronByFg, setUserPronByFg] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const { qualifiedTeams } = useQualifiedTeams();

  // 🔹 carica FINALI da Supabase e sovrascrive l'hardcoded
  useEffect(() => {
    const loadFinalsFromDb = async () => {
      const { data: finalRows, error } = await supabase.from(
        "wc_final_structure",
      ).select(`
          phase_key,
          match_index,
          city,
          time,
          pos1,
          pos2,
          goto,
          fg,
          pronsq,
          team1,
          team2,
          results_res,
          results_ts,
          results_r
        `);

      if (error) {
        console.error("Errore caricando struttura FINALI (TableBlock):", error);
        return;
      }

      setFinalData((prev) => {
        const next = structuredClone(prev);

        for (const row of finalRows ?? []) {
          const phaseKey = row.phase_key; // es. "round32", "round16", ...
          const phase = next[phaseKey];
          if (!phase) continue;

          // flatten delle giornate della fase
          const allGiornate = Object.values(phase);
          const flat = [];
          for (const g of allGiornate) {
            for (const m of g.matches) flat.push(m);
          }

          const match = flat[row.match_index];
          if (!match) continue;

          if (row.city) match.city = row.city;
          if (row.time) match.time = row.time;

          if (row.pos1) match.pos1 = row.pos1;
          if (row.pos2) match.pos2 = row.pos2;
          if (row.goto) match.goto = row.goto;
          if (row.fg) match.fg = row.fg;
          if (row.pronsq) match.pronsq = row.pronsq;

          if (row.team1) match.team1 = row.team1;
          if (row.team2) match.team2 = row.team2;

          // risultati annidati
          if (row.results_res || row.results_ts || row.results_r) {
            if (!match.results) {
              match.results = { RES: "", TS: "", R: "" };
            }
            if (row.results_res) match.results.RES = row.results_res;
            if (row.results_ts) match.results.TS = row.results_ts;
            if (row.results_r) match.results.R = row.results_r;
          }
        }

        return next;
      });
    };

    loadFinalsFromDb();
  }, []); // 👈 parte una volta sola, per tutti (loggati e non)

  // 🔹 Ottieni user da Supabase (come prima)
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    };

    loadUser();
  }, [isLogged]);

  const isAdmin = currentUser?.email === "simobara@hotmail.it";

  useEffect(() => {
    setShowPron(false);
  }, [isLogged]);

  useEffect(() => {
    console.log("CURRENT USER:", currentUser);
    console.log("IS ADMIN:", isAdmin);
  }, [currentUser, isAdmin]);

  // 🔹 carica pronostici utente loggato (come prima)
  useEffect(() => {
    if (!isLogged) {
      setUserPronByFg({});
      return;
    }

    if (!currentUser?.id) {
      return;
    }

    const fetchUserPron = async () => {
      const { data, error } = await supabase
        .from("wc_final_user_pron")
        .select("fg, pronsq")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Errore caricando pronostici utente:", error);
        return;
      }

      const map = {};
      for (const row of data ?? []) {
        if (!row.fg || !row.pronsq) continue;
        map[row.fg] = row.pronsq.trim();
      }

      setUserPronByFg(map);
    };

    fetchUserPron();
  }, [isLogged, currentUser]);

  // 🔹 squadre REALI e PRON, didTeamAdvance, collectMatchesWithDate
  // (tutto identico, solo che usano round32/round16/... dallo stato)

  const collectRealTeamsFromStage = (stage) =>
    new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          giornata.matches.flatMap((m) => [
            (m.team1 || "").trim(),
            (m.team2 || "").trim(),
          ]),
        )
        .filter(Boolean),
    );

  const collectPronTeamsFromStage = (stage) =>
    new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          giornata.matches.flatMap((m) => {
            const pron = (m.pronsq || m.pron || "").trim();
            if (!pron) return [];
            const [p1, p2] = pron.split("-").map((s) => s.trim());
            return [p1 || "", p2 || ""];
          }),
        )
        .filter(Boolean),
    );

  const realTeamsInRound16 = collectRealTeamsFromStage(round16);
  const realTeamsInQuarter = collectRealTeamsFromStage(quarterFinals);
  const realTeamsInSemi = collectRealTeamsFromStage(semifinals);
  const realTeamsInFinalStages = new Set([...collectRealTeamsFromStage(final)]);

  const pronTeamsInRound16 = collectPronTeamsFromStage(round16);
  const pronTeamsInQuarter = collectPronTeamsFromStage(quarterFinals);
  const pronTeamsInSemi = collectPronTeamsFromStage(semifinals);
  const pronTeamsInFinalStages = new Set([...collectPronTeamsFromStage(final)]);

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

  const collectMatchesWithDate = (stage) =>
    Object.values(stage).flatMap((giornata) =>
      giornata.matches.map((match) => ({
        ...match,
        date: giornata.dates[0] || "",
      })),
    );

  const allMatches = [
    ...collectMatchesWithDate(round32),
    ...collectMatchesWithDate(round16),
    ...collectMatchesWithDate(quarterFinals),
    ...collectMatchesWithDate(semifinals),
    ...collectMatchesWithDate(final34),
    ...collectMatchesWithDate(final),
  ];

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
    if (!match) {
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    const team1 = (match.team1 || "").trim();
    const team2 = (match.team2 || "").trim();

    // ✅ QUALIFICATE DA GIRONE (solo B): se non ho team ufficiali,
    // uso pos1/pos2 per piazzare 1B/2B dal context
    const pos1 = String(match.pos1 ?? "").trim(); // es "2B"
    const pos2 = String(match.pos2 ?? "").trim(); // es "2A"

    const q1 = qualifiedTeams?.[pos1] || null; // { code, isPron }
    const q2 = qualifiedTeams?.[pos2] || null;

    const q1Code = q1?.code || "";
    const q2Code = q2?.code || "";
    const q1IsPron = !!q1?.isPron;
    const q2IsPron = !!q2?.isPron;

    // pronsq DAL DB (finalData) → usato per ADMIN / fallback
    const dbPron = (match.pronsq || match.pron || "").trim();

    // pronsq DAL FILE HARDCODED → usato per NON LOGGATO con showPron
    const seedPron = (seedPronByFg[match.fg] || "").trim();

    // 🔵 0) REGOLA BASE: SE CI SONO SQUADRE UFFICIALI, VINCONO SEMPRE
    //    (per TUTTI: admin, loggati, non loggati)
    // 🟢 0.5) Se non ho squadre ufficiali, ma ho qualificate dal girone (solo B),
    // le mostro nel tabellone usando pos1/pos2.
    if (q1Code || q2Code) {
      return {
        code1: q1Code,
        code2: q2Code,
        isPron1: q1IsPron, // ✅ viola se qualifica da pron
        isPron2: q2IsPron,
      };
    }

    // 🟣 1) ADMIN → usa pronsq del DB (perché lui lo modifica)
    if (isAdmin) {
      if (dbPron) {
        const [p1, p2] = dbPron.split("-").map((s) => s.trim());
        return { code1: p1, code2: p2, isPron1: true, isPron2: true };
      }

      // niente ufficiali e niente pronsq → vuoto
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    // 🟡 2) NON LOGGATO (ospite)
    if (!isLogged) {
      // se NON ha cliccato il bottone → non vede niente
      if (!showPron) {
        return { code1: "", code2: "", isPron1: false, isPron2: false };
      }

      // se ha cliccato il bottone → usa SEMPRE i seed dal file hardcoded
      if (seedPron) {
        const [p1, p2] = seedPron.split("-").map((s) => s.trim());
        return {
          code1: p1 || "",
          code2: p2 || "",
          isPron1: !!p1, // bordo viola
          isPron2: !!p2,
        };
      }

      // se per qualche motivo non c'è seed → niente
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    // 🧑‍💻 3) UTENTE LOGGATO NON ADMIN

    // prima i pronostici personali da wc_final_user_pron
    const userPronStr = userPronByFg[match.fg]; // es. "KOR-ITA"

    if (userPronStr) {
      const [u1, u2] = userPronStr.split("-").map((s) => s.trim());
      return {
        code1: u1 || "",
        code2: u2 || "",
        isPron1: !!u1,
        isPron2: !!u2,
      };
    }

    // niente ufficiali (già gestito sopra) e niente pron utente → opzionale: mostra pronsq admin dal DB
    // if (dbPron) {
    //   const [p1, p2] = dbPron.split("-").map((s) => s.trim());
    //   return {
    //     code1: p1 || "",
    //     code2: p2 || "",
    //     isPron1: !!p1,
    //     isPron2: !!p2,
    //   };
    // }

    return { code1: "", code2: "", isPron1: false, isPron2: false };
  };

  // 🔹 offset orizzontale semifinale rispetto al centro (speculare)
  const SEMI_OFFSET_DESKTOP = "10rem";
  const SEMI_OFFSET_MOBILE = "8rem";

  const renderMatchBlock = (match, rettColor, phase) => {
    if (!match) return null;

    const {
      code1: displayCode1,
      code2: displayCode2,
      isPron1,
      isPron2,
    } = getDisplayTeamsFromMatch(match);
    // console.log("isLogged:", isLogged, "showPron:", showPron);

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
        firstAdvanced={
          displayCode1 ? didTeamAdvance(displayCode1, phase, isPron1) : false
        }
        secondAdvanced={
          displayCode2 ? didTeamAdvance(displayCode2, phase, isPron2) : false
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
        overflow-x-auto overflow-y-auto
        md:overflow-x-auto md:overflow-y-auto
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
          <div className="md:-mt-8 -mt-4">
            {renderMatchBlock(mA1, Rett.A, "round32")}
          </div>

          <div>
            <div className="md:mt-10 mt-8">
              {renderMatchBlock(mA2, Rett.A, "round32")}
            </div>
            <div className="md:mt-20 mt-16">
              {renderMatchBlock(mA3, Rett.A, "round32")}
            </div>
            <div className="md:mt-10 mt-8">
              {renderMatchBlock(mA4, Rett.A, "round32")}
            </div>

            <div className="md:mt-20 mt-16">
              {renderMatchBlock(mB1, Rett.B, "round32")}
            </div>
            <div className="md:mt-10 mt-8">
              {renderMatchBlock(mB2, Rett.B, "round32")}
            </div>
            <div className="md:mt-20 mt-16">
              {renderMatchBlock(mB3, Rett.B, "round32")}
            </div>
            <div className="md:mt-10 mt-8">
              {renderMatchBlock(mB4, Rett.B, "round32")}
            </div>
          </div>
        </div>

        {/* ✅ COLONNA 16 A */}
        <div className="relative flex-1 h-full flex bg-orange flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 -ml-8">
            {renderMatchBlock(mA5, Rett.A, "round16")}
          </div>
          <div className="md:mt-44 mt-36 -ml-8">
            {renderMatchBlock(mA6, Rett.A, "round16")}
          </div>
          <div className="md:mt-48 mt-44 -ml-8">
            {renderMatchBlock(mB5, Rett.B, "round16")}
          </div>
          <div className="md:mt-44 mt-36 -ml-8">
            {renderMatchBlock(mB6, Rett.B, "round16")}
          </div>
        </div>

        {/* ✅ COLONNA QUARTI A */}
        <div className="relative flex-1 h-full bg-blue flex flex-col items-start md:pt-20 pt-12">
          <div className="md:mt-[10rem] mt-[9rem] md:-ml-6 -ml-8">
            {renderMatchBlock(mA7, Rett.A, "quarter")}
          </div>
          <div className="md:mt-[26rem] mt-[23rem] md:-ml-6 -ml-8">
            {renderMatchBlock(mB7, Rett.B, "quarter")}
          </div>
        </div>

        {/* ✅ COLONNA SEMIFINALI + FINALE */}
        <div className="flex-1 h-full bg-green- relative overflow-visible">
          {/* 🏆 Coppa: sfondo, z più basso */}
          <img
            src="/assts/WCOfficial.png"
            alt="World Cup"
            className="
          absolute
                left-1/2
                md:-translate-x-1/2  -translate-x-[27vw]
                md:translate-y-[8vh] translate-y-[14vh]
                md:w-[300px] w-[200px]
                max-w-none pointer-events-none md:scale-110 scale-150
      z-0
    "
          />

          {/* ✅ Blocco FINALE F1: posizione FISSA nella colonna, sopra la coppa */}
          <div
            className="
      absolute
      left-1/2 -translate-x-1/2 md:translate-y-[12vh] translate-y-[14vh]
      md:top-[18rem] top-[16rem]
      z-10
      flex items-center justify-center
    "
          >
            <div className="relative">
              {renderMatchBlock(mF1, Rett.Final, "final")}

              <button
                onClick={() => {
                  if (!isLogged) setShowPron((prev) => !prev);
                }}
                disabled={isLogged}
                className="
          select-none
          absolute 
          md:right-10 right-8 
          md:-top-8 -top-7 
          bg-transparent
          text-yellow-500 font-bold
          text-xs md:text-sm
          px-3 py-0
          rounded-full z-50 
        "
              >
                {showPron ? "," : "."}
              </button>
            </div>
          </div>

          {/* ✅ SEMIFINALE A → AB1 (verticale) */}
          {(() => {
            const { code1, code2, isPron1, isPron2 } =
              getDisplayTeamsFromMatch(mAB1);

            return (
              <div
                className=" absolute left-1/2 -translate-x-1/2 md:top-[27.5rem] top-[23rem] z-10 ml-4"
                style={{
                  transform: `translateX(calc(-50% - ${SEMI_OFFSET_DESKTOP}))`,
                }}
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
                  topAdvanced={
                    code1 ? didTeamAdvance(code1, "semi", isPron1) : false
                  }
                  bottomAdvanced={
                    code2 ? didTeamAdvance(code2, "semi", isPron2) : false
                  }
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
            const { code1, code2, isPron1, isPron2 } =
              getDisplayTeamsFromMatch(mCD1);

            return (
              <div
                className=" absolute left-1/2 -translate-x-1/2 md:top-[27.5rem] top-[23rem] z-10 -ml-4"
                style={{
                  transform: `translateX(calc(-50% + ${SEMI_OFFSET_DESKTOP}))`,
                }}
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
                  topAdvanced={
                    code1 ? didTeamAdvance(code1, "semi", isPron1) : false
                  }
                  bottomAdvanced={
                    code2 ? didTeamAdvance(code2, "semi", isPron2) : false
                  }
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
          <div className="md:mt-[10rem] mt-[9rem] md:ml-0 -mr-8">
            {renderMatchBlock(mC7, Rett.C, "quarter")}
          </div>
          <div className="md:mt-[26rem] mt-[23rem] md:ml-0 -mr-8">
            {renderMatchBlock(mD7, Rett.D, "quarter")}
          </div>
        </div>

        {/* ✅ COLONNA 16 B */}
        <div className="relative flex-1 h-full bg-orange flex flex-col items-center md:pt-20 pt-12">
          <div className="md:mt-8 mt-8 -mr-8">
            {renderMatchBlock(mC5, Rett.C, "round16")}
          </div>
          <div className="md:mt-44 mt-36 -mr-8">
            {renderMatchBlock(mC6, Rett.C, "round16")}
          </div>
          <div className="md:mt-48 mt-44 -mr-8">
            {renderMatchBlock(mD5, Rett.D, "round16")}
          </div>
          <div className="md:mt-44 mt-36 -mr-8">
            {renderMatchBlock(mD6, Rett.D, "round16")}
          </div>
        </div>

        {/* ✅ COLONNA 32 B */}
        <div className="relative flex-1 h-full bg-purple flex flex-col items-center md:pt-20 pt-12">
          <div className="md:-mt-8 -mt-4">
            {renderMatchBlock(mC1, Rett.C, "round32")}
          </div>
          <div className="md:mt-10 mt-8">
            {renderMatchBlock(mC2, Rett.C, "round32")}
          </div>
          <div className="md:mt-20 mt-16">
            {renderMatchBlock(mC3, Rett.C, "round32")}
          </div>
          <div className="md:mt-10 mt-8">
            {renderMatchBlock(mC4, Rett.C, "round32")}
          </div>

          <div className="md:mt-20 mt-16">
            {renderMatchBlock(mD1, Rett.D, "round32")}
          </div>
          <div className="md:mt-10 mt-8">
            {renderMatchBlock(mD2, Rett.D, "round32")}
          </div>
          <div className="md:mt-20 mt-16">
            {renderMatchBlock(mD3, Rett.D, "round32")}
          </div>
          <div className="md:mt-10 mt-8">
            {renderMatchBlock(mD4, Rett.D, "round32")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBlock;
