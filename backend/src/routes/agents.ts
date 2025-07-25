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
import {
  getAgentOptimization,
  updateAgentOptimization,
  uploadTrainingData,
  getTrainingData,
  getOptimizationRecommendations
} from '../controllers/optimizationController';
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

// Optimization routes
router.get('/:id/optimization', getAgentOptimization);
router.put('/:id/optimization', updateAgentOptimization);
router.post('/:id/training-data', uploadTrainingData);
router.get('/:id/training-data', getTrainingData);
router.get('/:id/recommendations', getOptimizationRecommendations);

export default router;
