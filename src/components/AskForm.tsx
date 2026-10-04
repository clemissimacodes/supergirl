"use client";

import { FormEvent, useState } from "react";
import { Avatar } from "./Avatar";

type AskFormProps = {
  onAsked: () => void;
};

export function AskForm({ onAsked }: AskFormProps) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
      setSent(true);
      onAsked();
      window.setTimeout(() => setSent(false), 1800);
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
          rows={1}
          autoComplete="off"
          spellCheck
          placeholder="ask anything anonymously"
          aria-label="ask anything anonymously"
          disabled={pending}
        />
        <div className="composer-bar">
          <div className="composer-meta" aria-live="polite">
            {error ? <span className="ask-error">{error}</span> : null}
            {sent ? <span className="ask-sent">sent</span> : null}
          </div>
          <button
            className="composer-btn"
            type="submit"
            disabled={pending || !text.trim()}
          >
            send
          </button>
        </div>
      </form>
    </div>
  );
}
