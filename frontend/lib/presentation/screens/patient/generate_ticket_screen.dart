import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/hospital_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';

class GenerateTicketScreen extends StatefulWidget {
  const GenerateTicketScreen({super.key});

  @override
  State<GenerateTicketScreen> createState() => _GenerateTicketScreenState();
}

class _GenerateTicketScreenState extends State<GenerateTicketScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String? _selectedHospitalId;
  bool _hospitalsLoaded = false;

  @override
  void initState() {
    super.initState();
    // Load hospitals on screen init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadHospitals();
    });
  }

  Future<void> _loadHospitals() async {
    try {
      final hospitalProvider = Provider.of<HospitalProvider>(context, listen: false);
      await hospitalProvider.loadHospitals();
      setState(() {
        _hospitalsLoaded = true;
      });
    } catch (e) {
      // Handle error silently or show message
      setState(() {
        _hospitalsLoaded = true;
      });
    }
  }

  Future<void> _submit(TicketProvider provider) async {
    final title = _titleController.text.trim();
    final desc = _descController.text.trim();

    // Enhanced form validation
    if (title.isEmpty) {
      _showErrorSnackBar('Please enter an issue title');
      return;
    }

    if (title.length < 5) {
      _showErrorSnackBar('Issue title must be at least 5 characters');
      return;
    }

    if (desc.isEmpty) {
      _showErrorSnackBar('Please enter a description');
      return;
    }

    if (desc.length < 10) {
      _showErrorSnackBar('Description must be at least 10 characters');
      return;
    }

    // Validate hospital selection
    final hospitalId = _selectedHospitalId;
    if (hospitalId == null || hospitalId.isEmpty) {
      _showErrorSnackBar('Please select a hospital');
      return;
    }

    try {
      debugPrint("GenerateTicketScreen: Creating ticket with hospitalId: $hospitalId");
      
      await provider.createTicket(
        title, 
        desc,
        hospitalId: hospitalId,
      );
      
      if (!mounted) return;
      Navigator.pop(context);
      _showSuccessSnackBar('Ticket submitted successfully!');
    } catch (e) {
      if (!mounted) return;
      _showErrorSnackBar(e.toString());
    }
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TicketProvider>();
    final hospitalProvider = context.watch<HospitalProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text("Generate Ticket")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            CustomTextField(controller: _titleController, label: "Issue Title"),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _descController,
              label: "Description",
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            // Hospital Selection Dropdown
            if (_hospitalsLoaded) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    hint: const Text('Select Hospital'),
                    value: _selectedHospitalId,
                    isExpanded: true,
                    items: hospitalProvider.hospitals.map((hospital) {
                      return DropdownMenuItem<String>(
                        value: hospital.id,
                        child: Text(
                          '${hospital.name} (${hospital.city})',
                          style: const TextStyle(fontSize: 14),
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedHospitalId = value;
                      });
                    },
                  ),
                ),
              ),
            ] else ...[
              const Center(child: CircularProgressIndicator()),
            ],
            const SizedBox(height: 20),
            CustomButton(
              title: "Submit Ticket",
              onPressed: provider.isLoading ? () {} : () => _submit(provider),
            ),
            if (provider.isLoading) ...[
              const SizedBox(height: 16),
              const CircularProgressIndicator(),
            ],
          ],
        ),
      ),
    );
  }
}
