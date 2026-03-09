import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--accent)]">
          Where To?
        </h1>
        <p className="mt-2 text-[var(--text-secondary)] text-lg">
          Where are people bridging their money? Live signal from Across Protocol.
        </p>
      </header>
      <Dashboard />
    </main>
  );
}
