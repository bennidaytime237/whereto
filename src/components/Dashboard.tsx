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
import type { AcrossDeposit, ChainStats, TokenStats, RouteStats, OverviewStats } from "@/lib/types";
import {
  computeOverviewStats,
  computeChainLeaderboard,
  computeTokenLeaderboard,
  computeRouteLeaderboard,
} from "@/lib/utils";
import { StatsOverview } from "./StatsOverview";
import { ChainLeaderboard } from "./ChainLeaderboard";
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

  const [chainMap, setChainMap] = useState<ChainMap>(new Map());
  const [tokenMap, setTokenMap] = useState<TokenMap>(new Map());
  const [deposits, setDeposits] = useState<AcrossDeposit[]>([]);

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [chainLeaderboard, setChainLeaderboard] = useState<ChainStats[]>([]);
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

      setOverview(computeOverviewStats(deps1h, tMap));
      setChainLeaderboard(computeChainLeaderboard(deps10m, cMap, tMap));
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
      {lastUpdated && (
        <p className="text-xs text-[var(--text-secondary)] mb-6 text-right">
          Updated {lastUpdated.toLocaleTimeString()} &middot; refreshes every 30s
        </p>
      )}

      {/* Hero: Stats overview */}
      {overview && <StatsOverview stats={overview} />}

      {/* Primary: Chain destination heatmap */}
      <ChainLeaderboard chains={chainLeaderboard} />

      {/* Supporting: routes, tokens, recent txns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RouteLeaderboard routes={routeLeaderboard} />
        <TokenLeaderboard tokens={tokenLeaderboard} />
      </div>

      <RecentTransactions deposits={deposits} chainMap={chainMap} tokenMap={tokenMap} />
    </div>
  );
}
