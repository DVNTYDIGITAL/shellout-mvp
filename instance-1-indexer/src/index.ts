import { config } from './config';
import { testConnection, getLastIndexedSlot, closePool } from './database';
import { testRpcConnection, startRealtimeIndexer, stopIndexer } from './solana';
import { startHealthServer, stopHealthServer } from './health';
import { backfillTransactions } from './backfill';

async function main(): Promise<void> {
  console.log('=== Shell Out Indexer ===');
  console.log('Service: shellout.ai blockchain indexer');
  console.log('USDC Mint:', config.usdcMint);
  console.log('RPC:', config.solanaRpcUrl);
  console.log('');

  // 1. Test database connection
  console.log('[STARTUP] Testing database connection...');
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('[STARTUP] Cannot connect to database. Exiting.');
    process.exit(1);
  }

  // 2. Test Solana RPC connection
  console.log('[STARTUP] Testing Solana RPC connection...');
  const rpcOk = await testRpcConnection();
  if (!rpcOk) {
    console.error('[STARTUP] Cannot connect to Solana RPC. Exiting.');
    process.exit(1);
  }

  // 3. Check last indexed slot
  const lastSlot = await getLastIndexedSlot();
  if (lastSlot) {
    console.log(`[STARTUP] Resuming from slot ${lastSlot}`);
  } else {
    console.log('[STARTUP] No previous indexer state found. Starting fresh.');
  }

  // 4. Start health endpoint
  await startHealthServer();

  // 5. Start real-time indexer
  console.log('[STARTUP] Starting real-time indexer...');
  await startRealtimeIndexer();
  console.log('[STARTUP] Indexer is running.');

  // 6. Run a small backfill on startup (last 100 signatures) to catch anything missed
  if (process.env.BACKFILL_ON_START !== 'false') {
    console.log('[STARTUP] Running startup backfill (100 recent signatures)...');
    try {
      await backfillTransactions(100);
    } catch (err: any) {
      console.error('[STARTUP] Backfill error (non-fatal):', err.message);
    }
  }

  console.log('');
  console.log('=== Indexer fully operational ===');
  console.log(`Health endpoint: http://localhost:${config.port}/health`);
  console.log('');
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  console.log(`\n[SHUTDOWN] Received ${signal}. Shutting down gracefully...`);
  await stopIndexer();
  stopHealthServer();
  await closePool();
  console.log('[SHUTDOWN] Complete.');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[ERROR] Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[ERROR] Uncaught exception:', err);
  // Don't exit — try to keep running
});

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
