// Bit8maker 0.1.11 — client-side beat maker (Web Audio API). No backend.
"use strict";
const VERSION = "0.1.11";
const STEPS = 16;
const INSTR = ["kick", "snare", "hihat", "clap", "bass", "synth"];
const MAX_BPM = 250;
const MAX_SEC = 16;

// ---- languages ----
const LANGS = [
  ["ru-modern", "Русский"], ["ru-classic", "Русский · классич."], ["uk", "Українська"],
  ["eng-ny", "English · NY"], ["eng-uk", "English · UK"], ["fr", "Français"], ["jp", "日本語"],
  ["sa", "العربية"], ["cn", "中文"], ["kz", "Қазақша"], ["lt", "Lietuvių"],
];
const RTL = { sa: true };
const RU_INSTR = { kick: "Бочка", snare: "Снейр", hihat: "Хэт", clap: "Хлопок", bass: "Бас", synth: "Синт" };
const EN_INSTR = { kick: "Kick", snare: "Snare", hihat: "HiHat", clap: "Clap", bass: "Bass", synth: "Synth" };
const STRINGS = {
  "ru-modern": { tagline: "Касание сетки — и ритм оживает. Курсив, как водится, ваш.", play: "Играть", stop: "Стоп", clear: "Очистить", bpm: "Темп", instr: RU_INSTR },
  "ru-classic": { tagline: "Нажми на сетку — собери свой бит.", play: "Играть", stop: "Стоп", clear: "Очистить", bpm: "Темп", instr: RU_INSTR },
  "uk": { tagline: "Торкнись сітки — збери свій біт.", play: "Грати", stop: "Стоп", clear: "Очистити", bpm: "Темп", instr: { kick: "Бочка", snare: "Снер", hihat: "Хет", clap: "Плеск", bass: "Бас", synth: "Синт" } },
  "eng-ny": { tagline: "Yo — tap the grid, cook a beat… can't be beat.", play: "Play", stop: "Stop", clear: "Clear", bpm: "BPM", instr: EN_INSTR },
  "eng-uk": { tagline: "Go on then — tap the grid, knock up a beat. Proper tidy.", play: "Play", stop: "Stop", clear: "Clear", bpm: "BPM", instr: EN_INSTR },
  "fr": { tagline: "Touche la grille, prépare un beat.", play: "Jouer", stop: "Stop", clear: "Effacer", bpm: "Tempo", instr: EN_INSTR },
  "jp": { tagline: "グリッドをタップして、ビートを作ろう。", play: "再生", stop: "停止", clear: "クリア", bpm: "BPM", instr: EN_INSTR },
  "sa": { tagline: "انقر على الشبكة واصنع إيقاعك.", play: "تشغيل", stop: "إيقاف", clear: "مسح", bpm: "إيقاع", instr: EN_INSTR },
  "cn": { tagline: "点击网格，做出你的节拍。", play: "播放", stop: "停止", clear: "清除", bpm: "BPM", instr: EN_INSTR },
  "kz": { tagline: "Торды басып, битіңді жаса.", play: "Ойнату", stop: "Тоқтату", clear: "Тазалау", bpm: "Қарқын", instr: EN_INSTR },
  "lt": { tagline: "Spustelėk tinklelį ir sukurk ritmą.", play: "Groti", stop: "Stop", clear: "Išvalyti", bpm: "Tempas", instr: EN_INSTR },
};
const EXPORT_LABEL = { "ru-modern": "Экспорт", "ru-classic": "Экспорт", "uk": "Експорт", "eng-ny": "Export", "eng-uk": "Export", "fr": "Exporter", "jp": "書き出し", "sa": "تصدير", "cn": "导出", "kz": "Экспорт", "lt": "Eksportuoti" };
const TRACK_LABEL = { "ru-modern": "название трека", "ru-classic": "название трека", "uk": "назва треку", "eng-ny": "track name", "eng-uk": "track name", "fr": "nom de piste", "jp": "トラック名", "sa": "اسم المقطع", "cn": "曲目名称", "kz": "трек атауы", "lt": "takelio pavadinimas" };
const SHARE_LABEL = { "ru-modern": "Поделиться", "ru-classic": "Поделиться", "uk": "Поділитися", "eng-ny": "Share link", "eng-uk": "Share link", "fr": "Partager", "jp": "共有", "sa": "مشاركة", "cn": "分享", "kz": "Бөлісу", "lt": "Dalintis" };
const COPIED = { "ru-modern": "ссылка скопирована", "ru-classic": "ссылка скопирована", "uk": "посилання скопійовано", "eng-ny": "link copied!", "eng-uk": "link copied — sorted!", "fr": "lien copié", "jp": "リンクをコピーしました", "sa": "تم نسخ الرابط", "cn": "链接已复制", "kz": "сілтеме көшірілді", "lt": "nuoroda nukopijuota" };
const REPEAT_LABEL = { "ru-modern": "Повторы", "ru-classic": "Повторы", "uk": "Повтори", "eng-ny": "Repeats", "eng-uk": "Repeats", "fr": "Répét.", "jp": "反復", "sa": "تكرار", "cn": "重复", "kz": "Қайталау", "lt": "Kart." };
const PRESET_LABEL = { "ru-modern": "+ стиль", "ru-classic": "+ стиль", "uk": "+ стиль", "eng-ny": "+ style", "eng-uk": "+ style", "fr": "+ style", "jp": "+ スタイル", "sa": "+ نمط", "cn": "+ 风格", "kz": "+ стиль", "lt": "+ stilius" };
const SEC_FULL = { "ru-modern": "максимум секций", "ru-classic": "максимум секций", "uk": "максимум секцій", "eng-ny": "max sections", "eng-uk": "max sections", "fr": "sections au max", "jp": "セクション上限", "sa": "الحد الأقصى للمقاطع", "cn": "段落已满", "kz": "бөлім шегі", "lt": "sekcijų riba" };
const NP_LABEL = { "ru-modern": "Сейчас играет", "ru-classic": "Сейчас играет", "uk": "Зараз грає", "eng-ny": "Now playing", "eng-uk": "Now playing", "fr": "En lecture", "jp": "再生中", "sa": "قيد التشغيل", "cn": "正在播放", "kz": "Қазір ойнауда", "lt": "Dabar groja" };
const PAUSE_LABEL = { "ru-modern": "Пауза", "ru-classic": "Пауза", "uk": "Пауза", "eng-ny": "Pause", "eng-uk": "Pause", "fr": "Pause", "jp": "一時停止", "sa": "إيقاف مؤقت", "cn": "暂停", "kz": "Кідірту", "lt": "Pauzė" };
const REC_LABEL = { "ru-modern": "Запись", "ru-classic": "Запись", "uk": "Запис", "eng-ny": "Rec", "eng-uk": "Rec", "fr": "Enreg.", "jp": "録音", "sa": "تسجيل", "cn": "录制", "kz": "Жазу", "lt": "Įrašyti" };
const SCOPE_LABEL = { "ru-modern": "Волна и спектр", "ru-classic": "Волна и спектр", "uk": "Хвиля та спектр", "eng-ny": "Wave & spectrum", "eng-uk": "Wave & spectrum", "fr": "Onde et spectre", "jp": "波形とスペクトル", "sa": "الموجة والطيف", "cn": "波形与频谱", "kz": "Толқын мен спектр", "lt": "Banga ir spektras" };
const GOL_LABEL = { "ru-modern": "Игра «Жизнь»", "ru-classic": "Игра «Жизнь»", "uk": "Гра «Життя»", "eng-ny": "Game of Life", "eng-uk": "Game of Life", "fr": "Jeu de la vie", "jp": "ライフゲーム", "sa": "لعبة الحياة", "cn": "生命游戏", "kz": "«Өмір» ойыны", "lt": "Gyvybės žaidimas" };
const GOL_RATE = { "ru-modern": "шаг", "ru-classic": "шаг", "uk": "крок", "eng-ny": "step", "eng-uk": "step", "fr": "pas", "jp": "間隔", "sa": "الخطوة", "cn": "步长", "kz": "қадам", "lt": "žingsnis" };
const SNAP_LABEL = { "ru-modern": "снимок · только просмотр", "ru-classic": "снимок · только просмотр", "uk": "знімок · лише перегляд", "eng-ny": "snapshot · read-only", "eng-uk": "snapshot · read-only", "fr": "instantané · lecture seule", "jp": "スナップショット · 閲覧のみ", "sa": "لقطة · للعرض فقط", "cn": "快照 · 只读", "kz": "түсірілім · тек оқу", "lt": "momentinė kopija · tik peržiūra" };

// Conventional names for BPM ranges — universal music terms, kept untranslated (like the drum names).
// Genre/dance tempo + classical Italian tempo marking.
const GENRE = [[60, 69, "Downtempo"], [70, 84, "Hip-hop / Boom bap"], [85, 99, "Hip-hop"], [100, 109, "Trap / Half-time"], [110, 119, "Deep House"], [120, 124, "House"], [125, 129, "Techno"], [130, 139, "Trance / Hard"], [140, 149, "Dubstep / Trap"], [150, 159, "Hardcore"], [160, 179, "Drum & Bass"], [180, 200, "Footwork"], [201, 999, "Speedcore"]];
const TEMPO = [[0, 59, "Largo"], [60, 65, "Larghetto"], [66, 75, "Adagio"], [76, 107, "Andante"], [108, 119, "Moderato"], [120, 155, "Allegro"], [156, 167, "Vivace"], [168, 199, "Presto"], [200, 999, "Prestissimo"]];
function rangeName(table, b) { for (let i = 0; i < table.length; i++) if (b >= table[i][0] && b <= table[i][1]) return table[i][2]; return ""; }
function bpmName(b) { const g = rangeName(GENRE, b), t = rangeName(TEMPO, b); return g && t ? g + " · " + t : g || t; }
const SEC_NAMES = ["intro", "verse", "drop", "bridge", "build", "break", "outro", "fill"];
const defName = (i) => SEC_NAMES[i % SEC_NAMES.length];

