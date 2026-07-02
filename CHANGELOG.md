# Changelog

All notable changes to **Bit8maker**, newest first (the very first release, 0.0.1, is at the bottom).
Features and architecture per version. The full localized changelog also lives inside the app (version slider).

## 0.1.16

- Zig+raylib port grew up: per-track volume (−/+), sections with tabs and repeats, and per-section Game of Life (toggle + manual step + evolution baked into the audio)
- The playhead marks the sounding section (green tab outline) and its step

## 0.1.15 — [55656df](https://github.com/j0k/bit8maker/commit/55656df)

- Zig+raylib port: a running playhead highlights the current step in sync with the audio; the loop is now seamless (note tails wrap into the start)

## 0.1.14 — [9672416](https://github.com/j0k/bit8maker/commit/9672416)

- Started the native GUI port in Zig + raylib (zig/gui): a window, a clickable 6x16 grid, Play/Stop/Clear, BPM ±, and audio — the pattern is rendered with the same voices and looped
- Builds raylib from source (X11); sections, Game of Life, export and i18n come next

**Architecture:** raylib built from source via build.zig.zon (pinned 5.5), X11 backend; audio is a Wave rendered from the pattern.

## 0.1.13 — [7a007b2](https://github.com/j0k/bit8maker/commit/7a007b2)

- Experimental native Zig renderer: the same 6-instrument synthesis renders the demo beat to WAV; builds to a static x86-64 binary with no deps (see zig/)
- Headless for now; a full GUI port (Zig + raylib) is the next step

**Architecture:** Pure Zig 0.13, no deps; same voices (swept sine, noise+tone, saw/triangle) → 16-bit PCM WAV; static x86-64 ELF.

## 0.1.12 — [0a41a39](https://github.com/j0k/bit8maker/commit/0a41a39)

- 8 more interface languages: Spanish, Portuguese, Dutch, Swedish, Georgian, Azerbaijani, Finnish, Italian — 19 total

## 0.1.11 — [b7f477b](https://github.com/j0k/bit8maker/commit/b7f477b)

- Fixed the release CI: binary upload no longer needs a third-party action — uses the built-in gh CLI, so the Release is created and exe/deb/tar.gz attach
- The jobs were failing at 'Set up job' (0 steps) — a sign the third-party action was blocked by repo policy

## 0.1.10 — [e268991](https://github.com/j0k/bit8maker/commit/e268991)

- Native builds: a GitHub Actions release workflow packages a desktop app (Electron) on tag — Windows .exe installer and Linux .deb + .tar.gz — attached to the Release
- Same client-side code, wrapped by electron-main.js; dmg skipped for now

