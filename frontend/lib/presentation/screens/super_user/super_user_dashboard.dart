import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../../providers/user_provider.dart';
import '../../widgets/hospital_type_chart.dart';

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

  void _showAddHospital() {
    final nameController = TextEditingController();
    final cityController = TextEditingController();
    final addressController = TextEditingController();
    String type = 'gov';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add New Hospital', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 15),
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Hospital Name', border: OutlineInputBorder())),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: type,
              items: const [
                DropdownMenuItem(value: 'gov', child: Text('Government')),
                DropdownMenuItem(value: 'private', child: Text('Private')),
                DropdownMenuItem(value: 'semi', child: Text('Semi-Government')),
              ],
              onChanged: (val) => type = val!,
              decoration: const InputDecoration(labelText: 'Hospital Type', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(controller: cityController, decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder())),
            const SizedBox(height: 10),
            TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  Provider.of<HospitalProvider>(context, listen: false)
                      .addHospital(nameController.text, type, addressController.text, cityController.text);
                  Navigator.pop(context);
                },
                child: const Text('Save Hospital'),
              ),
            )
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        title: Text('Assign Hospital Admin', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Admin Name')),
            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Admin Email')),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Admin Password'), obscureText: true),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple, foregroundColor: Colors.white),
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
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Admin Assigned Successfully')));
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
              }
            },
            child: const Text('Assign'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Super User Portal', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/settings'),
            icon: const Icon(Icons.settings_outlined),
          ),
          IconButton(
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout().then((_) {
              Navigator.pushReplacementNamed(context, '/login');
            }),
            icon: const Icon(Icons.logout),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Consumer<TicketProvider>(
              builder: (context, tp, _) => Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: Colors.purple.withOpacity(0.05),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(child: _StatCard(title: 'Tickets', value: '${tp.stats['totalTickets'] ?? 0}', icon: Icons.confirmation_number_outlined, color: Colors.blue)),
                        const SizedBox(width: 16),
                        Expanded(child: _StatCard(title: 'Hospitals', value: '${tp.stats['totalHospitals'] ?? 0}', icon: Icons.local_hospital_outlined, color: Colors.purple)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    HospitalTypeChart(stats: tp.stats['statsByType'] ?? {}),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                onChanged: (val) => Provider.of<HospitalProvider>(context, listen: false).setSearchQuery(val),
                decoration: InputDecoration(
                  hintText: 'Search hospitals by name or city...',
                  prefixIcon: const Icon(Icons.search, color: Colors.purple),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[200]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Registered Hospitals', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _filterType,
                        items: const [
                          DropdownMenuItem(value: 'all', child: Text('All Types')),
                          DropdownMenuItem(value: 'gov', child: Text('Government')),
                          DropdownMenuItem(value: 'private', child: Text('Private')),
                          DropdownMenuItem(value: 'semi', child: Text('Semi-Gov')),
                        ],
                        onChanged: (val) => setState(() => _filterType = val!),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Consumer<HospitalProvider>(
              builder: (context, hp, _) {
                final filteredHospitals = _filterType == 'all' 
                    ? hp.hospitals 
                    : hp.hospitals.where((h) => h.type == _filterType).toList();

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredHospitals.length,
                  itemBuilder: (context, index) {
                    final h = filteredHospitals[index];
                    return Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: Colors.grey[200]!),
                      ),
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(12),
                        leading: CircleAvatar(
                          backgroundColor: Colors.purple.withOpacity(0.1),
                          child: const Icon(Icons.local_hospital_outlined, color: Colors.purple),
                        ),
                        title: Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${h.type.toUpperCase()} • ${h.city}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.person_add_alt_1_outlined, color: Colors.blue),
                              onPressed: () => _showAssignAdmin(h.id),
                              tooltip: 'Assign Admin',
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => hp.removeHospital(h.id),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddHospital,
        backgroundColor: Colors.purple,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Hospital', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(title, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
          )
        ],
      ),
    );
  }
}
