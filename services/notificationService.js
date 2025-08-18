const nodemailer = require('nodemailer');
const axios = require('axios');
const { getSettings } = require('./settingsStore');

// Mock Email Service for development
class MockEmailService {
  async sendMail(mailOptions) {
    console.log('[MOCK EMAIL] Email would be sent:');
    console.log(`[MOCK EMAIL] To: ${mailOptions.to}`);
    console.log(`[MOCK EMAIL] Subject: ${mailOptions.subject}`);
    console.log(`[MOCK EMAIL] From: ${mailOptions.from}`);
    
    return {
      messageId: 'mock_' + Date.now(),
      response: 'Mock email sent successfully'
    };
  }
}

// Email transporter setup
const createEmailTransporter = () => {
  // Resolve credentials from either EMAIL_* or SMTP_* env vars
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const hasCredentials = !!(host && user && pass);
  if (!hasCredentials) {
    return new MockEmailService();
  }
  
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587/25
    auth: { user, pass }
  });
};

const transporter = createEmailTransporter();

// SMS Service Class
class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.apiUrl = process.env.SMS_API_URL;
  }

  async sendSMS(phoneNumber, message) {
    try {
      if (!this.apiKey || !this.apiUrl) {
        console.log('SMS service not configured, skipping SMS notification');
        return { success: false, message: 'SMS service not configured' };
      }

      const response = await axios.post(this.apiUrl, {
        api_key: this.apiKey,
        to: phoneNumber,
        message: message,
        from: 'PaySSD'
      });

      return {
        success: true,
        messageId: response.data.message_id,
        response: response.data
      };

    } catch (error) {
      console.error('SMS sending error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

// Mock SMS Service for development
class MockSMSService {
  async sendSMS(phoneNumber, message) {
    console.log(`[MOCK SMS] To: ${phoneNumber}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    
    return {
      success: true,
      messageId: 'mock_' + Date.now(),
      response: { status: 'sent' }
    };
  }
}

// Initialize SMS service
const smsService = process.env.NODE_ENV === 'development' || !process.env.SMS_API_KEY 
  ? new MockSMSService() 
  : new SMSService();

// Email notification functions
const sendPaymentSuccessEmail = async (transaction, merchant) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💰 Payment Received!</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${merchant.profile.firstName},</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Great news! You've received a new payment through PaySSD.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${transaction.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">${transaction.currency} ${transaction.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Digicash'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Description:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date(transaction.completedAt).toLocaleString('en-US', { timeZone: 'Africa/Juba' })}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">
              💡 <strong>Your Balance:</strong> The payment amount (minus fees) has been added to your PaySSD balance. 
              You can request a payout from your dashboard.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard/transactions" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Transaction Details
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            Best regards,<br>
            The PaySSD Team<br>
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #2563eb;">${process.env.SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: merchant.email,
      subject: `💰 Payment Received - ${transaction.currency} ${transaction.amount.toLocaleString()} | PaySSD`,
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendPaymentFailedEmail = async (transaction, merchant) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">❌ Payment Failed</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${merchant.profile.firstName},</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We wanted to inform you that a payment attempt for your business has failed.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${transaction.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${transaction.currency} ${transaction.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Digicash'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Reason:</td>
                <td style="padding: 8px 0; color: #ef4444;">${transaction.providerResponse?.responseMessage || 'Payment processing failed'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              💡 <strong>What's next?</strong> The customer can try the payment again. Common reasons for failure include insufficient balance or network issues.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            Best regards,<br>
            The PaySSD Team<br>
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #2563eb;">${process.env.SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: merchant.email,
      subject: `❌ Payment Failed - ${transaction.transactionId} | PaySSD`,
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// SMS notification functions
const sendPaymentSuccessSMS = async (transaction, merchant) => {
  try {
    const message = `PaySSD: Payment received! ${transaction.currency} ${transaction.amount.toLocaleString()} from ${transaction.customer.name}. Transaction: ${transaction.transactionId}. Check your dashboard for details.`;
    
    return await smsService.sendSMS(merchant.profile.phoneNumber, message);

  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendPaymentFailedSMS = async (transaction, merchant) => {
  try {
    const message = `PaySSD: Payment failed for ${transaction.currency} ${transaction.amount.toLocaleString()} from ${transaction.customer.name}. Transaction: ${transaction.transactionId}. Customer can retry payment.`;
    
    return await smsService.sendSMS(merchant.profile.phoneNumber, message);

  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// KYC notification functions
const sendKYCApprovedEmail = async (user) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 KYC Approved!</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${user.profile.firstName}!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your KYC verification has been approved! You can now access all PaySSD features.
          </p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>Create unlimited payment links</li>
              <li>Accept payments via MTN Mobile Money and Digicash</li>
              <li>Request payouts to your bank account or mobile money</li>
              <li>Access detailed transaction analytics</li>
              <li>Use our API for custom integrations</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            Welcome to PaySSD!<br>
            The PaySSD Team<br>
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #2563eb;">${process.env.SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '🎉 KYC Approved - Welcome to PaySSD!',
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendKYCRejectedEmail = async (user, rejectionReason) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">KYC Review Required</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${user.profile.firstName},</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We've reviewed your KYC submission and need some additional information or corrections.
          </p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Reason for Review:</h3>
            <p style="color: #7f1d1d; margin: 0; font-weight: 500;">${rejectionReason}</p>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">
              💡 <strong>Next Steps:</strong> Please review the feedback above and resubmit your KYC documents with the necessary corrections.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/kyc" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Resubmit KYC Documents
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            If you have any questions, please contact our support team.<br>
            The PaySSD Team<br>
            <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #2563eb;">${process.env.SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'KYC Review Required - PaySSD',
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Admin notification functions
const sendAdminNewUserEmail = async (newUser) => {
  try {
    // Check if admin email alerts are enabled
    const settings = await getSettings();
     if (!settings.notifications.adminEmailAlerts) {
       return { success: true, skipped: true, reason: 'Admin email alerts disabled' };
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">👤 New User Registration</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">New merchant has registered</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            A new user has just registered on PaySSD and is ready to start accepting payments.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">User Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${newUser.profile.firstName} ${newUser.profile.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${newUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                <td style="padding: 8px 0; color: #1f2937;">${newUser.profile.phoneNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Business:</td>
                <td style="padding: 8px 0; color: #1f2937;">${newUser.profile.businessName || 'Individual Account'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${newUser.profile.address.city}, ${newUser.profile.address.country}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registered:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date(newUser.createdAt).toLocaleString('en-US', { timeZone: 'Africa/Juba' })}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">
              💡 <strong>Next Steps:</strong> Monitor KYC submission and review when submitted. Provide support if needed.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/admin/users" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View All Users
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            PaySSD Admin Notification System<br>
            This is an automated notification
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `🆕 New User Registration - ${newUser.profile.firstName} ${newUser.profile.lastName}`,
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Admin new user email error:', error);
    return { success: false, error: error.message };
  }
};

const sendAdminUserDeletedEmail = async (deletedUser, adminUser, reason) => {
  try {
    // Check if admin email alerts are enabled
    const settings = await getSettings();
     if (!settings.notifications.adminEmailAlerts) {
       return { success: true, skipped: true, reason: 'Admin email alerts disabled' };
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🗑️ User Account Deleted</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">User account has been deleted</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            A user account has been deleted from the PaySSD platform.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Deleted User Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${deletedUser.profile.firstName} ${deletedUser.profile.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${deletedUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Business:</td>
                <td style="padding: 8px 0; color: #1f2937;">${deletedUser.profile.businessName || 'Individual Account'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Deleted by:</td>
                <td style="padding: 8px 0; color: #1f2937;">${adminUser.profile.firstName} ${adminUser.profile.lastName} (${adminUser.email})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Deleted at:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleString('en-US', { timeZone: 'Africa/Juba' })}</td>
              </tr>
            </table>
          </div>
          
          ${reason ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Deletion Reason:</h3>
            <p style="color: #7f1d1d; margin: 0; font-weight: 500;">${reason}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">
              💡 <strong>Note:</strong> User data has been anonymized and deactivated rather than permanently deleted to preserve transaction history.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            PaySSD Admin Notification System<br>
            This is an automated notification
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `🗑️ User Deleted - ${deletedUser.profile.firstName} ${deletedUser.profile.lastName}`,
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Admin user deleted email error:', error);
    return { success: false, error: error.message };
  }
};

const sendAdminPaymentNotificationEmail = async (transaction, merchant) => {
  try {
    // Check if admin email alerts are enabled
    const settings = await getSettings();
     if (!settings.notifications.adminEmailAlerts) {
       return { success: true, skipped: true, reason: 'Admin email alerts disabled' };
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@payssd.com';
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💰 Payment Received</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">New payment processed</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            A new payment has been successfully processed on the PaySSD platform.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${transaction.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">${transaction.currency} ${transaction.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Platform Fee:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.currency} ${transaction.fees?.platform || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Digicash'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer Phone:</td>
                <td style="padding: 8px 0; color: #1f2937;">${transaction.customer.phoneNumber}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #d1d5db; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Merchant Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${merchant.profile.firstName} ${merchant.profile.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${merchant.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Business:</td>
                <td style="padding: 8px 0; color: #1f2937;">${merchant.profile.businessName || 'Individual Account'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Location:</td>
                <td style="padding: 8px 0; color: #1f2937;">${merchant.profile.address.city}, ${merchant.profile.address.country}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              📊 <strong>Platform Revenue:</strong> ${transaction.currency} ${transaction.fees?.platform || 0} added to platform earnings.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/admin/transactions" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              View Transaction Details
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            PaySSD Admin Notification System<br>
            This is an automated notification
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `💰 Payment Alert - ${transaction.currency} ${transaction.amount.toLocaleString()} | PaySSD`,
      html: emailHtml
    });

    return { success: true };

  } catch (error) {
    console.error('Admin payment notification email error:', error);
    return { success: false, error: error.message };
  }
};

// Main notification function
const sendNotification = async (transaction) => {
  try {
    // Get merchant details
    const User = require('../models/User');
    const merchant = await User.findById(transaction.merchant)
      .select('email profile settings');
    
    if (!merchant) {
      console.error('Merchant not found for notification');
      return;
    }

    const notifications = [];

    // Send email notification if enabled
    if (merchant.settings.notifications.email) {
      if (transaction.status === 'successful') {
        notifications.push(sendPaymentSuccessEmail(transaction, merchant));
      } else if (transaction.status === 'failed') {
        notifications.push(sendPaymentFailedEmail(transaction, merchant));
      }
    }

    // Send SMS notification if enabled
    if (merchant.settings.notifications.sms) {
      if (transaction.status === 'successful') {
        notifications.push(sendPaymentSuccessSMS(transaction, merchant));
      } else if (transaction.status === 'failed') {
        notifications.push(sendPaymentFailedSMS(transaction, merchant));
      }
    }

    // Send admin notification for successful payments (check settings)
    if (transaction.status === 'successful') {
      // For now, we'll send admin notifications. In a real app, check admin settings
      notifications.push(sendAdminPaymentNotificationEmail(transaction, merchant));
    }

    // Wait for all notifications to complete
    const results = await Promise.allSettled(notifications);
    
    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Notification ${index} failed:`, result.reason);
      }
    });

  } catch (error) {
    console.error('Notification service error:', error);
  }
};

module.exports = {
  sendNotification,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendPaymentSuccessSMS,
  sendPaymentFailedSMS,
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
  sendAdminNewUserEmail,
  sendAdminUserDeletedEmail,
  sendAdminPaymentNotificationEmail
};