import React from 'react';
import { useParams } from 'react-router-dom';

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ticket Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ticket ID: {id}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ticket Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Ticket details page content - Coming soon</p>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
