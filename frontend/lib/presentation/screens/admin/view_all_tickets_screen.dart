import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../widgets/ticket_card.dart';

class ViewAllTicketsScreen extends StatefulWidget {
  const ViewAllTicketsScreen({super.key});

  @override
  State<ViewAllTicketsScreen> createState() => _ViewAllTicketsScreenState();
}

class _ViewAllTicketsScreenState extends State<ViewAllTicketsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TicketProvider>().loadTickets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TicketProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text("All Tickets")),
      body: Builder(
        builder: (context) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.tickets.isEmpty) {
            return const Center(child: Text('No tickets found'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: provider.tickets.length,
            itemBuilder: (context, index) {
              final ticket = provider.tickets[index];
              final canResolve = ticket.status != 'resolved';

              return TicketCard(
                ticket: ticket,
                actionLabel: canResolve ? 'Resolve' : null,
                onAction: canResolve
                    ? () => provider.updateStatus(ticket.id, 'resolved', false)
                    : null,
              );
            },
          );
        },
      ),
    );
  }
}
