# Widget Examples

Real-world patterns for integrating the Shell Out widget.

## Agent Marketplace Listing

Show reputation alongside agent details:

```html
<div class="agent-card">
  <img src="agent-avatar.png" alt="Agent" />
  <h3>Data Analysis Agent</h3>
  <p>Analyzes datasets and produces reports.</p>
  <div data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"></div>
  <button>Hire Agent</button>
</div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

## Payment Confirmation Dialog

Display reputation before a user confirms a transaction:

```html
<div class="payment-dialog">
  <h3>Confirm Payment</h3>
  <p>You are about to pay 5 USDC to:</p>
  <div
    data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    data-shellout-size="compact"
  ></div>
  <button>Confirm</button>
  <button>Cancel</button>
</div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

## Leaderboard / Table Row

Use compact size in dense layouts:

```html
<table>
  <thead>
    <tr>
      <th>Agent</th>
      <th>Reputation</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data Agent</td>
      <td><div data-shellout="WALLET_1" data-shellout-size="compact"></div></td>
      <td>2 USDC</td>
    </tr>
    <tr>
      <td>Image Agent</td>
      <td><div data-shellout="WALLET_2" data-shellout-size="compact"></div></td>
      <td>5 USDC</td>
    </tr>
  </tbody>
</table>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

## Dark Mode Dashboard

```html
<div class="dashboard" style="background: #1a1a2e; padding: 20px;">
  <h2 style="color: white;">Wallet Overview</h2>
  <div
    data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    data-shellout-theme="dark"
  ></div>
</div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

## React Component

```jsx
import { useEffect } from 'react';

function ReputationWidget({ address, size = 'full', theme = 'light' }) {
  useEffect(() => {
    // Re-initialize after render
    if (window.ShellOut) {
      window.ShellOut.init();
    }
  }, [address]);

  return (
    <div
      data-shellout={address}
      data-shellout-size={size}
      data-shellout-theme={theme}
    />
  );
}

// Usage
<ReputationWidget address="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" theme="dark" />
```

Load the script once in your `index.html`:

```html
<script src="https://cdn.shellout.ai/widget.js"></script>
```
