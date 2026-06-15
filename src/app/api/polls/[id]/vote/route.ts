import { NextRequest, NextResponse } from "next/server";
import { getPollById, savePoll } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  if (poll.status !== "open") return NextResponse.json({ error: "投票已關閉" }, { status: 400 });

  const { voterName, voterEmail, selectedSlotIds } = await req.json();
  if (!voterName || !voterEmail || !selectedSlotIds?.length) {
    return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
  }

  // Remove previous vote from same email
  poll.votes = poll.votes.filter((v) => v.voterEmail !== voterEmail);
  poll.votes.push({
    voterName,
    voterEmail,
    selectedSlotIds,
    votedAt: new Date().toISOString(),
  });
  poll.updatedAt = new Date().toISOString();

  savePoll(poll);
  return NextResponse.json(poll);
}
