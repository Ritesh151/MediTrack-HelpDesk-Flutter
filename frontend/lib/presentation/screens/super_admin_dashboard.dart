import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/user_provider.dart';
import '../../data/models/user_model.dart';
import '../../data/models/ticket_model.dart';

class SuperAdminDashboard extends StatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  State<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends State<SuperAdminDashboard> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<TicketProvider>().loadPendingTickets();
      context.read<UserProvider>().fetchAdmins();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Dashboard'),
      ),
      body: Consumer<TicketProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.pendingTickets.isEmpty) {
            return const Center(child: Text('No pending tickets'));
          }

          return ListView.builder(
            itemCount: provider.pendingTickets.length,
            itemBuilder: (context, index) {
              final ticket = provider.pendingTickets[index];
              return Card(
                margin: const EdgeInsets.all(8.0),
                child: ListTile(
                  title: Text(ticket.issueTitle),
                  subtitle: Text('Patient: ${ticket.patient?['name'] ?? ticket.patientId}'),
                  trailing: ElevatedButton(
                    onPressed: () => _showAssignDialog(context, ticket),
                    child: const Text('Assign'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showAssignDialog(BuildContext context, TicketModel ticket) {
    showDialog(
      context: context,
      builder: (context) {
        return Consumer<UserProvider>(
          builder: (context, userProvider, child) {
            return AlertDialog(
              title: const Text('Assign Ticket'),
              content: SizedBox(
                width: double.maxFinite,
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: userProvider.admins.length,
                  itemBuilder: (context, index) {
                    final admin = userProvider.admins[index];
                    return ListTile(
                      title: Text(admin.name),
                      subtitle: Text(admin.email),
                      onTap: () {
                        context.read<TicketProvider>().assignTicket(ticket.id, admin.id);
                        Navigator.pop(context);
                      },
                    );
                  },
                ),
              ),
            );
          },
        );
      },
    );
  }
}
