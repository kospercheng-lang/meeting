// Generates fully original, royalty-free demo songs for the KTV app:
// a synthesized instrumental WAV backing track, a time-synced LRC lyric
// file, and a target-pitch contour (JSON) used for mic scoring.
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "server", "public", "songs");
mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 44100;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function noteToFreq(note) {
  if (note === "-" || !note) return 0;
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) throw new Error(`bad note: ${note}`);
  const [, name, octaveStr] = m;
  const octave = parseInt(octaveStr, 10);
  const semitoneFromC0 = NOTE_NAMES.indexOf(name) + octave * 12;
  const semitoneFromA4 = semitoneFromC0 - (9 + 4 * 12);
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

function adsr(t, dur, a = 0.02, d = 0.05, s = 0.7, r = 0.08) {
  if (t < 0 || t > dur) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur - r) return s;
  return s * Math.max(0, (dur - t) / r);
}

// additive synth: fundamental + a couple of harmonics for a warm "instrument" tone
function synthNote(buffer, startTime, duration, freq, gain, sr) {
  if (freq <= 0) return;
  const startSample = Math.floor(startTime * sr);
  const numSamples = Math.floor((duration + 0.1) * sr);
  for (let i = 0; i < numSamples; i++) {
    const idx = startSample + i;
    if (idx < 0 || idx >= buffer.length) continue;
    const t = i / sr;
    const env = adsr(t, duration);
    if (env <= 0) continue;
    const phase = 2 * Math.PI * freq * t;
    const sample =
      Math.sin(phase) * 0.6 +
      Math.sin(phase * 2) * 0.25 +
      Math.sin(phase * 3) * 0.1;
    buffer[idx] += sample * env * gain;
  }
}

function synthSong({ melody, chords, tempoScale = 1 }) {
  const totalDuration =
    Math.max(
      ...melody.map((n) => n.time + n.dur),
      ...chords.map((c) => c.time + c.dur)
    ) * tempoScale + 1;
  const numSamples = Math.ceil(totalDuration * SAMPLE_RATE);
  const buffer = new Float32Array(numSamples);

  for (const n of melody) {
    synthNote(
      buffer,
      n.time * tempoScale,
      n.dur * tempoScale,
      noteToFreq(n.note),
      0.5,
      SAMPLE_RATE
    );
  }
  // soft pad / chord backing, one octave down, low gain
  for (const c of chords) {
    for (const note of c.notes) {
      synthNote(
        buffer,
        c.time * tempoScale,
        c.dur * tempoScale,
        noteToFreq(note),
        0.12,
        SAMPLE_RATE
      );
    }
  }

  // normalize to avoid clipping
  let peak = 0;
  for (let i = 0; i < buffer.length; i++) peak = Math.max(peak, Math.abs(buffer[i]));
  const norm = peak > 0 ? 0.9 / peak : 1;
  for (let i = 0; i < buffer.length; i++) buffer[i] *= norm;

  return { buffer, totalDuration };
}

