import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  agentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  sessionId?: string;
  messages: Array<{
    content: string;
    sender: 'user' | 'agent' | 'system';
    timestamp: Date;
    metadata?: any;
  }>;
  resolution?: {
    summary: string;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
  };
  tags: string[];
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    metadata?: any;
  };
  analytics: {
    responseTime?: number; // in minutes
    resolutionTime?: number; // in minutes
    satisfaction?: number; // 1-5 rating
    interactions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    trim: true
  },
  messages: [{
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    sender: {
      type: String,
      enum: ['user', 'agent', 'system'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: Schema.Types.Mixed
  }],
  resolution: {
    summary: {
      type: String,
      maxlength: [1000, 'Resolution summary cannot exceed 1000 characters']
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  customerInfo: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters']
    },
    metadata: Schema.Types.Mixed
  },
  analytics: {
    responseTime: {
      type: Number,
      min: [0, 'Response time cannot be negative']
    },
    resolutionTime: {
      type: Number,
      min: [0, 'Resolution time cannot be negative']
    },
    satisfaction: {
      type: Number,
      min: [1, 'Satisfaction rating must be between 1 and 5'],
      max: [5, 'Satisfaction rating must be between 1 and 5']
    },
    interactions: {
      type: Number,
      default: 0,
      min: [0, 'Interactions cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
ticketSchema.index({ agentId: 1, status: 1 });
ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ sessionId: 1 });

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

export default mongoose.model<ITicket>('Ticket', ticketSchema);
