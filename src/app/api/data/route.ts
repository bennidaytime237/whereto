import { NextResponse } from "next/server";

const ACROSS_BASE = "https://app.across.to/api";
const DEPOSIT_LIMIT = 500;

// Cache the response for 30 seconds server-side
export const revalidate = 30;

export async function GET() {
  try {
    const [chainsRes, tokensRes, depositsRes] = await Promise.all([
      fetch(`${ACROSS_BASE}/swap/chains`, { next: { revalidate: 300 } }), // chains rarely change
      fetch(`${ACROSS_BASE}/swap/tokens`, { next: { revalidate: 300 } }), // tokens rarely change
      fetch(`${ACROSS_BASE}/deposits?limit=${DEPOSIT_LIMIT}`, {
        next: { revalidate: 30 },
      }),
    ]);

    if (!chainsRes.ok) throw new Error("Failed to fetch chains");
    if (!tokensRes.ok) throw new Error("Failed to fetch tokens");
    if (!depositsRes.ok) throw new Error("Failed to fetch deposits");

    const [chains, tokens, deposits] = await Promise.all([
      chainsRes.json(),
      tokensRes.json(),
      depositsRes.json(),
    ]);

    return NextResponse.json(
      { chains, tokens, deposits },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}
