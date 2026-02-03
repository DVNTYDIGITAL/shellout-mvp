# Instance 5: Embeddable Widget

## Your Role

You build the JavaScript widget that websites can embed to display Shell Out reputation data. With just two lines of code, any website should be able to show a reputation badge for any wallet address.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period, and compute a reputation score.

**Your Part:** You make this data visible with a simple embed.

---

## What You're Building

A single JavaScript file that:
1. Finds all elements with `data-shellout` attribute
2. Fetches reputation data from the Shell Out API
3. Renders a visual badge/card showing the reputation
4. Handles loading, error, and empty states gracefully

---

## The Integration Experience

A developer adds Shell Out to their site with exactly two lines:

```html
<div data-shellout="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"></div>
<script src="https://cdn.shellout.com/widget.js"></script>
```

That's it. The widget renders automatically.

---

## Technical Requirements

### Language
- Vanilla JavaScript (no framework dependencies)
- Must work in all modern browsers (Chrome, Firefox, Safari, Edge)
- Must work when loaded async or defer

### Hosting
- Host on a CDN (Cloudflare Pages, Vercel, or similar)
- Must be accessible at a predictable URL
- Should be minified for production

### Size
- Target: under 20KB minified
- No external dependencies

---

## Widget Variants

### Full Size (Default)
- Reputation score (large number)
- Key metrics (transactions, counterparties, active duration)
- Warning flags if any
- "Powered by Shell Out" link
- Approximate size: 300px wide, 150px tall

### Compact Size
- Reputation score only
- "Shell Out" branding
- Approximate size: 120px wide, 40px tall

---

## Data Attributes

```html
<!-- Required: wallet address -->
<div data-shellout="WALLET_ADDRESS"></div>

<!-- Optional: size variant -->
<div data-shellout="WALLET_ADDRESS" data-shellout-size="compact"></div>
<div data-shellout="WALLET_ADDRESS" data-shellout-size="full"></div>

<!-- Optional: theme -->
<div data-shellout="WALLET_ADDRESS" data-shellout-theme="light"></div>
<div data-shellout="WALLET_ADDRESS" data-shellout-theme="dark"></div>
```

---

## API Integration

The widget fetches from the Shell Out API:

```
GET https://api.shellout.com/v1/reputation/{address}
```

Response format:
```json
{
  "success": true,
  "data": {
    "address": "...",
    "score": 72,
    "metrics": {
      "total_transactions": 156,
      "unique_counterparties": 43,
      "activity_span_days": 110,
      "transactions_7d": 12
    },
    "flags": []
  }
}
```

---

## Visual States

### Loaded State (Score 70-100, Good)
- Score displayed in green
- All metrics visible
- Clean, trustworthy appearance

### Loaded State (Score 40-69, Medium)
- Score displayed in orange/amber
- All metrics visible

### Loaded State (Score 0-39, Low)
- Score displayed in red
- All metrics visible

### Loading State
- Spinner or pulsing animation
- "Loading..." text

### Error State
- Warning icon
- "Could not load reputation"
- Retry button

### No History State
- Dash or "N/A" instead of score
- "No transaction history"
- Still shows Shell Out branding

---

## Color Scheme

### Light Theme (Default)
- Background: #FFFFFF
- Border: #E5E7EB
- Text primary: #111827
- Text secondary: #6B7280
- Score good (70-100): #059669 (green)
- Score medium (40-69): #D97706 (amber)
- Score low (0-39): #DC2626 (red)
- Brand color: #3B82F6 (blue)

### Dark Theme
- Background: #1F2937
- Border: #374151
- Text primary: #F9FAFB
- Text secondary: #9CA3AF
- Score colors same as light
- Brand color: #60A5FA

---

## Implementation Skeleton

