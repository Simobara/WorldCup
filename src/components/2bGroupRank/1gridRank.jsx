import { useEffect, useState } from "react";
import { useQualifiedTeams } from "../../Ap/Global/global";
import { supabase } from "../../Services/supabase/supabaseClient";
import { ADMIN_EMAIL, flagsMond } from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import {
  CssGroup,
  CssGroupLetter,
  CssHeader7,
  CssRow7,
} from "../../START/styles/0CssGsTs";
import Quadrato from "../3tableComp/1quad";

// pronData = pronRows[0].data
// pronData = pronRows[0].data
// 🔹 Estrae risultato e pronostico da mws_matches_structure_userpron.data (campo "pronostici")
//    in base al match_index (0..5)
function getPronFromMatchesPron(pronostici, matchIndex) {
  if (!pronostici) return { ris: null, pron: null };

  const idxStr = String(matchIndex);
  const plusRis = pronostici.plusRis;
  const plusPronRoot = pronostici.plusPron;

  let a = null;
  let b = null;
  let pron = null;

  // ---- 1) plusRis: può essere array o oggetto ----
  let r = null;

  if (Array.isArray(plusRis)) {
    r = plusRis[matchIndex] ?? null;
  } else if (plusRis && typeof plusRis === "object") {
    r = plusRis[idxStr] ?? null;
  }

  if (r) {
    const aRaw = String(r.a ?? "").trim();
    const bRaw = String(r.b ?? "").trim();

    if (aRaw !== "" && bRaw !== "") {
      a = aRaw;
      b = bRaw;
    }

    // alcuni casi hanno plusPron dentro l'oggetto
    if (r.plusPron) {
      pron = String(r.plusPron).trim().toUpperCase();
    }
  }

  // ---- 2) se non ho ancora pron, guardo plusPron a livello root ----
  if (!pron && plusPronRoot) {
    if (Array.isArray(plusPronRoot)) {
      const p = String(plusPronRoot[matchIndex] ?? "")
        .trim()
        .toUpperCase();
      pron = p || null;
    } else if (typeof plusPronRoot === "object") {
      const p = String(plusPronRoot[idxStr] ?? "")
        .trim()
        .toUpperCase();
      pron = p || null;
    }
  }

  // costruisco "ris" (es. "2-1") solo se ho entrambi i gol
  let ris = null;
  if (a !== null && b !== null && a !== "" && b !== "") {
    ris = `${a}-${b}`;
  }

  return { ris, pron };
}

function v(val, showZero) {
  if (val > 0) return val;
  return showZero ? 0 : "";
}

function show(val, { zeroAllowed }) {
  if (val > 0) return val;
  if (val === 0 && zeroAllowed) return 0;
  return "";
}

function parseResult(match, { allowRis = true } = {}) {
  if (!match) return null;

  const pick = (s) => {
    const raw = String(s ?? "").trim();
    if (!raw) return null;

    // normalizza separatori: trattini strani e i ":" diventano "-"
    const normalized = raw
      .replace(/[–—−]/g, "-") // en-dash, em-dash, minus ecc.
      .replace(/:/g, "-")
      .replace(/\s+/g, ""); // togli tutti gli spazi: "2 - 1" → "2-1"

    if (!normalized.includes("-")) return null;

    const [aStr, bStr] = normalized.split("-");
    const a = Number(aStr);
    const b = Number(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;

    return [a, b];
  };

  // ufficiale
  const off = pick(match.results);
  if (off) return { score: off, source: "results" };

  // simulato/pronostico (ris) SOLO se consentito
  if (!allowRis) return null;

  const sim = pick(match.ris);
  if (sim) return { score: sim, source: "ris" };

  return null;
}

function norm(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function buildNameResolver(allTeams) {
  const map = new Map();

  for (const t of allTeams ?? []) {
    map.set(norm(t.name), t.name);
    map.set(norm(t.id), t.name);
    map.set(norm(t.name.replaceAll(".", "")), t.name);
  }

  map.set(norm("SAfrica"), "Sudafrica");
  map.set(norm("StatiUniti"), "StatiUniti");

  return (rawName) => map.get(norm(rawName)) ?? String(rawName).trim();
}

function computePronTableForGroup(
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  allowRis = true,
) {
  const table = {};

  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0 };
  }

  if (!matchesData) return table;

  const giornate = Object.values(matchesData);
  let seen = 0;

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      if (Number.isFinite(maxMatches) && seen >= maxMatches) return table;
      seen++;

      const pron = String(m.pron ?? "")
        .trim()
        .toUpperCase();
      if (!pron) continue;

      // se c'è un risultato "valido" (in base al toggle), NON contare il pron
      const hasRes = !!parseResult(m, { allowRis });
      if (hasRes) continue;

      const t1 = resolveName(m.team1);
      const t2 = resolveName(m.team2);

      if (!groupTeamNames.has(t1) || !groupTeamNames.has(t2)) continue;

      if (pron === "1") {
        table[t1].pt += 3;
        table[t1].w += 1;
        table[t2].p += 1;
      } else if (pron === "2") {
        table[t2].pt += 3;
        table[t2].w += 1;
        table[t1].p += 1;
      } else if (pron === "X") {
        table[t1].pt += 1;
        table[t2].pt += 1;
        table[t1].x += 1;
        table[t2].x += 1;
      }
    }
  }

  return table;
}

