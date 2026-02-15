import { useEffect, useRef, useState } from "react";
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

// const getFgByPhaseAndIndex = (phaseKey, matchIndex) => {
//   const phase = finalData?.[phaseKey];
//   if (!phase) return "";
//   const flat = Object.values(phase).flatMap((g) => g.matches);
//   return (flat?.[matchIndex]?.fg || "").trim();
// };

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

  // ✅ ref per leggere userPronByFg senza triggerare loop di useEffect
  const userPronRef = useRef({});
  useEffect(() => {
    userPronRef.current = userPronByFg || {};
  }, [userPronByFg]);

  // ✅ se loggato: aspetta che arrivino le qualificate (evita flash vuoto sul tabellone)
  // const qualifiedReady =
  //  --- !isLogged || (qualifiedTeams && Object.keys(qualifiedTeams).length > 0);

  const qualifiedReady = true; // non bloccare mai l'output
  // 🔹 carica FINALI da Supabase e sovrascrive l'hardcoded

  const flattenPhase = (phaseObj) =>
    Object.values(phaseObj || {}).flatMap((g) => g?.matches || []);

  const normPhaseKey = (k) => {
    const key = String(k || "").trim();
    if (key === "quarter") return "quarterFinals";
    if (key === "semi" || key === "semifinal") return "semifinals";
    return key; // round32, round16, final34, final...
  };

  const loadFinalsFromDb = async () => {
    try {
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
        console.error("❌ loadFinalsFromDb error:", error);
        return;
      }

      console.log("✅ DB finals rows sample:", (finalRows ?? []).slice(0, 5));

      setFinalData((prev) => {
        const next = structuredClone(prev);

        for (const row of finalRows ?? []) {
          const phaseKey = normPhaseKey(row.phase_key);
          const idx = Number(row.match_index);

          const phase = next?.[phaseKey];
          if (!phase || !Number.isFinite(idx)) continue;

          const flat = flattenPhase(phase); // ✅ stesso ordine OVUNQUE
          const match = flat?.[idx];
          if (!match) continue;

          if (row.city != null) match.city = row.city;
          if (row.time != null) match.time = row.time;
          if (row.pos1 != null) match.pos1 = row.pos1;
          if (row.pos2 != null) match.pos2 = row.pos2;
          if (row.goto != null) match.goto = row.goto;
          if (row.fg != null) match.fg = row.fg;

          match.pronsq = row.pronsq ?? null;
          match._dbLoaded = true;

          const cleanTeam = (v) =>
            String(v ?? "")
              .trim()
              .toUpperCase();

          const t1 = cleanTeam(row.team1);
          const t2 = cleanTeam(row.team2);

          if (phaseKey === "round32") {
            // ✅ round32: scrivo SOLO se ho valore (così non cancello eventuali hardcoded utili)
            if (t1) match.team1 = t1;
            if (t2) match.team2 = t2;
          } else {
            // ✅ da round16 in poi: DB è source of truth (anche vuoto)
            match.team1 = t1;
            match.team2 = t2;
          }

          const cleanRes = (v) => String(v ?? "").trim(); // 🔥 toglie anche " "
          const rRES = cleanRes(row.results_res);
          const rTS = cleanRes(row.results_ts);
          const rR = cleanRes(row.results_r);

          const hasAnyRes = !!(rRES || rTS || rR);

          if (hasAnyRes) {
            match.results = match.results || { RES: "", TS: "", R: "" };
            match.results.RES = rRES;
            match.results.TS = rTS;
            match.results.R = rR;
          } else {
            // ✅ se DB non ha risultati veri, svuoto eventuale roba hardcoded
            match.results = { RES: "", TS: "", R: "" };
          }
        }

        return next;
      });
    } catch (e) {
      console.error("❌ loadFinalsFromDb exception:", e);
    }
  };

  useEffect(() => {
    (async () => {
      await loadFinalsFromDb();
    })();
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

  // ✅ REALTIME (ADMIN): se cambia wc_final_structure, riallineo subito lo stato
  useEffect(() => {
    if (!isLogged) return;
    if (!isAdmin) return;

    const channel = supabase
      .channel("wc_final_structure_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wc_final_structure" },
        () => {
          loadFinalsFromDb();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged, isAdmin]);

  // ✅ ricarica pronostici utente dal DB (SOLO non-admin)
  const reloadUserPronFromDb = async () => {
    if (!isLogged) return;
    if (isAdmin) return; // ✅ IMPORTANTISSIMO: admin non usa questa tabella
    if (!currentUser?.email) return;

    const getFgByPhaseAndIndex = (phaseKeyRaw, matchIndex) => {
      const phaseKey = normPhaseKey(phaseKeyRaw);
      const phase = finalData?.[phaseKey];
      if (!phase) return "";
      const flat = flattenPhase(phase);
      return (flat?.[matchIndex]?.fg || "").trim();
    };

    const { data, error } = await supabase
      .from("wc_final_structure_userpron")
      .select("phase_key, match_index, user_pronsq")
      .eq("user_email", currentUser.email);

    if (error) {
      console.error("Errore ricaricando pronostici utente:", error);
      return;
    }

    const map = {};
    for (const row of data ?? []) {
      const fg = getFgByPhaseAndIndex(row.phase_key, row.match_index);
      if (!fg) continue;

      // ✅ mantieni anche i NULL/vuoti: chiave presente = utente ha premuto ❌
      const pr = row.user_pronsq == null ? "" : String(row.user_pronsq).trim();
      map[fg] = pr;
    }

    setUserPronByFg(map);
  };

  // ✅ ADMIN: reset SOLO UI (DB lo facciamo allo STEP 4)
  const resetFinalMatchUi = (fg) => {
    const meta = getMetaByFg(fg);
    if (!meta) {
      console.warn("❌ resetFinalMatchUi: meta non trovata per fg", fg);
      return;
    }

    setFinalData((prev) => {
      const next = structuredClone(prev);
      const phaseObj = next?.[meta.phaseKey];
      if (!phaseObj) return prev;

      const flat = flattenPhase(phaseObj);

      const m = flat?.[meta.matchIndex];
      if (!m) return prev;

      // reset UI
      m.pronsq = null;
      m.team1 = "";
      m.team2 = "";
      if (m.results) {
        m.results = { RES: "", TS: "", R: "" };
      }

      return next;
    });

    console.log("✅ resetFinalMatchUi OK", {
      fg,
      phaseKey: meta.phaseKey,
      matchIndex: meta.matchIndex,
    });
  };

  // ✅ ADMIN: reset DB (tabella giusta = wc_final_structure)
  const resetFinalMatchDb = async (fg) => {
    const meta = getMetaByFg(fg);
    if (!meta) {
      console.warn("❌ resetFinalMatchDb: meta non trovata per fg", fg);
      return false;
    }

    try {
      const payload = {
        pronsq: null,
        team1: "",
        team2: "",
        results_res: null,
        results_ts: null,
        results_r: null,
      };

      const { data, error } = await supabase
        .from("wc_final_structure")
        .update(payload)
        .eq("phase_key", meta.phaseKey)
        .eq("match_index", meta.matchIndex)
        .select("phase_key, match_index, pronsq, team1, team2"); // ✅ mi conferma cosa ha scritto

      if (error) {
        console.error("❌ resetFinalMatchDb ERROR", { fg, meta, error });
        return false;
      }

      console.log("✅ resetFinalMatchDb OK", { fg, meta, data });
      return true;
    } catch (e) {
      console.error("❌ resetFinalMatchDb EXCEPTION", e);
      return false;
    }
  };

  // ✅ USER (non admin): reset SOLO pronostico utente (UI)
  const resetUserMatchUi = (fg) => {
    const fgClean = String(fg || "").trim();
    if (!fgClean) return;

    // ✅ non fare delete: la chiave deve restare per bloccare i fallback (marca "cancellato")
    setUserPronByFg((prev) => ({
      ...(prev || {}),
      [fgClean]: "", // stringa vuota = utente ha premuto ❌
    }));

    console.log("✅ resetUserMatchUi OK", { fg: fgClean });
  };

  // ✅ USER (non admin): reset DB su wc_final_structure_userpron
  const resetUserMatchDb = async (fg) => {
    const fgClean = String(fg || "").trim();
    if (!fgClean) return false;

    const meta = getMetaByFg(fgClean);
    if (!meta) {
      console.warn("❌ resetUserMatchDb: meta non trovata", fgClean);
      return false;
    }

    try {
      const userEmail = String(currentUser?.email || "").trim();
      const userId = String(currentUser?.id || "").trim();
      if (!userEmail || !userId) return false;

      // ✅ update->insert: anche se la riga non esiste ancora, la creo con NULL
      await saveUserPronRow({
        userId,
        userEmail,
        phaseKey: meta.phaseKey,
        matchIndex: meta.matchIndex,
        user_pronsq: null, // ✅ cancella nel DB
      });

      console.log("✅ resetUserMatchDb OK", { fg: fgClean, meta });
      return true;
    } catch (e) {
      console.error("❌ resetUserMatchDb EXCEPTION", e);
      return false;
    }
  };

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
      const getFgByPhaseAndIndex = (phaseKeyRaw, matchIndex) => {
        const phaseKey = normPhaseKey(phaseKeyRaw);
        const phase = finalData?.[phaseKey];
        if (!phase) return "";
        const flat = flattenPhase(phase);
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
        if (!fg) continue;

        // ✅ mantieni anche i NULL/vuoti: chiave presente = utente ha premuto ❌
        const pr =
          row.user_pronsq == null ? "" : String(row.user_pronsq).trim();
        map[fg] = pr;
      }

      setUserPronByFg(map);
    };

    fetchUserPron();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged, currentUser?.email]);

  // ✅ NON ADMIN: autopopola round32 (da qualifiedTeams) e scrive in wc_final_structure_userpron
  // - solo se l’utente è loggato e NON admin
  // - solo se per quel fg non ho già un userPronByFg salvato
  // - scrive formato "AAA-BBB"
  useEffect(() => {
    if (!isLogged) return;
    if (isAdmin) return;

    const userEmail = String(currentUser?.email || "").trim();
    const userId = String(currentUser?.id || "").trim();
    if (!userEmail || !userId) return;

    // serve che qualifiedTeams sia pronto (1A,2A,...)
    if (!qualifiedTeams || Object.keys(qualifiedTeams).length === 0) return;

    let cancelled = false;

    const buildRound32Pairs = () => {
      const stage = finalData?.round32;
      if (!stage) return [];

      const pairs = [];
      Object.values(stage).forEach((giornata) => {
        (giornata?.matches || []).forEach((m) => {
          const fg = String(m?.fg || "").trim();
          if (!fg) return;

          const pos1 = String(m?.pos1 || "").trim();
          const pos2 = String(m?.pos2 || "").trim();

          const q1 = qualifiedTeams?.[pos1]?.code || "";
          const q2 = qualifiedTeams?.[pos2]?.code || "";

          // ✅ nuova regola:
          // - se ho entrambe -> "AAA-BBB"
          // - se ho solo q1 -> "AAA-"
          // - se ho solo q2 -> "-BBB"
          if (q1 || q2) {
            pairs.push({ fg, pr: `${q1 || ""}-${q2 || ""}` });
          }
        });
      });

      return pairs;
    };

    (async () => {
      try {
        const pairs = buildRound32Pairs();
        if (pairs.length === 0) return;

        for (const { fg, pr } of pairs) {
          if (cancelled) return;

          // se già ce l’ho in stato (caricato da DB o già salvato), non sovrascrivo
          const existing = String(userPronRef.current?.[fg] || "").trim();

          // ✅ aggiorna solo se:
          // - non esiste nulla
          // - oppure esiste ma è incompleto (es "AAA-" o "-BBB") e ora ho qualcosa in più
          const isIncomplete =
            existing.includes("-") &&
            (existing.startsWith("-") || existing.endsWith("-"));

          const wouldImprove = !existing || (isIncomplete && existing !== pr);

          if (!wouldImprove) continue;

          const meta = getMetaByFg(fg);
          if (!meta) continue;

          // UI
          setUserPronByFg((prev) => {
            const next = { ...(prev || {}) };
            if (!next[fg]) next[fg] = pr;
            return next;
          });

          // DB (update->insert)
          await saveUserPronRow({
            userId,
            userEmail,
            phaseKey: meta.phaseKey, // dovrebbe essere "round32"
            matchIndex: meta.matchIndex,
            user_pronsq: pr,
          });

          console.log("✅ AUTO round32 saved", { fg, pr, meta });
        }
      } catch (e) {
        console.error("❌ AUTO round32 save error", e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // ⚠️ dipendenze: quando cambiano le qualificate o la struttura round32, riprovo
  }, [
    isLogged,
    isAdmin,
    currentUser?.email,
    currentUser?.id,
    qualifiedTeams,
    finalData,
  ]);

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

  const getPronStrForMatch = (m) => {
    const fg = String(m?.fg || "").trim();

    // ✅ LOGGATO NON-ADMIN: i pron veri sono quelli dell’utente
    if (isLogged && !isAdmin && fg) {
      if (Object.prototype.hasOwnProperty.call(userPronByFg, fg)) {
        return String(userPronByFg?.[fg] ?? "").trim(); // può essere "" (reset)
      }
    }

    // fallback: admin/guest (o se non ho riga utente)
    return String(m?.pronsq || m?.pron || "").trim();
  };

  const collectPronTeamsFromStage = (stage) => {
    // ✅ guest+showPron rimane come prima (usa seed hardcoded tramite getDisplayTeamsFromMatch)
    // ma per l’advanced-check a noi basta la stringa pron “effettiva”
    return new Set(
      Object.values(stage)
        .flatMap((giornata) =>
          (giornata?.matches || []).flatMap((m) => {
            const pronStr = getPronStrForMatch(m);
            if (!pronStr || !pronStr.includes("-")) return [];
            const [p1, p2] = pronStr.split("-").map((s) => (s || "").trim());
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
      case "semifinals":
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

  // ✅ helper: dato fg (es "A5") -> { phaseKey, matchIndex }
  const getMetaByFg = (fg) => {
    const phases = [
      "round32",
      "round16",
      "quarterFinals",
      "semifinals",
      "final34",
      "final",
    ];
    const fgClean = String(fg || "").trim();

    for (const phaseKey of phases) {
      const phase = finalData?.[phaseKey];
      if (!phase) continue;

      const flat = flattenPhase(phase); // ✅ stesso ordine
      const idx = flat.findIndex((m) => String(m?.fg || "").trim() === fgClean);
      if (idx >= 0) return { phaseKey, matchIndex: idx };
    }
    return null;
  };

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
    const fgKey = String(match?.fg || "").trim(); // ✅ sempre disponibile

    if (!match) {
      return { code1: "", code2: "", isPron1: false, isPron2: false };
    }

    // 🏆 PRIORITÀ ASSOLUTA:
    // se esistono team ufficiali inseriti dall'admin → vincono su TUTTO
    // (qualifiedTeams, pronsq, user pron, ecc.)
    const absT1 = (match.team1 || "").trim();
    const absT2 = (match.team2 || "").trim();

    // ✅ se ho un lato ufficiale e l'altro vuoto:
    // - il lato ufficiale vince sempre
    // - l'altro lato può usare i fallback (qualifiedTeams / userPron / pronsq ecc.)
    if (absT1 || absT2) {
      // calcolo fallback come se NON avessi ufficiali
      const matchNoOfficial = { ...match, team1: "", team2: "" };
      const fb = getDisplayTeamsFromMatch(matchNoOfficial, phase);

      return {
        code1: absT1 || fb.code1,
        code2: absT2 || fb.code2,
        isPron1: absT1 ? false : fb.isPron1,
        isPron2: absT2 ? false : fb.isPron2,
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
      "semifinals",
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
      const seedPron = (seedPronByFg?.[fgKey] || "").trim();

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
    const seedPron = (seedPronByFg[fgKey] || "").trim();

    // ✅ LOGGATO NON ADMIN: se esiste la chiave (anche vuota) deve BLOCCARE i fallback (qualifiedTeams/dbPron)
    if (isLogged && !isAdmin) {
      if (Object.prototype.hasOwnProperty.call(userPronByFg, fgKey)) {
        const userPronStr = String(userPronByFg?.[fgKey] || "").trim();

        if (userPronStr && userPronStr.includes("-")) {
          const [u1, u2] = userPronStr.split("-").map((s) => (s || "").trim());
          return {
            code1: u1 || "",
            code2: u2 || "",
            isPron1: !!u1,
            isPron2: !!u2,
          };
        }

        // 👈 chiave presente ma vuota => utente ha premuto ❌
        return { code1: "", code2: "", isPron1: false, isPron2: false };
      }
    }

    // 🟣 1) ADMIN → priorità:
    // 1) ufficiali (già gestiti sopra)
    // 2) pronsq scritto dall'admin (dbPron)
    // 3) fallback da GridRank (qualifiedTeams via pos1/pos2)
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

      // ✅ fallback: usa qualifiedTeams (come GridRank) SOLO se non ho pronsq
      const q1fb = qualifiedTeams?.[pos1] || null; // { code, isPron }
      const q2fb = qualifiedTeams?.[pos2] || null;

      const q1CodeFb = q1fb?.code || "";
      const q2CodeFb = q2fb?.code || "";
      const q1IsPronFb = !!q1fb?.isPron;
      const q2IsPronFb = !!q2fb?.isPron;

      if (q1CodeFb || q2CodeFb) {
        return {
          code1: q1CodeFb,
          code2: q2CodeFb,
          isPron1: q1IsPronFb,
          isPron2: q2IsPronFb,
        };
      }

      // niente ufficiali, niente pronsq, niente qualifiedTeams → vuoto
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
    // ✅ se esiste una riga utente per questo match,
    // anche se è NULL, NON devo usare fallback admin
    // if (Object.prototype.hasOwnProperty.call(userPronByFg, fgKey)) {
    //   const userPronStr = String(userPronByFg[fgKey] || "").trim();

    //   if (userPronStr && userPronStr.includes("-")) {
    //     const [u1, u2] = userPronStr.split("-").map((s) => s.trim());
    //     return {
    //       code1: u1 || "",
    //       code2: u2 || "",
    //       isPron1: !!u1,
    //       isPron2: !!u2,
    //     };
    //   }

    //   // 👈 esiste ma vuoto → l'utente ha premuto ❌
    //   return { code1: "", code2: "", isPron1: false, isPron2: false };
    // }

    // ✅ fallback: se non ho pron utente, ma l'admin ha scritto pronsq nel DB,
    // per l'utente loggato non-admin lo mostro (round16 → finale, ecc.)
    if (dbPron && dbPron.includes("-")) {
      const [p1, p2] = dbPron.split("-").map((s) => s.trim());
      return {
        code1: p1 || "",
        code2: p2 || "",
        isPron1: !!p1,
        isPron2: !!p2,
      };
    }

    return { code1: "", code2: "", isPron1: false, isPron2: false };
  };

  // 🔹 offset orizzontale semifinale rispetto al centro (speculare)
  const SEMI_OFFSET_DESKTOP = "10rem";
  const SEMI_OFFSET_MOBILE = "8rem";

  // ✅ salva (update->insert) una riga su wc_final_structure_userpron
  async function saveUserPronRow({
    userId,
    userEmail,
    phaseKey,
    matchIndex,
    user_pronsq,
  }) {
    if (!userId || !userEmail) throw new Error("Missing userId/userEmail");
    if (!phaseKey || !Number.isFinite(matchIndex))
      throw new Error("Missing phaseKey/matchIndex");

    const payload = {
      user_id: userId,
      user_email: userEmail,
      phase_key: phaseKey,
      match_index: matchIndex,
      user_pronsq: user_pronsq,
    };

    // ✅ UPSERT su chiave composta (serve UNIQUE su user_email+phase_key+match_index)
    const { data, error } = await supabase
      .from("wc_final_structure_userpron")
      .upsert(payload, { onConflict: "user_email,phase_key,match_index" })
      .select();

    if (error) throw error;

    return { mode: "upsert", payload, data };
  }

  // ✅ STEP: click su una squadra -> scrive nel TURNO SUCCESSIVO usando goto -> fgDest
  const handlePickTeam = async (match, phase, pickedCode, which) => {
    // solo utenti loggati
    console.log("CLICK", {
      fg: match?.fg,
      phase,
      goto: match?.goto,
      which,
      isLogged,
      user: currentUser?.email,
    });

    if (!isLogged) return;
    console.log("🟣 handlePickTeam START", {
      phase,
      fromFg: match?.fg,
      pickedCode,
      goto: match?.goto,
      pos1: match?.pos1,
      pos2: match?.pos2,
      isLogged,
      isAdmin,
      currentUser: currentUser?.email,
    });

    const code = String(pickedCode || "")
      .trim()
      .toUpperCase();
    if (code.length !== 3) return;

    // ✅ 0) SALVA SEMPRE IL MATCH CORRENTE SE È round32 (anche se goto manca)
    if (!isAdmin && phase === "round32") {
      const userEmail = String(currentUser?.email || "").trim();
      const userId = String(currentUser?.id || "").trim();
      const fgFrom = String(match?.fg || "").trim();
      const fromMeta = getMetaByFg(fgFrom);

      if (userEmail && userId && fgFrom && fromMeta) {
        const sideFrom = which === "second" ? "R" : "L";

        const mergeSide = (prevStr, side, teamCode) => {
          const [oldL, oldR] = String(prevStr || "")
            .trim()
            .split("-")
            .map((s) => (s || "").trim());
          const nextL = side === "L" ? teamCode : oldL;
          const nextR = side === "R" ? teamCode : oldR;
          return `${nextL || ""}-${nextR || ""}`;
        };

        const prevFrom = String(userPronByFg?.[fgFrom] || "").trim();
        const nextFrom = mergeSide(prevFrom, sideFrom, code);

        // UI
        setUserPronByFg((prev) => ({ ...(prev || {}), [fgFrom]: nextFrom }));

        // DB (update->insert)
        await saveUserPronRow({
          userId,
          userEmail,
          phaseKey: fromMeta.phaseKey,
          matchIndex: fromMeta.matchIndex,
          user_pronsq: nextFrom,
        });

        console.log("✅ SAVED round32 SOURCE", { fgFrom, nextFrom });
      } else {
        console.warn("⚠️ round32 SOURCE skip", {
          userEmail,
          userId,
          fgFrom,
          fromMeta,
        });
      }
    }

    const goto = String(match?.goto || "").trim(); // es "74"
    if (!goto) {
      console.warn("❌ handlePickTeam: goto MANCANTE", {
        fromFg: match?.fg,
        phase,
        match,
      });
      return;
    }

    // 1) trovo il match di destinazione: quello che ha pos1 o pos2 uguale a goto
    const dest = allMatches.find((m) => {
      const p1 = String(m?.pos1 ?? "").trim();
      const p2 = String(m?.pos2 ?? "").trim();
      return p1 === goto || p2 === goto;
    });

    if (!dest) {
      console.warn("❌ handlePickTeam: DEST NON TROVATO", {
        fromFg: match?.fg,
        phase,
        goto,
        allMatchesSample: allMatches
          .slice(0, 10)
          .map((x) => ({ fg: x?.fg, pos1: x?.pos1, pos2: x?.pos2 })),
      });
    } else {
      console.log("✅ handlePickTeam: DEST TROVATO", {
        fromFg: match?.fg,
        phase,
        goto,
        destFg: dest?.fg,
        destPos1: dest?.pos1,
        destPos2: dest?.pos2,
      });
    }

    console.log("🟣 handlePickTeam goto->dest", {
      fromFg: match?.fg,
      goto,
      destFound: !!dest,
      destFg: dest?.fg,
      destPos1: dest?.pos1,
      destPos2: dest?.pos2,
      destPhaseKey_guess: getMetaByFg(String(dest?.fg || "").trim())?.phaseKey,
      destMatchIndex_guess: getMetaByFg(String(dest?.fg || "").trim())
        ?.matchIndex,
    });

    const destFg = String(dest?.fg || "").trim();
    if (!destFg) {
      console.warn("❌ pickTeam: destFg non trovato dal goto", {
        fromFg: match?.fg,
        goto,
      });
      return;
    }

    // 2) capisco se scrivo il lato sinistro o destro (pos1 vs pos2)
    const destPos1 = String(dest?.pos1 ?? "").trim();
    const destPos2 = String(dest?.pos2 ?? "").trim();
    const side = destPos1 === goto ? "L" : destPos2 === goto ? "R" : null;

    if (!side) {
      console.warn("❌ pickTeam: lato non determinato", {
        destFg,
        goto,
        destPos1,
        destPos2,
      });
      return;
    }

    // 3) meta per il salvataggio (phase_key + match_index del match destinazione)
    const meta = getMetaByFg(destFg);
    if (!meta) {
      console.warn("❌ pickTeam: meta non trovata per fg", destFg);
      return;
    }

    // helper: merge "AAA-BBB" mantenendo l’altro lato
    // helper: merge "AAA-BBB" mantenendo l’altro lato
    // ✅ deve SEMPRE restituire formato con trattino (anche parziale): "ALB-" oppure "-ALB"
    const buildNextStr = (prevStr) => {
      const oldStr = String(prevStr || "").trim();
      const parts = oldStr.split("-");
      const oldL = String(parts?.[0] ?? "").trim();
      const oldR = String(parts?.[1] ?? "").trim();

      const nextL = side === "L" ? code : oldL;
      const nextR = side === "R" ? code : oldR;

      // ✅ sempre con trattino
      return `${nextL || ""}-${nextR || ""}`;
    };

    // =========================
    // ✅ ADMIN: salva su wc_final_structure.pronsq
    // =========================
    if (isAdmin) {
      const meta = getMetaByFg(destFg);
      if (!meta) return;

      // 🔥 calcolo PRIMA dal current state

      const phaseNow = finalData?.[meta.phaseKey];
      const flatNow = flattenPhase(phaseNow);

      const mNow = flatNow?.[meta.matchIndex];

      const prevStr = mNow?.pronsq || "";
      const nextPronsq = buildNextStr(prevStr);

      // UI optimistic
      setFinalData((prev) => {
        const next = structuredClone(prev);
        const phaseObj = next?.[meta.phaseKey];
        if (!phaseObj) return prev;

        const flat = flattenPhase(phaseObj);

        const m = flat?.[meta.matchIndex];
        if (!m) return prev;

        m.pronsq = nextPronsq; // ✅ scrivo SOLO pronsq
        // ❌ NON tocco team1/team2
        return next;
      });

      // DB + log di conferma
      const { data, error } = await supabase
        .from("wc_final_structure")
        .update({ pronsq: nextPronsq })
        .eq("phase_key", meta.phaseKey)
        .eq("match_index", meta.matchIndex)
        .select("phase_key, match_index, fg, pronsq");

      if (error) {
        console.error("❌ ADMIN pronsq update error:", {
          error,
          meta,
          nextPronsq,
        });
      } else {
        console.log("✅ ADMIN pronsq update OK:", data);

        // ✅ allineo UI alla verità del DB
        await loadFinalsFromDb();
      }

      return;
    }

    // =========================
    // ✅ USER (non admin): salva su wc_final_structure_userpron.user_pronsq
    // =========================
    {
      const userEmail = String(currentUser?.email || "").trim();
      const userId = String(currentUser?.id || "").trim();
      if (!userEmail || !userId) {
        console.warn("❌ USER pickTeam: manca userEmail/userId");
        return;
      }

      // helper: merge "AAA-BBB" mantenendo l’altro lato (sempre con "-")
      const mergeSide = (prevStr, sideToWrite, teamCode) => {
        const oldStr = String(prevStr || "").trim();
        const [oldL, oldR] = oldStr
          .split("-")
          .map((s) => String(s || "").trim());

        const nextL = sideToWrite === "L" ? teamCode : oldL;
        const nextR = sideToWrite === "R" ? teamCode : oldR;

        return `${nextL || ""}-${nextR || ""}`;
      };

      // -------------------------
      // 1) SOURCE save (round32)
      // ✅ già gestito sopra (blocco "SALVA SEMPRE IL MATCH CORRENTE SE È round32")
      // quindi qui NON devo risalvare per evitare doppioni
      // -------------------------
      if (phase === "round32") {
        const fgFrom = String(match?.fg || "").trim();
        const fromMeta = getMetaByFg(fgFrom); // dovrebbe tornare { phaseKey:"round32", matchIndex:... }

        if (
          fromMeta?.phaseKey &&
          Number.isFinite(fromMeta.matchIndex) &&
          fgFrom
        ) {
          const sideFrom = which === "second" ? "R" : "L"; // first -> L, second -> R
          const prevFrom = String(userPronByFg?.[fgFrom] || "").trim();
          const nextFrom = mergeSide(prevFrom, sideFrom, code);

          // UI immediata
          setUserPronByFg((prev) => ({ ...(prev || {}), [fgFrom]: nextFrom }));

          // DB
          try {
            const res = await saveUserPronRow({
              userId,
              userEmail,
              phaseKey: fromMeta.phaseKey, // "round32"
              matchIndex: fromMeta.matchIndex,
              user_pronsq: nextFrom,
            });
            console.log("✅ USER SOURCE saved (round32)", {
              fgFrom,
              ...fromMeta,
              nextFrom,
              res,
            });
          } catch (e) {
            console.error("❌ USER SOURCE save error (round32)", e);
          }
        } else {
          console.warn("⚠️ USER SOURCE skipped: meta non trovata", {
            fgFrom,
            fromMeta,
          });
        }
      }

      // -------------------------
      // 2) DEST save (round16/quarter/semi/final) - SEMPRE
      // -------------------------
      const prevDest = String(userPronByFg?.[destFg] || "").trim();
      const nextDest = mergeSide(prevDest, side, code);

      // UI immediata
      setUserPronByFg((prev) => ({ ...(prev || {}), [destFg]: nextDest }));

      // // (opzionale) UI extra sul tabellone
      // setFinalData((prev) => {
      //   const next = structuredClone(prev);
      //   const destMeta = getMetaByFg(destFg);
      //   if (!destMeta) return prev;

      //   const phaseObj = next?.[destMeta.phaseKey];
      //   if (!phaseObj) return prev;

      //   const flat = Object.values(phaseObj).flatMap((g) => g.matches);
      //   const m = flat?.[destMeta.matchIndex];
      //   if (!m) return prev;

      //   m.pronsq = nextDest;
      //   return next;
      // });

      // DB
      try {
        const res = await saveUserPronRow({
          userId,
          userEmail,
          phaseKey: meta.phaseKey,
          matchIndex: meta.matchIndex,
          user_pronsq: nextDest,
        });
        console.log("✅ USER DEST saved", { destFg, meta, nextDest, res });

        // ✅ riallinea sempre dallo stato DB (evita mismatch al ritorno in pagina)
        await reloadUserPronFromDb();
      } catch (e) {
        console.error("❌ USER DEST save error", e);
      }

      return; // ✅ chiude il ramo USER qui
    } // ✅ chiude il blocco USER
  }; // ✅ chiude handlePickTeam

  // =========================================================
  // ✅ NON-ADMIN: helper per grigio basato su GOTO (turno dopo)
  // - round32: MAI grigio (sempre a colori)
  // - da round16 in poi: grigio solo quando la slot destinazione è valorizzata
  // =========================================================
  const getPronStrForMatch_nonAdmin = (m) => {
    const fg = String(m?.fg || "").trim();
    if (!fg) return "";

    // per non-admin loggato: la verità è userPronByFg (anche "" per ❌)
    if (isLogged && !isAdmin) {
      if (Object.prototype.hasOwnProperty.call(userPronByFg, fg)) {
        return String(userPronByFg?.[fg] ?? "").trim();
      }
    }

    // fallback (non dovrebbe servire per non-admin, ma safe)
    return String(m?.pronsq || "").trim();
  };

  const didTeamAdvanceByGoto_nonAdmin = (match, phase, teamCode) => {
    // round32 sempre colorato
    if (phase === "round32") return true;

    const code = String(teamCode || "").trim();
    const goto = String(match?.goto || "").trim();
    if (!code || !goto) return true;

    // match destinazione = quello che ha pos1 o pos2 uguale a goto
    const dest = allMatches.find((m) => {
      const p1 = String(m?.pos1 ?? "").trim();
      const p2 = String(m?.pos2 ?? "").trim();
      return p1 === goto || p2 === goto;
    });
    if (!dest) return true;

    // capisco se scrivo L o R nella destinazione
    const destPos1 = String(dest?.pos1 ?? "").trim();
    const side = destPos1 === goto ? "L" : "R";

    // leggo cosa c’è nella destinazione (per non-admin: userPronByFg)
    const destPron = getPronStrForMatch_nonAdmin(dest); // es "ITA-BRA", "ITA-", ""
    if (!destPron || !destPron.includes("-")) return true; // slot vuota => entrambi a colori

    const [L, R] = destPron.split("-").map((s) => (s || "").trim());
    const slotValue = side === "L" ? L : R;

    // se la slot è vuota => non deciso => entrambi a colori
    if (!slotValue) return true;

    // se slotValue == team => passa (colorata), altrimenti grigia
    return slotValue === code;
  };

  // =========================================================
  // ✅ ADMIN: grigio basato su GOTO (turno dopo)
  // - round32: MAI grigio (sempre a colori)
  // - da round16 in poi: grigio solo quando la slot destinazione è valorizzata
  // - la slot può essere valorizzata da:
  //   1) team ufficiale (team1/team2) nel match destinazione
  //   2) pronsq admin nel match destinazione ("AAA-BBB")
  // =========================================================
  const getPronStrForMatch_admin = (m) => {
    const fg = String(m?.fg || "").trim();
    if (!fg) return "";
    return String(m?.pronsq || "").trim();
  };

  const didTeamAdvanceByGoto_admin = (match, phase, teamCode) => {
    // round32 sempre colorato
    if (phase === "round32") return true;

    const code = String(teamCode || "").trim();
    const goto = String(match?.goto || "").trim();
    if (!code || !goto) return true;

    // match destinazione = quello che ha pos1 o pos2 uguale a goto
    const dest = allMatches.find((m) => {
      const p1 = String(m?.pos1 ?? "").trim();
      const p2 = String(m?.pos2 ?? "").trim();
      return p1 === goto || p2 === goto;
    });
    if (!dest) return true;

    // capisco se scrivo L o R nella destinazione
    const destPos1 = String(dest?.pos1 ?? "").trim();
    const side = destPos1 === goto ? "L" : "R";

    // ✅ 1) se nella destinazione c'è ufficiale su quel lato -> decide quello
    const absL = String(dest?.team1 || "").trim();
    const absR = String(dest?.team2 || "").trim();
    const officialSlot = side === "L" ? absL : absR;
    if (officialSlot) return officialSlot === code;

    // ✅ 2) altrimenti pronsq admin "AAA-BBB"
    const destPron = getPronStrForMatch_admin(dest);
    if (!destPron || !destPron.includes("-")) return true; // slot vuota => entrambi a colori

    const [L, R] = destPron.split("-").map((s) => (s || "").trim());
    const slotValue = side === "L" ? L : R;

    // se la slot è vuota => non deciso => entrambi a colori
    if (!slotValue) return true;

    // se slotValue == team => passa (colorata), altrimenti grigia
    return slotValue === code;
  };

  const renderMatchBlock = (match, rettColor, phase) => {
    if (!match) return null;

    const {
      code1: displayCode1,
      code2: displayCode2,
      isPron1,
      isPron2,
    } = getDisplayTeamsFromMatch(match, phase);
    // console.log("isLogged:", isLogged, "showPron:", showPron);

    const canResetAdmin =
      isAdmin && ["round16", "quarter", "semifinals", "final"].includes(phase);

    const canResetUser = isLogged && !isAdmin && phase !== "round32"; // ❌ no croce in round32

    const canReset = canResetAdmin || canResetUser;

    const forceNoGreyRound32 = isLogged && !isAdmin && phase === "round32";

    return (
      <BlokQuadRett
        rettColor={rettColor}
        firstSquareLabel={match.pos1 || ""}
        secondSquareLabel={match.pos2 || ""}
        firstTeamName={displayCode1}
        secondTeamName={displayCode2}
        onPickTeam={(teamCode, which) =>
          handlePickTeam(match, phase, teamCode, which)
        }
        firstIsPron={isPron1}
        secondIsPron={isPron2}
        firstTeamFlag={displayCode1 ? getFlag(displayCode1) : null}
        secondTeamFlag={displayCode2 ? getFlag(displayCode2) : null}
        firstAdvanced={
          displayCode1
            ? isAdmin
              ? didTeamAdvanceByGoto_admin(match, phase, displayCode1)
              : isLogged && !isAdmin
                ? didTeamAdvanceByGoto_nonAdmin(match, phase, displayCode1)
                : didTeamAdvance(displayCode1, phase, isPron1)
            : false
        }
        secondAdvanced={
          displayCode2
            ? isAdmin
              ? didTeamAdvanceByGoto_admin(match, phase, displayCode2)
              : isLogged && !isAdmin
                ? didTeamAdvanceByGoto_nonAdmin(match, phase, displayCode2)
                : didTeamAdvance(displayCode2, phase, isPron2)
            : false
        }
        phase={phase}
        rettLeftLabel={match.date || ""}
        rettRightLabel={match.city || ""}
        rettTimeLabel={match.time || ""}
        results={match.results || null}
        showReset={canReset}
        onReset={
          canReset
            ? async () => {
                if (isAdmin) {
                  resetFinalMatchUi(match.fg);
                  await resetFinalMatchDb(match.fg);
                  await loadFinalsFromDb();
                } else {
                  resetUserMatchUi(match.fg);
                  await resetUserMatchDb(match.fg);
                  await reloadUserPronFromDb(); // ✅ riallinea stato con DB
                }
              }
            : null
        }
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
                max-w-none md:scale-110 scale-150 pointer-events-none z-0 "
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
              "semifinals",
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
                  onPickTeam={(teamCode) =>
                    handlePickTeam(mAB1, "semifinals", teamCode)
                  }
                  topSquareLabel={mAB1?.pos1 || ""}
                  bottomSquareLabel={mAB1?.pos2 || ""}
                  topTeamName={code1}
                  bottomTeamName={code2}
                  topTeamFlag={code1 ? getFlag(code1) : null}
                  bottomTeamFlag={code2 ? getFlag(code2) : null}
                  topIsPron={isPron1}
                  bottomIsPron={isPron2}
                  topAdvanced={
                    code1
                      ? isAdmin
                        ? didTeamAdvanceByGoto_admin(mAB1, "semifinals", code1)
                        : isLogged && !isAdmin
                          ? didTeamAdvanceByGoto_nonAdmin(
                              mAB1,
                              "semifinals",
                              code1,
                            )
                          : didTeamAdvance(code1, "semifinals", isPron1)
                      : false
                  }
                  bottomAdvanced={
                    code2
                      ? isAdmin
                        ? didTeamAdvanceByGoto_admin(mAB1, "semifinals", code2)
                        : isLogged && !isAdmin
                          ? didTeamAdvanceByGoto_nonAdmin(
                              mAB1,
                              "semifinals",
                              code2,
                            )
                          : didTeamAdvance(code2, "semifinals", isPron2)
                      : false
                  }
                  phase="semi"
                  rettTopLabel={mAB1?.date || ""}
                  rettBottomLabel={mAB1?.city || ""}
                  rettTimeLabel={mAB1?.time || ""}
                  results={mAB1?.results || null}
                  showReset={isAdmin || (isLogged && !isAdmin)}
                  onReset={async () => {
                    if (isAdmin) {
                      resetFinalMatchUi(mAB1?.fg);
                      await resetFinalMatchDb(mAB1?.fg);
                      await loadFinalsFromDb();
                    } else {
                      resetUserMatchUi(mAB1?.fg);
                      await resetUserMatchDb(mAB1?.fg);
                      await reloadUserPronFromDb(); // ✅ riallinea stato con DB
                    }
                  }}
                />
              </div>
            );
          })()}

          {/* ✅ SEMIFINALE B → CD1 (verticale) */}
          {(() => {
            const { code1, code2, isPron1, isPron2 } = getDisplayTeamsFromMatch(
              mCD1,
              "semifinals",
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
                  onPickTeam={(teamCode) =>
                    handlePickTeam(mCD1, "semifinals", teamCode)
                  }
                  bottomSquareLabel={mCD1?.pos2 || ""}
                  topTeamName={code1}
                  bottomTeamName={code2}
                  topTeamFlag={code1 ? getFlag(code1) : null}
                  bottomTeamFlag={code2 ? getFlag(code2) : null}
                  topIsPron={isPron1}
                  bottomIsPron={isPron2}
                  topAdvanced={
                    code1
                      ? isAdmin
                        ? didTeamAdvanceByGoto_admin(mAB1, "semifinals", code1)
                        : isLogged && !isAdmin
                          ? didTeamAdvanceByGoto_nonAdmin(
                              mCD1,
                              "semifinals",
                              code1,
                            )
                          : didTeamAdvance(code1, "semifinals", isPron1)
                      : false
                  }
                  bottomAdvanced={
                    code2
                      ? isAdmin
                        ? didTeamAdvanceByGoto_admin(mAB1, "semifinals", code2)
                        : isLogged && !isAdmin
                          ? didTeamAdvanceByGoto_nonAdmin(
                              mCD1,
                              "semifinals",
                              code2,
                            )
                          : didTeamAdvance(code2, "semifinals", isPron2)
                      : false
                  }
                  phase="semi"
                  rettTopLabel={mCD1?.date || ""}
                  rettBottomLabel={mCD1?.city || ""}
                  rettTimeLabel={mCD1?.time || ""}
                  results={mCD1?.results || null}
                  showReset={isAdmin || (isLogged && !isAdmin)}
                  onReset={async () => {
                    if (isAdmin) {
                      resetFinalMatchUi(mCD1?.fg);
                      await resetFinalMatchDb(mCD1?.fg);
                      await loadFinalsFromDb();
                    } else {
                      resetUserMatchUi(mCD1?.fg);
                      await resetUserMatchDb(mCD1?.fg);
                      await reloadUserPronFromDb(); // ✅ riallinea stato con DB
                    }
                  }}
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
