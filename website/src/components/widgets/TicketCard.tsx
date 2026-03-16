import React from 'react';
import { Ticket } from '../../models';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  onChatClick?: () => void;
  showActions?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onClick, 
  onChatClick, 
  showActions = true 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'assigned': return 'text-primary bg-primary/10 border-primary/20';
      case 'in_progress': return 'text-info bg-info/10 border-info/20';
      case 'resolved': return 'text-success bg-success/10 border-success/20';
      case 'closed': return 'text-gray-500 bg-gray-100 border-gray-200';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-info bg-info/10 border-info/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'emergency': return 'text-error bg-error/10 border-error/20';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'assigned': return '📋';
      case 'in_progress': return '🔄';
      case 'resolved': return '✅';
      case 'closed': return '🔒';
      default: return '📄';
    }
  };

  return (
    <div 
      className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg border ${getStatusColor(ticket.status)}`}>
            <span className="text-xl">{getStatusIcon(ticket.status)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {ticket.issueTitle}
                </h3>
                <p className="text-sm text-primary dark:text-primary-400 font-medium mt-1">
                  {ticket.caseNumber}
                </p>
              </div>
              
              {showActions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatClick?.();
                    }}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {ticket.description}
        </p>

        {/* Status and Priority Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {ticket.lastActivityAt 
                ? formatDistanceToNow(new Date(ticket.lastActivityAt), { addSuffix: true })
                : 'No activity'
              }
            </span>
          </div>
          
          {ticket.category && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {ticket.category.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Assigned Admin Info (if available) */}
        {ticket.assignedAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {ticket.assignedAdmin.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                Assigned to {ticket.assignedAdmin.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
