import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ChoreFormModal } from "./components/ChoreFormModal";
import { DailyView } from "./pages/DailyView";
import { WeeklyView } from "./pages/WeeklyView";
import { MonthlyView } from "./pages/MonthlyView";
import { ArchivePage } from "./pages/ArchivePage";

function App() {
  const [isNewChoreOpen, setIsNewChoreOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar onNewChore={() => setIsNewChoreOpen(true)} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/daily" replace />} />
            <Route path="/daily" element={<DailyView />} />
            <Route path="/weekly" element={<WeeklyView />} />
            <Route path="/monthly" element={<MonthlyView />} />
            <Route path="/archive" element={<ArchivePage />} />
          </Routes>
        </main>
        <ChoreFormModal isOpen={isNewChoreOpen} onClose={() => setIsNewChoreOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
