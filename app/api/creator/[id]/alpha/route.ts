import { NextResponse } from "next/server";
import { getAlphaScore } from "@/lib/creator-score";
import { corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET /api/creator/[id]/alpha
 * Returns alpha score, metrics, and suggested tip for a creator.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing creator id" }, { status: 400, headers: corsHeaders() });
  }

  const data = getAlphaScore(id);
  return NextResponse.json(data, { headers: corsHeaders() });
}
