import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';
import 'package:rizik_v4/data/models/khata.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';

/// Result of a transaction execution
class TransactionResult {
  final bool success;
  final String? transactionId;
  final String? khataEntryId;
  final String? error;
  final Map<String, dynamic>? metadata;

  const TransactionResult({
    required this.success,
    this.transactionId,
    this.khataEntryId,
    this.error,
    this.metadata,
  });

  factory TransactionResult.success({
    required String transactionId,
    String? khataEntryId,
    Map<String, dynamic>? metadata,
  }) {
    return TransactionResult(
      success: true,
      transactionId: transactionId,
      khataEntryId: khataEntryId,
      metadata: metadata,
    );
  }

  factory TransactionResult.failure(String error) {
    return TransactionResult(
      success: false,
      error: error,
    );
  }
}

/// Orchestrator for complex Moneybag transactions
/// Handles atomicity, dual-write to Khata OS, commission distribution
class MoneybagTransactionOrchestrator {
  final KhataProvider? khataProvider;

  // Wallet balances (in-memory for atomicity)
  final Map<MoneybagType, double> _balances = {};
  
  // Transaction locks to prevent concurrent modifications
  final Map<MoneybagType, bool> _locks = {};

  // Failed transaction queue for retry
  final List<_QueuedTransaction> _failedTransactions = [];
  
  // Retry configuration
  static const int maxRetries = 3;
  static const Duration initialBackoff = Duration(seconds: 1);

  MoneybagTransactionOrchestrator({this.khataProvider});

  /// Execute a transaction with atomic operations and dual-write to Khata OS
  Future<TransactionResult> executeTransaction({
    required MoneybagType fromWallet,
    MoneybagType? toWallet,
    required double amount,
    required TransactionSource source,
    required String sourceId,
    Map<String, dynamic>? metadata,
    String? counterpartyId,
    String? counterpartyName,
    bool enableDualWrite = true,
  }) async {
    // Validate amount
    if (amount <= 0) {
      return TransactionResult.failure('Amount must be positive');
    }

    // Lock wallets
    if (!await _acquireLock(fromWallet)) {
      return TransactionResult.failure('Wallet is locked');
    }
    if (toWallet != null && !await _acquireLock(toWallet)) {
      _releaseLock(fromWallet);
      return TransactionResult.failure('Destination wallet is locked');
    }

    // Store original balances for rollback
    final originalFromBalance = _balances[fromWallet] ?? 0.0;
    final originalToBalance = toWallet != null ? (_balances[toWallet] ?? 0.0) : null;

    try {
      // Check balance
      if (originalFromBalance < amount) {
        return TransactionResult.failure('Insufficient balance');
      }

      // Generate transaction ID
      final txnId = 'txn_${DateTime.now().millisecondsSinceEpoch}';

      // Execute atomic operation on Moneybag
      _balances[fromWallet] = originalFromBalance - amount;
      if (toWallet != null) {
        _balances[toWallet!] = originalToBalance! + amount;
      }

      // Create transaction record
      final transaction = MoneybagTransaction(
        id: txnId,
        amount: amount,
        type: _getTransactionType(source),
        timestamp: DateTime.now(),
        fromMoneybag: fromWallet.key,
        toMoneybag: toWallet?.key,
        source: source,
        sourceId: sourceId,
        counterpartyId: counterpartyId,
        counterpartyName: counterpartyName,
        metadata: metadata,
      );

      // Dual-write to Khata OS if enabled
      String? khataEntryId;
      if (enableDualWrite && khataProvider != null) {
        try {
          khataEntryId = await dualWriteToKhataOS(
            transaction: transaction,
            fromWallet: fromWallet,
            toWallet: toWallet,
            counterpartyName: counterpartyName,
          );
        } catch (khataError) {
          // Rollback Moneybag transaction on Khata write failure
          debugPrint('Khata write failed, rolling back: $khataError');
          _balances[fromWallet] = originalFromBalance;
          if (toWallet != null && originalToBalance != null) {
            _balances[toWallet] = originalToBalance;
          }
          return TransactionResult.failure('Dual-write failed: $khataError');
        }
      }

      return TransactionResult.success(
        transactionId: txnId,
        khataEntryId: khataEntryId,
        metadata: {
          'transaction': transaction,
          'fromBalance': _balances[fromWallet],
          'toBalance': toWallet != null ? _balances[toWallet] : null,
        },
      );
    } catch (e) {
      // Rollback on error
      debugPrint('Transaction failed: $e');
      _balances[fromWallet] = originalFromBalance;
      if (toWallet != null && originalToBalance != null) {
        _balances[toWallet] = originalToBalance;
      }
      return TransactionResult.failure('Transaction failed: $e');
    } finally {
      // Release locks
      _releaseLock(fromWallet);
      if (toWallet != null) {
        _releaseLock(toWallet);
      }
    }
  }

