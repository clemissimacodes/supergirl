"use client";

import { FormEvent, useState } from "react";
import { Avatar } from "./Avatar";
import { Nose } from "./Nose";

type AskFormProps = {
  onAsked: () => void;
};

export function AskForm({ onAsked }: AskFormProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sniffed, setSniffed] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const question = text.trim();
    if (!question || pending) return;

    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "something went wrong");
        return;
      }
      setText("");
      setSniffed(true);
      onAsked();
      window.setTimeout(() => setSniffed(false), 2200);
    } catch {
      setError("couldn’t reach the server");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="composer">
      <Avatar kind="anon" />
      <form className="composer-main" onSubmit={onSubmit}>
        <textarea
          className="composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={2}
          autoComplete="off"
          spellCheck
          placeholder="What’s on your mind?"
          aria-label="your question or comment"
          disabled={pending}
        />
        <div className="composer-bar">
          <div className="composer-meta" aria-live="polite">
            {error ? <span className="ask-error">{error}</span> : null}
            {sniffed ? (
              <span className="ask-sent">
                <Nose className="ask-nose" />
                sniffed
              </span>
            ) : (
              <span className="composer-hint">no name · posts as anon</span>
            )}
          </div>
          <button
            className="composer-btn"
            type="submit"
            disabled={pending || !text.trim()}
          >
            ask
          </button>
        </div>
      </form>
    </div>
  );
}