// Genre starter beats — labels are universal genre names (untranslated). `on` lists active steps per drum.
const PRESETS = [
  { label: "Boom bap", bpm: 88, sections: [{ name: "loop", repeat: 4, on: { kick: [0, 10], snare: [4, 12], hihat: [2, 6, 10, 14], clap: [] } }] },
  { label: "Hip-hop", bpm: 92, sections: [
    { name: "verse", repeat: 4, on: { kick: [0, 8, 11], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], clap: [] } },
    { name: "hook", repeat: 2, on: { kick: [0, 6, 8, 11], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], clap: [4, 12] } },
  ] },
  { label: "House", bpm: 124, sections: [{ name: "groove", repeat: 4, on: { kick: [0, 4, 8, 12], snare: [], hihat: [2, 6, 10, 14], clap: [4, 12], bass: [0, 4, 8, 12] } }] },
  { label: "Techno", bpm: 128, sections: [{ name: "loop", repeat: 4, on: { kick: [0, 4, 8, 12], snare: [], hihat: [0, 2, 4, 6, 8, 10, 12, 14], clap: [4, 12], bass: [0, 4, 8, 12], synth: [2, 10] } }] },
  { label: "Trap", bpm: 140, sections: [{ name: "main", repeat: 4, on: { kick: [0, 6, 10], snare: [8], hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], clap: [8] } }] },
  { label: "Drum & Bass", bpm: 174, sections: [{ name: "break", repeat: 4, on: { kick: [0, 10], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14], clap: [], bass: [0, 8] } }] },
];
// Append a preset's style as new section(s) to the current storyline.
// While playing, sequence is rebuilt without resetting position, so the new
// style joins at the end of the current loop instead of restarting from the top.
function addPreset(p) {
  const room = MAX_SEC - sections.length;
  if (room <= 0) { flashStatus(SEC_FULL[lang]); return; }
  const start = sections.length;
  const newSecs = p.sections.map((s) => { const pat = emptyPattern(); INSTR.forEach((k) => (s.on[k] || []).forEach((i) => { if (i < STEPS) pat[k][i] = true; })); return { name: s.name, repeat: s.repeat, pattern: pat }; });
  sections = sections.concat(newSecs.slice(0, room));
  cur = start;            // focus the first added section
  if (playing) seq = buildSequence();  // keep seqPos: continue, don't restart
  sync();
}

