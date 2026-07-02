# Bit8maker

**Yo — tap the grid, cook a beat… can't be beat.**

### ▶️ [Try it live — juri-konoplev.pro/bit8maker](https://juri-konoplev.pro/bit8maker/)

Make beats right in your browser — no install needed.

A click-to-make beat sequencer that runs entirely in your browser (Web Audio API,
no backend), available in **19 interface languages**. There are also experimental
**native** builds written in Zig (a headless renderer and a raylib GUI).

## Run the web app

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Features (web)

- **6 instruments** — Kick / Snare / HiHat / Clap / Bass / Synth, on a clickable
  16-step grid; procedural synthesis (no samples)
- **Per-track volume**, **BPM up to 250** (with a genre + tempo hint), Play / **Pause** / Stop / Clear
- **Storyline sections** — multiple named sections with their own pattern and
  repeat count, played in sequence
- **Genre presets** that *stack* as new sections (Boom bap, Hip-hop, House, Techno, Trap, Drum & Bass)
- **Game of Life** per section — the grid runs Conway's Life so the beat evolves live
- **Drag to reorder** instruments; **share by link** (state + `?lang` in the URL)
- **Export** to **WAV / MP3 / FLAC / MIDI** with a length multiplier (×1…×100), track
  name and metadata; **Rec** captures the live output to a file
- **Live visualiser** (waveform + spectrum), a **now-playing** panel, and a
  **time-machine version slider** at the bottom that rolls the whole app back to any
  past release (0.0.1 → latest), with a localized changelog
- **19 interface languages** (incl. Russian variants, English NY/UK, Ukrainian,
  French, Japanese, Arabic RTL, Chinese, Kazakh, Lithuanian, Spanish, Portuguese,
  Dutch, Swedish, Georgian, Azerbaijani, Finnish, Italian)

## Downloads (native)

Native builds are attached to [GitHub Releases](https://github.com/j0k/bit8maker/releases).
They are written in **Zig** (no runtime deps):

- **GUI** (raylib window — grid, clicks, per-track volume, sections, Game of Life,
  playhead, sound): `Bit8maker-GUI-zig-x86_64-windows.exe`, `Bit8maker-GUI-zig-x86_64-linux`
  *(Linux GUI needs X11 + libGL at runtime)*
- **CLI** (headless renderer — writes a WAV): `Bit8maker-CLI-zig-x86_64-windows.exe`,
  `Bit8maker-CLI-zig-x86_64-linux`
- **Web bundle**: `bit8maker-web-<ver>.tar.gz` (the static app)

### Zig CLI renderer — `zig/`

Dependency-free; reuses the web app's procedural voices to render the demo beat to a WAV.

```bash
cd zig
zig build-exe -O ReleaseFast bit8maker.zig      # or -target x86_64-windows
./bit8maker out.wav
```

### Zig + raylib GUI — `zig/gui/`

An interactive native port (window, grid, transport, playhead, per-track volume,
sections, per-section Game of Life). raylib is fetched and built from source.

```bash
cd zig/gui
zig build run      # build raylib + the GUI, then run  (needs a desktop / X11)
```

Verified to compile & link with Zig 0.13.0 (raylib 5.5) to native x86-64
(Windows & Linux).

### Electron desktop wrapper (optional, CI)

`package.json` + `electron-main.js` wrap the web app as an Electron desktop app,
and `.github/workflows/release.yml` is set up to build `.exe` (NSIS) + `.deb` +
`.tar.gz` on each `v*` tag. **Note:** this CI is currently not producing releases
(the GitHub account is billing-locked); the shipped native artifacts above are the
Zig ones. `.dmg` (macOS) is not built.

## Roadmap

- **Web** — mature (0.1.x). Possible: swing/groove, per-section BPM, save slots.
- **Zig + raylib GUI** — porting the web features one at a time (done: grid,
  transport, volume, sections, Game of Life, playhead; next: presets, export, i18n).
- **CI native builds** — unblock GitHub Actions (billing) so Electron `.exe/.deb/.tar.gz`
  publish automatically per tag.

## Version history

The full, localized, per-version changelog lives **inside the app** (drag the
version slider at the bottom). Every release is also a git tag (`v0.0.1` … latest)
and a frozen snapshot under `versions/<v>/`.

## License

MIT — see [LICENSE](LICENSE).