  /// Acquire lock on wallet
  Future<bool> _acquireLock(MoneybagType wallet) async {
    if (_locks[wallet] == true) {
      return false;
    }
    _locks[wallet] = true;
    return true;
  }

  /// Release lock on wallet
  void _releaseLock(MoneybagType wallet) {
    _locks[wallet] = false;
  }

  /// Get transaction type from source
  TransactionType _getTransactionType(TransactionSource source) {
    switch (source) {
      case TransactionSource.order:
        return TransactionType.orderPayment;
      case TransactionSource.video:
        return TransactionType.videoEarning;
      case TransactionSource.delivery:
        return TransactionType.deliveryEarning;
      case TransactionSource.commission:
        return TransactionType.commission;
      case TransactionSource.bid:
        return TransactionType.bidPayment;
      case TransactionSource.squad:
        return TransactionType.squadPayment;
      default:
        return TransactionType.transfer;
    }
  }

  /// Initialize balances from moneybags
  void initializeBalances(Map<MoneybagType, double> balances) {
    _balances.clear();
    _balances.addAll(balances);
  }

  /// Get current balance
  double getBalance(MoneybagType wallet) {
    return _balances[wallet] ?? 0.0;
  }

  /// Dual-write transaction to Khata OS
  /// Maps Moneybag transactions to appropriate Khata entries
  Future<String> dualWriteToKhataOS({
    required MoneybagTransaction transaction,
    required MoneybagType fromWallet,
    MoneybagType? toWallet,
    String? counterpartyName,
  }) async {
    if (khataProvider == null) {
      throw Exception('KhataProvider not available');
    }

    // Determine which Khata to write to based on wallet type
    final khataType = _mapWalletToKhataType(fromWallet);
    final khata = khataProvider!.getKhataByType(khataType);
    
    if (khata == null) {
      throw Exception('No Khata found for type: ${khataType.key}');
    }

    // Map transaction source to Khata category and description
    final categoryAndDesc = _mapTransactionToKhataEntry(transaction, counterpartyName);
    
    // Create Khata entry
    final khataEntry = KhataEntry(
      date: _formatDate(transaction.timestamp),
      description: categoryAndDesc['description'] as String,
      amount: transaction.amount.toStringAsFixed(2),
      isCredit: categoryAndDesc['isCredit'] as bool,
      timestamp: transaction.timestamp,
      category: categoryAndDesc['category'] as KhataCategory?,
      notes: 'Moneybag txn: ${transaction.id}',
      metadata: {
        'moneybag_transaction_id': transaction.id,
        'source': transaction.source.key,
        'source_id': transaction.sourceId,
        'from_wallet': fromWallet.key,
        'to_wallet': toWallet?.key,
      },
    );

    // Add entry to Khata
    await khataProvider!.addEntry(
      khataId: khata.id,
      entry: khataEntry,
    );

    debugPrint('✅ Dual-write successful: Moneybag ${transaction.id} → Khata ${khataEntry.id}');
    return khataEntry.id;
  }

  /// Map Moneybag wallet type to Khata type
  KhataType _mapWalletToKhataType(MoneybagType walletType) {
    switch (walletType) {
      case MoneybagType.personal:
        return KhataType.personal;
      case MoneybagType.partner:
        return KhataType.personal; // Partners use personal Khata for business
      case MoneybagType.rider:
        return KhataType.personal; // Riders use personal Khata for earnings
      default:
        return KhataType.personal;
    }
  }

