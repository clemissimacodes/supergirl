"use client";

import { Chirp } from "./Chirp";
import type { QaEntry } from "@/lib/types";

type FeedProps = {
  entries: QaEntry[];
  onChange: (entry: QaEntry) => void;
};

export function Feed({ entries, onChange }: FeedProps) {
  if (entries.length === 0) {
    return <p className="feed-empty">nothing here yet. be the first.</p>;
  }

  return (
    <ul className="feed">
      {entries.map((entry) => (
        <li key={entry.id} className="feed-item">
          <Chirp
            entry={entry}
            onChange={onChange}
          />
        </li>
      ))}
    </ul>
  );
}
