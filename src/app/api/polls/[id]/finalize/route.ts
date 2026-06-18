import { NextRequest, NextResponse } from "next/server";
import { getPollById, savePoll } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  if (poll.status === "scheduled") return NextResponse.json({ error: "已排程完成" }, { status: 400 });

  const { winnerSlotId } = await req.json();
  if (!poll.timeSlots.find((s) => s.id === winnerSlotId)) {
    return NextResponse.json({ error: "找不到時段" }, { status: 400 });
  }

  poll.winnerSlotId = winnerSlotId;
  poll.status = "scheduled";
  poll.updatedAt = new Date().toISOString();
  await savePoll(poll);

  return NextResponse.json(poll);
}
