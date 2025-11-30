# 🎯 How to Access Unified Wallet

## Quick Access

### Method 1: From Drawer Menu (Recommended)
1. Open the app
2. Tap your **avatar** in the top-left corner
3. Scroll down to **"Financial"** section
4. Tap **"Unified Wallet"**

### Method 2: Direct Navigation (For Developers)
```dart
Navigator.pushNamed(context, '/unified-wallet');
```

## What You'll See

### 1. Main Balance Card
- **Total Balance**: Same amount across all roles
- **Current Role**: Shows which role you're currently in
- **Purple gradient design** with role icon

### 2. Migration Banner (If Applicable)
- Green banner showing "Your 3 wallets have been unified"
- Only appears if you had old wallet data that was migrated

### 3. Role Contributions
Three cards showing:
- **Consumer**: Net spending (usually negative/red)
- **Partner**: Net earnings (usually positive/green)
- **Rider**: Net earnings (usually positive/green)

### 4. Recent Transactions
- Shows last 20 transactions
- Each transaction displays:
  - Transaction type emoji
  - Description
  - Which role performed it (with colored badge)
  - Amount (green for credit, red for debit)

## Key Features to Test

### ✅ Same Balance Across Roles
1. Note your balance as **Consumer**
2. Switch to **Partner** role (via drawer)
3. Open Unified Wallet again
4. **Balance should be identical**
5. Switch to **Rider** role
6. **Balance still identical**

### ✅ Role Tracking
1. As **Consumer**, tap "Add Money"
2. Add ৳1000
3. Check transaction list - should show Consumer icon
4. Switch to **Partner** role
5. Add ৳500
6. Check transaction list - should show Partner icon

### ✅ Role Contributions
- Look at "Contributions by Role" section
- Consumer usually shows negative (spending)
- Partner/Rider usually show positive (earnings)
- Total of all contributions = current balance

## Testing the Migration

If you had the old 3-wallet system:

### Before Migration
```
Personal Wallet: ৳5,000
Partner Wallet: ৳7,000
Rider Wallet: ৳3,000
Total: ৳15,000 (but split across 3 wallets)
```

### After Migration
```
Unified Wallet: ৳15,000 (one balance)
├─ Consumer contributed: +৳5,000
├─ Partner contributed: +৳7,000
└─ Rider contributed: +৳3,000
```

## Common Questions

### Q: Why is my balance the same in all roles?
**A:** That's the point! The unified wallet shows your real total money, not fake role-specific balances.

### Q: How do I know which role earned what?
**A:** Check the "Contributions by Role" section or filter transactions by role.

### Q: What happened to my old wallets?
**A:** They were automatically merged into the unified wallet. All transaction history is preserved.

### Q: Can I still use the old wallet screen?
**A:** Yes, but it's deprecated. The unified wallet is the new standard.

## UI Navigation Path

```
Main Screen
  └─ Tap Avatar (top-left)
      └─ Drawer Opens
          └─ Scroll to "Financial" section
              └─ Tap "Unified Wallet"
                  └─ Unified Wallet Screen Opens
```

## Features Available

### Add Money
- Tap floating action button (bottom-right)
- Enter amount
- Tap "Add"
- Transaction recorded with current role

### View Transactions
- Scroll down to see recent transactions
- Each shows which role performed it
- Filter by role (future feature)

### Role Analytics
- See net earnings/spending per role
- Visual breakdown with colors
- Easy to understand contributions

## Status: ✅ LIVE AND WORKING

The unified wallet is now accessible from the drawer menu under "Financial" section. All users will automatically migrate from the old 3-wallet system on first access.

**Start using it now!**
