#!/usr/bin/env node
// Run: node scripts/send-notifications.js
// Reads pending-notifications.json and outputs poll data for Claude to send via MCP tools

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const POLLS_FILE = path.join(DATA_DIR, "polls.json");
const PENDING_FILE = path.join(DATA_DIR, "pending-notifications.json");

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); } catch { return null; }
}

const pending = readJSON(PENDING_FILE) || [];
if (!pending.length) { console.log("沒有待發送的通知"); process.exit(0); }

const polls = readJSON(POLLS_FILE) || [];
for (const id of pending) {
  const poll = polls.find(p => p.id === id);
  if (!poll || !poll.winnerSlotId) { console.log(`跳過 ${id}：找不到或未確認時段`); continue; }

  const slot = poll.timeSlots.find(s => s.id === poll.winnerSlotId);
  if (!slot) continue;

  const startDateTime = `${slot.date}T${slot.startTime}:00`;
  const endDateTime = `${slot.date}T${slot.endTime}:00`;
  const voterEmails = poll.votes.map(v => v.voterEmail);
  const allEmails = [...new Set([...voterEmails, ...poll.participants, poll.organizerEmail])];

  console.log(JSON.stringify({
    pollId: id,
    title: poll.title,
    description: poll.description,
    location: poll.location,
    organizer: { name: poll.organizerName, email: poll.organizerEmail },
    slot: { date: slot.date, startTime: slot.startTime, endTime: slot.endTime, startDateTime, endDateTime },
    attendees: allEmails,
    voterCount: poll.votes.length,
  }, null, 2));
}
