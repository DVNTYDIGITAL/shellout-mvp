# Instance 4: API Server

## Your Role

You build the HTTP API that exposes Shell Out's reputation data to the world. When a developer wants to check a wallet's reputation, they call your API. This is the primary interface between Shell Out and external users.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period, and compute a reputation score.

**Your Part:** You build the API that serves this data.

---

## What You're Building

An HTTP API server with these endpoints:

1. `GET /v1/reputation/:address` - Get reputation data for a wallet
2. `GET /v1/health` - Health check endpoint
3. `GET /v1/stats` - Aggregate system statistics

The API must be:
- Fast (<500ms response time)
- Reliable (handle errors gracefully)
- Open (no authentication required for basic queries)
- Embeddable (CORS enabled for any domain)

---

## Technical Requirements

### Language & Framework
- Node.js with TypeScript
- Express.js or Hono for HTTP server
- Use the calculator module from Instance 3

### Infrastructure
- Deploy to Vercel, Railway, or Render
- Must have a public URL
- Should scale automatically (serverless is fine)

### Environment Variables
```
DATABASE_URL=postgresql://...
PORT=3000 (optional, default 3000)
```

---

## API Specification

### Endpoint: GET /v1/reputation/:address

**Purpose:** Get reputation data for a specific wallet address.

**Parameters:**
- `address` (path parameter): Solana wallet address (base58 encoded, typically 32-44 characters)

**Success Response (200):**
```json
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
```

**No History Response (200):**
```json
{
  "success": true,
  "data": {
    "address": "NewWalletWithNoHistory123",
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
    "computed_at": "2026-02-03T12:00:00.000Z"
  }
}
```

**Invalid Address Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The provided address is not a valid Solana wallet address"
  }
}
```

**Server Error Response (500):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

### Endpoint: GET /v1/health

**Purpose:** Health check for monitoring.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "indexer_last_seen": "2026-02-03T11:59:30.000Z"
}
```

**Unhealthy Response (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "version": "1.0.0",
  "database": "disconnected",
  "error": "Database connection failed"
}
```

---

### Endpoint: GET /v1/stats

**Purpose:** Get aggregate system statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_transactions_indexed": 1234567,
    "total_wallets_seen": 45678,
    "total_volume_usd": 9876543.21,
    "oldest_transaction": "2025-08-01T00:00:00Z",
    "newest_transaction": "2026-02-03T11:55:00Z",
    "updated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

---

## CORS Configuration

The API must be callable from any domain. Configure CORS to allow:

```javascript
// Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));
```

---

## Rate Limiting

Implement basic rate limiting to prevent abuse:

- 100 requests per minute per IP address
- Return 429 Too Many Requests when exceeded

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Address Validation

Solana addresses are base58 encoded and typically 32-44 characters. Validate before processing:

```typescript
function isValidSolanaAddress(address: string): boolean {
  // Basic validation: length and character set
  if (address.length < 32 || address.length > 44) {
    return false;
  }
  
  // Base58 character set (no 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}
```

For production, you could use @solana/web3.js to validate:

```typescript
import { PublicKey } from '@solana/web3.js';

function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
```

---

## Code Structure

```
src/
├── index.ts           # Entry point, starts server
├── config.ts          # Environment variables
├── routes/
│   ├── reputation.ts  # /v1/reputation/:address
│   ├── health.ts      # /v1/health
│   └── stats.ts       # /v1/stats
├── middleware/
│   ├── cors.ts        # CORS configuration
│   ├── rateLimit.ts   # Rate limiting
│   └── errorHandler.ts # Global error handling
├── services/
│   └── calculator.ts  # Import from Instance 3
└── utils/
    └── validation.ts  # Address validation
```

---

## Example Implementation

```typescript
// index.ts
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { calculateReputation } from './services/calculator';

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(cors({ origin: '*' }));
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMIT_EXCEEDED', 
      message: 'Too many requests' 
    } 
  }
}));

// Routes
app.get('/v1/reputation/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address
    if (!isValidSolanaAddress(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'The provided address is not a valid Solana wallet address'
        }
      });
    }
    
    // Calculate reputation
    const result = await calculateReputation(pool, address);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating reputation:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

