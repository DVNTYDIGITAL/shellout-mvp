# Instance 3: Reputation Calculator

## Your Role

You build the logic that turns raw transaction data into meaningful reputation metrics and scores. When someone asks "is this wallet trustworthy?", your code computes the answer.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period, and compute a reputation score.

**Your Part:** You take raw transaction data from the database and compute meaningful metrics and a reputation score.

---

## What You're Computing

For any wallet address, you compute:

### Raw Metrics
1. **total_transactions** - Total number of transactions (as sender + receiver)
2. **transactions_as_sender** - How many times they sent money
3. **transactions_as_receiver** - How many times they received money
4. **total_volume_usd** - Total USD value transacted
5. **volume_sent_usd** - USD sent
6. **volume_received_usd** - USD received
7. **unique_counterparties** - Number of distinct wallets they've transacted with
8. **first_seen** - Timestamp of first transaction
9. **last_seen** - Timestamp of most recent transaction
10. **activity_span_days** - Days between first and last transaction
11. **transactions_7d** - Transactions in the last 7 days
12. **avg_transaction_usd** - Average transaction size

### Computed Score
13. **reputation_score** - A number from 0-100 representing overall trustworthiness

### Flags (Optional Warnings)
14. **flags** - Array of warning strings if suspicious patterns detected

---

## The Reputation Score Formula

The reputation score combines multiple factors. Here's the formula:

```
reputation_score = 
    transaction_component +      (max 25 points)
    counterparty_component +     (max 25 points)
    longevity_component +        (max 20 points)
    activity_component +         (max 15 points)
    balance_component            (max 15 points)

Total: 0-100 points
```

### Component Breakdown

**Transaction Component (0-25 points)**
- Measures: How many transactions has this wallet done?
- Formula: `min(25, log10(total_transactions + 1) * 10)`
- Logic: More transactions = more established. Logarithmic to prevent gaming.
- Examples:
  - 0 transactions = 0 points
  - 10 transactions = 10 points
  - 100 transactions = 20 points
  - 1000+ transactions = 25 points (max)

**Counterparty Component (0-25 points)**
- Measures: How diverse is their transaction network?
- Formula: `min(25, log10(unique_counterparties + 1) * 12)`
- Logic: More unique counterparties = less likely to be gaming with fake accounts
- Examples:
  - 0 counterparties = 0 points
  - 5 counterparties = 8 points
  - 50 counterparties = 20 points
  - 200+ counterparties = 25 points (max)

**Longevity Component (0-20 points)**
- Measures: How long has this wallet been active?
- Formula: `min(20, activity_span_days / 9)`
- Logic: Longer history = more established. Caps at 180 days (6 months)
- Examples:
  - 0 days = 0 points
  - 30 days = 3.3 points
  - 90 days = 10 points
  - 180+ days = 20 points (max)

**Activity Component (0-15 points)**
- Measures: Is this wallet still active?
- Formula: 
  - If transactions_7d > 0: 15 points
  - Else if last_seen within 30 days: 10 points
  - Else if last_seen within 90 days: 5 points
  - Else: 0 points
- Logic: Recent activity indicates the wallet is still operational

**Balance Component (0-15 points)**
- Measures: Is transaction flow balanced (both sending and receiving)?
- Formula: 
  ```
  send_ratio = transactions_as_sender / total_transactions
  receive_ratio = transactions_as_receiver / total_transactions
  balance = 1 - abs(send_ratio - receive_ratio)
  balance_component = balance * 15
  ```
- Logic: A wallet that only sends or only receives might be suspicious. Balanced flow suggests legitimate usage.
- Examples:
  - 50% send, 50% receive = 15 points (perfect balance)
  - 70% send, 30% receive = 9 points
  - 100% send, 0% receive = 0 points

### Score Interpretation

- **0-20**: No history or very limited activity
- **21-40**: New or lightly used wallet
- **41-60**: Established with moderate activity
- **61-80**: Well-established with diverse activity
- **81-100**: Highly active, long history, diverse network

---

## Flag Detection

Flags are warnings about patterns that might indicate risk. They don't affect the score directly but provide additional context.

### Flag: "new_wallet"
- Condition: activity_span_days < 7
- Meaning: This wallet started transacting very recently

### Flag: "low_counterparty_diversity"
- Condition: total_transactions > 10 AND unique_counterparties < total_transactions * 0.3
- Meaning: Mostly transacting with the same few wallets (possible wash trading)

