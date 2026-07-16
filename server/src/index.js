import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RoomStore } from "./rooms.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use("/songs", express.static(path.join(__dirname, "..", "public", "songs")));

const catalogPath = path.join(__dirname, "..", "public", "songs", "catalog.json");
app.get("/api/catalog", (req, res) => {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));
  res.json(catalog);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN },
});

const store = new RoomStore();

function roomView(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    members: room.members,
    queue: room.queue,
    currentSong: room.currentSong,
    playback: room.playback,
    scores: room.scores,
  };
}

function broadcastRoom(code) {
  const room = store.getRoom(code);
  if (!room) return;
  io.to(code).emit("room:update", roomView(room));
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ nickname }, cb) => {
    const room = store.createRoom(socket.id, nickname || "房主");
    socket.join(room.code);
    cb?.({ ok: true, room: roomView(room) });
  });

  socket.on("room:join", ({ roomCode, nickname }, cb) => {
    const code = (roomCode || "").toUpperCase().trim();
    const existing = store.getRoom(code);
    if (!existing) {
      cb?.({ ok: false, error: "找不到這個房間，請確認房號" });
      return;
    }
    const room = store.joinRoom(code, socket.id, nickname || "旅人");
    socket.join(code);
    cb?.({ ok: true, room: roomView(room) });
    broadcastRoom(code);
  });

  socket.on("queue:add", ({ roomCode, song }) => {
    const member = store.getRoom(roomCode)?.members.find((m) => m.id === socket.id);
    const room = store.addToQueue(roomCode, song, member?.nickname || "someone");
    if (room) broadcastRoom(roomCode);
  });

  socket.on("queue:remove", ({ roomCode, itemId }) => {
    const room = store.removeFromQueue(roomCode, itemId);
    if (room) broadcastRoom(roomCode);
  });

  socket.on("queue:next", ({ roomCode }) => {
    const room = store.getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    store.playNext(roomCode);
    broadcastRoom(roomCode);
  });

  socket.on("playback:control", ({ roomCode, isPlaying, time }) => {
    const room = store.getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    store.setPlayback(roomCode, { isPlaying, time });
    broadcastRoom(roomCode);
  });

  socket.on("playback:tick", ({ roomCode, time, isPlaying }) => {
    const room = store.getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    room.playback = { isPlaying, time, updatedAt: Date.now() };
    socket.to(roomCode).emit("playback:sync", room.playback);
  });

  socket.on("score:submit", ({ roomCode, score }) => {
    const room = store.submitScore(roomCode, socket.id, score);
    if (room) broadcastRoom(roomCode);
  });

  socket.on("disconnect", () => {
    const affected = store.leaveAllRooms(socket.id);
    for (const room of affected) broadcastRoom(room.code);
  });
});

httpServer.listen(PORT, () => {
  console.log(`KTV server listening on :${PORT}`);
});
