import { useEffect, useRef, useState } from "react";
import { groupMatches } from "../../START/app/0GroupMatches";
import { flagsMond } from "../../START/app/main";
import GridRankPage from "../2bGroupRank/1gridRank";
import Quadrato from "../3tableComp/1quad";

function toCode3(team) {
  const s = String(team?.id ?? team?.name ?? "")
    .trim()
    .toUpperCase();
  if (!s) return "";
  return s.replace(/\s+/g, "").slice(0, 3);
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

  // alias manuali (adatta ai tuoi nomi reali in flagsMond)
  map.set(norm("SAfrica"), "Sudafrica");
  map.set(norm("Play"), ""); // placeholder: niente bandiera

  return (rawName) => map.get(norm(rawName)) ?? String(rawName).trim();
}

function getFlatMatchesForGroup(groupObj) {
  if (!groupObj) return [];
  const giornate = Object.values(groupObj);

  const out = [];
  for (const g of giornate) {
    const day = g?.dates?.[0] ?? "";
    for (const m of g?.matches ?? []) {
      out.push({
        day,
        city: m.city ?? "",
        team1: m.team1 ?? "",
        team2: m.team2 ?? "",
        pron: String(m.pron ?? "")
          .trim()
          .toUpperCase(), // "1" | "X" | "2" | ""
        result: String(m.results ?? "").trim(), // "2-0" | ""
      });
    }
  }
  return out;
}

function city3(city) {
  const s = String(city ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^\p{L}]/gu, "");
  if (!s) return "";
  return s.slice(0, 3);
}

