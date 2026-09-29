import React, { useEffect, useState } from "react";
import { adminVideos as mockVideos } from "../../data/mockData.js";
import { fetchAdminVideos } from "../../api/client.js";
import { AdminPageHeader } from "./AdminLayout.jsx";

export default function AdminVideos() {
  const [videos, setVideos] = useState(mockVideos);

  useEffect(() => {
    fetchAdminVideos()
      .then(data => {
        if (data && data.length) {
          setVideos(data.map(v => ({ title: v.title, subject: v.subject?.name || "—", difficulty: v.difficulty, rating: v.avg_rating, views: v.view_count })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader title="Video kutubxonasi" subtitle="AI tomonidan tavsiya qilingan va keshlangan YouTube videolari" />
      <div className="admin-table">
        <div className="admin-table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr" }}>
          <div>Video</div><div>Fan</div><div>Daraja</div><div>Reyting</div><div>Ko'rishlar</div>
        </div>
        {videos.map((v, i) => (
          <div key={i} className="admin-table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1fr" }}>
            <div style={{ fontWeight: 600 }}>{v.title}</div>
            <div>{v.subject}</div>
            <div>{v.difficulty}</div>
            <div>⭐ {v.rating}</div>
            <div>{(v.views || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
