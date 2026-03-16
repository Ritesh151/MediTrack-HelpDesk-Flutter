import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore, useTicketStore, useHospitalStore } from '../../store';
import TicketStatusChart from '../../components/charts/TicketStatusChart';
import { Ticket, Hospital } from '../../models';

const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  type: z.enum(['gov', 'private', 'semi']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  code: z.string().min(1, 'Hospital code is required'),
});

const adminSchema = z.object({
  name: z.string().min(1, 'Admin name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  hospitalId: z.string().min(1, 'Hospital is required'),
});

type HospitalFormData = z.infer<typeof hospitalSchema>;
type AdminFormData = z.infer<typeof adminSchema>;

const SuperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    tickets, 
    isLoading: ticketsLoading, 
    fetchTickets, 
    assignTicket,
    error: ticketError,
    clearError: clearTicketError 
  } = useTicketStore();
  
  const { 
    hospitals, 
    isLoading: hospitalsLoading, 
    fetchHospitals,
    createHospital,
    verifyHospital,
    unverifyHospital,
    error: hospitalError,
    clearError: clearHospitalError 
  } = useHospitalStore();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'hospitals'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);

  // Form hooks
  const hospitalForm = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      type: 'gov',
      address: '',
      city: '',
      code: '',
    },
  });

  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      hospitalId: '',
    },
  });

  useEffect(() => {
    fetchTickets();
    fetchHospitals();
  }, [fetchTickets, fetchHospitals]);

  useEffect(() => {
    if (ticketError) {
      console.error('Ticket error:', ticketError);
      clearTicketError();
    }
    if (hospitalError) {
      console.error('Hospital error:', hospitalError);
      clearHospitalError();
    }
  }, [ticketError, hospitalError, clearTicketError, clearHospitalError]);

  const handleAssignTicket = async (ticketId: string, adminId: string) => {
    try {
      await assignTicket(ticketId, adminId);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const handleVerifyHospital = async (hospitalId: string) => {
    try {
      await verifyHospital(hospitalId);
    } catch (error) {
      console.error('Failed to verify hospital:', error);
    }
  };

  const handleUnverifyHospital = async (hospitalId: string) => {
    try {
      await unverifyHospital(hospitalId);
    } catch (error) {
      console.error('Failed to unverify hospital:', error);
    }
  };

  const handleCreateHospital = async (data: HospitalFormData) => {
    try {
      await createHospital(data);
      setShowAddHospitalModal(false);
      hospitalForm.reset();
    } catch (error) {
      console.error('Failed to create hospital:', error);
    }
  };

  const handleAssignAdmin = async (data: AdminFormData) => {
    try {
      // This would call a user service to assign admin
      // For now, we'll just close the modal
      setShowAssignAdminModal(false);
      adminForm.reset();
    } catch (error) {
      console.error('Failed to assign admin:', error);
    }
  };

  const getSystemStats = () => {
    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const totalHospitals = hospitals.length;
    const verifiedHospitals = hospitals.filter(h => h.isVerified).length;
    const unverifiedHospitals = totalHospitals - verifiedHospitals;

    return {
      totalTickets,
      pendingTickets,
      totalHospitals,
      verifiedHospitals,
      unverifiedHospitals,
    };
  };

  const stats = getSystemStats();

  const filteredTickets = tickets.filter(ticket =>
    ticket.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-error/10 rounded-lg">
                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Super User Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  System administration and oversight
                </p>
              </div>
            </div>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Tickets</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingTickets}</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hospitals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHospitals}</p>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-success">{stats.verifiedHospitals}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unverified</p>
                  <p className="text-2xl font-bold text-error">{stats.unverifiedHospitals}</p>
                </div>
                <div className="p-3 bg-error/10 rounded-lg">
                  <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Tickets ({stats.pendingTickets})
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hospitals'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hospitals ({stats.totalHospitals})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Chart Section */}
            <TicketStatusChart tickets={tickets} />
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-surface rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Pending Tickets
                  </h3>
                </div>
                <div className="p-6">
                  {filteredTickets.slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No pending tickets
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredTickets.slice(0, 5).map((ticket) => (
                        <div key={ticket._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {ticket.issueTitle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ticket.caseNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="ml-4 btn btn-primary btn-sm"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hospital Verification Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Verified Hospitals</span>
                      <span className="text-sm font-medium text-success">{stats.verifiedHospitals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Unverified Hospitals</span>
                      <span className="text-sm font-medium text-error">{stats.unverifiedHospitals}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${stats.totalHospitals > 0 ? (stats.verifiedHospitals / stats.totalHospitals) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pending Tickets Assignment
                </h2>
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
            <div className="p-6">
              {ticketsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No tickets found' : 'No pending tickets'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket._id} className="card">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {ticket.issueTitle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Patient: {ticket.patient?.name || 'Unknown'} ({ticket.patientId})
                            </p>
                            <p className="text-sm text-primary dark:text-primary-400 font-medium mt-1">
                              {ticket.caseNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="btn btn-primary"
                          >
                            Assign to Admin
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hospital Management
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search hospitals..."
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
            <div className="p-6">
              {hospitalsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredHospitals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No hospitals found' : 'No hospitals available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHospitals.map((hospital) => (
                    <div key={hospital._id} className="card">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {hospital.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hospital.isVerified 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-warning/10 text-warning'
                              }`}>
                                {hospital.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {hospital.city}, {hospital.state}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Type: {hospital.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {hospital.isVerified ? (
                              <button
                                onClick={() => handleUnverifyHospital(hospital._id)}
                                className="btn btn-secondary btn-sm"
                              >
                                Unverify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerifyHospital(hospital._id)}
                                className="btn btn-primary btn-sm"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Assignment Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Ticket to Admin
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedTicket.caseNumber}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {selectedTicket.issueTitle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Patient: {selectedTicket.patient?.name || 'Unknown'}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Admin
                </label>
                <select className="input">
                  <option value="">Choose an admin...</option>
                  <option value="admin1">Admin User 1</option>
                  <option value="admin2">Admin User 2</option>
                  {/* This would be populated with actual admin users */}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // This would actually assign the ticket
                    handleAssignTicket(selectedTicket._id, 'admin1'); // Placeholder admin ID
                  }}
                  className="btn btn-primary flex-1"
                >
                  Assign Ticket
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperDashboard;
