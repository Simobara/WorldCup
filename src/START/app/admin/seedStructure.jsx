import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";
import { groupFinal } from "../2GroupFinal";


const derivePronFromRis = (ris) => {
  // accetta "1-1", "2-0", ecc.
  const m = String(ris ?? "").match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return "";

  const a = Number(m[1]);
  const b = Number(m[2]);
  if (Number.isNaN(a) || Number.isNaN(b)) return "";

  if (a > b) return "1";
  if (a < b) return "2";
  return "X";
};


  const getOrderedGiornateEntries = (phaseOrGroupObj) => {
    return Object.entries(phaseOrGroupObj).sort(([a], [b]) => {
      const na = Number(a.split("_")[1] ?? 0);
      const nb = Number(b.split("_")[1] ?? 0);
      return na - nb;
    });
  };

  const findMatchByGlobalIndex = (phaseOrGroupObj, globalIndex) => {
    let cursor = 0;
    for (const [giornataKey, giornata] of getOrderedGiornateEntries(phaseOrGroupObj)) {
      const len = giornata?.matches?.length ?? 0;
      if (globalIndex < cursor + len) {
        const localIdx = globalIndex - cursor;
        return { giornataKey, match: giornata.matches[localIdx], localIdx };
      }
      cursor += len;
    }
    return null;
  };


// quali campi dell'editor GIRONI corrispondono a quali colonne nel DB
const fieldToDbColumn = {
  city: "city",
  team1: "team1",
  team2: "team2",
  pron: "seed_pron",
  ris: "seed_ris",
  results: "results_official",
  // numero e time non stanno in wc_matches_structure
};

// quali campi dell'editor FINAL corrispondono a quali colonne nel DB wc_final_structure
const finalFieldToDbColumn = {
  day: "day",
  city: "city",
  time: "time",
  //---
  pos1: "pos1",
  pos2: "pos2",
  goto: "goto",
  fg: "fg",
  pronsq: "pronsq",
  //---
  team1: "team1",
  team2: "team2",

  "results.RES": "results_res",
  "results.TS": "results_ts",
  "results.R": "results_r",
};


// ---------------- VIEW LAYER (hardcoded + DB override) ----------------
const makeKey = (g, idx) => `${g}-${idx}`;

function buildViewFromHardcoded(groupMatches) {
  const map = {};
  for (const gLetter of "ABCDEFGHIJKL") {
    const group = groupMatches[`group_${gLetter}`];
    if (!group) continue;

    const flat = [];
    for (const giornata of Object.values(group)) {
      for (const m of giornata.matches) flat.push(m);
    }

    flat.forEach((m, idx) => {
      map[makeKey(gLetter, idx)] = {
        pron: m.pron ?? "",
        ris: m.ris ?? "",
        results: m.results ?? "",
      };
    });
  }
  return map;
}

function applyDbOverride(map, rows) {
  const next = { ...map };
  for (const r of rows ?? []) {
    const key = makeKey(r.group_letter, r.match_index);
    next[key] = {
      ...(next[key] ?? { pron: "", ris: "", results: "" }),
      pron: r.seed_pron ?? "",
      ris: r.seed_ris ?? "",
      results: r.results_official ?? "",
    };
  }
  return next;
}


async function updateFinalMatchFieldInDb(
  phaseKey,
  matchIndex, // <-- ora passo direttamente il match_index del DB
  field,
  value,
) {
  const column = finalFieldToDbColumn[field];
  if (!column) return;

  const payload = {
    [column]: value === "" ? null : value,
  };

  const { error } = await supabase
    .from("wc_final_structure")
    .update(payload)
    .eq("phase_key", phaseKey)
    .eq("match_index", matchIndex);

  if (error) {
    console.error("❌ Errore aggiornando Supabase FINAL:", error);
  } else {
    console.log(
      `✅ FINAL: aggiornato ${column} per phase=${phaseKey}, match_index=${matchIndex} →`,
      value,
    );
  }
}

async function updateMatchFieldInDb(groupLetter, matchIndex, field, value) {
  const column = fieldToDbColumn[field];
  if (!column) return;

  const payload = { [column]: value === "" ? null : value };

  const { data, error } = await supabase
    .from("wc_matches_structure")
    .update(payload)
    .eq("group_letter", groupLetter)
    .eq("match_index", matchIndex)
    .select("group_letter, match_index"); // utile per debug

  if (error) {
    console.error("❌ Errore aggiornando Supabase:", error);
  } else if (!data?.length) {
    console.warn("⚠️ Nessuna riga aggiornata (match_index non trovato):", {
      groupLetter,
      matchIndex,
      field,
      value,
    });
  } else {
    console.log(
      `✅ Aggiornato ${column} per gruppo ${groupLetter}, match_index=${matchIndex} →`,
      value,
    );
  }
}

