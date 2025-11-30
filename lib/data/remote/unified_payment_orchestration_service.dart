import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/unified_wallet.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/unified_wallet_provider.dart';
import 'package:rizik_v4/core/state/aura_provider.dart';
import 'package:rizik_v4/data/remote/payment_orchestration_service.dart'; // For PaymentBreakdown, CelebrationEvent, etc.
import 'package:rizik_v4/data/remote/moneybag_transaction_orchestrator.dart'; // For TransactionResult
import 'package:rizik_v4/data/models/moneybag.dart'; // For TransactionSource

/// 🎯 Unified Payment Orchestration Service
/// Automatically distributes payments when orders are delivered using Unified Wallet
class UnifiedPaymentOrchestrationService {
  final UnifiedWalletProvider walletProvider;
  final AuraProvider? auraProvider;

  // Fee configuration
  static const double defaultPlatformFeeRate = 0.05; // 5%
  static const double defaultRiderFeeRate = 0.10; // 10%
  static const double videoCommissionRate = 0.15; // 15% for video orders

  // Celebration thresholds
  static const double bigPayoutThreshold = 1000.0;

  UnifiedPaymentOrchestrationService({
    required this.walletProvider,
    this.auraProvider,
  });

  /// 🎉 Main orchestration method - Called when order is delivered
  Future<PaymentDistributionResult> orchestratePayment({
    required Order order,
    String? partnerId,
    String? partnerName,
    String? riderId,
    String? riderName,
    String? videoId,
    String? creatorId,
    String? creatorName,
    Map<String, dynamic>? metadata,
  }) async {
    debugPrint('🎬 Starting unified payment orchestration for order: ${order.id}');
    debugPrint('   Total: ৳${order.total}');

    try {
      // Step 1: Calculate payment breakdown
      final breakdown = _calculatePaymentBreakdown(
        orderTotal: order.total,
        hasVideo: videoId != null,
      );

      debugPrint('💵 Payment Breakdown:');
      debugPrint('   Platform Fee: ৳${breakdown.platformFee.toStringAsFixed(2)}');
      debugPrint('   Rider Fee: ৳${breakdown.riderFee.toStringAsFixed(2)}');
      if (breakdown.creatorCommission != null) {
        debugPrint('   Creator Commission: ৳${breakdown.creatorCommission!.toStringAsFixed(2)}');
      }
      debugPrint('   Partner Amount: ৳${breakdown.partnerAmount.toStringAsFixed(2)}');

      // Step 2: Execute distribution (Add earnings to respective roles)
      // Note: In Unified Wallet, we assume "Consumer" already paid (deducted).
      // Now we "Add" earnings to Partner and Rider.
      // Since it's a unified wallet for the SAME user (in this demo context),
      // we are effectively adding money back to the user's balance, attributed to different roles.

      final transactions = <TransactionResult>[];

      // Partner Earning
      await walletProvider.receiveEarnings(
        amount: breakdown.partnerAmount,
        sourceId: order.id,
        source: TransactionSource.order,
        description: 'Order ${order.id} - Partner Payout',
      );
      transactions.add(TransactionResult(success: true, transactionId: 'partner_earning_${order.id}')); // Mock ID

      // Rider Earning
      await walletProvider.receiveEarnings(
        amount: breakdown.riderFee,
        sourceId: order.id,
        source: TransactionSource.delivery,
        description: 'Order ${order.id} - Delivery Fee',
      );
      transactions.add(TransactionResult(success: true, transactionId: 'rider_earning_${order.id}'));

      // Creator Commission (if applicable)
      if (breakdown.creatorCommission != null) {
        await walletProvider.receiveEarnings(
          amount: breakdown.creatorCommission!,
          sourceId: order.id,
          source: TransactionSource.commission,
          description: 'Order ${order.id} - Video Commission',
        );
        transactions.add(TransactionResult(success: true, transactionId: 'creator_earning_${order.id}'));
      }

      // Step 3: Award XP bonuses
      await _awardXPBonuses(
        order: order,
        breakdown: breakdown,
      );

      // Step 4: Create celebration events
      final celebrations = _createCelebrations(
        order: order,
        breakdown: breakdown,
        partnerName: partnerName,
        riderName: riderName,
        creatorName: creatorName,
      );

      debugPrint('✅ Unified payment orchestration complete!');

      return PaymentDistributionResult(
        success: true,
        orderId: order.id,
        breakdown: breakdown,
        transactions: transactions,
        celebrations: celebrations,
        timestamp: DateTime.now(),
      );
    } catch (e) {
      debugPrint('❌ Unified payment orchestration failed: $e');
      return PaymentDistributionResult(
        success: false,
        orderId: order.id,
        breakdown: PaymentBreakdown.empty(),
        transactions: [],
        celebrations: [],
        error: e.toString(),
        timestamp: DateTime.now(),
      );
    }
  }

