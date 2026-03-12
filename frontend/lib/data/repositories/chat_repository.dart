import '../../services/api_service.dart';
import '../models/message_model.dart';

class ChatRepository {
  final ApiService _apiService = ApiService();

  Future<List<MessageModel>> getMessages(String ticketId) async {
    try {
      final response = await _apiService.get('/api/chat/$ticketId');
      return (response.data as List)
          .map((json) => MessageModel.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<MessageModel> sendMessage(String ticketId, String content) async {
    try {
      final response = await _apiService.post('/api/chat/$ticketId', data: {'content': content});
      return MessageModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