export default function AdminSeedStructure() {
  // Copia modificabile dei gironi A–L
  const [dataGroups, setDataGroups] = useState(() =>
    structuredClone(groupMatches),
  );
  // Copia modificabile della fase finale
  const [dataFinals, setDataFinals] = useState(() =>
    structuredClone(groupFinal),
  );

  // modalità: gironi A–L o fase finale
  const [mode, setMode] = useState("groups"); // "groups" | "finals"
  const isGroupsMode = mode === "groups";

  // gruppi A–L
  const [activeGroup, setActiveGroup] = useState("A");


// VIEW: unica sorgente per mostrare pron/ris/results (fuori + hover)
const [viewByKey, setViewByKey] = useState(() =>
  buildViewFromHardcoded(groupMatches)
);
const [isLogged, setIsLogged] = useState(false);

  // fasi finali
  const FINAL_PHASES = [
    { key: "round32", label: "ROUND32" },
    { key: "round16", label: "ROUND16" },
    { key: "quarterFinals", label: "QUARTERFINALS" },
    { key: "semifinals", label: "SEMIFINALS" },
    { key: "final34", label: "3 / 4 PLACE" },
    { key: "final", label: "FINAL" },
  ];
  const [activeFinalKey, setActiveFinalKey] = useState("round32");

  // gruppo/fase corrente
  const groupKey = isGroupsMode ? `group_${activeGroup}` : activeFinalKey;
  const currentData = isGroupsMode ? dataGroups : dataFinals;
  const group = currentData[groupKey];

  const navigate = useNavigate();

  // helper per aggiornare lo state giusto
  const updateData = (updater) => {
    if (isGroupsMode) {
      setDataGroups(updater);
    } else {
      setDataFinals(updater);
    }
  };

const setViewField = (groupLetter, matchIndex, patch) => {
  const key = makeKey(groupLetter, matchIndex);
  setViewByKey((prev) => ({
    ...prev,
    [key]: { ...(prev[key] ?? { pron: "", ris: "", results: "" }), ...patch },
  }));
};

  const handleDateChange = (giornataKey, dateIndex, value) => {
    // 1) aggiorno lo state
    updateData((prev) => {
      const next = structuredClone(prev);
      next[groupKey][giornataKey].dates[dateIndex] = value;
      return next;
    });

    // 2) se sono in FASE FINALE, salvo nel DB
    if (!isGroupsMode) {
      const phase = currentData[groupKey];
      if (!phase) return;

      let globalIndex = 0;

      for (const [gKey, g] of Object.entries(phase)) {
        if (gKey === giornataKey) {
          // salvo il day sulla PRIMA partita di quella giornata
          break;
        }
        globalIndex += g.matches.length;
      }

      void updateFinalMatchFieldInDb(activeFinalKey, globalIndex, "day", value);
    }
  };

  const handleMatchChange = (
    giornataKey,
    matchIndexLocal,
    field,
    value,
    numero,
  ) => {
    // 1) aggiorno lo state
    updateData((prev) => {
      const next = structuredClone(prev);
      const match = next[groupKey][giornataKey].matches[matchIndexLocal];

      if (!isGroupsMode && field.startsWith("results.")) {
        const key = field.split(".")[1]; // "RES" | "TS" | "R"
        if (!match.results) {
          match.results = { RES: "", TS: "", R: "" };
        }
        match.results[key] = value;
      } else {
  match[field] = field === "numero" ? Number(value) || 0 : value;

  // ✅ AUTO-PRON: se scrivo ris "1-1" => pron "X" (solo in GIRONI)
  if (isGroupsMode && field === "ris") {
    const autoPron = derivePronFromRis(value);
    if (autoPron) match.pron = autoPron;
  }
}

      return next;
    });

    // 2) aggiorno il DB

    if (isGroupsMode) {
  const phase = currentData[groupKey]; // group_{letter}
  if (!phase) return;

  let globalIndex = 0;

  // ✅ ordine stabile (giornata_1, giornata_2, ...)
  for (const [gKey, g] of getOrderedGiornateEntries(phase)) {
    if (gKey === giornataKey) {
      globalIndex += matchIndexLocal;
      break;
    }
    globalIndex += g.matches.length;
  }

  void updateMatchFieldInDb(activeGroup, globalIndex, field, value);

  // ✅ se ho cambiato ris e ho calcolato auto-pron, salvo anche la pron nel DB
if (field === "ris") {
  const autoPron = derivePronFromRis(value);
  if (autoPron) void updateMatchFieldInDb(activeGroup, globalIndex, "pron", autoPron);
}
    } else {
      const phase = dataFinals[activeFinalKey];
      if (!phase) return;

      let globalIndex = 0;

      for (const [gKey, g] of Object.entries(phase)) {
        if (gKey === giornataKey) {
          globalIndex += matchIndexLocal;
          break;
        }
        globalIndex += g.matches.length;
      }

      void updateFinalMatchFieldInDb(activeFinalKey, globalIndex, field, value);
    }
  };

  const getOrderedGiornateEntries = (phaseOrGroupObj) => {
    return Object.entries(phaseOrGroupObj).sort(([a], [b]) => {
      const na = Number(a.split("_")[1] ?? 0);
      const nb = Number(b.split("_")[1] ?? 0);
      return na - nb;
    });
  };

  const findMatchByGlobalIndex = (phaseOrGroupObj, globalIndex) => {
    let cursor = 0;
    for (const [giornataKey, giornata] of getOrderedGiornateEntries(phaseOrGroupObj)) {
      const len = giornata?.matches?.length ?? 0;
      if (globalIndex < cursor + len) {
        const localIdx = globalIndex - cursor;
        return { giornataKey, match: giornata.matches[localIdx], localIdx };
      }
      cursor += len;
    }
    return null;
  };



    // --- LOADERS -------------------------------------------------------

const loadGroupsFromDb = async (groupLetter) => {
  // ⚠️ IMPORTANTISSIMO: prendi SOLO colonne che ESISTONO nel DB
  // Dal tuo errore: "time does not exist" → quindi NON selezionare time/day/city/team1/team2 se non ci sono.

  const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return;

  const { data: rows, error } = await supabase
    .from("wc_matches_structure")
    .select("group_letter, match_index, seed_pron, seed_ris, results_official")
    .eq("group_letter", groupLetter)
    .order("match_index", { ascending: true });

  console.log("loadGroupsFromDb", {
    groupLetter,
    rowsCount: rows?.length,
    error,
  });

  if (error) {
    console.error("Errore caricando struttura GIRONI da Supabase:", error);
    return;
  }

  setDataGroups((prev) => {
    const next = structuredClone(prev);

    const gKey = `group_${groupLetter}`;
    const group = next[gKey];
    if (!group) return next;

    // 1) ✅ CLEAR TOTALE: prima cancello pron/ris/results su TUTTE le partite del gruppo
    // (qui puoi anche NON fare flat: basta iterare direttamente le giornate)
    for (const giornata of Object.values(group)) {
      for (const match of giornata.matches) {
        match.pron = "";
        match.ris = "";
        match.results = "";
      }
    }

    // 2) ✅ APPLY DAL DB: applico quello che arriva dal DB usando mapping robusto
    for (const row of rows ?? []) {
      const idx = Number(row.match_index);
      const found = findMatchByGlobalIndex(group, idx);
      if (!found?.match) continue;

      const match = found.match;

      match.pron = row.seed_pron ?? "";
      match.ris = row.seed_ris ?? "";
      match.results = row.results_official ?? "";
    }

    return next;
  });
};



  const loadFinalsFromDb = async () => {
    const { data: finalRows, error: finalError } = await supabase
      .from("wc_final_structure")
      .select(`
        phase_key,
        match_index,
        day,
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

    if (finalError) {
      console.error("Errore caricando struttura FINALI da Supabase:", finalError);
      return;
    }

    setDataFinals((prev) => {
      const next = structuredClone(prev);

      // raggruppo per phase_key
      const rowsByPhase = {};
      for (const row of finalRows ?? []) {
        if (!rowsByPhase[row.phase_key]) rowsByPhase[row.phase_key] = [];
        rowsByPhase[row.phase_key].push(row);
      }

      for (const [phaseKey, rows] of Object.entries(rowsByPhase)) {
        const phase = next[phaseKey];
        if (!phase) continue;

        // costruisco flat per match_index
        const matchInfos = [];
        for (const [giornataKey, giornata] of Object.entries(phase)) {
          giornata.matches.forEach((m) => {
            matchInfos.push({ match: m, giornataKey });
          });
        }

         for (const row of rows) {
          const idx = Number(row.match_index);
          const found = findMatchByGlobalIndex(phase, idx);
          if (!found?.match) continue;

          const { match, giornataKey } = found;

          

          // ✅ DAY: sovrascrivi SEMPRE (NULL -> "")
          phase[giornataKey].dates[0] = row.day ?? "";

          // ✅ campi match: sovrascrivi SEMPRE
          match.time = row.time ?? "";
          match.city = row.city ?? "";
          match.pos1 = row.pos1 ?? "";
          match.pos2 = row.pos2 ?? "";
          match.goto = row.goto ?? "";
          match.fg = row.fg ?? "";
          match.pronsq = row.pronsq ?? "";
          match.team1 = row.team1 ?? "";
          match.team2 = row.team2 ?? "";

          // ✅ results: sovrascrivi SEMPRE
          if (!match.results) match.results = { RES: "", TS: "", R: "" };
          match.results.RES = row.results_res ?? "";
          match.results.TS = row.results_ts ?? "";
          match.results.R = row.results_r ?? "";
        }
      }

      return next;
    });
  };

//-----------------------------------------------------------------------------------------
    useEffect(() => {
  (async () => {
    // base sempre hardcoded
    const base = buildViewFromHardcoded(groupMatches);

    const { data } = await supabase.auth.getSession();
    const logged = !!data.session;
    setIsLogged(logged);

    if (!logged) {
      setViewByKey(base);
      return;
    }

    // logged -> override dal DB
    const { data: rows, error } = await supabase
      .from("wc_matches_structure")
      .select("group_letter, match_index, seed_pron, seed_ris, results_official");

    if (error) {
      console.error("Errore caricando VIEW da Supabase:", error);
      setViewByKey(base);
      return;
    }

    setViewByKey(applyDbOverride(base, rows));
  })();
}, []);

useEffect(() => {
  if (!isLogged) return;
  if (mode === "groups") void loadGroupsFromDb(activeGroup);
  else void loadFinalsFromDb();
}, [isLogged, mode, activeGroup, activeFinalKey]);


useEffect(() => {
  // al mount carico il gruppo iniziale (A) e i finals
  void loadGroupsFromDb(activeGroup);
  void loadFinalsFromDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


useEffect(() => {
    if (mode === "groups") {
      void loadGroupsFromDb(activeGroup);
    } else {
      void loadFinalsFromDb();
    }
  }, [mode, activeGroup, activeFinalKey]);


  useEffect(() => {
    const onFocus = () => {
      if (mode === "groups") void loadGroupsFromDb(activeGroup);
      else void loadFinalsFromDb();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [mode, activeGroup, activeFinalKey]);


//-----------------------------------------------------------------------------------------
  return (
    <div
      className={`
        flex-1 min-h-[100svh] bg-slate-950 relative 
        overflow-x-hidden
        overflow-y-auto
        text-white md:p-6 px-4
      `}
    >
      {/* HEADER STICKY: toggle + gruppi/fasi */}
      <div
        className="
          sticky -top-4 z-40 bg-slate-950
          md:static md:bg-slate-950 py-2
        "
      >
        {/* TOGGLE modalità */}
        <div className="md:mt-6 mt-3 mb-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setMode("groups")}
            className={`px-4 py-2 rounded-md text-sm md:text-base ${
              isGroupsMode
                ? "bg-pink-800 text-white"
                : "bg-slate-800 text-white/70"
            }`}
          >
            GIRONI A–L
          </button>

          <button
            type="button"
            onClick={() => setMode("finals")}
            className={`px-4 py-2 rounded-md text-sm md:text-base ${
              !isGroupsMode
                ? "bg-pink-800 text-white"
                : "bg-slate-800 text-white/70"
            }`}
          >
            FASE FINALE
          </button>
        </div>

        {/* LETTERE A–L oppure Fasi Finali */}
        <div className="flex justify-center flex-wrap gap-2 md:mb-0 mb-10 ">
          {isGroupsMode ? (
            <div className="flex justify-center flex-wrap gap-2">
              {Array.from("ABCDEFGHIJKL").map((letter) => {
                const isActive = letter === activeGroup;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setActiveGroup(letter)}
                    className={`
                      px-5 py-2 rounded-md 
                      text-base md:text-xl font-md
                      ${
                        isActive
                          ? "bg-pink-800 border-pink-800 text-white"
                          : "bg-slate-800 border-white/20 text-white/80 hover:bg-slate-700 hover:text-white"
                      }
                    `}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center flex-wrap gap-2">
              {FINAL_PHASES.map((phase) => {
                const isActive = phase.key === activeFinalKey;
                return (
                  <button
                    key={phase.key}
                    type="button"
                    onClick={() => setActiveFinalKey(phase.key)}
                    className={`
                      px-1 py-2
                      rounded-md 
                      text-base md:text-xl font-md
                      ${
                        isActive
                          ? "bg-pink-800 border-pink-800 text-white"
                          : "bg-slate-800 border-white/20 text-white/80 hover:bg-slate-700 hover:text-white"
                      }
                    `}
                  >
                    {phase.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* HEADER SOTTO */}
      <div className="md:mb-3 mb-0">
        <h1 className="text-lg md:text-xl font-semibold md:mt-0 !mt-0 md:ml-2 items-start justify-start">
          AdminMode - SeedData (
          {isGroupsMode ? `group ${activeGroup}` : `fase ${activeFinalKey}`})
        </h1>

        <div className="flex items-center gap-0 mt-0 md:-ml-2 ml-1 ">
          <button
            type="button"
            onClick={() => navigate("/admin/run-seed")}
            className="
             md:mb-0 mb-1
            rounded-md 
            md:p-4 p-2 
            md:mr-4 mr-2 
            md:ml-4 ml-0
            text-xss md:text-sm
            bg-gray-600
            hover:bg-emerald-500"
          >
            ❕
          </button>

          <span className="text-sm md:text-sm text-white/50">
            SeedSupabase - Pagina Campi ai valori hardcoded
          </span>
        </div>
      </div>

      {/* Nessun gruppo definito */}
      {!group && (
        <div className="text-sm text-white/70">
          Nessuna struttura definita per{" "}
          <span className="font-semibold">{groupKey}</span>.
        </div>
      )}

      {/* CONTENUTO: DESKTOP & MOBILE SEPARATI, ognuno con GIRONI/FINALI */}
      {group && (
        <>
          {/* 🖥 DESKTOP */}
          <div className="hidden md:block">
            {isGroupsMode ? (
              <DesktopGroupsSection
                group={group}
                handleDateChange={handleDateChange}
                handleMatchChange={handleMatchChange}
              />
            ) : (
              <DesktopFinalsSection
                group={group}
                handleDateChange={handleDateChange}
                handleMatchChange={handleMatchChange}
              />
            )}
          </div>

          {/* 📱 MOBILE */}
          <div className="md:hidden">
            {isGroupsMode ? (
              <MobileGroupsSection
                group={group}
                handleDateChange={handleDateChange}
                handleMatchChange={handleMatchChange}
              />
            ) : (
              <MobileFinalsSection
                group={group}
                handleDateChange={handleDateChange}
                handleMatchChange={handleMatchChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------ SEZIONI DESKTOP ------------------------- */
/* ------------------------------------------------------------------ */

function DesktopGroupsSection({ group, handleDateChange, handleMatchChange }) {
  return (
    <>
      {Object.entries(group).map(([giornataKey, giornata]) => (
        <div
          key={giornataKey}
          className="
            mb-8 border border-white/10 rounded-lg p-3 md:p-4 
            bg-slate-900
            w-full
            md:w-[1450px] md:mx-auto
          "
        >
          {/* HEADER GIORNATA */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="font-bold uppercase bg-pink-800 text-white text-base md:text-2xl px-3 py-1 rounded-md">
              {giornataKey}
            </div>
          </div>

          {/* MATCHES DESKTOP GIRONI */}
          <div className="space-y-3">
            {giornata.matches.map((match, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 md:gap-3 p-0 border border-white/10 rounded bg-slate-950/70"
              >
                {/* numero */}
                <div className="flex items-center gap-1 text-md md:text-xl w-[60px] md:mr-6">
                  <span className="text-white/70">numero:</span>
                  <span className="text-white/70 font-semibold">
                    {match.numero}
                  </span>
                </div>

                {/* day + city + time */}
                <div className="flex items-center gap-2 w-full md:w-auto md:ml-2 -ml-1">
                  <Field
                    label="day"
                    labelMobile=""
                    widthMobile="70px"
                    widthDesktop="90px"
                    className="!bg-pink-900 !px-2"
                    value={giornata.dates[0] || ""}
                    onChange={(v) => handleDateChange(giornataKey, 0, v)}
                  />

                  <Field
                    label="city"
                    labelMobile="city"
                    widthMobile="85px"
                    widthDesktop="180px"
                    value={match.city}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "city",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <Field
                    label="time"
                    labelMobile="time"
                    widthMobile="60px"
                    widthDesktop="80px"
                    value={match.time}
                    className="!px-1"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "time",
                        v,
                        match.numero,
                      )
                    }
                  />
                </div>

                {/* TEAM1 + TEAM2 */}
                <div className="flex w-full md:w-auto md:ml-8 ml-2">
                  <div className="flex-1 px-1 py-1 rounded">
                    <Field
                      label="team1"
                      labelMobile="T1"
                      widthMobile="80px"
                      widthDesktop="120px"
                      className="!bg-sky-900 ml-0"
                      value={match.team1}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "team1",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 px-1 py-1 rounded">
                    <Field
                      label="team2"
                      labelMobile="T2"
                      widthMobile="80px"
                      widthDesktop="120px"
                      className="!bg-sky-900 md:ml-0"
                      value={match.team2}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "team2",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>
                </div>

                {/* pron / ris / results + reset */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap w-full md:w-auto md:ml-8 ml-0 md:gap-2 gap-0">
                    <Field
                      label="pron"
                      labelMobile="pr"
                      widthMobile="50px"
                      widthDesktop="40px"
                      value={match.pron ?? ""}
                      maxLength={1}
                      allowedValues={["1", "X", "2"]}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "pron",
                          v,
                          match.numero,
                        )
                      }
                    />

                    <Field
                      label="ris"
                      labelMobile="ris"
                      widthMobile="50px"
                      widthDesktop="60px"
                      value={match.ris ?? ""}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "ris",
                          v,
                          match.numero,
                        )
                      }
                    />

                    <Field
                      label="results"
                      labelMobile="results"
                      widthMobile="55px"
                      widthDesktop="55px"
                      className="!bg-sky-900"
                      value={match.results}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "results",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pron",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "ris",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results",
                        "",
                        match.numero,
                      );
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                  >
                    🔄
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
function DesktopFinalsSection({ group, handleDateChange, handleMatchChange }) {
  return (
    <>
      {Object.entries(group).map(([giornataKey, giornata]) => (
        <div
          key={giornataKey}
          className="
            mb-8 border border-white/10 rounded-lg p-3 md:p-4 
            bg-slate-900
            w-full
            md:w-[1450px] md:mx-auto
          "
        >
          {/* HEADER GIORNATA */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="font-bold uppercase bg-pink-800 text-white text-base md:text-2xl px-3 py-1 rounded-md">
              {giornataKey}
            </div>
          </div>

          {/* MATCHES DESKTOP FINALI */}
          <div className="space-y-3">
            {giornata.matches.map((match, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-2 md:gap-3 p-0 border border-white/10 rounded bg-slate-950/70"
              >
                {/* numero */}
                <div className="flex items-center gap-1 text-md md:text-xl w-[60px] md:mr-6">
                  <span className="text-white/70">numero:</span>
                  <span className="text-white/70 font-semibold">
                    {match.numero}
                  </span>
                </div>

                {/* day + city + time + pronsq */}
                <div className="flex items-center gap-2 w-full md:w-auto md:ml-2 -ml-1">
                  <Field
                    label="day"
                    labelMobile=""
                    widthMobile="70px"
                    widthDesktop="90px"
                    className="!bg-pink-900 !px-2"
                    value={giornata.dates[0] || ""}
                    onChange={(v) => handleDateChange(giornataKey, 0, v)}
                  />

                  <Field
                    label="city"
                    labelMobile="city"
                    widthMobile="85px"
                    widthDesktop="120px"
                    value={match.city}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "city",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <Field
                    label="time"
                    labelMobile="time"
                    widthMobile="60px"
                    widthDesktop="80px"
                    value={match.time}
                    className="!px-2"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "time",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <div className="ml-1">
                    <Field
                      label="pronsq"
                      labelMobile="pSq"
                      widthMobile="100px"
                      widthDesktop="110px"
                      value={match.pronsq ?? ""}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "pronsq",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>
                </div>

                {/* TEAM1 + TEAM2 */}
                <div className="flex w-full md:w-auto md:ml-4 ml-2">
                  <div className="flex-1 px-1 py-1 rounded">
                    <Field
                      label="T1"
                      labelMobile="T1"
                      widthMobile="80px"
                      widthDesktop="120px"
                      className="!bg-sky-900"
                      value={match.team1}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "team1",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 px-1 py-1 rounded">
                    <Field
                      label="T2"
                      labelMobile="T2"
                      widthMobile="80px"
                      widthDesktop="120px"
                      className="!bg-sky-900"
                      value={match.team2}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "team2",
                          v,
                          match.numero,
                        )
                      }
                    />
                  </div>
                </div>

                {/* RES / TS / R + reset */}
                <div className="flex items-center md:ml-4 ml-0 md:gap-1 gap-0">
                  <Field
                    label="RES"
                    labelMobile="RES"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.results?.RES ?? ""}
                    className="!bg-sky-900"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.RES",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="TS"
                    labelMobile="TS"
                    widthMobile="60px"
                    widthDesktop="55px"
                    value={match.results?.TS ?? ""}
                    className="!bg-sky-950"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.TS",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="R"
                    labelMobile="R"
                    widthMobile="55px"
                    widthDesktop="55px"
                    value={match.results?.R ?? ""}
                    className="!bg-gray-800"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.R",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => {
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.RES",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.TS",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.R",
                        "",
                        match.numero,
                      );
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                  >
                    🔄
                  </button>
                </div>

                {/* pos1 / pos2 / goto / fg */}
                <div className="flex flex-wrap w-full md:w-auto md:gap-1 gap-0 px-1 py-1 md:ml-[6.5rem] ml-0">
                  <Field
                    label="pos1"
                    labelMobile="pos1"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.pos1}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pos1",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="pos2"
                    labelMobile="pos2"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.pos2}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pos2",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="goto"
                    labelMobile="goto"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.goto}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "goto",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="fg"
                    labelMobile="fg"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.fg}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "fg", v, match.numero)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------ SEZIONI MOBILE -------------------------- */
/* ------------------------------------------------------------------ */

function MobileGroupsSection({ group, handleDateChange, handleMatchChange }) {
  return (
    <>
      {Object.entries(group).map(([giornataKey, giornata]) => (
        <div
          key={giornataKey}
          className="
            mb-8 border border-white/10 rounded-lg p-3
            bg-slate-900 w-full
          "
        >
          {/* HEADER GIORNATA */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="font-bold uppercase bg-pink-800 text-white text-base px-3 py-1 rounded-md">
              {giornataKey}
            </div>
          </div>

          {/* MATCHES MOBILE GIRONI */}
          <div className="space-y-3">
            {giornata.matches.map((match, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 py-1 border border-white/10 rounded bg-slate-950/70"
              >
                {/* day + city + time */}
                <div className="flex items-center gap-[1.05rem] w-full">
                  <Field
                    label="day"
                    labelMobile=""
                    widthMobile="67px"
                    widthDesktop="90px"
                    className="!bg-pink-900 !px-2"
                    value={giornata.dates[0] || ""}
                    onChange={(v) => handleDateChange(giornataKey, 0, v)}
                  />
                  <Field
                    label="city"
                    labelMobile="city"
                    widthMobile="180px"
                    widthDesktop="180px"
                    value={match.city}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "city",
                        v,
                        match.numero,
                      )
                    }
                  />
                </div>
                <div className="flex items-center gap-[0.05rem] mt-1 md:ml-0">
                  <Field
                    label="time"
                    labelMobile="time"
                    widthMobile="60px"
                    widthDesktop="80px"
                    value={match.time}
                    className="!px-1"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "time",
                        v,
                        match.numero,
                      )
                    }
                  />

                  {/* TEAM1 + TEAM2 */}

                  <Field
                    label="team1"
                    labelMobile="T1"
                    widthMobile="80px"
                    widthDesktop="120px"
                    className="!bg-sky-900"
                    value={match.team1}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "team1",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="team2"
                    labelMobile="T2"
                    widthMobile="80px"
                    widthDesktop="120px"
                    className="!bg-sky-900"
                    value={match.team2}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "team2",
                        v,
                        match.numero,
                      )
                    }
                  />
                </div>

                {/* pron / ris / results + reset */}
                <div className="flex w-full items-center gap-[0.80rem] mt-1">
                  <Field
                    label="pron"
                    labelMobile="pron"
                    widthMobile="40px"
                    widthDesktop="40px"
                    value={match.pron ?? ""}
                    maxLength={1}
                    allowedValues={["1", "X", "2"]}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pron",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <Field
                    label="ris"
                    labelMobile="ris"
                    widthMobile="50px"
                    widthDesktop="60px"
                    value={match.ris ?? ""}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "ris",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <Field
                    label="results"
                    labelMobile="RES"
                    widthMobile="53px"
                    widthDesktop="55px"
                    className="!bg-sky-900 !text-white"
                    value={match.results}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => {
                      handleMatchChange(giornataKey, idx, "pron", "", match.numero);
                      handleMatchChange(giornataKey, idx, "ris", "", match.numero);
                      handleMatchChange(giornataKey, idx, "results", "", match.numero);
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                  >
                    🔄
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
function MobileFinalsSection({ group, handleDateChange, handleMatchChange }) {
  return (
    <>
      {Object.entries(group).map(([giornataKey, giornata]) => (
        <div
          key={giornataKey}
          className="
            mb-8 border border-white/10 rounded-lg p-3
            bg-slate-900 w-full
          "
        >
          {/* HEADER GIORNATA */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="font-bold uppercase bg-pink-800 text-white text-base px-3 py-1 rounded-md">
              {giornataKey}
            </div>
          </div>

          {/* MATCHES MOBILE FINALI */}
          <div className="space-y-3">
            {giornata.matches.map((match, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-0 border border-white/10 rounded bg-slate-950/70"
              >
                {/* day + city + time */}
                <div className="flex items-center gap-2 w-full">
                  <Field
                    label="day"
                    labelMobile=""
                    widthMobile="90px"
                    widthDesktop="90px"
                    className="!bg-pink-900"
                    value={giornata.dates[0] || ""}
                    onChange={(v) => handleDateChange(giornataKey, 0, v)}
                  />
                  <Field
                    label="city"
                    labelMobile="city"
                    widthMobile="100px"
                    widthDesktop="120px"
                    value={match.city}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "city",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="time"
                    labelMobile="time"
                    widthMobile="55px"
                    widthDesktop="80px"
                    value={match.time}
                    className="!px-1"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "time",
                        v,
                        match.numero,
                      )
                    }
                  />
                </div>

                {/* pos1 / pos2 / goto / fg */}
                <div className="flex w-full flex-wrap gap-[0.2rem] mt-0 !px-0">
                  <Field
                    label="pos1"
                    labelMobile="pos1"
                    widthMobile="45px"
                    widthDesktop="50px"
                    value={match.pos1}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pos1",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="pos2"
                    labelMobile="pos2"
                    widthMobile="45px"
                    widthDesktop="50px"
                    value={match.pos2}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pos2",
                        v,
                        match.numero,
                      )
                    }
                  />{" "}
                  <Field
                    label="goto"
                    labelMobile="goto"
                    widthMobile="45px"
                    widthDesktop="50px"
                    value={match.goto}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "goto",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="fg"
                    labelMobile="fg"
                    widthMobile="45px"
                    widthDesktop="50px"
                    className="!mr-2"
                    value={match.fg}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "fg", v, match.numero)
                    }
                  />
                </div>

                {/* T1, T2 */}
                <div className="flex items-center gap-[0.10rem] md:ml-0 ml-0">
                  <Field
                    label="pronsq"
                    labelMobile="pSq"
                    widthMobile="90px"
                    widthDesktop="120px"
                    className="mr-0"
                    value={match.pronsq ?? ""}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "pronsq",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="T1"
                    labelMobile="T1"
                    widthMobile="80px"
                    widthDesktop="130px"
                    className="!bg-sky-900 mr-0"
                    value={match.team1}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "team1",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="T2"
                    labelMobile="T2"
                    widthMobile="80px"
                    widthDesktop="130px"
                    className="!bg-sky-900"
                    value={match.team2}
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "team2",
                        v,
                        match.numero,
                      )
                    }
                  />
                </div>

                {/* RES / TS / R + reset */}
                <div className="flex items-center gap-[0.1rem]">
                  <Field
                    label="RES"
                    labelMobile="RES"
                    widthMobile="50px"
                    widthDesktop="50px"
                    value={match.results?.RES ?? ""}
                    className="!bg-sky-900"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.RES",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="TS"
                    labelMobile="TS"
                    widthMobile="45px"
                    widthDesktop="55px"
                    value={match.results?.TS ?? ""}
                    className="!bg-sky-950"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.TS",
                        v,
                        match.numero,
                      )
                    }
                  />
                  <Field
                    label="R"
                    labelMobile="R"
                    widthMobile="55px"
                    widthDesktop="55px"
                    value={match.results?.R ?? ""}
                    className="!bg-gray-800"
                    onChange={(v) =>
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.R",
                        v,
                        match.numero,
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() => {
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.RES",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.TS",
                        "",
                        match.numero,
                      );
                      handleMatchChange(
                        giornataKey,
                        idx,
                        "results.R",
                        "",
                        match.numero,
                      );
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                  >
                    🔄
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* -------------------------- CAMPO GENERICO ------------------------ */
/* ------------------------------------------------------------------ */

function Field({
  label,
  labelMobile,
  value,
  onChange,
  widthMobile = "80px",
  widthDesktop = "120px",
  type = "text",
  className = "",
  maxLength,
  allowedValues,
}) {
  const handleInputChange = (e) => {
    let raw = e.target.value;

    // ⏱ CAMPO TIME → solo numeri, formato HH:MM
    if (label === "time") {
      const previous = value ?? "";
      const isAdding = raw.length > previous.length; // true se sta scrivendo, false se sta cancellando

      let digits = raw.replace(/\D/g, "");
      digits = digits.slice(0, 4);

      if (digits.length === 0) {
        onChange("");
        return;
      }

      if (digits.length === 1) {
        // prima cifra, nessun :
        onChange(digits);
        return;
      }

      if (digits.length === 2) {
        // se sta scrivendo → "HH:"
        // se sta cancellando → "HH" (così non rimette il :)
        onChange(isAdding ? `${digits}:` : digits);
        return;
      }

      // 3 o 4 cifre → HH:M o HH:MM
      const hh = digits.slice(0, 2);
      const mm = digits.slice(2);
      onChange(`${hh}:${mm}`);
      return;
    }

    // 📅 CAMPO DAY → formato LLL/DD (GIU/28) con slash intelligente
    if (label === "day") {
      const previous = value ?? "";
      const isAdding = raw.length > previous.length; // true = sta scrivendo, false = sta cancellando

      const upper = raw.toUpperCase();
      let letters = upper.replace(/[^A-Z]/g, "").slice(0, 3); // max 3 lettere
      let digits = upper.replace(/[^0-9]/g, "").slice(0, 2); // max 2 numeri

      // Nessuna lettera → vuoto
      if (letters.length === 0) {
        onChange("");
        return;
      }

      // 1-2 lettere: semplici, nessuno slash
      if (letters.length < 3) {
        onChange(letters);
        return;
      }

      // 3 lettere → aggiungi "/" solo se sta scrivendo
      if (letters.length === 3 && digits.length === 0) {
        onChange(isAdding ? `${letters}/` : letters);
        return;
      }

      // 3 lettere + 1-2 numeri → GIU/2 o GIU/28
      const month = letters;
      const day = digits;
      onChange(`${month}/${day}`);
      return;
    }

    // 🔢 CAMPI POSIZIONE: pos1 / pos2
    if (label === "pos1" || label === "pos2") {
      let v = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");

      if (!v) {
        onChange("");
        return;
      }

      const first = v[0];

      if (!["1", "2", "3"].includes(first)) {
        return;
      }

      if (first === "1" || first === "2") {
        const letter = v.slice(1).replace(/[^A-Z]/g, "")[0] || "";
        onChange(first + letter);
        return;
      }

      if (first === "3") {
        const letters = v.slice(1).replace(/[^A-Z]/g, "");
        onChange(first + letters);
        return;
      }
    }

    // ⚽ CAMPI RISULTATO: ris / RES / TS / R / results → formato 1-2
    if (["ris", "RES", "results", "TS", "R"].includes(label)) {
      const previous = value ?? ""; // valore attuale nel campo
      const isAdding = raw.length > previous.length; // true se sta scrivendo, false se sta cancellando

      let digits = raw.replace(/\D/g, "");
      digits = digits.slice(0, 2);

      if (!digits.length) {
        onChange("");
        return;
      }

      if (digits.length === 1) {
        // se sta scrivendo →  "1-"
        // se sta cancellando → solo "1" (così puoi togliere anche il numero)
        onChange(isAdding ? `${digits[0]}-` : digits[0]);
        return;
      }

      // due cifre → "1-2"
      onChange(`${digits[0]}-${digits[1]}`);
      return;
    }

    // 🇵🇹 CAMPO PRONSQ → SOLO LETTERE, formato AAA-BBB
    if (label === "pronsq") {
      const previous = (value ?? "").toUpperCase();
      const isAdding = raw.length > previous.length; // true se sta scrivendo, false se sta cancellando

      let letters = raw.toUpperCase().replace(/[^A-Z]/g, "");
      letters = letters.slice(0, 6);

      if (letters.length === 0) {
        onChange("");
        return;
      }

      if (letters.length <= 3) {
        // Se sta scrivendo e ha appena completato 3 lettere → AAA-
        // Se sta cancellando → solo AAA (senza bloccare il backspace sul trattino)
        onChange(isAdding && letters.length === 3 ? `${letters}-` : letters);
        return;
      }

      // Da 4 a 6 lettere → AAA-BBB
      const first = letters.slice(0, 3);
      const second = letters.slice(3);
      onChange(`${first}-${second}`);
      return;
    }

    // LOGICA GENERICA (city, team1, team2, pron, ecc.)
    // LOGICA GENERICA (city, team1, team2, pron, ecc.)
    let v = raw;

    // per questi campi vogliamo MAIUSCOLO
    if (["team1", "team2", "pron"].includes(label)) {
      v = v.toUpperCase();
    }

    if (maxLength) v = v.slice(0, maxLength);

    if (allowedValues && v !== "" && !allowedValues.includes(v)) return;

    onChange(v);
  };

  // LARGHEZZA DINAMICA per pos1 / pos2
  const isPosField = label === "pos1" || label === "pos2";

  const mobileWidth = isPosField
    ? value?.startsWith("3")
      ? "50px"
      : "50px"
    : widthMobile;

  const desktopWidth =
    label === "pos1"
      ? value?.startsWith("3")
        ? "160px"
        : "50px"
      : label === "pos2"
        ? "90px"
        : widthDesktop;

  return (
    <div className="flex items-center gap-0 text-base md:text-xl">
      {/* LABEL DESKTOP */}
      <span className="hidden md:inline text-white/70">{label}:</span>

      {/* LABEL MOBILE */}
      <span className="md:hidden text-white/70">{labelMobile ?? label}</span>

      <input
        data-field={label}
        type={type}
        className={`
          bg-slate-800 border border-white/20 rounded
          px-3 py-2
          text-white text-sm md:text-lg font-semibold
          ${className}
        `}
        style={{
          width: mobileWidth,
        }}
        value={value ?? ""}
        maxLength={
          label === "ris" ||
          label === "RES" ||
          label === "TS" ||
          label === "R" ||
          label === "results"
            ? 3
            : label === "pronsq"
              ? 7
              : label === "time"
                ? 5
                : label === "day"
                  ? 6
                  : maxLength
        }
        onChange={handleInputChange}
      />

      {/* Override larghezza in DESKTOP */}
      <style>{`
        @media (min-width: 768px) {
          input[data-field="${label}"] {
            width: ${desktopWidth} !important;
          }
        }
      `}</style>
    </div>
  );
}
