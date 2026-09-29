import React, { useEffect, useState } from "react";
import { leaderboard as mockLeaderboard } from "../../data/mockData.js";
import { fetchLeaderboard } from "../../api/client.js";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [rows, setRows] = useState(mockLeaderboard);

  useEffect(() => {
    fetchLeaderboard()
      .then(data => {
        if (data && data.length) {
          setRows(data.map((r, i) => ({ rank: r.rank ?? i + 1, name: r.username, points: r.total_points, you: false })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>Leaderboard</h1>
      <div className="lb-list">
        {rows.map(row => (
          <div key={row.rank} className={"lb-row" + (row.you ? " you" : "")}>
            <div className="lb-rank">#{row.rank}</div>
            <div className="lb-name">{row.name}</div>
            <div className="lb-points">{row.points} ball</div>
          </div>
        ))}
      </div>
    </div>
  );
}
