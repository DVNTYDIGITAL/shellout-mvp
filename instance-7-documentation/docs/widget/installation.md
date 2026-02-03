# Widget Installation

Add Shell Out reputation to any website in seconds.

## Basic Installation

Add these two lines wherever you want the widget to appear:

```html
<div data-shellout="YOUR_WALLET_ADDRESS"></div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

The widget will automatically:

1. Fetch reputation data from the Shell Out API
2. Render a visual reputation display
3. Handle loading and error states

## Placement

The widget renders inside the `div` you create. Place it wherever makes sense in your layout:

```html
<div class="agent-profile">
  <h2>Agent Profile</h2>
  <div data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"></div>
</div>
```

## Multiple Widgets

You can have multiple widgets on one page. Include the script tag only once:

```html
<div data-shellout="WALLET_1"></div>
<div data-shellout="WALLET_2"></div>
<div data-shellout="WALLET_3"></div>
<script src="https://cdn.shellout.ai/widget.js"></script>
```

## Dynamic Addresses (SPA Frameworks)

If you're using React, Vue, or another framework where wallet addresses change dynamically:

### React

```jsx
function AgentCard({ walletAddress }) {
  return (
    <div data-shellout={walletAddress}></div>
  );
}
```

Call `ShellOut.init()` after adding new widgets dynamically so the library picks up new elements.

### Vue

```html
<template>
  <div :data-shellout="walletAddress"></div>
</template>
```

### Vanilla JS

```javascript
// Create widget element dynamically
const widget = document.createElement('div');
widget.setAttribute('data-shellout', walletAddress);
document.getElementById('container').appendChild(widget);

// Tell Shell Out to scan for new widgets
ShellOut.init();
```

## Script Loading

The widget script is lightweight and loads asynchronously. You can also load it with `async` or `defer`:

```html
<script src="https://cdn.shellout.ai/widget.js" async></script>
```

## Next Steps

- [Customize the widget](customization.md) - themes, sizes, and options
- [See examples](examples.md) - real-world integration patterns
