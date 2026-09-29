import React, { useEffect, useState } from "react";
import { paymentPlans, transactionHistory } from "../../data/mockData.js";
import { createPayment, fetchPlans } from "../../api/client.js";
import "./Billing.css";

export default function Billing() {
  const [history] = useState(transactionHistory);
  const [pending, setPending] = useState(null);
  const [plans, setPlans] = useState(paymentPlans);
  const [usingApi, setUsingApi] = useState(false);

  useEffect(() => {
    fetchPlans()
      .then(data => {
        if (data && data.length) {
          setPlans(data.map(p => ({
            id: p.id, name: p.name,
            price: Number(p.price_usd) === 0 ? "Bepul" : `$${p.price_usd}/oy`,
            provider: "payme",
          })));
          setUsingApi(true);
        }
      })
      .catch(() => {});
  }, []);

    async function handleBuy(plan) {
    if (!usingApi) {
      alert("Demo rejim: backend ulanmagan, to'lov havolasi generatsiya qilinmadi.");
      return;
    }
    setPending(plan.id);
    try {
      const res = await createPayment(plan.id, plan.provider);
      if (res.mock) {
        alert("To'lov (demo rejim) muvaffaqiyatli amalga oshirildi! Haqiqiy to'lovlar uchun .env fayliga PAYME_MERCHANT_ID / CLICK_MERCHANT_ID qo'shing.");
      } else if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (e) {
      alert("Xato: " + e.message);
    }
    setPending(null);
  }

  return (
    <div>
      <h1 className="page-title">Obuna va to'lovlar</h1>
      <p className="page-sub">Premium rejaga o'ting — Payme yoki Click orqali to'lang</p>
      <div className="billing-grid">
        {plans.map(p => (
          <div key={p.id} className="plan-tile">
            <div className="plan-tile-name">{p.name}</div>
            <div className="plan-tile-price">{p.price}</div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => handleBuy(p)} disabled={pending === p.id}>
              {pending === p.id ? "Yuklanmoqda..." : `${p.provider === "payme" ? "Payme" : "Click"} orqali to'lash`}
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>To'lovlar tarixi</div>
      <div className="admin-table">
        <div className="admin-table-head" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
          <div>Reja</div><div>Provayder</div><div>Summa</div><div>Holat</div><div>Sana</div>
        </div>
        {history.map((h, i) => (
          <div key={i} className="admin-table-row" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}>
            <div style={{ fontWeight: 600 }}>{h.plan}</div>
            <div>{h.provider}</div>
            <div>{h.amount}</div>
            <div><span className={"badge " + (h.status === "success" ? "on" : "off")}>{h.status === "success" ? "To'landi" : "Kutilmoqda"}</span></div>
            <div>{h.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
