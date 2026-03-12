import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../widgets/generate_ticket_modal.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TicketProvider>(context, listen: false).loadTickets();
    });
  }

  void _showGenerateTicket() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => const GenerateTicketModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppTheme.xs),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
              ),
              child: const Icon(
                Icons.person,
                size: 18,
                color: AppColors.textOnPrimary,
              ),
            ),
            const SizedBox(width: AppTheme.sm),
            Text(
              'Welcome, ${user?.name ?? "Patient"}',
              style: AppTheme.headline3.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.surface,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/settings'),
            icon: const Icon(Icons.settings_outlined),
            color: AppColors.textSecondary,
            tooltip: 'Settings',
          ),
          IconButton(
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout().then((_) {
              Navigator.pushReplacementNamed(context, '/login');
            }),
            icon: const Icon(Icons.logout),
            color: AppColors.textSecondary,
            tooltip: 'Logout',
          )
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, ticketProvider, _) {
          if (ticketProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            );
          }
          
          return RefreshIndicator(
            onRefresh: () => ticketProvider.loadTickets(),
            color: AppColors.primary,
            child: CustomScrollView(
              slivers: [
                // Header Section
                SliverToBoxAdapter(
                  child: Container(
                    width: double.infinity,
                    margin: const EdgeInsets.all(AppTheme.md),
                    padding: const EdgeInsets.all(AppTheme.lg),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primary,
                          AppColors.primaryDark,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                      boxShadow: AppTheme.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'My Health Tickets',
                          style: AppTheme.headline2.copyWith(
                            color: AppColors.textOnPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppTheme.sm),
                        Row(
                          children: [
                            Icon(
                              Icons.description_outlined,
                              color: AppColors.textOnPrimary.withOpacity(0.8),
                              size: 20,
                            ),
                            const SizedBox(width: AppTheme.xs),
                            Text(
                              '${ticketProvider.tickets.length} active tickets',
                              style: AppTheme.bodyMedium.copyWith(
                                color: AppColors.textOnPrimary.withOpacity(0.9),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: AppTheme.md)),
                
                // Tickets List
                if (ticketProvider.tickets.isEmpty)
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.all(AppTheme.md),
                      padding: const EdgeInsets.all(AppTheme.xl),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.infoLight,
                              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                            ),
                            child: const Icon(
                              Icons.inbox_outlined,
                              size: 40,
                              color: AppColors.info,
                            ),
                          ),
                          const SizedBox(height: AppTheme.md),
                          Text(
                            'No Tickets Yet',
                            style: AppTheme.headline3.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AppTheme.sm),
                          Text(
                            'Create your first health ticket to get started',
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: AppTheme.md),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final ticket = ticketProvider.tickets[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: AppTheme.md),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                              boxShadow: AppTheme.cardShadow,
                              border: Border.all(
                                color: AppColors.border,
                                width: 1,
                              ),
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                              onTap: () => Navigator.pushNamed(context, '/ticket-details', arguments: ticket),
                              child: Padding(
                                padding: const EdgeInsets.all(AppTheme.md),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(AppTheme.sm),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(ticket.status).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                          ),
                                          child: Icon(
                                            Icons.description_outlined,
                                            size: 20,
                                            color: _getStatusColor(ticket.status),
                                          ),
                                        ),
                                        const SizedBox(width: AppTheme.md),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                ticket.caseNumber,
                                                style: AppTheme.bodyMedium.copyWith(
                                                  color: AppColors.primary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                              const SizedBox(height: AppTheme.xs),
                                              Text(
                                                ticket.issueTitle,
                                                style: AppTheme.bodyLarge.copyWith(
                                                  color: AppColors.textPrimary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: AppTheme.sm),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                                          decoration: BoxDecoration(
                                            color: _getPriorityColor(ticket.priority).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                          ),
                                          child: Text(
                                            ticket.priority.toUpperCase(),
                                            style: AppTheme.bodySmall.copyWith(
                                              color: _getPriorityColor(ticket.priority),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: AppTheme.sm),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(ticket.status).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                          ),
                                          child: Text(
                                            ticket.status.toUpperCase(),
                                            style: AppTheme.bodySmall.copyWith(
                                              color: _getStatusColor(ticket.status),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: AppTheme.sm),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Last activity: ${_formatLastActivity(ticket.lastActivityAt)}',
                                          style: AppTheme.caption.copyWith(
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                        IconButton(
                                          onPressed: () => Navigator.pushNamed(context, '/ticket-reply', arguments: ticket),
                                          icon: const Icon(Icons.chat_outlined),
                                          color: AppColors.primary,
                                          tooltip: 'Chat',
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: ticketProvider.tickets.length,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showGenerateTicket,
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        ),
        icon: const Icon(Icons.add),
        label: const Text('New Ticket'),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return AppColors.warning;
      case 'assigned': return AppColors.primary;
      case 'in_progress': return AppColors.info;
      case 'resolved': return AppColors.success;
      case 'closed': return AppColors.gray500;
      default: return AppColors.gray500;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'low': return AppColors.success;
      case 'medium': return AppColors.info;
      case 'high': return AppColors.warning;
      case 'emergency': return AppColors.error;
      default: return AppColors.gray500;
    }
  }

  String _formatLastActivity(DateTime? lastActivity) {
    if (lastActivity == null) return 'Never';
    
    final now = DateTime.now();
    final difference = now.difference(lastActivity);

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
