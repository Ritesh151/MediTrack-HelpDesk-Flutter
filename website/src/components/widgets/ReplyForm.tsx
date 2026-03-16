import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ticket } from '../../models';

const replySchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorPhone: z.string().min(1, 'Doctor phone is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  replyMessage: z.string().min(10, 'Reply message must be at least 10 characters'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReplyFormProps {
  ticket: Ticket;
  onSubmit: (ticketId: string, replyData: ReplyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ 
  ticket, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const handleFormSubmit = async (data: ReplyFormData) => {
    try {
      await onSubmit(ticket.id, data);
      reset();
    } catch (error) {
      // Error handling is managed by the parent component
    }
  };

  const specializations = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reply to Ticket
          </h2>
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Case: <span className="font-medium">{ticket.caseNumber}</span>
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {ticket.issueTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Ticket Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ticket Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Patient:</span> {ticket.patient?.name || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Priority:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ticket.priority === 'emergency' ? 'bg-error/10 text-error' :
                  ticket.priority === 'high' ? 'bg-warning/10 text-warning' :
                  ticket.priority === 'medium' ? 'bg-info/10 text-info' :
                  'bg-success/10 text-success'
                }`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor Name <span className="text-error">*</span>
              </label>
              <input
                {...register('doctorName')}
                type="text"
                id="doctorName"
                className="input"
                placeholder="Dr. John Smith"
                disabled={isSubmitting || isLoading}
              />
              {errors.doctorName && (
                <p className="mt-1 text-sm text-error">{errors.doctorName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="doctorPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor Phone <span className="text-error">*</span>
              </label>
              <input
                {...register('doctorPhone')}
                type="tel"
                id="doctorPhone"
                className="input"
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting || isLoading}
              />
              {errors.doctorPhone && (
                <p className="mt-1 text-sm text-error">{errors.doctorPhone.message}</p>
              )}
            </div>
          </div>

          {/* Specialization */}
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specialization <span className="text-error">*</span>
            </label>
            <select
              {...register('specialization')}
              id="specialization"
              className="input"
              disabled={isSubmitting || isLoading}
            >
              <option value="">Select specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="mt-1 text-sm text-error">{errors.specialization.message}</p>
            )}
          </div>

          {/* Reply Message */}
          <div>
            <label htmlFor="replyMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reply Message <span className="text-error">*</span>
            </label>
            <textarea
              {...register('replyMessage')}
              id="replyMessage"
              rows={6}
              className="input resize-none"
              placeholder="Provide your professional response to the patient's inquiry..."
              disabled={isSubmitting || isLoading}
            />
            {errors.replyMessage && (
              <p className="mt-1 text-sm text-error">{errors.replyMessage.message}</p>
            )}
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
                  Sending Reply...
                </>
              ) : (
                'Send Reply'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyForm;
