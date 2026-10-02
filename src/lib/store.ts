import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { QaEntry } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "qa.json");

async function readAll(): Promise<QaEntry[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as QaEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(entries: QaEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2) + "\n", "utf8");
}

export async function listEntries(): Promise<QaEntry[]> {
  const entries = await readAll();
  return entries.sort(
    (a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime(),
  );
}

export async function addQuestion(question: string): Promise<QaEntry> {
  const trimmed = question.trim().slice(0, 1000);
  if (!trimmed) {
    throw new Error("empty");
  }

  const entries = await readAll();
  const entry: QaEntry = {
    id: randomUUID(),
    question: trimmed,
    askedAt: new Date().toISOString(),
    answer: null,
    answeredAt: null,
  };
  entries.unshift(entry);
  await writeAll(entries);
  return entry;
}

export async function answerQuestion(
  id: string,
  answer: string,
): Promise<QaEntry | null> {
  const trimmed = answer.trim().slice(0, 4000);
  if (!trimmed) {
    throw new Error("empty");
  }

  const entries = await readAll();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  entries[index] = {
    ...entries[index],
    answer: trimmed,
    answeredAt: new Date().toISOString(),
  };
  await writeAll(entries);
  return entries[index];
}
