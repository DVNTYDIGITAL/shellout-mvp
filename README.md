# Shell Out MVP - Parallel Build System

## What Is Shell Out?

Shell Out is trust infrastructure for the AI agent economy. We answer one question: **"Has this wallet transacted reliably before?"**

AI agents are now transacting with each other using x402 (Coinbase's payment protocol on Solana). There's currently no way to verify if an agent is trustworthy before sending them money or hiring them for a task. Shell Out solves this by tracking and analyzing transaction history.

When someone queries Shell Out with a wallet address, they get back:
- Total transaction count
- Total volume transacted
- Number of unique counterparties
- How long the wallet has been active
- Recent activity
- A computed reputation score (0-100)

This data helps humans and agents decide whether to trust a counterparty.

---

## The Mission

**Mission Statement:** Shell Out answers one question: "Has this wallet transacted reliably before?" We show transaction history and patterns. Users decide what to do with that information.

**What The MVP Accomplishes:**
- Indexes all x402 transactions on Solana in real-time
- Provides transaction history and reputation score for any wallet address
- Delivers this data via API that any platform can call
- Offers embeddable widget that works with two lines of code
- Gives public dashboard where anyone can look up any wallet

**Success Criteria:**
- Query any valid Solana wallet, get real data back in under 500ms
- New x402 transactions indexed within 60 seconds of occurring on-chain
- Developer can go from zero to working integration in under 5 minutes with no help
- Widget works when embedded on any external website
- All data is real, computed from actual blockchain activity, zero fake or simulated data

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SOLANA BLOCKCHAIN                        │
│                    (x402 Transactions)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INSTANCE 1: INDEXER                           │
│                                                                  │
│  - Connects to Solana RPC                                       │
│  - Identifies x402 transactions                                 │
│  - Parses transaction data                                      │
│  - Writes to database                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 INSTANCE 2: DATABASE                             │
│                                                                  │
│  Tables:                                                        │
│  - transactions (hash, from, to, amount, timestamp)             │
│  - wallet_stats (cached metrics per wallet)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              INSTANCE 3: REPUTATION CALCULATOR                   │
│                                                                  │
│  - Queries database for wallet's transactions                   │
│  - Computes metrics (count, volume, counterparties, etc.)       │
│  - Computes overall reputation score                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INSTANCE 4: API SERVER                        │
│                                                                  │
│  Endpoints:                                                     │
│  - GET /v1/reputation/:address                                  │
│  - GET /v1/health                                               │
│  - GET /v1/stats                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│ INSTANCE 5: WIDGET│ │INSTANCE 6:    │ │ INSTANCE 7: DOCS  │
│                   │ │DASHBOARD      │ │                   │
│ - JavaScript file │ │               │ │ - Integration     │
│ - Embeddable      │ │ - Public site │ │   guides          │
│ - Shows reputation│ │ - Search any  │ │ - API reference   │
│   visually        │ │   wallet      │ │ - Examples        │
└───────────────────┘ └───────────────┘ └───────────────────┘
```

---

## The Instances

| Instance | Name | Responsibility | Dependencies |
|----------|------|----------------|--------------|
| 0 | Orchestrator (CEO) | Oversees all instances, validates work, ensures integration | None |
| 1 | Blockchain Indexer | Reads Solana x402 transactions, writes to database | Instance 2 (database) |
| 2 | Database | Schema design, setup, optimization | None |
| 3 | Reputation Calculator | Computes metrics and scores from transaction data | Instance 2 |
| 4 | API Server | HTTP endpoints exposing reputation data | Instance 2, 3 |
| 5 | Embeddable Widget | JavaScript that renders reputation on any website | Instance 4 |
| 6 | Public Dashboard | Website for exploring Shell Out data | Instance 4 |
| 7 | Documentation | Integration guides, API reference, examples | Instance 4 |

---

## Execution Order

**Phase 1 (Parallel):**
- Start Instance 2 (Database) - no dependencies
- Start Instance 7 (Documentation) - can draft structure while others build

**Phase 2 (After Phase 1):**
- Start Instance 1 (Indexer) - needs database schema from Instance 2
- Start Instance 3 (Calculator) - needs database schema from Instance 2

**Phase 3 (After Phase 2):**
- Start Instance 4 (API) - needs calculator from Instance 3

**Phase 4 (Parallel, After Phase 3):**
- Start Instance 5 (Widget) - needs API from Instance 4
- Start Instance 6 (Dashboard) - needs API from Instance 4
- Complete Instance 7 (Documentation) - needs final API details

**Throughout:**
- Instance 0 (Orchestrator) monitors all instances, validates deliverables, ensures integration

---

## File Structure

```
shellout-mvp/
├── README.md (this file)
├── instance-0-orchestrator/
│   └── SPEC.md
├── instance-1-indexer/
│   └── SPEC.md
├── instance-2-database/
│   └── SPEC.md
├── instance-3-calculator/
│   └── SPEC.md
├── instance-4-api/
│   └── SPEC.md
├── instance-5-widget/
│   └── SPEC.md
├── instance-6-dashboard/
│   └── SPEC.md
└── instance-7-documentation/
    └── SPEC.md
```

---

## How To Use This

1. **Read this README** to understand the full picture
2. **Start with Instance 0 (Orchestrator)** - this instance manages everything
3. **Follow the execution order** - respect dependencies
4. **Each instance gets only its SPEC.md** - they are self-contained
5. **Orchestrator validates each deliverable** before moving to dependent instances

---

## Critical Rules

1. **No fake data.** Everything must be real, computed from actual blockchain transactions.
2. **No placeholder functionality.** If a feature is listed, it must actually work.
3. **Self-contained specs.** Each instance has zero context beyond its SPEC.md.
4. **Validate before proceeding.** Orchestrator must verify each deliverable meets criteria before dependent instances start.
5. **Production quality.** This is not a demo. It must work in the real world.

---

## Success Looks Like

When complete, someone should be able to:

1. Visit shellout.com, enter any Solana wallet address, see real reputation data
2. Call our API with any wallet address, get JSON response with real metrics
3. Add two lines of code to their website, see a working reputation widget
4. Read our docs and integrate Shell Out in under 5 minutes

If any of these don't work with real data, we have not succeeded.
