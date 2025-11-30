import 'package:flutter/material.dart';
import 'package:rizik_v4/core/config/custom_icons.dart';
import 'package:rizik_v4/core/config/emojis.dart';
import 'package:rizik_v4/core/config/color_scheme.dart';

/// Iconography System for Rizik App
/// This class provides a unified interface for accessing both custom icons and emojis
/// in a culturally relevant way for Bengali users.
class RizikIconography {
  /// Get a culturally relevant icon for a specific context
  static Widget getIcon(
    BuildContext context, {
    required String type,
    double size = 24.0,
    Color? color,
  }) {
    final theme = Theme.of(context);
    final defaultColor = color ?? theme.primaryColor;

    switch (type) {
      // Khata (ledger) related icons
      case 'khata':
        return Icon(RizikIcons.khata, size: size, color: defaultColor);
      case 'khata_flip':
        return Icon(RizikIcons.khataFlip, size: size, color: defaultColor);
      case 'khata_write':
        return Icon(RizikIcons.khataWrite, size: size, color: defaultColor);
      case 'khata_stamp':
        return Icon(RizikIcons.khataStamp, size: size, color: defaultColor);
      case 'khata_tear':
        return Icon(RizikIcons.khataTear, size: size, color: defaultColor);
        
      // Bengali cultural icons
      case 'bengal_tiger':
        return Icon(RizikIcons.bengalTiger, size: size, color: defaultColor);
      case 'rice':
        return Icon(RizikIcons.rice, size: size, color: defaultColor);
      case 'fish':
        return Icon(RizikIcons.fish, size: size, color: defaultColor);
      case 'boat':
        return Icon(RizikIcons.boat, size: size, color: defaultColor);
      case 'banyan_tree':
        return Icon(RizikIcons.banyanTree, size: size, color: defaultColor);
        
      // Festival and celebration icons
      case 'eid':
        return Icon(RizikIcons.eid, size: size, color: RizikColorScheme.festiveGold);
      case 'pohela_boishakh':
        return Icon(RizikIcons.pohelaBoishakh, size: size, color: RizikColorScheme.holiRed);
      case 'durga_puja':
        return Icon(RizikIcons.durgaPuja, size: size, color: RizikColorScheme.holiBlue);
      case 'firecracker':
        return Icon(RizikIcons.firecracker, size: size, color: RizikColorScheme.celebrationFirework);
        
      // Business and commerce icons
      case 'shop':
        return Icon(RizikIcons.shop, size: size, color: defaultColor);
      case 'cart':
        return Icon(RizikIcons.cart, size: size, color: defaultColor);
      case 'delivery_bike':
        return Icon(RizikIcons.deliveryBike, size: size, color: defaultColor);
      case 'delivery_boat':
        return Icon(RizikIcons.deliveryBoat, size: size, color: defaultColor);
      case 'money_bag':
        return Icon(RizikIcons.moneyBag, size: size, color: RizikColorScheme.textSecondary);
        
      // Gamification and achievement icons
      case 'badge':
        return Icon(RizikIcons.badge, size: size, color: RizikColorScheme.festiveGold);
      case 'trophy':
        return Icon(RizikIcons.trophy, size: size, color: RizikColorScheme.festiveGold);
      case 'medal':
        return Icon(RizikIcons.medal, size: size, color: RizikColorScheme.festiveGold);
      case 'star':
        return Icon(RizikIcons.star, size: size, color: RizikColorScheme.festiveGold);
      case 'crown':
        return Icon(RizikIcons.crown, size: size, color: RizikColorScheme.festiveGold);
        
      // Character-based icons
      case 'shopkeeper':
        return Icon(RizikIcons.shopkeeper, size: size, color: defaultColor);
      case 'rider':
        return Icon(RizikIcons.rider, size: size, color: defaultColor);
      case 'consumer':
        return Icon(RizikIcons.consumer, size: size, color: defaultColor);
        
      // Status and notification icons
      case 'alert':
        return Icon(RizikIcons.alert, size: size, color: RizikColorScheme.error);
      case 'info':
        return Icon(RizikIcons.info, size: size, color: RizikColorScheme.info);
      case 'success':
        return Icon(RizikIcons.success, size: size, color: RizikColorScheme.success);
      case 'warning':
        return Icon(RizikIcons.warning, size: size, color: RizikColorScheme.warning);
        
      // Time and calendar icons
      case 'clock':
        return Icon(RizikIcons.clock, size: size, color: defaultColor);
      case 'calendar':
        return Icon(RizikIcons.calendar, size: size, color: defaultColor);
      case 'timer':
        return Icon(RizikIcons.timer, size: size, color: defaultColor);
        
      // Social and community icons
      case 'community':
        return Icon(RizikIcons.community, size: size, color: defaultColor);
      case 'group':
        return Icon(RizikIcons.group, size: size, color: defaultColor);
      case 'chat':
        return Icon(RizikIcons.chat, size: size, color: defaultColor);
      case 'review':
        return Icon(RizikIcons.review, size: size, color: RizikColorScheme.festiveGold);
        
      // Default case
      default:
        return Icon(Icons.help, size: size, color: defaultColor);
    }
  }

