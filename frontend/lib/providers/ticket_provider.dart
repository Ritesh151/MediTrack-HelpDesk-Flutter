import 'package:flutter/material.dart';
import '../data/models/ticket_model.dart';
import '../data/repositories/ticket_repository.dart';

class TicketProvider extends ChangeNotifier {
  final TicketRepository _repository = TicketRepository();

  List<TicketModel> _tickets = [];
  List<TicketModel> _pendingTickets = [];
  Map<String, dynamic> _stats = {};
  String _searchQuery = "";
  bool _isLoading = false;

  List<TicketModel> get tickets {
    if (_searchQuery.isEmpty) return _tickets;
    return _tickets.where((t) =>
      t.issueTitle.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      t.patientId.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
  }

  List<TicketModel> get pendingTickets => _pendingTickets;
  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadTickets() async {
    _setLoading(true);
    try {
      _tickets = await _repository.fetchTickets();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadPendingTickets() async {
    _setLoading(true);
    try {
      _pendingTickets = await _repository.fetchPendingTickets();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> createTicket(String issueTitle, String description) async {
    _setLoading(true);
    try {
      await _repository.createTicket(issueTitle, description);
      await loadTickets();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> assignTicket(String ticketId, String adminId) async {
    _setLoading(true);
    try {
      await _repository.assignTicket(ticketId, adminId);
      // Refresh pending list so the assigned ticket disappears from super user view,
      // and also refresh the main ticket list so admin dashboards stay consistent.
      await Future.wait([
        loadPendingTickets(),
        loadTickets(),
      ]);
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateStatus(String id, String status, bool assignCaseNumber) async {
    _setLoading(true);
    try {
      await _repository.updateTicket(id, status, assignCaseNumber);
      await loadTickets();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> replyToTicket(String ticketId, Map<String, dynamic> replyData) async {
    _setLoading(true);
    try {
      await _repository.replyToTicket(ticketId, replyData);
      await loadTickets(); // Load assigned tickets
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> deleteTicket(String id) async {
    _setLoading(true);
    try {
      await _repository.deleteTicket(id);
      await loadTickets();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStats() async {
    _setLoading(true);
    try {
      _stats = await _repository.fetchStats();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<TicketModel> getTicketDetails(String id) async {
    return await _repository.fetchTicketDetails(id);
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
