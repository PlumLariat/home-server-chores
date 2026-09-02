import { NavLink } from "react-router-dom";
import { PersonSwitcher } from "./PersonSwitcher";

export function NavBar({ onNewChore }: { onNewChore: () => void }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">Chores</div>
      <nav className="navbar-links">
        <NavLink to="/daily" className={({ isActive }) => (isActive ? "active" : "")}>
          Daily
        </NavLink>
        <NavLink to="/weekly" className={({ isActive }) => (isActive ? "active" : "")}>
          Weekly
        </NavLink>
        <NavLink to="/monthly" className={({ isActive }) => (isActive ? "active" : "")}>
          Monthly
        </NavLink>
        <NavLink to="/archive" className={({ isActive }) => (isActive ? "active" : "")}>
          Archive
        </NavLink>
      </nav>
      <div className="navbar-actions">
        <PersonSwitcher />
        <button className="btn btn-primary" onClick={onNewChore}>
          + New Chore
        </button>
      </div>
    </header>
  );
}
