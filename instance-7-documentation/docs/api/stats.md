# Aggregate Statistics

Get aggregate statistics about the Shell Out network.

## Endpoint

```
GET /v1/stats
```

## Parameters

None.

## Example Request

```bash
curl https://api.shellout.ai/v1/stats
```

## Example Response

```json
{
  "success": true,
  "data": {
    "total_transactions_indexed": 284000,
    "total_wallets_seen": 12450,
    "total_volume_usd": 1547230.75,
    "oldest_transaction": "2025-08-01T00:00:00.000Z",
    "newest_transaction": "2026-02-03T11:59:30.000Z",
    "updated_at": "2026-02-03T12:00:00.000Z"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| total_transactions_indexed | number | Total transactions processed |
| total_wallets_seen | number | Number of unique wallets in the index |
| total_volume_usd | number | Total USD volume across all indexed transactions |
| oldest_transaction | string | ISO 8601 timestamp of the earliest indexed transaction |
| newest_transaction | string | ISO 8601 timestamp of the most recently indexed transaction |
| updated_at | string | ISO 8601 timestamp of when these stats were last computed |

## Use Cases

- Display network size on a dashboard
- Monitor indexing health (check that `newest_transaction` is recent)
