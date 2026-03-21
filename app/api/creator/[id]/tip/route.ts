import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// USDT has 6 decimals. 1 USD = 1e6 units.
const USDT_DECIMALS = 1_000_000;

// Default mainnet USDT (Ethereum). Override with WDK_USDT_CONTRACT for testnet.
const DEFAULT_USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

/**
 * POST /api/creator/[id]/tip
 * Body: { amount: number (USD), recipient: string (0x... address) }
 * Sends amount USDT from agent wallet to recipient via WDK.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing creator id" }, { status: 400, headers: corsHeaders() });
  }

  let body: { amount?: number; recipient?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders() });
  }

  const amount = body?.amount;
  const recipient = body?.recipient;

  const maxPerTip = Number(process.env.RUMBLETIPPER_MAX_PER_TIP_USD) || 1000;
  if (typeof amount !== "number" || amount <= 0 || amount > maxPerTip) {
    return NextResponse.json(
      { error: `amount must be a number between 0 and ${maxPerTip}` },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (!recipient || typeof recipient !== "string" || !recipient.startsWith("0x") || recipient.length !== 42) {
    return NextResponse.json(
      { error: "recipient must be a valid 0x Ethereum address" },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const { createWdkEvmFromEnv, transferEvmToken } = await import("@/lib/wdk-evm");

    const wdk = createWdkEvmFromEnv();
    const tokenAddress = process.env.WDK_USDT_CONTRACT ?? DEFAULT_USDT;
    const amountRaw = BigInt(Math.round(amount * USDT_DECIMALS));

    const result = await transferEvmToken(wdk, {
      token: tokenAddress,
      recipient,
      amount: amountRaw,
      accountIndex: 0,
    });

    return NextResponse.json(
      { ok: true, creatorId: id, amount, txHash: result.hash, recipient },
      { headers: corsHeaders() }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tip failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders() });
  }
}
