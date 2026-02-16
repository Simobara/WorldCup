/* -----------------------------------------------------------------------------
📄 File: App.jsx
Scopo: componente root dell’app.
       Gestisce provider globali, routing e layout principale.
🔹 Include:
- AuthProvider (autenticazione Supabase)
- EditModeProvider (modalità admin)
- Router e route principali
- TopInfo sempre visibile
Note:
- Layout full-screen mobile/desktop
- UI app-like senza scroll nativo
------------------------------------------------------------------------------*/
// App.jsx
// deploy bump
/* -----------------------------------------------------------------------------
📄 File: App.jsx
Scopo: componente root dell’app.
       Gestisce provider globali, routing e layout principale.
------------------------------------------------------------------------------*/
/* -----------------------------------------------------------------------------
📄 File: App.jsx
Scopo: componente root dell’app.
       Gestisce provider globali, routing e layout principale.
------------------------------------------------------------------------------*/

import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { supabase } from "../Services/supabase/supabaseClient";

import TopInfo from "../Ap/TopInfo";
import StandingsPage from "../Body/1standingsPage";
import GroupMatchesPage from "../Body/2aGroupMatchesPage";
import GroupRankPage from "../Body/2bGroupRankPage";
import TablePage from "../Body/3TablePageX";
import { EditModeProvider } from "../Providers/EditModeProvider";
import { AuthProvider } from "../Services/supabase/AuthProvider";

import SeedMatchStructure from "../START/app/admin/resetSeed";
import AdminSeedStructure from "../START/app/admin/seedStructure";
import { QualifiedTeamsProvider } from "./Global/global";

function AppRoutes({ isLogged, userEmail, refreshKey }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/standingsPage" replace />} />
      <Route path="/standingsPage" element={<StandingsPage />} />
      <Route path="/groupRankPage" element={<GroupRankPage />} />
      <Route path="/groupMatchesPage" element={<GroupMatchesPage />} />
      <Route path="/tablePage" element={<TablePage />} />

      {/* ADMIN */}
      <Route path="/admin/seed-structure" element={<AdminSeedStructure />} />
      <Route path="/admin/run-seed" element={<SeedMatchStructure />} />
    </Routes>
  );
}

const App = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session ?? null;
      setIsLogged(!!session);
      setUserEmail(session?.user?.email ?? "");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
      setUserEmail(session?.user?.email ?? "");
      setRefreshKey((k) => k + 1);
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <AuthProvider>
      <EditModeProvider>
        <Router>
          <QualifiedTeamsProvider isLogged={isLogged} userEmail={userEmail} refreshKey={refreshKey}>
            <div className="relative h-[100svh] md:h-screen w-screen bg-slate-900 overflow-hidden overscroll-none touch-none">
              
              {/* ✅ overlay globale (sotto al modal) */}
              {loginOpen && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[opx] z-[900]" />
              )}

              <TopInfo onModalChange={setLoginOpen} />

              <div className="h-full w-full flex">
                <AppRoutes isLogged={isLogged} userEmail={userEmail} refreshKey={refreshKey} />
              </div>
            </div>
          </QualifiedTeamsProvider>
        </Router>
      </EditModeProvider>
    </AuthProvider>
  );
};


export default App;
