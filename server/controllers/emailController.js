const nodemailer = require('nodemailer');

// Function to send email
const sendEmail = async (email) => {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  // Email data
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'reset password',
    text: `link rest password is `
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return 'Email sent successfully';
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };