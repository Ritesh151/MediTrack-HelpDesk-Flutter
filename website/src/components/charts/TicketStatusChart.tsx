import React from 'react';
import { Ticket } from '../../models';

interface TicketStatusChartProps {
  tickets: Ticket[];
}

const TicketStatusChart: React.FC<TicketStatusChartProps> = ({ tickets }) => {
  const getStatusStats = () => {
    const stats = {
      pending: 0,
      in_progress: 0,
      assigned: 0,
      resolved: 0,
      closed: 0,
    };

    tickets.forEach(ticket => {
      stats[ticket.status as keyof typeof stats]++;
    });

    return stats;
  };

  const stats = getStatusStats();
  const total = tickets.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'assigned': return 'bg-primary';
      case 'in_progress': return 'bg-info';
      case 'resolved': return 'bg-success';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ticket Status Distribution
      </h3>
      
      {total === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No tickets to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {Object.entries(stats).map(([status, count]) => {
              const percentage = getPercentage(count);
              const colorClass = getStatusColor(status);
              
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusLabel(status)}
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                      <div
                        className={`${colorClass} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-xs text-white font-medium">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                    {percentage <= 10 && (
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 dark:text-gray-400">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{stats.in_progress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.resolved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketStatusChart;
