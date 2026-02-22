import 'package:flutter/material.dart';
import '../data/repositories/user_repository.dart';
import '../data/models/user_model.dart';

class UserProvider extends ChangeNotifier {
  final UserRepository _repository = UserRepository();
  bool _isLoading = false;
  List<UserModel> _admins = [];

  bool get isLoading => _isLoading;
  List<UserModel> get admins => _admins;

  Future<void> fetchAdmins() async {
    _isLoading = true;
    notifyListeners();
    try {
      _admins = await _repository.fetchAdmins();
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> assignAdmin({
    required String name,
    required String email,
    required String password,
    required String hospitalId,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.assignAdmin(
        name: name,
        email: email,
        password: password,
        hospitalId: hospitalId,
      );
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
