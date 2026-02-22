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

    if (data is Map<String, dynamic> && data['message'] != null) {
      return '[$status] ${data['message']}';
    }

    if (data is String && data.trim().isNotEmpty) {
      return '[$status] ${data.trim()}';
    }

    return e.message ?? 'Network error';
  }
}
