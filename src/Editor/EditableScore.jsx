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
  maxLen = 1,
  placeholderA = "",
  placeholderB = "",
  readOnly = false,
}) {
  const { editMode } = useEditMode();

  const [a, setA] = useState(valueA ?? "");
  const [b, setB] = useState(valueB ?? "");
  const dirtyRef = useRef(false);
  const inputBRef = useRef(null);

  const sanitize = (v) =>
    String(v ?? "")
      .replace(/\D+/g, "")
      .slice(0, maxLen);

  useEffect(() => {
    const extA = valueA ?? "";
    const extB = valueB ?? "";

    // fuori editMode: sync diretto con i valori esterni
    if (!editMode) {
      dirtyRef.current = false;
      setA(extA);
      setB(extB);
      return;
    }

    // 🔴 caso speciale: il parent ha forzato un reset (es. click su P / due frecce)
    const externalEmpty =
      String(extA).trim() === "" && String(extB).trim() === "";
    const localNotEmpty = String(a).trim() !== "" || String(b).trim() !== "";

    if (externalEmpty && localNotEmpty) {
      // 👉 reset immediato anche nei campi locali
      dirtyRef.current = false;
      setA("");
      setB("");
      return;
    }

    // caso normale: quando non hai digitato nulla localmente
    if (!dirtyRef.current) {
      setA(extA);
      setB(extB);
    }
  }, [editMode, valueA, valueB, a, b]);

  // ==============
  // SOLO TESTO (VIEW MODE)
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
            "text-lg md:text-lg font-extrabold tabular-nums",
          ].join(" ")}
        >
          {left || "\u00A0"}
        </div>

        {/* CENTRAL SLOT */}
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
  const hasAnyScoreHere =
    String(a ?? "").trim() !== "" || String(b ?? "").trim() !== "";

  // 👉 logica centrale per bloccare il bottone X
  const isDisabledCenter = !editMode || !pathPron || hasAnyScoreHere;

  return (
    <div
      className={[
        "flex items-center transition-transform duration-200 ease-out",
        // MOBILE: numeri vicini e centrati
        "justify-center px-1",
        // DESKTOP: allineato come la versione readOnly
        "md:justify-start md:px-1 md:-translate-x-[2.5rem]",
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

          // 🎯 auto-focus sulla seconda casella quando hai finito di scrivere
          if (v && v.length === maxLen) {
            inputBRef.current?.focus();
          }
        }}
        className={[
          "w-6 md:w-7 h-full",
          "text-[12px] md:text-[13px]",
          "text-center leading-none p-0",
          "font-extrabold text-white",
          "bg-transparent justify-end pr-0 pl-2",
          "border-none outline-none",
          "focus:outline-none focus:ring-0 focus:border-none",
          "appearance-none",
          inputClassName,
        ].join(" ")}
      />

      {/* 🔲 RETTANGOLO CENTRALE (X) */}
      <button
        type="button"
        disabled={isDisabledCenter}
        onClick={() => {
          if (isDisabledCenter) return;
          onChange?.(pathPron, "X");
        }}
        className={[
          "md:w-[3.5rem] w-[12px]",
          "md:h-[2rem] h-2",
          "rounded-sm",
          "transition flex items-center justify-center",
          isDisabledCenter
            ? "bg-slate-700/30 opacity-40 cursor-default"
            : "bg-slate-700 hover:bg-sky-600 cursor-pointer",
          "!px-2",
        ].join(" ")}
        aria-label="Pareggio"
      >
        {/* volendo puoi mettere una X visiva qui */}
      </button>

      {/* INPUT B */}
      <input
        ref={inputBRef}
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
          "bg-transparent justify-start pl-0 pr-2",
          "border-none outline-none",
          "focus:outline-none focus:ring-0 focus:border-none",
          "appearance-none",
          inputClassName,
        ].join(" ")}
      />
    </div>
  );
}
