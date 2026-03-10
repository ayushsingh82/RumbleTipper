/**
 * WDK EVM wallet integration — Tether Wallet Development Kit + @tetherto/wdk-wallet-evm
 *
 * Use from API routes or server-side only. Never expose seed phrase to the client.
 * See hack-info/wallet-docs-evm.md for full reference.
 */

import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";

const DEFAULT_PROVIDER = "https://eth.drpc.org";
const CHAIN_ID = "ethereum";

export type WdkEvmConfig = {
  /** 12- or 24-word seed phrase. Prefer env WDK_SEED_PHRASE in production. */
  seedPhrase: string;
  /** RPC URL or EIP-1193 provider. Default: https://eth.drpc.org */
  provider?: string;
  /** Max fee in wei for transfers (optional). */
  transferMaxFee?: bigint | number;
};

/**
 * Builds a WDK instance with only the EVM wallet registered.
 * Use getAccount('ethereum', index) for EVM operations.
 */
export function createWdkEvm(config: WdkEvmConfig) {
  const { seedPhrase, provider = DEFAULT_PROVIDER, transferMaxFee } = config;
  const wdk = new WDK(seedPhrase).registerWallet(CHAIN_ID, WalletManagerEvm, {
    provider,
    ...(transferMaxFee !== undefined && { transferMaxFee: Number(transferMaxFee) }),
  });
  return wdk;
}

/**
 * Creates WDK EVM from environment.
 * Expects: WDK_SEED_PHRASE, optional WDK_RPC_URL, optional WDK_TRANSFER_MAX_FEE (wei string).
 */
export function createWdkEvmFromEnv() {
  const seedPhrase = process.env.WDK_SEED_PHRASE;
  if (!seedPhrase) {
    throw new Error("WDK_SEED_PHRASE is required for WDK EVM");
  }
  const provider = process.env.WDK_RPC_URL ?? DEFAULT_PROVIDER;
  const transferMaxFee = process.env.WDK_TRANSFER_MAX_FEE
    ? BigInt(process.env.WDK_TRANSFER_MAX_FEE)
    : undefined;
  return createWdkEvm({ seedPhrase, provider, transferMaxFee });
}

/**
 * Get EVM account by index (BIP-44 path 0'/0/index).
 */
export async function getEvmAccount(
  wdk: ReturnType<typeof createWdkEvm>,
  index: number = 0
) {
  return wdk.getAccount(CHAIN_ID, index);
}

/**
 * Get address for EVM account index.
 */
export async function getEvmAddress(
  wdk: ReturnType<typeof createWdkEvm>,
  index: number = 0
): Promise<string> {
  const account = await getEvmAccount(wdk, index);
  return account.getAddress();
}

/**
 * Get native balance (ETH, etc.) in wei.
 */
export async function getEvmBalance(
  wdk: ReturnType<typeof createWdkEvm>,
  index: number = 0
): Promise<bigint> {
  const account = await getEvmAccount(wdk, index);
  const balance = await account.getBalance();
  return typeof balance === "bigint" ? balance : BigInt(String(balance));
}

/**
 * Get ERC-20 token balance (amount in token base units).
 */
export async function getEvmTokenBalance(
  wdk: ReturnType<typeof createWdkEvm>,
  tokenAddress: string,
  index: number = 0
): Promise<bigint> {
  const account = await getEvmAccount(wdk, index);
  const balance = await account.getTokenBalance(tokenAddress);
  return typeof balance === "bigint" ? balance : BigInt(String(balance));
}

/**
 * Quote native send (estimate fee in wei).
 */
export async function quoteEvmSend(
  wdk: ReturnType<typeof createWdkEvm>,
  params: { to: string; value: bigint; accountIndex?: number }
) {
  const account = await getEvmAccount(wdk, params.accountIndex ?? 0);
  const quote = await account.quoteSendTransaction({
    to: params.to,
    value: params.value,
  });
  return quote;
}

/**
 * Send native token (ETH, etc.). Returns tx hash and fee.
 */
export async function sendEvmTransaction(
  wdk: ReturnType<typeof createWdkEvm>,
  params: {
    to: string;
    value: bigint;
    accountIndex?: number;
    maxFeePerGas?: bigint | number;
    maxPriorityFeePerGas?: bigint | number;
    data?: string;
    gasLimit?: number;
  }
) {
  const account = await getEvmAccount(wdk, params.accountIndex ?? 0);
  const result = await account.sendTransaction({
    to: params.to,
    value: params.value,
    ...(params.maxFeePerGas !== undefined && { maxFeePerGas: Number(params.maxFeePerGas) }),
    ...(params.maxPriorityFeePerGas !== undefined && {
      maxPriorityFeePerGas: Number(params.maxPriorityFeePerGas),
    }),
    ...(params.data !== undefined && { data: params.data }),
    ...(params.gasLimit !== undefined && { gasLimit: params.gasLimit }),
  });
  return result;
}

/**
 * Transfer ERC-20 tokens. Returns tx hash and fee.
 */
export async function transferEvmToken(
  wdk: ReturnType<typeof createWdkEvm>,
  params: {
    token: string;
    recipient: string;
    amount: bigint;
    accountIndex?: number;
  }
) {
  const account = await getEvmAccount(wdk, params.accountIndex ?? 0);
  const result = await account.transfer({
    token: params.token,
    recipient: params.recipient,
    amount: params.amount,
  });
  return result;
}

/**
 * Sign a message with the EVM account (EIP-191 / personal_sign).
 */
export async function signEvmMessage(
  wdk: ReturnType<typeof createWdkEvm>,
  message: string,
  accountIndex: number = 0
): Promise<string> {
  const account = await getEvmAccount(wdk, accountIndex);
  return account.sign(message);
}
