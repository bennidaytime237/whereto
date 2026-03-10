import type { RouteStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function RouteLeaderboard({ routes }: { routes: RouteStats[] }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-1">Top Routes</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">By volume · last hour</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left p-4 font-medium">#</th>
              <th className="text-left p-4 font-medium">Route</th>
              <th className="text-right p-4 font-medium">Txns</th>
              <th className="text-right p-4 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)] text-sm">
                  No route data yet — check back shortly
                </td>
              </tr>
            )}
            {routes.slice(0, 10).map((route, i) => (
              <tr
                key={`${route.originChainId}-${route.destinationChainId}`}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <td className="p-4 text-[var(--text-secondary)]">{i + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {route.originLogoUrl && (
                      <img src={route.originLogoUrl} alt={route.originName} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="font-medium">{route.originName}</span>
                    <span className="text-[var(--text-secondary)]">&rarr;</span>
                    {route.destinationLogoUrl && (
                      <img src={route.destinationLogoUrl} alt={route.destinationName} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="font-medium">{route.destinationName}</span>
                  </div>
                </td>
                <td className="p-4 text-right tabular-nums">{route.txCount}</td>
                <td className="p-4 text-right tabular-nums font-medium">{formatUsd(route.volumeUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
