import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../data/models/hospital_model.dart';
import '../../../routes/app_router.dart';

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
      appBar: AppBar(title: const Text('Patient Registration')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            TextField(controller: _passwordController, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 20),
            Consumer<HospitalProvider>(
              builder: (context, hospitalProvider, _) {
                if (hospitalProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final cities = hospitalProvider.hospitals
                    .map((h) => h.city)
                    .where((city) => city.isNotEmpty)
                    .toSet()
                    .toList();

                if (cities.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No hospitals available in any city. Please contact admin.', 
                      style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  );
                }

                final filteredHospitals = _selectedCity == null
                    ? <HospitalModel>[]
                    : hospitalProvider.hospitals.where((h) => h.city == _selectedCity).toList();

                return Column(
                  children: [
                    DropdownButtonFormField<String>(
                      value: _selectedCity,
                      decoration: const InputDecoration(labelText: 'Select City', border: OutlineInputBorder()),
                      items: cities.map((city) => DropdownMenuItem<String>(value: city, child: Text(city))).toList(),
                      onChanged: (val) {
                        setState(() {
                          _selectedCity = val;
                          _selectedHospital = null;
                        });
                      },
                      hint: const Text('Select City'),
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      value: _selectedHospital,
                      decoration: const InputDecoration(labelText: 'Select Hospital', border: OutlineInputBorder()),
                      items: filteredHospitals.map((h) => DropdownMenuItem<String>(value: h.id, child: Text(h.name))).toList(),
                      onChanged: (val) => setState(() => _selectedHospital = val),
                      hint: const Text('Select Hospital'),
                      disabledHint: Text(_selectedCity == null ? 'Select a city first' : 'No hospitals in this city'),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 30),
            Consumer<AuthProvider>(
              builder: (context, auth, _) {
                return auth.isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _handleRegister,
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                      child: const Text('Register'),
                    );
              },
            ),
          ],
        ),
      ),
    );
  }
}
