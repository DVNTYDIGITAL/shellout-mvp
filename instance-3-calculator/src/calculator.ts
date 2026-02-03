import { Pool } from 'pg';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReputationMetrics {
  total_transactions: number;
  transactions_as_sender: number;
  transactions_as_receiver: number;
  total_volume_usd: number;
  volume_sent_usd: number;
  volume_received_usd: number;
  unique_counterparties: number;
  first_seen: string | null;
  last_seen: string | null;
  activity_span_days: number;
  transactions_7d: number;
  avg_transaction_usd: number;
}

export interface ReputationResult {
  address: string;
  score: number;       // 0-100
  metrics: ReputationMetrics;
  flags: string[];
  computed_at: string;  // ISO timestamp
}

// Configurable weights — can be overridden via env vars for A/B testing.
export interface ScoreWeights {
  transactionMax: number;
  transactionMultiplier: number;
  counterpartyMax: number;
  counterpartyMultiplier: number;
  longevityMax: number;
  longevityDivisor: number;
  activityRecent: number;
  activity30d: number;
  activity90d: number;
  balanceMax: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  transactionMax: 25,
  transactionMultiplier: 10,
  counterpartyMax: 25,
  counterpartyMultiplier: 12,
  longevityMax: 20,
  longevityDivisor: 9,
  activityRecent: 15,
  activity30d: 10,
  activity90d: 5,
  balanceMax: 15,
};

function weightsFromEnv(): ScoreWeights {
  const w = { ...DEFAULT_WEIGHTS };
  if (process.env.SCORE_TRANSACTION_MAX) w.transactionMax = Number(process.env.SCORE_TRANSACTION_MAX);
  if (process.env.SCORE_TRANSACTION_MULT) w.transactionMultiplier = Number(process.env.SCORE_TRANSACTION_MULT);
  if (process.env.SCORE_COUNTERPARTY_MAX) w.counterpartyMax = Number(process.env.SCORE_COUNTERPARTY_MAX);
  if (process.env.SCORE_COUNTERPARTY_MULT) w.counterpartyMultiplier = Number(process.env.SCORE_COUNTERPARTY_MULT);
  if (process.env.SCORE_LONGEVITY_MAX) w.longevityMax = Number(process.env.SCORE_LONGEVITY_MAX);
  if (process.env.SCORE_LONGEVITY_DIV) w.longevityDivisor = Number(process.env.SCORE_LONGEVITY_DIV);
  return w;
}

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

interface WalletStatsRow {
  address: string;
  total_transactions: number;
  transactions_as_sender: number;
  transactions_as_receiver: number;
  total_volume_usd: number;
  volume_sent_usd: number;
  volume_received_usd: number;
  unique_counterparties: number;
  first_seen: Date | null;
  last_seen: Date | null;
  transactions_7d: number;
}

async function getWalletStats(db: Pool, address: string): Promise<WalletStatsRow | null> {
  // Try pre-computed wallet_stats first (fast path).
  const { rows } = await db.query(
    `SELECT address, total_transactions, transactions_as_sender,
            transactions_as_receiver, total_volume_usd, volume_sent_usd,
            volume_received_usd, unique_counterparties, first_seen,
            last_seen, transactions_7d
     FROM wallet_stats WHERE address = $1`,
    [address],
  );

  if (rows.length > 0) {
    return rows[0] as WalletStatsRow;
  }

  // Fallback: compute from raw transactions table.
  const fallback = await db.query(
    `SELECT
       COUNT(*)::int AS total_transactions,
       COUNT(*) FILTER (WHERE from_address = $1)::int AS transactions_as_sender,
       COUNT(*) FILTER (WHERE to_address = $1)::int   AS transactions_as_receiver,
       COALESCE(SUM(amount_usd), 0)::float             AS total_volume_usd,
       COALESCE(SUM(amount_usd) FILTER (WHERE from_address = $1), 0)::float AS volume_sent_usd,
       COALESCE(SUM(amount_usd) FILTER (WHERE to_address = $1), 0)::float   AS volume_received_usd,
       MIN(block_time)                                  AS first_seen,
       MAX(block_time)                                  AS last_seen,
       COUNT(*) FILTER (WHERE block_time > NOW() - INTERVAL '7 days')::int AS transactions_7d
     FROM transactions
     WHERE from_address = $1 OR to_address = $1`,
    [address],
  );

  const r = fallback.rows[0];
  if (!r || Number(r.total_transactions) === 0) return null;

  // Compute unique counterparties with a separate query.
  const cpResult = await db.query(
    `SELECT COUNT(DISTINCT counterparty)::int AS unique_counterparties FROM (
       SELECT to_address AS counterparty FROM transactions WHERE from_address = $1
       UNION
       SELECT from_address AS counterparty FROM transactions WHERE to_address = $1
     ) sub`,
    [address],
  );

  return {
    address,
    total_transactions: Number(r.total_transactions),
    transactions_as_sender: Number(r.transactions_as_sender),
    transactions_as_receiver: Number(r.transactions_as_receiver),
    total_volume_usd: Number(r.total_volume_usd),
    volume_sent_usd: Number(r.volume_sent_usd),
    volume_received_usd: Number(r.volume_received_usd),
    unique_counterparties: Number(cpResult.rows[0].unique_counterparties),
    first_seen: r.first_seen ? new Date(r.first_seen) : null,
    last_seen: r.last_seen ? new Date(r.last_seen) : null,
    transactions_7d: Number(r.transactions_7d),
  };
}

