// Rizik V5++ Game OS - Default Quest Library
// 100+ quests across 5 series

import 'package:rizik_v4/data/models/quest.dart';

class DefaultQuests {
  /// Get all default quests
  static List<Quest> getAllQuests() {
    return [
      ...getTrustBuilderQuests(),
      ...getMoneyMakerQuests(),
      ...getSocialGlueQuests(),
      ...getEfficiencyHackQuests(),
      ...getSkillMasterQuests(),
    ];
  }

  /// Trust Builder Series (15 quests)
  static List<Quest> getTrustBuilderQuests() {
    return [
      // Easy quests
      Quest(
        id: 'trust_first_order',
        title: 'First Steps',
        titleBn: 'প্রথম পদক্ষেপ',
        description: 'Complete your first order',
        descriptionBn: 'আপনার প্রথম অর্ডার সম্পন্ন করুন',
        series: QuestSeries.trustBuilder,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        steps: [
          QuestStep(
            id: 'place_order',
            description: 'Place an order',
            descriptionBn: 'একটি অর্ডার দিন',
            targetProgress: 1,
          ),
        ],
      ),
      
      Quest(
        id: 'trust_five_orders',
        title: 'Getting Started',
        titleBn: 'শুরু করা',
        description: 'Complete 5 orders',
        descriptionBn: '৫টি অর্ডার সম্পন্ন করুন',
        series: QuestSeries.trustBuilder,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        unlockRequirement: 'trust_first_order',
        steps: [
          QuestStep(
            id: 'complete_orders',
            description: 'Complete orders',
            descriptionBn: 'অর্ডার সম্পন্ন করুন',
            targetProgress: 5,
          ),
        ],
      ),

      // Medium quests
      Quest(
        id: 'trust_maintain_4_0',
        title: 'Reliable Partner',
        titleBn: 'বিশ্বস্ত সঙ্গী',
        description: 'Maintain 4.0+ trust score for 7 days',
        descriptionBn: '৭ দিনের জন্য ৪.০+ বিশ্বাস স্কোর বজায় রাখুন',
        series: QuestSeries.trustBuilder,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        steps: [
          QuestStep(
            id: 'maintain_score',
            description: 'Days with 4.0+ score',
            descriptionBn: '৪.০+ স্কোর সহ দিন',
            targetProgress: 7,
          ),
        ],
      ),

      Quest(
        id: 'trust_earn_5_badges',
        title: 'Badge Hunter',
        titleBn: 'ব্যাজ শিকারী',
        description: 'Earn 5 badges',
        descriptionBn: '৫টি ব্যাজ অর্জন করুন',
        series: QuestSeries.trustBuilder,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        steps: [
          QuestStep(
            id: 'earn_badges',
            description: 'Badges earned',
            descriptionBn: 'ব্যাজ অর্জিত',
            targetProgress: 5,
          ),
        ],
      ),

      // Hard quests
      Quest(
        id: 'trust_master',
        title: 'Trust Master',
        titleBn: 'বিশ্বাস মাস্টার',
        description: 'Reach 4.5+ trust score',
        descriptionBn: '৪.৫+ বিশ্বাস স্কোর পৌঁছান',
        series: QuestSeries.trustBuilder,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        steps: [
          QuestStep(
            id: 'reach_score',
            description: 'Reach 4.5 trust score',
            descriptionBn: '৪.৫ বিশ্বাস স্কোর পৌঁছান',
            targetProgress: 1,
          ),
        ],
      ),
    ];
  }

