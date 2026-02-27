import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';
import 'package:rizik_v4/core/theme/morph_engine.dart';
import 'package:rizik_v4/shared/widgets/headers/rizik_glass_top_bar.dart';
import 'package:rizik_v4/shared/widgets/navigation/rizik_glass_nav.dart';
import 'package:rizik_v4/core/ai/presentation/mojo_floating_widget.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/dictation_overlay.dart';
import 'package:rizik_v4/core/feed_ui/components/cinematic_video_backdrop.dart';
import 'package:rizik_v4/core/feed_ui/components/edge_animations.dart';
import 'package:rizik_v4/core/feed_ui/scaffold/role_swipe_surfaces.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/features/force/team_ops/logic/squad_provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';
import 'package:rizik_v4/features/source/inventory/logic/inventory_provider.dart';
import 'package:rizik_v4/features/connect/logic/chat_badge_provider.dart';
import 'package:rizik_v4/features/squad/logic/squad_alert_provider.dart';
import 'package:provider/provider.dart' as provider_pkg;

/// RizikScaffold - The Living App Shell
///
/// Architecture:
/// - Cinematic video background
/// - 4-side edge animations
/// - Glass top bar
/// - Minimalist 2-button navigation (Orders | Mojo | Wallet)
class RizikScaffold extends ConsumerStatefulWidget {
  final String initialRole;
  const RizikScaffold({super.key, this.initialRole = 'seeker'});

  @override
  ConsumerState<RizikScaffold> createState() => _RizikScaffoldState();
}

class _RizikScaffoldState extends ConsumerState<RizikScaffold> {
  // 0 = Orders (left), 1 = Wallet (right)
  // 2 = Home (default, center)
  int _selectedIndex = 2;
  late final PageController _horizontalController;
  Future<RoleSurfaceBundle>? _surfaceFuture;
  UserRole? _surfaceRole;
  Timer? _surfaceRefreshTimer;
  int _surfaceCenterIndex = 0;
  bool _didInitialCenterSnap = false;
  int _currentHorizontalPage = 0;
  int _lastLeftCount = 0;
  int _lastRightCount = 0;

