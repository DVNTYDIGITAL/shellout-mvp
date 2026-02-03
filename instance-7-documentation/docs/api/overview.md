# API Overview

The Shell Out API provides reputation data for any Solana wallet address.

## Base URL

```
https://api.shellout.ai
```

## Authentication

No authentication required. Basic API access is free and open.

## Rate Limits

- 100 requests per minute per IP address
- Rate-limited responses return HTTP 429 with a `retry_after` field

Need higher limits? Contact us.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | [/v1/reputation/:address](reputation.md) | Get reputation for a wallet |
| GET | [/v1/health](health.md) | Health check |
| GET | [/v1/stats](stats.md) | Aggregate statistics |

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid request (e.g., bad wallet address) |
| 429 | Rate limit exceeded |
| 500 | Server error |

## CORS

The API supports CORS, so you can call it directly from browser-based applications.
