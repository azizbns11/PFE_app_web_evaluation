const cron = require("node-cron");
const moment = require("moment");
const Evaluation = require("../models/evaluation");
const User = require("../models/user");
const Notification = require("../models/notification");
const sendNotification = require("../utils/Notification");
const Certificate = require("../models/certificate");

// Function to check evaluations and send notifications
const checkEvaluationsForNotification = async () => {
  try {
    console.log("Running monthly evaluation check...");

    // Get the current month and year
    const currentMonth = moment().month();
    const currentYear = moment().year();

    // Find all suppliers
    const suppliers = await User.find({ role: "supplier" });

    // Iterate through each supplier
    for (const supplier of suppliers) {
      // Check if the supplier has an evaluation for the current month
      const evaluation = await Evaluation.findOne({
        supplierId: supplier._id,
        evaluationDate: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1),
        },
      });

      // If the supplier doesn't have an evaluation for the current month
      if (!evaluation) {
        console.log(
          `Supplier ${
            supplier.groupName
          } does not have an evaluation for ${moment().format(
            "MMMM"
          )}. Sending notification...`
        );

        // Find users other than suppliers
        const nonSupplierUsers = await User.find({ role: { $ne: "supplier" } });

        // Create notification message
        const notificationMessage = `Please add an evaluation for supplier ${
          supplier.groupName
        } for ${moment().format("MMMM")}.`;

        // Create notifications for users other than suppliers
        const notifications = nonSupplierUsers.map((user) => ({
          userId: user._id,
          message: notificationMessage,
          type: 'evaluation',
        }));

        // Save notifications to the database
        await Notification.insertMany(notifications);

        // Trigger notification emails to users
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

// Function to check certificates and send notifications
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

// Schedule the tasks
cron.schedule("0 9 28 * *", checkEvaluationsForNotification, {
  scheduled: true,
  timezone: "Africa/Tunis", // Set your timezone
});

cron.schedule("51 14 * * *", checkCertificatesForNotification, {
  scheduled: true,
  timezone: "Africa/Tunis", // Set your timezone
});
