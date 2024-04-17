const nodemailer = require("nodemailer");

const sendNotification = async (recipientEmail, subject, message) => {
  try {
   
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });


    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: recipientEmail,
      subject: subject,
      text: message,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log("Notification email sent:", info.response);
  } catch (error) {
    console.error("Error sending notification email:", error);
    throw new Error("Failed to send notification email");
  }
};

module.exports = sendNotification;
