import 'package:image_editor/image_editor.dart';
import 'dart:typed_data';
import 'dart:ui' as ui;

/// ImageEditorWrapper - In-App Image Editing
/// Handles cropping, rotation, and basic adjustments
class ImageEditorWrapper {
  static final ImageEditorWrapper _instance = ImageEditorWrapper._internal();
  factory ImageEditorWrapper() => _instance;
  ImageEditorWrapper._internal();

  /// Rotate image
  Future<Uint8List?> rotateImage(Uint8List imageBytes, double angle) async {
    final ImageEditorOption option = ImageEditorOption();
    option.addOption(RotateOption(angle.toInt()));
    return await ImageEditor.editImage(image: imageBytes, imageEditorOption: option);
  }

  /// Flip image
  Future<Uint8List?> flipImage(Uint8List imageBytes, {bool horizontal = true, bool vertical = false}) async {
    final ImageEditorOption option = ImageEditorOption();
    option.addOption(FlipOption(horizontal: horizontal, vertical: vertical));
    return await ImageEditor.editImage(image: imageBytes, imageEditorOption: option);
  }

  /// Clip (Crop) image
  Future<Uint8List?> cropImage(Uint8List imageBytes, int x, int y, int width, int height) async {
    final ImageEditorOption option = ImageEditorOption();
    option.addOption(ClipOption(x: x, y: y, width: width, height: height));
    return await ImageEditor.editImage(image: imageBytes, imageEditorOption: option);
  }

  /// Add text to image (Watermark)
  Future<Uint8List?> addText(Uint8List imageBytes, String text, {int fontSize = 24, int color = 0xFFFFFFFF}) async {
    final ImageEditorOption option = ImageEditorOption();
    // Note: image_editor package text option is complex, simplified here
    // In a real implementation, we'd use a more robust editor UI or canvas drawing
    // For now, this is a placeholder for the wrapper structure
    return imageBytes; 
  }

  /// Combine multiple edits
  Future<Uint8List?> editImage(Uint8List imageBytes, ImageEditorOption option) async {
    return await ImageEditor.editImage(image: imageBytes, imageEditorOption: option);
  }
}

/// Global instance
final imageEditorWrapper = ImageEditorWrapper();
