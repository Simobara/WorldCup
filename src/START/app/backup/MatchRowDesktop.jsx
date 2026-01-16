// MatchRowDesktop.jsx

export default function MatchRowDesktop({
  isGroupsMode,
  giornataKey,
  giornata,
  match,
  idx,
  handleMatchChange,
  handleDateChange,
}) {
  const numero = match.numero;

  return (
    <div className="hidden md:flex flex-wrap items-center gap-3 p-0 border border-white/10 rounded bg-slate-950/70">
      {/* numero */}
      <div className="flex items-center gap-1 text-xl w-[60px] mr-6">
        <span className="text-white/70">numero:</span>
        <span className="text-white/70 font-semibold">{numero}</span>
      </div>

      {/* day + city + time */}
      <div className="flex items-center gap-1 w-auto !ml-2">
        <Field
          label="day"
          width="90px"
          className={`${!isGroupsMode ? "!px-2" : ""} !bg-pink-900`}
          value={giornata.dates[0] || ""}
          onChange={(v) => handleDateChange(giornataKey, 0, v)}
        />

        <Field
          label="city"
          width={isGroupsMode ? "190px" : "120px"}
          value={match.city}
          onChange={(v) =>
            handleMatchChange(giornataKey, idx, "city", v, numero)
          }
        />

        <div className="flex items-center gap-1">
          <Field
            label="time"
            width="70px"
            value={match.time}
            className="pl-2"
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "time", v, numero)
            }
          />

          {/* SOLO FINALE → pronsq DOPO TIME */}
          {!isGroupsMode && (
            <Field
              label="pronsq"
              width="110px"
              value={match.pronsq ?? ""}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "pronsq", v, numero)
              }
            />
          )}
        </div>
      </div>

      {/* TEAM1 + TEAM2 (GIRONI) */}
      {isGroupsMode && (
        <div className="flex w-auto gap-1 ml-2">
          <div className="flex-1 px-1 py-1 rounded">
            <Field
              label="team1"
              width="120px"
              className="!bg-sky-900 ml-2"
              value={match.team1}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "team1", v, numero)
              }
            />
          </div>

          <div className="flex-1 px-1 py-1 rounded ml-4">
            <Field
              label="team2"
              width="120px"
              className="!bg-sky-900 ml-2"
              value={match.team2}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "team2", v, numero)
              }
            />
          </div>
        </div>
      )}

      {/* TEAM1 + TEAM2 (FINALI) + risultati RES/TS/R + posizioni */}
      {!isGroupsMode && (
        <>
          <div className="flex w-auto gap-1 ml-2">
            <div className="flex-1 px-1 py-1 rounded">
              <Field
                label="T1"
                width="120px"
                className="!bg-red-900 ml-2"
                value={match.team1}
                onChange={(v) =>
                  handleMatchChange(giornataKey, idx, "team1", v, numero)
                }
              />
            </div>

            <div className="flex-1 px-1 py-1 rounded ml-4">
              <Field
                label="T2"
                width="120px"
                className="!bg-sky-900 ml-0"
                value={match.team2}
                onChange={(v) =>
                  handleMatchChange(giornataKey, idx, "team2", v, numero)
                }
              />
            </div>
          </div>

          {/* FINALI: RES / TS / R */}
          <div className="flex items-center gap-2">
            <Field
              label="RES"
              width="50px"
              value={match.results?.ris ?? ""}
              className="!bg-sky-900"
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "results.RES", v, numero)
              }
            />
            <Field
              label="TS"
              width="55px"
              value={match.results?.TS ?? ""}
              className="!bg-sky-950"
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "results.TS", v, numero)
              }
            />
            <Field
              label="R"
              width="55px"
              value={match.results?.R ?? ""}
              className="!bg-gray-800"
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "results.R", v, numero)
              }
            />

            <button
              type="button"
              onClick={() => {
                handleMatchChange(giornataKey, idx, "results.RES", "", numero);
                handleMatchChange(giornataKey, idx, "results.TS", "", numero);
                handleMatchChange(giornataKey, idx, "results.R", "", numero);
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
            >
              🔄
            </button>
          </div>

          {/* SOLO FASE FINALE: posizioni e collegamenti */}
          <div className="flex flex-wrap w-full gap-1 px-1 py-1 ml-24">
            <Field
              label="pos1"
              width="50px"
              value={match.pos1}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "pos1", v, numero)
              }
            />
            <Field
              label="pos2"
              width="50px"
              value={match.pos2}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "pos2", v, numero)
              }
            />
            <Field
              label="goto"
              width="50px"
              value={match.goto}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "goto", v, numero)
              }
            />
            <Field
              label="fg"
              width="50px"
              value={match.fg}
              onChange={(v) =>
                handleMatchChange(giornataKey, idx, "fg", v, numero)
              }
            />
          </div>
        </>
      )}

      {/* GIRONI: pron / ris / results (desktop) */}
      {isGroupsMode && (
        <div className="flex items-center gap-2">
          <Field
            label="pron"
            width="40px"
            value={match.pron ?? ""}
            maxLength={1}
            allowedValues={["1", "X", "2"]}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "pron", v, numero)
            }
          />

          <Field
            label="ris"
            width="50px"
            value={match.ris ?? ""}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "ris", v, numero)
            }
          />

          <Field
            label="results"
            width="55px"
            className="!bg-sky-900"
            value={match.results}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "results", v, numero)
            }
          />

          <button
            type="button"
            onClick={() => {
              handleMatchChange(giornataKey, idx, "ris", "", numero);
              handleMatchChange(giornataKey, idx, "results", "", numero);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 border border-white/30 text-lg"
          >
            🔄
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- FIELD (solo desktop) ---------------- */

function Field({
  label,
  value,
  onChange,
  width = "120px",
  type = "text",
  className = "",
  maxLength,
  allowedValues,
}) {
  const handleInputChange = (e) => {
    let raw = e.target.value;

    // TIME → HH:MM
    if (label === "time") {
      let digits = raw.replace(/\D/g, "");
      digits = digits.slice(0, 4);
      let formatted = "";
      if (digits.length === 0) {
        formatted = "";
      } else if (digits.length <= 2) {
        formatted = digits.length === 2 ? `${digits}:` : digits;
      } else {
        const hh = digits.slice(0, 2);
        const mm = digits.slice(2);
        formatted = `${hh}:${mm}`;
      }
      onChange(formatted);
      return;
    }

    // DAY → LLL/DD
    if (label === "day") {
      const upper = raw.toUpperCase();
      const lettersOnly = upper.replace(/[^A-Z]/g, "");
      const digitsOnly = upper.replace(/[^0-9]/g, "");
      const month = lettersOnly.slice(0, 3);
      const dayNum = digitsOnly.slice(0, 2);
      let formatted = "";
      if (month.length === 0) {
        formatted = "";
      } else if (month.length < 3) {
        formatted = month;
      } else {
        formatted = dayNum.length > 0 ? `${month}/${dayNum}` : `${month}/`;
      }
      onChange(formatted);
      return;
    }

    // POS1 / POS2
    if (label === "pos1" || label === "pos2") {
      let v = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");
      if (!v) {
        onChange("");
        return;
      }
      const first = v[0];
      if (!["1", "2", "3"].includes(first)) return;
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

    // RIS / TS / R / results → formato 1-2
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

    // PRONSQ → AAA-BBB
    if (label === "pronsq") {
      let letters = raw.toUpperCase().replace(/[^A-Z]/g, "");
      letters = letters.slice(0, 6);
      let formatted = "";
      if (letters.length === 0) {
        formatted = "";
      } else if (letters.length <= 3) {
        formatted = letters.length === 3 ? `${letters}-` : letters;
      } else {
        const first = letters.slice(0, 3);
        const second = letters.slice(3);
        formatted = `${first}-${second}`;
      }
      onChange(formatted);
      return;
    }

    // GENERICO
    let v = raw.toUpperCase();
    if (maxLength) v = v.slice(0, maxLength);
    if (allowedValues && v !== "" && !allowedValues.includes(v)) return;
    onChange(v);
  };

  return (
    <div className="flex items-center gap-1 text-xl">
      <span className="text-white/70">{label}:</span>
      <input
        data-field={label}
        type={type}
        className={`
          bg-slate-800 border border-white/20 rounded
          px-3 py-2
          text-white text-lg font-semibold
          ${className}
        `}
        style={{ width }}
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
    </div>
  );
}
