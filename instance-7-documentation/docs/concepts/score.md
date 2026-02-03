# Understanding the Reputation Score

The reputation score is a number from 0 to 100 representing wallet trustworthiness based on on-chain transaction history.

## Score Ranges

| Range | Label | Meaning |
|-------|-------|---------|
| 70-100 | High | Highly established wallet with diverse, sustained activity |
| 40-69 | Moderate | Some history and activity, but not fully established |
| 0-39 | Low | Limited history, new wallet, or concerning patterns |

## How It's Calculated

The score is the sum of five components, each measuring a different dimension of wallet activity.

### 1. Transaction Count (25 points max)

More transactions indicate an established wallet.

- Uses a logarithmic scale (diminishing returns for very high counts)
- 10 transactions = ~10 points
- 100 transactions = ~20 points
- 1000+ transactions = ~25 points

### 2. Counterparty Diversity (25 points max)

Transacting with many different wallets is a strong positive signal.

- Protects against wash trading (fake transactions between a small number of wallets)
- More unique counterparties = higher score
- This is the hardest component to fake

### 3. Longevity (20 points max)

Longer active history indicates stability.

- Based on `activity_span_days` (days between first and last transaction)
- Scales linearly up to 180 days (6 months) for full points
- A wallet active for 90 days gets ~10 points

### 4. Recent Activity (15 points max)

Active wallets score higher than dormant ones.

| Condition | Points |
|-----------|--------|
| Active in last 7 days | 15 |
| Active in last 30 days | 10 |
| Active in last 90 days | 5 |
| Dormant longer than 90 days | 0 |

### 5. Balance (15 points max)

Wallets that both send and receive are more trusted than one-directional wallets.

- A 50/50 send/receive ratio earns maximum points
- Only sending or only receiving earns fewer points
- This signals the wallet is involved in genuine two-way commerce

## Example Breakdown

A wallet with:
- 156 transactions = ~21 points
- 43 unique counterparties = ~18 points
- 110 days active = ~12 points
- Active in last 7 days = 15 points
- Balanced send/receive = ~6 points

**Total: ~72 points**

## What the Score Doesn't Tell You

- Whether specific transactions were successful
- Quality of service provided by the wallet's owner
- Subjective satisfaction of counterparties
- Whether the wallet owner is a specific person or entity

The score is based entirely on on-chain transaction patterns, not off-chain outcomes.

## Flags

Flags provide additional context beyond the numeric score. A wallet with a score of 60 but a `low_counterparty_diversity` flag should be treated differently than one with a clean 60. See [Flags Explained](flags.md).
