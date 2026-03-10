"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAllData,
  filterDepositsLastHours,
  buildChainMap,
  buildTokenMap,
  type ChainMap,
  type TokenMap,
} from "@/lib/across";
import type { AcrossDeposit, ChainStats, OriginChainStats, SwapStats, TokenStats, RouteStats, OverviewStats } from "@/lib/types";
import {
  computeOverviewStats,
  computeChainLeaderboard,
  computeOriginChainLeaderboard,
  computeSwapLeaderboard,
  computeTokenLeaderboard,
  computeRouteLeaderboard,
} from "@/lib/utils";
import { StatsOverview } from "./StatsOverview";
import { ChainLeaderboard } from "./ChainLeaderboard";
import { OriginChainLeaderboard } from "./OriginChainLeaderboard";
import { SwapLeaderboard } from "./SwapLeaderboard";
import { TokenLeaderboard } from "./TokenLeaderboard";
import { RouteLeaderboard } from "./RouteLeaderboard";
import { RecentTransactions } from "./RecentTransactions";

const REFRESH_INTERVAL = 30_000;
const CHAIN_WINDOW_HOURS = 10 / 60; // 10 minutes
const LEADERBOARD_WINDOW_HOURS = 1;  // 1 hour

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [chainMap, setChainMap] = useState<ChainMap>(new Map());
  const [tokenMap, setTokenMap] = useState<TokenMap>(new Map());
  const [deposits, setDeposits] = useState<AcrossDeposit[]>([]);

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [chainLeaderboard, setChainLeaderboard] = useState<ChainStats[]>([]);
  const [originLeaderboard, setOriginLeaderboard] = useState<OriginChainStats[]>([]);
  const [swapLeaderboard, setSwapLeaderboard] = useState<SwapStats[]>([]);
  const [tokenLeaderboard, setTokenLeaderboard] = useState<TokenStats[]>([]);
  const [routeLeaderboard, setRouteLeaderboard] = useState<RouteStats[]>([]);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const { chains, tokens, deposits: allDeps } = await fetchAllData();

      const cMap = buildChainMap(chains);
      const tMap = buildTokenMap(tokens);

      // Chain heatmap uses last 10 minutes; leaderboards use last 1 hour
      const deps10m = filterDepositsLastHours(allDeps, CHAIN_WINDOW_HOURS);
      const deps1h = filterDepositsLastHours(allDeps, LEADERBOARD_WINDOW_HOURS);

      setChainMap(cMap);
      setTokenMap(tMap);
      setDeposits(deps1h);

      setOverview(computeOverviewStats(deps1h, tMap, cMap));
      setChainLeaderboard(computeChainLeaderboard(deps1h, cMap, tMap, deps10m));
      setOriginLeaderboard(computeOriginChainLeaderboard(deps1h, cMap, tMap));
      setSwapLeaderboard(computeSwapLeaderboard(deps1h, cMap, tMap));
      setTokenLeaderboard(computeTokenLeaderboard(deps1h, tMap));
      setRouteLeaderboard(computeRouteLeaderboard(deps1h, cMap, tMap));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsAgo(0);
    const ticker = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastUpdated]);

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--red)] bg-[var(--red)]/10 p-6 text-center">
        <p className="text-[var(--red)] font-medium mb-2">Error loading data</p>
        <p className="text-[var(--text-secondary)] text-sm mb-4">{error}</p>
        <button
          onClick={() => loadData()}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Status bar: hidden until first load completes */}
      <div className="flex items-center justify-end gap-2 mb-6 h-4">
        {lastUpdated && (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-[var(--text-secondary)]">
              updated {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`} &middot; refreshes every 30s
            </p>
          </>
        )}
      </div>

      {/* Hero: Stats overview — skeletons until first data */}
      {overview ? (
        <StatsOverview stats={overview} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Primary: Chain destination heatmap */}
      {chainLeaderboard.length > 0 ? (
        <ChainLeaderboard chains={chainLeaderboard} />
      ) : (
        <div className="skeleton h-48 rounded-xl mb-8" />
      )}

      {/* Supporting: 2x2 leaderboard grid */}
      {originLeaderboard.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OriginChainLeaderboard chains={originLeaderboard} />
          <TokenLeaderboard tokens={tokenLeaderboard} />
          <RouteLeaderboard routes={routeLeaderboard} />
          <SwapLeaderboard swaps={swapLeaderboard} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-96 rounded-xl" />
          ))}
        </div>
      )}

      <RecentTransactions deposits={deposits} chainMap={chainMap} tokenMap={tokenMap} />
    </div>
  );
}
