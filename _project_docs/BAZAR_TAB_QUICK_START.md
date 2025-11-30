# Bazar Tab Quick Start Guide

## 🚀 What's Been Built

The **Moneybag Transaction Orchestrator** - a production-ready financial system for the Bazar Tab ecosystem.

## 📦 How to Use

### Initialize the Orchestrator

```dart
import 'package:rizik_v4/services/moneybag_transaction_orchestrator.dart';
import 'package:rizik_v4/providers/khata_provider.dart';

// Create orchestrator with Khata integration
final orchestrator = MoneybagTransactionOrchestrator(
  khataProvider: khataProvider, // Optional - enables dual-write
);

// Initialize wallet balances
orchestrator.initializeBalances({
  MoneybagType.personal: 5000.0,
  MoneybagType.partner: 2000.0,
  MoneybagType.rider: 1000.0,
});
```

### Execute a Simple Transaction

```dart
// Consumer places an order
final result = await orchestrator.executeTransaction(
  fromWallet: MoneybagType.personal,
  toWallet: MoneybagType.partner,
  amount: 500.0,
  source: TransactionSource.order,
  sourceId: 'order_123',
  counterpartyName: 'Partner Restaurant',
);

if (result.success) {
  print('✅ Transaction successful: ${result.transactionId}');
  print('📝 Khata entry: ${result.khataEntryId}');
} else {
  print('❌ Transaction failed: ${result.error}');
}
```

### Distribute Commission (Video Order)

```dart
// Order from a Rizik Vibes video
final results = await orchestrator.distributeCommission(
  orderId: 'order_456',
  orderAmount: 1000.0,
  partnerId: 'partner_789',
  videoId: 'video_101',
  creatorId: 'creator_202',
  platformFeeRate: 0.05,        // 5%
  videoCommissionRate: 0.15,    // 15%
);

// Results contains transactions for:
// 1. Partner payment (৳800)
// 2. Creator commission (৳150)
// Platform fee (৳50) is logged
```

### Handle Squad Payment

```dart
// Squad group purchase
final result = await orchestrator.handleSquadPayment(
  squadId: 'squad_303',
  amount: 2000.0,
  sourceId: 'order_789',
  source: TransactionSource.order,
  squadMemberIds: ['user_1', 'user_2', 'user_3', 'user_4'],
);

// Automatically calculates per-member share: ৳500 each
```

### Execute with Retry Logic

```dart
// Transaction with automatic retry
final result = await orchestrator.executeTransactionWithRetry(
  fromWallet: MoneybagType.personal,
  toWallet: MoneybagType.rider,
  amount: 150.0,
  source: TransactionSource.delivery,
  sourceId: 'delivery_999',
  maxAttempts: 3, // Will retry up to 3 times
);

// Automatically retries on:
// - Wallet locked
// - Network timeout
// - Connection issues
```

### Check Failed Transactions

```dart
// Get failed transactions queue
final failedTxns = orchestrator.failedTransactions;

for (final txn in failedTxns) {
  print('Failed: ${txn.sourceId} - ${txn.attempts} attempts');
  
  // Retry manually
  final result = await orchestrator.retryQueuedTransaction(txn);
  if (result.success) {
    print('✅ Retry successful!');
  }
}

// Clear queue
orchestrator.clearFailedTransactions();
```

## 🎯 Transaction Sources

All supported transaction types:

```dart
TransactionSource.manual          // Manual transfer
TransactionSource.order            // Order payment
TransactionSource.video            // Video earnings
TransactionSource.bid              // Bid/haggle payment
TransactionSource.delivery         // Delivery earnings
TransactionSource.commission       // Commission payment
TransactionSource.squad            // Squad payment
TransactionSource.damKomao         // Bargaining savings
TransactionSource.surpriseCoupon   // Variable reward
TransactionSource.viralBonus       // Viral video bonus
TransactionSource.dhaarLoan        // Rizik Dhaar loan
TransactionSource.dhaarRepayment   // Loan repayment
TransactionSource.moverFloat       // Rider advance
TransactionSource.refund           // Order refund
```

