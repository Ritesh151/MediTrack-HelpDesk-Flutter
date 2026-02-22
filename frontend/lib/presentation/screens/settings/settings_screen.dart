import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../providers/theme_provider.dart';
import '../../../providers/auth_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: Text('Settings', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 10),
          _buildSectionHeader('Appearance'),
          SwitchListTile(
            title: const Text('Dark Mode'),
            subtitle: const Text('Enable professional dark aesthetic'),
            secondary: Icon(themeProvider.themeMode == ThemeMode.dark ? Icons.dark_mode : Icons.light_mode, color: Colors.blue),
            value: themeProvider.themeMode == ThemeMode.dark,
            onChanged: (val) => themeProvider.toggleTheme(val),
          ),
          const Divider(),
          _buildSectionHeader('Account'),
          ListTile(
            leading: const Icon(Icons.person_outline, color: Colors.purple),
            title: Text(user?.name ?? 'User'),
            subtitle: Text(user?.email ?? 'email@example.com'),
            trailing: const Icon(Icons.edit_outlined, size: 20),
            onTap: () {
              // Future TODO: Profile Editing
            },
          ),
          ListTile(
            leading: const Icon(Icons.work_outline, color: Colors.orange),
            title: const Text('Role'),
            subtitle: Text(user?.role.toUpperCase() ?? 'PATIENT'),
          ),
          if (user?.hospitalId != null && user!.hospitalId!.isNotEmpty)
            ListTile(
              leading: const Icon(Icons.local_hospital_outlined, color: Colors.green),
              title: const Text('Associated Hospital'),
              subtitle: Text(user.hospitalId!),
            ),
          const Divider(),
          _buildSectionHeader('Preferences'),
          ListTile(
            leading: const Icon(Icons.notifications_none_outlined, color: Colors.red),
            title: const Text('Notifications'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.security_outlined, color: Colors.teal),
            title: const Text('Security & Privacy'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const SizedBox(height: 30),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                side: const BorderSide(color: Colors.red),
                foregroundColor: Colors.red,
              ),
              onPressed: () => authProvider.logout().then((_) {
                Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
              }),
              icon: const Icon(Icons.logout),
              label: const Text('Log Out'),
            ),
          ),
          const SizedBox(height: 20),
          Center(
            child: Text(
              'MediTrack Pro v1.0.0',
              style: TextStyle(color: Colors.grey[400], fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.grey[600],
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
