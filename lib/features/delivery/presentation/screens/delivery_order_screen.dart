import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/delivery/data/delivery_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';
import 'package:rizik_v4/core/wrappers/location_wrapper.dart';

/// Delivery Order Screen
/// Place a new delivery order
class DeliveryOrderScreen extends ConsumerStatefulWidget {
  const DeliveryOrderScreen({super.key});

  @override
  ConsumerState<DeliveryOrderScreen> createState() => _DeliveryOrderScreenState();
}

class _DeliveryOrderScreenState extends ConsumerState<DeliveryOrderScreen> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  final _weightController = TextEditingController();
  bool _isUrgent = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    final pos = await locationWrapper.getCurrentPosition();
    if (pos != null) {
      // Reverse geocoding would go here to fill address
      // For now, just placeholder
      _pickupController.text = '${pos.latitude}, ${pos.longitude}';
    }
  }

  Future<void> _submit() async {
    if (_pickupController.text.isEmpty || _dropoffController.text.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      // Mock distance calculation or use Google Maps API
      const distance = 5.0; // 5km mock

      final result = await ref.read(deliveryRepositoryProvider).createOrder(
        pickupAddress: _pickupController.text,
        dropoffAddress: _dropoffController.text,
        weight: double.tryParse(_weightController.text) ?? 1.0,
        distance: distance,
        isUrgent: _isUrgent,
      );

      final price = result['price'];
      toastWrapper.showSuccess('Order placed! Price: ৳$price. Finding movers...');
      if (mounted) Navigator.pop(context);
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send Package')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _pickupController,
              decoration: const InputDecoration(
                labelText: 'Pickup Address',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.my_location),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _dropoffController,
              decoration: const InputDecoration(
                labelText: 'Dropoff Address',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _weightController,
              decoration: const InputDecoration(
                labelText: 'Weight (kg)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.scale),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Urgent Delivery?'),
              subtitle: const Text('Higher priority, slightly higher cost'),
              value: _isUrgent,
              onChanged: (v) => setState(() => _isUrgent = v),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue[800],
                foregroundColor: Colors.white,
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Calculate Price & Request Mover'),
            ),
          ],
        ),
      ),
    );
  }
}
