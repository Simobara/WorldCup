import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";
import { groupFinal } from "../2GroupFinal";

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

export default function AdminSeedStructurePage() {
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

  //   const handleLog = () => {
  //     console.log(`${groupKey} STRUCTURE:`, group);
  //     alert(`Struttura ${groupKey} loggata in console`);
  //   };

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
            // prendo la giornata giusta e sovrascrivo la data
            const phase = next[phaseKey];
            const giornate = Object.entries(phase);
            // qui puoi scegliere tu la logica per associare row.day alla giornata corretta
            // per esempio, se sai che match_index 0-3 = giornata_1, 4-7 = giornata_2, ecc.
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
                      px-3 py-2          // 👈 come i gironi
                      rounded-md 
                      text-base md:text-xl font-md   // 👈 come i gironi
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

              {/* Supporta più dates (es. group_B giornata_1) */}
              {/* <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
                <span className="text-white/70">date:</span>
                {giornata.dates.map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white w-20 text-center"
                    value={d}
                    onChange={(e) =>
                      handleDateChange(giornataKey, i, e.target.value)
                    }
                  />
                ))}
              </div> */}
            </div>

            {/* MATCHES */}
            <div className="space-y-3">
              {giornata.matches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 md:gap-3 p-0 border border-white/10 rounded bg-slate-950/70"
                >
                  {/* numero → solo DESKTOP */}
                  <div className="hidden md:flex items-center md:gap-1 gap-0 text-md md:text-xl w-[60px] md:mr-6">
                    <span className="text-white/70">numero:</span>
                    <span className="text-white/70 font-semibold">
                      {match.numero}
                    </span>
                  </div>

                  {/* day + city + time → in linea su mobile */}
                  <div className="flex items-center md:gap-1 gap-1 w-full md:w-auto md:ml-2 -ml-1">
                    <Field
                      label="day"
                      labelMobile=""
                      widthMobile="70px"
                      widthDesktop="90px"
                      className={`${!isGroupsMode ? "!px-2" : ""} !bg-pink-900`}
                      value={giornata.dates[0] || ""}
                      onChange={(v) => handleDateChange(giornataKey, 0, v)}
                    />

                    <Field
                      label="city"
                      labelMobile="city"
                      widthMobile="85px"
                      widthDesktop={isGroupsMode ? "220px" : "120px"}
                      value={match.city}
                      onChange={(v) =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "city",
                          v,
                          match.numero
                        )
                      }
                    />

                    <div className=" flex items-center gap-1">
                      <Field
                        label="time"
                        labelMobile="time"
                        widthMobile="65px"
                        widthDesktop="80px"
                        value={match.time}
                        className={!isGroupsMode ? "!px-2" : ""}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "time",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* SOLO FINALE → pronsq DOPO TIME (SOLO DESKTOP) */}
                      {!isGroupsMode && (
                        <div className="hidden md:block">
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
                                match.numero
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TEAM1 + TEAM2 */}
                  <div
                    className={`
                      w-full md:w-auto gap-1 ml-2
                      ${!isGroupsMode ? "hidden md:flex" : "flex"}
                    `}
                  >
                    {/* TEAM 1 */}
                    <div className="flex-1 px-1 py-1 rounded">
                      <Field
                        label={isGroupsMode ? "team1" : "T1"}
                        labelMobile="T1"
                        widthMobile="80px"
                        widthDesktop="130px"
                        className="!bg-sky-900 ml-2"
                        value={match.team1}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "team1",
                            v,
                            match.numero
                          )
                        }
                      />
                    </div>

                    {/* TEAM 2 */}
                    <div className="flex-1 px-1 py-1 rounded !ml-6">
                      <Field
                        label={isGroupsMode ? "team2" : "T2"}
                        labelMobile="T2"
                        widthMobile="80px"
                        widthDesktop="130px"
                        className="!bg-sky-900 md:ml-0"
                        value={match.team2}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "team2",
                            v,
                            match.numero
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* FINALI: ris / TS / R subito dopo le squadre (solo DESKTOP) */}
                  {!isGroupsMode && (
                    <div className="hidden md:flex items-center gap-2">
                      <Field
                        label="RES"
                        labelMobile="RES"
                        widthMobile="50px"
                        widthDesktop="50px"
                        value={match.results?.ris ?? ""}
                        className="!bg-sky-900"
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results.RES",
                            v,
                            match.numero
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
                            match.numero
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
                            match.numero
                          )
                        }
                      />

                      {/* 🔄 reset solo FINALI desktop, subito dopo R */}
                      <button
                        type="button"
                        onClick={() => {
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results.RES",
                            "",
                            match.numero
                          );
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results.TS",
                            "",
                            match.numero
                          );
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results.R",
                            "",
                            match.numero
                          );
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                      >
                        🔄
                      </button>
                    </div>
                  )}

                  {/* SOLO FASE FINALE: posizioni e collegamenti (SOLO DESKTOP) */}
                  {!isGroupsMode && (
                    <div className="hidden md:flex flex-wrap w-full md:w-auto md:gap-1 gap-0 md:px-1 px-0 py-1 md:ml-24 ml-0">
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
                            match.numero
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
                            match.numero
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
                            match.numero
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
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "fg",
                            v,
                            match.numero
                          )
                        }
                      />
                    </div>
                  )}

                  {/* --- DESKTOP: campi pron / risultati --- */}
                  <div className="hidden md:flex items-center gap-2">
                    {isGroupsMode ? (
                      <>
                        {/* GIRONI A–L → pron / ris / results flat */}
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
                              match.numero
                            )
                          }
                        />

                        <Field
                          label="ris"
                          labelMobile="ris"
                          widthMobile="50px"
                          widthDesktop="50px"
                          value={match.ris ?? ""}
                          onChange={(v) =>
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "ris",
                              v,
                              match.numero
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
                              match.numero
                            )
                          }
                        />

                        {/* 🔄 reset SOLO per gironi */}
                        <button
                          type="button"
                          onClick={() => {
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "ris",
                              "",
                              match.numero
                            );
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "results",
                              "",
                              match.numero
                            );
                          }}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                        >
                          🔄
                        </button>
                      </>
                    ) : (
                      <>
                        {/* FASE FINALE → qui niente, gestito sopra vicino a ris/TS/R */}
                      </>
                    )}
                  </div>

                  {/* --- MOBILE: layout diverso per Gironi vs Fase Finale --- */}
                  {isGroupsMode ? (
                    // 🔹 GIRONI A–L → come prima
                    <div className="flex md:hidden w-full items-center gap-1 mt-1">
                      <Field
                        label="pronsq"
                        labelMobile="pSq"
                        widthMobile="90px"
                        widthDesktop="110px"
                        value={match.pronsq ?? ""}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "pronsq",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* GIRONI A–L mobile */}
                      <Field
                        label="ris"
                        labelMobile="ris"
                        widthMobile="50px"
                        widthDesktop="50px"
                        value={match.ris ?? ""}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "ris",
                            v,
                            match.numero
                          )
                        }
                      />

                      <Field
                        label="results"
                        labelMobile="RES"
                        widthMobile="55px"
                        widthDesktop="55px"
                        className="!bg-sky-900 !text-black"
                        value={match.results}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results",
                            v,
                            match.numero
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => {
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "ris",
                            "",
                            match.numero
                          );
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results",
                            "",
                            match.numero
                          );
                        }}
                        className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                      >
                        🔄
                      </button>
                    </div>
                  ) : (
                    // 🔹 FASE FINALE MOBILE → ordine: pos1 pos2 goto fg pSq T1 T2 ris TS R
                    <div className="flex md:hidden w-full flex-wrap md:gap-2 gap-[0.9rem] mt-1">
                      {/* pos1, pos2, goto, fg */}
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
                            match.numero
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
                            match.numero
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
                            match.numero
                          )
                        }
                      />
                      <Field
                        label="fg"
                        labelMobile="fg"
                        widthMobile="50px"
                        widthDesktop="50px"
                        value={match.fg}
                        className="!mr-5"
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "fg",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* pSq */}
                      <Field
                        label="pronsq"
                        labelMobile="pSq"
                        widthMobile="100px"
                        widthDesktop="120px"
                        value={match.pronsq ?? ""}
                        className=" !mr-24"
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "pronsq",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* T1, T2 */}
                      <Field
                        label="T1"
                        labelMobile="T1"
                        widthMobile="90px"
                        widthDesktop="130px"
                        className="!bg-sky-900 mr-2"
                        value={match.team1}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "team1",
                            v,
                            match.numero
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
                            match.numero
                          )
                        }
                      />
                      <div className="flex items-center gap-2 ml-[0]">
                        {/* ris, TS, R */}
                        <Field
                          label="RES"
                          labelMobile="RES"
                          widthMobile="50px"
                          widthDesktop="50px"
                          value={match.results?.ris ?? ""}
                          className="!bg-sky-900"
                          onChange={(v) =>
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "results.RES",
                              v,
                              match.numero
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
                              match.numero
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
                              match.numero
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
                              match.numero
                            );
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "results.TS",
                              "",
                              match.numero
                            );
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "results.R",
                              "",
                              match.numero
                            );
                          }}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

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

    //
    // ⏱ CAMPO TIME → solo numeri, formato HH:MM
    //
    if (label === "time") {
      let digits = raw.replace(/\D/g, ""); // solo cifre
      digits = digits.slice(0, 4); // HHMM

      let formatted = "";

      if (digits.length === 0) {
        formatted = "";
      } else if (digits.length <= 2) {
        // 1 cifra → "0"
        // 2 cifre → "04:"
        formatted = digits.length === 2 ? `${digits}:` : digits;
      } else {
        // 3–4 cifre → "04:0", "04:00"
        const hh = digits.slice(0, 2);
        const mm = digits.slice(2); // 1–2 cifre
        formatted = `${hh}:${mm}`;
      }

      onChange(formatted);
      return;
    }

    //
    // 📅 CAMPO DAY → formato LLL/DD (es. GIU/28)
    //
    if (label === "day") {
      const upper = raw.toUpperCase();

      // prendo *solo* lettere e *solo* numeri
      const lettersOnly = upper.replace(/[^A-Z]/g, "");
      const digitsOnly = upper.replace(/[^0-9]/g, "");

      const month = lettersOnly.slice(0, 3); // max 3 lettere
      const dayNum = digitsOnly.slice(0, 2); // max 2 numeri

      let formatted = "";

      if (month.length === 0) {
        formatted = "";
      } else if (month.length < 3) {
        // sto ancora scrivendo il mese
        formatted = month;
      } else {
        // 3 lettere già pronte
        formatted = dayNum.length > 0 ? `${month}/${dayNum}` : `${month}/`;
      }

      onChange(formatted);
      return;
    }

    //
    // 🔢 CAMPI POSIZIONE: pos1 / pos2
    //
    if (label === "pos1" || label === "pos2") {
      let v = raw.toUpperCase().replace(/[^0-9A-Z]/g, ""); // solo 0–9 e A–Z

      if (!v) {
        onChange("");
        return;
      }

      const first = v[0];

      // il primo DEVE essere 1, 2 o 3
      if (!["1", "2", "3"].includes(first)) {
        return; // input bloccato
      }

      // CASO 1 o 2 → NUMERO + UNA LETTERA (es. 1A, 2F)
      if (first === "1" || first === "2") {
        const letter = v.slice(1).replace(/[^A-Z]/g, "")[0] || "";
        onChange(first + letter);
        return;
      }

      // CASO 3 → NUMERO + LETTERE (lunghezza variabile, es. 3A/B/C/D/F)
      if (first === "3") {
        const letters = v.slice(1).replace(/[^A-Z]/g, "");
        onChange(first + letters);
        return;
      }
    }

    //
    // ⚽ CAMPI RISULTATO: ris / TS / R / results → formato 1-2
    //
    if (["ris", "RES", "results", "TS", "R"].includes(label)) {
      let digits = raw.replace(/\D/g, "");
      digits = digits.slice(0, 2);
      let formatted = "";
      if (!digits.length) formatted = "";
      else if (digits.length === 1) formatted = `${digits[0]}-`;
      else formatted = `${digits[0]}-${digits[1]}`;
      onChange(formatted);
      return;
    }

    //
    // 🇵🇹 CAMPO PRONSQ → SOLO LETTERE, formato AAA-BBB
    //
    if (label === "pronsq") {
      let letters = raw.toUpperCase().replace(/[^A-Z]/g, ""); // solo A–Z
      letters = letters.slice(0, 6); // 3 + 3

      let formatted = "";

      if (letters.length === 0) {
        formatted = "";
      } else if (letters.length <= 3) {
        // 1–2 lettere → "K", "KO"
        // 3 lettere → "KOR-"
        formatted = letters.length === 3 ? `${letters}-` : letters;
      } else {
        // 4–6 lettere → "KOR-I", "KOR-IT", "KOR-ITA"
        const first = letters.slice(0, 3);
        const second = letters.slice(3);
        formatted = `${first}-${second}`;
      }

      onChange(formatted);
      return;
    }

    //
    // LOGICA GENERICA (city, team1, team2, pron, ecc.)
    //
    let v = raw.toUpperCase();

    if (maxLength) v = v.slice(0, maxLength);

    // per campi con valori ammessi (es. pron 1/X/2)
    if (allowedValues && v !== "" && !allowedValues.includes(v)) return;

    onChange(v);
  };

  //
  // 🎯 LARGHEZZA DINAMICA per pos1 / pos2 (mobile + desktop)
  //
  const isPosField = label === "pos1" || label === "pos2";

  const mobileWidth = isPosField
    ? value?.startsWith("3")
      ? "80px" // es. "3ABCDF"
      : "50px" // "1A", "2B"
    : widthMobile;

  const desktopWidth =
    label === "pos1"
      ? value?.startsWith("3")
        ? "160px"
        : "50px"
      : label === "pos2"
        ? value?.startsWith("2") || value?.startsWith("3")
          ? "90px"
          : "90px" // se vuoi diversificare per "1", dimmelo
        : widthDesktop;

  return (
    <div className="flex items-center gap-1 text-base md:text-xl">
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
        value={value}
        // limiti fissi per i campi "speciali"
        maxLength={
          label === "ris" ||
          label === "RES" ||
          label === "TS" ||
          label === "R" ||
          label === "results"
            ? 3 // "1-2"
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
