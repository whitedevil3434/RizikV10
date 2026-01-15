import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// RizikFlowNavigator - 4-Side Immersive Navigation
/// 
/// Navigation Architecture:
/// ```
///                    ↑ UP
///               (Future/New)
///                     │
///      ← LEFT ────── HOME ────── RIGHT →
///    (Management)     │      (Discovery)
///                     │
///                  ↓ DOWN
///               (History)
/// ```
/// 
/// - UP: Future content, new promos, upcoming
/// - DOWN: History, past orders, transaction log
/// - LEFT: Management screens (role-specific)
/// - RIGHT: Marketplace, discovery, products
class RizikFlowNavigator extends StatefulWidget {
  /// Current user role (seeker, force, source)
  final RizikRole role;
  
  /// Home feed widget (center)
  final Widget homeFeed;
  
  /// UP feed screens (future/marketing)
  final List<Widget>? upFeedScreens;
  
  /// DOWN feed screens (history/past)
  final List<Widget>? downFeedScreens;
  
  /// LEFT feed screens (management - role specific)
  final List<Widget>? leftFeedScreens;
  
  /// RIGHT feed screens (marketplace/discovery)
  final List<Widget>? rightFeedScreens;
  
  /// Callback when direction changes
  final ValueChanged<RizikFlowDirection>? onDirectionChanged;

  const RizikFlowNavigator({
    super.key,
    this.role = RizikRole.seeker,
    required this.homeFeed,
    this.upFeedScreens,
    this.downFeedScreens,
    this.leftFeedScreens,
    this.rightFeedScreens,
    this.onDirectionChanged,
  });

  @override
  State<RizikFlowNavigator> createState() => _RizikFlowNavigatorState();
}

enum RizikRole { seeker, force, source }

enum RizikFlowDirection { home, up, down, left, right }