// 🔹 NUOVA: tabella per i "bonus" (seed_ris / seed_pron) per utente loggato
// 🔹 Tabella "bonus" (seed_ris / seed_pron) per utente loggato
// 🔹 Tabella "bonus" (punti pronosticati) per utente loggato
// 🔹 NUOVA: tabella "bonus" (punti pronosticati) per utente loggato
function computeBonusTableForGroup(
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  useSeeds = false,
) {
  const table = {};

  // inizializzo tutti a 0
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0 };
  }

  if (!matchesData) return table;

  const giornate = Object.values(matchesData);
  let seen = 0;

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      if (Number.isFinite(maxMatches) && seen >= maxMatches) return table;
      seen++;

      const t1 = resolveName(m.team1);
      const t2 = resolveName(m.team2);

      // se per qualche motivo i nomi non matchano la lista del gruppo, loggo
      if (!groupTeamNames.has(t1) || !groupTeamNames.has(t2)) {
        // console.log("⚠️ BONUS: team fuori gruppo o nome diverso", {
        //   m_team1: m.team1,
        //   m_team2: m.team2,
        //   t1,
        //   t2,
        //   groupTeamNames: Array.from(groupTeamNames),
        // });
        continue;
      }

      // ❌ se c'è già un risultato ufficiale, NON contiamo il pronostico
      // ❌ se c'è già un risultato ufficiale, NON contiamo il pronostico
      // ❌ se c'è già un risultato ufficiale, NON contiamo il pronostico
      const hasOfficial = !!String(m.results ?? "").trim();
      if (hasOfficial) {
        // console.log("ℹ️ BONUS: salto match (ha risultato ufficiale)", {
        //   team1: t1,
        //   team2: t2,
        //   results: m.results,
        // });
        continue;
      }

      let outcome = null; // "1" | "2" | "X"

      // Sorgenti pronostico:
      // - utente normale → m.ris / m.pron (user_ris / user_pron)
      // - admin         → SEMPRE seed_ris / seed_pron da wc_matches_structure
      const risSource = useSeeds ? m.seed_ris : m.ris;
      const pronSource = useSeeds ? m.seed_pron : m.pron;

      // 1️⃣ se ho un risultato con gol (ris), da lì ricavo il segno
      const risStr = String(risSource ?? "").trim();
      if (risStr && risStr.includes("-")) {
        const [gaRaw, gbRaw] = risStr
          .split("-")
          .map((x) => Number(String(x).trim()));

        if (!Number.isNaN(gaRaw) && !Number.isNaN(gbRaw)) {
          if (gaRaw > gbRaw) outcome = "1";
          else if (gaRaw < gbRaw) outcome = "2";
          else outcome = "X";
        }
      }

      // 2️⃣ se non ho ancora outcome, uso il segno 1/X/2
      if (!outcome) {
        const sign = String(pronSource ?? "")
          .trim()
          .toUpperCase();
        if (sign === "1" || sign === "2" || sign === "X") {
          outcome = sign;
        }
      }

      if (!outcome) {
        // console.log("⚠️ BONUS: nessun pronostico utile per questo match", {
        //   team1: t1,
        //   team2: t2,
        //   ris: m.ris,
        //   pron: m.pron,
        // });
        continue;
      }

      // 3️⃣ applico il 3-1-0 SOLO sulla tabella bonus
      // console.log("🟣 BONUS MATCH:", {
      //   team1: t1,
      //   team2: t2,
      //   ris: m.ris,
      //   pron: m.pron,
      //   outcome,
      // });

      if (outcome === "1") {
        table[t1].pt += 3;
        table[t1].w += 1;
        table[t2].p += 1;
      } else if (outcome === "2") {
        table[t2].pt += 3;
        table[t2].w += 1;
        table[t1].p += 1;
      } else {
        // pareggio → 1 punto a testa
        table[t1].pt += 1;
        table[t2].pt += 1;
        table[t1].x += 1;
        table[t2].x += 1;
      }

      // console.log("   ➜ stato bonus dopo match:", {
      //   [t1]: table[t1],
      //   [t2]: table[t2],
      // });
    }
  }

  // console.log("✅ BONUS finale per gruppo:", table);
  return table;
}