const CL_LABELS = {
  "ru-modern": { version: "Версия", whats: "Что нового", arch: "Архитектура" }, "ru-classic": { version: "Версия", whats: "Что нового", arch: "Архитектура" },
  "uk": { version: "Версія", whats: "Що нового", arch: "Архітектура" }, "eng-ny": { version: "Version", whats: "What's new", arch: "Architecture" }, "eng-uk": { version: "Version", whats: "What's new", arch: "Architecture" },
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
  { v: "0.0.6", commit: "83b39b8", items: {
    "ru-modern": ["Сюжетные секции: интро, куплет, дроп — каждая со своим паттерном и повторами", "Ссылка теперь хранит и язык (?lang)"],
    "ru-classic": ["Секции с повторами", "Ссылка сохраняет язык (?lang)"], "uk": ["Секції з повторами", "Посилання зберігає мову (?lang)"],
    "eng-ny": ["Storyline sections — intro, verse, drop, each with its own pattern and repeats", "Share link now keeps the language (?lang)"],
    "fr": ["Sections (storyline) avec répétitions", "Le lien conserve la langue (?lang)"], "jp": ["ストーリー的セクション（反復つき）", "共有リンクに言語を保持（?lang）"],
    "sa": ["مقاطع متسلسلة مع تكرارات", "الرابط يحفظ اللغة (?lang)"], "cn": ["故事化段落（带重复）", "分享链接保留语言（?lang）"],
    "kz": ["Қайталаулары бар бөлімдер", "Сілтеме тілді сақтайды (?lang)"], "lt": ["Sekcijos su pakartojimais", "Nuoroda išsaugo kalbą (?lang)"],
  }, arch: {} },
  { v: "0.0.7", commit: "a30d24a", items: {
    "ru-modern": ["Имена у секций — intro, verse, drop или свои", "Подсказка стиля/темпа по BPM: Hip-hop, House, Techno… и Allegro, Andante"],
    "ru-classic": ["Названия секций", "Названия диапазонов BPM (жанр + темп)"], "uk": ["Назви секцій", "Назви діапазонів BPM (жанр + темп)"],
    "eng-ny": ["Name your sections — intro, verse, drop, whatever", "BPM range hint: Hip-hop, House, Techno… plus Allegro, Andante"],
    "fr": ["Noms de sections", "Indice de style/tempo selon le BPM"], "jp": ["セクション名（intro/verse/drop など）", "BPM帯の名称（ジャンル＋テンポ）"],
    "sa": ["تسمية المقاطع", "اسم نطاق BPM (النوع + الإيقاع)"], "cn": ["为段落命名", "BPM 区间名称（风格 + 速度）"],
    "kz": ["Бөлім атаулары", "BPM ауқымының атауы (жанр + темп)"], "lt": ["Sekcijų pavadinimai", "BPM diapazono pavadinimas (žanras + tempas)"],
  }, arch: {} },
  { v: "0.0.8", commit: "680689d", items: {
    "ru-modern": ["Жанровые пресеты: Boom bap, Hip-hop, House, Techno, Trap, Drum & Bass", "Добавлен британский английский"],
    "ru-classic": ["Пресеты по жанрам", "Британский английский"], "uk": ["Пресети за жанрами", "Британська англійська"],
    "eng-ny": ["Genre presets: Boom bap, Hip-hop, House, Techno, Trap, Drum & Bass", "Added British English"],
    "eng-uk": ["Genre presets — Boom bap, House, Techno, the lot", "Added British English (this one, innit)"],
    "fr": ["Préréglages par genre", "Ajout de l'anglais britannique"], "jp": ["ジャンル別プリセット", "イギリス英語を追加"],
    "sa": ["إعدادات مسبقة حسب النوع", "إضافة الإنجليزية البريطانية"], "cn": ["按风格的预设", "新增英式英语"],
    "kz": ["Жанр бойынша пресеттер", "Британдық ағылшын тілі қосылды"], "lt": ["Žanrų šablonai", "Pridėta britų anglų kalba"],
  }, arch: {} },
  { v: "0.0.9", commit: "f7eb03f", items: {
    "ru-modern": ["Слайдер версий теперь по-настоящему откатывает продукт: выбираешь версию — и видишь её дизайн и функционал (живой снимок из git-тега)", "Самую первую 0.0.1 можно открыть и потрогать"],
    "ru-classic": ["Слайдер версий загружает настоящий снимок выбранной версии", "Откат к первой версии 0.0.1"],
    "uk": ["Слайдер версій завантажує справжній знімок обраної версії", "Відкат до першої версії 0.0.1"],
    "eng-ny": ["The version slider now actually rolls the product back — pick a version, see its real design and features (live snapshot from the git tag)", "Even 0.0.1 is playable"],
    "eng-uk": ["The version slider properly rolls the whole thing back — design and features and all", "Have a go on the very first 0.0.1"],
    "fr": ["Le curseur de versions restaure réellement le produit (instantané réel du tag git)", "La toute première 0.0.1 est jouable"],
    "jp": ["バージョンスライダーが実際に製品をロールバック（gitタグの実スナップショット）", "最初の0.0.1も操作可能"],
    "sa": ["شريط الإصدارات يعيد المنتج فعليًا إلى الإصدار المختار (لقطة حقيقية من وسم git)", "حتى 0.0.1 قابل للتشغيل"],
    "cn": ["版本滑块现在会真正回滚产品（来自 git 标签的真实快照）", "连最初的 0.0.1 也能玩"],
    "kz": ["Нұсқа слайдері өнімді шынымен артқа қайтарады (git тегінен нақты түсірілім)", "Алғашқы 0.0.1 нұсқасын ашуға болады"],
    "lt": ["Versijų slankiklis dabar tikrai grąžina produktą (tikra momentinė kopija iš git žymos)", "Net 0.0.1 galima išbandyti"],
  }, arch: {
    "ru-modern": "Каждая версия сохранена в /versions/<v>/ из git-тега; слайдер грузит её в iframe.", "eng-ny": "Each release is frozen under /versions/<v>/ from its git tag; the slider loads it in an iframe.",
  } },
  { v: "0.0.10", commit: "6a497cf", items: {
    "ru-modern": ["174 BPM теперь читается как Presto (Drum & Bass)", "Подсказка темпа больше не «дёргает» BPM-слайдер при перетаскивании — разметка зафиксирована"],
    "ru-classic": ["174 BPM → Presto", "BPM-слайдер не прыгает от подсказки"], "uk": ["174 BPM → Presto", "BPM-повзунок не стрибає від підказки"],
    "eng-ny": ["174 BPM now reads Presto (Drum & Bass)", "BPM hint no longer makes the slider jump while you drag"],
    "eng-uk": ["174 BPM is Presto now (Drum & Bass)", "BPM hint stays put — the slider doesn't jump about"],
    "fr": ["174 BPM = Presto (Drum & Bass)", "L'indice BPM ne fait plus sauter le curseur"], "jp": ["174 BPMはPrestoに（Drum & Bass）", "BPMヒントでスライダーが動かないように"],
    "sa": ["174 BPM يصبح Presto (Drum & Bass)", "تلميح BPM لم يعد يحرّك المنزلق"], "cn": ["174 BPM 现在显示为 Presto（Drum & Bass）", "BPM 提示不再让滑块跳动"],
    "kz": ["174 BPM енді Presto (Drum & Bass)", "BPM кеңесі слайдерді секіртпейді"], "lt": ["174 BPM dabar Presto (Drum & Bass)", "BPM užuomina nebešokdina slankiklio"],
  }, arch: {} },
  { v: "0.0.11", commit: "4eef035", items: {
    "ru-modern": ["Слайдер версий больше не дёргает и не растягивает страницу: снимок грузится при отпускании, а окно версии теперь фиксированной высоты со своей прокруткой"],
    "ru-classic": ["Слайдер версий: убраны дёрганье и растяжение страницы"], "uk": ["Слайдер версій: прибрано смикання й розтягування сторінки"],
    "eng-ny": ["Version slider stops shaking the page — the snapshot loads on release, in a fixed-height frame with its own scroll"],
    "eng-uk": ["Version slider no longer jitters or stretches the page — loads on release, fixed-height frame"],
    "fr": ["Le curseur de versions ne secoue plus la page : chargement au relâchement, cadre à hauteur fixe"], "jp": ["バージョンスライダーで画面が揺れない：離した時に読み込み、固定高さの枠"],
    "sa": ["شريط الإصدارات لم يعد يهزّ الصفحة: يُحمّل عند الإفلات في إطار ثابت الارتفاع"], "cn": ["版本滑块不再抖动或撑大页面：松开时加载，固定高度带滚动"],
    "kz": ["Нұсқа слайдері бетті дірілдетпейді: жібергенде жүктеледі, биіктігі тұрақты терезе"], "lt": ["Versijų slankiklis nebepurto puslapio: įkeliama atleidus, fiksuoto aukščio rėmas"],
  }, arch: {} },
  { v: "0.0.12", commit: "57e0e41", items: {
    "ru-modern": ["Пресеты теперь добавляют стиль как новые секции к текущему стори-борду, а не заменяют всё", "Добавление во время игры не сбрасывает на начало — стиль входит в конце текущего цикла", "До 16 секций"],
    "ru-classic": ["Пресеты добавляются как секции (стопка стилей)", "Без рестарта при добавлении на лету", "До 16 секций"],
    "uk": ["Пресети додаються як секції", "Без рестарту при додаванні під час відтворення", "До 16 секцій"],
    "eng-ny": ["Presets now stack — each adds its style as new sections instead of wiping your arrangement", "Adding while playing doesn't restart — the new style drops in at the end of the loop", "Up to 16 sections"],
    "eng-uk": ["Presets stack on now — each adds a style as new sections", "Add one mid-play and it doesn't start over", "Up to 16 sections"],
    "fr": ["Les préréglages s'empilent : chacun ajoute son style en nouvelles sections", "Ajout en cours de lecture sans redémarrage", "Jusqu'à 16 sections"],
    "jp": ["プリセットは追加式に：スタイルを新しいセクションとして足す", "再生中に足しても最初に戻らない", "最大16セクション"],
    "sa": ["الإعدادات المسبقة تُضاف الآن كمقاطع جديدة بدل الاستبدال", "الإضافة أثناء التشغيل لا تعيد من البداية", "حتى 16 مقطعًا"],
    "cn": ["预设现在是叠加：把风格作为新段落加入", "播放中添加不会从头开始", "最多 16 段"],
    "kz": ["Пресеттер енді жаңа бөлім ретінде қосылады", "Ойнау кезінде қосқанда басынан бастамайды", "16 бөлімге дейін"],
    "lt": ["Šablonai dabar pridedami kaip naujos sekcijos", "Pridėjus grojant, neprasideda iš naujo", "Iki 16 sekcijų"],
  }, arch: {} },
  { v: "0.0.13", commit: "7731d17", items: {
    "ru-modern": ["Окно «Сейчас играет»: видно, какая секция звучит сейчас — имя, повтор и шаг, с пульсирующим индикатором", "Играющая секция подсвечивается во вкладках, отдельно от редактируемой"],
    "ru-classic": ["Индикатор «Сейчас играет» (секция, повтор, шаг)", "Подсветка играющей секции"], "uk": ["Вікно «Зараз грає» (секція, повтор, крок)", "Підсвічування секції, що грає"],
    "eng-ny": ["A 'Now playing' window — see which section is sounding right now (name, repeat, step), with a pulsing dot", "The playing section lights up in the tabs, separate from the one you're editing"],
    "eng-uk": ["A 'Now playing' panel — which section's going off right now", "The playing section lights up in the tabs"],
    "fr": ["Fenêtre « En lecture » (section, répétition, pas)", "La section en cours s'illumine dans les onglets"], "jp": ["「再生中」ウィンドウ（セクション・反復・ステップ）", "再生中のセクションをタブで強調"],
    "sa": ["نافذة «قيد التشغيل» (المقطع، التكرار، الخطوة)", "إبراز المقطع قيد التشغيل في التبويبات"], "cn": ["“正在播放”窗口（段落、重复、步）", "正在播放的段落在标签中高亮"],
    "kz": ["«Қазір ойнауда» терезесі (бөлім, қайталау, қадам)", "Ойнап жатқан бөлім қойындыларда ерекшеленеді"], "lt": ["„Dabar groja\" langas (sekcija, pakartojimas, žingsnis)", "Grojanti sekcija paryškinama skirtukuose"],
  }, arch: {} },
  { v: "0.0.14", commit: "5ab7956", items: {
    "ru-modern": ["Два новых инструмента: Бас (низкий тон) и Синт (пилообразный плак с фильтром)", "Бас и синт работают в сетке, пресетах, экспорте WAV и ссылках"],
    "ru-classic": ["Новые инструменты: Бас и Синт"], "uk": ["Нові інструменти: Бас і Синт"],
    "eng-ny": ["Two new instruments: Bass (low tone) and Synth (filtered saw pluck)", "Bass/Synth work in the grid, presets, WAV export and share links"],
    "eng-uk": ["Two new instruments — Bass and Synth"], "fr": ["Deux nouveaux instruments : Basse et Synth"], "jp": ["新しい楽器：ベースとシンセ"],
    "sa": ["آلتان جديدتان: باس وسينث"], "cn": ["两件新乐器：贝斯和合成器"], "kz": ["Екі жаңа аспап: Бас және Синт"], "lt": ["Du nauji instrumentai: Bosas ir Sintezatorius"],
  }, arch: {} },
  { v: "0.0.15", commit: "7b37dbf", items: {
    "ru-modern": ["Переключение версий больше не лагает: каждый снимок грузится один раз в кэшированный iframe и дальше просто показывается; соседние версии прогреваются заранее"],
    "ru-classic": ["Быстрое переключение версий (кэш iframe)"], "uk": ["Швидке перемикання версій (кеш iframe)"],
    "eng-ny": ["Version switching no longer lags — each snapshot loads once into a cached iframe and is just shown after that; neighbours are pre-warmed"],
    "eng-uk": ["Version switching's smooth now — snapshots are cached, not reloaded each time"],
    "fr": ["Changement de version sans lag : chaque instantané est mis en cache puis simplement affiché"], "jp": ["バージョン切替が軽快に：スナップショットはキャッシュして再読み込みしない"],
    "sa": ["تبديل الإصدارات بلا تأخير: تُحمّل اللقطة مرة واحدة ثم تُعرض فقط"], "cn": ["版本切换不再卡顿：快照只加载一次并缓存，之后仅显示"],
    "kz": ["Нұсқаны ауыстыру кідірмейді: әр түсірілім бір рет жүктеліп, кэште сақталады"], "lt": ["Versijų perjungimas nebevėluoja: kiekviena kopija įkeliama vieną kartą ir kešuojama"],
  }, arch: {
    "ru-modern": "Пул кэшированных iframe вместо перезагрузки src на каждое переключение.", "eng-ny": "Cached iframe pool instead of reloading src on every switch.",
  } },
  { v: "0.0.16", commit: "87c6b01", items: {
    "ru-modern": ["Ползунок версий вынесен на отдельную строку во всю ширину — он больше не меняет длину и не «прыгает» при перетаскивании (версия, коммит и снимок теперь под ним)"],
    "ru-classic": ["Ползунок версий фиксированной ширины — не дёргается"], "uk": ["Повзунок версій на окремому рядку, фіксованої ширини — більше не смикається"],
    "eng-ny": ["Version slider moved to its own full-width row — it no longer resizes or jumps while you drag (version/commit/snapshot now sit below it)"],
    "eng-uk": ["Version slider's on its own full-width row now — no more resizing or jumping"],
    "fr": ["Curseur de versions sur sa propre ligne pleine largeur — il ne change plus de taille ni ne saute"], "jp": ["バージョンスライダーを全幅の独立行に — 幅が変わらず、ドラッグ中に跳ねない"],
    "sa": ["نُقل شريط الإصدارات إلى سطر مستقل بعرض كامل — لم يعد يتغير حجمه أو يقفز"], "cn": ["版本滑块移到单独的整行 — 拖动时不再改变长度或跳动"],
    "kz": ["Нұсқа слайдері бөлек жолға, толық еніне — енді өлшемі өзгермейді, секірмейді"], "lt": ["Versijų slankiklis perkeltas į atskirą viso pločio eilutę — nebekeičia dydžio ir nebešokinėja"],
  }, arch: {} },
  { v: "0.0.17", commit: "05c0213", items: {
    "ru-modern": ["Живая визуализация звука во время игры: форма волны (осциллограф) и спектр частот", "Весь звук идёт через анализатор (AnalyserNode)"],
    "ru-classic": ["Осциллограф и спектр воспроизведения"], "uk": ["Осцилограф і спектр відтворення"],
    "eng-ny": ["Live audio visuals while it plays: the waveform (scope) and the frequency spectrum", "Everything routes through an AnalyserNode"],
    "eng-uk": ["Live waveform + spectrum while it plays"], "fr": ["Visualisation en direct : forme d'onde et spectre"], "jp": ["再生中のライブ表示：波形とスペクトル"],
    "sa": ["عرض حي أثناء التشغيل: الموجة والطيف"], "cn": ["播放时实时显示：波形与频谱"], "kz": ["Ойнау кезінде тірі визуализация: толқын мен спектр"], "lt": ["Gyva vizualizacija grojant: banga ir spektras"],
  }, arch: {} },
  { v: "0.1.0", commit: "3df04e2", items: {
    "ru-modern": ["«Игра Жизнь»: поле превращается в клеточный автомат Конвея (тор 6×16) — бит эволюционирует вживую во время игры", "Шаг эволюции от 1/16 до 64/16; кнопки «шаг» и «случайный посев» 🎲", "Веха-релиз 0.1.0 — нативные сборки уедут на 0.1.x"],
    "ru-classic": ["Режим «Игра Жизнь» (клеточный автомат) для сетки", "Шаг 1/16…64/16, ручной шаг и посев"],
    "uk": ["Режим «Гра Життя» (клітинний автомат) для сітки", "Крок 1/16…64/16, ручний крок і посів"],
    "eng-ny": ["Game of Life: the grid becomes a Conway cellular automaton (6×16 torus) and the beat mutates live as it plays", "Evolution step from 1/16 to 64/16; 'step' and 'random seed' 🎲 buttons", "The 0.1.0 milestone — native builds move to 0.1.x"],
    "eng-uk": ["Game of Life mode — the grid runs Conway's Life and the beat evolves while it plays", "Step from 1/16 to 64/16, manual step + random seed"],
    "fr": ["Mode Jeu de la vie : la grille devient un automate cellulaire (tore 6×16)", "Pas d'évolution de 1/16 à 64/16 ; boutons pas et graine aléatoire"],
    "jp": ["ライフゲーム・モード：グリッドがコンウェイのセルオートマトン（6×16トーラス）に", "進化間隔 1/16〜64/16、手動ステップとランダム種"],
    "sa": ["وضع لعبة الحياة: تتحول الشبكة إلى خلية أوتوماتية (حلقة 6×16)", "خطوة التطور من 1/16 إلى 64/16، خطوة يدوية وبذرة عشوائية"],
    "cn": ["生命游戏模式：网格变为康威元胞自动机（6×16 环面）", "演化步长 1/16 至 64/16；单步与随机播种"],
    "kz": ["«Өмір» ойыны режимі: тор Конвей клеткалық автоматына айналады (6×16 тор)", "Эволюция қадамы 1/16-дан 64/16-ға дейін; қадам және кездейсоқ себу"],
    "lt": ["Gyvybės žaidimo režimas: tinklelis tampa Konvėjaus ląsteliniu automatu (6×16 toras)", "Evoliucijos žingsnis nuo 1/16 iki 64/16; rankinis žingsnis ir sėjimas"],
  }, arch: {
    "ru-modern": "Правила B3/S23 на торе INSTR×STEPS; эволюция в tick() на границе шага.", "eng-ny": "B3/S23 on an INSTR×STEPS torus; evolves in tick() at the step boundary.",
  } },
  { v: "0.1.1", commit: "4c65f80", items: {
    "ru-modern": ["Исправлено: при «Стоп» осциллограф и спектр больше не застывают на последнем кадре — отложенный кадр анимации гасится флагом scopeOn"],
    "ru-classic": ["Фикс: визуализация не зависает при стопе"], "uk": ["Фікс: візуалізація не зависає при стопі"],
    "eng-ny": ["Fixed: on Stop the scope and spectrum no longer freeze on the last frame (a stray animation frame could redraw over the reset)"],
    "eng-uk": ["Fixed: the scope no longer freezes when you hit Stop"],
    "fr": ["Corrigé : à l'arrêt, l'oscilloscope et le spectre ne se figent plus"], "jp": ["修正：停止時に波形とスペクトルが固まらないように"],
    "sa": ["إصلاح: عند الإيقاف لم يعد العرض يتجمد على آخر إطار"], "cn": ["修复：停止时波形与频谱不再卡在最后一帧"],
    "kz": ["Түзету: «Тоқтату» кезінде визуализация қатып қалмайды"], "lt": ["Pataisa: sustabdžius, vizualizacija nebeužstringa"],
  }, arch: {} },
  { v: "0.1.2", commit: "255f4ea", items: {
    "ru-modern": ["Галочка «Игра Жизнь» теперь применяется к конкретной секции, а не ко всему треку — у каждой секции свой режим", "GoL-секции помечены 🧬 во вкладках"],
    "ru-classic": ["«Игра Жизнь» — флаг на каждую секцию отдельно", "Метка 🧬 на вкладках"], "uk": ["«Гра Життя» — прапорець на кожну секцію окремо", "Позначка 🧬 на вкладках"],
    "eng-ny": ["The Game of Life toggle now applies per section, not to the whole track — each section has its own mode", "GoL sections are tagged 🧬 in the tabs"],
    "eng-uk": ["Game of Life is now per-section", "GoL sections tagged 🧬 in the tabs"],
    "fr": ["Le Jeu de la vie s'applique par section", "Sections GoL marquées 🧬"], "jp": ["ライフゲームはセクションごとに適用", "GoLセクションを🧬で表示"],
    "sa": ["لعبة الحياة تُطبّق لكل مقطع على حدة", "مقاطع GoL موسومة بـ🧬"], "cn": ["生命游戏改为按段落生效", "GoL 段落用🧬标记"],
    "kz": ["«Өмір» ойыны әр бөлімге бөлек қолданылады", "GoL бөлімдері 🧬 белгісімен"], "lt": ["Gyvybės žaidimas taikomas kiekvienai sekcijai atskirai", "GoL sekcijos pažymėtos 🧬"],
  }, arch: {} },
  { v: "0.1.3", commit: "7542ba8", items: {
    "ru-modern": ["Экспорт в WAV, MP3 и FLAC (клиентски: lamejs + libflac wasm)", "Множитель длины ×1…×100 — очень длинный трек одной кнопкой; GoL-секции при экспорте эволюционируют", "Название трека + метаданные (title, комментарий-ссылка juri-konoplev.pro/bit8maker) в WAV/MP3"],
    "ru-classic": ["Экспорт WAV/MP3/FLAC", "Множитель повторов ×1…×100", "Название трека и метаданные"],
    "uk": ["Експорт WAV/MP3/FLAC", "Множник повторів ×1…×100", "Назва треку та метадані"],
    "eng-ny": ["Export to WAV, MP3 and FLAC (client-side: lamejs + libflac wasm)", "Length multiplier ×1…×100 — a very long track in one click; GoL sections evolve through the export", "Track name + metadata (title, comment link juri-konoplev.pro/bit8maker) in WAV/MP3"],
    "eng-uk": ["Export to WAV/MP3/FLAC, ×1…×100 length multiplier, track name + metadata"],
    "fr": ["Export WAV/MP3/FLAC", "Multiplicateur ×1…×100", "Nom de piste + métadonnées"],
    "jp": ["WAV/MP3/FLAC書き出し", "長さ倍率 ×1…×100", "トラック名とメタデータ"],
    "sa": ["تصدير WAV/MP3/FLAC", "مضاعف الطول ×1…×100", "اسم المقطع والبيانات الوصفية"],
    "cn": ["导出 WAV/MP3/FLAC", "长度倍数 ×1…×100", "曲目名称与元数据"],
    "kz": ["WAV/MP3/FLAC экспорты", "Ұзындық көбейткіші ×1…×100", "Трек атауы мен метадеректер"],
    "lt": ["Eksportas į WAV/MP3/FLAC", "Ilgio daugiklis ×1…×100", "Takelio pavadinimas ir metaduomenys"],
  }, arch: {
    "ru-modern": "OfflineAudioContext рендерит ×N проходов; кодирование lamejs (MP3, +ID3v2) и libflac (нативный FLAC).", "eng-ny": "OfflineAudioContext renders ×N passes; encoded via lamejs (MP3, +ID3v2) and libflac (native FLAC).",
  } },
  { v: "0.1.4", commit: "ea94970", items: {
    "ru-modern": ["Выбор качества MP3 — битрейт 128 / 192 / 256 / 320 kbps (активен, когда формат MP3)"],
    "ru-classic": ["Выбор битрейта MP3 (128–320 kbps)"], "uk": ["Вибір бітрейту MP3 (128–320 kbps)"],
    "eng-ny": ["MP3 quality selector — 128 / 192 / 256 / 320 kbps (enabled when the format is MP3)"],
    "eng-uk": ["Pick your MP3 bitrate (128–320 kbps)"], "fr": ["Choix du débit MP3 (128–320 kbps)"], "jp": ["MP3ビットレート選択（128〜320 kbps）"],
    "sa": ["اختيار جودة MP3 (128–320 kbps)"], "cn": ["MP3 音质选择（128–320 kbps）"], "kz": ["MP3 сапасын таңдау (128–320 kbps)"], "lt": ["MP3 bitų dažnio pasirinkimas (128–320 kbps)"],
  }, arch: {} },
  { v: "0.1.5", commit: "5c6cf1d", items: {
    "ru-modern": ["При игре кнопка превращается в «Пауза» + «Стоп»: пауза замирает на месте и продолжает с той же точки, стоп сбрасывает в начало", "Пауза через ctx.suspend() — позиция и звук замирают точно"],
    "ru-classic": ["Пауза и Стоп раздельно (пауза продолжает с места)"], "uk": ["Окремі Пауза і Стоп (пауза продовжує з місця)"],
    "eng-ny": ["While playing the button splits into Pause + Stop: pause freezes in place and resumes from the same spot, stop resets to the start", "Pause uses ctx.suspend() so the position and audio hold exactly"],
    "eng-uk": ["Play splits into Pause + Stop; pause resumes from where you left off"],
    "fr": ["Pause + Stop séparés (la pause reprend au même endroit)"], "jp": ["再生中はボタンが「一時停止」＋「停止」に（一時停止は同じ位置から再開）"],
    "sa": ["أثناء التشغيل يصبح الزر إيقاف مؤقت + إيقاف (الإيقاف المؤقت يستأنف من نفس المكان)"], "cn": ["播放时按钮分为暂停+停止（暂停可从原处继续）"],
    "kz": ["Ойнау кезінде батырма «Кідірту» + «Тоқтату» болады (кідірту сол жерден жалғасады)"], "lt": ["Grojant mygtukas tampa Pauzė + Stop (pauzė tęsia iš tos pačios vietos)"],
  }, arch: {} },
  { v: "0.1.6", commit: "5038c84", items: {
    "ru-modern": ["Экспорт в MIDI (.mid) — стандартный файл, открывается в любой DAW", "Каждый инструмент → своя GM-нота (Kick 36, Snare 38, Hat F#1, Clap 39, Бас A1, Синт E4); учитывается темп, множитель длины и эволюция GoL"],
    "ru-classic": ["MIDI-экспорт (.mid)"], "uk": ["MIDI-експорт (.mid)"],
    "eng-ny": ["MIDI export (.mid) — a standard file any DAW opens", "Each instrument maps to a GM note (Kick 36, Snare 38, Hat F#1, Clap 39, Bass A1, Synth E4); tempo, length multiplier and GoL evolution included"],
    "eng-uk": ["MIDI export (.mid) — opens in any DAW"], "fr": ["Export MIDI (.mid)"], "jp": ["MIDI書き出し（.mid）"],
    "sa": ["تصدير MIDI (.mid)"], "cn": ["MIDI 导出（.mid）"], "kz": ["MIDI экспорты (.mid)"], "lt": ["MIDI eksportas (.mid)"],
  }, arch: {} },
  { v: "0.1.7", commit: "eb64a0f", items: {
    "ru-modern": ["Инструменты можно перетаскивать за подпись и менять местами — порядок строк запоминается", "«Игра Жизнь» считает соседство по видимому порядку строк"],
    "ru-classic": ["Перетаскивание инструментов (смена порядка строк)"], "uk": ["Перетягування інструментів (зміна порядку рядків)"],
    "eng-ny": ["Drag instruments by their label to reorder the rows (the order is remembered)", "Game of Life uses the visible row order for adjacency"],
    "eng-uk": ["Drag instrument rows by the label to reorder them"], "fr": ["Réordonner les instruments par glisser-déposer"], "jp": ["ラベルをドラッグして楽器の並びを変更"],
    "sa": ["إعادة ترتيب الآلات بالسحب من التسمية"], "cn": ["拖动乐器标签重新排序"], "kz": ["Аспаптарды жапсырмасынан сүйреп ретін өзгерту"], "lt": ["Instrumentų pertvarkymas tempiant už pavadinimo"],
  }, arch: {} },
  { v: "0.1.8", commit: "815443c", items: {
    "ru-modern": ["Кнопка «Запись» (⏺): пишет живой звук в реальном времени — со всеми правками, эволюцией GoL и паузами; на стопе кодирует в выбранный формат (WAV/MP3/FLAC) и скачивает «<имя>-rec»"],
    "ru-classic": ["Живая запись (Rec) в файл"], "uk": ["Живий запис (Rec) у файл"],
    "eng-ny": ["Rec button (⏺): captures the live output in real time — with your edits, GoL evolution and pauses; on stop it encodes to the chosen format (WAV/MP3/FLAC) and downloads <name>-rec"],
    "eng-uk": ["Rec button — capture the live output to a file"], "fr": ["Bouton Rec — enregistre la sortie en direct"], "jp": ["録音ボタン：ライブ出力をそのまま録音"],
    "sa": ["زر التسجيل: يسجّل الخرج الحي مباشرة"], "cn": ["录制按钮：实时录制现场输出"], "kz": ["Жазу батырмасы: тірі шығысты жазады"], "lt": ["Įrašymo mygtukas — įrašo gyvą išvestį"],
  }, arch: {} },
  { v: "0.1.9", commit: "f886a0f", items: {
    "ru-modern": ["«Повторы» секции теперь применяются на лету: меняешь во время игры — и со следующего цикла секция звучит нужное число раз (раньше эффект был только после перезапуска)", "Если секция одна, повтор не слышен (луп бесконечный); разница слышна между несколькими секциями"],
    "ru-classic": ["«Повторы» секции применяются во время игры"], "uk": ["«Повтори» секції застосовуються під час гри"],
    "eng-ny": ["Section 'Repeats' now applies live — change it while playing and the section loops the new number of times from the next cycle (previously it only took effect after a restart)", "With a single section the repeat is inaudible (it loops forever anyway); the difference shows across multiple sections"],
    "eng-uk": ["Section repeats now apply live while playing"], "fr": ["Les « répétitions » de section s'appliquent en direct"], "jp": ["セクションの「反復」が再生中に即反映"],
    "sa": ["«تكرار» المقطع يُطبّق أثناء التشغيل"], "cn": ["段落“重复”现在实时生效"], "kz": ["Бөлімнің «Қайталауы» ойнау кезінде қолданылады"], "lt": ["Sekcijos pakartojimai taikomi grojant"],
  }, arch: {} },
  { v: "0.1.10", commit: "e268991", items: {
    "ru-modern": ["Нативные сборки: GitHub Actions по тегу собирает десктоп-приложение (Electron) — Windows .exe (установщик) и Linux .deb + .tar.gz — и кладёт их в Releases", "Тот же клиентский код, обёрнутый electron-main.js; dmg пока не делаем"],
    "ru-classic": ["Нативные сборки exe/deb/tar.gz через GitHub Actions"], "uk": ["Нативні збірки exe/deb/tar.gz через GitHub Actions"],
    "eng-ny": ["Native builds: a GitHub Actions release workflow packages a desktop app (Electron) on tag — Windows .exe installer and Linux .deb + .tar.gz — attached to the Release", "Same client-side code, wrapped by electron-main.js; dmg skipped for now"],
    "eng-uk": ["Native builds — exe/deb/tar.gz via GitHub Actions (Electron)"], "fr": ["Builds natifs exe/deb/tar.gz via GitHub Actions (Electron)"], "jp": ["ネイティブビルド exe/deb/tar.gz（GitHub Actions + Electron）"],
    "sa": ["حزم أصلية exe/deb/tar.gz عبر GitHub Actions"], "cn": ["原生构建 exe/deb/tar.gz（GitHub Actions + Electron）"], "kz": ["Нативті құрастыру exe/deb/tar.gz (GitHub Actions)"], "lt": ["Natyvūs paketai exe/deb/tar.gz per GitHub Actions"],
  }, arch: {
    "ru-modern": "Electron-обёртка (webSecurity:false для fetch wasm из file://); electron-builder targets win:nsis, linux:[deb,tar.gz]; матрица windows/ubuntu.", "eng-ny": "Electron wrapper (webSecurity:false so wasm fetch works over file://); electron-builder targets win:nsis, linux:[deb,tar.gz]; windows/ubuntu matrix.",
  } },
  { v: "0.1.11", commit: "—", items: {
    "ru-modern": ["Починка релизного CI: загрузка бинарников больше не зависит от стороннего action — использую встроенный gh CLI, релиз создаётся и exe/deb/tar.gz прикладываются", "Раньше джобы падали на «Set up job» (0 шагов) — вероятно, сторонний action был запрещён политикой репозитория"],
    "ru-classic": ["Фикс релиза GitHub Actions (gh CLI вместо стороннего action)"], "uk": ["Фікс релізного CI (gh CLI замість стороннього action)"],
    "eng-ny": ["Fixed the release CI: binary upload no longer needs a third-party action — uses the built-in gh CLI, so the Release is created and exe/deb/tar.gz attach", "The jobs were failing at 'Set up job' (0 steps) — a sign the third-party action was blocked by repo policy"],
    "eng-uk": ["Fixed the release workflow (gh CLI instead of a third-party action)"], "fr": ["Correction du CI de release (gh CLI au lieu d'une action tierce)"], "jp": ["リリースCIの修正（サードパーティactionをやめgh CLIに）"],
    "sa": ["إصلاح CI الإصدار (gh CLI بدل إجراء طرف ثالث)"], "cn": ["修复发布 CI（改用内置 gh CLI，不再依赖第三方 action）"], "kz": ["Релиз CI түзетілді (сыртқы action орнына gh CLI)"], "lt": ["Pataisytas leidimo CI (gh CLI vietoj treciosios salies action)"],
  }, arch: {} },
];

