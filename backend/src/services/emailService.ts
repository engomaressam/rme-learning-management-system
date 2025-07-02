import { graphClient } from '../config/azure';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

class EmailService {
  private smtpTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeSmtpTransporter();
  }

  private initializeSmtpTransporter() {
    if (process.env.EMAIL_PROVIDER !== 'azure') {
      this.smtpTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions, attachments?: EmailAttachment[]): Promise<boolean> {
    try {
      if (process.env.EMAIL_PROVIDER === 'azure') {
        return await this.sendEmailViaAzure(options, attachments);
      } else {
        return await this.sendEmailViaSmtp(options, attachments);
      }
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendEmailViaAzure(options: EmailOptions, attachments?: EmailAttachment[]): Promise<boolean> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const ccRecipients = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [];
      const bccRecipients = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [];

      const message = {
        subject: options.subject,
        body: {
          contentType: options.html ? 'html' : 'text',
          content: options.html || options.text || '',
        },
        toRecipients: recipients.map(email => ({
          emailAddress: { address: email }
        })),
        ccRecipients: ccRecipients.map(email => ({
          emailAddress: { address: email }
        })),
        bccRecipients: bccRecipients.map(email => ({
          emailAddress: { address: email }
        })),
        attachments: attachments?.map(att => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.filename,
          contentBytes: Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'),
          contentType: att.contentType || 'application/octet-stream'
        })) || []
      };

      await graphClient
        .api('/me/sendMail')
        .post({
          message,
          saveToSentItems: true
        });

      logger.info(`Email sent successfully via Azure to: ${recipients.join(', ')}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email via Azure:', error);
      throw error;
    }
  }

  private async sendEmailViaSmtp(options: EmailOptions, attachments?: EmailAttachment[]): Promise<boolean> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized');
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      };

      await this.smtpTransporter.sendMail(mailOptions);
      
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      logger.info(`Email sent successfully via SMTP to: ${recipients.join(', ')}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email via SMTP:', error);
      throw error;
    }
  }

  // Email templates for LMS notifications
  async sendWelcomeEmail(userEmail: string, userName: string, tempPassword?: string): Promise<boolean> {
    const subject = 'Welcome to RME Learning Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to RME LMS!</h2>
        <p>Dear ${userName},</p>
        <p>Welcome to the RME Learning Management System. Your account has been created and you can now access our training platform.</p>
        ${tempPassword ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p style="color: #dc2626; font-size: 14px;"><strong>⚠️ Please change your password after first login</strong></p>
          </div>
        ` : ''}
        <p>You can access the LMS at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
        <p>Best regards,<br>RME Learning Management Team</p>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendTrainingAssignmentEmail(userEmail: string, userName: string, planName: string, dueDate?: Date): Promise<boolean> {
    const subject = `New Training Assignment: ${planName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Training Assignment</h2>
        <p>Dear ${userName},</p>
        <p>You have been assigned to a new training plan:</p>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin: 0; color: #065f46;">${planName}</h3>
          ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>` : ''}
        </div>
        <p>Please log in to your LMS account to view the training details and begin your courses.</p>
        <p><a href="${process.env.FRONTEND_URL}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access LMS</a></p>
        <p>Best regards,<br>RME Learning Management Team</p>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendCertificateEmail(userEmail: string, userName: string, courseName: string, certificateBuffer: Buffer): Promise<boolean> {
    const subject = `Certificate of Completion: ${courseName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Congratulations! Training Completed</h2>
        <p>Dear ${userName},</p>
        <p>Congratulations on successfully completing the training course:</p>
        <div style="background-color: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin: 0; color: #5b21b6;">${courseName}</h3>
        </div>
        <p>Please find your certificate of completion attached to this email.</p>
        <p>Keep up the excellent work in your professional development!</p>
        <p>Best regards,<br>RME Learning Management Team</p>
      </div>
    `;

    const attachments: EmailAttachment[] = [{
      filename: `Certificate_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      content: certificateBuffer,
      contentType: 'application/pdf'
    }];

    return await this.sendEmail({ to: userEmail, subject, html }, attachments);
  }

  async sendSessionReminderEmail(userEmail: string, userName: string, sessionTitle: string, sessionDate: Date, location?: string): Promise<boolean> {
    const subject = `Training Session Reminder: ${sessionTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Training Session Reminder</h2>
        <p>Dear ${userName},</p>
        <p>This is a reminder for your upcoming training session:</p>
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0; color: #991b1b;">${sessionTitle}</h3>
          <p><strong>Date & Time:</strong> ${sessionDate.toLocaleString()}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        </div>
        <p>Please make sure to attend on time. If you cannot attend, please contact your manager or training coordinator.</p>
        <p>Best regards,<br>RME Learning Management Team</p>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }
}

export const emailService = new EmailService(); 