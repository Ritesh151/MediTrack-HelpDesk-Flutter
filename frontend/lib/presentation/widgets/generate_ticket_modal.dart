import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hospital_provider.dart';

class GenerateTicketModal extends StatefulWidget {
  const GenerateTicketModal({super.key});

  @override
  State<GenerateTicketModal> createState() => _GenerateTicketModalState();
}

class _GenerateTicketModalState extends State<GenerateTicketModal> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  bool _isLoading = false;
  String? _selectedHospitalId;
  bool _hospitalsLoaded = false;

  @override
  void initState() {
    super.initState();
    // Load hospitals on modal init
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

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Raise Healthcare Concern', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 15),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Issue Title', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          TextField(
            controller: _descController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 15),
          // Hospital Selection Dropdown
          if (_hospitalsLoaded) ...[
            Consumer<HospitalProvider>(
              builder: (context, hospitalProvider, child) {
                return Container(
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
                );
              },
            ),
          ] else ...[
            const Center(child: CircularProgressIndicator()),
          ],
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: const EdgeInsets.symmetric(vertical: 15),
              ),
            onPressed: _isLoading ? null : () async {
                final title = _titleController.text.trim();
                final desc = _descController.text.trim();
                
                if (title.isEmpty || desc.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please fill in both title and description')),
                  );
                  return;
                }

                if (title.length < 5) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Issue title must be at least 5 characters')),
                  );
                  return;
                }

                if (desc.length < 10) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Description must be at least 10 characters')),
                  );
                  return;
                }

                // Validate hospital selection
                if (_selectedHospitalId == null || _selectedHospitalId!.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please select a hospital')),
                  );
                  return;
                }
                
                setState(() => _isLoading = true);
                
                // Capture context before async operation
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                final navigator = Navigator.of(context);
                
                try {
                  debugPrint("GenerateTicketModal: Creating ticket with hospitalId: $_selectedHospitalId");
                  
                  await Provider.of<TicketProvider>(context, listen: false).createTicket(
                    title,
                    desc,
                    hospitalId: _selectedHospitalId,
                  );
                  if (mounted) {
                    navigator.pop();
                    scaffoldMessenger.showSnackBar(
                      const SnackBar(
                        content: Text('Ticket submitted successfully!'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 3),
                      ),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    scaffoldMessenger.showSnackBar(
                      SnackBar(
                        content: Text(e.toString()),
                        backgroundColor: Colors.red,
                        duration: const Duration(seconds: 4),
                        action: SnackBarAction(
                          label: 'Dismiss',
                          textColor: Colors.white,
                          onPressed: () {
                            scaffoldMessenger.hideCurrentSnackBar();
                          },
                        ),
                      ),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _isLoading = false);
                }
              },
              child: _isLoading 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Submit Ticket', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
