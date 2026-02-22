import '../../services/api_service.dart';
import '../../core/constants/app_constants.dart';
import '../models/user_model.dart';

class UserRepository {
  final ApiService _apiService = ApiService();

  Future<void> assignAdmin({
    required String name,
    required String email,
    required String password,
    required String hospitalId,
  }) async {
    try {
      await _apiService.post(
        AppConstants.assignAdmin,
        data: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
          'hospitalId': hospitalId.trim(),
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<List<UserModel>> fetchAdmins() async {
    try {
      final response = await _apiService.get("${AppConstants.users}/admins");
      return (response.data as List)
          .map((json) => UserModel.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> fetchUsers() async {
    try {
      final response = await _apiService.dio.get(AppConstants.users);
      return response.data as List;
    } catch (e) {
      rethrow;
    }
  }
}
