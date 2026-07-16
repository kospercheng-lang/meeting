import { useEffect, useRef, useState } from "react";
import { socket, SERVER_URL } from "../socket";
import { parseLrc, currentLineIndex, type LyricLine } from "../lib/lrc";
import type { RoomState } from "../types";
import LyricsView from "./LyricsView";

const SYNC_DRIFT_TOLERANCE = 0.35; // seconds
const TICK_INTERVAL = 500; // ms

function formatTime(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Player({
  room,
  isHost,
  audioRef,
  onTimeUpdate,
}: {
  room: RoomState;
  isHost: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTimeUpdate?: (t: number) => void;
}) {
  const song = room.currentSong;
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [displayTime, setDisplayTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastAppliedSongId = useRef<string | null>(null);

  // load lyrics whenever the song changes
  useEffect(() => {
    if (!song) {
      setLines([]);
      return;
    }
    fetch(`${SERVER_URL}${song.lrcUrl}`)
      .then((r) => r.text())
      .then((text) => setLines(parseLrc(text)))
      .catch(() => setLines([]));
  }, [song?.id]);

  // apply new-song / remote playback state to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    const isNewSong = lastAppliedSongId.current !== song.id;
    if (isNewSong) {
      lastAppliedSongId.current = song.id;
      audio.src = `${SERVER_URL}${song.audioUrl}`;
      audio.currentTime = room.playback.time;
    }
    if (room.playback.isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [song?.id, room.playback, audioRef]);

  // rAF loop: update displayed time + drive lyric highlight
  useEffect(() => {
    let raf: number;
    const loop = () => {
      const audio = audioRef.current;
      if (audio) {
        setDisplayTime(audio.currentTime);
        setIsPlaying(!audio.paused);
        onTimeUpdate?.(audio.currentTime);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [audioRef, onTimeUpdate]);

  // host: periodically broadcast the authoritative clock
  useEffect(() => {
    if (!isHost) return;
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !song) return;
      socket.emit("playback:tick", {
        roomCode: room.code,
        time: audio.currentTime,
        isPlaying: !audio.paused,
      });
    }, TICK_INTERVAL);
    return () => clearInterval(id);
  }, [isHost, room.code, song?.id, audioRef]);

  // guest: reconcile against the host's periodic sync ticks
  useEffect(() => {
    if (isHost) return;
    function onSync(state: { isPlaying: boolean; time: number }) {
      const audio = audioRef.current;
      if (!audio) return;
      if (Math.abs(audio.currentTime - state.time) > SYNC_DRIFT_TOLERANCE) {
        audio.currentTime = state.time;
      }
      if (state.isPlaying) audio.play().catch(() => {});
      else audio.pause();
    }
    socket.on("playback:sync", onSync);
    return () => {
      socket.off("playback:sync", onSync);
    };
  }, [isHost, audioRef]);

  const activeIndex = currentLineIndex(lines, displayTime);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !isHost) return;
    const next = audio.paused;
    if (next) audio.play().catch(() => {});
    else audio.pause();
    socket.emit("playback:control", { roomCode: room.code, isPlaying: next, time: audio.currentTime });
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio || !isHost || !song) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    socket.emit("playback:control", { roomCode: room.code, isPlaying: !audio.paused, time: t });
  }

  function nextSong() {
    socket.emit("queue:next", { roomCode: room.code });
  }

  if (!song) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-3 min-h-[320px]">
        <span className="text-5xl">🎵</span>
        <p>目前沒有播放歌曲，先從右側點一首歌吧！</p>
        {isHost && room.queue.length > 0 && (
          <button
            onClick={nextSong}
            className="mt-2 px-4 py-2 rounded-lg bg-fuchsia-600 hover:brightness-110 text-sm font-medium"
          >
            ▶️ 播放排隊中的第一首
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[420px]">
      <div className="text-center py-3">
        <h2 className="text-xl font-bold">{song.title}</h2>
        <p className="text-white/40 text-sm">{song.artist} · 點播者 {song.addedBy}</p>
      </div>

      <div className="flex-1 min-h-0">
        <LyricsView lines={lines} activeIndex={activeIndex} />
      </div>

      <div className="px-6 pb-2">
        <input
          type="range"
          min={0}
          max={song.duration}
          step={0.1}
          value={displayTime}
          disabled={!isHost}
          onChange={seek}
          className="w-full accent-fuchsia-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-white/40">
          <span>{formatTime(displayTime)}</span>
          <span>{formatTime(song.duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pb-4">
        <button
          onClick={togglePlay}
          disabled={!isHost}
          className="w-12 h-12 rounded-full bg-fuchsia-600 disabled:opacity-40 hover:brightness-110 text-xl flex items-center justify-center"
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>
        {isHost && (
          <button
            onClick={nextSong}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            ⏭ 下一首
          </button>
        )}
        {!isHost && <span className="text-xs text-white/30">播放控制由房主操作</span>}
      </div>
    </div>
  );
}
