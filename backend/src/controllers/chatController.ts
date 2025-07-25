import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Agent from '../models/Agent';
import lyzrService, { LyzrService } from '../services/lyzr';
import { z } from 'zod';

// Validation schema
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().optional(),
  agentId: z.string().min(1, 'Agent ID is required')
});

// @desc    Send message to agent
// @route   POST /api/chat/message
// @access  Public (for widget usage)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message, sessionId, agentId } = chatMessageSchema.parse(req.body);

    // Find the agent configuration
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    if (!agent.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Agent is not active'
      });
    }

    // Generate or use existing session ID
    const finalSessionId = sessionId || lyzrService.generateSessionId(
      agent.lyzrConfig.agentId, 
      req.ip || 'anonymous'
    );

    // Create Lyzr service instance with agent's config
    const agentLyzrService = new LyzrService(
      agent.lyzrConfig.apiEndpoint,
      agent.lyzrConfig.apiKey,
      agent.lyzrConfig.agentId
    );

    // Send message to Lyzr
    const lyzrResponse = await agentLyzrService.sendMessage(
      message,
      req.ip || 'anonymous',
      finalSessionId,
      agent.lyzrConfig.agentId
    );

    // Update agent analytics
    await Agent.findByIdAndUpdate(agentId, {
      $inc: { 
        'analytics.totalMessages': 1,
        'analytics.totalChats': sessionId ? 0 : 1 // Only increment if new session
      },
      'analytics.lastUsed': new Date()
    });

    res.json({
      success: true,
      data: {
        message: lyzrResponse.response,
        sessionId: finalSessionId,
        agentId: agentId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
};

// @desc    Test agent connection
// @route   POST /api/chat/test/:agentId
// @access  Private
export const testAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await Agent.findOne({
      _id: agentId,
      owner: req.user?.id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Test with a simple message
    const testSessionId = lyzrService.generateSessionId(
      agent.lyzrConfig.agentId,
      req.user?.id || 'test'
    );

    const agentLyzrService = new LyzrService(
      agent.lyzrConfig.apiEndpoint,
      agent.lyzrConfig.apiKey,
      agent.lyzrConfig.agentId
    );

    const lyzrResponse = await agentLyzrService.sendMessage(
      'Hello, this is a test message.',
      req.user?.id || 'test',
      testSessionId,
      agent.lyzrConfig.agentId
    );

    res.json({
      success: true,
      message: 'Agent connection successful',
      data: {
        response: lyzrResponse.response,
        sessionId: testSessionId
      }
    });

  } catch (error) {
    console.error('Test agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test agent connection'
    });
  }
};