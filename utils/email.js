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

/**
 * Sends a confirmation email to the submitter after their idea is saved.
 * Safe error handling: does not throw, records failure.
 */
export const sendIdeaConfirmationEmail = async ({ email, name, title, submissionDate, referenceId, hasPdf, pdfName }) => {
  try {
    const transporter = createTransporter();
    
    const formattedDate = new Date(submissionDate || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: getFromAddress(),
      to: email,
      subject: 'Your Brainstorm Idea Has Been Received',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
              BRAINSTORM CLUB
            </h1>
            <p style="color: #94a3b8; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin: 6px 0 0 0;">
              LPU SCA Project & Innovation Community
            </p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 16px;">
              Idea Submission Received
            </h2>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Thank you for submitting your idea to Brainstorm Club. We have received your submission and our team will review it.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Idea Title:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Submitted On:</td>
                  <td style="padding: 6px 0; color: #334155;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Reference ID:</td>
                  <td style="padding: 6px 0; color: #334155; font-family: monospace;">${referenceId}</td>
                </tr>
                ${hasPdf ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Attachment:</td>
                  <td style="padding: 6px 0; color: #334155; font-family: monospace;">${pdfName || 'Document.pdf'}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              The best ideas get pitched, prototyped, and brought to life. We will keep you updated as your idea progresses.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                This is an automated confirmation from the Brainstorm Club portal.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Idea confirmation email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('[SMTP] Idea confirmation email delivery failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sends an email reply from an admin to a contact query submitter.
 * Throws error on failure so caller can prevent updating state.
 */
export const sendContactQueryReplyEmail = async ({ toEmail, recipientName, originalSubject, replyMessage }) => {
  const transporter = createTransporter();

  // Clean subject: "Re: [original subject]"
  const cleanOriginal = (originalSubject || 'Your query').trim();
  const subjectPrefix = /^re:\s*/i.test(cleanOriginal) ? '' : 'Re: ';
  const subject = `Brainstorm Club — ${subjectPrefix}${cleanOriginal}`;

  // Escape HTML in replyMessage and convert line breaks to <br />
  const escapedReply = String(replyMessage || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />');

  const textContent = `Hello ${recipientName || 'there'},\n\n${replyMessage}\n\nRegards,\nBrainstorm Club Team\nLPU SCA Brainstorm Club`;

  const mailOptions = {
    from: getFromAddress(),
    to: toEmail,
    subject,
    text: textContent,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
            BRAINSTORM CLUB
          </h1>
          <p style="color: #94a3b8; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin: 6px 0 0 0;">
            LPU SCA Project & Innovation Community
          </p>
        </div>
        
        <div style="padding: 32px 24px;">
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${recipientName || 'there'}</strong>,
          </p>
          
          <div style="color: #1e293b; font-size: 15px; line-height: 1.7; margin-bottom: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px 20px;">
            ${escapedReply}
          </div>

          <div style="background-color: #ffffff; border-left: 3px solid #cbd5e1; padding: 10px 14px; margin-bottom: 28px;">
            <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">In response to your query:</p>
            <p style="color: #475569; font-size: 13px; margin: 0; font-style: italic;">"${cleanOriginal}"</p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;">
            <p style="color: #334155; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
              Regards,<br />
              Brainstorm Club Team
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              LPU SCA Brainstorm Club
            </p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[SMTP] Contact query reply sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
};
