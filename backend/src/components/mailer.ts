import nodemailer, { type Transporter, type SentMessageInfo } from 'nodemailer';
import { mailer as mailerConfig } from '@const/constants.js';
import type {
  EmailOptions,
  SendEmailResult
} from '@/types/mailer.js';

class MailerComponent {
  static #instance: MailerComponent;

  private transporter: Transporter<SentMessageInfo> | null = null;

  private fromAddress: string | null = null;

  private constructor() {}

  public static get instance(): MailerComponent {
    if (!MailerComponent.#instance) {
      MailerComponent.#instance = new MailerComponent();
    }
    return MailerComponent.#instance;
  }

  private async verifyTransporter() {
    if (!this.transporter) {
      throw new Error('MailerComponent transporter not configured.');
    }

    try {
      await this.transporter.verify();
    } catch (err) {
      console.error('SMTP verification failed:', err);
      throw err;
    }
  }

  /* --- Template generators --- */

  private generateRegistrationVerificationTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; 
                     color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Please click the button below to verify your email address:</p>
            <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
            <p>Actually ignore that, it doesn't work rn lololol, just grab this token:</p>
            <p><code>${verificationUrl}</code></p>
            <p>This verification link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateForgotPasswordVerificationTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; 
                     color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Please click the button below to verify your email address:</p>
            <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
            <p>Actually ignore that, it doesn't work rn lololol, just grab this token:</p>
            <p><code>${verificationUrl}</code></p>
            <p>This verification link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /* --- Init --- */

  public async init() {
    try {
      this.transporter = nodemailer.createTransport(mailerConfig);
      this.fromAddress = mailerConfig.auth.user;

      await this.verifyTransporter();
    } catch (err) {
      console.error('Failed to initialize MailerComponent:', err);
      throw err;
    }
  }

  /* --- Send email methods --- */

  public async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    if (!this.fromAddress || !this.transporter) throw new Error('Mailer has not been initialized. Call mailer.init() first.');

    try {
      const mailOptions = {
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info: SentMessageInfo = await this.transporter.sendMail(mailOptions);

      return info as SendEmailResult;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  }

  public async sendRegistrationVerificationEmail(to: string, verificationToken: string): Promise<SendEmailResult> {
    const subject = 'Verify Your Email Address';

    const html = this.generateRegistrationVerificationTemplate(verificationToken);

    return await this.sendEmail({
      to,
      subject,
      html
    });
  }

  public async sendForgotPasswordVerificationEmail(to: string, verificationToken: string): Promise<SendEmailResult> {
    const subject = 'Verify Your Email Address';

    const html = this.generateForgotPasswordVerificationTemplate(verificationToken);

    return await this.sendEmail({
      to,
      subject,
      html
    });
  }
};

export const mailer = MailerComponent.instance;