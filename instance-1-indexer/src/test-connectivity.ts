import { config } from './config';
import { testConnection, getTransactionCount, closePool } from './database';
import { testRpcConnection, getConnection } from './solana';
import { PublicKey } from '@solana/web3.js';
import { parseTransaction } from './parser';

async function main() {
  console.log('=== Connectivity Test ===\n');

  // Test 1: Database
  console.log('--- Test 1: Database Connection ---');
  const dbOk = await testConnection();
  console.log('Result:', dbOk ? 'PASS' : 'FAIL');
  if (dbOk) {
    const count = await getTransactionCount();
    console.log('Current transaction count:', count);
  }
  console.log('');

  // Test 2: Solana RPC
  console.log('--- Test 2: Solana RPC Connection ---');
  const rpcOk = await testRpcConnection();
  console.log('Result:', rpcOk ? 'PASS' : 'FAIL');
  console.log('');

  // Test 3: Fetch a recent USDC signature and parse it
  console.log('--- Test 3: USDC Transaction Parsing ---');
  if (rpcOk) {
    try {
      const conn = getConnection();
      const usdcMint = new PublicKey(config.usdcMint);
      const sigs = await conn.getSignaturesForAddress(usdcMint, { limit: 5 });
      console.log(`Found ${sigs.length} recent USDC signatures`);

      let parsedAny = false;
      for (const sigInfo of sigs) {
        if (sigInfo.err) continue;
        const tx = await conn.getParsedTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });
        if (!tx) continue;

        const records = parseTransaction(sigInfo.signature, tx);
        if (records.length > 0) {
          console.log('Successfully parsed USDC transfer:');
          console.log('  Signature:', sigInfo.signature.slice(0, 32) + '...');
          console.log('  From:', records[0].from_address);
          console.log('  To:', records[0].to_address);
          console.log('  Amount:', records[0].amount_usd, 'USDC');
          console.log('  Slot:', records[0].slot);
          parsedAny = true;
          break;
        }
      }

      console.log('Result:', parsedAny ? 'PASS' : 'PARTIAL (signatures found but no simple transfers in sample)');
    } catch (err: any) {
      console.log('Result: FAIL -', err.message);
    }
  } else {
    console.log('Result: SKIP (RPC not connected)');
  }

  console.log('\n=== Tests Complete ===');
  await closePool();
  process.exit(0);
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
