import http from 'http';
import { config } from './config';
import { getIndexerStats } from './solana';
import { getTransactionCount } from './database';

let server: http.Server | null = null;

export async function startHealthServer(): Promise<void> {
  server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
      try {
        const stats = getIndexerStats();
        const totalTransactions = await getTransactionCount();

        const body = JSON.stringify({
          status: stats.isRunning ? 'ok' : 'stopped',
          service: 'shellout-indexer',
          domain: 'shellout.ai',
          last_indexed_slot: stats.lastProcessedSlot,
          transactions_indexed_session: stats.transactionsIndexedSession,
          transactions_total: totalTransactions,
          pending_buffer_size: stats.pendingBufferSize,
          reconnect_attempts: stats.reconnectAttempts,
          uptime_seconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(config.port, () => {
    console.log(`[HEALTH] Server listening on http://localhost:${config.port}/health`);
  });
}

export function stopHealthServer(): void {
  if (server) {
    server.close();
    server = null;
  }
}
