import { useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";
import { useAuth } from "../Services/supabase/AuthProvider";

export default function AdminEditToggle({
  className = "",
  onExit,
  buttonRef, // ref passato dal genitore
  onTabNext,
}) {
  const { user } = useAuth();
  const { editMode, setEditMode } = useEditMode();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleToggle = async () => {
    if (saving) return;

    if (editMode) {
      // uscita da edit → salva
      try {
        setSaving(true);
        await onExit?.();
        setEditMode(false);
      } finally {
        setSaving(false);
      }
    } else {
      // entrata in edit
      setEditMode(true);
    }
  };

  const handleKeyDown = async (e) => {
    // ENTER: attiva/disattiva edit
    if (e.key === "Enter") {
      e.preventDefault();

      const wasEdit = editMode; // stato PRIMA del toggle
      await handleToggle();

      // se prima NON ero in edit → adesso sono entrato in edit
      // porta il focus alle frecce (prima disponibile)
      if (!wasEdit && typeof onTabNext === "function") {
        // piccolo delay per essere sicuri che il re-render sia finito
        setTimeout(() => {
          onTabNext();
        }, 0);
      }
      return;
    }

    // TAB avanti dal pulsante → vai alla prima freccia
    if (e.key === "Tab" && !e.shiftKey && typeof onTabNext === "function") {
      e.preventDefault();
      onTabNext();
      return;
    }

    // Shift+Tab = comportamento normale
  };

  return (
    <button
      ref={buttonRef}
      disabled={saving}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        px-3 py-[0.7rem]
        bg-red-600 text-white text-xs shadow-lg
        disabled:opacity-60
        md:text-[20px] text-[12px]
        ${className}
      `}
    >
      {saving ? "💾" : editMode ? "✅" : "☑️"}
    </button>
  );
}
