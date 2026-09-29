import React, { useEffect, useState } from "react";
import { recommendedVideos as mockRecommended, savedVideos as mockSaved } from "../../data/mockData.js";
import { fetchRecommendedVideos, fetchSavedVideos, saveVideo, markVideoClicked } from "../../api/client.js";
import "./Videos.css";

export default function Videos() {
  const [tab, setTab] = useState("recommended");
  const [recommended, setRecommended] = useState(mockRecommended);
  const [saved, setSaved] = useState(mockSaved);
  const [usingApi, setUsingApi] = useState(false);

  useEffect(() => {
    fetchRecommendedVideos().then(d => {
      if (d && d.length) {
        setRecommended(d.map(r => ({ id: r.video.id, recId: r.id, youtubeId: r.video.youtube_id, title: r.video.title, channel: r.video.channel_title, duration: "—", difficulty: r.video.difficulty, rating: r.video.avg_rating })));
        setUsingApi(true);
      }
    }).catch(() => {});
    fetchSavedVideos().then(d => {
      if (d && d.length) setSaved(d.map(s => ({ id: s.video.id, youtubeId: s.video.youtube_id, title: s.video.title, channel: s.video.channel_title, duration: "—" })));
    }).catch(() => {});
  }, []);

  const list = tab === "recommended" ? recommended : saved;
  const [playing, setPlaying] = useState(null);

  function handleSave(video) {
    if (!usingApi) {
      setSaved(s => (s.find(v => v.id === video.id) ? s : [...s, video]));
      return;
    }
    saveVideo(video.id)
      .then(() => setSaved(s => (s.find(v => v.id === video.id) ? s : [...s, video])))
      .catch(() => {});
  }

  function handleOpen(video) {
    if (video.recId) markVideoClicked(video.recId).catch(() => {});
    if (video.youtubeId) setPlaying(video);
  }

  return (
    <div>
      <h1 className="page-title">Video tavsiyalar</h1>
      <p className="page-sub">Dars natijalaringiz asosida AI tanlagan YouTube videolari</p>
      <div className="tab-row">
        <button className={"tab-btn" + (tab === "recommended" ? " active" : "")} onClick={() => setTab("recommended")}>Tavsiya etilgan</button>
        <button className={"tab-btn" + (tab === "saved" ? " active" : "")} onClick={() => setTab("saved")}>Saqlanganlar</button>
      </div>
      <div className="video-grid">
        {list.map((v, i) => (
          <div key={i} className="video-card">
            <div className="video-thumb" onClick={() => handleOpen(v)} style={{ cursor: "pointer" }}>▶</div>
            <div className="video-body">
              <div className="video-title">{v.title}</div>
              <div className="video-meta"><span>{v.channel}</span><span>{v.duration}</span></div>
              <div className="video-actions">
                {v.difficulty && <span className="video-tag">{v.difficulty}</span>}
                {tab === "recommended" && <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleSave(v)}>Saqlash</button>}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Hozircha video yo'q.</div>}
        {!usingApi && <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 12 }}>(Demo) Backenddan haqiqiy tavsiya kelmagan — namuna ma'lumot ko'rsatilmoqda.</div>}
      </div>
      {playing && (
        <div className="modal-backdrop" onClick={() => setPlaying(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(880px, 92vw)", aspectRatio: "16/9", background: "#000", borderRadius: 12, overflow: "hidden" }}>
            <iframe
              width="100%" height="100%"
              src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
              title={playing.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
