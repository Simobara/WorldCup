import { groupMatches } from "../../START/app/0GroupMatches";
import { flagsMond } from "../../START/app/main";
import Quadrato from "../3tableComp/1quad";

function v(val, showZero) {
  if (val > 0) return val;
  return showZero ? 0 : "";
}

function show(val, { zeroAllowed }) {
  if (val > 0) return val;
  if (val === 0 && zeroAllowed) return 0;
  return "";
}

function parseResult(res) {
  if (!res) return null;
  const s = String(res).trim();
  if (!s.includes("-")) return null;

  const [a, b] = s.split("-").map((x) => Number(String(x).trim()));
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  return [a, b]; // [golTeam1, golTeam2]
}

function norm(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, ""); // toglie simboli tipo ç, spazi, ecc. (mantiene lettere/numeri)
}

function buildNameResolver(allTeams) {
  const map = new Map();

  for (const t of allTeams ?? []) {
    // chiavi possibili -> nome canonico (t.name)
    map.set(norm(t.name), t.name);
    map.set(norm(t.id), t.name);

    // anche qualche alias facile (se ti serve)
    map.set(norm(t.name.replaceAll(".", "")), t.name);
  }

  // ✅ alias manuali per i match che hai scritto diversamente
  map.set(norm("SAfrica"), "Sudafrica"); // <-- questo è il tuo caso
  map.set(norm("StatiUniti"), "StatiUniti"); // esempio
  // aggiungi qui altri alias se li hai nei match

  return (rawName) => map.get(norm(rawName)) ?? String(rawName).trim();
}

function computePronTableForGroup(matchesData, resolveName, groupTeamNames) {
  const table = {};

  // init
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0 };
  }

  if (!matchesData) return table;

  const giornate = Object.values(matchesData);

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      const pron = String(m.pron ?? "")
        .trim()
        .toUpperCase();
      if (!pron) continue;

      // ✅ RIGA DI ORIENTAMENTO: se c'è un risultato valido, NON contare il pron
      const hasRes = !!parseResult(m.results);
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

function computeTableForGroup(matchesData, resolveName, groupTeamNames) {
  const table = {};

  // init
  for (const name of groupTeamNames) {
    table[name] = { pt: 0, w: 0, x: 0, p: 0, gf: 0, gs: 0 };
  }

  if (!matchesData) return table;

  const giornate = Object.values(matchesData);

  for (const g of giornate) {
    for (const m of g?.matches ?? []) {
      const parsed = parseResult(m.results);
      if (!parsed) continue;

      const [g1, g2] = parsed;
      const t1 = resolveName(m.team1);
      const t2 = resolveName(m.team2);

      // ignora partite con squadre non reali del gruppo (PlayD ecc.)
      if (!groupTeamNames.has(t1) || !groupTeamNames.has(t2)) continue;

      // goals
      table[t1].gf += g1;
      table[t1].gs += g2;
      table[t2].gf += g2;
      table[t2].gs += g1;

      // esito
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
  // se non ci sono risultati, non cambiare ordine (rimane quello di flagsMond)
  if (!groupHasResults) return teams;

  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const A = tableByTeam[ak] ?? { pt: 0, gf: 0, gs: 0 };
    const B = tableByTeam[bk] ?? { pt: 0, gf: 0, gs: 0 };

    // 1) punti (desc)
    if (B.pt !== A.pt) return B.pt - A.pt;

    // 2) gol fatti (desc)
    if (B.gf !== A.gf) return B.gf - A.gf;

    // 3) gol subiti (asc)
    if (A.gs !== B.gs) return A.gs - B.gs;

    // fallback stabile
    return ak.localeCompare(bk);
  });
}
function sortTeamsByPron(teams, pronTableByTeam, resolveName) {
  return [...teams].sort((a, b) => {
    const ak = resolveName(a.name);
    const bk = resolveName(b.name);

    const A = pronTableByTeam?.[ak] ?? { pt: 0, w: 0, x: 0, p: 0 };
    const B = pronTableByTeam?.[bk] ?? { pt: 0, w: 0, x: 0, p: 0 };

    // 1) punti pron (desc)
    if (B.pt !== A.pt) return B.pt - A.pt;

    // 2) vittorie pron (desc)
    if (B.w !== A.w) return B.w - A.w;

    // 3) pareggi pron (desc)
    if (B.x !== A.x) return B.x - A.x;

    // fallback stabile
    return ak.localeCompare(bk);
  });
}

