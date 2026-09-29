import React, { useEffect, useState } from "react";
import { flashcards as mockFlashcards } from "../../data/mockData.js";
import { fetchDueFlashcards, gradeFlashcard } from "../../api/client.js";
import "./Flashcards.css";

export default function Flashcards() {
  const [cards, setCards] = useState(mockFlashcards.map((c, i) => ({ id: i, front: c.front, back: c.back })));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [usingApi, setUsingApi] = useState(false);
  const card = cards[index] || { front: "Hozircha karta yo'q", back: "" };

  useEffect(() => {
    fetchDueFlashcards()
      .then(data => {
        if (data && data.length) {
          setCards(data.map(r => ({ id: r.id, front: r.front_text, back: r.back_text })));
          setUsingApi(true);
        }
      })
      .catch(() => {});
  }, []);

  function next(quality) {
    if (usingApi && card.id != null) {
      gradeFlashcard(card.id, quality).catch(() => {});
    }
    setIndex(i => (i + 1) % Math.max(cards.length, 1));
    setFlipped(false);
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>Flashcard (Spaced Repetition)</h1>
      <div className="flash-wrap">
        <div className="flash-card" onClick={() => setFlipped(f => !f)}>{flipped ? card.back : card.front}</div>
        <div className="flash-hint">Kartani ag'darish uchun bosing &middot; {cards.length ? index + 1 : 0} / {cards.length}</div>
        <div className="flash-actions">
          <button className="flash-btn" style={{ background: "oklch(0.6 0.18 25)" }} onClick={() => next(1)}>Bilmadim</button>
          <button className="flash-btn" style={{ background: "oklch(0.7 0.15 85)" }} onClick={() => next(3)}>Qiynaldim</button>
          <button className="flash-btn" style={{ background: "oklch(0.6 0.15 155)" }} onClick={() => next(5)}>Bilaman</button>
        </div>
      </div>
    </div>
  );
}
