import { NextResponse } from "next/server";
import { parseEther } from "viem";
import { corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const DEFAULT_MAX_ETH = 0.05;

/**
 * POST /api/creator/[id]/tip
 * Body: { amount: number (ETH), recipient: string (0x... address) }
 * Sends native ETH on the chain configured by WDK_RPC_URL (use Base Sepolia for testing).
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

  const maxPerTip = Number(process.env.RUMBLETIPPER_MAX_PER_TIP_ETH ?? DEFAULT_MAX_ETH);
  if (typeof amount !== "number" || amount <= 0 || amount > maxPerTip || !Number.isFinite(amount)) {
    return NextResponse.json(
      { error: `amount must be a finite ETH amount between 0 and ${maxPerTip}` },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (!recipient || typeof recipient !== "string" || !recipient.startsWith("0x") || recipient.length !== 42) {
    return NextResponse.json(
      { error: "recipient must be a valid 0x Ethereum address" },
      { status: 400, headers: corsHeaders() }
    );
  }

  let valueWei: bigint;
  try {
    valueWei = parseEther(amount.toString());
  } catch {
    return NextResponse.json({ error: "Invalid ETH amount" }, { status: 400, headers: corsHeaders() });
  }

  try {
    const { createWdkEvmFromEnv, sendEvmTransaction } = await import("@/lib/wdk-evm");

    const wdk = createWdkEvmFromEnv();
    const result = await sendEvmTransaction(wdk, {
      to: recipient,
      value: valueWei,
      accountIndex: 0,
    });

    return NextResponse.json(
      {
        ok: true,
        creatorId: id,
        amount,
        amountEth: amount,
        token: "ETH",
        txHash: result.hash,
        recipient,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tip failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders() });
  }
}
