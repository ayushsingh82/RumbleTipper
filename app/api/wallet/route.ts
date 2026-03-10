import { NextResponse } from "next/server";

const WEI_PER_ETH = 10n ** 18n;

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
    const [address, balanceWei] = await Promise.all([
      getEvmAddress(wdk, 0),
      getEvmBalance(wdk, 0),
    ]);
    const balanceEth = Number((balanceWei * 10000n) / WEI_PER_ETH) / 10000;
    return NextResponse.json({
      connected: true,
      address,
      balanceWei: balanceWei.toString(),
      balanceEth,
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
