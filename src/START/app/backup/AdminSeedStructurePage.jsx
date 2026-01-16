import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";
import { groupFinal } from "../2GroupFinal";
import MatchRowDesktop from "../admin/MatchRowDesktop";
import MatchRowMobile from "../admin/MatchRowMobile";

// quali campi dell'editor corrispondono a quali colonne nel DB
const fieldToDbColumn = {
  city: "city",
  team1: "team1",
  team2: "team2",
  pron: "seed_pron",
  ris: "seed_ris",
  results: "results_official",
  // numero e time non stanno in wc_match_structure
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

async function updateFinalMatchFieldInDb(
  phaseKey,
  matchIndex, // <-- ora passo direttamente il match_index del DB
  field,
  value
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
      value
    );
  }
}

async function updateMatchFieldInDb(groupLetter, matchNumero, field, value) {
  const column = fieldToDbColumn[field];
  if (!column) return; // se field non è mappato (es. "numero" o "time"), non fare nulla

  const matchIndex = matchNumero - 1; // perché nel seed usavi index 0-based

  const payload = {
    [column]: value === "" ? null : value,
  };

  const { error } = await supabase
    .from("wc_match_structure")
    .update(payload)
    .eq("group_letter", groupLetter)
    .eq("match_index", matchIndex);

  if (error) {
    console.error("❌ Errore aggiornando Supabase:", error);
  } else {
    console.log(
      `✅ Aggiornato ${column} per gruppo ${groupLetter}, match_index=${matchIndex} →`,
      value
    );
  }
}

