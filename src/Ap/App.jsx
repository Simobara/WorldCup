import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import TopInfo from "../Ap/TopInfo";
import StandingsPage from "../Body/1standingsPage";
import GroupMatchesPage from "../Body/2aGroupMatchesPage";
import GroupRankPage from "../Body/2bGroupRankPage";
import TablePage from "../Body/3tablePage";

const App = () => {
  return (
    <Router>
      <div className="relative h-[100svh] md:h-screen w-screen bg-slate-900 overflow-hidden overscroll-none touch-none">
        <TopInfo />
        <div className="h-full w-full flex">
          <Routes>
            <Route path="/" element={<Navigate to="/standingsPage" replace />}
            />
            <Route path="/standingsPage" element={<StandingsPage />} />
            <Route path="/groupRankPage" element={<GroupRankPage />} />
            <Route path="/groupMatchesPage" element={<GroupMatchesPage />} />
            <Route path="/tablePage" element={<TablePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
