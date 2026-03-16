import React, { useState, useEffect } from 'react';
import { useAuthStore, useTicketStore } from '../../store';
import TicketCard from '../../components/widgets/TicketCard';
import ReplyForm from '../../components/widgets/ReplyForm';
import TicketStatusChart from '../../components/charts/TicketStatusChart';
import { Ticket, UpdateTicketRequest } from '../../models';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    tickets, 
    isLoading, 
    isUpdating, 
    fetchAssignedTickets, 
    updateTicketStatus,
    deleteTicket,
    addReply,
    error,
    clearError 
  } = useTicketStore();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssignedTickets();
  }, [fetchAssignedTickets]);

  useEffect(() => {
    if (error) {
      console.error('Ticket error:', error);
      clearError();
    }
  }, [error, clearError]);

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await updateTicketStatus(ticketId, status as any);
      setShowStatusModal(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await deleteTicket(ticketId);
      } catch (error) {
        console.error('Failed to delete ticket:', error);
      }
    }
  };

  const handleReply = async (ticketId: string, replyData: any) => {
    try {
      await addReply(ticketId, replyData);
      setShowReplyForm(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

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

  const getTicketStats = () => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const assigned = tickets.filter(t => t.status === 'assigned').length;

    return { total, pending, inProgress, resolved, assigned };
  };

  const stats = getTicketStats();

  const filteredTickets = tickets.filter(ticket =>
    ticket.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin: {user?.hospitalId || 'Hospital'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and respond to patient tickets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-success">{stats.resolved}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <TicketStatusChart tickets={tickets} />
        </div>

        {/* Search and Tickets Section */}
        <div className="bg-surface rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Assigned Tickets
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTickets.length} tickets
                </span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No tickets found' : 'No tickets assigned'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'Try adjusting your search terms' : 'Tickets assigned to you will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket._id} className="card">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg border ${getStatusColor(ticket.status)}`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {ticket.issueTitle}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Patient: {ticket.patient?.name || 'Unknown'} (ID: {ticket.patientId})
                              </p>
                              <p className="text-sm text-primary dark:text-primary-400 font-medium mt-1">
                                {ticket.caseNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowReplyForm(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Chat & Reply"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowStatusModal(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket._id)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete Ticket"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update Ticket Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedTicket.caseNumber}
              </p>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleUpdateStatus(selectedTicket._id, 'in_progress')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">In Progress</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Working on this ticket</div>
                </div>
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Resolved</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ticket completed</div>
                </div>
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form Modal */}
      {showReplyForm && selectedTicket && (
        <ReplyForm
          ticket={selectedTicket}
          onSubmit={handleReply}
          onCancel={() => {
            setShowReplyForm(false);
            setSelectedTicket(null);
          }}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
