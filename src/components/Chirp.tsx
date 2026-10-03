"use client";

import { MouseEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelative } from "@/lib/format";
import { formatCount } from "@/lib/counts";
import { hasLiked, setLiked } from "@/lib/local";
import type { QaEntry } from "@/lib/types";
import { Avatar } from "./Avatar";
import { IconHeart, IconMore, IconReply, IconShare, IconViews } from "./Icons";

type ChirpProps = {
  entry: QaEntry;
  onChange?: (entry: QaEntry) => void;
  /** When true, clicking the card does not navigate. */
  staticCard?: boolean;
};

export function Chirp({ entry, onChange, staticCard = false }: ChirpProps) {
  const router = useRouter();
  const [liked, setLikedState] = useState(() => hasLiked(entry.id));
  const [shareNote, setShareNote] = useState<string | null>(null);
  const answered = Boolean(entry.answer && entry.answeredAt);

  const go = useCallback(() => {
    if (staticCard) return;
    router.push(`/c/${entry.id}`);
  }, [entry.id, router, staticCard]);

  async function toggleLike(e: MouseEvent) {
    e.stopPropagation();
    const next = !liked;
    setLikedState(next);
    setLiked(entry.id, next);
    onChange?.({
      ...entry,
      likes: Math.max(0, entry.likes + (next ? 1 : -1)),
    });
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, unlike: !next }),
      });
      const data = (await res.json()) as { entry?: QaEntry };
      if (res.ok && data.entry) onChange?.(data.entry);
    } catch {
      setLikedState(!next);
      setLiked(entry.id, !next);
    }
  }

  async function share(e: MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/c/${entry.id}`;
    const payload = {
      title: "Chirper",
      text: entry.question,
      url,
    };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("link copied");
      window.setTimeout(() => setShareNote(null), 1600);
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setShareNote("link copied");
        window.setTimeout(() => setShareNote(null), 1600);
      } catch {
        setShareNote("couldn’t share");
        window.setTimeout(() => setShareNote(null), 1600);
      }
    }
  }

  return (
    <article
      className={`tweet ${staticCard ? "" : "is-clickable"}`}
      onClick={go}
      onKeyDown={
        staticCard
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                go();
              }
            }
      }
      role={staticCard ? undefined : "link"}
      tabIndex={staticCard ? undefined : 0}
    >
      <div className="tweet-rail">
        <Avatar kind="anon" />
      </div>
      <div className="tweet-main">
        <header className="tweet-head">
          <div className="tweet-who">
            <span className="tweet-name">anon</span>
            <span className="tweet-meta">
              @anon
              <span className="tweet-dot">·</span>
              <time dateTime={entry.askedAt}>{formatRelative(entry.askedAt)}</time>
            </span>
          </div>
          <span className="tweet-more">
            <IconMore />
          </span>
        </header>
        <p className="tweet-body">{entry.question}</p>
        <div className="tweet-actions">
          <button
            type="button"
            className={`tweet-action ${answered ? "is-on" : ""}`}
            aria-label={answered ? "view reply" : "no reply yet"}
            onClick={(e) => {
              e.stopPropagation();
              go();
            }}
          >
            <IconReply />
            {answered ? <span>1</span> : null}
          </button>
          <button
            type="button"
            className={`tweet-action ${liked ? "is-like" : ""}`}
            aria-label={liked ? "unlike" : "like"}
            aria-pressed={liked}
            onClick={toggleLike}
          >
            <IconHeart filled={liked} />
            {entry.likes > 0 ? <span>{formatCount(entry.likes)}</span> : null}
          </button>
          <span className="tweet-action tweet-views" title="reply opens">
            <IconViews />
            <span className="view-ticker">{formatCount(entry.views)}</span>
          </span>
          <button
            type="button"
            className="tweet-action"
            aria-label="share"
            onClick={share}
          >
            <IconShare />
            {shareNote ? <span className="share-note">{shareNote}</span> : null}
          </button>
        </div>
      </div>
    </article>
  );
}

export function Reply({ entry }: { entry: QaEntry }) {
  if (!entry.answer || !entry.answeredAt) return null;
  return (
    <article className="tweet tweet-reply">
      <div className="tweet-rail">
        <Avatar kind="host" />
      </div>
      <div className="tweet-main">
        <header className="tweet-head">
          <div className="tweet-who">
            <span className="tweet-name">
              clemissima
              <span className="tweet-badge" title="host" />
            </span>
            <span className="tweet-meta">
              @clemissima
              <span className="tweet-dot">·</span>
              <time dateTime={entry.answeredAt}>
                {formatRelative(entry.answeredAt)}
              </time>
            </span>
          </div>
        </header>
        <p className="tweet-body">{entry.answer}</p>
      </div>
    </article>
  );
}
