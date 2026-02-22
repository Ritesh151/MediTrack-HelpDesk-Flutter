import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ticket_provider.dart';
import '../../data/models/ticket_model.dart';

class TicketReplyScreen extends StatefulWidget {
  final TicketModel ticket;
  const TicketReplyScreen({super.key, required this.ticket});

  @override
  State<TicketReplyScreen> createState() => _TicketReplyScreenState();
}

class _TicketReplyScreenState extends State<TicketReplyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _doctorNameController = TextEditingController();
  final _doctorPhoneController = TextEditingController();
  final _replyMessageController = TextEditingController();
  String? _selectedSpecialization;

  final List<String> _specializations = [
    'Dentist',
    'Bone Specialist',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Orthopedic',
    'Pediatrician',
    'Gynecologist',
    'Psychiatrist',
    'General Physician',
    'Oncologist',
    'Radiologist'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reply to Ticket'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text('Issue: ${widget.ticket.issueTitle}', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Text(widget.ticket.description),
              const Divider(height: 30),
              
              TextFormField(
                controller: _doctorNameController,
                decoration: const InputDecoration(labelText: 'Doctor Name'),
                validator: (v) => v!.isEmpty ? 'Enter doctor name' : null,
              ),
              TextFormField(
                controller: _doctorPhoneController,
                decoration: const InputDecoration(labelText: 'Doctor Phone Number'),
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? 'Enter doctor phone' : null,
              ),
              DropdownButtonFormField<String>(
                value: _selectedSpecialization,
                items: _specializations.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (v) => setState(() => _selectedSpecialization = v),
                decoration: const InputDecoration(labelText: 'Specialization'),
                validator: (v) => v == null ? 'Select specialization' : null,
              ),
              TextFormField(
                controller: _replyMessageController,
                decoration: const InputDecoration(labelText: 'Reply Message'),
                maxLines: 3,
                validator: (v) => v!.isEmpty ? 'Enter reply message' : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _submit,
                child: const Text('Send Reply'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      try {
        await context.read<TicketProvider>().replyToTicket(widget.ticket.id, {
          'doctorName': _doctorNameController.text,
          'doctorPhone': _doctorPhoneController.text,
          'specialization': _selectedSpecialization,
          'replyMessage': _replyMessageController.text,
        });
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reply sent successfully')));
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }
}
