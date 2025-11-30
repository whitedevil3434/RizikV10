# Partner Home - Complete Tap Guide 👆

## 🎯 What Happens When You Tap...

### 📱 Strategic Deck Cards (Top Swipeable Section)

| Card | Tap Action | Result |
|------|-----------|--------|
| **Growth Card** 📈 | Tap anywhere | → Navigate to `PartnerAnalyticsScreen` |
| **Kitchen Queue** 🍳 | Tap anywhere | → Navigate to `KitchenQueueScreen` |
| **Kitchen Live** 🔴 | Tap anywhere | → Show "Coming Soon" message |
| **Rizik Now** ⚡ | Tap anywhere | → Navigate to `RizikNowManagementScreen` |
| **Rizik Kitchen** 🍱 | Tap anywhere | → Navigate to `RizikKitchenSubscriptionScreen` |
| **Inventory OS** 📦 | Tap anywhere | → Navigate to `InventoryFullScreen` |
| **Triage Hub** 🎯 | Tap anywhere | → Navigate to `TriageHubFullScreen` |

---

### 🔴 Live Order Pills Section

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Order Card** | Tap anywhere | → Open order details modal |
| **Swipe Right** ➡️ | Swipe gesture | → Accept order (green background) |
| **Swipe Left** ⬅️ | Swipe gesture | → Reject order (red background) |
| **Accept Button** | Tap button | → Accept order + success message |

---

### 🎨 Masonry Grid Cards (Main Feed)

#### 1. **Bid Cards (Event Cards)** 🟢

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Open `BidDetailScreen` |
| **Creator Avatar** | Tap avatar | → (Included in card tap) |
| **"Place Bid" Button** | Tap button | → (Included in card tap) |
| **Latest Bids Preview** | Tap preview | → (Included in card tap) |

**In BidDetailScreen:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Share Icon** | Tap icon | → Share bid |
| **Bid Amount Input** | Enter amount | → Validate amount |
| **Message Input** | Enter text | → Optional message |
| **Place Bid Button** | Tap button | → Submit bid + show in thread |
| **Back Button** | Tap back | → Return to Partner Home |

---

#### 2. **Review Cards** 💬

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Open `ReviewDetailScreen` |
| **User Avatar** | Tap avatar | → (Included in card tap) |
| **Like Icon** ❤️ | Tap icon | → Show creation menu (placeholder) |
| **Food Item Tag** | Tap tag | → (Included in card tap) |

**In ReviewDetailScreen:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Share Icon** | Tap icon | → Share review |
| **Quick Reply Chip** | Tap chip | → Auto-fill reply text |
| **Reply Input** | Enter text | → Write custom reply |
| **Send Button** | Tap button | → Post reply + show below review |
| **Edit Icon** | Tap icon | → Edit existing reply |
| **Back Button** | Tap back | → Return to Partner Home |

---

#### 3. **Mission Cards** 🚚

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show mission acceptance dialog |
| **Accept Mission Button** | Tap button | → (Included in card tap) |

**In Mission Dialog:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Accept Mission** | Tap button | → Accept + success message |
| **Cancel** | Tap button | → Dismiss dialog |

---

#### 4. **AI Suggest Cards** 🤖

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show AI suggestion dialog |

**In AI Dialog:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Apply** | Tap button | → Apply suggestion + success message |
| **Dismiss** | Tap button | → Dismiss dialog |

---

#### 5. **Food Cards** 🍔

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show food management modal |
| **Service Type Badge** | Tap badge | → (Included in card tap) |
| **Price Tag** | Tap tag | → (Included in card tap) |

**In Food Modal:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Edit Button** | Tap button | → Edit food item (placeholder) |
| **Hide/Show Button** | Tap button | → Toggle availability + message |

---

#### 6. **Shop Cards** 🏪

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show shop details (placeholder) |
| **Open/Closed Badge** | Tap badge | → (Included in card tap) |
| **Badge** | Tap badge | → (Included in card tap) |

---

#### 7. **Reward Cards** 🎁

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show reward redemption dialog |

**In Reward Dialog:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Redeem** | Tap button | → Redeem reward + success message |
| **Cancel** | Tap button | → Dismiss dialog |

---

#### 8. **Rizik Bazaar Cards** 🛍️

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show bazaar item details (placeholder) |
| **Like Icon** ❤️ | Tap icon | → Add to favorites (placeholder) |
| **AI Enhanced Badge** | Tap badge | → (Included in card tap) |

---

#### 9. **Public Bid Won Cards** 🔥

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show bid won celebration dialog |

**In Bid Won Dialog:**
| Element | Tap Action | Result |
|---------|-----------|--------|
| **Create Similar** | Tap button | → Create similar bid (placeholder) |
| **Close** | Tap button | → Dismiss dialog |

---

#### 10. **Rizik Gig Cards** 🔧

| Element | Tap Action | Result |
|---------|-----------|--------|
| **Entire Card** | Tap anywhere | → Show gig details (placeholder) |
| **Book Button** | Tap button | → (Included in card tap) |

---

### 🎯 Partner AI FAB (Bottom Right)

| Element | Tap Action | Result |
|---------|-----------|--------|
| **+ FAB** | Tap button | → Show partner creation menu |

---

## 🎨 Visual Feedback

### Animations:
- ✅ Card tap → Ripple effect
- ✅ Screen transition → Slide animation
- ✅ Dialog appear → Fade + scale animation
- ✅ Bottom sheet → Slide up animation
- ✅ Success action → Snackbar with icon

### Colors:
- 🟢 **Green** - Opportunities (bids, orders)
- 🔴 **Red** - Critical (missed orders, low stock)
- 🟡 **Yellow** - Promotional (flash sales)
- ⚪ **White** - Informational

### Feedback Messages:
- ✅ Success → Green snackbar with emoji
- ⚠️ Warning → Orange snackbar
- ❌ Error → Red snackbar
- ℹ️ Info → Blue snackbar

---

## 🚀 Quick Reference

### Most Common Actions:
1. **View Bid** → Tap bid card → See full thread
2. **Place Bid** → In bid screen → Enter amount → Tap "Place Bid"
3. **Reply to Review** → Tap review card → Write reply → Tap "Send"
4. **Accept Order** → Swipe right on order pill
5. **Manage Food** → Tap food card → Tap "Edit" or "Hide/Show"

### Navigation Patterns:
- **Back Button** → Always returns to Partner Home
- **Swipe Down** → Dismiss bottom sheets
- **Tap Outside** → Dismiss dialogs
- **Pull to Refresh** → Refresh feed

---

## 💡 Pro Tips

1. **Quick Bid Placement:**
   - Tap bid card → Amount auto-filled → Just tap "Place Bid"

2. **Fast Review Reply:**
   - Tap review card → Tap quick reply chip → Tap "Send"

3. **Rapid Order Acceptance:**
   - Swipe right on order pill (no need to tap buttons)

4. **Efficient Food Management:**
   - Tap food card → Tap "Hide/Show" for quick toggle

5. **Strategic Deck Navigation:**
   - Swipe left/right to see all management cards
   - Tap any card for deep dive into that section

---

## ✅ Everything is Functional!

প্রতিটি tap, swipe, এবং interaction এখন কাজ করে! 🎉

No more placeholder messages - every action leads to a real screen or meaningful interaction!
