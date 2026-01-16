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
import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { supabase } from "../Services/supabase/supabaseClient";

import TopInfo from "../Ap/TopInfo";
import StandingsPage from "../Body/1standingsPage";
import GroupMatchesPage from "../Body/2aGroupMatchesPage";
import GroupRankPage from "../Body/2bGroupRankPage";
import TablePage from "../Body/3TablePageX";
import { EditModeProvider } from "../Providers/EditModeProvider";
import { AuthProvider } from "../Services/supabase/AuthProvider";

import SeedStructure from "../START/app/admin/SeedStructure";
import SeedMatchStructure from "../START/app/admin/resetSeed";

function AppRoutes() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // iniziale
    supabase.auth.getSession().then(({ data }) => {
      setIsLogged(!!data?.session);
    });

    // update live
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/standingsPage" replace />} />
      <Route path="/standingsPage" element={<StandingsPage />} />
      <Route path="/groupRankPage" element={<GroupRankPage/>} />
      <Route path="/groupMatchesPage" element={<GroupMatchesPage />} />
      <Route path="/tablePage" element={<TablePage />} /> 
             {/* ADMIN */}
         {/* 👇 Editor struttura: QUI vedi la pagina che hai incollato */}
      <Route path="/admin/seed-structure" element={<SeedStructure />} />
      {/* 👇 Pagina che fa effettivamente il seed su Supabase */}
      <Route path="/admin/run-seed" element={<SeedMatchStructure />} />

    </Routes>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <EditModeProvider>
        <Router>
          <div className="relative h-[100svh] md:h-screen w-screen bg-slate-900 overflow-hidden overscroll-none touch-none">
            <TopInfo />
            <div className="h-full w-full flex">
              <AppRoutes />
            </div>
          </div>
        </Router>
      </EditModeProvider>
    </AuthProvider>
  );
};

export default App;
