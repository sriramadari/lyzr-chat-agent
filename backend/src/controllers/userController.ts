import { Response } from 'express';
import User from '../models/User';
import Agent from '../models/Agent';
import Ticket from '../models/Ticket';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  subscription: z.object({
    plan: z.enum(['free', 'pro', 'enterprise']).optional(),
    status: z.enum(['active', 'inactive']).optional()
  }).optional()
});

// @desc    Get all users (admin only) or users who interacted with user's agents
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let filter: any = {};

    // If not admin, only show users who created tickets for user's agents
    if (req.user!.role !== 'admin') {
      const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
      const agentIds = userAgents.map(agent => agent._id);
      
      const ticketUsers = await Ticket.distinct('userId', { 
        agentId: { $in: agentIds },
        userId: { $exists: true }
      });
      
      filter._id = { $in: ticketUsers };
    }

    // Apply additional filters
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter['subscription.status'] = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    // Get additional stats for each user if they interacted with user's agents
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let userAgents = [];
        if (req.user!.role !== 'admin') {
          userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
        }
        const agentIds = userAgents.map(agent => agent._id);

        const ticketStats = await Ticket.aggregate([
          { 
            $match: { 
              userId: user._id,
              ...(req.user!.role !== 'admin' ? { agentId: { $in: agentIds } } : {})
            }
          },
          {
            $group: {
              _id: null,
              totalTickets: { $sum: 1 },
              openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
              resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
              lastActivity: { $max: '$updatedAt' }
            }
          }
        ]);

        return {
          ...user.toObject(),
          stats: ticketStats[0] || {
            totalTickets: 0,
            openTickets: 0,
            resolvedTickets: 0,
            lastActivity: null
          }
        };
      })
    );

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: { users: usersWithStats }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's interaction history with current user's agents
    let userAgents = [];
    if (req.user!.role !== 'admin') {
      userAgents = await Agent.find({ owner: req.user!._id }).select('_id name');
    } else {
      userAgents = await Agent.find({}).select('_id name owner');
    }
    const agentIds = userAgents.map(agent => agent._id);

    const tickets = await Ticket.find({
      userId: user._id,
      ...(req.user!.role !== 'admin' ? { agentId: { $in: agentIds } } : {})
    })
      .populate('agentId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = await Ticket.aggregate([
      { 
        $match: { 
          userId: user._id,
          ...(req.user!.role !== 'admin' ? { agentId: { $in: agentIds } } : {})
        }
      },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgressTickets: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closedTickets: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgSatisfaction: { $avg: '$analytics.satisfaction' },
          totalInteractions: { $sum: '$analytics.interactions' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user: user.toObject(),
        tickets,
        stats: stats[0] || {
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
          avgSatisfaction: 0,
          totalInteractions: 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user (admin only or own profile)
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    // Check permissions
    if (req.user!.role !== 'admin' && (req.user as any)._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const validatedData = updateUserSchema.parse(req.body);

    // Non-admin users can only update their own name and email
    if (req.user!.role !== 'admin') {
      const allowedFields = ['name', 'email'];
      const filteredData = Object.keys(validatedData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = (validatedData as any)[key];
          return obj;
        }, {});
      
      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        filteredData,
        { new: true, runValidators: true }
      ).select('-password');

      return res.json({
        success: true,
        data: { user }
      });
    }

    // Admin can update any field
    const user = await User.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/users/analytics
// @access  Private
export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Base filter for user's agents (if not admin)
    let agentFilter = {};
    if (req.user!.role !== 'admin') {
      const userAgents = await Agent.find({ owner: req.user!._id }).select('_id');
      const agentIds = userAgents.map(agent => agent._id);
      agentFilter = { agentId: { $in: agentIds } };
    }

    // Total users analytics
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ 'subscription.status': 'active' });

    // Users with tickets for current user's agents
    const usersWithTickets = await Ticket.distinct('userId', {
      ...agentFilter,
      userId: { $exists: true }
    });

    // User engagement analytics
    const engagementStats = await Ticket.aggregate([
      { $match: { ...agentFilter, userId: { $exists: true } } },
      {
        $group: {
          _id: '$userId',
          totalTickets: { $sum: 1 },
          lastActivity: { $max: '$updatedAt' },
          avgSatisfaction: { $avg: '$analytics.satisfaction' },
          totalInteractions: { $sum: '$analytics.interactions' }
        }
      },
      {
        $group: {
          _id: null,
          totalEngagedUsers: { $sum: 1 },
          avgTicketsPerUser: { $avg: '$totalTickets' },
          avgSatisfaction: { $avg: '$avgSatisfaction' },
          avgInteractionsPerUser: { $avg: '$totalInteractions' }
        }
      }
    ]);

    // Subscription analytics (admin only)
    let subscriptionStats = null;
    if (req.user!.role === 'admin') {
      subscriptionStats = await User.aggregate([
        {
          $group: {
            _id: '$subscription.plan',
            count: { $sum: 1 }
          }
        }
      ]);
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: req.user!.role === 'admin' ? totalUsers : usersWithTickets.length,
          activeUsers: req.user!.role === 'admin' ? activeUsers : usersWithTickets.length,
          engagedUsers: engagementStats[0]?.totalEngagedUsers || 0,
          avgTicketsPerUser: engagementStats[0]?.avgTicketsPerUser || 0,
          avgSatisfaction: engagementStats[0]?.avgSatisfaction || 0,
          avgInteractionsPerUser: engagementStats[0]?.avgInteractionsPerUser || 0
        },
        subscriptions: subscriptionStats
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
