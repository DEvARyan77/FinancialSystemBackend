const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendCredentialEmail = async (email, name, tempPassword, role) => {
  const mailOptions = {
    from: `"FinanceBase Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to FinanceBase - Your Account Credentials',
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 4px solid #000; background-color: #FFF;">
            <h2 style="text-transform: uppercase; border-bottom: 4px solid #000; padding-bottom: 10px;">Welcome, ${name}</h2>
            <p>An administrator has granted you access to the FinanceBase dashboard.</p>
            <p><strong>Role:</strong> ${role.toUpperCase()}</p>
            <div style="background-color: #FFD500; padding: 15px; border: 2px solid #000; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
                Your Temporary Password: <br/> 
                <span style="font-family: monospace; font-size: 24px; letter-spacing: 2px;">${tempPassword}</span>
            </div>
            <p>Please log in and change your password immediately.</p>
            <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #FFF; text-decoration: none; font-weight: bold; text-transform: uppercase;">Go to Login</a>
        </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendCredentialEmail };