import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { calculateReputation } from './calculator';
import path from 'path';

const app = express();

// Trust proxy - required for Railway/behind reverse proxy
app.set('trust proxy', 1);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// CORS — allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiting — 100 req/min/IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retry_after: 60,
    },
  },
});
app.use(limiter);

// Serve widget.min.js at /widget.js
app.get('/widget.js', (_req, res) => {
  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  });
  res.sendFile(path.join(__dirname, '..', 'public', 'widget.min.js'));
});

// Solana address validation
function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

// GET /v1/reputation/:address
app.get('/v1/reputation/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidSolanaAddress(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'The provided address is not a valid Solana wallet address',
        },
      });
    }

    const result = await calculateReputation(pool, address);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error calculating reputation:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// GET /v1/health
app.get('/v1/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    const indexerResult = await pool.query(
      "SELECT value FROM indexer_state WHERE key = 'last_processed_time'"
    );

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      indexer_last_seen: indexerResult.rows[0]?.value || null,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// GET /v1/stats
app.get('/v1/stats', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_stats LIMIT 1');
    const stats = result.rows[0];

    if (!stats) {
      return res.json({
        success: true,
        data: {
          total_transactions_indexed: 0,
          total_wallets_seen: 0,
          total_volume_usd: 0,
          oldest_transaction: null,
          newest_transaction: null,
          updated_at: new Date().toISOString(),
        },
      });
    }

    return res.json({
      success: true,
      data: {
        total_transactions_indexed: parseInt(stats.total_transactions_indexed) || 0,
        total_wallets_seen: parseInt(stats.total_wallets_seen) || 0,
        total_volume_usd: parseFloat(stats.total_volume_usd) || 0,
        oldest_transaction: stats.oldest_transaction || null,
        newest_transaction: stats.newest_transaction || null,
        updated_at: stats.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shell Out API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/v1/health`);
});

export default app;
