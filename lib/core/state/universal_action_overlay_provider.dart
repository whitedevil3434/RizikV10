import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/action_item.dart';
import 'package:rizik_v4/core/state/omni_present_backpack_provider.dart';

/// Provider for managing Universal Action Overlay state
class UniversalActionOverlayProvider with ChangeNotifier {
  bool _isVisible = false;
  Offset _position = Offset.zero;
  List<ActionItem> _actions = [];

  bool get isVisible => _isVisible;
  Offset get position => _position;
  List<ActionItem> get actions => _actions;

  /// Show the overlay at a specific position with given actions
  void showOverlay({
    required BuildContext context,
    required Offset position,
    required List<ActionItem> actions,
  }) {
    _position = position;
    _actions = actions;
    _isVisible = true;
    notifyListeners();
  }

  /// Hide the overlay
  void hideOverlay() {
    _isVisible = false;
    notifyListeners();
  }

  /// Execute an action and route to appropriate provider
  Future<void> executeAction({
    required BuildContext context,
    required ActionItem action,
  }) async {
    hideOverlay();

    switch (action.type) {
      case ActionType.cart:
        await _handleCartAction(context, action);
        break;
      case ActionType.squad:
        await _handleSquadAction(context, action);
        break;
      case ActionType.save:
        await _handleSaveAction(context, action);
        break;
      case ActionType.bid:
        await _handleBidAction(context, action);
        break;
      case ActionType.accept:
        await _handleAcceptAction(context, action);
        break;
      case ActionType.share:
        await _handleShareAction(context, action);
        break;
      case ActionType.remind:
        await _handleRemindAction(context, action);
        break;
      case ActionType.watch:
        await _handleWatchAction(context, action);
        break;
      case ActionType.contact:
        await _handleContactAction(context, action);
        break;
    }
  }

  Future<void> _handleCartAction(BuildContext context, ActionItem action) async {
    // TODO: Integrate with OmniPresentBackpackProvider
    // For now, show a snackbar
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🛒 Added to cart!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleSquadAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('👥 Shared with squad!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleSaveAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🔖 Saved for later!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleBidAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('💰 Opening bid screen...'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleAcceptAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Mission accepted!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleShareAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('📤 Sharing...'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleRemindAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⏰ Reminder set!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleWatchAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('👁️ Watching this item!'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }

  Future<void> _handleContactAction(BuildContext context, ActionItem action) async {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('💬 Opening chat...'),
          duration: Duration(milliseconds: 1500),
        ),
      );
    }
  }
}
