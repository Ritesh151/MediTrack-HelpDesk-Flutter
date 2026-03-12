import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants/app_constants.dart';
import 'preference_service.dart';

class ApiService {
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> _readToken() async {
    if (kIsWeb) return PreferenceService.getAuthToken();
    return _storage.read(key: 'token');
  }

  Future<void> _deleteToken() async {
    if (kIsWeb) {
      await PreferenceService.clearAuthToken();
      return;
    }
    await _storage.delete(key: 'token');
  }

  ApiService() {
    _dio.options.baseUrl = AppConstants.baseUrl;
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _readToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Global Logout on Unauthorized
            await _deleteToken();
            // Optional: You could use a global key to navigate to login
            // NavigationService.replaceTo(AppRouter.login);
          }
          return handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
      );
    } on DioException catch (e) {
      throw Exception(_readableError(e));
    }
  }

  String _readableError(DioException e) {
    final status = e.response?.statusCode;
    final data = e.response?.data;

    // Handle specific HTTP status codes with better messages
    switch (status) {
      case 404:
        return 'Resource not found (404): The requested endpoint does not exist';
      case 401:
        return 'Unauthorized (401): Please login to access this resource';
      case 403:
        return 'Forbidden (403): You do not have permission to access this resource';
      case 500:
        return 'Server Error (500): Internal server error occurred';
      case 409:
        return 'Conflict (409): Resource conflict detected';
      default:
        break;
    }

    // Handle structured error responses from backend
    if (data is Map<String, dynamic>) {
      if (data['message'] != null) {
        return '[$status] ${data['message']}';
      }
      if (data['error'] != null) {
        return '[$status] ${data['error']}';
      }
    }

    // Handle string error responses
    if (data is String && data.trim().isNotEmpty) {
      return '[$status] ${data.trim()}';
    }

    // Fallback to Dio's error message
    return e.message ?? 'Network error occurred';
  }
}