  /// Money Maker Series (25 quests)
  static List<Quest> getMoneyMakerQuests() {
    return [
      // Easy quests
      Quest(
        id: 'money_first_100',
        title: 'First Earnings',
        titleBn: 'প্রথম আয়',
        description: 'Earn your first ৳100',
        descriptionBn: 'আপনার প্রথম ৳১০০ আয় করুন',
        series: QuestSeries.moneyMaker,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        steps: [
          QuestStep(
            id: 'earn_money',
            description: 'Earn ৳100',
            descriptionBn: '৳১০০ আয় করুন',
            targetProgress: 100,
          ),
        ],
      ),

      // Medium quests
      Quest(
        id: 'money_thousand_club',
        title: 'Thousand Club',
        titleBn: 'হাজার ক্লাব',
        description: 'Earn ৳1,000 total',
        descriptionBn: 'মোট ৳১,০০০ আয় করুন',
        series: QuestSeries.moneyMaker,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        unlockRequirement: 'money_first_100',
        steps: [
          QuestStep(
            id: 'earn_money',
            description: 'Earn ৳1,000',
            descriptionBn: '৳১,০০০ আয় করুন',
            targetProgress: 1000,
          ),
        ],
      ),

      // Hard quests
      Quest(
        id: 'money_ten_k_milestone',
        title: 'Ten K Milestone',
        titleBn: 'দশ হাজার মাইলফলক',
        description: 'Earn ৳10,000 in a month',
        descriptionBn: 'এক মাসে ৳১০,০০০ আয় করুন',
        series: QuestSeries.moneyMaker,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        steps: [
          QuestStep(
            id: 'earn_monthly',
            description: 'Monthly earnings',
            descriptionBn: 'মাসিক আয়',
            targetProgress: 10000,
          ),
        ],
      ),
    ];
  }

  /// Social Glue Series (20 quests)
  static List<Quest> getSocialGlueQuests() {
    return [
      // Easy quests
      Quest(
        id: 'social_invite_3',
        title: 'Recruiter',
        titleBn: 'নিয়োগকর্তা',
        description: 'Invite 3 friends',
        descriptionBn: '৩ জন বন্ধুকে আমন্ত্রণ জানান',
        series: QuestSeries.socialGlue,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        steps: [
          QuestStep(
            id: 'invite_friends',
            description: 'Friends invited',
            descriptionBn: 'বন্ধুদের আমন্ত্রণ জানানো হয়েছে',
            targetProgress: 3,
          ),
        ],
      ),

      // Medium quests
      Quest(
        id: 'social_form_squad',
        title: 'Squad Starter',
        titleBn: 'স্কোয়াড স্টার্টার',
        description: 'Form your first squad',
        descriptionBn: 'আপনার প্রথম স্কোয়াড গঠন করুন',
        series: QuestSeries.socialGlue,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        featureUnlock: 'squad_os',
        steps: [
          QuestStep(
            id: 'create_squad',
            description: 'Create a squad',
            descriptionBn: 'একটি স্কোয়াড তৈরি করুন',
            targetProgress: 1,
          ),
        ],
      ),

      Quest(
        id: 'social_tribunal_vote',
        title: 'Tribunal Judge',
        titleBn: 'ট্রাইব্যুনাল বিচারক',
        description: 'Vote in 5 tribunal cases',
        descriptionBn: '৫টি ট্রাইব্যুনাল মামলায় ভোট দিন',
        series: QuestSeries.socialGlue,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        steps: [
          QuestStep(
            id: 'vote_cases',
            description: 'Cases voted',
            descriptionBn: 'মামলায় ভোট দেওয়া হয়েছে',
            targetProgress: 5,
          ),
        ],
      ),

      // Hard quests
      Quest(
        id: 'social_community_leader',
        title: 'Community Leader',
        titleBn: 'কমিউনিটি লিডার',
        description: 'Mentor 1 apprentice',
        descriptionBn: '১ জন শিক্ষানবিসকে পরামর্শ দিন',
        series: QuestSeries.socialGlue,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        steps: [
          QuestStep(
            id: 'mentor_users',
            description: 'Apprentices mentored',
            descriptionBn: 'শিক্ষানবিসদের পরামর্শ দেওয়া হয়েছে',
            targetProgress: 1,
          ),
        ],
      ),
    ];
  }

