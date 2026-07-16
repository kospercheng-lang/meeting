export interface LyricLine {
  time: number;
  text: string;
}

const LINE_RE = /\[(\d{2}):(\d{2}(?:\.\d+)?)\]([^\n\r\[]*)/g;

export function parseLrc(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const match of raw.matchAll(LINE_RE)) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseFloat(match[2]);
    const text = match[3].trim();
    if (!text) continue;
    lines.push({ time: minutes * 60 + seconds, text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function currentLineIndex(lines: LyricLine[], time: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= time) idx = i;
    else break;
  }
  return idx;
}
