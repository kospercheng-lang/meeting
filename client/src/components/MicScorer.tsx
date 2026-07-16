import { useEffect, useRef, useState } from "react";
import { socket, SERVER_URL } from "../socket";
import { detectPitch, freqToCents } from "../lib/pitch";
import type { QueueItem } from "../types";

interface PitchContour {
  stepMs: number;
  points: number[];
}

export default function MicScorer({
  song,
  roomCode,
  getCurrentTime,
}: {
  song: QueueItem | null;
  roomCode: string;
  getCurrentTime: () => number;
}) {
  const [active, setActive] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const contourRef = useRef<PitchContour | null>(null);
  const statsRef = useRef({ hits: 0, voiced: 0 });

  useEffect(() => {
    stopScoring();
    setFinalScore(null);
    setLiveScore(null);
    if (song) {
      fetch(`${SERVER_URL}${song.pitchUrl}`)
        .then((r) => r.json())
        .then((data) => (contourRef.current = data))
        .catch(() => (contourRef.current = null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  useEffect(() => stopScoring, []);

  async function startScoring() {
    if (!song) return;
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      statsRef.current = { hits: 0, voiced: 0 };
      setActive(true);
      setFinalScore(null);
      loop();
    } catch (e) {
      setError("無法取得麥克風權限，請確認瀏覽器授權");
    }
  }

  function loop() {
    const analyser = analyserRef.current;
    const ctx = ctxRef.current;
    const contour = contourRef.current;
    if (!analyser || !ctx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    const detected = detectPitch(buffer, ctx.sampleRate);

    if (contour) {
      const t = getCurrentTime();
      const idx = Math.floor((t * 1000) / contour.stepMs);
      const target = contour.points[idx] ?? 0;
      if (target > 0) {
        statsRef.current.voiced++;
        if (detected > 0) {
          const cents = Math.abs(freqToCents(detected, target));
          if (cents < 150) statsRef.current.hits++;
        }
        const { hits, voiced } = statsRef.current;
        setLiveScore(Math.round((hits / Math.max(1, voiced)) * 100));
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  function stopScoring() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
    setActive(false);
  }

  function finishScoring() {
    const { hits, voiced } = statsRef.current;
    const score = voiced > 0 ? Math.round((hits / voiced) * 100) : 0;
    stopScoring();
    setFinalScore(score);
    if (roomCode) socket.emit("score:submit", { roomCode, score });
  }

  if (!song) return null;

  return (
    <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white/70">🎙️ 跟唱評分</h3>
        {liveScore !== null && active && (
          <span className="text-lg font-bold text-cyan-300">{liveScore} 分</span>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      {finalScore !== null && !active && (
        <p className="text-center text-2xl font-bold mb-2 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
          最終得分：{finalScore} 分
        </p>
      )}

      {!active ? (
        <button
          onClick={startScoring}
          className="w-full py-2 rounded-lg bg-fuchsia-600 hover:brightness-110 text-sm font-medium"
        >
          🎤 開始跟唱評分
        </button>
      ) : (
        <button
          onClick={finishScoring}
          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
        >
          ⏹ 結束並送出分數
        </button>
      )}
    </div>
  );
}
