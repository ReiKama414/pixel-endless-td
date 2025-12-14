# 像素無盡塔防

[English](./README.md) · **繁體中文**

> **8-bit 無盡塔防網頁遊戲**：防禦塔覺醒、跨局靈魂科技樹、指揮官大招與成就勳章

**This project is released under the MIT License** — 本專案以 MIT 授權釋出，是全權保留預設之外的明確例外，全文見 [LICENSE](./LICENSE)

<p align="center">
  <img src="./favicon.png" alt="像素無盡塔防圖示" width="96" height="96" />
</p>

<p align="center">
  <a href="https://github.com/ReiKama414/pixel-endless-td">Star</a>
  ·
  <a href="https://reikama414.github.io/pixel-endless-td/">線上試玩</a>
  ·
  <a href="https://reikama414.vercel.app/">個人網站</a>
  ·
  <a href="#快速開始">快速開始</a>
  ·
  <a href="#license--權限">授權</a>
</p>

---

## 亮點

- **五種防禦塔、雙重覺醒** — Lv.5 / Lv.10 解鎖雙箭、燃燒、寒霜光環、連鎖閃電與黃金賞金
- **無盡波次** — 每 3 波黃金寶箱怪，每 5 波像素首領
- **靈魂科技永久保留** — 靈魂結晶強化傷害、攻速、暴擊、金幣與主堡生命，寫入 `localStorage`
- **街機便利功能** — 1x / 2x / 3x 倍速、自動波次、自動升塔，以及 Q / W / E 指揮官技能
- **靜態網頁遊玩** — 用本機靜態伺服器開啟 `index.html`

## 技術棧

| 層級 | 選用 |
| --- | --- |
| 標記 | HTML5 · Canvas 2D |
| 樣式 | Tailwind CDN · 自訂像素 CSS |
| 邏輯 | `js/` 下的原生 JavaScript |
| 音效 | Web Audio API 晶片音合成 |
| 存檔 | `localStorage`（`PIXEL_ENDLESS_TD_SAVE_V1`） |

## 快速開始

無需建置。用任意靜態伺服器開啟專案資料夾

```bash
npx serve .
```

開啟印出的本機網址以載入 [`index.html`](./index.html)

| 路徑 | 用途 |
| --- | --- |
| `index.html` | 遊戲入口（`css/` + `js/`） |

> **提醒：** 頁面會從 CDN 載入 Tailwind 與 Google Fonts

## 操作

| 輸入 | 動作 |
| --- | --- |
| `1`–`5` | 選擇防禦塔種類 |
| 點擊／點按空地 | 建造目前選取的塔 |
| 點擊／點按已建塔 | 檢視；再點一次取消選取 |
| `Q` / `W` / `E` | 流星 · 狂暴 · 凍結 |
| `Space` | 開始下一波 |
| `Esc` | 關閉面板或清除塔選取 |
| 系統返回 | 優先關閉科技／成就面板 |

## 專案結構

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

## 連結

| | |
| --- | --- |
| 倉庫 | [pixel-endless-td](https://github.com/ReiKama414/pixel-endless-td) |
| 線上試玩 | [GitHub Pages](https://reikama414.github.io/pixel-endless-td/) |
| 作品集 | [個人網站](https://reikama414.vercel.app/) |
| 授權全文 | [LICENSE](./LICENSE) |

---

## License / 權限

**This project is released under the MIT License** — 本專案以 MIT 授權釋出，是全權保留預設之外的明確例外

Copyright (c) 2026 ReiKama414.

- [GitHub](https://github.com/ReiKama414/pixel-endless-td)
- [個人網站](https://reikama414.vercel.app/)
- [授權全文](./LICENSE)

---

<sub>像素無盡塔防 · ReiKama414 · MIT License</sub>
