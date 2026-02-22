import '../../services/api_service.dart';
import '../models/hospital_model.dart';
import '../../core/constants/app_constants.dart';

class HospitalRepository {
  final ApiService _apiService = ApiService();

  Future<List<HospitalModel>> fetchHospitals() async {
    try {
      final response = await _apiService.dio.get(AppConstants.hospitals);
      return (response.data as List)
          .map((json) => HospitalModel.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> addHospital(String name, String type, String address, String city) async {
    try {
      await _apiService.dio.post(
        AppConstants.hospitals,
        data: {'name': name, 'type': type, 'address': address, 'city': city},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteHospital(String id) async {
    try {
      await _apiService.dio.delete("${AppConstants.hospitals}/$id");
    } catch (e) {
      rethrow;
    }
  }
}