// ---- language (URL ?lang overrides stored) ----
const urlLang = new URLSearchParams(location.search).get("lang");
let lang = (STRINGS[urlLang] ? urlLang : null) || localStorage.getItem("b8_lang");
if (!STRINGS[lang]) lang = "eng-ny";
let clIndex = CHANGELOG.length - 1;

// ---- state: sections ----
function emptyPattern() { const p = {}; INSTR.forEach((k) => (p[k] = new Array(STEPS).fill(false))); return p; }
function demo1() { const p = emptyPattern(); [0, 4, 8, 12].forEach((i) => (p.kick[i] = true)); [2, 6, 10, 14].forEach((i) => (p.hihat[i] = true)); [4, 12].forEach((i) => (p.snare[i] = true)); [0, 8].forEach((i) => (p.bass[i] = true)); return p; }
function demo2() { const p = emptyPattern(); [0, 2, 4, 6, 8, 10, 12, 14].forEach((i) => (p.kick[i] = true)); for (let i = 0; i < 16; i++) p.hihat[i] = true; [4, 12].forEach((i) => (p.snare[i] = true)); [7, 15].forEach((i) => (p.clap[i] = true)); [0, 4, 8, 12].forEach((i) => (p.bass[i] = true)); [2, 6, 10, 14].forEach((i) => (p.synth[i] = true)); return p; }
let sections = [{ name: "intro", pattern: demo1(), repeat: 2 }, { name: "drop", pattern: demo2(), repeat: 2 }];
let cur = 0;

