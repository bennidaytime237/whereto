import type { OriginChainStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function OriginChainLeaderboard({ chains }: { chains: OriginChainStats[] }) {
  const maxShare = chains[0]?.volumeShare ?? 1;

  return (
    <section className="mb-8 flex flex-col">
      <h2 className="text-xl font-semibold mb-1">Origin Chains</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Outflow volume by source chain · last hour</p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Chain</th>
              <th className="text-right px-4 py-2.5 font-medium">Txns</th>
              <th className="text-right px-4 py-2.5 font-medium">Volume</th>
              <th className="text-left px-4 py-2.5 font-medium w-28">Share</th>
            </tr>
          </thead>
          <tbody>
            {chains.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
                  No origin data yet — check back shortly
                </td>
              </tr>
            )}
            {chains.slice(0, 10).map((chain, i) => {
              const barPct = maxShare > 0 ? (chain.volumeShare / maxShare) * 100 : 0;
              return (
                <tr
                  key={chain.chainId}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] w-8">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {chain.logoUrl && (
                        <img src={chain.logoUrl} alt={chain.name} className="w-5 h-5 rounded-full shrink-0" />
                      )}
                      <span className="font-medium">{chain.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{chain.txCount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatUsd(chain.volumeUsd)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/10">
                        <div
                          className="h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${barPct.toFixed(1)}%`,
                            background: "var(--accent)",
                            opacity: 0.5 + (barPct / 100) * 0.5,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] tabular-nums w-9 text-right">
                        {(chain.volumeShare * 100).toFixed(1)}%
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
