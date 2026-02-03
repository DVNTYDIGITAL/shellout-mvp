# Instance 2: Database

## Your Role

You design and set up the database for Shell Out. Your schema is the foundation that all other components build on. The indexer writes to it, the calculator reads from it, and performance depends on your design.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period.

**Your Part:** You design the data storage that makes this possible.

---

## What Data We Store

### Primary Data: Transactions

Every USDC transaction we index from Solana:
- Transaction signature (unique identifier)
- Sender wallet address
- Receiver wallet address
- Amount (in smallest unit and USD)
- Token mint address
- Timestamp
- Solana slot number

### Derived Data: Wallet Statistics (Cache)

Pre-computed statistics for each wallet to make queries fast:
- Total transactions (as sender + as receiver)
- Total volume (sent + received)
- Unique counterparties
- First transaction timestamp
- Last transaction timestamp
- Recent activity count (last 7 days)

This cache is updated when new transactions are indexed.

---

## Technical Requirements

### Database Choice
- PostgreSQL (via Supabase)
- Supabase provides free tier, easy setup, and good performance

### Why Supabase?
- Free tier is generous (500MB database)
- Built-in connection pooling
- Easy to set up
- Postgres compatibility
- Can scale later if needed

---

## Schema Design

### Table: transactions

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    
    -- Transaction identification
    signature VARCHAR(128) UNIQUE NOT NULL,
    
    -- Parties involved
    from_address VARCHAR(64) NOT NULL,
    to_address VARCHAR(64) NOT NULL,
    
    -- Amount
    amount_lamports BIGINT NOT NULL,
    amount_usd DECIMAL(20, 6) NOT NULL,
    
    -- Token info
    token_mint VARCHAR(64) NOT NULL,
    
    -- Timing
    block_time TIMESTAMP NOT NULL,
    slot BIGINT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_transactions_block_time ON transactions(block_time);
