import { useState } from "react";
import type { AcrossDeposit } from "@/lib/types";
import type { ChainMap, TokenMap } from "@/lib/across";
import { formatUsd, timeAgo, shortenAddress } from "@/lib/utils";

const PAGE_SIZE = 20;
const WHALE_THRESHOLD = 10_000;   // $10k+
const SHARK_THRESHOLD = 1_000;    // $1k+

interface Props {
  deposits: AcrossDeposit[];
  chainMap: ChainMap;
  tokenMap: TokenMap;
}

function WhaleBadge({ usd }: { usd: number }) {
  if (usd >= WHALE_THRESHOLD) {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
        style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
        title="Whale transaction"
      >
        🐋
      </span>
    );
  }
  if (usd >= SHARK_THRESHOLD) {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
        title="Large transaction"
      >
        🦈
      </span>
    );
  }
  return null;
}

export function RecentTransactions({ deposits, chainMap, tokenMap }: Props) {
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const filled = deposits.filter((d) => d.status === "filled");
  const recent = filled.slice(0, showCount);

  function getTokenSymbol(chainId: number, tokenAddress: string): string {
    const token = tokenMap.get(`${chainId}-${tokenAddress.toLowerCase()}`);
    return token?.symbol ?? "???";
  }

  function getVolumeUsd(d: AcrossDeposit): number {
    if (!d.inputPriceUsd || !d.inputAmount) return 0;
    const token = tokenMap.get(`${d.originChainId}-${d.inputToken.toLowerCase()}`);
    const decimals = token?.decimals ?? 18;
    return (Number(d.inputAmount) / 10 ** decimals) * Number(d.inputPriceUsd);
  }

  function getBridgeTime(d: AcrossDeposit): string {
    if (!d.fillBlockTimestamp || !d.depositBlockTimestamp) return "—";
    const sec =
      (new Date(d.fillBlockTimestamp).getTime() -
        new Date(d.depositBlockTimestamp).getTime()) /
      1000;
    if (sec < 0) return "—";
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.round(sec / 60)}m`;
  }

  function getExplorerLink(d: AcrossDeposit): string | null {
    const chain = chainMap.get(d.originChainId);
    if (!chain?.explorerUrl || !d.depositTxHash) return null;
    return `${chain.explorerUrl}/tx/${d.depositTxHash}`;
  }

  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <span className="text-xs text-[var(--text-secondary)]">
          <span style={{ color: "#f59e0b" }}>🐋 $10k+</span>
          <span className="mx-2 opacity-40">·</span>
          <span style={{ color: "#818cf8" }}>🦈 $1k+</span>
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">Time</th>
              <th className="text-left p-4 font-medium">From</th>
              <th className="text-left p-4 font-medium">To</th>
              <th className="text-left p-4 font-medium">Token</th>
              <th className="text-right p-4 font-medium">Amount</th>
              <th className="text-right p-4 font-medium">Bridge Time</th>
              <th className="text-left p-4 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--text-secondary)] text-sm">
                  No filled transactions yet — check back shortly
                </td>
              </tr>
            )}
            {recent.map((d) => {
              const origin = chainMap.get(d.originChainId);
              const dest = chainMap.get(d.destinationChainId);
              const explorerLink = getExplorerLink(d);
              const usd = getVolumeUsd(d);
              const isWhale = usd >= WHALE_THRESHOLD;
              const isShark = !isWhale && usd >= SHARK_THRESHOLD;

              return (
                <tr
                  key={d.id}
                  className="border-b border-[var(--border)] last:border-0 transition-colors"
                  style={
                    isWhale
                      ? {
                          background: "rgba(245,158,11,0.06)",
                          boxShadow: "inset 3px 0 0 rgba(245,158,11,0.5)",
                        }
                      : isShark
                      ? {
                          background: "rgba(99,102,241,0.05)",
                          boxShadow: "inset 3px 0 0 rgba(99,102,241,0.4)",
                        }
                      : undefined
                  }
                >
                  <td className="p-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {timeAgo(d.depositBlockTimestamp)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {origin?.logoUrl && (
                        <img src={origin.logoUrl} alt={origin.name} className="w-4 h-4 rounded-full" />
                      )}
                      <span>{origin?.name ?? `${d.originChainId}`}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {dest?.logoUrl && (
                        <img src={dest.logoUrl} alt={dest.name} className="w-4 h-4 rounded-full" />
                      )}
                      <span>{dest?.name ?? `${d.destinationChainId}`}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    {getTokenSymbol(d.originChainId, d.inputToken)}
                  </td>
                  <td className="p-4 text-right tabular-nums font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <WhaleBadge usd={usd} />
                      <span
                        style={
                          isWhale
                            ? { color: "#fbbf24" }
                            : isShark
                            ? { color: "#a5b4fc" }
                            : undefined
                        }
                      >
                        {formatUsd(usd)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums text-[var(--text-secondary)]">
                    {getBridgeTime(d)}
                  </td>
                  <td className="p-4">
                    {explorerLink ? (
                      <a
                        href={explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] hover:underline"
                      >
                        {shortenAddress(d.depositTxHash)}
                      </a>
                    ) : (
                      <span className="text-[var(--text-secondary)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filled.length > showCount && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => setShowCount((c) => c + PAGE_SIZE)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-secondary)] hover:text-white hover:border-[var(--accent)] transition-all duration-200"
          >
            Show more
            <span className="ml-1.5 text-xs opacity-60">
              ({filled.length - showCount} remaining)
            </span>
          </button>
        </div>
      )}
      {showCount > PAGE_SIZE && filled.length <= showCount && filled.length > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setShowCount(PAGE_SIZE)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-secondary)] hover:text-white transition-all duration-200"
          >
            Show less
          </button>
        </div>
      )}
    </section>
  );
}
