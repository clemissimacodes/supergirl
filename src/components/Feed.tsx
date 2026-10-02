"use client";

import { formatRelative } from "@/lib/format";
import type { QaEntry } from "@/lib/types";
import { Avatar } from "./Avatar";
import { IconHeart, IconMore, IconReply, IconRepost, IconShare } from "./Icons";

type FeedProps = {
  entries: QaEntry[];
};

function ActionBar({ replied }: { replied?: boolean }) {
  return (
    <div className="tweet-actions" aria-hidden>
      <span className={`tweet-action ${replied ? "is-on" : ""}`}>
        <IconReply />
        {replied ? <span>1</span> : null}
      </span>
      <span className="tweet-action">
        <IconRepost />
      </span>
      <span className="tweet-action">
        <IconHeart />
      </span>
      <span className="tweet-action">
        <IconShare />
      </span>
    </div>
  );
}

function PostBody({
  kind,
  name,
  handle,
  at,
  body,
  replied,
}: {
  kind: "anon" | "host";
  name: string;
  handle: string;
  at: string;
  body: string;
  replied?: boolean;
}) {
  return (
    <div className="tweet-main">
      <header className="tweet-head">
        <div className="tweet-who">
          <span className="tweet-name">
            {name}
            {kind === "host" ? <span className="tweet-badge" title="host" /> : null}
          </span>
          <span className="tweet-meta">
            {handle}
            <span className="tweet-dot">·</span>
            <time dateTime={at}>{formatRelative(at)}</time>
          </span>
        </div>
        <span className="tweet-more">
          <IconMore />
        </span>
      </header>
      <p className="tweet-body">{body}</p>
      <ActionBar replied={replied} />
    </div>
  );
}

export function Feed({ entries }: FeedProps) {
  if (entries.length === 0) {
    return <p className="feed-empty">quiet so far. say something.</p>;
  }

  return (
    <ul className="feed">
      {entries.map((entry) => {
        const answered = Boolean(entry.answer && entry.answeredAt);
        return (
          <li key={entry.id} className="feed-item">
            <article className="tweet">
              <div className="tweet-rail">
                <Avatar kind="anon" />
                {answered ? <div className="tweet-thread-line" /> : null}
              </div>
              <PostBody
                kind="anon"
                name="anon"
                handle="@anon"
                at={entry.askedAt}
                body={entry.question}
                replied={answered}
              />
            </article>
            {answered ? (
              <article className="tweet tweet-reply">
                <div className="tweet-rail">
                  <Avatar kind="host" />
                </div>
                <PostBody
                  kind="host"
                  name="clemmie"
                  handle="@clemmie"
                  at={entry.answeredAt!}
                  body={entry.answer!}
                />
              </article>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
