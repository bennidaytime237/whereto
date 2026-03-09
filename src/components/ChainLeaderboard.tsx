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

export function ChainLeaderboard({ chains }: { chains: ChainStats[] }) {
  // Normalize intensities: the top chain = 1.0
  const maxShare = chains[0]?.volumeShare ?? 1;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Where is the money going?</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Destination chains ranked by inflow volume &middot; last 10 minutes
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
                <span className="text-sm font-semibold truncate">{chain.name}</span>
              </div>

              {/* Volume */}
              <div className="text-base font-bold tabular-nums mb-1.5">
                {formatUsd(chain.volumeUsd)}
              </div>

              {/* Volume bar */}
              <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${intensity * 100}%`,
                    background: `linear-gradient(90deg, ${getHeatBorder(intensity)}, ${getHeatBorder(Math.min(1, intensity + 0.2))})`,
                  }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="tabular-nums">{chain.txCount} txns</span>
                <span className="tabular-nums">{(chain.volumeShare * 100).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
