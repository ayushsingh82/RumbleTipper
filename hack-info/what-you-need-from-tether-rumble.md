# What You Still Need From Tether & Rumble Docs

Everything implemented so far uses the **Tether WDK docs** you already have in `hack-info/` (wallet-docs-evm, doc-topics, about-wdk, build-with-ai, nodejs-quickstart). Below is what would unblock the next steps.

---

## From Tether / WDK (already covered in your docs)

- **EVM wallet** — Used in `lib/wdk-evm.ts` and tip API (create wallet, transfer ERC-20 USDT). Your wallet-docs-evm.md + Node quickstart cover this.
- **Config** — `WDK_SEED_PHRASE`, `WDK_RPC_URL`, `WDK_USDT_CONTRACT` (optional). No extra Tether docs needed.
- **Other chains (USD₮, XAU₮, BTC)** — If you want tips in non-EVM assets (e.g. on TON, Bitcoin), you’d use:
  - **Wallet modules**: `@tetherto/wdk-wallet-ton`, `@tetherto/wdk-wallet-btc` (see doc-topics.md “Wallet Modules”).
  - **Protocol modules**: bridge/swap if you hold on one chain and tip on another.
- **OpenClaw / MCP** — For agent reasoning (observe → decide → act), Tether’s AI/MCP docs (doc-topics.md “AI”) and build-with-ai.md are the right place. We haven’t wired OpenClaw yet; when you do, no extra Tether docs are strictly required beyond what you have.

So: **no additional Tether docs are required** for the current backend + extension. Use your existing hack-info docs for any new WDK or AI features.

---

## From Rumble (not in your repo — would need to be found)

1. **Rumble’s official tipping / wallet integration**
   - How does Rumble expose **creator wallet addresses** (USD₮ / XAU₮ / BTC)?
   - Is there a **public API or SDK** to:
     - Resolve “creator id” or “channel id” → wallet address?
     - Trigger a tip on Rumble’s side (so the tip is **native** in their UX, not just an on-chain transfer)?
   - Without this we **simulate**: extension sends USDT from our WDK wallet to a **recipient address** the user pastes (or you hardcode for demo). For the track (“build on top of Rumble’s existing tipping wallet”), you’d want Rumble’s own docs or dev contact for:
   - Creator ↔ wallet mapping.
   - Any “tip” or “payment” API that fits their product.

2. **Rumble DOM / embed (for the extension)**
   - We use **generic selectors** in `extension/content.js` (`a[href*="/videos/"]`, etc.). To make the overlay reliable and non-fragile:
   - Inspect **rumble.com/browse** and **watch pages** and note:
     - Stable **CSS selectors** or **data attributes** for “video card” and “creator/channel” elements.
     - Where **creator id** or **channel id** appears (in `href`, `data-*`, or API payloads in the page).
   - Rumble doesn’t need to publish “extension docs”; this is just DOM inspection. If they have a **public embed or widget API**, that could replace or complement our content script.

3. **Rumble auth (optional)**
   - If Rumble ever requires **logged-in user** or **API keys** to read creator data or trigger tips, you’d need their auth docs. Right now we don’t assume any Rumble auth.

---

## Summary

| Source        | Needed for current code? | What to get |
|--------------|---------------------------|-------------|
| **Tether/WDK** | No (you have enough)      | Use existing hack-info docs for new WDK/OpenClaw work. |
| **Rumble**     | Yes, for “real” integration | Creator → wallet mapping; optional tipping/wallet API; DOM selectors from live site. |

So: **main code is written** using your Tether topics; the only missing pieces are **Rumble-specific** (creator wallet mapping, optional tipping API, and DOM details for the extension).
