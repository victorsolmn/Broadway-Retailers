import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const EMAIL_DIR = join(process.cwd(), 'tmp', 'emails');

// Ensure directory exists
if (!existsSync(EMAIL_DIR)) {
  mkdirSync(EMAIL_DIR, { recursive: true });
}

export async function sendEmail(options: EmailOptions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${options.to.replace('@', '-at-')}.html`;
  const filepath = join(EMAIL_DIR, filename);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #000;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Broadway Sellers</h1>
  </div>
  <div class="content">
    <p><strong>To:</strong> ${options.to}</p>
    <p><strong>Subject:</strong> ${options.subject}</p>
    <hr>
    ${options.html}
  </div>
  <div class="footer">
    <p>This is a mock email from Broadway Sellers</p>
    <p>Saved to: ${filepath}</p>
  </div>
</body>
</html>
  `;

  writeFileSync(filepath, emailHtml, 'utf-8');

  console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
  console.log(`   Saved to: ${filepath}`);

  return { success: true, filepath };
}

// Email templates
export const emailTemplates = {
  applicationSubmitted: (recipientEmail: string, trackingUrl: string) => ({
    to: recipientEmail,
    subject: 'Application Submitted - Broadway Sellers',
    html: `
      <h2>Thank you for applying to Broadway Sellers!</h2>
      <p>We've received your seller application and our team is reviewing it.</p>
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your application within 48-72 business hours</li>
        <li>You'll receive updates via email and in your dashboard</li>
        <li>You can track your application status in real-time</li>
      </ul>
      <a href="${trackingUrl}" class="button">Track Application Status</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `,
  }),

  applicationApproved: (recipientEmail: string, dashboardUrl: string) => ({
    to: recipientEmail,
    subject: '🎉 Congratulations! Your Application is Approved',
    html: `
      <h2>Welcome to Broadway Sellers!</h2>
      <p>Great news! Your seller application has been approved and you're now Broadway Certified.</p>
      <p><strong>Your Broadway Certification Badge</strong> will help boost your product discovery and build trust with buyers.</p>
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Complete your seller profile</li>
        <li>Add your first product</li>
        <li>Set up payment details</li>
        <li>Configure shipping addresses</li>
      </ol>
      <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
    `,
  }),

  applicationRejected: (recipientEmail: string, reason: string) => ({
    to: recipientEmail,
    subject: 'Broadway Sellers Application Update',
    html: `
      <h2>Application Status Update</h2>
      <p>Thank you for your interest in Broadway Sellers. After careful review, we're unable to approve your application at this time.</p>
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
      <p>If you'd like to discuss this decision or have questions, please contact our support team.</p>
    `,
  }),

  clarificationNeeded: (recipientEmail: string, message: string, statusUrl: string) => ({
    to: recipientEmail,
    subject: 'Additional Information Required - Broadway Sellers',
    html: `
      <h2>We need more information</h2>
      <p>Our team is reviewing your application and needs some clarification:</p>
      <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
        ${message}
      </div>
      <a href="${statusUrl}" class="button">Provide Clarification</a>
    `,
  }),

  statusChanged: (recipientEmail: string, newStatus: string, statusUrl: string) => ({
    to: recipientEmail,
    subject: `Application Status Update: ${newStatus}`,
    html: `
      <h2>Your application status has been updated</h2>
      <p>Status: <strong>${newStatus}</strong></p>
      <a href="${statusUrl}" class="button">View Details</a>
    `,
  }),

  magicLink: (recipientEmail: string, magicLink: string) => ({
    to: recipientEmail,
    subject: 'Sign in to Broadway Sellers',
    html: `
      <h2>Sign in to your account</h2>
      <p>Click the button below to sign in to Broadway Sellers. This link will expire in 10 minutes.</p>
      <a href="${magicLink}" class="button">Sign In</a>
      <p>If you didn't request this email, you can safely ignore it.</p>
    `,
  }),

  supportTicketCreated: (recipientEmail: string, ticketId: string, subject: string) => ({
    to: recipientEmail,
    subject: `Support Ticket Created: ${subject}`,
    html: `
      <h2>Support Ticket Created</h2>
      <p>We've received your support request and our team will respond within 24 hours.</p>
      <p><strong>Ticket ID:</strong> #${ticketId.slice(0, 8)}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>You can track your ticket status in your dashboard.</p>
      <p>For urgent matters, please email support@broadway.local directly.</p>
    `,
  }),
};
