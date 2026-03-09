import type { OverviewStats } from "@/lib/types";
import { formatUsd, formatTime } from "@/lib/utils";

export function StatsOverview({ stats }: { stats: OverviewStats }) {
  const cards = [
    { label: "Total Volume", value: formatUsd(stats.totalVolumeUsd), period: "last hour" },
    { label: "Transactions", value: stats.totalTransactions.toString(), period: "last hour" },
    { label: "Avg Bridge Time", value: formatTime(stats.avgBridgeTimeSec), period: "last hour" },
    { label: "Active Chains", value: stats.uniqueChains.toString(), period: "last hour" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="stat-card rounded-xl p-5 border border-[var(--border)] bg-[var(--bg-card)]"
        >
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
            <p className="text-[10px] text-[var(--text-secondary)] opacity-60">{card.period}</p>
          </div>
          <p className="text-2xl font-bold text-[var(--accent)]">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