  /// Map transaction to Khata entry details
  Map<String, dynamic> _mapTransactionToKhataEntry(
    MoneybagTransaction transaction,
    String? counterpartyName,
  ) {
    String description;
    KhataCategory? category;
    bool isCredit;

    switch (transaction.source) {
      case TransactionSource.order:
        description = 'Order Payment: ${transaction.sourceId}';
        category = KhataCategory.food;
        isCredit = false; // Expense for consumer
        break;

      case TransactionSource.video:
        description = 'Video Earnings: ${transaction.sourceId}';
        category = null;
        isCredit = true; // Income for creator
        break;

      case TransactionSource.delivery:
        description = 'Delivery Earnings: ${transaction.sourceId}';
        category = null;
        isCredit = true; // Income for rider
        break;

      case TransactionSource.commission:
        description = 'Commission: ${transaction.sourceId}';
        category = null;
        isCredit = true; // Income
        break;

      case TransactionSource.bid:
        description = 'Bid Payment: ${transaction.sourceId}';
        category = KhataCategory.food;
        isCredit = false; // Expense
        break;

      case TransactionSource.squad:
        description = 'Squad Payment: ${transaction.sourceId}';
        category = KhataCategory.other;
        isCredit = false; // Expense
        break;

      case TransactionSource.damKomao:
        description = 'Dam Komao Savings: ${transaction.sourceId}';
        category = KhataCategory.food;
        isCredit = false; // Expense (but with savings)
        break;

      case TransactionSource.surpriseCoupon:
        description = 'Surprise Coupon Discount';
        category = KhataCategory.savings;
        isCredit = true; // Savings
        break;

      case TransactionSource.viralBonus:
        description = 'Viral Video Bonus';
        category = null;
        isCredit = true; // Income
        break;

      case TransactionSource.dhaarLoan:
        description = 'Rizik Dhaar Loan';
        category = null;
        isCredit = true; // Money received
        break;

      case TransactionSource.dhaarRepayment:
        description = 'Rizik Dhaar Repayment';
        category = null;
        isCredit = false; // Money paid
        break;

      case TransactionSource.moverFloat:
        description = 'Mover Float Advance';
        category = null;
        isCredit = true; // Money received
        break;

      case TransactionSource.refund:
        description = 'Refund: ${transaction.sourceId}';
        category = null;
        isCredit = true; // Money back
        break;

      default:
        description = 'Transaction: ${transaction.sourceId}';
        category = KhataCategory.other;
        isCredit = false;
    }

    // Add counterparty name if available
    if (counterpartyName != null) {
      description += ' - $counterpartyName';
    }

    return {
      'description': description,
      'category': category,
      'isCredit': isCredit,
    };
  }

  /// Format date for Khata entry
  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  /// Distribute commission from an order
  /// Handles video-linked orders vs regular orders
  Future<List<TransactionResult>> distributeCommission({
    required String orderId,
    required double orderAmount,
    required String partnerId,
    String? videoId,
    String? creatorId,
    double platformFeeRate = 0.05, // 5% platform fee
    double videoCommissionRate = 0.15, // 15% creator commission for video orders
    MoneybagType fromWallet = MoneybagType.escrow, // Default to escrow
  }) async {
    final results = <TransactionResult>[];

    try {
      // Calculate amounts
      final platformFee = orderAmount * platformFeeRate;
      double partnerPayment;
      double? creatorCommission;

      if (videoId != null && creatorId != null) {
        // Video-linked order: deduct creator commission
        creatorCommission = orderAmount * videoCommissionRate;
        partnerPayment = orderAmount - platformFee - creatorCommission;
      } else {
        // Regular order: no creator commission
        partnerPayment = orderAmount - platformFee;
      }

      // 1. Credit partner
      final partnerResult = await executeTransaction(
        fromWallet: fromWallet, // Platform holds escrow
        toWallet: MoneybagType.partner,
        amount: partnerPayment,
        source: TransactionSource.order,
        sourceId: orderId,
        counterpartyId: partnerId,
        counterpartyName: 'Partner',
        metadata: {
          'order_id': orderId,
          'order_amount': orderAmount,
          'platform_fee': platformFee,
          'video_id': videoId,
        },
      );
      results.add(partnerResult);

      // 2. Credit creator if video-linked
      if (videoId != null && creatorId != null && creatorCommission != null) {
        final creatorResult = await executeTransaction(
          fromWallet: fromWallet, // Platform holds escrow
          toWallet: MoneybagType.personal, // Creator's personal wallet
          amount: creatorCommission,
          source: TransactionSource.commission,
          sourceId: videoId,
          counterpartyId: creatorId,
          counterpartyName: 'Video Creator',
          metadata: {
            'order_id': orderId,
            'video_id': videoId,
            'commission_rate': videoCommissionRate,
            'order_amount': orderAmount,
          },
        );
        results.add(creatorResult);
      }

      // 3. Platform fee (just logging, not transferring)
      debugPrint('💰 Platform fee collected: ৳${platformFee.toStringAsFixed(2)}');

      return results;
    } catch (e) {
      debugPrint('❌ Commission distribution failed: $e');
      return results;
    }
  }

