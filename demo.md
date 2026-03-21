# RumbleTipper — How to Use (Demo Guide)

Run the app, load the extension, and demo the full flow: landing page wallet + Rumble hover overlay + Alpha score + Tip via Agent.

---

## 1. Prerequisites

- **Node.js** 20+
- **Chrome** or **Brave** (for the extension)
- **npm** or pnpm

---

## 2. Backend & landing page

### Install and env

```bash
cd hedera1
npm install
```

Copy env and set the wallet (required for Connect Wallet and for tipping):

```bash
cp .env.example .env.local
```

Edit `.env.local` — **use Sepolia testnet for the demo** (no mainnet funds):

```env
# Required for Connect Wallet + Tip API
WDK_SEED_PHRASE=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about

# Demo uses Sepolia testnet (not Ethereum mainnet)
WDK_RPC_URL=https://sepolia.drpc.org

# Sepolia: use a test USDT token contract if you have one; otherwise tip flow may need mainnet or another testnet token
# WDK_USDT_CONTRACT=0x...

# Optional: max USD per tip (default 1000)
# RUMBLETIPPER_MAX_PER_TIP_USD=100
```

**If you see sodium-native / “Cannot find addon” errors:**

```bash
npm rebuild sodium-native
```

Then restart the dev server.

### Run the app

```bash
npm run dev
```

- Landing page: **http://localhost:3000**
- **Connect Wallet** in the navbar will work if `WDK_SEED_PHRASE` is set and shows **Sepolia** (testnet) when `WDK_RPC_URL` points to Sepolia — you’ll see address, network, and balance.

---

## 3. Load the RumbleTipper extension (Chrome/Brave)

1. Open **Chrome** or **Brave**.
2. Go to **Extensions**:  
   - Chrome: `chrome://extensions/`  
   - Brave: `brave://extensions/`
3. Turn **Developer mode** ON (top-right).
4. Click **Load unpacked**.
5. Choose the **`extension`** folder inside this repo  
   e.g. `.../hedera1/extension`  
   (the folder that contains `manifest.json`, `content.js`, `dom-reader.js`, `content.css`).
6. Confirm **RumbleTipper** appears in the list and is enabled.
7. **(Optional)** To show the orange “R” logo in the toolbar, from the project root run:  
   `npm run generate-ext-icons`  
   Then reload the extension. Icons are written to `extension/icons/`.

- **Toolbar icon** — Orange “R” logo (same brand as the app). If you haven’t run `generate-ext-icons`, Chrome will use a default icon.
- **Popup** — Click the extension icon in the toolbar to open a popup with the same hero message as the home page: “FIND. TIP. SUPPORT.” / “RUMBLETIPPER.” and a short tagline + link to rumble.com.

The extension will run only on **https://rumble.com/***. It does not run on localhost.

### Point the extension at your backend

The content script calls your API. By default it uses `http://localhost:3000`.

- **Local demo:** keep `API_BASE = "http://localhost:3000"` in `extension/content.js` (line ~7).
- **Deployed demo:** change it to your app URL, e.g.  
  `const API_BASE = "https://your-app.vercel.app";`  
  then reload the extension (Extensions page → RumbleTipper → reload icon).

---

## 4. Demo flow

### A. Landing page (localhost:3000)

1. Open **http://localhost:3000**.
2. Click **Connect Wallet**.
   - If env is set (and `WDK_RPC_URL=https://sepolia.drpc.org`): you see address, **network: Sepolia**, and balance (testnet only — no mainnet).
   - If not: you see an error and instructions to set `WDK_SEED_PHRASE` in `.env.local`.
3. Use **Download extension** to remind yourself where the extension lives (no install from the page).

### B. Extension on Rumble

1. Open **https://rumble.com** (e.g. **https://rumble.com/browse**).
2. Hover over a **video or creator card** (thumbnail, title, or link to a video).
3. A **RumbleTipper overlay** should appear with:
   - **Read from page:** Video title, creator, views, etc. (parsed from the DOM by `dom-reader.js`).
   - **Alpha Score:** from your API (mock score + suggested tip).
   - **Suggested tip:** e.g. 5 USD₮.
   - **Amount** and **Recipient (0x…)** inputs.
   - **Tip via Agent** button.
4. To **test a tip** (on Sepolia testnet):
   - Enter an **amount** (e.g. 1).
   - Enter a **recipient** Ethereum address (0x + 40 hex chars). Use a Sepolia address you control for testing.
   - Click **Tip via Agent**.  
   - The app sends USDT (or the token set in `WDK_USDT_CONTRACT`) from the wallet in `.env.local` to that address on **Sepolia** and shows success + tx hash or an error. Get Sepolia ETH for gas (e.g. from a Sepolia faucet) and test USDT if your tip token is USDT on Sepolia.

