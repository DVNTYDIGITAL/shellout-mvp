# Quick Start

Get Shell Out working in under 2 minutes.

## Option 1: Widget (Easiest)

Add reputation display to any website with two lines of code:

```html
<div data-shellout="WALLET_ADDRESS_HERE"></div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

Replace `WALLET_ADDRESS_HERE` with any Solana wallet address.

That's it. The widget fetches reputation data, renders a visual display, and handles loading and error states automatically.

## Option 2: API

Fetch reputation data directly:

```bash
curl https://api.shellout.ai/v1/reputation/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

Response:

```json
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
    "flags": [],
    "computed_at": "2026-02-03T12:00:00.000Z"
  }
}
```

No API key required. No authentication. Just send a GET request.

## Option 3: JavaScript

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

const reputation = await getReputation('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
console.log(`Score: ${reputation.score}`);
```

## Option 4: Python

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

reputation = get_reputation('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
print(f"Score: {reputation['score']}")
```

## Next Steps

- [Customize the widget](widget/customization.md)
- [Full API reference](api/overview.md)
- [Understand the score](concepts/score.md)
