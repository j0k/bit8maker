# Bit8maker GUI — Zig + raylib (native desktop port)

The start of a **native interactive** Bit8maker, written in Zig with
[raylib](https://www.raylib.com). First increment:

- a window with the 6×16 step grid (Kick / Snare / HiHat / Clap / Bass / Synth)
- **click a cell** to toggle it
- **Play / Stop** — the current pattern is rendered with the same procedural
  voices as the web app and looped; **Clear**; **BPM −/+**

Audio uses raylib's audio device; the pattern is rendered to a `Wave` and played.

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
