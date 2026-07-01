# Bit8maker — native Zig renderer

An experimental **native** build of Bit8maker written in [Zig](https://ziglang.org)
(no dependencies). It reuses the web app's procedural synthesis — Kick / Snare /
HiHat / Clap / Bass / Synth — and renders the demo storyline to a 16-bit PCM WAV.

This is a headless renderer (no GUI yet); a full interactive port (e.g. Zig +
raylib for graphics/audio) would be the next step.

## Build

```bash
# quick, for the host arch:
zig build-exe -O ReleaseFast bit8maker.zig
./bit8maker out.wav

# or a specific target (native x86-64 Linux):
zig build-exe -O ReleaseFast -target x86_64-linux bit8maker.zig

# or via the build script:
zig build run -- out.wav
```

Verified with Zig 0.13.0 → a statically-linked `x86-64` ELF that writes a valid
44.1 kHz mono WAV.
