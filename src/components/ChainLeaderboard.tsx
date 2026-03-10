import React from "react";
import type { ChainStats } from "@/lib/types";
import { formatUsd, formatTime } from "@/lib/utils";

// Heat color ramp: cold (low activity) -> hot (high activity)
// Deep blue -> cyan -> green -> yellow -> orange -> red
function getHeatColor(intensity: number): string {
  // intensity is 0-1 (normalized to max chain's share)
  const clamped = Math.max(0, Math.min(1, intensity));

  if (clamped < 0.2) return `rgba(59, 130, 246, ${0.15 + clamped * 2})`; // blue
  if (clamped < 0.4) return `rgba(6, 182, 212, ${0.2 + clamped})`; // cyan
  if (clamped < 0.6) return `rgba(16, 185, 129, ${0.25 + clamped * 0.8})`; // green
  if (clamped < 0.8) return `rgba(245, 158, 11, ${0.3 + clamped * 0.6})`; // amber
  return `rgba(239, 68, 68, ${0.35 + clamped * 0.5})`; // red
}

function getHeatBorder(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  if (clamped < 0.2) return "rgba(59, 130, 246, 0.3)";
  if (clamped < 0.4) return "rgba(6, 182, 212, 0.4)";
  if (clamped < 0.6) return "rgba(16, 185, 129, 0.5)";
  if (clamped < 0.8) return "rgba(245, 158, 11, 0.6)";
  return "rgba(239, 68, 68, 0.7)";
}

function getHeatGlow(intensity: number): string {
  const clamped = Math.max(0, Math.min(1, intensity));
  if (clamped < 0.2) return "0 0 20px rgba(59, 130, 246, 0.1)";
  if (clamped < 0.4) return "0 0 25px rgba(6, 182, 212, 0.15)";
  if (clamped < 0.6) return "0 0 30px rgba(16, 185, 129, 0.2)";
  if (clamped < 0.8) return "0 0 35px rgba(245, 158, 11, 0.25)";
  return "0 0 40px rgba(239, 68, 68, 0.3)";
}

function getRankBadge(rank: number): string {
  if (rank === 1) return "chain-rank-1";
  if (rank === 2) return "chain-rank-2";
  if (rank === 3) return "chain-rank-3";
  return "chain-rank-default";
}

