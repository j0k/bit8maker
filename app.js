// Bit8maker 0.0.6 — client-side beat maker (Web Audio API). No backend.
"use strict";
const VERSION = "0.0.6";
const STEPS = 16;
const INSTR = ["kick", "snare", "hihat", "clap"];
const MAX_BPM = 250;
const MAX_SEC = 8;

// ---- languages ----
const LANGS = [
  ["ru-modern", "Русский"], ["ru-classic", "Русский · классич."], ["uk", "Українська"],
  ["eng-ny", "English · NY"], ["fr", "Français"], ["jp", "日本語"], ["sa", "العربية"],
  ["cn", "中文"], ["kz", "Қазақша"], ["lt", "Lietuvių"],
];
const RTL = { sa: true };
const RU_INSTR = { kick: "Бочка", snare: "Снейр", hihat: "Хэт", clap: "Хлопок" };
const EN_INSTR = { kick: "Kick", snare: "Snare", hihat: "HiHat", clap: "Clap" };
const STRINGS = {
  "ru-modern": { tagline: "Касание сетки — и ритм оживает. Курсив, как водится, ваш.", play: "Играть", stop: "Стоп", clear: "Очистить", bpm: "Темп", instr: RU_INSTR },
  "ru-classic": { tagline: "Нажми на сетку — собери свой бит.", play: "Играть", stop: "Стоп", clear: "Очистить", bpm: "Темп", instr: RU_INSTR },
  "uk": { tagline: "Торкнись сітки — збери свій біт.", play: "Грати", stop: "Стоп", clear: "Очистити", bpm: "Темп", instr: { kick: "Бочка", snare: "Снер", hihat: "Хет", clap: "Плеск" } },
  "eng-ny": { tagline: "Yo — tap the grid, cook a beat… can't be beat.", play: "Play", stop: "Stop", clear: "Clear", bpm: "BPM", instr: EN_INSTR },
  "fr": { tagline: "Touche la grille, prépare un beat.", play: "Jouer", stop: "Stop", clear: "Effacer", bpm: "Tempo", instr: EN_INSTR },
  "jp": { tagline: "グリッドをタップして、ビートを作ろう。", play: "再生", stop: "停止", clear: "クリア", bpm: "BPM", instr: EN_INSTR },
  "sa": { tagline: "انقر على الشبكة واصنع إيقاعك.", play: "تشغيل", stop: "إيقاف", clear: "مسح", bpm: "إيقاع", instr: EN_INSTR },
  "cn": { tagline: "点击网格，做出你的节拍。", play: "播放", stop: "停止", clear: "清除", bpm: "BPM", instr: EN_INSTR },
  "kz": { tagline: "Торды басып, битіңді жаса.", play: "Ойнату", stop: "Тоқтату", clear: "Тазалау", bpm: "Қарқын", instr: EN_INSTR },
  "lt": { tagline: "Spustelėk tinklelį ir sukurk ritmą.", play: "Groti", stop: "Stop", clear: "Išvalyti", bpm: "Tempas", instr: EN_INSTR },
};
const EXPORT_LABEL = { "ru-modern": "Экспорт WAV", "ru-classic": "Экспорт WAV", "uk": "Експорт WAV", "eng-ny": "Export WAV", "fr": "Export WAV", "jp": "WAV書き出し", "sa": "تصدير WAV", "cn": "导出 WAV", "kz": "WAV экспорт", "lt": "Eksportuoti WAV" };
const SHARE_LABEL = { "ru-modern": "Поделиться", "ru-classic": "Поделиться", "uk": "Поділитися", "eng-ny": "Share link", "fr": "Partager", "jp": "共有", "sa": "مشاركة", "cn": "分享", "kz": "Бөлісу", "lt": "Dalintis" };
const COPIED = { "ru-modern": "ссылка скопирована", "ru-classic": "ссылка скопирована", "uk": "посилання скопійовано", "eng-ny": "link copied!", "fr": "lien copié", "jp": "リンクをコピーしました", "sa": "تم نسخ الرابط", "cn": "链接已复制", "kz": "сілтеме көшірілді", "lt": "nuoroda nukopijuota" };
const REPEAT_LABEL = { "ru-modern": "Повторы", "ru-classic": "Повторы", "uk": "Повтори", "eng-ny": "Repeats", "fr": "Répét.", "jp": "反復", "sa": "تكرار", "cn": "重复", "kz": "Қайталау", "lt": "Kart." };

