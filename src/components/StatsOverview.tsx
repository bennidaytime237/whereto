"use client";

import { useEffect, useRef, useState } from "react";
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
  const area = `${pts[0]} ${pts.join(" ")} ${w},${h} 0,${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="overflow-visible">
      <polygon points={area} fill={color} opacity={0.12} />
      <polyline points={polyline} stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Smoothly counts from the previous value to the new target. Snaps on first mount. */
function useCountUp(target: number, durationMs = 800): number {
  const [displayed, setDisplayed] = useState(target);
  const startRef = useRef<number>(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // First mount: snap immediately, no animation
    if (!mountedRef.current) {
      mountedRef.current = true;
      startRef.current = target;
      setDisplayed(target);
      return;
    }
    const from = startRef.current;
    if (from === target) return;
    startTimeRef.current = null;

    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (target - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startRef.current = target;
        setDisplayed(target);
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return displayed;
}

function AnimatedUsd({ value }: { value: number }) {
  const animated = useCountUp(value, 900);
  return <>{formatUsd(animated)}</>;
}

function AnimatedInt({ value }: { value: number }) {
  const animated = useCountUp(value, 700);
  return <>{Math.round(animated).toLocaleString()}</>;
}

export function StatsOverview({ stats }: { stats: OverviewStats }) {
  const cards = [
    {
      label: "Total Volume",
      valueNode: <AnimatedUsd value={stats.totalVolumeUsd} />,
      period: "last hour",
      sparkline: stats.volumeTimeline,
    },
    {
      label: "Transactions",
      valueNode: <AnimatedInt value={stats.totalTransactions} />,
      period: "last hour",
      sparkline: null,
    },
    {
      label: "Avg Bridge Time",
      valueNode: <>{formatTime(stats.avgBridgeTimeSec)}</>,
      period: "last hour",
      sparkline: null,
    },
    {
      label: "Largest Single Tx",
      valueNode: <AnimatedUsd value={stats.largestTxUsd} />,
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
          <p className="text-2xl font-bold text-[var(--accent)] tabular-nums">{card.valueNode}</p>
        </div>
      ))}
    </div>
  );
}