const DEF_VOL = { kick: 0.9, snare: 0.8, hihat: 0.6, clap: 0.7, bass: 0.8, synth: 0.5 };
const volumes = Object.assign({}, DEF_VOL, JSON.parse(localStorage.getItem("b8_vol") || "{}"));
function saveVol() { localStorage.setItem("b8_vol", JSON.stringify(volumes)); }
let order = INSTR.slice(); // display order of instrument rows (data stays keyed by name)
(() => { try { const s = JSON.parse(localStorage.getItem("b8_order") || "null"); if (Array.isArray(s) && s.length === INSTR.length && INSTR.every((k) => s.includes(k))) order = s; } catch (e) {} })();
function saveOrder() { localStorage.setItem("b8_order", JSON.stringify(order)); }
function reorder(from, to) { if (!from || from === to) return; const a = order.filter((x) => x !== from); a.splice(a.indexOf(to), 0, from); order = a; saveOrder(); renderGrid(); }
let dragKey = null;

let bpm = 100;
let ctx = null, analyser = null, bus = null, rafId = null, waveBuf = null, freqBuf = null, scopeOn = false;
let recNode = null, recChunks = [], recLen = 0, recording = false, recSr = 0; // live recording (tap the bus)
const out = () => bus || ctx.destination; // voices route through the analyser bus when live
function ensureCtx() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = ctx.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.8;
  bus = ctx.createGain(); bus.connect(analyser); analyser.connect(ctx.destination);
}
let playing = false, paused = false, nextNoteTime = 0, timer = null;
let seq = [], seqPos = 0, playingSec = -1;
let golStep = 16, golTick = 0; // Game of Life: per-section flag (sec.gol); evolve every golStep 16ths
const $ = (id) => document.getElementById(id);

