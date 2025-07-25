import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; company?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
};

// Agent API
export const agentAPI = {
  getAgents: () => api.get('/agents'),
  
  getAgent: (id: string) => api.get(`/agents/${id}`),
  
  createAgent: (data: {
    name: string;
    description?: string;
    lyzrConfig: {
      agentId: string;
      apiEndpoint: string;
      apiKey: string;
    };
    widget?: {
      theme?: 'light' | 'dark';
      primaryColor?: string;
      position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
      welcomeMessage?: string;
      placeholder?: string;
      title?: string;
    };
    domains?: string[];
  }) => api.post('/agents', data),
  
  updateAgent: (id: string, data: any) => api.put(`/agents/${id}`, data),
  
  deleteAgent: (id: string) => api.delete(`/agents/${id}`),
  
  toggleAgent: (id: string) => api.patch(`/agents/${id}/toggle`),
  
  getWidgetCode: (id: string) => api.get(`/agents/${id}/widget`),
  
  testAgent: (id: string) => api.post(`/chat/test/${id}`),
  
  // Optimization API
  getOptimization: (id: string) => api.get(`/agents/${id}/optimization`),
  updateOptimization: (id: string, data: any) => api.put(`/agents/${id}/optimization`, data),
  uploadTrainingData: (id: string, data: any) => api.post(`/agents/${id}/training-data`, data),
  getTrainingData: (id: string, params?: any) => api.get(`/agents/${id}/training-data`, { params }),
  getRecommendations: (id: string) => api.get(`/agents/${id}/recommendations`)
};

// Ticket API
export const ticketAPI = {
  getTickets: (params?: any) => api.get('/tickets', { params }),
  getTicket: (id: string) => api.get(`/tickets/${id}`),
  createTicket: (data: any) => api.post('/tickets', data),
  updateTicket: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  deleteTicket: (id: string) => api.delete(`/tickets/${id}`),
  addMessage: (id: string, data: any) => api.post(`/tickets/${id}/messages`, data),
  getAnalytics: () => api.get('/tickets/analytics')
};

// User Management API
export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  getAnalytics: () => api.get('/users/analytics')
};

// Chat API
export const chatAPI = {
  sendMessage: (data: {
    message: string;
    agentId: string;
    sessionId?: string;
  }) => api.post('/chat/message', data),
};
