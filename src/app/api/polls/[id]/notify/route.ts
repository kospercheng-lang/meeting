import { NextRequest, NextResponse } from "next/server";
import { getPollById } from "@/lib/storage";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  if (!poll.winnerSlotId) return NextResponse.json({ error: "尚未確認時段" }, { status: 400 });

  return NextResponse.json({ ok: true, message: "通知請求已排隊" });
}
