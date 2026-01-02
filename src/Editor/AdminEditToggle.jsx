import { useEditMode } from "../Providers/EditModeProvider";
import { useAuth } from "../Services/supabase/AuthProvider";

export default function AdminEditToggle({ className = "", onExit }) {
  const { user } = useAuth();
  const { editMode, toggleEdit } = useEditMode();

  if (!user) return null;

  return (
    <button
      onClick={async () => {
        // se sto uscendo, prima salva
        if (editMode) {
          await onExit?.();
        }
        toggleEdit();
      }}
      className={`px-3 py-2 bg-red-800 text-white text-xs shadow-lg ${className}`}
    >
      {editMode ? "✅" : "☑️"}
    </button>
  );
}