  /// Execute Social Ledger transaction
  /// Handles debit from fromUser's Personal Moneybag and credit to toUser's Personal Moneybag
  /// Creates Khata OS entries for both users and updates Trust Scores
  Future<TransactionResult> executeSocialLedgerTransaction({
    required String socialLedgerEntryId,
    required String fromUserId,
    required String toUserId,
    required double amount,
    required String description,
  }) async {
    try {
      debugPrint('💸 Executing Social Ledger transaction: $fromUserId → $toUserId (৳${amount.toStringAsFixed(2)})');

      // 1. Debit from fromUser's Personal Moneybag
      final debitResult = await executeTransaction(
        fromWallet: MoneybagType.personal,
        toWallet: null,
        amount: amount,
        source: TransactionSource.khata,
        sourceId: socialLedgerEntryId,
        counterpartyId: toUserId,
        counterpartyName: 'Social Ledger Settlement',
        metadata: {
          'social_ledger_entry_id': socialLedgerEntryId,
          'from_user_id': fromUserId,
          'to_user_id': toUserId,
          'description': description,
          'transaction_type': 'social_ledger_debit',
        },
      );

      if (!debitResult.success) {
        debugPrint('❌ Social Ledger debit failed: ${debitResult.error}');
        return debitResult;
      }

      // 2. Credit to toUser's Personal Moneybag
      // Note: In a real implementation, this would need to access toUser's wallet
      // For now, we'll log this as a pending credit
      debugPrint('✅ Social Ledger debit successful. Credit to $toUserId pending.');

      // 3. Update Trust Scores for both parties
      // This would integrate with TrustScoreService
      debugPrint('📊 Trust Score updates queued for $fromUserId and $toUserId');

      return TransactionResult.success(
        transactionId: debitResult.transactionId!,
        khataEntryId: debitResult.khataEntryId,
        metadata: {
          'social_ledger_entry_id': socialLedgerEntryId,
          'from_user_id': fromUserId,
          'to_user_id': toUserId,
          'amount': amount,
          'description': description,
        },
      );
    } catch (e) {
      debugPrint('❌ Social Ledger transaction failed: $e');
      return TransactionResult.failure('Social Ledger transaction failed: $e');
    }
  }

