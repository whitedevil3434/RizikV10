# 🚀 Unified Wallet Quick Start Guide

## What Changed?

### Before (3 Wallets)
```
Consumer switches to Partner
├─ Personal Wallet: ৳5,000  →  Can't see this anymore
├─ Partner Wallet: ৳0       →  Shows ৳0 (confusing!)
└─ Rider Wallet: ৳2,000     →  Can't see this anymore
```

### After (1 Unified Wallet)
```
Consumer switches to Partner
└─ Unified Wallet: ৳7,000   →  Same ৳7,000 everywhere!
   ├─ Consumer earned: +৳5,000
   ├─ Partner earned: ৳0
   └─ Rider earned: +৳2,000
```

## How to Access

### Option 1: Navigate to Unified Wallet Screen
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const UnifiedWalletScreen(),
  ),
);
```

### Option 2: Use Provider Directly
```dart
// Get balance
final balance = context.watch<UnifiedWalletProvider>().balance;

// Add money
await context.read<UnifiedWalletProvider>().addMoney(
  amount: 1000.0,
  description: 'Top up',
);

// Pay for order
await context.read<UnifiedWalletProvider>().payForOrder(
  amount: 500.0,
  orderId: 'order_123',
);
```

## Key Features

### ✅ Same Balance Everywhere
- Switch roles freely
- Balance stays the same
- No confusion

### ✅ Role Tracking
- Every transaction knows which role did it
- Filter transactions by role
- See earnings/spending per role

### ✅ Automatic Migration
- Old 3-wallet data automatically merged
- No data loss
- Seamless transition

### ✅ Khata OS Integration
- Transactions auto-create Khata entries
- Role context preserved
- Perfect audit trail

## Testing the Implementation

### 1. Check Migration
```dart
// Run app - should auto-migrate old wallets
// Look for green banner: "Your 3 wallets have been unified"
```

### 2. Verify Same Balance
```dart
// 1. Note balance as Consumer
// 2. Switch to Partner role
// 3. Balance should be identical
// 4. Switch to Rider role
// 5. Balance still identical
```

### 3. Test Role Tracking
```dart
// 1. As Consumer, pay for order
// 2. Check transaction - should show Consumer icon
// 3. Switch to Partner
// 4. Add money
// 5. Check transaction - should show Partner icon
```

### 4. View Role Analytics
```dart
// Open Unified Wallet Screen
// See "Contributions by Role" section
// Shows net earnings/spending per role
```

## Migration Details

### What Happens on First Load?
1. App detects old `moneybags` in storage
2. Merges all 3 wallet balances
3. Converts transactions with role attribution
4. Saves as unified wallet
5. Marks migration complete
6. Shows green success banner

### Data Preserved
- ✅ All balances merged
- ✅ All transactions preserved
- ✅ Transaction history intact
- ✅ Timestamps maintained
- ✅ Descriptions kept

### Role Attribution Logic
```dart
Personal Wallet transactions → Consumer role
Partner Wallet transactions  → Partner role
Rider Wallet transactions    → Rider role
```

## Common Use Cases

### Consumer Pays for Order
```dart
final walletProvider = context.read<UnifiedWalletProvider>();
final success = await walletProvider.payForOrder(
  amount: 500.0,
  orderId: 'order_123',
);

if (success) {
  // Payment successful
  // Transaction recorded with performedByRole = Consumer
}
```

### Partner Receives Earnings
```dart
await walletProvider.receiveEarnings(
  amount: 1000.0,
  sourceId: 'order_123',
  source: TransactionSource.order,
  description: 'Order #123 payout',
);
// Transaction recorded with performedByRole = Partner
```

### Rider Gets Delivery Fee
```dart
await walletProvider.receiveEarnings(
  amount: 50.0,
  sourceId: 'delivery_456',
  source: TransactionSource.delivery,
  description: 'Delivery fee',
);
// Transaction recorded with performedByRole = Rider
```

### View Role-Specific Transactions
```dart
// Get only Consumer transactions
final consumerTxns = walletProvider.getRecentTransactions(
  count: 50,
  filterByRole: UserRole.consumer,
);

// Get only Partner transactions
final partnerTxns = walletProvider.getRecentTransactions(
  count: 50,
  filterByRole: UserRole.partner,
);
```

## UI Components

### Main Balance Card
- Shows total unified balance
- Displays current active role
- Purple gradient design
- Role indicator icon

### Migration Banner (if migrated)
- Green success banner
- Shows "Your 3 wallets have been unified"
- Appears only after migration

### Role Contributions
- Visual cards for each role
- Shows net earnings (green) or spending (red)
- Role icon and color coding
- Easy to understand

### Transaction List
- Shows all transactions
- Filter by role using chips
- Each transaction shows:
  - Transaction type emoji
  - Description
  - Role that performed it (with icon)
  - Amount (green for credit, red for debit)

## Troubleshooting

### Balance Doesn't Match?
```dart
// Check if migration completed
final isMigrated = walletProvider.isMigrated;

// Force re-migration (testing only)
await walletProvider.forceMigration();
```

### Transactions Not Showing?
```dart
// Check filter - might be filtering by role
setState(() => _filterRole = null); // Show all

// Check transaction count
final allTxns = walletProvider.allTransactions;
print('Total transactions: ${allTxns.length}');
```

### Role Not Tracking?
```dart
// Verify RoleProvider is working
final currentRole = context.read<RoleProvider>().currentRole;
print('Current role: $currentRole');

// Check RoleContextManager
final roleContext = context.read<RoleProvider>().roleContextManager;
print('Role context: ${roleContext.currentRole}');
```

## Next Steps

### Integrate with Payment Flows
Update existing payment code to use UnifiedWalletProvider:

```dart
// OLD (MoneybagProvider)
await moneybagProvider.payForOrder(
  amount: amount,
  orderId: orderId,
);

// NEW (UnifiedWalletProvider)
await unifiedWalletProvider.payForOrder(
  amount: amount,
  orderId: orderId,
);
```

### Update Order Confirmation Screen
```dart
// Show unified balance instead of role-specific
final balance = context.watch<UnifiedWalletProvider>().balance;
Text('Available: ৳${balance.toStringAsFixed(2)}');
```

### Add to Navigation
```dart
// Add to drawer or settings
ListTile(
  leading: const Icon(Icons.account_balance_wallet),
  title: const Text('Unified Wallet'),
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const UnifiedWalletScreen(),
      ),
    );
  },
),
```

## Benefits Summary

### For Users
- ✅ See real money across all roles
- ✅ No confusion when switching roles
- ✅ Clear breakdown of role contributions
- ✅ Trust in the system

### For Developers
- ✅ Simpler wallet logic
- ✅ Better analytics
- ✅ Easier debugging
- ✅ Role-aware transactions

### For Business
- ✅ Increased user trust
- ✅ Better role adoption
- ✅ Clear audit trail
- ✅ Data-driven insights

## Status: ✅ READY TO USE

The unified wallet system is fully implemented and tested. All files are created, providers are registered, and the UI is ready. Users will automatically migrate from the old 3-wallet system on first load.

**Start using it now!**
