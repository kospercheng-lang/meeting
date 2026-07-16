import { useState } from "react";
import { socket } from "../socket";
import type { RoomState } from "../types";

export default function Home({
  connected,
  onEnterRoom,
}: {
  connected: boolean;
  onEnterRoom: (room: RoomState, nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCreate() {
    if (!nickname.trim()) {
      setError("請先輸入暱稱");
      return;
    }
    setError("");
    setLoading(true);
    socket.emit(
      "room:create",
      { nickname: nickname.trim() },
      (res: { ok: boolean; room: RoomState }) => {
        setLoading(false);
        if (res.ok) onEnterRoom(res.room, nickname.trim());
      }
    );
  }

  function handleJoin() {
    if (!nickname.trim()) {
      setError("請先輸入暱稱");
      return;
    }
    if (!joinCode.trim()) {
      setError("請輸入房號");
      return;
    }
    setError("");
    setLoading(true);
    socket.emit(
      "room:join",
      { roomCode: joinCode.trim(), nickname: nickname.trim() },
      (res: { ok: boolean; room?: RoomState; error?: string }) => {
        setLoading(false);
        if (res.ok && res.room) onEnterRoom(res.room, nickname.trim());
        else setError(res.error || "加入失敗");
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-slate-950 to-indigo-950 text-white px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
          🎤 KTV 伴唱室
        </h1>
        <p className="text-center text-white/50 text-sm mb-6">
          點歌 · 歌詞同步 · 麥克風評分 · 多人同步播放
        </p>

        <div className="flex mb-5 rounded-lg overflow-hidden border border-white/10">
          <button
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "create" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60"
            }`}
            onClick={() => setMode("create")}
          >
            建立房間
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition ${
              mode === "join" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60"
            }`}
            onClick={() => setMode("join")}
          >
            加入房間
          </button>
        </div>

        <label className="block text-xs text-white/50 mb-1">你的暱稱</label>
        <input
          className="w-full mb-4 rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:border-fuchsia-400"
          placeholder="例如：小明"
          value={nickname}
          maxLength={16}
          onChange={(e) => setNickname(e.target.value)}
        />

        {mode === "join" && (
          <>
            <label className="block text-xs text-white/50 mb-1">房號</label>
            <input
              className="w-full mb-4 rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:border-fuchsia-400 uppercase tracking-widest"
              placeholder="例如：AB3C9"
              value={joinCode}
              maxLength={6}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
          </>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          disabled={!connected || loading}
          onClick={mode === "create" ? handleCreate : handleJoin}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 font-semibold disabled:opacity-40 hover:brightness-110 transition"
        >
          {!connected ? "連線中..." : loading ? "處理中..." : mode === "create" ? "建立房間" : "加入房間"}
        </button>
      </div>
    </div>
  );
}