const CL_LABELS = {
  "ru-modern": { version: "Версия", whats: "Что нового", arch: "Архитектура" }, "ru-classic": { version: "Версия", whats: "Что нового", arch: "Архитектура" },
  "uk": { version: "Версія", whats: "Що нового", arch: "Архітектура" }, "eng-ny": { version: "Version", whats: "What's new", arch: "Architecture" },
  "fr": { version: "Version", whats: "Nouveautés", arch: "Architecture" }, "jp": { version: "バージョン", whats: "新着", arch: "アーキテクチャ" },
  "sa": { version: "الإصدار", whats: "الجديد", arch: "البنية" }, "cn": { version: "版本", whats: "更新内容", arch: "架构" },
  "kz": { version: "Нұсқа", whats: "Жаңалықтар", arch: "Архитектура" }, "lt": { version: "Versija", whats: "Naujienos", arch: "Architektūra" },
};
const CHANGELOG = [
  { v: "0.0.1", commit: "2479f18", items: {
    "ru-modern": ["Сетка на 16 шагов: Kick, Snare, HiHat, Clap", "Play/Stop, темп, очистка", "Переключение языков", "Живой синтез ударных, без сэмплов"],
    "ru-classic": ["Сетка 16 шагов: Kick, Snare, HiHat, Clap", "Play/Stop, BPM, очистка", "Смена языка", "Синтез ударных без сэмплов"],
    "uk": ["Сітка 16 кроків: Kick, Snare, HiHat, Clap", "Play/Stop, темп, очищення", "Зміна мови", "Синтез ударних без семплів"],
    "eng-ny": ["16-step grid: Kick, Snare, HiHat, Clap", "Play/Stop, BPM, Clear", "Language switch", "Procedural drums, no samples"],
    "fr": ["Grille 16 pas : Kick, Snare, HiHat, Clap", "Lecture/Stop, tempo, effacer", "Changement de langue", "Batterie synthétisée, sans samples"],
    "jp": ["16ステップのグリッド：Kick/Snare/HiHat/Clap", "再生/停止・BPM・クリア", "言語切り替え", "サンプルなしの合成ドラム"],
    "sa": ["شبكة من 16 خطوة: Kick وSnare وHiHat وClap", "تشغيل/إيقاف، الإيقاع، مسح", "تبديل اللغة", "طبول مُركّبة دون عيّنات"],
    "cn": ["16 步网格：Kick、Snare、HiHat、Clap", "播放/停止、BPM、清除", "切换语言", "合成鼓声，无采样"],
    "kz": ["16 қадамдық тор: Kick, Snare, HiHat, Clap", "Ойнату/Тоқтату, қарқын, тазалау", "Тіл ауыстыру", "Үлгісіз синтезделген барабандар"],
    "lt": ["16 žingsnių tinklelis: Kick, Snare, HiHat, Clap", "Groti/Stop, tempas, valyti", "Kalbos perjungimas", "Sintezuoti būgnai, be semplų"],
  }, arch: {
    "ru-modern": "Только клиент (Web Audio API), без сервера.", "ru-classic": "Только клиент (Web Audio), без бэкенда.", "uk": "Лише клієнт (Web Audio), без бекенда.",
    "eng-ny": "Client-side only (Web Audio API), no backend.", "fr": "Côté client uniquement (Web Audio), sans backend.", "jp": "クライアントのみ（Web Audio）。バックエンドなし。",
    "sa": "من جهة العميل فقط (Web Audio)، دون خادم.", "cn": "纯前端（Web Audio），无后端。", "kz": "Тек клиент (Web Audio), серверсіз.", "lt": "Tik kliento pusėje (Web Audio), be serverio.",
  } },
  { v: "0.0.2", commit: "b08e2fa", items: {
    "ru-modern": ["Мини-микшер: громкость каждой дорожки", "Громкости запоминаются", "Адаптив: на узких экранах слайдеры скрыты"],
    "ru-classic": ["Громкость каждой дорожки", "Громкости сохраняются", "Адаптивная вёрстка"], "uk": ["Гучність кожної доріжки", "Гучності зберігаються", "Адаптивна верстка"],
    "eng-ny": ["Per-track volume sliders", "Volumes remembered", "Responsive (sliders hidden on narrow screens)"], "fr": ["Volume par piste", "Volumes mémorisés", "Responsive"],
    "jp": ["トラックごとの音量スライダー", "音量を記憶", "レスポンシブ対応"], "sa": ["مستوى صوت لكل مسار", "حفظ مستويات الصوت", "تصميم متجاوب"],
    "cn": ["每条轨道的音量滑块", "记住音量设置", "响应式布局"], "kz": ["Әр трек үшін дыбыс деңгейі", "Дыбыс деңгейі сақталады", "Бейімделгіш дизайн"], "lt": ["Kiekvieno takelio garsumas", "Garsumai įsimenami", "Prisitaikantis dizainas"],
  }, arch: {} },
  { v: "0.0.3", commit: "82d9eec", items: {
    "ru-modern": ["Максимальный темп — 250 BPM", "Десять языков интерфейса", "Слайдер версий и история изменений внизу"], "ru-classic": ["Максимум 250 BPM", "10 языков интерфейса", "Слайдер версий + changelog"],
    "uk": ["Максимум 250 BPM", "10 мов інтерфейсу", "Слайдер версій + changelog"], "eng-ny": ["Max tempo bumped to 250 BPM", "Ten interface languages", "Version slider + changelog at the bottom"],
    "fr": ["Tempo max porté à 250 BPM", "Dix langues d'interface", "Curseur de versions + changelog en bas"], "jp": ["最大テンポを250 BPMに", "10言語のUI", "下部にバージョンスライダーと変更履歴"],
    "sa": ["رفع أقصى إيقاع إلى 250", "عشر لغات للواجهة", "شريط الإصدارات وسجل التغييرات بالأسفل"], "cn": ["最高速度提升到 250 BPM", "十种界面语言", "底部版本滑块与更新日志"],
    "kz": ["Ең жоғары қарқын — 250 BPM", "Интерфейстің он тілі", "Төменде нұсқа слайдері мен өзгерістер тізімі"], "lt": ["Maksimalus tempas — 250 BPM", "Dešimt sąsajos kalbų", "Versijų slankiklis ir pakeitimų sąrašas apačioje"],
  }, arch: {} },
  { v: "0.0.4", commit: "da01b72", items: {
    "ru-modern": ["Экспорт бита в WAV — скачивание прямо из браузера"], "ru-classic": ["Экспорт в WAV"], "uk": ["Експорт у WAV"], "eng-ny": ["Export your beat to WAV (download)"],
    "fr": ["Export du beat en WAV (téléchargement)"], "jp": ["ビートをWAVで書き出し（ダウンロード）"], "sa": ["تصدير الإيقاع إلى WAV (تنزيل)"], "cn": ["将节拍导出为 WAV（下载）"],
    "kz": ["Битті WAV-қа экспорттау (жүктеу)"], "lt": ["Ritmo eksportas į WAV (atsisiuntimas)"],
  }, arch: {} },
  { v: "0.0.5", commit: "9c7602b", items: {
    "ru-modern": ["Сохранение и загрузка паттерна по ссылке — поделись битом одним кликом"], "ru-classic": ["Сохранение/загрузка паттерна по ссылке"], "uk": ["Збереження/завантаження патерну за посиланням"],
    "eng-ny": ["Save & load a pattern by link — share your beat in one click"], "fr": ["Sauvegarde/chargement du motif par lien"], "jp": ["リンクでパターンを保存・読み込み"],
    "sa": ["حفظ النمط وتحميله عبر رابط"], "cn": ["通过链接保存/加载节拍型"], "kz": ["Үлгіні сілтеме арқылы сақтау/жүктеу"], "lt": ["Šablono išsaugojimas/įkėlimas per nuorodą"],
  }, arch: {} },
  { v: "0.0.6", commit: "—", items: {
    "ru-modern": ["Сюжетные секции: интро, куплет, дроп — каждая со своим паттерном и повторами", "Ссылка теперь хранит и язык (?lang)"],
    "ru-classic": ["Секции с повторами", "Ссылка сохраняет язык (?lang)"], "uk": ["Секції з повторами", "Посилання зберігає мову (?lang)"],
    "eng-ny": ["Storyline sections — intro, verse, drop, each with its own pattern and repeats", "Share link now keeps the language (?lang)"],
    "fr": ["Sections (storyline) avec répétitions", "Le lien conserve la langue (?lang)"], "jp": ["ストーリー的セクション（反復つき）", "共有リンクに言語を保持（?lang）"],
    "sa": ["مقاطع متسلسلة مع تكرارات", "الرابط يحفظ اللغة (?lang)"], "cn": ["故事化段落（带重复）", "分享链接保留语言（?lang）"],
    "kz": ["Қайталаулары бар бөлімдер", "Сілтеме тілді сақтайды (?lang)"], "lt": ["Sekcijos su pakartojimais", "Nuoroda išsaugo kalbą (?lang)"],
  }, arch: {} },
];

