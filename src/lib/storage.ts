import { Poll } from "./types";
import fs from "fs";
import path from "path";

// Use Vercel KV when available, fall back to local JSON file
async function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    return kv;
  }
  return null;
}

const DATA_FILE = path.join(process.cwd(), "data", "polls.json");

function readLocal(): Poll[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeLocal(polls: Poll[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(polls, null, 2));
}

export async function getAllPolls(): Promise<Poll[]> {
  const kv = await getKV();
  if (kv) {
    const ids = (await kv.lrange<string>("poll_ids", 0, -1)) ?? [];
    if (!ids.length) return [];
    const polls = await Promise.all(ids.map((id) => kv.get<Poll>(`poll:${id}`)));
    return polls.filter(Boolean) as Poll[];
  }
  return readLocal();
}

export async function getPollById(id: string): Promise<Poll | null> {
  const kv = await getKV();
  if (kv) {
    return (await kv.get<Poll>(`poll:${id}`)) ?? null;
  }
  return readLocal().find((p) => p.id === id) ?? null;
}

export async function savePoll(poll: Poll): Promise<void> {
  const kv = await getKV();
  if (kv) {
    const exists = await kv.get(`poll:${poll.id}`);
    if (!exists) await kv.rpush("poll_ids", poll.id);
    await kv.set(`poll:${poll.id}`, poll);
    return;
  }
  const polls = readLocal();
  const idx = polls.findIndex((p) => p.id === poll.id);
  if (idx >= 0) polls[idx] = poll; else polls.push(poll);
  writeLocal(polls);
}
