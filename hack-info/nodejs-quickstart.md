# Node.js & Bare Quickstart

Get started with WDK in Node.js or Bare runtime environments in 3 minutes.

---

## What You'll Build

In this quickstart, you'll create a simple application that:

- Sets up WDK with multiple blockchain wallets (EVM, Bitcoin, TRON)
- Generates a new secret phrase (seed phrase)
- Resolves addresses across different chains
- Checks balances and estimates transaction costs
- Sends transactions on multiple blockchains

> **Want to build faster?** Connect your AI coding assistant to WDK docs for context-aware help. [Learn how →](build-with-ai.md)

---

## Prerequisites

| Tool | Version | Why You Need It |
|------|---------|-----------------|
| **Node.js** | 20+ | To run JavaScript code |
| **npm** | Latest | To install packages |
| **Code Editor** | Any | To write code |

You can try all features without real funds required. You can use the Pimlico or Candide faucets to get some Sepolia USD₮.

- [Get mock/test USD₮ on Pimlico](https://pimlico.io)
- [Get mock/test USD₮ on Candide](https://candide.dev)

See the configuration for quick setup and Sepolia testnet configuration.

---

## Step 1: Set Up Your Project

Create a folder and initialize the project:

```bash
mkdir wdk-quickstart && cd wdk-quickstart && npm init -y && npm pkg set type=module
```

Then install necessary WDK modules:

```bash
npm install @tetherto/wdk @tetherto/wdk-wallet-evm @tetherto/wdk-wallet-tron @tetherto/wdk-wallet-btc
```

**WDK modules used:**

- `@tetherto/wdk` — The main SDK module
- `@tetherto/wdk-wallet-evm` — Ethereum and EVM-compatible chains support
- `@tetherto/wdk-wallet-tron` — TRON blockchain support
- `@tetherto/wdk-wallet-btc` — Bitcoin blockchain support

---

## Step 2: Create Your First Wallet

Create a file called `app.js`:

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')

  try {
    // Your code will go here
  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

main()
```

### Generate a seed phrase

```javascript
try {
  const seedPhrase = WDK.getRandomSeedPhrase()
  console.log('Generated seed phrase:', seedPhrase)
} catch (error) {
  console.error('Application error:', error.message)
}
```

### Register wallets for different blockchains

```javascript
console.log('Registering wallets...')

const wdkWithWallets = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, {
    provider: 'https://eth.drpc.org'
  })
  .registerWallet('tron', WalletManagerTron, {
    provider: 'https://api.trongrid.io'
  })
  .registerWallet('bitcoin', WalletManagerBtc, {
    network: 'mainnet',
    host: 'electrum.blockstream.info',
    port: 50001
  })

console.log('Wallets registered for Ethereum, TRON, and Bitcoin')
```

Config references:

- [Configuring @tetherto/wdk-wallet-evm](https://docs.wallet.tether.io)
- [Configuring @tetherto/wdk-wallet-tron](https://docs.wallet.tether.io)
- [Configuring @tetherto/wdk-wallet-btc](https://docs.wallet.tether.io)

---

## Step 3: Check Balances

Get accounts and addresses for all blockchains:

```javascript
console.log('Retrieving accounts...')

const accounts = {
  ethereum: await wdkWithWallets.getAccount('ethereum', 0),
  tron: await wdkWithWallets.getAccount('tron', 0),
  bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
}

console.log('Resolving addresses:')

for (const [chain, account] of Object.entries(accounts)) {
  const address = await account.getAddress()
  console.log(`   ${chain.toUpperCase()}: ${address}`)
}
```

Check balances across all chains:

```javascript
console.log('Checking balances...')

for (const [chain, account] of Object.entries(accounts)) {
  const balance = await account.getBalance()
  console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
}
```

---

## Complete app.js

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

async function main() {
  console.log('Starting WDK App...')

  try {
    const seedPhrase = WDK.getRandomSeedPhrase()
    console.log('Generated seed phrase:', seedPhrase)

    console.log('Registering wallets...')

    const wdkWithWallets = new WDK(seedPhrase)
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: 'https://eth.drpc.org'
      })
      .registerWallet('tron', WalletManagerTron, {
        provider: 'https://api.trongrid.io'
      })
      .registerWallet('bitcoin', WalletManagerBtc, {
        network: 'mainnet',
        host: 'electrum.blockstream.info',
        port: 50001
      })

    console.log('Wallets registered for Ethereum, TRON, and Bitcoin')

    const accounts = {
      ethereum: await wdkWithWallets.getAccount('ethereum', 0),
      tron: await wdkWithWallets.getAccount('tron', 0),
      bitcoin: await wdkWithWallets.getAccount('bitcoin', 0)
    }

    console.log('Resolving addresses:')

    for (const [chain, account] of Object.entries(accounts)) {
      const address = await account.getAddress()
      console.log(`   ${chain.toUpperCase()}: ${address}`)
    }

    console.log('Checking balances...')

    for (const [chain, account] of Object.entries(accounts)) {
      const balance = await account.getBalance()
      console.log(`   ${chain.toUpperCase()}: ${balance.toString()} units`)
    }

    console.log('Application completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Application error:', error.message)
    process.exit(1)
  }
}

main()
```

---

## Step 4: Run Your App

```bash
node app.js
```

**Example output:**

```
Starting WDK App...
Generated seed phrase: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
Registering wallets...
Wallets registered for Ethereum, TRON, and Bitcoin
Resolving addresses:
   ETHEREUM: 0x742d35Cc6634C0532925a3b8D9C5c8b7b6e5f6e5
   TRON: TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH
   BITCOIN: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Checking balances...
   ETHEREUM: 0 units
   TRON: 0 units
   BITCOIN: 0 units
Application completed successfully!
```

---

## What Just Happened?

- You generated a single seed phrase that works across all blockchains
- You registered wallets for Ethereum, TRON, and Bitcoin
- You created accounts derived from the same seed phrase using BIP-44
- You used the same API to interact with different blockchains
- You checked balances across multiple chains with consistent methods

---

## Next Steps

### Add More Blockchains (e.g. Solana)

```bash
npm install @tetherto/wdk-wallet-solana
```

```javascript
import WalletManagerSolana from '@tetherto/wdk-wallet-solana'

const wdk = new WDK(seedPhrase)

wdk.registerWallet('solana', WalletManagerSolana, {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  wsUrl: 'wss://api.mainnet-beta.solana.com'
})
```

### Estimate Transaction Costs

```javascript
for (const [chain, account] of Object.entries(accounts)) {
  try {
    const quote = await account.quoteSendTransaction({
      to: await account.getAddress(),
      value: chain === 'bitcoin' ? 100000000n : chain === 'tron' ? 1000000n : 1000000000000000000n
    })
    console.log(`   ${chain.toUpperCase()}: ${quote.fee.toString()} units`)
  } catch (error) {
    console.log(`   ${chain.toUpperCase()}: Unable to estimate`)
  }
}
```

### Send Transactions

```javascript
const result = await ethAccount.sendTransaction({
  to: '0x742d35Cc6634C05...a3b8D9C5c8b7b6e5f6e5',
  value: 1000000000000000000n // 1 ETH
})

console.log('Transaction hash:', result.hash)
```

### Use DeFi Protocols

```bash
npm install @tetherto/wdk-protocol-swap-velora-evm
```

```javascript
import VeloraProtocolEvm from '@tetherto/wdk-protocol-swap-velora-evm'

wdk.registerProtocol('ethereum', 'swap-velora-evm', VeloraProtocolEvm, {
  provider: 'https://eth.drpc.org'
})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Provider not connected"** | Check API keys and network connections; ensure correct provider URLs |
| **"Insufficient balance"** | Normal for new addresses; use testnet faucets for test tokens |
| **"Module not found"** | Install all required packages; verify import statements |

**Need more help?** See [WDK documentation](https://docs.wallet.tether.io) or community channels.
