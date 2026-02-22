import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(title: const Text("Profile")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: user == null
            ? const Center(child: Text("No User Logged In"))
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Name: ${user.name}"),
                  Text("Email: ${user.email}"),
                  Text("Role: ${user.role}"),
                  Text("Hospital ID: ${user.hospitalId ?? '-'}"),
                  Text(
                    "Permissions: ${user.permissions.isEmpty ? '-' : user.permissions.join(', ')}",
                  ),
                ],
              ),
      ),
    );
  }
}
