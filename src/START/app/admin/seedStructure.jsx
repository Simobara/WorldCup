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
  city: "city",
  time: "time",

  pos1: "pos1",
  pos2: "pos2",
  goto: "goto",
  fg: "fg",
  pronSq: "pron_sq",

  team1: "team1",
  team2: "team2",

  "results.ris": "results_ris",
  "results.TS": "results_ts",
  "results.R": "results_r",
};

async function updateFinalMatchFieldInDb(phaseKey, matchNumero, field, value) {
  const column = finalFieldToDbColumn[field];
  if (!column) return; // se il campo non è mappato (es. numero), non fare nulla

  const matchIndex = matchNumero - 1; // numero parte da 1, match_index è 0-based

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
    { key: "final34", label: "3°/4°" },
    { key: "final", label: "Final" },
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
    updateData((prev) => {
      const next = structuredClone(prev);
      next[groupKey][giornataKey].dates[dateIndex] = value;
      return next;
    });
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
          match.results = { ris: "", TS: "", R: "" };
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
        // GIRONI A–L
        void updateMatchFieldInDb(activeGroup, numero, field, value);
      } else {
        // FASE FINALE
        void updateFinalMatchFieldInDb(activeFinalKey, numero, field, value);
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
        city,
        time,
        pos1,
        pos2,
        goto,
        fg,
        pron_sq,
        team1,
        team2,
        results_ris,
        results_ts,
        results_r,
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

          if (row.city) match.city = row.city;
          if (row.time) match.time = row.time;

          if (row.pos1) match.pos1 = row.pos1;
          if (row.pos2) match.pos2 = row.pos2;
          if (row.goto) match.goto = row.goto;
          if (row.fg) match.fg = row.fg;
          if (row.pron_sq) match.pronSq = row.pron_sq;

          if (row.team1) match.team1 = row.team1;
          if (row.team2) match.team2 = row.team2;

          // risultati annidati
          if (row.results_ris || row.results_ts || row.results_r) {
            if (!match.results) {
              match.results = { ris: "", TS: "", R: "" };
            }
            if (row.results_ris) match.results.ris = row.results_ris;
            if (row.results_ts) match.results.TS = row.results_ts;
            if (row.results_r) match.results.R = row.results_r;
          }
        }

        return next;
      });
    })();
  }, []);

  return (
    <div
      className={`
        flex-1 min-h-[100svh] bg-slate-950 relative 
        overflow-x-hidden
        ${isGroupsMode ? "overflow-y-auto lg:overflow-y-hidden" : "overflow-y-auto"}
        text-white p-4 md:p-6
      `}
    >
      {/* TOGGLE modalità */}
      <div className="mt-12 mb-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setMode("groups")}
          className={`px-4 py-2 rounded-md text-sm md:text-base ${
            isGroupsMode
              ? "bg-pink-800 text-white"
              : "bg-slate-800 text-white/70"
          }`}
        >
          Gironi A–L
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
          Fase Finale
        </button>
      </div>

      {/* LETTERE A–L oppure Fasi Finali */}
      {isGroupsMode ? (
        <div className="mb-6 flex justify-center flex-wrap gap-2">
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
        <div className="mb-6 flex justify-center flex-wrap gap-2">
          {FINAL_PHASES.map((phase) => {
            const isActive = phase.key === activeFinalKey;
            return (
              <button
                key={phase.key}
                type="button"
                onClick={() => setActiveFinalKey(phase.key)}
                className={`
                  px-4 py-2 rounded-md 
                  text-sm md:text-lg font-md
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

      <div className="mb-3">
        <h1 className="text-lg md:text-xl font-semibold">
          Admin -- Seed Structure (
          {isGroupsMode ? `group ${activeGroup}` : `fase ${activeFinalKey}`})
        </h1>

        <div className="flex items-center gap-0 mt-0">
          <button
            type="button"
            onClick={() => navigate("/admin/run-seed")}
            className="rounded-md bg-emerald- 600 hover:bg-emerald- 500 px-4 py-0 text-xs md:text-sm"
          >
            ❕
          </button>

          <span className="text-xs md:text-sm text-white/50">
            SeedSupabase-Campi ai valori hardcoded
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
                      widthMobile="80px"
                      widthDesktop="130px"
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

                      {/* SOLO FINALE → pronSq DOPO TIME (SOLO DESKTOP) */}
                      {!isGroupsMode && (
                        <div className="hidden md:block">
                          <Field
                            label="pronSq"
                            labelMobile="pSq"
                            widthMobile="70px"
                            widthDesktop="110px"
                            value={match.pronSq ?? ""}
                            onChange={(v) =>
                              handleMatchChange(
                                giornataKey,
                                idx,
                                "pronSq",
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
                        className="!bg-sky-900"
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
                    <div className="flex-1 px-1 py-1 rounded">
                      <Field
                        label={isGroupsMode ? "team2" : "T2"}
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
                    </div>
                  </div>

                  {/* FINALI: ris / TS / R subito dopo le squadre (solo DESKTOP) */}
                  {!isGroupsMode && (
                    <div className="hidden md:flex items-center gap-2">
                      <Field
                        label="ris"
                        labelMobile="ris"
                        widthMobile="55px"
                        widthDesktop="55px"
                        value={match.results?.ris ?? ""}
                        className="!bg-sky-900"
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "results.ris",
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
                            "results.ris",
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
                    <div className="hidden md:flex flex-wrap w-full md:w-auto gap-2 px-1 py-1 md:ml-24">
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
                          widthMobile="55px"
                          widthDesktop="55px"
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
                          widthMobile="70px"
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
                    <div className="flex md:hidden w-full items-center gap-2 mt-1">
                      <Field
                        label="pronSq"
                        labelMobile="pSq"
                        widthMobile="45px"
                        widthDesktop="110px"
                        value={match.pronSq ?? ""}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "pronSq",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* GIRONI A–L mobile */}
                      <Field
                        label="ris"
                        labelMobile="ris"
                        widthMobile="55px"
                        widthDesktop="55px"
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
                        widthMobile="65px"
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
                    <div className="flex md:hidden w-full flex-wrap md:gap-2 gap-3 mt-1">
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
                        widthMobile="60px"
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

                      {/* pSq */}
                      <Field
                        label="pronSq"
                        labelMobile="pSq"
                        widthMobile="110px"
                        widthDesktop="110px"
                        value={match.pronSq ?? ""}
                        onChange={(v) =>
                          handleMatchChange(
                            giornataKey,
                            idx,
                            "pronSq",
                            v,
                            match.numero
                          )
                        }
                      />

                      {/* T1, T2 */}
                      <Field
                        label="T1"
                        labelMobile="T1"
                        widthMobile="80px"
                        widthDesktop="130px"
                        className="!bg-sky-900 ml-[1rem]"
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
                          label="ris"
                          labelMobile="ris"
                          widthMobile="55px"
                          widthDesktop="55px"
                          value={match.results?.ris ?? ""}
                          className="!bg-sky-900"
                          onChange={(v) =>
                            handleMatchChange(
                              giornataKey,
                              idx,
                              "results.ris",
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
                              "results.ris",
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

    // CAMPI: ris, TS, R → formattazione tipo 1-2
    if (["ris", "results", "TS", "R"].includes(label)) {
      // tieni solo numeri
      let digits = raw.replace(/\D/g, "");

      // massimo 2 cifre
      digits = digits.slice(0, 2);

      let formatted = "";

      if (digits.length === 0) {
        formatted = "";
      } else if (digits.length === 1) {
        formatted = `${digits[0]}-`; // primo numero
      } else {
        formatted = `${digits[0]}-${digits[1]}`; // due numeri
      }

      onChange(formatted);
      return;
    }

    // LOGICA GENERICA (pron, city, ecc.)
    let v = raw.toUpperCase();

    if (maxLength) v = v.slice(0, maxLength);

    if (allowedValues && v !== "" && !allowedValues.includes(v)) return;

    onChange(v);
  };

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
          width: widthMobile,
        }}
        value={value}
        maxLength={label === "ris" ? 3 : maxLength}
        onChange={handleInputChange}
      />

      <style>{`
        @media (min-width: 768px) {
          input[data-field="${label}"] {
            width: ${widthDesktop} !important;
          }
        }
      `}</style>
    </div>
  );
}
