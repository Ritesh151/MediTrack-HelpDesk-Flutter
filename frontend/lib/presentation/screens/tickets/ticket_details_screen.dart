import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../data/models/ticket_model.dart';
import '../../../providers/chat_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/ticket_timeline.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class TicketDetailsScreen extends StatefulWidget {
  final TicketModel ticket;

  const TicketDetailsScreen({super.key, required this.ticket});

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ChatProvider>(context, listen: false).loadMessages(widget.ticket.id);
    });
  }

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    final text = _messageController.text.trim();
    _messageController.clear();

    try {
      await Provider.of<ChatProvider>(context, listen: false).sendMessage(widget.ticket.id, text);
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 100,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(
          'Ticket Details',
          style: AppTheme.headline3.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: AppColors.surface,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, '/ticket-reply', arguments: widget.ticket),
            icon: const Icon(Icons.chat_outlined, color: AppColors.primary),
            tooltip: 'Open Chat',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildTicketInfo(),
          if (widget.ticket.reply != null) _buildReplySection(),
          Container(
            height: 1,
            color: AppColors.divider,
          ),
          // Timeline Section
          if (widget.ticket.history != null && widget.ticket.history!.isNotEmpty)
            Container(
              width: double.infinity,
              color: AppColors.scaffoldBackground,
              child: TicketTimeline(history: widget.ticket.history!),
            ),
          Container(
            height: 1,
            color: AppColors.divider,
          ),
          Expanded(child: _buildChatList(user?.id)),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildTicketInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppTheme.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(AppTheme.radiusMedium),
          bottomRight: Radius.circular(AppTheme.radiusMedium),
        ),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Case: ${widget.ticket.caseNumber}',
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                    decoration: BoxDecoration(
                      color: _getPriorityColor(widget.ticket.priority).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Text(
                      widget.ticket.priority.toUpperCase(),
                      style: AppTheme.bodySmall.copyWith(
                        color: _getPriorityColor(widget.ticket.priority),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: AppTheme.sm, vertical: AppTheme.xs),
                    decoration: BoxDecoration(
                      color: _getStatusColor(widget.ticket.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Text(
                      widget.ticket.status.toUpperCase(),
                      style: AppTheme.bodySmall.copyWith(
                        color: _getStatusColor(widget.ticket.status),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppTheme.md),
          Text(
            widget.ticket.issueTitle,
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Text(
            widget.ticket.description,
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Row(
            children: [
              Text(
                'Category:',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: AppTheme.xs),
              Text(
                widget.ticket.category.replaceAll('_', ' ').toUpperCase(),
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReplySection() {
    final reply = widget.ticket.reply!;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(AppTheme.md),
      padding: const EdgeInsets.all(AppTheme.lg),
      decoration: BoxDecoration(
        color: AppColors.successLight,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppColors.success.withOpacity(0.3)),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.xs),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
                child: const Icon(
                  Icons.verified,
                  color: AppColors.textOnPrimary,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppTheme.sm),
              Text(
                'Doctor Recommendation',
                style: AppTheme.headline3.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.md),
          _buildReplyDetail('Doctor', reply.doctorName),
          _buildReplyDetail('Specialization', reply.specialization),
          _buildReplyDetail('Phone', reply.doctorPhone),
          Container(
            height: 1,
            color: AppColors.success.withOpacity(0.3),
            margin: const EdgeInsets.symmetric(vertical: AppTheme.sm),
          ),
          Text(
            'Message:',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.success,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.xs),
          Text(
            reply.replyMessage,
            style: AppTheme.bodyMedium.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Align(
            alignment: Alignment.bottomRight,
            child: Text(
              'Replied at: ${DateFormat('MMM dd, yyyy').format(reply.repliedAt)}',
              style: AppTheme.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppTheme.xs),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.success,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending': return AppColors.warning;
      case 'assigned': return AppColors.primary;
      case 'resolved': return AppColors.success;
      default: return AppColors.gray500;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'low': return AppColors.success;
      case 'medium': return AppColors.info;
      case 'high': return AppColors.warning;
      case 'emergency': return AppColors.error;
      default: return AppColors.gray500;
    }
  }

  Widget _buildChatList(String? currentUserId) {
    return Consumer<ChatProvider>(
      builder: (context, chatProvider, _) {
        if (chatProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          );
        }
        if (chatProvider.messages.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                  ),
                  child: const Icon(
                    Icons.chat_outlined,
                    size: 40,
                    color: AppColors.info,
                  ),
                ),
                const SizedBox(height: AppTheme.md),
                Text(
                  'No messages yet',
                  style: AppTheme.headline3.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppTheme.sm),
                Text(
                  'Start the conversation',
                  style: AppTheme.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }
        
        return ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.all(AppTheme.md),
          itemCount: chatProvider.messages.length,
          itemBuilder: (context, index) {
            final msg = chatProvider.messages[index];
            final isMe = msg.senderId == currentUserId;
            return _buildMessageBubble(msg, isMe);
          },
        );
      },
    );
  }

  Widget _buildMessageBubble(dynamic msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppTheme.md),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.all(AppTheme.md),
        decoration: BoxDecoration(
          color: isMe ? AppColors.chatBubbleMe : AppColors.chatBubbleAdmin,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(AppTheme.radiusLarge),
            topRight: const Radius.circular(AppTheme.radiusLarge),
            bottomLeft: Radius.circular(isMe ? AppTheme.radiusLarge : 0),
            bottomRight: Radius.circular(isMe ? 0 : AppTheme.radiusLarge),
          ),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(bottom: AppTheme.xs),
                child: Text(
                  msg.senderName,
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            Text(
              msg.text,
              style: AppTheme.bodyMedium.copyWith(
                color: isMe ? AppColors.textOnPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppTheme.xs),
            Text(
              DateFormat('hh:mm a').format(msg.createdAt),
              style: AppTheme.caption.copyWith(
                color: isMe ? AppColors.textOnPrimary.withOpacity(0.7) : AppColors.chatTimestamp,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                filled: true,
                fillColor: AppColors.surface,
                contentPadding: const EdgeInsets.symmetric(horizontal: AppTheme.md, vertical: AppTheme.md),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  borderSide: const BorderSide(color: AppColors.border, width: 1),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  borderSide: const BorderSide(color: AppColors.border, width: 1),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
            ),
          ),
          const SizedBox(width: AppTheme.sm),
          Container(
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
            ),
            child: IconButton(
              onPressed: _sendMessage,
              icon: const Icon(
                Icons.send,
                color: AppColors.textOnPrimary,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
