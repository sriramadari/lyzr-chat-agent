import mongoose, { Document, Schema } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
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
    pageViews: number;
    lastUsed?: Date;
    lastSeen?: Date;
  };
  optimization?: {
    enableAutoLearning?: boolean;
    confidenceThreshold?: number;
    responseTimeTarget?: number;
    categories?: string[];
    keywords?: string[];
    fallbackMessage?: string;
  };
  trainingData?: Array<{
    question: string;
    answer: string;
    category?: string;
    tags?: string[];
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }>;
  lastTrainingUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [100, 'Agent name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lyzrConfig: {
    agentId: {
      type: String,
      required: [true, 'Lyzr Agent ID is required'],
      unique: true
    },
    apiEndpoint: {
      type: String,
      required: [true, 'API endpoint is required']
    },
    apiKey: {
      type: String,
      required: [true, 'API key is required']
    }
  },
  widget: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#3b82f6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      default: 'bottom-right'
    },
    welcomeMessage: {
      type: String,
      default: 'Hi! How can I help you today?',
      maxlength: [200, 'Welcome message cannot exceed 200 characters']
    },
    placeholder: {
      type: String,
      default: 'Type your message...',
      maxlength: [100, 'Placeholder cannot exceed 100 characters']
    },
    title: {
      type: String,
      default: 'Chat Support',
      maxlength: [50, 'Title cannot exceed 50 characters']
    }
  },
  domains: [{
    type: String,
    match: [/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Please provide valid domain names']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  analytics: {
    totalChats: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    pageViews: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    lastSeen: {
      type: Date
    }
  },
  optimization: {
    enableAutoLearning: {
      type: Boolean,
      default: false
    },
    confidenceThreshold: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    responseTimeTarget: {
      type: Number,
      min: 1,
      default: 30
    },
    categories: [{
      type: String,
      maxlength: 100
    }],
    keywords: [{
      type: String,
      maxlength: 50
    }],
    fallbackMessage: {
      type: String,
      maxlength: 200,
      default: 'I\'m not sure about that. Let me connect you with a human agent.'
    }
  },
  trainingData: [{
    question: {
      type: String,
      required: true,
      maxlength: 500
    },
    answer: {
      type: String,
      required: true,
      maxlength: 2000
    },
    category: {
      type: String,
      maxlength: 100
    },
    tags: [{
      type: String,
      maxlength: 50
    }],
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  lastTrainingUpdate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better performance
agentSchema.index({ owner: 1, isActive: 1 });
agentSchema.index({ 'lyzrConfig.agentId': 1 });

export default mongoose.model<IAgent>('Agent', agentSchema);
