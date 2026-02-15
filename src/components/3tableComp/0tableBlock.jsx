import { useEffect, useState } from "react";
import { useQualifiedTeams } from "../../Ap/Global/global";
import { supabase } from "../../Services/supabase/supabaseClient";
import { flagsMond } from "../../START/app/0main";
import { groupFinal } from "../../START/app/2GroupFinal";
import { Rett } from "../../START/styles/0CssGsTs";
import { getSortedTeamsForGroup } from "../2aGroupMatches/zExternal/getSortedTeamsForGroup";
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

// 🔹 Costruisco una mappa fg -> pronsq **DAL FILE HARDCODED**
const getFgByPhaseAndIndex = (phaseKey, matchIndex) => {
  const phase = finalData?.[phaseKey];
  if (!phase) return "";

  const flat = Object.values(phase).flatMap((g) => g.matches);
  return (flat?.[matchIndex]?.fg || "").trim();
};

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
  const { qualifiedTeams, setQualifiedTeams } = useQualifiedTeams();

  // ✅ se loggato: aspetta che arrivino le qualificate (evita flash vuoto sul tabellone)
  // const qualifiedReady =
  //  --- !isLogged || (qualifiedTeams && Object.keys(qualifiedTeams).length > 0);

  const qualifiedReady = true; // non bloccare mai l'output
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
          match.pronsq = row.pronsq ?? null; // oppure "" se preferisci stringa vuota
          match._dbLoaded = true; // ✅ questo match è stato caricato dal DB

          // ✅ team1/team2:
          // - ROUND32: se nel DB è vuoto/non valorizzato, NON cancellare l'hardcoded (fallback "come prima")
          // - altre fasi: puoi anche svuotare, perché lì di default vuoi vuoto finché non inserisci
          if (phaseKey === "round32") {
            if (row.team1 != null && String(row.team1).trim() !== "")
              match.team1 = row.team1;
            if (row.team2 != null && String(row.team2).trim() !== "")
              match.team2 = row.team2;
          } else {
            match.team1 = row.team1 ?? "";
            match.team2 = row.team2 ?? "";
          }

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

  // ✅ PULIZIA: non usare mai pronsq hardcoded nello stato iniziale
  // (city/time ecc restano hardcoded, ma i pron sbagliati spariscono)
  useEffect(() => {
    setFinalData((prev) => {
      const next = structuredClone(prev);

      const clearStage = (stage) => {
        Object.values(stage).forEach((giornata) => {
          giornata.matches.forEach((m) => {
            // ✅ NON cancellare se quel match è già arrivato dal DB
            if (m?._dbLoaded) return;
            m.pronsq = null; // oppure ""
          });
        });
      };

      clearStage(next.round32);
      clearStage(next.round16);
      clearStage(next.quarterFinals);
      clearStage(next.semifinals);
      clearStage(next.final34);
      clearStage(next.final);

      return next;
    });
  }, []);

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

  // ✅ GUEST: calcola e popola qualifiedTeams SOLO quando un gruppo ha TUTTE le 6 partite ufficiali
  useEffect(() => {
    if (isLogged) return; // solo guest
    if (showPron) return; // se guest sta guardando i seed hardcoded, non sovrascrivo nulla

    let cancelled = false;

    const normalizeScore = (s) =>
      String(s ?? "")
        .trim()
        .replace(/[–—−]/g, "-")
        .replace(/:/g, "-")
        .replace(/\s+/g, "");

    const isOfficialScore = (s) => {
      const v = normalizeScore(s);
      if (!v || !v.includes("-")) return false;
      const [aStr, bStr] = v.split("-");
      const a = Number(aStr);
      const b = Number(bStr);
      return Number.isFinite(a) && Number.isFinite(b);
    };

    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("wc_matches_structure")
          .select("group_letter, match_index, team1, team2, results_official");

        if (error) {
          console.warn(
            "GUEST qualify: errore caricando wc_matches_structure",
            error,
          );
          return;
        }

        // costruisco matchesData stile groupMatches: giornata_1/2/3 con 2 match ciascuna
        const byGroup = {};
        for (const r of rows ?? []) {
          const letter = String(r.group_letter ?? "").trim();
          if (!letter) continue;

          const idx = Number(r.match_index ?? 0);
          const gKey =
            idx <= 1 ? "giornata_1" : idx <= 3 ? "giornata_2" : "giornata_3";

          if (!byGroup[letter]) {
            byGroup[letter] = {
              giornata_1: { matches: [] },
              giornata_2: { matches: [] },
              giornata_3: { matches: [] },
            };
          }

          byGroup[letter][gKey].matches.push({
            team1: r.team1,
            team2: r.team2,
            results: r.results_official ?? null, // ✅ ufficiale
            ris: null,
            pron: null,
          });
        }

        // reset completo 1A..2L (così non restano vecchi valori)
        const resetAll = {};
        for (const L of "ABCDEFGHIJKL") {
          resetAll[`1${L}`] = { code: "", isPron: false };
          resetAll[`2${L}`] = { code: "", isPron: false };
        }

        const nextQualified = {};

        for (const L of "ABCDEFGHIJKL") {
          const matchesData = byGroup[L];
          if (!matchesData) continue;

          // ✅ guest: procede SOLO se tutte e 6 sono ufficiali
          const all = Object.values(matchesData).flatMap(
            (g) => g?.matches ?? [],
          );
          if (all.length < 6) continue;
          if (!all.every((m) => isOfficialScore(m?.results))) continue;

          // ✅ calcolo classifica ufficiale e prendo 1° e 2°
          const sorted = getSortedTeamsForGroup({
            flagsMond,
            groupLetter: L,
            matchesData,
            maxMatches: null,
            allowRis: false, // 🔥 SOLO ufficiali
            useBonus: false,
          });

          const first = sorted?.[0]?.id || "";
          const second = sorted?.[1]?.id || "";
          if (!first || !second) continue;

          nextQualified[`1${L}`] = { code: first, isPron: false };
          nextQualified[`2${L}`] = { code: second, isPron: false };
        }

        if (!cancelled) {
          setQualifiedTeams({ ...resetAll, ...nextQualified });
        }
      } catch (e) {
        console.warn("GUEST qualify exception:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogged, showPron, setQualifiedTeams]);

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

    if (!currentUser?.email) return;

    const fetchUserPron = async () => {
      const getFgByPhaseAndIndex = (phaseKey, matchIndex) => {
        const phase = finalData?.[phaseKey];
        if (!phase) return "";
        const flat = Object.values(phase).flatMap((g) => g.matches);
        return (flat?.[matchIndex]?.fg || "").trim();
      };

      const { data, error } = await supabase
        .from("wc_final_structure_userpron")
        .select("phase_key, match_index, user_pronsq")
        .eq("user_email", currentUser.email);

      if (error) {
        console.error("Errore caricando pronostici utente:", error);
        return;
      }

      const map = {};
      for (const row of data ?? []) {
        const fg = getFgByPhaseAndIndex(row.phase_key, row.match_index);
        const pr = String(row.user_pronsq ?? "").trim();
        if (fg && pr) map[fg] = pr;
      }

      setUserPronByFg(map);
    };

    fetchUserPron();
  }, [isLogged, currentUser?.email, finalData]);

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

  const collectPronTeamsFromStage = (stage) => {
    // ✅ OSPITE + showPron: avanzamenti basati SOLO sui seed hardcoded
    const srcStage = !isLogged && showPron ? stage : stage;

    return new Set(
      Object.values(srcStage)
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
  };

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
  const getDisplayTeamsFromMatch = (match, phase) => {
    if (!match) {
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    // 🏆 PRIORITÀ ASSOLUTA:
    // se esistono team ufficiali inseriti dall'admin → vincono su TUTTO
    // (qualifiedTeams, pronsq, user pron, ecc.)
    const absT1 = (match.team1 || "").trim();
    const absT2 = (match.team2 || "").trim();

    if (absT1 || absT2) {
      return {
        code1: absT1,
        code2: absT2,
        isPron1: false,
        isPron2: false,
      };
    }

    // ✅ ROUND32: se admin inserisce team1/team2 nel DB -> sono UFFICIALI
    // - se T1/T2 sono vuoti -> fallback a "come prima" (calcolo/qualifiedTeams/pos1-pos2)
    // - se uno dei due è valorizzato -> sovrascrive SOLO quel lato
    // ⚠️ eccezione: se GUEST con showPron attivo, vince l'hardcoded (regola tua)
    const isGuestShowPron = !isLogged && showPron;

    if (phase === "round32" && !isGuestShowPron) {
      const t1 = (match.team1 || "").trim();
      const t2 = (match.team2 || "").trim();

      // 🟣 ROUND32: se l'admin ha scritto pronsq, deve avere priorità sul calcolo (anche se T1/T2 sono vuoti)
      if (isAdmin) {
        const dbPron32 = String(match.pronsq ?? "").trim();
        if (dbPron32) {
          const [p1, p2] = dbPron32.split("-").map((s) => s.trim());
          return {
            code1: p1 || "",
            code2: p2 || "",
            isPron1: !!p1,
            isPron2: !!p2,
          };
        }
      }

      if (t1 || t2) {
        const pos1 = String(match.pos1 ?? "").trim();
        const pos2 = String(match.pos2 ?? "").trim();

        const q1 = qualifiedTeams?.[pos1] || null; // { code, isPron }
        const q2 = qualifiedTeams?.[pos2] || null;

        const fb1 = q1?.code || "";
        const fb2 = q2?.code || "";
        const fb1IsPron = !!q1?.isPron;
        const fb2IsPron = !!q2?.isPron;

        return {
          code1: t1 || fb1,
          code2: t2 || fb2,
          isPron1: t1 ? false : fb1IsPron,
          isPron2: t2 ? false : fb2IsPron,
        };
      }
    }

    // ✅ ADMIN OVERRIDE (ROUND16 → FINAL):
    // se l'admin ha inserito team1/team2 nel DB, mostrali SEMPRE
    // ✅ UFFICIALI DA DB (ROUND16 → FINAL) visibili a TUTTI:
    // se ci sono team1/team2 nel DB, mostrali SEMPRE
    // ⚠️ eccezione: se GUEST con showPron attivo, vince l'hardcoded (regola tua)
    const isFinalPhaseFromR16 = [
      "round16",
      "quarter",
      "semi",
      "final",
    ].includes(phase);

    if (isFinalPhaseFromR16 && !isGuestShowPron) {
      const t1 = (match.team1 || "").trim();
      const t2 = (match.team2 || "").trim();

      if (t1 || t2) {
        return {
          code1: t1,
          code2: t2,
          isPron1: false,
          isPron2: false,
        };
      }
    }

    // ✅ OVERRIDE TOTALE (OSPITE): se NON loggato e showPron attivo,
    // le squadre arrivano SEMPRE dal seed HARDCODED (groupFinal → pronsq),
    // ignorando DB, qualifiedTeams, pronsq admin, team1/team2 reali, ecc.
    if (!isLogged && showPron) {
      const seedPron = (seedPronByFg?.[match.fg] || "").trim();
      if (seedPron) {
        const [p1, p2] = seedPron.split("-").map((s) => s.trim());
        return {
          code1: p1 || "",
          code2: p2 || "",
          isPron1: !!p1,
          isPron2: !!p2,
        };
      }
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    const team1 = (match.team1 || "").trim();
    const team2 = (match.team2 || "").trim();

    // ... il resto della tua funzione rimane IDENTICO sotto

    // ✅ GUEST: finché non ho le qualificate ufficiali nel context,
    // evito di mostrare vuoto “a scatti” nei match pos1/pos2
    if (!isLogged && !showPron) {
      const pos1 = String(match.pos1 ?? "").trim();
      const pos2 = String(match.pos2 ?? "").trim();
      const q1 = qualifiedTeams?.[pos1] || null;
      const q2 = qualifiedTeams?.[pos2] || null;

      const q1Code = q1?.code || "";
      const q2Code = q2?.code || "";

      // se mancano ancora entrambe → non mostrare niente (coerente con regola "solo ufficiali")
      if (!q1Code && !q2Code) {
        return { code1: "", code2: "", isPron1: false, isPron2: false };
      }
    }

    const pos1 = String(match.pos1 ?? "").trim(); // es "2B"
    const pos2 = String(match.pos2 ?? "").trim(); // es "2A"

    const q1 = qualifiedTeams?.[pos1] || null; // { code, isPron }
    const q2 = qualifiedTeams?.[pos2] || null;

    const q1Code = q1?.code || "";
    const q2Code = q2?.code || "";
    const q1IsPron = !!q1?.isPron;
    const q2IsPron = !!q2?.isPron;

    // ✅ OSPITE senza showPron:
    // - mostra SOLO qualificate ufficiali (isPron=false)
    // - se provvisorie (isPron=true) non mostra nulla
    if (!isLogged && !showPron) {
      const hasOfficialQualified =
        (q1Code && !q1IsPron) || (q2Code && !q2IsPron);

      if (hasOfficialQualified) {
        return {
          code1: !q1IsPron ? q1Code : "",
          code2: !q2IsPron ? q2Code : "",
          isPron1: false,
          isPron2: false,
        };
      }

      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

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

    // 🟣 1) ADMIN → usa pronsq del DB SOLO come pronostico admin
    if (isAdmin) {
      if (dbPron) {
        const [p1, p2] = dbPron.split("-").map((s) => s.trim());
        return {
          code1: p1 || "",
          code2: p2 || "",
          isPron1: !!p1,
          isPron2: !!p2,
        };
      }

      // niente ufficiali e niente pronsq → vuoto
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    // 🟡 2) NON LOGGATO (ospite)
    // A questo punto:
    // - showPron ON è già gestito all'inizio (override hardcoded)
    // - showPron OFF mostra solo le qualificate (gestite sopra con q1/q2) o vuoto
    if (!isLogged) {
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
    } = getDisplayTeamsFromMatch(match, phase);
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
            const { code1, code2, isPron1, isPron2 } = getDisplayTeamsFromMatch(
              mAB1,
              "semi",
            );

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
            const { code1, code2, isPron1, isPron2 } = getDisplayTeamsFromMatch(
              mCD1,
              "semi",
            );

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
