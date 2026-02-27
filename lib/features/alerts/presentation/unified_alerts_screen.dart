import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart' as provider_pkg;
import 'package:rizik_v4/core/theme/ui_tokens.dart';
import 'package:rizik_v4/features/alerts/logic/unified_alerts_provider.dart';
import 'package:rizik_v4/features/connect/logic/chat_badge_provider.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';
import 'package:rizik_v4/features/source/inventory/logic/inventory_provider.dart';
import 'package:rizik_v4/features/squad/logic/squad_alert_provider.dart';

class UnifiedAlertsScreen extends StatelessWidget {
  const UnifiedAlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return provider_pkg.Consumer6<
        ChatBadgeProvider,
        SquadAlertProvider,
        OrderProvider,
        InventoryProvider,
        MoneybagProvider,
        UnifiedAlertsProvider>(
      builder: (context, chat, squadAlerts, orders, inventory, moneybag,
          alertsModel, _) {
        final unread = chat.unreadCount;
        final squad = squadAlerts.alertCount;
        final activeOrders = orders.activeOrders.length;
        final lowStock = inventory.lowStockItems.length;
        final wallet = moneybag.totalBalance;
        final totalLoad = unread + squad;

        final snapshots = <AlertSnapshot>[
          AlertSnapshot(
            key: 'chat_unread_count',
            title: 'Unread Messages',
            priority: unread > 8 ? AlertPriority.high : AlertPriority.medium,
            value: unread,
          ),
          AlertSnapshot(
            key: 'squad_alerts',
            title: 'Squad Watchlist',
            priority: squad > 2 ? AlertPriority.high : AlertPriority.medium,
            value: squad,
          ),
          AlertSnapshot(
            key: 'active_orders',
            title: 'Delivery Momentum',
            priority:
                activeOrders > 0 ? AlertPriority.medium : AlertPriority.low,
            value: activeOrders,
          ),
          AlertSnapshot(
            key: 'low_stock_count',
            title: 'Inventory Pressure',
            priority: lowStock > 0 ? AlertPriority.high : AlertPriority.low,
            value: lowStock,
          ),
          AlertSnapshot(
            key: 'wallet_balance',
            title: 'Wallet Capacity',
            priority: wallet < 200 ? AlertPriority.high : AlertPriority.low,
            value: wallet.round(),
          ),
        ];

        alertsModel.syncFromSnapshot(snapshots);

        final queue = <_AlertItem>[
          _AlertItem(
            metricKey: 'chat_unread_count',
            icon: Icons.chat,
            title: 'Unread Messages',
            subtitle: 'Messages waiting for your response',
            value: '$unread',
            color: const Color(0xFF3B82F6),
            route: '/chat',
            actionLabel: 'Open Chat',
            priority: unread > 8 ? _Priority.high : _Priority.medium,
          ),
          _AlertItem(
            metricKey: 'squad_alerts',
            icon: Icons.groups_outlined,
            title: 'Squad Watchlist',
            subtitle: 'Operational warnings from your squads',
            value: '$squad',
            color: const Color(0xFFF59E0B),
            route: '/squad/dashboard',
            actionLabel: 'Open Squad',
            priority: squad > 2 ? _Priority.high : _Priority.medium,
          ),
          _AlertItem(
            metricKey: 'low_stock_count',
            icon: Icons.inventory_2_outlined,
            title: 'Inventory Pressure',
            subtitle: 'Items crossed low-stock threshold',
            value: '$lowStock',
            color: const Color(0xFFEF4444),
            route: '/inventory',
            actionLabel: 'Restock Now',
            priority: lowStock > 0 ? _Priority.high : _Priority.low,
          ),
          _AlertItem(
            metricKey: 'active_orders',
            icon: Icons.shopping_bag_outlined,
            title: 'Delivery Momentum',
            subtitle: 'Orders currently in action',
            value: '$activeOrders',
            color: const Color(0xFF10B981),
            route: '/seeker',
            actionLabel: 'Track Orders',
            priority: activeOrders > 0 ? _Priority.medium : _Priority.low,
          ),
        ]..sort((a, b) => b.priority.index.compareTo(a.priority.index));

        return Scaffold(
          appBar: AppBar(
            title: const Text('Unified Alerts'),
            actions: [
              TextButton(
                onPressed: () => chat.markAllRead(),
                child: const Text('Mark Read'),
              ),
            ],
          ),
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFFF8FAFC), Color(0xFFFFFFFF)],
              ),
            ),
            child: RefreshIndicator(
              onRefresh: () async {
                await chat.markAllRead();
              },
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  UiTokens.pagePadding,
                  12,
                  UiTokens.pagePadding,
                  20,
                ),
                children: [
                  _HeroStatusCard(totalLoad: totalLoad),
                  const SizedBox(height: UiTokens.sectionGap),
                  _QuickActions(
                    unreadCount: unread,
                    onOpenChat: () => context.push('/chat'),
                    onOpenSquad: () => context.push('/squad/dashboard'),
                    onOpenInventory: () => context.push('/inventory'),
                    onClearChat: () => chat.markAllRead(),
                  ),
                  const SizedBox(height: UiTokens.sectionGap),
                  SizedBox(
                    height: 106,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: snapshots.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, index) => _KpiCard(
                        item: snapshots[index],
                        walletBalance: wallet,
                      ),
                    ),
                  ),
                  const SizedBox(height: UiTokens.sectionGap + 4),
                  const Text(
                    'Priority Queue',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  if (queue.every((q) => q.value == '0'))
                    const _EmptyStateCard(
                      icon: Icons.task_alt,
                      title: 'No active priority alerts',
                      subtitle:
                          'System is stable. New items will appear here automatically.',
                    )
                  else
                    ...queue.map(
                      (alert) => _AlertTile(
                        item: alert,
                        record: alertsModel.recordFor(alert.metricKey),
                        onOpen: () => context.push(alert.route),
                        onAcknowledge: () =>
                            alertsModel.acknowledge(alert.metricKey),
                        onSnooze: () => alertsModel.snooze(
                            alert.metricKey, const Duration(hours: 1)),
                        onAssign: () =>
                            alertsModel.assign(alert.metricKey, 'Ops Team'),
                      ),
                    ),
                  const SizedBox(height: 16),
                  const Text(
                    'Recent Timeline',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  if (alertsModel.timeline.isEmpty)
                    const _EmptyStateCard(
                      icon: Icons.history_toggle_off,
                      title: 'No actions logged yet',
                      subtitle:
                          'Acknowledge, snooze, or assign an alert to build timeline history.',
                    )
                  else
                    ...alertsModel.timeline.take(6).map(_TimelineTile.new),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _HeroStatusCard extends StatelessWidget {
  final int totalLoad;

  const _HeroStatusCard({required this.totalLoad});

  @override
  Widget build(BuildContext context) {
    final isBusy = totalLoad > 0;
    final color = isBusy ? const Color(0xFFF59E0B) : const Color(0xFF10B981);
    final title = isBusy ? 'Action Needed' : 'System Stable';
    final subtitle = isBusy
        ? 'You have $totalLoad live alerts to process.'
        : 'No urgent alerts. Everything looks smooth.';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: UiTokens.cardBorderRadius,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha: 0.20),
            color.withValues(alpha: 0.08)
          ],
        ),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: color.withValues(alpha: 0.2),
            child: Icon(
              isBusy ? Icons.notifications_active_outlined : Icons.task_alt,
              color: color,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(color: Colors.black.withValues(alpha: 0.7)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  final int unreadCount;
  final VoidCallback onOpenChat;
  final VoidCallback onOpenSquad;
  final VoidCallback onOpenInventory;
  final VoidCallback onClearChat;

  const _QuickActions({
    required this.unreadCount,
    required this.onOpenChat,
    required this.onOpenSquad,
    required this.onOpenInventory,
    required this.onClearChat,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _ActionChip(
            label: 'Chat', icon: Icons.chat_outlined, onTap: onOpenChat),
        _ActionChip(
          label: 'Squad',
          icon: Icons.groups_outlined,
          onTap: onOpenSquad,
        ),
        _ActionChip(
          label: 'Inventory',
          icon: Icons.inventory_2_outlined,
          onTap: onOpenInventory,
        ),
        if (unreadCount > 0)
          _ActionChip(
            label: 'Clear Chat',
            icon: Icons.done_all,
            onTap: onClearChat,
          ),
      ],
    );
  }
}

class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _ActionChip({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: UiTokens.chipBorderRadius,
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: UiTokens.chipBorderRadius,
            border: Border.all(color: UiTokens.borderColor(context)),
            color: Colors.white,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final AlertSnapshot item;
  final double walletBalance;

  const _KpiCard({required this.item, required this.walletBalance});

  @override
  Widget build(BuildContext context) {
    final color = _priorityColor(item.priority);
    final icon = switch (item.key) {
      'chat_unread_count' => Icons.chat_bubble_outline,
      'squad_alerts' => Icons.warning_amber_rounded,
      'active_orders' => Icons.shopping_bag_outlined,
      'low_stock_count' => Icons.inventory_2_outlined,
      _ => Icons.account_balance_wallet_outlined,
    };
    final textValue = item.key == 'wallet_balance'
        ? '৳${walletBalance.toStringAsFixed(0)}'
        : '${item.value}';

    return Container(
      width: 140,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiTokens.cardBorderRadius,
        border: Border.all(color: color.withValues(alpha: 0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const Spacer(),
          Text(
            textValue,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          Text(
            item.title,
            style: TextStyle(color: Colors.black.withValues(alpha: 0.65)),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

enum _Priority { low, medium, high }

class _AlertItem {
  final String metricKey;
  final IconData icon;
  final String title;
  final String subtitle;
  final String value;
  final Color color;
  final String route;
  final String actionLabel;
  final _Priority priority;

  const _AlertItem({
    required this.metricKey,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.color,
    required this.route,
    required this.actionLabel,
    required this.priority,
  });
}

class _AlertTile extends StatelessWidget {
  final _AlertItem item;
  final UnifiedAlertRecord? record;
  final VoidCallback onOpen;
  final VoidCallback onAcknowledge;
  final VoidCallback onSnooze;
  final VoidCallback onAssign;

  const _AlertTile({
    required this.item,
    required this.record,
    required this.onOpen,
    required this.onAcknowledge,
    required this.onSnooze,
    required this.onAssign,
  });

  @override
  Widget build(BuildContext context) {
    final priorityColor = switch (item.priority) {
      _Priority.high => const Color(0xFFDC2626),
      _Priority.medium => const Color(0xFFF59E0B),
      _Priority.low => const Color(0xFF16A34A),
    };

    final statusText = switch (record?.status) {
      AlertStatus.acknowledged => 'ACK',
      AlertStatus.snoozed => 'SNOOZE',
      AlertStatus.assigned => 'ASSIGNED',
      _ => 'OPEN',
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiTokens.cardBorderRadius,
        border: Border.all(color: UiTokens.borderColor(context)),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 44,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              color: priorityColor,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          CircleAvatar(
            backgroundColor: item.color.withValues(alpha: 0.14),
            child: Icon(item.icon, color: item.color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.title,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.06),
                        borderRadius: UiTokens.chipBorderRadius,
                      ),
                      child: Text(
                        statusText,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  item.subtitle,
                  style: TextStyle(color: Colors.black.withValues(alpha: 0.65)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _TinyBtn(label: item.actionLabel, onTap: onOpen),
                    _TinyBtn(label: 'Ack', onTap: onAcknowledge),
                    _TinyBtn(label: 'Snooze 1h', onTap: onSnooze),
                    _TinyBtn(label: 'Assign', onTap: onAssign),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              borderRadius: UiTokens.chipBorderRadius,
              color: item.color.withValues(alpha: 0.14),
            ),
            child: Text(
              item.value,
              style: TextStyle(color: item.color, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _TinyBtn extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _TinyBtn({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          borderRadius: UiTokens.chipBorderRadius,
          border: Border.all(color: UiTokens.borderColor(context)),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class _TimelineTile extends StatelessWidget {
  final AlertActionLog item;

  const _TimelineTile(this.item);

  @override
  Widget build(BuildContext context) {
    final ts =
        '${item.timestamp.hour.toString().padLeft(2, '0')}:${item.timestamp.minute.toString().padLeft(2, '0')}';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Colors.white,
        border: Border.all(color: UiTokens.borderColor(context)),
      ),
      child: Row(
        children: [
          const Icon(Icons.timeline, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '${item.action} • ${item.details}',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
          Text(
            ts,
            style: TextStyle(color: Colors.black.withValues(alpha: 0.55)),
          ),
        ],
      ),
    );
  }
}

class _EmptyStateCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyStateCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: UiTokens.cardBorderRadius,
        border: Border.all(color: UiTokens.borderColor(context)),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.black54),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(subtitle,
                    style:
                        TextStyle(color: Colors.black.withValues(alpha: 0.65))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

Color _priorityColor(AlertPriority priority) {
  switch (priority) {
    case AlertPriority.high:
      return const Color(0xFFDC2626);
    case AlertPriority.medium:
      return const Color(0xFFF59E0B);
    case AlertPriority.low:
      return const Color(0xFF16A34A);
  }
}
