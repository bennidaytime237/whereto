import type {
  AcrossDeposit,
  ChainStats,
  TokenStats,
  RouteStats,
  OverviewStats,
} from "./types";
import type { ChainMap, TokenMap } from "./across";

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

export function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getDepositVolumeUsd(deposit: AcrossDeposit, tokenMap: TokenMap): number {
  // Use pre-calculated USD price if available
  if (deposit.inputPriceUsd && deposit.inputAmount) {
    const token = tokenMap.get(
      `${deposit.originChainId}-${deposit.inputToken.toLowerCase()}`
    );
    const decimals = token?.decimals ?? 18;
    const amount = Number(deposit.inputAmount) / 10 ** decimals;
    return amount * Number(deposit.inputPriceUsd);
  }
  return 0;
}

function getBridgeTimeSec(deposit: AcrossDeposit): number | null {
  if (!deposit.fillBlockTimestamp || !deposit.depositBlockTimestamp) return null;
  const fill = new Date(deposit.fillBlockTimestamp).getTime();
  const dep = new Date(deposit.depositBlockTimestamp).getTime();
  const diff = (fill - dep) / 1000;
  return diff >= 0 ? diff : null;
}

export function computeOverviewStats(
  deposits: AcrossDeposit[],
  tokenMap: TokenMap
): OverviewStats {
  let totalVolumeUsd = 0;
  let bridgeTimeSum = 0;
  let bridgeTimeCount = 0;
  const chains = new Set<number>();

  for (const d of deposits) {
    totalVolumeUsd += getDepositVolumeUsd(d, tokenMap);
    chains.add(d.originChainId);
    chains.add(d.destinationChainId);
    const bt = getBridgeTimeSec(d);
    if (bt !== null) {
      bridgeTimeSum += bt;
      bridgeTimeCount++;
    }
  }

  return {
    totalVolumeUsd,
    totalTransactions: deposits.length,
    avgBridgeTimeSec: bridgeTimeCount > 0 ? bridgeTimeSum / bridgeTimeCount : 0,
    uniqueChains: chains.size,
  };
}

export function computeChainLeaderboard(
  deposits: AcrossDeposit[],
  chainMap: ChainMap,
  tokenMap: TokenMap,
  recentDeposits: AcrossDeposit[] = []
): ChainStats[] {
  const stats = new Map<
    number,
    { txCount: number; volumeUsd: number; bridgeTimeSum: number; bridgeTimeCount: number }
  >();

  for (const d of deposits) {
    const chainId = d.destinationChainId;
    const entry = stats.get(chainId) ?? {
      txCount: 0,
      volumeUsd: 0,
      bridgeTimeSum: 0,
      bridgeTimeCount: 0,
    };
    entry.txCount++;
    entry.volumeUsd += getDepositVolumeUsd(d, tokenMap);
    const bt = getBridgeTimeSec(d);
    if (bt !== null) {
      entry.bridgeTimeSum += bt;
      entry.bridgeTimeCount++;
    }
    stats.set(chainId, entry);
  }

  // Count recent tx per destination chain
  const recentCounts = new Map<number, number>();
  for (const d of recentDeposits) {
    recentCounts.set(d.destinationChainId, (recentCounts.get(d.destinationChainId) ?? 0) + 1);
  }

  const entries = Array.from(stats.entries()).map(([chainId, s]) => {
    const chain = chainMap.get(chainId);
    return {
      chainId,
      name: chain?.name ?? `Chain ${chainId}`,
      logoUrl: chain?.logoUrl ?? "",
      explorerUrl: chain?.explorerUrl ?? "",
      txCount: s.txCount,
      volumeUsd: s.volumeUsd,
      avgBridgeTimeSec: s.bridgeTimeCount > 0 ? s.bridgeTimeSum / s.bridgeTimeCount : 0,
      volumeShare: 0,
      txShare: 0,
      recentTxCount: recentCounts.get(chainId) ?? 0,
    };
  });

  const totalVolume = entries.reduce((sum, e) => sum + e.volumeUsd, 0);
  const totalTx = entries.reduce((sum, e) => sum + e.txCount, 0);

  for (const e of entries) {
    e.volumeShare = totalVolume > 0 ? e.volumeUsd / totalVolume : 0;
    e.txShare = totalTx > 0 ? e.txCount / totalTx : 0;
  }

  return entries.sort((a, b) => b.volumeUsd - a.volumeUsd);
}

export function computeTokenLeaderboard(
  deposits: AcrossDeposit[],
  tokenMap: TokenMap
): TokenStats[] {
  const stats = new Map<string, { logoUrl: string; txCount: number; volumeUsd: number }>();

  for (const d of deposits) {
    const token = tokenMap.get(
      `${d.originChainId}-${d.inputToken.toLowerCase()}`
    );
    const symbol = token?.symbol ?? "Unknown";
    const entry = stats.get(symbol) ?? {
      logoUrl: token?.logoUrl ?? "",
      txCount: 0,
      volumeUsd: 0,
    };
    entry.txCount++;
    entry.volumeUsd += getDepositVolumeUsd(d, tokenMap);
    stats.set(symbol, entry);
  }

  return Array.from(stats.entries())
    .map(([symbol, s]) => ({ symbol, ...s }))
    .sort((a, b) => b.volumeUsd - a.volumeUsd);
}

export function computeRouteLeaderboard(
  deposits: AcrossDeposit[],
  chainMap: ChainMap,
  tokenMap: TokenMap
): RouteStats[] {
  const stats = new Map<string, { txCount: number; volumeUsd: number }>();

  for (const d of deposits) {
    const key = `${d.originChainId}-${d.destinationChainId}`;
    const entry = stats.get(key) ?? { txCount: 0, volumeUsd: 0 };
    entry.txCount++;
    entry.volumeUsd += getDepositVolumeUsd(d, tokenMap);
    stats.set(key, entry);
  }

  return Array.from(stats.entries())
    .map(([key, s]) => {
      const [origin, dest] = key.split("-").map(Number);
      const originChain = chainMap.get(origin);
      const destChain = chainMap.get(dest);
      return {
        originChainId: origin,
        originName: originChain?.name ?? `Chain ${origin}`,
        originLogoUrl: originChain?.logoUrl ?? "",
        destinationChainId: dest,
        destinationName: destChain?.name ?? `Chain ${dest}`,
        destinationLogoUrl: destChain?.logoUrl ?? "",
        txCount: s.txCount,
        volumeUsd: s.volumeUsd,
      };
    })
    .sort((a, b) => b.volumeUsd - a.volumeUsd);
}
