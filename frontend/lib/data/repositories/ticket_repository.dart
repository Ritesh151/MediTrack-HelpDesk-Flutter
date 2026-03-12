import 'package:flutter/foundation.dart';
import '../../services/api_service.dart';
import '../models/ticket_model.dart';
import '../../core/constants/app_constants.dart';

class TicketRepository {
  final ApiService _apiService = ApiService();

  Future<List<TicketModel>> fetchTickets() async {
    try {
      final response = await _apiService.get(AppConstants.tickets);
      return (response.data as List)
          .map((json) => TicketModel.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<TicketModel>> fetchPendingTickets() async {
    try {
      final response = await _apiService.get("${AppConstants.tickets}/pending");
      return (response.data as List)
          .map((json) => TicketModel.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createTicket(String issueTitle, String description, {String priority = 'medium', String category = 'general_inquiry', String? hospitalId}) async {
    debugPrint(
      "TicketRepository: Creating ticket - Title: $issueTitle, Desc: $description, Priority: $priority, Category: $category, HospitalId: $hospitalId",
    );
    try {
      // Prepare request data
      final requestData = {
        'issueTitle': issueTitle, 
        'description': description,
        'priority': priority,
        'category': category,
      };
      
      // Add hospitalId if provided
      if (hospitalId != null && hospitalId.isNotEmpty) {
        requestData['hospitalId'] = hospitalId;
      }
      
      final response = await _apiService.post(
        AppConstants.tickets,
        data: requestData,
      );
      
      debugPrint(
        "TicketRepository: Ticket created successfully. Status: ${response.statusCode}",
      );
      debugPrint("TicketRepository: Response data: ${response.data}");
      
      // Validate response structure
      if (response.data is Map) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          debugPrint("TicketRepository: Ticket creation confirmed by backend");
        } else {
          throw responseData['message'] ?? 'Ticket creation failed';
        }
      } else {
        debugPrint("TicketRepository: Unexpected response format, but request succeeded");
      }
    } catch (e) {
      debugPrint("TicketRepository: Error creating ticket: $e");
      
      // Re-throw with more context for better error handling
      throw _parseTicketCreationError(e);
    }
  }

  dynamic _parseTicketCreationError(dynamic error) {
    debugPrint("TicketRepository: Parsing error: $error");
    
    // If it's already a structured error from the API, re-throw it
    if (error is Map && error['success'] == false) {
      debugPrint("TicketRepository: Structured API error detected");
      return error;
    }
    
    // Handle Dio errors
    if (error.toString().contains('DioException')) {
      final message = error.toString();
      debugPrint("TicketRepository: DioException detected: $message");
      
      if (message.contains('400')) {
        return {
          'success': false,
          'message': 'Invalid ticket data. Please check all required fields.',
          'code': 'INVALID_DATA'
        };
      }
      
      if (message.contains('401')) {
        return {
          'success': false,
          'message': 'Authentication required. Please login again.',
          'code': 'AUTHENTICATION_REQUIRED'
        };
      }
      
      if (message.contains('409')) {
        return {
          'success': false,
          'message': 'Case number conflict. Please try again.',
          'code': 'CASE_NUMBER_CONFLICT'
        };
      }
      
      if (message.contains('500')) {
        return {
          'success': false,
          'message': 'Server error occurred. Please try again later.',
          'code': 'SERVER_ERROR'
        };
      }
      
      if (message.contains('network') || message.contains('connection')) {
        return {
          'success': false,
          'message': 'Network connection error. Please check your internet.',
          'code': 'NETWORK_ERROR'
        };
      }
    }
    
    // Fallback error
    debugPrint("TicketRepository: Using fallback error handling");
    return {
      'success': false,
      'message': 'Failed to create ticket. Please try again.',
      'code': 'UNKNOWN_ERROR',
      'details': error.toString()
    };
  }

  Future<void> assignTicket(String id, String adminId) async {
    try {
      await _apiService.patch(
        "${AppConstants.tickets}/$id/assign",
        data: {'adminId': adminId},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateTicket(
    String id,
    String status,
    bool assignCaseNumber,
  ) async {
    try {
      await _apiService.patch(
        "${AppConstants.tickets}/$id",
        data: {'status': status, 'assignCaseNumber': assignCaseNumber},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> replyToTicket(String id, Map<String, dynamic> replyData) async {
    try {
      await _apiService.patch(
        "${AppConstants.tickets}/$id/reply",
        data: replyData,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<TicketModel> fetchTicketDetails(String id) async {
    try {
      final response = await _apiService.get("${AppConstants.tickets}/$id");
      return TicketModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteTicket(String id) async {
    try {
      await _apiService.delete("${AppConstants.tickets}/$id");
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchStats() async {
    try {
      final response = await _apiService.get(AppConstants.stats);
      return response.data;
    } catch (e) {
      return {
        'totalTickets': 0,
        'totalHospitals': 0,
        'statsByType': {'gov': 0, 'private': 0, 'semi': 0},
      };
    }
  }
}
