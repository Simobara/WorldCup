import { useEffect, useRef, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

/**
 * EditableScore
 * - editMode=false: mostra "a-b"
 * - editMode=true:
 *   - 2 input numerici
 *   - rettangolo centrale cliccabile (pareggio / X)
 */
export default function EditableScore({
  pathA,
  pathB,
  valueA,
  valueB,
  onChange,
  className = "",
  inputClassName = "",
  maxLen = 2,
  placeholderA = "",
  placeholderB = "",
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
  const basePath = pathA.split(".").slice(0, -1).join(".");

  if (!editMode) {
    const left = String(valueA ?? "").trim();
    const right = String(valueB ?? "").trim();
    const txt = left || right ? `${left}-${right}` : "\u00A0";

    return (
      <div
        className={[
          "text-center font-black leading-none tabular-nums",
          "text-lg md:text-lg", // 👈 QUI li fai grossi
          className,
        ].join(" ")}
      >
        {txt}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-[3px] ${className}`}>
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
          "font-extrabold bg-slate-800 text-white",
          "rounded-sm appearance-none",
          inputClassName,
        ].join(" ")}
      />

      {/* 🔲 RETTANGOLO CENTRALE (X) */}
      <button
        type="button"
        disabled={!editMode}
        onClick={() => onChange?.(`${basePath}.plusPron`, "X")}
        className={`
          w-[12px]
          h-6 md:h-7
          rounded-sm
          bg-slate-700
          hover:bg-sky-600
          transition
          flex items-center justify-center
          ${!editMode ? "opacity-40 cursor-default" : "cursor-pointer"}
        `}
        aria-label="Pareggio"
      />

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
          "font-extrabold bg-slate-800 text-white",
          "rounded-sm appearance-none",
          inputClassName,
        ].join(" ")}
      />
    </div>
  );
}
