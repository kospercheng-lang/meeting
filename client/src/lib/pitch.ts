// Autocorrelation-based pitch detector, restricted to a singing-relevant
// frequency band so the per-frame search stays cheap enough for rAF.
const MIN_FREQ = 70; // Hz
const MAX_FREQ = 1000; // Hz
const RMS_SILENCE_THRESHOLD = 0.01;

export function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const n = buffer.length;

  let rms = 0;
  for (let i = 0; i < n; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / n);
  if (rms < RMS_SILENCE_THRESHOLD) return -1;

  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.min(n - 1, Math.ceil(sampleRate / MIN_FREQ));

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += buffer[i] * buffer[i + lag];
    if (sum > bestCorr) {
      bestCorr = sum;
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return -1;

  // parabolic interpolation around the best lag for sub-sample precision
  const c0 = correlationAt(buffer, bestLag - 1);
  const c1 = bestCorr;
  const c2 = correlationAt(buffer, bestLag + 1);
  const denom = c0 - 2 * c1 + c2;
  const shift = denom !== 0 ? (0.5 * (c0 - c2)) / denom : 0;
  const refinedLag = bestLag + shift;

  const freq = sampleRate / refinedLag;
  if (freq < MIN_FREQ || freq > MAX_FREQ) return -1;
  return freq;
}

function correlationAt(buffer: Float32Array, lag: number): number {
  if (lag < 0 || lag >= buffer.length) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length - lag; i++) sum += buffer[i] * buffer[i + lag];
  return sum;
}

export function freqToCents(freq: number, refFreq: number): number {
  return 1200 * Math.log2(freq / refFreq);
}
