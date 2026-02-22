import '../../services/api_service.dart';
import '../models/message_model.dart';
import '../../core/constants/app_constants.dart';

class ChatRepository {
  final ApiService _apiService = ApiService();

  Future<List<MessageModel>> getMessages(String ticketId) async {
    final response = await _apiService.dio.get('${AppConstants.baseUrl}/api/chat/$ticketId');
    return (response.data as List)
        .map((json) => MessageModel.fromJson(json))
        .toList();
  }

  Future<MessageModel> sendMessage(String ticketId, String text) async {
    final response = await _apiService.dio.post('${AppConstants.baseUrl}/api/chat/$ticketId', data: {'text': text});
    return MessageModel.fromJson(response.data);
  }
}
