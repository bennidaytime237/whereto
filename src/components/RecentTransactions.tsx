import type { AcrossDeposit } from "@/lib/types";
import type { ChainMap, TokenMap } from "@/lib/across";
import { formatUsd, timeAgo, shortenAddress } from "@/lib/utils";

interface Props {
  deposits: AcrossDeposit[];
  chainMap: ChainMap;
  tokenMap: TokenMap;
}

export function RecentTransactions({ deposits, chainMap, tokenMap }: Props) {
  const recent = deposits.slice(0, 20);

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
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">Time</th>
              <th className="text-left p-4 font-medium">Route</th>
              <th className="text-left p-4 font-medium">Token</th>
              <th className="text-right p-4 font-medium">Amount</th>
              <th className="text-right p-4 font-medium">Bridge Time</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((d) => {
              const origin = chainMap.get(d.originChainId);
              const dest = chainMap.get(d.destinationChainId);
              const explorerLink = getExplorerLink(d);

              return (
                <tr
                  key={d.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
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
                      <span className="text-[var(--text-secondary)]">&rarr;</span>
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
                    {formatUsd(getVolumeUsd(d))}
                  </td>
                  <td className="p-4 text-right tabular-nums text-[var(--text-secondary)]">
                    {getBridgeTime(d)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === "filled"
                          ? "bg-[var(--green)]/15 text-[var(--green)]"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {d.status}
                    </span>
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
    </section>
  );
}
