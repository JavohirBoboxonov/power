import React, { useEffect, useState } from "react";
import { adminPayments as mockPayments } from "../../data/mockData.js";
import { fetchAdminPayments } from "../../api/client.js";
import { AdminPageHeader } from "./AdminLayout.jsx";

export default function AdminPayments() {
  const [payments, setPayments] = useState(mockPayments);

  useEffect(() => {
    fetchAdminPayments()
      .then(data => {
        if (data && data.length) {
          setPayments(data.map(p => ({
            user: p.username, plan: p.plan_name, provider: p.provider,
            amount: Number(p.amount_uzs).toLocaleString() + " so'm", status: p.status,
            date: (p.paid_at || p.created_at || "").slice(0, 10),
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader title="To'lovlar" subtitle="Payme / Click orqali amalga oshirilgan tranzaksiyalar" />
      <div className="admin-table">
        <div className="admin-table-head" style={{ gridTemplateColumns: "1.6fr 1.4fr 1fr 1fr 0.9fr 1fr" }}>
          <div>Foydalanuvchi</div><div>Reja</div><div>Provayder</div><div>Summa</div><div>Holat</div><div>Sana</div>
        </div>
        {payments.map((p, i) => (
          <div key={i} className="admin-table-row" style={{ gridTemplateColumns: "1.6fr 1.4fr 1fr 1fr 0.9fr 1fr" }}>
            <div style={{ fontWeight: 600 }}>{p.user}</div>
            <div>{p.plan}</div>
            <div>{p.provider}</div>
            <div>{p.amount}</div>
            <div><span className={"badge " + (p.status === "success" ? "on" : "off")}>{p.status === "success" ? "To'landi" : "Kutilmoqda"}</span></div>
            <div>{p.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
