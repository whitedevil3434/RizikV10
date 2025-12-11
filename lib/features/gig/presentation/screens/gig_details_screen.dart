import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gig/data/gig_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';

/// Gig Details Screen
/// View details and bid
class GigDetailsScreen extends ConsumerStatefulWidget {
  final String gigId;

  const GigDetailsScreen({super.key, required this.gigId});

  @override
  ConsumerState<GigDetailsScreen> createState() => _GigDetailsScreenState();
}

class _GigDetailsScreenState extends ConsumerState<GigDetailsScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _gig;

  @override
  void initState() {
    super.initState();
    _fetchGig();
  }

  Future<void> _fetchGig() async {
    setState(() => _isLoading = true);
    try {
      final data = await ref.read(gigRepositoryProvider).getGig(widget.gigId);
      if (mounted) setState(() => _gig = data);
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _placeBid() async {
    // Show bid dialog
    final amountController = TextEditingController();
    final letterController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Place Bid'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountController,
              decoration: const InputDecoration(labelText: 'Bid Amount (৳)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: letterController,
              decoration: const InputDecoration(labelText: 'Cover Letter'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit Bid')),
        ],
      ),
    );

    if (result != true) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(gigRepositoryProvider).submitBid(
        gigId: widget.gigId,
        amount: double.parse(amountController.text),
        coverLetter: letterController.text,
      );
      toastWrapper.showSuccess('Bid placed successfully!');
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _gig == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_gig == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Gig Details')),
        body: const Center(child: Text('Gig not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(_gig!['title'] ?? 'Gig Details')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_gig!['title'], style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text('Budget: ৳${_gig!['budget']}', style: const TextStyle(fontSize: 20, color: Colors.green, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Text('Description', style: Theme.of(context).textTheme.titleMedium),
            Text(_gig!['description'] ?? 'No description'),
            const Spacer(),
            ElevatedButton(
              onPressed: _isLoading ? null : _placeBid,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Place Bid'),
            ),
          ],
        ),
      ),
    );
  }
}
