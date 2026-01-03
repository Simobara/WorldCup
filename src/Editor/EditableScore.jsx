import { useEffect, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

/**
 * EditableScore
 * - editMode=false: mostra "a-b" come testo
 * - editMode=true: mostra 2 caselle numeriche (solo цифre) con "-" in mezzo
 * - salva su 2 path separati: pathA, pathB
 */
export default function EditableScore({
  pathA, // es: `${letter}.plusRis.${idx}.a`
  pathB, // es: `${letter}.plusRis.${idx}.b`
  valueA,
  valueB,
  onChange, // (path, newValue) => void
  className = "",
  inputClassName = "",
  maxLen = 2,
  placeholderA = "",
  placeholderB = "",
}) {
  const { editMode } = useEditMode();
  const [a, setA] = useState(valueA ?? "");
  const [b, setB] = useState(valueB ?? "");

  // sync quando esci da edit o quando arriva valore dal parent
  useEffect(() => {
    if (!editMode) {
      setA(valueA ?? "");
      setB(valueB ?? "");
      return;
    }
    // se entro in edit e local è vuoto ma parent ha valore, prefill
    if ((a ?? "") === "" && (valueA ?? "") !== "") setA(valueA ?? "");
    if ((b ?? "") === "" && (valueB ?? "") !== "") setB(valueB ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, valueA, valueB]);

  const sanitize = (v) =>
    String(v ?? "")
      .replace(/\D+/g, "")
      .slice(0, maxLen);

  if (!editMode) {
    const left = String(valueA ?? "").trim();
    const right = String(valueB ?? "").trim();
    const txt = left !== "" || right !== "" ? `${left}-${right}` : "\u00A0";

    return (
      <div className={`text-center font-extrabold ${className}`}>{txt}</div>
    );
  }

  return (
    <div className={`flex items-center justify-center  ${className}`}>
      <input
        value={a}
        placeholder={placeholderA}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => {
          const v = sanitize(e.target.value);
          setA(v);
          onChange?.(pathA, v);
        }}
        className={`
  w-9 md:w-10 h-8 md:h-9
  text-center font-extrabold
  bg-slate-800
  rounded-lg
  text-white text-[15px] leading-none p-0 m-0
  ${inputClassName}
`}
      />

      <span className="font-extrabold opacity-80">-</span>

      <input
        value={b}
        placeholder={placeholderB}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => {
          const v = sanitize(e.target.value);
          setB(v);
          onChange?.(pathB, v);
        }}
        className={`
  w-9 md:w-10 h-8 md:h-9
  text-center font-extrabold
  bg-slate-800

  rounded-lg
  text-white text-[15px] leading-none p-0 m-0
  ${inputClassName}
`}
      />
    </div>
  );
}
