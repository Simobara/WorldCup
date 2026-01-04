import { useEffect, useRef, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

/**
 * EditableScore
 * - editMode=false: mostra "a-b" come testo
 * - editMode=true: mostra 2 caselle numeriche (solo цифre) con "-" in mezzo
 * - salva su 2 path separati: pathA, pathB
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

  // ✅ Sync dai props quando arrivano (es. dopo load async),
  // ma NON sovrascrivere mentre l’utente sta scrivendo
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

  if (!editMode) {
    const left = String(valueA ?? "").trim();
    const right = String(valueB ?? "").trim();
    const txt = left !== "" || right !== "" ? `${left}-${right}` : "\u00A0";
    return (
      <div className={`text-center font-extrabold ${className}`}>{txt}</div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
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
        className={`w-9 md:w-10 h-8 md:h-9 text-center font-extrabold bg-slate-800 rounded-lg text-white text-[15px] leading-none p-0 m-0 ${inputClassName}`}
      />

      <span className="font-extrabold opacity-80">-</span>

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
        className={`w-9 md:w-10 h-8 md:h-9 text-center font-extrabold bg-slate-800 rounded-lg text-white text-[15px] leading-none p-0 m-0 ${inputClassName}`}
      />
    </div>
  );
}
