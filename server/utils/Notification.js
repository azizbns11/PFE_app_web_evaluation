const nodemailer = require("nodemailer");

const sendNotification = async (supplierEmail, subject, message) => {
  try {
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define email options
    const options = {
      from: process.env.FROM_EMAIL,
      to: supplierEmail,
      subject: subject,
      text: message,
    };

    console.log("Sending notification email ...");

    // Send email
    const info = await transporter.sendMail(options);
    console.log("Notification email sent:", info.response);
  } catch (error) {
    console.error("Error sending notification email:", error);
    throw new Error("Failed to send notification email");
  }
};

module.exports = sendNotification;
