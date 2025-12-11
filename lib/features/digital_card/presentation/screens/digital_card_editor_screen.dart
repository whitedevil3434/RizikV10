import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/digital_card/data/digital_card_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';

/// Digital Card Editor Screen
/// Edit profile, theme, and links
class DigitalCardEditorScreen extends ConsumerStatefulWidget {
  const DigitalCardEditorScreen({super.key});

  @override
  ConsumerState<DigitalCardEditorScreen> createState() => _DigitalCardEditorScreenState();
}

class _DigitalCardEditorScreenState extends ConsumerState<DigitalCardEditorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _titleController = TextEditingController();
  final _bioController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _websiteController = TextEditingController();
  
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final data = await ref.read(digitalCardRepositoryProvider).getMyCard();
      if (data.isNotEmpty) {
        final profile = data['profile_data'] ?? {};
        _nameController.text = profile['name'] ?? '';
        _titleController.text = profile['title'] ?? '';
        _bioController.text = profile['bio'] ?? '';
        _phoneController.text = profile['phone'] ?? '';
        _emailController.text = profile['email'] ?? '';
        _websiteController.text = profile['website'] ?? '';
      }
    } catch (e) {
      // Ignore error for new cards
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(digitalCardRepositoryProvider).updateCard(
        profileData: {
          'name': _nameController.text,
          'title': _titleController.text,
          'bio': _bioController.text,
          'phone': _phoneController.text,
          'email': _emailController.text,
          'website': _websiteController.text,
        },
        theme: {'color': 'blue', 'style': 'modern'}, // Default theme for now
      );
      toastWrapper.showSuccess('Card updated successfully!');
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Digital Card'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _isLoading ? null : _save,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    _buildSection('Basic Info', [
                      _buildField(_nameController, 'Full Name'),
                      _buildField(_titleController, 'Job Title / Role'),
                      _buildField(_bioController, 'Bio', maxLines: 3),
                    ]),
                    const SizedBox(height: 24),
                    _buildSection('Contact Info', [
                      _buildField(_phoneController, 'Phone', icon: Icons.phone),
                      _buildField(_emailController, 'Email', icon: Icons.email),
                      _buildField(_websiteController, 'Website', icon: Icons.language),
                    ]),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        ...children,
      ],
    );
  }

  Widget _buildField(TextEditingController controller, String label, {IconData? icon, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          prefixIcon: icon != null ? Icon(icon) : null,
        ),
        maxLines: maxLines,
      ),
    );
  }
}
