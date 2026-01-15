import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AdminEditToggle from "../../Editor/AdminEditToggle";
import EditableText from "../../Editor/EditableText";
import { createMatchesRepo } from "../../Services/repo/repoMatch";
import { loadMatchStructureFromDb } from "../../Services/repo/repoMatchStructure";

import { createNotesRepo } from "../../Services/repo/repoNote";
import { useAuth } from "../../Services/supabase/AuthProvider";
import {
  ADMIN_EMAIL,
  DATA_SOURCE,
  DelSymbol,
  flagsMond,
  PinSymbol,
} from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import { CssGroupLetter, CssMatchGrid } from "../../START/styles/0CssGsTs";
import GridRankPage from "../2bGroupRank/1gridRank";
import Quadrato from "../3tableComp/1quad";
//zExternal
import EditableScore from "../../Editor/EditableScore.jsx";
import { useEditMode } from "../../Providers/EditModeProvider";
import { buildNameResolver } from "./zExternal/buildNameResolver";
import { city3 } from "./zExternal/city3";
import { dayOnly } from "./zExternal/dayOnly";
import { getFlatMatchesForGroup } from "./zExternal/getFlatMatchesForGroup";
import { setDeep } from "./zExternal/setDeep";
import { splitDayDesk } from "./zExternal/splitDayDesk";
import { toCode3 } from "./zExternal/toCode3";

