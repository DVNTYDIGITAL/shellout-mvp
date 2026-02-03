import {
  Connection,
  PublicKey,
  Logs,
  Context,
} from '@solana/web3.js';
import { config } from './config';
import { parseTransaction } from './parser';
import { insertTransaction, updateLastIndexedSlot, TransactionRecord } from './database';

let connection: Connection;
let subscriptionId: number | null = null;
let isRunning = false;
let lastProcessedSlot = 0;
let transactionsIndexedSession = 0;
let reconnectAttempts = 0;

// In-memory buffer for transactions when DB is temporarily unavailable
const pendingBuffer: TransactionRecord[] = [];
const MAX_BUFFER_SIZE = 1000;

// Set of signatures currently being processed to avoid duplicates
const processingSignatures = new Set<string>();

// Rate limiting: simple semaphore + delay
let activeRpcCalls = 0;
const rpcQueue: Array<() => void> = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  // Wait for a slot to open up
  while (activeRpcCalls >= config.maxConcurrentRpc) {
    await new Promise<void>((resolve) => rpcQueue.push(resolve));
  }
  activeRpcCalls++;
  try {
    await sleep(config.rpcDelayMs);
    return await fn();
  } finally {
    activeRpcCalls--;
    if (rpcQueue.length > 0) {
      const next = rpcQueue.shift()!;
      next();
    }
  }
}

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(config.solanaRpcUrl, {
      wsEndpoint: config.solanaWsUrl,
      commitment: 'confirmed',
    });
  }
  return connection;
}

export async function testRpcConnection(): Promise<boolean> {
  try {
    const conn = getConnection();
    const slot = await conn.getSlot();
    console.log('[RPC] Connected to Solana. Current slot:', slot);
    lastProcessedSlot = slot;
    return true;
  } catch (err: any) {
    console.error('[RPC] Connection failed:', err.message);
    return false;
  }
}

export function getIndexerStats() {
  return {
    isRunning,
    lastProcessedSlot,
    transactionsIndexedSession,
    pendingBufferSize: pendingBuffer.length,
    reconnectAttempts,
  };
}

async function processSignature(signature: string): Promise<void> {
  if (processingSignatures.has(signature)) return;
  processingSignatures.add(signature);

  // Clean up old signatures to prevent memory leak
  if (processingSignatures.size > 10000) {
    const entries = Array.from(processingSignatures);
    for (let i = 0; i < 5000; i++) {
      processingSignatures.delete(entries[i]);
    }
  }

  try {
    const conn = getConnection();
    const tx = await withRateLimit(() =>
      conn.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      })
    );

    if (!tx) return;

    const records = parseTransaction(signature, tx);

    for (const record of records) {
      const success = await insertTransaction(record);
      if (success) {
        transactionsIndexedSession++;
        console.log(
          `[IDX] Indexed USDC transfer: ${record.amount_usd} USDC | ${record.from_address.slice(0, 8)}... -> ${record.to_address.slice(0, 8)}... | sig: ${signature.slice(0, 16)}...`
        );
      }
    }

    if (tx.slot > lastProcessedSlot) {
      lastProcessedSlot = tx.slot;
      await updateLastIndexedSlot(tx.slot);
    }
  } catch (err: any) {
    console.error(`[IDX] Error processing ${signature.slice(0, 16)}...:`, err.message);
  }
}

export async function startRealtimeIndexer(): Promise<void> {
  if (isRunning) {
    console.log('[IDX] Indexer already running');
    return;
  }

  const conn = getConnection();
  const usdcMint = new PublicKey(config.usdcMint);

  isRunning = true;
  reconnectAttempts = 0;

  const subscribe = () => {
    console.log('[IDX] Subscribing to USDC token program logs...');

    // Subscribe to logs mentioning the USDC mint
    subscriptionId = conn.onLogs(
      usdcMint,
      async (logs: Logs, ctx: Context) => {
        if (logs.err) return;

        // Process in background — don't block the subscription callback
        processSignature(logs.signature).catch((err) => {
          console.error('[IDX] Background processing error:', err.message);
        });
      },
      'confirmed'
    );

    console.log('[IDX] Subscribed with ID:', subscriptionId);
  };

  subscribe();

  // Periodic health check — re-subscribe if websocket drops
  const healthInterval = setInterval(async () => {
    if (!isRunning) {
      clearInterval(healthInterval);
      return;
    }

    try {
      // Test connection is still alive
      await conn.getSlot();
      reconnectAttempts = 0;
    } catch (err: any) {
      console.warn('[IDX] RPC health check failed, attempting reconnect...');
      reconnectAttempts++;

      try {
        if (subscriptionId !== null) {
          await conn.removeOnLogsListener(subscriptionId);
        }
      } catch {
        // Ignore cleanup errors
      }

      const delay = Math.min(
        config.reconnectDelayMs * Math.pow(2, reconnectAttempts - 1),
        config.maxReconnectDelayMs
      );

      setTimeout(() => {
        if (isRunning) {
          console.log('[IDX] Reconnecting...');
          // Create new connection
          connection = new Connection(config.solanaRpcUrl, {
            wsEndpoint: config.solanaWsUrl,
            commitment: 'confirmed',
          });
          subscribe();
        }
      }, delay);
    }
  }, 30000);
}

export async function stopIndexer(): Promise<void> {
  isRunning = false;
  if (subscriptionId !== null) {
    try {
      const conn = getConnection();
      await conn.removeOnLogsListener(subscriptionId);
      subscriptionId = null;
      console.log('[IDX] Unsubscribed from logs');
    } catch (err: any) {
      console.error('[IDX] Error unsubscribing:', err.message);
    }
  }
}
