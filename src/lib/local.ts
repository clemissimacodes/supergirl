const LIKED_KEY = "chirper-liked";
const VIEWED_KEY = "chirper-viewed";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify([...set]));
}

export function hasLiked(id: string): boolean {
  return readSet(LIKED_KEY).has(id);
}

export function setLiked(id: string, liked: boolean) {
  const set = readSet(LIKED_KEY);
  if (liked) set.add(id);
  else set.delete(id);
  writeSet(LIKED_KEY, set);
}

export function hasViewed(id: string): boolean {
  return readSet(VIEWED_KEY).has(id);
}

export function markViewed(id: string) {
  const set = readSet(VIEWED_KEY);
  set.add(id);
  writeSet(VIEWED_KEY, set);
}
