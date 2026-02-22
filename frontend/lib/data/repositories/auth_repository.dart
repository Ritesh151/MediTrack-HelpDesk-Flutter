import 'package:dio/dio.dart';
import '../../services/api_service.dart';
import '../models/user_model.dart';
import '../../core/constants/app_constants.dart';

class AuthRepository {
  final ApiService _apiService = ApiService();

  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _apiService.post(
        AppConstants.login,
        data: {'email': email.trim(), 'password': password},
      );
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<UserModel> getMe() async {
    try {
      final response = await _apiService.get(AppConstants.me);
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<UserModel> register(
    String name,
    String email,
    String password,
    String hospitalId,
  ) async {
    try {
      final response = await _apiService.post(
        AppConstants.register,
        data: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
          'hospitalId': hospitalId.trim(),
        },
      );
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
