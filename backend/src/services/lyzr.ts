import axios from 'axios';

interface LyzrChatRequest {
  user_id: string;
  agent_id: string;
  session_id: string;
  message: string;
}

interface LyzrChatResponse {
  response: string;
  module_outputs: {
    documents: any[];
  };
}

export class LyzrService {
  private apiEndpoint: string;
  private apiKey: string;
  private agentId: string;

  constructor(apiEndpoint?: string, apiKey?: string, agentId?: string) {
    this.apiEndpoint = apiEndpoint || process.env.LYZR_API_ENDPOINT!;
    this.apiKey = apiKey || process.env.LYZR_API_KEY!;
    this.agentId = agentId || process.env.LYZR_AGENT_ID!;
  }

  async sendMessage(
    message: string, 
    userId: string, 
    sessionId: string,
    customAgentId?: string
  ): Promise<LyzrChatResponse> {
    try {
      const payload: LyzrChatRequest = {
        user_id: userId,
        agent_id: customAgentId || this.agentId,
        session_id: sessionId,
        message: message
      };

      console.log('Sending to Lyzr:', payload);

      const response = await axios.post<LyzrChatResponse>(
        this.apiEndpoint,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('Lyzr response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lyzr API error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Lyzr API Error: ${error.response?.status} - ${error.response?.data || error.message}`);
      }
      throw new Error('Failed to get response from AI agent');
    }
  }

  generateSessionId(agentId: string, userId: string): string {
    const timestamp = Date.now();
    return `${agentId}-${userId}-${timestamp}`;
  }
}

export default new LyzrService();