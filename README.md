# Bit8maker

**Yo — tap the grid, cook a beat… can't be beat.**

A click-to-make beat sequencer that runs entirely in your browser (Web Audio API,
no backend). Bilingual 🗽 EN / 🇷🇺 RU.

## Run

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## v0.1.4

- **MP3 quality selector** — 128 / 192 / 256 / 320 kbps

## v0.1.3

- **Export to WAV / MP3 / FLAC** — client-side (lamejs + libflac wasm)
- **Length multiplier ×1…×100** — render the storyline repeated up to 100× for a long track; Game-of-Life sections keep evolving through the export
- **Track name** + metadata (title, comment link) embedded in WAV & MP3
## v0.1.2

- Game of Life is now a **per-section** toggle (each section has its own mode; GoL sections are tagged 🧬 in the tabs)
- Fixed: the waveform/spectrum no longer freezes on the last frame when you hit Stop
- **Game of Life mode** 🧬 — turn the 6×16 grid into a Conway cellular automaton (toroidal) so the beat evolves live while it plays; evolution step from **1/16 to 64/16**, plus manual "step" and "random seed" 🎲. This is the 0.1.0 milestone (native desktop builds move to 0.1.x).
- **Live audio visualiser** — waveform (oscilloscope) and frequency spectrum while the beat plays (Web Audio `AnalyserNode`)
- **Steady version slider** — moved to its own full-width row so it never resizes or jumps while dragging
- **Snappy version switching** — snapshots are cached in an iframe pool (loaded once, then just shown), with neighbours pre-warmed, so dragging the slider no longer lags
- **Six instruments** — Kick / Snare / HiHat / Clap / **Bass** / **Synth** (bass = low triangle tone, synth = filtered saw pluck)
- **"Now playing" window** — with several sections it shows which one is sounding right now (name · repeat · step) with a pulsing dot; the playing section also lights up in the tabs
- **Stackable genre presets** — each preset *adds* its style as new sections to your storyline (up to 16) instead of replacing it; add one mid-playback and it joins at the end of the loop without restarting
- **Time-machine version slider** — drag it and the whole product rolls back to that release: real design **and** functionality, loaded from a frozen snapshot under `versions/<v>/` (taken from the git tag). Even 0.0.1 is playable. The snapshot loads on release into a fixed-height, self-scrolling frame, so spinning the slider no longer shakes or stretches the page.
- BPM tempo hint refined (174 = _Drum & Bass · Presto_) and its layout fixed so the BPM slider no longer jumps while dragging
- Clickable 16-step grid · Kick / Snare / HiHat / Clap
- **Genre presets** — load a ready beat: Boom bap, Hip-hop, House, Techno, Trap, Drum & Bass
- **Storyline sections** — multiple **named** sections (intro / verse / drop…), each with its own pattern and repeat count, played in sequence
- Per-track volume sliders (remembered)
- Play / Stop with a Web-Audio scheduler · BPM up to **250** (with a conventional **genre + tempo hint**: Hip-hop / House / Techno… · Allegro / Andante) · Clear
- **11 interface languages** — incl. English · NY and English · UK
- Export WAV — renders the **full storyline** offline and downloads it (client-side)
- **Share by link** — sections + bpm + volumes packed into the URL hash, plus `?lang=` so the link opens in your language
- 10 interface languages (ru-modern, ru-classic, uk, eng-ny, fr, jp, sa, cn, kz, lt)
- Version slider + localized changelog at the bottom
- Procedural drum synthesis (no samples)

## Roadmap

- `0.0.x` — web: volumes, sections, WAV/MIDI export, more instruments
- `0.1.0` — first release: native desktop (Zig + raylib); CI builds
  **.exe / .deb / .tar.gz / .dmg** published to GitHub Releases

## License

MIT — see [LICENSE](LICENSE).
