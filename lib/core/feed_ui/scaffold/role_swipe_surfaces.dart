import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';
import 'package:rizik_v4/data/remote/supabase/sdui_service.dart';

class ReelScene {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> colors;
  final String actionLabel;
  final String actionRoute;

  const ReelScene({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.colors,
    required this.actionLabel,
    required this.actionRoute,
  });
}

class RoleSurfaceBundle {
  final List<ReelScene> center;
  final List<SideCardData> left;
  final List<SideCardData> right;

  const RoleSurfaceBundle({
    required this.center,
    required this.left,
    required this.right,
  });
}

class RuntimeMetricsSnapshot {
  final int totalOrders;
  final int activeOrders;
  final int completedOrders;
  final double deliveredOrderTotal;
  final double walletBalance;
  final int squadCount;
  final int lowStockCount;
  final int chatUnreadCount;
  final int squadAlertCount;

  const RuntimeMetricsSnapshot({
    required this.totalOrders,
    required this.activeOrders,
    required this.completedOrders,
    required this.deliveredOrderTotal,
    required this.walletBalance,
    required this.squadCount,
    required this.lowStockCount,
    required this.chatUnreadCount,
    required this.squadAlertCount,
  });
}

class RoleSwipeSurfaces {
  static Future<RoleSurfaceBundle> load(UserRole role) async {
    final fallback = RoleSurfaceBundle(
      center: centerFeed(role),
      left: leftManagement(role),
      right: rightFinance(role),
    );

    try {
      final service = SduiService();
      final roleKey = role.name;

      // Primary: single aggregate payload under one screen id.
      final payload =
          await service.fetchScreen(roleKey, screenId: 'feed_surfaces');
      final center = _parseCenter(payload['center']);
      final left = _parseSide(payload['left']);
      final right = _parseSide(payload['right']);

      if (center.isNotEmpty || left.isNotEmpty || right.isNotEmpty) {
        return RoleSurfaceBundle(
          center: center.isEmpty ? fallback.center : center,
          left: left.isEmpty ? fallback.left : left,
          right: right.isEmpty ? fallback.right : right,
        );
      }
    } catch (_) {
      // Fallback to segmented payload shape.
    }

    try {
      final service = SduiService();
      final roleKey = role.name;
      final centerPayload =
          await service.fetchScreen(roleKey, screenId: 'feed_center');
      final leftPayload =
          await service.fetchScreen(roleKey, screenId: 'feed_left');
      final rightPayload =
          await service.fetchScreen(roleKey, screenId: 'feed_right');

      final center =
          _parseCenter(centerPayload['items'] ?? centerPayload['center']);
      final left = _parseSide(leftPayload['items'] ?? leftPayload['left']);
      final right = _parseSide(rightPayload['items'] ?? rightPayload['right']);

      return RoleSurfaceBundle(
        center: center.isEmpty ? fallback.center : center,
        left: left.isEmpty ? fallback.left : left,
        right: right.isEmpty ? fallback.right : right,
      );
    } catch (error) {
      debugPrint('Role surface SDUI fallback used: $error');
      return fallback;
    }
  }

  static List<ReelScene> _parseCenter(dynamic raw) {
    if (raw is! List) {
      return const [];
    }
    final scenes = <ReelScene>[];
    for (final item in raw) {
      if (item is! Map) {
        continue;
      }
      final map = Map<String, dynamic>.from(item);
      scenes.add(
        ReelScene(
          title: _asString(map['title'], fallback: 'Rizik Scene'),
          subtitle: _asString(map['subtitle'], fallback: 'Swipe to continue'),
          icon: _parseIcon(map['icon']),
          colors: _parseColors(map['colors']),
          actionLabel: _asString(
            map['actionLabel'] ?? map['action_label'],
            fallback: 'Open',
          ),
          actionRoute: _asString(
            map['actionRoute'] ?? map['action_route'],
            fallback: '/seeker',
          ),
        ),
      );
    }
    return scenes;
  }

