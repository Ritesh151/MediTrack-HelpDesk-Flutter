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
import '../presentation/screens/ticket_reply_screen.dart';
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
  static const String ticketReply = '/ticket-reply';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    return MaterialPageRoute(
      builder: (context) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final isLoggedIn = authProvider.user != null;
        final userRole = authProvider.user?.role ?? '';

        // Helper function to check role-based access
        bool canAccessRoute(String requiredRole) {
          if (!isLoggedIn) return false;
          if (requiredRole == 'any') return true;
          return userRole == requiredRole;
        }

        // Helper function to get role-appropriate dashboard
        Widget getDashboardForRole() {
          switch (userRole) {
            case 'patient':
              return const PatientDashboard();
            case 'admin':
              return const AdminDashboard();
            case 'super':
              return const SuperUserDashboard();
            default:
              return const LoginScreen();
          }
        }

        switch (settings.name) {
          case splash:
            return const SplashScreen();
          case login:
            return isLoggedIn ? getDashboardForRole() : const LoginScreen();
          case register:
            return const RegisterScreen();
          
          // Protected Routes with role-based access
          case patientDashboard:
            return canAccessRoute('patient') ? const PatientDashboard() : 
                   isLoggedIn ? getDashboardForRole() : const LoginScreen();
          case adminDashboard:
            return canAccessRoute('admin') ? const AdminDashboard() : 
                   isLoggedIn ? getDashboardForRole() : const LoginScreen();
          case superUserDashboard:
            return canAccessRoute('super') ? const SuperUserDashboard() : 
                   isLoggedIn ? getDashboardForRole() : const LoginScreen();
          case settingsRoute:
            return isLoggedIn ? const SettingsScreen() : const LoginScreen();
          case ticketDetails:
            if (!isLoggedIn) return const LoginScreen();
            final ticket = settings.arguments as TicketModel?;
            if (ticket == null) {
              return Scaffold(
                appBar: AppBar(title: const Text('Error')),
                body: const Center(child: Text('Ticket data not found')),
              );
            }
            return TicketDetailsScreen(ticket: ticket);
          case ticketReply:
            if (!isLoggedIn) return const LoginScreen();
            final replyTicket = settings.arguments as TicketModel?;
            if (replyTicket == null) {
              return Scaffold(
                appBar: AppBar(title: const Text('Error')),
                body: const Center(child: Text('Ticket data not found')),
              );
            }
            return TicketReplyScreen(ticket: replyTicket);
            
          default:
            return Scaffold(
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('No route defined for ${settings.name}'),
                    const SizedBox(height: 16),
                    if (isLoggedIn)
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pushReplacementNamed(context, getDashboardRoute(userRole));
                        },
                        child: const Text('Go to Dashboard'),
                      ),
                  ],
                ),
              ),
            );
        }
      },
      settings: settings,
    );
  }

  static String getDashboardRoute(String? role) {
    switch (role) {
      case 'patient':
        return patientDashboard;
      case 'admin':
        return adminDashboard;
      case 'super':
        return superUserDashboard;
      default:
        return login;
    }
  }
}
