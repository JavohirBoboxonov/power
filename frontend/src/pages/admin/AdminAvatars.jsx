import React, { useEffect, useState } from "react";
import { adminAvatars as mockAvatars } from "../../data/mockData.js";
import { fetchAvatars, createAvatarAdmin } from "../../api/client.js";
import { AddModal, useModal, AdminPageHeader } from "./AdminLayout.jsx";

export default function AdminAvatars() {
  const { open, openModal, closeModal } = useModal();
  const [avatars, setAvatars] = useState(mockAvatars);

  useEffect(() => {
    fetchAvatars()
      .then(data => {
        if (data && data.length) {
          setAvatars(data.map(a => ({ name: a.name, gender: a.gender === "male" ? "Erkak" : "Ayol", premium: a.is_premium_only })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Avatarlar"
        subtitle="Lip-sync avatarlar va ovoz modeli sozlamalari"
        action={<button className="btn btn-primary" onClick={openModal}>+ Yangi avatar</button>}
      />
      <div className="grid-4">
        {avatars.map((a, i) => (
          <div key={i} className="avatar-tile">
            <div className="avatar-thumb" />
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{a.gender}</div>
            {a.premium && <span className="badge on" style={{ marginTop: 8, display: "inline-block" }}>Premium</span>}
          </div>
        ))}
      </div>
      {open && (
        <AddModal
          title="Yangi avatar qo'shish"
          fields={[
            { name: "name", label: "Ismi" },
            { name: "gender", label: "Jinsi", type: "select", options: [{ value: "female", label: "Ayol" }, { value: "male", label: "Erkak" }] },
          ]}
          onSubmit={async (v) => {
            const created = await createAvatarAdmin({ ...v, voice_model_id: v.name.toLowerCase() + "-default" });
            setAvatars(a => [{ name: created.name, gender: created.gender === "male" ? "Erkak" : "Ayol", premium: false }, ...a]);
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
