import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const id = typeof record.id === "string" ? record.id : "";
  const answer = typeof record.answer === "string" ? record.answer : "";
  const secret = typeof record.secret === "string" ? record.secret : "";

  const expected = process.env.ANSWER_SECRET ?? "local-dev-secret";
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "nope" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  try {
    const entry = await answerQuestion(id, answer);
    if (!entry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ entry });
  } catch (err) {
    if (err instanceof Error && err.message === "empty") {
      return NextResponse.json({ error: "empty answer" }, { status: 400 });
    }
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }
}
