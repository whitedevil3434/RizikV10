import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../icons/mojo_orb.dart';

/// RizikDynamicNavBar - Creative Dynamic Navigation
/// No traditional bottom nav! Mojo Orb center with context-aware morphing side icons
class RizikDynamicNavBar extends StatefulWidget {
  final DynamicNavContext context;
  final VoidCallback? onMojoTap;
  final VoidCallback? onMojoDoubleTap;
  final VoidCallback? onMojoLongPress;
  final VoidCallback? onLeftTap;
  final VoidCallback? onRightTap;
  final MojoOrbState mojoState;

  const RizikDynamicNavBar({
    super.key,
    this.context = DynamicNavContext.home,
    this.onMojoTap,
    this.onMojoDoubleTap,
    this.onMojoLongPress,
    this.onLeftTap,
    this.onRightTap,
    this.mojoState = MojoOrbState.idle,
  });

  @override
  State<RizikDynamicNavBar> createState() => _RizikDynamicNavBarState();
}

/// Context determines which icons appear on left/right
enum DynamicNavContext {
  home,        // Left: Squad, Right: Shop
  squad,       // Left: Mess, Right: Home
  mess,        // Left: Home, Right: Order
  marketplace, // Left: Back, Right: Search
  profile,     // Left: Home, Right: Settings
}

class _RizikDynamicNavBarState extends State<RizikDynamicNavBar>
    with TickerProviderStateMixin {
  late AnimationController _morphController;
  late Animation<double> _morphAnimation;

  @override
  void initState() {
    super.initState();
    
    _morphController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    _morphAnimation = CurvedAnimation(
      parent: _morphController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void didUpdateWidget(RizikDynamicNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.context != oldWidget.context) {
      _morphController.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _morphController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 88,
      padding: const EdgeInsets.only(bottom: 20, left: 32, right: 32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Left Dynamic Icon
          _buildDynamicIcon(
            iconData: _getLeftIcon(),
            label: _getLeftLabel(),
            onTap: widget.onLeftTap,
            isLeft: true,
          ),
          
          // Center Mojo Orb
          MojoOrb(
            orbState: widget.mojoState,
            onTap: widget.onMojoTap,
            onDoubleTap: widget.onMojoDoubleTap,
            onLongPress: widget.onMojoLongPress,
            size: 56,
          ),
          
          // Right Dynamic Icon
          _buildDynamicIcon(
            iconData: _getRightIcon(),
            label: _getRightLabel(),
            onTap: widget.onRightTap,
            isLeft: false,
          ),
        ],
      ),
    );
  }

  Widget _buildDynamicIcon({
    required IconData iconData,
    required String label,
    required VoidCallback? onTap,
    required bool isLeft,
  }) {
    return AnimatedBuilder(
      animation: _morphAnimation,
      builder: (context, child) {
        // Morph animation: scale down, rotate, scale up
        final morphProgress = _morphAnimation.value;
        final scale = morphProgress < 0.5
            ? 1.0 - (morphProgress * 0.4)  // Scale down
            : 0.8 + ((morphProgress - 0.5) * 0.4);  // Scale up
        
        final rotation = morphProgress < 0.5
            ? morphProgress * 0.5  // Rotate out
            : (1.0 - morphProgress) * 0.5;  // Rotate in
        
        return GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            onTap?.call();
          },
          child: Transform.scale(
            scale: scale,
            child: Transform.rotate(
              angle: isLeft ? -rotation : rotation,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      iconData,
                      color: Colors.white.withValues(alpha: 0.9),
                      size: 24,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Icon mapping based on context
  IconData _getLeftIcon() {
    switch (widget.context) {
      case DynamicNavContext.home:
        return Icons.groups_rounded;        // Squad
      case DynamicNavContext.squad:
        return Icons.restaurant_rounded;    // Mess
      case DynamicNavContext.mess:
        return Icons.home_rounded;          // Home
      case DynamicNavContext.marketplace:
        return Icons.arrow_back_rounded;    // Back
      case DynamicNavContext.profile:
        return Icons.home_rounded;          // Home
    }
  }

  String _getLeftLabel() {
    switch (widget.context) {
      case DynamicNavContext.home:
        return 'Squad';
      case DynamicNavContext.squad:
        return 'Mess';
      case DynamicNavContext.mess:
        return 'Home';
      case DynamicNavContext.marketplace:
        return 'Back';
      case DynamicNavContext.profile:
        return 'Home';
    }
  }

  IconData _getRightIcon() {
    switch (widget.context) {
      case DynamicNavContext.home:
        return Icons.shopping_bag_rounded;  // Shop
      case DynamicNavContext.squad:
        return Icons.home_rounded;          // Home
      case DynamicNavContext.mess:
        return Icons.shopping_cart_rounded; // Order
      case DynamicNavContext.marketplace:
        return Icons.search_rounded;        // Search
      case DynamicNavContext.profile:
        return Icons.settings_rounded;      // Settings
    }
  }

  String _getRightLabel() {
    switch (widget.context) {
      case DynamicNavContext.home:
        return 'Shop';
      case DynamicNavContext.squad:
        return 'Home';
      case DynamicNavContext.mess:
        return 'Order';
      case DynamicNavContext.marketplace:
        return 'Search';
      case DynamicNavContext.profile:
        return 'Settings';
    }
  }
}
