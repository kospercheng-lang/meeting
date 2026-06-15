import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAllPolls, savePoll } from "@/lib/storage";
import { Poll } from "@/lib/types";

export async function GET() {
  const polls = getAllPolls();
  return NextResponse.json(polls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, organizerName, organizerEmail, location, duration, timeSlots, participants } = body;

  if (!title || !organizerName || !organizerEmail || !timeSlots?.length) {
    return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const poll: Poll = {
    id: randomUUID(),
    title,
    description: description ?? "",
    organizerName,
    organizerEmail,
    location: location ?? "",
    duration: duration ?? 60,
    timeSlots,
    participants: participants ?? [],
    votes: [],
    status: "open",
    createdAt: now,
    updatedAt: now,
  };

  savePoll(poll);
  return NextResponse.json(poll, { status: 201 });
}