function writeWav(filePath, floatBuffer, sr) {
  const numSamples = floatBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample; // mono
  const byteRate = sr * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, floatBuffer[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(filePath, buf);
}

function formatLrcTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

function writeLrc(filePath, meta, lines) {
  const header = [
    `[ti:${meta.title}]`,
    `[ar:${meta.artist}]`,
    `[al:${meta.album ?? "KTV Demo"}]`,
    `[by:KTV Demo Generator]`,
  ].join("\n");
  const body = lines.map((l) => `[${formatLrcTime(l.time)}]${l.text}`).join("\n");
  writeFileSync(filePath, `${header}\n${body}\n`);
}

// sample the melody's active-note frequency on a fixed grid for scoring reference
function buildPitchContour(melody, totalDuration, tempoScale, stepMs = 50) {
  const step = stepMs / 1000;
  const points = [];
  for (let t = 0; t < totalDuration; t += step) {
    const active = melody.find(
      (n) =>
        t >= n.time * tempoScale &&
        t < (n.time + n.dur) * tempoScale
    );
    points.push(active ? Math.round(noteToFreq(active.note) * 100) / 100 : 0);
  }
  return { stepMs, points };
}

// ---------------------------------------------------------------------------
// Song definitions: fully original melodies/lyrics written for this project.
// Each melody note optionally carries `lyric` (sung syllable/word) so lyric
// lines and note timing line up.
// ---------------------------------------------------------------------------

function line(time, text) {
  return { time, text };
}

const songs = [
  {
    id: "summer-breeze",
    title: "夏夜微風",
    artist: "KTV Demo Band",
    tempoScale: 1,
    melody: [
      { time: 0.0, dur: 0.4, note: "C4" },
      { time: 0.4, dur: 0.4, note: "D4" },
      { time: 0.8, dur: 0.4, note: "E4" },
      { time: 1.2, dur: 0.4, note: "G4" },
      { time: 1.6, dur: 0.8, note: "E4" },
      { time: 2.4, dur: 0.4, note: "D4" },
      { time: 2.8, dur: 0.8, note: "C4" },
      { time: 3.8, dur: 0.4, note: "E4" },
      { time: 4.2, dur: 0.4, note: "G4" },
      { time: 4.6, dur: 0.4, note: "A4" },
      { time: 5.0, dur: 0.4, note: "G4" },
      { time: 5.4, dur: 0.8, note: "F4" },
      { time: 6.2, dur: 0.4, note: "E4" },
      { time: 6.6, dur: 0.8, note: "D4" },
      { time: 7.8, dur: 0.4, note: "C4" },
      { time: 8.2, dur: 0.4, note: "E4" },
      { time: 8.6, dur: 0.4, note: "G4" },
      { time: 9.0, dur: 0.8, note: "C5" },
      { time: 9.8, dur: 0.8, note: "G4" },
      { time: 10.6, dur: 1.2, note: "C5" },
    ],
    chords: [
      { time: 0, dur: 1.6, notes: ["C3", "E3", "G3"] },
      { time: 1.6, dur: 1.6, notes: ["A3", "C3", "E3"] },
      { time: 3.2, dur: 1.6, notes: ["F3", "A3", "C4"] },
      { time: 4.8, dur: 1.6, notes: ["G3", "B3", "D4"] },
      { time: 6.4, dur: 1.6, notes: ["C3", "E3", "G3"] },
      { time: 8.0, dur: 1.6, notes: ["A3", "C3", "E3"] },
      { time: 9.6, dur: 2.2, notes: ["F3", "G3", "C4"] },
    ],
    lyrics: [
      line(0.0, "夏夜的風 輕輕吹過"),
      line(3.8, "帶走了 白天的燥熱"),
      line(7.8, "星星亮起 像在說"),
      line(9.0, "今夜 有你就足夠"),
    ],
  },
  {
    id: "by-your-side",
    title: "陪你到底",
    artist: "KTV Demo Band",
    tempoScale: 1.15,
    melody: [
      { time: 0.0, dur: 0.8, note: "A3" },
      { time: 0.8, dur: 0.8, note: "C4" },
      { time: 1.6, dur: 0.8, note: "E4" },
      { time: 2.4, dur: 1.2, note: "D4" },
      { time: 3.6, dur: 0.8, note: "C4" },
      { time: 4.4, dur: 0.8, note: "A3" },
      { time: 5.2, dur: 1.2, note: "G3" },
      { time: 6.6, dur: 0.8, note: "A3" },
      { time: 7.4, dur: 0.8, note: "C4" },
      { time: 8.2, dur: 0.8, note: "D4" },
      { time: 9.0, dur: 1.6, note: "E4" },
      { time: 10.8, dur: 0.8, note: "D4" },
      { time: 11.6, dur: 0.8, note: "C4" },
      { time: 12.4, dur: 1.6, note: "A3" },
    ],
    chords: [
      { time: 0, dur: 2.4, notes: ["A2", "C3", "E3"] },
      { time: 2.4, dur: 2.4, notes: ["F2", "A2", "C3"] },
      { time: 4.8, dur: 2.4, notes: ["G2", "B2", "D3"] },
      { time: 7.2, dur: 2.4, notes: ["A2", "C3", "E3"] },
      { time: 9.6, dur: 2.4, notes: ["F2", "A2", "C3"] },
      { time: 12.0, dur: 2.0, notes: ["G2", "B2", "D3"] },
    ],
    lyrics: [
      line(0.0, "無論晴天或雨天"),
      line(3.6, "我都會陪在你身邊"),
      line(6.6, "就算世界再喧鬧"),
      line(9.0, "陪你到底 不改變"),
      line(10.8, "這一句 我做到"),
    ],
  },
  {
    id: "youth-in-progress",
    title: "青春進行式",
    artist: "KTV Demo Band",
    tempoScale: 0.9,
    melody: [
      { time: 0.0, dur: 0.4, note: "E4" },
      { time: 0.4, dur: 0.4, note: "G4" },
      { time: 0.8, dur: 0.4, note: "A4" },
      { time: 1.2, dur: 0.4, note: "G4" },
      { time: 1.6, dur: 0.8, note: "E4" },
      { time: 2.4, dur: 0.4, note: "D4" },
      { time: 2.8, dur: 0.8, note: "E4" },
      { time: 3.8, dur: 0.4, note: "G4" },
      { time: 4.2, dur: 0.4, note: "A4" },
      { time: 4.6, dur: 0.4, note: "C5" },
      { time: 5.0, dur: 0.4, note: "B4" },
      { time: 5.4, dur: 0.8, note: "A4" },
      { time: 6.2, dur: 0.4, note: "G4" },
      { time: 6.6, dur: 0.8, note: "E4" },
      { time: 7.8, dur: 0.4, note: "D4" },
      { time: 8.2, dur: 0.4, note: "E4" },
      { time: 8.6, dur: 0.4, note: "G4" },
      { time: 9.0, dur: 1.2, note: "A4" },
      { time: 10.4, dur: 0.8, note: "G4" },
      { time: 11.2, dur: 1.6, note: "E4" },
    ],
    chords: [
      { time: 0, dur: 1.6, notes: ["E3", "G3", "B3"] },
      { time: 1.6, dur: 1.6, notes: ["C3", "E3", "G3"] },
      { time: 3.2, dur: 1.6, notes: ["D3", "F3", "A3"] },
      { time: 4.8, dur: 1.6, notes: ["G3", "B3", "D4"] },
      { time: 6.4, dur: 1.6, notes: ["E3", "G3", "B3"] },
      { time: 8.0, dur: 1.6, notes: ["C3", "E3", "G3"] },
      { time: 9.6, dur: 3.2, notes: ["D3", "F3", "A3"] },
    ],
    lyrics: [
      line(0.0, "汗水滴在跑道上"),
      line(3.8, "我們追著 未完的夢想"),
      line(7.8, "青春就是進行式"),
      line(9.0, "從不曾 輕言放棄"),
    ],
  },
];

function repeatSong(song, times) {
  if (times <= 1) return song;
  const unitDuration = Math.max(
    ...song.melody.map((n) => n.time + n.dur),
    ...song.chords.map((c) => c.time + c.dur)
  );
  const melody = [];
  const chords = [];
  const lyrics = [];
  for (let r = 0; r < times; r++) {
    const offset = r * unitDuration;
    for (const n of song.melody) melody.push({ ...n, time: n.time + offset });
    for (const c of song.chords) chords.push({ ...c, time: c.time + offset });
    for (const l of song.lyrics) lyrics.push({ ...l, time: l.time + offset });
  }
  return { ...song, melody, chords, lyrics };
}

const catalog = [];

for (const rawSong of songs) {
  const song = repeatSong(rawSong, rawSong.repeats ?? 2);
  const { buffer, totalDuration } = synthSong(song);
  const wavPath = path.join(OUT_DIR, `${song.id}.wav`);
  writeWav(wavPath, buffer, SAMPLE_RATE);

  const lrcPath = path.join(OUT_DIR, `${song.id}.lrc`);
  writeLrc(lrcPath, song, song.lyrics);

  const pitch = buildPitchContour(song.melody, totalDuration, song.tempoScale);
  const pitchPath = path.join(OUT_DIR, `${song.id}.pitch.json`);
  writeFileSync(pitchPath, JSON.stringify(pitch));

  catalog.push({
    id: song.id,
    title: song.title,
    artist: song.artist,
    duration: Math.round(totalDuration * 10) / 10,
    audioUrl: `/songs/${song.id}.wav`,
    lrcUrl: `/songs/${song.id}.lrc`,
    pitchUrl: `/songs/${song.id}.pitch.json`,
  });

  console.log(`generated ${song.id}: ${totalDuration.toFixed(1)}s`);
}

writeFileSync(
  path.join(OUT_DIR, "catalog.json"),
  JSON.stringify(catalog, null, 2)
);
console.log(`wrote catalog with ${catalog.length} songs`);
