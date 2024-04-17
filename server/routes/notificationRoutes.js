const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Route to fetch notifications for a specific user
router.get('/:id', notificationController.getNotificationsByUserId);

module.exports = router;
