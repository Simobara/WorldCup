import { createContext, useContext, useState } from "react";

const EditCtx = createContext({
  editMode: false,
  toggleEdit: () => {},
});

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const toggleEdit = () => setEditMode((v) => !v);

  return (
    <EditCtx.Provider value={{ editMode, toggleEdit }}>
      {children}
    </EditCtx.Provider>
  );
}

export function useEditMode() {
  return useContext(EditCtx);
}
