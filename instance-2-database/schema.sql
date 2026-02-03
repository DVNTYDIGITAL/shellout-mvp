-- Shell Out Database Schema
-- PostgreSQL schema for the Shell Out reputation system

-- ============================================
-- Table: transactions
-- ============================================
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

-- ============================================
-- Table: wallet_stats
-- ============================================
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

-- ============================================
-- Table: indexer_state
-- ============================================
CREATE TABLE indexer_state (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: system_stats
-- ============================================
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

-- ============================================
-- Function: update_wallet_stats_for_transaction
-- ============================================
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

    -- Update counterparty counts
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
