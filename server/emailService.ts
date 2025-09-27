
import nodemailer from 'nodemailer';
import type { Registration } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(config: EmailConfig, fromEmail: string) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    this.fromEmail = fromEmail;
  }

  async sendRegistrationConfirmation(registration: Registration): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation - Ex-CAP Quiz Fest 2025</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reg-number { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .contact-info { background: #e8f2ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <p>Ex-CAP Quiz Fest 2025</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${registration.nameEnglish}</strong>,</p>
            
            <p>Congratulations! Your registration for <strong>Ex-CAP Quiz Fest 2025</strong> has been successfully completed.</p>
            
            <div class="reg-number">
              📋 Registration Number: ${registration.registrationNumber}
            </div>
            
            <div class="details">
              <h3 style="color: #667eea; margin-top: 0;">Registration Details</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span>${registration.nameEnglish} (${registration.nameBangla})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Student ID:</span>
                <span>${registration.studentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Class:</span>
                <span>${registration.class} - ${registration.section}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span>${registration.classCategory}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span>${registration.phoneWhatsapp}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Registration Date:</span>
                <span>${new Date(registration.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
            
            <div class="contact-info">
              <h4 style="color: #667eea; margin-top: 0;">📞 Contact Information</h4>
              <p>If you have any queries, please contact us:</p>
              <p><strong>Mobile 1:</strong> 01780184038</p>
              <p><strong>Mobile 2:</strong> 01711988862</p>
            </div>
            
            <p><strong>Important:</strong> Please save this registration number and bring it with you on the competition day.</p>
            
            <p>We look forward to seeing you at the Ex-CAP Quiz Fest 2025!</p>
            
            <div class="footer">
              <p>Best regards,<br>
              <strong>Ex-CAP Quiz Fest 2025 Team</strong></p>
              <p><em>This is an automated email. Please do not reply to this email.</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: this.fromEmail,
      to: registration.email,
      subject: `Registration Confirmed - Ex-CAP Quiz Fest 2025 | Registration #${registration.registrationNumber}`,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to ${registration.email}: ${info.messageId}`);
    } catch (error) {
      console.error(`❌ Failed to send confirmation email to ${registration.email}:`, error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

// Factory function to create EmailService instance
export function createEmailService(): EmailService | null {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
      console.warn('⚠️ Email service credentials not configured - skipping email notifications');
      return null;
    }

    return new EmailService({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }, fromEmail);
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error);
    return null;
  }
}
