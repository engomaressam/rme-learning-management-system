import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginSchema, RegisterSchema } from '@rme-lms/shared';
import { config } from '../config';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        department: true,
        grade: true,
        role: true,
        isActive: true,
        mustChangePassword: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        success: false,
        mustChangePassword: true,
        message: 'You must change your password before logging in.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Register (Admin only)
router.post('/register', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create users'
      });
    }

    const validation = RegisterSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors
      });
    }

    const { email, password, firstName, lastName, employeeId, department, grade, role } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { employeeId }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    // Use hardcoded default password and set mustChangePassword to true
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        department,
        grade,
        role,
        mustChangePassword: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        department: true,
        grade: true,
        role: true,
        isActive: true,
        createdAt: true,
        mustChangePassword: true
      }
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      'password123'
    );

    res.status(201).json({
      success: true,
      data: { user },
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        department: true,
        grade: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Change password (for users who must change password)
router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Check if this is a forced password change (no auth token) or authenticated change
    const isAuthenticatedRequest = req.headers.authorization;
    
    if (isAuthenticatedRequest) {
      // Handle authenticated password change (existing logic)
      const token = req.headers.authorization?.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        const userId = decoded.userId;

        if (!userId || !oldPassword || !newPassword) {
          return res.status(400).json({
            success: false,
            message: 'Missing required fields.'
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { password: true, mustChangePassword: true }
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found.'
          });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Old password is incorrect.'
          });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword, mustChangePassword: false }
        });

        // Get user details for email notification
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true, lastName: true }
        });

        if (updatedUser) {
          await emailService.sendPasswordChangeNotificationEmail(
            updatedUser.email,
            `${updatedUser.firstName} ${updatedUser.lastName}`
          );
        }

        res.json({
          success: true,
          message: 'Password changed successfully.'
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }
    } else {
      // Handle forced password change (no auth token required)
      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, old password, and new password are required.'
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { password: true, mustChangePassword: true }
      });

      if (!user || !user.mustChangePassword) {
        return res.status(403).json({
          success: false,
          message: 'Password change not required or user not found.'
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Old password is incorrect.'
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedNewPassword, mustChangePassword: false }
      });

      // Get user details for email notification
      const updatedUser = await prisma.user.findUnique({
        where: { email },
        select: { firstName: true, lastName: true }
      });

      if (updatedUser) {
        await emailService.sendPasswordChangeNotificationEmail(
          email,
          `${updatedUser.firstName} ${updatedUser.lastName}`
        );
      }

      res.json({
        success: true,
        message: 'Password changed successfully. You can now log in with your new password.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password.'
    });
  }
});

// Test email endpoint for debugging
router.post('/test-email', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Test sending a course enrollment email
    const success = await emailService.sendCourseEnrollmentEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      'Test Course - Email Service Check',
      'Test Round - Debugging',
      new Date()
    );

    if (success) {
      logger.info(`Test email sent successfully to ${user.email}`);
      res.json({
        success: true,
        message: `Test enrollment email sent to ${user.email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    logger.error('Test email endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed'
    });
  }
});

export default router; 