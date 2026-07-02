# Bit8maker GUI — Zig + raylib (native desktop port)

A **native interactive** Bit8maker, written in Zig with
[raylib](https://www.raylib.com). Current features:

- a window with the 6×16 step grid (Kick / Snare / HiHat / Clap / Bass / Synth)
- **click a cell** to toggle it; **Play / Stop / Clear**; **BPM −/+**
- **per-track volume** (−/+ per row)
- **storyline sections** — tabs to switch, **+ / x** to add/remove, per-section
  **repeat** (−/+); the whole storyline is rendered and looped
- **Game of Life** per section — **Life** toggle (bakes the evolution into the
  looped audio), a manual **step**, and a **life N/16** rate
- a **playhead** that marks the sounding section (green tab outline) and its step

Audio: the storyline is rendered to a seamless `Wave` (tails wrapped) and played.

Still web-only (not yet ported): presets, export, share links, i18n, visualiser,
now-playing, record, instrument reorder.

## Build & run

Needs a desktop (X11). raylib is fetched and built from source by `zig build`
(pinned in `build.zig.zon`). The X11 backend is selected to avoid needing
`wayland-scanner`.

```bash
zig build run          # build raylib + the GUI, then run
zig build              # just build -> zig-out/bin/bit8maker-gui
```

Verified to compile & link with Zig 0.13.0 (raylib 5.5) to a native x86-64 ELF.

## Roadmap for the port

Next increments: multiple **sections** + tabs, per-section **Game of Life**,
the **now-playing / visualiser**, **export** (WAV/MP3/…), and **i18n** — porting
the web app's features one at a time.
