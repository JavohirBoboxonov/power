import React, { useEffect, useRef, useState } from "react";
import { initialChatMessages } from "../../data/mockData.js";
import { fetchSubjects, fetchAvatars, createSession, addSessionTurn, endSession } from "../../api/client.js";
import "./Chat.css";

export default function Chat() {
  const [messages, setMessages] = useState(initialChatMessages.map(m => ({ id: m.id, text: m.text, mine: m.mine, pronunciation: m.pronunciation, grammar: m.grammar })));
  const [input, setInput] = useState("");
  const [avatarName, setAvatarName] = useState("Emma");
  const [levelLabel, setLevelLabel] = useState("B1 daraja");
  const sessionRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const subjects = await fetchSubjects();
        const avatars = await fetchAvatars();
        const english = (subjects || []).find(s => s.code === "english") || (subjects || [])[0];
        const avatar = (avatars || [])[0];
        if (avatar) setAvatarName(avatar.name);
        if (english) {
          const session = await createSession(english.id, avatar?.id);
          sessionRef.current = session.id;
        }
      } catch (e) { /* demo mode: no backend session */ }
    })();
    return () => { if (sessionRef.current) endSession(sessionRef.current).catch(() => {}); };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const localMsg = { id: Date.now(), text, mine: true, pronunciation: 78 + Math.floor(Math.random() * 15), grammar: 70 + Math.floor(Math.random() * 20) };
    setMessages(m => [...m, localMsg]);

    if (sessionRef.current) {
      try {
        await addSessionTurn(sessionRef.current, { speaker: "user", text, pronunciation_score: localMsg.pronunciation, grammar_score: localMsg.grammar });
        const reply = await addSessionTurn(sessionRef.current, { speaker: "avatar", text: "Good effort! Let's continue — can you describe your favorite meal?" });
        setMessages(m => [...m, { id: Date.now() + 1, text: reply.text, mine: false }]);
        return;
      } catch (e) { /* fall through to local demo reply */ }
    }
    setMessages(m => [...m, { id: Date.now() + 1, text: "Good effort! Let's continue — can you describe your favorite meal?", mine: false }]);
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>Avatar bilan suhbat — Ingliz tili</h1>
      <div className="chat-grid">
        <div className="avatar-card">
          <div className="avatar-preview">avatar video</div>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{avatarName}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{levelLabel}</div>
        </div>
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.map(m => (
              <div key={m.id} className={"msg-row " + (m.mine ? "mine" : "theirs")}>
                <div className={"msg-bubble " + (m.mine ? "mine" : "theirs")}>{m.text}</div>
                {m.pronunciation != null && (
                  <div className="msg-scores">Talaffuz {m.pronunciation}% &middot; Grammatika {m.grammar}%</div>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <input className="input" placeholder="Xabar yozing..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn btn-primary" onClick={send}>Yuborish</button>
          </div>
        </div>
      </div>
    </div>
  );
}
