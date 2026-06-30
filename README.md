# Bit8maker

**Yo — tap the grid, cook a beat… can't be beat.**

A click-to-make beat sequencer that runs entirely in your browser (Web Audio API,
no backend). Bilingual 🗽 EN / 🇷🇺 RU.

## Run

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## v0.0.2

- Clickable 16-step grid · Kick / Snare / HiHat / Clap
- **Per-track volume sliders** (remembered)
- Play / Stop with a Web-Audio scheduler · BPM · Clear
- EN / RU language switch (remembered)
- Procedural drum synthesis (no samples)

## Roadmap

- `0.0.x` — web: volumes, sections, WAV/MIDI export, more instruments
- `0.1.0` — first release: native desktop (Zig + raylib); CI builds
  **.exe / .deb / .tar.gz / .dmg** published to GitHub Releases

## License

MIT — see [LICENSE](LICENSE).
