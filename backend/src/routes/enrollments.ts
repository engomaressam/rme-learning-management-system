import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createEnrollmentSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  assignedBy: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

// Create enrollment and send notification email
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createEnrollmentSchema.parse(req.body);
    
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: validatedData.userId,
        planId: validatedData.planId,
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'User is already enrolled in this training plan',
      });
    }

    // Get user and plan details for email
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({
        where: { id: validatedData.userId }
      }),
      prisma.trainingPlan.findUnique({
        where: { id: validatedData.planId }
      })
    ]);

    if (!user || !plan) {
      return res.status(404).json({
        success: false,
        message: 'User or training plan not found',
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: validatedData.userId,
        planId: validatedData.planId,
        assignedBy: validatedData.assignedBy,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        status: 'ASSIGNED',
        enrolledAt: new Date(),
      },
      include: {
        user: true,
        plan: true,
        assignedByUser: true,
      },
    });

    // Send email notification in background
    const dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : undefined;
    emailService.sendTrainingAssignmentEmail(
      user.email,
      user.firstName + ' ' + user.lastName,
      plan.title,
      dueDate
    ).catch(error => {
      logger.error('Failed to send training assignment email:', error);
    });

    logger.info(`User ${user.email} enrolled in training plan: ${plan.title}`);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully and notification email sent',
    });
  } catch (error) {
    logger.error('Failed to create enrollment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
    });
  }
});

// Get all enrollments
router.get('/', authenticate, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    logger.error('Failed to get enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollments',
    });
  }
});

// Get enrollments by user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
      },
      include: {
        plan: {
          include: {
            courses: {
              include: {
                rounds: {
                  include: {
                    sessions: true,
                  },
                },
              },
            },
          },
        },
        progress: true,
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    logger.error('Failed to get user enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user enrollments',
    });
  }
});

// Update enrollment status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completedAt } = req.body;

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      },
      include: {
        user: true,
        plan: true,
      },
    });

    // Send completion email if status is COMPLETED
    if (status === 'COMPLETED') {
      emailService.sendTrainingAssignmentEmail(
        enrollment.user.email,
        enrollment.user.firstName + ' ' + enrollment.user.lastName,
        `Congratulations! You have completed: ${enrollment.plan.title}`
      ).catch(error => {
        logger.error('Failed to send completion email:', error);
      });
    }

    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
    });
  }
});

// Delete enrollment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.enrollment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Enrollment deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
    });
  }
});

// Bulk enroll users in a training plan
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { userIds, planId, assignedBy, dueDate } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds must be a non-empty array',
      });
    }

    // Get plan details for email
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Training plan not found',
      });
    }

    // Create enrollments
    const enrollmentData = userIds.map(userId => ({
      userId,
      planId,
      assignedBy,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'ASSIGNED' as const,
      enrolledAt: new Date(),
    }));

    const enrollments = await prisma.enrollment.createMany({
      data: enrollmentData,
      skipDuplicates: true,
    });

    // Send email notifications to all enrolled users
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    });

    const emailPromises = users.map(user => 
      emailService.sendTrainingAssignmentEmail(
        user.email,
        user.firstName + ' ' + user.lastName,
        plan.title,
        dueDate ? new Date(dueDate) : undefined
      ).catch(error => {
        logger.error(`Failed to send email to ${user.email}:`, error);
      })
    );

    // Send all emails in parallel (don't wait for completion)
    Promise.all(emailPromises);

    logger.info(`Bulk enrolled ${enrollments.count} users in training plan: ${plan.title}`);

    res.status(201).json({
      success: true,
      data: {
        enrolledCount: enrollments.count,
        planTitle: plan.title,
      },
      message: `Successfully enrolled ${enrollments.count} users and sent notification emails`,
    });
  } catch (error) {
    logger.error('Failed to bulk enroll users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk enroll users',
    });
  }
});

export default router; 