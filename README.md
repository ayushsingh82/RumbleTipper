# Rumble Tipper

**AI-assisted tipping for Rumble creators — Hackathon Galáctica · Tipping Bot track.**

**Live site:** [https://rumble-tipper.vercel.app/](https://rumble-tipper.vercel.app/)

---

## Website (Next.js)

The deployed app is the public **landing and wallet surface**:

- **Marketing & flow** — “FIND · TIP · SUPPORT”, feature grid, pools/pricing story, partner strip (Rumble, WDK, Tether, hackathon).
- **Connect Wallet (WDK EVM)** — Same programmable wallet the backend uses; configure **Base Sepolia** via env for test tips.
- **Download extension** — CTA to install the Chrome extension for in-context tipping on Rumble.
- **Creator routes** — e.g. `/creator/register` for onboarding flows used with **Make wallet** from the extension.

Source: this repo (`app/`, `components/`). Deployed on **Vercel** at the URL above.

---

## Browser extension (Chrome, MV3)

The **Rumble Tipper** extension runs on **`rumble.com`** and works together with the site:

| Piece | Role |
|--------|------|
| **Brand** | Popup header shows **Rumble Tipper** — tipping on **Rumble**, **Base Sepolia** test ETH. |
| **Hover overlay** | DOM context + **Alpha score** (local, same deterministic mock as `lib/creator-score.ts` from creator id; no alpha `fetch`). **ETH** + **Tip via Agent** → `POST` to the app API. |
| **Popup** | Overview (hero-style), **Auto tip** rules (watch time + optional Alpha threshold, `chrome.storage`), Activity, **Wallet** tab (`GET /api/wallet` for address + balance + chain). |
| **Links** | **Landing page** opens **[rumble-tipper.vercel.app](https://rumble-tipper.vercel.app/)**; **Open Rumble** opens rumble.com. |

Load unpacked from the `extension/` folder (`chrome://extensions` → Developer mode). The extension’s API base URL is **`https://rumble-tipper.vercel.app`** so tips and wallet checks hit production unless you change `API_BASE` in `content.js` and `popup.js` for local dev.

Details: `extension/README.md`.

---

## Problem

- **Cold start** on video platforms — small creators get little visibility; tips often go to already-big channels.
- **Friction** — supporters want a simple way to discover and tip **with programmable rules** and **WDK-backed** sends.

---

## Solution

1. **Analyze signals** (demo: deterministic Alpha in extension + API mock in `creator-score.ts`; roadmap: factors in the table below + agent).
2. **Tip with WDK** — Server-side **ETH on Base Sepolia** (test) via **Tether WDK** (`lib/wdk-evm.ts`, `POST /api/creator/[id]/tip`).
3. **Stay on Rumble** — Extension overlay + site for onboarding and wallet narrative.

---

## Alpha score: what the agent is designed to use

The **Alpha score** is meant to summarize “how likely this creator is to break out soon” so supporters can tip **before** the crowd. In the full product, an **agent** (e.g. OpenClaw + tools) would combine **signals** like:

| Factor | Why it matters |
|--------|----------------|
| **View velocity** | Fast growth in views over a short window suggests momentum, not just one viral spike. |
| **Engagement rate** | Likes, comments, and shares **relative to views** — strong interaction signals an invested audience. |
| **Comment sentiment** | NLP over comments: enthusiasm, questions, repeat viewers vs. spam or negativity. |
| **Upload / recency cadence** | Consistent posting and recent activity vs. stale channels. |
| **Niche & competition** | Category saturation, language/region, and whether the niche is heating up. |
| **Cross-signals** | Subscriber or follower trajectory (when visible), watch-through hints, and optional **on-page context** from the extension (what the user is actually watching). |

The agent would **normalize and weight** these inputs, apply **budget and risk rules** (caps, cooldowns), then output a **score + suggested tip** — always bounded by user-configured limits before any WDK send.

### Demo vs roadmap

- **Today (hackathon demo)** — The overlay and `GET /api/creator/[id]/alpha` both use the **same deterministic mock** derived from the creator id (`lib/creator-score.ts` logic mirrored in the extension) — stable scores per channel/video slug, no live ML pipeline yet.
- **Roadmap** — Replace mocks with **real Rumble-side metrics** (API or ingested data), **LLM reasoning** where appropriate, and **OpenClaw** (or equivalent) orchestration so the factors above drive the score end-to-end.

---

## Tech stack

- **Next.js** — App, API routes, CORS for extension origins.
- **WDK** (`@tetherto/wdk`, `@tetherto/wdk-wallet-evm`) — Wallet, native ETH transfers.
- **Chrome extension** — Content scripts (`dom-reader.js`, `content.js`), popup (`popup.html` / `popup.js` / `popup.css`).

---

## Architecture (high level)

```
Landing (Vercel)  ←→  Connect wallet / onboarding
Extension on rumble.com  →  overlay + local Alpha  →  POST tip API  →  WDK (Base Sepolia)
```

---

## Repo layout

| Path | Purpose |
|------|---------|
| `app/` | Pages, `app/api/**` (wallet, creator alpha, tip) |
| `components/` | Landing sections, navbar, wallet UI |
| `extension/` | Chrome MV3 extension (load unpacked) |
| `lib/wdk-evm.ts` | WDK EVM helpers |
| `lib/creator-score.ts` | Alpha API mock (deterministic from creator id); extension mirrors this locally on hover |

---

## Getting started (local)

```bash
npm install
cp .env.example .env.local   # WDK_SEED_PHRASE, WDK_RPC_URL=https://sepolia.base.org
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Full runbook:** [demo.md](demo.md).

To point the **extension** at localhost, set `API_BASE` / `SITE_ORIGIN` in `extension/popup.js` and `API_BASE` in `extension/content.js` to `http://localhost:3000`.

---

## Hackathon

**Hackathon Galáctica: WDK Edition 1** — **Tipping Bot** track (Rumble + WDK + agents).  
Prizes: 1st 3,000 USD₮ · 2nd 2,000 USD₮. See `hack-info/README.md` for rules and tracks.
