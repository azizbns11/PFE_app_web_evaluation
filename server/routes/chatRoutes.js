const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


router.post('/chat', chatController.createChat)
router.get('/chat', chatController.fetchChats)
router.post('/message',chatController.sendMessage)
router.get('/message/:chatId',chatController.allMessages)

module.exports = router;
