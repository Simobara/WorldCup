import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";

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
  // Copia modificabile della struttura originale
  const [data, setData] = useState(() => structuredClone(groupMatches));

  const [activeGroup, setActiveGroup] = useState("A");
  const groupKey = `group_${activeGroup}`;
  const group = data[groupKey];
  const navigate = useNavigate();

  const handleDateChange = (giornataKey, dateIndex, value) => {
    setData((prev) => {
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
    setData((prev) => {
      const next = structuredClone(prev);
      const match = next[groupKey][giornataKey].matches[matchIndexLocal];
      match[field] = field === "numero" ? Number(value) || 0 : value;
      return next;
    });

    // 2️⃣ aggiorno il DB (tranne se stai cambiando "numero" o "time")
    if (field === "numero" || field === "time") return;

    if (typeof numero === "number") {
      void updateMatchFieldInDb(activeGroup, numero, field, value);
    }
  };

  //   const handleLog = () => {
  //     console.log(`${groupKey} STRUCTURE:`, group);
  //     alert(`Struttura ${groupKey} loggata in console`);
  //   };

  return (
    <div className="flex-1 min-h-[100svh] bg-slate-950 relative overflow-x-hidden overflow-y-auto md:overflow-y-hidden text-white p-4 md:p-6">
      {/* LETTERE A–L, cliccabili */}
      <div className="mt-12 mb-6 flex justify-center flex-wrap gap-2">
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
                    ? "bg-pink-700 border-pink-700 text-white"
                    : "bg-slate-800 border-white/20 text-white/80 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* TITOLO */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg md:text-xl font-semibold">
          Admin – Seed Structure (group {activeGroup})
        </h1>
        <button
          type="button"
          onClick={() => navigate("/admin/run-seed")}
          className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs md:text-sm"
        >
          Seed su Supabase
        </button>
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
            className="mb-8 border border-white/10 rounded-lg p-3 md:p-4 bg-slate-900/60"
          >
            {/* HEADER GIORNATA */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="font-bold uppercase text-pink-500 text-base md:text-2xl">
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
                  className="flex flex-wrap items-center gap-2 md:gap-3 p-2 border border-white/10 rounded bg-slate-950/70"
                >
                  {/* ordine fisso: numero, city, time, team1, team2, pron, ris, results */}
                  <div className="flex items-center gap-1 text-xs md:text-sm w-[60px]">
                    <span className="text-white/70">numero:</span>
                    <span className="text-pink-400 font-semibold">
                      {match.numero}
                    </span>
                  </div>
                  {/* DATE per match */}
                  <Field
                    label="day"
                    width="60px"
                    value={giornata.dates[0] || ""}
                    onChange={(v) => handleDateChange(giornataKey, 0, v)}
                  />
                  <Field
                    label="city"
                    width="120px"
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

                  <Field
                    label="time"
                    width="70px"
                    value={match.time}
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

                  <div className="px-2 py-1 rounded bg-pink-700 border border-pink-700">
                    <Field
                      label="team1"
                      width="130px"
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

                  <div className="px-2 py-1 rounded bg-pink-700 border border-pink-700">
                    <Field
                      label="team2"
                      width="130px"
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

                  <Field
                    label="pron"
                    width="40px"
                    maxLength={2}
                    value={match.pron}
                    onChange={(v) => {
                      // accetta solo numeri e max 2 cifre
                      if (/^\d{0,2}$/.test(v)) {
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "pron",
                          v,
                          match.numero
                        );
                      }
                    }}
                  />

                  <Field
                    label="ris"
                    width="55px"
                    maxLength={3}
                    value={match.ris}
                    onChange={(v) => {
                      // formato: numero - numero, massimo 3 caratteri totali
                      if (/^[0-9-]{0,3}$/.test(v)) {
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "ris",
                          v,
                          match.numero
                        );
                      }
                    }}
                  />

                  <Field
                    label="results"
                    width="70px"
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
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function Field({ label, value, onChange, width, type = "text" }) {
  return (
    <div className="flex items-center gap-1 text-base md:text-xl">
      <span className="text-white/70">{label}:</span>
      <input
        type={type}
        className="
    bg-slate-800 border border-white/20 rounded 
    px-3 py-2 
    text-white text-sm md:text-lg font-semibold
  "
        style={{
          width: `calc(${width} + 10px)`, // 👉 Aumenta TUTTI i campi di +20px
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
