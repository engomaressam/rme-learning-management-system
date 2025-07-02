import { Router } from 'express';
import { emailService } from '../services/emailService';
import { azureUserService } from '../services/azureUserService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Test Azure Graph API connection
router.get('/test-connection', authenticate, async (req, res) => {
  try {
    logger.info('Testing Azure Graph API connection...');
    
    // Try to get current user (this will test the authentication)
    const testUser = await azureUserService.getUserByEmail('test@example.com');
    
    res.json({
      success: true,
      message: 'Azure Graph API connection successful',
      timestamp: new Date().toISOString(),
      testResult: testUser ? 'User found' : 'Connection working (test user not found)'
    });
  } catch (error) {
    logger.error('Azure connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Azure Graph API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send test email
router.post('/test-email', authenticate, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    const emailOptions = {
      to,
      subject: `[TEST] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">RME LMS - Test Email</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is a test email sent from RME Learning Management System.<br>
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    const success = await emailService.sendEmail(emailOptions);
    
    if (success) {
      logger.info(`Test email sent successfully to: ${to}`);
      res.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        provider: process.env.EMAIL_PROVIDER || 'smtp'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    logger.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Azure user by email
router.get('/users/:email', authenticate, async (req, res) => {
  try {
    const { email } = req.params;
    const azureUser = await azureUserService.getUserByEmail(email);
    
    if (azureUser) {
      res.json({
        success: true,
        user: azureUser
      });
    } else {
      res.status(404).json({
        success: false,
        message: `User not found in Azure AD: ${email}`
      });
    }
  } catch (error) {
    logger.error(`Failed to get Azure user ${req.params.email}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Azure user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync all Azure users
router.post('/sync-users', authenticate, async (req, res) => {
  try {
    logger.info('Starting Azure users sync...');
    const azureUsers = await azureUserService.getAllUsers();
    
    logger.info(`Found ${azureUsers.length} users in Azure AD`);
    
    res.json({
      success: true,
      message: `Successfully retrieved ${azureUsers.length} users from Azure AD`,
      count: azureUsers.length,
      users: azureUsers.slice(0, 10) // Return first 10 users as sample
    });
  } catch (error) {
    logger.error('Azure users sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Azure users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send calendar invite
router.post('/calendar-invite', authenticate, async (req, res) => {
  try {
    const { userEmail, subject, startDate, endDate, location, description } = req.body;
    
    if (!userEmail || !subject || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userEmail, subject, startDate, endDate'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const success = await azureUserService.sendCalendarInvite(
      userEmail,
      subject,
      start,
      end,
      location,
      description
    );
    
    if (success) {
      res.json({
        success: true,
        message: `Calendar invite sent successfully to ${userEmail}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send calendar invite'
      });
    }
  } catch (error) {
    logger.error('Calendar invite failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send calendar invite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Azure configuration status
router.get('/config', authenticate, async (req, res) => {
  const config = {
    emailProvider: process.env.EMAIL_PROVIDER || 'smtp',
    azureConfigured: !!(
      process.env.AZURE_CLIENT_ID && 
      process.env.AZURE_CLIENT_SECRET && 
      process.env.AZURE_TENANT_ID
    ),
    clientId: process.env.AZURE_CLIENT_ID ? 'configured' : 'missing',
    tenantId: process.env.AZURE_TENANT_ID ? 'configured' : 'missing',
    clientSecret: process.env.AZURE_CLIENT_SECRET ? 'configured' : 'missing'
  };

  res.json({
    success: true,
    config
  });
});

export default router; 