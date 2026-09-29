import React, { useEffect, useState } from "react";
import { adminProblems as mockProblems } from "../../data/mockData.js";
import { fetchMathProblems, createMathProblem } from "../../api/client.js";
import { AddModal, useModal, AdminPageHeader } from "./AdminLayout.jsx";

const diffLabel = { beginner: "Oson", intermediate: "O'rta", advanced: "Qiyin" };

export default function AdminProblems() {
  const { open, openModal, closeModal } = useModal();
  const [problems, setProblems] = useState(mockProblems);

  useEffect(() => {
    fetchMathProblems()
      .then(data => {
        if (data && data.length) {
          setProblems(data.map(p => ({ topic: p.topic?.name || p.topic || "—", statement: p.statement, difficulty: diffLabel[p.difficulty] || p.difficulty })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Matematika masalalari"
        subtitle="Mavzu va qiyinlik darajasi bo'yicha masalalar banki"
        action={<button className="btn btn-primary" onClick={openModal}>+ Yangi masala</button>}
      />
      <div className="admin-table">
        <div className="admin-table-head" style={{ gridTemplateColumns: "1.4fr 2fr 1fr" }}>
          <div>Mavzu</div><div>Masala</div><div>Qiyinlik</div>
        </div>
        {problems.map((p, i) => (
          <div key={i} className="admin-table-row" style={{ gridTemplateColumns: "1.4fr 2fr 1fr" }}>
            <div style={{ fontWeight: 600 }}>{p.topic}</div>
            <div style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{p.statement}</div>
            <div>{p.difficulty}</div>
          </div>
        ))}
      </div>
      {open && (
        <AddModal
          title="Yangi masala qo'shish"
          fields={[
            { name: "topic_name", label: "Mavzu (masalan: Algebra)" },
            { name: "statement", label: "Masala matni" },
            { name: "difficulty", label: "Qiyinlik", type: "select", options: [{ value: "beginner", label: "Oson" }, { value: "intermediate", label: "O'rta" }, { value: "advanced", label: "Qiyin" }] },
          ]}
          onSubmit={async (v) => {
            const created = await createMathProblem({ ...v, solution_steps: [] });
            setProblems(p => [{ topic: v.topic_name, statement: created.statement, difficulty: diffLabel[created.difficulty] }, ...p]);
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
