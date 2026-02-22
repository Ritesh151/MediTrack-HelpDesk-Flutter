import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/preference_service.dart';
import '../../../routes/app_router.dart';

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
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
              obscureText: true,
            ),
            const SizedBox(height: 30),
            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                return auth.isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _login,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: const Text('Login'),
                    );
              },
            ),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, AppRouter.register),
              child: const Text('Don\'t have an account? Register as Patient'),
            ),
          ],
        ),
      ),
    );
  }
}
