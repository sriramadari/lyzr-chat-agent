import express from 'express';
import {
  createAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  toggleAgent,
  getWidgetCode
} from '../controllers/agentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getAgents)
  .post(createAgent);

router.route('/:id')
  .get(getAgent)
  .put(updateAgent)
  .delete(deleteAgent);

router.patch('/:id/toggle', toggleAgent);
router.get('/:id/widget', getWidgetCode);

export default router;
