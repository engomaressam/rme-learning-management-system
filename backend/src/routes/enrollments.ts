import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const createEnrollmentSchema = z.object({
  userId: z.string().uuid(),
  roundId: z.string().uuid(),
});

// Create enrollment and send notification email
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createEnrollmentSchema.parse(req.body);
    
    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: validatedData.userId,
        roundId: validatedData.roundId,
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'User is already enrolled in this course round',
      });
    }

    // Get user and round details for email and notification
    const [user, round] = await Promise.all([
      prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }),
      prisma.round.findUnique({
        where: { id: validatedData.roundId },
        include: {
          course: {
            include: {
              plan: true
            }
          }
        }
      })
    ]);

    if (!user || !round) {
      return res.status(404).json({
        success: false,
        message: 'User or course round not found',
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: validatedData.userId,
        roundId: validatedData.roundId,
        status: 'ENROLLED',
        enrolledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        round: {
          include: {
            course: {
              include: {
                plan: true
              }
            }
          }
        },
      },
    });

    // Send email notification to user
    try {
      await emailService.sendCourseEnrollmentEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        round.course.name,
        round.name,
        round.startDate
      );
      logger.info(`Enrollment email sent to ${user.email} for course: ${round.course.name}`);
    } catch (emailError) {
      logger.error('Failed to send enrollment email:', emailError);
    }

    // Create in-site notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ENROLLED',
        channel: 'IN_APP',
        title: 'Course Enrollment Confirmed',
        message: `You have been successfully enrolled in "${round.course.name}" - ${round.name}`,
        data: {
          courseId: round.course.id,
          courseName: round.course.name,
          roundId: round.id,
          roundName: round.name,
          enrollmentId: enrollment.id
        }
      }
    });

    // Create notification for admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMINISTRATOR' },
      select: { id: true }
    });

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'ENROLLED',
          channel: 'IN_APP',
          title: 'New Course Enrollment',
          message: `${user.firstName} ${user.lastName} enrolled in "${round.course.name}" - ${round.name}`,
          data: {
            enrolledUserId: user.id,
            enrolledUserName: `${user.firstName} ${user.lastName}`,
            courseId: round.course.id,
            courseName: round.course.name,
            roundId: round.id,
            roundName: round.name,
            enrollmentId: enrollment.id
          }
        }
      });
    }

    logger.info(`User ${user.email} enrolled in course round: ${round.course.name} - ${round.name}`);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully, notifications sent',
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
        round: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
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
        round: {
          include: {
            course: {
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
        round: true,
      },
    });

    // Send completion email if status is COMPLETED
    if (status === 'COMPLETED') {
      emailService.sendTrainingAssignmentEmail(
        enrollment.user.email,
        enrollment.user.firstName + ' ' + enrollment.user.lastName,
        `Congratulations! You have completed: ${enrollment.round.course.name} - ${enrollment.round.name}`
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
    const { userIds, roundId, assignedBy, dueDate } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds must be a non-empty array',
      });
    }

    // Get round details for email
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        course: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Course round not found',
      });
    }

    // Create enrollments
    const enrollmentData = userIds.map(userId => ({
      userId,
      roundId,
      assignedBy,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'ENROLLED' as const,
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
      emailService.sendCourseEnrollmentEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        round.course.name,
        round.name,
        round.startDate
      ).catch(error => {
        logger.error(`Failed to send email to ${user.email}:`, error);
      })
    );

    // Send all emails in parallel (don't wait for completion)
    Promise.all(emailPromises);

    logger.info(`Bulk enrolled ${enrollments.count} users in course round: ${round.course.name} - ${round.name}`);

    res.status(201).json({
      success: true,
      data: {
        enrolledCount: enrollments.count,
        courseName: round.course.name,
        roundName: round.name,
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

// Simple self-enrollment endpoint for testing
router.post('/self-enroll', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { roundId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        roundId,
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course round',
      });
    }

    // Get user and round details
    const [user, round] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }),
      prisma.round.findUnique({
        where: { id: roundId },
        include: {
          course: {
            include: {
              plan: true
            }
          }
        }
      })
    ]);

    if (!user || !round) {
      return res.status(404).json({
        success: false,
        message: 'User or course round not found',
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        roundId,
        status: 'ENROLLED',
        enrolledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        round: {
          include: {
            course: {
              include: {
                plan: true
              }
            }
          }
        },
      },
    });

    // Send email notification to user
    try {
      await emailService.sendCourseEnrollmentEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        round.course.name,
        round.name,
        round.startDate
      );
      logger.info(`Enrollment email sent to ${user.email} for course: ${round.course.name}`);
    } catch (emailError) {
      logger.error('Failed to send enrollment email:', emailError);
    }

    // Create in-site notification for user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ENROLLED',
        channel: 'IN_APP',
        title: 'Course Enrollment Confirmed',
        message: `You have successfully enrolled in "${round.course.name}" - ${round.name}`,
        data: {
          courseId: round.course.id,
          courseName: round.course.name,
          roundId: round.id,
          roundName: round.name,
          enrollmentId: enrollment.id
        }
      }
    });

    // Create notification for admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMINISTRATOR' },
      select: { id: true }
    });

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'ENROLLED',
          channel: 'IN_APP',
          title: 'New Course Enrollment',
          message: `${user.firstName} ${user.lastName} enrolled in "${round.course.name}" - ${round.name}`,
          data: {
            enrolledUserId: user.id,
            enrolledUserName: `${user.firstName} ${user.lastName}`,
            courseId: round.course.id,
            courseName: round.course.name,
            roundId: round.id,
            roundName: round.name,
            enrollmentId: enrollment.id
          }
        }
      });
    }

    logger.info(`User ${user.email} self-enrolled in course round: ${round.course.name} - ${round.name}`);

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course, notifications sent',
    });
  } catch (error) {
    logger.error('Failed to self-enroll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
    });
  }
});

// Get all available courses and rounds for enrollment

export default router; 