import { NextResponse } from "next/server";
import { addQuestion, listEntries } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await listEntries();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const question =
    typeof body === "object" &&
    body !== null &&
    "question" in body &&
    typeof (body as { question: unknown }).question === "string"
      ? (body as { question: string }).question
      : "";

  try {
    const entry = await addQuestion(question);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "empty") {
      return NextResponse.json({ error: "say something first" }, { status: 400 });
    }
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }
}
