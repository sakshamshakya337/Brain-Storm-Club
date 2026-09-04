import nodemailer from 'nodemailer';

const createTransporter = () => {
  const smtpPass = process.env.SMTP_PASS;
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !smtpPass) {
    throw new Error('SMTP credentials missing. Check SMTP_HOST, SMTP_USER, SMTP_PASS environment variables.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: (parseInt(process.env.SMTP_PORT, 10) || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
};

const getFromAddress = () => {
  return `Brainstorm Club Admin <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
};

export const verifySMTP = () => {
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  console.log('\n--- SMTP Configuration Diagnostics ---');
  console.log(`HOST: ${process.env.SMTP_HOST ? 'configured' : 'missing'}`);
  console.log(`PORT: ${process.env.SMTP_PORT ? 'configured' : 'missing'}`);
  console.log(`USER: ${process.env.SMTP_USER ? 'configured' : 'missing'}`);
  console.log(`PASSWORD: ${smtpPass ? 'configured' : 'missing'}`);
  console.log(`FROM: ${process.env.SMTP_FROM ? 'configured' : 'missing'}`);
  console.log('--------------------------------------\n');
};

export const sendPasswordResetEmail = async (adminEmail, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: getFromAddress(),
      to: adminEmail,
      subject: 'Brainstorm Club — Admin Password Reset',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0f172a; text-transform: uppercase; font-size: 18px; letter-spacing: 1px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hello,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">A password reset request was made for your Brainstorm Club administrator account.</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">Click the secure button below to reset your password.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              RESET PASSWORD
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This link expires in 10 minutes and can only be used once.</p>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you did not request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Brainstorm Project Club<br/>Admin Security</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('[SMTP] Password reset email delivery failed.');
    throw error;
  }
};

export const sendAdminLoginOTP = async (adminEmail, rawOtp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: getFromAddress(),
      to: adminEmail,
      subject: 'Your Brainstorm Admin Login OTP',
      html: `
        <div style="font-family: monospace, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; text-transform: uppercase; font-size: 18px; letter-spacing: 2px; margin-top: 0;">BRAINSTORM PROJECT CLUB</h2>
          <p style="color: #475569; font-size: 14px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Admin Login Verification</p>
          
          <p style="color: #334155; font-size: 15px; font-family: sans-serif; margin-top: 30px;">Your one-time verification code is:</p>
          
          <div style="background-color: #ffffff; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${rawOtp}</span>
          </div>
          
          <p style="color: #64748b; font-size: 13px; font-family: sans-serif; line-height: 1.5;">This code expires in 5 minutes.</p>
          <p style="color: #ef4444; font-size: 13px; font-family: sans-serif; line-height: 1.5; font-weight: bold;">For your security, do not share this code with anyone.</p>
          <p style="color: #64748b; font-size: 13px; font-family: sans-serif; line-height: 1.5;">If you did not request this login, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('[SMTP] Admin OTP email delivery failed.');
    throw error;
  }
};
