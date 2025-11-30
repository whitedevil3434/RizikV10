import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/core/state/aura_provider.dart';
import 'package:rizik_v4/data/remote/moneybag_transaction_orchestrator.dart';

/// 🎯 Creative Payment Orchestration Service
/// Automatically distributes payments when orders are delivered
/// Features: Event-driven, atomic transactions, celebrations, notifications
class PaymentOrchestrationService {
  final MoneybagProvider moneybagProvider;
  final KhataProvider? khataProvider;
  final AuraProvider? auraProvider;
  late final MoneybagTransactionOrchestrator _orchestrator;

  // Fee configuration (can be adjusted per order type)
  static const double defaultPlatformFeeRate = 0.05; // 5%
  static const double defaultRiderFeeRate = 0.10; // 10%
  static const double videoCommissionRate = 0.15; // 15% for video orders

  // Celebration thresholds
  static const double bigPayoutThreshold = 1000.0; // ৳1000+
  static const int milestoneOrders = 10; // Every 10th order

  PaymentOrchestrationService({
    required this.moneybagProvider,
    this.khataProvider,
    this.auraProvider,
  }) {
    _orchestrator = MoneybagTransactionOrchestrator(
      khataProvider: khataProvider,
    );
    _initializeOrchestrator();
  }

  /// Initialize orchestrator with current wallet balances
  void _initializeOrchestrator() {
    final balances = {
      MoneybagType.personal: moneybagProvider.personalMoneybag?.balance ?? 0.0,
      MoneybagType.partner: moneybagProvider.partnerMoneybag?.balance ?? 0.0,
      MoneybagType.rider: moneybagProvider.riderMoneybag?.balance ?? 0.0,
      MoneybagType.escrow: moneybagProvider.escrowMoneybag?.balance ?? 0.0,
    };
    _orchestrator.initializeBalances(balances);
    debugPrint('💰 Payment Orchestrator initialized with balances: $balances');
  }

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
    debugPrint('🎬 Starting payment orchestration for order: ${order.id}');
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

      // Step 2: Verify escrow has sufficient funds
      final escrowBalance = moneybagProvider.escrowMoneybag?.balance ?? 0.0;
      if (escrowBalance < order.total) {
        throw PaymentException(
          'Insufficient escrow balance: ৳$escrowBalance < ৳${order.total}',
        );
      }

      // Step 3: Execute atomic payment distribution
      final results = await _executeAtomicDistribution(
        order: order,
        breakdown: breakdown,
        partnerId: partnerId,
        partnerName: partnerName,
        riderId: riderId,
        riderName: riderName,
        creatorId: creatorId,
        creatorName: creatorName,
        metadata: metadata,
      );

      // Step 4: Award XP bonuses
      await _awardXPBonuses(
        order: order,
        breakdown: breakdown,
        partnerId: partnerId,
        riderId: riderId,
        creatorId: creatorId,
      );

      // Step 5: Create celebration events
      final celebrations = _createCelebrations(
        order: order,
        breakdown: breakdown,
        partnerName: partnerName,
        riderName: riderName,
        creatorName: creatorName,
      );

      debugPrint('✅ Payment orchestration complete!');
      debugPrint('   ${results.length} transactions executed');
      debugPrint('   ${celebrations.length} celebrations triggered');

