import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import TopInfo from "../Ap/TopInfo";
import StandingsPage from "../Body/1standingsPage";
import GroupStagePage from "../Body/2groupStagePage";
import TablePage from "../Body/3tablePage";


const App = () => {
  return (
    <Router>
      <div className="relative h-[100svh] md:h-screen w-screen bg-sky-950 overflow-hidden overscroll-none touch-none">
        <TopInfo />
        <div className="h-full w-full flex">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/standingsPage" replace />}
            />
            <Route path="/standingsPage" element={<StandingsPage />} />
            <Route path="/groupStagePage" element={<GroupStagePage />} />
            <Route path="/tablePage" element={<TablePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
