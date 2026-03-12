import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../data/models/hospital_model.dart';
import '../../../routes/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _selectedHospital;
  String? _selectedCity;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<HospitalProvider>(context, listen: false).loadHospitals();
    });
  }

  void _handleRegister() async {
    if (_selectedHospital == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a hospital')));
      return;
    }
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    try {
      await authProvider.register(
        _nameController.text,
        _emailController.text,
        _passwordController.text,
        _selectedHospital!,
      );
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, AppRouter.patientDashboard);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Registration Failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 0,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      child: const Icon(
                        Icons.person_add,
                        size: 40,
                        color: AppColors.textOnPrimary,
                      ),
                    ),
                    const SizedBox(height: AppTheme.md),
                    Text(
                      'Create Account',
                      style: AppTheme.headline3.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppTheme.sm),
                    Text(
                      'Join MediTrack Pro to manage your health',
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.xl),
                
                // Registration Form
                Container(
                  padding: const EdgeInsets.all(AppTheme.lg),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Full Name',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: AppTheme.xs),
                      TextField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          hintText: 'Enter your full name',
                          prefixIcon: const Icon(Icons.person_outlined, color: AppColors.textTertiary),
                        ),
                      ),
                      const SizedBox(height: AppTheme.md),
                      
                      Text(
                        'Email',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: AppTheme.xs),
                      TextField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          hintText: 'Enter your email',
                          prefixIcon: const Icon(Icons.email_outlined, color: AppColors.textTertiary),
                        ),
                      ),
                      const SizedBox(height: AppTheme.md),
                      
                      Text(
                        'Password',
                        style: AppTheme.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: AppTheme.xs),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: 'Create a strong password',
                          prefixIcon: const Icon(Icons.lock_outlined, color: AppColors.textTertiary),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.visibility_off_outlined, color: AppColors.textTertiary),
                            onPressed: () {},
                          ),
                        ),
                      ),
                      const SizedBox(height: AppTheme.md),
                      
                      // Hospital Selection
                      Consumer<HospitalProvider>(
                        builder: (context, hospitalProvider, _) {
                          if (hospitalProvider.isLoading) {
                            return Container(
                              height: 50,
                              decoration: BoxDecoration(
                                color: AppColors.gray100,
                                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                              ),
                              child: const Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                ),
                              ),
                            );
                          }

                          final cities = hospitalProvider.hospitals
                              .map((h) => h.city)
                              .where((city) => city.isNotEmpty)
                              .toSet()
                              .toList();

                          if (cities.isEmpty) {
                            return Container(
                              padding: const EdgeInsets.all(AppTheme.md),
                              decoration: BoxDecoration(
                                color: AppColors.errorLight,
                                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                border: Border.all(color: AppColors.error),
                              ),
                              child: Column(
                                children: [
                                  const Icon(Icons.error_outline, color: AppColors.error, size: 24),
                                  const SizedBox(height: AppTheme.sm),
                                  Text(
                                    'No hospitals available',
                                    style: AppTheme.bodyMedium.copyWith(
                                      color: AppColors.error,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: AppTheme.xs),
                                  Text(
                                    'Please contact administrator',
                                    style: AppTheme.bodySmall.copyWith(
                                      color: AppColors.error,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            );
                          }

                          final filteredHospitals = _selectedCity == null
                              ? <HospitalModel>[]
                              : hospitalProvider.hospitals.where((h) => h.city == _selectedCity).toList();

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Select City',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: AppTheme.xs),
                              DropdownButtonFormField<String>(
                                value: _selectedCity,
                                decoration: InputDecoration(
                                  hintText: 'Choose your city',
                                  prefixIcon: const Icon(Icons.location_city_outlined, color: AppColors.textTertiary),
                                ),
                                items: cities.map((city) => DropdownMenuItem<String>(value: city, child: Text(city))).toList(),
                                onChanged: (val) {
                                  setState(() {
                                    _selectedCity = val;
                                    _selectedHospital = null;
                                  });
                                },
                              ),
                              const SizedBox(height: AppTheme.md),
                              
                              Text(
                                'Select Hospital',
                                style: AppTheme.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: AppTheme.xs),
                              DropdownButtonFormField<String>(
                                value: _selectedHospital,
                                decoration: InputDecoration(
                                  hintText: _selectedCity == null ? 'Select a city first' : 'Choose your hospital',
                                  prefixIcon: const Icon(Icons.local_hospital_outlined, color: AppColors.textTertiary),
                                ),
                                items: filteredHospitals.map((h) => DropdownMenuItem<String>(value: h.id, child: Text(h.name))).toList(),
                                onChanged: (val) => setState(() => _selectedHospital = val),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: AppTheme.lg),
                      
                      // Register Button
                      Consumer<AuthProvider>(
                        builder: (context, auth, _) {
                          return auth.isLoading
                              ? Container(
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                  ),
                                  child: const Center(
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                    ),
                                  ),
                                )
                              : ElevatedButton(
                                  onPressed: _handleRegister,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: AppColors.textOnPrimary,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: AppTheme.md),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text('Create Account'),
                                      const SizedBox(width: AppTheme.sm),
                                      const Icon(Icons.arrow_forward, size: 18),
                                    ],
                                  ),
                                );
                        },
                      ),
                      const SizedBox(height: AppTheme.md),
                      
                      // Login Link
                      TextButton(
                        onPressed: () => Navigator.pushReplacementNamed(context, AppRouter.login),
                        child: RichText(
                          text: TextSpan(
                            text: 'Already have an account? ',
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            children: [
                              TextSpan(
                                text: 'Sign In',
                                style: AppTheme.bodyMedium.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
