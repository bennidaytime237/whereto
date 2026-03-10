import type { WalletStats } from "@/lib/types";
import { formatUsd, shortenAddress } from "@/lib/utils";

const WHALE_THRESHOLD = 10_000;
const SHARK_THRESHOLD = 1_000;

function SizeBadge({ usd }: { usd: number }) {
  if (usd >= WHALE_THRESHOLD)
    return <span title="Whale wallet">🐋</span>;
  if (usd >= SHARK_THRESHOLD)
    return <span title="Shark wallet">🦈</span>;
  return null;
}

export function WalletLeaderboard({ wallets }: { wallets: WalletStats[] }) {
  const maxShare = wallets[0]?.volumeShare ?? 1;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-1">Top Wallets</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Depositors ranked by volume bridged · last hour</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">#</th>
              <th className="text-left p-4 font-medium">Wallet</th>
              <th className="text-right p-4 font-medium">Txns</th>
              <th className="text-right p-4 font-medium">Volume</th>
              <th className="text-left p-4 font-medium w-36">Share</th>
            </tr>
          </thead>
          <tbody>
            {wallets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)] text-sm">
                  No wallet data yet — check back shortly
                </td>
              </tr>
            )}
            {wallets.map((wallet, i) => {
              const barPct = maxShare > 0 ? (wallet.volumeShare / maxShare) * 100 : 0;
              const isWhale = wallet.volumeUsd >= WHALE_THRESHOLD;
              const isShark = !isWhale && wallet.volumeUsd >= SHARK_THRESHOLD;

              return (
                <tr
                  key={wallet.address}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                  style={
                    isWhale
                      ? { boxShadow: "inset 3px 0 0 rgba(245,158,11,0.5)" }
                      : isShark
                      ? { boxShadow: "inset 3px 0 0 rgba(99,102,241,0.4)" }
                      : undefined
                  }
                >
                  <td className="p-4 text-[var(--text-secondary)]">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <SizeBadge usd={wallet.volumeUsd} />
                      <span
                        className="font-mono text-xs"
                        style={
                          isWhale
                            ? { color: "#fbbf24" }
                            : isShark
                            ? { color: "#a5b4fc" }
                            : { color: "var(--accent)" }
                        }
                      >
                        {shortenAddress(wallet.address)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums">{wallet.txCount}</td>
                  <td className="p-4 text-right tabular-nums font-medium">
                    {formatUsd(wallet.volumeUsd)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${barPct.toFixed(1)}%`,
                            background: isWhale
                              ? "#f59e0b"
                              : isShark
                              ? "#818cf8"
                              : "var(--accent)",
                            opacity: 0.6 + (barPct / 100) * 0.4,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] tabular-nums w-10 text-right">
                        {(wallet.volumeShare * 100).toFixed(1)}%
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