// ---- synthesis ----
function noise(dur) { const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
function kick(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.18); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g).connect(out()); o.start(t); o.stop(t + 0.31); }
function snare(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.2); const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400; const g = ctx.createGain(); g.gain.setValueAtTime(0.7 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); s.connect(f).connect(g).connect(out()); s.start(t); s.stop(t + 0.2); const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "triangle"; o.frequency.value = 180; og.gain.setValueAtTime(0.4 * v, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(og).connect(out()); o.start(t); o.stop(t + 0.15); }
function hihat(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.06); const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; const g = ctx.createGain(); g.gain.setValueAtTime(0.4 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06); s.connect(f).connect(g).connect(out()); s.start(t); s.stop(t + 0.06); }
function clap(t, v) { const s = ctx.createBufferSource(); s.buffer = noise(0.18); const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; const g = ctx.createGain(); g.gain.setValueAtTime(0.7 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); s.connect(f).connect(g).connect(out()); s.start(t); s.stop(t + 0.18); }
function bass(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(55, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.95 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.32); o.connect(g).connect(out()); o.start(t); o.stop(t + 0.34); }
function synth(t, v) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = "sawtooth"; o.frequency.setValueAtTime(330, t); f.type = "lowpass"; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(600, t + 0.2); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o.connect(f).connect(g).connect(out()); o.start(t); o.stop(t + 0.27); }
const VOICES = { kick, snare, hihat, clap, bass, synth };

// ---- sequence + scheduler ----
function buildSequence() {
  const s = [];
  sections.forEach((sec, si) => { for (let r = 0; r < sec.repeat; r++) for (let st = 0; st < STEPS; st++) s.push([sec.pattern, st, si, r + 1, sec.repeat]); });
  return s.length ? s : [[sections[0].pattern, 0, 0, 1, 1]];
}
// Conway's Life (B3/S23) on a toroidal INSTR×STEPS grid — the pattern IS the board.
function lifeStep(pat) {
  const R = order.length, C = STEPS, grid = order.map((k) => pat[k]);
  const next = order.map(() => new Array(C).fill(false));
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      if (grid[(r + dr + R) % R][(c + dc + C) % C]) n++;
    }
    next[r][c] = grid[r][c] ? (n === 2 || n === 3) : (n === 3);
  }
  order.forEach((k, r) => { for (let c = 0; c < C; c++) pat[k][c] = next[r][c]; });
}
// cell = [pattern, step, sectionIndex, repeatNum, repeatTotal]
function tick(cell) {
  if (golTick > 0 && golTick % golStep === 0 && sections[cell[2]].gol) {
    lifeStep(sections[cell[2]].pattern); if (cell[2] === cur) renderGrid();
  }
  golTick++;
  highlight(cell[1]);
  setPlayingSection(cell[2]);
  const sec = sections[cell[2]];
  $("np-info").textContent = (sec ? sec.name || "—" : "—") + " · " + cell[3] + "/" + cell[4] + " · " + (cell[1] + 1) + "/" + STEPS;
}
function setPlayingSection(si) {
  if (si === playingSec) return;
  playingSec = si;
  const tabs = $("tabs").children;
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.toggle("playing", i === si);
}
function scheduler() {
  while (nextNoteTime < ctx.currentTime + 0.1) {
    const cell = seq[seqPos], pat = cell[0], st = cell[1];
    INSTR.forEach((k) => { if (pat[k][st]) VOICES[k](nextNoteTime, volumes[k]); });
    const dt = (nextNoteTime - ctx.currentTime) * 1000;
    setTimeout(() => tick(cell), Math.max(0, dt));
    seqPos = (seqPos + 1) % seq.length;
    nextNoteTime += (60 / bpm) / 4;
  }
  timer = setTimeout(scheduler, 25);
}
function play() {
  ensureCtx();
  ctx.resume();
  playing = true; paused = false; seq = buildSequence(); seqPos = 0; golTick = 0; nextNoteTime = ctx.currentTime + 0.06;
  $("now-playing").classList.add("live");
  scheduler(); startScope(); updateTransport();
}
function pause() {
  if (!playing) return;
  playing = false; paused = true; clearTimeout(timer);
  if (ctx) ctx.suspend(); // freeze the clock: position + already-scheduled audio hold
  $("now-playing").classList.remove("live");
  stopScope(); updateTransport();
}
function resume() {
  if (!paused) return;
  paused = false; playing = true;
  if (ctx) ctx.resume();
  $("now-playing").classList.add("live");
  scheduler(); startScope(); updateTransport();
}
function stop() {
  playing = false; paused = false; clearTimeout(timer); clearHighlight(); updateTransport();
  if (ctx && ctx.state === "suspended") ctx.resume(); // don't leave the context stuck suspended
  playingSec = -1;
  const tabs = $("tabs").children; for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove("playing");
  $("now-playing").classList.remove("live");
  $("np-info").textContent = "—";
  stopScope();
}
// ---- waveform + spectrum visualiser (AnalyserNode) ----
function fitCanvas(cv) { const w = cv.clientWidth | 0, h = cv.clientHeight | 0; if (w && cv.width !== w) cv.width = w; if (h && cv.height !== h) cv.height = h; }
function drawScope(flat) {
  if (!analyser) return;
  if (!waveBuf) { waveBuf = new Uint8Array(analyser.fftSize); freqBuf = new Uint8Array(analyser.frequencyBinCount); }
  const wave = $("wave"); fitCanvas(wave);
  const wc = wave.getContext("2d"), W = wave.width, H = wave.height;
  wc.clearRect(0, 0, W, H); wc.lineWidth = 2; wc.strokeStyle = "#5aa6da"; wc.beginPath();
  if (flat) { wc.moveTo(0, H / 2); wc.lineTo(W, H / 2); }
  else {
    analyser.getByteTimeDomainData(waveBuf);
    const step = waveBuf.length / W;
    for (let x = 0; x < W; x++) { const y = H / 2 + (waveBuf[(x * step) | 0] / 128 - 1) * H * 0.45; x ? wc.lineTo(x, y) : wc.moveTo(x, y); }
  }
  wc.stroke();
  const spec = $("spectrum"); fitCanvas(spec);
  const sc = spec.getContext("2d"), SW = spec.width, SH = spec.height;
  sc.clearRect(0, 0, SW, SH);
  if (!flat) {
    analyser.getByteFrequencyData(freqBuf);
    const use = (freqBuf.length * 0.7) | 0, bw = SW / use;
    for (let i = 0; i < use; i++) { const v = freqBuf[i] / 255, h = v * SH; sc.fillStyle = "rgba(38,125,183," + (0.35 + v * 0.65) + ")"; sc.fillRect(i * bw, SH - h, Math.max(1, bw - 1), h); }
  }
  if (!flat) rafId = requestAnimationFrame(() => { if (scopeOn) drawScope(); });
}
function startScope() { scopeOn = true; if (rafId) cancelAnimationFrame(rafId); drawScope(); }
function stopScope() { scopeOn = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; drawScope(true); }

