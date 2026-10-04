import { NextResponse } from "next/server";
import { getEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ entry });
}
