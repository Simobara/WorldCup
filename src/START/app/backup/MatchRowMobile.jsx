// MatchRowMobile.jsx

export default function MatchRowMobile({
  isGroupsMode,
  giornataKey,
  giornata,
  match,
  idx,
  handleMatchChange,
  handleDateChange,
}) {
  const numero = match.numero;

  // 🔹 GIRONI MOBILE
  if (isGroupsMode) {
    return (
      <div className="flex md:hidden flex-wrap items-center gap-1 p-0 border border-white/10 rounded bg-slate-950/70 mt-2">
        {/* numero */}
        <div className="flex items-center gap-1 text-sm ml-1">
          <span className="text-white/70">#</span>
          <span className="text-white/70 font-semibold">{numero}</span>
        </div>

        {/* day + city + time */}
        <div className="flex items-center gap-1 w-full ml-1 mt-1">
          <Field
            label="day"
            labelMobile=""
            width="70px"
            className="!bg-pink-900"
            value={giornata.dates[0] || ""}
            onChange={(v) => handleDateChange(giornataKey, 0, v)}
          />

          <Field
            label="city"
            labelMobile="city"
            width="85px"
            value={match.city}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "city", v, numero)
            }
          />

          <Field
            label="time"
            labelMobile="time"
            width="60px"
            value={match.time}
            className="!px-1"
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "time", v, numero)
            }
          />
        </div>

        {/* T1 / T2 */}
        <div className="flex w-full gap-2 ml-1 mt-1">
          <Field
            label="team1"
            labelMobile="T1"
            width="80px"
            className="!bg-red-900"
            value={match.team1}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "team1", v, numero)
            }
          />
          <Field
            label="team2"
            labelMobile="T2"
            width="80px"
            className="!bg-sky-900"
            value={match.team2}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "team2", v, numero)
            }
          />
        </div>

        {/* pron / ris / results */}
        <div className="flex w-full items-center gap-1 mt-1 ml-1">
          <Field
            label="pron"
            labelMobile="pron"
            width="60px"
            value={match.pron ?? ""}
            maxLength={1}
            allowedValues={["1", "X", "2"]}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "pron", v, numero)
            }
          />

          <Field
            label="ris"
            labelMobile="ris"
            width="50px"
            value={match.ris ?? ""}
            onChange={(v) =>
              handleMatchChange(giornataKey, idx, "ris", v, numero)
            }
          />

          <Field
            label="results"
            labelMobile="RES"
            width="53px"
            className="!bg-sky-900 !text-black"
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
      </div>
    );
  }

  // 🔹 FASE FINALE MOBILE
  return (
    <div className="flex md:hidden w-full flex-wrap gap-[0.9rem] p-0 border border-white/10 rounded bg-slate-950/70 mt-2">
      {/* numero */}
      <div className="flex items-center gap-1 text-sm ml-1 mt-1">
        <span className="text-white/70">#</span>
        <span className="text-white/70 font-semibold">{numero}</span>
      </div>

      {/* day + city + time */}
      <div className="flex items-center gap-1 w-full ml-1">
        <Field
          label="day"
          labelMobile=""
          width="70px"
          className="!bg-pink-900"
          value={giornata.dates[0] || ""}
          onChange={(v) => handleDateChange(giornataKey, 0, v)}
        />

        <Field
          label="city"
          labelMobile="city"
          width="85px"
          value={match.city}
          onChange={(v) =>
            handleMatchChange(giornataKey, idx, "city", v, numero)
          }
        />

        <Field
          label="time"
          labelMobile="time"
          width="60px"
          value={match.time}
          className="!px-1"
          onChange={(v) =>
            handleMatchChange(giornataKey, idx, "time", v, numero)
          }
        />
      </div>

      {/* pos1, pos2, goto, fg */}
      <Field
        label="pos1"
        labelMobile="pos1"
        width="50px"
        value={match.pos1}
        onChange={(v) => handleMatchChange(giornataKey, idx, "pos1", v, numero)}
      />
      <Field
        label="pos2"
        labelMobile="pos2"
        width="50px"
        value={match.pos2}
        onChange={(v) => handleMatchChange(giornataKey, idx, "pos2", v, numero)}
      />
      <Field
        label="goto"
        labelMobile="goto"
        width="50px"
        value={match.goto}
        onChange={(v) => handleMatchChange(giornataKey, idx, "goto", v, numero)}
      />
      <Field
        label="fg"
        labelMobile="fg"
        width="50px"
        value={match.fg}
        onChange={(v) => handleMatchChange(giornataKey, idx, "fg", v, numero)}
      />

      {/* pSq */}
      <Field
        label="pronsq"
        labelMobile="pSq"
        width="100px"
        value={match.pronsq ?? ""}
        onChange={(v) =>
          handleMatchChange(giornataKey, idx, "pronsq", v, numero)
        }
      />

      {/* T1, T2 */}
      <Field
        label="T1"
        labelMobile="T1"
        width="90px"
        className="!bg-sky-900"
        value={match.team1}
        onChange={(v) =>
          handleMatchChange(giornataKey, idx, "team1", v, numero)
        }
      />
      <Field
        label="T2"
        labelMobile="T2"
        width="80px"
        className="!bg-sky-900"
        value={match.team2}
        onChange={(v) =>
          handleMatchChange(giornataKey, idx, "team2", v, numero)
        }
      />

      {/* RES / TS / R + reset */}
      <div className="flex items-center gap-2 ml-0 mb-2">
        <Field
          label="RES"
          labelMobile="RES"
          width="50px"
          value={match.results?.ris ?? ""}
          className="!bg-sky-900"
          onChange={(v) =>
            handleMatchChange(giornataKey, idx, "results.RES", v, numero)
          }
        />

        <Field
          label="TS"
          labelMobile="TS"
          width="45px"
          value={match.results?.TS ?? ""}
          className="!bg-sky-950"
          onChange={(v) =>
            handleMatchChange(giornataKey, idx, "results.TS", v, numero)
          }
        />
        <Field
          label="R"
          labelMobile="R"
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
    </div>
  );
}

/* ---------------- FIELD (solo mobile) ---------------- */

function Field({
  label,
  labelMobile,
  value,
  onChange,
  width = "80px",
  type = "text",
  className = "",
  maxLength,
  allowedValues,
}) {
  const handleInputChange = (e) => {
    let raw = e.target.value;

    // TIME
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

    // DAY
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

    // RIS / TS / R / results
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

    // PRONSQ
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

  const isPosField = label === "pos1" || label === "pos2";
  const widthDynamic = isPosField
    ? value?.startsWith("3")
      ? "80px"
      : "50px"
    : width;

  return (
    <div className="flex items-center gap-1 text-base">
      <span className="text-white/70">{labelMobile ?? label}</span>
      <input
        data-field={label}
        type={type}
        className={`
          bg-slate-800 border border-white/20 rounded
          px-3 py-2
          text-white text-sm font-semibold
          ${className}
        `}
        style={{ width: widthDynamic }}
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
