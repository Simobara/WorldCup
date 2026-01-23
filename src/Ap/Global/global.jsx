import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QualifiedTeamsSync } from "./QualifiedTeamsSync";

const QualifiedTeamsContext = createContext(null);

export function QualifiedTeamsProvider({
  children,
  isLogged = false,
  userEmail = "",
  refreshKey = 0,
}) {
  const [qualifiedTeams, setQualifiedTeams] = useState(() => {
    try {
      const raw = localStorage.getItem("wc26_qualifiedTeams");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // ✅ helper: merge comodo (evita di riscrivere sempre prev => ({...prev,...}))
  const mergeQualifiedTeams = (patch) => {
    setQualifiedTeams((prev) => ({ ...(prev || {}), ...(patch || {}) }));
  };

  const [isQualifiedLoading, setIsQualifiedLoading] = useState(false);

  // 🔁 “segnale” globale: ogni bump = i listener rifetchano subito
  const [dataVersion, setDataVersion] = useState(0);
  const bumpDataVersion = () => setDataVersion((v) => v + 1);

  const value = useMemo(
    () => ({
      qualifiedTeams,
      setQualifiedTeams,
      mergeQualifiedTeams, // ✅ AGGIUNTO
      isQualifiedLoading,
      setIsQualifiedLoading,
      dataVersion,
      bumpDataVersion,
    }),
    [qualifiedTeams, isQualifiedLoading, dataVersion],
  );

  useEffect(() => {
    console.log("🟣 QualifiedTeamsContext UPDATED:", qualifiedTeams);
  }, [qualifiedTeams]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "wc26_qualifiedTeams",
        JSON.stringify(qualifiedTeams),
      );
    } catch {
      // ignore
    }
  }, [qualifiedTeams]);

  return (
    <QualifiedTeamsContext.Provider value={value}>
      {/* ✅ passa direttamente il setter, NO hook dentro Sync */}
      <QualifiedTeamsSync
        isLogged={isLogged}
        userEmail={userEmail}
        refreshKey={refreshKey}
        setQualifiedTeams={setQualifiedTeams}
        setIsQualifiedLoading={setIsQualifiedLoading}
      />

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
