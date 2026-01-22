import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * qualifiedTeams: mappa tipo { "1B": "ITA", "2B": "CAN" }
 * setQualifiedTeams: setter per aggiornare la mappa
 */
const QualifiedTeamsContext = createContext(null);

export function QualifiedTeamsProvider({ children }) {
  const [qualifiedTeams, setQualifiedTeams] = useState({});

  const value = useMemo(
    () => ({ qualifiedTeams, setQualifiedTeams }),
    [qualifiedTeams],
  );

  return (
    <QualifiedTeamsContext.Provider value={value}>
      {children}
    </QualifiedTeamsContext.Provider>
  );
}

export function useQualifiedTeams() {
  const ctx = useContext(QualifiedTeamsContext);
  if (!ctx) {
    throw new Error(
      "useQualifiedTeams deve essere usato dentro <QualifiedTeamsProvider>",
    );
  }
  return ctx;
}
