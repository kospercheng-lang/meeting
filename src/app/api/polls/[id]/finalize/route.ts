import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPollById, savePoll } from "@/lib/storage";

const PENDING_FILE = path.join(process.cwd(), "data", "pending-notifications.json");

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  if (poll.status === "scheduled") return NextResponse.json({ error: "已排程完成" }, { status: 400 });

  const { winnerSlotId } = await req.json();
  const slot = poll.timeSlots.find((s) => s.id === winnerSlotId);
  if (!slot) return NextResponse.json({ error: "找不到時段" }, { status: 400 });

  poll.winnerSlotId = winnerSlotId;
  poll.status = "scheduled";
  poll.updatedAt = new Date().toISOString();
  savePoll(poll);

  // Queue notification
  let pending: string[] = [];
  try { pending = JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8")); } catch {}
  if (!pending.includes(id)) pending.push(id);
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

  return NextResponse.json(poll);
}
