import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../presentation/screens/splash/splash_screen.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/auth/register_screen.dart';
import '../presentation/screens/patient/patient_dashboard.dart';
import '../presentation/screens/admin/admin_dashboard.dart';
import '../presentation/screens/super_user/super_user_dashboard.dart';
import '../presentation/screens/settings/settings_screen.dart';
import '../presentation/screens/tickets/ticket_details_screen.dart';
import '../data/models/ticket_model.dart';

class AppRouter {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String patientDashboard = '/patient';
  static const String adminDashboard = '/admin';
  static const String superUserDashboard = '/super';
  static const String settingsRoute = '/settings';
  static const String ticketDetails = '/ticket-details';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    // Basic guarding logic
    return MaterialPageRoute(
      builder: (context) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final isLoggedIn = authProvider.user != null;

        switch (settings.name) {
          case splash:
            return const SplashScreen();
          case login:
            return const LoginScreen();
          case register:
            return const RegisterScreen();
          
          // Protected Routes
          case patientDashboard:
            return isLoggedIn ? const PatientDashboard() : const LoginScreen();
          case adminDashboard:
            return isLoggedIn ? const AdminDashboard() : const LoginScreen();
          case superUserDashboard:
            return isLoggedIn ? const SuperUserDashboard() : const LoginScreen();
          case settingsRoute:
            return isLoggedIn ? const SettingsScreen() : const LoginScreen();
          case ticketDetails:
            if (!isLoggedIn) return const LoginScreen();
            final ticket = settings.arguments as TicketModel;
            return TicketDetailsScreen(ticket: ticket);
            
          default:
            return Scaffold(
              body: Center(child: Text('No route defined for ${settings.name}')),
            );
        }
      },
      settings: settings,
    );
  }
}
