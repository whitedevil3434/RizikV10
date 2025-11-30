import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rizik_v4/data/models/squad.dart';
import 'package:rizik_v4/data/models/user_profile.dart';

class SquadService {
  SupabaseClient get _client => Supabase.instance.client;

  /// Create a new squad
  Future<Squad> createSquad({
    required String name,
    required String nameBn,
    required SquadType type,
    required String creatorId,
  }) async {
    // 1. Create Squad
    final squadResponse = await _client
        .from('squads')
        .insert({
          'name': name,
          'name_bn': nameBn,
          'type': type.key,
          'created_by': creatorId,
        })
        .select()
        .single();

    final squadId = squadResponse['id'] as String;

    // 2. Add Creator as Leader
    await _client.from('squad_members').insert({
      'squad_id': squadId,
      'user_id': creatorId,
      'role': SquadRole.leader.key,
      'status': 'active',
      'joined_at': DateTime.now().toIso8601String(),
    });

    // 3. Create Squad Wallet (handled by database trigger usually, but doing manually if needed)
    // Assuming DB trigger handles wallet creation or we do it here.
    // For now, let's assume we need to create it if no trigger exists.
    // However, in our schema design, we might want a trigger.
    // Let's check if we defined a trigger. We didn't explicitly define a trigger in the SQL artifact for wallet creation on squad creation.
    // So we should create it here.

    final walletResponse = await _client
        .from('wallets')
        .insert({
          'type': 'squad',
          'squad_id': squadId,
          'balance': 0.0,
          'currency': 'BDT',
        })
        .select()
        .single();
    
    final walletId = walletResponse['id'] as String;

    // Update squad with wallet_id if needed (though schema has foreign key from wallet to squad, 
    // or squad to wallet? Schema says: squads has no wallet_id, wallets has squad_id.
    // So we are good.

    return await getSquadById(squadId);
  }

  /// Get squad by ID
  Future<Squad> getSquadById(String squadId) async {
    final response = await _client
        .from('squads')
        .select('''
          *,
          members:squad_members(
            *,
            profile:user_profiles(*)
          ),
          wallet:wallets(*)
        ''')
        .eq('id', squadId)
        .single();

    return _mapToSquad(response);
  }

  /// Get user's squads
  Future<List<Squad>> getUserSquads(String userId) async {
    // First get squad IDs where user is a member
    final memberResponse = await _client
        .from('squad_members')
        .select('squad_id')
        .eq('user_id', userId)
        .eq('status', 'active');

    final squadIds = (memberResponse as List)
        .map((m) => m['squad_id'] as String)
        .toList();

    if (squadIds.isEmpty) return [];

    final response = await _client
        .from('squads')
        .select('''
          *,
          members:squad_members(
            *,
            profile:user_profiles(*)
          ),
          wallet:wallets(*)
        ''')
        .inFilter('id', squadIds);

    return (response as List).map((json) => _mapToSquad(json)).toList();
  }

  /// Add member to squad
  Future<void> addMember({
    required String squadId,
    required String userId,
    required SquadRole role,
  }) async {
    await _client.from('squad_members').insert({
      'squad_id': squadId,
      'user_id': userId,
      'role': role.key,
      'status': 'active',
      'joined_at': DateTime.now().toIso8601String(),
    });
  }

  /// Update member role
  Future<void> updateMemberRole({
    required String squadId,
    required String userId,
    required SquadRole newRole,
  }) async {
    await _client
        .from('squad_members')
        .update({'role': newRole.key})
        .eq('squad_id', squadId)
        .eq('user_id', userId);
  }

  /// Remove member
  Future<void> removeMember({
    required String squadId,
    required String userId,
  }) async {
    await _client
        .from('squad_members')
        .delete()
        .eq('squad_id', squadId)
        .eq('user_id', userId);
  }

  // Helper to map JSON to Squad model
  Squad _mapToSquad(Map<String, dynamic> json) {
    final membersList = (json['members'] as List<dynamic>);
    final walletJson = (json['wallet'] as List<dynamic>).isNotEmpty 
        ? json['wallet'][0] 
        : null;

    // Map members
    final members = membersList.map((m) {
      final profile = m['profile'];
      return SquadMember(
        userId: m['user_id'],
        name: profile != null ? profile['name'] ?? 'Unknown' : 'Unknown',
        role: SquadRole.values.firstWhere(
          (r) => r.key == m['role'],
          orElse: () => SquadRole.member,
        ),
        joinDate: DateTime.parse(m['joined_at']),
        contributionPercentage: 0.0, // TODO: Calculate from logic
        totalEarnings: 0.0, // TODO: Calculate from transactions
        completedTasks: 0, // TODO: Fetch from tasks
      );
    }).toList();

    // Map wallet
    SharedWallet? wallet;
    if (walletJson != null) {
      wallet = SharedWallet(
        id: walletJson['id'],
        balance: (walletJson['balance'] as num).toDouble(),
        transactions: [], // TODO: Fetch transactions separately or join
        lockedFunds: 0.0, // TODO: Implement locked funds logic
        lastUpdated: DateTime.parse(walletJson['updated_at'] ?? DateTime.now().toIso8601String()),
        squadId: json['id'],
      );
    }

    return Squad(
      id: json['id'],
      name: json['name'],
      nameBn: json['name_bn'] ?? json['name'],
      type: SquadType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => SquadType.maker,
      ),
      members: members,
      walletId: walletJson?['id'] ?? '',
      wallet: wallet,
      createdAt: DateTime.parse(json['created_at']),
      lastUpdated: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
      trustScore: json['trust_score'] ?? 100,
    );
  }
}