export default function GridRankPage() {
  const groups = "ABCDEFGHIJKL".split("");

  const GROUP_WIDTH_MOBILE = "w-40";
  const GROUP_HEIGHT_MOBILE = "h-40";
  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[18rem]";

  const gridCols = "55px 60px 60px 35px 35px 35px 40px";

  return (
    <div className="min-h-screen px-4 pt-16 overflow-x-auto">
      <div className="flex justify-center items-start min-w-max">
        <div className="grid grid-cols-4 gap-4 w-max">
          {groups.map((letter) => {
            // ✅ squadre del gruppo (array piatto -> filtro per group)
            const teams = (flagsMond ?? []).filter((t) => t.group === letter);

            // ✅ matches del gruppo (se ti serve dopo)
            const groupKey = `group_${letter}`;
            const matchesData = groupMatches?.[groupKey];

            const resolveName = buildNameResolver(flagsMond);
            const groupTeamNames = new Set(
              teams.map((t) => resolveName(t.name))
            );

            const tableByTeam = computeTableForGroup(
              matchesData,
              resolveName,
              groupTeamNames
            );

            const pronTableByTeam = computePronTableForGroup(
              matchesData,
              resolveName,
              groupTeamNames
            );

            const groupHasResults = Object.values(tableByTeam).some(
              (t) => t.gf > 0 || t.gs > 0
            );
            const sortedTeams = groupHasResults
              ? sortTeamsByTable(teams, tableByTeam, resolveName, true)
              : sortTeamsByPron(teams, pronTableByTeam, resolveName);

            // const goalsByTeam = computeGoalsForGroup(matchesData, resolveName);

            return (
              <div
                key={letter}
                className={`
                  ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                  ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}
                  bg-red-900 border border-slate-900 flex flex-col
                  rounded-tl-[48px] rounded-bl-[48px]
                  overflow-hidden
                `}
              >
                <div className="flex-1 flex items-stretch">
                  {/* LETTERA */}
                  <div className="w-8 md:w-10 flex items-center justify-center">
                    <span className="text-white font-extrabold text-xl md:text-3xl leading-none">
                      {letter}
                    </span>
                  </div>

                  {/* GRIGLIA */}
                  <div className="flex-1 flex justify-end bg-slate-400">
                    <div
                      className="grid w-max h-full bg-slate-400"
                      style={{
                        gridTemplateRows: "1rem repeat(4, 1fr)",
                        gridTemplateColumns: gridCols,
                      }}
                    >
                      <Header7 />

                      {Array.from({ length: 4 }).map((_, row) => {
                        const team = sortedTeams[row] ?? null;

                        // const resolvedTeamName = team
                        //   ? resolveName(team.id || team.name)
                        //   : null;
                        const teamKey = team ? resolveName(team.name) : null;

                        const stats = team ? tableByTeam[teamKey] : null;
                        const pronStats = team
                          ? pronTableByTeam[teamKey]
                          : null;
                        const pronPt = pronStats?.pt ?? 0;
                        // mostra i gol SOLO se esiste almeno un risultato reale
                        const golStr =
                          stats && (stats.gf > 0 || stats.gs > 0)
                            ? `${stats.gf}:${stats.gs}`
                            : "";

                        return (
                          <Row7
                            key={row}
                            code={team?.id ?? ""}
                            pt={stats?.pt ?? 0}
                            pronPt={pronPt}
                            w={stats?.w ?? 0}
                            x={stats?.x ?? 0}
                            p={stats?.p ?? 0}
                            gol={golStr}
                            showZero={groupHasResults}
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
        </div>
      </div>
    </div>
  );
}

function Header7() {
  const headers = ["SQUADRA", "", "PUNTI", "W", "X", "P", "GOL"];

  return (
    <>
      {headers.map((t, idx) => {
        if (idx === 0) {
          return (
            <div
              key="squadra"
              className="col-span-2 bg-slate-900 border border-black/40 flex items-center justify-center text-[9px] font-extrabold text-white leading-none"
            >
              {t}
            </div>
          );
        }
        if (idx === 1) return null;

        return (
          <div
            key={`h-${idx}`}
            className="bg-slate-900 border border-black/40 flex items-center justify-center text-[9px] font-bold text-white leading-none"
          >
            {t}
          </div>
        );
      })}
    </>
  );
}

function Row7({ code, teamEl, pt, pronPt = 0, w, x, p, gol, showZero }) {
  return (
    <>
      <div className="bg-slate-900 border border-black/30 flex items-center justify-center">
        <span className="text-[10px] text-slate-400 font-extrabold">
          {code}
        </span>
      </div>

      <div className="bg-slate-900 border border-black/30 flex items-center justify-center">
        <div className="scale-[0.55] md:scale-[0.65] origin-center">
          {teamEl}
        </div>
      </div>

      {/* PUNTI → reali (centrati) + pron (overlay viola) */}
      <div className="relative bg-yellow-500/30 border border-black/30 flex items-center justify-center">
        {/* punti REALI */}
        <span className="font-extrabold text-black">
          {show(pt, { zeroAllowed: showZero })}
        </span>

        {/* punti PRON (overlay, non sposta nulla) */}
        {pronPt > 0 && (
          <span className="absolute right-1 top-6 text-[12px] font-extrabold text-purple-600">
            +{pronPt}
          </span>
        )}
      </div>
      {/* W → mai 0 */}
      <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
        <span className="font-extrabold">
          {show(w, { zeroAllowed: false })}
        </span>
      </div>

      {/* X → mai 0 */}
      <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
        <span className="font-extrabold">
          {show(x, { zeroAllowed: false })}
        </span>
      </div>

      {/* P → mai 0 */}
      <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
        <span className="font-extrabold">
          {show(p, { zeroAllowed: false })}
        </span>
      </div>

      {/* GOL */}
      <div className="bg-yellow-800/40 border border-black/30 flex items-center justify-center">
        <span className="text-[14px] md:text-[16px] font-extrabold">{gol}</span>
      </div>
    </>
  );
}
