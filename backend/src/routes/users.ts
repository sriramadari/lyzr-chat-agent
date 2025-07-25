import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserAnalytics
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Analytics route (must be before /:id routes)
router.get('/analytics', getUserAnalytics);

// User CRUD routes
router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
