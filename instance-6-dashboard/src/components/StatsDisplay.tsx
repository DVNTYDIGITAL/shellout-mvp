"use client";

import { useEffect, useState } from "react";
import { getStats, type StatsData } from "@/lib/api";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center rounded-xl bg-white p-6">
          <div className="h-10 w-24 rounded bg-gray-200 animate-skeleton" />
          <div className="mt-2 h-4 w-32 rounded bg-gray-100 animate-skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function StatsDisplay() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getStats().then(setStats).catch(() => setError(true));
  }, []);

  if (error) return null; // Silently fail for stats
  if (!stats) return <Skeleton />;

  const items = [
    { value: formatNumber(stats.total_transactions_indexed), label: "Transactions Indexed" },
    { value: formatNumber(stats.total_wallets_seen), label: "Wallets Tracked" },
    { value: formatVolume(stats.total_volume_usd), label: "Volume Tracked" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <span className="text-3xl font-bold text-primary sm:text-4xl">{item.value}</span>
          <span className="mt-1 text-sm text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
