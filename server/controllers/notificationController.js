const Notification = require("../models/notification");

const notificationController = {
  getNotificationsByUserId: async (req, res) => {
    try {
      const userId = req.params.id; 
      console.log("Fetching notifications for user:", userId);
      const notifications = await Notification.find({ userId });
      console.log("Fetched notifications:", notifications);
      res.json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },
};

module.exports = notificationController;
