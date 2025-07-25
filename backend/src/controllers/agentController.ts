import { Response } from 'express';
import Agent from '../models/Agent';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  lyzrConfig: z.object({
    agentId: z.string().min(1, 'Lyzr Agent ID is required'),
    apiEndpoint: z.string().url('Please provide a valid API endpoint'),
    apiKey: z.string().min(1, 'API key is required')
  }),
  widget: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional(),
    position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional(),
    welcomeMessage: z.string().max(200).optional(),
    placeholder: z.string().max(100).optional(),
    title: z.string().max(50).optional()
  }).optional(),
  domains: z.array(z.string()).optional()
});

const updateAgentSchema = createAgentSchema.partial();

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
export const createAgent = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createAgentSchema.parse(req.body);

    // Check if agent with same Lyzr ID exists
    const existingAgent = await Agent.findOne({
      'lyzrConfig.agentId': validatedData.lyzrConfig.agentId
    });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this Lyzr ID already exists'
      });
    }

    const agent = await Agent.create({
      ...validatedData,
      owner: req.user!._id
    });

    res.status(201).json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all user's agents
// @route   GET /api/agents
// @access  Private
export const getAgents = async (req: AuthRequest, res: Response) => {
  try {
    const agents = await Agent.find({ owner: req.user!._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agents.length,
      data: { agents }
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private
export const getAgent = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user!._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
export const updateAgent = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateAgentSchema.parse(req.body);

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, owner: req.user!._id },
      validatedData,
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Update agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
export const deleteAgent = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      owner: req.user!._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle agent status
// @route   PATCH /api/agents/:id/toggle
// @access  Private
export const toggleAgent = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user!._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    agent.isActive = !agent.isActive;
    await agent.save();

    res.json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    console.error('Toggle agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get agent widget code
// @route   GET /api/agents/:id/widget
// @access  Private
export const getWidgetCode = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user!._id
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const widgetCode = `
<!-- Lyzr Support Chat Widget -->
<script>
  (function() {
    window.LyzrChatConfig = {
      agentId: '${agent._id}',
      theme: '${agent.widget.theme}',
      primaryColor: '${agent.widget.primaryColor}',
      position: '${agent.widget.position}',
      welcomeMessage: '${agent.widget.welcomeMessage}',
      placeholder: '${agent.widget.placeholder}',
      title: '${agent.widget.title}'
    };
    
    const script = document.createElement('script');
    script.src = '${process.env.FRONTEND_URL}/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

    res.json({
      success: true,
      data: { 
        widgetCode: widgetCode.trim(),
        agentId: agent._id
      }
    });
  } catch (error) {
    console.error('Get widget code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
