import { createContext, useContext, useMemo, useState } from "react";

const EditCtx = createContext({
  editMode: false,
  toggleEdit: () => {},
  setEditMode: (_v) => {},
  exitEdit: () => {},
});

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);

  const toggleEdit = () => setEditMode((v) => !v);
  const exitEdit = () => setEditMode(false);

  const value = useMemo(
    () => ({ editMode, toggleEdit, setEditMode, exitEdit }),
    [editMode]
  );

  return <EditCtx.Provider value={value}>{children}</EditCtx.Provider>;
}

export function useEditMode() {
  return useContext(EditCtx);
}
