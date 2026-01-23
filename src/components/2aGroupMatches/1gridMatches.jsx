import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import AdminEditToggle from "../../Editor/AdminEditToggle";
import EditableText from "../../Editor/EditableText";
import { createMatchesRepo } from "../../Services/repo/repoMatch";
import { loadMatchStructureFromDb, saveAdminSeedsToDb } from "../../Services/repo/repoMatchStructure";

import { createNotesRepo } from "../../Services/repo/repoNote";
import { useAuth } from "../../Services/supabase/AuthProvider";
import {
  ADMIN_EMAIL,
  DATA_SOURCE,
  DelSymbol,
  flagsMond
} from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import { CssGroupLetter, CssMatchGrid } from "../../START/styles/0CssGsTs";
import GridRankPage from "../2bGroupRank/1gridRank";
import Quadrato from "../3tableComp/1quad";
//zExternal
import { useQualifiedTeams } from "../../Ap/Global/global.jsx";
import EditableScore from "../../Editor/EditableScore.jsx";
import { useEditMode } from "../../Providers/EditModeProvider";
import { buildNameResolver } from "./zExternal/buildNameResolver";
import { city3 } from "./zExternal/city3";
import { dayOnly } from "./zExternal/dayOnly";
import { getFlatMatchesForGroup } from "./zExternal/getFlatMatchesForGroup";
import { getSortedTeamsForGroup } from "./zExternal/getSortedTeamsForGroup";
import { setDeep } from "./zExternal/setDeep";
import { splitDayDesk } from "./zExternal/splitDayDesk";
import { toCode3 } from "./zExternal/toCode3";

