// Rizik V5++ Game OS - Default Feature Library
// 20+ unlockable features across 5 levels

import 'package:rizik_v4/data/models/unlockable_feature.dart';
import 'package:rizik_v4/data/models/aura_level.dart';

class DefaultFeatures {
  /// Get all default features
  static List<UnlockableFeature> getAllFeatures() {
    return [
      ...getLevel0Features(),
      ...getLevel1Features(),
      ...getLevel2Features(),
      ...getLevel3Features(),
      ...getLevel4Features(),
    ];
  }

  /// Level 0: Initiate (Always Available)
  static List<UnlockableFeature> getLevel0Features() {
    return [
      UnlockableFeature(
        id: 'basic_orders',
        name: 'Basic Orders',
        nameBn: 'মৌলিক অর্ডার',
        description: 'Place and track food orders',
        descriptionBn: 'খাবারের অর্ডার দিন এবং ট্র্যাক করুন',
        emoji: '🍽️',
        requiredLevel: AuraLevel.initiate,
        requirements: [],
        isUnlocked: true, // Always unlocked
      ),
      
      UnlockableFeature(
        id: 'trust_score',
        name: 'Trust Score',
        nameBn: 'বিশ্বাস স্কোর',
        description: 'View your trust score and badges',
        descriptionBn: 'আপনার বিশ্বাস স্কোর এবং ব্যাজ দেখুন',
        emoji: '🛡️',
        requiredLevel: AuraLevel.initiate,
        requirements: [],
        isUnlocked: true, // Always unlocked
      ),
      
      UnlockableFeature(
        id: 'profile',
        name: 'Profile',
        nameBn: 'প্রোফাইল',
        description: 'Manage your profile and settings',
        descriptionBn: 'আপনার প্রোফাইল এবং সেটিংস পরিচালনা করুন',
        emoji: '👤',
        requiredLevel: AuraLevel.initiate,
        requirements: [],
        isUnlocked: true, // Always unlocked
      ),
    ];
  }

  /// Level 1: Apprentice
  static List<UnlockableFeature> getLevel1Features() {
    return [
      UnlockableFeature(
        id: 'khata_os',
        name: 'Khata OS',
        nameBn: 'খাতা OS',
        description: 'Digital ledger with auto-logging and voice input',
        descriptionBn: 'অটো-লগিং এবং ভয়েস ইনপুট সহ ডিজিটাল খাতা',
        emoji: '📒',
        requiredLevel: AuraLevel.apprentice,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.days,
            value: 10,
            description: 'Use Rizik for 10 days',
            descriptionBn: '১০ দিনের জন্য রিজিক ব্যবহার করুন',
          ),
        ],
      ),
      
