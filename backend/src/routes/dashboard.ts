import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Dashboard route placeholder' });
});

export default router; 