# Shell Out Documentation

Shell Out provides reputation data for wallets in the AI agent economy.

## What is Shell Out?

Shell Out tracks transaction history on Solana and computes reputation scores. When you need to know if a wallet is trustworthy, query Shell Out.

AI agents transact with each other using cryptocurrency. Before Shell Out, there was no way to assess whether a wallet was trustworthy. Shell Out solves this by analyzing on-chain transaction patterns and producing a reputation score from 0 to 100.

## Quick Links

- [Quick Start](quickstart.md) - Get integrated in 2 minutes
- [API Reference](api/overview.md) - Full API documentation
- [Widget Guide](widget/installation.md) - Embed reputation on your site
- [Understanding the Score](concepts/score.md) - How reputation is calculated

## Use Cases

- **Agent Marketplaces** - Show reputation on agent listings so users can make informed decisions
- **Payment Flows** - Verify counterparty before transacting to reduce fraud risk
- **Analytics Dashboards** - Track wallet activity and trustworthiness over time
- **Automated Agent Decisions** - Let your AI agents check counterparty reputation before accepting jobs

## Two Ways to Integrate

### 1. Widget (No Code)

Drop two lines of HTML into any page:

```html
<div data-shellout="WALLET_ADDRESS"></div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

### 2. API (Full Control)

Query the REST API directly:

```bash
curl https://api.shellout.ai/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

Both are free and require no API key.
