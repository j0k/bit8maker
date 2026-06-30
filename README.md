# Bit8maker

**Yo — tap the grid, cook a beat… can't be beat.**

A click-to-make beat sequencer that runs entirely in your browser (Web Audio API,
no backend). Bilingual 🗽 EN / 🇷🇺 RU.

## Run

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## v0.0.11

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
