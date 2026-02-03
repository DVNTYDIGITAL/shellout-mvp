# Instance 1: Blockchain Indexer

## Your Role

You build the data foundation for Shell Out. Your job is to read x402 transactions from the Solana blockchain and store them in a database. Everything else in the system depends on your work.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period.

**Your Part:** You read the raw blockchain data and store it so other parts of the system can compute reputation scores.

---

## Context: What Is x402?

x402 is a payment protocol built by Coinbase. It allows AI agents to pay for services autonomously.

**How it works:**
1. An AI agent wants to access a paid API
2. The API responds with HTTP 402 "Payment Required" and payment instructions
3. The agent sends a stablecoin payment (usually USDC) on Solana
4. The agent retries the request with proof of payment
5. The API verifies and serves the response

**What you care about:** The payment transactions on Solana. These are standard SPL token transfers (usually USDC) but they follow x402 patterns and may include specific program interactions.

**Important:** x402 is relatively new. Transaction volume may be limited. Your indexer should work for any USDC transfer on Solana initially, with the ability to filter more specifically for x402-related transactions.

---

## What You're Building

A background service that:
1. Connects to Solana blockchain via RPC
2. Reads new transactions in real-time
3. Identifies relevant transactions (USDC transfers, x402 payments)
4. Extracts key data (sender, receiver, amount, timestamp)
5. Writes to the database
6. Can backfill historical transactions

---

## Technical Requirements

### Language & Framework
- Node.js with TypeScript
- Use @solana/web3.js for blockchain interaction

### Infrastructure
- Runs as a persistent background service
- Should be deployable to Railway, Render, or similar
- Needs environment variables for RPC endpoint and database connection

### Solana RPC
- Use Helius, QuickNode, or similar RPC provider (they have free tiers)
- Need websocket subscription for real-time transactions
- Need REST API for historical queries

### Database
- You will write to a PostgreSQL database
- Schema is provided by Instance 2
- You need the connection string as environment variable

---

## Database Schema (For Reference)

You will write to a table called `transactions` with this structure:

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    signature VARCHAR(128) UNIQUE NOT NULL,
    from_address VARCHAR(64) NOT NULL,
    to_address VARCHAR(64) NOT NULL,
    amount_lamports BIGINT NOT NULL,
    amount_usd DECIMAL(20, 6),
    token_mint VARCHAR(64) NOT NULL,
    block_time TIMESTAMP NOT NULL,
    slot BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Field explanations:**
- `signature`: Unique transaction signature (hash)
- `from_address`: Sender's wallet address
- `to_address`: Receiver's wallet address
- `amount_lamports`: Amount in smallest unit (for USDC, 6 decimals, so 1000000 = 1 USDC)
- `amount_usd`: Amount converted to USD (for USDC this equals amount_lamports / 1000000)
- `token_mint`: The token being transferred (USDC mint address for x402)
- `block_time`: When the transaction was confirmed
- `slot`: Solana slot number
- `created_at`: When we indexed it

---

## Key Constants

**USDC Mint Address on Solana Mainnet:**
```
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

**USDC Mint Address on Solana Devnet:**
```
4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

Start with devnet for testing, then switch to mainnet.

---

## Implementation Guide

### Step 1: Setup Project

```bash
mkdir shellout-indexer
cd shellout-indexer
npm init -y
npm install @solana/web3.js pg dotenv typescript ts-node @types/node @types/pg
npx tsc --init
```

### Step 2: Environment Variables

Create `.env`:
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
DATABASE_URL=postgresql://user:password@host:5432/shellout
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Step 3: Core Indexer Logic

The indexer needs to:

1. **Subscribe to token transfers**
   - Use `connection.onLogs` to subscribe to USDC program logs
   - Or use `connection.onAccountChange` on token accounts
   - Parse transfer instructions to extract from/to/amount

2. **Process each transaction**
   - Get full transaction details with `connection.getTransaction`
   - Extract sender, receiver, amount, timestamp
   - Handle parsing errors gracefully

3. **Write to database**
   - Insert new transactions
   - Handle duplicates (use ON CONFLICT DO NOTHING)
   - Batch inserts for efficiency

4. **Handle disconnections**
   - Websocket connections can drop
   - Implement reconnection logic
   - Track last processed slot to avoid gaps

### Step 4: Backfill Logic

For historical data:

1. Use `connection.getSignaturesForAddress` to get historical transactions
2. Process in batches (the API returns max 1000 at a time)
3. Use `before` parameter for pagination
4. Rate limit to avoid hitting RPC limits

