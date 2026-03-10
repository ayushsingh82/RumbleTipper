# RumbleTip

**AI agent that finds high-potential creators early on Rumble and tips them — built for the Hackathon Galáctica Tipping Bot track.**

---

## Problem

Most creators on platforms like Rumble face **cold start problems**:

- New creators get **no visibility**
- Fans discover them **too late**
- Tipping usually goes to already viral creators

There is **no mechanism to financially support rising creators early**.

---

## Solution: RumbleTip

An AI agent that:

1. **Analyzes Rumble content performance** (view velocity, engagement, comment sentiment)
2. **Predicts which creators will trend**
3. **Automatically tips them early** via Rumble’s native USD₮ / XAU₮ / BTC tipping wallet

Fans delegate their tipping strategy to the agent; creators get support before they go viral.

---

## How It Works

1. **User deposits funds** — User deposits **USD₮** into the agent wallet (WDK programmable wallet).
2. **Agent analyzes videos** — Monitors view velocity, comment sentiment, engagement ratio, niche growth (LLM + simple ML scoring).
3. **Agent decides tipping** — Decides **which creator**, **when**, and **how much** to tip (e.g. engagement spike → tip $5).
4. **Creator receives tip** — Via **Rumble’s native tipping wallet**; no extra UX friction.

---

## Tech Stack

- **WDK (Tether Wallet Development Kit)** — Agent wallet: create wallet, hold USD₮, sign transactions, send tips.
- **OpenClaw** — Agent reasoning: observe metrics → analyze patterns → score growth potential → decide action → execute via WDK.
- **Browser extension** — Hover on Rumble video/creator cards to see **Alpha score**, suggested tip, and “Tip via Agent” in-context.

---

## Architecture

```
User → Deposit USD₮ → Agent Wallet (WDK)
         ↓
OpenClaw AI Agent (video analysis + reasoning)
         ↓
Tipping decision → Rumble Creator Wallet
```

---

## Hackathon Demo Flow

1. User deposits **50 USD₮** into the agent wallet  
2. Agent monitors Rumble videos (engagement, velocity)  
3. Engagement spike detected on a rising creator  
4. Agent decides **$5 tip**  
5. Transaction executes via **WDK**  
6. Creator receives tip on Rumble instantly  

---

## Bonus Features

- **Community tipping pool** — Multiple users deposit; agent allocates tips collectively  
- **Creator prediction leaderboard** — Top predicted creators, top tipped, agent accuracy  
- **Smart budget rules** — Max tip per creator, daily limit (e.g. $10 / $50)  
- **Reputation NFTs (optional)** — “Early Alpha Supporter” for early backers of big creators  

---

## Project Structure

- **Landing page** — This Next.js app; Connect Wallet (WDK EVM), Download extension CTA  
- **Extension** — Rumble overlay: hover on browse/watch → Alpha score + Tip via Agent  
- **Backend / agent** — OpenClaw + WDK for scoring and tipping (see `hack-info/` and `lib/wdk-evm.ts`)  

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set `WDK_SEED_PHRASE` in `.env.local` for Connect Wallet. See `hack-info/README.md` for full hackathon and WDK docs.

---

## Hackathon

Built for **Hackathon Galáctica: WDK Edition 1** — **Tipping Bot** track (Rumble + WDK + agents).  
Prizes: 1st 3,000 USD₮ · 2nd 2,000 USD₮. See `hack-info/README.md` for rules and tracks.
