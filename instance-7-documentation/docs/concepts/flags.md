# Warning Flags Explained

Flags indicate patterns that may warrant caution. They appear in the `flags` array of the API response.

## Flag Types

### `no_history`

**Meaning:** This wallet has never made an x402 transaction.

**Implication:** Cannot assess trustworthiness based on history. The wallet may be new or unused for agent commerce.

**Recommended action:** Treat as unknown. Consider requiring escrow or smaller initial transactions.

---

### `new_wallet`

**Meaning:** Wallet has been active for less than 7 days.

**Implication:** Very limited history to assess. May be legitimate but too early to evaluate.

**Recommended action:** Proceed with caution. Monitor for follow-up activity.

---

### `low_counterparty_diversity`

**Meaning:** Wallet transacts mostly with a small number of other wallets.

**Implication:** Possible wash trading (fake transactions between controlled wallets to inflate reputation). Real commercial activity typically involves many counterparties.

**Recommended action:** Weigh this heavily. A high transaction count with low diversity is a red flag.

---

### `dormant`

**Meaning:** No transactions in the last 30 days.

**Implication:** Wallet may be inactive or abandoned. Past reputation may not reflect current reliability.

**Recommended action:** Check `last_seen` to determine how long the wallet has been dormant.

---

### `one_direction`

**Meaning:** Wallet only sends or only receives, never both.

**Implication:** May not be a typical service provider. Could be a payout-only or deposit-only address.

**Recommended action:** Not necessarily bad, but understand the context. A service provider should typically both send and receive.

---

### `burst_activity`

**Meaning:** Most of the wallet's transaction history is concentrated in a very recent period.

**Implication:** Could indicate deliberate reputation building. Someone may have quickly generated transactions to inflate their score before approaching you.

**Recommended action:** Look at `activity_span_days` and `transactions_7d` to gauge the pattern.

## Handling Flags in Code

Flags are additional signals, not automatic disqualifications. Consider them alongside the score:

```javascript
const reputation = await getReputation(address);

// Check for specific flags
if (reputation.flags.includes('low_counterparty_diversity')) {
  console.warn('This wallet may have inflated transaction count');
}

// A clean, high-score wallet
if (reputation.score >= 60 && reputation.flags.length === 0) {
  console.log('This wallet appears trustworthy');
}

// A flagged wallet - decide based on your risk tolerance
if (reputation.flags.includes('burst_activity')) {
  const spanDays = reputation.metrics.activity_span_days;
  const totalTx = reputation.metrics.total_transactions;
  console.warn(`${totalTx} transactions in ${spanDays} days - verify carefully`);
}
```

```python
reputation = get_reputation(address)

if 'no_history' in reputation['flags']:
    print('No transaction history - unknown wallet')

if reputation['score'] >= 60 and len(reputation['flags']) == 0:
    print('Wallet appears trustworthy')
```
