import 'package:flutter/material.dart';

/// Action types for Universal Action Overlay
enum ActionType {
  cart,
  squad,
  save,
  bid,
  accept,
  share,
  remind,
  watch,
  contact,
}

/// Model for action items in the radial overlay menu
class ActionItem {
  final ActionType type;
  final IconData icon;
  final String label;
  final Color color;
  final dynamic actionData; // Card-specific data to pass to action handler

  const ActionItem({
    required this.type,
    required this.icon,
    required this.label,
    required this.color,
    this.actionData,
  });

  /// Factory constructors for common actions
  static ActionItem cart({dynamic data}) => ActionItem(
        type: ActionType.cart,
        icon: Icons.shopping_cart,
        label: 'Cart',
        color: Colors.orange,
        actionData: data,
      );

  static ActionItem squad({dynamic data}) => ActionItem(
        type: ActionType.squad,
        icon: Icons.group,
        label: 'Squad',
        color: Colors.purple,
        actionData: data,
      );

  static ActionItem save({dynamic data}) => ActionItem(
        type: ActionType.save,
        icon: Icons.bookmark,
        label: 'Save',
        color: Colors.blue,
        actionData: data,
      );

  static ActionItem bid({dynamic data}) => ActionItem(
        type: ActionType.bid,
        icon: Icons.gavel,
        label: 'Bid',
        color: Colors.green,
        actionData: data,
      );

  static ActionItem accept({dynamic data}) => ActionItem(
        type: ActionType.accept,
        icon: Icons.check_circle,
        label: 'Accept',
        color: Colors.green,
        actionData: data,
      );

  static ActionItem share({dynamic data}) => ActionItem(
        type: ActionType.share,
        icon: Icons.share,
        label: 'Share',
        color: Colors.blue.shade300,
        actionData: data,
      );

  static ActionItem remind({dynamic data}) => ActionItem(
        type: ActionType.remind,
        icon: Icons.alarm,
        label: 'Remind',
        color: Colors.amber,
        actionData: data,
      );

  static ActionItem watch({dynamic data}) => ActionItem(
        type: ActionType.watch,
        icon: Icons.visibility,
        label: 'Watch',
        color: Colors.indigo,
        actionData: data,
      );

  static ActionItem contact({dynamic data}) => ActionItem(
        type: ActionType.contact,
        icon: Icons.message,
        label: 'Contact',
        color: Colors.teal,
        actionData: data,
      );
}
