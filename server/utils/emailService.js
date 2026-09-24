import nodemailer from 'nodemailer';

// Create a transporter using SMTP or test account
// For production, use actual SMTP settings (SendGrid, AWS SES, etc.)
const createTransporter = async () => {
  // Try to use provided env vars, fallback to Ethereal for testing
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal mock email (for dev)
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

export const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    const message = {
      from: `${process.env.FROM_NAME || 'Edumerge Support'} <${process.env.FROM_EMAIL || 'noreply@edumerge.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
    };

    const info = await transporter.sendMail(message);
    
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log(`✉️  Preview email: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