// ---- language (URL ?lang overrides stored) ----
const urlLang = new URLSearchParams(location.search).get("lang");
let lang = (STRINGS[urlLang] ? urlLang : null) || localStorage.getItem("b8_lang");
if (!STRINGS[lang]) lang = "eng-ny";
let clIndex = CHANGELOG.length - 1;

// ---- state: sections ----
function emptyPattern() { const p = {}; INSTR.forEach((k) => (p[k] = new Array(STEPS).fill(false))); return p; }
function demo1() { const p = emptyPattern(); [0, 4, 8, 12].forEach((i) => (p.kick[i] = true)); [2, 6, 10, 14].forEach((i) => (p.hihat[i] = true)); [4, 12].forEach((i) => (p.snare[i] = true)); return p; }
function demo2() { const p = emptyPattern(); [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => (p.kick[i] = true)); for (let i = 0; i < 16; i++) p.hihat[i] = true; [4, 12].forEach((i) => (p.snare[i] = true)); [7, 15].forEach((i) => (p.clap[i] = true)); return p; }
let sections = [{ pattern: demo1(), repeat: 2 }, { pattern: demo2(), repeat: 2 }];
let cur = 0;

const DEF_VOL = { kick: 0.9, snare: 0.8, hihat: 0.6, clap: 0.7 };
const volumes = Object.assign({}, DEF_VOL, JSON.parse(localStorage.getItem("b8_vol") || "{}"));
function saveVol() { localStorage.setItem("b8_vol", JSON.stringify(volumes)); }

