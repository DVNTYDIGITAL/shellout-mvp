import { PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';
import { config } from './config';
import { getConnection } from './solana';
import { parseTransaction } from './parser';
import { insertTransactionBatch, TransactionRecord } from './database';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Backfill historical USDC transactions by scanning signatures
 * for the USDC mint address.
 */
export async function backfillTransactions(
  maxSignatures: number = 1000,
  beforeSignature?: string
): Promise<{ processed: number; inserted: number; lastSignature: string | null }> {
  const conn = getConnection();
  const usdcMint = new PublicKey(config.usdcMint);

  let processed = 0;
  let inserted = 0;
  let lastSig: string | null = null;
  let before: string | undefined = beforeSignature;

  console.log(`[BACKFILL] Starting. Target: ${maxSignatures} signatures.`);

  while (processed < maxSignatures) {
    const batchSize = Math.min(config.backfillBatchSize, maxSignatures - processed);

    let signatures: ConfirmedSignatureInfo[];
    try {
      signatures = await conn.getSignaturesForAddress(usdcMint, {
        limit: batchSize,
        before,
      });
    } catch (err: any) {
      console.error('[BACKFILL] Error fetching signatures:', err.message);
      await sleep(config.backfillDelayMs * 2);
      continue;
    }

    if (signatures.length === 0) {
      console.log('[BACKFILL] No more signatures found.');
      break;
    }

    const batch: TransactionRecord[] = [];

    for (const sigInfo of signatures) {
      if (sigInfo.err) continue; // skip failed transactions

      try {
        const tx = await conn.getParsedTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });

        if (tx) {
          const records = parseTransaction(sigInfo.signature, tx);
          batch.push(...records);
        }
      } catch (err: any) {
        console.error(
          `[BACKFILL] Error processing ${sigInfo.signature.slice(0, 16)}...:`,
          err.message
        );
      }

      // Rate limiting
      await sleep(300);
    }

    if (batch.length > 0) {
      const count = await insertTransactionBatch(batch);
      inserted += count;
      console.log(
        `[BACKFILL] Batch: ${batch.length} transfers found, ${count} new inserted.`
      );
    }

    processed += signatures.length;
    before = signatures[signatures.length - 1].signature;
    lastSig = before;

    console.log(`[BACKFILL] Progress: ${processed}/${maxSignatures} signatures scanned.`);

    await sleep(config.backfillDelayMs);
  }

  console.log(
    `[BACKFILL] Complete. Scanned ${processed} signatures, inserted ${inserted} transactions.`
  );

  return { processed, inserted, lastSignature: lastSig };
}
