import type { RouteStats } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export function RouteLeaderboard({ routes }: { routes: RouteStats[] }) {
  const maxVolume = routes[0]?.volumeUsd ?? 1;

  return (
    <section className="mb-8 flex flex-col">
      <h2 className="text-xl font-semibold mb-1">Top Routes</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">By volume · last hour</p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="text-left px-4 py-2.5 font-medium">#</th>
              <th className="text-left px-4 py-2.5 font-medium">Route</th>
              <th className="text-right px-4 py-2.5 font-medium">Txns</th>
              <th className="text-right px-4 py-2.5 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
                  No route data yet — check back shortly
                </td>
              </tr>
            )}
            {routes.slice(0, 10).map((route, i) => {
              const barPct = maxVolume > 0 ? (route.volumeUsd / maxVolume) * 100 : 0;
              return (
                <tr
                  key={`${route.originChainId}-${route.destinationChainId}`}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] w-8">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {route.originLogoUrl && (
                        <img src={route.originLogoUrl} alt={route.originName} className="w-4 h-4 rounded-full shrink-0" />
                      )}
                      <span className="font-medium">{route.originName}</span>
                      <span className="text-[var(--text-secondary)] text-xs">&rarr;</span>
                      {route.destinationLogoUrl && (
                        <img src={route.destinationLogoUrl} alt={route.destinationName} className="w-4 h-4 rounded-full shrink-0" />
                      )}
                      <span className="font-medium">{route.destinationName}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct.toFixed(1)}%`,
                          background: "var(--accent)",
                          opacity: 0.5 + (barPct / 100) * 0.5,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{route.txCount}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatUsd(route.volumeUsd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
