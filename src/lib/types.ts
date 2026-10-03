export type QaEntry = {
  id: string;
  question: string;
  askedAt: string;
  answer: string | null;
  answeredAt: string | null;
  likes: number;
  views: number;
};

export function withCounts(entry: QaEntry): QaEntry {
  return {
    ...entry,
    likes: entry.likes ?? 0,
    views: entry.views ?? 0,
  };
}
