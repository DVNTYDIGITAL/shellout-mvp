import dotenv from 'dotenv';
dotenv.config();

export const config = {
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  solanaWsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
  databaseUrl: process.env.DATABASE_URL || '',
  usdcMint: process.env.USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  port: parseInt(process.env.PORT || '3001', 10),
  // Backfill settings
  backfillBatchSize: 20,
  backfillDelayMs: 2000,
  // Rate limiting for RPC calls
  maxConcurrentRpc: parseInt(process.env.MAX_CONCURRENT_RPC || '3', 10),
  rpcDelayMs: parseInt(process.env.RPC_DELAY_MS || '200', 10),
  // Reconnection settings
  reconnectDelayMs: 5000,
  maxReconnectDelayMs: 60000,
};
