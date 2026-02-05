import nodemailer from 'nodemailer';

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Unity Vote Admin" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateOTPEmail(otp: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a1628;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a1628; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0a1628 0%, #1a2f4d 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Unity Vote Admin</h1>
                  <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px;">Secure Admin Access</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 50px 30px;">
                  <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${name}</strong>,
                  </p>
                  <p style="margin: 0 0 30px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    We received a request to sign in to your Unity Vote admin account. Use the one-time password below to complete your login:
                  </p>
                  
                  <!-- OTP Code Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 25px 50px;">
                          <span style="font-size: 36px; font-weight: 700; color: #f97316; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong style="color: #f97316;">10 minutes</strong> for security reasons.
                  </p>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                      <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email and ensure your account is secure.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 12px;">
                    Unity Summit & Awards 2026
                  </p>
                  <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const html = generateOTPEmail(otp, name);
  const text = `Hello ${name},\n\nYour Unity Vote admin login code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nUnity Summit & Awards 2026`;

  return sendEmail({
    to: email,
    subject: 'Your Unity Vote Admin Login Code',
    html,
    text,
  });
}

export function generateInvitationEmail(name: string, role: string, inviteUrl: string, invitedBy: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to Unity Vote</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a1628;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a1628; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0a1628 0%, #1a2f4d 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 You're Invited!</h1>
                  <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px;">Unity Vote Admin Access</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 50px 30px;">
                  <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${name}</strong>,
                  </p>
                  <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    <strong>${invitedBy}</strong> has invited you to join the Unity Vote admin team as a <strong style="color: #f97316;">${role}</strong>.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Click the button below to set up your account and get started:
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${inviteUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                          Accept Invitation
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 20px 0; color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 30px 0; padding: 15px; background-color: #f1f5f9; border-radius: 8px; word-break: break-all; font-size: 12px; color: #475569; text-align: center;">
                    ${inviteUrl}
                  </p>
                  
                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-top: 30px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>📌 Note:</strong> This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 12px;">
                    Unity Summit & Awards 2026
                  </p>
                  <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendInvitationEmail(email: string, name: string, role: string, inviteUrl: string, invitedBy: string) {
  const html = generateInvitationEmail(name, role, inviteUrl, invitedBy);
  const text = `Hello ${name},\n\n${invitedBy} has invited you to join the Unity Vote admin team as a ${role}.\n\nClick this link to accept your invitation and set up your account:\n${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nIf you didn't expect this invitation, you can safely ignore this email.\n\nUnity Summit & Awards 2026`;

  return sendEmail({
    to: email,
    subject: `You're invited to join Unity Vote as ${role}`,
    html,
    text,
  });
}