function Soundwave({ buckets, color }: { buckets: { txCount: number; volumeUsd: number }[]; color: string }) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const maxTx  = Math.max(...buckets.map((b) => b.txCount), 1);
  const maxVol = Math.max(...buckets.map((b) => b.volumeUsd), 1);
  const TOTAL_H = 64; // px — matches h-16

  const BUCKET_MINUTES = 5;
  const BUCKET_COUNT = buckets.length;

  function getBucketLabel(idx: number): string {
    const minutesAgoEnd = (BUCKET_COUNT - 1 - idx) * BUCKET_MINUTES;
    const minutesAgoStart = minutesAgoEnd + BUCKET_MINUTES;
    if (minutesAgoEnd === 0) return `last ${BUCKET_MINUTES}m`;
    return `${minutesAgoStart}–${minutesAgoEnd}m ago`;
  }

  return (
    <div
      className="relative flex items-center gap-[2px] w-full h-16"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {buckets.map((bucket, i) => {
        const mirror = 1 - Math.abs((i / (buckets.length - 1)) * 2 - 1) * 0.15;
        // Each half grows outward from center
        const volHalf = Math.max(1, Math.round((bucket.volumeUsd / maxVol) * (TOTAL_H / 2) * 0.9 * mirror));
        const txHalf  = Math.max(1, Math.round((bucket.txCount  / maxTx)  * (TOTAL_H / 2) * 0.9 * mirror));
        const isHovered = hoveredIdx === i;

        return (
          <div
            key={i}
            className="relative flex-1 h-full cursor-default flex flex-col items-center justify-center"
            onMouseEnter={() => setHoveredIdx(i)}
          >
            {/* tx count — top half, grows upward */}
            <div
              className="w-full rounded-t-full transition-all duration-300"
              style={{
                height: `${txHalf}px`,
                background: color,
                opacity: isHovered ? 1 : 0.8,
              }}
            />
            {/* 1px gap in the middle */}
            <div className="w-full" style={{ height: 1 }} />
            {/* volume — bottom half, grows downward */}
            <div
              className="w-full rounded-b-full transition-all duration-300"
              style={{
                height: `${volHalf}px`,
                background: color,
                opacity: isHovered ? 0.55 : 0.35,
              }}
            />
            {isHovered && (
              <div
                className="absolute bottom-full mb-1 left-1/2 pointer-events-none rounded px-1.5 py-1 text-[10px] leading-tight shadow-lg"
                style={{
                  transform: "translateX(-50%)",
                  background: "#1a1b1f",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                <div className="font-semibold" style={{ color }}>{getBucketLabel(i)}</div>
                <div className="text-gray-300">{bucket.txCount} tx · {formatUsd(bucket.volumeUsd)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HotBadge({ count }: { count: number }) {
  if (count === 0) return null;
  const dotColor = count >= 5 ? "#ff6b6b" : count >= 2 ? "#f59e0b" : "#9a9ba8";
  const label = count >= 5 ? "hot" : count >= 2 ? "active" : "recent";
  return (
    <span className="relative flex items-center gap-1" title={`${count} tx in last 10 min`}>
      <span className="relative flex h-2 w-2">
        {count >= 2 && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: dotColor }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: dotColor }}
        />
      </span>
      <span className="text-[10px] font-medium" style={{ color: dotColor }}>{label}</span>
    </span>
  );
}

export function ChainLeaderboard({ chains }: { chains: ChainStats[] }) {
  // Normalize intensities: the top chain = 1.0
  const maxShare = chains[0]?.volumeShare ?? 1;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Where is the money going?</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Destination chains ranked by inflow volume &middot; last hour
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>Low</span>
          <div className="flex gap-0.5">
            <div className="w-5 h-3 rounded-sm" style={{ background: "rgba(59, 130, 246, 0.4)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "rgba(6, 182, 212, 0.5)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "rgba(16, 185, 129, 0.6)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "rgba(245, 158, 11, 0.7)" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "rgba(239, 68, 68, 0.8)" }} />
          </div>
          <span>High</span>
        </div>
      </div>

      {chains.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center text-[var(--text-secondary)] text-sm">
          No chain activity yet — check back shortly
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {chains.slice(0, 10).map((chain, i) => {
          const intensity = maxShare > 0 ? chain.volumeShare / maxShare : 0;
          const rank = i + 1;

          return (
            <div
              key={chain.chainId}
              className="chain-card relative rounded-lg p-3 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${getHeatColor(intensity)}, var(--bg-card))`,
                border: `1px solid ${getHeatBorder(intensity)}`,
                boxShadow: getHeatGlow(intensity),
              }}
            >
              {/* Rank + chain identity */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`rank-badge ${getRankBadge(rank)}`} style={{ width: 22, height: 22, fontSize: 11 }}>
                  {rank}
                </span>
                {chain.logoUrl && (
                  <img
                    src={chain.logoUrl}
                    alt={chain.name}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-sm font-semibold truncate flex-1">{chain.name}</span>
                <HotBadge count={chain.recentTxCount} />
              </div>

              {/* Volume */}
              <div className="text-base font-bold tabular-nums mb-1.5">
                {formatUsd(chain.volumeUsd)}
              </div>

              {/* Soundwave activity */}
              <div className="mb-2">
                <Soundwave buckets={chain.activityBuckets} color={getHeatBorder(intensity)} />
              </div>

              {/* Volume share bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span className="tabular-nums">{chain.txCount} txns</span>
                  <span className="tabular-nums">{(chain.volumeShare * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${(chain.volumeShare * 100).toFixed(1)}%`,
                      background: getHeatBorder(intensity),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
