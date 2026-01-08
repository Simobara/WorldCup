import { useState } from "react";
import { useEditMode } from "../Providers/EditModeProvider";
import { useAuth } from "../Services/supabase/AuthProvider";

export default function AdminEditToggle({ className = "", onExit }) {
  const { user } = useAuth();
  const { editMode, setEditMode } = useEditMode();
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  // const ctx = useEditMode();
  // console.log("Edit ctx keys:", Object.keys(ctx || {}), ctx);

  return (
    <button
      disabled={saving}
      onClick={async () => {
        if (saving) return;

        if (editMode) {
          try {
            setSaving(true);
            await onExit?.(); // uscita manuale = salva
            setEditMode(false);
          } finally {
            setSaving(false);
          }
        } else {
          setEditMode(true);
        }
      }}
      className={`px-3 py-[0.7rem]  bg-red-600 text-white text-xs shadow-lg disabled:opacity-60 ${className}  md:text-[20px] text-[12px]`}
    >
      {saving ? "💾" : editMode ? "✅" : "☑️"}
    </button>
  );
}
