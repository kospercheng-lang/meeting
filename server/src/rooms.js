import { randomUUID } from "crypto";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

function generateRoomCode(rooms) {
  let code;
  do {
    code = Array.from(
      { length: 5 },
      () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

export class RoomStore {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostSocketId, nickname) {
    const code = generateRoomCode(this.rooms);
    const room = {
      code,
      hostId: hostSocketId,
      members: [{ id: hostSocketId, nickname, score: 0 }],
      queue: [],
      currentSong: null,
      playback: { isPlaying: false, time: 0, updatedAt: Date.now() },
      scores: [], // {id, nickname, songId, songTitle, score, at}
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }

  joinRoom(code, socketId, nickname) {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.members.push({ id: socketId, nickname, score: 0 });
    return room;
  }

  leaveAllRooms(socketId) {
    const affected = [];
    for (const room of this.rooms.values()) {
      const idx = room.members.findIndex((m) => m.id === socketId);
      if (idx === -1) continue;
      room.members.splice(idx, 1);
      if (room.members.length === 0) {
        this.rooms.delete(room.code);
        continue;
      }
      if (room.hostId === socketId) {
        room.hostId = room.members[0].id;
      }
      affected.push(room);
    }
    return affected;
  }

  addToQueue(code, songMeta, addedBy) {
    const room = this.rooms.get(code);
    if (!room) return null;
    const item = { id: randomUUID(), ...songMeta, addedBy };
    room.queue.push(item);
    return room;
  }

  removeFromQueue(code, itemId) {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.queue = room.queue.filter((q) => q.id !== itemId);
    return room;
  }

  playNext(code) {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.currentSong = room.queue.shift() ?? null;
    room.playback = { isPlaying: !!room.currentSong, time: 0, updatedAt: Date.now() };
    return room;
  }

  setPlayback(code, { isPlaying, time }) {
    const room = this.rooms.get(code);
    if (!room) return null;
    room.playback = { isPlaying, time, updatedAt: Date.now() };
    return room;
  }

  submitScore(code, socketId, score) {
    const room = this.rooms.get(code);
    if (!room || !room.currentSong) return null;
    const member = room.members.find((m) => m.id === socketId);
    if (!member) return null;
    const entry = {
      id: randomUUID(),
      nickname: member.nickname,
      songId: room.currentSong.songId,
      songTitle: room.currentSong.title,
      score,
      at: Date.now(),
    };
    room.scores.unshift(entry);
    room.scores = room.scores.slice(0, 20);
    return room;
  }
}
