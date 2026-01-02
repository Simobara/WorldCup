import { useEffect, useState } from "react";
import { groupMatches } from "../../START/app/0GroupMatches";
import { flagsMond } from "../../START/app/main";
import { CssGroup, CssHeader7, CssRow7 } from "../../START/styles/0CssGsTs";
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

function parseResult(match, { allowRis = true } = {}) {
  if (!match) return null;

  const pick = (s) => {
    const raw = String(s ?? "").trim();
    if (!raw || !raw.includes("-")) return null;
    const [a, b] = raw.split("-").map((x) => Number(String(x).trim()));
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
  allowRis = true
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


function computeTableForGroup(
  matchesData,
  resolveName,
  groupTeamNames,
  maxMatches = null,
  allowRis = true
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
// ---------------------------------------------------------------------------------
export default function GridRankPage({ onlyGroup, maxMatches = null, isLogged }) {
  const isTooltip = !!onlyGroup;
  const STORAGE_KEY = "gridRank_showPronostics";

  const [showPronostics, setShowPronostics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // ✅ COLONNE: desktop e mobile (come richiesto)
  //const headers = ["SQUADRA", "", "PUNTI", "GOL", "W", "X", "P"];
  const gridColsDesktop = "30px 60px 50px 60px 40px 40px 40px";
  const gridColsMobile = "1px 30px 30px 25px 15px 15px 15px";

  const [gridCols, setGridCols] = useState(gridColsMobile);
  const groups = "ABCDEFGHIJKL".split("");

  // ✅ come “Matches”: card strette in mobile, grandi in desktop
  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[18rem]";

  const GROUP_WIDTH_MOBILE = "w-[9.5rem]";
  const GROUP_HEIGHT_MOBILE = "h-[11.5rem]";

  const headerHDesktop = "1rem";
  const rowHDesktop = 70;

  const headerHMobile = "1rem";
  const rowHMobile = 43;

  const [rowH, setRowH] = useState(rowHMobile);
  const [headerH, setHeaderH] = useState(headerHMobile);

  useEffect(() => {
    if (isLogged) {
      setShowPronostics(true);
    } else {
      setShowPronostics(false); // opzionale
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

  return (
    <div
      className={
        isTooltip
          ? "p-0 overflow-visible"
          : "min-h-screen pl-1 pr-12 md:px-4 md:pt-16 pt-2 overflow-x-auto"
      }
    >
      <div
        className={
          isTooltip
            ? "relative"
            : "relative flex justify-center items-start min-w-max"
        }
      >
        {!isTooltip && (
          <button
            onClick={() => setShowPronostics((v) => !v)}
            aria-pressed={showPronostics}
            aria-label={
              showPronostics
                ? "Hide pronostics highlights"
                : "Show pronostics highlights"
            }
            className={`
            absolute 
            md:w-8 md:h-8
            md:-top-11 top-[18.5rem]
            md:right-[30rem] -right-10 
            md:py-0 py-2
            md:px-1 px-2
            rounded-full font-extrabold text-sm 
            transition-all duration-300 
            bg-slate -900 text-slate-800 z-[11000]`}
        >
            {/* md:z-0 z-[999] */}
            {showPronostics ? "," : "."}
          </button>
        )}
        {/* ✅ come Matches: in mobile 3 colonne, desktop 4 */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full md:w-max">
          {groups
            .filter((l) => !onlyGroup || l === onlyGroup)
            .map((letter) => {
              const teams = (flagsMond ?? []).filter((t) => t.group === letter);
              const groupKey = `group_${letter}`;
              const matchesData = groupMatches?.[groupKey];

              const resolveName = buildNameResolver(flagsMond);
              const groupTeamNames = new Set(
                teams.map((t) => resolveName(t.name))
              );

              // ✅ in questa pagina: "ris" conta solo quando clicchi "." / ","
              const allowRis = showPronostics;

              const tableByTeam = computeTableForGroup(
                matchesData,
                resolveName,
                groupTeamNames,
                maxMatches,
                allowRis
              );
              const simByTeam = {};
              for (const name of groupTeamNames) simByTeam[name] = false;

              for (const g of Object.values(matchesData ?? {})) {
                for (const m of g?.matches ?? []) {
                  const parsed = parseResult(m, { allowRis: showPronostics });
                  if (!parsed) continue;
                  if (parsed.source !== "ris") continue;

                  const t1 = resolveName(m.team1);
                  const t2 = resolveName(m.team2);
                  if (groupTeamNames.has(t1)) simByTeam[t1] = true;
                  if (groupTeamNames.has(t2)) simByTeam[t2] = true;
                }
              }

              const groupHasResults = Object.values(tableByTeam).some(
                (t) => t.gf > 0 || t.gs > 0
              );

              const pronTableByTeam = showPronostics
                ? computePronTableForGroup(
                    matchesData,
                    resolveName,
                    groupTeamNames,
                    maxMatches
                  )
                : null;

              const sortedTeams = groupHasResults
                ? sortTeamsByTable(teams, tableByTeam, resolveName, true)
                : showPronostics
                  ? sortTeamsByPron(teams, pronTableByTeam, resolveName)
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
                      <span className="mt-4 text-gray-400 font-extrabold text-xl md:text-3xl leading-none">
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
                        const teamKey = team ? resolveName(team.name) : null;

                        const stats = team ? tableByTeam[teamKey] : null;
                        const pronStats = team
                          ? pronTableByTeam?.[teamKey]
                          : null;

                        const pronPt = pronStats?.pt ?? 0;

                        // 🔴 QUI: risultato simulato (ris)
                        const isSim = team ? !!simByTeam[teamKey] : false;

                          const golStr =
                            stats && (stats.gf > 0 || stats.gs > 0)
                              ? `${stats.gf}:${stats.gs}`
                              : "";

                          // ✅ in questa pagina pronostici: nascondi stats finché non clicchi "." / ","
                          const shouldShow = showPronostics;

                          const safeStats = shouldShow ? stats : null;
                          const safeGolStr = shouldShow ? golStr : "";
                          const safeIsSim = shouldShow ? isSim : false;

                          return (
                          <Row7
                            key={row}
                            code={team?.id ?? ""}
                            pt={safeStats?.pt ?? 0}
                            showPronostics={showPronostics}
                            pronPt={showPronostics ? pronPt : 0}
                            w={safeStats?.w ?? 0}
                            x={safeStats?.x ?? 0}
                            p={safeStats?.p ?? 0}
                            gol={safeGolStr}
                            showZero={shouldShow && groupHasResults}
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
    { mobile: "SQ", desktop: "SQUADRA" },
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
            className={` col-span-2 ${CssHeader7.Bg} border ${CssHeader7.Border} flex items-center justify-center text-[9px] font-extrabold ${CssHeader7.Text} leading-none `}
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
            className={` ${CssHeader7.Bg} border ${CssHeader7.Border} flex items-center justify-center text-[9px] font-bold ${CssHeader7.Text} leading-none `} >
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
}) {
  return (
    <>
      {/* CODICE */}
      <div className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} flex items-center justify-center`} >
        <span className={`hidden md:block text-[10px] ${CssRow7.CodeText} font-extrabold`} >
          {code}
        </span>
      </div>

      {/* SQUADRA (FLAG) */}
      <div className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} flex items-center justify-center`}>
        <div className="md:scale-[0.65] scale-[0.45] origin-center">{teamEl}</div>
      </div>


      {/* PUNTI: numero a SINISTRA, +pron a DESTRA */}
      <div className={`relative border ${CssRow7.PtBg} ${CssRow7.PtBorder} border-r-0 border-t-0 border-b-0`}>
        <div className="h-full w-full flex items-center justify-between md:pl-4 pl-1">
          <span className={`font-extrabold ${CssRow7.PtText} md:text-[20px] text-[14px] text-left`}>
            {show(pt, { zeroAllowed: showZero })}
          </span>
          {showPronostics && pronPt > 0 ? (
            <span className={`text-[12px] md:text-[15px] font-extrabold ${CssRow7.PtPronText} md:pr-0 pr-1`}>
              +{pronPt}
            </span>
          ) : (
            <span className="text-[12px] md:text-[15px] opacity-0">+0</span>
          )}
        </div>
      </div>


      {/* GOL: testo CENTRATO */}
      <div className={`${CssRow7.GolBg} border ${CssRow7.CellBorder} border-l-0 border-b-4 border-t-0 ${CssRow7.BottomLine} ${CssRow7.GolText} flex items-center justify-center md:pl-1 pl-0`}>
       <span
        className={`text-[12px] md:text-[15px] font-extrabold ${
        isSim ? "text-purple-400/80" : ""
        }`}
        >
        {gol}
      </span>
      </div>


      {/* W: CENTRO */}
      <div className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} border-b-4 ${CssRow7.BottomLine} ${CssRow7.WxpText} flex items-center justify-center`}>
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(w, { zeroAllowed: false })}
        </span>
      </div>

        {/* X: CENTRO */}
      <div className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} border-b-4 ${CssRow7.BottomLine} ${CssRow7.WxpText} flex items-center justify-center`}>
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(x, { zeroAllowed: false })}
        </span>
      </div>

        {/* P: CENTRO */}
      <div className={`${CssRow7.CellBg} border ${CssRow7.CellBorder} border-b-4 ${CssRow7.BottomLine} ${CssRow7.WxpText} flex items-center justify-center`}>
        <span className="font-extrabold text-center text-[12px] md:text-[15px]">
          {show(p, { zeroAllowed: false })}
        </span>
      </div>
    </>
  );
}
