"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getReputation, type ReputationData } from "@/lib/api";
import ScoreDisplay from "@/components/ScoreDisplay";
import MetricsTable from "@/components/MetricsTable";
import CopyButton from "@/components/CopyButton";
import CodeBlock from "@/components/CodeBlock";

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SkeletonLoader() {
  return (
    <div className="mx-auto max-w-[800px] space-y-8 px-4 py-8 sm:px-8">
      <div className="h-5 w-32 rounded bg-gray-200 animate-skeleton" />
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 space-y-6">
        <div className="h-6 w-48 rounded bg-gray-200 animate-skeleton" />
        <div className="h-32 w-32 rounded-2xl bg-gray-200 animate-skeleton" />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 w-20 rounded bg-gray-200 animate-skeleton" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between px-6 py-3 border-b border-gray-50">
            <div className="h-4 w-32 rounded bg-gray-100 animate-skeleton" />
            <div className="h-4 w-20 rounded bg-gray-100 animate-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function fetchData() {
    setLoading(true);
    setError(null);
    getReputation(address)
      .then(setData)
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || "https://cdn.shellout.ai/widget.js";
  const widgetCode = `<div data-shellout="${address}"></div>\n<script src="${widgetUrl}"></script>`;

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-8">
          &larr; Back to search
        </Link>
        <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            &#9888;
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Something went wrong</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md">{error}</p>
          <button
            onClick={fetchData}
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (data && !data.has_history) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-8">
          &larr; Back to search
        </Link>
        <div className="flex flex-col items-center rounded-xl border border-blue-200 bg-blue-50 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
            &#128269;
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">No Transaction History</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md">
            We haven&apos;t seen any transactions for this wallet yet. This doesn&apos;t mean it&apos;s untrustworthy &mdash; it just means we don&apos;t have data on it yet. Check back later as we index more transactions.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
            <span className="font-mono">{truncateAddress(address)}</span>
            <CopyButton text={address} label="Copy" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-8">
        &larr; Back to search
      </Link>

      {/* Wallet Summary */}
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-text-primary">{truncateAddress(address)}</span>
          <CopyButton text={address} />
        </div>
        <div className="mt-6">
          <ScoreDisplay score={data.score} />
        </div>
      </div>

      {/* Flags */}
      {data.flags && data.flags.length > 0 && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <span>&#9888;&#65039;</span> Flags
          </h2>
          <ul className="mt-3 space-y-2">
            {data.flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-0.5 text-score-medium">&bull;</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics */}
      <div className="mt-8">
        <MetricsTable metrics={data.metrics} />
      </div>

      {/* Widget Embed */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Add to Your Site</h2>
        <CodeBlock code={widgetCode} />
      </div>
    </div>
  );
}
