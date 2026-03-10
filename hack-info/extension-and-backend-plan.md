# RumbleTip — Extension & Backend Plan

## High-level: what you'd build

### Browser extension UI (Chrome/Brave, ideally also Edge)

- Inject a **content script** on `rumble.com/*`.
- Detect creator/video elements on pages like `https://rumble.com/browse` and watch pages.
- On **hover** over a video/creator card, render a small **overlay panel** (like a tooltip/card) showing:
  - Creator **Alpha score** (your agent's prediction)
  - Recent performance metrics (views, engagement)
  - Suggested tip amount
  - A **"Tip via Agent"** button.

### Backend agent service

- Runs your **RumbleTip agent** (OpenClaw or similar).
- Periodically ingests Rumble data (scraped/queried via API if available) and stores:
  - Per-creator metrics
  - Scores / predictions
  - Suggested tip amounts.
- Exposes an API like:
  - `GET /creator/:id/score` → `{ score, metrics, suggestedTip }`
  - `POST /creator/:id/tip` → triggers WDK wallet tip.

### WDK + Rumble tipping integration

- Your backend (or an "agent wallet" service) uses **WDK** to:
  - Hold USD₮ / XAU₮ / BTC in an agent wallet.
  - Call **Rumble's native tipping flow** (whatever interface they expose) — this is key for the track: you **must not** build a standalone payments app; you must call into their existing tipping wallet.
- At minimum for the hackathon demo, you can:
  - Simulate or replay what Rumble's tipping API would look like, or
  - Use their real integration if you have docs/SDK for it.

---

## How the hover experience would work

1. **Content script loads on Rumble**
   - Select all video/creator cards (via CSS selectors).
   - Attach `mouseenter` / `mouseleave` listeners.

2. **On hover**
   - Extract a **creator/video identifier** from the DOM (creator profile link, video ID in the URL, etc.).
   - Call your backend: `GET https://your-agent-api/creator/{creatorId}/alpha`
   - Receive data:
     ```json
     {
       "creatorId": "...",
       "alphaScore": 0.87,
       "suggestedTip": 5,
       "network": "Ethereum",
       "token": "USD₮"
     }
     ```

3. **Render overlay**
   - Small card near the hovered element:
     - "Alpha Score: 87/100 – High potential"
     - "Suggested tip: 5 USD₮"
     - "Tip via Agent" button.

4. **User clicks "Tip via Agent"**
   - Extension calls your backend: `POST /creator/{id}/tip` with `{ amount: 5 }`.
   - Backend agent:
     - Runs safety checks (daily limits, per-creator caps).
     - Uses WDK wallet to trigger a tip to Rumble's tipping wallet for that creator.
     - Returns a tx hash / tip ID.
   - Extension shows "Tipped 5 USD₮ ✅" + maybe a link / tx hash.

---

## Why this is good for the hackathon

- **Agent autonomy** — The agent monitors platform data, scores creators, suggests tips, and can auto-execute tips based on rules.
- **Real financial behavior** — Real WDK wallet moves USD₮/XAU₮/BTC onchain (or via Rumble's integration); budget rules make it a real "strategy."
- **Clear WDK use** — WDK manages agent wallet keys, balances, tip transactions; you can demo actual WDK integration.
- **Good UX in Rumble** — Users stay on rumble.com; the hover overlay feels native.

---

## Minimal hackathon version

- **Backend:** One Node service with simple "scoring" (e.g. random + static weights) for demo + WDK wallet integration for tips.
- **Extension:** Chrome/Brave only; inject on Browse + Watch pages; overlay with Score, Suggested tip, "Tip via Agent" button.

---

## Next steps

1. Sketch the extension manifest + basic content script.
2. Design the backend API shape precisely.
3. Map existing WDK EVM helper (`lib/wdk-evm.ts`) into a tipping call (`sendUSDTip()` abstraction).

See [workflow.md](workflow.md) for implementation workflow and API/backend code.