// ---- export: WAV / MP3 / FLAC, repeat multiplier, metadata ----
const META_URL = "https://juri-konoplev.pro/bit8maker/";
const _cat = (...a) => { let n = 0; a.forEach((x) => (n += x.length)); const o = new Uint8Array(n); let p = 0; a.forEach((x) => { o.set(x, p); p += x.length; }); return o; };
const _scripts = {};
function loadScript(src) {
  if (!_scripts[src]) _scripts[src] = new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("load " + src)); document.head.appendChild(s); });
  return _scripts[src];
}
let _flac = null;
function loadFlac() {
  if (!_flac) _flac = loadScript("lib/libflac.wasm.js").then(() => new Promise((res) => { const F = window.Flac, chk = () => (F.isReady && F.isReady() ? res(F) : setTimeout(chk, 30)); F.on ? F.on("ready", () => res(F)) : chk(); }));
  return _flac;
}
function floatTo16(ch) { const n = ch.length, o = new Int16Array(n); for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, ch[i])); o[i] = x < 0 ? x * 0x8000 : x * 0x7fff; } return o; }
function wavInfoChunk(meta) {
  const te = new TextEncoder(), parts = [];
  [["INAM", meta.title], ["ICMT", meta.comment], ["ISFT", meta.software]].filter((f) => f[1]).forEach(([id, val]) => {
    let d = te.encode(val + "\0"); if (d.length % 2) d = _cat(d, new Uint8Array(1));
    const h = new Uint8Array(8); for (let i = 0; i < 4; i++) h[i] = id.charCodeAt(i); new DataView(h.buffer).setUint32(4, d.length, true);
    parts.push(h, d);
  });
  const info = _cat(new Uint8Array([73, 78, 70, 79]), ...parts); // "INFO"
  const head = new Uint8Array(8); head.set([76, 73, 83, 84]); new DataView(head.buffer).setUint32(4, info.length, true); // "LIST"
  return _cat(head, info);
}
function encodeWAV(audioBuf, meta) {
  const ch = audioBuf.getChannelData(0), n = ch.length, sr = audioBuf.sampleRate, dataLen = n * 2;
  const info = meta ? wavInfoChunk(meta) : new Uint8Array(0);
  const ab = new ArrayBuffer(44 + dataLen + info.length), v = new DataView(ab);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + dataLen + info.length, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, dataLen, true);
  let o = 44; for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, ch[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); o += 2; }
  if (info.length) new Uint8Array(ab).set(info, 44 + dataLen);
  return ab;
}
function id3v2(meta) {
  const te = new TextEncoder();
  const frame = (id, body) => { const h = new Uint8Array(10); for (let i = 0; i < 4; i++) h[i] = id.charCodeAt(i); const s = body.length; h[4] = (s >>> 24) & 255; h[5] = (s >>> 16) & 255; h[6] = (s >>> 8) & 255; h[7] = s & 255; return _cat(h, body); };
  const txt = (id, t) => frame(id, _cat(new Uint8Array([3]), te.encode(t)));
  const comm = (t) => frame("COMM", _cat(new Uint8Array([3, 101, 110, 103, 0]), te.encode(t))); // UTF-8, "eng", empty desc
  const frames = _cat(txt("TIT2", meta.title), txt("TSSE", meta.software), comm(meta.comment)), sz = frames.length;
  return _cat(new Uint8Array([73, 68, 51, 3, 0, 0, (sz >> 21) & 127, (sz >> 14) & 127, (sz >> 7) & 127, sz & 127]), frames); // "ID3" v2.3
}
async function encodeMP3(buf, meta, kbps) {
  await loadScript("lib/lame.min.js");
  const s16 = floatTo16(buf.getChannelData(0)), n = s16.length, enc = new lamejs.Mp3Encoder(1, buf.sampleRate, kbps || 192), parts = [id3v2(meta)];
  for (let i = 0; i < n; i += 1152) { const m = enc.encodeBuffer(s16.subarray(i, i + 1152)); if (m.length) parts.push(m); }
  const end = enc.flush(); if (end.length) parts.push(end);
  return new Blob(parts, { type: "audio/mpeg" });
}
async function encodeFLAC(buf) {
  const Flac = await loadFlac(), ch = buf.getChannelData(0), n = ch.length, s32 = new Int32Array(n);
  for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, ch[i])); s32[i] = (x < 0 ? x * 0x8000 : x * 0x7fff) | 0; }
  const enc = Flac.create_libflac_encoder(buf.sampleRate, 1, 16, 5, n), parts = [];
  const st = Flac.init_encoder_stream(enc, (data, bytes) => parts.push(new Uint8Array(data.slice(0, bytes))), () => {});
  if (st !== 0) throw new Error("FLAC init " + st);
  for (let i = 0; i < n; i += 4096) { const sub = s32.subarray(i, Math.min(i + 4096, n)); Flac.FLAC__stream_encoder_process_interleaved(enc, sub, sub.length); }
  Flac.FLAC__stream_encoder_finish(enc); Flac.FLAC__stream_encoder_delete(enc);
  return new Blob(parts, { type: "audio/flac" });
}
// ---- MIDI export (Standard MIDI File, format 0) ----
const MIDI_MAP = { kick: [9, 36], snare: [9, 38], hihat: [9, 42], clap: [9, 39], bass: [0, 33], synth: [1, 64] }; // [channel, note]
function vlq(n) { const b = [n & 0x7f]; n = Math.floor(n / 128); while (n > 0) { b.unshift((n & 0x7f) | 0x80); n = Math.floor(n / 128); } return b; }
function buildMIDI(mult) {
  const div = 96, stepTicks = div / 4, gate = Math.max(1, stepTicks - 4);
  const work = sections.map((sec) => ({ gol: sec.gol, repeat: sec.repeat, pattern: INSTR.reduce((o, k) => ((o[k] = sec.pattern[k].slice()), o), {}) }));
  const wseq = []; work.forEach((sec, si) => { for (let r = 0; r < sec.repeat; r++) for (let st = 0; st < STEPS; st++) wseq.push([sec.pattern, st, si]); });
  const totalSteps = (wseq.length || 1) * mult, events = [];
  let gt = 0;
  for (let i = 0; i < totalSteps; i++) {
    const cell = wseq[i % wseq.length], si = cell[2], tick = i * stepTicks;
    if (gt > 0 && gt % golStep === 0 && work[si].gol) lifeStep(work[si].pattern);
    INSTR.forEach((k) => { if (cell[0][k][cell[1]]) { const m = MIDI_MAP[k]; events.push([tick, 1, m[0], m[1]]); events.push([tick + gate, 0, m[0], m[1]]); } });
    gt++;
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // by tick; note-offs (0) before note-ons (1)
  const trk = [], mpq = Math.round(60000000 / bpm);
  trk.push(...vlq(0), 0xff, 0x51, 0x03, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255); // tempo
  let last = 0;
  for (const [tick, type, ch, note] of events) { trk.push(...vlq(tick - last)); last = tick; trk.push((type ? 0x90 : 0x80) | ch, note, type ? 100 : 0); }
  trk.push(...vlq(0), 0xff, 0x2f, 0x00); // end of track
  const t = new Uint8Array(trk);
  const head = new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (div >> 8) & 255, div & 255]);
  const mtrk = new Uint8Array([0x4d, 0x54, 0x72, 0x6b, (t.length >>> 24) & 255, (t.length >>> 16) & 255, (t.length >>> 8) & 255, t.length & 255]);
  return new Blob([_cat(head, mtrk, t)], { type: "audio/midi" });
}
function dl(blob, fname) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fname; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); }
async function encodeByFmt(fmt, buf, meta) {
  if (fmt === "mp3") return { blob: await encodeMP3(buf, meta, +$("mp3-quality").value), ext: "mp3" };
  if (fmt === "flac") return { blob: await encodeFLAC(buf), ext: "flac" };
  return { blob: new Blob([encodeWAV(buf, meta)], { type: "audio/wav" }), ext: "wav" };
}
function exportName() { return (($("track-name").value || "").trim().replace(/[^\w .\-]+/g, "_").slice(0, 60)) || "bit8maker"; }

// ---- live recording: tap the master bus and encode on stop ----
function startRec() {
  ensureCtx(); ctx.resume();
  recChunks = []; recLen = 0; recSr = ctx.sampleRate;
  recNode = ctx.createScriptProcessor(4096, 1, 1);
  recNode.onaudioprocess = (e) => { const d = e.inputBuffer.getChannelData(0); recChunks.push(new Float32Array(d)); recLen += d.length; };
  bus.connect(recNode); recNode.connect(ctx.destination); // ScriptProcessor needs a sink to run (outputs silence)
  recording = true; updateRec();
}
async function stopRec() {
  recording = false; updateRec();
  try { bus.disconnect(recNode); } catch (e) {} try { recNode.disconnect(); } catch (e) {}
  recNode.onaudioprocess = null; recNode = null;
  if (!recLen) { flashStatus("empty"); return; }
  const merged = new Float32Array(recLen); let p = 0; for (const c of recChunks) { merged.set(c, p); p += c.length; }
  recChunks = [];
  const fake = { getChannelData: () => merged, length: recLen, sampleRate: recSr };
  let fmt = $("fmt-select").value; if (fmt === "midi") fmt = "wav"; // MIDI can't capture live audio
  const name = exportName(), meta = { title: name, comment: META_URL, software: "Bit8maker v" + VERSION };
  flashStatus("…");
  try { const { blob, ext } = await encodeByFmt(fmt, fake, meta); dl(blob, name + "-rec." + ext); flashStatus("✓ " + ext.toUpperCase()); }
  catch (e) { flashStatus("rec failed"); }
}
function updateRec() { const b = $("rec"); b.textContent = (recording ? "⏹ " : "⏺ ") + REC_LABEL[lang]; b.classList.toggle("recording", recording); }

async function exportAudio() {
  const fmt = $("fmt-select").value, mult = Math.max(1, Math.min(100, +$("mult-select").value || 1));
  const name = (($("track-name").value || "").trim().replace(/[^\w .\-]+/g, "_").slice(0, 60)) || "bit8maker";
  if (fmt === "midi") { try { dl(buildMIDI(mult), name + ".mid"); flashStatus("✓ MIDI"); } catch (e) { flashStatus("export failed"); } return; }
  const sr = 44100, stepDur = (60 / bpm) / 4;
  // clone patterns so Game-of-Life evolution during export doesn't touch the live grid
  const work = sections.map((sec) => ({ gol: sec.gol, repeat: sec.repeat, pattern: INSTR.reduce((o, k) => ((o[k] = sec.pattern[k].slice()), o), {}) }));
  const wseq = []; work.forEach((sec, si) => { for (let r = 0; r < sec.repeat; r++) for (let st = 0; st < STEPS; st++) wseq.push([sec.pattern, st, si]); });
  const totalSteps = (wseq.length || 1) * mult, total = totalSteps * stepDur + 0.4;
  let off; try { off = new OfflineAudioContext(1, Math.ceil(total * sr), sr); } catch (e) { flashStatus("too long"); return; }
  const live = ctx, liveBus = bus; ctx = off; bus = null; flashStatus("…");
  try {
    let gt = 0;
    for (let i = 0; i < totalSteps; i++) {
      const cell = wseq[i % wseq.length], si = cell[2], t = i * stepDur;
      if (gt > 0 && gt % golStep === 0 && work[si].gol) lifeStep(work[si].pattern);
      INSTR.forEach((k) => { if (cell[0][k][cell[1]]) VOICES[k](t, volumes[k]); });
      gt++;
    }
    const buf = await off.startRendering(), meta = { title: name, comment: META_URL, software: "Bit8maker v" + VERSION };
    const { blob, ext } = await encodeByFmt(fmt, buf, meta);
    dl(blob, name + "." + ext);
    flashStatus("✓ " + ext.toUpperCase());
  } catch (e) { flashStatus("export failed"); }
  finally { ctx = live; bus = liveBus; }
}

