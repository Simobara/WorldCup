import { useEffect, useRef } from "react";
import { supabase } from "../../Services/supabase/supabaseClient";
import { flagsMond } from "../../START/app/0main";
import { useQualifiedTeams } from "./global";
import { getSortedTeamsForGroup } from "../../components/2aGroupMatches/zExternal/getSortedTeamsForGroup";

/* =========================
   Helpers (tutto locale)
   ========================= */

const normalizeScore = (s) =>
  String(s ?? "")
    .trim()
    .replace(/[–—−]/g, "-")
    .replace(/:/g, "-")
    .replace(/\s+/g, "");

const isScore = (s) => {
  const v = normalizeScore(s);
  if (!v || !v.includes("-")) return false;
  const [aStr, bStr] = v.split("-");
  const a = Number(aStr);
  const b = Number(bStr);
  return Number.isFinite(a) && Number.isFinite(b);
};

function parseResult(match, { allowRis = true } = {}) {
  if (!match) return null;

  const pick = (s) => {
    const raw = String(s ?? "").trim();
    if (!raw) return null;

    const normalized = raw
      .replace(/[–—−]/g, "-")
      .replace(/:/g, "-")
      .replace(/\s+/g, "");

    if (!normalized.includes("-")) return null;

    const [aStr, bStr] = normalized.split("-");
    const a = Number(aStr);
    const b = Number(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;

    return [a, b];
  };

  const off = pick(match.results);
  if (off) return { score: off, source: "results" };

  if (!allowRis) return null;

  const sim = pick(match.ris);
  if (sim) return { score: sim, source: "ris" };

  return null;
}

const getAllMatches = (matchesData) =>
  Object.values(matchesData ?? {})
    .flatMap((g) => g?.matches ?? [])
    .filter(Boolean);

const isGroupClosed = (matchesData) => {
  const all = getAllMatches(matchesData);
  if (all.length < 6) return false;
  // “coperto” = ufficiale (results) oppure ris utente oppure segno
  return all.every((m) => {
    const hasOfficial = isScore(m?.results);
    const hasRis = isScore(m?.ris);
    const hasSign = ["1", "X", "2"].includes(
      String(m?.pron ?? "")
        .trim()
        .toUpperCase(),
    );
    return hasOfficial || hasRis || hasSign;
  });
};

const isGroupAllOfficial = (matchesData) => {
  const all = getAllMatches(matchesData);
  if (all.length < 6) return false;
  return all.every((m) => isScore(m?.results));
};

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

  // alias “sporchi” (se ti servono)
  map.set(norm("SAfrica"), "Sudafrica");
  map.set(norm("StatiUniti"), "StatiUniti");

  return (rawName) => map.get(norm(rawName)) ?? String(rawName).trim();
}

function computeTableForGroup(
  matchesData,
  resolveName,
  groupTeamNames,
  allowRis,
) {
  const table = {};
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0, gf: 0, gs: 0 };
  }
  if (!matchesData) return table;

  for (const g of Object.values(matchesData)) {
    for (const m of g?.matches ?? []) {
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

function computePronTableForGroup(matchesData, resolveName, groupTeamNames) {
  const table = {};
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0 };
  }
  if (!matchesData) return table;

  for (const g of Object.values(matchesData)) {
    for (const m of g?.matches ?? []) {
      // se ufficiale esiste → NON contare pron
      if (isScore(m?.results)) continue;

      let outcome = null;

      // se ho ris → ricavo segno
      const parsed = parseResult(m, { allowRis: true });
      if (parsed?.source === "ris") {
        const [ga, gb] = parsed.score;
        outcome = ga > gb ? "1" : ga < gb ? "2" : "X";
      }

      // fallback segno scritto
      if (!outcome) {
        const sign = String(m.pron ?? "")
          .trim()
          .toUpperCase();
        if (sign === "1" || sign === "2" || sign === "X") outcome = sign;
      }

      if (!outcome) continue;

      const t1 = resolveName(m.team1);
      const t2 = resolveName(m.team2);
      if (!groupTeamNames.has(t1) || !groupTeamNames.has(t2)) continue;

      if (outcome === "1") {
        table[t1].pt += 3;
        table[t1].w += 1;
        table[t2].p += 1;
      } else if (outcome === "2") {
        table[t2].pt += 3;
        table[t2].w += 1;
        table[t1].p += 1;
      } else {
        table[t1].pt += 1;
        table[t2].pt += 1;
        table[t1].x += 1;
        table[t2].x += 1;
      }
    }
  }
  return table;
}

