# Instance 7: Documentation

## Your Role

You write the documentation that enables developers to integrate Shell Out. A developer should be able to go from zero to working integration in under 5 minutes using only your docs.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period, and compute a reputation score.

**Your Part:** You write documentation so clear that developers can integrate without asking questions.

---

## What You're Building

A documentation site with:
1. **Quick Start** - Get working in 2 minutes
2. **API Reference** - Complete endpoint documentation
3. **Widget Guide** - How to embed the widget
4. **Score Explanation** - How reputation is calculated
5. **FAQ** - Common questions

---

## Technical Requirements

### Platform Options
- **Mintlify** - Modern docs platform (recommended)
- **GitBook** - Popular alternative
- **Docusaurus** - Self-hosted option
- **Plain Markdown** - If hosted with dashboard

### Requirements
- Clean, readable design
- Search functionality
- Code syntax highlighting
- Copy buttons on code blocks
- Mobile responsive

---

## Documentation Structure

```
docs/
├── index.md              # Overview/Introduction
├── quickstart.md         # Get started in 2 minutes
├── api/
│   ├── overview.md       # API basics
│   ├── reputation.md     # GET /v1/reputation/:address
│   ├── health.md         # GET /v1/health
│   └── stats.md          # GET /v1/stats
├── widget/
│   ├── installation.md   # Basic setup
│   ├── customization.md  # Themes, sizes, options
│   └── examples.md       # Real-world examples
├── concepts/
│   ├── score.md          # How reputation is calculated
│   ├── metrics.md        # What each metric means
│   └── flags.md          # Warning flags explained
└── faq.md                # Common questions
```

---

## Page Content

### index.md (Overview)

```markdown
# Shell Out Documentation

Shell Out provides reputation data for wallets in the AI agent economy.

## What is Shell Out?

Shell Out tracks transaction history on Solana and computes reputation scores. 
When you need to know if a wallet is trustworthy, query Shell Out.

## Quick Links

- [Quick Start](/quickstart) - Get integrated in 2 minutes
- [API Reference](/api/overview) - Full API documentation
- [Widget Guide](/widget/installation) - Embed reputation on your site

## Use Cases

- **Agent Marketplaces** - Show reputation on agent listings
- **Payment Flows** - Verify counterparty before transacting
- **Analytics** - Track wallet activity and trustworthiness
```

---

### quickstart.md

```markdown
# Quick Start

Get Shell Out working in under 2 minutes.

## Option 1: Widget (Easiest)

Add reputation display to any website with two lines of code:

\`\`\`html
<div data-shellout="WALLET_ADDRESS_HERE"></div>
<script src="https://cdn.shellout.com/widget.js"></script>
\`\`\`

Replace `WALLET_ADDRESS_HERE` with any Solana wallet address.

That's it! The widget will display the wallet's reputation.

## Option 2: API

Fetch reputation data directly:

\`\`\`bash
curl https://api.shellout.com/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
\`\`\`

Response:

\`\`\`json
{
  "success": true,
  "data": {
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "score": 72,
    "metrics": {
      "total_transactions": 156,
      "unique_counterparties": 43,
      "activity_span_days": 110
    },
    "flags": []
  }
}
\`\`\`

## Next Steps

- [Customize the widget](/widget/customization)
- [Full API reference](/api/overview)
- [Understand the score](/concepts/score)
```

---

### api/overview.md

```markdown
# API Overview

The Shell Out API provides reputation data for any Solana wallet address.

## Base URL

\`\`\`
https://api.shellout.com
\`\`\`

## Authentication

No authentication required for basic queries.

## Rate Limits

- 100 requests per minute per IP address
- Need more? Contact us.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /v1/reputation/:address | Get reputation for a wallet |
| GET | /v1/health | Health check |
| GET | /v1/stats | Aggregate statistics |

## Response Format

All responses follow this format:

\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

Or on error:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
\`\`\`
```

---

### api/reputation.md

