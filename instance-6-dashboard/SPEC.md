# Instance 6: Public Dashboard

## Your Role

You build the public website where anyone can explore Shell Out data. Users visit the site, enter a wallet address, and see reputation information. This is the "face" of Shell Out.

---

## Context: What Is Shell Out?

Shell Out is a reputation system for the AI agent economy.

**The Problem:** AI agents now transact with each other using cryptocurrency. There's no way to know if an agent/wallet is trustworthy before transacting.

**The Solution:** Shell Out tracks transaction history. When someone queries us with a wallet address, we tell them how many transactions that wallet has done, with how many counterparties, over what time period, and compute a reputation score.

**Your Part:** You build the website where humans can look up any wallet.

---

## What You're Building

A public website with:
1. **Homepage** - Search box, aggregate statistics, explanation of Shell Out
2. **Results page** - Detailed reputation view for a specific wallet
3. **About/FAQ** - What Shell Out is and how it works

---

## Technical Requirements

### Framework
- Next.js (React)
- TypeScript

### Hosting
- Vercel (integrates naturally with Next.js)

### Domain
- Deploy to shellout.com or similar

### Design
- Clean, modern, professional
- Mobile responsive
- Fast loading (<3 seconds)

---

## Pages

### Homepage (/)

**Elements:**
1. **Header** - Logo, navigation
2. **Hero section** - Headline, search box
3. **How it works** - 3-step explanation
4. **Aggregate stats** - Total transactions indexed, wallets seen, etc.
5. **Call to action** - Integration links
6. **Footer** - Links, copyright

**Search behavior:**
- User enters wallet address
- Pressing enter or clicking search navigates to /wallet/{address}

### Results Page (/wallet/[address])

**Elements:**
1. **Header** - Same as homepage
2. **Wallet summary** - Address (truncated with copy button), reputation score
3. **Metrics breakdown** - All metrics in readable format
4. **Flags section** - Any warnings, explained
5. **Score explanation** - How the score was calculated
6. **Integration CTA** - "Add this to your site" with widget code
7. **Footer**

**Dynamic data:**
- Fetches from API on page load
- Shows loading state
- Shows error state if API fails
- Shows "no history" state if wallet has no transactions

### About Page (/about)

**Elements:**
1. **What is Shell Out** - Explanation
2. **How it works** - Technical overview
3. **FAQ** - Common questions
4. **Integration** - Link to docs

---

## Design Specifications

### Colors

**Primary:** #3B82F6 (Blue)
**Background:** #FFFFFF (White)
**Surface:** #F9FAFB (Light gray)
**Text primary:** #111827 (Near black)
**Text secondary:** #6B7280 (Gray)
**Success/Good score:** #059669 (Green)
**Warning/Medium score:** #D97706 (Amber)
**Error/Low score:** #DC2626 (Red)

### Typography

**Font family:** Inter (Google Fonts) or system fonts
**Headings:** Bold, larger sizes
**Body:** Regular, 16px base

### Layout

**Max width:** 1200px
**Padding:** 16-32px depending on section
**Mobile breakpoint:** 768px

---

## Homepage Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  🛡️ Shell Out                              Docs  About  GitHub    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                    Trust Before You Transact                       │
│                                                                    │
│           Reputation data for the AI agent economy                 │
│                                                                    │
│    ┌────────────────────────────────────────────────────┐         │
│    │  Enter wallet address...                    🔍     │         │
│    └────────────────────────────────────────────────────┘         │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    How It Works                                                    │
│                                                                    │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│    │    1     │    │    2     │    │    3     │                   │
│    │  Index   │ →  │ Compute  │ →  │  Query   │                   │
│    │  Txns    │    │  Score   │    │  Anytime │                   │
│    └──────────┘    └──────────┘    └──────────┘                   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    Shell Out by the Numbers                                        │
│                                                                    │
│    1.2M              45K               $9.8M                       │
│    Transactions      Wallets           Volume Tracked              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    Ready to integrate?                                             │
│    [View Documentation]  [Get API Access]                          │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  © 2026 Shell Out  ·  Docs  ·  GitHub  ·  Twitter                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## Results Page Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  🛡️ Shell Out                              Docs  About  GitHub    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    ← Back to search                                                │
│                                                                    │
│    ┌────────────────────────────────────────────────────────────┐ │
│    │                                                            │ │
│    │  7xKXtg...gAsU  📋                                        │ │
│    │                                                            │ │
│    │            ┌─────────────────┐                            │ │
│    │            │       72        │                            │ │
│    │            │    ─────────    │                            │ │
│    │            │  REPUTATION     │                            │ │
│    │            └─────────────────┘                            │ │
│    │                                                            │ │
│    └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│    Metrics                                                         │
│    ┌────────────────────────────────────────────────────────────┐ │
│    │  Total Transactions    156                                 │ │
│    │  As Sender             89                                  │ │
│    │  As Receiver           67                                  │ │
│    │  Total Volume          $8,420.50                          │ │
│    │  Unique Counterparties 43                                  │ │
│    │  First Seen            Oct 15, 2025                       │ │
│    │  Last Seen             Feb 2, 2026                        │ │
│    │  Active Duration       110 days                           │ │
│    │  Recent (7d)           12 transactions                    │ │
│    └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│    Add to Your Site                                                │
│    ┌────────────────────────────────────────────────────────────┐ │
│    │  <div data-shellout="7xKXtg..."></div>                    │ │
│    │  <script src="https://cdn.shellout.com/widget.js">        │ │
│    │  </script>                                          📋    │ │
│    └────────────────────────────────────────────────────────────┘ │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  © 2026 Shell Out  ·  Docs  ·  GitHub  ·  Twitter                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## API Integration

