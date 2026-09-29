import React, { useEffect, useState } from "react";
import { mathProblems as mockProblems, weakTopics } from "../../data/mockData.js";
import { fetchMathProblems, submitMathAnswer as submitMathAnswerApi } from "../../api/client.js";
import "./MathPractice.css";

export default function MathPractice() {
  const [problems, setProblems] = useState(mockProblems);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [index] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [stepsRevealed, setStepsRevealed] = useState(false);
  const problem = problems[index];

  useEffect(() => {
    fetchMathProblems()
      .then(data => { if (data && data.length) setProblems(data); })
      .catch(() => setUsingDemoData(true));
  }, []);

  async function submit() {
    if (!usingDemoData && problem.id) {
      try {
        const res = await submitMathAnswerApi(problem.id, { user_answer: answer });
        setFeedback({ correct: res.is_correct, text: res.is_correct ? "To'g'ri javob! 🎉" : "Noto'g'ri, qayta urinib ko'ring." });
        return;
      } catch (e) { /* fall through to local check */ }
    }
    const correct = answer.replace(/\s/g, "") === (problem.answer || "").replace(/\s/g, "");
    setFeedback({ correct, text: correct ? "To'g'ri javob! 🎉" : "Noto'g'ri, qayta urinib ko'ring." });
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>Matematika mashqlari</h1>
      <div className="math-grid">
        <div className="math-card">
          <div className="math-topic">{problem.topic} &middot; {problem.difficulty}</div>
          <div className="math-statement">{problem.statement}</div>
          <input className="input" style={{ marginBottom: 14 }} placeholder="Javobingiz" value={answer} onChange={e => setAnswer(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={submit}>Tekshirish</button>
            <button className="btn btn-outline" onClick={() => setStepsRevealed(true)}>Yechimni ko'rsat</button>
          </div>
          {feedback && <div className={"math-feedback " + (feedback.correct ? "correct" : "wrong")}>{feedback.text}</div>}
          {stepsRevealed && (problem.steps || problem.solution_steps) && (
            <div className="steps-list">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-muted)" }}>Qadamlar:</div>
              {(problem.steps || problem.solution_steps).map((s, i) => <div key={i} className="step-line">{s}</div>)}
            </div>
          )}
        </div>
        <div className="weak-panel">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Eng zaif mavzular</div>
          {weakTopics.map((wt, i) => (
            <div key={i} className="weak-row"><span>{wt.name}</span><span style={{ fontWeight: 700, color: "var(--danger)" }}>{wt.accuracy}%</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
