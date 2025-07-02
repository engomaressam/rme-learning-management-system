import { graphClient } from '../config/azure';
import { logger } from '../utils/logger';

export interface AzureUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  manager?: {
    id: string;
    displayName: string;
    mail: string;
  };
}

class AzureUserService {
  async getUserByEmail(email: string): Promise<AzureUser | null> {
    try {
      const user = await graphClient
        .api('/users')
        .filter(`mail eq '${email}' or userPrincipalName eq '${email}'`)
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .expand('manager($select=id,displayName,mail)')
        .get();

      if (user.value && user.value.length > 0) {
        return this.mapAzureUser(user.value[0]);
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get Azure user by email ${email}:`, error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<AzureUser | null> {
    try {
      const user = await graphClient
        .api(`/users/${userId}`)
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .expand('manager($select=id,displayName,mail)')
        .get();

      return this.mapAzureUser(user);
    } catch (error) {
      logger.error(`Failed to get Azure user by ID ${userId}:`, error);
      return null;
    }
  }

  async getAllUsers(): Promise<AzureUser[]> {
    try {
      const users = await graphClient
        .api('/users')
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .expand('manager($select=id,displayName,mail)')
        .top(999)
        .get();

      return users.value.map((user: any) => this.mapAzureUser(user));
    } catch (error) {
      logger.error('Failed to get all Azure users:', error);
      return [];
    }
  }

  async getUsersByDepartment(department: string): Promise<AzureUser[]> {
    try {
      const users = await graphClient
        .api('/users')
        .filter(`department eq '${department}'`)
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .expand('manager($select=id,displayName,mail)')
        .get();

      return users.value.map((user: any) => this.mapAzureUser(user));
    } catch (error) {
      logger.error(`Failed to get Azure users by department ${department}:`, error);
      return [];
    }
  }

  async syncUserWithAzure(email: string): Promise<AzureUser | null> {
    try {
      const azureUser = await this.getUserByEmail(email);
      if (azureUser) {
        logger.info(`Successfully synced user ${email} with Azure AD`);
        return azureUser;
      }
      return null;
    } catch (error) {
      logger.error(`Failed to sync user ${email} with Azure:`, error);
      return null;
    }
  }

  private mapAzureUser(user: any): AzureUser {
    return {
      id: user.id,
      displayName: user.displayName || '',
      mail: user.mail || user.userPrincipalName,
      userPrincipalName: user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
      manager: user.manager ? {
        id: user.manager.id,
        displayName: user.manager.displayName,
        mail: user.manager.mail || user.manager.userPrincipalName
      } : undefined
    };
  }

  // Send calendar invites for training sessions
  async sendCalendarInvite(
    userEmail: string,
    subject: string,
    start: Date,
    end: Date,
    location?: string,
    description?: string
  ): Promise<boolean> {
    try {
      const event = {
        subject,
        body: {
          contentType: 'html',
          content: description || ''
        },
        start: {
          dateTime: start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'UTC'
        },
        location: location ? {
          displayName: location
        } : undefined,
        attendees: [{
          emailAddress: {
            address: userEmail,
            name: userEmail
          },
          type: 'required'
        }]
      };

      await graphClient
        .api('/me/events')
        .post(event);

      logger.info(`Calendar invite sent to ${userEmail} for: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send calendar invite to ${userEmail}:`, error);
      return false;
    }
  }
}

export const azureUserService = new AzureUserService(); 