If the overlay does not appear, try hovering over a **video link** (`/videos/...`) or the main content area. Rumble’s layout may require adjusting selectors in `extension/content.js` (see `extension/README.md`).

---

## 5. API reference (for scripts / debugging)

Base URL: **http://localhost:3000** (or your deployed URL).

### GET `/api/creator/[id]/alpha`

Returns alpha score and suggested tip for a creator id (used by the extension).

**Example:**

```bash
curl http://localhost:3000/api/creator/any-creator-id/alpha
```

**Response:**

```json
{
  "creatorId": "any-creator-id",
  "alphaScore": 0.87,
  "suggestedTip": 5,
  "metrics": { "views": 12000, "engagement": 0.04 },
  "network": "Ethereum",
  "token": "USD₮"
}
```

### POST `/api/creator/[id]/tip`

Sends USDT from the agent wallet (from env) to `recipient`. Used by the extension when you click “Tip via Agent”.

**Body:** `{ "amount": number, "recipient": "0x..." }`  
- `amount`: USD (e.g. 5 = 5 USDT).  
- `recipient`: Ethereum address (42 chars, 0x + 40 hex).

**Example:**

```bash
curl -X POST http://localhost:3000/api/creator/demo-123/tip \
  -H "Content-Type: application/json" \
  -d '{"amount": 1, "recipient": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"}'
```

**Success response:**

```json
{
  "ok": true,
  "creatorId": "demo-123",
  "amount": 1,
  "txHash": "0x...",
  "recipient": "0x742d..."
}
```

**Errors:** 400 (bad body/amount/recipient), 500 (e.g. WDK/env or network error).

### GET `/api/wallet`

Returns the agent wallet’s address and balance (same as Connect Wallet on the landing page). Used by the navbar.

**Example:**

```bash
curl http://localhost:3000/api/wallet
```

**Response (when configured; example on Sepolia testnet):**

```json
{
  "connected": true,
  "address": "0x...",
  "balanceWei": "...",
  "balanceEth": 0.0,
  "network": "Sepolia",
  "chainId": 11155111
}
```

---

## 6. Main functions and files

| Where | What |
|-------|------|
| **Extension** | |
| `extension/content.js` | Runs on rumble.com. On hover: `getReadInfoFromDOM()` → show overlay → GET alpha → show score + form → POST tip on button click. |
| `extension/dom-reader.js` | `RumbleTipperDOM.readCardInfo(el)`: finds card root, collects links and text, parses video/creator id, views, subscribers, title. No Rumble API. |
| `extension/content.css` | Styles for the overlay card. |
| **Backend (Next.js API)** | |
| `app/api/creator/[id]/alpha/route.ts` | GET: returns `getAlphaScore(id)` (mock score + suggested tip). |
| `app/api/creator/[id]/tip/route.ts` | POST: validates amount/recipient, calls WDK `transferEvmToken` (USDT) to recipient. |
| `app/api/wallet/route.ts` | GET: returns wallet address, balance, network from WDK (env). |
| **Lib** | |
| `lib/creator-score.ts` | `getAlphaScore(creatorId)`: mock alpha score, suggested tip, metrics (deterministic from id). |
| `lib/wdk-evm.ts` | WDK EVM: `createWdkEvmFromEnv()`, `getEvmAddress()`, `getEvmBalance()`, `transferEvmToken()`, etc. |
| `lib/cors.ts` | `corsHeaders()` for extension requests. |

---

## 7. Checklist for a smooth demo

- [ ] `npm install` and `WDK_SEED_PHRASE` (and optional `WDK_RPC_URL` / `WDK_USDT_CONTRACT`) in `.env.local`.
- [ ] `npm run dev` and open http://localhost:3000 — Connect Wallet shows address.
- [ ] Extension loaded from the `extension` folder; `API_BASE` in `content.js` points to http://localhost:3000 (or your deployed URL).
- [ ] On rumble.com, hover a video/creator card and see the overlay with “Read from page” + Alpha score.
- [ ] For a live tip: demo uses **Sepolia testnet** (`WDK_RPC_URL=https://sepolia.drpc.org`). Use a Sepolia recipient address and testnet token; get Sepolia ETH for gas from a faucet if needed.

---

## 8. Deploying (e.g. Vercel)

1. Deploy the Next.js app (e.g. `vercel`).
2. Set env vars in the dashboard: `WDK_SEED_PHRASE`, optionally `WDK_RPC_URL`, `WDK_USDT_CONTRACT`, `RUMBLETIPPER_MAX_PER_TIP_USD`.
3. In `extension/content.js`, set `API_BASE` to your deployed URL (e.g. `https://yourapp.vercel.app`).
4. Reload the extension. The overlay on Rumble will then call your deployed API.
