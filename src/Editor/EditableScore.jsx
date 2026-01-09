import { useEffect, useRef, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

/**
 * EditableScore
 * - editMode=false: mostra "a-b" (solo testo, compatto)
 * - editMode=true & readOnly=true: mostra a - b nella stessa posizione degli input, senza quadrato
 * - editMode=true & readOnly=false:
 *   - 2 input numerici
 *   - rettangolo centrale cliccabile (pareggio / X)
 */
export default function EditableScore({
  pathA,
  pathB,
  pathPron,
  valueA,
  valueB,
  onChange,
  className = "",
  inputClassName = "",
  maxLen = 2,
  placeholderA = "",
  placeholderB = "",
  readOnly = false,
}) {
  const { editMode } = useEditMode();

  const [a, setA] = useState(valueA ?? "");
  const [b, setB] = useState(valueB ?? "");
  const dirtyRef = useRef(false);

  const sanitize = (v) =>
    String(v ?? "")
      .replace(/\D+/g, "")
      .slice(0, maxLen);

  useEffect(() => {
    if (!editMode) {
      dirtyRef.current = false;
      setA(valueA ?? "");
      setB(valueB ?? "");
      return;
    }

    if (!dirtyRef.current) {
      setA(valueA ?? "");
      setB(valueB ?? "");
    }
  }, [editMode, valueA, valueB]);

  // 🧠 path base (serve per scrivere il pronostico X)
  //const basePath = pathA.split(".").slice(0, -1).join(".");

  // ==============
  // SOLO TESTO (VIEW MODE, COME PRIMA)
  // ==============
  if (!editMode) {
    const left = String(valueA ?? "").trim();
    const right = String(valueB ?? "").trim();
    const txt = left || right ? `${left}-${right}` : "\u00A0";

    return (
      <div
        className={[
          "text-center font-black leading-none tabular-nums",
          "text-lg md:text-lg",
          className,
        ].join(" ")}
      >
        {txt}
      </div>
    );
  }

  // =========================
  // EDIT MODE + RISULTATI UFFICIALI (READ-ONLY)
  // =========================
  if (readOnly) {
    const left = String(valueA ?? "").trim();
    const right = String(valueB ?? "").trim();

    return (
      <div
        className={[
          // mobile: numeri vicini e centrati, desktop: come prima
          "flex items-center gap-[1px] md:gap-[3px] transition-transform duration-200 ease-out",
          "justify-center md:justify-start md:-translate-x-[2.5rem]",
          className,
        ].join(" ")}
      >
        {/* SLOT A */}
        <div
          className={[
            "w-5 md:w-7 h-full md:ml-[1.2rem] ml-0",
            "flex items-center justify-center",
            // numeri più grandi anche su mobile
            "text-lg md:text-lg font-extrabold tabular-nums",
          ].join(" ")}
        >
          {left || "\u00A0"}
        </div>

        {/* CENTRAL SLOT — trattino compatto su mobile */}
        <div
          className={`
            w-auto md:w-[3.5rem]
            md:h-[2rem] h-2
            flex items-center justify-center
          `}
        >
          <span className="text-lg md:text-lg font-extrabold tabular-nums">
            -
          </span>
        </div>

        {/* SLOT B */}
        <div
          className={[
            "w-5 md:w-7 h-full",
            "flex items-center justify-center",
            "text-lg md:text-lg font-extrabold tabular-nums",
          ].join(" ")}
        >
          {right || "\u00A0"}
        </div>
      </div>
    );
  }

  // =========================
  // EDIT MODE NORMALE (INPUT + QUADRATO X)
  // =========================
  return (
    <div
      className={[
        "flex items-center gap-[3px] transition-transform duration-200 ease-out",
        "justify-start md:-translate-x-[2.5rem]",
        className,
      ].join(" ")}
    >
      {/* INPUT A */}
      <input
        value={a}
        placeholder={placeholderA}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => {
          dirtyRef.current = true;
          const v = sanitize(e.target.value);
          setA(v);
          onChange?.(pathA, v);
        }}
        className={[
          "w-6 md:w-7 h-full",
          "text-[12px] md:text-[13px]",
          "text-center leading-none p-0",
          "font-extrabold text-white",
          "bg-transparent border-none outline-none",
          "focus:outline-none focus:ring-0 focus:border-none",
          "appearance-none",
          inputClassName,
        ].join(" ")}
      />

      {/* 🔲 RETTANGOLO CENTRALE (X) */}
      <button
        type="button"
        disabled={!editMode || !pathPron}
        onClick={() => {
          if (!editMode || !pathPron) return;
          // imposta pronostico di pareggio
          onChange?.(pathPron, "X");
        }}
        className={`
    md:w-[3.5rem] w-[12px]
    md:h-[2rem] h-2
    rounded-sm
    bg-slate-700
    hover:bg-sky-600 !px-2 
    transition
    flex items-center justify-center
    ${!editMode ? "opacity-40 cursor-default" : "cursor-pointer"}
  `}
        aria-label="Pareggio"
      >
        {/* puoi lasciare vuoto oppure mettere una X, come preferisci */}
      </button>

      {/* INPUT B */}
      <input
        value={b}
        placeholder={placeholderB}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => {
          dirtyRef.current = true;
          const v = sanitize(e.target.value);
          setB(v);
          onChange?.(pathB, v);
        }}
        className={[
          "w-6 md:w-7 h-full",
          "text-[12px] md:text-[13px]",
          "text-center leading-none p-0",
          "font-extrabold text-white",
          "bg-transparent border-none outline-none",
          "focus:outline-none focus:ring-0 focus:border-none",
          "appearance-none",
          inputClassName,
        ].join(" ")}
      />
    </div>
  );
}