  static List<SideCardData> _parseSide(dynamic raw) {
    if (raw is! List) {
      return const [];
    }
    final cards = <SideCardData>[];
    for (final item in raw) {
      if (item is! Map) {
        continue;
      }
      final map = Map<String, dynamic>.from(item);
      cards.add(
        SideCardData(
          _asString(map['title'], fallback: 'Open'),
          _parseIcon(map['icon']),
          _asString(map['route'], fallback: '/seeker'),
          metricValue: _nullableString(map['value'] ?? map['metric_value']),
          metricLabel: _nullableString(map['label'] ?? map['metric_label']),
          metricKey: _nullableString(map['metricKey'] ?? map['metric_key']),
        ),
      );
    }
    return cards;
  }

  static RoleSurfaceBundle hydrateWithMetrics(
    RoleSurfaceBundle base,
    UserRole role,
    RuntimeMetricsSnapshot metrics,
  ) {
    return RoleSurfaceBundle(
      center: base.center,
      left: _hydrateSide(base.left, role, metrics, isRightSurface: false),
      right: _hydrateSide(base.right, role, metrics, isRightSurface: true),
    );
  }

  static List<SideCardData> _hydrateSide(
    List<SideCardData> cards,
    UserRole role,
    RuntimeMetricsSnapshot metrics, {
    required bool isRightSurface,
  }) {
    return cards.map((card) {
      final titleKey = card.title.toLowerCase();
      final metricKey = card.metricKey;
      switch (role) {
        case UserRole.seeker:
          if (!isRightSurface && metricKey == 'chat_unread_count') {
            return card.copyWith(
              metricValue: '${metrics.chatUnreadCount}',
              metricLabel: 'unread messages',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'squad_count' || titleKey.contains('squad'))) {
            return card.copyWith(
              metricValue: '${metrics.squadCount}',
              metricLabel: 'joined squads',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'active_orders' || titleKey.contains('mess'))) {
            return card.copyWith(
              metricValue: '${metrics.activeOrders}',
              metricLabel: 'active orders',
            );
          }
          if (isRightSurface &&
              (metricKey == 'delivered_spend' || titleKey.contains('khata'))) {
            return card.copyWith(
              metricValue: _fmtMoney(metrics.deliveredOrderTotal),
              metricLabel: 'delivered spend',
            );
          }
          if (isRightSurface &&
              (metricKey == 'wallet_balance' || titleKey.contains('wallet'))) {
            return card.copyWith(
              metricValue: _fmtMoney(metrics.walletBalance),
              metricLabel: 'available',
            );
          }
          if (isRightSurface &&
              (metricKey == 'closed_orders' || titleKey.contains('safe'))) {
            return card.copyWith(
              metricValue: '${metrics.completedOrders}',
              metricLabel: 'closed orders',
            );
          }
          return card;
        case UserRole.force:
          if (!isRightSurface && metricKey == 'chat_unread_count') {
            return card.copyWith(
              metricValue: '${metrics.chatUnreadCount}',
              metricLabel: 'unread messages',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'squad_count' || titleKey.contains('team'))) {
            return card.copyWith(
              metricValue: '${metrics.squadCount}',
              metricLabel: 'active squads',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'open_missions' || titleKey.contains('gig'))) {
            return card.copyWith(
              metricValue: '${metrics.activeOrders}',
              metricLabel: 'open missions',
            );
          }
          if (isRightSurface &&
              (metricKey == 'rider_earnings_est' ||
                  titleKey.contains('today earning'))) {
            final gross = metrics.deliveredOrderTotal * 0.12;
            return card.copyWith(
              metricValue: _fmtMoney(gross),
              metricLabel: 'est. rider share',
            );
          }
          if (isRightSurface &&
              (metricKey == 'withdrawable_balance' ||
                  titleKey.contains('cash'))) {
            return card.copyWith(
              metricValue: _fmtMoney(metrics.walletBalance),
              metricLabel: 'withdrawable',
            );
          }
          if (isRightSurface &&
              (metricKey == 'payout_entries' || titleKey.contains('khata'))) {
            return card.copyWith(
              metricValue: '${metrics.completedOrders}',
              metricLabel: 'payout entries',
            );
          }
          return card;
        case UserRole.source:
          if (!isRightSurface && metricKey == 'chat_unread_count') {
            return card.copyWith(
              metricValue: '${metrics.chatUnreadCount}',
              metricLabel: 'unread messages',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'team_units' || titleKey.contains('staff'))) {
            return card.copyWith(
              metricValue: '${metrics.squadCount}',
              metricLabel: 'team units',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'squad_alerts' || titleKey.contains('squad'))) {
            return card.copyWith(
              metricValue: '${metrics.squadAlertCount}',
              metricLabel: 'live alerts',
            );
          }
          if (!isRightSurface &&
              (metricKey == 'low_stock_count' ||
                  titleKey.contains('inventory'))) {
            return card.copyWith(
              metricValue: '${metrics.lowStockCount}',
              metricLabel: 'low stock',
            );
          }
          if (isRightSurface &&
              (metricKey == 'net_profit_est' || titleKey.contains('profit'))) {
            final net = metrics.deliveredOrderTotal * 0.78;
            return card.copyWith(
              metricValue: _fmtMoney(net),
              metricLabel: 'est. net',
            );
          }
          if (isRightSurface &&
              (metricKey == 'wallet_balance' || titleKey.contains('wallet'))) {
            return card.copyWith(
              metricValue: _fmtMoney(metrics.walletBalance),
              metricLabel: 'business balance',
            );
          }
          if (isRightSurface &&
              (metricKey == 'closed_deals' || titleKey.contains('asset'))) {
            return card.copyWith(
              metricValue: '${metrics.completedOrders}',
              metricLabel: 'closed deals',
            );
          }
          return card;
      }
    }).toList();
  }

