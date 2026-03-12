import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../data/models/hospital_model.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class ManageHospitalsScreen extends StatelessWidget {
  const ManageHospitalsScreen({super.key});

  Future<void> _showAddHospitalDialog(BuildContext context) async {
    final provider = context.read<HospitalProvider>();
    final nameController = TextEditingController();
    final typeController = TextEditingController(text: 'private');
    final addressController = TextEditingController();
    final cityController = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add Hospital'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
              TextField(
                controller: typeController,
                decoration: const InputDecoration(
                  labelText: 'Type (gov/private/semi)',
                ),
              ),
              TextField(
                controller: cityController,
                decoration: const InputDecoration(labelText: 'City'),
              ),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(labelText: 'Address'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                await provider.addHospital(
                  nameController.text,
                  typeController.text,
                  addressController.text,
                  cityController.text,
                );
                if (!context.mounted) return;
                Navigator.pop(context);
                _showSuccessSnackBar(context, 'Hospital added successfully');
              },
              child: const Text('Add'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _showDeleteConfirmationDialog(BuildContext context, HospitalModel hospital) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(Icons.warning, color: AppColors.warning, size: 24),
              const SizedBox(width: 8),
              const Text('Delete Hospital'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Are you sure you want to delete this hospital?',
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppTheme.sm),
              Container(
                padding: const EdgeInsets.all(AppTheme.md),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hospital.name,
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${hospital.type.toUpperCase()} • ${hospital.city}',
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.md),
              Text(
                'This action cannot be undone. The hospital will be permanently removed from the system.',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: AppColors.textOnPrimary,
              ),
              child: const Text('Delete Hospital'),
            ),
          ],
        );
      },
    );

    if (confirmed == true && context.mounted) {
      await _deleteHospital(context, hospital);
    }
  }

  Future<void> _deleteHospital(BuildContext context, HospitalModel hospital) async {
    try {
      await context.read<HospitalProvider>().removeHospital(hospital.id);
      if (context.mounted) {
        _showSuccessSnackBar(context, 'Hospital deleted successfully');
      }
    } catch (error) {
      if (context.mounted) {
        _showErrorSnackBar(context, error.toString());
      }
    }
  }

  void _showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.textOnPrimary, size: 20),
            const SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.error, color: AppColors.textOnPrimary, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 5),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HospitalProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Manage Hospitals"),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadHospitals(),
        color: AppColors.primary,
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.hospitals.isEmpty
                ? _buildEmptyState(context)
                : _buildHospitalList(context, provider),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddHospitalDialog(context),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 4,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.infoLight,
              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
            ),
            child: Icon(
              Icons.local_hospital_outlined,
              size: 60,
              color: AppColors.info,
            ),
          ),
          const SizedBox(height: AppTheme.lg),
          Text(
            'No Hospitals Yet',
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Text(
            'Add your first hospital to get started',
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHospitalList(BuildContext context, HospitalProvider provider) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppTheme.md),
      itemCount: provider.hospitals.length,
      itemBuilder: (context, index) {
        final hospital = provider.hospitals[index];
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
          child: ListTile(
            contentPadding: const EdgeInsets.all(AppTheme.md),
            leading: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _getHospitalTypeColor(hospital.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
              ),
              child: Icon(
                Icons.local_hospital,
                color: _getHospitalTypeColor(hospital.type),
                size: 24,
              ),
            ),
            title: Text(
              hospital.name,
              style: AppTheme.bodyLarge.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.xs,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: _getHospitalTypeColor(hospital.type).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        hospital.type.toUpperCase(),
                        style: AppTheme.bodySmall.copyWith(
                          color: _getHospitalTypeColor(hospital.type),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppTheme.xs),
                    Text(
                      hospital.city,
                      style: AppTheme.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  hospital.address,
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            trailing: IconButton(
              icon: Icon(
                Icons.delete_outline,
                color: AppColors.error,
              ),
              onPressed: () => _showDeleteConfirmationDialog(context, hospital),
              tooltip: 'Delete Hospital',
            ),
          ),
        );
      },
    );
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
}
