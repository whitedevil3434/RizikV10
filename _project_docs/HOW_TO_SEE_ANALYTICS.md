# How to See Partner Analytics Dashboard

## Steps to View the Analytics:

### 1. Hot Restart the App (IMPORTANT!)
Since we added a new package (`fl_chart`), you need to **hot restart** (not just hot reload):

**Option A - VS Code/Android Studio:**
- Press `Ctrl+Shift+F5` (Windows/Linux) or `Cmd+Shift+F5` (Mac)
- Or click the "Hot Restart" button (🔄 with red square)

**Option B - Terminal:**
```bash
# Stop the current app and restart
flutter run
```

### 2. Navigate to Partner Role
1. Open the app
2. Switch to **Partner** role using the role slider at the bottom
3. You should see the Partner Home screen

### 3. Access Analytics Dashboard
On the Partner Home screen, you'll see **3 cards** in the strategic deck at the top:

**Card 1: Growth Card (Analytics)** 📊
- Shows: "আজকের আয়: ৳৮০০০ (+১৫%)"
- Has text: "Tap for detailed analytics"
- Has an arrow icon (→) in the top right
- **TAP THIS CARD** to open the Analytics Dashboard

**Card 2: Inventory Card** 📦
- Shows inventory ticker

**Card 3: Triage Hub Card** 🎯
- Shows new orders and bids

### 4. Explore Analytics Dashboard
Once you tap the Growth Card, you'll see:

**3 Tabs:**
1. **Overview** - Earnings, orders, top items, charts
2. **Orders** - Order breakdown, time analysis
3. **Performance** - Ratings, reviews, metrics

**Features:**
- Period selector (This Week/Month/Year) in top right
- Beautiful charts and graphs
- Key metrics with trend indicators
- Scrollable content

---

## Troubleshooting

### If you don't see the analytics:

1. **Make sure you ran `flutter pub get`:**
   ```bash
   flutter pub get
   ```

2. **Do a full hot restart (not hot reload):**
   ```bash
   # Stop the app completely
   # Then restart:
   flutter run
   ```

3. **Check you're on Partner role:**
   - Look at the bottom of the screen
   - The role slider should show "Partner" selected

4. **Look for the Growth Card:**
   - It's the FIRST card in the horizontal scrolling deck
   - Has green text showing earnings
   - Has "Tap for detailed analytics" subtitle

5. **If still not working, clean and rebuild:**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

---

## Visual Guide

```
Partner Home Screen
├── Top: Strategic Deck (swipeable cards)
│   ├── [1] Growth Card 📊 ← TAP HERE!
│   │   └── "আজকের আয়: ৳৮০০০ (+১৫%)"
│   │   └── "Tap for detailed analytics"
│   │   └── Arrow icon →
│   ├── [2] Inventory Card 📦
│   └── [3] Triage Hub Card 🎯
├── Middle: Order Opportunities
└── Bottom: Feed Cards
```

---

## What You'll See in Analytics

### Overview Tab:
- 4 metric cards (Earnings, Orders, Avg Order, Rating)
- Line chart showing earnings trend
- Top selling items list

### Orders Tab:
- Pie chart of order status
- Bar chart of orders by time
- Order statistics

### Performance Tab:
- Rating breakdown (5-star to 1-star)
- Recent reviews
- Performance metrics (acceptance rate, response time, etc.)

---

**Note:** The analytics screen is fully functional with mock data. In production, you would connect it to real data from your backend.