**Architecture:** Electron wrapper (webSecurity:false so wasm fetch works over file://); electron-builder targets win:nsis, linux:[deb,tar.gz]; windows/ubuntu matrix.

## 0.1.9 — [f886a0f](https://github.com/j0k/bit8maker/commit/f886a0f)

- Section 'Repeats' now applies live — change it while playing and the section loops the new number of times from the next cycle (previously it only took effect after a restart)
- With a single section the repeat is inaudible (it loops forever anyway); the difference shows across multiple sections

## 0.1.8 — [815443c](https://github.com/j0k/bit8maker/commit/815443c)

- Rec button (⏺): captures the live output in real time — with your edits, GoL evolution and pauses; on stop it encodes to the chosen format (WAV/MP3/FLAC) and downloads <name>-rec

## 0.1.7 — [eb64a0f](https://github.com/j0k/bit8maker/commit/eb64a0f)

- Drag instruments by their label to reorder the rows (the order is remembered)
- Game of Life uses the visible row order for adjacency

## 0.1.6 — [5038c84](https://github.com/j0k/bit8maker/commit/5038c84)

- MIDI export (.mid) — a standard file any DAW opens
- Each instrument maps to a GM note (Kick 36, Snare 38, Hat F#1, Clap 39, Bass A1, Synth E4); tempo, length multiplier and GoL evolution included

## 0.1.5 — [5c6cf1d](https://github.com/j0k/bit8maker/commit/5c6cf1d)

- While playing the button splits into Pause + Stop: pause freezes in place and resumes from the same spot, stop resets to the start
- Pause uses ctx.suspend() so the position and audio hold exactly

## 0.1.4 — [ea94970](https://github.com/j0k/bit8maker/commit/ea94970)

- MP3 quality selector — 128 / 192 / 256 / 320 kbps (enabled when the format is MP3)

## 0.1.3 — [7542ba8](https://github.com/j0k/bit8maker/commit/7542ba8)

- Export to WAV, MP3 and FLAC (client-side: lamejs + libflac wasm)
- Length multiplier ×1…×100 — a very long track in one click; GoL sections evolve through the export
- Track name + metadata (title, comment link juri-konoplev.pro/bit8maker) in WAV/MP3

**Architecture:** OfflineAudioContext renders ×N passes; encoded via lamejs (MP3, +ID3v2) and libflac (native FLAC).

## 0.1.2 — [255f4ea](https://github.com/j0k/bit8maker/commit/255f4ea)

- The Game of Life toggle now applies per section, not to the whole track — each section has its own mode
- GoL sections are tagged 🧬 in the tabs

## 0.1.1 — [4c65f80](https://github.com/j0k/bit8maker/commit/4c65f80)

- Fixed: on Stop the scope and spectrum no longer freeze on the last frame (a stray animation frame could redraw over the reset)

## 0.1.0 — [3df04e2](https://github.com/j0k/bit8maker/commit/3df04e2)

- Game of Life: the grid becomes a Conway cellular automaton (6×16 torus) and the beat mutates live as it plays
- Evolution step from 1/16 to 64/16; 'step' and 'random seed' 🎲 buttons
- The 0.1.0 milestone — native builds move to 0.1.x

**Architecture:** B3/S23 on an INSTR×STEPS torus; evolves in tick() at the step boundary.

## 0.0.17 — [05c0213](https://github.com/j0k/bit8maker/commit/05c0213)

- Live audio visuals while it plays: the waveform (scope) and the frequency spectrum
- Everything routes through an AnalyserNode

## 0.0.16 — [87c6b01](https://github.com/j0k/bit8maker/commit/87c6b01)

- Version slider moved to its own full-width row — it no longer resizes or jumps while you drag (version/commit/snapshot now sit below it)

## 0.0.15 — [7b37dbf](https://github.com/j0k/bit8maker/commit/7b37dbf)

- Version switching no longer lags — each snapshot loads once into a cached iframe and is just shown after that; neighbours are pre-warmed

**Architecture:** Cached iframe pool instead of reloading src on every switch.

## 0.0.14 — [5ab7956](https://github.com/j0k/bit8maker/commit/5ab7956)

- Two new instruments: Bass (low tone) and Synth (filtered saw pluck)
- Bass/Synth work in the grid, presets, WAV export and share links

## 0.0.13 — [7731d17](https://github.com/j0k/bit8maker/commit/7731d17)

- A 'Now playing' window — see which section is sounding right now (name, repeat, step), with a pulsing dot
- The playing section lights up in the tabs, separate from the one you're editing

## 0.0.12 — [57e0e41](https://github.com/j0k/bit8maker/commit/57e0e41)

- Presets now stack — each adds its style as new sections instead of wiping your arrangement
- Adding while playing doesn't restart — the new style drops in at the end of the loop
- Up to 16 sections

## 0.0.11 — [4eef035](https://github.com/j0k/bit8maker/commit/4eef035)

- Version slider stops shaking the page — the snapshot loads on release, in a fixed-height frame with its own scroll

## 0.0.10 — [6a497cf](https://github.com/j0k/bit8maker/commit/6a497cf)

- 174 BPM now reads Presto (Drum & Bass)
- BPM hint no longer makes the slider jump while you drag

## 0.0.9 — [f7eb03f](https://github.com/j0k/bit8maker/commit/f7eb03f)

- The version slider now actually rolls the product back — pick a version, see its real design and features (live snapshot from the git tag)
- Even 0.0.1 is playable

**Architecture:** Each release is frozen under /versions/<v>/ from its git tag; the slider loads it in an iframe.

## 0.0.8 — [680689d](https://github.com/j0k/bit8maker/commit/680689d)

- Genre presets: Boom bap, Hip-hop, House, Techno, Trap, Drum & Bass
- Added British English

## 0.0.7 — [a30d24a](https://github.com/j0k/bit8maker/commit/a30d24a)

- Name your sections — intro, verse, drop, whatever
- BPM range hint: Hip-hop, House, Techno… plus Allegro, Andante

## 0.0.6 — [83b39b8](https://github.com/j0k/bit8maker/commit/83b39b8)

- Storyline sections — intro, verse, drop, each with its own pattern and repeats
- Share link now keeps the language (?lang)

## 0.0.5 — [9c7602b](https://github.com/j0k/bit8maker/commit/9c7602b)

- Save & load a pattern by link — share your beat in one click

## 0.0.4 — [da01b72](https://github.com/j0k/bit8maker/commit/da01b72)

- Export your beat to WAV (download)

## 0.0.3 — [82d9eec](https://github.com/j0k/bit8maker/commit/82d9eec)

- Max tempo bumped to 250 BPM
- Ten interface languages
- Version slider + changelog at the bottom

## 0.0.2 — [b08e2fa](https://github.com/j0k/bit8maker/commit/b08e2fa)

- Per-track volume sliders
- Volumes remembered
- Responsive (sliders hidden on narrow screens)

## 0.0.1 — [2479f18](https://github.com/j0k/bit8maker/commit/2479f18)

- 16-step grid: Kick, Snare, HiHat, Clap
- Play/Stop, BPM, Clear
- Language switch
- Procedural drums, no samples

**Architecture:** Client-side only (Web Audio API), no backend.

---

Every version is also a git tag (`v0.0.1` … latest) and a frozen snapshot under `versions/<v>/`.