// ---- save / load by link ----
const b64url = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64dec = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
function patBits(pat) { return INSTR.map((k) => { let n = 0; for (let st = 0; st < STEPS; st++) if (pat[k][st]) n |= 1 << st; return n; }); }
function bitsToPat(arr) { const p = emptyPattern(); INSTR.forEach((k, i) => { const n = (arr && arr[i]) | 0; for (let st = 0; st < STEPS; st++) p[k][st] = !!(n & (1 << st)); }); return p; }
function encodeState() {
  const s = sections.map((sec) => ({ n: sec.name, r: sec.repeat, g: sec.gol ? 1 : 0, p: patBits(sec.pattern) }));
  return b64url(JSON.stringify({ b: bpm, v: INSTR.map((k) => Math.round(volumes[k] * 100)), s: s, gs: golStep }));
}
function decodeState(str) {
  try {
    const o = JSON.parse(b64dec(str));
    if (o.b) bpm = Math.max(60, Math.min(MAX_BPM, o.b | 0));
    if (Array.isArray(o.v)) INSTR.forEach((k, i) => { if (o.v[i] != null) volumes[k] = Math.max(0, Math.min(1, o.v[i] / 100)); });
    if (o.gs) golStep = Math.max(1, Math.min(64, o.gs | 0));
    if (Array.isArray(o.s)) sections = o.s.slice(0, MAX_SEC).map((sec, i) => ({ name: (sec.n != null ? String(sec.n) : defName(i)).slice(0, 20), repeat: Math.max(1, Math.min(8, (sec.r | 0) || 1)), gol: !!sec.g, pattern: bitsToPat(sec.p) }));
    else if (Array.isArray(o.p)) sections = [{ name: defName(0), repeat: 1, pattern: bitsToPat(o.p) }]; // 0.0.5 link
    if (!sections.length) sections = [{ name: defName(0), pattern: emptyPattern(), repeat: 1 }];
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
  order.forEach((k) => {
    const row = document.createElement("div"); row.className = "row"; row.dataset.k = k;
    const lab = document.createElement("div"); lab.className = "label"; lab.textContent = STRINGS[lang].instr[k];
    lab.draggable = true; lab.title = "drag to reorder";
    lab.ondragstart = (e) => { dragKey = k; row.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; };
    lab.ondragend = () => row.classList.remove("dragging");
    row.ondragover = (e) => { e.preventDefault(); row.classList.add("drop-hint"); };
    row.ondragleave = () => row.classList.remove("drop-hint");
    row.ondrop = (e) => { e.preventDefault(); row.classList.remove("drop-hint"); reorder(dragKey, k); };
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
  sections.forEach((s, i) => { const b = document.createElement("button"); b.className = "tab" + (i === cur ? " active" : "") + (i === playingSec ? " playing" : ""); b.textContent = (i + 1) + ". " + (s.name || "—") + (s.gol ? " 🧬" : ""); b.onclick = () => { cur = i; sync(); }; el.appendChild(b); });
  const add = document.createElement("button"); add.className = "tab tab--icon"; add.textContent = "＋"; add.title = "add";
  add.onclick = () => { if (sections.length < MAX_SEC) { sections.push({ name: defName(sections.length), pattern: emptyPattern(), repeat: 2 }); cur = sections.length - 1; sync(); } };
  el.appendChild(add);
  if (sections.length > 1) { const rem = document.createElement("button"); rem.className = "tab tab--icon"; rem.textContent = "✕"; rem.title = "remove"; rem.onclick = () => { sections.splice(cur, 1); cur = Math.min(cur, sections.length - 1); sync(); }; el.appendChild(rem); }
  $("rep-val").textContent = "×" + sections[cur].repeat;
}
function sync() { renderTabs(); $("sec-name").value = sections[cur].name; $("gol-on").checked = !!sections[cur].gol; renderGrid(); }
function setRepeat(delta) {
  const s = sections[cur];
  s.repeat = Math.max(1, Math.min(8, s.repeat + delta));
  $("rep-val").textContent = "×" + s.repeat;
  if (playing) { seq = buildSequence(); if (seqPos >= seq.length) seqPos %= seq.length; } // apply live, next loop
}
function updateTransport() {
  $("play").textContent = playing ? PAUSE_LABEL[lang] : STRINGS[lang].play;
  $("stop-btn").hidden = !(playing || paused);
}
function renderChangelog() {
  const e = CHANGELOG[clIndex], L = CL_LABELS[lang], latest = clIndex === CHANGELOG.length - 1;
  $("cl-version").textContent = L.version + " " + e.v + (latest ? " ·" : "");
  $("cl-snap").textContent = latest ? "" : "📦 " + SNAP_LABEL[lang];
  $("cl-commit").innerHTML = e.commit && e.commit !== "—" ? '<a href="https://github.com/j0k/bit8maker/commit/' + e.commit + '" target="_blank">' + e.commit + "</a>" : "";
  const items = (e.items[lang] || e.items["eng-ny"]).map((x) => "<li>" + x + "</li>").join("");
  let html = "<h3>" + L.whats + "</h3><ul>" + items + "</ul>";
  const arch = e.arch[lang] || e.arch["eng-ny"];
  if (arch) html += '<p class="cl-arch"><b>' + L.arch + ":</b> " + arch + "</p>";
  $("cl-body").innerHTML = html;
}
// Roll the whole product back: each version's real snapshot is loaded once into a
// cached iframe and then just shown/hidden — so switching is instant, never a reload.
const verFrames = {};
function ensureFrame(v) {
  if (!verFrames[v]) {
    const fr = document.createElement("iframe");
    fr.className = "ver-frame"; fr.style.display = "none"; fr.title = "bit8maker " + v;
    fr.src = "versions/" + v + "/index.html";
    verFrames[v] = fr; $("ver-stage").appendChild(fr);
  }
  return verFrames[v];
}
function renderVersionView() {
  const latest = clIndex === CHANGELOG.length - 1, lastSnap = CHANGELOG.length - 1;
  $("live-app").hidden = !latest;
  $("lang-select").style.visibility = latest ? "" : "hidden";
  $("tagline").style.visibility = latest ? "" : "hidden";
  for (const v in verFrames) verFrames[v].style.display = "none";
  if (latest) { $("ver-stage").hidden = true; return; }
  if (playing) stop();
  $("ver-stage").hidden = false;
  ensureFrame(CHANGELOG[clIndex].v).style.display = "block";
  // warm up the neighbours so adjacent drags are instant too (skip the live latest)
  if (clIndex - 1 >= 0) ensureFrame(CHANGELOG[clIndex - 1].v);
  if (clIndex + 1 < lastSnap) ensureFrame(CHANGELOG[clIndex + 1].v);
}
function applyLang() {
  document.documentElement.lang = lang.split("-")[0];
  document.documentElement.dir = RTL[lang] ? "rtl" : "ltr";
  const t = STRINGS[lang];
  $("tagline").textContent = t.tagline;
  $("stop-btn").textContent = t.stop;
  $("clear").textContent = t.clear;
  $("export").textContent = EXPORT_LABEL[lang];
  $("track-name").placeholder = TRACK_LABEL[lang];
  $("share").textContent = SHARE_LABEL[lang];
  $("rep-label").textContent = REPEAT_LABEL[lang];
  $("preset-select").options[0].textContent = PRESET_LABEL[lang];
  $("np-label").textContent = NP_LABEL[lang];
  $("scope-cap").textContent = SCOPE_LABEL[lang];
  $("gol-label").textContent = GOL_LABEL[lang];
  $("gol-rate-label").textContent = GOL_RATE[lang];
  if (!playing) $("np-info").textContent = "—";
  $("bpm-label").textContent = t.bpm;
  updateTransport(); updateRec(); sync(); renderChangelog();
  $("lang-select").value = lang;
}

// ---- wire ----
if (location.hash.length > 1) decodeState(location.hash.slice(1)); // load shared pattern
const sel = $("lang-select");
LANGS.forEach(([code, label]) => { const o = document.createElement("option"); o.value = code; o.textContent = label; sel.appendChild(o); });
sel.onchange = () => { lang = sel.value; localStorage.setItem("b8_lang", lang); applyLang(); };
$("play").onclick = () => { playing ? pause() : paused ? resume() : play(); };
$("stop-btn").onclick = () => stop();
$("rec").onclick = () => { recording ? stopRec() : startRec(); };
$("clear").onclick = () => { INSTR.forEach((k) => sections[cur].pattern[k].fill(false)); renderGrid(); };
$("export").onclick = exportAudio;
const fmtSel = $("fmt-select"), mp3q = $("mp3-quality");
const syncMp3q = () => { mp3q.disabled = fmtSel.value !== "mp3"; };
fmtSel.onchange = syncMp3q; syncMp3q();
$("share").onclick = shareLink;
$("rep-dn").onclick = () => setRepeat(-1);
$("rep-up").onclick = () => setRepeat(1);
$("sec-name").oninput = (e) => { sections[cur].name = e.target.value; renderTabs(); };
const presetSel = $("preset-select");
PRESETS.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = p.label; presetSel.appendChild(o); });
presetSel.onchange = () => { const p = PRESETS[+presetSel.value]; if (p) addPreset(p); presetSel.selectedIndex = 0; };
$("gol-on").onchange = (e) => { sections[cur].gol = e.target.checked; golTick = 0; renderTabs(); };
const golStepIn = $("gol-step");
golStepIn.oninput = (e) => { golStep = +e.target.value; $("gol-step-val").textContent = golStep + "/16"; };
$("gol-next").onclick = () => { lifeStep(sections[cur].pattern); renderGrid(); };
$("gol-rand").onclick = () => { const p = sections[cur].pattern; INSTR.forEach((k) => { for (let s = 0; s < STEPS; s++) p[k][s] = Math.random() < 0.32; }); renderGrid(); };
golStepIn.value = golStep; $("gol-step-val").textContent = golStep + "/16";
function showBpm() { $("bpm-val").textContent = bpm; $("bpm-name").textContent = bpmName(bpm); }
const bpmIn = $("bpm"); bpmIn.max = MAX_BPM; bpmIn.value = bpm; showBpm();
bpmIn.oninput = (e) => { bpm = +e.target.value; showBpm(); };
const verSlider = $("ver-slider"); verSlider.max = CHANGELOG.length - 1; verSlider.value = clIndex;
verSlider.oninput = (e) => { clIndex = +e.target.value; renderChangelog(); };  // live + cheap: just the changelog text
verSlider.onchange = renderVersionView;                                        // heavy: swap the snapshot only when the slider is released
$("ver").textContent = VERSION;
applyLang();
