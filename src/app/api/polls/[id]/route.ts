import { NextRequest, NextResponse } from "next/server";
import { getPollById } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  return NextResponse.json(poll);
}