```javascript
(function() {
  'use strict';
  
  const API_BASE = 'https://api.shellout.com';
  
  const STYLES = `
    .shellout-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 8px;
      padding: 16px;
      box-sizing: border-box;
    }
    .shellout-light {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      color: #111827;
    }
    .shellout-dark {
      background: #1F2937;
      border: 1px solid #374151;
      color: #F9FAFB;
    }
    .shellout-full {
      width: 300px;
    }
    .shellout-compact {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
    }
    .shellout-score {
      font-size: 36px;
      font-weight: bold;
    }
    .shellout-score-good { color: #059669; }
    .shellout-score-medium { color: #D97706; }
    .shellout-score-low { color: #DC2626; }
    .shellout-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
      color: #6B7280;
    }
    .shellout-error {
      text-align: center;
      color: #DC2626;
    }
    .shellout-footer {
      margin-top: 12px;
      font-size: 12px;
      opacity: 0.7;
    }
    .shellout-footer a {
      color: #3B82F6;
      text-decoration: none;
    }
  `;
  
  function injectStyles() {
    if (document.getElementById('shellout-styles')) return;
    const style = document.createElement('style');
    style.id = 'shellout-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }
  
  async function fetchReputation(address) {
    const res = await fetch(`${API_BASE}/v1/reputation/${address}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed');
    return data.data;
  }
  
  function getScoreClass(score) {
    if (score >= 70) return 'shellout-score-good';
    if (score >= 40) return 'shellout-score-medium';
    return 'shellout-score-low';
  }
  
  function renderFull(data, theme) {
    const scoreClass = data.score > 0 ? getScoreClass(data.score) : '';
    const scoreDisplay = data.score > 0 ? data.score : '--';
    
    return `
      <div class="shellout-widget shellout-full shellout-${theme}">
        <div style="text-align: center;">
          <div class="shellout-score ${scoreClass}">${scoreDisplay}</div>
          <div style="font-size: 12px; color: #6B7280;">REPUTATION SCORE</div>
        </div>
        ${data.metrics.total_transactions > 0 ? `
          <div style="margin-top: 12px; font-size: 14px;">
            <div>📊 ${data.metrics.total_transactions} transactions</div>
            <div>👥 ${data.metrics.unique_counterparties} counterparties</div>
            <div>📅 Active ${data.metrics.activity_span_days} days</div>
          </div>
        ` : `
          <div style="margin-top: 12px; text-align: center; color: #6B7280;">
            No transaction history
          </div>
        `}
        <div class="shellout-footer">
          <a href="https://shellout.com" target="_blank">🔗 Powered by Shell Out</a>
        </div>
      </div>
    `;
  }
  
  function renderCompact(data, theme) {
    const scoreClass = data.score > 0 ? getScoreClass(data.score) : '';
    const scoreDisplay = data.score > 0 ? data.score : '--';
    
    return `
      <div class="shellout-widget shellout-compact shellout-${theme}">
        <span class="${scoreClass}" style="font-weight: bold;">${scoreDisplay}/100</span>
        <span style="opacity: 0.7;">·</span>
        <a href="https://shellout.com" target="_blank" style="color: #3B82F6; text-decoration: none; font-size: 12px;">Shell Out</a>
      </div>
    `;
  }
  
  function renderLoading(theme) {
    return `
      <div class="shellout-widget shellout-loading shellout-${theme}">
        Loading...
      </div>
    `;
  }
  
  function renderError(theme, retry) {
    return `
      <div class="shellout-widget shellout-error shellout-${theme}" style="padding: 16px;">
        <div>⚠️ Could not load reputation</div>
        <button onclick="(${retry})()" style="margin-top: 8px; padding: 4px 12px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
  
  async function initWidget(el) {
    const address = el.getAttribute('data-shellout');
    if (!address) return;
    
    const size = el.getAttribute('data-shellout-size') || 'full';
    const theme = el.getAttribute('data-shellout-theme') || 'light';
    
    el.innerHTML = renderLoading(theme);
    
    try {
      const data = await fetchReputation(address);
      el.innerHTML = size === 'compact' 
        ? renderCompact(data, theme)
        : renderFull(data, theme);
    } catch (err) {
      const retryFn = `function(){document.querySelector('[data-shellout="${address}"]').dispatchEvent(new CustomEvent('shellout-retry'))}`;
      el.innerHTML = renderError(theme, retryFn);
      el.addEventListener('shellout-retry', () => initWidget(el), { once: true });
    }
  }
  
  function init() {
    injectStyles();
    document.querySelectorAll('[data-shellout]').forEach(initWidget);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.ShellOut = { init, initWidget };
})();
```

---

## Testing

### Test 1: Basic Render
```html
<div data-shellout="VALID_WALLET_ADDRESS"></div>
<script src="widget.js"></script>
```
Expected: Widget renders with real data

### Test 2: Multiple Widgets
Multiple widgets on same page should work independently

### Test 3: Size Variants
Both `full` and `compact` sizes should render correctly

### Test 4: Theme Variants
Both `light` and `dark` themes should render correctly

### Test 5: External Domain
Deploy and test on a completely different domain
Expected: Works without CORS errors

### Test 6: Loading State
Throttle network, verify loading state appears

### Test 7: Error State
Use bad API URL, verify error state with retry button

### Test 8: No History
Use wallet with no transactions, verify appropriate display

### Test 9: Async Loading
```html
<script src="widget.js" async></script>
```
Expected: Still works

---

## Deliverables

1. **widget.js** - Main JavaScript file
2. **widget.min.js** - Minified version
3. **Hosted URL** - Widget accessible at public URL
4. **Test page** - HTML demonstrating all variants
5. **README** - Integration instructions

---

## Success Criteria

- [ ] Two lines of code to integrate
- [ ] Fetches real data from API
- [ ] Displays score and metrics correctly
- [ ] Both themes work
- [ ] Both sizes work
- [ ] Loading state visible
- [ ] Error state with retry works
- [ ] No history state displays correctly
- [ ] Works on external domains
- [ ] Under 20KB minified
- [ ] Multiple widgets work independently
- [ ] No global namespace pollution except `ShellOut`

---

## Failure Criteria

- Requires more than two lines to integrate
- Crashes on invalid addresses
- Doesn't work on external domains
- Breaks host page styling
- No loading state shown
- Doesn't recover from errors

---

## Dependencies

**What you need:**
- Instance 4 (API): API endpoint URL

**What others need from you:**
- Instance 7 (Documentation): Widget integration instructions

---

## Final Widget URL

Provide this to Instance 7:
```
https://cdn.shellout.com/widget.js
```
