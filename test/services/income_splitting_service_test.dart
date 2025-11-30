import 'package:flutter_test/flutter_test.dart';
import 'package:rizik_v4/services/income_splitting_service.dart';
import 'package:rizik_v4/models/squad.dart';

void main() {
  group('IncomeSplittingService', () {
    late Squad testSquad;
    final member1 = SquadMember(
      userId: 'u1',
      name: 'Leader',
      role: SquadRole.leader,
      joinDate: DateTime.now(),
      contributionPercentage: 0,
      completedTasks: 10,
    );
    final member2 = SquadMember(
      userId: 'u2',
      name: 'Chef',
      role: SquadRole.chef,
      joinDate: DateTime.now(),
      contributionPercentage: 0,
      completedTasks: 5,
    );
    final member3 = SquadMember(
      userId: 'u3',
      name: 'Helper',
      role: SquadRole.helper,
      joinDate: DateTime.now(),
      contributionPercentage: 0,
      completedTasks: 0,
    );

    setUp(() {
      testSquad = Squad(
        id: 's1',
        name: 'Test Squad',
        nameBn: 'Test',
        type: SquadType.maker,
        members: [member1, member2, member3],
        walletId: 'w1',
        createdAt: DateTime.now(),
        lastUpdated: DateTime.now(),
      );
    });

    test('calculateDynamicDistribution sums to 100%', () {
      final distribution = IncomeSplittingService.calculateDynamicDistribution(
        squad: testSquad,
        totalAmount: 1000,
      );

      final total = distribution.values.fold(0.0, (sum, val) => sum + val);
      expect((total - 100.0).abs() < 0.01, true);
    });

    test('Member with 0 tasks still gets share (Role + Equality)', () {
      final distribution = IncomeSplittingService.calculateDynamicDistribution(
        squad: testSquad,
        totalAmount: 1000,
      );

      expect(distribution['u3']! > 0, true);
    });

    test('Higher performance yields higher share', () {
      final distribution = IncomeSplittingService.calculateDynamicDistribution(
        squad: testSquad,
        totalAmount: 1000,
      );

      // Leader (10 tasks) vs Chef (5 tasks)
      // Leader role weight (40) vs Chef role weight (45) in Maker squad
      // But Leader has double tasks.
      // Let's check if logic holds.
      
      // Role points: Leader=40, Chef=45, Helper=20. Total=105.
      // Role share (50%):
      // L: (40/105)*50 = 19.04
      // C: (45/105)*50 = 21.42
      // H: (20/105)*50 = 9.52
      
      // Task points: L=10, C=5, H=0. Total=15.
      // Task share (30%):
      // L: (10/15)*30 = 20.0
      // C: (5/15)*30 = 10.0
      // H: 0
      
      // Equality share (20%):
      // All: 20/3 = 6.66
      
      // Total:
      // L: 19.04 + 20.0 + 6.66 = 45.7
      // C: 21.42 + 10.0 + 6.66 = 38.08
      // H: 9.52 + 0 + 6.66 = 16.18
      
      expect(distribution['u1']! > distribution['u2']!, true);
      expect(distribution['u2']! > distribution['u3']!, true);
    });
  });
}
