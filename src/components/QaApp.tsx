"use client";

import { useCallback, useState } from "react";
import { AskForm } from "./AskForm";
import { Feed } from "./Feed";
import type { QaEntry } from "@/lib/types";

type QaAppProps = {
  initialEntries: QaEntry[];
};

export function QaApp({ initialEntries }: QaAppProps) {
  const [entries, setEntries] = useState(initialEntries);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/questions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { entries: QaEntry[] };
      setEntries(data.entries);
    } catch {
      /* keep current */
    }
  }, []);

  return (
    <>
      <AskForm onAsked={refresh} />
      <Feed entries={entries} />
    </>
  );
}
