import { useRef, useState } from "react";
import type { RoomState } from "../types";
import Player from "./Player";
import Queue from "./Queue";
import MembersPanel from "./MembersPanel";
import MicScorer from "./MicScorer";

export default function Room({
  room,
  mySocketId,
}: {
  room: RoomState;
  mySocketId: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeRef = useRef(0);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = room.hostId === mySocketId;

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function leaveRoom() {
    window.location.reload();
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-slate-950 to-indigo-950 text-white">
        <button
          onClick={() => setUnlocked(true)}
          className="px-8 py-4 rounded-2xl bg-fuchsia-600 hover:brightness-110 text-lg font-semibold shadow-2xl"
        >
          🎧 點擊進入房間
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-950 via-slate-950 to-indigo-950 text-white">
      <audio ref={audioRef} className="hidden" />

      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="font-bold">KTV 伴唱室</span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-1.5 text-sm"
        >
          房號 <span className="font-mono font-bold tracking-widest">{room.code}</span>
          <span className="text-white/50">{copied ? "已複製!" : "複製"}</span>
        </button>
        <button onClick={leaveRoom} className="text-sm text-white/50 hover:text-white">
          離開房間
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
        <section className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
          <Player
            room={room}
            isHost={isHost}
            audioRef={audioRef}
            onTimeUpdate={(t) => (timeRef.current = t)}
          />
          <div className="px-4 pb-4">
            <MicScorer
              song={room.currentSong}
              roomCode={room.code}
              getCurrentTime={() => timeRef.current}
            />
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-6">
          <MembersPanel room={room} />
          <Queue room={room} />
        </section>
      </main>
    </div>
  );
}
