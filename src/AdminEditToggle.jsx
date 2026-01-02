import { useAuth } from "./AuthProvider";
import { useEditMode } from "./EditModeProvider";

export default function AdminEditToggle({ className = "" }) {
  const { user } = useAuth();
  const { editMode, toggleEdit } = useEditMode();

  if (!user) return null;

  return (
    <button
      onClick={toggleEdit}
      className={`px-3 py-2 rounded-full bg-red-600 text-white text-xs shadow-lg ${className}`}
    >
      {editMode ? "EXIT EDIT" : "EDIT"}
    </button>
  );
}