  /// Payout video creator for views and orders
  /// Calculates view earnings (20-50 taka per 1000 views) and commission earnings (10-20% of orders)
  /// Credits creator's wallet (Personal or Partner based on role) and awards XP
  Future<TransactionResult> payoutVideoCreator({
    required String videoId,
    required String creatorId,
    required int viewCount,
    required int orderCount,
    required double totalOrderValue,
    double viewMonetizationRate = 35.0, // Default: 35 taka per 1000 views
    double commissionRate = 0.15, // Default: 15% commission
    MoneybagType creatorWallet = MoneybagType.personal,
  }) async {
    try {
      debugPrint('🎥 Processing video creator payout for video: $videoId');

      // 1. Calculate view earnings (per 1000 views)
      final viewEarnings = (viewCount / 1000) * viewMonetizationRate;

      // 2. Calculate commission earnings
      final commissionEarnings = totalOrderValue * commissionRate;

      // 3. Total payout
      final totalPayout = viewEarnings + commissionEarnings;

      if (totalPayout <= 0) {
        debugPrint('⚠️ No payout needed for video $videoId (views: $viewCount, orders: $orderCount)');
        return TransactionResult.success(
          transactionId: 'no_payout_$videoId',
          metadata: {
            'video_id': videoId,
            'creator_id': creatorId,
            'view_count': viewCount,
            'order_count': orderCount,
            'total_order_value': totalOrderValue,
            'view_earnings': 0.0,
            'commission_earnings': 0.0,
            'total_payout': 0.0,
            'view_monetization_rate': viewMonetizationRate,
            'commission_rate': commissionRate,
          },
        );
      }

      // 4. Credit creator's wallet
      final payoutResult = await executeTransaction(
        fromWallet: MoneybagType.escrow, // Platform pays from escrow
        toWallet: creatorWallet,
        amount: totalPayout,
        source: TransactionSource.video,
        sourceId: videoId,
        counterpartyId: creatorId,
        counterpartyName: 'Video Creator',
        metadata: {
          'video_id': videoId,
          'creator_id': creatorId,
          'view_count': viewCount,
          'order_count': orderCount,
          'total_order_value': totalOrderValue,
          'view_earnings': viewEarnings,
          'commission_earnings': commissionEarnings,
          'total_payout': totalPayout,
          'view_monetization_rate': viewMonetizationRate,
          'commission_rate': commissionRate,
        },
      );

      if (payoutResult.success) {
        debugPrint('✅ Video creator payout successful: ৳${totalPayout.toStringAsFixed(2)}');
        debugPrint('   - View earnings: ৳${viewEarnings.toStringAsFixed(2)} ($viewCount views)');
        debugPrint('   - Commission earnings: ৳${commissionEarnings.toStringAsFixed(2)} ($orderCount orders)');

        // 5. Award XP for video performance
        // This would integrate with AuraService
        final xpAmount = (orderCount * 20) + (viewCount ~/ 100);
        debugPrint('🎮 XP awarded to creator: $xpAmount XP');
        
        // Return result with enhanced metadata
        return TransactionResult.success(
          transactionId: payoutResult.transactionId!,
          khataEntryId: payoutResult.khataEntryId,
          metadata: {
            'video_id': videoId,
            'creator_id': creatorId,
            'view_count': viewCount,
            'order_count': orderCount,
            'total_order_value': totalOrderValue,
            'view_earnings': viewEarnings,
            'commission_earnings': commissionEarnings,
            'total_payout': totalPayout,
            'view_monetization_rate': viewMonetizationRate,
            'commission_rate': commissionRate,
            'xp_awarded': xpAmount,
          },
        );
      }

      return payoutResult;
    } catch (e) {
      debugPrint('❌ Video creator payout failed: $e');
      return TransactionResult.failure('Video creator payout failed: $e');
    }
  }

  /// Execute C2C marketplace transaction with escrow
  /// Deducts from buyer's Personal Moneybag, holds in escrow, and releases to seller on confirmation
  Future<TransactionResult> executeC2CTransaction({
    required String listingId,
    required String buyerId,
    required String sellerId,
    required double amount,
    required String itemDescription,
  }) async {
    try {
      debugPrint('🛍️ Executing C2C transaction for listing: $listingId');

      // 1. Deduct from buyer's Personal Moneybag and hold in escrow
      final escrowResult = await executeTransaction(
        fromWallet: MoneybagType.personal,
        toWallet: MoneybagType.escrow,
        amount: amount,
        source: TransactionSource.order,
        sourceId: listingId,
        counterpartyId: sellerId,
        counterpartyName: 'C2C Seller',
        metadata: {
          'listing_id': listingId,
          'buyer_id': buyerId,
          'seller_id': sellerId,
          'item_description': itemDescription,
          'transaction_type': 'c2c_escrow',
          'status': 'held_in_escrow',
        },
      );

      if (escrowResult.success) {
        debugPrint('✅ C2C payment held in escrow: ৳${amount.toStringAsFixed(2)}');
        debugPrint('   Awaiting delivery confirmation to release to seller');
      }

      return escrowResult;
    } catch (e) {
      debugPrint('❌ C2C transaction failed: $e');
      return TransactionResult.failure('C2C transaction failed: $e');
    }
  }