  /// Get a culturally relevant emoji for a specific context
  static String getEmoji(String type) {
    switch (type) {
      // Khata (ledger) related emojis
      case 'khata':
        return RizikEmojis.khata;
      case 'khata_flip':
        return RizikEmojis.khataFlip;
      case 'khata_write':
        return RizikEmojis.khataWrite;
      case 'khata_stamp':
        return RizikEmojis.khataStamp;
      case 'khata_tear':
        return RizikEmojis.khataTear;
        
      // Bengali cultural emojis
      case 'bengal_tiger':
        return RizikEmojis.bengalTiger;
      case 'rice':
        return RizikEmojis.rice;
      case 'fish':
        return RizikEmojis.fish;
      case 'boat':
        return RizikEmojis.boat;
      case 'banyan_tree':
        return RizikEmojis.banyanTree;
      case 'lotus':
        return RizikEmojis.lotus;
        
      // Festival and celebration emojis
      case 'eid':
        return RizikEmojis.eid;
      case 'pohela_boishakh':
        return RizikEmojis.pohelaBoishakh;
      case 'durga_puja':
        return RizikEmojis.durgaPuja;
      case 'firecracker':
        return RizikEmojis.firecracker;
      case 'lantern':
        return RizikEmojis.lantern;
        
      // Business and commerce emojis
      case 'shop':
        return RizikEmojis.shop;
      case 'cart':
        return RizikEmojis.cart;
      case 'delivery_bike':
        return RizikEmojis.deliveryBike;
      case 'delivery_boat':
        return RizikEmojis.deliveryBoat;
      case 'money_bag':
        return RizikEmojis.moneyBag;
      case 'taka':
        return RizikEmojis.taka;
        
      // Gamification and achievement emojis
      case 'badge':
        return RizikEmojis.badge;
      case 'trophy':
        return RizikEmojis.trophy;
      case 'medal':
        return RizikEmojis.medal;
      case 'star':
        return RizikEmojis.star;
      case 'crown':
        return RizikEmojis.crown;
        
      // Character-based emojis
      case 'shopkeeper':
        return RizikEmojis.shopkeeper;
      case 'rider':
        return RizikEmojis.rider;
      case 'consumer':
        return RizikEmojis.consumer;
      case 'farmer':
        return RizikEmojis.farmer;
      case 'fisherman':
        return RizikEmojis.fisherman;
        
      // Emotion and feedback emojis
      case 'happy':
        return RizikEmojis.happy;
      case 'sad':
        return RizikEmojis.sad;
      case 'surprised':
        return RizikEmojis.surprised;
      case 'angry':
        return RizikEmojis.angry;
      case 'love':
        return RizikEmojis.love;
      case 'excited':
        return RizikEmojis.excited;
      case 'thinking':
        return RizikEmojis.thinking;
        
      // Status and notification emojis
      case 'alert':
        return RizikEmojis.alert;
      case 'info':
        return RizikEmojis.info;
      case 'success':
        return RizikEmojis.success;
      case 'warning':
        return RizikEmojis.warning;
      case 'error':
        return RizikEmojis.error;
        
      // Time and calendar emojis
      case 'clock':
        return RizikEmojis.clock;
      case 'calendar':
        return RizikEmojis.calendar;
      case 'timer':
        return RizikEmojis.timer;
      case 'deadline':
        return RizikEmojis.deadline;
        
      // Social and community emojis
      case 'community':
        return RizikEmojis.community;
      case 'group':
        return RizikEmojis.group;
      case 'chat':
        return RizikEmojis.chat;
      case 'review':
        return RizikEmojis.review;
      case 'share':
        return RizikEmojis.share;
        
      // Food-related emojis
      case 'biryani':
        return RizikEmojis.biryani;
      case 'fish_curry':
        return RizikEmojis.fishCurry;
      case 'dal':
        return RizikEmojis.dal;
      case 'roti':
        return RizikEmojis.roti;
      case 'vegetable':
        return RizikEmojis.vegetable;
        
      // Celebration and reward emojis
      case 'celebration':
        return RizikEmojis.celebration;
      case 'gift':
        return RizikEmojis.gift;
      case 'fireworks':
        return RizikEmojis.fireworks;
      case 'confetti':
        return RizikEmojis.confetti;
      case 'red_packet':
        return RizikEmojis.redPacket;
        
      // Default case
      default:
        return '❓';
    }
  }

  /// Get a combination of icon and emoji for maximum cultural relevance
  static Widget getIconWithEmoji(
    BuildContext context, {
    required String iconType,
    required String emojiType,
    double iconSize = 24.0,
    double emojiSize = 16.0,
    Color? iconColor,
  }) {
    return Stack(
      alignment: Alignment.center,
      children: [
        getIcon(
          context,
          type: iconType,
          size: iconSize,
          color: iconColor,
        ),
        Positioned(
          right: 0,
          bottom: 0,
          child: Text(
            getEmoji(emojiType),
            style: TextStyle(fontSize: emojiSize),
          ),
        ),
      ],
    );
  }
}