// ---------------------------------------------------------------------------
// Metric computation
// ---------------------------------------------------------------------------

function emptyMetrics(): ReputationMetrics {
  return {
    total_transactions: 0,
    transactions_as_sender: 0,
    transactions_as_receiver: 0,
    total_volume_usd: 0,
    volume_sent_usd: 0,
    volume_received_usd: 0,
    unique_counterparties: 0,
    first_seen: null,
    last_seen: null,
    activity_span_days: 0,
    transactions_7d: 0,
    avg_transaction_usd: 0,
  };
}

function buildMetrics(stats: WalletStatsRow): ReputationMetrics {
  const firstSeen = stats.first_seen ? new Date(stats.first_seen) : null;
  const lastSeen = stats.last_seen ? new Date(stats.last_seen) : null;

  let activitySpanDays = 0;
  if (firstSeen && lastSeen) {
    activitySpanDays = Math.floor(
      (lastSeen.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  const avgTx =
    stats.total_transactions > 0
      ? stats.total_volume_usd / stats.total_transactions
      : 0;

  return {
    total_transactions: stats.total_transactions,
    transactions_as_sender: stats.transactions_as_sender,
    transactions_as_receiver: stats.transactions_as_receiver,
    total_volume_usd: Number(stats.total_volume_usd),
    volume_sent_usd: Number(stats.volume_sent_usd),
    volume_received_usd: Number(stats.volume_received_usd),
    unique_counterparties: stats.unique_counterparties,
    first_seen: firstSeen ? firstSeen.toISOString() : null,
    last_seen: lastSeen ? lastSeen.toISOString() : null,
    activity_span_days: activitySpanDays,
    transactions_7d: stats.transactions_7d,
    avg_transaction_usd: Math.round(avgTx * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Score computation
// ---------------------------------------------------------------------------

export function computeScore(
  metrics: ReputationMetrics,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): number {
  // Transaction component (0-25)
  const transactionComponent = Math.min(
    weights.transactionMax,
    Math.log10(metrics.total_transactions + 1) * weights.transactionMultiplier,
  );

  // Counterparty component (0-25)
  const counterpartyComponent = Math.min(
    weights.counterpartyMax,
    Math.log10(metrics.unique_counterparties + 1) * weights.counterpartyMultiplier,
  );

  // Longevity component (0-20)
  const longevityComponent = Math.min(
    weights.longevityMax,
    metrics.activity_span_days / weights.longevityDivisor,
  );

  // Activity component (0-15)
  let activityComponent = 0;
  if (metrics.transactions_7d > 0) {
    activityComponent = weights.activityRecent;
  } else if (metrics.last_seen) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(metrics.last_seen).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLast <= 30) {
      activityComponent = weights.activity30d;
    } else if (daysSinceLast <= 90) {
      activityComponent = weights.activity90d;
    }
  }

  // Balance component (0-15)
  let balanceComponent = 0;
  if (metrics.total_transactions > 0) {
    const sendRatio = metrics.transactions_as_sender / metrics.total_transactions;
    const receiveRatio = metrics.transactions_as_receiver / metrics.total_transactions;
    const balance = 1 - Math.abs(sendRatio - receiveRatio);
    balanceComponent = balance * weights.balanceMax;
  }

  const total =
    transactionComponent +
    counterpartyComponent +
    longevityComponent +
    activityComponent +
    balanceComponent;

  return Math.round(Math.min(100, Math.max(0, total)));
}

// ---------------------------------------------------------------------------
// Flag detection
// ---------------------------------------------------------------------------

export function detectFlags(metrics: ReputationMetrics): string[] {
  const flags: string[] = [];

  if (metrics.activity_span_days < 7) {
    flags.push('new_wallet');
  }

  if (
    metrics.total_transactions > 10 &&
    metrics.unique_counterparties < metrics.total_transactions * 0.3
  ) {
    flags.push('low_counterparty_diversity');
  }

  if (metrics.last_seen) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(metrics.last_seen).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLast > 30) {
      flags.push('dormant');
    }
  }

  if (
    metrics.total_transactions > 5 &&
    (metrics.transactions_as_sender === 0 || metrics.transactions_as_receiver === 0)
  ) {
    flags.push('one_direction');
  }

  if (
    metrics.transactions_7d > metrics.total_transactions * 0.8 &&
    metrics.total_transactions > 10
  ) {
    flags.push('burst_activity');
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function calculateReputation(
  db: Pool,
  address: string,
): Promise<ReputationResult> {
  const stats = await getWalletStats(db, address);

  if (!stats) {
    return {
      address,
      score: 0,
      metrics: emptyMetrics(),
      flags: ['no_history'],
      computed_at: new Date().toISOString(),
    };
  }

  const metrics = buildMetrics(stats);
  const weights = weightsFromEnv();
  const score = computeScore(metrics, weights);
  const flags = detectFlags(metrics);

  return {
    address,
    score,
    metrics,
    flags,
    computed_at: new Date().toISOString(),
  };
}
