import express from 'express';
import {
  serveWidget,
  handleWidgetOptions,
  getWidgetConfig,
  trackPageView,
  trackInteraction,
  getEmbedCode
} from '../controllers/widgetController';

const router = express.Router();

// Handle CORS preflight requests
router.options('/:agentId/widget.js', handleWidgetOptions);

// Serve widget JavaScript file
router.get('/:agentId/widget.js', serveWidget);

// Get widget configuration
router.get('/:agentId/config', getWidgetConfig);

// Get embed code
router.get('/:agentId/embed-code', getEmbedCode);

// Analytics endpoints
router.post('/:agentId/analytics/view', trackPageView);
router.post('/:agentId/analytics/interaction', trackInteraction);

export default router;
