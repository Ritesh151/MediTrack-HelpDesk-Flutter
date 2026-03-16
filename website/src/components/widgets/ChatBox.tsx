import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store';
import { Message } from '../../models';

interface ChatBoxProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ ticketId, isOpen, onClose }) => {
  const { messages, isLoading, sendMessage, fetchMessages, clearError, error } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchMessages(ticketId);
    }
  }, [isOpen, ticketId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      console.error('Chat error:', error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !ticketId) return;

    try {
      await sendMessage({
        ticketId,
        text: newMessage.trim(),
        messageType: 'text',
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const getMessageBubbleClass = (message: Message) => {
    const isOwn = message.senderRole === 'patient';
    return `
      max-w-xs lg:max-w-md px-4 py-2 rounded-lg
      ${isOwn 
        ? 'bg-primary text-white ml-auto' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
      }
    `;
  };

  if (!isOpen) return null;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Chat container */}
      <div className="relative flex-1 flex flex-col bg-white dark:bg-gray-800 m-4 rounded-lg shadow-xl max-w-4xl mx-auto h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Support Chat
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ticket #{ticketId}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No messages yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start the conversation by sending a message below
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([dateString, dateMessages]) => (
              <div key={dateString} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {formatDate(dateString)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message) => (
                    <div key={message._id} className="flex flex-col gap-1">
                      <div className="flex items-end gap-2">
                        <div className={getMessageBubbleClass(message)}>
                          <p className="text-sm break-words">
                            {message.text}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {message.senderRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Someone is typing...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
