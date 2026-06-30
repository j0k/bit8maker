// Bit8maker 0.0.1 — client-side beat maker (Web Audio API). No backend.
"use strict";
const VERSION = "0.0.1";
const STEPS = 16;
const INSTR = ["kick", "snare", "hihat", "clap"];

const STRINGS = {
  en: {
    tagline: "Yo — tap the grid, cook a beat… can't be beat.",
    play: "Play", stop: "Stop", clear: "Clear", bpm: "BPM",
    instr: { kick: "Kick", snare: "Snare", hihat: "HiHat", clap: "Clap" },
  },
  ru: {
    tagline: "Кликни — и бит готов. Никакой студии.",
    play: "Играть", stop: "Стоп", clear: "Очистить", bpm: "Темп",
    instr: { kick: "Бочка", snare: "Снейр", hihat: "Хэт", clap: "Хлопок" },
  },
};

let lang = localStorage.getItem("b8_lang") || (navigator.language || "en").slice(0, 2);
if (!STRINGS[lang]) lang = "en";

// pattern state
const pattern = {};
INSTR.forEach((k) => (pattern[k] = new Array(STEPS).fill(false)));
// demo beat
[0, 4, 8, 12].forEach((i) => (pattern.kick[i] = true));
[2, 6, 10, 14].forEach((i) => (pattern.hihat[i] = true));
[4, 12].forEach((i) => (pattern.snare[i] = true));

let bpm = 100;
let ctx = null;
let playing = false;
let currentStep = 0;
let nextNoteTime = 0;
let timer = null;

const $ = (id) => document.getElementById(id);

// ---------- synthesis ----------
function noise(dur) {
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
function kick(t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.18);
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.31);
}
function snare(t) {
  const s = ctx.createBufferSource(); s.buffer = noise(0.2);
  const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.2);
  const o = ctx.createOscillator(), og = ctx.createGain();
  o.type = "triangle"; o.frequency.value = 180;
  og.gain.setValueAtTime(0.4, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + 0.15);
}
function hihat(t) {
  const s = ctx.createBufferSource(); s.buffer = noise(0.06);
  const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.06);
}
function clap(t) {
  const s = ctx.createBufferSource(); s.buffer = noise(0.18);
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.18);
}
const VOICES = { kick, snare, hihat, clap };

// ---------- scheduler ----------
function scheduleStep(step, t) {
  INSTR.forEach((k) => { if (pattern[k][step]) VOICES[k](t); });
  const dt = (t - ctx.currentTime) * 1000;
  setTimeout(() => highlight(step), Math.max(0, dt));
}
function scheduler() {
  while (nextNoteTime < ctx.currentTime + 0.1) {
    scheduleStep(currentStep, nextNoteTime);
    nextNoteTime += (60 / bpm) / 4; // sixteenth note
    currentStep = (currentStep + 1) % STEPS;
  }
  timer = setTimeout(scheduler, 25);
}
function play() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  playing = true; currentStep = 0; nextNoteTime = ctx.currentTime + 0.06;
  scheduler(); updateTransport();
}
function stop() {
  playing = false; clearTimeout(timer); clearHighlight(); updateTransport();
}

// ---------- UI ----------
function highlight(step) {
  clearHighlight();
  document.querySelectorAll('.cell[data-step="' + step + '"]').forEach((c) => c.classList.add("playing"));
}
function clearHighlight() {
  document.querySelectorAll(".cell.playing").forEach((c) => c.classList.remove("playing"));
}
function renderGrid() {
  const g = $("grid"); g.innerHTML = "";
  INSTR.forEach((k) => {
    const row = document.createElement("div"); row.className = "row";
    const lab = document.createElement("div"); lab.className = "label";
    lab.textContent = STRINGS[lang].instr[k];
    const steps = document.createElement("div"); steps.className = "steps";
    for (let s = 0; s < STEPS; s++) {
      const c = document.createElement("div");
      c.className = "cell" + (pattern[k][s] ? " on" : "");
      c.dataset.step = s;
      c.onclick = () => { pattern[k][s] = !pattern[k][s]; c.classList.toggle("on"); };
      steps.appendChild(c);
    }
    row.appendChild(lab); row.appendChild(steps); g.appendChild(row);
  });
}
function updateTransport() {
  $("play").textContent = playing ? STRINGS[lang].stop : STRINGS[lang].play;
}
function applyLang() {
  document.documentElement.lang = lang;
  const t = STRINGS[lang];
  $("tagline").textContent = t.tagline;
  $("clear").textContent = t.clear;
  $("bpm-label").textContent = t.bpm;
  updateTransport();
  renderGrid();
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.lang === lang));
}

// ---------- wire ----------
$("play").onclick = () => (playing ? stop() : play());
$("clear").onclick = () => { INSTR.forEach((k) => pattern[k].fill(false)); renderGrid(); };
$("bpm").oninput = (e) => { bpm = +e.target.value; $("bpm-val").textContent = bpm; };
document.querySelectorAll(".lang-btn").forEach((b) =>
  (b.onclick = () => { lang = b.dataset.lang; localStorage.setItem("b8_lang", lang); applyLang(); }));
$("ver").textContent = VERSION;
applyLang();
