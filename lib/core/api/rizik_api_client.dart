import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Provider for RizikApiClient
final rizikApiClientProvider = Provider((ref) => RizikApiClient());

/// RizikApiClient - Core API Handler for Cloudflare Backend
/// Handles all requests to https://rizik-backend.its-sabbir69.workers.dev
class RizikApiClient {
  static const String baseUrl = 'https://rizik-backend.its-sabbir69.workers.dev';
  
  late final Dio _dio;

  RizikApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptor for Auth Token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final session = authWrapper.currentSession;
        if (session != null) {
          options.headers['Authorization'] = 'Bearer ${session.accessToken}';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        print('API Error: ${e.message} | ${e.response?.data}');
        return handler.next(e);
      },
    ));
  }

  /// GET Request
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await _dio.get(path, queryParameters: queryParameters);
  }

  /// POST Request
  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }

  /// PUT Request
  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }

  /// DELETE Request
  Future<Response> delete(String path, {dynamic data}) async {
    return await _dio.delete(path, data: data);
  }
}
