import '../../services/api_service.dart';
import '../models/hospital_model.dart';
import '../../core/constants/app_constants.dart';

class HospitalRepository {
  final ApiService _apiService = ApiService();

  Future<List<HospitalModel>> fetchHospitals() async {
    try {
      final response = await _apiService.get(AppConstants.hospitals);
      
      // Handle the new response format
      if (response.data is Map && response.data['success'] == true) {
        final data = response.data['data'] as List;
        return data.map((json) => HospitalModel.fromJson(json)).toList();
      }
      
      // Fallback for legacy format (direct array)
      if (response.data is List) {
        return (response.data as List)
            .map((json) => HospitalModel.fromJson(json))
            .toList();
      }
      
      throw Exception('Invalid response format');
    } catch (e) {
      // Re-throw with more context
      throw _parseRepositoryError(e, 'fetch hospitals');
    }
  }

  Future<void> addHospital(String name, String type, String address, String city) async {
    try {
      final response = await _apiService.post(
        AppConstants.hospitals,
        data: {'name': name, 'type': type, 'address': address, 'city': city},
      );
      
      // Validate response
      if (response.data is Map) {
        final success = response.data['success'] ?? true;
        if (!success) {
          throw response.data;
        }
      }
    } catch (e) {
      throw _parseRepositoryError(e, 'add hospital');
    }
  }

  Future<void> deleteHospital(String id) async {
    try {
      final response = await _apiService.delete("${AppConstants.hospitals}/$id");
      
      // Validate response
      if (response.data is Map) {
        final success = response.data['success'] ?? true;
        if (!success) {
          throw response.data;
        }
      }
    } catch (e) {
      throw _parseRepositoryError(e, 'delete hospital');
    }
  }

  dynamic _parseRepositoryError(dynamic error, String operation) {
    // If it's already a structured error from the API, re-throw it
    if (error is Map && error['success'] == false) {
      return error;
    }
    
    // Handle Dio errors
    if (error.toString().contains('DioError')) {
      final message = error.toString();
      
      if (message.contains('404')) {
        return {
          'success': false,
          'message': 'Hospital not found',
          'code': 'HOSPITAL_NOT_FOUND'
        };
      }
      
      if (message.contains('401')) {
        return {
          'success': false,
          'message': 'Authentication required',
          'code': 'AUTHENTICATION_REQUIRED'
        };
      }
      
      if (message.contains('403')) {
        return {
          'success': false,
          'message': 'Insufficient permissions to $operation',
          'code': 'INSUFFICIENT_PERMISSIONS'
        };
      }
      
      if (message.contains('409')) {
        return {
          'success': false,
          'message': 'Conflict detected',
          'code': 'CONFLICT'
        };
      }
      
      if (message.contains('500')) {
        return {
          'success': false,
          'message': 'Server error occurred',
          'code': 'SERVER_ERROR'
        };
      }
      
      if (message.contains('network') || message.contains('connection')) {
        return {
          'success': false,
          'message': 'Network connection error',
          'code': 'NETWORK_ERROR'
        };
      }
    }
    
    // Fallback error
    return {
      'success': false,
      'message': 'Failed to $operation. Please try again.',
      'code': 'UNKNOWN_ERROR',
      'details': error.toString()
    };
  }
}
