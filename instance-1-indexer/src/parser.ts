import {
  ParsedTransactionWithMeta,
  ParsedInstruction,
  PartiallyDecodedInstruction,
} from '@solana/web3.js';
import { config } from './config';
import { TransactionRecord } from './database';

export interface ParsedTransfer {
  from_address: string;
  to_address: string;
  amount_lamports: number;
  token_mint: string;
}

/**
 * Parse a confirmed transaction to extract USDC transfers.
 * Returns an array because a single tx can contain multiple transfers.
 */
export function parseTransaction(
  signature: string,
  tx: ParsedTransactionWithMeta
): TransactionRecord[] {
  const results: TransactionRecord[] = [];

  if (!tx.meta || tx.meta.err) return results;

  const blockTime = tx.blockTime;
  if (!blockTime) return results;

  const slot = tx.slot;

  // Look through inner instructions and top-level instructions for SPL token transfers
  const allInstructions: (ParsedInstruction | PartiallyDecodedInstruction)[] = [
    ...tx.transaction.message.instructions,
  ];

  // Include inner instructions
  if (tx.meta.innerInstructions) {
    for (const inner of tx.meta.innerInstructions) {
      allInstructions.push(...inner.instructions);
    }
  }

  for (const ix of allInstructions) {
    // Only look at parsed instructions from the Token Program
    if (!('parsed' in ix)) continue;
    const parsed = ix as ParsedInstruction;

    if (
      parsed.program !== 'spl-token' ||
      (parsed.parsed?.type !== 'transfer' && parsed.parsed?.type !== 'transferChecked')
    ) {
      continue;
    }

    const info = parsed.parsed?.info;
    if (!info) continue;

    let amount: number;
    let mint: string | undefined;

    if (parsed.parsed.type === 'transferChecked') {
      // transferChecked has tokenAmount and mint directly
      amount = parseInt(info.tokenAmount?.amount || '0', 10);
      mint = info.mint;
    } else {
      // plain transfer — amount is a string number
      amount = parseInt(info.amount || '0', 10);
      // For plain transfers, mint isn't in the instruction — we check post-token balances
      mint = undefined;
    }

    if (amount <= 0) continue;

    // Resolve mint from post-token balances if not present
    if (!mint && tx.meta.postTokenBalances) {
      for (const bal of tx.meta.postTokenBalances) {
        if (bal.mint === config.usdcMint) {
          mint = bal.mint;
          break;
        }
      }
    }

    // Only index USDC
    if (mint !== config.usdcMint) continue;

    // Resolve owner addresses from token accounts using pre/post token balances
    const source: string = info.authority || info.source || '';
    const destination: string = info.destination || '';

    // Try to resolve actual wallet owners from token balances
    let fromAddress = source;
    let toAddress = destination;

    if (tx.meta.postTokenBalances) {
      for (const bal of tx.meta.postTokenBalances) {
        if (bal.mint !== config.usdcMint) continue;
        // Match account index to resolve owner
        const accountKeys = tx.transaction.message.accountKeys;
        if (accountKeys[bal.accountIndex]?.pubkey.toBase58() === source && bal.owner) {
          fromAddress = bal.owner;
        }
        if (accountKeys[bal.accountIndex]?.pubkey.toBase58() === destination && bal.owner) {
          toAddress = bal.owner;
        }
      }
    }

    if (!fromAddress || !toAddress) continue;

    const amountUsd = amount / 1_000_000; // USDC has 6 decimals

    results.push({
      signature,
      from_address: fromAddress,
      to_address: toAddress,
      amount_lamports: amount,
      amount_usd: amountUsd,
      token_mint: config.usdcMint,
      block_time: new Date(blockTime * 1000),
      slot,
    });
  }

  return results;
}
