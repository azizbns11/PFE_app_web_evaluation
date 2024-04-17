// emailService.js
const nodemailer = require("nodemailer");

const sendEmail = async (email, password) => {
  // Create a nodemailer transporter using SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD,// Your email password
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER,// Sender address
    to: email, // List of receivers
    subject: "Your New Password", // Subject line
    text: `Your new password: ${password}`, // Plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = { sendEmail };
