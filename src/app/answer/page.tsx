"use client";

import { FormEvent, useEffect, useState } from "react";
import type { QaEntry } from "@/lib/types";

export default function AnswerPage() {
  const [entries, setEntries] = useState<QaEntry[]>([]);
  const [secret, setSecret] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/questions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { entries: QaEntry[] };
      setEntries(data.entries);
    })();
  }, []);

  async function submitAnswer(e: FormEvent, id: string) {
    e.preventDefault();
    setStatus(null);
    const answer = (drafts[id] ?? "").trim();
    if (!answer) return;

    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, answer, secret }),
    });
    const data = (await res.json()) as { error?: string; entry?: QaEntry };
    if (!res.ok) {
      setStatus(data.error ?? "failed");
      return;
    }
    setEntries((prev) => prev.map((item) => (item.id === id ? data.entry! : item)));
    setDrafts((prev) => ({ ...prev, [id]: "" }));
    setStatus("saved");
  }

  const unanswered = entries.filter((e) => !e.answer);

  return (
    <main className="answer-page">
      <h1>Chirper replies</h1>
      <p className="lede">private reply desk. not linked from the public page.</p>
      <label>
        secret
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {status ? <p className="ask-meta">{status}</p> : null}

      {unanswered.length === 0 ? (
        <p className="feed-empty">all caught up.</p>
      ) : (
        unanswered.map((entry) => (
          <form
            key={entry.id}
            className="answer-card"
            onSubmit={(e) => submitAnswer(e, entry.id)}
          >
            <p>
              <span className="role">q:</span> {entry.question}
            </p>
            <textarea
              rows={3}
              value={drafts[entry.id] ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
              }
              placeholder="your answer"
            />
            <button type="submit">save</button>
          </form>
        ))
      )}
    </main>
  );
}
