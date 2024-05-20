const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


router.get('/:id', notificationController.getNotificationsByUserId);
router.delete('/:id', notificationController.deleteNotification);
module.exports = router;
