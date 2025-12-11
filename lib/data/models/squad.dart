import 'package:flutter/foundation.dart';

/// Types of squads
enum SquadType {
  maker('maker', 'মেকার'),
  mover('mover', 'মুভার'),
  family('family', 'পরিবার');

  const SquadType(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Squad member roles
enum SquadRole {
  leader('leader', 'লিডার'),
  chef('chef', 'শেফ'),
  buyer('buyer', 'ক্রেতা'),
  cutter('cutter', 'কাটার'),
  driver('driver', 'ড্রাইভার'),
  helper('helper', 'সাহায্যকারী'),
  member('member', 'সদস্য');

  const SquadRole(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Kitchen Capacity Status
enum CapacityStatus {
  open('OPEN', 'খোলা'),
  busy('BUSY', 'ব্যস্ত'),
  full('FULL', 'পূর্ণ');

  const CapacityStatus(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Squad member model
@immutable
class SquadMember {
  final String userId;
  final String name;
  final SquadRole role;
  final DateTime joinDate;
  final double contributionPercentage;
  final double totalEarnings;
  final int completedTasks;
  final bool isActive;

  const SquadMember({
    required this.userId,
    required this.name,
    required this.role,
    required this.joinDate,
    required this.contributionPercentage,
    this.totalEarnings = 0.0,
    this.completedTasks = 0,
    this.isActive = true,
  });

  SquadMember copyWith({
    String? userId,
    String? name,
    SquadRole? role,
    DateTime? joinDate,
    double? contributionPercentage,
    double? totalEarnings,
    int? completedTasks,
    bool? isActive,
  }) {
    return SquadMember(
      userId: userId ?? this.userId,
      name: name ?? this.name,
      role: role ?? this.role,
      joinDate: joinDate ?? this.joinDate,
      contributionPercentage:
          contributionPercentage ?? this.contributionPercentage,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      completedTasks: completedTasks ?? this.completedTasks,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'role': role.key,
      'join_date': joinDate.toIso8601String(),
      'contribution_percentage': contributionPercentage,
      'total_earnings': totalEarnings,
      'completed_tasks': completedTasks,
      'is_active': isActive,
    };
  }

  factory SquadMember.fromJson(Map<String, dynamic> json) {
    return SquadMember(
      userId: json['user_id'] as String,
      name: json['name'] as String,
      role: SquadRole.values.firstWhere(
        (r) => r.key == json['role'],
        orElse: () => SquadRole.member,
      ),
      joinDate: DateTime.parse(json['join_date'] as String),
      contributionPercentage:
          (json['contribution_percentage'] as num).toDouble(),
      totalEarnings: (json['total_earnings'] as num?)?.toDouble() ?? 0.0,
      completedTasks: (json['completed_tasks'] as int?) ?? 0,
      isActive: (json['is_active'] as bool?) ?? true,
    );
  }
}

/// Shared wallet transaction
class WalletTransaction {
  final String id;
  final double amount;
  final String type; // contribution, withdrawal, earning, expense
  final String? memberId;
  final String? description;
  final DateTime timestamp;
  final bool requiresApproval;
  final List<String> approvedBy;

  const WalletTransaction({
    required this.id,
    required this.amount,
    required this.type,
    this.memberId,
    this.description,
    required this.timestamp,
    this.requiresApproval = false,
    this.approvedBy = const [],
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'type': type,
      'member_id': memberId,
      'description': description,
      'timestamp': timestamp.toIso8601String(),
      'requires_approval': requiresApproval,
      'approved_by': approvedBy,
    };
  }

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] as String,
      memberId: json['member_id'] as String?,
      description: json['description'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
      requiresApproval: (json['requires_approval'] as bool?) ?? false,
      approvedBy: (json['approved_by'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

/// Shared wallet model
@immutable
class SharedWallet {
  final String id;
  final String? squadId; // Added to link back to squad
  final double balance;
  final double lockedFunds; // For rent, utilities
  final List<WalletTransaction> transactions;
  final DateTime lastUpdated;

  // Computed property for member contributions derived from transactions
  Map<String, double> get memberContributions {
    final contributions = <String, double>{};
    for (var txn in transactions) {
      if (txn.type == 'deposit' && txn.memberId != null) {
        contributions[txn.memberId!] = (contributions[txn.memberId!] ?? 0.0) + txn.amount;
      }
    }
    return contributions;
  }

  const SharedWallet({
    required this.id,
    this.squadId,
    required this.balance,
    this.lockedFunds = 0.0,
    required this.transactions,
    required this.lastUpdated,
  });

  double get availableBalance => balance - lockedFunds;

  double getMemberContribution(String userId) {
    return memberContributions[userId] ?? 0.0;
  }

  SharedWallet copyWith({
    String? id,
    String? squadId,
    double? balance,
    double? lockedFunds,
    List<WalletTransaction>? transactions,
    DateTime? lastUpdated,
  }) {
    return SharedWallet(
      id: id ?? this.id,
      squadId: squadId ?? this.squadId,
      balance: balance ?? this.balance,
      lockedFunds: lockedFunds ?? this.lockedFunds,
      transactions: transactions ?? this.transactions,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'owner_squad_id': squadId,
      'balance': balance,
      'locked_funds': lockedFunds,
      // Transactions are usually fetched separately, but keeping for compatibility if needed
      'transactions': transactions.map((t) => t.toJson()).toList(),
      'updated_at': lastUpdated.toIso8601String(),
    };
  }

  factory SharedWallet.fromJson(Map<String, dynamic> json) {
    return SharedWallet(
      id: json['id'] as String,
      squadId: json['owner_squad_id'] as String?,
      balance: (json['balance'] as num).toDouble(),
      lockedFunds: (json['locked_funds'] as num?)?.toDouble() ?? 0.0,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((t) => WalletTransaction.fromJson(t as Map<String, dynamic>))
              .toList() ??
          [],
      lastUpdated: DateTime.parse(json['updated_at'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  factory SharedWallet.create(String squadId) {
    final now = DateTime.now();
    return SharedWallet(
      id: 'wallet_$squadId', // Temporary ID, DB will generate UUID
      squadId: squadId,
      balance: 0.0,
      lockedFunds: 0.0,
      transactions: [],
      lastUpdated: now,
    );
  }

  /// Empty wallet for fallback
  factory SharedWallet.empty() {
    return SharedWallet(
      id: '',
      balance: 0.0,
      lockedFunds: 0.0,
      transactions: [],
      lastUpdated: DateTime.now(),
    );
  }
}

/// Main Squad model
@immutable
class Squad {
  final String id;
  final String name;
  final String nameBn;
  final SquadType type;
  final List<SquadMember> members;
  final String walletId; // New field matching schema
  final SharedWallet? wallet; // Made nullable as it might not be fetched
  final String? rosterId; // Reference to duty roster
  final String? rentLedgerId; // Reference to rent khata
  final double trustScore; // New field
  final DateTime createdAt;
  final DateTime lastUpdated;

  final Map<String, dynamic>? metadata;
  final CapacityStatus capacityStatus;
  final int maxOrderCapacity;

  const Squad({
    required this.id,
    required this.name,
    required this.nameBn,
    required this.type,
    required this.members,
    required this.walletId,
    this.wallet,
    this.rosterId,
    this.rentLedgerId,
    this.trustScore = 50.0,
    required this.createdAt,
    required this.lastUpdated,

    this.metadata,
    this.capacityStatus = CapacityStatus.open,
    this.maxOrderCapacity = 20,
  });

  /// Get safe wallet (returns empty if null)
  SharedWallet get safeWallet => wallet ?? SharedWallet.empty();

  /// Get squad leader
  SquadMember? get leader {
    try {
      return members.firstWhere((m) => m.role == SquadRole.leader);
    } catch (e) {
      return null;
    }
  }

  /// Get active members count
  int get activeMembersCount {
    return members.where((m) => m.isActive).length;
  }

  /// Get total squad earnings
  double get totalEarnings {
    return members.fold(0.0, (sum, member) => sum + member.totalEarnings);
  }

  /// Check if user is member
  bool isMember(String userId) {
    return members.any((m) => m.userId == userId && m.isActive);
  }

  /// Check if user is leader
  bool isLeader(String userId) {
    return leader?.userId == userId;
  }

  Squad copyWith({
    String? id,
    String? name,
    String? nameBn,
    SquadType? type,
    List<SquadMember>? members,
    String? walletId,
    SharedWallet? wallet,
    String? rosterId,
    String? rentLedgerId,
    double? trustScore,
    DateTime? createdAt,
    DateTime? lastUpdated,
    Map<String, dynamic>? metadata,
    CapacityStatus? capacityStatus,
    int? maxOrderCapacity,
  }) {
    return Squad(
      id: id ?? this.id,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      type: type ?? this.type,
      members: members ?? this.members,
      walletId: walletId ?? this.walletId,
      wallet: wallet ?? this.wallet,
      rosterId: rosterId ?? this.rosterId,
      rentLedgerId: rentLedgerId ?? this.rentLedgerId,
      trustScore: trustScore ?? this.trustScore,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      metadata: metadata ?? this.metadata,
      capacityStatus: capacityStatus ?? this.capacityStatus,
      maxOrderCapacity: maxOrderCapacity ?? this.maxOrderCapacity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'type': type.key,
      'members': members.map((m) => m.toJson()).toList(), // Note: Members usually in separate table
      'wallet_id': walletId,
      'trust_score': trustScore,
      'roster_id': rosterId,
      'rent_ledger_id': rentLedgerId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': lastUpdated.toIso8601String(),
      'metadata': metadata,
      'capacity_status': capacityStatus.key,
      'max_order_capacity': maxOrderCapacity,
    };
  }

  factory Squad.fromJson(Map<String, dynamic> json) {
    // Handle nested wallet if present
    SharedWallet? loadedWallet;
    if (json['wallet'] != null) {
      if (json['wallet'] is Map<String, dynamic>) {
        loadedWallet = SharedWallet.fromJson(json['wallet']);
      }
    }

    return Squad(
      id: json['id'] as String,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String? ?? json['name'] as String, // Fallback
      type: SquadType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => SquadType.family,
      ),
      // Handle members if present, otherwise empty list
      members: (json['members'] as List<dynamic>?)
              ?.map((m) => SquadMember.fromJson(m as Map<String, dynamic>))
              .toList() ??
          [],
      walletId: json['wallet_id'] as String? ?? '', // Should be present
      wallet: loadedWallet,
      rosterId: json['roster_id'] as String?,
      rentLedgerId: json['rent_ledger_id'] as String?,
      trustScore: (json['trust_score'] as num?)?.toDouble() ?? 50.0,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastUpdated: DateTime.parse(json['updated_at'] ?? json['last_updated'] ?? DateTime.now().toIso8601String()),
      metadata: json['metadata'] as Map<String, dynamic>?,
      capacityStatus: CapacityStatus.values.firstWhere(
        (e) => e.key == (json['capacity_status'] ?? 'OPEN'),
        orElse: () => CapacityStatus.open,
      ),
      maxOrderCapacity: (json['max_order_capacity'] as int?) ?? 20,
    );
  }

  /// Create a new squad
  factory Squad.create({
    required String name,
    required String nameBn,
    required SquadType type,
    required SquadMember leader,
  }) {
    final now = DateTime.now();
    final squadId = 'squad_${now.millisecondsSinceEpoch}';
    final walletId = 'wallet_$squadId';

    return Squad(
      id: squadId,
      name: name,
      nameBn: nameBn,
      type: type,
      members: [leader],
      walletId: walletId,
      wallet: SharedWallet.create(squadId),
      createdAt: now,
      lastUpdated: now,
    );
  }
}
