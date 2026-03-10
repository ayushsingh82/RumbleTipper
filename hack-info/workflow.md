# RumbleTip — Implementation Workflow

Plan and implementation log for the extension + backend. See [extension-and-backend-plan.md](extension-and-backend-plan.md) for the high-level design.

---

## Phase 1: Backend API

### API shape

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/creator/[id]/alpha` | Returns alpha score, metrics, suggested tip for a creator. |
| POST | `/api/creator/[id]/tip` | Executes a tip (WDK wallet → creator). Body: `{ amount: number, recipient?: string }`. |

### Response shapes

**GET /api/creator/[id]/alpha**

```json
{
  "creatorId": "string",
  "alphaScore": 0.87,
  "suggestedTip": 5,
  "metrics": { "views": 12000, "engagement": 0.04 },
  "network": "Ethereum",
  "token": "USD₮"
}
```

**POST /api/creator/[id]/tip**

- Request: `{ "amount": 5, "recipient": "0x..." }` (recipient = creator’s Rumble wallet address; optional for demo if we use a placeholder).
- Response: `{ "ok": true, "txHash": "0x...", "amount": 5 }` or error.

### File structure

```
app/api/creator/[id]/alpha/route.ts   ← GET score (uses lib/creator-score.ts)
app/api/creator/[id]/tip/route.ts    ← POST tip (WDK transferEvmToken); CORS + RUMBLETIP_MAX_PER_TIP_USD
lib/
  wdk-evm.ts         ← createWdkEvmFromEnv, transferEvmToken
  creator-score.ts   ← getAlphaScore(id) — mock scoring
  cors.ts            ← CORS headers for extension
extension/
  manifest.json      ← Chrome MV3; runs on rumble.com
  content.js         ← hover → fetch alpha → overlay → Tip via Agent (amount + recipient)
  content.css        ← overlay styles
```

### Implementation status

- [x] **GET /api/creator/[id]/alpha** — Returns mock alpha score and suggested tip for any `id`. Replace with real scoring later.
- [x] **POST /api/creator/[id]/tip** — Accepts `amount` and `recipient`; uses WDK to send USD₮ (ERC-20) to `recipient`. Uses env `WDK_USDT_CONTRACT` or default mainnet USDT address; amount in USD (converted to 6 decimals).

### Env / config

- `WDK_SEED_PHRASE` — already used for wallet.
- `WDK_RPC_URL` — already used.
- `WDK_USDT_CONTRACT` — (optional) ERC-20 USDT contract address; default: mainnet USDT.

---

## Phase 2: Extension (next)

1. Create `extension/` (or separate repo) with manifest.json for Chrome.
2. Content script: inject on `rumble.com/browse`, `rumble.com/watch/*`.
3. On hover: get creator/video id from DOM → `fetch(/api/creator/${id}/alpha)` → show overlay.
4. “Tip via Agent” → `fetch(/api/creator/${id}/tip, { method: 'POST', body: JSON.stringify({ amount, recipient }) })` → show success/error.

---

## Phase 3: Real scoring (optional)

- Ingest Rumble data (scrape or API if available).
- Store per-creator metrics; compute alpha score (e.g. view velocity, engagement).
- Replace mock in GET /api/creator/[id]/alpha with real data.

---

## Quick test

```bash
# Alpha (mock)
curl http://localhost:3000/api/creator/rumble-creator-123/alpha

# Tip (requires WDK_SEED_PHRASE and recipient address; use testnet)
curl -X POST http://localhost:3000/api/creator/rumble-creator-123/tip \
  -H "Content-Type: application/json" \
  -d '{"amount": 5, "recipient": "0x..."}'
```
