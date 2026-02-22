import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/ticket_provider.dart';
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

  Future<void> _submit(TicketProvider provider) async {
    final title = _titleController.text.trim();
    final desc = _descController.text.trim();

    if (title.isEmpty || desc.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    if (title.length < 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title must be at least 5 characters')),
      );
      return;
    }

    if (desc.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Description must be at least 10 characters'),
        ),
      );
      return;
    }

    try {
      await provider.createTicket(title, desc);
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ticket Submitted Successfully!')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
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
