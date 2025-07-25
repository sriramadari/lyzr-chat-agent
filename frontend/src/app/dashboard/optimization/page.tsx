'use client';

import { useEffect, useState, useCallback } from 'react';
import { agentAPI } from '@/lib/api';
import { useAgentStore } from '@/stores/agentStore';
import { 
  Settings, 
  Brain, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  analytics: {
    totalChats: number;
    totalMessages: number;
  };
}

interface OptimizationData {
  agent: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    analytics: {
      totalChats: number;
      totalMessages: number;
    };
  };
  performance: {
    totalTickets: number;
    avgSatisfaction: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    totalInteractions: number;
    resolvedTickets: number;
    resolutionRate: number;
  };
  insights: {
    commonCategories: Array<{ _id: string; count: number }>;
    satisfactionTrend: Array<{ _id: string; avgSatisfaction: number; count: number }>;
    recentFeedback: Array<{
      id: string;
      satisfaction: number;
      customerName: string;
      date: string;
      lastMessage: string;
    }>;
  };
  optimization: {
    enableAutoLearning: boolean;
    confidenceThreshold: number;
    responseTimeTarget: number;
    categories: string[];
    keywords: string[];
    fallbackMessage: string;
  };
}

interface Recommendation {
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
}

export default function OptimizationPage() {
  const { agents } = useAgentStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingData, setTrainingData] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchOptimizationData = useCallback(async () => {
    if (!selectedAgent) return;
    
    try {
      setIsLoading(true);
      const [optimizationResponse, recommendationsResponse] = await Promise.all([
        agentAPI.getOptimization(selectedAgent._id),
        agentAPI.getRecommendations(selectedAgent._id)
      ]);
      
      setOptimizationData(optimizationResponse.data.data);
      setRecommendations(recommendationsResponse.data.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching optimization data:', error);
      toast.error('Failed to fetch optimization data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      fetchOptimizationData();
    }
  }, [selectedAgent, fetchOptimizationData]);

  const handleUploadTrainingData = async () => {
    if (!selectedAgent || !trainingData.trim()) {
      toast.error('Please provide training data');
      return;
    }

    try {
      // Parse training data (expecting JSON format)
      const questions = JSON.parse(trainingData);
      
      await agentAPI.uploadTrainingData(selectedAgent._id, { questions });
      toast.success('Training data uploaded successfully');
      setTrainingData('');
      setShowUploadModal(false);
      fetchOptimizationData();
    } catch (error) {
      console.error('Error uploading training data:', error);
      toast.error('Failed to upload training data. Please check the format.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      case 'low': return <CheckCircle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  if (!selectedAgent) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create an agent first to access optimization features.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Optimization</h1>
          <p className="text-gray-600">Improve agent performance with AI insights</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Training Data
        </button>
      </div>

      {/* Agent Selector */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Agent to Optimize
        </label>
        <select
          value={selectedAgent._id}
          onChange={(e) => {
            const agent = agents.find(a => a._id === e.target.value);
            setSelectedAgent(agent || null);
          }}
          className="block w-full max-w-sm px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name} {!agent.isActive && '(Inactive)'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Analyzing agent performance...</p>
        </div>
      ) : optimizationData ? (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizationData.performance.totalTickets || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizationData.performance.avgSatisfaction 
                      ? optimizationData.performance.avgSatisfaction.toFixed(1) 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizationData.performance.avgResponseTime 
                      ? `${Math.round(optimizationData.performance.avgResponseTime)}s` 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizationData.performance.resolutionRate 
                      ? `${optimizationData.performance.resolutionRate}%` 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Lightbulb className="h-6 w-6 text-yellow-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Optimization Recommendations
                </h2>
              </div>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Great job! No recommendations at this time.
                </h3>
                <p className="text-gray-500">
                  Your agent is performing well. Check back after more interactions.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 p-2 rounded-lg border ${getPriorityColor(recommendation.priority)}`}>
                        {getPriorityIcon(recommendation.priority)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {recommendation.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {recommendation.priority} priority
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">
                          {recommendation.description}
                        </p>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-900">Recommended Action:</p>
                          <p className="text-sm text-gray-600 mt-1">{recommendation.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No optimization data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your agent needs more interactions to generate insights.
          </p>
        </div>
      )}

      {/* Upload Training Data Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Upload Training Data</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Training Data (JSON Format)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Format: {`[{"question": "...", "answer": "...", "category": "..."}]`}
                </p>
                <textarea
                  value={trainingData}
                  onChange={(e) => setTrainingData(e.target.value)}
                  placeholder={`[
  {
    "question": "How do I reset my password?",
    "answer": "You can reset your password by clicking the 'Forgot Password' link on the login page.",
    "category": "Account Support"
  }
]`}
                  rows={10}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadTrainingData}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
