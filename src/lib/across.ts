import type { AcrossChain, AcrossToken, AcrossDeposit } from "./types";

const BASE_URL = "https://app.across.to/api";

export async function fetchChains(): Promise<AcrossChain[]> {
  const res = await fetch(`${BASE_URL}/swap/chains`);
  if (!res.ok) throw new Error("Failed to fetch chains");
  return res.json();
}

export async function fetchTokens(): Promise<AcrossToken[]> {
  const res = await fetch(`${BASE_URL}/swap/tokens`);
  if (!res.ok) throw new Error("Failed to fetch tokens");
  return res.json();
}

export async function fetchDeposits(limit = 1000): Promise<AcrossDeposit[]> {
  const res = await fetch(`${BASE_URL}/deposits?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch deposits");
  return res.json();
}

/** Filter deposits to only those within the last `hours` hours */
export function filterDepositsLastHours(
  deposits: AcrossDeposit[],
  hours: number
): AcrossDeposit[] {
  const cutoff = Date.now() - hours * 3600_000;
  return deposits.filter(
    (d) => new Date(d.depositBlockTimestamp).getTime() >= cutoff
  );
}

export type ChainMap = Map<number, AcrossChain>;
export type TokenMap = Map<string, AcrossToken>; // key: `${chainId}-${address.toLowerCase()}`

export function buildChainMap(chains: AcrossChain[]): ChainMap {
  const map = new Map<number, AcrossChain>();
  for (const chain of chains) {
    map.set(chain.chainId, chain);
  }
  return map;
}

export function buildTokenMap(tokens: AcrossToken[]): TokenMap {
  const map = new Map<string, AcrossToken>();
  for (const token of tokens) {
    map.set(`${token.chainId}-${token.address.toLowerCase()}`, token);
  }
  return map;
}