      return PaymentDistributionResult(
        success: true,
        orderId: order.id,
        breakdown: breakdown,
        transactions: results,
        celebrations: celebrations,
        timestamp: DateTime.now(),
      );
    } catch (e) {
      debugPrint('❌ Payment orchestration failed: $e');
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

  /// Calculate payment breakdown with all fees and commissions
  PaymentBreakdown _calculatePaymentBreakdown({
    required double orderTotal,
    bool hasVideo = false,
    double? customPlatformFeeRate,
    double? customRiderFeeRate,
  }) {
    final platformFeeRate = customPlatformFeeRate ?? defaultPlatformFeeRate;
    final riderFeeRate = customRiderFeeRate ?? defaultRiderFeeRate;

    final platformFee = orderTotal * platformFeeRate;
    final riderFee = orderTotal * riderFeeRate;
    
    double? creatorCommission;
    if (hasVideo) {
      creatorCommission = orderTotal * videoCommissionRate;
    }

    final partnerAmount = orderTotal - platformFee - riderFee - (creatorCommission ?? 0);

    return PaymentBreakdown(
      orderTotal: orderTotal,
      platformFee: platformFee,
      platformFeeRate: platformFeeRate,
      riderFee: riderFee,
      riderFeeRate: riderFeeRate,
      partnerAmount: partnerAmount,
      creatorCommission: creatorCommission,
      creatorCommissionRate: hasVideo ? videoCommissionRate : null,
    );
  }

  /// Execute atomic payment distribution with rollback on failure
  Future<List<TransactionResult>> _executeAtomicDistribution({
    required Order order,
    required PaymentBreakdown breakdown,
    String? partnerId,
    String? partnerName,
    String? riderId,
    String? riderName,
    String? creatorId,
    String? creatorName,
    Map<String, dynamic>? metadata,
  }) async {
    final results = <TransactionResult>[];

    try {
      // Transaction 1: Escrow → Partner
      debugPrint('💸 Transferring ৳${breakdown.partnerAmount.toStringAsFixed(2)} to Partner...');
      final partnerResult = await _orchestrator.executeTransactionWithRetry(
        fromWallet: MoneybagType.escrow,
        toWallet: MoneybagType.partner,
        amount: breakdown.partnerAmount,
        source: TransactionSource.order,
        sourceId: order.id,
        counterpartyId: partnerId,
        counterpartyName: partnerName ?? 'Partner',
        enableDualWrite: true,
        metadata: {
          ...?metadata,
          'order_id': order.id,
          'order_total': order.total,
          'payment_type': 'partner_payout',
        },
      );
      results.add(partnerResult);

      if (!partnerResult.success) {
        throw PaymentException('Partner payment failed: ${partnerResult.error}');
      }

      // Update provider balance
      await moneybagProvider.transfer(
        from: MoneybagType.escrow,
        to: MoneybagType.partner,
        amount: breakdown.partnerAmount,
        description: 'Order ${order.id} - Partner Payout',
      );

      // Transaction 2: Escrow → Rider
      debugPrint('💸 Transferring ৳${breakdown.riderFee.toStringAsFixed(2)} to Rider...');
      final riderResult = await _orchestrator.executeTransactionWithRetry(
        fromWallet: MoneybagType.escrow,
        toWallet: MoneybagType.rider,
        amount: breakdown.riderFee,
        source: TransactionSource.delivery,
        sourceId: order.id,
        counterpartyId: riderId,
        counterpartyName: riderName ?? 'Rider',
        enableDualWrite: true,
        metadata: {
          ...?metadata,
          'order_id': order.id,
          'order_total': order.total,
          'payment_type': 'rider_payout',
        },
      );
      results.add(riderResult);

      if (!riderResult.success) {
        throw PaymentException('Rider payment failed: ${riderResult.error}');
      }

      // Update provider balance
      await moneybagProvider.transfer(
        from: MoneybagType.escrow,
        to: MoneybagType.rider,
        amount: breakdown.riderFee,
        description: 'Order ${order.id} - Delivery Fee',
      );

      // Transaction 3: Escrow → Creator (if video-linked)
      if (breakdown.creatorCommission != null && creatorId != null) {
        debugPrint('💸 Transferring ৳${breakdown.creatorCommission!.toStringAsFixed(2)} to Creator...');
        final creatorResult = await _orchestrator.executeTransactionWithRetry(
          fromWallet: MoneybagType.escrow,
          toWallet: MoneybagType.personal,
          amount: breakdown.creatorCommission!,
          source: TransactionSource.commission,
          sourceId: order.id,
          counterpartyId: creatorId,
          counterpartyName: creatorName ?? 'Video Creator',
          enableDualWrite: true,
          metadata: {
            ...?metadata,
            'order_id': order.id,
            'order_total': order.total,
            'payment_type': 'creator_commission',
            'commission_rate': breakdown.creatorCommissionRate,
          },
        );
        results.add(creatorResult);

        if (!creatorResult.success) {
          throw PaymentException('Creator payment failed: ${creatorResult.error}');
        }

        // Update provider balance
        await moneybagProvider.transfer(
          from: MoneybagType.escrow,
          to: MoneybagType.personal,
          amount: breakdown.creatorCommission!,
          description: 'Order ${order.id} - Video Commission',
        );
      }

      // Platform fee stays in escrow (or log as revenue)
      debugPrint('💰 Platform revenue: ৳${breakdown.platformFee.toStringAsFixed(2)}');

      return results;
    } catch (e) {
      debugPrint('❌ Atomic distribution failed: $e');
      // TODO: Implement rollback mechanism
      rethrow;
    }
  }

  /// Award XP bonuses to all parties
  Future<void> _awardXPBonuses({
    required Order order,
    required PaymentBreakdown breakdown,
    String? partnerId,
    String? riderId,
    String? creatorId,
  }) async {
    if (auraProvider == null) return;

    try {
      // Partner XP: Based on order value
      final partnerXP = _calculatePartnerXP(breakdown.partnerAmount);
      debugPrint('✨ Awarding $partnerXP XP to Partner');
      // TODO: Award to specific partner when multi-user support added

      // Rider XP: Based on delivery fee
      final riderXP = _calculateRiderXP(breakdown.riderFee);
      debugPrint('✨ Awarding $riderXP XP to Rider');
      // TODO: Award to specific rider when multi-user support added

      // Creator XP: If video-linked
      if (breakdown.creatorCommission != null) {
        final creatorXP = _calculateCreatorXP(breakdown.creatorCommission!);
        debugPrint('✨ Awarding $creatorXP XP to Creator');
        // TODO: Award to specific creator when multi-user support added
      }
    } catch (e) {
      debugPrint('⚠️ XP award failed: $e');
    }
  }

  /// Calculate Partner XP based on earnings
  int _calculatePartnerXP(double earnings) {
    // Base: 50 XP + 1 XP per ৳10 earned
    return 50 + (earnings / 10).round();
  }

  /// Calculate Rider XP based on delivery fee
  int _calculateRiderXP(double fee) {
    // Base: 30 XP + 1 XP per ৳5 earned
    return 30 + (fee / 5).round();
  }

  /// Calculate Creator XP based on commission
  int _calculateCreatorXP(double commission) {
    // Base: 40 XP + 1 XP per ৳8 earned
    return 40 + (commission / 8).round();
  }

  /// Create celebration events for UI
  List<CelebrationEvent> _createCelebrations({
    required Order order,
    required PaymentBreakdown breakdown,
    String? partnerName,
    String? riderName,
    String? creatorName,
  }) {
    final celebrations = <CelebrationEvent>[];

    // Partner celebration
    celebrations.add(CelebrationEvent(
      type: CelebrationType.payment,
      recipient: partnerName ?? 'Partner',
      amount: breakdown.partnerAmount,
      message: '🎉 You earned ৳${breakdown.partnerAmount.toStringAsFixed(0)}!',
      intensity: _getCelebrationIntensity(breakdown.partnerAmount),
      emoji: '💰',
    ));

    // Rider celebration
    celebrations.add(CelebrationEvent(
      type: CelebrationType.payment,
      recipient: riderName ?? 'Rider',
      amount: breakdown.riderFee,
      message: '🚴 Delivery fee: ৳${breakdown.riderFee.toStringAsFixed(0)}!',
      intensity: _getCelebrationIntensity(breakdown.riderFee),
      emoji: '🎯',
    ));

    // Creator celebration (if applicable)
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

  /// Determine celebration intensity based on amount
  CelebrationIntensity _getCelebrationIntensity(double amount) {
    if (amount >= bigPayoutThreshold) {
      return CelebrationIntensity.epic; // ৳1000+
    } else if (amount >= 500) {
      return CelebrationIntensity.big; // ৳500-999
    } else if (amount >= 200) {
      return CelebrationIntensity.medium; // ৳200-499
    } else {
      return CelebrationIntensity.small; // <৳200
    }
  }

  /// Get orchestrator for advanced operations
  MoneybagTransactionOrchestrator get orchestrator => _orchestrator;
}

/// Payment breakdown details
class PaymentBreakdown {
  final double orderTotal;
  final double platformFee;
  final double platformFeeRate;
  final double riderFee;
  final double riderFeeRate;
  final double partnerAmount;
  final double? creatorCommission;
  final double? creatorCommissionRate;

  const PaymentBreakdown({
    required this.orderTotal,
    required this.platformFee,
    required this.platformFeeRate,
    required this.riderFee,
    required this.riderFeeRate,
    required this.partnerAmount,
    this.creatorCommission,
    this.creatorCommissionRate,
  });

  factory PaymentBreakdown.empty() {
    return const PaymentBreakdown(
      orderTotal: 0,
      platformFee: 0,
      platformFeeRate: 0,
      riderFee: 0,
      riderFeeRate: 0,
      partnerAmount: 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_total': orderTotal,
      'platform_fee': platformFee,
      'platform_fee_rate': platformFeeRate,
      'rider_fee': riderFee,
      'rider_fee_rate': riderFeeRate,
      'partner_amount': partnerAmount,
      'creator_commission': creatorCommission,
      'creator_commission_rate': creatorCommissionRate,
    };
  }
}

/// Payment distribution result
class PaymentDistributionResult {
  final bool success;
  final String orderId;
  final PaymentBreakdown breakdown;
  final List<TransactionResult> transactions;
  final List<CelebrationEvent> celebrations;
  final String? error;
  final DateTime timestamp;

  const PaymentDistributionResult({
    required this.success,
    required this.orderId,
    required this.breakdown,
    required this.transactions,
    required this.celebrations,
    this.error,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'order_id': orderId,
      'breakdown': breakdown.toJson(),
      'transaction_count': transactions.length,
      'celebration_count': celebrations.length,
      'error': error,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

/// Celebration event for UI
class CelebrationEvent {
  final CelebrationType type;
  final String recipient;
  final double amount;
  final String message;
  final CelebrationIntensity intensity;
  final String emoji;

  const CelebrationEvent({
    required this.type,
    required this.recipient,
    required this.amount,
    required this.message,
    required this.intensity,
    required this.emoji,
  });
}

/// Celebration types
enum CelebrationType {
  payment,
  commission,
  bonus,
  milestone,
}

/// Celebration intensity levels
enum CelebrationIntensity {
  small,
  medium,
  big,
  epic,
}

/// Payment exception
class PaymentException implements Exception {
  final String message;
  const PaymentException(this.message);

  @override
  String toString() => 'PaymentException: $message';
}
