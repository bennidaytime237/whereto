import type { OverviewStats } from "@/lib/types";
import { formatUsd, formatTime } from "@/lib/utils";

export function StatsOverview({ stats }: { stats: OverviewStats }) {
  const cards = [
    { label: "Total Volume", value: formatUsd(stats.totalVolumeUsd) },
    { label: "Transactions", value: stats.totalTransactions.toString() },
    { label: "Avg Bridge Time", value: formatTime(stats.avgBridgeTimeSec) },
    { label: "Active Chains", value: stats.uniqueChains.toString() },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="stat-card rounded-xl p-5 border border-[var(--border)] bg-[var(--bg-card)]"
        >
          <p className="text-sm text-[var(--text-secondary)] mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-[var(--accent)]">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
