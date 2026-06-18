export interface TimeSlot {
  id: string;
  date: string;     // ISO date string
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface Vote {
  voterName: string;
  voterEmail: string;
  selectedSlotIds: string[];
  votedAt: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  location: string;
  duration: number; // minutes
  timeSlots: TimeSlot[];
  participants: string[]; // email addresses
  votes: Vote[];
  status: "open" | "closed" | "scheduled";
  winnerSlotId?: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}
