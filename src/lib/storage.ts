import fs from "fs";
import path from "path";
import { Poll } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "polls.json");

function readPolls(): Poll[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writePolls(polls: Poll[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(polls, null, 2));
}

export function getAllPolls(): Poll[] {
  return readPolls();
}

export function getPollById(id: string): Poll | null {
  return readPolls().find((p) => p.id === id) ?? null;
}

export function savePoll(poll: Poll): void {
  const polls = readPolls();
  const idx = polls.findIndex((p) => p.id === poll.id);
  if (idx >= 0) {
    polls[idx] = poll;
  } else {
    polls.push(poll);
  }
  writePolls(polls);
}

export function deletePoll(id: string): void {
  writePolls(readPolls().filter((p) => p.id !== id));
}
