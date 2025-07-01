import express from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/courses - Get all courses
router.get('/', authenticate, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        plan: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            rounds: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logger.info(`📚 Retrieved ${courses.length} courses`);

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// GET /api/courses/:id - Get course by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        plan: true,
        rounds: {
          include: {
            trainer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            provider: true,
            sessions: true,
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        },
        _count: {
          select: {
            rounds: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info(`📖 Retrieved course details for ${course.name}`);

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details'
    });
  }
});

// GET /api/courses/plan/:planId - Get courses by plan ID
router.get('/plan/:planId', authenticate, async (req, res) => {
  try {
    const { planId } = req.params;

    const courses = await prisma.course.findMany({
      where: { planId },
      include: {
        plan: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            rounds: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logger.info(`📚 Retrieved ${courses.length} courses for plan ${planId}`);

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    logger.error('Error fetching courses by plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses for plan'
    });
  }
});

export default router; 