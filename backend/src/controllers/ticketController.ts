import { Response } from 'express';
import Ticket from '../models/Ticket';
import Agent from '../models/Agent';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().min(1, 'Category is required').max(100),
  agentId: z.string().min(1, 'Agent ID is required'),
  sessionId: z.string().optional(),
  customerInfo: z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    metadata: z.any().optional()
  }).optional(),
  tags: z.array(z.string().max(50)).optional()
});

const updateTicketSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().max(100).optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string().max(50)).optional(),
  resolution: z.object({
    summary: z.string().max(1000),
    resolvedAt: z.date().optional()
  }).optional()
});

const addMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000),
  sender: z.enum(['user', 'agent', 'system']).optional().default('agent'),
  metadata: z.any().optional()
});

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Public (for chat widget) / Private (for dashboard)
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);

    // Verify agent exists and user has access (if authenticated)
    const agentQuery: any = { _id: validatedData.agentId };
    if (req.user) {
      agentQuery.owner = req.user._id;
    }

    const agent = await Agent.findOne(agentQuery);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const ticket = await Ticket.create({
      ...validatedData,
      userId: req.user?._id,
      assignedTo: req.user?._id // Auto-assign to ticket creator if authenticated
    });

    await ticket.populate(['agentId', 'userId', 'assignedTo']);

    res.status(201).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all tickets for user's agents
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;

    // Get user's agents
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    // Build filter
    const filter: any = { agentId: { $in: agentIds } };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const tickets = await Ticket.find(filter)
      .populate('agentId', 'name')
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Ticket.countDocuments(filter);

    res.json({
      success: true,
      count: tickets.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: { tickets }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req: AuthRequest, res: Response) => {
  try {
    // Get user's agents to verify access
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      agentId: { $in: agentIds }
    })
      .populate('agentId', 'name description')
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateTicketSchema.parse(req.body);

    // Get user's agents to verify access
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    // Handle resolution
    if (validatedData.resolution) {
      validatedData.resolution.resolvedAt = new Date();
      (validatedData as any).resolution.resolvedBy = req.user!._id;
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        agentId: { $in: agentIds }
      },
      validatedData,
      { new: true, runValidators: true }
    )
      .populate('agentId', 'name')
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
export const deleteTicket = async (req: AuthRequest, res: Response) => {
  try {
    // Get user's agents to verify access
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    const ticket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      agentId: { $in: agentIds }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
export const addMessage = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = addMessageSchema.parse(req.body);

    // Get user's agents to verify access
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: req.params.id,
        agentId: { $in: agentIds }
      },
      {
        $push: {
          messages: {
            ...validatedData,
            timestamp: new Date()
          }
        },
        $inc: {
          'analytics.interactions': 1
        }
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: { 
        ticket,
        message: ticket.messages[ticket.messages.length - 1]
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

    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get ticket analytics
// @route   GET /api/tickets/analytics
// @access  Private
export const getTicketAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Get user's agents
    const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
    const agentIds = userAgents.map(agent => agent._id);

    const analytics = await Ticket.aggregate([
      { $match: { agentId: { $in: agentIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgResponseTime: { $avg: '$analytics.responseTime' },
          avgResolutionTime: { $avg: '$analytics.resolutionTime' },
          avgSatisfaction: { $avg: '$analytics.satisfaction' }
        }
      }
    ]);

    const priorityAnalytics = await Ticket.aggregate([
      { $match: { agentId: { $in: agentIds } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryAnalytics = await Ticket.aggregate([
      { $match: { agentId: { $in: agentIds } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: analytics[0] || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
          avgResponseTime: 0,
          avgResolutionTime: 0,
          avgSatisfaction: 0
        },
        byPriority: priorityAnalytics,
        byCategory: categoryAnalytics
      }
    });
  } catch (error) {
    console.error('Get ticket analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