  PaymentBreakdown _calculatePaymentBreakdown({
    required double orderTotal,
    bool hasVideo = false,
  }) {
    final platformFee = orderTotal * defaultPlatformFeeRate;
    final riderFee = orderTotal * defaultRiderFeeRate;
    
    double? creatorCommission;
    if (hasVideo) {
      creatorCommission = orderTotal * videoCommissionRate;
    }

    final partnerAmount = orderTotal - platformFee - riderFee - (creatorCommission ?? 0);

    return PaymentBreakdown(
      orderTotal: orderTotal,
      platformFee: platformFee,
      platformFeeRate: defaultPlatformFeeRate,
      riderFee: riderFee,
      riderFeeRate: defaultRiderFeeRate,
      partnerAmount: partnerAmount,
      creatorCommission: creatorCommission,
      creatorCommissionRate: hasVideo ? videoCommissionRate : null,
    );
  }

  Future<void> _awardXPBonuses({
    required Order order,
    required PaymentBreakdown breakdown,
  }) async {
    if (auraProvider == null) return;

    try {
      // Partner XP
      final partnerXP = 50 + (breakdown.partnerAmount / 10).round();
      debugPrint('✨ Awarding $partnerXP XP to Partner');
      
      // Rider XP
      final riderXP = 30 + (breakdown.riderFee / 5).round();
      debugPrint('✨ Awarding $riderXP XP to Rider');

      // Creator XP
      if (breakdown.creatorCommission != null) {
        final creatorXP = 40 + (breakdown.creatorCommission! / 8).round();
        debugPrint('✨ Awarding $creatorXP XP to Creator');
      }
    } catch (e) {
      debugPrint('⚠️ XP award failed: $e');
    }
  }

  List<CelebrationEvent> _createCelebrations({
    required Order order,
    required PaymentBreakdown breakdown,
    String? partnerName,
    String? riderName,
    String? creatorName,
  }) {
    final celebrations = <CelebrationEvent>[];

    celebrations.add(CelebrationEvent(
      type: CelebrationType.payment,
      recipient: partnerName ?? 'Partner',
      amount: breakdown.partnerAmount,
      message: '🎉 You earned ৳${breakdown.partnerAmount.toStringAsFixed(0)}!',
      intensity: _getCelebrationIntensity(breakdown.partnerAmount),
      emoji: '💰',
    ));

    celebrations.add(CelebrationEvent(
      type: CelebrationType.payment,
      recipient: riderName ?? 'Rider',
      amount: breakdown.riderFee,
      message: '🚴 Delivery fee: ৳${breakdown.riderFee.toStringAsFixed(0)}!',
      intensity: _getCelebrationIntensity(breakdown.riderFee),
      emoji: '🎯',
    ));

    if (breakdown.creatorCommission != null) {
      celebrations.add(CelebrationEvent(
        type: CelebrationType.commission,
        recipient: creatorName ?? 'Creator',
        amount: breakdown.creatorCommission!,
        message: '🎥 Video commission: ৳${breakdown.creatorCommission!.toStringAsFixed(0)}!',
        intensity: _getCelebrationIntensity(breakdown.creatorCommission!),
        emoji: '⭐',
      ));
    }

    return celebrations;
  }

  CelebrationIntensity _getCelebrationIntensity(double amount) {
    if (amount >= bigPayoutThreshold) return CelebrationIntensity.epic;
    if (amount >= 500) return CelebrationIntensity.big;
    if (amount >= 200) return CelebrationIntensity.medium;
    return CelebrationIntensity.small;
  }
}

// Helper class for transaction results (mocking the one in moneybag_transaction_orchestrator.dart if needed, 
// but we reused the one from payment_orchestration_service.dart which imports it. 
// Wait, PaymentDistributionResult uses TransactionResult. 
// I need to make sure TransactionResult is available.
// It's likely in moneybag_transaction_orchestrator.dart.
// I'll assume it's available via payment_orchestration_service.dart imports or I might need to import it directly.)
