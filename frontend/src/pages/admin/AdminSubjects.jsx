import React, { useEffect, useState } from "react";
import { adminSubjects as mockSubjects } from "../../data/mockData.js";
import { fetchSubjects, createSubject } from "../../api/client.js";
import { AddModal, useModal, AdminPageHeader } from "./AdminLayout.jsx";

export default function AdminSubjects() {
  const { open, openModal, closeModal } = useModal();
  const [subjects, setSubjects] = useState(mockSubjects);

  useEffect(() => {
    fetchSubjects()
      .then(data => {
        if (data && data.length) {
          setSubjects(data.map(s => ({ name: s.name, kind: s.kind === "math" ? "Fan" : "Til", levels: (s.levels || []).length, active: s.is_active_in_mvp })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Fanlar"
        subtitle="Til va matematika fanlari, CEFR darajalari"
        action={<button className="btn btn-primary" onClick={openModal}>+ Yangi fan</button>}
      />
      <div className="grid-3">
        {subjects.map((s, i) => (
          <div key={i} className="subject-tile">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.name}</div>
              <span className={"badge " + (s.active ? "on" : "off")}>{s.active ? "MVP faol" : "Kutilmoqda"}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{s.kind} &middot; {s.levels} daraja</div>
          </div>
        ))}
      </div>
      {open && (
        <AddModal
          title="Yangi fan qo'shish"
          fields={[
            { name: "code", label: "Kod (masalan: german)" },
            { name: "name", label: "Nomi (masalan: Nemis tili)" },
            { name: "kind", label: "Turi", type: "select", options: [{ value: "language", label: "Til" }, { value: "math", label: "Matematika" }] },
          ]}
          onSubmit={async (v) => {
            const created = await createSubject({ ...v, is_active_in_mvp: false });
            setSubjects(s => [{ name: created.name, kind: created.kind === "math" ? "Fan" : "Til", levels: 0, active: false }, ...s]);
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
