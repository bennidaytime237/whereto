import type { SwapStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function SwapLeaderboard({ swaps }: { swaps: SwapStats[] }) {
  const maxShare = swaps[0]?.volumeShare ?? 1;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-1">Top Swaps</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Most popular token swap routes · last hour
      </p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">#</th>
              <th className="text-left p-4 font-medium">Swap</th>
              <th className="text-right p-4 font-medium">Txns</th>
              <th className="text-right p-4 font-medium">Volume</th>
              <th className="text-left p-4 font-medium w-36">Share</th>
            </tr>
          </thead>
          <tbody>
            {swaps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)] text-sm">
                  No swap data yet — check back shortly
                </td>
              </tr>
            )}
            {swaps.map((swap, i) => {
              const barPct = maxShare > 0 ? (swap.volumeShare / maxShare) * 100 : 0;
              const key = `${swap.originChainId}-${swap.originTokenSymbol}-${swap.destinationChainId}-${swap.destinationTokenSymbol}`;

              return (
                <tr
                  key={key}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="p-4 text-[var(--text-secondary)]">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Origin: chain logo + token symbol */}
                      {swap.originChainLogoUrl && (
                        <img src={swap.originChainLogoUrl} alt={swap.originChainName} className="w-4 h-4 rounded-full" title={swap.originChainName} />
                      )}
                      {swap.originTokenLogoUrl && (
                        <img src={swap.originTokenLogoUrl} alt={swap.originTokenSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="font-medium">{swap.originTokenSymbol}</span>
                      <span className="text-[var(--text-secondary)] text-xs">on {swap.originChainName}</span>

                      {/* Arrow */}
                      <span className="text-[var(--text-secondary)] mx-0.5">→</span>

                      {/* Destination: chain logo + token symbol */}
                      {swap.destinationChainLogoUrl && (
                        <img src={swap.destinationChainLogoUrl} alt={swap.destinationChainName} className="w-4 h-4 rounded-full" title={swap.destinationChainName} />
                      )}
                      {swap.destinationTokenLogoUrl && (
                        <img src={swap.destinationTokenLogoUrl} alt={swap.destinationTokenSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="font-medium">{swap.destinationTokenSymbol}</span>
                      <span className="text-[var(--text-secondary)] text-xs">on {swap.destinationChainName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums">{swap.txCount}</td>
                  <td className="p-4 text-right tabular-nums font-medium">
                    {formatUsd(swap.volumeUsd)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${barPct.toFixed(1)}%`,
                            background: "var(--accent)",
                            opacity: 0.6 + (barPct / 100) * 0.4,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] tabular-nums w-10 text-right">
                        {(swap.volumeShare * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