```markdown
# Get Wallet Reputation

Retrieve reputation data for a specific wallet address.

## Endpoint

\`\`\`
GET /v1/reputation/:address
\`\`\`

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| address | string | Solana wallet address (path parameter) |

## Example Request

\`\`\`bash
curl https://api.shellout.com/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
\`\`\`

## Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "score": 72,
    "metrics": {
      "total_transactions": 156,
      "transactions_as_sender": 89,
      "transactions_as_receiver": 67,
      "total_volume_usd": 8420.50,
      "volume_sent_usd": 4200.25,
      "volume_received_usd": 4220.25,
      "unique_counterparties": 43,
      "first_seen": "2025-10-15T14:30:00Z",
      "last_seen": "2026-02-02T09:15:00Z",
      "activity_span_days": 110,
      "transactions_7d": 12,
      "avg_transaction_usd": 54.00
    },
    "flags": [],
    "computed_at": "2026-02-03T12:00:00.000Z"
  }
}
\`\`\`

## Response Fields

### Top Level

| Field | Type | Description |
|-------|------|-------------|
| address | string | The queried wallet address |
| score | number | Reputation score (0-100) |
| metrics | object | Detailed metrics |
| flags | array | Warning flags (if any) |
| computed_at | string | When this was calculated |

### Metrics Object

| Field | Type | Description |
|-------|------|-------------|
| total_transactions | number | Total transaction count |
| transactions_as_sender | number | Times this wallet sent funds |
| transactions_as_receiver | number | Times this wallet received funds |
| total_volume_usd | number | Total USD transacted |
| volume_sent_usd | number | USD sent |
| volume_received_usd | number | USD received |
| unique_counterparties | number | Distinct wallets transacted with |
| first_seen | string | First transaction timestamp |
| last_seen | string | Most recent transaction timestamp |
| activity_span_days | number | Days between first and last transaction |
| transactions_7d | number | Transactions in last 7 days |
| avg_transaction_usd | number | Average transaction size |

## Wallet With No History

If a wallet has no transactions, you still get a valid response:

\`\`\`json
{
  "success": true,
  "data": {
    "address": "NewWalletAddress",
    "score": 0,
    "metrics": {
      "total_transactions": 0,
      ...
    },
    "flags": ["no_history"],
    "computed_at": "2026-02-03T12:00:00.000Z"
  }
}
\`\`\`

## Error Responses

### Invalid Address (400)

\`\`\`json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The provided address is not a valid Solana wallet address"
  }
}
\`\`\`

### Rate Limited (429)

\`\`\`json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
\`\`\`

## Code Examples

### JavaScript

\`\`\`javascript
async function getReputation(address) {
  const response = await fetch(
    \`https://api.shellout.com/v1/reputation/\${address}\`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error.message);
  }
  
  return data.data;
}

// Usage
const reputation = await getReputation('7xKXtg...');
console.log(\`Score: \${reputation.score}\`);
\`\`\`

### Python

\`\`\`python
import requests

def get_reputation(address):
    response = requests.get(
        f'https://api.shellout.com/v1/reputation/{address}'
    )
    data = response.json()
    
    if not data['success']:
        raise Exception(data['error']['message'])
    
    return data['data']

# Usage
reputation = get_reputation('7xKXtg...')
print(f"Score: {reputation['score']}")
\`\`\`

### curl

\`\`\`bash
curl -s https://api.shellout.com/v1/reputation/7xKXtg... | jq '.data.score'
\`\`\`
```

---

### widget/installation.md