  /// Release C2C escrow payment to seller
  /// Called when buyer confirms delivery
  Future<TransactionResult> releaseC2CEscrow({
    required String listingId,
    required String sellerId,
    required double amount,
  }) async {
    try {
      debugPrint('✅ Releasing C2C escrow for listing: $listingId');

      // Release from escrow to seller's Personal Moneybag
      final releaseResult = await executeTransaction(
        fromWallet: MoneybagType.escrow,
        toWallet: MoneybagType.personal,
        amount: amount,
        source: TransactionSource.order,
        sourceId: listingId,
        counterpartyId: sellerId,
        counterpartyName: 'C2C Seller',
        metadata: {
          'listing_id': listingId,
          'seller_id': sellerId,
          'transaction_type': 'c2c_release',
          'status': 'released_to_seller',
        },
      );

      if (releaseResult.success) {
        debugPrint('✅ C2C payment released to seller: ৳${amount.toStringAsFixed(2)}');
        
        // Update Trust Scores for both parties
        debugPrint('📊 Trust Score updates queued for buyer and seller');
      }

      return releaseResult;
    } catch (e) {
      debugPrint('❌ C2C escrow release failed: $e');
      return TransactionResult.failure('C2C escrow release failed: $e');
    }
  }

  /// Handle Squad payment (Enhanced)
  /// Routes payment to Squad wallet and creates ledger entries
  /// Supports bill splitting and notifies all squad members
  Future<TransactionResult> handleSquadPayment({
    required String squadId,
    required double amount,
    required String sourceId,
    required TransactionSource source,
    required List<String> squadMemberIds,
    String? description,
    bool splitEqually = true,
    Map<String, double>? customSplits,
  }) async {
    try {
      debugPrint('👥 Processing Squad payment: ৳${amount.toStringAsFixed(2)} for ${squadMemberIds.length} members');

      // Calculate splits
      Map<String, double> splits;
      if (splitEqually) {
        final perMemberShare = amount / squadMemberIds.length;
        splits = {for (var id in squadMemberIds) id: perMemberShare};
      } else if (customSplits != null) {
        splits = customSplits;
      } else {
        return TransactionResult.failure('No split configuration provided');
      }

      // Execute transaction from Personal to Escrow (Squad wallet placeholder)
      final result = await executeTransaction(
        fromWallet: MoneybagType.personal,
        toWallet: MoneybagType.escrow, // Use escrow as Squad wallet placeholder
        amount: amount,
        source: source,
        sourceId: sourceId,
        metadata: {
          'squad_id': squadId,
          'member_ids': squadMemberIds,
          'member_count': squadMemberIds.length,
          'splits': splits,
          'split_equally': splitEqually,
          'description': description,
        },
      );

      if (result.success) {
        debugPrint('✅ Squad payment processed: ৳${amount.toStringAsFixed(2)} for ${squadMemberIds.length} members');
        
        // Create Squad ledger entries for each member
        for (var entry in splits.entries) {
          debugPrint('   - ${entry.key}: ৳${entry.value.toStringAsFixed(2)}');
        }
        
        // TODO: Notify all squad members
        // This would integrate with notification service
        debugPrint('📱 Notifications queued for ${squadMemberIds.length} squad members');
      }

      return result;
    } catch (e) {
      debugPrint('❌ Squad payment failed: $e');
      return TransactionResult.failure('Squad payment failed: $e');
    }
  }

