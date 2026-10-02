import { formatStamp } from "@/lib/format";
import type { QaEntry } from "@/lib/types";

type FeedProps = {
  entries: QaEntry[];
};

export function Feed({ entries }: FeedProps) {
  if (entries.length === 0) {
    return <p className="feed-empty">nothing here yet. be the first.</p>;
  }

  return (
    <ul className="feed">
      {entries.map((entry) => (
        <li key={entry.id} className="feed-item">
          <p className="feed-line">
            <span className="stamp">{formatStamp(entry.askedAt)}</span>{" "}
            <span className="role">q:</span> {entry.question}
          </p>
          {entry.answer && entry.answeredAt ? (
            <p className="feed-line">
              <span className="stamp">{formatStamp(entry.answeredAt)}</span>{" "}
              <span className="role">a:</span> {entry.answer}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
