// Golden Ladle Bistro — synthesized sound effects.
// Every sound is built from oscillators at play time, so the game ships no
// audio files and makes no network request. All of it is original: short
// blips and noise bursts tuned to each kitchen action.

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, vol, when, slideTo) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, filterFreq) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq || 1200;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol || 0.15, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t0);
}

export function playSound(name) {
  if (muted) return;
  switch (name) {
    case 'pickup': tone(520, 0.09, 'triangle', 0.1); break;
    case 'place': tone(340, 0.1, 'triangle', 0.1); tone(460, 0.12, 'triangle', 0.08, 0.06); break;
    case 'chop': noiseBurst(0.08, 0.22, 900); tone(180, 0.07, 'square', 0.06); break;
    case 'sizzle': noiseBurst(0.5, 0.08, 3200); break;
    case 'ding': tone(880, 0.35, 'sine', 0.12); tone(1320, 0.3, 'sine', 0.06, 0.02); break;
    case 'coin': tone(990, 0.1, 'sine', 0.12); tone(1320, 0.28, 'sine', 0.12, 0.09); break;
    case 'error': tone(160, 0.18, 'sawtooth', 0.08, 0, 110); break;
    case 'trash': noiseBurst(0.18, 0.14, 500); break;
    case 'start': tone(523, 0.12, 'triangle', 0.1); tone(659, 0.12, 'triangle', 0.1, 0.1); tone(784, 0.2, 'triangle', 0.1, 0.2); break;
    case 'over': tone(392, 0.25, 'triangle', 0.1); tone(330, 0.25, 'triangle', 0.1, 0.22); tone(262, 0.5, 'triangle', 0.1, 0.44); break;
    default: break;
  }
}
