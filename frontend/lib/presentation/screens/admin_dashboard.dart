import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ticket_provider.dart';
import './ticket_reply_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> with RouteAware {
  @override
  void initState() {
    super.initState();
    // Load tickets when dashboard first opens
    Future.microtask(() => _loadTickets());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  /// Called every time this route becomes visible again (e.g. after returning
  /// from TicketReplyScreen), so assigned tickets are always fresh.
  @override
  void didPopNext() {
    _loadTickets();
  }

  void _loadTickets() {
    if (mounted) {
      context.read<TicketProvider>().loadTickets();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          // Manual refresh button so admin can pull latest tickets anytime
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh tickets',
            onPressed: _loadTickets,
          ),
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (user == null) {
            return const Center(
              child: Text(
                'Admin credentials are missing. Please log in again.',
              ),
            );
          }

          // Pull-to-refresh support
          return RefreshIndicator(
            onRefresh: () => context.read<TicketProvider>().loadTickets(),
            child: provider.tickets.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildProfileCard(user),
                      const SizedBox(height: 16),
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.only(top: 32),
                          child: Column(
                            children: [
                              Icon(Icons.inbox_outlined,
                                  size: 64, color: Colors.grey),
                              SizedBox(height: 12),
                              Text(
                                'No assigned tickets yet',
                                style: TextStyle(color: Colors.grey),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Pull down to refresh',
                                style: TextStyle(
                                    color: Colors.grey, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )
                : ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      _buildProfileCard(user),
                      const SizedBox(height: 16),
                      ...provider.tickets.map((ticket) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8.0),
                          child: ListTile(
                            leading: _statusIcon(ticket.status),
                            title: Text(ticket.issueTitle),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Status: ${ticket.status.toUpperCase()}'),
                                if (ticket.patient != null)
                                  Text(
                                    'Patient: ${ticket.patient!['name'] ?? ''}',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                              ],
                            ),
                            isThreeLine: ticket.patient != null,
                            trailing: ticket.status != 'resolved'
                                ? IconButton(
                                    icon: const Icon(Icons.reply),
                                    tooltip: 'Reply to ticket',
                                    onPressed: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            TicketReplyScreen(ticket: ticket),
                                      ),
                                    ).then((_) => _loadTickets()),
                                  )
                                : const Icon(Icons.check_circle,
                                    color: Colors.green),
                          ),
                        );
                      }),
                    ],
                  ),
          );
        },
      ),
    );
  }

  Widget _buildProfileCard(dynamic user) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Name: ${user.name}'),
            const SizedBox(height: 6),
            Text('Email: ${user.email}'),
            const SizedBox(height: 6),
            Text('Role: ${user.role}'),
            const SizedBox(height: 6),
            Text(
              'Permissions: ${user.permissions.isEmpty ? 'None' : user.permissions.join(', ')}',
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusIcon(String status) {
    switch (status) {
      case 'resolved':
        return const Icon(Icons.check_circle, color: Colors.green);
      case 'assigned':
        return const Icon(Icons.assignment_ind, color: Colors.blue);
      default:
        return const Icon(Icons.pending_outlined, color: Colors.orange);
    }
  }
}