  @override
  void initState() {
    super.initState();
    _horizontalController = PageController(initialPage: 0);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(userRoleProvider.notifier).setRoleFromString(widget.initialRole);
      _reloadSurfaceBundle();
      try {
        provider_pkg.Provider.of<SquadProvider>(context, listen: false)
            .loadSquads();
      } catch (_) {
        // No-op if provider scope is unavailable in a test harness.
      }
    });
    _surfaceRefreshTimer = Timer.periodic(
      const Duration(seconds: 25),
      (_) => _reloadSurfaceBundle(),
    );
  }

  @override
  void dispose() {
    _surfaceRefreshTimer?.cancel();
    _horizontalController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(RizikScaffold oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialRole != widget.initialRole) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref
            .read(userRoleProvider.notifier)
            .setRoleFromString(widget.initialRole);
      });
    }
  }

  void _ensureSurfaceFuture(UserRole role) {
    if (_surfaceRole == role && _surfaceFuture != null) {
      return;
    }
    _surfaceRole = role;
    _surfaceFuture = RoleSwipeSurfaces.load(role);
  }

  void _reloadSurfaceBundle() {
    if (!mounted) {
      return;
    }
    final role = ref.read(userRoleProvider);
    _surfaceRole = role;
    try {
      final orders = provider_pkg.Provider.of<OrderProvider>(
        context,
        listen: false,
      );
      final inventory = provider_pkg.Provider.of<InventoryProvider>(
        context,
        listen: false,
      );
      final squad = provider_pkg.Provider.of<SquadProvider>(
        context,
        listen: false,
      );
      provider_pkg.Provider.of<SquadAlertProvider>(context, listen: false)
          .recompute(
        lowStockCount: inventory.lowStockItems.length,
        activeOrders: orders.activeOrders.length,
        hasSquadError: squad.error != null,
      );
    } catch (_) {
      // No-op if providers are not available in this tree.
    }
    setState(() {
      _surfaceFuture = RoleSwipeSurfaces.load(role);
    });
  }

  void _onNavIndexChanged(int index) {
    // Keep nav behavior stable: Orders (left) and Wallet (right) jump to
    // the first screen on that side, center jumps to the reel surface.
    if (index == 0) {
      _horizontalController.animateToPage(
        0,
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutQuint,
      );
      setState(() => _selectedIndex = 0);
      return;
    }
    if (index == 1) {
      // Wallet side is the first right surface (center+1 once surfaces loaded).
      final target = (_surfaceCenterIndex + 1).clamp(0, 9999);
      _horizontalController.animateToPage(
        target,
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutQuint,
      );
      setState(() => _selectedIndex = 1);
      return;
    }
    _horizontalController.animateToPage(
      _surfaceCenterIndex,
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutQuint,
    );
    setState(() => _selectedIndex = 2);
  }

  @override
  Widget build(BuildContext context) {
    final morph = ref.watch(morphEngineProvider);
    final role = ref.watch(userRoleProvider);
    _ensureSurfaceFuture(role);

    return Scaffold(
      backgroundColor: Colors.black,
      extendBody: true,
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Layer 1: Cinematic Video Background
          _buildCinematicBackground(morph),

          // Layer 2: 4-Side Edge Animations
          const EdgeAnimations(),

          // Layer 3: Glass Top Bar
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: RizikGlassTopBar(),
          ),

          // Layer 4: Body Content (with safe area)
          Positioned.fill(
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.only(top: 8), // Below top bar
                child: _buildBody(role),
              ),
            ),
          ),

          // Layer 5: Dictation Overlay
          const DictationOverlay(),

          // Layer 6: Glass Bottom Navigation
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: RizikGlassNav(
                selectedIndex: _selectedIndex,
                onIndexChanged: _onNavIndexChanged,
              ),
            ),
          ),

          // Layer 7: Swipe Handoff Hint
          Positioned(
            bottom: 136,
            left: 0,
            right: 0,
            child: Center(child: _SwipeHintPill(label: _swipeHint(role))),
          ),

          // Layer 7: Mojo Orb (Center floating)
          const Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(child: MojoFloatingWidget()),
          ),
        ],
      ),
    );
  }

  Widget _buildCinematicBackground(MorphEngine morph) {
    // Living UI Engine - Cinematic Video Background
    const String sampleVideoUrl =
        'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4';

    return CinematicVideoBackdrop(
      videoUrl: sampleVideoUrl,
      looping: true,
      showGlassOverlay: true,
      glassBlur: 20,
      glassOpacity: 0.74,
      fallbackWidget: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0B1119),
              Color(0xFF141C26),
              Color(0xFF1A2531),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(UserRole role) {
    final accent = role == UserRole.force
        ? Colors.blueAccent
        : (role == UserRole.source ? Colors.amberAccent : Colors.greenAccent);

    return provider_pkg.Consumer6<
        OrderProvider,
        MoneybagProvider,
        SquadProvider,
        InventoryProvider,
        ChatBadgeProvider,
        SquadAlertProvider>(
      builder: (context, orders, moneybag, squad, inventory, chatBadge,
          squadAlerts, _) {
        final deliveredOrders = orders.completedOrders
            .where((o) => o.status.name == 'delivered')
            .toList();
        final deliveredTotal = deliveredOrders.fold<double>(
          0,
          (sum, order) => sum + order.total,
        );
        final runtimeMetrics = RuntimeMetricsSnapshot(
          totalOrders: orders.orders.length,
          activeOrders: orders.activeOrders.length,
          completedOrders: deliveredOrders.length,
          deliveredOrderTotal: deliveredTotal,
          walletBalance: moneybag.totalBalance,
          squadCount: squad.squads.length,
          lowStockCount: inventory.lowStockItems.length,
          chatUnreadCount: chatBadge.unreadCount,
          squadAlertCount: squadAlerts.alertCount,
        );

        return FutureBuilder<RoleSurfaceBundle>(
          future: _surfaceFuture,
          builder: (context, snapshot) {
            final baseBundle = snapshot.data ??
                RoleSurfaceBundle(
                  center: RoleSwipeSurfaces.centerFeed(role),
                  left: RoleSwipeSurfaces.leftManagement(role),
                  right: RoleSwipeSurfaces.rightFinance(role),
                );
            final bundle = RoleSwipeSurfaces.hydrateWithMetrics(
                baseBundle, role, runtimeMetrics);

            // Horizontal: multiple feature screens on left/right. Vertical: feed on every screen.
            final leftScreens = bundle.left
                .map((card) => _featureScenesForCard(
                      card,
                      role,
                      isRightSurface: false,
                      accent: accent,
                    ))
                .toList();
            final rightScreens = bundle.right
                .map((card) => _featureScenesForCard(
                      card,
                      role,
                      isRightSurface: true,
                      accent: accent,
                    ))
                .toList();

            final centerIndex = leftScreens.length;
            _surfaceCenterIndex = centerIndex;
            _lastLeftCount = leftScreens.length;
            _lastRightCount = rightScreens.length;

            final allScreens = <List<ReelScene>>[
              ...leftScreens,
              bundle.center,
              ...rightScreens,
            ];

            // Deterministic first snap: start at center feed once we know the
            // surface layout. Relying on `controller.page` here is flaky because
            // `page` can be null on first layout (macOS especially).
            if (_horizontalController.hasClients &&
                !_didInitialCenterSnap &&
                _selectedIndex == 2) {
              _didInitialCenterSnap = true;
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (!mounted) return;
                _horizontalController.jumpToPage(centerIndex);
              });
            }

            return PageView.builder(
              controller: _horizontalController,
              physics: const BouncingScrollPhysics(parent: PageScrollPhysics()),
              pageSnapping: true,
              allowImplicitScrolling: true,
              itemCount: allScreens.length,
              onPageChanged: (page) {
                setState(() {
                  _currentHorizontalPage = page;
                  if (page < centerIndex) {
                    _selectedIndex = 0;
                  } else if (page == centerIndex) {
                    _selectedIndex = 2;
                  } else {
                    _selectedIndex = 1;
                  }
                });
              },
              itemBuilder: (context, index) {
                final scenes = allScreens[index];
                return RoleCenterVerticalFeed(
                  scenes: scenes,
                  enableHorizontalSwipe: false,
                );
              },
            );
          },
        );
      },
    );
  }

  List<ReelScene> _featureScenesForCard(
    SideCardData card,
    UserRole role, {
    required bool isRightSurface,
    required Color accent,
  }) {
    final base = isRightSurface
        ? const [Color(0xFF0B0F16), Color(0xFF101827)]
        : const [Color(0xFF0C1018), Color(0xFF0F172A)];
    final badge = isRightSurface ? 'Finance' : 'Ops';

    // Each feature screen is itself a vertical feed (3 mini-cells).
    return [
      ReelScene(
        title: card.title,
        subtitle:
            '$badge • Swipe up for more. Swipe horizontally for next screen.',
        icon: card.icon,
        colors: base,
        actionLabel: 'Open',
        actionRoute: card.route,
      ),
      ReelScene(
        title: '${card.title} Quick Actions',
        subtitle: 'Tap to jump. This stays lightweight and iOS-clean.',
        icon: Icons.flash_on_outlined,
        colors: [base.first, accent.withValues(alpha: 0.22)],
        actionLabel: 'Go',
        actionRoute: card.route,
      ),
      ReelScene(
        title: '${card.title} Details',
        subtitle: 'Deep view for power users. Still feed-driven.',
        icon: Icons.tune_outlined,
        colors: [base.first, base.last],
        actionLabel: 'Open',
        actionRoute: card.route,
      ),
    ];
  }

  String _swipeHint(UserRole role) {
    final center = _surfaceCenterIndex;
    final leftCount = _lastLeftCount;
    final rightCount = _lastRightCount;

    if (_currentHorizontalPage < center && leftCount > 0) {
      final i = (_currentHorizontalPage + 1).clamp(1, leftCount);
      return 'Ops $i/$leftCount • Swipe left/right';
    }
    if (_currentHorizontalPage > center && rightCount > 0) {
      final i = (_currentHorizontalPage - center).clamp(1, rightCount);
      return 'Finance $i/$rightCount • Swipe left/right';
    }
    if (_selectedIndex == 0) {
      return 'Swipe horizontally for ops screens';
    }
    if (_selectedIndex == 1) {
      return 'Swipe horizontally for finance screens';
    }
    switch (role) {
      case UserRole.force:
        return 'Swipe: Ops screens • Center feed • Finance screens';
      case UserRole.source:
        return 'Swipe: Ops screens • Center feed • Finance screens';
      case UserRole.seeker:
        return 'Swipe: Ops screens • Center feed • Finance screens';
    }
  }
}

class _SwipeHintPill extends StatelessWidget {
  final String label;

  const _SwipeHintPill({required this.label});

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 260),
      transitionBuilder: (child, animation) {
        final slide = Tween<Offset>(
          begin: const Offset(0, 0.15),
          end: Offset.zero,
        ).animate(animation);
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(position: slide, child: child),
        );
      },
      child: Container(
        key: ValueKey(label),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.22),
            width: 0.8,
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.05,
          ),
        ),
      ),
    );
  }
}

class _SurfaceSwipeRegion extends StatefulWidget {
  final Widget child;

  const _SurfaceSwipeRegion({
    required this.child,
  });

  @override
  State<_SurfaceSwipeRegion> createState() => _SurfaceSwipeRegionState();
}

class _SurfaceSwipeRegionState extends State<_SurfaceSwipeRegion> {
  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
