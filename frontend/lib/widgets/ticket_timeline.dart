import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/ticket_model.dart';

class TicketTimeline extends StatelessWidget {
  final List<TicketHistory> history;

  const TicketTimeline({
    super.key,
    required this.history,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ticket History',
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.md),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: history.length,
            separatorBuilder: (context, index) => const SizedBox(height: AppTheme.md),
            itemBuilder: (context, index) {
              final historyItem = history[index];
              return _buildTimelineItem(historyItem, index == 0);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(TicketHistory historyItem, bool isFirst) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getHistoryColor(historyItem.action).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                border: Border.all(
                  color: _getHistoryColor(historyItem.action),
                  width: 2,
                ),
              ),
              child: Icon(
                _getHistoryIcon(historyItem.action),
                size: 20,
                color: _getHistoryColor(historyItem.action),
              ),
            ),
            if (!isFirst)
              Container(
                width: 2,
                height: 40,
                color: AppColors.border,
              ),
          ],
        ),
        const SizedBox(width: AppTheme.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _getHistoryTitle(historyItem.action),
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppTheme.xs),
              Text(
                historyItem.description,
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppTheme.xs),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 12,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(width: AppTheme.xs),
                  Text(
                    _formatDate(historyItem.timestamp),
                    style: AppTheme.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                  if (historyItem.actorName.isNotEmpty) ...[
                    const SizedBox(width: AppTheme.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                      decoration: BoxDecoration(
                        color: AppColors.gray100,
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        historyItem.actorName,
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _getHistoryColor(String action) {
    switch (action) {
      case 'created':
        return AppColors.success;
      case 'assigned':
        return AppColors.primary;
      case 'replied':
        return AppColors.info;
      case 'status_changed':
        return AppColors.warning;
      case 'closed':
        return AppColors.gray500;
      default:
        return AppColors.gray500;
    }
  }

  IconData _getHistoryIcon(String action) {
    switch (action) {
      case 'created':
        return Icons.add_circle;
      case 'assigned':
        return Icons.person_add;
      case 'replied':
        return Icons.reply;
      case 'status_changed':
        return Icons.sync;
      case 'closed':
        return Icons.check_circle;
      default:
        return Icons.info;
    }
  }

  String _getHistoryTitle(String action) {
    switch (action) {
      case 'created':
        return 'Ticket Created';
      case 'assigned':
        return 'Ticket Assigned';
      case 'replied':
        return 'Reply Added';
      case 'status_changed':
        return 'Status Changed';
      case 'closed':
        return 'Ticket Closed';
      default:
        return 'Unknown Action';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} min${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
}
