# 🧪 Bazar Tab Role Filtering - Testing Guide

## Quick Test Steps

### 1️⃣ Test Consumer View (🙋‍♂️)

**Steps:**
1. Open app
2. Tap role slider → Select **Consumer**
3. Navigate to **Bazar Tab** (shopping bag icon)
4. Scroll through feed

**Expected Results:**
```
✅ Header shows: "খাবার ও পরিষেবা আবিষ্কার করুন"
✅ See food items (Rizik Now)
✅ See shops (Rizik Bazaar)
✅ See bid opportunities
✅ See services (plumber, cleaning)
✅ See reviews
❌ NO bid requests for partners
❌ NO delivery missions
❌ NO inventory alerts
```

---

### 2️⃣ Test Partner View (🧑‍🍳)

**Steps:**
1. Tap role slider → Select **Partner**
2. Navigate to **Bazar Tab**
3. Scroll through feed

**Expected Results:**
```
✅ Header shows: "নতুন ব্যবসার সুযোগ"
✅ See bid requests (with bidding threads)
✅ See unclaimed orders
✅ See missed orders (red alerts)
✅ See inventory alerts (low stock)
✅ See customer reviews
✅ See bulk/supply offers
❌ NO consumer food items
❌ NO delivery missions
```

---

### 3️⃣ Test Mover View (🚴)

**Steps:**
1. Tap role slider → Select **Rider**
2. Navigate to **Bazar Tab**
3. Scroll through feed

**Expected Results:**
```
✅ Header shows: "ডেলিভারি মিশন খুঁজুন"
✅ See delivery missions
✅ See mission chains (multi-drop)
✅ See peak hour bonuses
✅ See bike repair discounts
✅ See fuel discounts
❌ NO food items
❌ NO bid requests
❌ NO shops
```

---

## 🎯 Visual Indicators

### Role Header Format:
```
┌─────────────────────────────────────┐
│ [EMOJI]  [TITLE]              [COUNT]│
│          [SUBTITLE]                  │
└─────────────────────────────────────┘
```

### Examples:

**Consumer:**
```
🙋‍♂️  খাবার ও পরিষেবা আবিষ্কার করুন    [12]
    Rizik Now, Bids, Services & More
```

**Partner:**
```
🧑‍🍳  নতুন ব্যবসার সুযোগ                [14]
    Bids, Orders, Bulk Deals & Inventory
```

**Mover:**
```
🚴  ডেলিভারি মিশন খুঁজুন               [10]
    Missions, Chains & Service Discounts
```

---

## 🔍 Content Type Verification

### Consumer Should See:
- ✅ `FoodCardData` - Food items with prices
- ✅ `ShopCardData` - Shops and C2C items
- ✅ `EventCardData` - Bid opportunities
- ✅ `RewardCardData` - Services
- ✅ `ReviewCardData` - Reviews

### Partner Should See:
- ✅ `EventCardData` (Bid) - Bid requests with threads
- ✅ `EventCardData` (Unclaimed) - Unclaimed orders
- ✅ `EventCardData` (Missed) - Missed orders
- ✅ `AISuggestCardData` - Inventory alerts
- ✅ `ReviewCardData` - Customer reviews
- ✅ `RewardCardData` - Bulk offers

### Mover Should See:
- ✅ `MissionCardData` - Delivery missions
- ✅ `EventCardData` (Mission Chain) - Multi-drop chains
- ✅ `EventCardData` (Bonus) - Peak hour bonuses
- ✅ `RewardCardData` - Mover services

---

## 🎨 Color Verification

### Rizik Green (#00A150):
- Role indicator header background
- Action buttons (বিড করুন, অর্ডার করুন)
- Count badge

### Amber (#FFA000):
- ⚠️ Inventory low stock alerts
- ⚠️ Expiring items
- ⚠️ Missed orders

---

## 🐛 Common Issues & Solutions

### Issue 1: Content Not Changing
**Symptom:** Same content shows for all roles
**Solution:** 
- Check if `_syncRoleWithFeedProvider()` is being called
- Verify `Consumer<RoleProvider>` is wrapping build method
- Check console for errors

### Issue 2: Empty Feed
**Symptom:** No items showing
**Solution:**
- Check if `bazarFeedItems` is returning empty list
- Verify filtering logic in `_getXxxBazarItems()` methods
- Check if mock data exists in `FeedProvider`

### Issue 3: Wrong Content Type
**Symptom:** Seeing consumer items in partner view
**Solution:**
- Verify filtering conditions in `_getPartnerBazarItems()`
- Check `EventCardData.eventType` values
- Ensure proper type checking with `is` operator

---

## 📊 Expected Item Counts

### Consumer View:
- ~12-15 items (food, shops, bids, services)

### Partner View:
- ~14-16 items (bids, orders, alerts, reviews)

### Mover View:
- ~10-12 items (missions, bonuses, services)

---

## ✅ Checklist

Before marking as complete, verify:

- [ ] Consumer view shows marketplace content
- [ ] Partner view shows business opportunities
- [ ] Mover view shows delivery missions
- [ ] Role header updates correctly
- [ ] Item count is accurate
- [ ] No management cards in any view
- [ ] Colors are correct (Green for actions, Amber for alerts)
- [ ] Role switching works smoothly
- [ ] No console errors
- [ ] Performance is smooth (no lag)

---

## 🚀 Quick Demo Script

**For showing to stakeholders:**

1. **Start:** "আমি এখন Consumer হিসেবে দেখছি..."
2. **Show:** Scroll through food items, shops, services
3. **Switch:** "এখন Partner role-এ switch করি..."
4. **Show:** Point out bid requests, inventory alerts
5. **Switch:** "এবং Rider হিসেবে..."
6. **Show:** Delivery missions, bonuses
7. **Highlight:** "লক্ষ্য করুন, প্রতিটি role-এর জন্য আলাদা content!"

---

## 📝 Notes

- All filtering happens in `FeedProvider`
- UI automatically updates on role change
- No manual refresh needed
- Mock data included for testing
- Ready for database integration

**Status:** ✅ Ready to Test
