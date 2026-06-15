import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getPollById } from "@/lib/storage";

const PENDING_FILE = path.join(process.cwd(), "data", "pending-notifications.json");

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = getPollById(id);
  if (!poll) return NextResponse.json({ error: "找不到投票" }, { status: 404 });
  if (!poll.winnerSlotId) return NextResponse.json({ error: "尚未確認時段" }, { status: 400 });

  let pending: string[] = [];
  try {
    pending = JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"));
  } catch {}
  if (!pending.includes(id)) pending.push(id);
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));

  return NextResponse.json({ ok: true, message: "通知請求已排隊，Claude 將自動發送通知" });
}