      UnlockableFeature(
        id: 'hyperlocal_services',
        name: 'Hyperlocal Services',
        nameBn: 'হাইপারলোকাল সার্ভিস',
        description: 'P2P services marketplace within 500m',
        descriptionBn: '৫০০মি এর মধ্যে P2P সার্ভিস মার্কেটপ্লেস',
        emoji: '🏘️',
        requiredLevel: AuraLevel.apprentice,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.transactions,
            value: 5,
            description: 'Complete 5 orders',
            descriptionBn: '৫টি অর্ডার সম্পন্ন করুন',
          ),
          UnlockRequirement(
            type: UnlockRequirementType.trustScore,
            value: 4.0,
            description: 'Maintain 4.0+ trust score',
            descriptionBn: '৪.০+ বিশ্বাস স্কোর বজায় রাখুন',
          ),
        ],
      ),
      
      UnlockableFeature(
        id: 'p2p_float',
        name: 'P2P Float',
        nameBn: 'P2P ফ্লোট',
        description: 'Borrow from community members',
        descriptionBn: 'কমিউনিটি সদস্যদের থেকে ধার নিন',
        emoji: '💸',
        requiredLevel: AuraLevel.apprentice,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.trustScore,
            value: 3.8,
            description: 'Maintain 3.8+ trust score',
            descriptionBn: '৩.৮+ বিশ্বাস স্কোর বজায় রাখুন',
          ),
        ],
        isComingSoon: true,
      ),
    ];
  }

  /// Level 2: Master
  static List<UnlockableFeature> getLevel2Features() {
    return [
      UnlockableFeature(
        id: 'squad_os',
        name: 'Squad OS',
        nameBn: 'স্কোয়াড OS',
        description: 'Form teams with shared wallet and duty roster',
        descriptionBn: 'শেয়ার্ড ওয়ালেট এবং ডিউটি রোস্টার সহ টিম গঠন করুন',
        emoji: '👥',
        requiredLevel: AuraLevel.master,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.quest,
            value: 'social_form_squad',
            description: 'Complete "Squad Starter" quest',
            descriptionBn: '"স্কোয়াড স্টার্টার" কোয়েস্ট সম্পন্ন করুন',
          ),
        ],
      ),
      
      UnlockableFeature(
        id: 'duty_roster',
        name: 'Duty Roster',
        nameBn: 'ডিউটি রোস্টার',
        description: 'Automated task assignment for squads',
        descriptionBn: 'স্কোয়াডের জন্য স্বয়ংক্রিয় টাস্ক অ্যাসাইনমেন্ট',
        emoji: '📅',
        requiredLevel: AuraLevel.master,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.quest,
            value: 'social_form_squad',
            description: 'Form a squad first',
            descriptionBn: 'প্রথমে একটি স্কোয়াড গঠন করুন',
          ),
        ],
      ),
      
      UnlockableFeature(
        id: 'capacity_lock',
        name: 'Capacity Lock',
        nameBn: 'ক্যাপাসিটি লক',
        description: 'Optimize order limits based on capabilities',
        descriptionBn: 'সক্ষমতার উপর ভিত্তি করে অর্ডার সীমা অপ্টিমাইজ করুন',
        emoji: '🔒',
        requiredLevel: AuraLevel.master,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.transactions,
            value: 25,
            description: 'Complete 25 orders',
            descriptionBn: '২৫টি অর্ডার সম্পন্ন করুন',
          ),
        ],
        isComingSoon: true,
      ),
    ];
  }

  /// Level 3: Architect
  static List<UnlockableFeature> getLevel3Features() {
    return [
      UnlockableFeature(
        id: 'rizik_dhaar',
        name: 'Rizik Dhaar',
        nameBn: 'রিজিক ধার',
        description: 'Micro-lending with locked vouchers',
        descriptionBn: 'লক করা ভাউচার সহ মাইক্রো-লেন্ডিং',
        emoji: '💰',
        requiredLevel: AuraLevel.architect,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.trustScore,
            value: 4.0,
            description: 'Maintain 4.0+ trust score',
            descriptionBn: '৪.০+ বিশ্বাস স্কোর বজায় রাখুন',
          ),
          UnlockRequirement(
            type: UnlockRequirementType.earnings,
            value: 20000,
            description: 'Earn ৳20,000 total',
            descriptionBn: 'মোট ৳২০,০০০ আয় করুন',
          ),
        ],
      ),
      
      UnlockableFeature(
        id: 'social_collateral',
        name: 'Social Collateral',
        nameBn: 'সোশ্যাল কোলাটারাল',
        description: 'Use platform reputation for bank loans',
        descriptionBn: 'ব্যাংক ঋণের জন্য প্ল্যাটফর্ম খ্যাতি ব্যবহার করুন',
        emoji: '🏦',
        requiredLevel: AuraLevel.architect,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.trustScore,
            value: 4.5,
            description: 'Maintain 4.5+ trust score',
            descriptionBn: '৪.৫+ বিশ্বাস স্কোর বজায় রাখুন',
          ),
          UnlockRequirement(
            type: UnlockRequirementType.transactions,
            value: 100,
            description: 'Complete 100 transactions',
            descriptionBn: '১০০টি লেনদেন সম্পন্ন করুন',
          ),
        ],
        isComingSoon: true,
      ),
      
      UnlockableFeature(
        id: 'landlord_os',
        name: 'Landlord OS',
        nameBn: 'ল্যান্ডলর্ড OS',
        description: 'Property management integration',
        descriptionBn: 'সম্পত্তি ব্যবস্থাপনা ইন্টিগ্রেশন',
        emoji: '🏠',
        requiredLevel: AuraLevel.architect,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.quest,
            value: 'social_form_squad',
            description: 'Form a squad',
            descriptionBn: 'একটি স্কোয়াড গঠন করুন',
          ),
        ],
        isComingSoon: true,
      ),
    ];
  }

  /// Level 4: Apex
  static List<UnlockableFeature> getLevel4Features() {
    return [
      UnlockableFeature(
        id: 'p2p_investment',
        name: 'P2P Investment',
        nameBn: 'P2P ইনভেস্টমেন্ট',
        description: 'Invest in other users',
        descriptionBn: 'অন্যান্য ব্যবহারকারীদের মধ্যে বিনিয়োগ করুন',
        emoji: '📈',
        requiredLevel: AuraLevel.apex,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.earnings,
            value: 100000,
            description: 'Earn ৳100,000 total',
            descriptionBn: 'মোট ৳১,০০,০০০ আয় করুন',
          ),
          UnlockRequirement(
            type: UnlockRequirementType.referrals,
            value: 10,
            description: 'Refer 10 users',
            descriptionBn: '১০ জন ব্যবহারকারীকে রেফার করুন',
          ),
        ],
        isComingSoon: true,
      ),
      
      UnlockableFeature(
        id: 'liquidation_brokerage',
        name: 'Liquidation Brokerage',
        nameBn: 'লিকুইডেশন ব্রোকারেজ',
        description: 'Help squads dissolve and settle accounts',
        descriptionBn: 'স্কোয়াডগুলিকে বিলুপ্ত এবং অ্যাকাউন্ট নিষ্পত্তি করতে সহায়তা করুন',
        emoji: '⚖️',
        requiredLevel: AuraLevel.apex,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.quest,
            value: 'social_tribunal_vote',
            description: 'Vote in 5 tribunal cases',
            descriptionBn: '৫টি ট্রাইব্যুনাল মামলায় ভোট দিন',
          ),
        ],
        isComingSoon: true,
      ),
      
      UnlockableFeature(
        id: 'platform_governance',
        name: 'Platform Governance',
        nameBn: 'প্ল্যাটফর্ম গভর্নেন্স',
        description: 'Vote on platform decisions',
        descriptionBn: 'প্ল্যাটফর্ম সিদ্ধান্তে ভোট দিন',
        emoji: '🗳️',
        requiredLevel: AuraLevel.apex,
        requirements: [
          UnlockRequirement(
            type: UnlockRequirementType.trustScore,
            value: 4.8,
            description: 'Maintain 4.8+ trust score',
            descriptionBn: '৪.৮+ বিশ্বাস স্কোর বজায় রাখুন',
          ),
        ],
        isComingSoon: true,
      ),
    ];
  }
}
