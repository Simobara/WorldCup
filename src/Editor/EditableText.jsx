import { useEffect, useRef, useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";

export default function EditableText({
  path,
  value,
  onChange,
  className = "",
  textareaClassName = "",
  placeholder = "",
}) {
  const { editMode } = useEditMode();
  const [local, setLocal] = useState(value ?? "");
  const dirtyRef = useRef(false); // true = l’utente ha scritto, non sovrascrivere

  // Sync local <- value quando:
  // - NON sei in edit mode (sempre)
  // - sei in edit mode MA non hai ancora scritto (dirty=false)
  useEffect(() => {
    if (!editMode) {
      dirtyRef.current = false;      // reset quando esci da edit
      setLocal(value ?? "");
      return;
    }

    // se entro in edit e non ho ancora toccato nulla, prendo il valore salvato
    if (!dirtyRef.current) {
      setLocal(value ?? "");
    }
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
        dirtyRef.current = true;     // da ora in poi non sovrascrivere local
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
