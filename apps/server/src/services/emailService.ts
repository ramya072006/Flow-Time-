import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const createTransporter = () => {
  if (!config.email.user || !config.email.pass) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

const transporter = createTransporter();

export const emailService = {
  async sendVerificationEmail(email: string, name: string, token: string) {
    if (!transporter) {
      logger.warn('Email not configured - skipping verification email');
      return;
    }
    const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Verify your FlowTime account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Welcome to FlowTime, ${name}!</h2>
            <p>Please verify your email address to get started.</p>
            <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Verify Email
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          </div>
        `,
      });
    } catch (error) {
      logger.error('Failed to send verification email:', error);
    }
  },

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    if (!transporter) {
      logger.warn('Email not configured - skipping password reset email');
      return;
    }
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Reset your FlowTime password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Password Reset Request</h2>
            <p>Hi ${name}, we received a request to reset your password.</p>
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }
  },

  async sendNotificationEmail(email: string, subject: string, message: string) {
    if (!transporter) return;
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">FlowTime Notification</h2>
            <p>${message}</p>
          </div>
        `,
      });
    } catch (error) {
      logger.error('Failed to send notification email:', error);
    }
  },
};