function sortTeamsByTable(teams, tableByTeam, resolveName) {
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

function sortTeamsByTotal(teams, tableByTeam, pronTableByTeam, resolveName) {
  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const Aoff = tableByTeam?.[ak] ?? { pt: 0, gf: 0, gs: 0 };
    const Boff = tableByTeam?.[bk] ?? { pt: 0, gf: 0, gs: 0 };

    const Apron = pronTableByTeam?.[ak] ?? { pt: 0 };
    const Bpron = pronTableByTeam?.[bk] ?? { pt: 0 };

    const Atot = (Aoff.pt ?? 0) + (Apron.pt ?? 0);
    const Btot = (Boff.pt ?? 0) + (Bpron.pt ?? 0);

    if (Btot !== Atot) return Btot - Atot;
    if (Boff.pt !== Aoff.pt) return Boff.pt - Aoff.pt;

    const Agd = (Aoff.gf ?? 0) - (Aoff.gs ?? 0);
    const Bgd = (Boff.gf ?? 0) - (Boff.gs ?? 0);
    if (Bgd !== Agd) return Bgd - Agd;

    if ((Boff.gf ?? 0) !== (Aoff.gf ?? 0))
      return (Boff.gf ?? 0) - (Aoff.gf ?? 0);
    if ((Bpron.pt ?? 0) !== (Apron.pt ?? 0))
      return (Bpron.pt ?? 0) - (Apron.pt ?? 0);

    return ak.localeCompare(bk);
  });
}

/* =========================
   Component
   ========================= */