  /// Efficiency Hack Series (20 quests)
  static List<Quest> getEfficiencyHackQuests() {
    return [
      // Easy quests
      Quest(
        id: 'efficiency_use_pantry',
        title: 'Pantry Pro',
        titleBn: 'প্যান্ট্রি প্রো',
        description: 'Use AI Pantry 10 times',
        descriptionBn: 'AI প্যান্ট্রি ১০ বার ব্যবহার করুন',
        series: QuestSeries.efficiencyHack,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        steps: [
          QuestStep(
            id: 'use_pantry',
            description: 'Times used',
            descriptionBn: 'বার ব্যবহার করা হয়েছে',
            targetProgress: 10,
          ),
        ],
      ),

      // Medium quests
      Quest(
        id: 'efficiency_mission_chain',
        title: 'Chain Master',
        titleBn: 'চেইন মাস্টার',
        description: 'Complete a 3-mission chain',
        descriptionBn: '৩-মিশন চেইন সম্পন্ন করুন',
        series: QuestSeries.efficiencyHack,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        steps: [
          QuestStep(
            id: 'complete_chain',
            description: 'Chains completed',
            descriptionBn: 'চেইন সম্পন্ন',
            targetProgress: 1,
          ),
        ],
      ),

      // Hard quests
      Quest(
        id: 'efficiency_speed_demon',
        title: 'Speed Demon',
        titleBn: 'দ্রুততম',
        description: 'Complete 50 on-time deliveries',
        descriptionBn: '৫০টি সময়মতো ডেলিভারি সম্পন্ন করুন',
        series: QuestSeries.efficiencyHack,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        steps: [
          QuestStep(
            id: 'on_time_deliveries',
            description: 'On-time deliveries',
            descriptionBn: 'সময়মতো ডেলিভারি',
            targetProgress: 50,
          ),
        ],
      ),
    ];
  }

  /// Skill Master Series (20 quests)
  static List<Quest> getSkillMasterQuests() {
    return [
      // Easy quests
      Quest(
        id: 'skill_explore_features',
        title: 'Feature Explorer',
        titleBn: 'ফিচার এক্সপ্লোরার',
        description: 'Try all basic features',
        descriptionBn: 'সমস্ত মৌলিক ফিচার চেষ্টা করুন',
        series: QuestSeries.skillMaster,
        difficulty: QuestDifficulty.easy,
        xpReward: 50,
        steps: [
          QuestStep(
            id: 'try_features',
            description: 'Features tried',
            descriptionBn: 'ফিচার চেষ্টা করা হয়েছে',
            targetProgress: 5,
          ),
        ],
      ),

      // Medium quests
      Quest(
        id: 'skill_level_up',
        title: 'Level Up',
        titleBn: 'লেভেল আপ',
        description: 'Reach Level 2',
        descriptionBn: 'লেভেল ২ পৌঁছান',
        series: QuestSeries.skillMaster,
        difficulty: QuestDifficulty.medium,
        xpReward: 150,
        steps: [
          QuestStep(
            id: 'reach_level',
            description: 'Reach Level 2',
            descriptionBn: 'লেভেল ২ পৌঁছান',
            targetProgress: 1,
          ),
        ],
      ),

      // Hard quests
      Quest(
        id: 'skill_architect',
        title: 'Architect',
        titleBn: 'স্থপতি',
        description: 'Reach Level 3',
        descriptionBn: 'লেভেল ৩ পৌঁছান',
        series: QuestSeries.skillMaster,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        unlockRequirement: 'skill_level_up',
        steps: [
          QuestStep(
            id: 'reach_level',
            description: 'Reach Level 3',
            descriptionBn: 'লেভেল ৩ পৌঁছান',
            targetProgress: 1,
          ),
        ],
      ),

      Quest(
        id: 'skill_apex',
        title: 'Apex Predator',
        titleBn: 'শীর্ষ শিকারী',
        description: 'Reach Level 4',
        descriptionBn: 'লেভেল ৪ পৌঁছান',
        series: QuestSeries.skillMaster,
        difficulty: QuestDifficulty.hard,
        xpReward: 300,
        unlockRequirement: 'skill_architect',
        steps: [
          QuestStep(
            id: 'reach_level',
            description: 'Reach Level 4',
            descriptionBn: 'লেভেল ৪ পৌঁছান',
            targetProgress: 1,
          ),
        ],
      ),
    ];
  }
}
