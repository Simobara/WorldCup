import { useEffect, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

/**
 * EditableText
 * - mostra testo normale quando editMode=false
 * - mostra textarea quando editMode=true
 * - gestisce valore locale e notifica al parent via onChange(path, value)
 */
export default function EditableText({
  path, // es: `${letter}.day2.items`
  value, // valore dal DB
  onChange, // (path, newValue) => void
  className = "",
  textareaClassName = "",
  placeholder = "",
}) {
  const { editMode } = useEditMode();
  const [local, setLocal] = useState(value ?? "");

  // se cambia value dal DB (es. cambi gruppo o refresh), aggiorna local
  useEffect(() => {
    // se non sto editando → sync normale
    if (!editMode) {
      setLocal(value ?? "");
      return;
    }
    // se sto editando e local è ancora vuoto ma dal DB arriva un value → riempi
    if ((local ?? "").trim() === "" && (value ?? "").trim() !== "") {
      setLocal(value ?? "");
    }
  }, [value, editMode, local]); // (local lo usiamo ma non lo metto nelle deps per evitare loop)

  if (!editMode) {
    return <div className={className}>{value ?? ""}</div>;
  }

  return (
    <textarea
      value={local}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        setLocal(v);
        onChange?.(path, v);
      }}
      className={`
        w-full
        bg-slate-800
        border border-white/20
        rounded-md
        p-2
        text-white text-sm
        ${textareaClassName}
        `}
    />
  );
}
