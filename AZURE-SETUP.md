# RME LMS - Azure Integration Setup Guide

## Overview
The RME Learning Management System is now integrated with Microsoft Azure services, providing enterprise-grade email notifications, calendar management, and user synchronization.

## Azure Services Configured

### 1. Microsoft Graph API
- **Email Service**: Send training notifications, certificates, and reminders
- **Calendar Service**: Create training session invites and reminders
- **User Management**: Sync with Azure Active Directory users

### 2. Azure AD App Registration
Based on your screenshot, you have configured:
- **App Name**: RME-LMS-Email-Service
- **Permissions Granted**:
  - `Directory.Read.All` - Read directory data
  - `Mail.ReadWrite` - Read and write mail in all mailboxes
  - `Mail.Send` - Send mail as any user
  - `User.Read` - Sign in and read user profile
  - `User.Read.All` - Read all users' full profiles

## Configuration Required

### Environment Variables
Update your `.env` file with your Azure credentials:

```env
# Azure AD / Microsoft Graph
AZURE_CLIENT_ID="your-azure-app-client-id"
AZURE_CLIENT_SECRET="your-azure-app-client-secret"
AZURE_TENANT_ID="your-azure-tenant-id"
AZURE_AUTHORITY="https://login.microsoftonline.com/your-tenant-id"

# Email Configuration
EMAIL_PROVIDER="azure"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="RME Learning Management System"
```

### How to Get Azure Credentials

1. **Azure Client ID**: 
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Select your "RME-LMS-Email-Service" app
   - Copy the "Application (client) ID"

2. **Azure Tenant ID**:
   - In the same app registration, copy the "Directory (tenant) ID"

3. **Azure Client Secret**:
   - Go to "Certificates & secrets" tab
   - Click "New client secret"
   - Add description and expiry
   - Copy the secret VALUE (not the ID)

## API Endpoints

### Azure Integration Endpoints

#### Configuration Check
```http
GET /api/azure/config
Authorization: Bearer <your-jwt-token>
```
Returns Azure configuration status.

#### Test Connection
```http
GET /api/azure/test-connection
Authorization: Bearer <your-jwt-token>
```
Tests Microsoft Graph API connectivity.

#### Send Test Email
```http
POST /api/azure/test-email
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test message from RME LMS"
}
```

#### Get Azure User
```http
GET /api/azure/users/user@example.com
Authorization: Bearer <your-jwt-token>
```

#### Sync Azure Users
```http
POST /api/azure/sync-users
Authorization: Bearer <your-jwt-token>
```

#### Send Calendar Invite
```http
POST /api/azure/calendar-invite
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "subject": "Training Session",
  "startDate": "2024-07-10T09:00:00Z",
  "endDate": "2024-07-10T17:00:00Z",
  "location": "Conference Room A",
  "description": "Safety Training Session"
}
```

## Email Templates

The system includes professional email templates for:

### 1. Welcome Email
- Sent when new users are created
- Includes login credentials if provided
- Professional RME branding

### 2. Training Assignment Email
- Sent when users are enrolled in training plans
- Includes due dates and plan details
- Direct link to LMS

### 3. Certificate Email
- Sent when users complete training
- PDF certificate attached
- Congratulatory message

### 4. Session Reminder Email
- Sent before training sessions
- Includes date, time, and location
- Professional reminder format

## Enhanced Features

### Automatic Email Notifications
- **User Enrollment**: Automatic emails when assigned to training plans
- **Bulk Enrollment**: Email notifications for bulk user assignments
- **Course Completion**: Congratulations emails with certificates
- **Session Reminders**: Automatic reminders before training sessions

### Calendar Integration
- **Training Sessions**: Automatic calendar invites for sessions
- **Reminder System**: Calendar-based reminders
- **Location Details**: Meeting room or online session links

### User Synchronization
- **Azure AD Sync**: Sync user profiles from Azure Active Directory
- **Department Filtering**: Get users by department
- **Manager Hierarchy**: Support for organizational structure

## Testing the Integration

1. **Start the Backend Server**:
   ```bash
   npm run dev:backend
   ```

2. **Test Azure Connection**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://10.10.11.243:3001/api/azure/test-connection
   ```

3. **Send Test Email**:
   ```bash
   curl -X POST \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"to":"your-email@example.com","subject":"Test","message":"Hello from RME LMS!"}' \
        http://10.10.11.243:3001/api/azure/test-email
   ```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify Azure credentials in .env file
   - Check app registration permissions
   - Ensure admin consent is granted

2. **Email Not Sending**:
   - Verify `Mail.Send` permission is granted
   - Check EMAIL_FROM domain is configured
   - Test with SMTP fallback first

3. **Calendar Invites Not Working**:
   - Verify `Calendar.ReadWrite` permission (if needed)
   - Check user email exists in Azure AD
   - Verify timezone settings

### Support
- Backend API: http://10.10.11.243:3001
- Health Check: http://10.10.11.243:3001/health
- Azure Config: http://10.10.11.243:3001/api/azure/config

## Security Notes
- Store Azure secrets securely
- Use environment variables, never commit secrets to git
- Regular rotation of client secrets recommended
- Monitor API usage in Azure portal 