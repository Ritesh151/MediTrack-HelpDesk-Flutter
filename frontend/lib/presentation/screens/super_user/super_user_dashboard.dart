import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../../providers/user_provider.dart';
import '../../widgets/hospital_type_chart.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class SuperUserDashboard extends StatefulWidget {
  const SuperUserDashboard({super.key});

  @override
  State<SuperUserDashboard> createState() => _SuperUserDashboardState();
}

class _SuperUserDashboardState extends State<SuperUserDashboard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HospitalProvider>(context, listen: false).loadHospitals();
      Provider.of<TicketProvider>(context, listen: false).loadStats();
    });
  }

  String _filterType = 'all';
  final TextEditingController _searchController = TextEditingController();

  void _showAddHospital() {
    final nameController = TextEditingController();
    final cityController = TextEditingController();
    final addressController = TextEditingController();
    String type = 'gov';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLarge))),
      backgroundColor: AppColors.surface,
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(AppTheme.lg, AppTheme.lg, AppTheme.lg, MediaQuery.of(context).viewInsets.bottom + AppTheme.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(AppTheme.sm),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Icon(Icons.local_hospital, color: AppColors.primary, size: 20),
                ),
                SizedBox(width: AppTheme.sm),
                Text('Add New Hospital', style: AppTheme.headline3.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                )),
              ],
            ),
            SizedBox(height: AppTheme.lg),
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'Hospital Name',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.md),
            DropdownButtonFormField<String>(
              initialValue: type,
              items: const [
                DropdownMenuItem(value: 'gov', child: Text('Government')),
                DropdownMenuItem(value: 'private', child: Text('Private')),
                DropdownMenuItem(value: 'semi', child: Text('Semi-Government')),
              ],
              onChanged: (val) => type = val!,
              decoration: InputDecoration(
                labelText: 'Hospital Type',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.md),
            TextField(
              controller: cityController,
              decoration: InputDecoration(
                labelText: 'City',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.md),
            TextField(
              controller: addressController,
              decoration: InputDecoration(
                labelText: 'Address',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.lg),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textOnPrimary,
                  padding: EdgeInsets.symmetric(vertical: AppTheme.md),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMedium)),
                  elevation: 2,
                ),
                onPressed: () {
                  Provider.of<HospitalProvider>(context, listen: false)
                      .addHospital(nameController.text, type, addressController.text, cityController.text);
                  Navigator.pop(context);
                },
                child: Text('Save Hospital', style: AppTheme.button.copyWith(fontWeight: FontWeight.w600)),
              ),
            ),
            SizedBox(height: AppTheme.sm),
          ],
        ),
      ),
    );
  }

  void _showAssignAdmin(String hospitalId) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusLarge)),
        backgroundColor: AppColors.surface,
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(AppTheme.sm),
              decoration: BoxDecoration(
                color: AppColors.infoLight,
                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
              ),
              child: Icon(Icons.person_add, color: AppColors.info, size: 20),
            ),
            SizedBox(width: AppTheme.sm),
            Text('Assign Hospital Admin', style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            )),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'Admin Name',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.md),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Admin Email',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
            ),
            SizedBox(height: AppTheme.md),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: 'Admin Password',
                labelStyle: TextStyle(color: AppColors.textSecondary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.gray50,
              ),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusSmall)),
            ),
            onPressed: () async {
              try {
                await Provider.of<UserProvider>(context, listen: false).assignAdmin(
                  name: nameController.text,
                  email: emailController.text,
                  password: passwordController.text,
                  hospitalId: hospitalId,
                );
                if (!mounted) return;
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Admin Assigned Successfully'),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Error: $e'),
                    backgroundColor: AppColors.error,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            child: Text('Assign'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(AppTheme.sm),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
              ),
              child: Icon(Icons.dashboard, color: AppColors.primary, size: 20),
            ),
            SizedBox(width: AppTheme.sm),
            Text('Super User Portal', style: AppTheme.headline3.copyWith(
              color: AppColors.textOnPrimary,
              fontWeight: FontWeight.w600,
            )),
          ],
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/settings'),
            icon: Icon(Icons.settings_outlined, color: AppColors.textOnPrimary),
            tooltip: 'Settings',
          ),
          IconButton(
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout().then((_) {
              Navigator.pushReplacementNamed(context, '/login');
            }),
            icon: Icon(Icons.logout, color: AppColors.textOnPrimary),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            Provider.of<HospitalProvider>(context, listen: false).loadHospitals(),
            Provider.of<TicketProvider>(context, listen: false).loadStats(),
          ]);
        },
        color: AppColors.primary,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(AppTheme.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Statistics Section
              Consumer<TicketProvider>(
                builder: (context, tp, _) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Overview', style: AppTheme.headline2.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    )),
                    SizedBox(height: AppTheme.lg),
                    // Stats Grid
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final crossAxisCount = constraints.maxWidth > 600 ? 4 : 2;
                        return GridView.count(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          crossAxisCount: crossAxisCount,
                          mainAxisSpacing: AppTheme.md,
                          crossAxisSpacing: AppTheme.md,
                          childAspectRatio: 1.4,
                          children: [
                            _ModernStatCard(
                              title: 'Total Hospitals',
                              value: '${tp.stats['totalHospitals'] ?? 0}',
                              icon: Icons.local_hospital_outlined,
                              color: AppColors.primary,
                              trend: '+12%',
                            ),
                            _ModernStatCard(
                              title: 'Total Tickets',
                              value: '${tp.stats['totalTickets'] ?? 0}',
                              icon: Icons.confirmation_number_outlined,
                              color: AppColors.info,
                              trend: '+8%',
                            ),
                            _ModernStatCard(
                              title: 'Active Admins',
                              value: '${tp.stats['totalAdmins'] ?? 0}',
                              icon: Icons.admin_panel_settings_outlined,
                              color: AppColors.success,
                              trend: '+5%',
                            ),
                            _ModernStatCard(
                              title: 'Total Users',
                              value: '${tp.stats['totalUsers'] ?? 0}',
                              icon: Icons.people_outline,
                              color: AppColors.secondary,
                              trend: '+15%',
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
              
              SizedBox(height: AppTheme.xl),
              
              // Chart Section
              Consumer<TicketProvider>(
                builder: (context, tp, _) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Hospital Distribution', style: AppTheme.headline2.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    )),
                    SizedBox(height: AppTheme.lg),
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(AppTheme.lg),
                        child: HospitalTypeChart(stats: tp.stats['statsByType'] ?? {}),
                      ),
                    ),
                  ],
                ),
              ),
              
              SizedBox(height: AppTheme.xl),
              
              // Search and Filter Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hospital Management', style: AppTheme.headline2.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  )),
                  SizedBox(height: AppTheme.lg),
                  
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.shadow.withValues(alpha: 0.1),
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => Provider.of<HospitalProvider>(context, listen: false).setSearchQuery(val),
                      decoration: InputDecoration(
                        hintText: 'Search hospitals by name or city...',
                        hintStyle: TextStyle(color: AppColors.textTertiary),
                        prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                onPressed: () {
                                  _searchController.clear();
                                  Provider.of<HospitalProvider>(context, listen: false).setSearchQuery('');
                                },
                                icon: Icon(Icons.clear, color: AppColors.textSecondary),
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: AppTheme.md,
                          vertical: AppTheme.md,
                        ),
                      ),
                    ),
                  ),
                  
                  SizedBox(height: AppTheme.md),
                  
                  // Filter Dropdown
                  Row(
                    children: [
                      Text('Filter by Type:', style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      )),
                      SizedBox(width: AppTheme.sm),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: AppTheme.xs),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                          border: Border.all(color: AppColors.gray200),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.shadow.withValues(alpha: 0.05),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _filterType,
                            items: const [
                              DropdownMenuItem(value: 'all', child: Text('All Types')),
                              DropdownMenuItem(value: 'gov', child: Text('Government')),
                              DropdownMenuItem(value: 'private', child: Text('Private')),
                              DropdownMenuItem(value: 'semi', child: Text('Semi-Government')),
                            ],
                            onChanged: (val) => setState(() => _filterType = val!),
                            style: TextStyle(color: AppColors.textPrimary),
                            dropdownColor: AppColors.surface,
                            icon: Icon(Icons.keyboard_arrow_down, color: AppColors.textSecondary),
                            underline: Container(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              SizedBox(height: AppTheme.lg),
              
              // Hospital List
              Consumer<HospitalProvider>(
                builder: (context, hp, _) {
                  final filteredHospitals = _filterType == 'all' 
                      ? hp.hospitals 
                      : hp.hospitals.where((h) => h.type == _filterType).toList();

                  if (hp.isLoading) {
                    return Center(
                      child: Padding(
                        padding: EdgeInsets.all(AppTheme.xl),
                        child: Column(
                          children: [
                            CircularProgressIndicator(color: AppColors.primary),
                            SizedBox(height: AppTheme.md),
                            Text('Loading hospitals...', style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            )),
                          ],
                        ),
                      ),
                    );
                  }

                  if (filteredHospitals.isEmpty) {
                    return Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(AppTheme.xl),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.gray100,
                              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                            ),
                            child: Icon(Icons.local_hospital_outlined, 
                              size: 40, 
                              color: AppColors.textTertiary),
                          ),
                          SizedBox(height: AppTheme.lg),
                          Text('No Hospitals Found', style: AppTheme.headline3.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          )),
                          SizedBox(height: AppTheme.sm),
                          Text(
                            _filterType == 'all' 
                                ? 'No hospitals have been added yet.'
                                : 'No hospitals found for this type.',
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: filteredHospitals.length,
                    itemBuilder: (context, index) {
                      final h = filteredHospitals[index];
                      return _ModernHospitalCard(
                        hospital: h,
                        onAssignAdmin: () => _showAssignAdmin(h.id),
                        onDelete: () => hp.removeHospital(h.id),
                      );
                    },
                  );
                },
              ),
              
              SizedBox(height: AppTheme.xxl),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddHospital,
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusLarge)),
        icon: Icon(Icons.add),
        label: Text('Add Hospital', style: AppTheme.button.copyWith(fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class _ModernStatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String trend;

  const _ModernStatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        boxShadow: AppTheme.cardShadow,
        border: Border.all(color: AppColors.gray100),
      ),
      child: Padding(
        padding: EdgeInsets.all(AppTheme.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(AppTheme.sm),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                  decoration: BoxDecoration(
                    color: trend.startsWith('+') ? AppColors.successLight : AppColors.errorLight,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Text(
                    trend,
                    style: AppTheme.bodySmall.copyWith(
                      color: trend.startsWith('+') ? AppColors.success : AppColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: AppTheme.md),
            Text(
              value,
              style: AppTheme.headline2.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: AppTheme.xs),
            Text(
              title,
              style: AppTheme.bodySmall.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModernHospitalCard extends StatelessWidget {
  final dynamic hospital;
  final VoidCallback onAssignAdmin;
  final VoidCallback onDelete;

  const _ModernHospitalCard({
    required this.hospital,
    required this.onAssignAdmin,
    required this.onDelete,
  });

  Color _getTypeColor(String type) {
    switch (type) {
      case 'gov':
        return AppColors.primary;
      case 'private':
        return AppColors.success;
      case 'semi':
        return AppColors.warning;
      default:
        return AppColors.gray500;
    }
  }

  String _getTypeLabel(String type) {
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

  @override
  Widget build(BuildContext context) {
    final typeColor = _getTypeColor(hospital.type);
    
    return Container(
      margin: EdgeInsets.only(bottom: AppTheme.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        boxShadow: AppTheme.cardShadow,
        border: Border.all(color: AppColors.gray100),
      ),
      child: Padding(
        padding: EdgeInsets.all(AppTheme.lg),
        child: Column(
          children: [
            Row(
              children: [
                // Hospital Icon
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                  ),
                  child: Icon(
                    Icons.local_hospital_outlined,
                    color: typeColor,
                    size: 28,
                  ),
                ),
                SizedBox(width: AppTheme.md),
                
                // Hospital Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hospital.name,
                        style: AppTheme.bodyLarge.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: AppTheme.xs),
                      Row(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                            decoration: BoxDecoration(
                              color: typeColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                            ),
                            child: Text(
                              _getTypeLabel(hospital.type),
                              style: AppTheme.bodySmall.copyWith(
                                color: typeColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          SizedBox(width: AppTheme.sm),
                          Icon(Icons.location_on_outlined, 
                            size: 16, 
                            color: AppColors.textTertiary),
                          SizedBox(width: AppTheme.xs),
                          Text(
                            hospital.city,
                            style: AppTheme.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Action Buttons
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.infoLight,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                      ),
                      child: IconButton(
                        onPressed: onAssignAdmin,
                        icon: Icon(Icons.person_add_outlined, 
                          color: AppColors.info, 
                          size: 20),
                        tooltip: 'Assign Admin',
                        padding: EdgeInsets.all(AppTheme.sm),
                      ),
                    ),
                    SizedBox(width: AppTheme.sm),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.errorLight,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                      ),
                      child: IconButton(
                        onPressed: onDelete,
                        icon: Icon(Icons.delete_outline, 
                          color: AppColors.error, 
                          size: 20),
                        tooltip: 'Delete Hospital',
                        padding: EdgeInsets.all(AppTheme.sm),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            // Address Section
            if (hospital.address.isNotEmpty)
              Container(
                margin: EdgeInsets.only(top: AppTheme.md),
                padding: EdgeInsets.all(AppTheme.sm),
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
                child: Row(
                  children: [
                    Icon(Icons.location_on_outlined, 
                      size: 16, 
                      color: AppColors.textTertiary),
                    SizedBox(width: AppTheme.xs),
                    Expanded(
                      child: Text(
                        hospital.address,
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
