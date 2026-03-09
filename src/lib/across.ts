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

export async function fetchDeposits(limit = 500): Promise<AcrossDeposit[]> {
  const res = await fetch(`${BASE_URL}/deposits?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch deposits");
  return res.json();
}

/** Fetch all data in one request via our cached server-side proxy */
export async function fetchAllData(): Promise<{
  chains: AcrossChain[];
  tokens: AcrossToken[];
  deposits: AcrossDeposit[];
}> {
  const res = await fetch("/api/data");
  if (!res.ok) throw new Error("Failed to fetch data");
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

// The Across API logo URLs are broken (404). Use DefiLlama's CDN instead.
const CHAIN_LOGO_OVERRIDES: Record<number, string> = {
  1: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
  10: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg",
  56: "https://icons.llamao.fi/icons/chains/rsz_bsc.jpg",
  130: "https://icons.llamao.fi/icons/chains/rsz_unichain.jpg",
  137: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
  143: "https://icons.llamao.fi/icons/chains/rsz_monad.jpg",
  232: "https://icons.llamao.fi/icons/chains/rsz_lens.jpg",
  324: "https://icons.llamao.fi/icons/chains/rsz_zksync%20era.jpg",
  480: "https://icons.llamao.fi/icons/chains/rsz_world%20chain.jpg",
  999: "https://icons.llamao.fi/icons/chains/rsz_hyperevm.jpg",
  1135: "https://icons.llamao.fi/icons/chains/rsz_lisk.jpg",
  1868: "https://icons.llamao.fi/icons/chains/rsz_soneium.jpg",
  4326: "https://icons.llamao.fi/icons/chains/rsz_megaeth.jpg",
  8453: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
  9745: "https://icons.llamao.fi/icons/chains/rsz_plasma.jpg",
  34443: "https://icons.llamao.fi/icons/chains/rsz_mode.jpg",
  42161: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",
  57073: "https://icons.llamao.fi/icons/chains/rsz_ink.jpg",
  59144: "https://icons.llamao.fi/icons/chains/rsz_linea.jpg",
  81457: "https://icons.llamao.fi/icons/chains/rsz_blast.jpg",
  534352: "https://icons.llamao.fi/icons/chains/rsz_scroll.jpg",
  7777777: "https://icons.llamao.fi/icons/chains/rsz_zora.jpg",
  34268394551451: "https://icons.llamao.fi/icons/chains/rsz_solana.jpg",
  // Local assets for chains not on DefiLlama
  1337: "/logos/hypercore.png",
  2337: "/logos/lighter.png",
};

export function buildChainMap(chains: AcrossChain[]): ChainMap {
  const map = new Map<number, AcrossChain>();
  for (const chain of chains) {
    const logo = CHAIN_LOGO_OVERRIDES[chain.chainId];
    if (logo) {
      chain.logoUrl = logo;
    }
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
