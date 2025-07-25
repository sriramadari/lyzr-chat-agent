import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Agent from '../models/Agent';

// @desc    Serve widget JavaScript file
// @route   GET /api/widget/:agentId/widget.js
// @access  Public
export const serveWidget = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    console.log(`🔍 Widget request for agent: ${agentId}`);
    
    // Get the backend URL from environment or construct from request
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    
    // Set CORS headers first for widget serving
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache'); // Changed to no-cache for dynamic injection
    
    // Verify agent exists and is active
    console.log(`📡 Looking up agent in database...`);
    const agent = await Agent.findById(agentId);
    console.log(`📊 Agent found:`, agent ? 'YES' : 'NO');
    
    if (!agent) {
      console.log(`❌ Agent not found: ${agentId}`);
      return res.status(404).send(`
        console.error('Lyzr Widget: Agent not found');
        // Widget failed to load - agent not found
      `);
    }
    
    console.log(`✅ Agent found: ${agent.name}, Active: ${agent.isActive}`);
    
    if (!agent.isActive) {
      console.log(`❌ Agent inactive: ${agentId}`);
      return res.status(403).send(`
        console.error('Lyzr Widget: Agent is not active');
        // Widget failed to load - agent inactive
      `);
    }

    // Check domain restrictions if configured
    const origin = req.headers.origin || req.headers.referer;
    if (agent.domains && agent.domains.length > 0 && origin) {
      const isAllowedDomain = agent.domains.some(domain => {
        // Simple domain matching - could be enhanced with regex
        return origin.includes(domain) || domain === '*';
      });
      
      if (!isAllowedDomain) {
        console.log(`❌ Domain not allowed: ${origin} for agent ${agentId}`);
        return res.status(403).send(`
          console.error('Lyzr Widget: Domain not allowed');
          // Widget failed to load - domain restriction
        `);
      }
    }
    
    console.log(`🔧 Generating widget configuration...`);
    // Generate widget configuration
    const agentConfig = {
      agentId: agent._id,
      apiUrl: `${backendUrl}/api`, // Use injected backend URL
      title: agent.widget?.title || 'Support Chat',
      subtitle: 'We\'re here to help',
      welcomeMessage: agent.widget?.welcomeMessage || 'Hello! How can I help you today?',
      placeholder: agent.widget?.placeholder || 'Type your message...',
      theme: agent.widget?.theme || 'light',
      primaryColor: agent.widget?.primaryColor || '#3b82f6',
      position: agent.widget?.position || 'bottom-right'
    };
    
    console.log(`📁 Looking for widget file...`);
    // Read the widget file from src directory (not dist)
    const widgetPath = path.join(__dirname, '../../../widget/src/widget.js');
    console.log(`📂 Widget path: ${widgetPath}`);
    
    if (!fs.existsSync(widgetPath)) {
      console.log(`❌ Widget file not found at: ${widgetPath}`);
      return res.status(500).send(`
        console.error('Lyzr Widget: Widget file not found. Please check widget path.');
        // Widget failed to load - file not found
      `);
    }
    
    console.log(`📖 Reading widget file...`);
    let widgetCode = fs.readFileSync(widgetPath, 'utf8');
    
    // Inject backend URL at the top of the script
    const backendUrlInjection = `
// Injected Backend URL and Configuration
window.LYZR_BACKEND_URL = '${backendUrl}';
window.LyzrWidgetConfig = ${JSON.stringify(agentConfig)};
`;
    
    // Prepend the injection to the widget code
    widgetCode = backendUrlInjection + widgetCode;
    
    console.log(`📈 Updating analytics...`);
    // Update analytics
    await Agent.findByIdAndUpdate(agentId, {
      $inc: { 'analytics.pageViews': 1 }
    });
    
    console.log(`✅ Sending widget code (${widgetCode.length} characters)`);
    res.send(widgetCode);
    
  } catch (error) {
    console.error('❌ Serve widget error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(500).send(`
      console.error('Lyzr Widget: Server error - ${error instanceof Error ? error.message : 'Unknown error'}');
      // Widget failed to load - server error
    `);
  }
};

// @desc    Get widget configuration
// @route   GET /api/widget/:agentId/config
// @access  Public
export const getWidgetConfig = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const agent = await Agent.findById(agentId).select('widget isActive name');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    if (!agent.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Agent is not active'
      });
    }
    
    const config = {
      agentId: agent._id,
      title: agent.widget?.title || agent.name,
      welcomeMessage: agent.widget?.welcomeMessage || 'Hello! How can I help you today?',
      placeholder: agent.widget?.placeholder || 'Type your message...',
      theme: agent.widget?.theme || 'light',
      primaryColor: agent.widget?.primaryColor || '#3b82f6',
      position: agent.widget?.position || 'bottom-right'
    };
    
    res.json({
      success: true,
      data: { config }
    });
    
  } catch (error) {
    console.error('Get widget config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Widget analytics - track page views
// @route   POST /api/widget/:agentId/analytics/view
// @access  Public
export const trackPageView = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { url, referrer } = req.body;
    
    // Update agent analytics (basic implementation)
    await Agent.findByIdAndUpdate(agentId, {
      $inc: {
        'analytics.pageViews': 1
      },
      $set: {
        'analytics.lastSeen': new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Page view tracked'
    });
    
  } catch (error) {
    console.error('Track page view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Widget analytics - track chat interactions
// @route   POST /api/widget/:agentId/analytics/interaction
// @access  Public
export const trackInteraction = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { type, sessionId } = req.body; // type: 'chat_opened', 'message_sent', etc.
    
    // Update agent analytics
    const updateQuery: any = {
      $set: {
        'analytics.lastUsed': new Date()
      }
    };
    
    if (type === 'chat_opened') {
      updateQuery.$inc = { 'analytics.totalChats': 1 };
    } else if (type === 'message_sent') {
      updateQuery.$inc = { 'analytics.totalMessages': 1 };
    }
    
    await Agent.findByIdAndUpdate(agentId, updateQuery);
    
    res.json({
      success: true,
      message: 'Interaction tracked'
    });
    
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate embed code for agent
// @route   GET /api/widget/:agentId/embed-code
// @access  Public
export const getEmbedCode = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    const baseUrl = process.env.WIDGET_BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    const embedCode = `<!-- Lyzr Support Widget -->
<script 
  src="${baseUrl}/api/widget/${agentId}/widget.js"
  data-agent-id="${agentId}"
  data-title="${agent.widget?.title || agent.name}"
  data-welcome-message="${agent.widget?.welcomeMessage || 'Hello! How can I help you today?'}"
  data-theme="${agent.widget?.theme || 'light'}"
  data-primary-color="${agent.widget?.primaryColor || '#3b82f6'}"
  data-position="${agent.widget?.position || 'bottom-right'}"
></script>`;
    
    res.json({
      success: true,
      data: { 
        embedCode,
        agentId,
        widgetUrl: `${baseUrl}/api/widget/${agentId}/widget.js`
      }
    });
    
  } catch (error) {
    console.error('Get embed code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Handle OPTIONS requests for CORS preflight
// @route   OPTIONS /api/widget/:agentId/widget.js
// @access  Public
export const handleWidgetOptions = (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '3600');
  res.status(200).end();
};
