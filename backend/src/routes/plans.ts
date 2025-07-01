import express from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/plans - Get all training plans
router.get('/', authenticate, async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            courses: true,
            assignments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logger.info(`📋 Retrieved ${plans.length} training plans`);

    res.json({
      success: true,
      data: plans,
      total: plans.length
    });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training plans'
    });
  }
});

// GET /api/plans/:id - Get plan by ID with courses
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            _count: {
              select: {
                rounds: true
              }
            }
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                department: true
              }
            }
          }
        },
        _count: {
          select: {
            courses: true,
            assignments: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Training plan not found'
      });
    }

    logger.info(`📖 Retrieved plan details for ${plan.name}`);

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    logger.error('Error fetching plan details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan details'
    });
  }
});

export default router; 