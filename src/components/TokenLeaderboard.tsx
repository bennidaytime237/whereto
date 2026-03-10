import type { TokenStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function TokenLeaderboard({ tokens }: { tokens: TokenStats[] }) {
  const maxVolume = tokens[0]?.volumeUsd ?? 1;

  return (
    <section className="mb-8 flex flex-col">
      <h2 className="text-xl font-semibold mb-1">Top Tokens Bridged</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">By volume · last hour</p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Token</th>
              <th className="text-right px-4 py-2.5 font-medium">Txns</th>
              <th className="text-right px-4 py-2.5 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
                  No token data yet — check back shortly
                </td>
              </tr>
            )}
            {tokens.map((token, i) => {
              const barPct = maxVolume > 0 ? (token.volumeUsd / maxVolume) * 100 : 0;
              return (
                <tr
                  key={token.symbol}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] w-8">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {token.logoUrl && (
                        <img src={token.logoUrl} alt={token.symbol} className="w-5 h-5 rounded-full shrink-0" />
                      )}
                      <div>
                        <div className="font-medium leading-tight">{token.symbol}</div>
                        <div className="mt-1 h-1 rounded-full bg-white/10 w-20">
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
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{token.txCount}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatUsd(token.volumeUsd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
