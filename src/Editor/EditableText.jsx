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
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!editMode) {
      dirtyRef.current = false;
      setLocal(value ?? "");
      return;
    }
    if (!dirtyRef.current) setLocal(value ?? "");
  }, [value, editMode]);

  return (
    <textarea
      value={editMode ? local : (value ?? "")}
      placeholder={placeholder}
      readOnly={!editMode}
      onChange={(e) => {
        if (!editMode) return;
        const v = e.target.value;
        dirtyRef.current = true;
        setLocal(v);
        onChange?.(path, v);
      }}
      className={`
        block w-full
        rounded-md
        text-white text-sm
        leading-[1.25rem]
        min-h-[80px] md:min-h-0

        ${
          editMode
            ? "bg-slate-800 border border-white/20 p-2"
            : "bg-slate-800/70 border border-white/10 p-2 opacity-95"
        }

        ${className}
        ${textareaClassName}
      `}
    />
  );
}
