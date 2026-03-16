import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore, useTicketStore, useChatStore, ticketSelectors } from '../../store';
import { Ticket, Message } from '../../models';
import { formatDistanceToNow } from 'date-fns';

const replySchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorPhone: z.string().min(1, 'Doctor phone is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  replyMessage: z.string().min(10, 'Reply message must be at least 10 characters'),
});

type ReplyFormData = z.infer<typeof replySchema>;

const TicketReplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tickets, addReply } = useTicketStore();
  const { messages, fetchMessages, sendMessage, isLoading: chatLoading } = useChatStore();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      doctorName: '',
      doctorPhone: '',
      specialization: '',
      replyMessage: '',
    },
  });

  const specializations = [
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

  useEffect(() => {
    if (id) {
      const ticketData = ticketSelectors.getTicketById(id);
      setTicket(ticketData || null);
      
      if (ticketData) {
        fetchMessages(ticketData.id);
      }
    }
  }, [id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !ticket) return;

    setIsSubmittingChat(true);
    try {
      await sendMessage({
        ticketId: ticket.id,
        text: chatMessage.trim(),
        senderId: user?.id || '',
        senderRole: user?.role || '',
        senderName: user?.name || '',
      });
      setChatMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setIsSubmittingChat(false);
    }
  };

  const handleReplySubmit = async (data: ReplyFormData) => {
    if (!ticket) return;

    setIsSubmittingReply(true);
    try {
      await addReply(ticket.id, {
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        specialization: data.specialization,
        replyMessage: data.replyMessage,
      });
      
      reset();
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const difference = now.getTime() - date.getTime();

    if (difference < 60000) {
      return 'Just now';
    } else if (difference < 3600000) {
      return `${Math.floor(difference / 60000)} min ago`;
    } else if (difference < 86400000) {
      return `${Math.floor(difference / 3600000)} hours ago`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const MessageBubble: React.FC<{ message: Message; isMe: boolean }> = ({ message, isMe }) => {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isMe && (
          <div className="flex-shrink-0 mr-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {message.senderName ? message.senderName[0].toUpperCase() : '?'}
              </span>
            </div>
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md`}>
          {!isMe && (
            <p className={`text-xs font-medium mb-1 ${isMe ? 'text-white' : 'text-gray-700'}`}>
              {message.senderName}
            </p>
          )}
          
          <div
            className={`px-4 py-2 rounded-2xl ${
              isMe
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatDateTime(message.createdAt)}
            </p>
          </div>
        </div>

        {isMe && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">Me</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket not found</h2>
          <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{ticket.issueTitle}</h1>
                <p className="text-sm text-gray-600">Case: {ticket.caseNumber}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            </div>
            
            <div
              ref={chatScrollRef}
              className="h-96 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMe={message.senderId === user?.id}
                />
              ))}
              
              {chatLoading && (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmittingChat}
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatMessage.trim() || isSubmittingChat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingChat ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reply Form Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Doctor Reply</h2>
            </div>
            
            <form onSubmit={handleSubmit(handleReplySubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <input
                  {...register('doctorName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter doctor name"
                />
                {errors.doctorName && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Phone *
                </label>
                <input
                  {...register('doctorPhone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
                {errors.doctorPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <select
                  {...register('specialization')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply Message *
                </label>
                <textarea
                  {...register('replyMessage')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your reply message"
                />
                {errors.replyMessage && (
                  <p className="mt-1 text-sm text-red-600">{errors.replyMessage.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto"></div>
                  ) : (
                    'Submit Reply'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900">{ticket.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <p className="text-gray-900">{ticket.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-gray-900">{ticket.category.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-gray-900">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketReplyPage;
