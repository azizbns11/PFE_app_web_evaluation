const cron = require("node-cron");
const moment = require("moment");
const Evaluation = require("../models/evaluation");
const User = require("../models/user");
const Notification = require("../models/notification");
const sendNotification = require("../utils/Notification");
const Certificate = require("../models/certificate");


const checkEvaluationsForNotification = async () => {
  try {
    console.log("Running monthly evaluation check...");

  
    const currentMonth = moment().month();
    const currentYear = moment().year();


    const suppliers = await User.find({ role: "supplier" });

   
    for (const supplier of suppliers) {
   
      const evaluation = await Evaluation.findOne({
        supplierId: supplier._id,
        evaluationDate: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1),
        },
      });

  
      if (!evaluation) {
        console.log(
          `Supplier ${
            supplier.groupName
          } does not have an evaluation for ${moment().format(
            "MMMM"
          )}. Sending notification...`
        );

     
        const nonSupplierUsers = await User.find({ role: { $ne: "supplier" } });

 
        const notificationMessage = `Please add an evaluation for supplier ${
          supplier.groupName
        } for ${moment().format("MMMM")}.`;


        const notifications = nonSupplierUsers.map((user) => ({
          userId: user._id,
          message: notificationMessage,
          type: 'evaluation',
        }));

    
        await Notification.insertMany(notifications);

  
        const emailPromises = nonSupplierUsers.map((user) => {
          return sendNotification(
            user.email,
            "Reminder: Add Supplier Evaluation",
            notificationMessage
          );
        });
        await Promise.all(emailPromises);
      }
    }

    console.log("Monthly evaluation check completed.");
  } catch (error) {
    console.error("Error in monthly evaluation check:", error);
  }
};


const checkCertificatesForNotification = async () => {
  try {
    console.log("Running certificate expiration check...");

    const certificates = await Certificate.find({
      ExpireDate: {
        $lte: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
      }, // Within 90 days
      notificationStatus: "pending",
    });

    for (const certificate of certificates) {
      const supplier = await User.findById(certificate.supplierId);
      if (supplier && supplier.email) {
        const message = `Your certificate "${
          certificate.CertificateName
        }" is approaching expiration. Please recertify before the expiry date (${certificate.ExpireDate.toDateString()}). The recertification date is set for ${certificate.RecertificateDate.toDateString()}.`;

   
        const notification = new Notification({
          userId: supplier._id,
          message: message,
          type: 'certificate',
        });
        await notification.save(); 

   
        await sendNotification(
          supplier.email,
          "Certificate Expiration Alert!",
          message
        );

        certificate.notificationStatus = "sent";
        certificate.lastNotifiedDate = new Date();
        await certificate.save();
      }
    }

    console.log("Certificate expiration check completed.");
  } catch (error) {
    console.error("Error in certificate expiration check:", error);
  }
};


cron.schedule("53 09 19 * *", checkEvaluationsForNotification); // min hour day
cron.schedule("19 09 * * *", checkCertificatesForNotification); 

module.exports = {
  checkEvaluationsForNotification,
  checkCertificatesForNotification
};


