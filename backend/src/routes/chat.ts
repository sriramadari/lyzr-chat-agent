import express from 'express';
import { sendMessage, testAgent } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public route for widget chat
router.post('/message', sendMessage);

// Protected route for testing agent
router.post('/test/:agentId', protect, testAgent);

export default router;