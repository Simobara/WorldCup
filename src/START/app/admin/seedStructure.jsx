import { useEffect, useState } from "react";
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

  useEffect(() => {
    (async () => {
      const { data: rows, error } = await supabase
        .from("wc_match_structure")
        .select(
          "group_letter, match_index, city, team1, team2, seed_pron, seed_ris, results_official"
        );

      if (error) {
        console.error("Errore caricando struttura da Supabase:", error);
        return;
      }

      setData((prev) => {
        const next = structuredClone(prev);

        for (const row of rows ?? []) {
          const groupKey = `group_${row.group_letter}`;
          const group = next[groupKey];
          if (!group) continue;

          // flatten matches del gruppo
          const allGiornate = Object.values(group); // giornata_1, giornata_2...
          const flat = [];
          for (const g of allGiornate) {
            for (const m of g.matches) flat.push(m);
          }

          const match = flat[row.match_index];
          if (!match) continue;

          // sovrascrivo i campi che arrivano dal DB
          if (row.city) match.city = row.city;
          if (row.team1) match.team1 = row.team1;
          if (row.team2) match.team2 = row.team2;
          if (row.seed_pron) match.pron = row.seed_pron;
          if (row.seed_ris) match.ris = row.seed_ris;
          if (row.results_official) match.results = row.results_official;
        }

        return next;
      });
    })();
  }, []);

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

      <div className="mb-3">
        <h1 className="text-lg md:text-xl font-semibold">
          Admin -- Seed Structure (group {activeGroup})
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
    bg-slate-900              /* rosso su mobile */
    md:bg-slate-900      /* torna scuro su desktop */
    w-full
  "
          >
            {/* HEADER GIORNATA */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="font-bold uppercase text-pink-800 text-base md:text-2xl">
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
                  <div className="hidden md:flex items-center gap-2 text-md md:text-xl w-[60px] md:mr-24">
                    <span className="text-white/70">numero:</span>
                    <span className="text-pink-800 font-semibold">
                      {match.numero}
                    </span>
                  </div>

                  {/* day + city + time → in linea su mobile */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Field
                      label="day" // 👈 visibile SOLO su desktop
                      labelMobile="" // 👈 mobile: etichetta vuota → non mostra “day:”
                      width="70px"
                      className="!bg-pink-800"
                      value={giornata.dates[0] || ""}
                      onChange={(v) => handleDateChange(giornataKey, 0, v)}
                    />

                    <Field
                      label="city"
                      width="80px" // mobile più stretto
                      mdWidth="120px" // desktop come prima
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

                    <div className="md:mr-24">
                      <Field
                        label="time"
                        width="50px"
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
                    </div>
                  </div>

                  {/* TEAM1 + TEAM2 */}
                  <div className="flex w-full md:w-auto gap-2">
                    {/* TEAM 1 */}
                    <div className="flex-1 px-1 py-1 rounded ">
                      <Field
                        labelMobile="T1"
                        label="team1"
                        width="100px" // mobile corto
                        mdWidth="130px" // desktop largo
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
                    <div className="flex-1 px-1 py-1 rounded md:mr-24 ">
                      <Field
                        labelMobile="T2"
                        label="team2"
                        width="100px"
                        mdWidth="130px"
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

                  {/* --- DESKTOP (come prima, non toccato) --- */}
                  <div className="hidden md:flex items-center gap-2">
                    <Field
                      label="pron"
                      width="50px"
                      value={match.pron}
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
                      width="70px"
                      value={match.ris}
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

                    {/* 🔄 reset results */}
                    <button
                      type="button"
                      onClick={() =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "results",
                          "",
                          match.numero
                        )
                      }
                      className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
                    >
                      🔄
                    </button>
                  </div>

                  {/* --- MOBILE: una sola riga per i 3 campi --- */}
                  <div className="flex md:hidden w-full items-center gap-2 mt-1">
                    <Field
                      label="pron"
                      width="38px"
                      value={match.pron}
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
                      width="52px"
                      value={match.ris}
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
                      width="65px"
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
                      onClick={() =>
                        handleMatchChange(
                          giornataKey,
                          idx,
                          "results",
                          "",
                          match.numero
                        )
                      }
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
    </div>
  );
}

function Field({
  label,
  labelMobile, // 👈 etichetta abbreviata per mobile
  value,
  onChange,
  width = "100px",
  mdWidth = null,
  type = "text",
  className = "", // 👈 nuovo: permette override stile singolo campo (es: day)
}) {
  return (
    <div className="flex items-center gap-1 text-base md:text-xl">
      {/* LABEL desktop */}
      <span className="hidden md:inline text-white/70">{label}:</span>

      {/* LABEL mobile */}
      <span className="md:hidden text-white/70">{labelMobile ?? label}</span>

      <input
        type={type}
        className={`
          bg-slate-800 border border-white/20 rounded 
          px-3 py-2 
          text-white text-sm md:text-lg font-semibold
          ${className}    /* 👈 permette modifiche mirate */
        `}
        style={{
          width: `calc(${width} + 10px)`,
          ...(mdWidth
            ? { ["@media (min-width: 768px)"]: { width: mdWidth } }
            : {}),
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
