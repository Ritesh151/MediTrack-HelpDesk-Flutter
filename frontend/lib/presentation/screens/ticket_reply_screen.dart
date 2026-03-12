import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ticket_provider.dart';
import '../../providers/chat_provider.dart';
import '../../providers/auth_provider.dart';
import '../../data/models/ticket_model.dart';
import '../../data/models/message_model.dart';

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
  final _chatMessageController = TextEditingController();
  String? _selectedSpecialization;
  
  late ScrollController _chatScrollController;
  late ChatProvider _chatProvider;

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
  void initState() {
    super.initState();
    _chatScrollController = ScrollController();
    _chatProvider = Provider.of<ChatProvider>(context, listen: false);
    _loadChatMessages();
  }

  @override
  void dispose() {
    _doctorNameController.dispose();
    _doctorPhoneController.dispose();
    _replyMessageController.dispose();
    _chatMessageController.dispose();
    _chatScrollController.dispose();
    super.dispose();
  }

  Future<void> _loadChatMessages() async {
    await _chatProvider.loadMessages(widget.ticket.id);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScrollController.hasClients) {
        _chatScrollController.animateTo(
          _chatScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendChatMessage() async {
    final content = _chatMessageController.text.trim();
    if (content.isEmpty) return;

    _chatMessageController.clear();
    
    try {
      await _chatProvider.sendMessage(widget.ticket.id, content);
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error sending message: $e')),
        );
      }
    }
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
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Reply sent successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }

  Widget _buildMessageBubble(MessageModel message, bool isMe) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 16,
              child: Text(
                message.senderName.isNotEmpty ? message.senderName[0].toUpperCase() : '?',
                style: const TextStyle(fontSize: 12),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isMe 
                    ? Theme.of(context).primaryColor
                    : Colors.grey[300],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isMe) ...[
                    Text(
                      message.senderName,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isMe ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 2),
                  ],
                  Text(
                    message.text,
                    style: TextStyle(
                      color: isMe ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDateTime(message.createdAt),
                    style: TextStyle(
                      fontSize: 10,
                      color: isMe ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: Theme.of(context).primaryColor,
              child: const Text(
                'Me',
                style: TextStyle(fontSize: 12, color: Colors.white),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Ticket: ${widget.ticket.issueTitle}'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Chat', icon: Icon(Icons.chat)),
              Tab(text: 'Form Reply', icon: Icon(Icons.reply)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildChatTab(),
            _buildFormReplyTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildChatTab() {
    return Consumer<ChatProvider>(
      builder: (context, chatProvider, child) {
        if (chatProvider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        return Column(
          children: [
            // Ticket info header
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey[100],
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Issue: ${widget.ticket.issueTitle}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(widget.ticket.description),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Chip(
                        label: Text(
                          widget.ticket.status.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                        backgroundColor: _getStatusColor(widget.ticket.status),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'ID: ${widget.ticket.id}',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Messages list
            Expanded(
              child: chatProvider.messages.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text(
                            'No messages yet',
                            style: TextStyle(color: Colors.grey, fontSize: 16),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Start the conversation below',
                            style: TextStyle(color: Colors.grey, fontSize: 14),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _chatScrollController,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: chatProvider.messages.length,
                      itemBuilder: (context, index) {
                        final message = chatProvider.messages[index];
                        final currentUser = context.read<AuthProvider>().user;
                        final isMe = chatProvider.isMessageFromCurrentUser(message, currentUser?.id);
                        return _buildMessageBubble(message, isMe);
                      },
                    ),
            ),
            
            // Message input
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.3),
                    spreadRadius: 1,
                    blurRadius: 3,
                    offset: const Offset(0, -1),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _chatMessageController,
                      decoration: const InputDecoration(
                        hintText: 'Type your message...',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendChatMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _sendChatMessage,
                    icon: const Icon(Icons.send),
                    style: IconButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFormReplyTab() {
    return Padding(
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
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'assigned':
        return Colors.blue;
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
