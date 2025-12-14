# Pixel Endless TD

**English** · [繁體中文](./README.zh-TW.md)

> An **8-bit endless tower defense** in the browser: tower awakenings, a permanent soul tech tree, commander skills, and achievements

**This project is released under the MIT License**, an explicit exception to an all-rights-reserved default. Full text: [LICENSE](./LICENSE).

<p align="center">
  <img src="./favicon.png" alt="Pixel Endless TD favicon" width="96" height="96" />
</p>

<p align="center">
  <a href="https://github.com/ReiKama414/pixel-endless-td">Star</a>
  ·
  <a href="https://reikama414.github.io/pixel-endless-td/">Live demo</a>
  ·
  <a href="https://reikama414.vercel.app/">Portfolio</a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#license--rights">License</a>
</p>

---

## Highlights

- **Five towers, dual awakenings** — Lv.5 and Lv.10 unlock archer volleys, cannon burn, frost aura, tesla chains, and golden bounty
- **Endless waves** — golden mimics every 3 waves, pixel bosses every 5 waves
- **Soul tech that persists** — gems upgrade damage, fire rate, crit, gold, and castle HP in `localStorage`
- **Arcade QoL** — 1x / 2x / 3x speed, auto-wave, auto-upgrade, and Q / W / E commander skills
- **Static web play** — open `index.html` through a local static server

## Tech stack

| Layer | Choice |
| --- | --- |
| Markup | HTML5 · Canvas 2D |
| Style | Tailwind CDN · custom pixel CSS |
| Logic | Vanilla JavaScript modules under `js/` |
| Audio | Web Audio API chiptune synthesis |
| Save | `localStorage` (`PIXEL_ENDLESS_TD_SAVE_V1`) |

## Quick start

No build step. Serve the folder with any static server.

```bash
npx serve .
```

Open the printed local URL to load [`index.html`](./index.html).

| Path | Purpose |
| --- | --- |
| `index.html` | Game entry (`css/` + `js/`) |

> **Note:** The page loads Tailwind and Google Fonts from the CDN.

## Controls

| Input | Action |
| --- | --- |
| `1`–`5` | Select tower type |
| Click / tap empty tile | Build selected tower |
| Click / tap owned tower | Inspect · tap again to deselect |
| `Q` / `W` / `E` | Meteor · Frenzy · Freeze |
| `Space` | Start next wave |
| `Esc` | Close drawer or clear tower selection |
| System Back | Close the tech / achievement drawer first |

## Project structure

```
pixel-endless-td/
├── index.html
├── favicon.ico
├── favicon.png
├── css/style.css
├── js/
│   ├── sprites.js
│   ├── audio.js
│   └── game.js
├── LICENSE
├── README.md
└── README.zh-TW.md
```

## Links

| | |
| --- | --- |
| Repository | [pixel-endless-td](https://github.com/ReiKama414/pixel-endless-td) |
| Live demo | [GitHub Pages](https://reikama414.github.io/pixel-endless-td/) |
| Portfolio | [Personal site](https://reikama414.vercel.app/) |
| Full license text | [LICENSE](./LICENSE) |

---

## License / Rights

**This project is released under the MIT License**, an explicit exception to an all-rights-reserved default.

Copyright (c) 2026 ReiKama414.

- [GitHub](https://github.com/ReiKama414/pixel-endless-td)
- [Portfolio](https://reikama414.vercel.app/)
- [Full license text](./LICENSE)

---

<sub>Pixel Endless TD · ReiKama414 · MIT License</sub>
