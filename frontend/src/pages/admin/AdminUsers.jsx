import React, { useEffect, useState } from "react";
import { adminUsers as mockUsers } from "../../data/mockData.js";
import { fetchAdminUsers, createAdminUser } from "../../api/client.js";
import { AddModal, useModal, AdminPageHeader } from "./AdminLayout.jsx";

const initialColors = ["oklch(0.6 0.15 275)", "oklch(0.6 0.15 25)", "oklch(0.6 0.15 155)", "oklch(0.65 0.15 85)"];

function initials(name) {
  return (name || "?").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminUsers() {
  const { open, openModal, closeModal } = useModal();
  const [users, setUsers] = useState(mockUsers);

  useEffect(() => {
    fetchAdminUsers()
      .then(data => {
        if (data && data.length) {
          setUsers(data.map(u => ({ name: u.username, email: u.email, subject: "—", level: "—", premium: u.is_premium })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Foydalanuvchilar"
        subtitle={`Jami ${users.length} ta ro'yxatdan o'tgan foydalanuvchi`}
        action={<button className="btn btn-primary" onClick={openModal}>+ Yangi foydalanuvchi</button>}
      />
      <input className="input admin-search" placeholder="Foydalanuvchi qidirish..." style={{ marginBottom: 16 }} />
      <div className="admin-table">
        <div className="admin-table-head" style={{ gridTemplateColumns: "2.2fr 1fr 1fr 0.9fr" }}>
          <div>Foydalanuvchi</div><div>Fan</div><div>Daraja</div><div>Holat</div>
        </div>
        {users.map((u, i) => (
          <div key={i} className="admin-table-row" style={{ gridTemplateColumns: "2.2fr 1fr 1fr 0.9fr" }}>
            <div className="user-cell">
              <div className="avatar-initial" style={{ background: initialColors[i % initialColors.length] }}>{initials(u.name)}</div>
              <div>
                <div className="user-name">{u.name}</div>
                <div className="user-email">{u.email}</div>
              </div>
            </div>
            <div>{u.subject}</div>
            <div>{u.level}</div>
            <div><span className={"badge " + (u.premium ? "on" : "off")}>{u.premium ? "Premium" : "Free"}</span></div>
          </div>
        ))}
      </div>
      {open && (
        <AddModal
          title="Yangi foydalanuvchi qo'shish"
          fields={[
            { name: "username", label: "Foydalanuvchi nomi" },
            { name: "email", label: "Email" },
            { name: "phone", label: "Telefon" },
          ]}
          onSubmit={async (v) => {
            const created = await createAdminUser(v);
            setUsers(u => [{ name: created.username, email: created.email, subject: "—", level: "—", premium: false }, ...u]);
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
