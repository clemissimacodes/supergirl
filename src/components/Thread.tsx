"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chirp, Reply } from "@/components/Chirp";
import { hasViewed, markViewed } from "@/lib/local";
import type { QaEntry } from "@/lib/types";

export function Thread({ initial }: { initial: QaEntry }) {
  const [entry, setEntry] = useState(initial);

  useEffect(() => {
    if (!initial.answer) return;
    if (hasViewed(initial.id)) return;
    markViewed(initial.id);
    void (async () => {
      try {
        const res = await fetch("/api/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initial.id }),
        });
        const data = (await res.json()) as { entry?: QaEntry };
        if (res.ok && data.entry) setEntry(data.entry);
      } catch {
        /* keep current */
      }
    })();
  }, [initial.id, initial.answer]);

  return (
    <section className="frame thread-frame">
      <header className="timeline-top">
        <div className="timeline-heading">
          <h1 className="timeline-title">a note</h1>
          <Link className="timeline-inspo" href="/#notes">
            back
          </Link>
        </div>
        <p className="timeline-lede">
          {entry.views} open{entry.views === 1 ? "" : "s"}
        </p>
      </header>
      <Chirp entry={entry} onChange={setEntry} staticCard />
      {entry.answer ? (
        <Reply entry={entry} />
      ) : (
        <p className="feed-empty">no reply yet. check back later.</p>
      )}
    </section>
  );
}
