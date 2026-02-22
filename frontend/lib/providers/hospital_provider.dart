import 'package:flutter/material.dart';
import '../data/models/hospital_model.dart';
import '../data/repositories/hospital_repository.dart';

class HospitalProvider extends ChangeNotifier {
  final HospitalRepository _repository = HospitalRepository();

  List<HospitalModel> _hospitals = [];
  String _searchQuery = "";
  bool _isLoading = false;

  List<HospitalModel> get hospitals {
    if (_searchQuery.isEmpty) return _hospitals;
    return _hospitals.where((h) {
      final nameMatches = h.name.toLowerCase().contains(_searchQuery.toLowerCase());
      final cityMatches = h.city.toLowerCase().contains(_searchQuery.toLowerCase());
      return nameMatches || cityMatches;
    }).toList();
  }

  bool get isLoading => _isLoading;

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadHospitals() async {
    _setLoading(true);
    try {
      _hospitals = await _repository.fetchHospitals();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> addHospital(String name, String type, String address, String city) async {
    _setLoading(true);
    try {
      await _repository.addHospital(name, type, address, city);
      await loadHospitals();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> removeHospital(String id) async {
    _setLoading(true);
    try {
      await _repository.deleteHospital(id);
      await loadHospitals();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
