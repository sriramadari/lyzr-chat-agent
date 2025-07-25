import { create } from 'zustand';

interface Agent {
  _id: string;
  name: string;
  description: string;
  lyzrConfig: {
    agentId: string;
    apiEndpoint: string;
    apiKey: string;
  };
  widget: {
    theme: 'light' | 'dark';
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    welcomeMessage: string;
    placeholder: string;
    title: string;
  };
  domains: string[];
  isActive: boolean;
  analytics: {
    totalChats: number;
    totalMessages: number;
    lastUsed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent._id === id ? { ...agent, ...updates } : agent
      ),
    })),
  deleteAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent._id !== id),
    })),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setLoading: (isLoading) => set({ isLoading }),
}));
