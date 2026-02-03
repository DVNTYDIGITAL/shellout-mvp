import type { ReputationData } from "@/lib/api";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatVolume(volume: number): string {
  return `$${volume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MetricsTable({ metrics }: { metrics: ReputationData["metrics"] }) {
  const rows = [
    { label: "Total Transactions", value: metrics.total_transactions.toLocaleString() },
    { label: "As Sender", value: metrics.as_sender.toLocaleString() },
    { label: "As Receiver", value: metrics.as_receiver.toLocaleString() },
    { label: "Total Volume", value: formatVolume(metrics.total_volume) },
    { label: "Unique Counterparties", value: metrics.unique_counterparties.toLocaleString() },
    { label: "First Seen", value: formatDate(metrics.first_seen) },
    { label: "Last Seen", value: formatDate(metrics.last_seen) },
    { label: "Active Duration", value: `${metrics.active_days} days` },
    { label: "Recent (7d)", value: `${metrics.recent_transactions_7d} transactions` },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <h2 className="px-6 py-4 text-lg font-semibold border-b border-gray-100">Metrics</h2>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-text-secondary">{row.label}</span>
            <span className="text-sm font-medium text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
