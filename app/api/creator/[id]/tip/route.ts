import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, erc20Abi, formatEther, http, parseEther } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const DEFAULT_MAX_ETH = 0.05;
const USDT_DECIMALS = 1_000_000;
const FIXED_RECIPIENT = "0xB822B51A88E8a03fCe0220B15Cb2C662E42Adec1";

function normalizeToken(token: unknown): "ETH" | "USDT" {
  if (typeof token !== "string") return "ETH";
  const t = token.trim().toUpperCase();
  if (t === "USDT" || t === "USD₮") return "USDT";
  return "ETH";
}

/**
 * POST /api/creator/[id]/tip
 * Body: { amount: number, token?: "ETH" | "USDT" | "USD₮", recipient: string (0x... address) }
 * Sends native ETH or USDT on the chain configured by WDK_RPC_URL (Base Sepolia for testing).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing creator id" }, { status: 400, headers: corsHeaders() });
  }

  let body: { amount?: number; token?: string; recipient?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders() });
  }

  const amount = body?.amount;
  const token = normalizeToken(body?.token);
  const recipient = FIXED_RECIPIENT;

  const maxPerTipEth = Number(process.env.RUMBLETIPPER_MAX_PER_TIP_ETH ?? DEFAULT_MAX_ETH);
  if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "amount must be a finite number > 0" }, { status: 400, headers: corsHeaders() });
  }
  if (token === "ETH" && amount > maxPerTipEth) {
    return NextResponse.json(
      { error: `ETH amount must be between 0 and ${maxPerTipEth}` },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const seedPhrase = process.env.WDK_SEED_PHRASE;
    if (!seedPhrase) {
      return NextResponse.json({ error: "WDK_SEED_PHRASE is required" }, { status: 400, headers: corsHeaders() });
    }
    const rpcUrl = process.env.WDK_RPC_URL ?? "https://sepolia.base.org";
    const account = mnemonicToAccount(seedPhrase);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) });
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(rpcUrl) });
    let result: { hash: string };

    if (token === "USDT") {
      const tokenAddress = process.env.WDK_USDT_CONTRACT;
      if (!tokenAddress) {
        return NextResponse.json(
          { error: "WDK_USDT_CONTRACT is required for USDT tips on current network" },
          { status: 400, headers: corsHeaders() }
        );
      }
      const amountRaw = BigInt(Math.round(amount * USDT_DECIMALS));
      if (amountRaw <= BigInt(0)) {
        return NextResponse.json({ error: "Invalid USDT amount" }, { status: 400, headers: corsHeaders() });
      }
      const hash = await walletClient.writeContract({
        chain: baseSepolia,
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient as `0x${string}`, amountRaw],
      });
      result = { hash };
    } else {
      let valueWei: bigint;
      try {
        valueWei = parseEther(amount.toString());
      } catch {
        return NextResponse.json({ error: "Invalid ETH amount" }, { status: 400, headers: corsHeaders() });
      }
      const hash = await walletClient.sendTransaction({
        account,
        chain: baseSepolia,
        to: recipient,
        value: valueWei,
      });
      result = { hash };
    }

    const postBalance = await publicClient.getBalance({ address: account.address });

    return NextResponse.json(
      {
        ok: true,
        creatorId: id,
        amount,
        amountEth: token === "ETH" ? amount : undefined,
        token,
        txHash: result.hash,
        recipient,
        sender: account.address,
        senderBalanceEth: Number(formatEther(postBalance)),
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tip failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders() });
  }
}
