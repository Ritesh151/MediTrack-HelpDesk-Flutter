import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/preference_service.dart';
import '../../../routes/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _emailController.text = PreferenceService.getLastEmail() ?? '';
  }

  void _login() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    try {
      await authProvider.login(_emailController.text, _passwordController.text);
      
      // Save email for local storage feature
      await PreferenceService.setLastEmail(_emailController.text);

      if (!mounted) return;
      
      final role = authProvider.user?.role;
      if (role == 'admin') {
        Navigator.pushReplacementNamed(context, AppRouter.adminDashboard);
      } else if (role == 'super') {
        Navigator.pushReplacementNamed(context, AppRouter.superUserDashboard);
      } else {
        Navigator.pushReplacementNamed(context, AppRouter.patientDashboard);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login Failed: $e')),
      );
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
                // Logo and Title
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
                        Icons.medical_services,
                        size: 40,
                        color: AppColors.textOnPrimary,
                      ),
                    ),
                    const SizedBox(height: AppTheme.md),
                    Text(
                      'Welcome Back',
                      style: AppTheme.headline3.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppTheme.sm),
                    Text(
                      'Sign in to continue to your health dashboard',
                      style: AppTheme.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.xl),
                
                // Login Form
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
                          hintText: 'Enter your password',
                          prefixIcon: const Icon(Icons.lock_outlined, color: AppColors.textTertiary),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.visibility_off_outlined, color: AppColors.textTertiary),
                            onPressed: () {},
                          ),
                        ),
                      ),
                      const SizedBox(height: AppTheme.sm),
                      
                      // Login Button
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
                                  onPressed: _login,
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
                                      const Text('Sign In'),
                                      const SizedBox(width: AppTheme.sm),
                                      const Icon(Icons.arrow_forward, size: 18),
                                    ],
                                  ),
                                );
                        },
                      ),
                      const SizedBox(height: AppTheme.md),
                      
                      // Register Link
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, AppRouter.register),
                        child: RichText(
                          text: TextSpan(
                            text: "Don't have an account? ",
                            style: AppTheme.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            children: [
                              TextSpan(
                                text: 'Register as Patient',
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
