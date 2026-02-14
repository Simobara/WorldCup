// src/Pages/2aGroupMatches/zExternal/getSortedTeamsForGroup.js
import { buildNameResolver } from "./buildNameResolver";

// helpers (coerenti con GridRank)
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

const isSign = (s) => {
  const v = String(s ?? "")
    .trim()
    .toUpperCase();
  return v === "1" || v === "X" || v === "2";
};

const parseResult = (match, { allowRis = true } = {}) => {
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
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    return [a, b];
  };

  const off = pick(match.results);
  if (off) return { score: off, source: "results" };

  if (!allowRis) return null;

  const sim = pick(match.ris);
  if (sim) return { score: sim, source: "ris" };

  return null;
};

const computeTableForGroup = (
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  allowRis = true,
) => {
  const table = {};
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0, gf: 0, gs: 0, mp: 0 }; // ✅ mp
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

      table[t1].mp++;
      table[t2].mp++;

      if (g1 > g2) {
        table[t1].w++;
        table[t1].pt += 3;
        table[t2].p++;
      } else if (g1 < g2) {
        table[t2].w++;
        table[t2].pt += 3;
        table[t1].p++;
      } else {
        table[t1].x++;
        table[t2].x++;
        table[t1].pt += 1;
        table[t2].pt += 1;
      }
    }
  }

  return table;
};

const computePronTableForGroup = (
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  allowRis = true,
) => {
  const table = {};
  for (const name of groupTeamNames) table[name] = { pt: 0, w: 0, x: 0, p: 0 };
  if (!matchesData) return table;

  const giornate = Object.values(matchesData);
  let seen = 0;

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      if (Number.isFinite(maxMatches) && seen >= maxMatches) return table;
      seen++;

      // ✅ se ufficiale, non contare pron
      const official = parseResult(m, { allowRis: false });
      if (official) continue;

      let outcome = null;

      // ✅ se ho un ris (simulato), ricavo l’esito 1/X/2
      const parsed = parseResult(m, { allowRis });
      if (parsed?.source === "ris") {
        const [ga, gb] = parsed.score;
        outcome = ga > gb ? "1" : ga < gb ? "2" : "X";
      }

      // ✅ altrimenti usa il pron 1/X/2
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
        table[t1].w++;
        table[t2].p++;
      } else if (outcome === "2") {
        table[t2].pt += 3;
        table[t2].w++;
        table[t1].p++;
      } else {
        table[t1].pt += 1;
        table[t2].pt += 1;
        table[t1].x++;
        table[t2].x++;
      }
    }
  }

  return table;
};

const sortTeamsByTable = (teams, tableByTeam, resolveName) => {
  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const A = tableByTeam?.[ak] ?? { pt: 0, gf: 0, gs: 0 };
    const B = tableByTeam?.[bk] ?? { pt: 0, gf: 0, gs: 0 };

    if (B.pt !== A.pt) return B.pt - A.pt;

    const Agd = (A.gf ?? 0) - (A.gs ?? 0);
    const Bgd = (B.gf ?? 0) - (B.gs ?? 0);
    if (Bgd !== Agd) return Bgd - Agd;

    if ((B.gf ?? 0) !== (A.gf ?? 0)) return (B.gf ?? 0) - (A.gf ?? 0);
    if ((A.gs ?? 0) !== (B.gs ?? 0)) return (A.gs ?? 0) - (B.gs ?? 0);

    return ak.localeCompare(bk);
  });
};

const sortTeamsByTotal = (teams, tableByTeam, pronTableByTeam, resolveName) => {
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
};

// ✅ QUESTA È LA FUNZIONE CHE USERAI OVUNQUE (Matches + Rank)
export function getSortedTeamsForGroup({
  flagsMond,
  groupLetter,
  matchesData,
  maxMatches = null,
  allowRis = true, // per guest: puoi includere ris
  useBonus = true, // “somma” (ufficiali + pron/ris)
} = {}) {
  const resolveName = buildNameResolver(flagsMond);
  const teams = (flagsMond ?? []).filter((t) => t.group === groupLetter);
  const groupTeamNames = new Set(teams.map((t) => resolveName(t.name)));

  // ✅ se useBonus=true: la tabella “ufficiale” deve usare SOLO results
  const tableByTeam = computeTableForGroup(
    matchesData,
    resolveName,
    groupTeamNames,
    maxMatches,
    useBonus ? false : allowRis,
  );

  // ✅ pron/ris (solo dove non c’è ufficiale) può includere ris
  const pronTableByTeam = useBonus
    ? computePronTableForGroup(
        matchesData,
        resolveName,
        groupTeamNames,
        maxMatches,
        allowRis,
      )
    : null;

  // ✅ robusto anche con 0-0
  const anyPlayed = Object.values(tableByTeam).some((t) => (t.mp ?? 0) > 0);

  if (!useBonus || !pronTableByTeam) {
    return anyPlayed
      ? sortTeamsByTable(teams, tableByTeam, resolveName)
      : teams;
  }

  return sortTeamsByTotal(teams, tableByTeam, pronTableByTeam, resolveName);
}

// (opzionale) export helpers se ti servono altrove
export { computePronTableForGroup, isScore, isSign, normalizeScore };
