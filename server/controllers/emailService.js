
const nodemailer = require("nodemailer");

const sendEmail = async (email, password) => {
  
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD,
    },
  });


  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email, 
    subject: "Your New Password",
    text: `Your new password: ${password}`, 
   
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = { sendEmail };