CREATE INDEX idx_transactions_from_time ON transactions(from_address, block_time);
CREATE INDEX idx_transactions_to_time ON transactions(to_address, block_time);
```

### Table: wallet_stats

```sql
CREATE TABLE wallet_stats (
    address VARCHAR(64) PRIMARY KEY,
    
    -- Transaction counts
    total_transactions INTEGER NOT NULL DEFAULT 0,
    transactions_as_sender INTEGER NOT NULL DEFAULT 0,
    transactions_as_receiver INTEGER NOT NULL DEFAULT 0,
    
    -- Volume
    total_volume_usd DECIMAL(20, 6) NOT NULL DEFAULT 0,
    volume_sent_usd DECIMAL(20, 6) NOT NULL DEFAULT 0,
    volume_received_usd DECIMAL(20, 6) NOT NULL DEFAULT 0,
    
    -- Counterparties
    unique_counterparties INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    
    -- Recent activity
    transactions_7d INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for finding recently active wallets
CREATE INDEX idx_wallet_stats_last_seen ON wallet_stats(last_seen);
CREATE INDEX idx_wallet_stats_total_transactions ON wallet_stats(total_transactions);
```

### Table: indexer_state

```sql
CREATE TABLE indexer_state (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store things like:
-- key: 'last_processed_slot', value: '123456789'
-- key: 'last_processed_signature', value: 'abc123...'
```

### Table: system_stats

```sql
CREATE TABLE system_stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Aggregate statistics
    total_transactions_indexed BIGINT NOT NULL DEFAULT 0,
    total_wallets_seen BIGINT NOT NULL DEFAULT 0,
    total_volume_usd DECIMAL(24, 6) NOT NULL DEFAULT 0,
    
    -- Timing
    oldest_transaction TIMESTAMP,
    newest_transaction TIMESTAMP,
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure only one row
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the single row
INSERT INTO system_stats (id) VALUES (1);
```

---

## Functions for Updating Wallet Stats

When the indexer writes a new transaction, we need to update wallet_stats. This can be done with a trigger or called explicitly.

### Function: update_wallet_stats_for_transaction

```sql
CREATE OR REPLACE FUNCTION update_wallet_stats_for_transaction(
    p_from_address VARCHAR(64),
    p_to_address VARCHAR(64),
    p_amount_usd DECIMAL(20, 6),
    p_block_time TIMESTAMP
) RETURNS VOID AS $$
BEGIN
    -- Update sender stats
    INSERT INTO wallet_stats (address, total_transactions, transactions_as_sender, total_volume_usd, volume_sent_usd, unique_counterparties, first_seen, last_seen, transactions_7d)
    VALUES (p_from_address, 1, 1, p_amount_usd, p_amount_usd, 1, p_block_time, p_block_time, 
            CASE WHEN p_block_time > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)
    ON CONFLICT (address) DO UPDATE SET
        total_transactions = wallet_stats.total_transactions + 1,
        transactions_as_sender = wallet_stats.transactions_as_sender + 1,
        total_volume_usd = wallet_stats.total_volume_usd + p_amount_usd,
        volume_sent_usd = wallet_stats.volume_sent_usd + p_amount_usd,
        first_seen = LEAST(wallet_stats.first_seen, p_block_time),
        last_seen = GREATEST(wallet_stats.last_seen, p_block_time),
        transactions_7d = CASE 
            WHEN p_block_time > NOW() - INTERVAL '7 days' 
            THEN wallet_stats.transactions_7d + 1 
            ELSE wallet_stats.transactions_7d 
        END,
        updated_at = NOW();
    
    -- Update receiver stats
    INSERT INTO wallet_stats (address, total_transactions, transactions_as_receiver, total_volume_usd, volume_received_usd, unique_counterparties, first_seen, last_seen, transactions_7d)
    VALUES (p_to_address, 1, 0, p_amount_usd, p_amount_usd, 1, p_block_time, p_block_time,
            CASE WHEN p_block_time > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)
    ON CONFLICT (address) DO UPDATE SET
        total_transactions = wallet_stats.total_transactions + 1,
        transactions_as_receiver = wallet_stats.transactions_as_receiver + 1,
        total_volume_usd = wallet_stats.total_volume_usd + p_amount_usd,
        volume_received_usd = wallet_stats.volume_received_usd + p_amount_usd,
        first_seen = LEAST(wallet_stats.first_seen, p_block_time),
        last_seen = GREATEST(wallet_stats.last_seen, p_block_time),
        transactions_7d = CASE 
            WHEN p_block_time > NOW() - INTERVAL '7 days' 
            THEN wallet_stats.transactions_7d + 1 
            ELSE wallet_stats.transactions_7d 
        END,
        updated_at = NOW();
    
    -- Update counterparty counts (this is expensive, consider doing periodically instead)
    UPDATE wallet_stats SET unique_counterparties = (
        SELECT COUNT(DISTINCT counterparty) FROM (
            SELECT to_address as counterparty FROM transactions WHERE from_address = p_from_address
            UNION
            SELECT from_address as counterparty FROM transactions WHERE to_address = p_from_address
        ) cp
    ) WHERE address = p_from_address;
    
    UPDATE wallet_stats SET unique_counterparties = (
        SELECT COUNT(DISTINCT counterparty) FROM (
            SELECT to_address as counterparty FROM transactions WHERE from_address = p_to_address
            UNION
            SELECT from_address as counterparty FROM transactions WHERE to_address = p_to_address
        ) cp
    ) WHERE address = p_to_address;
    
    -- Update system stats
    UPDATE system_stats SET
        total_transactions_indexed = total_transactions_indexed + 1,
        total_volume_usd = total_volume_usd + p_amount_usd,
        newest_transaction = GREATEST(newest_transaction, p_block_time),
        oldest_transaction = LEAST(COALESCE(oldest_transaction, p_block_time), p_block_time),
        updated_at = NOW()
    WHERE id = 1;
    
END;
$$ LANGUAGE plpgsql;
```

**Note:** The unique_counterparties calculation is expensive for high-volume wallets. For the MVP, this is acceptable. For scale, consider computing it periodically rather than on every transaction.

---

## Query Patterns

These are the queries other components will run. Optimize for these.

### Get wallet reputation data (Instance 3 - Calculator)

```sql
SELECT * FROM wallet_stats WHERE address = $1;
```

This should return in <10ms.

### Get recent transactions for a wallet (Instance 4 - API, for detailed view)

```sql
SELECT * FROM transactions 
WHERE from_address = $1 OR to_address = $1
ORDER BY block_time DESC
LIMIT 100;
```

This should return in <100ms.

### Get system statistics (Instance 4 - API)

```sql
SELECT * FROM system_stats WHERE id = 1;
```

This should return in <10ms.

### Check if transaction exists (Instance 1 - Indexer, for deduplication)

```sql
SELECT 1 FROM transactions WHERE signature = $1;
```

This should return in <10ms.

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key
4. Get the database connection string from Settings > Database

### Step 2: Run Schema

1. Go to SQL Editor in Supabase dashboard
2. Run the CREATE TABLE statements above
3. Run the CREATE INDEX statements
4. Run the CREATE FUNCTION statement
5. Run the INSERT for system_stats

### Step 3: Verify Setup

Run these queries to verify:

```sql
-- Should return empty but not error
SELECT * FROM transactions LIMIT 1;
SELECT * FROM wallet_stats LIMIT 1;
SELECT * FROM system_stats;
SELECT * FROM indexer_state;
```

### Step 4: Test Write

```sql
-- Insert test transaction
INSERT INTO transactions (signature, from_address, to_address, amount_lamports, amount_usd, token_mint, block_time, slot)
VALUES ('test_sig_123', 'sender_wallet_abc', 'receiver_wallet_xyz', 1000000, 1.00, 'USDC_MINT', NOW(), 12345);

-- Verify it's there
SELECT * FROM transactions WHERE signature = 'test_sig_123';

-- Clean up
DELETE FROM transactions WHERE signature = 'test_sig_123';
```

### Step 5: Test Performance

```sql
-- Insert 10,000 test transactions
INSERT INTO transactions (signature, from_address, to_address, amount_lamports, amount_usd, token_mint, block_time, slot)
SELECT 
    'test_' || generate_series || '_' || md5(random()::text),
    'wallet_' || (random() * 1000)::int,
    'wallet_' || (random() * 1000)::int,
    (random() * 1000000000)::bigint,
    random() * 1000,
    'USDC_MINT',
    NOW() - (random() * INTERVAL '365 days'),
    12345 + generate_series
FROM generate_series(1, 10000);

-- Test query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE from_address = 'wallet_500' ORDER BY block_time DESC LIMIT 100;

-- Should show index scan, total time < 100ms

-- Clean up test data
DELETE FROM transactions WHERE signature LIKE 'test_%';
```

---

## Deliverables

1. **Supabase project** configured and accessible
2. **Schema** deployed (all tables, indexes, functions)
3. **Documentation** of:
   - Connection string (DATABASE_URL format)
   - How to run the schema
   - Query patterns and expected performance
4. **Verification** that all tables exist and queries work

---

## Success Criteria

Your work is successful if:

- [ ] Supabase project is created and accessible
- [ ] All tables exist with correct schemas
- [ ] All indexes are created
- [ ] The update function works correctly
- [ ] Queries by wallet address return in <100ms with 10,000 rows
- [ ] Connection string is documented and tested
- [ ] A test transaction can be inserted and queried

---

## Failure Criteria

Your work has failed if:

- Tables are missing columns or have wrong types
- Indexes are missing, causing slow queries
- The update function has bugs that corrupt data
- Connection from external services fails
- Query performance is >500ms for basic lookups

---

## Dependencies

**What you need from other instances:**
- Nothing. You are a foundation with no dependencies.

**What other instances need from you:**
- Instance 1 (Indexer): Connection string, schema documentation
- Instance 3 (Calculator): Schema documentation, query examples
- Instance 4 (API): Connection string, schema documentation

---

## Handoff Checklist

Before marking your work complete, ensure you've provided:

- [ ] DATABASE_URL environment variable value
- [ ] Schema SQL file (for documentation/recovery)
- [ ] Confirmation that all tables exist
- [ ] Confirmation that test queries work
- [ ] Performance test results

---

## Security Notes

- The Supabase connection string contains credentials. Do not commit it to git.
- Use environment variables for all sensitive values.
- For the MVP, we're using the service role key for direct database access. In production, you'd use Row Level Security.

---

## Scaling Notes (For Future Reference)

The current schema works for MVP scale (up to millions of transactions). For larger scale:

1. **Partition the transactions table** by time (monthly or weekly partitions)
2. **Move counterparty calculation** to a periodic job instead of per-transaction
3. **Add read replicas** for query load
4. **Consider TimescaleDB** extension for time-series optimizations

These are not needed for MVP. Document them for future.
