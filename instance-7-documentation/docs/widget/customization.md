# Widget Customization

Customize the widget appearance to match your site.

## Size Options

### Full Size (Default)

Shows the score, key metrics, and flags. Use when you have space to show detail.

```html
<div data-shellout="ADDRESS" data-shellout-size="full"></div>
```

### Compact Size

Minimal display showing just the score badge. Use in tight layouts like table rows or lists.

```html
<div data-shellout="ADDRESS" data-shellout-size="compact"></div>
```

## Theme Options

### Light Theme (Default)

```html
<div data-shellout="ADDRESS" data-shellout-theme="light"></div>
```

### Dark Theme

For dark backgrounds:

```html
<div data-shellout="ADDRESS" data-shellout-theme="dark"></div>
```

## Combining Options

All data attributes can be combined:

```html
<div
  data-shellout="ADDRESS"
  data-shellout-size="compact"
  data-shellout-theme="dark"
></div>
```

## Data Attributes Reference

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-shellout` | wallet address | (required) | The Solana wallet address to display |
| `data-shellout-size` | `full`, `compact` | `full` | Widget size variant |
| `data-shellout-theme` | `light`, `dark` | `light` | Color theme |

## Manual Initialization

If you add widgets to the page after initial load (e.g., in a single-page app), tell Shell Out to scan for new elements:

```javascript
// Scan entire document for new widgets
ShellOut.init();
```

To initialize a specific element:

```javascript
const element = document.getElementById('my-widget');
ShellOut.initWidget(element);
```

## Styling

The widget respects the width of its parent container. To control widget width, set it on the parent:

```html
<div style="max-width: 400px;">
  <div data-shellout="ADDRESS"></div>
</div>
```