function computeTableForGroup(
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  allowRis = true,
) {
  const table = {};

  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0, gf: 0, gs: 0 };
  }

  if (!matchesData) return table;

  const giornate = Object.values(matchesData);
  let seen = 0;

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      if (Number.isFinite(maxMatches) && seen >= maxMatches) return table;
      seen++;

      const parsed = parseResult(m, { allowRis });
      if (!parsed) continue;

      const [g1, g2] = parsed.score;
      const t1 = resolveName(m.team1);
      const t2 = resolveName(m.team2);

      if (!groupTeamNames.has(t1) || !groupTeamNames.has(t2)) continue;

      table[t1].gf += g1;
      table[t1].gs += g2;
      table[t2].gf += g2;
      table[t2].gs += g1;

      if (g1 > g2) {
        table[t1].w += 1;
        table[t1].pt += 3;
        table[t2].p += 1;
      } else if (g1 < g2) {
        table[t2].w += 1;
        table[t2].pt += 3;
        table[t1].p += 1;
      } else {
        table[t1].x += 1;
        table[t2].x += 1;
        table[t1].pt += 1;
        table[t2].pt += 1;
      }
    }
  }

  return table;
}

function sortTeamsByTable(teams, tableByTeam, resolveName, groupHasResults) {
  if (!groupHasResults) return teams;

  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const A = tableByTeam[ak] ?? { pt: 0, gf: 0, gs: 0 };
    const B = tableByTeam[bk] ?? { pt: 0, gf: 0, gs: 0 };

    if (B.pt !== A.pt) return B.pt - A.pt;
    if (B.gf !== A.gf) return B.gf - A.gf;
    if (A.gs !== B.gs) return A.gs - B.gs;

    return ak.localeCompare(bk);
  });
}

function sortTeamsByPron(teams, pronTableByTeam, resolveName) {
  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const A = pronTableByTeam?.[ak] ?? { pt: 0, w: 0, x: 0, p: 0 };
    const B = pronTableByTeam?.[bk] ?? { pt: 0, w: 0, x: 0, p: 0 };

    if (B.pt !== A.pt) return B.pt - A.pt;
    if (B.w !== A.w) return B.w - A.w;
    if (B.x !== A.x) return B.x - A.x;

    return ak.localeCompare(bk);
  });
}

function sortTeamsByTotal(
  teams,
  tableByTeam, // punti ufficiali
  pronTableByTeam, // punti da pronostici/bonus
  resolveName,
) {
  if (!pronTableByTeam && !tableByTeam) return teams;

  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const Aoff = tableByTeam?.[ak] ?? { pt: 0, gf: 0, gs: 0 };
    const Boff = tableByTeam?.[bk] ?? { pt: 0, gf: 0, gs: 0 };

    const Apron = pronTableByTeam?.[ak] ?? { pt: 0 };
    const Bpron = pronTableByTeam?.[bk] ?? { pt: 0 };

    const Atot = (Aoff.pt ?? 0) + (Apron.pt ?? 0); // 👈 SOMMA
    const Btot = (Boff.pt ?? 0) + (Bpron.pt ?? 0); // 👈 SOMMA

    // 1) ordino per punti totali (ufficiali + pronostici)
    if (Btot !== Atot) return Btot - Atot;

    // 2) a parità, guardo i punti ufficiali
    if (Boff.pt !== Aoff.pt) return Boff.pt - Aoff.pt;

    // 3) differenza reti ufficiale
    const Agd = (Aoff.gf ?? 0) - (Aoff.gs ?? 0);
    const Bgd = (Boff.gf ?? 0) - (Boff.gs ?? 0);
    if (Bgd !== Agd) return Bgd - Agd;

    // 4) più gol fatti
    if ((Boff.gf ?? 0) !== (Aoff.gf ?? 0)) {
      return (Boff.gf ?? 0) - (Aoff.gf ?? 0);
    }

    // 5) a parità di tutto, più punti pronostico
    if ((Bpron.pt ?? 0) !== (Apron.pt ?? 0)) {
      return (Bpron.pt ?? 0) - (Apron.pt ?? 0);
    }

    // 6) fallback alfabetico
    return ak.localeCompare(bk);
  });
}

