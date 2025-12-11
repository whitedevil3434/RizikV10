import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gig/data/gig_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';
import 'package:go_router/go_router.dart';

/// Gig Submission Screen
/// Form to submit completed work
class GigSubmissionScreen extends ConsumerStatefulWidget {
  final String gigId;
  final String gigTitle;

  const GigSubmissionScreen({
    super.key,
    required this.gigId,
    required this.gigTitle,
  });

  @override
  ConsumerState<GigSubmissionScreen> createState() => _GigSubmissionScreenState();
}

class _GigSubmissionScreenState extends ConsumerState<GigSubmissionScreen> {
  final _descController = TextEditingController();
  final _linkController = TextEditingController();
  bool _isLoading = false;

  Future<void> _submit() async {
    if (_descController.text.isEmpty) {
      toastWrapper.showError('Description required');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(gigRepositoryProvider).submitWork(
        gigId: widget.gigId,
        description: _descController.text,
        fileUrls: _linkController.text.isNotEmpty ? [_linkController.text] : [],
      );

      toastWrapper.showSuccess('Work submitted for review!');
      if (mounted) context.pop();
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Submit: ${widget.gigTitle}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Upload your work or provide a link to the deliverables.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descController,
              decoration: const InputDecoration(
                labelText: 'Work Description',
                border: OutlineInputBorder(),
                hintText: 'Describe what you have done...',
              ),
              maxLines: 5,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _linkController,
              decoration: const InputDecoration(
                labelText: 'File/Project Link (Optional)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.link),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _submit,
              icon: const Icon(Icons.upload_file),
              label: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Submit Work'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