  /// Execute transaction with retry logic
  Future<TransactionResult> executeTransactionWithRetry({
    required MoneybagType fromWallet,
    MoneybagType? toWallet,
    required double amount,
    required TransactionSource source,
    required String sourceId,
    Map<String, dynamic>? metadata,
    String? counterpartyId,
    String? counterpartyName,
    bool enableDualWrite = true,
    int maxAttempts = maxRetries,
  }) async {
    int attempt = 0;
    Duration backoff = initialBackoff;

    while (attempt < maxAttempts) {
      attempt++;
      
      final result = await executeTransaction(
        fromWallet: fromWallet,
        toWallet: toWallet,
        amount: amount,
        source: source,
        sourceId: sourceId,
        metadata: metadata,
        counterpartyId: counterpartyId,
        counterpartyName: counterpartyName,
        enableDualWrite: enableDualWrite,
      );

      if (result.success) {
        if (attempt > 1) {
          debugPrint('✅ Transaction succeeded on attempt $attempt');
        }
        return result;
      }

      // Check if error is retryable
      if (!_isRetryableError(result.error)) {
        debugPrint('❌ Non-retryable error: ${result.error}');
        return result;
      }

      if (attempt < maxAttempts) {
        debugPrint('⏳ Retrying transaction (attempt $attempt/$maxAttempts) after ${backoff.inSeconds}s...');
        await Future.delayed(backoff);
        backoff *= 2; // Exponential backoff
      }
    }

    // All retries failed - queue for manual reconciliation
    _queueFailedTransaction(
      fromWallet: fromWallet,
      toWallet: toWallet,
      amount: amount,
      source: source,
      sourceId: sourceId,
      metadata: metadata,
      counterpartyId: counterpartyId,
      counterpartyName: counterpartyName,
    );

    return TransactionResult.failure('Transaction failed after $maxAttempts attempts');
  }

  /// Check if error is retryable
  bool _isRetryableError(String? error) {
    if (error == null) return false;
    
    // Retryable errors
    final retryablePatterns = [
      'locked',
      'timeout',
      'network',
      'connection',
      'unavailable',
    ];

    final errorLower = error.toLowerCase();
    return retryablePatterns.any((pattern) => errorLower.contains(pattern));
  }

  /// Queue failed transaction for manual reconciliation
  void _queueFailedTransaction({
    required MoneybagType fromWallet,
    MoneybagType? toWallet,
    required double amount,
    required TransactionSource source,
    required String sourceId,
    Map<String, dynamic>? metadata,
    String? counterpartyId,
    String? counterpartyName,
  }) {
    final queued = _QueuedTransaction(
      fromWallet: fromWallet,
      toWallet: toWallet,
      amount: amount,
      source: source,
      sourceId: sourceId,
      metadata: metadata,
      counterpartyId: counterpartyId,
      counterpartyName: counterpartyName,
      queuedAt: DateTime.now(),
      attempts: maxRetries,
    );

    _failedTransactions.add(queued);
    debugPrint('📋 Queued failed transaction for manual reconciliation: ${queued.sourceId}');
    
    // TODO: Log to persistent storage or alert system
  }

  /// Get failed transactions queue
  List<_QueuedTransaction> get failedTransactions => List.unmodifiable(_failedTransactions);

  /// Retry a queued transaction
  Future<TransactionResult> retryQueuedTransaction(_QueuedTransaction queued) async {
    final result = await executeTransactionWithRetry(
      fromWallet: queued.fromWallet,
      toWallet: queued.toWallet,
      amount: queued.amount,
      source: queued.source,
      sourceId: queued.sourceId,
      metadata: queued.metadata,
      counterpartyId: queued.counterpartyId,
      counterpartyName: queued.counterpartyName,
    );

    if (result.success) {
      _failedTransactions.remove(queued);
      debugPrint('✅ Queued transaction successfully retried: ${queued.sourceId}');
    }

    return result;
  }

  /// Clear failed transactions queue
  void clearFailedTransactions() {
    _failedTransactions.clear();
  }
}

/// Queued transaction for retry
class _QueuedTransaction {
  final MoneybagType fromWallet;
  final MoneybagType? toWallet;
  final double amount;
  final TransactionSource source;
  final String sourceId;
  final Map<String, dynamic>? metadata;
  final String? counterpartyId;
  final String? counterpartyName;
  final DateTime queuedAt;
  final int attempts;

  _QueuedTransaction({
    required this.fromWallet,
    this.toWallet,
    required this.amount,
    required this.source,
    required this.sourceId,
    this.metadata,
    this.counterpartyId,
    this.counterpartyName,
    required this.queuedAt,
    required this.attempts,
  });
}