// ---------------------------------------------------------------------------------
export default function GridRankPage({
  onlyGroup,
  maxMatches = null,
  isLogged,
  userEmail, // 🔹 nuovo prop
  refreshKey = 0,
}) {
  const isTooltip = !!onlyGroup;
  const STORAGE_KEY = "gridRank_showPronostics";

  const [supabaseMatchesByGroup, setSupabaseMatchesByGroup] = useState({});
  const [showPronostics, setShowPronostics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const { setQualifiedTeams } = useQualifiedTeams();
  // ✅ COLONNE: desktop e mobile (come richiesto)
  //const headers = ["SQUADRA", "", "PUNTI", "GOL", "W", "X", "P"];
  const gridColsDesktop = "30px 60px 50px 60px 40px 40px 40px";
  const gridColsMobile = "1px 30px 30px 25px 15px 15px 15px";

  const [gridCols, setGridCols] = useState(gridColsMobile);
  const groups = "ABCDEFGHIJKL".split("");

  // ✅ come “Matches”: card strette in mobile, grandi in desktop
  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[286px]";

  const GROUP_WIDTH_MOBILE = "w-[9.5rem]";
  const GROUP_HEIGHT_MOBILE = "h-[11.5rem]";

  const headerHDesktop = "16px";
  const rowHDesktop = 68;

  const headerHMobile = "1rem";
  const rowHMobile = 42;

  const [rowH, setRowH] = useState(rowHMobile);
  const [headerH, setHeaderH] = useState(headerHMobile);
  const [btnPos, setBtnPos] = useState({ top: "", left: "" });

  const useSupabase =
    isLogged &&
    !!userEmail &&
    Object.keys(supabaseMatchesByGroup || {}).length > 0;

  const isAdminUser =
    isLogged &&
    !!userEmail &&
    userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  //----------------------------------------------------------------------------
  // DEBUG: vedi cosa arriva davvero da Supabase

  useEffect(() => {
    const debugFetch = async () => {
      const { data, error } = await supabase
        .from("wc_matches_structure")
        .select("*")
        .limit(50);

      // if (error) {
      //   console.error("DEBUG wc_matches_structure ERROR", error);
      // } else {
      //   console.log("DEBUG wc_matches_structure DATA", data);
      // }
    };

    debugFetch();
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      let who = "";

      if (w >= 1500) {
        who = "100% branch (>=1500)";
        setBtnPos({ top: "-3rem", left: "67%" });
      } else if (w >= 1350) {
        who = "90% branch (>=1350)";
        setBtnPos({ top: "-3rem", left: "65%" }); //OKK
      } else if (w >= 1200) {
        who = "80% branch (>=1200)";
        setBtnPos({ top: "-3rem", left: "59%" });
      } else if (w >= 1100) {
        who = "75% branch (>=1100)";
        setBtnPos({ top: "-3rem", left: "55%" }); //OKK
      } else if (w >= 1000) {
        who = "67% branch (>=1000)";
        setBtnPos({ top: "-3rem", left: "50%" });
      } else if (w >= 800) {
        who = "50% branch (>=800)";
        setBtnPos({ top: "-3rem", left: "45%" }); //OKK
      } else {
        who = "mobile/small";
        setBtnPos({ top: "1rem", left: "30rem" });
      }

      // console.log("update btnPos: w =", w, "→", who);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // console.log("🔵 DEBUG LOGIN:", { isLogged, userEmail });
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  // 🔹 CARICAMENTO SOLO GRUPPO B DA SUPABASE QUANDO LOGGATO

  // console.log("🔵 DEBUG LOGIN:", { isLogged, userEmail });
  // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
  //    - struttura da wc_matches_structure
  //    - pronostici reali da ws_matches_structure_userpron (campo data) per userEmail, gruppo B

  useEffect(() => {
    if (!isLogged || !userEmail) {
      // console.log("EFFECT: non loggato o manca userEmail → non carico nulla");
      return;
    }

    // console.log(
    //   "EFFECT: loggato come",
    //   userEmail,
    //   "→ carico gruppi A-L con pronostici hardcoded"
    // );

    let cancelled = false;

    // 🔹 CARICAMENTO MATCH DA SUPABASE QUANDO LOGGATO
    //    - struttura da wc_matches_structure
    //    - pronostici reali da wc_matches_structure_userpron per userEmail

    async function loadMatches() {
      // 1️⃣ struttura di tutte le partite
      const { data: structRows, error: structErr } = await supabase
        .from("wc_matches_structure")
        .select("*");

      if (structErr) {
        console.error("Supabase wc_matches_structure error", structErr);
        return;
      }

      // 2️⃣ pronostici / risultati utente per tutte le partite
      const { data: pronRows, error: pronErr } = await supabase
        .from("wc_matches_structure_userpron")
        .select("group_letter, match_index, user_pron, user_ris")
        .eq("user_email", userEmail);

      if (pronErr) {
        console.error("Supabase wc_matches_structure_userpron error", pronErr);
        return;
      }

      // mappa per accesso rapido: "A-0", "A-1", ... → riga utente
      const pronMap = {};
      for (const pr of pronRows ?? []) {
        const key = `${pr.group_letter}-${pr.match_index}`;
        pronMap[key] = pr;
      }

      // 🔹 Costruisco supabaseMatchesByGroup = { group_A: {...}, group_B: {...}, ... }
      const byGroup = {};

      for (const row of structRows ?? []) {
        const letter = row.group_letter ?? row.group ?? null;
        if (!letter) continue;

        const groupKey = `group_${letter}`; // es. "group_A"

        if (!byGroup[groupKey]) {
          byGroup[groupKey] = {
            giornata_1: { matches: [] },
            giornata_2: { matches: [] },
            giornata_3: { matches: [] },
          };
        }

        const giornataIndex = row.match_index ?? 0;
        const giornataKey =
          giornataIndex <= 1
            ? "giornata_1"
            : giornataIndex <= 3
              ? "giornata_2"
              : "giornata_3";

        // 👉 riga utente corrispondente (stesso gruppo + stesso match_index)
        const userRow = pronMap[`${letter}-${row.match_index}`];

        // user_pron: "1", "X", "2" oppure stringa vuota
        const pron = (userRow?.user_pron || "").trim().toUpperCase() || null;

        // user_ris può essere:
        // - vecchio formato JSON: '{"a":"2","b":"1"}'
        // - nuovo formato stringa: "2-1"
        let ris = null;

        const rawUserRis = (userRow?.user_ris ?? "").toString().trim();
        if (rawUserRis) {
          if (rawUserRis.startsWith("{")) {
            // ✅ vecchio formato JSON
            try {
              const parsed = JSON.parse(rawUserRis);
              const aRaw = String(parsed?.a ?? "").trim();
              const bRaw = String(parsed?.b ?? "").trim();
              if (aRaw !== "" && bRaw !== "") {
                ris = `${aRaw}-${bRaw}`;
              }
            } catch (e) {
              console.warn("user_ris JSON non valido:", rawUserRis, e);
            }
          } else {
            // ✅ nuovo formato "2-1" (accetto anche "2 : 1", "2 - 1", ecc.)
            const normalized = rawUserRis
              .replace(/[–—−]/g, "-") // trattini strani → "-"
              .replace(/:/g, "-")
              .replace(/\s+/g, ""); // togli spazi

            if (normalized.includes("-")) {
              const [gaRaw, gbRaw] = normalized.split("-");
              const ga = gaRaw.trim();
              const gb = gbRaw.trim();

              if (ga !== "" && gb !== "") {
                ris = `${ga}-${gb}`;
              }
            }
          }
        }

        byGroup[groupKey][giornataKey].matches.push({
          team1: row.team1,
          team2: row.team2,
          results: row.results_official ?? null, // risultato ufficiale
          ris, // risultato utente (stringa "2-1" oppure null)
          pron, // segno 1/X/2 utente
          seed_ris: row.seed_ris ?? null,
          seed_pron: row.seed_pron ?? null,
        });
      }

      if (!cancelled) {
        setSupabaseMatchesByGroup(byGroup);
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [isLogged, userEmail, refreshKey]);

  // useEffect(() => {
  //   console.log(
  //     "STATE UPDATED supabaseMatchesByGroup keys:",
  //     Object.keys(supabaseMatchesByGroup || {})
  //   );
  // }, [supabaseMatchesByGroup]);

  useEffect(() => {
    if (isLogged) {
      // se loggato, disattiva sempre i pronostici
      setShowPronostics(false);
    }
  }, [isLogged]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const isDesktop = mq.matches;
      setGridCols(isDesktop ? gridColsDesktop : gridColsMobile);
      setRowH(isDesktop ? rowHDesktop : rowHMobile);
      setHeaderH(isDesktop ? headerHDesktop : headerHMobile);
    };

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(showPronostics));
    } catch {
      // se localStorage non disponibile, ignora
    }
  }, [showPronostics]);

  // ✅ SOLO GRUPPO B: quando tutte le 6 partite hanno un risultato (ufficiale o ris),
  // calcolo 1B/2B e li salvo nel context
  // ✅ TUTTI I GRUPPI: quando un gruppo è completo, salvo 1X/2X nel context
  useEffect(() => {
    const letters = "ABCDEFGHIJKL".split("");

     const isOfficial = (m) => isScore(m.results);

    // match "coperto" = ufficiale oppure pronostico (ris o segno 1/X/2)
    const isScore = (s) => {
      const raw = String(s ?? "").trim();
      if (!raw) return false;
      const normalized = raw
        .replace(/[–—−]/g, "-")
        .replace(/:/g, "-")
        .replace(/\s+/g, "");
      if (!normalized.includes("-")) return false;
      const [aStr, bStr] = normalized.split("-");
      const a = Number(aStr);
      const b = Number(bStr);
      return Number.isFinite(a) && Number.isFinite(b);
    };

    const isSign = (s) => {
      const v = String(s ?? "")
        .trim()
        .toUpperCase();
      return v === "1" || v === "X" || v === "2";
    };

    const isCovered = (m) =>
      isScore(m.results) || isScore(m.ris) || isSign(m.pron);

    const resolveName = buildNameResolver(flagsMond);

    const nextQualified = {};

    for (const letter of letters) {
      const groupKey = `group_${letter}`;

      const matchesData = useSupabase
        ? supabaseMatchesByGroup?.[groupKey]
        : groupMatches?.[groupKey];

      if (!matchesData) continue;

      const allMatches = Object.values(matchesData)
        .flatMap((g) => g?.matches ?? [])
        .filter(Boolean);

      if (allMatches.length < 6) continue;

      const groupComplete = allMatches.every(isCovered);
      if (!groupComplete) continue;

      const allOfficial = allMatches.every(isOfficial);
      const qualifyIsPron = !allOfficial; // ✅ se NON sono tutti ufficiali → bordo viola

      const teams = (flagsMond ?? []).filter((t) => t.group === letter);
      const groupTeamNames = new Set(teams.map((t) => resolveName(t.name)));

      const tableByTeam = computeTableForGroup(
        matchesData,
        resolveName,
        groupTeamNames,
        null,
        true, // include ris se presenti
      );

      const pronTableByTeam = computePronTableForGroup(
        matchesData,
        resolveName,
        groupTeamNames,
        null,
        true, // allowRis: se c'è ris/ufficiale non conta il pron
      );

      const sorted = allOfficial
        ? sortTeamsByTable(teams, tableByTeam, resolveName, true)
        : sortTeamsByTotal(teams, tableByTeam, pronTableByTeam, resolveName);

      const first = sorted?.[0]?.id || "";
      const second = sorted?.[1]?.id || "";
      if (!first || !second) continue;

      nextQualified[`1${letter}`] = { code: first, isPron: qualifyIsPron };
      nextQualified[`2${letter}`] = { code: second, isPron: qualifyIsPron };
    }

    // merge nel context (non cancello quello che c’era)
    if (Object.keys(nextQualified).length > 0) {
      setQualifiedTeams((prev) => ({ ...prev, ...nextQualified }));
    }
  }, [
    useSupabase,
    supabaseMatchesByGroup,
    isLogged,
    userEmail,
    refreshKey,
    setQualifiedTeams,
  ]);

  return (
    <div
      className={
        isTooltip
          ? "p-0 overflow-visible"
          : "min-h-screen pl-1 pr-12 md:px-4 md:pt-16 pt-1 overflow-x-auto"
      }
    >
      <div
        className={
          isTooltip
            ? "relative"
            : "relative flex justify-center items-start min-w-max"
        }
      >
        {!isTooltip && !isLogged && (
          <button
            onClick={() => setShowPronostics((v) => !v)}
            aria-pressed={showPronostics}
            aria-label={
              showPronostics
                ? "Hide pronostics highlights"
                : "Show pronostics highlights"
            }
            className={`
              select-none
              absolute
              md:w-8 md:h-8
              md:py-0 py-2
              md:px-1 px-2
              rounded-full font-extrabold text-sm 
              transition-all duration-300 
              bg-transparent text-slate-900
              z-[11000]
            `}
            style={{
              top: btnPos.top,
              left: btnPos.left,
              // se nei casi piccoli usi "50%" come left:
              transform: btnPos.left.includes("%")
                ? "translateX(-50%)"
                : undefined,
            }}
          >
            {" "}
          </button>
        )}
        {/* ✅ come Matches: in mobile 3 colonne, desktop 4 */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full md:w-max">
          {groups
            .filter((l) => !onlyGroup || l === onlyGroup)
            .map((letter) => {
              const teams = (flagsMond ?? []).filter((t) => t.group === letter);
              const groupKey = `group_${letter}`;
              const matchesData = useSupabase
                ? supabaseMatchesByGroup?.[groupKey] // quando Supabase è pronto
                : groupMatches?.[groupKey]; // altrimenti seed hardcoded

              const resolveName = buildNameResolver(flagsMond);
              const groupTeamNames = new Set(
                teams.map((t) => resolveName(t.name)),
              );

              // 🔹 se loggato (Supabase): usa anche i "ris" come risultati provvisori
              //    (prima results_official, se mancano allora ris)
              const allowRisForQualify = useSupabase ? false : showPronostics;

              const tableByTeam = computeTableForGroup(
                matchesData,
                resolveName,
                groupTeamNames,
                maxMatches,
                allowRisForQualify,
              );

              const simByTeam = {};
              for (const name of groupTeamNames) simByTeam[name] = false;

              for (const g of Object.values(matchesData ?? {})) {
                for (const m of g?.matches ?? []) {
                  const parsed = parseResult(m, {
                    allowRis: !useSupabase && showPronostics,
                  });
                  if (!parsed) continue;
                  if (parsed.source !== "ris") continue;

                  const t1 = resolveName(m.team1);
                  const t2 = resolveName(m.team2);
                  if (groupTeamNames.has(t1)) simByTeam[t1] = true;
                  if (groupTeamNames.has(t2)) simByTeam[t2] = true;
                }
              }

              const groupHasResults = Object.values(tableByTeam).some(
                (t) => t.gf > 0 || t.gs > 0,
              );

              const pronTableByTeam = useSupabase
                ? computeBonusTableForGroup(
                    matchesData,
                    resolveName,
                    groupTeamNames,
                    maxMatches,
                    isAdminUser, // 🔹 solo l'admin usa i seed se mancano i dati utente
                  )
                : showPronostics
                  ? computePronTableForGroup(
                      matchesData,
                      resolveName,
                      groupTeamNames,
                      maxMatches,
                    )
                  : null;

              // 👇 QUI ora pronTableByTeam ESISTE
              // if (groupKey === "group_B") {
              //   console.log("🟦 GRUPPO B → pronTableByTeam:", pronTableByTeam);
              // }

              const sortedTeams = pronTableByTeam
                ? sortTeamsByTotal(
                    teams,
                    tableByTeam,
                    pronTableByTeam,
                    resolveName,
                  )
                : groupHasResults
                  ? sortTeamsByTable(teams, tableByTeam, resolveName, true)
                  : teams;

              return (
                <div
                  key={letter}
                  className={`
                    ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                    ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}
                    ${CssGroup.Bg} border ${CssGroup.Border} flex flex-col
                    md:rounded-tl-[48px] rounded-tl-[28px]
                    md:rounded-bl-[48px] rounded-bl-[28px]
                    overflow-hidden
                  `}
                >
                  <div className="flex-1 flex items-stretch">
                    {/* LETTERA + MESSAGE DIV */}
                    <div className="relative w-8 md:w-10 flex items-center justify-center -top-4">
                      {/* LETTERA */}
                      <span
                        className={`mt-12 font-extrabold text-xl md:text-3xl leading-none ${CssGroupLetter.Text}`}
                      >
                        {letter}
                      </span>
                    </div>

                    {/* GRIGLIA */}
                    <div className="flex-1 flex justify-end bg-slate-400">
                      <div
                        className="grid w-max h-full bg-slate-400"
                        style={{
                          gridTemplateRows: `${headerH} repeat(4, ${rowH}px)`,

                          gridTemplateColumns: gridCols,
                        }}
                      >
                        <Header7 />

                        {Array.from({ length: 4 }).map((_, row) => {
                          const team = sortedTeams[row] ?? null;

                          let teamKey = null;
                          if (team) {
                            teamKey = resolveName(team.name);
                          }

                          const statsOfficial = teamKey
                            ? tableByTeam[teamKey]
                            : null;
                          const pronStats = teamKey
                            ? pronTableByTeam?.[teamKey]
                            : null;

                          // 👉 CLASSIFICA UFFICIALE SEMPRE = SOLO RISULTATI REALI
                          const mainStats = statsOfficial || {
                            pt: 0,
                            w: 0,
                            x: 0,
                            p: 0,
                            gf: 0,
                            gs: 0,
                          };

                          // 👉 PRONOSTICI SEMPRE NEL “+”
                          // (anche se non ci sono risultati ufficiali)
                          const pronPt = pronStats?.pt ?? 0;

                          // risultato simulato
                          const isSim = team ? !!simByTeam[teamKey] : false;

                          // gol GF-GS
                          const golStr =
                            mainStats && (mainStats.gf > 0 || mainStats.gs > 0)
                              ? `${mainStats.gf}:${mainStats.gs}`
                              : "";

                          // quando mostrare i dati
                          const showStats =
                            !!mainStats &&
                            (groupHasResults ||
                              showPronostics ||
                              useSupabase ||
                              pronPt > 0);

                          const safeStats = showStats ? mainStats : null;
                          const safeGolStr = showStats ? golStr : "";
                          const safeIsSim = showStats ? isSim : false;

                          return (
                            <Row7
                              key={row}
                              isLastRow={row === 3}
                              code={team?.id ?? ""}
                              pt={safeStats?.pt ?? 0}
                              showPronostics={
                                useSupabase ? true : showPronostics
                              }
                              pronPt={pronPt} // sempre i bonus reali calcolati
                              w={safeStats?.w ?? 0}
                              x={safeStats?.x ?? 0}
                              p={safeStats?.p ?? 0}
                              gol={safeGolStr}
                              showZero={showStats && groupHasResults}
                              isSim={safeIsSim}
                              teamEl={
                                team ? (
                                  <Quadrato
                                    teamName={team.name}
                                    flag={team.flag}
                                    phase="round32"
                                    advanced={false}
                                    isPronTeam={false}
                                    label={null}
                                  />
                                ) : (
                                  <Quadrato
                                    teamName=""
                                    flag={null}
                                    phase="round32"
                                    advanced={false}
                                    isPronTeam={false}
                                    label={null}
                                  />
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* ✅ spazio extra SOLO mobile per scroll più comodo */}
          <div className="w-20 md:hidden shrink-0" />
        </div>
      </div>
    </div>
  );
}

/* ===========================
   ✅ QUI SOTTO: IDENTICI AI TUOI
   =========================== */

function Header7() {
  const headers = [
    { mobile: "SQ", desktop: "TEAM" },
    "", // colonna vuota (come prima)
    { mobile: "PT", desktop: "PUNTI" },
    { mobile: "G", desktop: "GOL" },
    { mobile: "W", desktop: "W" },
    { mobile: "X", desktop: "X" },
    { mobile: "P", desktop: "P" },
  ];

  return (
    <>
      {headers.map((t, idx) => {
        if (t === "") return null;

        // prima colonna (SQUADRA + FLAG) = span 2
        if (idx === 0) {
          return (
            <div
              key="squadra"
              className={` col-span-2 ${CssHeader7.Bg} border ${CssHeader7.Border} flex items-center justify-center text-[12px] font-extrabold ${CssHeader7.Text} leading-none `}
            >
              {typeof t === "string" ? (
                t
              ) : (
                <>
                  {/* DESKTOP */}
                  <span className="hidden md:block">{t.desktop}</span>
                  {/* MOBILE */}
                  <span className="block md:hidden">{t.mobile}</span>
                </>
              )}
            </div>
          );
        }

        // colonna vuota (flag)
        if (idx === 1) return null;

        // tutte le altre colonne
        return (
          <div
            key={`h-${idx}`}
            className={` ${CssHeader7.Bg} border ${CssHeader7.Border} flex items-center justify-center text-[12px] font-bold ${CssHeader7.Text} leading-none `}
          >
            {typeof t === "string" ? (
              t
            ) : (
              <>
                {/* DESKTOP */}
                <span className="hidden md:block">{t.desktop}</span>
                {/* MOBILE */}
                <span className="block md:hidden">{t.mobile}</span>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

function Row7({
  code,
  teamEl,
  pt,
  pronPt = 0,
  w,
  x,
  p,
  gol,
  showZero,
  showPronostics,
  isSim,
  isLastRow,
}) {
  const showBonus = pronPt > 0;
  return (
    <>
      {/* CODICE */}
      <div
        className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} flex items-center justify-center`}
      >
        <span
          className={`hidden md:block text-[12px] ${CssRow7.CodeText} font-extrabold`}
        >
          {code}
        </span>
      </div>

      {/* SQUADRA (FLAG) */}
      <div
        className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} flex items-center justify-center`}
      >
        <div className="md:scale-[0.65] scale-[0.45] origin-center">
          {teamEl}
        </div>
      </div>

      {/* PUNTI: numero a SINISTRA, +pron a DESTRA */}
      <div
        className={`relative border ${CssRow7.PtBg} ${CssRow7.PtBorder} border-r-0 border-t-0 border-b-0`}
      >
        <div className="h-full w-full flex items-center justify-between md:pl-4 pl-1">
          <span
            className={`font-extrabold ${CssRow7.PtText} md:text-[20px] text-[14px] text-left`}
          >
            {show(pt, { zeroAllowed: showZero })}
          </span>
          {showBonus ? (
            <span
              className={`text-[12px] md:text-[15px] font-extrabold ${CssRow7.PtPronText} md:pr-0 pr-1`}
            >
              +{pronPt}
            </span>
          ) : (
            <span className="text-[12px] md:text-[15px] opacity-0">+0</span>
          )}
        </div>
      </div>

      {/* GOL: testo CENTRATO */}
      <div
        className={`
          ${CssRow7.GolBg} border ${CssRow7.CellBorder}
          border-l-0 border-t-0
          ${!isLastRow ? `border-b-4 ${CssRow7.BottomLine}` : ""}
          ${CssRow7.GolText}
          flex items-center justify-center md:pl-1 pl-0
        `}
      >
        <span
          className={`text-[12px] md:text-[15px] font-extrabold ${
            isSim ? "text--400/80" : ""
          }`}
        >
          {gol}
        </span>
      </div>

      {/* W: CENTRO */}

      <div
        className={`
          ${CssRow7.CellBg} border ${CssRow7.CellBorder}
          ${!isLastRow ? `border-b-4 ${CssRow7.BottomLine}` : ""}
          ${CssRow7.WxpText}
          flex items-center justify-center
        `}
      >
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(w, { zeroAllowed: false })}
        </span>
      </div>

      {/* X: CENTRO */}
      <div
        className={`
          ${CssRow7.CellBg} border ${CssRow7.CellBorder}
          ${!isLastRow ? `border-b-4 ${CssRow7.BottomLine}` : ""}
          ${CssRow7.WxpText}
          flex items-center justify-center
        `}
      >
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(x, { zeroAllowed: false })}
        </span>
      </div>

      {/* P: CENTRO */}
      <div
        className={`
          ${CssRow7.CellBg} border ${CssRow7.CellBorder}
          ${!isLastRow ? `border-b-4 ${CssRow7.BottomLine}` : ""}
          ${CssRow7.WxpText}
          flex items-center justify-center
        `}
      >
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(p, { zeroAllowed: false })}
        </span>
      </div>
    </>
  );
}