## 📊 Check Balances

```dart
// Get current balance
final balance = orchestrator.getBalance(MoneybagType.personal);
print('Personal Moneybag: ৳${balance.toStringAsFixed(2)}');
```

## 🔍 Transaction Results

```dart
class TransactionResult {
  final bool success;              // Did it succeed?
  final String? transactionId;     // Moneybag transaction ID
  final String? khataEntryId;      // Linked Khata entry ID
  final String? error;             // Error message if failed
  final Map<String, dynamic>? metadata; // Additional data
}
```

## 🛡️ Error Handling

### Retryable Errors
- Wallet locked
- Network timeout
- Connection issues
- Service unavailable

### Non-Retryable Errors
- Insufficient balance
- Invalid amount
- Permission denied
- Invalid wallet type

## 💡 Best Practices

1. **Always check result.success** before proceeding
2. **Use retry logic** for user-facing transactions
3. **Enable dual-write** for audit trail (pass khataProvider)
4. **Include metadata** for debugging and reconciliation
5. **Monitor failed queue** for manual reconciliation

## 🎯 Common Patterns

### Consumer Order Flow
```dart
// 1. Check balance
final balance = orchestrator.getBalance(MoneybagType.personal);
if (balance < orderAmount) {
  // Offer Rizik Dhaar or Add Money
}

// 2. Execute transaction with retry
final result = await orchestrator.executeTransactionWithRetry(
  fromWallet: MoneybagType.personal,
  toWallet: MoneybagType.partner,
  amount: orderAmount,
  source: TransactionSource.order,
  sourceId: orderId,
  counterpartyName: partnerName,
);

// 3. Handle result
if (result.success) {
  // Show success, update UI
} else {
  // Show error, offer alternatives
}
```

### Video Monetization Flow
```dart
// Distribute earnings from video order
final results = await orchestrator.distributeCommission(
  orderId: orderId,
  orderAmount: orderAmount,
  partnerId: partnerId,
  videoId: videoId,
  creatorId: creatorId,
);

// Check all transactions succeeded
final allSuccess = results.every((r) => r.success);
```

### Rider Delivery Flow
```dart
// On delivery completion
final result = await orchestrator.executeTransaction(
  fromWallet: MoneybagType.personal, // Escrow
  toWallet: MoneybagType.rider,
  amount: deliveryFee,
  source: TransactionSource.delivery,
  sourceId: deliveryId,
  counterpartyName: riderName,
);
```

## 📝 Khata OS Integration

When `khataProvider` is provided:
- Every transaction automatically creates a Khata entry
- Entries are categorized based on transaction source
- Metadata links Moneybag and Khata records
- Rollback occurs if Khata write fails

**Disable dual-write for specific transaction:**
```dart
final result = await orchestrator.executeTransaction(
  // ... parameters ...
  enableDualWrite: false, // Skip Khata OS write
);
```

## 🚨 Troubleshooting

### Transaction Fails Immediately
- Check wallet balance
- Verify wallet is not locked
- Ensure amount is positive

### Dual-Write Fails
- Check khataProvider is initialized
- Verify Khata exists for wallet type
- Check Khata OS is accessible

### Retry Exhausted
- Check failed transactions queue
- Review error message
- Retry manually if needed

## 📚 Related Files

- **Orchestrator:** `lib/services/moneybag_transaction_orchestrator.dart`
- **Models:** `lib/models/moneybag.dart`
- **Khata Provider:** `lib/providers/khata_provider.dart`
- **Khata Models:** `lib/models/khata.dart`, `lib/models/khata_entry.dart`

## 🎊 You're Ready!

The Moneybag Transaction Orchestrator is production-ready and handles:
- ✅ Atomic transactions
- ✅ Dual-write to Khata OS
- ✅ Commission distribution
- ✅ Squad payments
- ✅ Error recovery
- ✅ Complete audit trail

Start building amazing financial features for the Bazar Tab! 🚀
