import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where To? — Across Bridge Leaderboard",
  description: "Real-time leaderboard of bridge traffic across chains via Across Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
