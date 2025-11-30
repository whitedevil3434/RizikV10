// Rizik V5++ Game OS - Aura Level System
// This model defines the 5-level progression system

enum AuraLevel {
  initiate(0, 'Initiate', 'শিক্ষানবিস', '🌱', 0, 'Welcome to Rizik! Complete quests to unlock features.', 'রিজিকে স্বাগতম! ফিচার আনলক করতে কোয়েস্ট সম্পন্ন করুন।'),
  apprentice(1, 'Apprentice', 'শিক্ষার্থী', '⚡', 1000, 'Unlocked: Khata OS, Hyperlocal Services, P2P Float', 'আনলক: খাতা OS, হাইপারলোকাল সার্ভিস, P2P ফ্লোট'),
  master(2, 'Master', 'মাস্টার', '🔥', 5000, 'Unlocked: Squad OS, Duty Roster, Capacity Lock', 'আনলক: স্কোয়াড OS, ডিউটি রোস্টার, ক্যাপাসিটি লক'),
  architect(3, 'Architect', 'স্থপতি', '👑', 15000, 'Unlocked: Rizik Dhaar, Social Collateral, Landlord OS', 'আনলক: রিজিক ধার, সোশ্যাল কোলাটারাল, ল্যান্ডলর্ড OS'),
  apex(4, 'Apex', 'শীর্ষ', '💎', 50000, 'Unlocked: P2P Investment, Liquidation Brokerage', 'আনলক: P2P ইনভেস্টমেন্ট, লিকুইডেশন ব্রোকারেজ');

  final int level;
  final String name;
  final String nameBn;
  final String emoji;
  final int requiredXP;
  final String description;
  final String descriptionBn;

  const AuraLevel(this.level, this.name, this.nameBn, this.emoji, this.requiredXP, this.description, this.descriptionBn);
}



extension AuraLevelExtension on AuraLevel {
  List<String> get unlockedFeatures {
    switch (this) {
      case AuraLevel.initiate:
        return ['Basic Orders', 'Trust Score', 'Profile'];
      case AuraLevel.apprentice:
        return ['Khata OS', 'Hyperlocal Services', 'P2P Float'];
      case AuraLevel.master:
        return ['Squad OS', 'Duty Roster', 'Capacity Lock', 'Skill Roster'];
      case AuraLevel.architect:
        return ['Rizik Dhaar', 'Social Collateral', 'Landlord OS', 'Squad Franchise'];
      case AuraLevel.apex:
        return ['P2P Investment', 'Liquidation Brokerage', 'Data Monetization', 'Platform Governance'];
    }
  }

  static AuraLevel fromXP(int xp) {
    if (xp >= AuraLevel.apex.requiredXP) return AuraLevel.apex;
    if (xp >= AuraLevel.architect.requiredXP) return AuraLevel.architect;
    if (xp >= AuraLevel.master.requiredXP) return AuraLevel.master;
    if (xp >= AuraLevel.apprentice.requiredXP) return AuraLevel.apprentice;
    return AuraLevel.initiate;
  }

  // NOTE: nextLevel getter removed - use helper methods in AuraProgress instead
  // to avoid runtime issues with extension methods
}
