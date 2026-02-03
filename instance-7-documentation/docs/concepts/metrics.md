# Metrics Reference

Every reputation query returns a `metrics` object with detailed transaction data. This page explains what each metric means.

## Transaction Metrics

### total_transactions

Total number of transactions involving this wallet (both sent and received).

### transactions_as_sender

Number of transactions where this wallet sent funds to another wallet.

### transactions_as_receiver

Number of transactions where this wallet received funds from another wallet.

### transactions_7d

Number of transactions in the last 7 days. Useful for gauging current activity level.

## Volume Metrics

### total_volume_usd

Total USD value of all transactions involving this wallet (sent + received).

### volume_sent_usd

Total USD value sent by this wallet.

### volume_received_usd

Total USD value received by this wallet.

### avg_transaction_usd

Average transaction size in USD (`total_volume_usd / total_transactions`).

## Relationship Metrics

### unique_counterparties

Number of distinct wallets this wallet has transacted with. This is a key indicator of genuine commercial activity. A wallet with 100 transactions but only 2 counterparties is less trustworthy than one with 50 transactions across 30 counterparties.

## Time Metrics

### first_seen

ISO 8601 timestamp of the wallet's first indexed transaction. `null` if no transactions.

### last_seen

ISO 8601 timestamp of the wallet's most recent indexed transaction. `null` if no transactions.

### activity_span_days

Number of days between `first_seen` and `last_seen`. A longer span indicates a more established wallet. Zero for wallets with only one transaction.