  static String _asString(dynamic value, {required String fallback}) {
    final text = value?.toString().trim();
    return (text == null || text.isEmpty) ? fallback : text;
  }

  static String? _nullableString(dynamic value) {
    final text = value?.toString().trim();
    if (text == null || text.isEmpty) {
      return null;
    }
    return text;
  }

  static List<Color> _parseColors(dynamic raw) {
    if (raw is! List) {
      return const [Color(0xFF111827), Color(0xFF374151)];
    }

    final parsed = raw
        .map((entry) => _parseColor(entry?.toString()))
        .whereType<Color>()
        .toList();

    if (parsed.length >= 2) {
      return parsed;
    }
    return const [Color(0xFF111827), Color(0xFF374151)];
  }

  static Color? _parseColor(String? value) {
    if (value == null || value.isEmpty) {
      return null;
    }
    final normalized = value.replaceAll('#', '').trim();
    if (normalized.length == 6) {
      return Color(int.parse('FF$normalized', radix: 16));
    }
    if (normalized.length == 8) {
      return Color(int.parse(normalized, radix: 16));
    }
    return null;
  }

  static String _fmtMoney(double amount) {
    if (amount >= 1000) {
      return '৳${(amount / 1000).toStringAsFixed(1)}k';
    }
    return '৳${amount.toStringAsFixed(0)}';
  }

  static IconData _parseIcon(dynamic value) {
    final key = value?.toString().toLowerCase();
    const iconMap = <String, IconData>{
      'work': Icons.work_outline,
      'delivery': Icons.local_shipping_outlined,
      'skill': Icons.school_outlined,
      'store': Icons.storefront_outlined,
      'inventory': Icons.inventory_2_outlined,
      'profit': Icons.trending_up,
      'play': Icons.play_circle_outline,
      'ride': Icons.two_wheeler_outlined,
      'squad': Icons.groups_2_outlined,
      'wallet': Icons.account_balance_wallet_outlined,
      'earnings': Icons.payments_outlined,
      'khata': Icons.book_outlined,
      'chat': Icons.chat_outlined,
      'control': Icons.dashboard_outlined,
    };
    return iconMap[key] ?? Icons.blur_on;
  }

