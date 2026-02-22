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

  Future<void> createTicket(String issueTitle, String description) async {
    print(
      "TicketRepository: Creating ticket - Title: $issueTitle, Desc: $description",
    );
    try {
      final response = await _apiService.post(
        AppConstants.tickets,
        data: {'issueTitle': issueTitle, 'description': description},
      );
      print(
        "TicketRepository: Ticket created successfully. Status: ${response.statusCode}",
      );
    } catch (e) {
      print("TicketRepository: Error creating ticket: $e");
      rethrow;
    }
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
