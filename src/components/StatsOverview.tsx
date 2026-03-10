import type { OverviewStats } from "@/lib/types";
import { formatUsd, formatTime } from "@/lib/utils";

function Sparkline({ values, color = "#6DF9D9" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  const w = 80;
  const h = 32;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  // filled area: go to bottom-right, bottom-left, back up
  const area = `${pts[0]} ${pts.join(" ")} ${w},${h} 0,${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="overflow-visible">
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline points={polyline} stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatsOverview({ stats }: { stats: OverviewStats }) {
  const cards = [
    {
      label: "Total Volume",
      value: formatUsd(stats.totalVolumeUsd),
      period: "last hour",
      sparkline: stats.volumeTimeline,
    },
    {
      label: "Transactions",
      value: stats.totalTransactions.toLocaleString(),
      period: "last hour",
      sparkline: null,
    },
    {
      label: "Avg Bridge Time",
      value: formatTime(stats.avgBridgeTimeSec),
      period: "last hour",
      sparkline: null,
    },
    {
      label: "Largest Single Tx",
      value: formatUsd(stats.largestTxUsd),
      period: `→ ${stats.largestTxChain}`,
      sparkline: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="stat-card relative rounded-xl p-5 border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
        >
          {card.sparkline && (
            <div className="absolute bottom-0 right-0 opacity-80 pointer-events-none">
              <Sparkline values={card.sparkline} />
            </div>
          )}
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