  static List<ReelScene> centerFeed(UserRole role) {
    switch (role) {
      case UserRole.force:
        return const [
          ReelScene(
            title: 'Opportunity Feed',
            subtitle: 'Swipe up for next mission. Double tap to accept.',
            icon: Icons.work_outline,
            // Neutral iOS-dark base (avoid neon/green wash).
            colors: [Color(0xFF0B1119), Color(0xFF141C26)],
            actionLabel: 'Open Gigs',
            actionRoute: '/force/gig/sample',
          ),
          ReelScene(
            title: 'Delivery Burst',
            subtitle: 'Nearby route live. Fast response earns more.',
            icon: Icons.local_shipping_outlined,
            colors: [Color(0xFF0C1018), Color(0xFF161F2C)],
            actionLabel: 'Open Missions',
            actionRoute: '/force',
          ),
          ReelScene(
            title: 'Skill Drill',
            subtitle: 'Short upgrade task. Earn XP + better payout tier.',
            icon: Icons.school_outlined,
            colors: [Color(0xFF0E1420), Color(0xFF1A2533)],
            actionLabel: 'Start Training',
            actionRoute: '/force',
          ),
        ];
      case UserRole.source:
        return const [
          ReelScene(
            title: 'Business Feed',
            subtitle: 'Live demand and stock intelligence.',
            icon: Icons.storefront_outlined,
            colors: [Color(0xFF0B1119), Color(0xFF141C26)],
            actionLabel: 'Open Source Hub',
            actionRoute: '/source',
          ),
          ReelScene(
            title: 'Inventory Trigger',
            subtitle: 'Low stock alert detected. Restock opportunity active.',
            icon: Icons.inventory_2_outlined,
            colors: [Color(0xFF0C1018), Color(0xFF161F2C)],
            actionLabel: 'Open Inventory',
            actionRoute: '/inventory',
          ),
          ReelScene(
            title: 'Profit Signal',
            subtitle: 'Margin insight + market pulse for tonight.',
            icon: Icons.trending_up,
            colors: [Color(0xFF0E1420), Color(0xFF1A2533)],
            actionLabel: 'Open Profit',
            actionRoute: '/source',
          ),
        ];
      case UserRole.seeker:
        return const [
          ReelScene(
            title: 'Rizik Now Feed',
            subtitle: 'Hot food, ride offers, and social picks.',
            icon: Icons.play_circle_outline,
            colors: [Color(0xFF0B1119), Color(0xFF141C26)],
            actionLabel: 'Open Seeker',
            actionRoute: '/seeker',
          ),
          ReelScene(
            title: 'Quick Ride',
            subtitle: 'Closest rider in motion. Tap to lock route.',
            icon: Icons.two_wheeler_outlined,
            colors: [Color(0xFF0C1018), Color(0xFF161F2C)],
            actionLabel: 'Track Order',
            actionRoute: '/seeker/order/sample',
          ),
          ReelScene(
            title: 'Social Boost',
            subtitle: 'Friend review + offer fusion. FOMO optimized.',
            icon: Icons.groups_2_outlined,
            colors: [Color(0xFF0E1420), Color(0xFF1A2533)],
            actionLabel: 'Open Squad',
            actionRoute: '/squad/dashboard',
          ),
        ];
    }
  }

  static List<SideCardData> leftManagement(UserRole role) {
    switch (role) {
      case UserRole.force:
        return const [
          SideCardData('Team Ops', Icons.groups_outlined, '/squad/dashboard'),
          SideCardData('Squad Chat', Icons.chat_bubble_outline, '/chat'),
          SideCardData('Gig Pipeline', Icons.view_kanban_outlined, '/force'),
        ];
      case UserRole.source:
        return const [
          SideCardData('Staff Control', Icons.badge_outlined, '/source'),
          SideCardData(
              'Inventory Ops', Icons.inventory_2_outlined, '/inventory'),
          SideCardData(
              'Squad Board', Icons.dashboard_outlined, '/squad/dashboard'),
        ];
      case UserRole.seeker:
        return const [
          SideCardData('Squad Hub', Icons.groups_outlined, '/squad/dashboard'),
          SideCardData('Mess Board', Icons.home_work_outlined, '/seeker'),
          SideCardData('Live Chat', Icons.chat_outlined, '/chat'),
        ];
    }
  }

