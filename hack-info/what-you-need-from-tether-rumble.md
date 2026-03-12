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

## From Rumble (no API — we read the page)

We **don’t use any Rumble API**. The extension **reads the DOM** to get creator/video info:

- **extension/dom-reader.js** — Finds the hovered card, collects all links and text, parses paths (`/videos/...`, `/user/...`), and detects “N views”, “N subscribers”, etc. from the visible page. No docs needed; it’s generic DOM parsing.
- **extension/content.js** — Uses that read info to show “Video: … · Creator: … · Views: …” in the overlay and to get a `creatorId` for our Alpha/tip API.

If Rumble changes their layout, you may need to tweak **dom-reader.js** (e.g. regex for views/subs) or the selectors in **content.js** after inspecting rumble.com in DevTools.

What we still **don’t** have from Rumble (and would need their docs or dev contact for):

1. **Creator → wallet address** — So we can prefill or validate the tip recipient instead of the user pasting 0x…. Or use Rumble’s **native tipping flow** (if they expose an API) so the tip is clearly “on Rumble” for the track.
2. **Optional: stable selectors** — If you want the overlay to attach to very specific elements, inspect rumble.com and update the selectors; the DOM reader already works without Rumble docs.

---

## Summary

| Source        | Needed for current code? | What to get |
|--------------|---------------------------|-------------|
| **Tether/WDK** | No (you have enough)      | Use existing hack-info docs for new WDK/OpenClaw work. |
| **Rumble**     | Yes, for “real” integration | Creator → wallet mapping; optional tipping/wallet API; DOM selectors from live site. |

So: **main code is written** using your Tether topics; the only missing pieces are **Rumble-specific** (creator wallet mapping, optional tipping API, and DOM details for the extension).