export default function GridMatchesPage({ isLogged }) {
  const { user } = useAuth();
  const { editMode, setEditMode } = useEditMode();

  const NOTES_SOURCE = import.meta.env.VITE_NOTES_SOURCE ?? DATA_SOURCE;
  const MATCHES_SOURCE = import.meta.env.VITE_MATCHES_SOURCE ?? DATA_SOURCE;

  const repo = useMemo(
    () =>
      createNotesRepo(NOTES_SOURCE, {
        userId: user?.id,
        userEmail: user?.email, // ⬅️ QUESTO
      }),
    [NOTES_SOURCE, user?.id, user?.email]
  );

  const matchesRepo = useMemo(
    () =>
      createMatchesRepo(MATCHES_SOURCE, {
        userId: user?.id,
        userEmail: user?.email,
      }),
    [MATCHES_SOURCE, user?.id, user?.email]
  );

  const STORAGE_KEY = "gridMatches_showPronostics";
  // ✅ struttura “flat” che arriva da Supabase (wc_match_structure)
  const [structureByGroup, setStructureByGroup] = useState(null);
  const [structureLoading, setStructureLoading] = useState(true);
  const [showPronostics, setShowPronostics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  // 7 colonne: ------DATA | CITTÀ | SQ1 | F1 | RIS | F2 | SQ2
  const gridColsDesktop = "80px 50px 30px 45px 40px 45px 30px";
  const gridColsMobile = "10px 20px 1px 35px 30px 35px 1px";
  const groups = "ABCDEFGHIJKL".split("");
  // DESKTOP: come ora
  const LEFT_SIDE_GROUPS = new Set(["D", "H", "L"]); // :contentReference[oaicite:1]{index=1}
  // MOBILE: nuova regola
  const LEFT_SIDE_GROUPS_MOBILE = new Set(["C", "F", "I", "L"]);
  const CENTRAL_GROUPS_MOBILE = new Set(["B", "E", "H", "K"]);
  const SHIFT_RIGHT_MOBILE_GROUPS = new Set(["A", "D", "G", "J"]);

  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[286px]";

  const GROUP_WIDTH_MOBILE = "w-[9.5rem]";
  const GROUP_HEIGHT_MOBILE = "h-[11.5rem]";

  const headerHDesktop = "16px";
  const rowHDesktop = 45;

  const headerHMobile = "1rem";
  const rowHMobile = 28;

  const isDesktopNow =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches;

  // FIX D/H/L: calcolo left/top clampati in viewport (niente offset hardcoded)
  const BOX_W = 23 * 16; // w-[23rem]
  const GAP_RIGHT = 0; // gruppi A–C, E–G, I–K
  const GAP_LEFT = 0; // gruppi D / H / L

  const handleEditChange = (path, value) => {
    // tiene traccia dei path editati (serve per save)
    setLocalEdits((prev) => ({
      ...prev,
      [path]: value,
    }));

    // 👉 CASO 1: PLUS RIS (➕) → matchesState
    if (
      path.includes(".plusRis.") ||
      path.includes(".plusPron.") ||
      path.includes(".plusCheck.")
    ) {
      const letter = path.split(".")[0];

      setMatchesState((prev) => {
        let next = setDeep(prev, path, value);

        // ✅ MARCA RIS COME EDITED ANCHE SE VUOTO
        if (path.includes(".plusRis.")) {
          const idx = Number(path.split(".plusRis.")[1]?.split(".")[0]);
          if (Number.isFinite(idx)) {
            next = setDeep(next, `${letter}.plusRisEdited.${idx}`, true);
          }
        }

        return next;
      });

      keysTouchedMatches.current.add(letter);
      return;
    }

    // 👉 CASO 2: TUTTO IL RESTO → notes (come prima)
    const letter = path.split(".")[0];
    setNotes((prev) => setDeep(prev, path, value));
    keysTouched.current.add(letter);
  };

  // ✅ salva tutte le modifiche quando esci da EDIT
  async function saveAllEdits() {
    const paths = Object.keys(localEdits);
    if (!paths.length) return;

    const keysTouchedNotes = new Set(paths.map((p) => p.split(".")[0]));
    await repo.save({ notes, keysTouched: keysTouchedNotes });
    keysTouched.current.clear();

    await matchesRepo.save({
      matches: matchesState,
      keysTouched: keysTouchedMatches.current,
    });
    keysTouchedMatches.current.clear();

    // ✅ RICARICA DAL DB così RIS è sempre allineato
    const freshMatches = await matchesRepo.load({ forceRefresh: true });
    setMatchesState(freshMatches);

    setLocalEdits({});
    lastSavedRef.current = { notes, matches: freshMatches };
  }

  // ✅ METTI QUESTO BLOCCO: dentro GridMatchesPage, subito DOPO saveAllEdits() e PRIMA del return(...)
  const discardEdits = useCallback(() => {
    // chiudi UI aperte
    setHoverPlusModal(null);
    setHoverModal(null);

    setMobileNotesOpen(false);
    setMobileNotesGroup(null);

    setMobilePlusOpen(false);
    setMobilePlusGroup(null);

    setMobileRankOpen(false);
    setMobileGroup(null);
    setMobileCutoff(null);
    // ripristina i dati salvati/caricati
    setNotes(lastSavedRef.current.notes ?? {});
    setMatchesState(lastSavedRef.current.matches ?? {});

    // reset tracking
    setLocalEdits({});
    keysTouched.current.clear();
    keysTouchedMatches.current.clear();
  }, []);

  const [hoverGroup, setHoverGroup] = useState(null); // "A".."L" oppure null
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0, side: "right" });

  const winH = typeof window !== "undefined" ? window.innerHeight : 0;
  const winW = typeof window !== "undefined" ? window.innerWidth : 0;

  const desiredLeft =
    hoverPos.side === "right"
      ? hoverPos.x + GAP_RIGHT
      : hoverPos.x - BOX_W - GAP_LEFT;

  const top = Math.max(8, Math.min(hoverPos.y, winH - 8));
  const left = Math.max(8, Math.min(desiredLeft, winW - BOX_W - 8));

  const [hoverCutoff, setHoverCutoff] = useState(null); // numero match da considerare (2,4,6)
  const [hoverModal, setHoverModal] = useState(null);

  // ✅ dati note (editabili e salvabili)
  const [notes, setNotes] = useState({});

  const [matchesState, setMatchesState] = useState({});
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const keysTouched = useRef(new Set());
  const keysTouchedMatches = useRef(new Set());

  // ✅ stato apertura modale note mobile
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false);
  const [mobileNotesGroup, setMobileNotesGroup] = useState(null);
  const [mobilePlusOpen, setMobilePlusOpen] = useState(false);
  const [mobilePlusGroup, setMobilePlusGroup] = useState(null);

  const [hoverPlusModal, setHoverPlusModal] = useState(null); // "A".."L"
  const [gridCols, setGridCols] = useState(gridColsMobile);
  const [localEdits, setLocalEdits] = useState({});
  const [displayRisByKey, setDisplayRisByKey] = useState({});
  const didHydrateRef = useRef(false);

  const lastSavedRef = useRef({ notes: {}, matches: {} });
  const hideTimerRef = useRef(null);
  const saveAllEditsRef = useRef(null);

  const [mobileRankOpen, setMobileRankOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null); // "A".."L"
  const [mobileCutoff, setMobileCutoff] = useState(null); // 2/4/6
  const [mobileSide, setMobileSide] = useState("right"); // "left" | "right"
  const [mobileTop, setMobileTop] = useState(0);
  const [rowH, setRowH] = useState(rowHMobile);
  const [headerH, setHeaderH] = useState(headerHMobile);
  const [btnPos, setBtnPos] = useState({ top: "", left: "" });

  // =======================
  // MOBILE — NOTE + PLUS UNIFICATI
  // =======================

  // apre ENTRAMBI i modali (NOTE + PLUS)
  const openMobileBoth = useCallback((letter) => {
    // chiudi altre UI mobile
    setMobileRankOpen(false);
    setMobileGroup(null);
    setMobileCutoff(null);

    // assegna lo stesso gruppo a entrambi
    setMobileNotesGroup(letter);
    setMobilePlusGroup(letter);

    // apri entrambi
    setMobileNotesOpen(true);
    setMobilePlusOpen(true);
  }, []);

  // chiude ENTRAMBI i modali
  const closeMobileBoth = useCallback(() => {
    setMobileNotesOpen(false);
    setMobileNotesGroup(null);

    setMobilePlusOpen(false);
    setMobilePlusGroup(null);
    // 👉 se sono in edit (flag verde), salva e torna in grigio
    if (editMode) {
      void saveAllEditsRef.current?.();
      setEditMode(false);
    }
  }, [editMode, setEditMode]);

  //------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const byGroup = await loadMatchStructureFromDb();
        if (!cancelled) {
          setStructureByGroup(byGroup);
        }
      } catch (err) {
        console.error("Errore caricando struttura da DB:", err);
      } finally {
        if (!cancelled) {
          setStructureLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    saveAllEditsRef.current = saveAllEdits;
  }, [saveAllEdits]);

  useEffect(() => {
    return () => {
      if (editMode) {
        void saveAllEditsRef.current?.();
        setEditMode(false);
      }
    };
  }, [editMode, setEditMode]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const loadedNotes = await repo.load();
      const loadedMatches = await matchesRepo.load({ forceRefresh: true });

      if (cancelled) return;

      setNotes(loadedNotes);
      setMatchesState(loadedMatches);
      setMatchesLoaded(true);

      // snapshot per "discard"
      lastSavedRef.current = { notes: loadedNotes, matches: loadedMatches };
    })();

    return () => {
      cancelled = true;
    };
  }, [repo, matchesRepo]);

  useEffect(() => {
    if (!matchesLoaded) return;

    setMatchesState((prev) => {
      let changed = false;
      const next = { ...(prev ?? {}) };

      for (const letter of Object.keys(next)) {
        const obj = next[letter];
        if (!obj) continue;

        const risArr = Array.isArray(obj.plusRis) ? obj.plusRis : [];
        const editedArr = Array.isArray(obj.plusRisEdited)
          ? obj.plusRisEdited
          : [];

        // se manca o lunghezza diversa, ricostruisco
        if (editedArr.length !== risArr.length) {
          obj.plusRisEdited = Array.from(
            { length: risArr.length },
            () => false
          );
          changed = true;
        }

        // forza edited=true se ci sono numeri
        for (let i = 0; i < risArr.length; i++) {
          const a = String(risArr[i]?.a ?? "").trim();
          const b = String(risArr[i]?.b ?? "").trim();
          const hasAny = a !== "" || b !== "";

          if (hasAny && obj.plusRisEdited[i] !== true) {
            obj.plusRisEdited[i] = true;
            changed = true;
          }
        }

        next[letter] = obj;
      }

      return changed ? next : prev;
    });
  }, [matchesLoaded]);

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
      // ignore
    }
  }, [showPronostics]);

  useEffect(() => {
    if (!showPronostics) {
      setHoverModal(null);
    }
  }, [showPronostics]);

  useEffect(() => {
    const onFocus = async () => {
      const fresh = await matchesRepo.load({ forceRefresh: true });
      setMatchesState(fresh);
      lastSavedRef.current = { ...lastSavedRef.current, matches: fresh };
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });

    return () => window.removeEventListener("focus", onFocus);
  }, [matchesRepo]);

  //------------------------------------------------------------------------
  return (
    <section
      aria-labelledby="wc-matches-title"
      className="min-h-screen pl-1 pr-12 md:px-4 md:pt-16 pt-1 overflow-x-auto"
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
        {!isLogged && (
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
            const matchesFlat =
              structureByGroup?.[letter]?.length
                ? structureByGroup[letter]
                : getFlatMatchesForGroup(groupMatches?.[groupKey]);
            const rowsCount = matchesFlat.length;

            const findTeam = (rawName) => {
              const name = resolveName(rawName);
              if (!name) return null;
              return (
                (flagsMond ?? []).find((t) => resolveName(t.name) === name) ??
                null
              );
            };
            // ====== COMPUTE RES: ADMIN / NON-ADMIN ======

            // ADMIN: legge seed (m.ris) se NON edited
            // ADMIN: seed solo la PRIMA volta (quando DB è vuoto)
            const computeResAdmin = (m, letter, idx) => {
              const official = (m?.results ?? "").trim();
              if (official.includes("-")) return official;

              const a = String(
                matchesState?.[letter]?.plusRis?.[idx]?.a ?? ""
              ).trim();
              const b = String(
                matchesState?.[letter]?.plusRis?.[idx]?.b ?? ""
              ).trim();

              const wasEdited = !!matchesState?.[letter]?.plusRisEdited?.[idx];

              if (a !== "" && b !== "") return `${a}-${b}`;
              if (wasEdited) return "";

              // ✅ seed SOLO se non c'è ancora nulla nel DB (prima volta)
              const dbEmpty =
                !matchesLoaded || Object.keys(matchesState ?? {}).length === 0;

              const seed = String(m?.ris ?? "").trim();
              if (showPronostics && dbEmpty && seed.includes("-")) return seed;

              return "";
            };

            // NON-ADMIN:
            // - se c'è results ufficiale → lo mostra sempre
            // - se l'utente ha messo plusRis → mostra quelli
            // - se NON è loggato e toggle pronostici ON → può vedere i seed m.ris
            // - se è loggato (non admin) → NIENTE seed hardcoded, mai
            const computeResUser = (m, letter, idx) => {
              const official = (m?.results ?? "").trim();
              if (official.includes("-")) return official;

              const a = String(
                matchesState?.[letter]?.plusRis?.[idx]?.a ?? ""
              ).trim();
              const b = String(
                matchesState?.[letter]?.plusRis?.[idx]?.b ?? ""
              ).trim();

              if (a !== "" && b !== "") return `${a}-${b}`;

              // 👉 SE È LOGGATO (ma non admin) NON MOSTRA MAI I SEED
              if (isLogged) {
                return "";
              }

              // 👻 SOLO UTENTE NON LOGGATO PUÒ VEDERE I SEED CON PRONOSTICI ON
              const seed = String(m?.ris ?? "").trim();
              if (showPronostics && seed.includes("-")) return seed;

              return "";
            };

            // 🔑 QUESTA È LA RIGA CHIAVE (ANCORA)
            const computeRes =
              user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
                ? computeResAdmin
                : computeResUser;
            {
              {
                /* ================= GROUP CARD (MOBILE + DESKTOP) ================= */
              }
            }
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
                  <div className="relative w-8 md:w-10 flex items-center justify-center p-0 m-0">
                    {/* ================= ICONE AZIONI GRUPPO (MOBILE + DESKTOP) ================= */}
                    {showPronostics && (
                      <div
                        className="
                          absolute
                          md:top-4 top-[3.3rem]
                          left-1/2 -translate-x-1/2
                          flex flex-col items-center gap-1
                          z-[12000]
                          pointer-events-auto
                        "
                      >
                        {/* ➕ — QUESTO MANCAVA */}
                        <div
                          onMouseEnter={() => {
                            if (!isDesktopNow) return;
                            setHoverPlusModal(letter);
                          }}
                          onMouseLeave={() => {
                            if (!isDesktopNow) return;
                            setHoverPlusModal(null);
                          }}
                          onClick={(e) => {
                            if (isDesktopNow) return; // desktop: niente, resta hover
                            e.stopPropagation();
                            openMobileBoth(letter); // ✅ apre NOTE + PLUS insieme
                          }}
                          className={`
                            w-8 h-8
                            md:w-10 md:h-10                            
                            translate-y-2
                            md:text-[20px] text-[15px]
                            rounded- full                            
                            text-white
                            flex items-center justify-center
                            cursor-pointer
                            transition
                             z-[12000]
                            ${hoverPlusModal === letter ? "bg-red-600" : "hover:bg-red-600"}
                          `}
                        >
                          {/* ➕ */}
                          #️⃣
                        </div>
                        {/* 🗨️ — SOLO QUESTO FA HOVER */}
                        <div
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
                            openMobileBoth(letter); // ✅ apre NOTE + PLUS insieme
                          }}
                          className={`
                            md:flex hidden
                            w-8 h-8 
                            md:w-10 md:h-10
                            md:text-[20px] text-[12px]                            
                            text-sky-300
                            items-center justify-center
                            cursor-pointer
                            transition
                            z-[12000]
                            ${hoverModal === letter ? "bg-red-600" : "hover:bg-red-600"}
                          `}
                        >
                          ℹ️
                        </div>
                      </div>
                    )}

                    {/* ================= MOBILE ONLY — OVERLAY UNICO (NOTE + PLUS) ================= */}
                    {mobileNotesOpen &&
                      mobilePlusOpen &&
                      (mobileNotesGroup || mobilePlusGroup) && (
                        <>
                          {/* BACKDROP UNICO */}
                          <div
                            className="md:hidden fixed inset-0 z-[22003] bg-black/80"
                            onClick={closeMobileBoth}
                          />

                          {/* MODALE UNICO RIS/PRON + NOTE */}
                          <div
                            className="
                              md:hidden fixed z-[22003]
                              top-0 left-0
                              w-[86vw] max-w-[22rem]
                              h-[75vh]
                              rounded-2xl
                              bg-slate-900 text-white
                              shadow-2xl
                              p-0
                              !overflow-hidden
                            "
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(() => {
                              const letterP =
                                mobilePlusGroup || mobileNotesGroup;
                              const resolveName = buildNameResolver(flagsMond);

                              const groupKey = `group_${letterP}`;
                              const matchesFlatP =
                                structureByGroup?.[letterP]?.length
                                  ? structureByGroup[letterP]
                                  : getFlatMatchesForGroup(
                                      groupMatches?.[groupKey]
                              );

                              const findTeamP = (rawName) => {
                                const name = resolveName(rawName);
                                if (!name) return null;
                                return (
                                  (flagsMond ?? []).find(
                                    (t) => resolveName(t.name) === name
                                  ) ?? null
                                );
                              };

                              const computeResP = (m, idx) => {
                                const official = (m?.results ?? "").trim();
                                if (official.includes("-")) return official;

                                const a = String(
                                  matchesState?.[letterP]?.plusRis?.[idx]?.a ??
                                    ""
                                ).trim();
                                const b = String(
                                  matchesState?.[letterP]?.plusRis?.[idx]?.b ??
                                    ""
                                ).trim();
                                if (a !== "" && b !== "") return `${a}-${b}`;
                                return "";
                              };

                              const data = notes?.[letterP];

                              return (
                                <div className="relative h-full flex flex-col">
                                  {/* TITOLI */}
                                  <div className="font-extrabold text-center p-2 text-xs">
                                    PRONOSTICI & NOTE - Gruppo {letterP}
                                  </div>

                                  {/* CONTENUTO SCORRIBILE */}
                                  <div className="flex-1 overflow-hidden px-2 pb-16 space-y-4">
                                    {/* --- SEZIONE RIS/PRON --- */}
                                    <div className="pl-4">
                                      <div className="space-y-0 [&_input]:text-xl [&_input]:font-extrabold [&_input]:leading-none [&_input]:text-center">
                                        {matchesFlatP.map((m, idx) => {
                                          const t1 = findTeamP(m.team1);
                                          const t2 = findTeamP(m.team2);
                                          const res = computeResP(m, idx);

                                          // risultati ufficiali sì/no
                                          const isOfficial = (m?.results ?? "")
                                            .trim()
                                            .includes("-");

                                          // pron selezionato per quella partita
                                          const selectedPron = String(
                                            matchesState?.[letterP]?.plusPron?.[
                                              idx
                                            ] ?? ""
                                          )
                                            .trim()
                                            .toUpperCase();

                                          // valori base da mostrare (risultato ufficiale o plusRis)
                                          const [baseA, baseB] = String(
                                            res ?? ""
                                          ).includes("-")
                                            ? String(res)
                                                .split("-")
                                                .map((x) => x.trim())
                                            : ["", ""];

                                          const savedA =
                                            matchesState?.[letterP]?.plusRis?.[
                                              idx
                                            ]?.a;
                                          const savedB =
                                            matchesState?.[letterP]?.plusRis?.[
                                              idx
                                            ]?.b;

                                          const norm = (x) =>
                                            String(x ?? "").trim();
                                          const valueA = norm(savedA);
                                          const valueB = norm(savedB);
                                          const hasAnyScore =
                                            isOfficial ||
                                            valueA !== "" ||
                                            valueB !== "";

                                          // 🎯 LOGICA BORDI (come nel modale desktop)
                                          let highlightModal1 = "none";
                                          let highlightModal2 = "none";

                                          if (res && res.includes("-")) {
                                            const [na, nb] = res
                                              .split("-")
                                              .map((n) =>
                                                Number(String(n).trim())
                                              );

                                            if (
                                              Number.isFinite(na) &&
                                              Number.isFinite(nb)
                                            ) {
                                              const winType = isOfficial
                                                ? "win"
                                                : "win-provisional";
                                              const drawType = isOfficial
                                                ? "draw"
                                                : "draw-provisional";

                                              if (na === nb) {
                                                highlightModal1 = drawType;
                                                highlightModal2 = drawType;
                                              } else if (na > nb) {
                                                highlightModal1 = winType;
                                              } else {
                                                highlightModal2 = winType;
                                              }
                                            }
                                          } else {
                                            // nessun risultato inserito → usa PRON (1 / X / 2)
                                            if (selectedPron === "X") {
                                              highlightModal1 = "pron-draw";
                                              highlightModal2 = "pron-draw";
                                            } else if (selectedPron === "1") {
                                              highlightModal1 = "pron";
                                            } else if (selectedPron === "2") {
                                              highlightModal2 = "pron";
                                            }
                                          }

                                          return (
                                            <React.Fragment
                                              key={`plus-mob-${letterP}-${idx}`}
                                            >
                                              {/* RIGA PARTITA */}
                                              <div
                                                className="
                                                  grid
                                                   grid-cols-[1rem_3rem_2.2rem_3.2rem_2.2rem_0rem]
                                                  items-center justify-center gap-x-1
                                                  text-[12px] leading-none
                                                  h-[2.75rem]
                                                "
                                              >
                                                {/* TEAM 1 SHORT */}
                                                <span className="font-extrabold whitespace-nowrap flex items-center justify-end text-right w-full ml-[0.7rem]">
                                                  {toCode3(t1) || "\u00A0"}
                                                </span>

                                                {/* FLAG 1 */}
                                                <div className="flex items-center justify-center h-full min-h-[2.5rem]">
                                                  <button
                                                    type="button"
                                                    disabled={
                                                      !editMode || hasAnyScore
                                                    }
                                                    onClick={() => {
                                                      if (
                                                        !editMode ||
                                                        hasAnyScore
                                                      )
                                                        return;

                                                      if (
                                                        selectedPron === "1"
                                                      ) {
                                                        handleEditChange(
                                                          `${letterP}.plusPron.${idx}`,
                                                          ""
                                                        );
                                                      } else {
                                                        handleEditChange(
                                                          `${letterP}.plusPron.${idx}`,
                                                          "1"
                                                        );
                                                      }
                                                    }}
                                                    className={`scale-[0.45] origin-center ${
                                                      editMode
                                                        ? "cursor-pointer"
                                                        : "cursor-default opacity-60"
                                                    }`}
                                                    aria-label={`Pronostico: vince ${t1?.name ?? "team1"}`}
                                                  >
                                                    <Quadrato
                                                      teamName={t1?.name ?? ""}
                                                      flag={t1?.flag ?? null}
                                                      phase="round32"
                                                      advanced={false}
                                                      label={null}
                                                      highlightType={
                                                        highlightModal1
                                                      }
                                                    />
                                                  </button>
                                                </div>

                                                {/* EDITABLE SCORE */}
                                                <div className="flex justify-center">
                                                  <EditableScore
                                                    pathA={`${letterP}.plusRis.${idx}.a`}
                                                    pathB={`${letterP}.plusRis.${idx}.b`}
                                                    pathPron={`${letterP}.plusPron.${idx}`}
                                                    valueA={
                                                      isOfficial
                                                        ? baseA
                                                        : valueA
                                                    }
                                                    valueB={
                                                      isOfficial
                                                        ? baseB
                                                        : valueB
                                                    }
                                                    placeholderA=""
                                                    placeholderB=""
                                                    readOnly={isOfficial}
                                                    onChange={handleEditChange}
                                                    className={`
                                                      w-[3.2rem]
                                                      justify-center
                                                      ${isOfficial ? "opacity-50 text-gray-300" : ""}
                                                    `}
                                                  />
                                                </div>
                                                {/* FLAG 2 */}
                                                <div className="flex items-center justify-center h-full min-h-[2.5rem]">
                                                  <button
                                                    type="button"
                                                    disabled={
                                                      !editMode || hasAnyScore
                                                    }
                                                    onClick={() => {
                                                      if (
                                                        !editMode ||
                                                        hasAnyScore
                                                      )
                                                        return;

                                                      if (
                                                        selectedPron === "2"
                                                      ) {
                                                        handleEditChange(
                                                          `${letterP}.plusPron.${idx}`,
                                                          ""
                                                        );
                                                      } else {
                                                        handleEditChange(
                                                          `${letterP}.plusPron.${idx}`,
                                                          "2"
                                                        );
                                                      }
                                                    }}
                                                    className={`scale-[0.45] origin-center ${
                                                      editMode
                                                        ? "cursor-pointer"
                                                        : "cursor-default opacity-60"
                                                    }`}
                                                    aria-label={`Pronostico: vince ${t2?.name ?? "team2"}`}
                                                  >
                                                    <Quadrato
                                                      teamName={t2?.name ?? ""}
                                                      flag={t2?.flag ?? null}
                                                      phase="round32"
                                                      advanced={false}
                                                      label={null}
                                                      highlightType={
                                                        highlightModal2
                                                      }
                                                    />
                                                  </button>
                                                </div>

                                                {/* TEAM 2 SHORT */}
                                                <span className="font-extrabold text-left whitespace-nowrap -ml-[0.8rem]">
                                                  {toCode3(t2) || "\u00A0"}
                                                </span>
                                                {/* COLONNA “P” (solo se NON ufficiale) */}
                                                {(() => {
                                                  const isChecked =
                                                    !!matchesState?.[letterP]
                                                      ?.plusCheck?.[idx];

                                                  // se ufficiale → colonna vuota (nessuna P)
                                                  if (isOfficial) {
                                                    return (
                                                      <span className="flex items-center justify-center text-[14px]">
                                                        &nbsp;
                                                      </span>
                                                    );
                                                  }

                                                  const canUseDel =
                                                    editMode && !isOfficial;
                                                  const delDisabled =
                                                    !canUseDel;
                                                  const delClassBase =
                                                    delDisabled
                                                      ? "opacity-30 cursor-not-allowed"
                                                      : "text-slate-600 cursor-pointer";

                                                  // 👉 adesso: RESET immediato, niente più “secondo click”
                                                  return (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        if (!canUseDel) return;

                                                        // 1) togli P
                                                        handleEditChange(
                                                          `${letterP}.plusCheck.${idx}`,
                                                          false
                                                        );

                                                        // 2) azzera i gol
                                                        handleEditChange(
                                                          `${letterP}.plusRis.${idx}.a`,
                                                          ""
                                                        );
                                                        handleEditChange(
                                                          `${letterP}.plusRis.${idx}.b`,
                                                          ""
                                                        );

                                                        // 3) azzera anche il pronostico 1/X/2
                                                        handleEditChange(
                                                          `${letterP}.plusPron.${idx}`,
                                                          ""
                                                        );
                                                      }}
                                                      disabled={delDisabled}
                                                      className={`
                                                        w-8 h-8
                                                        flex items-center justify-center
                                                        transition
                                                        bg-transparent border-none
                                                        "translate-x-0"
                                                        ${delClassBase}
                                                        font-bold
                                                        active:rotate-90
                                                        active:scale-125
                                                      `}
                                                      aria-hidden={isOfficial}
                                                      aria-label="Reset risultato"
                                                    >
                                                      {DelSymbol}
                                                    </button>
                                                  );
                                                })()}
                                              </div>

                                              {/* LINEA OGNI 2 PARTITE (dopo 2ª e 4ª) */}
                                              {(idx + 1) % 2 === 0 &&
                                                idx !==
                                                  matchesFlatP.length - 1 && (
                                                  <div className="grid grid-cols-[3rem_2.2rem_auto_2.2rem_3rem]">
                                                    <div className="col-span-5 flex justify-center">
                                                      <div className="mt-[0.4rem] h-[3px] bg-slate-500 rounded-full w-[70%]" />
                                                    </div>
                                                  </div>
                                                )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* --- SEZIONE NOTE --- */}
                                    {data && (
                                      <div className="text-sm">
                                        {[data.day1, data.day2, data.day3].map(
                                          (day, i) =>
                                            day && (
                                              <div key={i}>
                                                <div className="font-bold text-red-900 pl-2">
                                                  {Array.isArray(day.title)
                                                    ? day.title[0]
                                                    : day.title}
                                                </div>
                                                <div className="pl-2">
                                                  <EditableText
                                                    path={`${letterP}.day${i + 1}.items`}
                                                    value={day.items}
                                                    onChange={handleEditChange}
                                                    textareaClassName="
                                                      !h-[1.25rem]
                                                      !min-h-[1rem]
                                                      !max-h-[1.25rem]
                                                      p-0 pt-0
                                                      leading-[1rem]
                                                      overflow-hidden
                                                      resize-none
                                                      align-top
                                                    "
                                                  />
                                                </div>
                                              </div>
                                            )
                                        )}

                                        {data.notes && (
                                          <div>
                                            <div className="font-bold text-red-900 pl-2">
                                              {PinSymbol}
                                            </div>
                                            <div className="mt-0 pl-2">
                                              <EditableText
                                                path={`${letterP}.notes.text`}
                                                value={data.notes.text}
                                                onChange={handleEditChange}
                                                textareaClassName="
                                                  !h-[6.25rem]
                                                  !min-h-[6.25rem]
                                                  !max-h-[6.25rem]
                                                  leading-[1.25rem]
                                                  overflow-hidden
                                                  resize-none
                                                  align-top
                                                "
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* ADMIN TOGGLE */}
                                  <div className="absolute bottom-0 right-0">
                                    <AdminEditToggle onExit={saveAllEdits} />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      )}

                    {/* Lettera */}
                    <span
                      className={`mt-0 ${CssGroupLetter.Text} font-extrabold text-xl md:text-3xl leading-none`}
                    >
                      {letter}
                    </span>
                    {/* ================= DESKTOP ONLY — HOVER PLUS ================= */}
                    {/* ===== DESKTOP HOVER NOTE (TOOLTIP LATERALE) ===== */}
                    {hoverModal === letter && (
                      <div
                        className="
                          hidden md:flex flex-row
                          absolute top-4 left-8 right-2 z-[12000]
                          w-[19.8rem]
                          min-h-[16.9rem]
                          max-h-[18vh]                          
                          overflow-x-hidden
                          rounded-2xl
                          bg-slate-900 text-white
                          border-4
                          overscroll-contain
                          scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-800
                        "
                        onMouseEnter={() => setHoverModal(letter)}
                        onMouseLeave={() => {
                          setHoverModal(null);
                          if (editMode) {
                            void saveAllEditsRef.current?.();
                            setEditMode(false);
                          }
                        }}
                      >
                        {/* <div className="flex items-center justify-between">
                          <div className="font-extrabold text-slate-900">
                           Gruppo {letter}
                          </div>
                        </div> */}

                        {/* ✅ CONTENUTO AGGANCIATO A groupNotes */}
                        <div className="w-[3rem] flex items-start justify-center pt-10">
                          <AdminEditToggle onExit={saveAllEdits} />
                        </div>
                        <div className="mt-0 space-y-0 text-sm text-white flex-1 min-w-0 pr-2">
                          <div>
                            <div className="font-bold text-red-900 pl-2">
                              {groupData?.day1?.title?.[0]}
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day1.items`}
                                value={groupData?.day1?.items}
                                onChange={handleEditChange}
                                className="pl-2"
                                textareaClassName="
                                  h-[1.25rem] min-h-[1.25rem] max-h-[1.25rem]
                                      p-0 pt-0
                                      leading-[1.25rem]
                                      overflow-hidden resize-none
                                      align-top"
                              />
                            </div>
                          </div>
                          {/* Day 2 */}
                          <div>
                            <div className="font-bold text-red-900 pl-2">
                              {groupData?.day2?.title?.[0]}
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day2.items`}
                                value={groupData?.day2?.items}
                                onChange={handleEditChange}
                                className="pl-2"
                                textareaClassName="
                                  h-[1.25rem] min-h-[1.25rem] max-h-[1.25rem]
                                      p-0 pt-0
                                      leading-[1.25rem]
                                      overflow-hidden resize-none
                                      align-top
                                "
                              />
                            </div>
                          </div>

                          {/* Day 3 */}
                          <div>
                            <div className="font-bold text-red-900 pl-2">
                              {groupData?.day3?.title?.[0]}
                            </div>
                            <div className="pl-2 ">
                              <EditableText
                                path={`${letter}.day3.items`}
                                value={groupData?.day3?.items}
                                onChange={handleEditChange}
                                className="pl-2 items-center"
                                textareaClassName="
                                  h-[1.25rem] min-h-[1.25rem] max-h-[1.25rem]
                                      p-0 pt-0
                                      leading-[1.25rem]
                                      overflow-hidden resize-none
                                      align-top
                                "
                              />
                            </div>
                          </div>

                          {/* NOTE */}
                          <div>
                            <div className="font-bold text-red-900 pl-2">
                              {PinSymbol}
                            </div>
                            <div className="mt-0 p-0 rounded-xl pl-2">
                              <EditableText
                                path={`${letter}.notes.text`}
                                value={groupData?.notes?.text}
                                onChange={handleEditChange}
                                className="pl-2"
                                textareaClassName="
                                  !min-h-[6.5rem] !max-h-[6.5rem]
                                  !leading-[1.25rem]
                                  !p-0 !pt-[0.25rem]
                                  overflow-auto resize-none align-top
                                "
                              />
                            </div>
                          </div>
                          {/* ADMIN EDIT BUTTON */}
                        </div>
                        {/* <AdminEditToggle
                          className="mt-auto pb-2 pl-2 w-full flex justify-start self-start"
                          onExit={saveAllEdits}
                        /> */}
                      </div>
                    )}
                    {/* ===== DESKTOP HOVER PLUS ➕(RIS PRONOSTICI) ===== */}
                    {hoverPlusModal === letter && (
                      <div
                        className="
                          absolute top-4 left-8 right-2 z-[12000]
                          w-[19.8rem]
                          min-h-[16.9rem]
                          max-h-[18vh]
                          overflow-y-scroll
                          overflow-x-hidden
                          rounded-2xl
                          bg-slate-900 text-white
                          border-4 border-white
                          overscroll-contain
                          scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-800
                        "
                        // pl-24
                        onMouseEnter={() => setHoverPlusModal(letter)}
                        onMouseLeave={() => {
                          setHoverPlusModal(null);
                          if (editMode) {
                            void saveAllEditsRef.current?.();
                            setEditMode(false);
                          }
                        }}
                      >
                        <div className="p-0">
                          {/* <div className="font-extrabold text-center text-sm mb-0">
                                Gruppo {letter}
                              </div> */}

                          <div
                            className="
                                  -space-y-2
                                  [&_input]:text-xl md:[&_input]:text-2xl
                                  [&_input]:font-extrabold
                                  [&_input]:leading-none
                                  [&_input]:text-center
                                "
                          >
                            {matchesFlat.map((m, idx) => {
                              const t1 = findTeam(m.team1);
                              const t2 = findTeam(m.team2);
                              const res = computeRes(m, letter, idx);

                              // ✅ pron selezionato nel modale (+)
                              const selectedPron = String(
                                matchesState?.[letter]?.plusPron?.[idx] ?? ""
                              ).trim();

                              const isChecked =
                                !!matchesState?.[letter]?.plusCheck?.[idx];

                              // ✅ baseA/baseB dal risultato corrente (res)
                              const [baseA, baseB] = String(res ?? "").includes(
                                "-"
                              )
                                ? String(res)
                                    .split("-")
                                    .map((x) => x.trim())
                                : ["", ""];

                              // ✅ valori salvati (override) per l'input
                              const savedA =
                                matchesState?.[letter]?.plusRis?.[idx]?.a;
                              const savedB =
                                matchesState?.[letter]?.plusRis?.[idx]?.b;

                              const isOfficial = (m?.results ?? "")
                                .trim()
                                .includes("-");
                              const norm = (x) => String(x ?? "").trim();
                              const valueA = norm(savedA);
                              const valueB = norm(savedB);
                              const hasAnyScore =
                                isOfficial || valueA !== "" || valueB !== "";
                              // 🎯 LOGICA BORDO IN MODALE (win/draw in base a res)
                              let highlightModal1 = "none";
                              let highlightModal2 = "none";

                              if (res && res.includes("-")) {
                                const [na, nb] = res
                                  .split("-")
                                  .map((n) => Number(String(n).trim()));

                                if (
                                  Number.isFinite(na) &&
                                  Number.isFinite(nb)
                                ) {
                                  const winType = isOfficial
                                    ? "win"
                                    : "win-provisional";
                                  const drawType = isOfficial
                                    ? "draw"
                                    : "draw-provisional";

                                  if (na === nb) {
                                    highlightModal1 = drawType;
                                    highlightModal2 = drawType;
                                  } else if (na > nb) {
                                    highlightModal1 = winType;
                                  } else {
                                    highlightModal2 = winType;
                                  }
                                }
                              } else {
                                // Nessun risultato inserito → usa PRON come prima
                                if (selectedPron === "X") {
                                  highlightModal1 = "pron-draw";
                                  highlightModal2 = "pron-draw";
                                } else if (selectedPron === "1") {
                                  highlightModal1 = "pron";
                                } else if (selectedPron === "2") {
                                  highlightModal2 = "pron";
                                }
                              }

                              return (
                                <React.Fragment key={`plus-${letter}-${idx}`}>
                                  {/* RIGA INCONTRO */}
                                  <div
                                    className={`
                                      grid grid-cols-[0.8rem_3rem_2.2rem_auto_2.2rem_3rem]
                                      w-full
                                      items-center justify-center
                                      h-[4em]
                                      gap-x-0
                                      px-1 pl-[8rem] py-0
                                      text-[12px] leading-[0]
                                      bg-transparent
                                      pb-0 mb-0
                                    `}
                                  >
                                    {/* COLONNA P (già sistemata per official) */}
                                    {(() => {
                                      const isOfficial = (m?.results ?? "")
                                        .trim()
                                        .includes("-");
                                      if (isOfficial) {
                                        return (
                                          <span className="w-5 h-5 flex items-center justify-center">
                                            {/* hidden when official */}
                                          </span>
                                        );
                                      }

                                      const canUseDel = editMode && !isOfficial;
                                      const delDisabled = !canUseDel;
                                      const delClassBase = delDisabled
                                        ? "opacity-30 cursor-not-allowed"
                                        : "cursor-pointer text-slate-500";

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!canUseDel) return;

                                            // RESET COMPLETO come su mobile
                                            handleEditChange(
                                              `${letter}.plusCheck.${idx}`,
                                              false
                                            );
                                            handleEditChange(
                                              `${letter}.plusRis.${idx}.a`,
                                              ""
                                            );
                                            handleEditChange(
                                              `${letter}.plusRis.${idx}.b`,
                                              ""
                                            );
                                            handleEditChange(
                                              `${letter}.plusPron.${idx}`,
                                              ""
                                            );
                                          }}
                                          disabled={delDisabled}
                                          className={`
                                            w-8 h-8
                                            flex items-center justify-center
                                            transition
                                            bg-transparent border-none
                                            ${editMode ? "-translate-x-[2.5rem]" : "translate-x-0"}
                                            ${delClassBase}
                                            font-bold
                                            active:rotate-90
                                            active:scale-125
                                          `}
                                          aria-label="Reset pronostico"
                                        >
                                          {DelSymbol}
                                        </button>
                                      );
                                    })()}

                                    {/* SQ1 */}
                                    <span
                                      className={`
                                        font-extrabold text-right whitespace-nowrap mr-1
                                        transition-transform duration-200 ease-out
                                        ${editMode ? "-translate-x-[2.5rem]" : "translate-x-0"}
                                      `}
                                    >
                                      {toCode3(t1) || "\u00A0"}
                                    </span>

                                    {/* FLAG 1 */}
                                    <div
                                      className={`
                                        flex items-center justify-center p-0 m-0 leading-none h-full
                                        transition-transform duration-200 ease-out
                                        ${editMode ? "-translate-x-[2.5rem]" : "translate-x-0"}
                                      `}
                                    >
                                      <button
                                        type="button"
                                        disabled={!editMode || hasAnyScore}
                                        onClick={() => {
                                          if (!editMode || hasAnyScore) return;

                                          // solo pronostico, NON toccare plusRis
                                          if (selectedPron === "1") {
                                            handleEditChange(
                                              `${letter}.plusPron.${idx}`,
                                              ""
                                            );
                                          } else {
                                            handleEditChange(
                                              `${letter}.plusPron.${idx}`,
                                              "1"
                                            );
                                          }
                                        }}
                                        className={`scale-[0.45] md:scale-[0.65] origin-center ${
                                          editMode
                                            ? "cursor-pointer"
                                            : "cursor-default opacity-60"
                                        }`}
                                        aria-label={`Pronostico: vince ${t1?.name ?? "team1"}`}
                                      >
                                        <Quadrato
                                          teamName={t1?.name ?? ""}
                                          flag={t1?.flag ?? null}
                                          phase="round32"
                                          advanced={false}
                                          label={null}
                                          highlightType={highlightModal1}
                                        />
                                      </button>
                                    </div>

                                    {/* RIS */}
                                    <EditableScore
                                      pathA={`${letter}.plusRis.${idx}.a`}
                                      pathB={`${letter}.plusRis.${idx}.b`}
                                      pathPron={`${letter}.plusPron.${idx}`}
                                      valueA={isOfficial ? baseA : valueA}
                                      valueB={isOfficial ? baseB : valueB}
                                      placeholderA={
                                        user?.email?.toLowerCase() ===
                                        ADMIN_EMAIL.toLowerCase()
                                          ? baseA
                                          : ""
                                      }
                                      placeholderB={
                                        user?.email?.toLowerCase() ===
                                        ADMIN_EMAIL.toLowerCase()
                                          ? baseB
                                          : ""
                                      }
                                      readOnly={isOfficial}
                                      onChange={handleEditChange}
                                      className={`
                                        min-w-[2.5rem]
                                        ${isOfficial ? "opacity-50 text-gray-300" : ""}
                                      `}
                                    />

                                    {/* FLAG 2 */}
                                    <div className="flex items-center justify-center p-0 m-0 leading-none h-full">
                                      <button
                                        type="button"
                                        disabled={!editMode || hasAnyScore}
                                        onClick={() => {
                                          if (!editMode || hasAnyScore) return;

                                          if (selectedPron === "2") {
                                            handleEditChange(
                                              `${letter}.plusPron.${idx}`,
                                              ""
                                            );
                                          } else {
                                            handleEditChange(
                                              `${letter}.plusPron.${idx}`,
                                              "2"
                                            );
                                          }
                                        }}
                                        className={`scale-[0.45] md:scale-[0.65] origin-center ${
                                          editMode
                                            ? "cursor-pointer"
                                            : "cursor-default opacity-60"
                                        }`}
                                        aria-label={`Pronostico: vince ${t2?.name ?? "team2"}`}
                                      >
                                        <Quadrato
                                          teamName={t2?.name ?? ""}
                                          flag={t2?.flag ?? null}
                                          phase="round32"
                                          advanced={false}
                                          label={null}
                                          highlightType={highlightModal2}
                                        />
                                      </button>
                                    </div>

                                    {/* SQ2 */}
                                    <span className="font-extrabold text-left whitespace-nowrap ml-1">
                                      {toCode3(t2) || "\u00A0"}
                                    </span>
                                  </div>

                                  {/* DIVISORIA OGNI 2 RIGHE */}
                                  {(idx + 1) % 2 === 0 &&
                                    idx !== matchesFlat.length - 1 && (
                                      <div className="grid grid-cols-[3rem_2.2rem_auto_2.2rem_3rem] items-center justify-end gap-x-2 text-[12px] leading-none">
                                        <div className="col-span-5 flex justify-center">
                                          <div
                                            className={`
                                              mt-[0.5rem]
                                              h-[4px]
                                              bg-slate-500
                                              rounded-full
                                              transition-all duration-100 ease-out ml-[1rem] mr-0
                                              ${
                                                editMode
                                                  ? "md:w-[calc(100%+14rem)] md:-ml-[4rem] w-full"
                                                  : "w-full"
                                              }
                                            `}
                                          />
                                        </div>
                                      </div>
                                    )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                        {/* 🔴 "+" */}
                        {/* Toggle sempre a metà, lato sinistro, segue lo scroll */}
                        {/* ADMIN TOGGLE – CENTRATO */}
                        <div
                          className="
                                absolute inset-0 md:-top-[15.8rem]  -top-[2rem]
                                flex items-center justify-center
                                z-[10002]
                                pointer-events-none
                              "
                        >
                          <div className="pointer-events-auto">
                            <div className="absolute left-0 pointer-events-auto">
                              <AdminEditToggle onExit={saveAllEdits} />
                            </div>
                          </div>
                        </div>
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
                        // const provisional = (m?.ris ?? "").trim();

                        const hasOfficial = official.includes("-");
                        // const hasRis = provisional.includes("-");

                        // ✅ res: results > ris (ma ris solo se toggle ON)
                        const res = computeRes(m, letter, row);

                        // ✅ ris è "provisional" solo quando lo stai mostrando (toggle ON) e non c'è results
                        const isProvisional =
                          !hasOfficial && showPronostics && res !== "";

                        const pron = (
                          matchesState?.[letter]?.plusPron?.[row] ??
                          m?.pron ??
                          ""
                        )
                          .trim()
                          .toUpperCase();
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
                            const winTypeHome = isProvisional
                              ? "win-provisional"
                              : "win";
                            const winTypeAway = isProvisional
                              ? "win2-provisional"
                              : "win2"; // 👈 nuovo tipo per team2
                            const drawType = isProvisional
                              ? "draw-provisional"
                              : "draw";

                            if (a === b) {
                              highlightType1 = drawType;
                              highlightType2 = drawType;
                            } else if (a > b) {
                              // vince TEAM 1 (home) → stile standard
                              highlightType1 = winTypeHome;
                              highlightType2 = "none";
                            } else {
                              // vince TEAM 2 (away) → stile purple
                              highlightType2 = winTypeAway;
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
                            setMobilePlusOpen={setMobilePlusOpen}
                            setMobilePlusGroup={setMobilePlusGroup}
                            //------------------------------
                            bottomBorder={redBottom}
                            day={m?.day ?? ""}
                            city={m?.city ?? ""}
                            team1={toCode3(t1)}
                            team2={toCode3(t2)}
                            result={res}
                            isProvisional={isProvisional}
                            hasOfficial={hasOfficial}
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

        {/* ================= MOBILE ONLY — DRAWER CLASSIFICA ================= */}
        {/* ===== MOBILE DRAWER RANKING (CLASSIFICA GRUPPO) ===== */}

        {mobileRankOpen && mobileGroup && (
          <>
            {/* BACKDROP — mobile only */}
            <div
              className="md:hidden fixed inset-0 z-[9998] bg-black/80"
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
                      ? "left-[0.3rem]" //OKK container centrale OKK
                      : "left-[1.5rem]" //OKK container destra OKK
                    : SHIFT_RIGHT_MOBILE_GROUPS.has(mobileGroup)
                      ? "right-[4.5rem]" //OKK container sinistra
                      : "right-[6rem]"
                }
              `}
              style={{ top: mobileTop - 7 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GridRankPage
                onlyGroup={mobileGroup}
                maxMatches={mobileCutoff}
                isLogged={isLogged}
                userEmail={user?.email}
              />
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
              className="hidden md:block fixed z-[9999] md:p-2 md:py-0 p-2 rounded-2xl bg-sky-800 shadow-2xl w-[23rem]"
              style={{ top: `${top - 5}px`, left: `${left}px` }}
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
              <GridRankPage
                onlyGroup={hoverGroup}
                maxMatches={hoverCutoff}
                isLogged={isLogged}
                userEmail={user?.email}
              />
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
    { mobile: "C ", desktop: "CITTA'" },
    { mobile: "SQ1", desktop: "TEAM 1" },
    { mobile: "RIS", desktop: "RIS" },
    { mobile: "SQ2", desktop: "TEAM 2" },
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
              flex items-center
              ${
                h?.desktop === "TEAM 1"
                  ? "justify-start pl-2 md:pl-4"
                  : h?.desktop === "CITTA'"
                    ? "justify-center pl-1"
                    : h?.desktop === "TEAM 2"
                      ? "justify-start pl-1 md:pl-4"
                      : "justify-center"
              }
              text-[12px] font-extrabold
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
  setMobilePlusOpen,
  setMobilePlusGroup,
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
  hasOfficial,
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
              md:left-0 -left-[0.65rem]

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
                    ? "z-[12000]"
                    : "z-[9999]"
                  : "z-10"
            }
        

              md:border-none bordr border-whit

              flex items-center justify-center
              md:ml-0 ml-[0.1rem] text-[12px] leading-none
              pointer-events-auto
            `}
            aria-label="show ranking"
            onClick={(e) => {
              if (window.matchMedia("(min-width: 768px)").matches) return;

              e.stopPropagation(); // IMPORTANTISSIMO: evita che il backdrop chiuda nello stesso tap

              // ✅ CHIUDI LE NOTE SE APERTE (mobile)
              setMobileNotesOpen(false);
              setMobileNotesGroup(null);
              setMobilePlusOpen(false);
              setMobilePlusGroup(null);

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
          flex items-center justify-end
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
          scale-[0.40] md:scale-[0.65] origin-center
          ${
            // DESKTOP
            flagsGrayOnDesktop
              ? "md:[&_img]:grayscale md:[&_img]:brightness-50 md:[&_svg]:grayscale md:[&_svg]:brightness-50"
              : "md:[&_img]:grayscale-0 md:[&_svg]:grayscale-0"
          }
          ${
            // MOBILE
            flagsGrayOnMobile
              ? "[&_img]:grayscale [&_img]:brightness-50 [&_svg]:grayscale [&_svg]:brightness-50"
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
          className={`
    text-sm md:text-lg leading-none font-extrabold
    ${isProvisional ? "text-purple-300/40" : ""}
    ${hasOfficial ? "opacity-50 text-gray-300" : ""}
  `}
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
          scale-[0.40] md:scale-[0.65] origin-center
           ${
             // DESKTOP
             flagsGrayOnDesktop
               ? "md:[&_img]:grayscale md:[&_img]:brightness-50 md:[&_svg]:grayscale md:[&_svg]:brightness-50"
               : "md:[&_img]:grayscale-0 md:[&_svg]:grayscale-0"
           }
          ${
            // MOBILE
            flagsGrayOnMobile
              ? "[&_img]:grayscale [&_img]:brightness-50 [&_svg]:grayscale [&_svg]:brightness-50"
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
