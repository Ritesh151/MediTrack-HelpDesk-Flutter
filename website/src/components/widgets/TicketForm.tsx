import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateTicketRequest, TicketPriority, TicketCategory, Hospital } from '../../models';
import { useHospitalStore } from '../../store';

const ticketSchema = z.object({
  issueTitle: z.string().min(1, 'Issue title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  category: z.enum(['general_inquiry', 'technical_issue', 'medical_consultation', 'billing_issue', 'appointment_request']),
  hospitalId: z.string().min(1, 'Hospital is required'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onSubmit: (data: CreateTicketRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<TicketFormData>;
  hospitals?: Hospital[];
  userHospitalId?: string;
}

const TicketForm: React.FC<TicketFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  initialData,
  hospitals = [],
  userHospitalId
}) => {
  const { hospitals: storeHospitals, fetchHospitals } = useHospitalStore();
  const [hospitalsList, setHospitalsList] = useState(hospitals);

  useEffect(() => {
    if (hospitals.length === 0) {
      fetchHospitals();
    }
  }, [fetchHospitals, hospitals.length]);

  useEffect(() => {
    if (storeHospitals.length > 0) {
      setHospitalsList(storeHospitals);
    }
  }, [storeHospitals]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium',
      category: 'general_inquiry',
      hospitalId: userHospitalId || '',
      ...initialData,
    },
  });

  const handleFormSubmit = async (data: TicketFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is managed by the parent component
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'info' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'emergency', label: 'Emergency', color: 'error' },
  ];

  const categoryOptions = [
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'technical_issue', label: 'Technical Issue' },
    { value: 'medical_consultation', label: 'Medical Consultation' },
    { value: 'billing_issue', label: 'Billing Issue' },
    { value: 'appointment_request', label: 'Appointment Request' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Ticket
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Describe your issue and we'll help you resolve it
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Issue Title */}
          <div>
            <label htmlFor="issueTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Title <span className="text-error">*</span>
            </label>
            <input
              {...register('issueTitle')}
              type="text"
              id="issueTitle"
              className="input"
              placeholder="Brief description of your issue"
              disabled={isSubmitting || isLoading}
            />
            {errors.issueTitle && (
              <p className="mt-1 text-sm text-error">{errors.issueTitle.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={5}
              className="input resize-none"
              placeholder="Please provide detailed information about your issue..."
              disabled={isSubmitting || isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority <span className="text-error">*</span>
              </label>
              <select
                {...register('priority')}
                id="priority"
                className="input"
                disabled={isSubmitting || isLoading}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-error">*</span>
              </label>
              <select
                {...register('category')}
                id="category"
                className="input"
                disabled={isSubmitting || isLoading}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hospital <span className="text-error">*</span>
            </label>
            <select
              {...register('hospitalId')}
              id="hospitalId"
              className="input"
              disabled={isSubmitting || isLoading || !!userHospitalId}
            >
              <option value="">Select a hospital</option>
              {hospitalsList.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} ({hospital.city})
                </option>
              ))}
            </select>
            {errors.hospitalId && (
              <p className="mt-1 text-sm text-error">{errors.hospitalId.message}</p>
            )}
            {userHospitalId && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Hospital is pre-selected based on your profile
              </p>
            )}
          </div>

          {/* Priority Indicator */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority Levels:
            </h3>
            <div className="space-y-1 text-sm">
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-${option.color}`}></span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong>{option.label}:</strong> {getPriorityDescription(option.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getPriorityDescription = (priority: string): string => {
  switch (priority) {
    case 'low': return 'Non-urgent issues that can be addressed within a few days';
    case 'medium': return 'Important issues that should be addressed within 24-48 hours';
    case 'high': return 'Urgent issues requiring attention within a few hours';
    case 'emergency': return 'Critical issues requiring immediate attention';
    default: return '';
  }
};

export default TicketForm;
