import { NextResponse } from "next/server";
import { bumpLikes } from "@/lib/store";

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
  const unlike = record.unlike === true;

  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const entry = await bumpLikes(id, unlike ? -1 : 1);
  if (!entry) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ entry });
}