let bpm = 100;
let ctx = null;
let playing = false, nextNoteTime = 0, timer = null;
let seq = [], seqPos = 0;
const $ = (id) => document.getElementById(id);

// ---- synthesis ----
function noise(dur) { const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
function kick(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.18); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.31); }
function snare(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.2); const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400; const g = ctx.createGain(); g.gain.setValueAtTime(0.7 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.2); const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "triangle"; o.frequency.value = 180; og.gain.setValueAtTime(0.4 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + 0.15); }
function hihat(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.06); const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; const g = ctx.createGain(); g.gain.setValueAtTime(0.4 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06); s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.06); }
function clap(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.18); const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; const g = ctx.createGain(); g.gain.setValueAtTime(0.7 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 0.18); }
const VOICES = { kick, snare, hihat, clap };

// ---- sequence + scheduler ----
function buildSequence() {
  const s = [];
  sections.forEach((sec) => { for (let r = 0; r < sec.repeat; r++) for (let st = 0; st < STEPS; st++) s.push([sec.pattern, st]); });
  return s.length ? s : [[sections[0].pattern, 0]];
}
function scheduler() {
  while (nextNoteTime < ctx.currentTime + 0.1) {
    const cell = seq[seqPos], pat = cell[0], st = cell[1];
    INSTR.forEach((k) => { if (pat[k][st]) VOICES[k](nextNoteTime, volumes[k]); });
    const dt = (nextNoteTime - ctx.currentTime) * 1000;
    setTimeout(() => highlight(st), Math.max(0, dt));
    seqPos = (seqPos + 1) % seq.length;
    nextNoteTime += (60 / bpm) / 4;
  }
  timer = setTimeout(scheduler, 25);
}
function play() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  playing = true; seq = buildSequence(); seqPos = 0; nextNoteTime = ctx.currentTime + 0.06;
  scheduler(); updateTransport();
}
function stop() { playing = false; clearTimeout(timer); clearHighlight(); updateTransport(); }

