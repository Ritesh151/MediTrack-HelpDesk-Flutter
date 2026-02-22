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

class _AdminDashboardState extends State<AdminDashboard> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<TicketProvider>().loadTickets());
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
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

          if (provider.tickets.isEmpty) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
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
                ),
                const SizedBox(height: 16),
                const Center(child: Text('No assigned tickets')),
              ],
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
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
              ),
              const SizedBox(height: 16),
              ...provider.tickets.map((ticket) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8.0),
                  child: ListTile(
                    title: Text(ticket.issueTitle),
                    subtitle: Text('Status: ${ticket.status.toUpperCase()}'),
                    trailing: ticket.status != 'resolved'
                        ? IconButton(
                            icon: const Icon(Icons.reply),
                            onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    TicketReplyScreen(ticket: ticket),
                              ),
                            ),
                          )
                        : const Icon(Icons.check_circle, color: Colors.green),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