### Flag: "dormant"
- Condition: last_seen is more than 30 days ago
- Meaning: No recent activity

### Flag: "one_direction"
- Condition: transactions_as_sender == 0 OR transactions_as_receiver == 0 (and total > 5)
- Meaning: Only sends or only receives (unusual for a service provider)

### Flag: "burst_activity"
- Condition: transactions_7d > total_transactions * 0.8 AND total_transactions > 10
- Meaning: Most activity happened very recently (possible reputation building)

---

## Technical Implementation

### Language & Framework
- TypeScript/Node.js
- Should be importable as a module by the API server

### Input
- Database connection (to query wallet_stats and transactions tables)
- Wallet address to compute reputation for

### Output
```typescript
interface ReputationResult {
  address: string;
  score: number;  // 0-100
  metrics: {
    total_transactions: number;
    transactions_as_sender: number;
    transactions_as_receiver: number;
    total_volume_usd: number;
    volume_sent_usd: number;
    volume_received_usd: number;
    unique_counterparties: number;
    first_seen: string | null;  // ISO timestamp
    last_seen: string | null;   // ISO timestamp
    activity_span_days: number;
    transactions_7d: number;
    avg_transaction_usd: number;
  };
  flags: string[];
  computed_at: string;  // ISO timestamp
}
```

---

## Code Structure

```typescript
// calculator.ts

import { Pool } from 'pg';

interface ReputationResult {
  address: string;
  score: number;
  metrics: { ... };
  flags: string[];
  computed_at: string;
}

export async function calculateReputation(
  db: Pool, 
  address: string
): Promise<ReputationResult> {
  // 1. Get wallet stats from database
  const stats = await getWalletStats(db, address);
  
  // 2. If no stats, return empty result
  if (!stats) {
    return {
      address,
      score: 0,
      metrics: emptyMetrics(),
      flags: ['no_history'],
      computed_at: new Date().toISOString()
    };
  }
  
  // 3. Compute derived metrics
  const metrics = computeMetrics(stats);
  
  // 4. Compute score
  const score = computeScore(metrics);
  
  // 5. Detect flags
  const flags = detectFlags(metrics);
  
  // 6. Return result
  return {
    address,
    score,
    metrics,
    flags,
    computed_at: new Date().toISOString()
  };
}

function computeScore(metrics: Metrics): number {
  const transactionComponent = Math.min(25, Math.log10(metrics.total_transactions + 1) * 10);
  
  const counterpartyComponent = Math.min(25, Math.log10(metrics.unique_counterparties + 1) * 12);
  
  const longevityComponent = Math.min(20, metrics.activity_span_days / 9);
  
  let activityComponent = 0;
  if (metrics.transactions_7d > 0) {
    activityComponent = 15;
  } else if (metrics.days_since_last_seen <= 30) {
    activityComponent = 10;
  } else if (metrics.days_since_last_seen <= 90) {
    activityComponent = 5;
  }
  
  let balanceComponent = 0;
  if (metrics.total_transactions > 0) {
    const sendRatio = metrics.transactions_as_sender / metrics.total_transactions;
    const receiveRatio = metrics.transactions_as_receiver / metrics.total_transactions;
    const balance = 1 - Math.abs(sendRatio - receiveRatio);
    balanceComponent = balance * 15;
  }
  
  const totalScore = 
    transactionComponent + 
    counterpartyComponent + 
    longevityComponent + 
    activityComponent + 
    balanceComponent;
  
  return Math.round(totalScore);
}

function detectFlags(metrics: Metrics): string[] {
  const flags: string[] = [];
  
  if (metrics.activity_span_days < 7) {
    flags.push('new_wallet');
  }
  
  if (metrics.total_transactions > 10 && 
      metrics.unique_counterparties < metrics.total_transactions * 0.3) {
    flags.push('low_counterparty_diversity');
  }
  
  if (metrics.days_since_last_seen > 30) {
    flags.push('dormant');
  }
  
  if (metrics.total_transactions > 5 &&
      (metrics.transactions_as_sender === 0 || metrics.transactions_as_receiver === 0)) {
    flags.push('one_direction');
  }
  
  if (metrics.transactions_7d > metrics.total_transactions * 0.8 && 
      metrics.total_transactions > 10) {
    flags.push('burst_activity');
  }
  
  return flags;
}
```

---

## Database Queries

### Get Wallet Stats