### Step 5: Health Endpoint

Expose a simple HTTP endpoint:
- GET /health returns { status: "ok", last_indexed_slot: 123456, transactions_indexed: 5000 }

This lets the orchestrator verify the indexer is running.

---

## Code Structure

```
src/
├── index.ts           # Entry point, starts the indexer
├── config.ts          # Environment variable loading
├── database.ts        # Database connection and queries
├── solana.ts          # Solana RPC connection and subscriptions
├── parser.ts          # Transaction parsing logic
├── backfill.ts        # Historical backfill logic
└── health.ts          # Health check HTTP server
```

---

## Handling Edge Cases

### Transaction Parsing Failures
- Some transactions may have unexpected formats
- Log the error, skip the transaction, continue processing
- Don't crash the indexer on parse errors

### RPC Rate Limits
- Public RPC endpoints have rate limits
- Implement exponential backoff on errors
- Consider using a paid RPC provider for production

### Database Connection Issues
- Implement connection retry logic
- Buffer transactions in memory if database is temporarily unavailable
- Don't lose transactions due to transient database issues

### Duplicate Transactions
- The same transaction might be seen multiple times (resubscription, backfill overlap)
- Use `INSERT ... ON CONFLICT (signature) DO NOTHING`

### Missing Transactions
- Track the last processed slot
- On restart, check for gaps and backfill if needed
- Log warnings if gaps are detected

---

## Testing Your Indexer

### Test 1: Basic Connectivity
```bash
# Verify RPC connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' \
  $SOLANA_RPC_URL
```

### Test 2: Database Write
- Manually insert a test transaction
- Verify it appears in the database
- Delete the test transaction

### Test 3: Real-Time Indexing
- Start the indexer
- Make a small USDC transfer on devnet
- Verify the transaction appears in database within 60 seconds

### Test 4: Backfill
- Run the backfill script
- Verify historical transactions appear in database
- Check that duplicates are handled correctly

### Test 5: Resilience
- Start the indexer
- Kill the database connection
- Verify the indexer doesn't crash
- Restore connection
- Verify indexing resumes

---

## Deliverables

1. **Source code** in a git repository
2. **README** with setup and deployment instructions
3. **Working indexer** that:
   - Indexes new USDC transactions within 60 seconds
   - Can backfill historical transactions
   - Has a health endpoint
   - Handles errors gracefully
4. **Deployment** to Railway/Render/similar (or instructions to do so)

---

## Success Criteria

Your work is successful if:

- [ ] Indexer connects to Solana RPC without errors
- [ ] Indexer identifies USDC transfers correctly
- [ ] Indexer writes transactions to database with correct data
- [ ] New transactions appear in database within 60 seconds of on-chain confirmation
- [ ] Backfill script can index historical transactions
- [ ] Health endpoint returns current status
- [ ] Indexer runs for 24+ hours without crashing
- [ ] Indexer recovers gracefully from RPC disconnections
- [ ] Indexer handles database connection issues without losing data

---

## Failure Criteria

Your work has failed if:

- Indexer crashes on malformed transactions
- Transactions are written with incorrect data (wrong amounts, wrong addresses)
- Indexer falls more than 5 minutes behind real-time
- Indexer cannot be restarted after a crash
- Database fills with duplicate transactions
- Health endpoint doesn't reflect actual indexer state

---

## Dependencies

**What you need from other instances:**
- Instance 2 (Database): Connection string and confirmed schema

**What other instances need from you:**
- Instance 3 (Calculator): Transactions in the database to compute on
- Instance 0 (Orchestrator): Health endpoint to monitor your status

---

## Questions to Answer During Implementation

If you discover something that changes the approach, document it:

1. What is the actual structure of x402 transactions on Solana?
2. Are there specific program IDs to filter for x402 vs. general USDC transfers?
3. What are the rate limits on the chosen RPC provider?
4. What is the realistic transaction volume we'll be indexing?

Document your findings in a `RESEARCH.md` file in your repository.

---

## Getting Help

If you're blocked:
- Check Solana documentation: https://docs.solana.com
- Check @solana/web3.js docs: https://solana-labs.github.io/solana-web3.js
- Check x402 documentation: https://docs.cdp.coinbase.com/x402/welcome
- Look at example indexers on GitHub

If you need a decision from the orchestrator:
- Document the question clearly
- Explain the options
- Make a recommendation
- Flag for Instance 0 review
