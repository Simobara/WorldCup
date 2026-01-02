import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditToggle from "../../AdminEditToggle";
import EditableText from "../../EditableText";
import { groupMatches } from "../../START/app/0GroupMatches";

import { createNotesRepo } from "../../notesRepo";
import { flagsMond } from "../../START/app/main";
import { CssMatchGrid } from "../../START/styles/0CssGsTs";
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
  map.set(norm("P"), ""); // placeholder: niente bandiera

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
        results: String(m.results ?? "").trim(),
        ris: String(m.ris ?? "").trim(),
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

// helper: set deep da path tipo "A.day1.items"
function setDeep(obj, path, value) {
  const parts = path.split(".");
  const out = structuredClone(obj);
  let cur = out;

  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur[k] = cur[k] ?? {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return out;
}
// --------------------------------------------------------------------------
export default function GridMatchesPage() {
  const NOTES_SOURCE = import.meta.env.VITE_NOTES_SOURCE ?? "remote";
  const repo = useMemo(() => createNotesRepo(NOTES_SOURCE), [NOTES_SOURCE]);
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
  const [hoverModal, setHoverModal] = useState(null);

  // ✅ dati note (editabili e salvabili)
  const [notes, setNotes] = useState({});

  // ✅ stato apertura modale note mobile
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false);
  const [mobileNotesGroup, setMobileNotesGroup] = useState(null); // "A".."L"
  // const [mobileNotesTop, setMobileNotesTop] = useState(0);
  // const [mobileNotesSide, setMobileNotesSide] = useState("right");

  const hideTimerRef = useRef(null);

  const gridColsDesktop = "90px 40px 30px 45px 40px 45px 30px";
  const gridColsMobile = "10px 20px 1px 35px 30px 35px 1px";

  const [gridCols, setGridCols] = useState(gridColsMobile);
  const groups = "ABCDEFGHIJKL".split("");

  const isDesktopNow =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  const [localEdits, setLocalEdits] = useState({});

  const handleEditChange = (path, value) => {
    setLocalEdits((prev) => ({
      ...prev,
      [path]: value,
    }));
    setNotes((prev) => setDeep(prev, path, value));
  };

  // ✅ salva tutte le modifiche quando esci da EDIT
  async function saveAllEdits() {
    const paths = Object.keys(localEdits);
    if (!paths.length) return;

    // keys = lettere A..L dai path tipo "A.day1.items"
    const keysTouched = new Set(paths.map((p) => p.split(".")[0]));

    await repo.save({ notes, keysTouched });

    setLocalEdits({});
  }

  // DESKTOP: come ora
  const LEFT_SIDE_GROUPS = new Set(["D", "H", "L"]); // :contentReference[oaicite:1]{index=1}

  // MOBILE: nuova regola
  const LEFT_SIDE_GROUPS_MOBILE = new Set(["C", "F", "I", "L"]);
  const CENTRAL_GROUPS_MOBILE = new Set(["B", "E", "H", "K"]);
  const SHIFT_RIGHT_MOBILE_GROUPS = new Set(["A", "D", "G", "J"]);

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
    (async () => {
      const loaded = await repo.load();
      setNotes(loaded);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (!showPronostics) {
      setHoverModal(null);
    }
  }, [showPronostics]);

  // FIX D/H/L: calcolo left/top clampati in viewport (niente offset hardcoded)
  const BOX_W = 23 * 16; // w-[23rem]
  const GAP_RIGHT = 0; // gruppi A–C, E–G, I–K
  const GAP_LEFT = 0; // gruppi D / H / L

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

        {/* Contenitore della “tabella” */}
        <div
          className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full md:w-max"
          role="region"
          aria-label="World Cup groups match grid"
        >
          {groups.map((letter) => {
            const groupData = notes?.[letter];
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
                className={`group-card relative
                ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}

                ${
                  // MOBILE: gruppo selezionato sopra il backdrop
                  mobileRankOpen && mobileGroup === letter ? "z-[10000]" : "z-0"
                }

                ${
                  // DESKTOP: SOLO il gruppo hoverato sopra il backdrop (così non si scurisce)
                  hoverGroup === letter ? "md:z-[10000]" : "md:z-0"
                }

                 ${CssMatchGrid.HeadBg}
                border ${CssMatchGrid.HeadBorder} flex flex-col
                md:rounded-tl-[48px] rounded-tl-[28px] md:rounded-bl-[48px] rounded-bl-[28px]
                overflow-hidden
              `}
              >
                {/* Titolo gruppo (non cambia UI) */}
                <h2 id={`group-${letter}-title`} className="sr-only">
                  Group {letter} – Matches and results
                </h2>

                <div className="flex-1 flex items-stretch">
                  {/* LETTERA + MESSAGE */}
                  <div className="relative w-8 md:w-10 flex items-center justify-center">
                    {/* bottone messaggio SOLO se showPronostics */}
                    {showPronostics && (
                      <div
                        className="flex"
                        onMouseEnter={() => {
                          if (!isDesktopNow) return;
                          setHoverModal(letter);
                        }}
                        onMouseLeave={() => {
                          if (!isDesktopNow) return;
                          setHoverModal(null);
                        }}
                        onClick={(e) => {
                          if (isDesktopNow) return;

                          e.stopPropagation();

                          setMobileRankOpen(false);
                          setMobileGroup(null);
                          setMobileCutoff(null);

                          const groupEl =
                            e.currentTarget.closest(".group-card");
                          const rect = groupEl.getBoundingClientRect();

                          const isLeft =
                            LEFT_SIDE_GROUPS_MOBILE.has(letter) ||
                            CENTRAL_GROUPS_MOBILE.has(letter);

                          setMobileNotesGroup(letter);
                          // setMobileNotesTop(rect.top);
                          // setMobileNotesSide(isLeft ? "left" : "right");
                          setMobileNotesOpen(true);
                        }}
                      >
                        <div
                          className="
                            absolute md:top-24 top-14 left-1/2 -translate-x-1/2
                            w-7 h-7 md:w-8 md:h-8
                            rounded-full
                            bg-slate-900 text-sky-300
                            flex items-center justify-center
                            text-[14px] md:text-[16px]
                            cursor-pointer
                            z-[12000] pointer-events-auto
                            hover:bg-slate-800
                            transition
                            shadow-lg
                          "
                        >
                          💬
                        </div>
                      </div>
                    )}
                    {/* ===== MOBILE NOTES MODAL ===== */}
                    {mobileNotesOpen && mobileNotesGroup && (
                      <>
                        {/* BACKDROP */}
                        <div
                          className="md:hidden fixed inset-0 z-[9998] bg-black/60"
                          onClick={() => {
                            setMobileNotesOpen(false);
                            setMobileNotesGroup(null);
                          }}
                        />

                        {/* MODALE */}
                        <div
                          className="
                            md:hidden fixed z-[10001]
                            top-4 left-1/2 -translate-x-1/2
                            w-[86vw] max-w-[20rem]
                            max-h-[80vh] overflow-auto
                            rounded-2xl
                            bg-slate-900 text-white
                            shadow-2xl
                            p-0 md:
                          "
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* CONTENUTO NOTE */}
                          {(() => {
                            const data = notes?.[mobileNotesGroup];
                            if (!data) return null;

                            return (
                              <div className="space-y-3 text-sm">
                                <div className="font-extrabold text-center">
                                  Gruppo {mobileNotesGroup}
                                </div>
                                {[data.day1, data.day2, data.day3].map(
                                  (day, i) =>
                                    day && (
                                      <div key={i}>
                                        <div className="font-bold text-red-500">
                                          {Array.isArray(day.title)
                                            ? day.title[0]
                                            : day.title}
                                        </div>
                                        <div className="pl-2">
                                          <EditableText
                                            path={`${mobileNotesGroup}.day${i + 1}.items`}
                                            value={day.items}
                                            onChange={handleEditChange}
                                          />
                                        </div>
                                      </div>
                                    )
                                )}

                                {data.notes && (
                                  <div>
                                    <div className="font-bold text-red-500">
                                      {data.notes.title}
                                    </div>
                                    <div className="mt-0">
                                      {data.notes.text}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="mt-4 flex justify-end border-t border-white/10 pt-3">
                            <AdminEditToggle onExit={saveAllEdits} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Lettera */}
                    <span className="mt-0 text-gray-400 font-extrabold text-xl md:text-3xl leading-none">
                      {letter}
                    </span>

                    {/* MODALE LOCALE: SOLO di quel gruppo */}
                    {hoverModal === letter && (
                      <div
                        className="
                        hidden md:block
                        absolute top-4 left-8 z-[10000]
                        w-[20rem]
                        
                        min-h-[17rem]        /* ⬅️ altezza base fissa */
                        max-h-[20vh]         /* ⬅️ può crescere fino a qui */
                        overflow-y-auto
                        overflow-x-hidden

                  rounded-2xl
                        bg-slate-900 text-white
                        shadow-2xl
                        p-0
                        border border-white overscroll-contain
                      "
                        onMouseEnter={() => setHoverModal(letter)}
                        onMouseLeave={() => setHoverModal(null)}
                      >
                        {/* <div className="flex items-center justify-between">
                          <div className="font-extrabold text-slate-900">
                           Gruppo {letter}
                          </div>
                        </div> */}

                        {/* ✅ CONTENUTO AGGANCIATO A groupNotes */}
                        <div className="mt-0 space-y-0 text-sm text-white">
                          <div>
                            <div className="font-bold text-red-600">
                              {groupData?.day1?.title?.[0]}
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day1.items`}
                                value={groupData?.day1?.items}
                                onChange={handleEditChange}
                                className="pl-2"
                              />
                            </div>
                          </div>
                          {/* Day 2 */}
                          <div>
                            <div className="font-bold text-red-600">
                              {groupData?.day2?.title?.[0]}
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day2.items`}
                                value={groupData?.day2?.items}
                                onChange={handleEditChange}
                                className="pl-2"
                              />
                            </div>
                          </div>

                          {/* Day 3 */}
                          <div>
                            <div className="font-bold text-red-600">
                              {groupData?.day3?.title?.[0]}
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day3.items`}
                                value={groupData?.day3?.items}
                                onChange={handleEditChange}
                                className="pl-2"
                              />
                            </div>
                          </div>

                          {/* Note varie */}
                          <div>
                            <div className="font-bold text-red-600">
                              {groupData?.notes?.title}
                            </div>
                            <div className="mt-0 p-0 rounded-xl">
                              <EditableText
                                path={`${letter}.notes.text`}
                                value={groupData?.notes?.text}
                                onChange={handleEditChange}
                                className=""
                                textareaClassName="min-h-[80px]"
                              />
                            </div>
                          </div>
                          {/* ADMIN EDIT BUTTON */}
                        </div>
                        <AdminEditToggle
                          className=" bottom-3 right-3"
                          onExit={saveAllEdits}
                        />
                      </div>
                    )}
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

                        // ✅ results sempre visibile
                        const official = (m?.results ?? "").trim();
                        const provisional = (m?.ris ?? "").trim();

                        const hasOfficial = official.includes("-");
                        const hasRis = provisional.includes("-");

                        // ✅ res: results > ris (ma ris solo se toggle ON)
                        const res = hasOfficial
                          ? official
                          : showPronostics && hasRis
                            ? provisional
                            : "";

                        // ✅ ris è "provisional" solo quando lo stai mostrando (toggle ON) e non c'è results
                        const isProvisional =
                          !hasOfficial && showPronostics && hasRis;

                        const pron = (m?.pron ?? "").trim().toUpperCase();
                        const hasResult = res !== "";

                        let highlightType1 = "none";
                        let highlightType2 = "none";

                        if (hasResult) {
                          const [a, b] = res
                            .split("-")
                            .map((n) => Number(n.trim()));
                          const valid =
                            Number.isFinite(a) && Number.isFinite(b);

                          if (valid) {
                            const winType = isProvisional
                              ? "win-provisional"
                              : "win";
                            const drawType = isProvisional
                              ? "draw-provisional"
                              : "draw";

                            if (a === b) {
                              highlightType1 = drawType;
                              highlightType2 = drawType;
                            } else if (a > b) {
                              highlightType1 = winType;
                              highlightType2 = "none";
                            } else {
                              highlightType2 = winType;
                              highlightType1 = "none";
                            }
                          }
                        } else if (showPronostics) {
                          // ✅ nessun results e nessun ris mostrato → evidenzia PRON (solo se toggle ON)
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
                            hoverGroup={hoverGroup}
                            hoverPos={hoverPos}
                            hoverCutoff={hoverCutoff}
                            //------------------------------
                            setMobileRankOpen={setMobileRankOpen}
                            setMobileGroup={setMobileGroup}
                            setMobileCutoff={setMobileCutoff}
                            setMobileSide={setMobileSide}
                            setMobileTop={setMobileTop}
                            LEFT_SIDE_GROUPS_MOBILE={LEFT_SIDE_GROUPS_MOBILE}
                            CENTRAL_GROUPS_MOBILE={CENTRAL_GROUPS_MOBILE}
                            mobileRankOpen={mobileRankOpen}
                            mobileGroup={mobileGroup}
                            mobileCutoff={mobileCutoff}
                            setMobileNotesOpen={setMobileNotesOpen}
                            setMobileNotesGroup={setMobileNotesGroup}
                            //------------------------------
                            bottomBorder={redBottom}
                            day={m?.day ?? ""}
                            city={m?.city ?? ""}
                            team1={toCode3(t1)}
                            team2={toCode3(t2)}
                            result={res}
                            isProvisional={isProvisional}
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
              className="md:hidden fixed inset-0 z-[9998] bg-black/60"
              onClick={() => {
                setMobileRankOpen(false);
                setMobileGroup(null);
                setMobileCutoff(null);
              }}
            />

            {/* DRAWER — DEBUG VISIVO (solo mobile) */}
            <div
              className={`
                md:hidden fixed z-[10001]
                md:w-0 w-[40vw]
                max-h-[80vh] overflow-auto
                rounded-2xl
                ${CssMatchGrid.DrawerBg}
                md:m-0 m-1
                ${
                  // md:p-0 p-1
                  mobileSide === "left"
                    ? CENTRAL_GROUPS_MOBILE.has(mobileGroup)
                      ? "left-[0rem]" //container centrale
                      : "left-[1.5rem]" //container destra OKK
                    : SHIFT_RIGHT_MOBILE_GROUPS.has(mobileGroup)
                      ? "right-[4rem]" // più a destra (tweak qui)
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
                bg-slate-900/50
                pointer-events-none
              "
            />

            {/* BOX CLASSIFICA */}
            <div
              className="hidden md:block fixed z-[9999] p-2 rounded-2xl bg-sky-800 shadow-2xl w-[23rem]"
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
    { mobile: "RIS", desktop: "RIS" },
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
            className={`
              relative
              ${CssMatchGrid.HeadBg}
              border ${CssMatchGrid.HeadBorder}
              flex items-center justify-center
              text-[9px] font-extrabold
              ${CssMatchGrid.HeadText}
              z-[100]
            `}
            style={{ gridColumn: `span ${isSquadra ? 2 : 1}` }}
          >
            {typeof h === "string" ? (
              h
            ) : (
              <>
                {/* DESKTOP */}
                <span className="hidden md:block">{h.desktop}</span>
                {/* MOBILE */}
                <span className="block md:hidden">{h.mobile}</span>
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
  hoverGroup,
  hoverPos,
  hoverCutoff,
  //-----
  setMobileRankOpen,
  setMobileGroup,
  setMobileCutoff,
  setMobileSide,
  setMobileTop,
  LEFT_SIDE_GROUPS_MOBILE,
  CENTRAL_GROUPS_MOBILE,
  mobileRankOpen,
  mobileGroup,
  mobileCutoff,
  setMobileNotesOpen,
  setMobileNotesGroup,
  //-----
  day,
  city,
  team1,
  team2,
  flag1,
  flag2,
  bottomBorder = false,
  result,
  isProvisional,
}) {
  const bottom = bottomBorder ? "border-b-4 border-b-gray-700" : "border-b";
  const common = `border-t border-l border-r ${bottom}`;

  // ✅ evidenzia la COPPIA (2 righe) legata al cutoff 2/4/6
  const isActivePair =
    hoverGroup === groupLetter &&
    typeof hoverCutoff === "number" &&
    rowIndex >= hoverCutoff - 2 &&
    rowIndex <= hoverCutoff - 1;

  // ✅ evidenzia SOLO la riga dove sta il bottone (2ª della coppia)
  const isActiveButtonRow =
    hoverGroup === groupLetter && hoverCutoff === rowIndex + 1;

  const isActivePairMobile =
    mobileRankOpen &&
    mobileGroup === groupLetter &&
    typeof mobileCutoff === "number" &&
    rowIndex >= mobileCutoff - 2 &&
    rowIndex <= mobileCutoff - 1;
  // ====================
  // Z-INDEX LOGIC (MOBILE)
  // ====================
  const isAnyMobileOpen = mobileRankOpen;
  const isThisMobileGroupOpen = mobileRankOpen && mobileGroup === groupLetter;
  const isThisMobileButtonOpen =
    isThisMobileGroupOpen && mobileCutoff === rowIndex + 1;

  // DESKTOP: bandiere grigie sempre, tranne nel gruppo hoverato (quello con classifica aperta)
  const flagsGrayOnDesktop = hoverGroup !== groupLetter; // hoverGroup null => true (tutte grigie)

  // MOBILE: bandiere grigie sempre, tranne nel gruppo selezionato
  const flagsGrayOnMobile = !mobileRankOpen || !isThisMobileGroupOpen;

  // (se vuoi anche quando drawer chiuso: puoi usare true fisso, vedi nota sotto)
  const activeDesk = isActivePair
    ? `${CssMatchGrid.ActiveMdBg} ${CssMatchGrid.ActiveMdText}`
    : "";
  const activeMob = isActivePairMobile
    ? `${CssMatchGrid.ActiveMBg} ${CssMatchGrid.ActiveMText}`
    : "";

  return (
    <>
      {/* DATA */}
      <div
        className={`
          ${common} relative
          border-transparent
          ${CssMatchGrid.CellBg} ${CssMatchGrid.CellText}
          flex items-center justify-center
          ${activeDesk}
          ${activeMob}
        `}
      >
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
        {/* MOBILE */}
        <span className="block md:hidden text-[8px] leading-none font-bold">
          {dayOnly(day) || "\u00A0"}
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
            className={`
              absolute
              md:-top-12 -top-7
              md:left-0 left-0

              md:w-6 w-3
              md:h-[6rem] h-14
              ${isActiveButtonRow ? "md:bg-sky-600" : "md:bg-slate-900"}

              md:p-0 p-4

             ${(() => {
               const isLeft = LEFT_SIDE_GROUPS.has(groupLetter); // D/H/L
               const isThisGroupOpen = hoverGroup === groupLetter; // box aperto per quel gruppo

               // PC: nei gruppi D/H/L alza TUTTE le 📊 quando il box è aperto
               if (isLeft && isThisGroupOpen) return "md:z-[10010]";

               // PC: negli altri gruppi alza solo la 📊 specifica hoverata
               return isThisGroupOpen && hoverCutoff === rowIndex + 1
                 ? "md:z-[10010]"
                 : "md:z-0";
             })()}

            ${
              !isAnyMobileOpen
                ? "z-10"
                : isThisMobileGroupOpen
                  ? isThisMobileButtonOpen
                    ? "z-[10000]"
                    : "z-[9999]"
                  : "z-10"
            }
        

              md:border-none bordr border-whit

              flex items-center justify-center
              text-[12px] leading-none
              pointer-events-auto
            `}
            aria-label="show ranking"
            onClick={(e) => {
              if (window.matchMedia("(min-width: 768px)").matches) return;

              e.stopPropagation(); // IMPORTANTISSIMO: evita che il backdrop chiuda nello stesso tap

              // ✅ CHIUDI LE NOTE SE APERTE (mobile)
              setMobileNotesOpen(false);
              setMobileNotesGroup(null);

              const groupEl = e.currentTarget.closest(".group-card");
              const rect =
                groupEl?.getBoundingClientRect?.() ??
                e.currentTarget.getBoundingClientRect();

              const top = rect.top;

              const isLeft =
                LEFT_SIDE_GROUPS_MOBILE.has(groupLetter) ||
                CENTRAL_GROUPS_MOBILE.has(groupLetter);

              const next = {
                group: groupLetter,
                cutoff: rowIndex + 1,
                side: isLeft ? "left" : "right",
                top,
              };

              // Se sto cliccando ESATTAMENTE la stessa classifica già aperta → chiudi
              // Se clicco un'altra classifica → aggiorna e resta aperto (chiude+riapre “logicamente”)
              setMobileRankOpen((open) => {
                const same =
                  open &&
                  mobileGroup === next.group &&
                  mobileCutoff === next.cutoff;

                if (same) {
                  setMobileGroup(null);
                  setMobileCutoff(null);
                  return false;
                }

                setMobileSide(next.side);
                setMobileGroup(next.group);
                setMobileCutoff(next.cutoff);
                setMobileTop(next.top);
                return true;
              });
            }}
          >
            📊
          </div>
        )}
      </div>

      {/* CITTÀ */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.CellBg} ${CssMatchGrid.CellText}
          flex items-center justify-start
          ${activeDesk}
          ${activeMob}
        `}
      >
        {/* DESKTOP → nome completo */}
        <span className="hidden md:block text-[9px] font-bold">
          {city || "\u00A0"}
        </span>
        {/* MOBILE → 3 lettere */}
        <span className="block md:hidden text-[8px] leading-none font-bold">
          {city3(city) || "\u00A0"}
        </span>
      </div>

      {/* SQUADRA 1 */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.CellBg} ${CssMatchGrid.CellText}
          flex items-center justify-start
          ${activeDesk}
          ${activeMob}
        `}
      >
        <span
          className={`hidden md:block text-[9px] font-bold ${CssMatchGrid.CellSqText} pl-2`}
        >
          {team1 || "\u00A0"}
        </span>
      </div>
      {/* FLAG 1 */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.CellBg}
          flex items-center justify-center
          ${activeDesk}
          ${activeMob}
        `}
      >
        <div
          className={`
          scale-[0.45] md:scale-[0.65] origin-center
          ${
            // DESKTOP
            flagsGrayOnDesktop
              ? "md:[&_img]:grayscale md:[&_svg]:grayscale"
              : "md:[&_img]:grayscale-0 md:[&_svg]:grayscale-0"
          }
          ${
            // MOBILE
            flagsGrayOnMobile
              ? "[&_img]:grayscale [&_svg]:grayscale"
              : "[&_img]:grayscale-0 [&_svg]:grayscale-0"
          }
        `}
        >
          {flag1 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* RIS */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.RisBg} ${CssMatchGrid.RisText}
          flex items-center justify-center
          ${activeDesk}
          ${activeMob}
        `}
      >
        <span
          className={`md:text-[15px] text-[12px] font-extrabold ${
            isProvisional ? "text-purple-300/40" : ""
          }`}
        >
          {result || "\u00A0"}
        </span>
      </div>

      {/* FLAG 2 */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.CellBg}
          flex items-center justify-center
          ${activeDesk}
          ${activeMob}
        `}
      >
        <div
          className={`
          scale-[0.45] md:scale-[0.65] origin-center
           ${
             // DESKTOP
             flagsGrayOnDesktop
               ? "md:[&_img]:grayscale md:[&_svg]:grayscale"
               : "md:[&_img]:grayscale-0 md:[&_svg]:grayscale-0"
           }
          ${
            // MOBILE
            flagsGrayOnMobile
              ? "[&_img]:grayscale [&_svg]:grayscale"
              : "[&_img]:grayscale-0 [&_svg]:grayscale-0"
          }
        `}
        >
          {flag2 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* SQUADRA 2 */}
      <div
        className={`
          ${common}
          border-transparent
          ${CssMatchGrid.CellBg} ${CssMatchGrid.CellText}
          flex items-center justify-start
          ${activeDesk}
          ${activeMob}
        `}
      >
        <span className="hidden md:block text-[10px] font-bold text-white pr-2">
          {team2 || "\u00A0"}
        </span>
      </div>
    </>
  );
}
