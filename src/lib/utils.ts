import { Poll, TimeSlot } from "./types";

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export function formatTime(time: string): string {
  return time;
}

export function getSlotVoteCount(poll: Poll, slotId: string): number {
  return poll.votes.filter((v) => v.selectedSlotIds.includes(slotId)).length;
}

export function getWinningSlot(poll: Poll): TimeSlot | null {
  if (!poll.timeSlots.length) return null;
  let best = poll.timeSlots[0];
  let bestCount = getSlotVoteCount(poll, best.id);
  for (const slot of poll.timeSlots.slice(1)) {
    const count = getSlotVoteCount(poll, slot.id);
    if (count > bestCount) {
      best = slot;
      bestCount = count;
    }
  }
  return best;
}

export function getVotersForSlot(poll: Poll, slotId: string): string[] {
  return poll.votes.filter((v) => v.selectedSlotIds.includes(slotId)).map((v) => v.voterName);
}

export function formatSlotLabel(slot: TimeSlot): string {
  return `${formatDate(slot.date)} ${slot.startTime}–${slot.endTime}`;
}
