import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import GroupStagePage from "../Body/groupStagePage";
import StandingsPage from "../Body/standingsPage";
import TablePage from "../Body/TablePage";
import TopInfo from "../components/0TopInfo";

const App = () => {
  return (
    <Router>
      <div className="relative h-screen w-screen bg-sky-950 overflow-hidden">
        <TopInfo />
        <div className="h-full w-full flex">
          <Routes>
            <Route path="/StandingsPage" element={<StandingsPage />} />
            <Route path="/TablePage" element={<TablePage />} />
            <Route path="/" element={<GroupStagePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