```sql
SELECT 
  address,
  total_transactions,
  transactions_as_sender,
  transactions_as_receiver,
  total_volume_usd,
  volume_sent_usd,
  volume_received_usd,
  unique_counterparties,
  first_seen,
  last_seen,
  transactions_7d,
  updated_at
FROM wallet_stats 
WHERE address = $1;
```

### Fallback: Compute from Transactions (if wallet_stats is empty)

```sql
SELECT 
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE from_address = $1) as transactions_as_sender,
  COUNT(*) FILTER (WHERE to_address = $1) as transactions_as_receiver,
  COALESCE(SUM(amount_usd), 0) as total_volume_usd,
  COALESCE(SUM(amount_usd) FILTER (WHERE from_address = $1), 0) as volume_sent_usd,
  COALESCE(SUM(amount_usd) FILTER (WHERE to_address = $1), 0) as volume_received_usd,
  MIN(block_time) as first_seen,
  MAX(block_time) as last_seen,
  COUNT(*) FILTER (WHERE block_time > NOW() - INTERVAL '7 days') as transactions_7d
FROM transactions 
WHERE from_address = $1 OR to_address = $1;
```

---

## Test Cases

### Test 1: Empty Wallet

Input: Wallet address with no transactions

Expected Output:
```json
{
  "address": "empty_wallet_abc",
  "score": 0,
  "metrics": {
    "total_transactions": 0,
    "transactions_as_sender": 0,
    "transactions_as_receiver": 0,
    "total_volume_usd": 0,
    "volume_sent_usd": 0,
    "volume_received_usd": 0,
    "unique_counterparties": 0,
    "first_seen": null,
    "last_seen": null,
    "activity_span_days": 0,
    "transactions_7d": 0,
    "avg_transaction_usd": 0
  },
  "flags": ["no_history"],
  "computed_at": "2026-02-03T12:00:00Z"
}
```

### Test 2: New Active Wallet

Input: Wallet with 5 transactions, 3 counterparties, over 3 days, all in last week

Expected:
- Score: ~25-35
- Flags: ["new_wallet"]

### Test 3: Established Wallet

Input: Wallet with 200 transactions, 80 counterparties, over 180 days, 10 in last week

Expected:
- Score: ~75-85
- Flags: []

### Test 4: Suspicious Pattern

Input: Wallet with 50 transactions, 2 counterparties, over 30 days

Expected:
- Score: ~30-40
- Flags: ["low_counterparty_diversity"]

### Test 5: One-Direction Wallet

Input: Wallet with 20 transactions, all as sender, never received

Expected:
- Score: reduced due to low balance component
- Flags: ["one_direction"]

---

## Deliverables

1. **TypeScript module** that exports `calculateReputation` function
2. **Unit tests** covering all test cases above
3. **Documentation** of the score formula and flag conditions
4. **Example usage** showing how to call from the API

---

## Success Criteria

Your work is successful if:

- [ ] `calculateReputation` function works correctly
- [ ] Score formula produces expected results for test cases
- [ ] Flags are detected correctly
- [ ] Empty/missing wallets are handled gracefully (return 0 score, not error)
- [ ] Same input always produces same output (deterministic)
- [ ] Function executes in <100ms for any wallet
- [ ] Code is well-documented and easy to understand

---

## Failure Criteria

Your work has failed if:

- Score calculation produces negative numbers or >100
- Division by zero errors on empty wallets
- Database errors crash the function instead of returning graceful result
- Same wallet produces different scores on repeated calls
- Score formula doesn't match the documented formula
- Flags don't match the documented conditions

---

## Dependencies

**What you need from other instances:**
- Instance 2 (Database): Schema documentation and connection string

**What other instances need from you:**
- Instance 4 (API): The `calculateReputation` function to call

---

## Important Notes

### Determinism

The same wallet with the same data must always produce the same score. Don't use random elements or non-deterministic calculations.

### Performance

The function should be fast (<100ms) because it will be called on every API request. Use the pre-computed wallet_stats table rather than scanning all transactions.

### Edge Cases

Handle these gracefully:
- Wallet has never transacted (return score 0, flag no_history)
- Wallet has 1 transaction (valid, just a low score)
- Wallet has millions of transactions (should still work, use cached stats)
- Wallet address is invalid format (return error, not crash)

### Future Extensibility

The score formula may need adjustment based on real-world usage. Design the code so weights can be easily changed. Consider making weights configurable via environment variables for future A/B testing.
