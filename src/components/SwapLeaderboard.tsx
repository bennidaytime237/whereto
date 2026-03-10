import type { SwapStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function SwapLeaderboard({ swaps }: { swaps: SwapStats[] }) {
  const maxTxShare = swaps[0]?.txShare ?? 1;

  return (
    <section className="mb-8 flex flex-col">
      <h2 className="text-xl font-semibold mb-1">Top Swaps</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Most frequent swap routes · last hour
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] divide-y divide-[var(--border)] overflow-hidden flex-1">
        {swaps.length === 0 && (
          <div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
            No swap data yet — check back shortly
          </div>
        )}
        {swaps.map((swap, i) => {
          const barPct = maxTxShare > 0 ? (swap.txShare / maxTxShare) * 100 : 0;
          const key = `${swap.originChainId}-${swap.originTokenSymbol}-${swap.destinationChainId}-${swap.destinationTokenSymbol}`;

          return (
            <div key={key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-secondary)] transition-colors">

              {/* Rank */}
              <span className="text-xs font-medium text-[var(--text-secondary)] w-5 shrink-0 tabular-nums">
                {i + 1}
              </span>

              {/* Route */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Origin */}
                  <div className="flex items-center gap-1">
                    {swap.originChainLogoUrl && (
                      <img src={swap.originChainLogoUrl} alt={swap.originChainName} className="w-3.5 h-3.5 rounded-full" title={swap.originChainName} />
                    )}
                    {swap.originTokenLogoUrl && (
                      <img src={swap.originTokenLogoUrl} alt={swap.originTokenSymbol} className="w-3.5 h-3.5 rounded-full" />
                    )}
                    <span className="text-sm font-semibold">{swap.originTokenSymbol}</span>
                  </div>
                  <span className="text-[var(--text-secondary)] text-xs">on {swap.originChainName}</span>

                  <span className="text-[var(--text-secondary)] text-xs mx-0.5">→</span>

                  {/* Destination */}
                  <div className="flex items-center gap-1">
                    {swap.destinationChainLogoUrl && (
                      <img src={swap.destinationChainLogoUrl} alt={swap.destinationChainName} className="w-3.5 h-3.5 rounded-full" title={swap.destinationChainName} />
                    )}
                    {swap.destinationTokenLogoUrl && (
                      <img src={swap.destinationTokenLogoUrl} alt={swap.destinationTokenSymbol} className="w-3.5 h-3.5 rounded-full" />
                    )}
                    <span className="text-sm font-semibold">{swap.destinationTokenSymbol}</span>
                  </div>
                  <span className="text-[var(--text-secondary)] text-xs">on {swap.destinationChainName}</span>
                </div>

                {/* Bar */}
                <div className="mt-1 h-1 rounded-full bg-white/10 w-full">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${barPct.toFixed(1)}%`,
                      background: "var(--accent)",
                      opacity: 0.5 + (barPct / 100) * 0.5,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
                  {swap.txCount} <span className="text-xs font-normal text-[var(--text-secondary)]">txns</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                  {formatUsd(swap.volumeUsd)}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
