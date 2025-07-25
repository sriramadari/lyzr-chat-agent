import { Response } from 'express';
import Agent from '../models/Agent';
import Ticket from '../models/Ticket';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const trainingDataSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required').max(500),
    answer: z.string().min(1, 'Answer is required').max(2000),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).optional()
  })).min(1, 'At least one Q&A pair is required')
});

const optimizationConfigSchema = z.object({
  enableAutoLearning: z.boolean().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  responseTimeTarget: z.number().min(1).optional(), // in seconds
  categories: z.array(z.string().max(100)).optional(),
  keywords: z.array(z.string().max(50)).optional(),
  fallbackMessage: z.string().max(200).optional()
});

// @desc    Get agent optimization data
// @route   GET /api/agents/:id/optimization
// @access  Private
export const getAgentOptimization = async (req: AuthRequest, res: Response) => {
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

    // Get performance metrics from tickets
    const performanceMetrics = await Ticket.aggregate([
      { $match: { agentId: agent._id } },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          avgResponseTime: { $avg: '$analytics.responseTime' },
          avgResolutionTime: { $avg: '$analytics.resolutionTime' },
          avgSatisfaction: { $avg: '$analytics.satisfaction' },
          totalInteractions: { $sum: '$analytics.interactions' },
          resolvedTickets: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] }
          }
        }
      }
    ]);

    // Get common questions/categories
    const commonCategories = await Ticket.aggregate([
      { $match: { agentId: agent._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent feedback from ticket messages
    const recentFeedback = await Ticket.find({ agentId: agent._id })
      .select('messages analytics.satisfaction customerInfo.name createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate satisfaction trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const satisfactionTrend = await Ticket.aggregate([
      {
        $match: {
          agentId: agent._id,
          createdAt: { $gte: thirtyDaysAgo },
          'analytics.satisfaction': { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          avgSatisfaction: { $avg: '$analytics.satisfaction' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const metrics = performanceMetrics[0] || {
      totalTickets: 0,
      avgResponseTime: 0,
      avgResolutionTime: 0,
      avgSatisfaction: 0,
      totalInteractions: 0,
      resolvedTickets: 0
    };

    // Calculate resolution rate
    const resolutionRate = metrics.totalTickets > 0 
      ? (metrics.resolvedTickets / metrics.totalTickets) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          name: agent.name,
          description: agent.description,
          isActive: agent.isActive,
          analytics: agent.analytics
        },
        performance: {
          ...metrics,
          resolutionRate: Math.round(resolutionRate * 100) / 100
        },
        insights: {
          commonCategories,
          satisfactionTrend,
          recentFeedback: recentFeedback.map(ticket => ({
            id: ticket._id,
            satisfaction: ticket.analytics?.satisfaction,
            customerName: ticket.customerInfo?.name,
            date: ticket.createdAt,
            lastMessage: ticket.messages?.[ticket.messages.length - 1]?.content?.substring(0, 100)
          }))
        },
        optimization: (agent as any).optimization || {
          enableAutoLearning: false,
          confidenceThreshold: 0.8,
          responseTimeTarget: 30,
          categories: [],
          keywords: [],
          fallbackMessage: 'I\'m not sure about that. Let me connect you with a human agent.'
        }
      }
    });
  } catch (error) {
    console.error('Get agent optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update agent optimization settings
// @route   PUT /api/agents/:id/optimization
// @access  Private
export const updateAgentOptimization = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = optimizationConfigSchema.parse(req.body);

    const agent = await Agent.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user!._id
      },
      {
        $set: {
          'optimization': validatedData
        }
      },
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
      data: { 
        agent,
        optimization: (agent as any).optimization
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

    console.error('Update agent optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload training data for agent
// @route   POST /api/agents/:id/training-data
// @access  Private
export const uploadTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = trainingDataSchema.parse(req.body);

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

    // Store training data in agent document
    const updatedAgent = await Agent.findByIdAndUpdate(
      agent._id,
      {
        $push: {
          'trainingData': {
            $each: validatedData.questions.map(q => ({
              ...q,
              uploadedAt: new Date(),
              uploadedBy: req.user!._id
            }))
          }
        },
        $set: {
          'lastTrainingUpdate': new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Successfully uploaded ${validatedData.questions.length} training examples`,
      data: {
        agent: updatedAgent,
        trainingDataCount: ((updatedAgent as any).trainingData || []).length
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

    console.error('Upload training data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get agent training data
// @route   GET /api/agents/:id/training-data
// @access  Private
export const getTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;

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

    let trainingData = (agent as any).trainingData || [];

    // Apply filters
    if (category) {
      trainingData = trainingData.filter((item: any) => item.category === category);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      trainingData = trainingData.filter((item: any) =>
        item.question.toLowerCase().includes(searchLower) ||
        item.answer.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedData = trainingData.slice(startIndex, endIndex);

    res.json({
      success: true,
      count: paginatedData.length,
      total: trainingData.length,
      pages: Math.ceil(trainingData.length / limitNum),
      currentPage: pageNum,
      data: {
        trainingData: paginatedData,
        categories: [...new Set(trainingData.map((item: any) => item.category).filter(Boolean))]
      }
    });
  } catch (error) {
    console.error('Get training data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate optimization recommendations
// @route   GET /api/agents/:id/recommendations
// @access  Private
export const getOptimizationRecommendations = async (req: AuthRequest, res: Response) => {
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

    // Get performance data
    const performanceData = await Ticket.aggregate([
      { $match: { agentId: agent._id } },
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$analytics.satisfaction' },
          avgResponseTime: { $avg: '$analytics.responseTime' },
          totalTickets: { $sum: 1 },
          resolvedTickets: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] }
          }
        }
      }
    ]);

    // Get common unresolved categories
    const unresolvedCategories = await Ticket.aggregate([
      { $match: { agentId: agent._id, status: { $in: ['open', 'in_progress'] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get low satisfaction tickets for analysis
    const lowSatisfactionTickets = await Ticket.find({
      agentId: agent._id,
      'analytics.satisfaction': { $lt: 3 }
    }).limit(10);

    const metrics = performanceData[0] || {
      avgSatisfaction: 0,
      avgResponseTime: 0,
      totalTickets: 0,
      resolvedTickets: 0
    };

    const resolutionRate = metrics.totalTickets > 0 
      ? (metrics.resolvedTickets / metrics.totalTickets) * 100 
      : 0;

    // Generate recommendations based on performance
    const recommendations = [];

    if (metrics.avgSatisfaction < 3.5) {
      recommendations.push({
        type: 'satisfaction',
        priority: 'high',
        title: 'Improve Customer Satisfaction',
        description: 'Your average satisfaction score is below 3.5. Consider reviewing recent conversations and adding more training data.',
        action: 'Upload training data for common issues'
      });
    }

    if (metrics.avgResponseTime > 60) {
      recommendations.push({
        type: 'response_time',
        priority: 'medium',
        title: 'Reduce Response Time',
        description: 'Average response time is above 1 minute. Optimize your agent configuration or add more specific training.',
        action: 'Review agent settings and training data'
      });
    }

    if (resolutionRate < 70) {
      recommendations.push({
        type: 'resolution_rate',
        priority: 'high',
        title: 'Improve Resolution Rate',
        description: `Current resolution rate is ${resolutionRate.toFixed(1)}%. Add training data for common unresolved issues.`,
        action: 'Focus on training for top unresolved categories'
      });
    }

    if (unresolvedCategories.length > 0) {
      recommendations.push({
        type: 'training',
        priority: 'medium',
        title: 'Add Training for Common Issues',
        description: `Top unresolved categories: ${unresolvedCategories.map((cat: any) => cat._id).slice(0, 3).join(', ')}`,
        action: 'Create training data for these categories'
      });
    }

    if (metrics.totalTickets < 10) {
      recommendations.push({
        type: 'data',
        priority: 'low',
        title: 'Insufficient Data',
        description: 'You need more interaction data to get better insights. Promote your agent to get more conversations.',
        action: 'Increase agent visibility and usage'
      });
    }

    res.json({
      success: true,
      data: {
        metrics: {
          ...metrics,
          resolutionRate: Math.round(resolutionRate * 100) / 100
        },
        recommendations,
        insights: {
          unresolvedCategories,
          lowSatisfactionCount: lowSatisfactionTickets.length,
          trainingDataCount: ((agent as any).trainingData || []).length
        }
      }
    });
  } catch (error) {
    console.error('Get optimization recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
