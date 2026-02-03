# Get Wallet Reputation

Retrieve reputation data for a specific wallet address.

## Endpoint

```
GET /v1/reputation/:address
```

## Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| address | string | path | Solana wallet address |

## Example Request

```bash
curl https://api.shellout.ai/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Example Response

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

## Response Fields

### Top Level

| Field | Type | Description |
|-------|------|-------------|
| address | string | The queried wallet address |
| score | number | Reputation score (0-100) |
| metrics | object | Detailed transaction metrics |
| flags | array | Warning flags, if any (see [Flags Explained](../concepts/flags.md)) |
| computed_at | string | ISO 8601 timestamp of when this score was calculated |

### Metrics Object

| Field | Type | Description |
|-------|------|-------------|
| total_transactions | number | Total transaction count |
| transactions_as_sender | number | Times this wallet sent funds |
| transactions_as_receiver | number | Times this wallet received funds |
| total_volume_usd | number | Total USD value transacted |
| volume_sent_usd | number | USD value sent |
| volume_received_usd | number | USD value received |
| unique_counterparties | number | Distinct wallets transacted with |
| first_seen | string | ISO 8601 timestamp of first transaction |
| last_seen | string | ISO 8601 timestamp of most recent transaction |
| activity_span_days | number | Days between first and last transaction |
| transactions_7d | number | Transactions in the last 7 days |
| avg_transaction_usd | number | Average transaction size in USD |

## Wallet With No History

If a wallet has no transactions, you still get a valid response with a score of 0:

```json
{
  "success": true,
  "data": {
    "address": "NewWalletAddressHere",
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

## Error Responses

### Invalid Address (400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The provided address is not a valid Solana wallet address"
  }
}
```

### Rate Limited (429)

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

## Code Examples

### JavaScript

```javascript
async function getReputation(address) {
  const response = await fetch(
    `https://api.shellout.ai/v1/reputation/${address}`
  );
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// Usage
const reputation = await getReputation('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
console.log(`Score: ${reputation.score}`);
console.log(`Transactions: ${reputation.metrics.total_transactions}`);
```

### Python

```python
import requests

def get_reputation(address):
    response = requests.get(
        f'https://api.shellout.ai/v1/reputation/{address}'
    )
    data = response.json()

    if not data['success']:
        raise Exception(data['error']['message'])

    return data['data']

# Usage
reputation = get_reputation('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
print(f"Score: {reputation['score']}")
print(f"Transactions: {reputation['metrics']['total_transactions']}")
```

### curl

```bash
# Get reputation score
curl -s https://api.shellout.ai/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU | jq '.data.score'

# Get full response, formatted
curl -s https://api.shellout.ai/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU | jq '.'
```
