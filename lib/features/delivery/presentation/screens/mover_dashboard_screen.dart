import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/delivery/data/delivery_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';

/// Available Orders Provider
final availableOrdersProvider = FutureProvider((ref) async {
  return ref.watch(deliveryRepositoryProvider).getAvailableOrders();
});

/// Mover Dashboard Screen
/// For Movers/Force to accept delivery jobs
class MoverDashboardScreen extends ConsumerWidget {
  const MoverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(availableOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mover Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(availableOrdersProvider),
          ),
        ],
      ),
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text('No active orders nearby.'));
          }
          return ListView.builder(
            itemCount: orders.length,
            padding: const EdgeInsets.all(8),
            itemBuilder: (context, index) {
              final order = orders[index];
              final isUrgent = order['is_urgent'] ?? false;
              
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                color: isUrgent ? Colors.red[50] : null,
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.local_shipping)),
                  title: Text('Delivery #${order['id'].toString().substring(0, 8)}'),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('From: ${order['pickup_address']}'),
                      Text('To: ${order['dropoff_address']}'),
                      Text('Distance: ${order['distance_km']} km • Weight: ${order['weight_kg']} kg'),
                    ],
                  ),
                  trailing: ElevatedButton(
                    onPressed: () async {
                      try {
                        await ref.read(deliveryRepositoryProvider).acceptOrder(order['id']);
                        toastWrapper.showSuccess('Order accepted! Navigate to pickup.');
                        ref.refresh(availableOrdersProvider);
                      } catch (e) {
                        toastWrapper.showError(e.toString());
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Accept'),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