  static List<SideCardData> rightFinance(UserRole role) {
    switch (role) {
      case UserRole.force:
        return const [
          SideCardData('Today Earnings', Icons.payments_outlined, '/force'),
          SideCardData(
              'Cash Out', Icons.account_balance_wallet_outlined, '/force'),
          SideCardData('Income Khata', Icons.receipt_long_outlined, '/force'),
        ];
      case UserRole.source:
        return const [
          SideCardData('Profit Ledger', Icons.auto_graph_outlined, '/source'),
          SideCardData('Business Wallet', Icons.wallet_outlined, '/source'),
          SideCardData('Asset Rent', Icons.house_siding_outlined, '/source'),
        ];
      case UserRole.seeker:
        return const [
          SideCardData('Spending Khata', Icons.book_outlined, '/seeker'),
          SideCardData(
              'Wallet', Icons.account_balance_wallet_outlined, '/seeker'),
          SideCardData('Safe Deal', Icons.verified_user_outlined, '/seeker'),
        ];
    }
  }
}

class RoleCenterVerticalFeed extends StatefulWidget {
  final List<ReelScene> scenes;
  final VoidCallback? onSwipeLeft;
  final VoidCallback? onSwipeRight;
  final bool enableHorizontalSwipe;

  const RoleCenterVerticalFeed({
    super.key,
    required this.scenes,
    this.onSwipeLeft,
    this.onSwipeRight,
    this.enableHorizontalSwipe = true,
  });

  @override
  State<RoleCenterVerticalFeed> createState() => _RoleCenterVerticalFeedState();
}

class _RoleCenterVerticalFeedState extends State<RoleCenterVerticalFeed> {
  late final PageController _controller;
  double _page = 0;
  double _dragDx = 0;
  bool _swipeConsumed = false;