// ---- WAV export (full storyline) ----
function encodeWAV(audioBuf) {
  const ch = audioBuf.getChannelData(0), n = ch.length, sr = audioBuf.sampleRate;
  const ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, n * 2, true);
  let o = 44; for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, ch[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2; }
  return ab;
}
async function exportWAV() {
  const sq = buildSequence(), sr = 44100, stepDur = (60 / bpm) / 4, total = sq.length * stepDur + 0.4;
  const off = new OfflineAudioContext(1, Math.ceil(total * sr), sr), live = ctx; ctx = off;
  try {
    sq.forEach((cell, i) => { const t = i * stepDur; INSTR.forEach((k) => { if (cell[0][k][cell[1]]) VOICES[k](t, volumes[k]); }); });
    const blob = new Blob([encodeWAV(await off.startRendering())], { type: "audio/wav" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "bit8maker.wav"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } finally { ctx = live; }
}

// ---- save / load by link ----
const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64dec = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
function patBits(pat) { return INSTR.map((k) => { let n = 0; for (let st = 0; st < STEPS; st++) if (pat[k][st]) n |= 1 << st; return n; }); }
function bitsToPat(arr) { const p = emptyPattern(); INSTR.forEach((k, i) => { const n = (arr && arr[i]) | 0; for (let st = 0; st < STEPS; st++) p[k][st] = !!(n & (1 << st)); }); return p; }
function encodeState() {
  const s = sections.map((sec) => ({ r: sec.repeat, p: patBits(sec.pattern) }));
  return b64url(JSON.stringify({ b: bpm, v: INSTR.map((k) => Math.round(volumes[k] * 100)), s: s }));
}
function decodeState(str) {
  try {
    const o = JSON.parse(b64dec(str));
    if (o.b) bpm = Math.max(60, Math.min(MAX_BPM, o.b | 0));
    if (Array.isArray(o.v)) INSTR.forEach((k, i) => { if (o.v[i] != null) volumes[k] = Math.max(0, Math.min(1, o.v[i] / 100)); });
    if (Array.isArray(o.s)) sections = o.s.slice(0, MAX_SEC).map((sec) => ({ repeat: Math.max(1, Math.min(8, (sec.r | 0) || 1)), pattern: bitsToPat(sec.p) }));
    else if (Array.isArray(o.p)) sections = [{ repeat: 1, pattern: bitsToPat(o.p) }]; // 0.0.5 link
    if (!sections.length) sections = [{ pattern: emptyPattern(), repeat: 1 }];
    cur = 0;
    return true;
  } catch (e) { return false; }
}
let statusTimer = null;
function flashStatus(msg) { const e = $("share-status"); e.textContent = msg; clearTimeout(statusTimer); statusTimer = setTimeout(() => (e.textContent = ""), 2500); }
function shareLink() {
  const url = location.pathname + "?lang=" + encodeURIComponent(lang) + "#" + encodeState();
  history.replaceState(null, "", url);
  if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => flashStatus(COPIED[lang])).catch(() => {});
  else flashStatus(COPIED[lang]);
}

// ---- UI ----
function highlight(step) { clearHighlight(); document.querySelectorAll('.cell[data-step="' + step + '"]').forEach((c) => c.classList.add("playing")); }
function clearHighlight() { document.querySelectorAll(".cell.playing").forEach((c) => c.classList.remove("playing")); }
function renderGrid() {
  const g = $("grid"); g.innerHTML = ""; const pat = sections[cur].pattern;
  INSTR.forEach((k) => {
    const row = document.createElement("div"); row.className = "row";
    const lab = document.createElement("div"); lab.className = "label"; lab.textContent = STRINGS[lang].instr[k];
    const steps = document.createElement("div"); steps.className = "steps";
    for (let s = 0; s < STEPS; s++) {
      const c = document.createElement("div"); c.className = "cell" + (pat[k][s] ? " on" : ""); c.dataset.step = s;
      c.onclick = () => { pat[k][s] = !pat[k][s]; c.classList.toggle("on"); };
      steps.appendChild(c);
    }
    const vol = document.createElement("input"); vol.type = "range"; vol.min = 0; vol.max = 100; vol.value = Math.round(volumes[k] * 100); vol.className = "row-vol"; vol.title = "volume";
    vol.oninput = (e) => { volumes[k] = e.target.value / 100; saveVol(); };
    row.appendChild(lab); row.appendChild(steps); row.appendChild(vol); g.appendChild(row);
  });
}
function renderTabs() {
  const el = $("tabs"); el.innerHTML = "";
  sections.forEach((s, i) => { const b = document.createElement("button"); b.className = "tab" + (i === cur ? " active" : ""); b.textContent = i + 1; b.onclick = () => { cur = i; sync(); }; el.appendChild(b); });
  const add = document.createElement("button"); add.className = "tab"; add.textContent = "＋"; add.title = "add";
  add.onclick = () => { if (sections.length < MAX_SEC) { sections.push({ pattern: emptyPattern(), repeat: 2 }); cur = sections.length - 1; sync(); } };
  el.appendChild(add);
  if (sections.length > 1) { const rem = document.createElement("button"); rem.className = "tab"; rem.textContent = "✕"; rem.title = "remove"; rem.onclick = () => { sections.splice(cur, 1); cur = Math.min(cur, sections.length - 1); sync(); }; el.appendChild(rem); }
  $("rep-val").textContent = "×" + sections[cur].repeat;
}
function sync() { renderTabs(); renderGrid(); }
function updateTransport() { $("play").textContent = playing ? STRINGS[lang].stop : STRINGS[lang].play; }
function renderChangelog() {
  const e = CHANGELOG[clIndex], L = CL_LABELS[lang];
  $("cl-version").textContent = L.version + " " + e.v + (clIndex === CHANGELOG.length - 1 ? " ·" : "");
  $("cl-commit").innerHTML = e.commit && e.commit !== "—" ? '<a href="https://github.com/j0k/bit8maker/commit/' + e.commit + '" target="_blank">' + e.commit + "</a>" : "";
  const items = (e.items[lang] || e.items["eng-ny"]).map((x) => "<li>" + x + "</li>").join("");
  let html = "<h3>" + L.whats + "</h3><ul>" + items + "</ul>";
  const arch = e.arch[lang] || e.arch["eng-ny"];
  if (arch) html += '<p class="cl-arch"><b>' + L.arch + ":</b> " + arch + "</p>";
  $("cl-body").innerHTML = html;
}
function applyLang() {
  document.documentElement.lang = lang.split("-")[0];
  document.documentElement.dir = RTL[lang] ? "rtl" : "ltr";
  const t = STRINGS[lang];
  $("tagline").textContent = t.tagline;
  $("clear").textContent = t.clear;
  $("export").textContent = EXPORT_LABEL[lang];
  $("share").textContent = SHARE_LABEL[lang];
  $("rep-label").textContent = REPEAT_LABEL[lang];
  $("bpm-label").textContent = t.bpm;
  updateTransport(); sync(); renderChangelog();
  $("lang-select").value = lang;
}

// ---- wire ----
if (location.hash.length > 1) decodeState(location.hash.slice(1)); // load shared pattern
const sel = $("lang-select");
LANGS.forEach(([code, label]) => { const o = document.createElement("option"); o.value = code; o.textContent = label; sel.appendChild(o); });
sel.onchange = () => { lang = sel.value; localStorage.setItem("b8_lang", lang); applyLang(); };
$("play").onclick = () => (playing ? stop() : play());
$("clear").onclick = () => { INSTR.forEach((k) => sections[cur].pattern[k].fill(false)); renderGrid(); };
$("export").onclick = exportWAV;
$("share").onclick = shareLink;
$("rep-dn").onclick = () => { sections[cur].repeat = Math.max(1, sections[cur].repeat - 1); $("rep-val").textContent = "×" + sections[cur].repeat; };
$("rep-up").onclick = () => { sections[cur].repeat = Math.min(8, sections[cur].repeat + 1); $("rep-val").textContent = "×" + sections[cur].repeat; };
const bpmIn = $("bpm"); bpmIn.max = MAX_BPM; bpmIn.value = bpm; $("bpm-val").textContent = bpm;
bpmIn.oninput = (e) => { bpm = +e.target.value; $("bpm-val").textContent = bpm; };
const verSlider = $("ver-slider"); verSlider.max = CHANGELOG.length - 1; verSlider.value = clIndex;
verSlider.oninput = (e) => { clIndex = +e.target.value; renderChangelog(); };
$("ver").textContent = VERSION;
applyLang();
