import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gig/data/gig_repository.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';
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
  Map<String, dynamic>? _myBid;

  @override
  void initState() {
    super.initState();
    _fetchGig();
  }

  Future<void> _fetchGig() async {
    setState(() => _isLoading = true);
    try {
      final repo = ref.read(gigRepositoryProvider);
      final data = await repo.getGig(widget.gigId);
      final myBid = await repo.getMyBidForGig(widget.gigId);
      if (mounted) {
        setState(() {
          _gig = data;
          _myBid = myBid;
        });
      }
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _placeOrUpdateBid() async {
    // Show bid dialog
    final amountController = TextEditingController(
      text: _myBid?['amount']?.toString() ?? '',
    );
    final letterController = TextEditingController(
      text: _myBid?['cover_letter']?.toString() ?? '',
    );

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(_myBid == null ? 'Place Bid' : 'Update Bid'),
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
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(_myBid == null ? 'Submit Bid' : 'Update Bid'),
          ),
        ],
      ),
    );

    if (result != true) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(gigRepositoryProvider).upsertMyBid(
            gigId: widget.gigId,
            amount: double.parse(amountController.text),
            coverLetter: letterController.text,
          );
      await _fetchGig();
      toastWrapper.showSuccess(
        _myBid == null
            ? 'Bid placed successfully!'
            : 'Bid updated successfully!',
      );
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _withdrawBid() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(gigRepositoryProvider).withdrawMyBid(widget.gigId);
      await _fetchGig();
      toastWrapper.showSuccess('Bid withdrawn');
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitWork() async {
    final descController = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit Work'),
        content: TextField(
          controller: descController,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Submission Notes',
            hintText: 'What did you complete?',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (ok != true) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(gigRepositoryProvider).submitWork(
        gigId: widget.gigId,
        description: descController.text.trim(),
        fileUrls: const [],
      );
      await _fetchGig();
      toastWrapper.showSuccess('Work submitted for review');
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _normalizeStatus(dynamic value) {
    return (value?.toString() ?? '').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _gig == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_gig == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Gig Details')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.search_off_rounded,
                    size: 42, color: Colors.grey),
                const SizedBox(height: 10),
                const Text('Gig not found'),
                const SizedBox(height: 8),
                const Text('The gig may be removed or not available right now.',
                    textAlign: TextAlign.center),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  children: [
                    OutlinedButton(
                      onPressed: _fetchGig,
                      child: const Text('Retry'),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      child: const Text('Go Back'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(_gig!['title'] ?? 'Gig Details')),
      body: Padding(
        padding: const EdgeInsets.all(UiTokens.pagePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_gig!['title'],
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text('Budget: ৳${_gig!['budget']}',
                style: const TextStyle(
                    fontSize: 20,
                    color: Colors.green,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text('Gig: ${_normalizeStatus(_gig!['status'])}')),
                if (_myBid != null)
                  Chip(
                      label: Text(
                          'My Bid: ${_normalizeStatus(_myBid!['status'])}')),
              ],
            ),
            const SizedBox(height: UiTokens.sectionGap),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: UiTokens.cardBorderRadius,
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Description',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 6),
                    Text(_gig!['description'] ?? 'No description'),
                  ],
                ),
              ),
            ).animate().fade(duration: 220.ms).slideY(begin: 0.07, end: 0),
            const SizedBox(height: UiTokens.sectionGap),
            if (_myBid != null)
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: UiTokens.cardBorderRadius,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'My Latest Bid',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text('Amount: ৳${_myBid!['amount']}'),
                      const SizedBox(height: 4),
                      Text('Cover Letter: ${_myBid!['cover_letter'] ?? ''}'),
                    ],
                  ),
                ),
              )
                  .animate(delay: 80.ms)
                  .fade(duration: 220.ms)
                  .slideY(begin: 0.07, end: 0),
            const Spacer(),
            if (_normalizeStatus(_myBid?['status']) == 'ACCEPTED' ||
                _normalizeStatus(_myBid?['status']) == 'IN_PROGRESS')
              ElevatedButton(
                onPressed: _isLoading ? null : _submitWork,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(14),
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: UiTokens.cardBorderRadius,
                  ),
                ),
                child: const Text('Submit Work'),
              )
            else
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _placeOrUpdateBid,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.all(14),
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: UiTokens.cardBorderRadius,
                        ),
                      ),
                      child: Text(_myBid == null ? 'Place Bid' : 'Update Bid'),
                    ),
                  ),
                  if (_myBid != null) ...[
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: _isLoading ? null : _withdrawBid,
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: UiTokens.cardBorderRadius,
                        ),
                      ),
                      child: const Text('Withdraw'),
                    ),
                  ],
                ],
              ),
          ],
        ),
      ),
    );
  }
}
