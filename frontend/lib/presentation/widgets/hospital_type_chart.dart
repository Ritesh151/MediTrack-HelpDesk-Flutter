import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_colors.dart';

class HospitalTypeChart extends StatelessWidget {
  final Map<String, dynamic> stats;

  const HospitalTypeChart({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    // Normalize and get hospital type counts
    final hospitalData = _normalizeHospitalData(stats);
    
    if (hospitalData.isEmpty) {
      return _buildEmptyState();
    }

    return Container(
      height: 280,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hospital Types Distribution',
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: _getMaxY(hospitalData) + 1,
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => AppColors.textPrimary,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      final hospitalType = hospitalData.keys.elementAt(group.x.toInt());
                      final count = rod.toY.toInt();
                      return BarTooltipItem(
                        '${_getHospitalTypeLabel(hospitalType)}\n$count hospitals',
                        const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= hospitalData.length) return const Text('');
                        
                        final hospitalType = hospitalData.keys.elementAt(index);
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            _getHospitalTypeLabel(hospitalType),
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          value.toInt().toString(),
                          style: AppTheme.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: AppColors.border,
                    strokeWidth: 1,
                    dashArray: [4, 4],
                  ),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border(
                    bottom: BorderSide(color: AppColors.border),
                    left: BorderSide(color: AppColors.border),
                  ),
                ),
                barGroups: _buildBarGroups(hospitalData),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      height: 280,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.infoLight,
              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
            ),
            child: Icon(
              Icons.local_hospital_outlined,
              size: 40,
              color: AppColors.info,
            ),
          ),
          const SizedBox(height: AppTheme.md),
          Text(
            'No Hospital Data',
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Text(
            'Add hospitals to see the distribution',
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Map<String, int> _normalizeHospitalData(Map<String, dynamic> stats) {
    final normalizedData = <String, int>{};
    
    // Normalize different variations of hospital types
    for (final entry in stats.entries) {
      final key = entry.key.toLowerCase().trim();
      final value = (entry.value as num?)?.toInt() ?? 0;
      
      if (value <= 0) continue;
      
      // Normalize variations
      String normalizedKey;
      switch (key) {
        case 'gov':
        case 'government':
        case 'govt':
          normalizedKey = 'gov';
          break;
        case 'private':
        case 'pvt':
          normalizedKey = 'private';
          break;
        case 'semi':
        case 'semi-government':
        case 'semi gov':
        case 'semigov':
          normalizedKey = 'semi';
          break;
        default:
          normalizedKey = key;
      }
      
      // Sum up values for normalized keys
      normalizedData[normalizedKey] = (normalizedData[normalizedKey] ?? 0) + value;
    }
    
    // Ensure we have all three types with default 0 if missing
    for (final type in ['gov', 'private', 'semi']) {
      normalizedData.putIfAbsent(type, () => 0);
    }
    
    return normalizedData;
  }

  List<BarChartGroupData> _buildBarGroups(Map<String, int> hospitalData) {
    final barGroups = <BarChartGroupData>[];
    
    hospitalData.forEach((type, count) {
      if (count > 0) {
        final index = hospitalData.keys.toList().indexOf(type);
        barGroups.add(
          BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                toY: count.toDouble(),
                color: _getHospitalTypeColor(type),
                width: 20,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          ),
        );
      }
    });
    
    return barGroups;
  }

  double _getMaxY(Map<String, int> hospitalData) {
    if (hospitalData.isEmpty) return 0;
    return hospitalData.values.reduce((a, b) => a > b ? a : b).toDouble();
  }

  Color _getHospitalTypeColor(String type) {
    switch (type) {
      case 'gov':
        return AppColors.primary;
      case 'private':
        return AppColors.success;
      case 'semi':
        return AppColors.info;
      default:
        return AppColors.gray500;
    }
  }

  String _getHospitalTypeLabel(String type) {
    switch (type) {
      case 'gov':
        return 'Government';
      case 'private':
        return 'Private';
      case 'semi':
        return 'Semi-Gov';
      default:
        return type.toUpperCase();
    }
  }
}
