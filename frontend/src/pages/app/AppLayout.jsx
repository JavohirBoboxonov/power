import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import "./App.css";

const studentNav = [
  { to: "dashboard", label: "Dashboard", dot: "oklch(0.6 0.15 275)" },
  { to: "chat", label: "Avatar suhbat", dot: "oklch(0.65 0.15 200)" },
  { to: "math", label: "Matematika", dot: "oklch(0.7 0.15 85)" },
  { to: "practice", label: "Flashcard", dot: "oklch(0.65 0.15 155)" },
  { to: "videos", label: "Video tavsiyalar", dot: "oklch(0.65 0.18 25)" },
  { to: "courses", label: "Tashqi kurslar", dot: "oklch(0.6 0.15 155)" },
  { to: "ai-chat", label: "AI Chat", dot: "oklch(0.6 0.15 275)" },
  { to: "leaderboard", label: "Leaderboard", dot: "oklch(0.65 0.18 25)" },
  { to: "billing", label: "Obuna", dot: "oklch(0.7 0.15 85)" },
];

export default function AppLayout() {
  const { role, logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div className="sidebar-brand">Optima</div>
        {role === "admin" ? (
          <NavLink to="admin" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
            <span className="nav-dot" style={{ background: "oklch(0.7 0.15 275)" }} />
            <span>Admin panel</span>
          </NavLink>
        ) : (
          studentNav.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
              <span className="nav-dot" style={{ background: n.dot }} />
              <span>{n.label}</span>
            </NavLink>
          ))
        )}
        <div style={{ flex: 1 }} />
        <div className="logout-item" onClick={handleLogout}>Chiqish</div>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
