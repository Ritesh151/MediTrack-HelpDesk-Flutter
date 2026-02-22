import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/hospital_provider.dart';

class ManageHospitalsScreen extends StatelessWidget {
  const ManageHospitalsScreen({super.key});

  Future<void> _showAddHospitalDialog(BuildContext context) async {
    final provider = context.read<HospitalProvider>();
    final nameController = TextEditingController();
    final typeController = TextEditingController(text: 'private');
    final addressController = TextEditingController();
    final cityController = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add Hospital'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Name'),
              ),
              TextField(
                controller: typeController,
                decoration: const InputDecoration(
                  labelText: 'Type (gov/private/semi)',
                ),
              ),
              TextField(
                controller: cityController,
                decoration: const InputDecoration(labelText: 'City'),
              ),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(labelText: 'Address'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                await provider.addHospital(
                  nameController.text,
                  typeController.text,
                  addressController.text,
                  cityController.text,
                );
                if (!context.mounted) return;
                Navigator.pop(context);
              },
              child: const Text('Add'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HospitalProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text("Manage Hospitals")),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: provider.hospitals.length,
        itemBuilder: (context, index) {
          final hospital = provider.hospitals[index];
          return ListTile(
            title: Text(hospital.name),
            subtitle: Text(hospital.type),
            trailing: IconButton(
              icon: const Icon(Icons.delete),
              onPressed: () => provider.removeHospital(hospital.id),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddHospitalDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }
}
