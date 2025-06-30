import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/users - Get all users (Admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Users route placeholder - implementation pending'
  });
});

export default router; 