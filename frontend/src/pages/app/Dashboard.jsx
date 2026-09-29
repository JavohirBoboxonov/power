import React, { useEffect, useState } from "react";
import { overallCards as mockOverall, subjectStats as mockSubjects, heatmapCells } from "../../data/mockData.js";
import { fetchDashboard } from "../../api/client.js";
import "./Dashboard.css";

export default function Dashboard() {
  const [overallCards, setOverallCards] = useState(mockOverall);
  const [subjectStats, setSubjectStats] = useState(mockSubjects);
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then(data => {
        setOverallCards([
          { label: "Umumiy soat", value: (data.total_minutes / 60).toFixed(1) },
          { label: "Sessiyalar", value: String(data.total_sessions) },
          { label: "Umumiy ball", value: String(data.subjects.reduce((a, s) => a + (s.total_points || 0), 0)) },
          { label: "Streak", value: "🔥 " + Math.max(0, ...data.subjects.map(s => s.current_streak_days || 0)) + " kun" },
        ]);
        setSubjectStats(data.subjects.map(s => ({
          name: s.subject_code, level: "—", minutes: s.total_minutes, sessions: s.sessions_completed,
          pronunciation: Math.round(s.avg_pronunciation_score || 0), streak: s.current_streak_days,
        })));
      })
      .catch(() => setUsingDemoData(true));
  }, []);

  return (
    <div>
      <h1 className="page-title">Xush kelibsiz, Aziz</h1>
      <p className="page-sub">Bugungi progress va statistikangiz{usingDemoData && " (demo ma'lumot — backend ulanmagan)"}</p>

      <div className="stat-grid">
        {overallCards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="subject-grid">
        {subjectStats.map((s, i) => (
          <div key={i} className="subject-card">
            <div className="subject-head">
              <div className="subject-name">{s.name}</div>
              <div className="subject-level">{s.level}</div>
            </div>
            <div className="metric-grid">
              <div><div className="metric-label">O'qilgan vaqt</div><div className="metric-value">{s.minutes} daq</div></div>
              <div><div className="metric-label">Sessiyalar</div><div className="metric-value">{s.sessions}</div></div>
              <div><div className="metric-label">Talaffuz</div><div className="metric-value">{s.pronunciation}%</div></div>
              <div><div className="metric-label">Streak</div><div className="metric-value">🔥 {s.streak} kun</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-grid">
        <div className="panel">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Faollik (oxirgi 7 hafta)</div>
          <div className="heatmap-grid">
            {heatmapCells.map((c, i) => <div key={i} className="heatmap-cell" style={{ background: c.color }} />)}
          </div>
        </div>
        <div className="panel">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Haftalik hisobot</div>
          <div className="growth">+18%</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>o'tgan haftaga nisbatan</div>
          <button className="btn btn-outline" style={{ width: "100%" }}>PDF yuklab olish</button>
        </div>
      </div>
    </div>
  );
}