class _RizikFlowNavigatorState extends State<RizikFlowNavigator>
    with TickerProviderStateMixin {
  
  // Current position in the 4-direction grid
  RizikFlowDirection _currentDirection = RizikFlowDirection.home;
  
  // Index within each direction's feed
  int _upIndex = 0;
  int _downIndex = 0;
  int _leftIndex = 0;
  int _rightIndex = 0;
  
  // Animation controllers
  late AnimationController _transitionController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;
  
  // Gesture tracking
  Offset _dragStart = Offset.zero;
  Offset _dragCurrent = Offset.zero;
  bool _isDragging = false;
  
  // Thresholds
  static const double _swipeThreshold = 80.0;
  static const double _swipeVelocityThreshold = 300.0;

  @override
  void initState() {
    super.initState();
    
    _transitionController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _transitionController,
      curve: Curves.easeOutCubic,
    ));
    
    _fadeAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _transitionController,
      curve: Curves.easeOut,
    ));
  }

  @override
  void dispose() {
    _transitionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: _handlePanStart,
      onPanUpdate: _handlePanUpdate,
      onPanEnd: _handlePanEnd,
      child: Stack(
        children: [
          // Current screen
          AnimatedBuilder(
            animation: _transitionController,
            builder: (context, child) {
              return Transform.translate(
                offset: _isDragging 
                    ? _dragCurrent - _dragStart
                    : _slideAnimation.value,
                child: Opacity(
                  opacity: _isDragging ? 1.0 : _fadeAnimation.value,
                  child: _buildCurrentScreen(),
                ),
              );
            },
          ),
          
          // Direction indicators (edge hints)
          _buildDirectionIndicators(),
          
          // Swipe preview (shows during drag)
          if (_isDragging) _buildSwipePreview(),
        ],
      ),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_currentDirection) {
      case RizikFlowDirection.home:
        return widget.homeFeed;
      case RizikFlowDirection.up:
        return _buildFeedAtIndex(widget.upFeedScreens, _upIndex);
      case RizikFlowDirection.down:
        return _buildFeedAtIndex(widget.downFeedScreens, _downIndex);
      case RizikFlowDirection.left:
        return _buildFeedAtIndex(widget.leftFeedScreens, _leftIndex);
      case RizikFlowDirection.right:
        return _buildFeedAtIndex(widget.rightFeedScreens, _rightIndex);
    }
  }

  Widget _buildFeedAtIndex(List<Widget>? screens, int index) {
    if (screens == null || screens.isEmpty) {
      return _buildEmptyState();
    }
    return screens[index.clamp(0, screens.length - 1)];
  }

  Widget _buildEmptyState() {
    return Container(
      color: const Color(0xFF1A1A1A),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.explore_off_rounded,
              size: 64,
              color: Colors.white.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No content yet',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDirectionIndicators() {
    return Stack(
      children: [
        // UP indicator
        if (_canSwipe(RizikFlowDirection.up) && _currentDirection == RizikFlowDirection.home)
          Positioned(
            top: 8,
            left: 0,
            right: 0,
            child: _buildEdgeIndicator(
              Icons.keyboard_arrow_up_rounded,
              'Future',
              Alignment.topCenter,
            ),
          ),
        
        // DOWN indicator
        if (_canSwipe(RizikFlowDirection.down) && _currentDirection == RizikFlowDirection.home)
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: _buildEdgeIndicator(
              Icons.keyboard_arrow_down_rounded,
              'History',
              Alignment.bottomCenter,
            ),
          ),
        
        // LEFT indicator
        if (_canSwipe(RizikFlowDirection.left) && _currentDirection == RizikFlowDirection.home)
          Positioned(
            left: 8,
            top: 0,
            bottom: 0,
            child: _buildEdgeIndicator(
              Icons.keyboard_arrow_left_rounded,
              'Manage',
              Alignment.centerLeft,
            ),
          ),
        
        // RIGHT indicator
        if (_canSwipe(RizikFlowDirection.right) && _currentDirection == RizikFlowDirection.home)
          Positioned(
            right: 8,
            top: 0,
            bottom: 0,
            child: _buildEdgeIndicator(
              Icons.keyboard_arrow_right_rounded,
              'Discover',
              Alignment.centerRight,
            ),
          ),
        
        // BACK TO HOME indicator (when not at home)
        if (_currentDirection != RizikFlowDirection.home)
          Positioned(
            top: 50,
            left: 16,
            child: _buildBackButton(),
          ),
      ],
    );
  }

  Widget _buildEdgeIndicator(IconData icon, String label, Alignment alignment) {
    final isVertical = alignment == Alignment.topCenter || 
                       alignment == Alignment.bottomCenter;
    
    return Center(
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isVertical ? 16 : 8,
          vertical: isVertical ? 8 : 16,
        ),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(20),
        ),
        child: isVertical
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, color: Colors.white54, size: 24),
                  Text(
                    label,
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                ],
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, color: Colors.white54, size: 24),
                  const SizedBox(width: 4),
                  Text(
                    label,
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildBackButton() {
    return GestureDetector(
      onTap: _goHome,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.home_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              _getDirectionLabel(_currentDirection),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwipePreview() {
    final dragDelta = _dragCurrent - _dragStart;
    final direction = _getDragDirection(dragDelta);
    
    if (direction == null) return const SizedBox.shrink();
    
    final opacity = (dragDelta.distance / _swipeThreshold).clamp(0.0, 1.0);
    
    return Positioned.fill(
      child: Opacity(
        opacity: opacity * 0.3,
        child: Container(
          color: _getDirectionColor(direction),
          child: Center(
            child: Text(
              _getDirectionLabel(direction),
              style: TextStyle(
                color: Colors.white.withValues(alpha: opacity),
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Gesture handlers
  void _handlePanStart(DragStartDetails details) {
    _dragStart = details.globalPosition;
    _dragCurrent = details.globalPosition;
    setState(() => _isDragging = true);
  }

  void _handlePanUpdate(DragUpdateDetails details) {
    setState(() {
      _dragCurrent = details.globalPosition;
    });
  }

  void _handlePanEnd(DragEndDetails details) {
    final dragDelta = _dragCurrent - _dragStart;
    final velocity = details.velocity.pixelsPerSecond;
    
    // Check if swipe is strong enough
    final isSwipe = dragDelta.distance > _swipeThreshold ||
                   velocity.distance > _swipeVelocityThreshold;
    
    if (isSwipe) {
      final direction = _getDragDirection(dragDelta);
      if (direction != null && _canSwipe(direction)) {
        _navigateTo(direction);
      }
    }
    
    setState(() => _isDragging = false);
  }

  RizikFlowDirection? _getDragDirection(Offset delta) {
    final dx = delta.dx.abs();
    final dy = delta.dy.abs();
    
    // Determine primary direction
    if (dx > dy) {
      // Horizontal swipe
      if (delta.dx > 0) {
        // Swiped right = go LEFT (reveal left content)
        return RizikFlowDirection.left;
      } else {
        // Swiped left = go RIGHT (reveal right content)
        return RizikFlowDirection.right;
      }
    } else {
      // Vertical swipe
      if (delta.dy > 0) {
        // Swiped down = go UP (reveal future content)
        return RizikFlowDirection.up;
      } else {
        // Swiped up = go DOWN (reveal history)
        return RizikFlowDirection.down;
      }
    }
  }

  bool _canSwipe(RizikFlowDirection direction) {
    switch (direction) {
      case RizikFlowDirection.home:
        return _currentDirection != RizikFlowDirection.home;
      case RizikFlowDirection.up:
        return widget.upFeedScreens?.isNotEmpty ?? false;
      case RizikFlowDirection.down:
        return widget.downFeedScreens?.isNotEmpty ?? false;
      case RizikFlowDirection.left:
        return widget.leftFeedScreens?.isNotEmpty ?? false;
      case RizikFlowDirection.right:
        return widget.rightFeedScreens?.isNotEmpty ?? false;
    }
  }

  void _navigateTo(RizikFlowDirection direction) {
    if (direction == _currentDirection) return;
    
    HapticFeedback.mediumImpact();
    
    // Set slide animation direction
    final slideOffset = _getSlideOffset(direction);
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: slideOffset,
    ).animate(CurvedAnimation(
      parent: _transitionController,
      curve: Curves.easeOutCubic,
    ));
    
    _transitionController.forward().then((_) {
      setState(() {
        _currentDirection = direction;
      });
      _transitionController.reset();
      widget.onDirectionChanged?.call(direction);
    });
  }

  Offset _getSlideOffset(RizikFlowDirection direction) {
    final size = MediaQuery.of(context).size;
    switch (direction) {
      case RizikFlowDirection.up:
        return Offset(0, size.height);
      case RizikFlowDirection.down:
        return Offset(0, -size.height);
      case RizikFlowDirection.left:
        return Offset(size.width, 0);
      case RizikFlowDirection.right:
        return Offset(-size.width, 0);
      case RizikFlowDirection.home:
        return Offset.zero;
    }
  }

  void _goHome() {
    HapticFeedback.lightImpact();
    setState(() {
      _currentDirection = RizikFlowDirection.home;
    });
    widget.onDirectionChanged?.call(RizikFlowDirection.home);
  }

  String _getDirectionLabel(RizikFlowDirection direction) {
    switch (direction) {
      case RizikFlowDirection.home:
        return 'Home';
      case RizikFlowDirection.up:
        return 'Future';
      case RizikFlowDirection.down:
        return 'History';
      case RizikFlowDirection.left:
        return _getRoleManagementLabel();
      case RizikFlowDirection.right:
        return 'Discover';
    }
  }

  String _getRoleManagementLabel() {
    switch (widget.role) {
      case RizikRole.seeker:
        return 'Squad';
      case RizikRole.force:
        return 'Missions';
      case RizikRole.source:
        return 'Inventory';
    }
  }

  Color _getDirectionColor(RizikFlowDirection direction) {
    switch (direction) {
      case RizikFlowDirection.up:
        return const Color(0xFFFFD93D); // Yellow/Gold for future
      case RizikFlowDirection.down:
        return const Color(0xFF6B7280); // Gray/Sepia for history
      case RizikFlowDirection.left:
        return _getRoleColor();
      case RizikFlowDirection.right:
        return const Color(0xFF4ECDC4); // Cyan for discovery
      case RizikFlowDirection.home:
        return Colors.transparent;
    }
  }

  Color _getRoleColor() {
    switch (widget.role) {
      case RizikRole.seeker:
        return const Color(0xFF6366F1); // Indigo
      case RizikRole.force:
        return const Color(0xFF22C55E); // Green
      case RizikRole.source:
        return const Color(0xFFF59E0B); // Amber
    }
  }
}
