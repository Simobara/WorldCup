import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupMatches } from "../1GroupMatches";

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

  const handleMatchChange = (giornataKey, matchIndex, field, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      const match = next[groupKey][giornataKey].matches[matchIndex];
      match[field] = field === "numero" ? Number(value) || 0 : value;
      return next;
    });
  };

  //   const handleLog = () => {
  //     console.log(`${groupKey} STRUCTURE:`, group);
  //     alert(`Struttura ${groupKey} loggata in console`);
  //   };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
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
                px-3 py-1 rounded-md text-sm border
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
              <div className="font-semibold uppercase text-pink-600">
                {giornataKey}
              </div>

              {/* Supporta più dates (es. group_B giornata_1) */}
              <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
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
              </div>
            </div>

            {/* MATCHES */}
            <div className="space-y-3">
              {giornata.matches.map((match, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 md:gap-3 p-2 border border-white/10 rounded bg-slate-950/70"
                >
                  {/* ordine fisso: numero, city, time, team1, team2, pron, ris, results */}
                  <Field
                    label="numero"
                    width="60px"
                    type="number"
                    value={match.numero}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "numero", v)
                    }
                  />
                  <Field
                    label="city"
                    width="120px"
                    value={match.city}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "city", v)
                    }
                  />
                  <Field
                    label="time"
                    width="70px"
                    value={match.time}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "time", v)
                    }
                  />
                  {/* TEAM 1 */}
                  <div className="px-2 py-1 rounded bg-pink-700 border border-pink-700">
                    <Field
                      label="team1"
                      width="130px"
                      value={match.team1}
                      onChange={(v) =>
                        handleMatchChange(giornataKey, idx, "team1", v)
                      }
                    />
                  </div>

                  {/* TEAM 2 */}
                  <div className="px-2 py-1 rounded bg-pink-700 border border-pink-700">
                    <Field
                      label="team2"
                      width="130px"
                      value={match.team2}
                      onChange={(v) =>
                        handleMatchChange(giornataKey, idx, "team2", v)
                      }
                    />
                  </div>
                  <Field
                    label="pron"
                    width="50px"
                    value={match.pron}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "pron", v)
                    }
                  />
                  <Field
                    label="ris"
                    width="70px"
                    value={match.ris}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "ris", v)
                    }
                  />
                  <Field
                    label="results"
                    width="70px"
                    value={match.results}
                    onChange={(v) =>
                      handleMatchChange(giornataKey, idx, "results", v)
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
    <div className="flex items-center gap-1 text-xs md:text-sm">
      <span className="text-white/70">{label}:</span>
      <input
        type={type}
        className="bg-slate-800 border border-white/20 rounded px-2 py-1 text-white text-xs"
        style={{ width }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
