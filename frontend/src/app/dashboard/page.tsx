'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { api } from '@/lib/api';
import CreateAgentModal from '@/components/CreateAgentModal';
import WidgetCodeModal from '@/components/WidgetCodeModal';
import { 
  Plus, 
  Bot, 
  BarChart3, 
  Code2, 
  Trash2, 
  Edit,
  MessageSquare,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  domains: string[];
  lyzrConfig: {
    agentId: string;
    apiEndpoint: string;
    apiKey: string;
  };
  analytics: {
    totalChats: number;
    totalMessages: number;
    pageViews?: number;
    lastUsed?: string;
  };
  widget: {
    theme: 'light' | 'dark';
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    welcomeMessage: string;
    placeholder: string;
    title: string;
  };
  optimization?: {
    enableAutoLearning: boolean;
    confidenceThreshold: number;
    responseTimeTarget: number;
    categories: string[];
    keywords: string[];
    fallbackMessage: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { agents, setAgents, setLoading, isLoading } = useAgentStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents');
      if (response.data.success) {
        // Handle the nested structure: data.agents
        const agentsArray = response.data.data?.agents || response.data.data;
        if (Array.isArray(agentsArray)) {
          setAgents(agentsArray);
        } else {
          setAgents([]);
          console.warn('API response does not contain valid agents array:', response.data);
        }
      } else {
        setAgents([]);
        console.warn('API response not successful:', response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
      // Ensure agents is set to empty array on error
      setAgents([]);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [setLoading, setAgents]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.delete(`/agents/${agentId}`);
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading Dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Agents</h1>
          <p className="text-gray-600">Manage your AI support agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                    <dd className="text-lg font-medium text-gray-900">{Array.isArray(agents) ? agents.length : 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Chats</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(agents) ? agents.reduce((sum, agent) => sum + (agent.analytics?.totalChats || 0), 0) : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Agents</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(agents) ? agents.filter(agent => agent.isActive).length : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(agents) ? agents.reduce((sum, agent) => sum + (agent.analytics?.totalMessages || 0), 0) : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Agents</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(agents) || agents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first support agent.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(agents) && agents.map((agent) => (
                <div key={agent._id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Bot className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Total Chats:</span>
                        <span className="font-medium">{agent.analytics?.totalChats || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Messages:</span>
                        <span className="font-medium">{agent.analytics?.totalMessages || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domains:</span>
                        <span className="font-medium">{agent.domains?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Edit Agent"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setShowWidgetModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Widget Code"
                        >
                          <Code2 className="h-3 w-3 mr-1" />
                          Widget
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Analytics"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </button>
                      </div>
                      <button
                        onClick={() => deleteAgent(agent._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete Agent"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <CreateAgentModal 
            isOpen={showCreateModal} 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchAgents();
            }}
          />
        )}

        {/* Widget Code Modal */}
        {showWidgetModal && selectedAgent && (
          <WidgetCodeModal
            isOpen={showWidgetModal}
            onClose={() => {
              setShowWidgetModal(false);
              setSelectedAgent(null);
            }}
            agent={selectedAgent}
          />
        )}
      </div>
    );
  }
