import 'package:flutter_test/flutter_test.dart';
import 'package:faker/faker.dart';
import 'package:rizik_v4/data/remote/moneybag_transaction_orchestrator.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';

/// Property-Based Tests for Moneybag Transaction Orchestrator
/// 
/// These tests validate correctness properties across many random inputs
/// to ensure the system behaves correctly in all scenarios.

void main() {
  group('Moneybag Transaction Orchestrator - Property Tests', () {
    late MoneybagTransactionOrchestrator orchestrator;
    final faker = Faker();

    setUp(() {
      // Initialize orchestrator without KhataProvider for isolated testing
      orchestrator = MoneybagTransactionOrchestrator();
      
      // Initialize with some balance
      orchestrator.initializeBalances({
        MoneybagType.personal: 10000.0,
        MoneybagType.partner: 5000.0,
        MoneybagType.rider: 3000.0,
        MoneybagType.escrow: 50000.0,
      });
    });

    /// **Feature: full-app-360-integration, Property 2: Social Ledger Expense Sync**
    /// **Validates: Requirements 2.1, 2.2, 2.3**
    /// 
    /// Property: For any Social Ledger transaction, when executed successfully,
    /// the fromUser's balance must decrease by the exact amount and a Khata entry
    /// must be created (when KhataProvider is available).
    test('Property 2: Social Ledger transaction reduces balance correctly', () async {
      // Run property test with 100 iterations
      for (int i = 0; i < 100; i++) {
        // Generate random test data
        final amount = faker.randomGenerator.decimal(scale: 100, min: 1);
        final fromUserId = faker.guid.guid();
        final toUserId = faker.guid.guid();
        final description = faker.lorem.sentence();
        final socialLedgerEntryId = 'sl_${faker.guid.guid()}';

        // Get initial balance
        final initialBalance = orchestrator.getBalance(MoneybagType.personal);

        // Ensure we have enough balance
        if (initialBalance < amount) {
          orchestrator.initializeBalances({
            MoneybagType.personal: amount + 1000,
            MoneybagType.partner: 5000.0,
            MoneybagType.rider: 3000.0,
            MoneybagType.escrow: 50000.0,
          });
        }

        // Execute Social Ledger transaction
        final result = await orchestrator.executeSocialLedgerTransaction(
          socialLedgerEntryId: socialLedgerEntryId,
          fromUserId: fromUserId,
          toUserId: toUserId,
          amount: amount,
          description: description,
        );

        // Property: Transaction must succeed
        expect(result.success, isTrue,
            reason: 'Social Ledger transaction should succeed with sufficient balance');

        // Property: Balance must decrease by exact amount
        final finalBalance = orchestrator.getBalance(MoneybagType.personal);
        final expectedBalance = initialBalance - amount;
        expect(finalBalance, closeTo(expectedBalance, 0.01),
            reason: 'Balance should decrease by exactly the transaction amount');

        // Property: Transaction metadata must contain correct information
        expect(result.metadata?['social_ledger_entry_id'], equals(socialLedgerEntryId));
        expect(result.metadata?['from_user_id'], equals(fromUserId));
        expect(result.metadata?['to_user_id'], equals(toUserId));
        expect(result.metadata?['amount'], equals(amount));
      }
    });

    /// **Feature: full-app-360-integration, Property 3: Video Monetization Calculation Accuracy**
    /// **Validates: Requirement 4.5**
    /// 
    /// Property: For any video with N views and M orders, the creator earnings
    /// must equal (N/1000 * viewRate) + (orderValue * commissionRate) within
    /// acceptable rounding error.
    test('Property 3: Video monetization calculates earnings correctly', () async {
      // Run property test with 100 iterations
      for (int i = 0; i < 100; i++) {
        // Generate random test data
        final videoId = 'video_${faker.guid.guid()}';
        final creatorId = faker.guid.guid();
        final viewCount = faker.randomGenerator.integer(10000, min: 100);
        final orderCount = faker.randomGenerator.integer(50, min: 0);
        final totalOrderValue = faker.randomGenerator.decimal(scale: 5000, min: 0);
        final viewMonetizationRate = faker.randomGenerator.decimal(scale: 50, min: 20);
        final commissionRate = faker.randomGenerator.decimal(scale: 0.20, min: 0.10);

        // Calculate expected earnings
        final expectedViewEarnings = (viewCount / 1000) * viewMonetizationRate;
        final expectedCommissionEarnings = totalOrderValue * commissionRate;
        final expectedTotalPayout = expectedViewEarnings + expectedCommissionEarnings;

        // Ensure escrow has enough balance for payout
        orchestrator.initializeBalances({
          MoneybagType.personal: 1000.0,
          MoneybagType.partner: 5000.0,
          MoneybagType.rider: 3000.0,
          MoneybagType.escrow: expectedTotalPayout + 10000.0, // Ensure enough for payout
        });

        // Get initial balance AFTER initialization
        final initialBalance = orchestrator.getBalance(MoneybagType.personal);

        // Execute video creator payout
        final result = await orchestrator.payoutVideoCreator(
          videoId: videoId,
          creatorId: creatorId,
          viewCount: viewCount,
          orderCount: orderCount,
          totalOrderValue: totalOrderValue,
          viewMonetizationRate: viewMonetizationRate,
          commissionRate: commissionRate,
          creatorWallet: MoneybagType.personal,
        );

        // Property: Transaction must succeed
        expect(result.success, isTrue,
            reason: 'Video creator payout should succeed');

        if (expectedTotalPayout > 0) {
          // Property: Metadata must contain correct calculation breakdown
          expect(result.metadata?['view_earnings'], isNotNull);
          expect(result.metadata?['commission_earnings'], isNotNull);
          expect(result.metadata?['total_payout'], isNotNull);
          // Property: Balance must increase by calculated payout amount
          final finalBalance = orchestrator.getBalance(MoneybagType.personal);
          final actualPayout = finalBalance - initialBalance;
          
          expect(actualPayout, closeTo(expectedTotalPayout, 0.01),
              reason: 'Payout amount should match calculated earnings');

          expect(result.metadata?['view_earnings'], closeTo(expectedViewEarnings, 0.01));
          expect(result.metadata?['commission_earnings'], closeTo(expectedCommissionEarnings, 0.01));
          expect(result.metadata?['total_payout'], closeTo(expectedTotalPayout, 0.01));
        } else {
          // When payout is 0, verify metadata shows 0 earnings
          expect(result.metadata?['view_earnings'], equals(0.0));
          expect(result.metadata?['commission_earnings'], equals(0.0));
          expect(result.metadata?['total_payout'], equals(0.0));
        }
      }
    });

    /// **Feature: full-app-360-integration, Property 7: C2C Escrow Safety**
    /// **Validates: Requirement 10.3**
    /// 
    /// Property: For any C2C marketplace transaction, payment must remain in
    /// escrow until explicitly released, and the buyer's balance must decrease
    /// by the exact amount.
    test('Property 7: C2C escrow holds payment safely', () async {
      // Run property test with 100 iterations
      for (int i = 0; i < 100; i++) {
        // Generate random test data
        final listingId = 'listing_${faker.guid.guid()}';
        final buyerId = faker.guid.guid();
        final sellerId = faker.guid.guid();
        final amount = faker.randomGenerator.decimal(scale: 1000, min: 10);
        final itemDescription = faker.lorem.sentence();

        // Get initial balances
        final initialBuyerBalance = orchestrator.getBalance(MoneybagType.personal);
        final initialEscrowBalance = orchestrator.getBalance(MoneybagType.escrow);

        // Ensure buyer has enough balance
        if (initialBuyerBalance < amount) {
          orchestrator.initializeBalances({
            MoneybagType.personal: amount + 1000,
            MoneybagType.partner: 5000.0,
            MoneybagType.rider: 3000.0,
            MoneybagType.escrow: initialEscrowBalance,
          });
        }

        // Execute C2C transaction (payment to escrow)
        final escrowResult = await orchestrator.executeC2CTransaction(
          listingId: listingId,
          buyerId: buyerId,
          sellerId: sellerId,
          amount: amount,
          itemDescription: itemDescription,
        );

        // Property: Escrow transaction must succeed
        expect(escrowResult.success, isTrue,
            reason: 'C2C escrow transaction should succeed with sufficient balance');

        // Property: Buyer balance must decrease by exact amount
        final buyerBalanceAfterEscrow = orchestrator.getBalance(MoneybagType.personal);
        expect(buyerBalanceAfterEscrow, closeTo(initialBuyerBalance - amount, 0.01),
            reason: 'Buyer balance should decrease by transaction amount');

        // Property: Escrow balance must increase by exact amount
        final escrowBalanceAfterPayment = orchestrator.getBalance(MoneybagType.escrow);
        expect(escrowBalanceAfterPayment, closeTo(initialEscrowBalance + amount, 0.01),
            reason: 'Escrow balance should increase by transaction amount');

        // Now release escrow to seller
        final releaseResult = await orchestrator.releaseC2CEscrow(
          listingId: listingId,
          sellerId: sellerId,
          amount: amount,
        );

        // Property: Release must succeed
        expect(releaseResult.success, isTrue,
            reason: 'Escrow release should succeed');

        // Property: Escrow balance must decrease back to original
        final escrowBalanceAfterRelease = orchestrator.getBalance(MoneybagType.escrow);
        expect(escrowBalanceAfterRelease, closeTo(initialEscrowBalance, 0.01),
            reason: 'Escrow balance should return to original after release');
      }
    });

    /// **Feature: full-app-360-integration, Property 8: Squad Payment Splitting**
    /// **Validates: Requirements 11.2, 11.3**
    /// 
    /// Property: For any Squad payment, when split equally among N members,
    /// each member's share must equal totalAmount / N, and the sum of all
    /// shares must equal the total amount.
    test('Property 8: Squad payment splits correctly', () async {
      // Run property test with 100 iterations
      for (int i = 0; i < 100; i++) {
        // Generate random test data
        final squadId = 'squad_${faker.guid.guid()}';
        final amount = faker.randomGenerator.decimal(scale: 1000, min: 10);
        final sourceId = 'order_${faker.guid.guid()}';
        final memberCount = faker.randomGenerator.integer(10, min: 2);
        final squadMemberIds = List.generate(
          memberCount,
          (index) => faker.guid.guid(),
        );

        // Ensure we have enough balance
        orchestrator.initializeBalances({
          MoneybagType.personal: amount + 1000,
          MoneybagType.partner: 5000.0,
          MoneybagType.rider: 3000.0,
          MoneybagType.escrow: 50000.0,
        });

        // Get initial balance AFTER initialization
        final initialBalance = orchestrator.getBalance(MoneybagType.personal);

        // Execute Squad payment with equal split
        final result = await orchestrator.handleSquadPayment(
          squadId: squadId,
          amount: amount,
          sourceId: sourceId,
          source: TransactionSource.order,
          squadMemberIds: squadMemberIds,
          splitEqually: true,
        );

        // Property: Transaction must succeed
        expect(result.success, isTrue,
            reason: 'Squad payment should succeed with sufficient balance');

        // Property: Each member's share must be equal
        final expectedPerMemberShare = amount / memberCount;
        final splits = result.metadata?['splits'] as Map<String, double>?;
        
        if (splits != null) {
          for (var share in splits.values) {
            expect(share, closeTo(expectedPerMemberShare, 0.01),
                reason: 'Each member should have equal share');
          }

          // Property: Sum of all shares must equal total amount
          final totalSplits = splits.values.fold(0.0, (sum, share) => sum + share);
          expect(totalSplits, closeTo(amount, 0.01),
              reason: 'Sum of all shares should equal total amount');
        }

        // Property: Balance must decrease by exact amount
        final finalBalance = orchestrator.getBalance(MoneybagType.personal);
        expect(finalBalance, closeTo(initialBalance - amount, 0.01),
            reason: 'Balance should decrease by total payment amount');
      }
    });
  });
}