### Fetch Reputation

```typescript
async function getReputation(address: string) {
  const res = await fetch(`https://api.shellout.com/v1/reputation/${address}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message);
  return data.data;
}
```

### Fetch Stats

```typescript
async function getStats() {
  const res = await fetch('https://api.shellout.com/v1/stats');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message);
  return data.data;
}
```

---

## Component Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout with header/footer
│   ├── page.tsx          # Homepage
│   ├── about/
│   │   └── page.tsx      # About page
│   └── wallet/
│       └── [address]/
│           └── page.tsx  # Results page
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchBox.tsx
│   ├── ScoreDisplay.tsx
│   ├── MetricsTable.tsx
│   ├── StatsDisplay.tsx
│   └── CodeBlock.tsx
└── lib/
    └── api.ts            # API fetch functions
```

---

## Key Features

### Search Box

- Large, prominent input
- Placeholder: "Enter Solana wallet address..."
- Submit on Enter or button click
- Basic validation (length, character set)
- Navigate to /wallet/{address} on submit

### Score Display

- Large circular or badge display
- Color-coded by score range
- Score number prominently displayed
- "out of 100" or "/100" label

### Copy Buttons

- Copy wallet address to clipboard
- Copy widget code to clipboard
- Show "Copied!" confirmation

### Loading States

- Skeleton loaders for content
- Loading spinner for search

### Error States

- Clear error messages
- Retry option
- Don't show technical details

### No History State

- Friendly message explaining no transactions found
- Not an error, just informational

---

## SEO & Meta

### Homepage

```html
<title>Shell Out - Reputation for the Agent Economy</title>
<meta name="description" content="Check wallet reputation before you transact. Shell Out provides transaction history and trust scores for the AI agent economy." />
```

### Results Page

```html
<title>Wallet Reputation - Shell Out</title>
<meta name="description" content="View reputation data for Solana wallet {address}. See transaction history, counterparties, and trust score." />
```

---

## Testing

### Test 1: Homepage Loads
- Visit homepage
- Verify all sections render
- Verify stats load from API

### Test 2: Search Works
- Enter valid address
- Press Enter
- Verify navigation to results page

### Test 3: Results Display
- Visit /wallet/{valid_address}
- Verify data loads and displays

### Test 4: No History
- Visit /wallet/{address_with_no_history}
- Verify appropriate "no history" message

### Test 5: Invalid Address
- Visit /wallet/invalid
- Verify error handling

### Test 6: Mobile Responsive
- Test on mobile viewport
- Verify all elements readable and usable

### Test 7: Copy Functions
- Click copy buttons
- Verify clipboard contains correct text

### Test 8: Performance
- Lighthouse audit
- Target: 90+ performance score

---

## Deliverables

1. **Source code** in git repository
2. **Deployed site** at public URL
3. **README** with:
   - Local development instructions
   - Deployment instructions
   - Environment variables needed

---

## Success Criteria

- [ ] Homepage loads and displays correctly
- [ ] Search navigates to results page
- [ ] Results page shows real data from API
- [ ] All metrics display correctly
- [ ] Score color-coding works
- [ ] Copy buttons work
- [ ] Loading states display
- [ ] Error states display
- [ ] No history state displays
- [ ] Mobile responsive
- [ ] Loads in under 3 seconds
- [ ] Widget code snippet is correct

---

## Failure Criteria

- Pages crash or show blank
- API data doesn't display
- Search doesn't work
- Mobile layout is broken
- Copy buttons don't work
- No loading/error states

---

## Dependencies

**What you need:**
- Instance 4 (API): API endpoint URL
- Instance 5 (Widget): Widget URL for code snippet

**What others need from you:**
- Nothing directly, but this is the public face of Shell Out

---

## Environment Variables

```
NEXT_PUBLIC_API_URL=https://api.shellout.com
NEXT_PUBLIC_WIDGET_URL=https://cdn.shellout.com/widget.js
```

---

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy

### Custom Domain

1. Add custom domain in Vercel
2. Update DNS records
3. Enable HTTPS

---

## Final URL

Once deployed, the site should be accessible at:
```
https://shellout.com
```
