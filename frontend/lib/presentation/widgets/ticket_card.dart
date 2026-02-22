import 'package:flutter/material.dart';
import '../../data/models/ticket_model.dart';

class TicketCard extends StatelessWidget {
  final TicketModel ticket;
  final VoidCallback? onAction;
  final String? actionLabel;

  const TicketCard({
    super.key,
    required this.ticket,
    this.onAction,
    this.actionLabel,
  });

  Color _statusColor() {
    switch (ticket.status) {
      case 'pending':
        return Colors.orange;
      case 'in-progress':
        return Colors.blue;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(ticket.issueTitle),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(ticket.description),
            const SizedBox(height: 6),
            if (ticket.patient?['name'] != null)
              Text('Patient: ${ticket.patient?['name']}'),
            if (ticket.assignedAdmin?['name'] != null)
              Text('Assigned Admin: ${ticket.assignedAdmin?['name']}'),
            Text(
              "Status: ${ticket.status}",
              style: TextStyle(color: _statusColor()),
            ),
          ],
        ),
        trailing: onAction != null
            ? ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel ?? "Action"),
              )
            : null,
      ),
    );
  }
}
