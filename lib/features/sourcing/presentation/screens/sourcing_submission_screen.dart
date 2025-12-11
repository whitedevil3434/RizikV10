import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/sourcing/data/sourcing_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';
import 'package:go_router/go_router.dart';

/// Sourcing Submission Screen
/// Form to submit a solution (link/price) for a request
class SourcingSubmissionScreen extends ConsumerStatefulWidget {
  final String requestId;
  final String productName;

  const SourcingSubmissionScreen({
    super.key,
    required this.requestId,
    required this.productName,
  });

  @override
  ConsumerState<SourcingSubmissionScreen> createState() => _SourcingSubmissionScreenState();
}

class _SourcingSubmissionScreenState extends ConsumerState<SourcingSubmissionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _urlController = TextEditingController();
  final _priceController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _urlController.dispose();
    _priceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(sourcingRepositoryProvider).submitSolution(
        requestId: widget.requestId,
        sourceUrl: _urlController.text,
        price: double.parse(_priceController.text),
        notes: _notesController.text,
      );

      toastWrapper.showSuccess('Solution submitted! Commission pending approval.');
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
      appBar: AppBar(title: Text('Submit for ${widget.productName}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'Source URL (Facebook/Web)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.link),
                ),
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _priceController,
                decoration: const InputDecoration(
                  labelText: 'Price Found (৳)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.attach_money),
                ),
                keyboardType: TextInputType.number,
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Notes (Condition, Location)',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Submit Solution'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
