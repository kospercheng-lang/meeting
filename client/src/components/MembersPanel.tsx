import type { RoomState } from "../types";

export default function MembersPanel({ room }: { room: RoomState }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">
          👥 房間成員 ({room.members.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {room.members.map((m) => (
            <span
              key={m.id}
              className="text-xs bg-white/10 rounded-full px-2.5 py-1 flex items-center gap-1"
            >
              {m.id === room.hostId && "👑"} {m.nickname}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">🏆 評分紀錄</h3>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {room.scores.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5 text-xs"
            >
              <span className="truncate">
                {s.nickname} · {s.songTitle}
              </span>
              <span className="font-bold text-cyan-300 shrink-0 ml-2">{s.score} 分</span>
            </div>
          ))}
          {room.scores.length === 0 && (
            <p className="text-xs text-white/30 py-2">還沒有人跟唱評分</p>
          )}
        </div>
      </div>
    </div>
  );
}
