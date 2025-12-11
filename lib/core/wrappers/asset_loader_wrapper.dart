import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter/material.dart';

/// AssetLoaderWrapper - Smart Asset Management
/// Handles caching, preloading, and efficient asset loading
class AssetLoaderWrapper {
  static final AssetLoaderWrapper _instance = AssetLoaderWrapper._internal();
  factory AssetLoaderWrapper() => _instance;
  AssetLoaderWrapper._internal();

  final DefaultCacheManager _cacheManager = DefaultCacheManager();

  /// Preload image assets
  Future<void> preloadImages(BuildContext context, List<String> assetPaths) async {
    for (final path in assetPaths) {
      await precacheImage(AssetImage(path), context);
    }
  }

  /// Get cached file from URL
  Future<File> getCachedFile(String url) async {
    return await _cacheManager.getSingleFile(url);
  }

  /// Download and cache file
  Future<FileInfo> downloadFile(String url) async {
    return await _cacheManager.downloadFile(url);
  }

  /// Clear cache
  Future<void> clearCache() async {
    await _cacheManager.emptyCache();
  }

  /// Remove specific file from cache
  Future<void> removeFile(String url) async {
    await _cacheManager.removeFile(url);
  }
}

/// Global instance
final assetLoaderWrapper = AssetLoaderWrapper();
