import 'package:flutter/foundation.dart';

/// Dispute status enum
enum DisputeStatus {
  filed('filed', 'দায়ের করা হয়েছে'),
  underReview('under_review', 'পর্যালোচনাধীন'),
  voting('voting', 'ভোটিং চলছে'),
  resolved('resolved', 'সমাধান হয়েছে'),
  appealed('appealed', 'আপিল করা হয়েছে'),
  closed('closed', 'বন্ধ');

  const DisputeStatus(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Dispute type enum
enum DisputeType {
  incomeSplit('income_split', 'আয় ভাগাভাগি', '💰'),
  workDistribution('work_distribution', 'কাজের বন্টন', '⚖️'),
  memberConduct('member_conduct', 'সদস্যের আচরণ', '👤'),
  resourceUsage('resource_usage', 'সম্পদের ব্যবহার', '📦'),
  decisionMaking('decision_making', 'সিদ্ধান্ত গ্রহণ', '🤝'),
  other('other', 'অন্যান্য', '❓');

  const DisputeType(this.key, this.nameBn, this.emoji);
  final String key;
  final String nameBn;
  final String emoji;
}

/// Vote type enum
enum VoteType {
  favor('favor', 'পক্ষে'),
  against('against', 'বিপক্ষে'),
  abstain('abstain', 'নিরপেক্ষ');

  const VoteType(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Evidence type enum
enum EvidenceType {
  text('text', 'লিখিত', '📝'),
  image('image', 'ছবি', '📷'),
  document('document', 'নথি', '📄'),
  transaction('transaction', 'লেনদেন', '💳'),
  witness('witness', 'সাক্ষী', '👥');

  const EvidenceType(this.key, this.nameBn, this.emoji);
  final String key;
  final String nameBn;
  final String emoji;
}

/// Evidence model
@immutable
class DisputeEvidence {
  final String id;
  final EvidenceType type;
  final String title;
  final String description;
  final String? filePath;
  final String? fileUrl;
  final String submittedBy;
  final DateTime submittedAt;
  final Map<String, dynamic>? metadata;

  const DisputeEvidence({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    this.filePath,
    this.fileUrl,
    required this.submittedBy,
    required this.submittedAt,
    this.metadata,
  });

  DisputeEvidence copyWith({
    String? id,
    EvidenceType? type,
    String? title,
    String? description,
    String? filePath,
    String? fileUrl,
    String? submittedBy,
    DateTime? submittedAt,
    Map<String, dynamic>? metadata,
  }) {
    return DisputeEvidence(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      description: description ?? this.description,
      filePath: filePath ?? this.filePath,
      fileUrl: fileUrl ?? this.fileUrl,
      submittedBy: submittedBy ?? this.submittedBy,
      submittedAt: submittedAt ?? this.submittedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.key,
      'title': title,
      'description': description,
      'file_path': filePath,
      'file_url': fileUrl,
      'submitted_by': submittedBy,
      'submitted_at': submittedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory DisputeEvidence.fromJson(Map<String, dynamic> json) {
    return DisputeEvidence(
      id: json['id'] as String,
      type: EvidenceType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => EvidenceType.text,
      ),
      title: json['title'] as String,
      description: json['description'] as String,
      filePath: json['file_path'] as String?,
      fileUrl: json['file_url'] as String?,
      submittedBy: json['submitted_by'] as String,
      submittedAt: DateTime.parse(json['submitted_at'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}

/// Vote model
@immutable
class TribunalVote {
  final String id;
  final String disputeId;
  final String voterId;
  final VoteType voteType;
  final String? reason;
  final DateTime votedAt;
  final double weight;

  const TribunalVote({
    required this.id,
    required this.disputeId,
    required this.voterId,
    required this.voteType,
    this.reason,
    required this.votedAt,
    this.weight = 1.0,
  });

  TribunalVote copyWith({
    String? id,
    String? disputeId,
    String? voterId,
    VoteType? voteType,
    String? reason,
    DateTime? votedAt,
    double? weight,
  }) {
    return TribunalVote(
      id: id ?? this.id,
      disputeId: disputeId ?? this.disputeId,
      voterId: voterId ?? this.voterId,
      voteType: voteType ?? this.voteType,
      reason: reason ?? this.reason,
      votedAt: votedAt ?? this.votedAt,
      weight: weight ?? this.weight,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'dispute_id': disputeId,
      'voter_id': voterId,
      'vote_type': voteType.key,
      'reason': reason,
      'voted_at': votedAt.toIso8601String(),
      'weight': weight,
    };
  }

  factory TribunalVote.fromJson(Map<String, dynamic> json) {
    return TribunalVote(
      id: json['id'] as String,
      disputeId: json['dispute_id'] as String,
      voterId: json['voter_id'] as String,
      voteType: VoteType.values.firstWhere(
        (t) => t.key == json['vote_type'],
        orElse: () => VoteType.abstain,
      ),
      reason: json['reason'] as String?,
      votedAt: DateTime.parse(json['voted_at'] as String),
      weight: (json['weight'] as num?)?.toDouble() ?? 1.0,
    );
  }
}

/// Tribunal decision model
@immutable
class TribunalDecision {
  final String id;
  final String disputeId;
  final String decision;
  final String reasoning;
  final Map<String, dynamic> enforcement;
  final DateTime decidedAt;
  final double favorVotes;
  final double againstVotes;
  final double abstainVotes;
  final bool isAppealed;
  final DateTime? appealDeadline;

  const TribunalDecision({
    required this.id,
    required this.disputeId,
    required this.decision,
    required this.reasoning,
    required this.enforcement,
    required this.decidedAt,
    required this.favorVotes,
    required this.againstVotes,
    required this.abstainVotes,
    this.isAppealed = false,
    this.appealDeadline,
  });

  double get totalVotes => favorVotes + againstVotes + abstainVotes;
  double get favorPercentage => totalVotes > 0 ? (favorVotes / totalVotes * 100) : 0;
  double get againstPercentage => totalVotes > 0 ? (againstVotes / totalVotes * 100) : 0;
  bool get isPassed => favorVotes > againstVotes;
  bool get canAppeal => appealDeadline != null && DateTime.now().isBefore(appealDeadline!);

  TribunalDecision copyWith({
    String? id,
    String? disputeId,
    String? decision,
    String? reasoning,
    Map<String, dynamic>? enforcement,
    DateTime? decidedAt,
    double? favorVotes,
    double? againstVotes,
    double? abstainVotes,
    bool? isAppealed,
    DateTime? appealDeadline,
  }) {
    return TribunalDecision(
      id: id ?? this.id,
      disputeId: disputeId ?? this.disputeId,
      decision: decision ?? this.decision,
      reasoning: reasoning ?? this.reasoning,
      enforcement: enforcement ?? this.enforcement,
      decidedAt: decidedAt ?? this.decidedAt,
      favorVotes: favorVotes ?? this.favorVotes,
      againstVotes: againstVotes ?? this.againstVotes,
      abstainVotes: abstainVotes ?? this.abstainVotes,
      isAppealed: isAppealed ?? this.isAppealed,
      appealDeadline: appealDeadline ?? this.appealDeadline,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'dispute_id': disputeId,
      'decision': decision,
      'reasoning': reasoning,
      'enforcement': enforcement,
      'decided_at': decidedAt.toIso8601String(),
      'favor_votes': favorVotes,
      'against_votes': againstVotes,
      'abstain_votes': abstainVotes,
      'is_appealed': isAppealed,
      'appeal_deadline': appealDeadline?.toIso8601String(),
    };
  }

  factory TribunalDecision.fromJson(Map<String, dynamic> json) {
    return TribunalDecision(
      id: json['id'] as String,
      disputeId: json['dispute_id'] as String,
      decision: json['decision'] as String,
      reasoning: json['reasoning'] as String,
      enforcement: json['enforcement'] as Map<String, dynamic>,
      decidedAt: DateTime.parse(json['decided_at'] as String),
      favorVotes: (json['favor_votes'] as num).toDouble(),
      againstVotes: (json['against_votes'] as num).toDouble(),
      abstainVotes: (json['abstain_votes'] as num).toDouble(),
      isAppealed: json['is_appealed'] as bool? ?? false,
      appealDeadline: json['appeal_deadline'] != null
          ? DateTime.parse(json['appeal_deadline'] as String)
          : null,
    );
  }
}

/// Main Squad Dispute model
@immutable
class SquadDispute {
  final String id;
  final String squadId;
  final DisputeType type;
  final String title;
  final String description;
  final String filedBy;
  final List<String> defendants;
  final DisputeStatus status;
  final DateTime filedAt;
  final DateTime? reviewStartedAt;
  final DateTime? votingStartedAt;
  final DateTime? resolvedAt;
  final List<DisputeEvidence> evidence;
  final List<TribunalVote> votes;
  final TribunalDecision? decision;
  final String? appealReason;
  final DateTime? appealedAt;
  final Map<String, dynamic>? metadata;

  const SquadDispute({
    required this.id,
    required this.squadId,
    required this.type,
    required this.title,
    required this.description,
    required this.filedBy,
    required this.defendants,
    required this.status,
    required this.filedAt,
    this.reviewStartedAt,
    this.votingStartedAt,
    this.resolvedAt,
    required this.evidence,
    required this.votes,
    this.decision,
    this.appealReason,
    this.appealedAt,
    this.metadata,
  });

  bool get isActive => status != DisputeStatus.resolved && status != DisputeStatus.closed;
  bool get canVote => status == DisputeStatus.voting;
  bool get isResolved => status == DisputeStatus.resolved || status == DisputeStatus.closed;
  int get daysOpen => DateTime.now().difference(filedAt).inDays;

  int get totalVotes => votes.length;
  double get favorVotes => votes.where((v) => v.voteType == VoteType.favor).fold(0.0, (sum, v) => sum + v.weight);
  double get againstVotes => votes.where((v) => v.voteType == VoteType.against).fold(0.0, (sum, v) => sum + v.weight);
  double get abstainVotes => votes.where((v) => v.voteType == VoteType.abstain).fold(0.0, (sum, v) => sum + v.weight);

  SquadDispute copyWith({
    String? id,
    String? squadId,
    DisputeType? type,
    String? title,
    String? description,
    String? filedBy,
    List<String>? defendants,
    DisputeStatus? status,
    DateTime? filedAt,
    DateTime? reviewStartedAt,
    DateTime? votingStartedAt,
    DateTime? resolvedAt,
    List<DisputeEvidence>? evidence,
    List<TribunalVote>? votes,
    TribunalDecision? decision,
    String? appealReason,
    DateTime? appealedAt,
    Map<String, dynamic>? metadata,
  }) {
    return SquadDispute(
      id: id ?? this.id,
      squadId: squadId ?? this.squadId,
      type: type ?? this.type,
      title: title ?? this.title,
      description: description ?? this.description,
      filedBy: filedBy ?? this.filedBy,
      defendants: defendants ?? this.defendants,
      status: status ?? this.status,
      filedAt: filedAt ?? this.filedAt,
      reviewStartedAt: reviewStartedAt ?? this.reviewStartedAt,
      votingStartedAt: votingStartedAt ?? this.votingStartedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      evidence: evidence ?? this.evidence,
      votes: votes ?? this.votes,
      decision: decision ?? this.decision,
      appealReason: appealReason ?? this.appealReason,
      appealedAt: appealedAt ?? this.appealedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'type': type.key,
      'title': title,
      'description': description,
      'filed_by': filedBy,
      'defendants': defendants,
      'status': status.key,
      'filed_at': filedAt.toIso8601String(),
      'review_started_at': reviewStartedAt?.toIso8601String(),
      'voting_started_at': votingStartedAt?.toIso8601String(),
      'resolved_at': resolvedAt?.toIso8601String(),
      'evidence': evidence.map((e) => e.toJson()).toList(),
      'votes': votes.map((v) => v.toJson()).toList(),
      'decision': decision?.toJson(),
      'appeal_reason': appealReason,
      'appealed_at': appealedAt?.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory SquadDispute.fromJson(Map<String, dynamic> json) {
    return SquadDispute(
      id: json['id'] as String,
      squadId: json['squad_id'] as String,
      type: DisputeType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => DisputeType.other,
      ),
      title: json['title'] as String,
      description: json['description'] as String,
      filedBy: json['filed_by'] as String,
      defendants: (json['defendants'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      status: DisputeStatus.values.firstWhere(
        (s) => s.key == json['status'],
        orElse: () => DisputeStatus.filed,
      ),
      filedAt: DateTime.parse(json['filed_at'] as String),
      reviewStartedAt: json['review_started_at'] != null
          ? DateTime.parse(json['review_started_at'] as String)
          : null,
      votingStartedAt: json['voting_started_at'] != null
          ? DateTime.parse(json['voting_started_at'] as String)
          : null,
      resolvedAt: json['resolved_at'] != null
          ? DateTime.parse(json['resolved_at'] as String)
          : null,
      evidence: (json['evidence'] as List<dynamic>?)
              ?.map((e) => DisputeEvidence.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      votes: (json['votes'] as List<dynamic>?)
              ?.map((v) => TribunalVote.fromJson(v as Map<String, dynamic>))
              .toList() ??
          [],
      decision: json['decision'] != null
          ? TribunalDecision.fromJson(json['decision'] as Map<String, dynamic>)
          : null,
      appealReason: json['appeal_reason'] as String?,
      appealedAt: json['appealed_at'] != null
          ? DateTime.parse(json['appealed_at'] as String)
          : null,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  factory SquadDispute.create({
    required String squadId,
    required DisputeType type,
    required String title,
    required String description,
    required String filedBy,
    required List<String> defendants,
  }) {
    return SquadDispute(
      id: 'dispute_${DateTime.now().millisecondsSinceEpoch}',
      squadId: squadId,
      type: type,
      title: title,
      description: description,
      filedBy: filedBy,
      defendants: defendants,
      status: DisputeStatus.filed,
      filedAt: DateTime.now(),
      evidence: [],
      votes: [],
    );
  }
}
