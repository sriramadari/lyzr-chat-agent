'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const createAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(50, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  lyzrAgentId: z.string().min(1, 'Lyzr Agent ID is required'),
  apiEndpoint: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API Key is required'),
  welcomeMessage: z.string().min(1, 'Welcome message is required'),
  title: z.string().min(1, 'Widget title is required'),
  placeholder: z.string().min(1, 'Input placeholder is required'),
  primaryColor: z.string().min(1, 'Primary color is required'),
  theme: z.enum(['light', 'dark']),
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  domains: z.string().optional(),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAgentModal({ isOpen, onClose, onSuccess }: CreateAgentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      theme: 'light',
      position: 'bottom-right',
      primaryColor: '#3B82F6',
      welcomeMessage: 'Hello! How can I help you today?',
      title: 'Support Chat',
      placeholder: 'Type your message...',
    },
  });

  const onSubmit = async (data: CreateAgentForm) => {
    try {
      setIsSubmitting(true);
      
      const agentData = {
        name: data.name,
        description: data.description,
        lyzrConfig: {
          agentId: data.lyzrAgentId,
          apiEndpoint: data.apiEndpoint,
          apiKey: data.apiKey,
        },
        widget: {
          theme: data.theme,
          primaryColor: data.primaryColor,
          position: data.position,
          welcomeMessage: data.welcomeMessage,
          placeholder: data.placeholder,
          title: data.title,
        },
        domains: data.domains ? data.domains.split(',').map(d => d.trim()).filter(Boolean) : [],
        isActive: true,
      };

      await api.post('/agents', agentData);
      toast.success('Agent created successfully!');
      reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-md bg-white m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Support Agent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Agent Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer Support Bot"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="A helpful support agent for customer inquiries"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Lyzr Configuration */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Lyzr Configuration</h4>
            
            <div>
              <label htmlFor="lyzrAgentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lyzr Agent ID
              </label>
              <input
                {...register('lyzrAgentId')}
                type="text"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-agent-id"
              />
              {errors.lyzrAgentId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lyzrAgentId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Endpoint
              </label>
              <input
                {...register('apiEndpoint')}
                type="url"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://api.lyzr.ai/v1/agents"
              />
              {errors.apiEndpoint && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apiEndpoint.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key
              </label>
              <input
                {...register('apiKey')}
                type="password"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-api-key"
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apiKey.message}</p>
              )}
            </div>
          </div>

          {/* Widget Configuration */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Widget Appearance</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Widget Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Color
                </label>
                <input
                  {...register('primaryColor')}
                  type="color"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm h-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.primaryColor && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.primaryColor.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Welcome Message
              </label>
              <input
                {...register('welcomeMessage')}
                type="text"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.welcomeMessage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.welcomeMessage.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Input Placeholder
              </label>
              <input
                {...register('placeholder')}
                type="text"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.placeholder && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.placeholder.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <select
                  {...register('theme')}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                {errors.theme && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.theme.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Position
                </label>
                <select
                  {...register('position')}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="domains" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Allowed Domains (optional)
              </label>
              <input
                {...register('domains')}
                type="text"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="example.com, mysite.com (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to allow all domains
              </p>
              {errors.domains && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.domains.message}</p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
