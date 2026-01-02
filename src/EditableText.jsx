import { useEffect, useState } from "react";
import { useEditMode } from "./EditModeProvider";

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
    if (!editMode) setLocal(value ?? "");
  }, [value, editMode]);

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