```markdown
# Widget Installation

Add Shell Out reputation to any website in seconds.

## Basic Installation

Add these two lines wherever you want the widget to appear:

\`\`\`html
<div data-shellout="YOUR_WALLET_ADDRESS"></div>
<script src="https://cdn.shellout.com/widget.js"></script>
\`\`\`

The widget will automatically:
1. Fetch reputation data from our API
2. Render a visual display
3. Handle loading and error states

## Placement

The widget renders inside the div you create. Place it wherever makes sense:

\`\`\`html
<div class="user-profile">
  <h2>Agent Profile</h2>
  <div data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"></div>
</div>
\`\`\`

## Multiple Widgets

You can have multiple widgets on one page:

\`\`\`html
<div data-shellout="WALLET_1"></div>
<div data-shellout="WALLET_2"></div>
<div data-shellout="WALLET_3"></div>
<script src="https://cdn.shellout.com/widget.js"></script>
\`\`\`

Only include the script once, even with multiple widgets.

## Dynamic Addresses

If you're using a framework like React:

\`\`\`jsx
function AgentCard({ walletAddress }) {
  return (
    <div data-shellout={walletAddress}></div>
  );
}
\`\`\`

Call `ShellOut.init()` after adding new widgets dynamically.
```

---

### widget/customization.md

```markdown
# Widget Customization

Customize the widget appearance to match your site.

## Size Options

### Full Size (Default)

Shows complete information with all metrics.

\`\`\`html
<div data-shellout="ADDRESS" data-shellout-size="full"></div>
\`\`\`

### Compact Size

Minimal display, just the score.

\`\`\`html
<div data-shellout="ADDRESS" data-shellout-size="compact"></div>
\`\`\`

## Theme Options

### Light Theme (Default)

\`\`\`html
<div data-shellout="ADDRESS" data-shellout-theme="light"></div>
\`\`\`

### Dark Theme

\`\`\`html
<div data-shellout="ADDRESS" data-shellout-theme="dark"></div>
\`\`\`

## Combining Options

\`\`\`html
<div 
  data-shellout="ADDRESS" 
  data-shellout-size="compact" 
  data-shellout-theme="dark"
></div>
\`\`\`

## Manual Initialization

If you add widgets after page load, call:

\`\`\`javascript
ShellOut.init();
\`\`\`

Or to initialize a specific element:

\`\`\`javascript
const element = document.getElementById('my-widget');
ShellOut.initWidget(element);
\`\`\`
```

---

### concepts/score.md

```markdown
# Understanding the Reputation Score

The reputation score is a number from 0-100 representing wallet trustworthiness based on transaction history.

## Score Ranges

| Range | Meaning |
|-------|---------|
| 70-100 | Highly established, diverse activity |
| 40-69 | Moderate history and activity |
| 0-39 | Limited history or concerning patterns |

## How It's Calculated

The score combines five factors:

### 1. Transaction Count (25 points max)

More transactions indicate an established wallet.

- Uses logarithmic scale (diminishing returns)
- 10 transactions ≈ 10 points
- 100 transactions ≈ 20 points
- 1000+ transactions ≈ 25 points

### 2. Counterparty Diversity (25 points max)

Transacting with many different wallets is a positive signal.

- Protects against wash trading (fake transactions with self)
- More unique counterparties = higher score

### 3. Longevity (20 points max)

Longer active history indicates stability.

- Based on days between first and last transaction
- Caps at 180 days (6 months) for max points

### 4. Recent Activity (15 points max)

Active wallets score higher than dormant ones.

- 15 points if active in last 7 days
- 10 points if active in last 30 days
- 5 points if active in last 90 days
- 0 points if dormant longer

### 5. Balance (15 points max)

Wallets that both send and receive are more trusted.

- 50/50 send/receive ratio = max points
- Only sending or only receiving = fewer points

## What the Score Doesn't Tell You

- Whether specific transactions were successful
- Quality of service provided
- Subjective satisfaction of counterparties

The score is based on on-chain transaction patterns, not off-chain outcomes.

## Flags

Flags provide additional context beyond the score. See [Flags Explained](/concepts/flags).
```

---

### concepts/flags.md