function dayOnly(day) {
  const s = String(day ?? "").trim();
  if (!s) return "";
  // prende tutto dopo l’ultimo /
  const parts = s.split("/");
  return parts[parts.length - 1];
}
function splitDayDesk(day) {
  const s = String(day ?? "")
    .replaceAll("/", " ")
    .trim();
  if (!s) return { label: "", num: "" };

  const parts = s.split(/\s+/);
  const label = parts[0] ?? "";
  const num = parts.slice(1).join(" ");

  return { label, num };
}
// --------------------------------------------------------------------------
export default function GridMatchesPage() {
  const STORAGE_KEY = "gridMatches_showPronostics";

  const [showPronostics, setShowPronostics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [hoverGroup, setHoverGroup] = useState(null); // "A".."L" oppure null
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0, side: "right" });
  const [hoverCutoff, setHoverCutoff] = useState(null); // numero match da considerare (2,4,6)

  const hideTimerRef = useRef(null);

  const gridColsDesktop = "70px 60px 30px 45px 40px 45px 30px";
  const gridColsMobile = "10px 20px 1px 35px 30px 35px 1px";

  const [gridCols, setGridCols] = useState(gridColsMobile);
  const groups = "ABCDEFGHIJKL".split("");
  // DESKTOP: come ora
  const LEFT_SIDE_GROUPS = new Set(["D", "H", "L"]); // :contentReference[oaicite:1]{index=1}

  // MOBILE: nuova regola
  const LEFT_SIDE_GROUPS_MOBILE = new Set(["C", "F", "I", "L"]);
  const CENTRAL_GROUPS_MOBILE = new Set(["B", "E", "H", "K"]);

  const [mobileRankOpen, setMobileRankOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null); // "A".."L"
  const [mobileCutoff, setMobileCutoff] = useState(null); // 2/4/6
  const [mobileSide, setMobileSide] = useState("right"); // "left" | "right"
  const [mobileTop, setMobileTop] = useState(0);

  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[18rem]";

  const GROUP_WIDTH_MOBILE = "w-[9.5rem]";
  const GROUP_HEIGHT_MOBILE = "h-[11.5rem]";

  const headerHDesktop = "1rem";
  const rowHDesktop = 45;

  const headerHMobile = "1rem";
  const rowHMobile = 28;

  const [rowH, setRowH] = useState(rowHMobile);
  const [headerH, setHeaderH] = useState(headerHMobile);

  // 7 colonne: DATA | CITTÀ | SQ1 | F1 | RIS | F2 | SQ2

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
      // ignore
    }
  }, [showPronostics]);

  // FIX D/H/L: calcolo left/top clampati in viewport (niente offset hardcoded)
  const BOX_W = 23 * 16; // w-[23rem]
  const GAP_RIGHT = -30; // gruppi A–C, E–G, I–K
  const GAP_LEFT = -30; // gruppi D / H / L

  const desiredLeft =
    hoverPos.side === "right"
      ? hoverPos.x + GAP_RIGHT
      : hoverPos.x - BOX_W - GAP_LEFT;
  const left = Math.max(
    8,
    Math.min(desiredLeft, window.innerWidth - BOX_W - 8)
  );
  const top = Math.max(8, Math.min(hoverPos.y, window.innerHeight - 8));

  return (
    <section
      aria-labelledby="wc-matches-title"
      className="min-h-screen pl-1 pr-12 md:px-4 md:pt-16 pt-2 overflow-x-auto"
    >
      {/* Titolo SEO/accessibilità (non cambia UI) */}
      <h1 id="wc-matches-title" className="sr-only">
        WC – Match schedule and results by group (A–L)
      </h1>

      {/* Testo descrittivo indicizzabile (facoltativo ma utile) */}
      <p className="sr-only">
        Interactive grid showing match day, host city, teams, flags and results.
        Toggle pronostics to highlight predictions when results are not
        available.
      </p>

      <div className="relative flex justify-center items-start min-w-max">
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
            md:-top-5 top-[18.5rem]
            md:right-[44rem] -right-10 
            md:py-0 py-2
            md:px-1 px-2
            rounded-full font-extrabold text-sm 
            transition-all duration-300 
            bg-slate-900 text-white sky-900 `}
        >
          {/* md:z-0 z-[999] */}
          {showPronostics ? "," : "."}
        </button>

        {/* Contenitore della “tabella” */}
        <div
          className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full md:w-max"
          role="region"
          aria-label="World Cup groups match grid"
        >
          {groups.map((letter) => {
            const resolveName = buildNameResolver(flagsMond);

            const groupKey = `group_${letter}`;
            const matchesFlat = getFlatMatchesForGroup(
              groupMatches?.[groupKey]
            );
            const rowsCount = matchesFlat.length;

            const findTeam = (rawName) => {
              const name = resolveName(rawName);
              if (!name) return null;
              return (
                (flagsMond ?? []).find((t) => resolveName(t.name) === name) ??
                null
              );
            };

            return (
              <section
                key={letter}
                aria-labelledby={`group-${letter}-title`}
                className={` group-card relative
                  ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                  ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}
                  bg-red-900 border border-red-900 flex flex-col
                  md:rounded-tl-[48px]  rounded-tl-[28px] md:rounded-bl-[48px] rounded-bl-[28px]
                  overflow-hidden
                `}
              >
                {/* Titolo gruppo (non cambia UI) */}
                <h2 id={`group-${letter}-title`} className="sr-only">
                  Group {letter} – Matches and results
                </h2>

                <div className="flex-1 flex items-stretch">
                  {/* LETTERA (decorativa) */}
                  <div
                    className="w-8 md:w-10 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-gray-400 font-extrabold text-xl md:text-3xl">
                      {letter}
                    </span>
                  </div>

                  {/* GRIGLIA */}
                  <div className="flex-1 flex justify-end bg-slate-400">
                    <div
                      className="grid w-max h-full bg-slate-400"
                      role="table"
                      aria-label={`Group ${letter} match table`}
                      style={{
                        gridTemplateRows: `${headerH} repeat(${rowsCount}, ${rowH}px)`,
                        gridTemplateColumns: gridCols,
                      }}
                    >
                      <Header7 />

                      {Array.from({ length: rowsCount }).map((_, row) => {
                        const m = matchesFlat[row] ?? null;
                        const t1 = m ? findTeam(m.team1) : null;
                        const t2 = m ? findTeam(m.team2) : null;

                        const res = (m?.result ?? "").trim();
                        const pron = (m?.pron ?? "").trim().toUpperCase();
                        const hasResult = res !== "" && res.includes("-");

                        let highlightType1 = "none";
                        let highlightType2 = "none";

                        if (hasResult) {
                          const [a, b] = res
                            .split("-")
                            .map((n) => Number(n.trim()));
                          const valid =
                            Number.isFinite(a) && Number.isFinite(b);

                          if (valid) {
                            if (a === b) {
                              // pareggio -> entrambi verdi
                              highlightType1 = "draw";
                              highlightType2 = "draw";
                            } else if (a > b) {
                              // vince team1 -> sky
                              highlightType1 = "win";
                            } else {
                              // vince team2 -> sky
                              highlightType2 = "win";
                            }
                          }
                        } else if (showPronostics) {
                          // NESSUN RISULTATO → PRONOSTICO (solo se attivo)
                          if (pron === "X") {
                            highlightType1 = "pron-draw";
                            highlightType2 = "pron-draw";
                          } else {
                            if (pron === "1") highlightType1 = "pron";
                            if (pron === "2") highlightType2 = "pron";
                          }
                        }

                        // linea bassa più spessa sulle righe 2 e 4 (0-based: 1 e 3)
                        const redBottom = row === 1 || row === 3;

                        return (
                          <Row7
                            key={`${letter}-${row}`}
                            rowIndex={row}
                            groupLetter={letter}
                            setHoverGroup={setHoverGroup}
                            hideTimerRef={hideTimerRef}
                            setHoverPos={setHoverPos}
                            setHoverCutoff={setHoverCutoff}
                            LEFT_SIDE_GROUPS={LEFT_SIDE_GROUPS}
                            //------------------------------
                            setMobileRankOpen={setMobileRankOpen}
                            setMobileGroup={setMobileGroup}
                            setMobileCutoff={setMobileCutoff}
                            setMobileSide={setMobileSide}
                            setMobileTop={setMobileTop}
                            LEFT_SIDE_GROUPS_MOBILE={LEFT_SIDE_GROUPS_MOBILE}
                            //------------------------------
                            bottomBorder={redBottom}
                            day={m?.day ?? ""}
                            city={m?.city ?? ""}
                            team1={toCode3(t1)}
                            team2={toCode3(t2)}
                            result={hasResult ? res : ""}
                            flag1={
                              <Quadrato
                                teamName={t1?.name ?? ""}
                                flag={t1?.flag ?? null}
                                phase="round32"
                                advanced={false}
                                label={null}
                                highlightType={highlightType1} // "none" | "pron" | "draw"
                              />
                            }
                            flag2={
                              <Quadrato
                                teamName={t2?.name ?? ""}
                                flag={t2?.flag ?? null}
                                phase="round32"
                                advanced={false}
                                label={null}
                                highlightType={highlightType2} // "none" | "pron" | "draw"
                              />
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
        {/* ===== MOBILE DRAWER RANKING (MOBILE ONLY) ===== */}
        {mobileRankOpen && mobileGroup && (
          <>
            {/* BACKDROP — mobile only */}
            <div
              className="md:hidden fixed inset-0 z-[9998] bg-black/40"
              onClick={() => {
                setMobileRankOpen(false);
                setMobileGroup(null);
                setMobileCutoff(null);
              }}
            />

            {/* DRAWER — DEBUG VISIVO (solo mobile) */}
            <div
              className={`
    md:hidden fixed z-[9999]
    md:w-0 w-[40vw]
    max-h-[80vh] overflow-auto
    rounded-2xl
    bg-purple-400
    p-2
    ${
      mobileSide === "left"
        ? CENTRAL_GROUPS_MOBILE.has(mobileGroup)
          ? "left-[3rem] -translate-x-[3rem]"
          : "left-[3rem]"
        : "right-[6rem]"
    }
  `}
              style={{ top: mobileTop }}
              onClick={(e) => e.stopPropagation()}
            >
              <GridRankPage onlyGroup={mobileGroup} maxMatches={mobileCutoff} />
            </div>
          </>
        )}

        {/* ===== OVERLAY RANKING + BACKDROP (DESKTOP ONLY) ===== */}
        {hoverGroup && (
          <>
            {/* BACKDROP SCURO (solo visivo) */}
            <div
              className="
    hidden md:block
    fixed inset-0
    z-[9998]
    bg-black/50
    pointer-events-none
  "
            />

            {/* BOX CLASSIFICA */}
            <div
              className="hidden md:block fixed z-[9999] p-2 rounded-2xl bg-white/95 shadow-2xl w-[23rem]"
              style={{ top: `${top}px`, left: `${left}px` }}
              onMouseEnter={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              }}
              onMouseLeave={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout(() => {
                  setHoverGroup(null);
                  setHoverCutoff(null);
                }, 0);
              }}
            >
              <GridRankPage onlyGroup={hoverGroup} maxMatches={hoverCutoff} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Header7() {
  const headers = [
    { mobile: "D ", desktop: "DATA" },
    { mobile: "CIT ", desktop: "CITTA'" },
    { mobile: "SQ1", desktop: "SQUADRA 1" },
    "",
    "RIS",
    "",
    { mobile: "SQ2", desktop: "SQUADRA 2" },
  ];

  return (
    <>
      {headers.map((h, idx) => {
        if (h === "") return null;

        const isSquadra =
          typeof h === "object" && (h.mobile === "SQ1" || h.mobile === "SQ2");

        return (
          <div
            key={`h-${idx}`}
            className="bg-red-900 border border-red-900 flex items-center justify-center text-[9px] font-extrabold text-gray-400"
            style={{ gridColumn: `span ${isSquadra ? 2 : 1}` }}
          >
            {typeof h === "string" ? (
              h
            ) : (
              <>
                {/* MOBILE */}
                <span className="block md:hidden">{h.mobile}</span>
                {/* DESKTOP */}
                <span className="hidden md:block">{h.desktop}</span>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

function Row7({
  rowIndex,
  groupLetter,
  setHoverGroup,
  setHoverPos,
  setHoverCutoff,
  hideTimerRef,
  LEFT_SIDE_GROUPS,
  //-----
  setMobileRankOpen,
  setMobileGroup,
  setMobileCutoff,
  setMobileSide,
  setMobileTop,
  LEFT_SIDE_GROUPS_MOBILE,
  //-----
  day,
  city,
  team1,
  team2,
  flag1,
  flag2,
  result,
  bottomBorder = false,
}) {
  const bottom = bottomBorder ? "border-b-4 border-b-gray-700" : "border-b";
  const common = `border-t border-l border-r ${bottom}`;

  return (
    <>
      {/* DATA */}
      <div
        className={`${common} relative border-slate-900 bg-slate-900 text-gray-500 flex items-center justify-center`}
      >
        {/* MOBILE */}
        <span className="block md:hidden text-[8px] leading-none font-bold">
          {dayOnly(day) || "\u00A0"}
        </span>

        {/* DESKTOP */}
        <span className="hidden md:flex items-center gap-1 font-bold leading-none">
          {(() => {
            const { label, num } = splitDayDesk(day);
            return (
              <>
                <span className="text-[7px] tracking-wide">{label}</span>
                <span className="text-[11px]">{num}</span>
              </>
            );
          })()}
        </span>

        {/* 🔘 BOTTONE ogni 2 incontri (2°, 4°, 6°) */}
        {(rowIndex + 1) % 2 === 0 && (
          <div
            onMouseEnter={(e) => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

              const groupEl = e.currentTarget.closest(".group-card");
              const rect =
                groupEl?.getBoundingClientRect?.() ??
                e.currentTarget.getBoundingClientRect();
              const leftSide = LEFT_SIDE_GROUPS.has(groupLetter);

              setHoverPos({
                side: leftSide ? "left" : "right",
                x: leftSide ? rect.left : rect.right,
                y: rect.top,
              });

              setHoverGroup(groupLetter);
              setHoverCutoff(rowIndex + 1); // rowIndex è 0-based → sulle righe 1/3/5 diventa 2/4/6
            }}
            onMouseLeave={() => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              hideTimerRef.current = setTimeout(() => {
                setHoverGroup(null);
                setHoverCutoff(null);
              }, 0);
            }}
            className="
              absolute
              md:-top-12 -top-7
              md:left-0 left-0
              
              md:w-4 w-3
              md:h-24 h-14
              md:bg-slate-700 bg-transparent
              md:z-0 z-10

              md:border-none borde border-whit

              flex items-center justify-center
              text-[12px] leading-none
              pointer-events-auto
              "
            aria-label="show ranking"
            onClick={(e) => {
              if (window.matchMedia("(min-width: 768px)").matches) return;

              const groupEl = e.currentTarget.closest(".group-card");
              const rect =
                groupEl?.getBoundingClientRect?.() ??
                e.currentTarget.getBoundingClientRect();
              const top = rect.top; // posizione assoluta pagina

              const isLeft =
                LEFT_SIDE_GROUPS_MOBILE.has(groupLetter) ||
                CENTRAL_GROUPS_MOBILE.has(groupLetter);
              const side = isLeft ? "left" : "right";
              

              setMobileSide(side);
              setMobileGroup(groupLetter);
              setMobileCutoff(rowIndex + 1);
              setMobileTop(top);

              setMobileRankOpen(true);
            }}
          >
            📊
          </div>
        )}
      </div>

      {/* CITTÀ */}
      <div
        className={`${common} border-slate-900  bg-slate-900 text-gray-500 flex items-center justify-start`}
      >
        {/* MOBILE → 3 lettere */}
        <span className="block md:hidden text-[8px] leading-none font-bold">
          {city3(city) || "\u00A0"}
        </span>

        {/* DESKTOP → nome completo */}
        <span className="hidden md:block text-[9px] font-bold">
          {city || "\u00A0"}
        </span>
      </div>

      {/* SQUADRA 1 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 text-white flex items-center justify-center`}
      >
        <span className="hidden md:block text-[10px] font-bold">
          {team1 || "\u00A0"}
        </span>
      </div>

      {/* FLAG 1 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 flex items-center justify-center`}
      >
        <div className="scale-[0.45] md:scale-[0.65] origin-center">
          {flag1 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* RIS */}
      <div
        className={`${common} border-slate-400 bg-slate-400 text-black flex items-center justify-center`}
      >
        <span className="md:text-[15px] text-[12px] font-extrabold">
          {result || "\u00A0"}
        </span>
      </div>

      {/* FLAG 2 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 flex items-center justify-center`}
      >
        <div className="scale-[0.45] md:scale-[0.65] origin-center">
          {flag2 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* SQUADRA 2 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 text-white flex items-center justify-center`}
      >
        <span className="hidden md:block text-[10px] font-bold">
          {team2 || "\u00A0"}
        </span>
      </div>
    </>
  );
}
