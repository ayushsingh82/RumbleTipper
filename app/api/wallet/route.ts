import { NextResponse } from "next/server";

const WEI_PER_ETH = BigInt(10) ** BigInt(18);

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  5: "Goerli",
  11155111: "Sepolia",
  137: "Polygon",
  80001: "Mumbai",
  42161: "Arbitrum One",
  10: "Optimism",
  56: "BNB Chain",
  43114: "Avalanche C-Chain",
  8453: "Base",
  84532: "Base Sepolia",
  324: "zkSync Era",
  204: "opBNB",
};

async function getChainIdAndName(rpcUrl: string): Promise<{ chainId: number; network: string }> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
    });
    const data = await res.json();
    const hex = data?.result;
    const chainId = hex ? parseInt(hex, 16) : 0;
    const network = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
    return { chainId, network };
  } catch {
    return { chainId: 0, network: "Unknown" };
  }
}

// Use Node.js runtime so native addons (sodium-native) can load
export const runtime = "nodejs";

function jsonError(message: string) {
  return NextResponse.json({ connected: false, error: message }, { status: 200 });
}

export async function GET() {
  try {
    const {
      createWdkEvmFromEnv,
      getEvmAddress,
      getEvmBalance,
    } = await import("@/lib/wdk-evm");

    const wdk = createWdkEvmFromEnv();
    const rpcUrl = process.env.WDK_RPC_URL ?? "https://sepolia.base.org";

    const [address, balanceWei, chainInfo] = await Promise.all([
      getEvmAddress(wdk, 0),
      getEvmBalance(wdk, 0),
      getChainIdAndName(rpcUrl),
    ]);

    const balanceEth = Number((balanceWei * BigInt(10000)) / WEI_PER_ETH) / 10000;
    return NextResponse.json({
      connected: true,
      address,
      balanceWei: balanceWei.toString(),
      balanceEth,
      network: chainInfo.network,
      chainId: chainInfo.chainId,
    });
  } catch (err) {
    let message = err instanceof Error ? err.message : "Wallet not configured";
    const full = err instanceof Error ? `${err.message} ${err.stack ?? ""} ${err.cause ? String(err.cause) : ""}` : String(err);
    // Suggest fix for native addon (sodium-native) load failure
    if (
      full.includes("sodium-native") ||
      full.includes("Cannot find addon") ||
      full.includes("binding.js")
    ) {
      message =
        "Native crypto module failed to load. Run: npm rebuild sodium-native. Then restart the dev server.";
    }
    return jsonError(message);
  }
}