export default function AdminSeedStructure() {
  // Copia modificabile dei gironi A–L
  const [dataGroups, setDataGroups] = useState(() =>
    structuredClone(groupMatches)
  );
  // Copia modificabile della fase finale
  const [dataFinals, setDataFinals] = useState(() =>
    structuredClone(groupFinal)
  );

  // modalità: gironi A–L o fase finale
  const [mode, setMode] = useState("groups"); // "groups" | "finals"
  const isGroupsMode = mode === "groups";

  // gruppi A–L
  const [activeGroup, setActiveGroup] = useState("A");

  // fasi finali
  const FINAL_PHASES = [
    { key: "round32", label: "R32" },
    { key: "round16", label: "R16" },
    { key: "quarterFinals", label: "QF" },
    { key: "semifinals", label: "SF" },
    { key: "final34", label: "3 / 4" },
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

  const handleDateChange = (giornataKey, dateIndex, value) => {
    // 1) aggiorno lo state
    updateData((prev) => {
      const next = structuredClone(prev);
      next[groupKey][giornataKey].dates[dateIndex] = value;
      return next;
    });

    // 2) se sono in FASE FINALE, salvo nel DB
    if (!isGroupsMode) {
      // prendo TUTTI i match della fase corrente (round32, round16, ecc.)
      const phase = currentData[groupKey];
      if (!phase) return;

      // flatten giornate → stesso ordine usato nel useEffect
      const allGiornate = Object.values(phase);
      const flat = [];
      for (const g of allGiornate) {
        for (const m of g.matches) flat.push(m);
      }

      // trova il primo match di quella giornata (stessa logica dei tuoi seed)
      const firstMatch =
        flat.find((m) => m.giornataKey === giornataKey) || flat[0];

      if (!firstMatch?.numero) return;

      // usa updateFinalMatchFieldInDb per salvare il day legato a quel match
      void updateFinalMatchFieldInDb(
        activeFinalKey,
        firstMatch.numero,
        "day",
        value
      );
    }
  };

  const handleMatchChange = (
    giornataKey,
    matchIndexLocal,
    field,
    value,
    numero
  ) => {
    // 1️⃣ aggiorno lo state (UI reattiva)
    updateData((prev) => {
      const next = structuredClone(prev);
      const match = next[groupKey][giornataKey].matches[matchIndexLocal];

      // FINALI → campi annidati results.ris / results.TS / results.R
      if (!isGroupsMode && field.startsWith("results.")) {
        const key = field.split(".")[1]; // "ris" | "TS" | "R"

        if (!match.results) {
          match.results = { RES: "", TS: "", R: "" };
        }

        match.results[key] = value;
      } else {
        // tutti gli altri campi normali (gironi + altri campi finali)
        match[field] = field === "numero" ? Number(value) || 0 : value;
      }

      return next;
    });

    // 2️⃣ aggiorno il DB
    if (typeof numero === "number") {
      if (isGroupsMode) {
        // GIRONI A–L (qui puoi tenere il tuo matchNumero -1 perché i numeri sono globali)
        void updateMatchFieldInDb(activeGroup, numero, field, value);
      } else {
        // FASE FINALE
        // calcolo il match_index nel DB flattenando le giornate, nello stesso ordine
        // che usi nel useEffect

        const phase = dataFinals[activeFinalKey]; // es. round32, round16, ecc.
        if (!phase) return;

        let globalIndex = 0;

        for (const [gKey, g] of Object.entries(phase)) {
          if (gKey === giornataKey) {
            // siamo arrivati alla giornata corrente:
            // aggiungo l'indice locale del match (idx)
            globalIndex += matchIndexLocal;
            break;
          }

          // altrimenti sommo tutti i match delle giornate precedenti
          globalIndex += g.matches.length;
        }

        // ora globalIndex è esattamente il match_index del DB
        void updateFinalMatchFieldInDb(
          activeFinalKey,
          globalIndex,
          field,
          value
        );
      }
    }
  };

  useEffect(() => {
    (async () => {
      //
      // 1️⃣ CARICO GIRONI A–L
      //
      const { data: rows, error } = await supabase
        .from("wc_match_structure")
        .select(
          "group_letter, match_index, city, team1, team2, seed_pron, seed_ris, results_official"
        );

      if (error) {
        console.error("Errore caricando struttura GIRONI da Supabase:", error);
      } else {
        setDataGroups((prev) => {
          const next = structuredClone(prev);

          for (const row of rows ?? []) {
            const groupKey = `group_${row.group_letter}`;
            const group = next[groupKey];
            if (!group) continue;

            // flatten delle giornate
            const allGiornate = Object.values(group);
            const flat = [];
            for (const g of allGiornate) {
              for (const m of g.matches) flat.push(m);
            }

            const match = flat[row.match_index];
            if (!match) continue;

            if (row.city) match.city = row.city;
            if (row.team1) match.team1 = row.team1;
            if (row.team2) match.team2 = row.team2;
            if (row.seed_pron) match.pron = row.seed_pron;
            if (row.seed_ris) match.ris = row.seed_ris;
            if (row.results_official) match.results = row.results_official;
          }

          return next;
        });
      }

      //
      // 2️⃣ CARICO FASE FINALE
      //
      const { data: finalRows, error: finalError } = await supabase.from(
        "wc_final_structure"
      ).select(`
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
        console.error(
          "Errore caricando struttura FINALI da Supabase:",
          finalError
        );
        return;
      }

      setDataFinals((prev) => {
        const next = structuredClone(prev);

        for (const row of finalRows ?? []) {
          const phaseKey = row.phase_key; // es. "round16", "quarterFinals", ecc.
          const phase = next[phaseKey];
          if (!phase) continue;

          // flatten giornate della fase
          const allGiornate = Object.values(phase);
          const flat = [];
          for (const g of allGiornate) {
            for (const m of g.matches) flat.push(m);
          }

          const match = flat[row.match_index];
          if (!match) continue;

          if (row.day) {
            // (la logica per assegnare il day alla giornata la puoi completare qui se ti serve)
          }
          if (row.time) match.time = row.time;
          if (row.city) match.city = row.city;
          //---
          if (row.pos1) match.pos1 = row.pos1;
          if (row.pos2) match.pos2 = row.pos2;
          if (row.goto) match.goto = row.goto;
          if (row.fg) match.fg = row.fg;
          if (row.pronsq) match.pronsq = row.pronsq;
          //---
          if (row.team1) match.team1 = row.team1;
          if (row.team2) match.team2 = row.team2;

          // risultati annidati
          if (row.results_ris || row.results_ts || row.results_r) {
            if (!match.results) {
              match.results = { RES: "", TS: "", R: "" };
            }
            if (row.results_res) match.results.ris = row.results_ris;
            if (row.results_ts) match.results.TS = row.results_ts;
            if (row.results_r) match.results.R = row.results_r;
          }
        }

        return next;
      });
    })();
  }, []);

  //-----------------------------------------------------------------------------------

  return (
    <div
      className={`
        flex-1 min-h-[100svh] bg-slate-950 relative 
        overflow-x-hidden
        ${isGroupsMode ? "overflow-y-auto lg:overflow-y-hidden" : "overflow-y-auto"}
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
        <div className="mt-3 mb-4 flex justify-center gap-3">
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
                      px-3 py-2
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

      <div
        className={`
          md:mb-3 
          mb-0
          ${isGroupsMode ? "" : "mt-12 md:mt-0"} 
        `}
      >
        <h1 className="text-lg md:text-xl font-semibold  md:mt-0 !mt-0 md:ml-2 items-start justify-start">
          Admin Mode - Seed Structure (
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
            bg-emerald- 600 bg-gray-600
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

      {/* Gruppo definito → mostra giornate e match */}
      {group &&
        Object.entries(group).map(([giornataKey, giornata]) => (
          <div
            key={giornataKey}
            className="
             md:mt-4 mt-0
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

            {/* MATCHES */}
            <div className="space-y-3">
              {giornata.matches.map((match, idx) => (
                <div key={idx}>
                  <MatchRowDesktop
                    isGroupsMode={isGroupsMode}
                    giornataKey={giornataKey}
                    giornata={giornata}
                    match={match}
                    idx={idx}
                    handleMatchChange={handleMatchChange}
                    handleDateChange={handleDateChange}
                  />
                  <MatchRowMobile
                    isGroupsMode={isGroupsMode}
                    giornataKey={giornataKey}
                    giornata={giornata}
                    match={match}
                    idx={idx}
                    handleMatchChange={handleMatchChange}
                    handleDateChange={handleDateChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
