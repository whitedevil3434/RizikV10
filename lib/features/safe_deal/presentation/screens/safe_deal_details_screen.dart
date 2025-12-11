import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/safe_deal/data/safe_deal_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';
import 'package:rizik_v4/core/wrappers/dialog_wrapper.dart';

/// Safe Deal Details Screen
/// View deal status, confirm delivery, raise dispute
class SafeDealDetailsScreen extends ConsumerStatefulWidget {
  final String dealCode;

  const SafeDealDetailsScreen({super.key, required this.dealCode});

  @override
  ConsumerState<SafeDealDetailsScreen> createState() => _SafeDealDetailsScreenState();
}

class _SafeDealDetailsScreenState extends ConsumerState<SafeDealDetailsScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _dealData;

  @override
  void initState() {
    super.initState();
    _fetchDeal();
  }

  Future<void> _fetchDeal() async {
    setState(() => _isLoading = true);
    try {
      final data = await ref.read(safeDealRepositoryProvider).getDeal(widget.dealCode);
      if (mounted) setState(() => _dealData = data);
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _confirmDelivery() async {
    final confirmed = await dialogWrapper.showConfirmation(
      context,
      title: 'Confirm Delivery?',
      message: 'Funds will be released to the seller. This cannot be undone.',
      confirmText: 'Release Funds',
    );

    if (!confirmed) return;

    setState(() => _isLoading = true);
    try {
      // Assuming current user is buyer, we pass their contact or ID
      // In real app, backend validates user ID from token
      await ref.read(safeDealRepositoryProvider).confirmDelivery(
        widget.dealCode,
        _dealData?['buyer_contact'] ?? '',
      );
      toastWrapper.showSuccess('Delivery confirmed! Funds released.');
      _fetchDeal(); // Refresh
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _raiseDispute() async {
    // Show dialog to get reason
    final reasonController = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Raise Dispute'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(hintText: 'Reason for dispute...'),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, reasonController.text),
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (reason == null || reason.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(safeDealRepositoryProvider).raiseDispute(widget.dealCode, reason);
      toastWrapper.showWarning('Dispute raised. Support will contact you.');
      _fetchDeal();
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _dealData == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_dealData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Deal Details')),
        body: const Center(child: Text('Deal not found')),
      );
    }

    final status = _dealData!['status'] ?? 'UNKNOWN';
    final isLocked = status == 'LOCKED';

    return Scaffold(
      appBar: AppBar(title: Text('Deal #${widget.dealCode}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildStatusCard(status),
            const SizedBox(height: 16),
            Text(_dealData!['title'], style: Theme.of(context).textTheme.headlineSmall),
            Text('৳${_dealData!['amount']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green)),
            const SizedBox(height: 8),
            Text(_dealData!['description'] ?? ''),
            const Divider(height: 32),
            if (isLocked) ...[
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _confirmDelivery,
                icon: const Icon(Icons.check_circle),
                label: const Text('Confirm Delivery & Release Funds'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(16),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _isLoading ? null : _raiseDispute,
                icon: const Icon(Icons.report_problem),
                label: const Text('Raise Dispute'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.all(16),
                ),
              ),
            ] else
              Center(
                child: Text(
                  'This deal is $status',
                  style: const TextStyle(fontSize: 18, color: Colors.grey),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(String status) {
    Color color;
    IconData icon;
    switch (status) {
      case 'LOCKED':
        color = Colors.blue;
        icon = Icons.lock;
        break;
      case 'COMPLETED':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'DISPUTED':
        color = Colors.red;
        icon = Icons.warning;
        break;
      default:
        color = Colors.grey;
        icon = Icons.info;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Status', style: TextStyle(color: color)),
              Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 20)),
            ],
          ),
        ],
      ),
    );
  }
}
