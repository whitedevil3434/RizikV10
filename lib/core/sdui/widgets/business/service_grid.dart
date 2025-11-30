import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';
import 'package:rizik_v4/core/sdui/widgets/base/index.dart';

/// 🎯 ServiceGrid - Interactive Service Tiles
/// 
/// A grid of beautiful service cards with icons and labels.
class ServiceGrid extends StatelessWidget {
  final Map<String, dynamic> data;

  const ServiceGrid({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final items = (data['items'] as List<dynamic>?) ?? _defaultServices;
    final crossAxisCount = (data['columns'] as int?) ?? 3;

    return Padding(
      padding: const EdgeInsets.all(RizikDesign.spacing16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: RizikDesign.spacing12,
          mainAxisSpacing: RizikDesign.spacing12,
          childAspectRatio: 1.0,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index] as Map<String, dynamic>;
          return _ServiceTile(
            icon: item['icon'] as String? ?? 'restaurant',
            label: item['label'] as String? ?? 'Service',
            color: item['color'] as String?,
          );
        },
      ),
    );
  }

  static final _defaultServices = [
    {'icon': 'restaurant', 'label': 'Food', 'color': '#FF6B6B'},
    {'icon': 'local_shipping', 'label': 'Parcel', 'color': '#4ECDC4'},
    {'icon': 'shopping_bag', 'label': 'Shop', 'color': '#95E1D3'},
    {'icon': 'two_wheeler', 'label': 'Ride', 'color': '#FFD93D'},
    {'icon': 'home_repair_service', 'label': 'Service', 'color': '#6BCB77'},
    {'icon': 'more_horiz', 'label': 'More', 'color': '#B4B4B8'},
  ];
}

/// Individual Service Tile
class _ServiceTile extends StatefulWidget {
  final String icon;
  final String label;
  final String? color;

  const _ServiceTile({
    required this.icon,
    required this.label,
    this.color,
  });

  @override
  State<_ServiceTile> createState() => _ServiceTileState();
}

class _ServiceTileState extends State<_ServiceTile> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final iconColor = widget.color != null
        ? _parseColor(widget.color!)
        : RizikDesign.primary;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        // TODO: Handle service selection
        debugPrint('Selected service: ${widget.label}');
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.95 : 1.0,
        duration: RizikDesign.durationFast,
        curve: RizikDesign.curveSnappy,
        child: Container(
          decoration: BoxDecoration(
            color: RizikDesign.surface,
            borderRadius: RizikDesign.radiusLarge,
            border: Border.all(
              color: _isPressed
                  ? iconColor.withOpacity(0.3)
                  : RizikDesign.borderLight,
              width: 2,
            ),
            boxShadow: _isPressed
                ? []
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: RizikDesign.radiusMedium,
                ),
                child: Icon(
                  _getIconData(widget.icon),
                  color: iconColor,
                  size: 28,
                ),
              ),
              const SizedBox(height: RizikDesign.spacing8),
              Text(
                widget.label,
                style: RizikDesign.textCaption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: RizikDesign.textPrimary,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'restaurant':
      case 'food':
        return Icons.restaurant;
      case 'local_shipping':
      case 'parcel':
        return Icons.local_shipping;
      case 'shopping_bag':
      case 'shop':
        return Icons.shopping_bag;
      case 'two_wheeler':
      case 'ride':
        return Icons.two_wheeler;
      case 'home_repair_service':
      case 'service':
        return Icons.home_repair_service;
      case 'more_horiz':
      case 'more':
        return Icons.more_horiz;
      default:
        return Icons.category;
    }
  }

  Color _parseColor(String hexColor) {
    try {
      final hex = hexColor.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (e) {
      return RizikDesign.primary;
    }
  }
}
