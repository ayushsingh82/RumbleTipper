# Rumble Tipper — Chrome extension

Runs on **rumble.com**. No Rumble API — we **read the page DOM** for creator/video context.

**Paired site:** [https://rumble-tipper.vercel.app/](https://rumble-tipper.vercel.app/) — landing, wallet, and API host for tips.

- **Toolbar** — Rumble Tipper icon; popup title **Rumble Tipper** with subtitle *On Rumble · Base Sepolia*.
- **Hover overlay** — **Alpha** from **deterministic mock** (same formula as `lib/creator-score.ts` / creator id — no alpha `fetch` on hover). ETH + **Tip via Agent** → `POST` when you click (default **`https://rumble-tipper.vercel.app`**). DOM id `rumbletipper-wdk-overlay` to avoid clashing with other extensions.
- **Popup** — Overview (hero-style), **Auto tip** rules (`chrome.storage`: amount, watch minutes, alpha threshold, token ETH/USDT/USD₮), Activity, **Wallet** (`GET /api/wallet` — Base Sepolia when RPC is `https://sepolia.base.org`).
- **Buttons** — **Landing page** opens the Vercel URL; **Make wallet** opens `/creator/register` on the same host.

## How we read info

- **dom-reader.js** — Finds the hovered card, collects **links** (`/videos/...`, `/user/...`, …) and **text** (views, subs, …), returns `creatorId`, `videoId`, titles, etc.
- **content.js** — Builds overlay, local Alpha only on hover (no alpha `fetch`). Tips use `API_BASE` in `content.js`.

## API URL

Default **`API_BASE`** in `content.js` and **`SITE_ORIGIN`** in `popup.js` is **`https://rumble-tipper.vercel.app`**. For **local** backend only, change both to `http://localhost:3000` and ensure `host_permissions` in `manifest.json` allow that origin.

## Load in Chrome

1. `chrome://extensions/` → Developer mode → **Load unpacked** → this `extension` folder.
2. Reload the extension after edits.

## Rumble layout changes

If Rumble changes HTML, update **dom-reader.js** and **content.js** selectors (`VIDEO_LINK_SELECTOR`, `CARD_SELECTOR`).