export function QualifiedTeamsSync({
  isLogged,
  userEmail,
  refreshKey,
  setQualifiedTeams: setQualifiedTeamsProp,
  setIsQualifiedLoading,
}) {
  const { setQualifiedTeams: setQualifiedTeamsCtx } = useQualifiedTeams(); // ✅

  const setQualifiedTeams =
    typeof setQualifiedTeamsProp === "function"
      ? setQualifiedTeamsProp
      : setQualifiedTeamsCtx;
  const lastRunRef = useRef({ email: "", key: null });

  useEffect(() => {
    let cancelled = false;

    if (typeof setQualifiedTeams !== "function") {
      const err = new Error(
        "QualifiedTeamsSync: setQualifiedTeams NON è una funzione (prop mancante).",
      );
      console.error(err.message, { setQualifiedTeams });
      console.log("STACK:\n", err.stack); // 👈 qui vediamo il parent
      return () => {
        cancelled = true;
      };
    }

    // ✅ Logout vero → reset immediato
    if (!isLogged) {
      setIsQualifiedLoading?.(false);
      setQualifiedTeams({});
      return () => {
        cancelled = true;
      };
    }

    // ✅ Login in transizione (email non pronta) → non fare nulla
    if (!userEmail) {
      return () => {
        cancelled = true;
      };
    }

    // ✅ evita rerun con stesso input (email + refreshKey)
    if (
      lastRunRef.current.email === userEmail &&
      lastRunRef.current.key === refreshKey
    ) {
      return () => {
        cancelled = true;
      };
    }
    lastRunRef.current = { email: userEmail, key: refreshKey };

    async function run() {
      setIsQualifiedLoading?.(true);

      try {
        // 1) struttura match
        const { data: structRows, error: structErr } = await supabase
          .from("wc_matches_structure")
          .select("*");

        if (structErr) {
          console.error(
            "QualifiedTeamsSync wc_matches_structure error",
            structErr,
          );
          return;
        }

        // 2) pron / ris utente
        const { data: pronRows, error: pronErr } = await supabase
          .from("wc_matches_structure_userpron")
          .select("group_letter, match_index, user_pron, user_ris")
          .eq("user_email", userEmail);

        if (pronErr) {
          console.error(
            "QualifiedTeamsSync wc_matches_structure_userpron error",
            pronErr,
          );
          return;
        }

        const pronMap = {};
        for (const pr of pronRows ?? []) {
          const key = `${pr.group_letter}-${pr.match_index}`;
          pronMap[key] = pr;
        }

        // 3) costruisco matchesData per group_A...group_L
        const byGroup = {};

        for (const row of structRows ?? []) {
          const letter = row.group_letter ?? row.group ?? null;
          if (!letter) continue;

          const groupKey = `group_${letter}`;

          if (!byGroup[groupKey]) {
            byGroup[groupKey] = {
              giornata_1: { matches: [] },
              giornata_2: { matches: [] },
              giornata_3: { matches: [] },
            };
          }

          const idx = row.match_index ?? 0;
          const giornataKey =
            idx <= 1 ? "giornata_1" : idx <= 3 ? "giornata_2" : "giornata_3";

          const userRow = pronMap[`${letter}-${row.match_index}`];

          const pron = (userRow?.user_pron || "").trim().toUpperCase() || null;

          let ris = null;
          const rawUserRis = (userRow?.user_ris ?? "").toString().trim();

          if (rawUserRis) {
            if (rawUserRis.startsWith("{")) {
              try {
                const parsed = JSON.parse(rawUserRis);
                const aRaw = String(parsed?.a ?? "").trim();
                const bRaw = String(parsed?.b ?? "").trim();
                if (aRaw !== "" && bRaw !== "") ris = `${aRaw}-${bRaw}`;
              } catch (e) {
                console.warn(
                  "QualifiedTeamsSync user_ris JSON non valido:",
                  rawUserRis,
                  e,
                );
              }
            } else {
              const normalized = rawUserRis
                .replace(/[–—−]/g, "-")
                .replace(/:/g, "-")
                .replace(/\s+/g, "");

              if (normalized.includes("-")) {
                const [gaRaw, gbRaw] = normalized.split("-");
                const ga = gaRaw.trim();
                const gb = gbRaw.trim();
                if (ga !== "" && gb !== "") ris = `${ga}-${gb}`;
              }
            }
          }

          byGroup[groupKey][giornataKey].matches.push({
            team1: row.team1,
            team2: row.team2,
            results: row.results_official ?? null,
            ris,
            pron,
          });
        }

        // 4) calcolo qualificate
        const letters = "ABCDEFGHIJKL".split("");
        const resolveName = buildNameResolver(flagsMond);

        const nextQualified = {};

        for (const letter of letters) {
          const groupKey = `group_${letter}`;
          const matchesData = byGroup?.[groupKey];
          if (!matchesData) continue;

          if (!isGroupClosed(matchesData)) continue;

          const allOfficial = isGroupAllOfficial(matchesData);
          const qualifyIsPron = !allOfficial;

          const teams = (flagsMond ?? []).filter((t) => t.group === letter);
          const groupTeamNames = new Set(teams.map((t) => resolveName(t.name)));

          const sorted = getSortedTeamsForGroup({
            flagsMond,
            groupLetter: letter,
            matchesData,
            maxMatches: null,
            allowRis: true, // qui vuoi considerare anche ris/pron per “chiusura”
            useBonus: true, // somma ufficiali + pron (come facevi prima)
          });

          const first = sorted?.[0]?.id || "";
          const second = sorted?.[1]?.id || "";
          if (!first || !second) continue;

          nextQualified[`1${letter}`] = { code: first, isPron: qualifyIsPron };
          nextQualified[`2${letter}`] = { code: second, isPron: qualifyIsPron };
        }

        if (!cancelled) {
          setQualifiedTeams(nextQualified);
        }
      } finally {
        if (!cancelled) setIsQualifiedLoading?.(false);
      }
    }

    run();

    return () => {
      cancelled = true;
      setIsQualifiedLoading?.(false);
    };
  }, [
    isLogged,
    userEmail,
    refreshKey,
    setQualifiedTeamsProp,
    setQualifiedTeamsCtx,
  ]);

  return null;
}
