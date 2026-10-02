import { formatStamp } from "@/lib/format";
import type { QaEntry } from "@/lib/types";

type FeedProps = {
  entries: QaEntry[];
};

export function Feed({ entries }: FeedProps) {
  if (entries.length === 0) {
    return <p className="feed-empty">quiet so far. say something.</p>;
  }

  return (
    <ul className="feed">
      {entries.map((entry) => (
        <li key={entry.id} className="feed-item">
          <time className="feed-stamp" dateTime={entry.askedAt}>
            {formatStamp(entry.askedAt)}
          </time>
          <p className="feed-q">{entry.question}</p>
          {entry.answer && entry.answeredAt ? (
            <div className="feed-a">
              <span className="feed-a-label">reply · {formatStamp(entry.answeredAt)}</span>
              {entry.answer}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