app.get('/v1/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    // Check indexer status
    const indexerResult = await pool.query(
      "SELECT value FROM indexer_state WHERE key = 'last_processed_time'"
    );
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      indexer_last_seen: indexerResult.rows[0]?.value || null
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

app.get('/v1/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_stats WHERE id = 1');
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        total_transactions_indexed: parseInt(stats.total_transactions_indexed),
        total_wallets_seen: parseInt(stats.total_wallets_seen),
        total_volume_usd: parseFloat(stats.total_volume_usd),
        oldest_transaction: stats.oldest_transaction,
        newest_transaction: stats.newest_transaction,
        updated_at: stats.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shell Out API running on port ${PORT}`);
});
```

---

## Testing

### Test 1: Basic Reputation Query

```bash
curl https://api.shellout.com/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

Expected: 200 response with reputation data

### Test 2: Invalid Address

```bash
curl https://api.shellout.com/v1/reputation/invalid
```

Expected: 400 response with INVALID_ADDRESS error

### Test 3: Wallet With No History

```bash
curl https://api.shellout.com/v1/reputation/SomeNewWalletThatHasNeverTransacted123
```

Expected: 200 response with score 0 and no_history flag

### Test 4: Health Check

```bash
curl https://api.shellout.com/v1/health
```

Expected: 200 response with healthy status

### Test 5: Stats

```bash
curl https://api.shellout.com/v1/stats
```

Expected: 200 response with aggregate statistics

### Test 6: CORS

```javascript
// Run this in browser console on any website
fetch('https://api.shellout.com/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
  .then(r => r.json())
  .then(console.log)
```

Expected: Response received without CORS error

### Test 7: Rate Limiting

```bash
# Run 101 requests rapidly
for i in {1..101}; do
  curl -s https://api.shellout.com/v1/health &
done
```

Expected: Some requests return 429

### Test 8: Performance

```bash
# Measure response time
time curl https://api.shellout.com/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

Expected: <500ms total time

---

## Deployment

### Option A: Vercel

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### Option B: Railway

Railway auto-detects Node.js projects. Just push to git and connect the repo.

### Option C: Render

Create `render.yaml`:
```yaml
services:
  - type: web
    name: shellout-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

---

## Deliverables

1. **Source code** in a git repository
2. **Deployed API** at a public URL
3. **README** with:
   - Setup instructions
   - Environment variables
   - API documentation
   - Deployment instructions
4. **Passing tests** for all endpoints

---

## Success Criteria

Your work is successful if:

- [ ] API is deployed and accessible at a public URL
- [ ] GET /v1/reputation/:address returns correct data for valid addresses
- [ ] GET /v1/reputation/:address returns proper error for invalid addresses
- [ ] GET /v1/reputation/:address returns score 0 (not error) for wallets with no history
- [ ] GET /v1/health returns status
- [ ] GET /v1/stats returns aggregate statistics
- [ ] Response time is <500ms for reputation queries
- [ ] CORS allows requests from any domain
- [ ] Rate limiting prevents abuse
- [ ] Errors are handled gracefully (no stack traces in responses)

---

## Failure Criteria

Your work has failed if:

- API crashes on unexpected input
- CORS blocks requests from external domains
- Response time exceeds 500ms regularly
- Invalid addresses cause 500 errors instead of 400
- Database errors expose internal details in response
- API returns different data than what calculator produces

---

## Dependencies

**What you need from other instances:**
- Instance 2 (Database): Connection string
- Instance 3 (Calculator): `calculateReputation` function

**What other instances need from you:**
- Instance 5 (Widget): API endpoint URL
- Instance 6 (Dashboard): API endpoint URL
- Instance 7 (Documentation): API specification details

---

## Security Notes

- Do not expose database credentials in responses
- Do not expose stack traces in error responses
- Log errors for debugging but return generic messages to users
- Validate all input before processing
- Use parameterized queries to prevent SQL injection (the calculator should handle this, but be aware)

---

## API URL

Once deployed, provide the API URL to other instances in this format:

```
https://api.shellout.com
```

Or if using a subdomain/path:

```
https://shellout.com/api
```

Document the exact URL in your README.
