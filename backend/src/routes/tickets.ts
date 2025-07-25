import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addMessage,
  getTicketAnalytics
} from '../controllers/ticketController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Analytics route (must be before /:id routes)
router.get('/analytics', protect, getTicketAnalytics);

// Ticket CRUD routes
router.route('/')
  .get(protect, getTickets)
  .post(createTicket); // Public for widget, but auth is optional

router.route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, deleteTicket);

// Ticket messages
router.post('/:id/messages', protect, addMessage);

export default router;
