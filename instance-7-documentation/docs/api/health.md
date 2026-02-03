# Health Check

Check if the Shell Out API is operational.

## Endpoint

```
GET /v1/health
```

## Parameters

None.

## Example Request

```bash
curl https://api.shellout.ai/v1/health
```

## Example Response

```json
{
  "status": "healthy",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "version": "1.0.0",
  "database": "connected",
  "indexer_last_seen": "2026-02-03T11:59:30.000Z"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | `"healthy"` if the API is operational |
| timestamp | string | Current server time (ISO 8601) |
| version | string | API version string |
| database | string | Database connection status (e.g., `"connected"`) |
| indexer_last_seen | string | ISO 8601 timestamp of the last indexed transaction |

> **Note:** Unlike other endpoints, the health endpoint returns fields at the top level (not wrapped in `success`/`data`).

## Use Cases

- Monitoring: poll this endpoint to detect outages
- Integration testing: verify connectivity before making reputation queries
