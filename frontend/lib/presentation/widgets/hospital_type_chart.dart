import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class HospitalTypeChart extends StatelessWidget {
  final Map<String, dynamic> stats;

  const HospitalTypeChart({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final gov = stats['gov'] ?? 0;
    final private = stats['private'] ?? 0;
    final semi = stats['semi'] ?? 0;

    if (gov == 0 && private == 0 && semi == 0) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('Insufficient hospital data')),
      );
    }

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
            'Hospital Types Distribution',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: (gov > private ? (gov > semi ? gov : semi) : (private > semi ? private : semi)).toDouble() + 1,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        switch (value.toInt()) {
                          case 0: return const Text('Gov', style: TextStyle(fontSize: 10));
                          case 1: return const Text('Private', style: TextStyle(fontSize: 10));
                          case 2: return const Text('Semi', style: TextStyle(fontSize: 10));
                          default: return const Text('');
                        }
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: [
                  BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: gov.toDouble(), color: Colors.purple, width: 15, borderRadius: BorderRadius.circular(4))]),
                  BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: private.toDouble(), color: Colors.blue, width: 15, borderRadius: BorderRadius.circular(4))]),
                  BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: semi.toDouble(), color: Colors.orange, width: 15, borderRadius: BorderRadius.circular(4))]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
