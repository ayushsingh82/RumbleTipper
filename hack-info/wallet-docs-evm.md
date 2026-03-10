# WDK SDK & EVM Wallet Reference

Reference for Tether's Wallet Development Kit (WDK): SDK architecture, module types, and **EVM wallet** usage. Use this when integrating `@tetherto/wdk` and `@tetherto/wdk-wallet-evm`.

---

## Get Started — SDK Overview

The SDK is a **modular plug-in framework** for multi-chain wallet development.

**Principles:** self-custodial and stateless (keys never leave your app; WDK stores no data), **unified interface** (same API across chains), **cross-platform** (Node.js, React Native, embedded).

### Capabilities

- **Multi-Chain:** Bitcoin, Ethereum, TON, TRON, Solana, Spark, and more  
- **Account Abstraction:** Gasless transactions on supported chains  
- **DeFi Integration:** Swaps, bridges, lending via plug-in modules  
- **Extensible:** Custom modules for new chains or protocols  

### Module Types

| Type    | Purpose |
|---------|--------|
| **Core** | Main orchestrator and shared utilities |
| **Wallet** | Chain-specific wallet operations |
| **Swap** | Token swapping across DEXs |
| **Bridge** | Cross-chain asset transfers |
| **Lending** | DeFi lending and borrowing |

### Registration Flow

1. **Core** — Initialize WDK with a seed phrase.  
2. **Wallet** — Register wallet modules (e.g. EVM, BTC).  
3. **Protocol** — Optionally register swap/bridge/lending modules.

```javascript
import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerBtc from '@tetherto/wdk-wallet-btc'

const seedPhrase = WDK.getRandomSeedPhrase(24)  // or 12-word default
const wdk = new WDK(seedPhrase)
  .registerWallet('ethereum', WalletManagerEvm, { provider: 'https://eth.drpc.org' })
  .registerWallet('bitcoin', WalletManagerBtc, { provider: 'https://blockstream.info/api' })

// Optional: register protocol
// const wdkWithProtocols = wdk.registerProtocol('swap-velora-evm', SwapveloraEvm)
```

### Unified Operations

```javascript
const ethAccount = await wdk.getAccount('ethereum', 0)
const btcAccount = await wdk.getAccount('bitcoin', 0)

const ethBalance = await ethAccount.getBalance()
const btcBalance = await btcAccount.getBalance()

const ethTx = await ethAccount.sendTransaction({ to: '0x...', value: '1000000000000000000' })
const btcTx = await btcAccount.sendTransaction({ to: '1A1z...', value: 100000000 })
```

---

## Wallet Modules (What WDK Supports)

| Package | Chains |
|---------|--------|
| `@tetherto/wdk-wallet-evm` | Ethereum, Polygon, Arbitrum, etc. |
| `@tetherto/wdk-wallet-evm-erc4337` | EVM with no gas fees |
| `@tetherto/wdk-wallet-ton` | TON |
| `@tetherto/wdk-wallet-ton-gasless` | TON gasless |
| `@tetherto/wdk-wallet-btc` | Bitcoin |
| `@tetherto/wdk-wallet-tron` | TRON |
| `@tetherto/wdk-wallet-solana` | Solana |

**Protocol modules (examples):** `@tetherto/wdk-protocol-swap-paraswap-evm`, `@tetherto/wdk-protocol-bridge-usdt0-evm`, `@tetherto/wdk-protocol-lending-aave-evm`.

---

## EVM Wallet — @tetherto/wdk-wallet-evm

### Install

```bash
npm install @tetherto/wdk-wallet-evm
```

### Quick Start

```javascript
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const seedPhrase = 'your twelve word seed phrase here'  // Store securely
const wallet = new WalletManagerEvm(seedPhrase, {
  provider: 'https://rpc.mevblocker.io/fast',
  transferMaxFee: 100000000000000  // optional, wei
})

const account = await wallet.getAccount(0)
const address = await account.getAddress()
const balance = await account.getBalance()
```

### Accounts

- **Full account:** `wallet.getAccount(index)` — sign, send, transfer.  
- **Read-only:** `account.toReadOnlyAccount()` or `new WalletAccountReadOnlyEvm(address, config)` — balance/verify only.  
- **Custom path:** `wallet.getAccountByPath("0'/0/5")`.

### Balances

```javascript
// Native (ETH, MATIC, etc.)
const balance = await account.getBalance()

// ERC-20
const tokenBalance = await account.getTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7')  // USDT
const tokenBalances = await account.getTokenBalances([usdtAddress, xautAddress])
```

### Sending Transactions

```javascript
// Native transfer (EIP-1559)
const result = await account.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  value: 1000000000000000000n,  // 1 ETH wei
  maxFeePerGas: 30000000000,
  maxPriorityFeePerGas: 2000000000
})

// Quote first
const quote = await account.quoteSendTransaction({ to: '0x...', value: 1000000000000000000n })
```

### ERC-20 Transfers

```javascript
const transferResult = await account.transfer({
  token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',  // USDT
  recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: 1000000000000000000n
})
const transferQuote = await account.quoteTransfer({ token, recipient, amount })
```

### Message Signing

```javascript
const signature = await account.sign('Hello, Ethereum!')
const readOnly = await account.toReadOnlyAccount()
const isValid = await readOnly.verify(message, signature)
```

### Fee Management

```javascript
const feeRates = await wallet.getFeeRates()
// feeRates.normal, feeRates.fast
await account.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n,
  maxFeePerGas: feeRates.fast,
  maxPriorityFeePerGas: 2000000000n
})
```

### Memory Management

```javascript
account.dispose()
wallet.dispose()
```

---

## EVM Wallet Configuration

```javascript
const config = {
  provider: 'https://eth.drpc.org',           // or EIP-1193 provider (e.g. window.ethereum)
  transferMaxFee: 100000000000000n            // optional, max fee in wei
}
const wallet = new WalletManagerEvm(seedPhrase, config)
```

**Provider:** `string` (RPC URL) or EIP-1193 provider.  
**transferMaxFee:** optional; aborts transfer if fee estimate exceeds this (wei).

### Network Examples

| Network | Provider URL (example) |
|---------|------------------------|
| Ethereum Mainnet | `https://eth.drpc.org` |
| Polygon | `https://polygon-rpc.com` |
| Arbitrum | `https://arb1.arbitrum.io/rpc` |
| BSC | `https://bsc-dataseed.binance.org` |
| Avalanche C-Chain | `https://avalanche-c-chain-rpc.publicnode.com` |
| Plasma | `https://plasma.drpc.org` |
| Stable (USD₮ gas) | `https://rpc.stable.xyz` |
| Sepolia Testnet | `https://sepolia.drpc.org` |

---

## Error Handling

- **Exceeded maximum fee** — transfer estimate &gt; `transferMaxFee`.  
- **insufficient funds** — not enough native token for gas or amount.  
- Validate addresses (0x, 42 chars) and token balance before transferring.

---

## Reference

- Official docs: [https://docs.wallet.tether.io](https://docs.wallet.tether.io)  
- EVM config: see WDK docs for `WalletManagerEvm` and `WalletAccountEvm` options.
