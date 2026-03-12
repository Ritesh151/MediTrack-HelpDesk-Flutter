import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../widgets/ticket_status_chart.dart';
import '../../../data/models/ticket_model.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TicketProvider>(context, listen: false).loadTickets();
    });
  }

  void _showUpdateStatus(String id, String currentStatus) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Update Ticket Status', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ListTile(
              leading: const Icon(Icons.sync, color: Colors.blue),
              title: const Text('In Progress'),
              onTap: () => _update(id, 'in-progress', true),
            ),
            ListTile(
              leading: const Icon(Icons.check_circle, color: Colors.green),
              title: const Text('Resolved'),
              onTap: () => _update(id, 'resolved', false),
            ),
          ],
        ),
      ),
    );
  }

  void _update(String id, String status, bool assignCase) async {
    await Provider.of<TicketProvider>(context, listen: false).updateStatus(id, status, assignCase);
    if (!mounted) return;
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Ticket updated to ${status.toUpperCase()}')),
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
                color: AppColors.adminRole,
                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
              ),
              child: const Icon(
                Icons.admin_panel_settings,
                size: 18,
                color: AppColors.textOnPrimary,
              ),
            ),
            const SizedBox(width: AppTheme.sm),
            Text(
              'Admin: ${user?.hospitalId ?? "Hospital"}',
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
            icon: const Icon(Icons.settings_outlined, color: AppColors.textSecondary),
            tooltip: 'Settings',
          ),
          IconButton(
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout().then((_) {
              Navigator.pushReplacementNamed(context, '/login');
            }),
            icon: const Icon(Icons.logout, color: AppColors.textSecondary),
            tooltip: 'Logout',
          )
        ],
      ),
      body: Consumer<TicketProvider>(
        builder: (context, ticketProvider, _) {
          if (ticketProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.adminRole),
              ),
            );
          }
          
          return RefreshIndicator(
            onRefresh: () => ticketProvider.loadTickets(),
            color: AppColors.adminRole,
            child: CustomScrollView(
              slivers: [
                // Chart Section
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(AppTheme.md),
                    padding: const EdgeInsets.all(AppTheme.lg),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                      boxShadow: AppTheme.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ticket Analytics',
                          style: AppTheme.headline3.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppTheme.md),
                        TicketStatusChart(tickets: ticketProvider.tickets),
                      ],
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: AppTheme.md)),
                
                // Search Section
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppTheme.md),
                    child: TextField(
                      onChanged: (val) => Provider.of<TicketProvider>(context, listen: false).setSearchQuery(val),
                      decoration: InputDecoration(
                        hintText: 'Search tickets by title or patient ID...',
                        prefixIcon: const Icon(Icons.search, color: AppColors.textTertiary),
                        filled: true,
                        fillColor: AppColors.surface,
                        contentPadding: const EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: AppTheme.md),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                          borderSide: const BorderSide(color: AppColors.border, width: 1),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                          borderSide: const BorderSide(color: AppColors.border, width: 1),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                          borderSide: const BorderSide(color: AppColors.adminRole, width: 2),
                        ),
                      ),
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: AppTheme.md)),
                
                // Tickets Header
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppTheme.md),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recent Tickets',
                          style: AppTheme.headline3.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                          decoration: BoxDecoration(
                            color: AppColors.adminRole.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                          ),
                          child: Text(
                            '${ticketProvider.tickets.length} tickets',
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.adminRole,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: AppTheme.sm)),
                
                // Tickets List
                if (ticketProvider.tickets.isEmpty)
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: AppTheme.md),
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
                            'No Tickets Assigned',
                            style: AppTheme.headline3.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AppTheme.sm),
                          Text(
                            'Tickets assigned to you will appear here',
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
                                                ticket.issueTitle,
                                                style: AppTheme.bodyLarge.copyWith(
                                                  color: AppColors.textPrimary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: AppTheme.xs),
                                              Text(
                                                'Patient ID: ${ticket.patientId}',
                                                style: AppTheme.bodySmall.copyWith(
                                                  color: AppColors.textSecondary,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: AppTheme.sm),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(ticket.status).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                                          ),
                                          child: Text(
                                            ticket.status.toUpperCase(),
                                            style: AppTheme.bodySmall.copyWith(
                                              color: _getStatusColor(ticket.status),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(
                                              icon: const Icon(Icons.chat_outlined, color: AppColors.primary, size: 20),
                                              onPressed: () => Navigator.pushNamed(context, '/ticket-reply', arguments: ticket),
                                              tooltip: 'Chat & Reply',
                                            ),
                                            IconButton(
                                              icon: const Icon(Icons.edit_note, color: AppColors.adminRole, size: 20),
                                              onPressed: () => _showUpdateStatus(ticket.id, ticket.status),
                                              tooltip: 'Update Status',
                                            ),
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                                              onPressed: () => _delete(ticket.id),
                                              tooltip: 'Delete Ticket',
                                            ),
                                          ],
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
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return AppColors.warning;
      case 'in-progress': return AppColors.adminRole;
      case 'assigned': return AppColors.adminRole;
      case 'resolved': return AppColors.success;
      default: return AppColors.gray500;
    }
  }

  void _delete(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Ticket'),
        content: const Text('Are you sure you want to delete this ticket?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete'), style: TextButton.styleFrom(foregroundColor: Colors.red)),
        ],
      ),
    );

    if (confirmed == true) {
      await Provider.of<TicketProvider>(context, listen: false).deleteTicket(id);
    }
  }
}
