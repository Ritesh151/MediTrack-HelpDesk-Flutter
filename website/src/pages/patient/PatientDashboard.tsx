import React, { useState, useEffect } from 'react';
import { useAuthStore, useTicketStore, useHospitalStore } from '../../store';
import TicketCard from '../../components/widgets/TicketCard';
import TicketForm from '../../components/widgets/TicketForm';
import { CreateTicketRequest, Ticket } from '../../models';
import { formatDistanceToNow } from 'date-fns';

const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { hospitals } = useHospitalStore();
  const { 
    tickets, 
    isLoading, 
    isCreating, 
    fetchMyTickets, 
    createTicket,
    error,
    clearError 
  } = useTicketStore();
  
  const [showTicketForm, setShowTicketForm] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  useEffect(() => {
    if (error) {
      // You could show a toast notification here
      console.error('Ticket error:', error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateTicket = async (ticketData: CreateTicketRequest) => {
    try {
      await createTicket(ticketData);
      setShowTicketForm(false);
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to create ticket:', error);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user?.name || 'Patient'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your health tickets and track their progress
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowTicketForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
                  <p className="text-2xl font-bold text-primary">{stats.assigned}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

        {/* Tickets Section */}
        <div className="bg-surface rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Health Tickets
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tickets.length} active tickets
              </span>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Tickets Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first health ticket to get started
                </p>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="btn btn-primary"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onChatClick={() => {
                      // Navigate to ticket details/chat
                      console.log('Chat with ticket:', ticket.id);
                    }}
                    onClick={() => {
                      // Navigate to ticket details
                      console.log('View ticket details:', ticket.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <TicketForm
          onSubmit={handleCreateTicket}
          onCancel={() => setShowTicketForm(false)}
          isLoading={isCreating}
          userHospitalId={user?.hospitalId}
          hospitals={hospitals}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
