import dotenv from 'dotenv';
dotenv.config();

export const config = {
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  solanaWsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
  databaseUrl: process.env.DATABASE_URL || '',
  usdcMint: process.env.USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  port: parseInt(process.env.PORT || '3001', 10),
  // Backfill settings
  backfillBatchSize: 50,
  backfillDelayMs: 500,
  // Reconnection settings
  reconnectDelayMs: 5000,
  maxReconnectDelayMs: 60000,
};
