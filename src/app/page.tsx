import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--accent)]">
            Where To?
          </h1>
          <p className="mt-2 text-[var(--text-secondary)] text-lg">
            Where are people bridging their money? Live signal from Across Protocol.
          </p>
        </div>
        <a
          href="https://app.across.to/bridge-and-swap?utm_source=app&utm_medium=wt&utm_campaign=button20260308"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 mt-1 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-opacity hover:opacity-85"
          style={{ background: "var(--accent)" }}
        >
          Bridge now
        </a>
      </header>
      <Dashboard />
      <footer className="mt-12 pt-6 border-t border-[var(--border)] flex items-center justify-center gap-3">
        <span className="text-xs text-[var(--text-secondary)]">Powered by</span>
        <img src="/across-banner.svg" alt="Across Protocol" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
      </footer>
    </main>
  );
}
