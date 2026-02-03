# Frequently Asked Questions

## General

### What is Shell Out?

Shell Out provides reputation data for wallets on Solana. We track transaction history and compute trust scores so you can assess whether a wallet is trustworthy before transacting with it.

### What problem does it solve?

AI agents increasingly transact with each other using cryptocurrency. There's no built-in way to know if an agent's wallet is trustworthy. Shell Out fills that gap by analyzing on-chain transaction patterns.

### What data do you track?

We index USDC transactions on Solana, particularly those following the x402 payment protocol. We track sender, receiver, amount, and timestamp for each transaction.

### Do you verify if services were delivered?

No. We track that transactions occurred, not whether off-chain obligations were met. We measure transaction patterns, not outcomes.

### Is my wallet tracked automatically?

If your wallet has made USDC transactions on Solana, we likely have data on it. We index public blockchain data — no opt-in required.

---

## Integration

### Do I need an API key?

No. Basic API access is free and requires no authentication.

### Are there rate limits?

Yes. 100 requests per minute per IP address. Contact us if you need more.

### Can I use Shell Out without showing Shell Out branding?

Yes. Use the [API](api/overview.md) directly and build your own UI. The widget includes Shell Out branding, but API data is raw JSON you can present however you like.

### How do I add the widget to my site?

Two lines of HTML:

```html
<div data-shellout="WALLET_ADDRESS"></div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

See the full [Widget Installation Guide](widget/installation.md).

### Does the widget work with React / Vue / Angular?

Yes. The widget works with any framework. See [Widget Examples](widget/examples.md) for framework-specific patterns. Call `ShellOut.init()` after dynamically adding widget elements.

---

## Scores & Data

### Why does a new wallet have a score of 0?

The score is based on transaction history. No history means no evidence of trustworthiness, so the score starts at 0. This is not a negative judgment — it simply means the wallet is unproven.

### What's a "good" score?

Depends on your risk tolerance. As a rough guide:
- **70+**: Well-established wallet with diverse activity
- **40-69**: Some history, moderate confidence
- **Below 40**: Limited data or concerning patterns

See [Understanding the Score](concepts/score.md) for details.

### How often is data updated?

New transactions are indexed within 60 seconds. Scores are recalculated on each query, so you always get the latest data.

### Can a score go down?

Yes. If a wallet becomes dormant (no recent activity), its score will decrease over time as the "recent activity" component drops.

### What are flags?

Flags are warning signals about specific patterns in a wallet's history. See [Flags Explained](concepts/flags.md) for the full list.

---

## Privacy & Data

### Can I remove my wallet from Shell Out?

We index public blockchain data. Blockchain transactions are permanent public records that we don't control.

### Do you sell user data?

No. We provide reputation data for wallets, not user profiles. We don't track or sell personal information.

### Do you link wallets to real identities?

No. Shell Out operates entirely on wallet addresses. We don't know or store who owns any wallet.

---

## Technical

### What blockchains do you support?

Currently Solana only. Additional chains are planned.

### What tokens do you track?

USDC on Solana, specifically transactions following the x402 payment protocol.

### Is the API available globally?

Yes. The API is available from any location with no geographic restrictions.

### Do you support WebSockets or real-time updates?

Not currently. Use polling with the REST API for near-real-time data.

### What happens if the API is down?

The widget gracefully handles API errors by showing a fallback state. If you're using the API directly, check the [Health endpoint](api/health.md) to verify service status.
