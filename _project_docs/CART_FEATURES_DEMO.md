# 🛒 Cart System - Feature Demo Guide

## How to Test the Cart System

### 1. **Add Items to Cart**

**Steps:**
1. Open the app (Consumer role)
2. Scroll through the food feed
3. Tap any food item card
4. Product Details Screen opens
5. Use +/- buttons to select quantity
6. Tap "Add to Cart - ৳XXX" button
7. Green snackbar appears: "Added to cart" with "VIEW CART" action

**What to Notice:**
- Button shows total price (price × quantity)
- Quantity can be adjusted before adding
- Success feedback is immediate
- Cart badge in header updates instantly

---

### 2. **View Cart**

**Steps:**
1. Tap the cart icon in the header (top right)
2. Cart Review Screen opens

**What to See:**
- All cart items with images
- Item name, restaurant name, price
- Quantity controls for each item
- Bill summary at bottom:
  - Subtotal
  - Delivery Fee: ৳50
  - Tax: 5%
  - Total
- "Add More Items" button
- "Proceed to Payment" button

---

### 3. **Modify Quantities**

**Steps:**
1. In Cart Review Screen
2. Use +/- buttons on any item
3. Watch the totals update in real-time

**Limits:**
- Minimum: 1 item
- Maximum: 10 items
- Minus button disabled at 1
- Plus button disabled at 10

---

### 4. **Delete Items**

**Method 1: Swipe to Delete**
1. Swipe any cart item from right to left
2. Red delete background appears
3. Item is removed
4. Red snackbar appears: "Item removed from cart"
5. Tap "UNDO" to restore the item

**Method 2: Clear All**
1. Tap trash icon in app bar
2. Confirmation dialog appears
3. Tap "Clear" to remove all items
4. Tap "Cancel" to keep items

---

### 5. **Empty Cart State**

**Steps:**
1. Remove all items from cart
2. Empty state appears with:
   - Shopping cart icon
   - "Your cart is empty" message
   - "Add items to get started" subtitle
   - "Browse Food" button

**Action:**
- Tap "Browse Food" to return to feed

---

### 6. **Cart Badge**

**What to Notice:**
- Badge shows item count (not quantity)
- Updates in real-time
- Shows "9+" for 10 or more items
- Disappears when cart is empty
- Red circular badge on cart icon

---

### 7. **Cart Persistence**

**Steps:**
1. Add items to cart
2. Close the app completely
3. Reopen the app
4. Cart items are still there!

**Technical:**
- Cart saved to SharedPreferences
- Loads automatically on app start
- No data loss

---

### 8. **Continue Shopping**

**Steps:**
1. In Cart Review Screen
2. Tap "Add More Items" button
3. Returns to previous screen (feed)
4. Add more items
5. Cart badge updates

---

### 9. **Proceed to Payment**

**Steps:**
1. In Cart Review Screen
2. Review your items and total
3. Tap "Proceed to Payment - ৳XXX" button
4. Currently shows: "Payment screen coming soon!"

**Next Implementation:**
- Payment method selection
- Order confirmation
- Order tracking

---

## 🎨 UI/UX Highlights

### Cart Review Screen
- **Clean Design**: White cards with subtle shadows
- **Visual Hierarchy**: Clear separation of sections
- **Color Coding**: Green for totals, red for delete
- **Smooth Animations**: Swipe gestures feel natural
- **Responsive**: Works on all screen sizes

### Product Details Screen
- **Dynamic Button**: Shows total price with quantity
- **Instant Feedback**: Snackbar confirmation
- **Quick Access**: "VIEW CART" action in snackbar

### Global Header
- **Subtle Badge**: Red circle with white text
- **Always Visible**: Cart accessible from anywhere
- **Live Updates**: Badge changes instantly

---

## 🔍 Edge Cases Handled

✅ **Empty Cart**: Helpful empty state  
✅ **Single Item**: Minus button disabled  
✅ **Max Quantity**: Plus button disabled at 10  
✅ **Accidental Delete**: Undo functionality  
✅ **App Restart**: Cart persists  
✅ **Large Numbers**: Badge shows "9+" for 10+  
✅ **Zero Items**: Badge disappears  

---

## 📱 User Experience Flow

```
Feed Screen
    ↓ (tap food item)
Product Details
    ↓ (select quantity)
    ↓ (tap "Add to Cart")
Snackbar Confirmation
    ↓ (tap cart icon)
Cart Review Screen
    ↓ (modify items)
    ↓ (review bill)
    ↓ (tap "Proceed to Payment")
Payment Screen (coming next!)
```

---

## 🎯 Success Metrics

**Functionality**: ✅ 100% Complete  
**User Experience**: ✅ Smooth & Intuitive  
**Performance**: ✅ Fast & Responsive  
**Persistence**: ✅ Data Saved  
**Error Handling**: ✅ All Edge Cases Covered  

---

**Ready for Production**: ✅ YES  
**Next Phase**: Payment & Order Flow
