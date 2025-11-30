import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../widgets/camera_loading_overlay.dart';

/// 📸 Professional Camera Service
/// 
/// Eliminates the "Black Screen" bug by providing proper loading states
/// and smooth transitions when accessing camera functionality
class CameraService {
  static final CameraService _instance = CameraService._internal();
  factory CameraService() => _instance;
  CameraService._internal();

  final ImagePicker _imagePicker = ImagePicker();
  bool _isLoading = false;

  /// Show camera with professional loading overlay
  Future<XFile?> showCameraWithLoading({
    required BuildContext context,
    String loadingMessage = 'Opening Camera...',
    int maxWidth = 1024,
    int maxHeight = 1024,
    int imageQuality = 85,
  }) async {
    if (_isLoading) return null;

    try {
      _isLoading = true;
      
      // Show loading overlay immediately
      final overlayEntry = _showLoadingOverlay(context, loadingMessage);
      
      // Add small delay to ensure overlay is visible
      await Future.delayed(const Duration(milliseconds: 300));
      
      // Request camera permission and open camera
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: maxWidth.toDouble(),
        maxHeight: maxHeight.toDouble(),
        imageQuality: imageQuality,
      );
      
      // Remove loading overlay
      overlayEntry.remove();
      
      // Provide haptic feedback
      if (image != null) {
        HapticFeedback.lightImpact();
      }
      
      return image;
      
    } catch (e) {
      // Handle errors gracefully
      debugPrint('Camera error: $e');
      
      if (context.mounted) {
        _showErrorDialog(context, 'Camera Error', 
          'Unable to access camera. Please check permissions and try again.');
      }
      
      return null;
      
    } finally {
      _isLoading = false;
    }
  }

  /// Show gallery with loading state
  Future<XFile?> showGalleryWithLoading({
    required BuildContext context,
    String loadingMessage = 'Opening Gallery...',
    int maxWidth = 1024,
    int maxHeight = 1024,
    int imageQuality = 85,
  }) async {
    if (_isLoading) return null;

    try {
      _isLoading = true;
      
      // Show loading overlay
      final overlayEntry = _showLoadingOverlay(context, loadingMessage);
      
      // Add small delay for smooth transition
      await Future.delayed(const Duration(milliseconds: 200));
      
      // Open gallery
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: maxWidth.toDouble(),
        maxHeight: maxHeight.toDouble(),
        imageQuality: imageQuality,
      );
      
      // Remove loading overlay
      overlayEntry.remove();
      
      // Provide haptic feedback
      if (image != null) {
        HapticFeedback.lightImpact();
      }
      
      return image;
      
    } catch (e) {
      debugPrint('Gallery error: $e');
      
      if (context.mounted) {
        _showErrorDialog(context, 'Gallery Error', 
          'Unable to access gallery. Please check permissions and try again.');
      }
      
      return null;
      
    } finally {
      _isLoading = false;
    }
  }

  /// Show image source selection with professional UI
  Future<XFile?> showImageSourceSelection({
    required BuildContext context,
    String title = 'Select Image Source',
    String cameraLabel = 'Take Photo',
    String galleryLabel = 'Choose from Gallery',
    int maxWidth = 1024,
    int maxHeight = 1024,
    int imageQuality = 85,
  }) async {
    return showModalBottomSheet<XFile?>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Title
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Camera Option
              ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.camera_alt,
                    color: Colors.blue,
                  ),
                ),
                title: Text(cameraLabel),
                subtitle: const Text('Capture a new photo'),
                onTap: () async {
                  Navigator.pop(context);
                  
                  final image = await showCameraWithLoading(
                    context: context,
                    maxWidth: maxWidth,
                    maxHeight: maxHeight,
                    imageQuality: imageQuality,
                  );
                  
                  if (context.mounted) {
                    Navigator.pop(context, image);
                  }
                },
              ),
              
              // Gallery Option
              ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.photo_library,
                    color: Colors.green,
                  ),
                ),
                title: Text(galleryLabel),
                subtitle: const Text('Select from your photos'),
                onTap: () async {
                  Navigator.pop(context);
                  
                  final image = await showGalleryWithLoading(
                    context: context,
                    maxWidth: maxWidth,
                    maxHeight: maxHeight,
                    imageQuality: imageQuality,
                  );
                  
                  if (context.mounted) {
                    Navigator.pop(context, image);
                  }
                },
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  /// Show loading overlay
  OverlayEntry _showLoadingOverlay(BuildContext context, String message) {
    final overlayEntry = OverlayEntry(
      builder: (context) => CameraLoadingOverlay(
        isVisible: true,
        message: message,
      ),
    );
    
    Overlay.of(context).insert(overlayEntry);
    return overlayEntry;
  }

  /// Show error dialog
  void _showErrorDialog(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.red),
            const SizedBox(width: 8),
            Text(title),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  /// Check if camera is available
  Future<bool> isCameraAvailable() async {
    try {
      // Try to access camera briefly to check availability
      await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1,
        maxHeight: 1,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Get loading state
  bool get isLoading => _isLoading;
}