```markdown
# Warning Flags Explained

Flags indicate patterns that may warrant caution. They appear in the `flags` array of the API response.

## Flag Types

### no_history

**Meaning:** This wallet has never made an x402 transaction.

**Implication:** Cannot assess based on history. The wallet may be new or unused for agent commerce.

### new_wallet

**Meaning:** Wallet has been active for less than 7 days.

**Implication:** Very limited history to assess. May be legitimate but exercise caution.

### low_counterparty_diversity

**Meaning:** Mostly transacting with a small number of wallets.

**Implication:** Possible wash trading (fake transactions). Real commercial activity typically involves many counterparties.

### dormant

**Meaning:** No transactions in the last 30 days.

**Implication:** Wallet may be inactive or abandoned.

### one_direction

**Meaning:** Wallet only sends or only receives, never both.

**Implication:** May not be a typical service provider. Could be a payout-only or deposit-only address.

### burst_activity

**Meaning:** Most transaction history is very recent.

**Implication:** Could indicate reputation building. Be cautious of recently inflated histories.

## Handling Flags

Flags are additional signals, not automatic disqualifications. Consider them alongside the score:

\`\`\`javascript
const reputation = await getReputation(address);

if (reputation.flags.includes('low_counterparty_diversity')) {
  console.warn('This wallet may have inflated transaction count');
}

if (reputation.score >= 60 && reputation.flags.length === 0) {
  console.log('This wallet appears trustworthy');
}
\`\`\`
```

---

### faq.md

```markdown
# Frequently Asked Questions

## General

### What is Shell Out?

Shell Out provides reputation data for wallets on Solana. We track transaction history and compute trust scores.

### What data do you track?

We index USDC transactions on Solana, particularly those following the x402 payment protocol. We track sender, receiver, amount, and timestamp.

### Do you verify if services were delivered?

No. We track that transactions occurred, not whether off-chain obligations were met. We measure transaction patterns, not outcomes.

### Is my wallet tracked automatically?

If your wallet has made USDC transactions on Solana, we likely have data on it. We index public blockchain data.

## Integration

### Do I need an API key?

No. Basic API access is free and doesn't require authentication.

### Are there rate limits?

Yes. 100 requests per minute per IP. Contact us if you need more.

### Can I use Shell Out without showing the Shell Out branding?

Yes. Use the API directly and build your own UI. The widget includes branding, but API data is raw.

## Privacy & Data

### Can I remove my wallet from Shell Out?

We index public blockchain data. We don't control what's on the blockchain.

### Do you sell user data?

No. We provide reputation data for wallets, not user profiles.

## Technical

### Why does a new wallet have a score of 0?

Score is based on transaction history. No history = no evidence of trustworthiness = score of 0.

### How often is data updated?

New transactions are indexed within 60 seconds. Scores recalculate on each query.

### What blockchains do you support?

Currently Solana only. More chains planned.
```

---

## Testing the Docs

### Test 1: Quick Start Works
- Follow Quick Start guide exactly
- Should have working integration in under 2 minutes

### Test 2: Code Examples Work
- Copy each code example
- Run it
- Should work without modification (except addresses)

### Test 3: Complete Reference
- Every API field is documented
- Every endpoint is documented
- Every flag is explained

### Test 4: Searchable
- Try finding specific topics via search
- Should find relevant pages

### Test 5: Mobile Readable
- View docs on mobile
- Should be readable and navigable

---

## Deliverables

1. **Complete documentation** covering all sections
2. **Deployed docs site** at public URL
3. **All code examples** tested and working

---

## Success Criteria

- [ ] Developer can integrate in under 5 minutes using only docs
- [ ] All API endpoints documented with examples
- [ ] All code examples actually work
- [ ] Widget installation guide is complete
- [ ] Score calculation is explained
- [ ] FAQ answers common questions
- [ ] Docs are searchable
- [ ] Mobile responsive

---

## Failure Criteria

- Code examples don't work
- Missing endpoints or parameters
- Unclear explanations
- Developer needs to ask questions to integrate
- Broken links

---

## Dependencies

**What you need:**
- Instance 4 (API): Final API URL, all endpoint details
- Instance 5 (Widget): Final widget URL

**What others need from you:**
- Nothing directly, but good docs are critical for adoption

---

## Docs URL

Once deployed, provide the URL:
```
https://docs.shellout.com
```

Or if part of main site:
```
https://shellout.com/docs
```