export default function GridMatchesPage({ isLogged }) {
  const { user } = useAuth();
  const { editMode, setEditMode } = useEditMode();
  const notesModalRef = useRef(null);   // container del modale NOTE (desktop)
  const notesToggleRef = useRef(null);  // bottone ☑️/✅ dentro quel modale
  
  const isAdminUser =
  (user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
  // ✅ struttura “flat” che arriva da Supabase (wc_matches_structure)
  const [structureByGroup, setStructureByGroup] = useState(null);
  const [structureLoading, setStructureLoading] = useState(true);
  const [rankRefreshKey, setRankRefreshKey] = useState(0);
  const [showPronostics, setShowPronostics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

const { setQualifiedTeams } = useQualifiedTeams();
const canShowGroupButtons = isLogged && showPronostics;



const [dataVersion, setDataVersion] = useState(0);
const bumpDataVersion = useCallback(() => setDataVersion(v => v + 1), []);


// ✅ METTI QUI (UNA SOLA VOLTA)
const [notes, setNotes] = useState({});
const [matchesState, setMatchesState] = useState({});




// ✅ matchesByGroup “derivato” dallo stato attuale (DB/hardcoded + plusRis/plusPron)
// Serve per ricalcolare le qualificate in tempo reale
const matchesByGroup = useMemo(() => {
  const out = {};
  for (const letter of "ABCDEFGHIJKL") {
    out[`group_${letter}`] = buildMatchesDataForGroup(letter);
  }
  return out;
  // buildMatchesDataForGroup dipende da structureByGroup, matchesState, isLogged ecc.
}, [structureByGroup, matchesState, isLogged]);


// ✅ ogni volta che cambiano i match (o dopo save), ricalcolo le qualificate e le metto nel context
useEffect(() => {
  const nextQualified = {};

  for (const letter of "ABCDEFGHIJKL") {
    const groupKey = `group_${letter}`;
    const matchesData = matchesByGroup?.[groupKey];
    if (!matchesData) continue;

    // calcolo classifica “come GridRank” (stessa utility)
    const sorted = getSortedTeamsForGroup({
      flagsMond,
      groupLetter: letter,
      matchesData,
      maxMatches: null,
      allowRis: true,   // ✅ considera anche plusRis
      useBonus: true,
    });

    const first = sorted?.[0]?.id || "";
    const second = sorted?.[1]?.id || "";
    if (!first || !second) continue;

    // ✅ set isPron: se NON ho tutti results ufficiali, considero provvisorio
    const all = Object.values(matchesData).flatMap((g) => g?.matches ?? []);
    const allOfficial = all.every((m) => isScore(m.results));
    const isPron = !allOfficial;

    // scrivo 1A / 2A ecc.
    nextQualified[`1${letter}`] = { code: first, isPron };
    nextQualified[`2${letter}`] = { code: second, isPron };
  }

  // ✅ scrivo nel context (e quindi TableBlock si aggiorna)
  if (Object.keys(nextQualified).length) {
    setQualifiedTeams((prev) => ({ ...prev, ...nextQualified }));
  }
}, [matchesByGroup, setQualifiedTeams]);

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


// ✅ normalizza i nomi dei campi DB -> UI (pron/ris/results)
// ✅ normalizza i nomi dei campi DB -> UI (pron/ris/results)
function normalizeMatch(m) {
  if (!m) return m;

  // se già ha pron/ris/results, non tocco
  const already = ("pron" in m) || ("ris" in m) || ("results" in m);
  if (already) return m;

  return {
    ...m,
    pron: m.seed_pron ?? "",
    ris: m.seed_ris ?? "",
    results: m.results_official ?? "",
  };
};


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
    // ✅ salva tutte le modifiche quando esci da EDIT
  async function saveAllEdits() {
  const paths = Object.keys(localEdits);
  if (!paths.length && !keysTouchedMatches.current.size) return;

  const isAdminUser =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ---------- NOTE ----------
  if (paths.length) {
    const keysTouchedNotes = new Set(paths.map((p) => p.split(".")[0]));
    await repo.save({ notes, keysTouched: keysTouchedNotes });
    keysTouched.current.clear();
  }

  // ---------- PRON / RIS UTENTE ----------
  await matchesRepo.save({
    matches: matchesState,
    keysTouched: keysTouchedMatches.current,
  });

  const resolveName = buildNameResolver(flagsMond);

const nextQualified = {};

for (const letter of "ABCDEFGHIJKL") {
  const matchesData = buildMatchesDataForGroup(letter);

  if (!isGroupComplete(matchesData)) continue;

  // qui riusi la stessa logica di GridRank:
  // - computeTableForGroup (ufficiali)
  // - computePronTableForGroup o bonus
  // - sortTeamsByTotal
  //
  // Se vuoi *identico identico* a GridRank, la cosa migliore è:
  // ✅ estrarre computeTableForGroup / computePronTableForGroup / sortTeamsByTotal in un file utils condiviso
  // e importarli sia in GridRankPage sia qui.

  // Pseudologica (perché dipende dalle tue funzioni già presenti in GridRank):
  const teams = (flagsMond ?? []).filter((t) => t.group === letter);
  const groupTeamNames = new Set(teams.map((t) => resolveName(t.name)));

  // const tableByTeam = computeTableForGroup(matchesData, resolveName, groupTeamNames, null, true);
  // const pronTableByTeam = computePronTableForGroup(matchesData, resolveName, groupTeamNames, null, true);

  const sorted = getSortedTeamsForGroup({
  flagsMond,
  groupLetter: letter,
  matchesData,
  maxMatches: null,
  useBonus: true,
});

  const first = sorted?.[0]?.id || "";
  const second = sorted?.[1]?.id || "";
  if (!first || !second) continue;

  // se non sono tutti ufficiali → isPron true (bordo viola nel tabellone)
  const all = Object.values(matchesData).flatMap((g) => g?.matches ?? []);
  const allOfficial = all.every((m) => isScore(m.results));

  nextQualified[`1${letter}`] = { code: first, isPron: !allOfficial };
  nextQualified[`2${letter}`] = { code: second, isPron: !allOfficial };
}

if (Object.keys(nextQualified).length) {
  setQualifiedTeams((prev) => ({ ...prev, ...nextQualified }));

  // ✅ persistenza (TableBlock le vede anche dopo refresh)
  try {
    const nextJson = JSON.stringify(nextQualified);
    if (nextJson !== lastQualifiedJsonRef.current) {
      lastQualifiedJsonRef.current = nextJson;

      const prevObj = JSON.parse(localStorage.getItem("wc26_qualifiedTeams") || "{}");
      localStorage.setItem(
        "wc26_qualifiedTeams",
        JSON.stringify({ ...prevObj, ...nextQualified })
      );
    }
  } catch {
    // ignore
  }
}


  // ---------- RISULTATI ADMIN ----------
  if (isAdminUser && keysTouchedMatches.current.size) {
    try {
      await saveAdminSeedsToDb({
        userEmail: user.email,
        matches: matchesState,
        keysTouched: keysTouchedMatches.current,
      });

    const freshStructure = await loadMatchStructureFromDb();
setStructureByGroup(freshStructure); // ok, ma tanto poi map(normalizeMatch) al render


      // 👉 forza ricarico classifica (admin)
      setRankRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Errore salvando seed risultati admin:", err);
    }
  }

   keysTouchedMatches.current.clear();

  let freshMatches = matchesState;

  // ---------- Ricarico solo per NON admin ----------
  if (!isAdminUser) {
    // ❌ NON ricarico dal server: uso lo stato locale appena salvato
    // ✅ ma aggiorno comunque la classifica (GridRankPage) via refreshKey
    setRankRefreshKey((prev) => prev + 1);
  }

mergeQualifiedTeams(patch);  
  // ✅ IMPORTANTISSIMO: ping globale -> GridRank + TableBlock + QualifiedTeamsSync
  bumpDataVersion?.();


    setLocalEdits({});
    lastSavedRef.current = { notes, matches: freshMatches };
  }


const isScore = (s) => {
  const raw = String(s ?? "").trim().replace(/[–—−]/g, "-").replace(/:/g, "-").replace(/\s+/g, "");
  if (!raw.includes("-")) return false;
  const [a, b] = raw.split("-");
  return Number.isFinite(Number(a)) && Number.isFinite(Number(b));
};
const isSign = (s) => {
  const v = String(s ?? "").trim().toUpperCase();
  return v === "1" || v === "X" || v === "2";
};




function buildMatchesDataForGroup(letter) {
  const groupKey = `group_${letter}`;

  // struttura “flat” per quel gruppo: DB se c’è, altrimenti hardcoded
  const flat =
    isLogged && structureByGroup?.[letter]?.length
      ? structureByGroup[letter].map(normalizeMatch)  // team1/team2/results/seed pron/ris
      : getFlatMatchesForGroup(groupMatches?.[groupKey]).map(normalizeMatch);

  // ricostruisco le 3 giornate (2 match ciascuna)
  const giornate = {
    giornata_1: { matches: [] },
    giornata_2: { matches: [] },
    giornata_3: { matches: [] },
  };

  flat.forEach((m, idx) => {
    const giornataKey = idx <= 1 ? "giornata_1" : idx <= 3 ? "giornata_2" : "giornata_3";

    const a = String(matchesState?.[letter]?.plusRis?.[idx]?.a ?? "").trim();
    const b = String(matchesState?.[letter]?.plusRis?.[idx]?.b ?? "").trim();
    const userRis = a !== "" && b !== "" ? `${a}-${b}` : "";

    const userPron = String(matchesState?.[letter]?.plusPron?.[idx] ?? "")
      .trim()
      .toUpperCase();

    giornate[giornataKey].matches.push({
      team1: m.team1,
      team2: m.team2,
      results: m.results ?? "",   // ufficiale
      ris: userRis || "",         // utente
      pron: userPron || "",       // utente
    });
  });

  return giornate;
};







const isCoveredMatch = (m) => isScore(m.results) || isScore(m.ris) || isSign(m.pron);

const isGroupComplete = (matchesData) => {
  const all = Object.values(matchesData).flatMap((g) => g?.matches ?? []);
  return all.length >= 6 && all.every(isCoveredMatch);
};


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

  // 👇 AGGIUNGI QUESTE DUE RIGHE QUI
  const arrowRefs = useRef([]);
  const editToggleRef = useRef(null);

const lastQualifiedJsonRef = useRef(""); // ✅ evita write ripetute


  const [mobileRankOpen, setMobileRankOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null); // "A".."L"
  const [mobileCutoff, setMobileCutoff] = useState(null); // 2/4/6
  const [mobileSide, setMobileSide] = useState("right"); // "left" | "right"
  const [mobileTop, setMobileTop] = useState(0);
  const [rowH, setRowH] = useState(rowHMobile);
  const [headerH, setHeaderH] = useState(headerHMobile);
  const [btnPos, setBtnPos] = useState({ top: "", left: "" });

const handleNotesModalKeyDown = useCallback((e) => {
  if (!notesModalRef.current) return;

  const textareas = notesModalRef.current.querySelectorAll("textarea");
  if (!textareas.length) return;

  const first = textareas[0];
  const last = textareas[textareas.length - 1];

  // TAB sull'ultima textarea (Note Varie) -> vai al bottone
  if (e.key === "Tab" && !e.shiftKey && e.target === last) {
    e.preventDefault();
    notesToggleRef.current?.focus();
    return;
  }

  


  // INVIO sull'ultima textarea (Note Varie) -> chiude edit e torna al bottone
  // if (e.key === "Enter" && e.target === last) {
  //   e.preventDefault();
  //   if (notesToggleRef.current) {
  //     notesToggleRef.current.click();  // simula click sul bottone
  //     notesToggleRef.current.focus();  // tieni il focus lì
  //   }
  // }
}, []);



//------------------------------------------------
useEffect(() => {
  const letters = "ABCDEFGHIJKL".split("");
  const nextQualified = {};

  for (const letter of letters) {
    const groupKey = `group_${letter}`;
    const matchesData = matchesByGroup?.[groupKey]; // <-- usa QUI il tuo state reale

    if (!matchesData) continue;

    // gruppo “chiuso” = 6 match coperti (results OR ris OR pron)
    // riuso le stesse regole dello Step 1: se allowRis=true include anche ris
    // Se vuoi SOLO ufficiali per qualificare: metti allowRis=false
    const sorted = getSortedTeamsForGroup({
      flagsMond,
      groupLetter: letter,
      matchesData,
      maxMatches: null,
      allowRis: true,
      useBonus: true,
    });

    const first = sorted?.[0]?.id || "";
    const second = sorted?.[1]?.id || "";
    if (!first || !second) continue;

    // 👉 qui puoi decidere quando scrivere: solo se il gruppo è “chiuso”
    // per ora scriviamo sempre se abbiamo 2 squadre (nel prossimo step mettiamo isGroupClosed)
    nextQualified[`1${letter}`] = { code: first, isPron: false };
    nextQualified[`2${letter}`] = { code: second, isPron: false };
  }

  setQualifiedTeams((prev) => ({ ...prev, ...nextQualified }));
}, [matchesByGroup, setQualifiedTeams]);

//------------------------------------------------
useEffect(() => {
  const nextQualified = {};

  for (const letter of "ABCDEFGHIJKL") {
    const matchesData = buildMatchesDataForGroup(letter);
    if (!isGroupComplete(matchesData)) continue;

    const sorted = getSortedTeamsForGroup({
      flagsMond,
      groupLetter: letter,
      matchesData,
      maxMatches: null,
      allowRis: true,
      useBonus: true,
    });

    const first = sorted?.[0]?.id || "";
    const second = sorted?.[1]?.id || "";
    if (!first || !second) continue;

    const all = Object.values(matchesData).flatMap((g) => g?.matches ?? []);
    const allOfficial = all.every((m) => isScore(m.results));

    nextQualified[`1${letter}`] = { code: first, isPron: !allOfficial };
    nextQualified[`2${letter}`] = { code: second, isPron: !allOfficial };
  }

  if (Object.keys(nextQualified).length) {
    setQualifiedTeams((prev) => ({ ...prev, ...nextQualified }));
  }
}, [matchesState, structureByGroup, isLogged]);

//------------------------------------------------
useEffect(() => {
  // quando entro in editMode, metto il focus sulla 1ª textarea del modale NOTE
  if (!editMode) return;
  if (!notesModalRef.current) return;

  const first = notesModalRef.current.querySelector("textarea");
  if (first) {
    first.focus();
    first.select?.();
  }
}, [editMode]);


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
      if (!isLogged) {
        // ✅ non loggato: non carico DB
        if (!cancelled) setStructureByGroup(null);
        return;
      }

      const byGroup = await loadMatchStructureFromDb();
      if (!cancelled) setStructureByGroup(byGroup);
    } catch (err) {
      console.error("Errore caricando struttura da DB:", err);
    } finally {
      if (!cancelled) setStructureLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [isLogged]);
//------------------------------------------------
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
//------------------------------------------------
  useEffect(() => {
    saveAllEditsRef.current = saveAllEdits;
  }, [saveAllEdits]);
//------------------------------------------------

useEffect(() => {
  try {
    const stored = JSON.parse(localStorage.getItem("wc26_qualifiedTeams") || "{}");
    lastQualifiedJsonRef.current = JSON.stringify(stored || {});
  } catch {
    lastQualifiedJsonRef.current = "";
  }
}, []);
//------------------------------------------------
  useEffect(() => {
    return () => {
      if (editMode) {
        void saveAllEditsRef.current?.();
        setEditMode(false);
      }
    };
  }, [editMode, setEditMode]);
//------------------------------------------------
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






  //------------------------------------------------
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
    // loggato: showPronostics può stare true (per UI), ma NON deve influire sullo storage guest
    setShowPronostics(true);
    return;
  }

  // guest: ripristina da storage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    setShowPronostics(saved ? JSON.parse(saved) : false);
  } catch {
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
  // 🔒 IMPORTANTISSIMO: lo storage è solo per GUEST.
  // Se sei loggato, NON scrivere mai (altrimenti salvi "true" e al logout riappare).
  if (isLogged) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(showPronostics));
  } catch {
    // ignore
  }
}, [showPronostics, isLogged]);

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
            text-slate-900
               ${showPronostics
                  ? "bg-white text-slate-900"
                  : "bg-transparent text-white"}
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
                   {showPronostics ? "📊" : ""}
          </button>
        )}

        {/* Contenitore della “tabella” */}
        <div
          className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full md:w-max"
          role="region"
          aria-label="World Cup groups match grid"
        >
          {groups.map((letter) => {
            const groupData = notes?.[letter] || {};
            const day1 = groupData.day1 || groupData.DAY1 || {};
            const day2 = groupData.day2 || groupData.DAY2 || {};
            const day3 = groupData.day3 || groupData.DAY3 || {};
            const resolveName = buildNameResolver(flagsMond);

            const groupKey = `group_${letter}`;
           
           const matchesFlat = !isLogged
            ? getFlatMatchesForGroup(groupMatches?.[groupKey])
            : (structureByGroup?.[letter]?.length
                ? structureByGroup[letter].map(normalizeMatch)   // ✅ AGGIUNGI QUESTO
                : getFlatMatchesForGroup(groupMatches?.[groupKey]));

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

              // se l'admin ha messo un risultato locale → usa quello
              if (a !== "" && b !== "") return `${a}-${b}`;

              // se l'admin ha toccato e svuotato la riga → niente fallback al seed
              if (wasEdited) return "";

              // altrimenti usa sempre il seed dal DB (seed_ris caricato in m.ris)
              const seed = String(m?.ris ?? "").trim();
              if (seed.includes("-")) return seed;

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
            // dentro GridMatchesPage, PRIMA del return del JSX del modale, puoi mettere:
            const handleFlagKeyDown = (e, onClick) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();          // esegue la stessa logica del click
              }
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
                    {canShowGroupButtons && (
                      <div
                        className="
                          absolute
                          md:top-[5.5rem] top-[3.3rem]
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
                            md:translate-y-6 translate-y-[1rem]
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
                              translate-y-5
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
                                  ? structureByGroup[letterP].map(normalizeMatch)
                                  : getFlatMatchesForGroup(groupMatches?.[groupKey]);

                              const findTeamP = (rawName) => {
                                const name = resolveName(rawName);
                                if (!name) return null;
                                return (
                                  (flagsMond ?? []).find(
                                    (t) => resolveName(t.name) === name
                                  ) ?? null
                                );
                              };

                              // Mobile: stessa logica del desktop (results / seed / plusRis)
                              const computeResP = (m, idx) => {
                                return computeRes(m, letterP, idx);
                              
                              };

                              // note: prima dal nuovo JSON wc_matches_structure.notes_admin,
                              // poi fallback a notes[] (vecchia tabella)
                              // 👇 Prima usa sempre lo stato "notes" (quello che stai editando),
                              // poi come fallback eventuale notes_admin dalla struttura
                              const dbNotesAdmin =
                                structureByGroup?.[letterP]?.notes_admin || null;

                              const baseNotes = notes?.[letterP];

                              // Se sei ADMIN → prima le tue note in stato, poi fallback admin dal DB
                              // Se NON sei admin → usa SOLO le tue note, mai le notes_admin
                              const data = isAdminUser
                                ? baseNotes || dbNotesAdmin || {}
                                : baseNotes || {};
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

                                          // pron selezionato per quella partita:
                                          // - se sto editando → plusPron
                                          // - altrimenti (o admin dopo refresh) → seed_pron in m.pron
                                         const selectedPron = String(
                                            matchesState?.[letterP]?.plusPron?.[idx] ??
                                              ((isAdminUser || !isLogged) ? (m?.pron ?? "") : "") ??
                                              ""
                                          ).trim().toUpperCase();

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

                                          // 👇 come nel modale desktop:
                                          // se non ho plusRis ma res ha un valore (seed / ufficiale),
                                          // uso baseA/baseB come fallback
                                         // ✅ IN EDIT MODE: mai fallback ai seed/base, altrimenti il reset “rimbalza”
                                          const seedA = !isOfficial && isAdminUser && valueA === "" && baseA ? baseA : "";
                                          const seedB = !isOfficial && isAdminUser && valueB === "" && baseB ? baseB : "";

                                          const displayA = isOfficial ? baseA : (valueA !== "" ? valueA : seedA);
                                          const displayB = isOfficial ? baseB : (valueB !== "" ? valueB : seedB);

                                          const hasAnyScore =
                                            isOfficial ||
                                            displayA !== "" ||
                                            displayB !== "";


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
                                                      !editMode 
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
                                                    className={`scale-[0.55] origin-center ${
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
                                                    valueA={displayA}
                                                    valueB={displayB}
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
                                                      !editMode
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
                                                    className={`scale-[0.55] origin-center ${
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
                                    <div className="text-sm mt-4 space-y-1">
                                      {[1, 2, 3].map((dayIndex) => {
                                        const keyUpper = `DAY${dayIndex}`;
                                        const keyLower = `day${dayIndex}`;
                                        const day =
                                          data[keyLower] || // 👈 prima quello che stai editando
                                          data[keyUpper] || // 👈 fallback al DB (DAY1)
                                          {};


                                        return (
                                          <div key={dayIndex}>
                                            <div className="font-bold text-red-900 pl-2">
                                              {dayIndex}ª giornata
                                            </div>
                                            <div className="pl-2">
                                              <EditableText
                                                path={`${letterP}.day${dayIndex}.items`}
                                                value={day.items || ""}
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
                                        );
                                      })}

                                      <div>
                                        <div className="font-bold text-red-900 pl-2">
                                          Note Varie
                                        </div>
                                        <div className="mt-0 pl-2">
                                          <EditableText
                                            path={`${letterP}.notes.text`}
                                            value={data?.notes?.text || ""}
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
                                    </div>
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
                      className={`
                        mt-0
                        md:translate-y-2 translate-y-2 
                        ${CssGroupLetter.Text}
                        font-extrabold text-xl md:text-3xl leading-none
                      `}
                    >
                      {letter}
                    </span>
                    {/* ================= DESKTOP ONLY — HOVER PLUS ================= */}
                    {/* ===== DESKTOP HOVER NOTE (TOOLTIP LATERALE) ===== */}
                    {hoverModal === letter && (
                      <div
                       ref={notesModalRef}      
                        className="
                          hidden md:flex flex-row
                          absolute top-4 left-8 right-2 z-[12000]
                          w-[19.8rem]
                          min-h-[16.9rem]
                          max-h-[18vh]                          
                          overflow-x-hidden
                          rounded-2xl
                          bg-slate-900 text-white border-white
                          border-4
                          overscroll-contain
                          scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-800
                        "
                         onKeyDownCapture={handleNotesModalKeyDown}
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
                        {/* QUESTO PT ABBASSA IL SIMBOLO DENTRO IL MODALE L ALTRO SEGNATO*/}
                        <div className="w-[3rem] flex items-start justify-center pt-[8.3rem]">
                          <AdminEditToggle 
                            onExit={saveAllEdits}
                           buttonRef={notesToggleRef} 
                           />
                        </div>
                        <div className="mt-2 space-y-0 text-sm text-white flex-1 min-w-0 pr-2">
                          <div>
                            <div className="font-bold text-red-900 pl-2">
                               1ª giornata
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day1.items`}
                                 value={day1.items || ""} 
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
                               2ª giornata
                            </div>
                            <div className="pl-2">
                              <EditableText
                                path={`${letter}.day2.items`}
                                 value={day2.items || ""} 
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
                               3ª giornata
                            </div>
                            <div className="pl-2 ">
                              <EditableText
                                path={`${letter}.day3.items`}
                                value={day3.items || ""} 
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
                              {/* {PinSymbol}
                              */}
                              Note Varie
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
                          absolute md:top-4 left-8 right-2 z-[12000] 
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

                              const isOfficial = (m?.results ?? "").trim().includes("-");

                              // quando premi TAB sul secondo numero del risultato
                              // const handleScoreTabOut = (e) => {
                              //   // e.preventDefault();

                              //   // cerca la prossima partita NON ufficiale con bottone frecce
                              //   for (let j = idx + 1; j < matchesFlat.length; j++) {
                              //     const nextIsOfficial = (matchesFlat[j]?.results ?? "")
                              //       .trim()
                              //       .includes("-");

                              //     if (!nextIsOfficial && arrowRefs.current[j]) {
                              //       arrowRefs.current[j].focus();
                              //       return;
                              //     }
                              //   }

                              //   // se non ci sono più frecce → torna al toggle verde/grigio
                              //   if (editToggleRef.current) {
                              //     editToggleRef.current.focus();
                              //   }
                              // };

                             const selectedPron = String(
  matchesState?.[letter]?.plusPron?.[idx] ??
    ((isAdminUser || !isLogged) ? (m?.pron ?? "") : "") ??
    ""
)
                                .trim()
                                .toUpperCase();

                              const isChecked =
                                !!matchesState?.[letter]?.plusCheck?.[idx];

                              const [baseA, baseB] = String(res ?? "").includes("-")
                                ? String(res).split("-").map((x) => x.trim())
                                : ["", ""];

                              const savedA = matchesState?.[letter]?.plusRis?.[idx]?.a;
                              const savedB = matchesState?.[letter]?.plusRis?.[idx]?.b;

                              const norm = (x) => String(x ?? "").trim();
                              const valueA = norm(savedA);
                              const valueB = norm(savedB);

                              const seedA = !isOfficial && isAdminUser && valueA === "" && baseA ? baseA : "";
const seedB = !isOfficial && isAdminUser && valueB === "" && baseB ? baseB : "";

const displayA = isOfficial ? baseA : (valueA !== "" ? valueA : seedA);
const displayB = isOfficial ? baseB : (valueB !== "" ? valueB : seedB);

                              const hasAnyScore =
                                isOfficial || displayA !== "" || displayB !== "";

                              // 🎯 LOGICA BORDO IN MODALE (win/draw in base a res)
                              let highlightModal1 = "none";
                              let highlightModal2 = "none";

                              if (res && res.includes("-")) {
                                const [na, nb] = res
                                  .split("-")
                                  .map((n) => Number(String(n).trim()));

                                if (Number.isFinite(na) && Number.isFinite(nb)) {
                                  const winType = isOfficial ? "win" : "win-provisional";
                                  const drawType = isOfficial ? "draw" : "draw-provisional";

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
                                    data-plus-row
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
                                    {/* COLONNA P */}
                                    {(() => {
                                      if (isOfficial) {
                                        return (
                                          <span className="w-5 h-5 flex items-center justify-center">
                                            {/* niente P per risultati ufficiali */}
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
                                        ref={(el) => (arrowRefs.current[idx] = el)}
                                        onClick={() => {
                                          if (!canUseDel) return;

                                          // RESET COMPLETO
                                          handleEditChange(`${letter}.plusCheck.${idx}`, false);
                                          handleEditChange(`${letter}.plusRis.${idx}.a`, "");
                                          handleEditChange(`${letter}.plusRis.${idx}.b`, "");
                                          handleEditChange(`${letter}.plusPron.${idx}`, "");
                                        }}
                                        onKeyDown={(e) => {
                                          // SOLO ENTER, niente più gestione TAB qui
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (!canUseDel) return;
                                            handleEditChange(`${letter}.plusCheck.${idx}`, false);
                                            handleEditChange(`${letter}.plusRis.${idx}.a`, "");
                                            handleEditChange(`${letter}.plusRis.${idx}.b`, "");
                                            handleEditChange(`${letter}.plusPron.${idx}`, "");
                                          }
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
                                        disabled={!editMode 
                                          // || hasAnyScore
                                        }
                                       onClick={() => {
                                          if (!editMode || hasAnyScore) return;

                                          if (selectedPron === "1") {
                                            handleEditChange(`${letter}.plusPron.${idx}`, "");
                                          } else {
                                            handleEditChange(`${letter}.plusPron.${idx}`, "1");
                                          }
                                        }}
                                        onKeyDown={(e) =>
                                          handleFlagKeyDown(e, () => {
                                            if (!editMode || hasAnyScore) return;
                                            if (selectedPron === "1") {
                                              handleEditChange(`${letter}.plusPron.${idx}`, "");
                                            } else {
                                              handleEditChange(`${letter}.plusPron.${idx}`, "1");
                                            }
                                          })
                                        }                   
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
                                      valueA={displayA}
                                      valueB={displayB}
                                      placeholderA=""
                                      placeholderB=""
                                      readOnly={isOfficial}
                                      onChange={handleEditChange}
                                      // onTabOut={handleScoreTabOut}  // TAB su B → freccia riga dopo o toggle verde
                                      className={`
                                        min-w-[2.5rem]
                                        ${isOfficial ? "opacity-50 text-gray-300" : ""}
                                      `}
                                    />

                                    {/* FLAG 2 */}
                                    <div className="flex items-center justify-center p-0 m-0 leading-none h-full">
                                      <button
                                        type="button"
                                        disabled={!editMode 
                                          // || hasAnyScore
                                        }
                                         onClick={() => {
                                          if (!editMode || hasAnyScore) return;

                                          if (selectedPron === "2") {
                                            handleEditChange(`${letter}.plusPron.${idx}`, "");
                                          } else {
                                            handleEditChange(`${letter}.plusPron.${idx}`, "2");
                                          }
                                        }}
                                        onKeyDown={(e) =>
                                          handleFlagKeyDown(e, () => {
                                            if (!editMode || hasAnyScore) return;
                                            if (selectedPron === "2") {
                                              handleEditChange(`${letter}.plusPron.${idx}`, "");
                                            } else {
                                              handleEditChange(`${letter}.plusPron.${idx}`, "2");
                                            }
                                          })
                                        }
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
                        {/* ADMIN TOGGLE – CENTRATO */}
                        {/* 🔴 "+" */}
                        {/* Toggle sempre a metà, lato sinistro, segue lo scroll */}
                        {/* ADMIN TOGGLE – CENTRATO */}
                        {/* QUESTO TOP ABBASSA IL PULSANTE DENTRO IL MODALE L ALTRO E
                          PT-[8.3REM] */}                                    
                        <div
                          className="
                            absolute inset-0 md:-top-[4.9rem]  -top-[2rem]
                            flex items-center justify-center
                            z-[10002]
                            pointer-events-none
                          "
                        >
                          <div className="pointer-events-auto">
                            <div className="absolute left-0 pointer-events-auto">
                              <AdminEditToggle
                                onExit={saveAllEdits}
                                buttonRef={editToggleRef}
                                onTabNext={() => {
                                  // trova la PRIMA partita non ufficiale che ha il bottone frecce
                                  for (let j = 0; j < matchesFlat.length; j++) {
                                    const m = matchesFlat[j];
                                    const isOfficial = (m?.results ?? "").trim().includes("-");

                                    if (!isOfficial && arrowRefs.current[j]) {
                                      arrowRefs.current[j].focus(); // 👈 frecce riga j
                                      return;
                                    }
                                  }
                                }}
                              />
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
  ((isAdminUser || !isLogged) ? (m?.pron ?? "") : "") ??
  ""
).trim().toUpperCase();

                        
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
                refreshKey={rankRefreshKey}
                 dataVersion={dataVersion}
                 matchesByGroupOverride={matchesByGroup} 
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
                refreshKey={rankRefreshKey}
                 dataVersion={dataVersion}
                 matchesByGroupOverride={matchesByGroup} 
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
