import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../data/models/ticket_model.dart';

class TicketStatusChart extends StatelessWidget {
  final List<TicketModel> tickets;

  const TicketStatusChart({super.key, required this.tickets});

  @override
  Widget build(BuildContext context) {
    if (tickets.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('No ticket data for visualization')),
      );
    }

    final pending = tickets.where((t) => t.status == 'pending').length;
    final inProgress = tickets.where((t) => t.status == 'in-progress').length;
    final resolved = tickets.where((t) => t.status == 'resolved').length;

    return Container(
      height: 250,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Ticket Status Distribution',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                sections: [
                  PieChartSectionData(
                    value: pending.toDouble(),
                    title: pending > 0 ? '$pending' : '',
                    color: Colors.orange,
                    radius: 50,
                    titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  PieChartSectionData(
                    value: inProgress.toDouble(),
                    title: inProgress > 0 ? '$inProgress' : '',
                    color: Colors.blue,
                    radius: 50,
                    titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  PieChartSectionData(
                    value: resolved.toDouble(),
                    title: resolved > 0 ? '$resolved' : '',
                    color: Colors.green,
                    radius: 50,
                    titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _LegendItem(color: Colors.orange, label: 'Pending'),
              const SizedBox(width: 15),
              _LegendItem(color: Colors.blue, label: 'In Progress'),
              const SizedBox(width: 15),
              _LegendItem(color: Colors.green, label: 'Resolved'),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
