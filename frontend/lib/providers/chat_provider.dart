import 'package:flutter/material.dart';
import '../data/models/message_model.dart';
import '../data/repositories/chat_repository.dart';

class ChatProvider extends ChangeNotifier {
  final ChatRepository _repository = ChatRepository();
  List<MessageModel> _messages = [];
  bool _isLoading = false;

  List<MessageModel> get messages => _messages;
  bool get isLoading => _isLoading;

  Future<void> loadMessages(String ticketId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _messages = await _repository.getMessages(ticketId);
    } catch (e) {
      debugPrint('Error loading messages: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendMessage(String ticketId, String text) async {
    try {
      final newMessage = await _repository.sendMessage(ticketId, text);
      _messages.add(newMessage);
      notifyListeners();
    } catch (e) {
      debugPrint('Error sending message: $e');
      rethrow;
    }
  }

  void clearMessages() {
    _messages = [];
    notifyListeners();
  }
}
