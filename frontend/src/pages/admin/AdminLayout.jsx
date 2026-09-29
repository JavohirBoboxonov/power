import React, { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import "./Admin.css";

const navItems = [
  { to: "users", label: "Foydalanuvchilar", icon: "◉" },
  { to: "subjects", label: "Fanlar", icon: "▦" },
  { to: "avatars", label: "Avatarlar", icon: "◐" },
  { to: "problems", label: "Masalalar", icon: "∑" },
  { to: "videos", label: "Videolar", icon: "▶" },
  { to: "payments", label: "To'lovlar", icon: "◇" },
  { to: "stats", label: "Statistika", icon: "▤" },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/app/dashboard" className="admin-back">← Ilovaga qaytish</Link>
        <div className="admin-sidebar-eyebrow">BOSHQARUV</div>
        <div className="admin-sidebar-title">Admin panel</div>
        {navItems.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "")}>
            <span className="admin-icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        <div className="admin-page-title">{title}</div>
        <p className="admin-page-sub">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function AddModal({ title, fields, onSubmit, onClose }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(name, value) {
    setValues(v => ({ ...v, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await onSubmit(values);
      onClose();
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    }
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)", marginBottom: 20 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map(f => (
            f.type === "select" ? (
              <select key={f.name} className="input" value={values[f.name] ?? ""} onChange={e => setField(f.name, e.target.value)}>
                <option value="" disabled>{f.label}</option>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input key={f.name} className="input" placeholder={f.label} value={values[f.name] ?? ""}
                     onChange={e => setField(f.name, e.target.value)} />
            )
          ))}
        </div>
        {error && <div style={{ color: "oklch(0.6 0.2 25)", fontSize: 13, marginTop: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}

export function useModal() {
  const [open, setOpen] = useState(false);
  return { open, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
}
