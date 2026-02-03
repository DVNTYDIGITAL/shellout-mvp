import { Pool, PoolClient } from 'pg';
import { config } from './config';

export interface TransactionRecord {
  signature: string;
  from_address: string;
  to_address: string;
  amount_lamports: bigint | number;
  amount_usd: number;
  token_mint: string;
  block_time: Date;
  slot: number;
}

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });
  }
  return pool;
}

export async function testConnection(): Promise<boolean> {
  const p = getPool();
  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    const res = await client.query('SELECT NOW() as now');
    console.log('[DB] Connected successfully. Server time:', res.rows[0].now);
    return true;
  } catch (err: any) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  } finally {
    client?.release();
  }
}

export async function insertTransaction(tx: TransactionRecord): Promise<boolean> {
  const p = getPool();
  try {
    const res = await p.query(
      `INSERT INTO transactions (signature, from_address, to_address, amount_lamports, amount_usd, token_mint, block_time, slot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (signature) DO NOTHING`,
      [
        tx.signature,
        tx.from_address,
        tx.to_address,
        tx.amount_lamports.toString(),
        tx.amount_usd,
        tx.token_mint,
        tx.block_time,
        tx.slot,
      ]
    );

    // Update wallet_stats if a new row was actually inserted (not a duplicate)
    if (res.rowCount && res.rowCount > 0) {
      await p.query(
        `SELECT update_wallet_stats_for_transaction($1, $2, $3, $4)`,
        [tx.from_address, tx.to_address, tx.amount_usd, tx.block_time]
      );
    }

    return true;
  } catch (err: any) {
    console.error('[DB] Insert failed for', tx.signature, ':', err.message);
    return false;
  }
}

export async function insertTransactionBatch(txs: TransactionRecord[]): Promise<number> {
  if (txs.length === 0) return 0;
  const p = getPool();
  let inserted = 0;

  // Use a single transaction for the batch
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    for (const tx of txs) {
      const res = await client.query(
        `INSERT INTO transactions (signature, from_address, to_address, amount_lamports, amount_usd, token_mint, block_time, slot)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (signature) DO NOTHING`,
        [
          tx.signature,
          tx.from_address,
          tx.to_address,
          tx.amount_lamports.toString(),
          tx.amount_usd,
          tx.token_mint,
          tx.block_time,
          tx.slot,
        ]
      );
      if (res.rowCount && res.rowCount > 0) {
        await client.query(
          `SELECT update_wallet_stats_for_transaction($1, $2, $3, $4)`,
          [tx.from_address, tx.to_address, tx.amount_usd, tx.block_time]
        );
        inserted++;
      }
    }
    await client.query('COMMIT');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[DB] Batch insert failed:', err.message);
  } finally {
    client.release();
  }
  return inserted;
}

export async function getLastIndexedSlot(): Promise<number | null> {
  const p = getPool();
  try {
    const res = await p.query(
      `SELECT value FROM indexer_state WHERE key = 'last_processed_slot' LIMIT 1`
    );
    if (res.rows.length > 0 && res.rows[0].value) {
      return parseInt(res.rows[0].value, 10);
    }
    return null;
  } catch (err: any) {
    console.error('[DB] Failed to get last indexed slot:', err.message);
    return null;
  }
}

export async function updateLastIndexedSlot(slot: number): Promise<void> {
  const p = getPool();
  try {
    await p.query(
      `INSERT INTO indexer_state (key, value, updated_at)
       VALUES ('last_processed_slot', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [slot.toString()]
    );
  } catch (err: any) {
    console.error('[DB] Failed to update last indexed slot:', err.message);
  }
}

export async function getTransactionCount(): Promise<number> {
  const p = getPool();
  try {
    const res = await p.query('SELECT COUNT(*) as count FROM transactions');
    return parseInt(res.rows[0].count, 10);
  } catch (err: any) {
    console.error('[DB] Failed to get transaction count:', err.message);
    return 0;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}
