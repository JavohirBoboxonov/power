import React, { useEffect, useState } from "react";
import { externalCourses as mockCourses } from "../../data/mockData.js";
import { fetchExternalCourses, fetchSavedExternalCourses, saveExternalCourse } from "../../api/client.js";
import "./Videos.css";

const SOURCES = [
  { id: "all", label: "Barchasi" },
  { id: "linkedin_learning", label: "LinkedIn Learning" },
  { id: "coursera", label: "Coursera" },
  { id: "khan_academy", label: "Khan Academy" },
  { id: "google_books", label: "Google Books" },
];

export default function Courses() {
  const [source, setSource] = useState("all");
  const [courses, setCourses] = useState(mockCourses);
  const [savedIds, setSavedIds] = useState([]);
  const [usingApi, setUsingApi] = useState(false);

  useEffect(() => {
    fetchExternalCourses().then(d => {
      if (d && d.length) { setCourses(d); setUsingApi(true); }
    }).catch(() => {});
    fetchSavedExternalCourses().then(d => {
      if (d) setSavedIds(d.map(s => s.course.id));
    }).catch(() => {});
  }, []);

  function handleSave(course) {
    if (savedIds.includes(course.id)) return;
    setSavedIds(ids => [...ids, course.id]);
    if (usingApi) saveExternalCourse(course.id).catch(() => {});
  }

  const filtered = source === "all" ? courses : courses.filter(c => c.source === source);

  return (
    <div>
      <h1 className="page-title">Tashqi kurslar</h1>
      <p className="page-sub">LinkedIn Learning, Coursera, Khan Academy va Google Books orqali qo'shimcha materiallar</p>
      <div className="tab-row">
        {SOURCES.map(s => (
          <button key={s.id} className={"tab-btn" + (source === s.id ? " active" : "")} onClick={() => setSource(s.id)}>{s.label}</button>
        ))}
      </div>
      <div className="video-grid">
        {filtered.map(c => (
          <div key={c.id} className="video-card">
            <div className="video-thumb">▶</div>
            <div className="video-body">
              <div className="video-title">{c.title}</div>
              <div className="video-meta"><span>{c.source_label}</span><span>{c.level}</span></div>
              <div className="video-actions">
                {c.is_premium_only && <span className="video-tag">Premium</span>}
                <a className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 12 }} href={c.url} target="_blank" rel="noreferrer">Ko'rish</a>
                <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleSave(c)} disabled={savedIds.includes(c.id)}>
                  {savedIds.includes(c.id) ? "Saqlangan" : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Bu bo'limda hozircha kurs yo'q.</div>}
      </div>
      {!usingApi && <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 12 }}>(Demo) Backenddan ma'lumot kelmagan — namuna kurslar ko'rsatilmoqda.</div>}
    </div>
  );
}
