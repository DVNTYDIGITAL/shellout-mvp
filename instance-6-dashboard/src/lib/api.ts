const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.shellout.ai";

export interface ReputationData {
  address: string;
  score: number;
  metrics: {
    total_transactions: number;
    as_sender: number;
    as_receiver: number;
    total_volume: number;
    unique_counterparties: number;
    first_seen: string | null;
    last_seen: string | null;
    active_days: number;
    recent_transactions_7d: number;
  };
  flags: string[];
  has_history: boolean;
}

export interface StatsData {
  total_transactions_indexed: number;
  total_wallets_seen: number;
  total_volume_usd: number;
}

export async function getReputation(address: string): Promise<ReputationData> {
  const res = await fetch(`${API_URL}/v1/reputation/${address}`);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to fetch reputation");
  }
  return data.data;
}

export async function getStats(): Promise<StatsData> {
  const res = await fetch(`${API_URL}/v1/stats`);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to fetch stats");
  }
  return data.data;
}