  @override
  void initState() {
    super.initState();
    _controller = PageController();
    _controller.addListener(() {
      setState(() {
        _page = _controller.page ?? 0;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scenes = widget.scenes;

    return PageView.builder(
      controller: _controller,
      scrollDirection: Axis.vertical,
      physics: const BouncingScrollPhysics(parent: PageScrollPhysics()),
      pageSnapping: true,
      allowImplicitScrolling: true,
      itemCount: scenes.length,
      itemBuilder: (context, index) {
        final scene = scenes[index];
        final distance = (_page - index).abs().clamp(0.0, 1.0);
        final scale = 1.0 - (distance * 0.06);
        final opacity = 1.0 - (distance * 0.25);

        return Transform.scale(
          scale: scale,
          child: Opacity(
            opacity: opacity,
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onHorizontalDragStart: widget.enableHorizontalSwipe
                  ? (_) {
                      _dragDx = 0;
                      _swipeConsumed = false;
                    }
                  : null,
              onHorizontalDragUpdate: widget.enableHorizontalSwipe
                  ? (details) {
                      if (_swipeConsumed) {
                        return;
                      }
                      _dragDx += details.delta.dx;
                      if (_dragDx <= -42) {
                        _swipeConsumed = true;
                        widget.onSwipeLeft?.call();
                      } else if (_dragDx >= 42) {
                        _swipeConsumed = true;
                        widget.onSwipeRight?.call();
                      }
                    }
                  : null,
              onHorizontalDragEnd: widget.enableHorizontalSwipe
                  ? (details) {
                      final vx = details.primaryVelocity ?? 0;
                      if (_swipeConsumed) {
                        return;
                      }
                      if (vx < -150 || _dragDx <= -36) {
                        widget.onSwipeLeft?.call();
                      } else if (vx > 150 || _dragDx >= 36) {
                        widget.onSwipeRight?.call();
                      }
                    }
                  : null,
              child: _ReelSceneCard(scene: scene),
            ),
          ),
        );
      },
    );
  }
}

class RoleSidePanel extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<SideCardData> cards;
  final Color accent;

  const RoleSidePanel({
    super.key,
    required this.title,
    required this.subtitle,
    required this.cards,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 112, 14, 124),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            subtitle.replaceAll('swipe:', 'Swipe:'),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.74),
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 14),
          ...cards.map(
            (card) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () => context.go(card.route),
                  child: Ink(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 11,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      color: Colors.white.withValues(alpha: 0.12),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.18),
                        width: 0.8,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(9),
                            color: Colors.white.withValues(alpha: 0.13),
                          ),
                          child: Icon(card.icon, color: Colors.white, size: 18),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                card.title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: -0.1,
                                ),
                              ),
                              if (card.metricLabel != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  card.metricLabel!,
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.65),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (card.metricValue != null)
                          Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 9,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: accent.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: accent.withValues(alpha: 0.38),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              card.metricValue!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        Icon(
                          Icons.chevron_right,
                          color: Colors.white.withValues(alpha: 0.68),
                          size: 18,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReelSceneCard extends StatelessWidget {
  final ReelScene scene;

  const _ReelSceneCard({required this.scene});

  @override
  Widget build(BuildContext context) {
    final chips = _buildChips(scene.title);

    // TikTok-like full-bleed overlay: let the cinematic backdrop do the heavy
    // lifting, and keep this surface as clean iOS glass + scrim.
    return Stack(
      children: [
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  scene.colors.first.withValues(alpha: 0.12),
                  scene.colors.last.withValues(alpha: 0.10),
                ],
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.26),
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.46),
                ],
                stops: const [0.0, 0.52, 1.0],
              ),
            ),
          ),
        ),
        Positioned(
          top: 104,
          left: 14,
          right: 70,
          child: Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _chip('Following', selected: true),
              _chip('Live'),
              ...chips.map((e) => _chip(e)),
            ],
          ),
        ),
        const Positioned(
          right: 12,
          bottom: 128,
          child: Column(
            children: [
              _RailAction(icon: Icons.favorite_border_rounded, label: '15.4K'),
              SizedBox(height: 12),
              _RailAction(icon: Icons.mode_comment_outlined, label: '892'),
              SizedBox(height: 12),
              _RailAction(icon: Icons.reply_rounded, label: '1.5K'),
            ],
          ),
        ),
        Positioned(
          left: 14,
          right: 72,
          bottom: 124,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.16),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.14),
                        width: 0.8,
                      ),
                    ),
                    child: Icon(scene.icon, color: Colors.white, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '@Rizik',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.96),
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.1,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                scene.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  height: 1.12,
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                scene.subtitle,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.82),
                  fontSize: 13,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 10),
              FilledButton.tonalIcon(
                onPressed: () => context.go(scene.actionRoute),
                icon: const Icon(Icons.arrow_right_alt, size: 17),
                label: Text(scene.actionLabel),
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: 0.18),
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  textStyle: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 12.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  List<String> _buildChips(String title) {
    final text = title.toLowerCase();
    if (text.contains('business') || text.contains('inventory')) {
      return const ['Source', 'Market'];
    }
    if (text.contains('delivery') || text.contains('opportunity')) {
      return const ['Force', 'Gig'];
    }
    if (text.contains('ride') || text.contains('food')) {
      return const ['Food', 'Ride'];
    }
    return const ['All', 'Feed'];
  }

  Widget _chip(String text, {bool selected = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: selected
            ? Colors.white.withValues(alpha: 0.88)
            : Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: Colors.white.withValues(alpha: selected ? 0.18 : 0.16),
          width: 0.8,
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: selected
              ? const Color(0xFF111827)
              : Colors.white.withValues(alpha: 0.84),
          fontSize: 11,
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
        ),
      ),
    );
  }
}

class _RailAction extends StatelessWidget {
  final IconData icon;
  final String label;

  const _RailAction({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white.withValues(alpha: 0.09),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.16),
              width: 0.8,
            ),
          ),
          child: Icon(icon, color: Colors.white, size: 18),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.9),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class SideCardData {
  final String title;
  final IconData icon;
  final String route;
  final String? metricValue;
  final String? metricLabel;
  final String? metricKey;

  const SideCardData(
    this.title,
    this.icon,
    this.route, {
    this.metricValue,
    this.metricLabel,
    this.metricKey,
  });

  SideCardData copyWith({
    String? title,
    IconData? icon,
    String? route,
    String? metricValue,
    String? metricLabel,
    String? metricKey,
  }) {
    return SideCardData(
      title ?? this.title,
      icon ?? this.icon,
      route ?? this.route,
      metricValue: metricValue ?? this.metricValue,
      metricLabel: metricLabel ?? this.metricLabel,
      metricKey: metricKey ?? this.metricKey,
    );
  }
}
