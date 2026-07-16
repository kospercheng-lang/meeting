import { useEffect, useState } from "react";
import { socket, SERVER_URL } from "../socket";
import type { QueueItem, RoomState, Song } from "../types";

export default function Queue({ room }: { room: RoomState }) {
  const [catalog, setCatalog] = useState<Song[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${SERVER_URL}/api/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  function addToQueue(song: Song) {
    socket.emit("queue:add", {
      roomCode: room.code,
      song: {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        audioUrl: song.audioUrl,
        lrcUrl: song.lrcUrl,
        pitchUrl: song.pitchUrl,
      },
    });
  }

  function removeFromQueue(item: QueueItem) {
    socket.emit("queue:remove", { roomCode: room.code, itemId: item.id });
  }

  const filtered = catalog.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">🔍 點歌</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋歌名或歌手"
          className="w-full mb-2 rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm outline-none focus:border-fuchsia-400"
        />
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filtered.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">{song.title}</p>
                <p className="text-xs text-white/40 truncate">{song.artist}</p>
              </div>
              <button
                onClick={() => addToQueue(song)}
                className="shrink-0 ml-2 px-2 py-1 rounded bg-fuchsia-600/80 hover:bg-fuchsia-600 text-xs"
              >
                ➕ 加入
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-white/30 py-2">沒有符合的歌曲</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">
          📃 排隊清單 ({room.queue.length})
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {room.queue.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">
                  {i + 1}. {item.title}
                </p>
                <p className="text-xs text-white/40 truncate">由 {item.addedBy} 點播</p>
              </div>
              <button
                onClick={() => removeFromQueue(item)}
                className="shrink-0 ml-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {room.queue.length === 0 && (
            <p className="text-xs text-white/30 py-2">排隊清單是空的，點首歌吧！</p>
          )}
        </div>
      </div>
    </div>
  );
}
